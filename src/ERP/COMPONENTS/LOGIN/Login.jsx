/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import React, { useState } from 'react';
import { useERP } from '../../CONTEXT/ErpContext';
import { theme } from '../../theme';
export default function Login() {
    const { login } = useERP();

    const [credential, setCredential] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isDeviceSupported, setIsDeviceSupported] = useState(false);
    const [hasBiometricSetup, setHasBiometricSetup] = useState(false);

    React.useEffect(() => {
        const checkBiometricSupport = async () => {
            const savedCred = localStorage.getItem('saved_credential');
            const savedPass = localStorage.getItem('saved_password');
            if (savedCred && savedPass) {
                setCredential(savedCred);
                setPassword(atob(savedPass));
                setRememberMe(true);
            }

            if (window.PublicKeyCredential && window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
                const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
                setIsDeviceSupported(available);
                
                if (available && localStorage.getItem('biometric_enabled') === 'true' && savedCred && savedPass) {
                    setHasBiometricSetup(true);
                }
            }
        };
        checkBiometricSupport();
    }, []);

    const handleCredentialChange = (e) => {
        setCredential(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            const response = await login(credential, password.trim());
            if (!response.success) {
                setError(response.error?.message || 'Invalid credentials. Please verify your ID and password.');
            } else {
                // Success! Handle Remember Me / Biometric
                if (rememberMe) {
                    if (isDeviceSupported) {
                        try {
                            const challenge = new Uint8Array(32);
                            window.crypto.getRandomValues(challenge);
                            const userId = new Uint8Array(16);
                            window.crypto.getRandomValues(userId);

                            const webAuthnCred = await navigator.credentials.create({
                                publicKey: {
                                    challenge,
                                    rp: { name: "JSM ERP", id: window.location.hostname },
                                    user: {
                                        id: userId,
                                        name: credential,
                                        displayName: credential
                                    },
                                    pubKeyCredParams: [{ type: "public-key", alg: -7 }], // ES256
                                    authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" }
                                }
                            });

                            if (webAuthnCred) {
                                const rawIdArray = new Uint8Array(webAuthnCred.rawId);
                                const base64Id = btoa(String.fromCharCode.apply(null, rawIdArray));
                                localStorage.setItem('webauthn_credential_id', base64Id);
                                localStorage.setItem('biometric_enabled', 'true');
                                localStorage.setItem('saved_credential', credential);
                                localStorage.setItem('saved_password', btoa(password.trim()));
                            }
                        } catch (webAuthnErr) {
                            console.warn("WebAuthn creation cancelled or failed:", webAuthnErr);
                            // Fallback to basic if they cancelled the prompt but wanted 'remember me'
                            localStorage.setItem('biometric_enabled', 'false');
                            localStorage.setItem('saved_credential', credential);
                            localStorage.setItem('saved_password', btoa(password.trim()));
                        }
                    } else {
                        localStorage.setItem('biometric_enabled', 'false');
                        localStorage.setItem('saved_credential', credential);
                        localStorage.setItem('saved_password', btoa(password.trim()));
                    }
                } else {
                    localStorage.removeItem('biometric_enabled');
                    localStorage.removeItem('saved_credential');
                    localStorage.removeItem('saved_password');
                    localStorage.removeItem('webauthn_credential_id');
                }
            }
        } catch (err) {
            setError(err.message || 'Unable to connect to the authentication server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBiometricLogin = async () => {
        try {
            if (!isDeviceSupported || !hasBiometricSetup) {
                setError("Biometrics not configured. Please log in manually and check 'Remember Me'.");
                return;
            }

            const savedCred = localStorage.getItem('saved_credential');
            const savedPass = localStorage.getItem('saved_password');
            const savedWebAuthnId = localStorage.getItem('webauthn_credential_id');
            
            if (!savedCred || !savedPass) {
                setError("Saved credentials corrupted. Please log in manually.");
                return;
            }

            // Create a secure random challenge
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);
            
            let allowCredentials = [];
            if (savedWebAuthnId) {
                const binaryString = atob(savedWebAuthnId);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                allowCredentials = [{
                    id: bytes,
                    type: 'public-key',
                    transports: ['internal']
                }];
            }

            // Request native biometric prompt
            const credentialData = await navigator.credentials.get({
                publicKey: {
                    challenge: challenge,
                    rpId: window.location.hostname,
                    allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
                    userVerification: "required",
                }
            });

            if (credentialData) {
                setIsLoading(true);
                const decodedPass = atob(savedPass);
                const response = await login(savedCred, decodedPass);
                if (!response.success) {
                    setError("Biometric sync failed. Please use password.");
                    setIsLoading(false);
                }
            }
        } catch (err) {
            setError("Biometric authentication canceled or failed.");
            console.error(err);
        }
    };

    return (
        <div className={`${theme.layout.appBase} relative flex items-center justify-center lg:overflow-hidden min-h-screen w-full`}>
            {/* Minimal Background Elements for brutalist theme */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-50">
                <div className="absolute top-10 left-10 w-64 h-64 bg-themePanel/50 border-theme border-themeBorder rounded-full opacity-20 blur-xl"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-themePanel/50 border-theme border-themeBorder rounded-full opacity-20 blur-2xl"></div>
            </div>

            {/* --- MAIN CONTAINER --- */}
            <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-24 p-6 py-12 lg:p-12 min-h-screen lg:min-h-0 lg:h-full">
                
                {/* LEFT: BRANDING & HERO */}
                <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left animate-fade-in shrink-0">
                    <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-12 group cursor-pointer">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-themePanel bg-themePanel border-theme border-themeBorder flex items-center justify-center group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300 shadow-themeElevated">
                            <i className="fa-solid fa-landmark text-2xl lg:text-3xl text-themeAccent"></i>
                        </div>
                        <span className="text-3xl lg:text-5xl font-black tracking-tighter text-themeText">
                            JSM<span className="text-themeAccent">ERP</span>
                        </span>
                    </div>

                    <h1 className="text-4xl lg:text-7xl font-black text-themeText leading-[1.05] tracking-tight mb-4 lg:mb-6 uppercase">
                        Next-Gen<br className="hidden lg:block"/>
                        <span className="text-themeAccent inline-block transform -rotate-1 mt-2">
                            Campus Hub.
                        </span>
                    </h1>
                    
                    <p className={`${theme.text.secondary} text-xs lg:text-base font-medium max-w-sm lg:max-w-md leading-relaxed hidden sm:block`}>
                        Experience a seamless, secure, and unified digital ecosystem designed exclusively for students, faculty, and administration.
                    </p>

                    <div className="mt-6 lg:mt-8 flex items-center gap-2 lg:gap-3 bg-themePanel border-theme border-themeBorder px-4 py-2 lg:px-5 lg:py-2.5 rounded-themeBtn w-fit shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                        <div className="relative flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full border border-black/20"></div>
                            <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                        </div>
                        <span className="text-[9px] lg:text-[10px] font-black text-themeText uppercase tracking-widest">All Systems Operational</span>
                    </div>
                </div>

                {/* RIGHT: SECURE LOGIN CARD */}
                <div className="w-full max-w-md lg:w-[450px] animate-fade-in shrink-0" style={{ animationDelay: '0.2s' }}>
                    <form onSubmit={handleSubmit} className={`${theme.layout.panelElevated} p-8 lg:p-10 flex flex-col gap-5 lg:gap-6 relative`}>
                        
                        <div className="mb-2 text-center lg:text-left">
                            <h2 className="text-2xl lg:text-3xl font-black text-themeText tracking-tight mb-1 uppercase">
                                Welcome Back
                            </h2>
                            <p className="text-xs font-bold text-themeTextSec opacity-70">
                                Authenticate to securely access your portal.
                            </p>
                        </div>

                        {error && (
                            <div className="bg-rose-500/10 border-theme border-rose-500/30 text-rose-600 p-4 rounded-themePanel text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-fade-in">
                                <i className="fa-solid fa-triangle-exclamation text-base shrink-0"></i> 
                                <span>{error}</span>
                            </div>
                        )}

                        {successMsg && (
                            <div className="bg-emerald-500/10 border-theme border-emerald-500/30 text-emerald-600 p-4 rounded-themePanel text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-fade-in">
                                <i className="fa-solid fa-circle-check text-base shrink-0"></i> 
                                <span>{successMsg}</span>
                            </div>
                        )}

                        <div className="flex flex-col gap-4 lg:gap-5">
                            {/* Official ID Input */}
                            <div className="relative">
                                <label className="block text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-themeTextSec mb-1.5 ml-1">USER ID</label>
                                <div className="relative group/input">
                                    <i className="fa-solid fa-id-badge absolute left-4 top-1/2 -translate-y-1/2 text-themeTextSec opacity-50 group-focus-within/input:text-themeAccent group-focus-within/input:opacity-100 transition-colors text-sm z-10"></i>
                                    <input
                                        type="text"
                                        value={credential}
                                        onChange={handleCredentialChange}
                                        className="relative w-full bg-themeApp border-theme border-themeBorder focus:border-themeBorderStrong rounded-themeBtn py-3.5 lg:py-4 pl-11 pr-4 text-xs lg:text-sm font-bold text-themeText uppercase outline-none transition-all placeholder:text-themeTextSec placeholder:opacity-50 placeholder:normal-case shadow-sm focus:shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                                        placeholder="e.g. USER ID"
                                        required
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        autoComplete="username"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="relative">
                                <div className="flex justify-between items-center mb-1.5 px-1">
                                    <label className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-themeTextSec">Password</label>
                                </div>
                                <div className="relative group/input">
                                    <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-themeTextSec opacity-50 group-focus-within/input:text-themeAccent group-focus-within/input:opacity-100 transition-colors text-sm z-10"></i>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="relative w-full bg-themeApp border-theme border-themeBorder focus:border-themeBorderStrong rounded-themeBtn py-3.5 lg:py-4 pl-11 pr-12 text-xs lg:text-sm font-bold text-themeText outline-none transition-all placeholder:text-themeTextSec placeholder:opacity-50 shadow-sm focus:shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                                        placeholder="••••••••"
                                        required
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        tabIndex="-1"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-themeTextSec opacity-50 hover:opacity-100 hover:text-themeAccent transition-colors outline-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-themePanel z-10"
                                    >
                                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me Toggle */}
                            <div className="flex items-center gap-2 mt-1 px-1">
                                <input 
                                    type="checkbox" 
                                    id="remember-biometric" 
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-3.5 h-3.5 lg:w-4 lg:h-4 accent-themeAccent cursor-pointer border-theme border-themeBorder"
                                />
                                <label htmlFor="remember-biometric" className="text-[9px] lg:text-[10px] font-bold text-themeTextSec cursor-pointer select-none">
                                    {isDeviceSupported ? 'Remember Me & Enable Biometric Login' : 'Remember Me'}
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 lg:gap-4 mt-2 relative z-10">
                            {/* Primary Login Button */}
                            <button
                                id="login-form-submit"
                                type="submit"
                                disabled={isLoading || !credential || !password}
                                className={`w-full py-4 lg:py-5 rounded-themeBtn text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex justify-center items-center gap-2 lg:gap-3 relative overflow-hidden ${isLoading || !credential || !password
                                    ? 'bg-themePanel text-themeTextSec border-theme border-themeBorder opacity-50 cursor-not-allowed'
                                    : 'bg-themeAccent text-white hover:opacity-90 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] active:translate-y-1 active:translate-x-1 active:shadow-[0px_0px_0px_rgba(0,0,0,0.1)]'
                                    }`}
                            >
                                {isLoading ? (
                                    <><i className="fa-solid fa-circle-notch fa-spin text-base lg:text-lg"></i> Processing...</>
                                ) : (
                                    <><i className="fa-solid fa-bolt text-xs lg:text-sm"></i> Initialize Session</>
                                )}
                            </button>

                            {hasBiometricSetup && isDeviceSupported && (
                                <button
                                    type="button"
                                    onClick={handleBiometricLogin}
                                    disabled={isLoading}
                                    className="w-full py-4 lg:py-5 rounded-themeBtn text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex justify-center items-center gap-2 lg:gap-3 bg-themePanel hover:bg-themeElevated text-themeText border-theme border-themeBorderStrong shadow-[2px_2px_0px_rgba(0,0,0,0.1)] active:translate-y-0.5 active:translate-x-0.5 active:shadow-[0px_0px_0px_rgba(0,0,0,0.1)]"
                                >
                                    <i className="fa-solid fa-fingerprint text-base lg:text-lg text-themeAccent"></i> Face ID / Touch ID
                                </button>
                            )}
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}