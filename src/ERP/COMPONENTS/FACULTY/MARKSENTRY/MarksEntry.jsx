/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

/* eslint-disable */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../CONTEXT/ErpContext";
import { supabase } from "../../../LIB/SUPABASE/supabaseClient";

// --- CACHE HELPERS ---
const CK = { courses: 'me_courses', roster: 'me_roster', marks: 'me_marks', assigns: 'me_assign_marks' };
const readCache = (key, fallback) => {
    try { const d = sessionStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
    catch { return fallback; }
};
const writeCache = (key, data) => {
    try { sessionStorage.setItem(key, JSON.stringify(data)); } catch {}
};

export default function MarksEntry() {
    const { userSession } = useERP();

    // --- STRICT PRODUCTION STATE ---
    const [mode, setMode] = useState("exams"); // 'exams' | 'assignments'

    const [facultyCourses, setFacultyCourses] = useState(() => readCache(CK.courses, []));
    const [activeCourse, setActiveCourse] = useState("");
    const [examType, setExamType] = useState("mid-term-1");

    const [rosterData, setRosterData] = useState(() => readCache(CK.roster, []));
    const [marksState, setMarksState] = useState({});
    const [lockedStudents, setLockedStudents] = useState({});

    // ASSIGNMENT MARKS STATE
    const [assignmentMarks, setAssignmentMarks] = useState(() => readCache(CK.assigns, []));

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [isAdminLocked, setIsAdminLocked] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Dynamic Max Marks Map ---
    const maxMarksMap = {
        "mid-term-1": 30,
        "mid-term-2": 30,
        "viva": 20
    };

    // --- 1. Fetch Faculty Courses (cached) ---
    useEffect(() => {
        if (!userSession?.db_id) return;
        const fetchCourses = async () => {
            try {
                const { data, error } = await supabase
                    .from('faculty_assignments')
                    .select('*')
                    .eq('faculty_id', userSession.db_id);

                if (error) throw error;
                if (data) {
                    setFacultyCourses(data);
                    writeCache(CK.courses, data);
                    if (data.length > 0 && !activeCourse) setActiveCourse(data[0].id);
                }
            } catch (err) {
                console.error("Failed to load faculty assignments:", err);
            }
        };
        fetchCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userSession]);

    // --- 2. Fetch Roster & Marks for Exams ---
    const fetchRosterAndMarks = useCallback(async () => {
        if (mode !== "exams" || !activeCourse || facultyCourses.length === 0) return;

        try {
            const courseObj = facultyCourses.find(c => c.id === activeCourse);
            if (!courseObj) return;

            const [studentsRes, marksRes] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('id, erp_id, full_name')
                    .eq('role', 'student')
                    .eq('academic_batch', courseObj.batch_id)
                    .order('erp_id', { ascending: true }),
                supabase
                    .from('student_marks')
                    .select('*')
                    .eq('subject_name', courseObj.subject_name)
                    .eq('exam_type', examType)
            ]);

            if (studentsRes.error) throw studentsRes.error;

            const students = studentsRes.data || [];
            setRosterData(students);
            writeCache(CK.roster, students);

            const studentIds = students.map(s => s.id);
            const existingMarks = (marksRes.data || []).filter(m => studentIds.includes(m.student_id));

            const initialMarks = {};
            const individualLocks = {};
            let lockedCount = 0;
            let hasAdminLock = false;

            students.forEach(student => {
                const foundMark = existingMarks.find(m => m.student_id === student.id);
                if (foundMark) {
                    initialMarks[student.id] = foundMark.marks_obtained ? foundMark.marks_obtained.toString() : "";
                    if (foundMark.status === 'locked') {
                        individualLocks[student.id] = true;
                        lockedCount++;
                    }
                    if (foundMark.admin_locked === true) {
                        hasAdminLock = true;
                    }
                } else {
                    initialMarks[student.id] = "";
                }
            });

            setMarksState(initialMarks);
            setLockedStudents(individualLocks);
            setIsLocked(students.length > 0 && lockedCount === students.length);
            setIsAdminLocked(hasAdminLock);
        } catch (err) {
            console.error("Failed to fetch roster/marks:", err);
        }
    }, [activeCourse, examType, facultyCourses, mode]);

    useEffect(() => { fetchRosterAndMarks(); }, [fetchRosterAndMarks]);

    // --- 3. Fetch Assignment Marks Ledger ---
    useEffect(() => {
        if (mode !== "assignments" || !userSession?.db_id) return;
        const fetchAssignmentMarks = async () => {
            try {
                // Fetching from the SQL view we created
                const { data, error } = await supabase
                    .from('student_marks_ledger')
                    .select('*')
                    .eq('faculty_id', userSession.db_id)
                    .order('batch_name', { ascending: true })
                    .order('course_name', { ascending: true })
                    .order('student_erp', { ascending: true });

                if (error) throw error;
                if (data) {
                    setAssignmentMarks(data);
                    writeCache(CK.assigns, data);
                }
            } catch (err) {
                console.error("Failed to load assignment ledger:", err);
            }
        };
        fetchAssignmentMarks();
    }, [mode, userSession]);

    // --- HANDLERS ---
    const handleMarkChange = (studentId, value) => {
        if (isAdminLocked || isLocked || lockedStudents[studentId]) return;
        const maxMark = maxMarksMap[examType];
        if (value === "" || (/^\d+$/.test(value) && parseInt(value, 10) <= maxMark)) {
            setMarksState(prev => ({ ...prev, [studentId]: value }));
        }
    };

    const handleSaveDraft = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            const courseObj = facultyCourses.find(c => c.id === activeCourse);
            const payload = rosterData
                .filter(student => marksState[student.id] !== "" && !lockedStudents[student.id])
                .map(student => ({
                    student_id: student.id,
                    faculty_id: userSession.db_id,
                    subject_name: courseObj.subject_name,
                    exam_type: examType,
                    marks_obtained: parseInt(marksState[student.id], 10),
                    max_marks: maxMarksMap[examType],
                    status: 'draft'
                }));

            if (payload.length === 0) { setIsSaving(false); return; }

            const { error } = await supabase.from('student_marks').upsert(payload, {
                onConflict: 'student_id, subject_name, exam_type'
            });
            if (error) throw error;

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2500);
        } catch (err) {
            console.error("Draft save failed:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLockSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const courseObj = facultyCourses.find(c => c.id === activeCourse);
            const payload = rosterData.map(student => ({
                student_id: student.id,
                faculty_id: userSession.db_id,
                subject_name: courseObj.subject_name,
                exam_type: examType,
                marks_obtained: parseInt(marksState[student.id] || 0, 10),
                max_marks: maxMarksMap[examType],
                status: 'locked'
            }));

            const { error } = await supabase.from('student_marks').upsert(payload, {
                onConflict: 'student_id, subject_name, exam_type'
            });
            if (error) throw error;

            const allLocked = {};
            rosterData.forEach(s => allLocked[s.id] = true);
            setLockedStudents(allLocked);
            setIsLocked(true);
            setShowLockModal(false);
        } catch (err) {
            console.error("Locking ledger failed:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Segregate Assignment Marks by Year (Batch) and Course
    const segregatedAssignments = useMemo(() => {
        if (!assignmentMarks.length) return {};
        const groups = {};
        assignmentMarks.forEach(record => {
            const yearKey = record.batch_name;
            const courseKey = record.course_name;
            if (!groups[yearKey]) groups[yearKey] = {};
            if (!groups[yearKey][courseKey]) groups[yearKey][courseKey] = [];
            groups[yearKey][courseKey].push(record);
        });
        return groups;
    }, [assignmentMarks]);

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in selection:bg-themeElevated">

            {/* HEADER */}
            <div className="bg-themeElevated rounded-themePanel p-6 lg:p-8 relative overflow-hidden border-theme border-themeBorder text-themeText flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-themeElevated">
                <div className="absolute top-0 right-0 w-64 h-64 lg:w-96 lg:h-96 bg-themePanel/20 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-medal text-rose-500 text-2xl lg:text-3xl"></i>
                    </div>
                    <div>
                        <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-themeText mb-1`}>Marks Ledger</h1>
                        <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium`}>Officially record grades for manual exams and view Assignment marks securely.</p>
                    </div>
                </div>

                {mode === "exams" && (
                    <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <div className="flex-1 lg:w-64">
                            <label className={`block text-[9px] font-black uppercase tracking-widest text-rose-500 mb-1`}>Course/Batch</label>
                            <select
                                value={activeCourse} onChange={e => setActiveCourse(e.target.value)}
                                className="w-full bg-themeApp border-theme border-themeBorderStrong text-themeText rounded-themePanel px-4 py-3 text-xs font-bold outline-none cursor-pointer"
                            >
                                {facultyCourses.map(c => <option key={c.id} value={c.id}>{c.subject_name} ({c.batch_id})</option>)}
                            </select>
                        </div>
                        <div className="flex-1 lg:w-48">
                            <label className={`block text-[9px] font-black uppercase tracking-widest text-rose-500 mb-1`}>Exam Type</label>
                            <select
                                value={examType} onChange={e => setExamType(e.target.value)}
                                className="w-full bg-themeApp border-theme border-themeBorderStrong text-themeText rounded-themePanel px-4 py-3 text-xs font-bold outline-none cursor-pointer"
                            >
                                <option value="mid-term-1">Mid-Term I (30)</option>
                                <option value="mid-term-2">Mid-Term II (30)</option>
                                <option value="viva">Viva-Voce (20)</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex bg-themeElevated p-1.5 rounded-xl border-theme border-themeBorder w-fit relative z-10">
                <button 
                    onClick={() => setMode("exams")} 
                    className={`px-6 py-2.5 rounded-lg text-xs lg:text-sm font-black uppercase tracking-widest transition-all ${mode === 'exams' ? 'bg-rose-500 text-white shadow-lg' : 'text-themeTextSec hover:text-themeText'}`}
                >
                    <i className="fa-solid fa-pen-ruler mr-2"></i> Manual Exams
                </button>
                <button 
                    onClick={() => setMode("assignments")} 
                    className={`px-6 py-2.5 rounded-lg text-xs lg:text-sm font-black uppercase tracking-widest transition-all ${mode === 'assignments' ? 'bg-indigo-500 text-white shadow-lg' : 'text-themeTextSec hover:text-themeText'}`}
                >
                    <i className="fa-solid fa-file-pen mr-2"></i> Assignment Grades
                </button>
            </div>

            {/* EXAM VIEW */}
            {mode === "exams" && (
                <div className="flex flex-col gap-6">
                    {isAdminLocked && (
                        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-5 flex items-center gap-4 animate-fade-in shadow-lg">
                            <div className="w-10 h-10 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center text-lg shrink-0 border border-rose-500/30">
                                <i className="fa-solid fa-lock"></i>
                            </div>
                            <div>
                                <h3 className="text-rose-500 font-black tracking-widest text-sm uppercase mb-1">Ledger Locked by Admin</h3>
                                <p className="text-rose-400 text-xs font-medium">This ledger has been finalized by the Controller of Examinations and can no longer be modified.</p>
                            </div>
                        </div>
                    )}

                    <div className={`${theme.layout.panel} rounded-themePanel overflow-hidden border-theme border-themeBorder animate-fade-in`}>
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-themePanel border-b-theme border-themeBorder">
                                    <th className={`p-4 lg:p-5 pl-6 lg:pl-8 text-[10px] font-black text-themeTextSec uppercase tracking-widest w-24`}>Enrollment</th>
                                    <th className={`p-4 lg:p-5 text-[10px] font-black text-themeTextSec uppercase tracking-widest`}>Student Name</th>
                                    <th className={`p-4 lg:p-5 text-[10px] font-black text-themeTextSec uppercase tracking-widest text-center w-48`}>Marks (/{maxMarksMap[examType]})</th>
                                    <th className={`p-4 lg:p-5 pr-6 lg:pr-8 text-[10px] font-black text-themeTextSec uppercase tracking-widest text-right w-32`}>Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/50">
                                {rosterData.map(student => {
                                    const isStudLocked = isAdminLocked || isLocked || lockedStudents[student.id];
                                    return (
                                        <tr key={student.id} className="hover:bg-themeElevated transition-colors group">
                                            <td className="p-4 pl-6 text-xs font-bold text-themeTextSec">{student.erp_id}</td>
                                            <td className="p-4 text-sm font-black text-themeText">{student.full_name}</td>
                                            <td className="p-4 text-center">
                                                <input 
                                                    type="text" value={marksState[student.id] || ""}
                                                    onChange={e => handleMarkChange(student.id, e.target.value)}
                                                    disabled={isStudLocked}
                                                    placeholder="-"
                                                    className={`w-20 text-center font-black text-sm lg:text-base py-2 rounded-lg outline-none transition-colors border-2 ${isStudLocked ? `bg-themeElevated ${isAdminLocked ? 'text-rose-400' : 'text-emerald-400'} border-transparent cursor-not-allowed` : 'bg-themeApp text-themeText border-themeBorderStrong focus:border-rose-500'}`}
                                                />
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                {isAdminLocked ? (
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg" title="Published by the COE"><i className="fa-solid fa-lock"></i> Published</span>
                                                ) : isStudLocked ? (
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg" title="Submitted for Approval"><i className="fa-solid fa-lock"></i> Faculty Locked</span>
                                                ) : marksState[student.id] !== "" ? (
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg">Draft</span>
                                                ) : (
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec bg-themePanel border border-themeBorder px-3 py-1.5 rounded-lg">Pending</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ASSIGNMENT VIEW */}
            {mode === "assignments" && (
                <div className="flex flex-col gap-8 animate-fade-in">
                    {Object.keys(segregatedAssignments).length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-themeBorder rounded-themePanel bg-themeApp px-4">
                            <i className="fa-solid fa-file-invoice text-5xl text-neutral-700 mb-6"></i>
                            <h3 className={`${theme.text.heading} text-2xl text-themeText tracking-tight`}>No Assignment Grades Found</h3>
                            <p className={`${theme.text.secondary} text-sm mt-2 max-w-sm`}>You have not graded any assignments yet.</p>
                        </div>
                    ) : (
                        Object.keys(segregatedAssignments).map(year => (
                            <div key={year} className="flex flex-col gap-4">
                                <h2 className="text-xl font-black text-themeText tracking-tight border-b-theme border-themeBorder pb-2">{year}</h2>
                                <div className="grid grid-cols-1 gap-6">
                                    {Object.keys(segregatedAssignments[year]).map(course => (
                                        <div key={course} className={`${theme.layout.panel} border-theme border-themeBorder rounded-themePanel overflow-hidden`}>
                                            <div className="bg-themeElevated p-4 border-b-theme border-themeBorder">
                                                <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest">{course}</h3>
                                            </div>
                                            <div className="overflow-x-auto no-scrollbar">
                                                <table className="w-full text-left border-collapse min-w-[600px]">
                                                    <thead>
                                                        <tr className="bg-themePanel border-b-theme border-themeBorder">
                                                            <th className="p-4 text-[10px] font-black text-themeTextSec uppercase tracking-widest">Enrollment</th>
                                                            <th className="p-4 text-[10px] font-black text-themeTextSec uppercase tracking-widest">Student</th>
                                                            <th className="p-4 text-[10px] font-black text-themeTextSec uppercase tracking-widest">Assignment Title</th>
                                                            <th className="p-4 text-[10px] font-black text-themeTextSec uppercase tracking-widest text-right">Marks Awarded</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-neutral-800/50">
                                                        {segregatedAssignments[year][course].map(record => (
                                                            <tr key={record.submission_id} className="hover:bg-themeElevated transition-colors">
                                                                <td className="p-4 text-xs font-bold text-themeTextSec">{record.student_erp}</td>
                                                                <td className="p-4 text-sm font-black text-themeText">{record.student_name}</td>
                                                                <td className="p-4 text-xs font-bold text-themeText">{record.assignment_title}</td>
                                                                <td className="p-4 text-right">
                                                                    <span className="text-xs font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-lg">
                                                                        {record.marks_awarded} / {record.max_marks}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* STICKY ACTION BAR (For Exams Only) */}
            {mode === "exams" && rosterData.length > 0 && !isLocked && !isAdminLocked && (
                <div className="fixed bottom-0 left-0 lg:left-[280px] right-0 p-4 lg:p-6 bg-themeApp border-t-theme border-themeBorder flex justify-end gap-4 z-40 lg:z-30 pb-safe">
                    <button 
                        onClick={handleSaveDraft} disabled={isSaving}
                        className="px-6 py-3.5 rounded-themePanel text-xs font-black uppercase tracking-widest bg-themeElevated border-theme border-themeBorderStrong text-themeText hover:bg-themePanel transition-all active:scale-95"
                    >
                        {isSaving ? 'Saving...' : saveSuccess ? 'Draft Saved!' : 'Save Progress'}
                    </button>
                    <button 
                        onClick={() => setShowLockModal(true)}
                        className="px-8 py-3.5 rounded-themePanel text-xs font-black uppercase tracking-widest bg-rose-600 text-white hover:bg-rose-500 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <i className="fa-solid fa-lock"></i> Finalize & Lock
                    </button>
                </div>
            )}

            {/* LOCK MODAL */}
            {showLockModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-themePanel border-theme border-rose-500/30 w-full max-w-md rounded-xl p-8 flex flex-col items-center text-center shadow-2xl">
                        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center text-3xl mb-6 border border-rose-500/20">
                            <i className="fa-solid fa-triangle-exclamation"></i>
                        </div>
                        <h2 className="text-2xl font-black text-themeText tracking-tight mb-2">Finalize Ledger?</h2>
                        <p className="text-themeTextSec text-sm leading-relaxed mb-8">
                            This action is irreversible. Once locked, marks will be instantly published to students and sent to the Controller of Examinations.
                        </p>
                        <div className="flex w-full gap-4">
                            <button onClick={() => setShowLockModal(false)} className="flex-1 py-3.5 rounded-lg text-xs font-black uppercase tracking-widest bg-themeElevated text-themeText hover:bg-themeApp transition-colors border-theme border-themeBorderStrong">
                                Cancel
                            </button>
                            <button onClick={handleLockSubmit} disabled={isSubmitting} className="flex-1 py-3.5 rounded-lg text-xs font-black uppercase tracking-widest bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-lg shadow-rose-500/20">
                                {isSubmitting ? 'Locking...' : 'Yes, Lock Ledger'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}