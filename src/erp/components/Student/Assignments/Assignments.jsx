/* eslint-disable */
import React, { useState, useEffect, useCallback } from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../context/ErpContext";
import { supabase } from "../../../lib/supabase/supabaseClient";

// --- CACHE HELPERS ---
const CACHE_PENDING = 'asgn_v2_pending';
const CACHE_COMPLETED = 'asgn_v2_completed';
const readCache = (key, fallback) => {
    try { const d = sessionStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
    catch { return fallback; }
};
const writeCache = (key, data) => {
    try { sessionStorage.setItem(key, JSON.stringify(data)); } catch {}
};

export default function Assignments() {
    const { userSession } = useERP();

    // --- STATE (instant from cache) ---
    const [view, setView] = useState("pending");
    const [pendingAssignments, setPendingAssignments] = useState(() => readCache(CACHE_PENDING, []));
    const [completedAssignments, setCompletedAssignments] = useState(() => readCache(CACHE_COMPLETED, []));

    // --- MODAL STATE ---
    const [selectedTask, setSelectedTask] = useState(null);
    const [submissionText, setSubmissionText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // --- BACKGROUND FETCH (no loading gate) ---
    const fetchAssignments = useCallback(async () => {
        if (!userSession) return;
        try {
            const studentId = userSession.db_id || userSession.id;
            const batchId = userSession.academic_batch || 'BATCH-2026';

            // Parallel fetch: assignments + submissions
            const [assignRes, subRes] = await Promise.all([
                supabase
                    .from('assignments')
                    .select('*, profiles!faculty_id(full_name)')
                    .eq('batch_id', batchId)
                    .order('due_date', { ascending: true }),
                supabase
                    .from('assignment_submissions')
                    .select('*')
                    .eq('student_id', studentId)
            ]);

            if (assignRes.error) throw assignRes.error;
            if (subRes.error) throw subRes.error;

            const assignments = assignRes.data || [];
            const submissions = subRes.data || [];
            const submittedIds = submissions.map(s => s.assignment_id);

            const pending = assignments.filter(a => !submittedIds.includes(a.id));
            const completed = submissions.map(sub => {
                const detail = assignments.find(a => a.id === sub.assignment_id);
                return { ...sub, assignment: detail };
            }).filter(s => s.assignment);

            setPendingAssignments(pending);
            setCompletedAssignments(completed);
            writeCache(CACHE_PENDING, pending);
            writeCache(CACHE_COMPLETED, completed);
        } catch (err) {
            console.error("Assignments fetch:", err.message);
        }
    }, [userSession]);

    useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

    // --- MODAL CONTROLS ---
    const openModal = (task) => {
        setSelectedTask(task);
        setSubmissionText("");
        setSubmitSuccess(false);
        setSubmitError("");
    };
    const closeModal = () => {
        setSelectedTask(null);
        setSubmissionText("");
        setSubmitSuccess(false);
        setSubmitError("");
    };

    // --- SUBMISSION ENGINE ---
    const handleSubmission = async (e) => {
        e.preventDefault();
        if (!submissionText.trim() || !selectedTask) return;
        
        const currentWords = submissionText.trim().split(/\s+/).filter(Boolean).length;
        if(selectedTask.word_limit && currentWords > selectedTask.word_limit) {
            setSubmitError(`Word limit exceeded! You wrote ${currentWords} words, but the limit is ${selectedTask.word_limit}.`);
            return;
        }

        setIsSubmitting(true);
        setSubmitError("");

        try {
            const studentId = userSession.db_id || userSession.id;
            const { error } = await supabase
                .from('assignment_submissions')
                .insert({
                    assignment_id: selectedTask.id,
                    student_id: studentId,
                    submission_text: submissionText,
                    status: 'Pending Review'
                });
            if (error) throw error;

            setSubmitSuccess(true);
            fetchAssignments();
            setTimeout(() => closeModal(), 2000);
        } catch (err) {
            console.error("Submission failed:", err);
            setSubmitError("Submission failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- HELPERS ---
    const getTimeLeft = (dueDate) => {
        const diff = new Date(dueDate).getTime() - Date.now();
        if (diff <= 0) return { label: "Overdue", urgent: true };
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        if (days > 3) return { label: `${days}d left`, urgent: false };
        if (days > 0) return { label: `${days}d ${hours}h left`, urgent: true };
        return { label: `${hours}h left`, urgent: true };
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Graded': return { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: 'fa-check-double', label: 'Graded' };
            case 'Pending Review': return { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: 'fa-clock', label: 'Awaiting Grade' };
            default: return { color: 'text-themeTextSec bg-themePanel border-themeBorder', icon: 'fa-hourglass-half', label: status || 'Processing' };
        }
    };

    const wordCount = submissionText.trim() ? submissionText.trim().split(/\s+/).filter(Boolean).length : 0;
    const isOverLimit = selectedTask && selectedTask.word_limit && wordCount > selectedTask.word_limit;

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-20 lg:pb-12 animate-fade-in selection:bg-themeElevated">

            {/* ═══════════════ HEADER ═══════════════ */}
            <div className={`flex flex-col lg:flex-row lg:items-end justify-between gap-6 ${theme.layout.panel} p-6 lg:p-8 rounded-themePanel border-theme border-themeBorder`}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel flex items-center justify-center text-indigo-400 text-xl lg:text-2xl shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                        <i className="fa-solid fa-file-pen"></i>
                    </div>
                    <div>
                        <h1 className={`${theme.text.heading} text-2xl lg:text-3xl text-themeText mb-1 tracking-tight`}>Assignment Portal</h1>
                        <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium`}>Draft your coursework and submit securely to faculty.</p>
                    </div>
                </div>

                <div className="flex p-1.5 bg-themePanel border-theme border-themeBorder rounded-themePanel w-full lg:w-auto overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setView("pending")}
                        className={`flex-1 lg:flex-none px-4 lg:px-6 py-2.5 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${view === "pending"
                            ? "bg-themeElevated text-indigo-400 border-theme border-themeBorderStrong shadow-sm"
                            : "text-themeTextSec opacity-70 hover:text-themeText"
                            }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${view === "pending" && pendingAssignments.length > 0 ? 'bg-rose-500 animate-pulse' : 'bg-neutral-600'}`}></span>
                        Pending ({pendingAssignments.length})
                    </button>
                    <button
                        onClick={() => setView("completed")}
                        className={`flex-1 lg:flex-none px-4 lg:px-6 py-2.5 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${view === "completed"
                            ? "bg-themeElevated text-emerald-400 border-theme border-themeBorderStrong shadow-sm"
                            : "text-themeTextSec opacity-70 hover:text-themeText"
                            }`}
                    >
                        <i className="fa-solid fa-check-double text-[10px]"></i>
                        Completed ({completedAssignments.length})
                    </button>
                </div>
            </div>

            {/* ═══════════════ PENDING VIEW ═══════════════ */}
            {view === "pending" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 animate-fade-in">
                    {pendingAssignments.length === 0 ? (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-themeBorder rounded-themePanel bg-themeApp px-4">
                            <i className="fa-solid fa-mug-hot text-5xl text-neutral-700 mb-6"></i>
                            <h3 className={`${theme.text.heading} text-2xl text-themeText tracking-tight`}>You're all caught up!</h3>
                            <p className={`${theme.text.secondary} text-sm mt-2 max-w-sm`}>There are no pending assignments active for {userSession?.academic_batch || 'your batch'}.</p>
                        </div>
                    ) : (
                        pendingAssignments.map((task) => {
                            const timeLeft = getTimeLeft(task.due_date);

                            return (
                                <div key={task.id} className={`${theme.layout.panel} border-theme border-themeBorder rounded-themePanel hover:border-themeBorderStrong transition-all duration-300 overflow-hidden flex flex-col relative group`}>
                                    {timeLeft.urgent && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-amber-500"></div>}

                                    <div className="p-5 lg:p-6 flex-1 flex flex-col">
                                        <div className="flex items-center justify-between gap-3 mb-3">
                                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest truncate">{task.subject_name || 'Subject'}</span>
                                            <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest shrink-0 border-theme ${timeLeft.urgent
                                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                : 'bg-themePanel text-themeTextSec border-themeBorder'
                                                }`}>
                                                <i className={`fa-solid ${timeLeft.urgent ? 'fa-fire' : 'fa-clock'} mr-1`}></i> {timeLeft.label}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-black text-themeText tracking-tight leading-tight group-hover:text-indigo-400 transition-colors mb-2 line-clamp-2">
                                            {task.title}
                                        </h3>

                                        {task.description && (
                                            <p className="text-xs text-themeTextSec opacity-70 leading-relaxed mb-4 line-clamp-2">{task.description}</p>
                                        )}

                                        <div className="mt-auto flex flex-wrap items-center gap-3 text-[9px] font-bold text-themeTextSec uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5 bg-themeElevated px-2 py-1 border-theme border-themeBorder rounded">
                                                <i className="fa-solid fa-align-left text-indigo-400/50"></i> {task.word_limit ? `${task.word_limit} Words` : 'No Limit'}
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-themeElevated px-2 py-1 border-theme border-themeBorder rounded">
                                                <i className="fa-solid fa-award text-emerald-400/50"></i> {task.max_marks || 100} Marks
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 border-t-theme border-themeBorder bg-themePanel">
                                        <button
                                            onClick={() => openModal(task)}
                                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] py-3.5 rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20"
                                        >
                                            <i className="fa-solid fa-pen-nib mr-2"></i> Start Writing
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* ═══════════════ COMPLETED VIEW ═══════════════ */}
            {view === "completed" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 animate-fade-in">
                    {completedAssignments.length === 0 ? (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-themeBorder rounded-themePanel bg-themeApp px-4">
                            <i className="fa-solid fa-file-circle-check text-5xl text-neutral-700 mb-6"></i>
                            <h3 className={`${theme.text.heading} text-2xl text-themeText tracking-tight`}>No submissions yet</h3>
                            <p className={`${theme.text.secondary} text-sm mt-2`}>Your completed assignments will appear here.</p>
                        </div>
                    ) : (
                        completedAssignments.map((sub) => {
                            const task = sub.assignment;
                            const badge = getStatusBadge(sub.status);
                            const maxM = task.max_marks || 100;

                            return (
                                <div key={sub.id} className={`${theme.layout.panel} border-theme border-themeBorder rounded-themePanel flex flex-col relative`}>
                                    <div className="p-5 lg:p-6 flex-1 flex flex-col">
                                        <div className="flex items-center justify-between gap-3 mb-3">
                                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest truncate">{task.subject_name}</span>
                                            <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest shrink-0 border-theme ${badge.color}`}>
                                                <i className={`fa-solid ${badge.icon} mr-1`}></i> {badge.label}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-black text-themeText tracking-tight leading-tight mb-4">
                                            {task.title}
                                        </h3>

                                        {sub.status === 'Graded' && (
                                            <div className="mt-2 mb-4 bg-emerald-500/5 border-theme border-emerald-500/20 rounded-xl p-4 flex justify-between items-center">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500/70 mb-1">Marks Awarded</p>
                                                    <p className="text-2xl font-black text-emerald-400">{sub.marks_awarded} <span className="text-sm text-themeTextSec">/ {maxM}</span></p>
                                                </div>
                                                {sub.remarks && (
                                                    <div className="text-right max-w-[50%]">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec mb-1">Faculty Remarks</p>
                                                        <p className="text-xs text-themeText font-serif italic line-clamp-2">"{sub.remarks}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-auto flex flex-wrap items-center gap-3 text-[9px] font-bold text-themeTextSec uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5">
                                                <i className="fa-solid fa-clock-rotate-left"></i> Submitted {new Date(sub.submitted_at).toLocaleDateString('en-GB')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* ═══════════════ SUBMISSION MODAL ═══════════════ */}
            {selectedTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-themePanel border-theme border-themeBorder w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
                        
                        {/* Modal Header */}
                        <div className="p-5 border-b-theme border-themeBorder bg-themeElevated flex items-start justify-between gap-4 rounded-t-xl">
                            <div>
                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1 block">{selectedTask.subject_name}</span>
                                <h3 className="text-xl font-black text-themeText tracking-tight">{selectedTask.title}</h3>
                            </div>
                            <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full bg-themeApp text-themeTextSec hover:text-white transition-colors shrink-0">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 bg-themeApp">
                            {submitSuccess ? (
                                <div className="py-20 flex flex-col items-center justify-center text-center animate-scale-in">
                                    <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-4xl mb-4 border border-emerald-500/20">
                                        <i className="fa-solid fa-check-double"></i>
                                    </div>
                                    <h2 className="text-2xl font-black text-themeText tracking-tight mb-2">Submission Successful</h2>
                                    <p className="text-themeTextSec text-sm font-medium">Your work has been securely sent to the faculty.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmission} className="flex flex-col gap-5">
                                    <div className="bg-themeElevated p-4 rounded-lg border-theme border-themeBorder text-sm text-themeTextSec leading-relaxed">
                                        {selectedTask.description}
                                    </div>

                                    {submitError && (
                                        <div className="bg-rose-500/10 border-l-4 border-rose-500 p-3 text-rose-400 text-xs font-bold">
                                            {submitError}
                                        </div>
                                    )}

                                    <div className="flex flex-col">
                                        <div className="flex justify-between items-end mb-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-themeText">Write your submission</label>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${isOverLimit ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-themeElevated text-indigo-400 border-theme border-themeBorder'}`}>
                                                {wordCount} / {selectedTask.word_limit || '∞'} Words
                                            </span>
                                        </div>
                                        <textarea
                                            value={submissionText}
                                            onChange={(e) => setSubmissionText(e.target.value)}
                                            placeholder="Begin typing your assignment here..."
                                            className={`w-full h-64 bg-themeElevated border-theme ${isOverLimit ? 'border-rose-500 focus:border-rose-400' : 'border-themeBorderStrong focus:border-indigo-400'} rounded-lg p-4 text-sm text-themeText outline-none resize-none transition-colors font-serif`}
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t-theme border-themeBorder">
                                        <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-lg text-xs font-bold text-themeTextSec hover:bg-themeElevated transition-colors">
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={isSubmitting || isOverLimit || !submissionText.trim()}
                                            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-themeTextSec text-white font-black uppercase tracking-widest text-[10px] px-8 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            {isSubmitting ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Submitting...</> : <><i className="fa-solid fa-paper-plane"></i> Submit Final</>}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}