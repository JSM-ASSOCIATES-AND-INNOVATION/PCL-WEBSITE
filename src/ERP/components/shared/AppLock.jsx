import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { supabase } from "../../../LIB/supabase/supabaseClient";

export default function AppLock({ children }) {
    const [isLocked, setIsLocked] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [biometricError, setBiometricError] = useState(null);
    const [isForeground, setIsForeground] = useState(true);

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const checkLockStatus = () => {
            const isEnabled = localStorage.getItem('jsm_biometric_enabled') === 'true' || localStorage.getItem('erp_biometric_enabled') === 'true';
            
            if (!isEnabled) {
                setIsLocked(false);
                return;
            }

            const timeoutVal = localStorage.getItem('jsm_biometric_timeout') || '0';
            const timeoutMs = parseInt(timeoutVal, 10) * 60 * 1000;
            const lastBackgroundStr = localStorage.getItem('jsm_last_background_time');
            
            if (!lastBackgroundStr) {
                // Cold boot with biometrics enabled -> LOCK
                setIsLocked(true);
                return;
            }

            const lastBackground = parseInt(lastBackgroundStr, 10);
            const timeDiff = Date.now() - lastBackground;

            if (timeDiff >= timeoutMs) {
                setIsLocked(true);
            } else {
                setIsLocked(false);
            }
        };

        checkLockStatus();

        const sub = CapApp.addListener('appStateChange', ({ isActive }) => {
            const isEnabled = localStorage.getItem('jsm_biometric_enabled') === 'true' || localStorage.getItem('erp_biometric_enabled') === 'true';

            if (!isActive) {
                setIsForeground(false);
                localStorage.setItem('jsm_last_background_time', Date.now().toString());
                // Lock the UI immediately when backgrounding so the OS can't
                // capture a screenshot of unlocked content for the recent-apps
                // thumbnail. checkLockStatus() on resume will decide whether a
                // biometric prompt is actually needed based on the timeout.
                if (isEnabled) {
                    setBiometricError(null);
                    setIsLocked(true);
                }
            } else {
                setIsForeground(true);
                checkLockStatus();
            }
        });

        return () => {
            sub.then(listener => listener.remove());
        };
    }, []);

    const performBiometric = async () => {
        if (isAuthenticating) return;
        setIsAuthenticating(true);
        setBiometricError(null);
        
        try {
            // Wrap in a promise race to prevent it from hanging indefinitely
            await Promise.race([
                NativeBiometric.verifyIdentity({
                    reason: "Unlock PCL ERP",
                    title: "Authentication Required",
                    subtitle: "Use your fingerprint or face to unlock",
                    useFallback: true, // Allow PIN
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Authentication prompt timed out.")), 15000))
            ]);
            
            setIsLocked(false);
            localStorage.setItem('jsm_last_background_time', Date.now().toString());
            setBiometricError(null);
        } catch (error) {
            console.error("Biometric error", error);
            const msg = error.message ? error.message.toLowerCase() : '';
            // If they don't even have a PIN or Biometric setup on the OS level, unlock it to prevent bricking
            if (msg.includes('not enrolled') || msg.includes('not available') || msg.includes('missing')) {
                setIsLocked(false);
                return;
            }
            setBiometricError(error.message || "Authentication failed. Try again.");
        } finally {
            setIsAuthenticating(false);
        }
    };

    useEffect(() => {
        let timer;
        // Only auto-prompt while the app is actually visible. Locking also
        // happens on backgrounding (to hide content from the recent-apps
        // thumbnail), and we don't want to fire a biometric prompt then —
        // only once the user is back in the foreground.
        if (isLocked && isForeground) {
            // Delay slightly to ensure Android Activity is fully resumed before showing prompt
            timer = setTimeout(() => {
                performBiometric();
            }, 600);
        }
        return () => clearTimeout(timer);
    }, [isLocked, isForeground]);

    const handleEmergencyLogout = async () => {
        try {
            await supabase.auth.signOut();
        } catch(e) {
            console.error(e);
        }
        localStorage.removeItem('jsm_biometric_enabled');
        localStorage.removeItem('erp_biometric_enabled');
        localStorage.removeItem('jsm_last_background_time');
        setIsLocked(false);
        window.location.href = '/login';
    };

    if (!isLocked) {
        return children;
    }

    return (
        <div className="fixed inset-0 z-[2147483647] flex flex-col items-center justify-center bg-[#050505] p-6 text-center animate-in fade-in duration-300">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.15)] relative">
                <i className={`fa-solid ${biometricError ? 'fa-shield-xmark text-rose-500' : 'fa-fingerprint text-emerald-500'} text-4xl`}></i>
                {isAuthenticating && (
                    <svg className="absolute inset-0 w-full h-full text-emerald-500/50 animate-spin-slow" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="300" strokeDashoffset="150" strokeLinecap="round" />
                    </svg>
                )}
            </div>
            
            <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-2">App Locked</h1>
            <p className="text-sm text-neutral-400 font-medium mb-1 max-w-xs leading-relaxed">
                Authentication is required to access your digital campus ecosystem.
            </p>
            
            {biometricError && (
                <p className="text-xs font-bold text-rose-500 bg-rose-500/10 py-1.5 px-3 rounded-md mt-4 animate-shake">
                    {biometricError}
                </p>
            )}

            <div className="mt-10 flex flex-col gap-4 w-full max-w-xs">
                <button 
                    onClick={performBiometric}
                    disabled={isAuthenticating}
                    className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-widest flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
                >
                    {isAuthenticating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-lock-open"></i>}
                    {isAuthenticating ? 'Verifying...' : 'Unlock Application'}
                </button>
                
                <button 
                    onClick={handleEmergencyLogout}
                    className="w-full py-3 rounded-xl border border-black/5 dark:border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 font-bold text-[10px] uppercase tracking-widest transition-colors"
                >
                    Sign Out & Reset
                </button>
            </div>
        </div>
    );
}
