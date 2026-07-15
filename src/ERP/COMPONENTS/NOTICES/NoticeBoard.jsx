/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

/* eslint-disable */
"use client";

import React, { useState } from "react";
import { useERP } from "../../CONTEXT/ErpContext";
import { theme } from "../../theme";

export default function NoticeBoard() {
    const { userSession, notices, addNotice } = useERP();

    // --- STATE ---
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Form State
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [target, setTarget] = useState("all_students");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const role = userSession?.role || "student";
    const canCreate = role === "faculty" || role === "admin";

    // --- SAFE THEME MAPPING ---
    const themeStyles = {
        student: {
            glow: "bg-themeElevated",
            iconBox: "text-themeAccent",
            hoverBorder: "hover:border-amber-200",
            hoverText: "group-hover:text-amber-600",
            readText: "text-amber-600"
        },
        faculty: {
            glow: "bg-themeElevated",
            iconBox: "text-blue-400",
            hoverBorder: "hover:border-blue-200",
            hoverText: "group-hover:text-blue-600",
            readText: "text-blue-600"
        }
    };

    const currentTheme = themeStyles[role === "faculty" ? "faculty" : "student"] || themeStyles.student;

    const handleCreateNotice = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setIsSubmitting(true);
        try {
            const authorName = userSession?.name || "FACULTY/ADMIN";

            let targetAudience = 'global';
            if (target === 'my_classes') targetAudience = 'student'; // Or we could use 'class' but faculty's my_classes means student
            else if (target === 'all_students') targetAudience = 'student';

            const { success, error } = await addNotice({
                title,
                content,
                target_audience: target === 'admin_control' ? 'global' : targetAudience,
                author_name: authorName,
                category: target === 'admin_control' ? 'Administrative' : 'Academic',
                priority: 'normal',
            });

            if (!success && error) throw error;
            
            // Success reset
            setIsCreateModalOpen(false);
            setTitle("");
            setContent("");
            setTarget("all_students");

        } catch (error) {
            console.error("Error creating notice:", error);
            window.erpDialog.alert("Failed to create notice. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- ZERO LATENCY RENDER ---
    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 pb-12 animate-[fadeIn_0.4s_ease-out]">

            {/* 1. HEADER BANNER */}
            <div className={`bg-themeElevated rounded-themePanel p-8 relative overflow-hidden border-theme border-themeBorderStrong text-themeText flex flex-col md:flex-row justify-between items-center gap-6`}>
                <div className={`absolute top-0 right-0 w-64 h-64 ${currentTheme.glow} rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50`}></div>
                <div className="relative z-10 flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 bg-themePanel rounded-themePanel flex items-center justify-center border-theme border-themeBorderStrong ${currentTheme.iconBox} text-2xl shrink-0`}>
                            <i className="fa-solid fa-thumbtack"></i>
                        </div>
                        <div>
                            <h1 className={`${theme.text.heading} text-3xl text-themeText tracking-tight mb-1`}>Digital Notice Board</h1>
                            <p className={`${theme.text.secondary} text-sm font-medium`}>Official circulars and announcements from the administration.</p>
                        </div>
                    </div>
                    {canCreate && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-themeAccent text-white px-6 py-3 rounded-themePanel font-bold text-sm tracking-wide hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg"
                        >
                            <i className="fa-solid fa-plus"></i> Create Notice
                        </button>
                    )}
                </div>
            </div>

            {/* 2. NOTICES GRID */}
            {notices.length === 0 ? (
                <div className="w-full py-20 border-2 border-dashed border-themeBorder rounded-themePanel flex flex-col items-center justify-center bg-themePanel/50">
                    <i className="fa-solid fa-envelope-open text-4xl text-themeTextSec opacity-50 mb-4"></i>
                    <h3 className={`${theme.text.heading} text-lg text-themeText`}>No active notices</h3>
                    <p className={`${theme.text.secondary} text-xs font-semibold mt-1`}>You're all caught up on official circulars!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notices.map((notice) => (
                        <div
                            key={notice.id}
                            onClick={() => setSelectedNotice(notice)}
                            className={`${theme.layout.panel} p-6 rounded-themePanel border-theme hover: cursor-pointer flex flex-col justify-between transition-all group ${notice.priority === 'urgent' ? 'border-themeBorderStrong hover:border-rose-400' : `border-themeBorder ${currentTheme.hoverBorder}`
                                }`}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border-theme ${notice.category === 'Academic' ? 'bg-themeElevated text-purple-400 border-themeBorderStrong' :
                                            notice.category === 'Administrative' ? 'bg-themeElevated text-amber-400 border-themeBorderStrong' :
                                                notice.category === 'Examination' ? 'bg-themeElevated text-blue-400 border-themeBorderStrong' :
                                                    'bg-themeElevated text-themeTextSec border-themeBorderStrong'
                                        }`}>
                                        {notice.category || 'General'}
                                    </span>
                                    {notice.priority === 'urgent' && (
                                        <span className="text-[10px] text-rose-500 bg-themeElevated border-theme border-themeBorderStrong px-2 py-1 rounded-md flex items-center gap-1" title="Urgent">
                                            <i className="fa-solid fa-triangle-exclamation"></i>
                                        </span>
                                    )}
                                </div>

                                <h3 className={`${theme.text.heading} text-lg text-themeText leading-tight mb-2 ${currentTheme.hoverText} transition-colors`}>
                                    {notice.title}
                                </h3>
                                <p className={`${theme.text.secondary} text-sm line-clamp-3 mb-6 leading-relaxed`}>
                                    {notice.content}
                                </p>
                            </div>

                            <div className="pt-4 border-t-theme border-themeBorder flex justify-between items-center">
                                <span className="text-[10px] font-bold text-themeTextSec opacity-70 uppercase tracking-widest">
                                    {new Date(notice.created_at || new Date()).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${currentTheme.readText} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                    Read More &rarr;
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 3. READING MODAL */}
            {selectedNotice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-themeApp w-full max-w-2xl rounded-themePanel overflow-hidden border-theme border-themeBorderStrong shadow-2xl">

                        <div className={`p-6 text-white relative ${selectedNotice.priority === 'urgent' ? 'bg-rose-600' : 'bg-themeElevated'}`}>
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-2 block">
                                        Official Circular {selectedNotice.notice_id ? `• ${selectedNotice.notice_id}` : ''}
                                    </span>
                                    <h3 className={`${theme.text.heading} text-2xl tracking-tight mb-1 text-white`}>{selectedNotice.title}</h3>
                                </div>
                                <button onClick={() => setSelectedNotice(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 transition-colors shrink-0 text-white">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6 pb-6 border-b-theme border-themeBorder">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-themeElevated rounded-full flex items-center justify-center text-themeTextSec border-theme border-themeBorderStrong">
                                        <i className="fa-solid fa-building-columns"></i>
                                    </div>
                                    <div>
                                        <p className={`${theme.text.heading} text-sm text-themeText`}>{selectedNotice.author_name || 'Administration'}</p>
                                        <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Issuing Authority</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mb-0.5">Published On</p>
                                    <p className={`${theme.text.heading} text-sm text-themeText`}>
                                        {new Date(selectedNotice.created_at || new Date()).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            <div className={`${theme.text.secondary} prose prose-sm max-w-none leading-relaxed whitespace-pre-wrap`}>
                                {selectedNotice.content}
                            </div>

                            <button
                                onClick={() => setSelectedNotice(null)}
                                className={`w-full mt-8 py-4 bg-themeElevated hover:opacity-80 text-themeText rounded-themePanel text-xs font-black uppercase tracking-widest transition-opacity flex items-center justify-center gap-2 border-theme border-themeBorderStrong`}
                            >
                                <i className="fa-solid fa-check-double text-themeAccent"></i> Mark as Read & Close
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* 4. CREATE NOTICE MODAL */}
            {isCreateModalOpen && canCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-themeApp w-full max-w-lg rounded-themePanel overflow-hidden border-theme border-themeBorderStrong shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b-theme border-themeBorder flex justify-between items-center bg-themeElevated">
                            <div>
                                <h3 className={`${theme.text.heading} text-xl text-themeText`}>Create New Notice</h3>
                                <p className={`${theme.text.secondary} text-xs mt-1`}>Publish a circular to the digital board.</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-themePanel hover:bg-themeBorder text-themeText transition-colors shrink-0">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateNotice} className="p-6 flex flex-col gap-5 overflow-y-auto">
                            <div>
                                <label className="block text-xs font-bold text-themeText uppercase tracking-widest mb-2">Notice Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Mid-Term Examination Schedule"
                                    className="w-full bg-themeElevated border-theme border-themeBorder rounded-lg px-4 py-3 text-themeText focus:outline-none focus:border-themeAccent transition-colors text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-themeText uppercase tracking-widest mb-2">Detailed Content</label>
                                <textarea
                                    required
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Enter the official details here..."
                                    rows={6}
                                    className="w-full bg-themeElevated border-theme border-themeBorder rounded-lg px-4 py-3 text-themeText focus:outline-none focus:border-themeAccent transition-colors text-sm resize-none"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-themeText uppercase tracking-widest mb-2">Target Audience</label>
                                <select
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                    className="w-full bg-themeElevated border-theme border-themeBorder rounded-lg px-4 py-3 text-themeText focus:outline-none focus:border-themeAccent transition-colors text-sm appearance-none"
                                >
                                    <option value="all_students">All Students (General Notice)</option>
                                    <option value="my_classes">My Classes</option>
                                    <option value="admin_control">Admin Control (Global)</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-4 bg-themeAccent hover:opacity-90 text-white rounded-themePanel py-4 text-xs font-black uppercase tracking-widest transition-opacity flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <i className="fa-solid fa-circle-notch fa-spin"></i> Publishing...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-paper-plane"></i> Publish Notice
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}