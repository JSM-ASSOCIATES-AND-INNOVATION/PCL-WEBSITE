/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabase/supabaseClient';

export const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let browser = "Web Browser";
    
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Edg")) browser = "Edge";

    let os = "Unknown Device";
    if (ua.includes("Win")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("like Mac")) os = "iOS";

    if (Capacitor.isNativePlatform()) {
        browser = "PCL Mobile App";
    }

    return { 
        browser, 
        os, 
        device_name: `${os} - ${browser}`
    };
};

export const registerDeviceSession = async (userId) => {
    try {
        const info = getDeviceInfo();
        const { data, error } = await supabase
            .from('user_sessions')
            .insert([{
                user_id: userId,
                device_name: info.device_name,
                browser: info.browser,
                os: info.os,
                is_revoked: false
            }])
            .select()
            .single();
            
        if (data && !error) {
            localStorage.setItem('jsmerp_session_tracker_id', data.id);
            return data.id;
        }
    } catch (e) {
        console.error("Telemetry error", e);
    }
    return null;
};
