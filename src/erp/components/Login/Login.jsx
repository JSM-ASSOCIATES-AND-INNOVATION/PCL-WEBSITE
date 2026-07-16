import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ErpContext';

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

    useEffect(() => {
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
                                    rp: { name: "PCL ERP", id: window.location.hostname },
                                    user: { id: userId, name: credential, displayName: credential },
                                    pubKeyCredParams: [{ type: "public-key", alg: -7 }],
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

            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);
            
            let allowCredentials = [];
            if (savedWebAuthnId) {
                const binaryString = atob(savedWebAuthnId);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                allowCredentials = [{ id: bytes, type: 'public-key', transports: ['internal'] }];
            }

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
        <div className="relative flex items-center justify-center min-h-screen w-full bg-[#050B14] font-sans overflow-hidden">
            
            {/* --- PREMIUM ANIMATED BACKGROUND --- */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#0A192F] rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#112240] rounded-full mix-blend-screen filter blur-[120px] opacity-70"></div>
                <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] bg-[#D4AF37]/10 rounded-full mix-blend-screen filter blur-[80px] animate-pulse"></div>
                
                {/* Subtle Grid overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
            </div>

            {/* --- MAIN CONTAINER --- */}
            <div className="relative z-10 w-full max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20 p-6 lg:p-12 min-h-screen lg:min-h-0">
                
                {/* LEFT: PCL BRANDING & HERO */}
                <div className="w-full lg:w-[55%] flex flex-col items-center lg:items-start text-center lg:text-left animate-fade-in-up mt-10 lg:mt-0">
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-5 lg:gap-6 mb-8 group cursor-default">
                        <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br from-[#112240] to-[#0A192F] border border-[#D4AF37]/30 flex items-center justify-center group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-500 shadow-[0_0_30px_rgba(212,175,55,0.15)] overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#D4AF37]/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                            <div className="w-10 h-10 lg:w-14 lg:h-14 bg-center bg-contain bg-no-repeat brand-crest relative z-10"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-4xl lg:text-6xl font-black tracking-tight text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Prudentia
                            </span>
                            <span className="text-xl lg:text-2xl font-light tracking-[0.2em] text-[#D4AF37] uppercase">
                                College of Law
                            </span>
                        </div>
                    </div>

                    <h1 className="text-4xl lg:text-[4.5rem] font-black text-white leading-[1.1] tracking-tight mb-6 uppercase">
                        Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]">Campus</span> <br className="hidden lg:block"/>
                        Ecosystem.
                    </h1>
                    
                    <p className="text-[#8892B0] text-sm lg:text-lg font-light max-w-lg leading-relaxed">
                        Securely authenticate to access your personalized academic dashboard, course materials, and administrative services.
                    </p>

                    <div className="mt-8 lg:mt-10 flex items-center gap-4 bg-[#112240]/50 backdrop-blur-md border border-[#D4AF37]/20 px-5 py-3 lg:px-6 lg:py-4 rounded-full w-fit shadow-lg">
                        <div className="relative flex items-center justify-center">
                            <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                            <div className="absolute w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                        </div>
                        <span className="text-xs lg:text-sm font-bold text-[#E6F1FF] uppercase tracking-wider">Gateway Secure & Active</span>
                    </div>
                </div>

                {/* RIGHT: SECURE LOGIN CARD */}
                <div className="w-full max-w-md lg:w-[45%] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="relative">
                        {/* Glow behind card */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37]/20 to-[#0A192F]/50 rounded-[2.5rem] blur-xl opacity-70"></div>
                        
                        <form onSubmit={handleSubmit} className="relative bg-[#0A192F]/80 backdrop-blur-2xl border border-white/10 p-8 lg:p-12 rounded-[2rem] shadow-2xl flex flex-col gap-6 lg:gap-8 overflow-hidden">
                            
                            {/* Decorative Corner */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent rounded-tr-[2rem] pointer-events-none"></div>

                            <div className="mb-2 text-center lg:text-left relative z-10">
                                <h2 className="text-2xl lg:text-4xl font-bold text-white tracking-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Portal Access
                                </h2>
                                <p className="text-sm font-medium text-[#8892B0]">
                                    Enter your institutional credentials.
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-start gap-3">
                                    <i className="fa-solid fa-circle-exclamation text-base shrink-0 mt-0.5"></i> 
                                    <span className="leading-relaxed">{error}</span>
                                </div>
                            )}

                            {successMsg && (
                                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3">
                                    <i className="fa-solid fa-circle-check text-base shrink-0"></i> 
                                    <span>{successMsg}</span>
                                </div>
                            )}

                            <div className="flex flex-col gap-5 lg:gap-6 relative z-10">
                                {/* Official ID Input */}
                                <div className="relative group">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#8892B0] mb-2 ml-1 group-focus-within:text-[#D4AF37] transition-colors">
                                        Institutional ID
                                    </label>
                                    <div className="relative">
                                        <i className="fa-regular fa-id-card absolute left-5 top-1/2 -translate-y-1/2 text-[#8892B0] group-focus-within:text-[#D4AF37] transition-colors text-lg z-10"></i>
                                        <input
                                            type="text"
                                            value={credential}
                                            onChange={handleCredentialChange}
                                            className="w-full bg-[#112240]/80 border border-white/5 focus:border-[#D4AF37]/50 rounded-2xl py-4 lg:py-5 pl-14 pr-5 text-sm font-bold text-white uppercase outline-none transition-all placeholder:text-[#8892B0] placeholder:font-normal placeholder:opacity-50 placeholder:normal-case shadow-inner"
                                            placeholder="e.g. PCL-STU-2026"
                                            required
                                            autoCapitalize="none"
                                            autoCorrect="off"
                                            autoComplete="username"
                                        />
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div className="relative group">
                                    <div className="flex justify-between items-center mb-2 px-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8892B0] group-focus-within:text-[#D4AF37] transition-colors">
                                            Passcode
                                        </label>
                                        <button type="button" className="text-[10px] font-bold text-[#D4AF37] hover:text-white transition-colors">
                                            Forgot?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <i className="fa-solid fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-[#8892B0] group-focus-within:text-[#D4AF37] transition-colors text-lg z-10"></i>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[#112240]/80 border border-white/5 focus:border-[#D4AF37]/50 rounded-2xl py-4 lg:py-5 pl-14 pr-14 text-sm font-bold text-white outline-none transition-all placeholder:text-[#8892B0] placeholder:opacity-50 shadow-inner"
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
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8892B0] hover:text-white transition-colors outline-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 z-10"
                                        >
                                            <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Remember Me Toggle */}
                                <div className="flex items-center gap-3 mt-1 px-1">
                                    <div className="relative flex items-center justify-center w-5 h-5">
                                        <input 
                                            type="checkbox" 
                                            id="remember-biometric" 
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="appearance-none w-5 h-5 border-2 border-[#8892B0] rounded-md checked:bg-[#D4AF37] checked:border-[#D4AF37] cursor-pointer transition-all peer"
                                        />
                                        <i className="fa-solid fa-check absolute text-black text-[10px] opacity-0 peer-checked:opacity-100 pointer-events-none"></i>
                                    </div>
                                    <label htmlFor="remember-biometric" className="text-[11px] font-medium text-[#8892B0] cursor-pointer select-none">
                                        {isDeviceSupported ? 'Keep me logged in & enable Biometrics' : 'Keep me logged in'}
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 mt-4 relative z-10">
                                {/* Primary Login Button */}
                                <button
                                    id="login-form-submit"
                                    type="submit"
                                    disabled={isLoading || !credential || !password}
                                    className={`w-full py-4 lg:py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.15em] transition-all duration-300 flex justify-center items-center gap-3 relative overflow-hidden group ${isLoading || !credential || !password
                                        ? 'bg-[#112240] text-[#8892B0] cursor-not-allowed border border-white/5'
                                        : 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#0A192F] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-[1.02]'
                                        }`}
                                >
                                    {isLoading ? (
                                        <><i className="fa-solid fa-circle-notch fa-spin text-lg"></i> Authenticating...</>
                                    ) : (
                                        <>
                                            <span className="relative z-10">Access Portal</span>
                                            <i className="fa-solid fa-arrow-right-to-bracket text-sm relative z-10 group-hover:translate-x-1 transition-transform"></i>
                                        </>
                                    )}
                                </button>

                                {hasBiometricSetup && isDeviceSupported && (
                                    <button
                                        type="button"
                                        onClick={handleBiometricLogin}
                                        disabled={isLoading}
                                        className="w-full py-4 lg:py-5 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex justify-center items-center gap-3 bg-[#112240]/50 hover:bg-[#112240] text-white border border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-lg"
                                    >
                                        <i className="fa-solid fa-fingerprint text-xl text-[#D4AF37]"></i> 
                                        <span>Face ID / Touch ID</span>
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                    
                    {/* Support Link */}
                    <div className="mt-8 text-center text-[#8892B0] text-xs font-medium">
                        Having trouble accessing your account? <br className="sm:hidden" />
                        <a href="/contact" className="text-[#D4AF37] hover:text-white underline underline-offset-4 transition-colors">Contact IT Support</a>
                    </div>
                </div>

            </div>
        </div>
    );
}