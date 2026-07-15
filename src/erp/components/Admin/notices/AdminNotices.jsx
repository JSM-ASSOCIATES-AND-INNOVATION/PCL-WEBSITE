"use client";

import React, { useState, useEffect } from "react";
import { useERP } from "../../../context/ErpContext";
import { supabase } from "../../../lib/supabase/supabaseClient";
import { theme } from "../../../theme";

const CACHE_KEY = "admin_notices";

export default function AdminNotices() {
    const { userSession } = useERP();

    // --- STATE ---
    const [notices, setNotices] = useState(() => {
        if (typeof window !== "undefined") {
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached) return JSON.parse(cached);
        }
        return [];
    });
    const [isPublishing, setIsPublishing] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

    // Form State
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("General");
    const [target, setTarget] = useState("global");
    const [targetId, setTargetId] = useState("");
    const [priority, setPriority] = useState("normal");
    const [content, setContent] = useState("");

    // --- DATA SYNC ENGINE ---
    const fetchNotices = async () => {
        try {
            const { data, error } = await supabase
                .from('admin_notices')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            const fetchedData = data || [];
            setNotices(fetchedData);
            if (typeof window !== "undefined") {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify(fetchedData));
            }
        } catch (error) {
            console.error("Failed to fetch broadcast ledger:", error);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    // --- PUBLISH ENGINE ---
    const handlePublish = async (e) => {
        e.preventDefault();
        setIsPublishing(true);
        setStatusMessage({ type: "", text: "" });

        try {
            const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`;

            // In a real app, you'd fetch the Admin's actual name from their profile. 
            // For now, using the contextual name or fallback.
            const authorName = userSession?.name || "System Administrator";

            const { error } = await supabase
                .from('admin_notices')
                .insert({
                    notice_id: noticeId,
                    title,
                    category,
                    target_audience: target,
                    target_id: (target === 'class' || target === 'person') ? targetId : null,
                    priority,
                    content,
                    author_name: authorName,
                    author_id: userSession?.db_id || null
                });

            if (error) throw error;

            setStatusMessage({ type: "success", text: "Circular broadcasted successfully across the network." });
            fetchNotices();

            // Reset Form
            setTitle(""); setContent(""); setCategory("General"); setTarget("global"); setTargetId(""); setPriority("normal");

            setTimeout(() => setStatusMessage({ type: "", text: "" }), 3000);

        } catch (error) {
            console.error("Broadcast failed:", error);
            setStatusMessage({ type: "error", text: "Failed to route broadcast. Please try again." });
        } finally {
            setIsPublishing(false);
        }
    };

    // --- DELETE ENGINE ---
    const handleDelete = async (id) => {
        if (!(await window.erpDialog.confirm("Are you sure you want to retract this official circular? This action cannot be undone."))) return;

        try {
            // Optimistic update
            const updatedNotices = notices.filter(n => n.id !== id);
            setNotices(updatedNotices);
            if (typeof window !== "undefined") {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify(updatedNotices));
            }

            const { error } = await supabase
                .from('admin_notices')
                .delete()
                .eq('id', id);

            if (error) {
                // Revert if error
                fetchNotices();
                throw error;
            }
        } catch (error) {
            window.erpDialog.alert("Failed to retract circular: " + error.message);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in selection:bg-themeElevated">

            {/* 1. HEADER BANNER */}
            <div className="bg-themeElevated rounded-themePanel p-6 lg:p-8 relative overflow-hidden border-theme border-themeBorder text-themeText flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 lg:w-96 lg:h-96 bg-themeElevated rounded-full lg: -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 lg:w-64 lg:h-64 bg-purple-500/10 rounded-full lg: translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                <div className="relative z-10 flex items-center gap-4 lg:gap-5 w-full">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 bg-themeElevated rounded-themePanel lg:rounded-themePanel flex items-center justify-center border-theme border-themeBorderStrong shrink-0">
                        <i className="fa-solid fa-bullhorn text-themeAccent text-2xl lg:text-3xl"></i>
                    </div>
                    <div>
                        <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-themeText mb-1`}>Broadcast Center</h1>
                        <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium`}>Publish official circulars, alerts, and operational updates.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                {/* 2. LEFT COMPOSER PANE (5 Columns) */}
                <div className={`lg:col-span-5 ${theme.layout.panel} rounded-themePanel lg:rounded-themePanel border-theme border-themeBorder  p-5 lg:p-8 h-fit lg:sticky lg:top-6 z-20`}>
                    <h2 className={`${theme.text.heading} text-lg lg:text-xl text-themeText mb-5 lg:mb-6 flex items-center gap-2`}>
                        <i className="fa-solid fa-pen-nib text-themeAccent text-sm"></i> Compose Circular
                    </h2>

                    <form onSubmit={handlePublish} className="flex flex-col gap-4 lg:gap-5">

                        {statusMessage.text && (
                            <div className={`p-3 lg:p-4 rounded-themePanel text-[9px] lg:text-[10px] font-black uppercase tracking-widest flex items-center gap-2  border-theme animate-fade-in ${statusMessage.type === "success" ? "bg-themeElevated text-emerald-400 border-themeBorderStrong" : "bg-themeElevated text-rose-400 border-themeBorderStrong"
                                }`}>
                                <i className={`fa-solid ${statusMessage.type === "success" ? "fa-circle-check text-emerald-500" : "fa-triangle-exclamation text-rose-500"} text-sm`}></i>
                                {statusMessage.text}
                            </div>
                        )}

                        <div>
                            <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-1.5 ml-1`}>Subject / Title</label>
                            <input
                                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Mandatory Library Audit"
                                className="w-full bg-themePanel border-theme border-themeBorderStrong rounded-themePanel px-4 py-3 lg:py-3.5 text-xs lg:text-sm font-bold text-themeText focus:border-themeAccent focus:bg-themeElevated outline-none transition-all placeholder:text-neutral-600"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-5">
                            <div>
                                <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-1.5 ml-1`}>Category</label>
                                <div className="relative">
                                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-themePanel border-theme border-themeBorderStrong rounded-themePanel px-4 py-3 text-xs lg:text-sm font-bold text-themeText focus:border-themeAccent focus:bg-themeElevated outline-none appearance-none cursor-pointer truncate pr-10">
                                        <option value="General">General Notice</option>
                                        <option value="Academic">Academic</option>
                                        <option value="Administrative">Administrative</option>
                                        <option value="Examination">Examination</option>
                                    </select>
                                    <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec opacity-70 pointer-events-none text-xs"></i>
                                </div>
                            </div>
                            <div>
                                <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-1.5 ml-1`}>Target Audience</label>
                                <div className="relative">
                                    <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full bg-themePanel border-theme border-themeBorderStrong rounded-themePanel px-4 py-3 text-xs lg:text-sm font-bold text-themeText focus:border-themeAccent focus:bg-themeElevated outline-none appearance-none cursor-pointer truncate pr-10">
                                        <option value="global">Global (Everyone)</option>
                                        <option value="student">All Students</option>
                                        <option value="faculty">All Faculty</option>
                                        <option value="class">Specific Class</option>
                                        <option value="person">Specific Person</option>
                                    </select>
                                    <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec opacity-70 pointer-events-none text-xs"></i>
                                </div>
                            </div>
                        </div>

                        {(target === 'class' || target === 'person') && (
                            <div className="animate-fade-in">
                                <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-1.5 ml-1`}>
                                    {target === 'class' ? 'Batch ID (e.g., BATCH-2026)' : 'Person ERP ID (e.g., STU-001)'}
                                </label>
                                <input
                                    type="text" value={targetId} onChange={(e) => setTargetId(e.target.value)}
                                    placeholder={target === 'class' ? 'Enter target Batch ID...' : 'Enter precise ERP ID...'}
                                    className="w-full bg-themePanel border-theme border-themeBorderStrong rounded-themePanel px-4 py-3 lg:py-3.5 text-xs lg:text-sm font-bold text-themeText focus:border-themeAccent focus:bg-themeElevated outline-none transition-all placeholder:text-neutral-600"
                                    required
                                />
                            </div>
                        )}

                        <div className="bg-themeElevated border-theme border-themeBorderStrong p-3.5 lg:p-4 rounded-themePanel flex items-center justify-between">
                            <div>
                                <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeAccent">Priority Level</p>
                                <p className="text-[10px] lg:text-xs font-semibold text-themeTextSec mt-0.5">Urgent notices bypass standard filters.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={priority === "urgent"} onChange={(e) => setPriority(e.target.checked ? "urgent" : "normal")} />
                                <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border-theme after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                            </label>
                        </div>

                        <div>
                            <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-1.5 ml-1`}>Circular Content</label>
                            <textarea
                                value={content} onChange={(e) => setContent(e.target.value)}
                                rows="5" placeholder="Draft the official notification here..."
                                className="w-full bg-themePanel border-theme border-themeBorderStrong rounded-themePanel px-4 py-3 text-xs lg:text-sm font-bold text-themeText focus:border-themeAccent focus:bg-themeElevated outline-none resize-none placeholder:text-neutral-600 transition-colors"
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={isPublishing || !title || !content}
                            className="w-full py-3.5 lg:py-4 mt-2 bg-themeAccent hover:bg-themeAccentMuted text-themeText rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:bg-themeElevated disabled:text-themeTextSec opacity-70 disabled:border-theme disabled:border-themeBorderStrong flex justify-center items-center gap-2 relative overflow-hidden group"
                        >
                            {!isPublishing && title && content && (
                                <div className="absolute inset-0 w-full h-full -translate-x-full group-hover:"></div>
                            )}
                            {isPublishing ? <><i className="fa-solid fa-circle-notch fa-spin text-sm"></i> Broadcasting...</> : <><i className="fa-solid fa-paper-plane text-sm"></i> Publish Circular</>}
                        </button>
                    </form>
                </div>

                {/* 3. RIGHT PANE: ACTIVE CIRCULARS (7 Columns) */}
                <div className="lg:col-span-7 flex flex-col gap-4 lg:gap-5">
                    <h2 className={`${theme.text.heading} text-lg lg:text-xl text-themeText px-1 lg:px-2 flex items-center`}><i className="fa-solid fa-satellite-dish text-themeTextSec opacity-70 mr-2 text-sm lg:text-base"></i> Active Broadcasts</h2>

                    {notices.length === 0 ? (
                        <div className="w-full py-16 lg:py-20 text-center border-2 border-dashed border-themeBorder rounded-themePanel lg:rounded-themePanel bg-themeApp px-4">
                            <i className="fa-regular fa-bell-slash text-4xl lg:text-5xl text-neutral-600 mb-3 lg:mb-4"></i>
                            <h3 className={`${theme.text.heading} text-base lg:text-lg text-themeText`}>No Active Circulars</h3>
                            <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-themeTextSec opacity-70 mt-1 lg:mt-1.5">The broadcast network is currently empty.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 lg:gap-4 animate-[fadeIn_0.5s_ease-out]">
                            {notices.map((notice) => (
                                <div key={notice.id} className={`${theme.layout.panel} p-5 lg:p-6 rounded-themePanel lg:rounded-themePanel border-theme flex flex-col gap-3 lg:gap-4  hover: transition-all group ${notice.priority === 'urgent' ? 'border-themeBorderStrong hover:border-rose-500  ' : 'border-themeBorder hover:border-themeBorderStrong'}`}>

                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec bg-themePanel px-2.5 py-1 rounded-md border-theme border-themeBorder truncate">
                                                {notice.notice_id}
                                            </span>
                                            <span className={`text-[8px] lg:text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border-theme truncate ${notice.target_audience === 'global' ? 'bg-themeElevated text-themeAccent border-themeBorderStrong' :
                                                    notice.target_audience === 'faculty' ? 'bg-themeElevated text-blue-400 border-themeBorderStrong' : 
                                                    notice.target_audience === 'class' ? 'bg-themeElevated text-purple-400 border-themeBorderStrong' : 
                                                    notice.target_audience === 'person' ? 'bg-themeElevated text-amber-400 border-themeBorderStrong' : 
                                                    'bg-themeElevated text-emerald-400 border-themeBorderStrong'
                                                }`}>
                                                Target: {notice.target_audience} {notice.target_id ? `(${notice.target_id})` : ''}
                                            </span>
                                        </div>
                                        {notice.priority === 'urgent' && (
                                            <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-rose-500 bg-themeElevated border-theme border-themeBorderStrong px-2.5 py-1 rounded-md flex items-center gap-1.5 shrink-0">
                                                <i className="fa-solid fa-triangle-exclamation"></i> Urgent
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-base lg:text-lg font-black text-themeText leading-tight mb-2 group-hover:text-themeAccent transition-colors">{notice.title}</h3>
                                        <p className="text-xs lg:text-sm font-medium text-themeText line-clamp-3 leading-relaxed bg-themePanel p-3 lg:p-4 rounded-themePanel lg:rounded-themePanel border-theme border-themeBorder">
                                            {notice.content}
                                        </p>
                                    </div>

                                    <div className="pt-3 lg:pt-4 border-t-theme border-themeBorder flex justify-between items-center mt-1 lg:mt-2">
                                        <span className="text-[9px] lg:text-[10px] font-bold text-themeTextSec opacity-70 uppercase tracking-widest flex items-center gap-1.5 lg:gap-2 flex-wrap">
                                            <span className="flex items-center gap-1"><i className="fa-regular fa-calendar text-themeAccent"></i> {new Date(notice.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            <span className="hidden sm:inline mx-1 lg:mx-2 text-neutral-700">•</span>
                                            <span className="flex items-center gap-1"><i className="fa-solid fa-user-shield text-emerald-400"></i> <span className="truncate max-w-[100px] sm:max-w-none">{notice.author_name}</span></span>
                                        </span>
                                        <button
                                            onClick={() => handleDelete(notice.id)}
                                            className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-themePanel bg-themeElevated border-theme border-themeBorderStrong hover:bg-themeElevated text-themeTextSec opacity-70 hover:text-rose-500 hover:border-themeBorderStrong flex items-center justify-center transition-all shrink-0"
                                            title="Retract Circular"
                                        >
                                            <i className="fa-solid fa-trash-can text-[10px] lg:text-xs"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}