/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERP } from '../../context/ErpContext';
import { theme } from '../../theme';

export default function SessionTimeoutGuard({ children }) {
    const { logout } = useERP();
    const navigate = useNavigate();

    // 20 minutes total timeout
    const INACTIVITY_LIMIT_MS = 19 * 60 * 1000; // 19 mins
    const WARNING_DURATION_MS = 60 * 1000; // 60 seconds

    const [showWarning, setShowWarning] = useState(false);
    const [countdown, setCountdown] = useState(60);
    
    const inactivityTimerRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    const resetInactivityTimer = () => {
        if (showWarning) return; // Do not reset if warning is actively showing
        
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = setTimeout(() => {
            triggerWarning();
        }, INACTIVITY_LIMIT_MS);
    };

    const triggerWarning = () => {
        setShowWarning(true);
        setCountdown(60);
        
        countdownIntervalRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    executeLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const continueSession = () => {
        setShowWarning(false);
        clearInterval(countdownIntervalRef.current);
        resetInactivityTimer();
    };

    const executeLogout = () => {
        clearInterval(countdownIntervalRef.current);
        logout();
        navigate('/login');
    };

    useEffect(() => {
        // Track global interaction events
        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
        
        const handleActivity = () => resetInactivityTimer();

        events.forEach(event => window.addEventListener(event, handleActivity));
        
        // Start initial timer
        resetInactivityTimer();

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            clearTimeout(inactivityTimerRef.current);
            clearInterval(countdownIntervalRef.current);
        };
    }, [showWarning]);

    return (
        <>
            {children}

            {showWarning && (
                <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                    <div className="w-full max-w-md bg-themePanel border-theme border-rose-500 rounded-themePanel overflow-hidden shadow-[0_0_50px_rgba(244,63,94,0.2)]">
                        <div className="p-8 flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-rose-500/10 border-theme border-rose-500/30 flex items-center justify-center text-rose-500 mb-2">
                                <i className="fa-solid fa-shield-halved text-2xl animate-pulse"></i>
                            </div>
                            
                            <h2 className={`${theme.text.heading} text-2xl text-themeText`}>Security Timeout</h2>
                            <p className="text-themeTextSec text-sm">
                                Your session has been inactive. For the security of your academic data, you will be automatically logged out in:
                            </p>

                            <div className="text-5xl font-mono font-black text-rose-500 tracking-tighter my-4">
                                {countdown}s
                            </div>

                            <div className="flex w-full gap-3 mt-4">
                                <button 
                                    onClick={executeLogout}
                                    className="flex-1 py-3 px-4 bg-themeApp text-themeText border-theme border-themeBorder rounded-themeBtn font-bold uppercase tracking-widest text-xs hover:bg-themeElevated transition-all"
                                >
                                    Log Out Now
                                </button>
                                <button 
                                    onClick={continueSession}
                                    className="flex-[2] py-3 px-4 bg-emerald-500 text-black border-theme border-emerald-500 rounded-themeBtn font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                >
                                    <i className="fa-solid fa-bolt mr-2"></i> Continue Session
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
