import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { supabase } from "../../../LIB/supabase/supabaseClient";

export default function SystemUpdater({ children }) {
    const [updateRequired, setUpdateRequired] = useState(false);
    const [updateInfo, setUpdateInfo] = useState(null);
    const [isChecking, setIsChecking] = useState(true);

    const checkForUpdates = async () => {
        if (!Capacitor.isNativePlatform()) {
            setIsChecking(false);
            return;
        }

        try {
            // Get local version
            const appInfo = await CapApp.getInfo();
            const localVersionCode = parseInt(appInfo.build, 10); // version_code (e.g. 20)

            // Get remote version
            const { data, error } = await supabase
                .from('app_releases')
                .select('*')
                .order('version_code', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error("Failed to check for updates:", error);
            }

            if (data && data.version_code > localVersionCode) {
                setUpdateInfo(data);
                if (data.is_mandatory) {
                    setUpdateRequired(true);
                }
            }
        } catch (err) {
            console.error("Update check error:", err);
        } finally {
            setIsChecking(false);
        }
    };

    useEffect(() => {
        checkForUpdates();

        // Also check whenever the app comes to the foreground
        const sub = CapApp.addListener('appStateChange', ({ isActive }) => {
            if (isActive) {
                checkForUpdates();
            }
        });

        return () => {
            sub.then(listener => listener.remove());
        };
    }, []);

    const handleDownloadUpdate = () => {
        if (updateInfo?.apk_url) {
            // Open the APK URL directly. Android will download it and prompt the package installer.
            window.location.href = updateInfo.apk_url;
        }
    };

    if (updateRequired && updateInfo) {
        return (
            <div className="fixed inset-0 z-[2147483647] flex flex-col items-center justify-center bg-[#050505] p-6 text-center">
                <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.15)]">
                    <i className="fa-solid fa-cloud-arrow-down text-indigo-500 text-4xl animate-bounce"></i>
                </div>
                
                <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-2">Core Update Required</h1>
                <p className="text-sm text-neutral-400 font-medium mb-6 max-w-xs leading-relaxed">
                    A mandatory system update is available. You must install the latest version to continue accessing the ecosystem.
                </p>

                <div className="bg-[#111] border border-white/5 rounded-xl p-5 w-full max-w-xs text-left mb-8 shadow-inner">
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Version</span>
                        <span className="text-xs font-black text-indigo-400">v {updateInfo.version_name}</span>
                    </div>
                    <div className="text-xs font-medium text-neutral-300 whitespace-pre-line leading-relaxed">
                        {updateInfo.release_notes || "Performance optimizations and stability improvements."}
                    </div>
                </div>

                <button 
                    onClick={handleDownloadUpdate}
                    className="w-full max-w-xs py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-[12px] uppercase tracking-widest flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all"
                >
                    <i className="fa-solid fa-download"></i>
                    Download & Install
                </button>
            </div>
        );
    }

    return children;
}
