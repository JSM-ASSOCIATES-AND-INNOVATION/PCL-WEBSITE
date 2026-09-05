/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { theme } from '../../../theme';

export default function PermissionManager() {
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const checkPermissions = async () => {
            // Only strictly run on native apps, or web if we really want to (but usually native is the focus here)
            if (!Capacitor.isNativePlatform()) return;
            
            // Check if we've asked before to avoid spamming them (App Store compliance)
            const hasAsked = localStorage.getItem('erp_has_asked_notifications');
            if (hasAsked === 'true') return;

            try {
                const permStatus = await LocalNotifications.checkPermissions();
                if (permStatus.display !== 'granted') {
                    // Small delay to let the app load first so it's not jarring
                    setTimeout(() => setShowPrompt(true), 2000);
                }
            } catch (e) {
                console.error("Local notifications not supported or failed", e);
            }
        };
        
        checkPermissions();
    }, []);

    const handleGrant = async () => {
        setShowPrompt(false);
        localStorage.setItem('erp_has_asked_notifications', 'true');
        try {
            const request = await LocalNotifications.requestPermissions();
            if (request.display === 'granted') {
                // Yay! We can schedule a welcome notification
                await LocalNotifications.schedule({
                    notifications: [
                        {
                            title: "Prudentia ERP Alerts",
                            body: "You will now receive important updates about classes, exams, and notices.",
                            id: 999,
                            schedule: { at: new Date(Date.now() + 2000) },
                            sound: null,
                            attachments: null,
                            actionTypeId: "",
                            extra: null
                        }
                    ]
                });
            }
        } catch (e) {
            console.error("Permission request failed", e);
        }
    };

    const handleDecline = () => {
        setShowPrompt(false);
        // We log that we asked so we don't spam, but they can enable it in settings later
        localStorage.setItem('erp_has_asked_notifications', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-sm bg-themePanel/95 backdrop-blur-3xl shadow-premiumElevated border border-black/5 dark:border-white/10 rounded-[2rem] overflow-hidden">
                {/* Header Image/Icon Area */}
                <div className="relative w-full h-32 bg-gradient-to-br from-themeApp to-themeElevated flex items-center justify-center border-b border-white/5">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-themeAccent/20 via-transparent to-transparent opacity-50"></div>
                    <div className="w-16 h-16 rounded-full bg-themePanel/80 backdrop-blur-md shadow-premium flex items-center justify-center border border-black/5 dark:border-white/10 relative z-10 text-themeAccent text-3xl">
                        <i className="fa-solid fa-bell fa-shake" style={{ '--fa-animation-duration': '3s' }}></i>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 lg:p-8 flex flex-col items-center text-center gap-3">
                    <h2 className="text-xl lg:text-2xl font-black text-themeText">
                        Stay Updated
                    </h2>
                    
                    <p className="text-[10px] lg:text-xs text-themeTextSec leading-relaxed font-medium">
                        Prudentia ERP requires Notification Access to alert you about <strong className="text-themeText">Upcoming Classes, Exams, Due Dates, and Urgent Notices.</strong> 
                        <br/><br/>
                        <span className="opacity-70 italic">We respect your focus. You will only receive academic-critical alerts.</span>
                    </p>

                    <div className="w-full flex flex-col gap-3 mt-4">
                        <button 
                            onClick={handleGrant}
                            className="w-full py-3.5 bg-themeAccent text-[#050505] rounded-full text-[10px] lg:text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,191,0,0.2)]"
                        >
                            Enable Notifications
                        </button>
                        <button 
                            onClick={handleDecline}
                            className="w-full py-3.5 bg-transparent text-themeTextSec rounded-full text-[10px] lg:text-xs font-bold uppercase tracking-widest hover:text-themeText hover:bg-white/5 transition-all"
                        >
                            Not Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
