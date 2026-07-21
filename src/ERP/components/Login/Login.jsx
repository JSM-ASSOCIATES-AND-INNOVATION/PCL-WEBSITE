/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ErpContext';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function Login() {
    const { login } = useERP();

    const [credential, setCredential] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Feature state
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);
    
    // Captcha state
    const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: '' });

    // Initialize captcha when failed attempts reach 3
    useEffect(() => {
        if (failedAttempts === 3) {
            generateCaptcha();
        }
    }, [failedAttempts]);

    const generateCaptcha = () => {
        setCaptcha({
            num1: Math.floor(Math.random() * 9) + 1,
            num2: Math.floor(Math.random() * 9) + 1,
            answer: ''
        });
    };

    const handleCredentialChange = (e) => {
        setCredential(e.target.value);
    };

    const handleCaptchaChange = (e) => {
        // Only allow digits
        const val = e.target.value.replace(/\D/g, '');
        setCaptcha(prev => ({ ...prev, answer: val }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (failedAttempts >= 3) {
            const correctAnswer = captcha.num1 + captcha.num2;
            if (parseInt(captcha.answer) !== correctAnswer) {
                setError('Security verification failed. Incorrect sum.');
                generateCaptcha();
                return;
            }
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await login(credential, password.trim());
            if (!response.success) {
                setFailedAttempts(prev => prev + 1);
                setError(response.error?.message || 'Invalid credentials. Please verify your ID and password.');
                if (failedAttempts >= 2) {
                    generateCaptcha();
                }
            } else {
                // Supabase handles session persistence securely by default.
                // Reset failed attempts on success.
                setFailedAttempts(0);
            }
        } catch (err) {
            setError(err.message || 'Unable to connect to the authentication server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen w-full bg-themeApp text-themeText font-sans overflow-hidden transition-colors duration-500">
            
            {showForgotModal && (
                <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
            )}

            {/* --- THEME DYNAMIC BACKGROUND --- */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-15%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-themeAccent opacity-[0.07] mix-blend-screen filter blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-themeAccent opacity-[0.05] mix-blend-screen filter blur-[150px]"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]"></div>
            </div>

            {/* --- MAIN CONTAINER --- */}
            <div className="relative z-10 w-full max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20 p-6 lg:p-12 min-h-screen lg:min-h-0">
                
                {/* LEFT: PCL BRANDING & HERO */}
                <div className="w-full lg:w-[55%] flex flex-col items-center lg:items-start text-center lg:text-left animate-fade-in mt-10 lg:mt-0">
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-5 lg:gap-6 mb-8 group cursor-default">
                        <div className="relative flex items-center justify-center group-hover:scale-105 group-hover:-translate-y-1 transition-transform duration-500 overflow-hidden px-4">
                            <div 
                                className="bg-center bg-contain bg-no-repeat brand-crest relative z-10 filter drop-shadow-lg" 
                                style={{ width: '90px', height: '105px', backgroundColor: 'var(--theme-accent)' }}
                            ></div>
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-4xl lg:text-6xl font-black tracking-tight text-themeText mb-1 transition-colors duration-500" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Prudentia
                            </span>
                            <span className="text-xl lg:text-2xl font-light tracking-[0.2em] text-themeAccent uppercase transition-colors duration-500">
                                College of Law
                            </span>
                        </div>
                    </div>

                    <h1 className="text-4xl lg:text-[4.5rem] font-black text-themeText leading-[1.1] tracking-tight mb-6 uppercase transition-colors duration-500">
                        Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-themeAccent to-indigo-400 border-b-2 border-themeAccent pb-1">Campus</span> <br className="hidden lg:block"/>
                        Ecosystem.
                    </h1>
                    
                    <p className="text-themeTextSec text-sm lg:text-lg font-light max-w-lg leading-relaxed transition-colors duration-500">
                        Securely authenticate to access your personalized academic dashboard, course materials, and administrative services.
                    </p>

                    <div className="mt-8 lg:mt-10 flex items-center gap-4 bg-themeElevated border border-themeBorder px-5 py-3 lg:px-6 lg:py-4 rounded-full w-fit shadow-sm">
                        <div className="relative flex items-center justify-center">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                            <div className="absolute w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                        </div>
                        <span className="text-xs lg:text-sm font-bold text-themeText uppercase tracking-wider">Gateway Secure & Active</span>
                    </div>
                </div>

                {/* RIGHT: SECURE LOGIN CARD */}
                <div className="w-full max-w-md lg:w-[45%] animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="relative">
                        <div className="absolute -inset-1 bg-themeAccent rounded-[2.5rem] blur-xl opacity-[0.15]"></div>
                        
                        <form onSubmit={handleSubmit} className="relative bg-themePanel border border-themeBorder shadow-2xl !p-8 lg:!p-12 !rounded-[2rem] flex flex-col gap-6 lg:gap-8 overflow-hidden">
                            
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-themeAccent to-transparent opacity-10 rounded-tr-[2rem] pointer-events-none"></div>

                            <div className="mb-2 text-center lg:text-left relative z-10">
                                <h2 className="text-2xl lg:text-4xl font-bold text-themeText tracking-tight mb-2 transition-colors duration-500" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Portal Access
                                </h2>
                                <p className="text-sm font-medium text-themeTextSec transition-colors duration-500">
                                    Enter your institutional credentials.
                                </p>
                            </div>

                            {error && (
                                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 p-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-start gap-3">
                                    <i className="fa-solid fa-circle-exclamation text-base shrink-0 mt-0.5"></i> 
                                    <span className="leading-relaxed">{error}</span>
                                </div>
                            )}

                            <div className="flex flex-col gap-5 lg:gap-6 relative z-10">
                                {/* Official ID Input */}
                                <div className="relative group">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec mb-2 ml-1 group-focus-within:text-themeAccent transition-colors">
                                        Institutional ID
                                    </label>
                                    <div className="relative">
                                        <i className="fa-regular fa-id-card absolute left-5 top-1/2 -translate-y-1/2 text-themeTextSec group-focus-within:text-themeAccent transition-colors text-lg z-10"></i>
                                        <input
                                            type="text"
                                            value={credential}
                                            onChange={handleCredentialChange}
                                            className="w-full bg-themeElevated border border-themeBorder focus:border-themeAccent rounded-2xl py-4 lg:py-5 pl-14 pr-5 text-sm font-bold text-themeText uppercase outline-none transition-all placeholder:text-themeTextSec placeholder:font-normal placeholder:opacity-50 placeholder:normal-case shadow-inner"
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
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec group-focus-within:text-themeAccent transition-colors">
                                            Passcode
                                        </label>
                                        <button 
                                            type="button" 
                                            onClick={() => setShowForgotModal(true)}
                                            className="text-[10px] font-bold text-themeAccent hover:text-indigo-400 transition-colors"
                                        >
                                            Forgot?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <i className="fa-solid fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-themeTextSec group-focus-within:text-themeAccent transition-colors text-lg z-10"></i>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-themeElevated border border-themeBorder focus:border-themeAccent rounded-2xl py-4 lg:py-5 pl-14 pr-14 text-sm font-bold text-themeText outline-none transition-all placeholder:text-themeTextSec placeholder:opacity-50 shadow-inner"
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
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec hover:text-themeText transition-colors outline-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-themeBorder z-10"
                                        >
                                            <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* 3 Failed Attempts Captcha */}
                                {failedAttempts >= 3 && (
                                    <div className="relative group animate-fade-in">
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-2 ml-1">
                                            Security Verification
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <div className="bg-themeElevated border border-rose-500/30 rounded-xl px-4 py-3 flex items-center justify-center gap-3 shadow-inner">
                                                <span className="text-lg font-black text-themeText">{captcha.num1}</span>
                                                <i className="fa-solid fa-plus text-themeTextSec text-xs"></i>
                                                <span className="text-lg font-black text-themeText">{captcha.num2}</span>
                                                <i className="fa-solid fa-equals text-themeTextSec text-xs"></i>
                                            </div>
                                            <input
                                                type="text"
                                                pattern="\d*"
                                                value={captcha.answer}
                                                onChange={handleCaptchaChange}
                                                className="w-full bg-themeElevated border border-rose-500/30 focus:border-rose-500 rounded-xl py-3 px-5 text-lg font-bold text-themeText outline-none transition-all placeholder:text-themeTextSec shadow-inner text-center"
                                                placeholder="?"
                                                required
                                            />
                                        </div>
                                        <p className="text-[10px] font-medium text-themeTextSec mt-2 ml-1">Multiple failed attempts detected. Please solve the math problem to continue.</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-4 mt-2 relative z-10">
                                {/* Primary Login Button */}
                                <button
                                    id="login-form-submit"
                                    type="submit"
                                    disabled={isLoading || !credential || !password || (failedAttempts >= 3 && !captcha.answer)}
                                    className={`w-full py-4 lg:py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.15em] transition-all duration-300 flex justify-center items-center gap-3 relative overflow-hidden group ${isLoading || !credential || !password || (failedAttempts >= 3 && !captcha.answer)
                                        ? 'bg-themeElevated text-themeTextSec cursor-not-allowed border border-themeBorder'
                                        : 'bg-themeAccent text-white hover:opacity-90 hover:scale-[1.02] shadow-xl shadow-themeAccent/40'
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
                            </div>
                        </form>
                    </div>
                    
                    {/* Support Link */}
                    <div className="mt-8 text-center text-themeTextSec text-xs font-medium">
                        Having trouble accessing your account? <br className="sm:hidden" />
                        <a href="/contact" className="text-themeAccent hover:text-themeText underline underline-offset-4 transition-colors ml-1">Contact IT Support</a>
                    </div>
                </div>

            </div>
        </div>
    );
}