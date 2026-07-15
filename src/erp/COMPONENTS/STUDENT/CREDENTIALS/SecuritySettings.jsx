/* eslint-disable */
import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../CONTEXT/ErpContext";
import { supabase } from "../../../LIB/SUPABASE/supabaseClient";

export default function SecuritySettings() {
    const { userSession } = useERP();

    // --- STATE ---
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

    // Password Form State
    const [passwords, setPasswords] = useState({
        new: "",
        confirm: ""
    });

    // --- SESSION MANAGEMENT ---
    useEffect(() => {
        const fetchSessions = async () => {
            setIsLoading(true);
            try {
                // FIXED FLAW #4: Removed the illegal admin API call here.
                // We securely fetch the current active session metadata natively via the client.
                const { data: sessionData } = await supabase.auth.getSession();

                if (sessionData.session) {
                    setSessions([
                        {
                            id: sessionData.session.access_token.substring(0, 8),
                            device: "Current Device",
                            browser: "Verified Browser",
                            location: "Secured Connection",
                            isCurrent: true,
                            lastActive: "Now"
                        }
                    ]);
                }
            } catch (err) {
                console.error("Security sync failed:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSessions();
    }, []);

    // --- PASSWORD UPDATE ENGINE ---
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setStatusMessage({ type: "error", text: "New passwords do not match." });
            return;
        }

        setIsUpdating(true);
        setStatusMessage({ type: "", text: "" });

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwords.new
            });

            if (error) throw error;

            setStatusMessage({ type: "success", text: "Identity credentials updated successfully." });
            setPasswords({ new: "", confirm: "" });
        } catch (err) {
            setStatusMessage({ type: "error", text: err.message });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 lg:gap-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-theme border-themeBorder pb-4 lg:pb-6 gap-4">
                <div>
                    <h2 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight`}>
                        Security & Access
                    </h2>
                    <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mt-0.5">
                        Manage your encryption and active sessions
                    </p>
                </div>
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel lg:rounded-themePanel flex items-center justify-center text-rose-500 shrink-0 hidden sm:flex">
                    <i className="fa-solid fa-shield-halved text-xl lg:text-2xl"></i>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                {/* Change Password Engine */}
                <div className="bg-themePanel border-theme border-themeBorder p-5 lg:p-6 rounded-themePanel lg:rounded-themePanel flex flex-col gap-5 lg:gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-themeElevated rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <h3 className="text-[10px] lg:text-xs font-black text-themeText uppercase tracking-widest flex items-center gap-2 relative z-10">
                        <i className="fa-solid fa-key text-themeAccent"></i> Update Master Password
                    </h3>

                    <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4 lg:gap-5 relative z-10">
                        {statusMessage.text && (
                            <div className={`p-4 rounded-themePanel text-[9px] lg:text-[10px] font-black uppercase tracking-widest flex items-center gap-2  border-theme animate-fade-in ${statusMessage.type === "success" ? "bg-themeElevated border-themeBorderStrong text-emerald-400" : "bg-themeElevated border-themeBorderStrong text-rose-400"
                                }`}>
                                <i className={`fa-solid ${statusMessage.type === "success" ? "fa-circle-check" : "fa-triangle-exclamation"}`}></i>
                                {statusMessage.text}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[9px] lg:text-[10px] font-black text-themeTextSec opacity-70 uppercase tracking-widest ml-1">New Password</label>
                            <input
                                type="password"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                placeholder="••••••••"
                                className="w-full bg-themeElevated border-theme border-themeBorder rounded-themePanel px-4 py-3 lg:py-3.5 text-xs lg:text-sm font-bold text-themeText focus:border-themeAccent outline-none transition-all placeholder:text-neutral-700"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] lg:text-[10px] font-black text-themeTextSec opacity-70 uppercase tracking-widest ml-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                placeholder="••••••••"
                                className="w-full bg-themeElevated border-theme border-themeBorder rounded-themePanel px-4 py-3 lg:py-3.5 text-xs lg:text-sm font-bold text-themeText focus:border-themeAccent outline-none transition-all placeholder:text-neutral-700"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isUpdating || !passwords.new}
                            className="w-full py-3.5 lg:py-4 mt-2 bg-white hover:bg-neutral-200 text-[#050505] rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isUpdating ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Propagating...</> : "Update Identity Key"}
                        </button>
                    </form>
                </div>

                {/* Session Telemetry */}
                <div className="flex flex-col gap-4 lg:gap-5">
                    <h3 className="text-[10px] lg:text-xs font-black text-themeText uppercase tracking-widest flex items-center gap-2 px-1">
                        <i className="fa-solid fa-satellite-dish text-themeAccent"></i> Active Telemetry
                    </h3>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 lg:py-16">
                            <i className="fa-solid fa-circle-notch fa-spin text-neutral-700 text-2xl lg:text-3xl"></i>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 lg:gap-4">
                            {sessions.map((session) => (
                                <div key={session.id} className="p-4 lg:p-5 border-theme border-themeBorderStrong bg-themeElevated rounded-themePanel lg:rounded-themePanel flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-themePanel border-theme border-themeBorder rounded-themePanel lg:rounded-themePanel flex items-center justify-center text-emerald-500 text-lg lg:text-xl shrink-0">
                                            <i className="fa-solid fa-laptop"></i>
                                        </div>
                                        <div>
                                            <p className="text-xs lg:text-sm font-black text-themeText">{session.device}</p>
                                            <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 mt-0.5 lg:mt-1">
                                                <span className="text-[8px] lg:text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    Live Session
                                                </span>
                                                <span className="w-1 h-1 bg-neutral-800 rounded-full shrink-0"></span>
                                                <span className="text-[8px] lg:text-[9px] font-bold text-themeTextSec opacity-70 uppercase tracking-widest">{session.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <i className="fa-solid fa-shield-check text-emerald-500 text-lg lg:text-xl mr-1 lg:mr-2"></i>
                                </div>
                            ))}

                            {/* Dummy Security Tip */}
                            <div className="mt-2 lg:mt-4 p-4 lg:p-5 bg-themePanel border-theme border-themeBorder rounded-themePanel lg:rounded-themePanel flex flex-col sm:flex-row items-start gap-3 lg:gap-4">
                                <i className="fa-solid fa-circle-info text-themeAccent mt-1 text-lg"></i>
                                <p className="text-[9px] lg:text-[10px] font-medium text-themeTextSec leading-relaxed">
                                    <strong className="text-themeText block mb-0.5 lg:mb-1 font-bold uppercase tracking-widest text-[8px] lg:text-[9px]">Security Protocol:</strong>
                                    Avoid sharing your ERP credentials. We recommend changing your password every 90 days to maintain institutional compliance.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}