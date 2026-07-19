import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../context/ErpContext";
import { supabase } from "../../../LIB/supabase/supabaseClient";

// Helper for SessionStorage
const getCachedData = (key, fallback) => {
    try {
        const cached = sessionStorage.getItem(key);
        return cached ? JSON.parse(cached) : fallback;
    } catch (e) {
        return fallback;
    }
};

const setCachedData = (key, data) => {
    try {
        sessionStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
};

export default function FacultyAssignments() {
    const { userSession } = useERP();

    // --- STRICT PRODUCTION STATE WITH CACHING ---
    const [facultyCourses, setFacultyCourses] = useState(() => getCachedData('fac_courses_v2_cache', []));
    const [activeCourse, setActiveCourse] = useState(() => getCachedData('fac_active_course_v2_cache', ""));
    const [enrolledStudents, setEnrolledStudents] = useState(() => getCachedData('fac_enrolled_v2_cache', []));

    // UI Navigation
    const [activeView, setActiveView] = useState("create"); // 'create' | 'grade'

    // --- 1. CREATION ENGINE STATE ---
    const [assignTitle, setAssignTitle] = useState("");
    const [assignDesc, setAssignDesc] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [wordLimit, setWordLimit] = useState(1000);
    const [maxMarks, setMaxMarks] = useState(100);
    
    const [assignType, setAssignType] = useState("individual"); 
    const [targetAudience, setTargetAudience] = useState("all"); 
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishSuccess, setPublishSuccess] = useState(false);

    // --- 2. GRADING HUB STATE ---
    const [courseAssignments, setCourseAssignments] = useState(() => getCachedData('fac_assigns_v2_cache', []));
    const [activeGradingAssignment, setActiveGradingAssignment] = useState(() => getCachedData('fac_active_grading_v2_cache', ""));
    const [submissions, setSubmissions] = useState(() => getCachedData('fac_subs_v2_cache', []));
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [marksInput, setMarksInput] = useState("");
    const [remarksInput, setRemarksInput] = useState("");
    const [isGrading, setIsGrading] = useState(false);

    // --- DATA BRIDGES ---

    // A. Fetch Faculty's Assigned Courses Directly from Timetable
    useEffect(() => {
        if (!userSession?.db_id) return;
        const fetchAssignments = async () => {
            try {
                // Official synchronization with Timetable engine
                const { data, error } = await supabase
                    .from('timetable')
                    .select('*, subjects(name, code)')
                    .eq('faculty_id', userSession.db_id);

                if (error) throw error;
                
                // Deduplicate subjects by batch so faculty doesn't see multiple of the same
                const uniqueCoursesMap = new Map();
                data?.forEach(cls => {
                    const key = `${cls.batch_id}_${cls.subject_id}`;
                    if (!uniqueCoursesMap.has(key)) {
                        uniqueCoursesMap.set(key, cls);
                    }
                });
                
                const uniqueCourses = Array.from(uniqueCoursesMap.values());
                
                setFacultyCourses(uniqueCourses);
                setCachedData('fac_courses_v2_cache', uniqueCourses);
                if (uniqueCourses.length > 0) {
                    if (!activeCourse || !uniqueCourses.find(c => c.id === activeCourse)) {
                        setActiveCourse(uniqueCourses[0].id);
                        setCachedData('fac_active_course_v2_cache', uniqueCourses[0].id);
                    }
                }
            } catch (err) {
                console.error("Failed to load courses:", err);
            }
        };
        fetchAssignments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userSession]);

    // B. Fetch Target Students & Assignments
    useEffect(() => {
        if (!activeCourse) return;
        setCachedData('fac_active_course_v2_cache', activeCourse);

        const loadCourseData = async () => {
            try {
                const targetClass = facultyCourses.find(c => c.id === activeCourse);
                if (!targetClass) return;

                const [studentsRes, assignmentsRes] = await Promise.all([
                    supabase
                        .from('profiles')
                        .select('id, erp_id, full_name')
                        .eq('role', 'student')
                        .eq('academic_batch', targetClass.batch_id),
                    supabase
                        .from('assignments')
                        .select('*')
                        .eq('faculty_id', userSession.db_id)
                        .eq('batch_id', targetClass.batch_id)
                        .eq('subject_id', targetClass.subject_id)
                        .order('created_at', { ascending: false })
                ]);

                if (studentsRes.error) throw studentsRes.error;
                setEnrolledStudents(studentsRes.data || []);
                setCachedData('fac_enrolled_v2_cache', studentsRes.data || []);

                if (assignmentsRes.error) throw assignmentsRes.error;
                setCourseAssignments(assignmentsRes.data || []);
                setCachedData('fac_assigns_v2_cache', assignmentsRes.data || []);

                if (assignmentsRes.data && assignmentsRes.data.length > 0) {
                    if (!activeGradingAssignment || !assignmentsRes.data.find(a => a.id === activeGradingAssignment)) {
                        setActiveGradingAssignment(assignmentsRes.data[0].id);
                        setCachedData('fac_active_grading_v2_cache', assignmentsRes.data[0].id);
                    }
                } else {
                    setActiveGradingAssignment("");
                    setCachedData('fac_active_grading_v2_cache', "");
                    setSubmissions([]);
                    setCachedData('fac_subs_v2_cache', []);
                }
            } catch (error) {
                console.error("Failed to load course data:", error);
            }
        };
        loadCourseData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCourse, facultyCourses, userSession]);

    // C. Fetch Submissions for Grading
    useEffect(() => {
        if (!activeGradingAssignment) {
            setSubmissions([]);
            setCachedData('fac_subs_v2_cache', []);
            return;
        }
        setCachedData('fac_active_grading_v2_cache', activeGradingAssignment);

        const fetchSubmissions = async () => {
            try {
                const { data, error } = await supabase
                    .from('assignment_submissions')
                    .select('*, student:profiles!student_id(full_name, erp_id)')
                    .eq('assignment_id', activeGradingAssignment)
                    .order('submitted_at', { ascending: false });

                if (error) throw error;
                setSubmissions(data || []);
                setCachedData('fac_subs_v2_cache', data || []);
            } catch (error) {
                console.error("Failed to fetch submissions:", error);
            }
        };
        fetchSubmissions();
    }, [activeGradingAssignment]);

    // --- HANDLERS ---
    const handleStudentToggle = (erp_id) => {
        setSelectedStudents(prev =>
            prev.includes(erp_id) ? prev.filter(id => id !== erp_id) : [...prev, erp_id]
        );
    };

    const handlePublishAssignment = async (e) => {
        e.preventDefault();
        setIsPublishing(true);

        try {
            const targetClass = facultyCourses.find(c => c.id === activeCourse);

            const payload = {
                faculty_id: userSession.db_id,
                batch_id: targetClass.batch_id,
                subject_name: targetClass.subjects?.name,
                subject_id: targetClass.subject_id,
                title: assignTitle,
                description: assignDesc,
                due_date: dueDate,
                word_limit: parseInt(wordLimit),
                max_marks: parseInt(maxMarks),
                submission_type: assignType,
                target_audience: targetAudience,
                target_students: targetAudience === 'manual' ? selectedStudents : null
            };

            const { data, error } = await supabase.from('assignments').insert(payload).select();
            if (error) throw error;

            setPublishSuccess(true);
            setAssignTitle(""); setAssignDesc(""); setDueDate(""); setWordLimit(1000); setMaxMarks(100);

            if (data && data.length > 0) {
                const newAssignments = [data[0], ...courseAssignments];
                setCourseAssignments(newAssignments);
                setCachedData('fac_assigns_v2_cache', newAssignments);
                
                if (!activeGradingAssignment) {
                    setActiveGradingAssignment(data[0].id);
                    setCachedData('fac_active_grading_v2_cache', data[0].id);
                }
            }

            setTimeout(() => setPublishSuccess(false), 3000);
            setActiveView("grade");

        } catch (error) {
            console.error("Failed to publish:", error);
            window.erpDialog.alert("Failed to publish assignment.");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleSubmitGrade = async (e) => {
        e.preventDefault();
        if (!selectedSubmission) return;

        const maxM = courseAssignments.find(a => a.id === activeGradingAssignment)?.max_marks || 100;
        if(parseFloat(marksInput) > maxM) {
            window.erpDialog.alert(`Marks cannot exceed ${maxM}`);
            return;
        }

        setIsGrading(true);
        try {
            const { error } = await supabase
                .from('assignment_submissions')
                .update({
                    status: 'Graded',
                    marks_awarded: parseFloat(marksInput),
                    remarks: remarksInput
                })
                .eq('id', selectedSubmission.id);

            if (error) throw error;

            // Instant Local Sync
            const updatedSubmissions = submissions.map(sub => 
                sub.id === selectedSubmission.id 
                    ? { ...sub, status: 'Graded', marks_awarded: parseFloat(marksInput), remarks: remarksInput }
                    : sub
            );
            setSubmissions(updatedSubmissions);
            setCachedData('fac_subs_v2_cache', updatedSubmissions);
            setSelectedSubmission(null);
            setMarksInput("");
            setRemarksInput("");

        } catch (error) {
            console.error("Failed to grade:", error);
            window.erpDialog.alert("Failed to save grades.");
        } finally {
            setIsGrading(false);
        }
    };

    const activeAssignmentDetails = courseAssignments.find(a => a.id === activeGradingAssignment);
    const isLocked = activeAssignmentDetails?.admin_locked === true;

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in selection:bg-themeElevated">

            {/* MASTER HEADER */}
            <div className="bg-themeElevated rounded-themePanel p-6 lg:p-8 relative overflow-hidden border-theme border-themeBorder text-themeText flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-themeElevated">
                <div className="absolute top-0 right-0 w-64 h-64 bg-themeElevated rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                <div className="relative z-10 w-full lg:w-auto flex-1">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-file-pen text-indigo-400 text-2xl lg:text-3xl"></i>
                        </div>
                        <div>
                            <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-themeText mb-1`}>Assignments Engine</h1>
                            <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium`}>Publish strict assignments and correct them directly in the portal.</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 w-full lg:w-auto min-w-[300px]">
                    <label className={`block text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1.5 ml-1`}>Official Timetable Course</label>
                    <div className="relative">
                        <select
                            value={activeCourse}
                            onChange={(e) => setActiveCourse(e.target.value)}
                            disabled={facultyCourses.length === 0}
                            className="w-full bg-themeApp border-theme border-themeBorderStrong text-themeText rounded-themePanel px-4 py-3.5 text-xs lg:text-sm font-bold outline-none cursor-pointer focus:border-indigo-400 transition-colors"
                        >
                            {facultyCourses.length === 0 ? (
                                <option value="">No Active Courses</option>
                            ) : (
                                facultyCourses.map(cls => (
                                    <option key={cls.id} value={cls.id} className="bg-themePanel">
                                        {cls.batch_id} - {cls.subjects?.name}
                                    </option>
                                ))
                            )}
                        </select>
                        <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec opacity-70 pointer-events-none"></i>
                    </div>
                </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex bg-themeElevated p-1.5 rounded-xl border-theme border-themeBorder w-fit relative z-10">
                <button 
                    onClick={() => setActiveView("create")} 
                    className={`px-6 py-2.5 rounded-lg text-xs lg:text-sm font-black uppercase tracking-widest transition-all ${activeView === 'create' ? 'bg-indigo-500 text-white shadow-lg' : 'text-themeTextSec hover:text-themeText'}`}
                >
                    <i className="fa-solid fa-plus mr-2"></i> Create Assignment
                </button>
                <button 
                    onClick={() => setActiveView("grade")} 
                    className={`px-6 py-2.5 rounded-lg text-xs lg:text-sm font-black uppercase tracking-widest transition-all ${activeView === 'grade' ? 'bg-emerald-500 text-neutral-900 shadow-lg' : 'text-themeTextSec hover:text-themeText'}`}
                >
                    <i className="fa-solid fa-check-double mr-2"></i> Correcting Hub
                </button>
            </div>

            {/* VIEW: CREATE */}
            {activeView === "create" && (
                <div className={`${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-6 lg:p-8 animate-fade-in`}>
                    {publishSuccess ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center animate-scale-in">
                            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-4xl mb-4 border border-emerald-500/20">
                                <i className="fa-solid fa-check"></i>
                            </div>
                            <h2 className="text-2xl font-black text-themeText tracking-tight mb-2">Assignment Deployed</h2>
                            <p className="text-themeTextSec text-sm font-medium">Students have been instantly notified in their portal.</p>
                        </div>
                    ) : (
                        <form onSubmit={handlePublishAssignment} className="flex flex-col gap-6 max-w-3xl">
                            <div>
                                <label className={`block text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-2`}>Assignment Title</label>
                                <input 
                                    type="text" required value={assignTitle} onChange={e => setAssignTitle(e.target.value)}
                                    placeholder="e.g. Constitutional Law Research Paper"
                                    className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-lg px-4 py-3.5 text-sm font-bold text-themeText focus:border-indigo-400 outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className={`block text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-2`}>Detailed Brief & Instructions</label>
                                <textarea 
                                    required value={assignDesc} onChange={e => setAssignDesc(e.target.value)}
                                    placeholder="Provide exact guidelines, formatting rules, and expectations..."
                                    className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-lg px-4 py-3.5 text-sm text-themeText focus:border-indigo-400 outline-none transition-colors h-32 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className={`block text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-2`}>Strict Due Date</label>
                                    <input 
                                        type="datetime-local" required value={dueDate} onChange={e => setDueDate(e.target.value)}
                                        className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-lg px-4 py-3.5 text-sm font-bold text-themeText focus:border-indigo-400 outline-none transition-colors dark:[color-scheme:dark]"
                                    />
                                </div>
                                <div>
                                    <label className={`block text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-2`}>Word Limit (Strict)</label>
                                    <input 
                                        type="number" required value={wordLimit} onChange={e => setWordLimit(e.target.value)} min="100" max="10000"
                                        className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-lg px-4 py-3.5 text-sm font-bold text-themeText focus:border-indigo-400 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className={`block text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-2`}>Maximum Marks</label>
                                    <input 
                                        type="number" required value={maxMarks} onChange={e => setMaxMarks(e.target.value)} min="1" max="100"
                                        className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-lg px-4 py-3.5 text-sm font-bold text-themeText focus:border-indigo-400 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={`block text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-2`}>Assignment Type</label>
                                    <select value={assignType} onChange={e => setAssignType(e.target.value)} className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-lg px-4 py-3.5 text-sm font-bold text-themeText focus:border-indigo-400 outline-none transition-colors">
                                        <option value="individual">Individual Submission</option>
                                        <option value="group">Group Project</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-2`}>Target Audience</label>
                                    <select value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-lg px-4 py-3.5 text-sm font-bold text-themeText focus:border-indigo-400 outline-none transition-colors">
                                        <option value="all">Entire Class</option>
                                        <option value="manual">Specific Students</option>
                                    </select>
                                </div>
                            </div>

                            {targetAudience === 'manual' && (
                                <div className="bg-themeElevated p-4 rounded-lg border-theme border-themeBorderStrong max-h-48 overflow-y-auto">
                                    <label className={`block text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-2`}>Select Students</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {enrolledStudents.map(student => (
                                            <label key={student.erp_id} className="flex items-center gap-3 cursor-pointer text-sm text-themeText p-2 hover:bg-themePanel rounded">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedStudents.includes(student.erp_id)}
                                                    onChange={() => handleStudentToggle(student.erp_id)}
                                                    className="w-4 h-4 rounded border-themeBorder focus:ring-indigo-500 bg-themeApp"
                                                />
                                                <span className="font-medium">{student.full_name} <span className="text-themeTextSec text-xs ml-1">({student.erp_id})</span></span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button 
                                type="submit" disabled={isPublishing || !activeCourse}
                                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs py-4 rounded-themePanel transition-colors flex items-center justify-center gap-2"
                            >
                                {isPublishing ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Deploying...</> : <><i className="fa-solid fa-paper-plane"></i> Publish Assignment</>}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* VIEW: GRADING */}
            {activeView === "grade" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 animate-fade-in">
                    
                    {/* LEFT SIDEBAR: Submissions List */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        <div className="bg-themePanel border-theme border-themeBorderStrong p-2 rounded-xl">
                            <select 
                                value={activeGradingAssignment} 
                                onChange={e => setActiveGradingAssignment(e.target.value)}
                                className="w-full bg-themeElevated border-none text-themeText text-sm font-bold px-3 py-2.5 rounded-lg focus:outline-none"
                            >
                                {courseAssignments.length === 0 ? <option value="">No Assignments Published</option> :
                                    courseAssignments.map(a => <option key={a.id} value={a.id}>{a.title} {a.admin_locked ? '(LOCKED)' : ''}</option>)
                                }
                            </select>
                        </div>

                        <div className="bg-themePanel border-theme border-themeBorder rounded-themePanel flex flex-col overflow-hidden shadow-sm h-[600px]">
                            <div className="p-4 border-b-theme border-themeBorder bg-themeElevated">
                                <h3 className="text-xs font-black text-themeText uppercase tracking-widest">Inbox</h3>
                            </div>
                            <div className="overflow-y-auto flex-1 p-2 space-y-1">
                                {submissions.length === 0 ? (
                                    <div className="p-8 text-center text-themeTextSec text-xs font-bold uppercase">No submissions yet</div>
                                ) : (
                                    submissions.map(sub => (
                                        <div 
                                            key={sub.id} 
                                            onClick={() => setSelectedSubmission(sub)}
                                            className={`p-3 rounded-lg cursor-pointer transition-all border border-transparent flex justify-between items-center ${selectedSubmission?.id === sub.id ? 'bg-indigo-500/10 border-indigo-500/30' : 'hover:bg-themeElevated'}`}
                                        >
                                            <div>
                                                <p className={`text-sm font-bold ${selectedSubmission?.id === sub.id ? 'text-indigo-400' : 'text-themeText'}`}>{sub.student?.full_name}</p>
                                                <p className="text-[10px] text-themeTextSec">{sub.student?.erp_id}</p>
                                            </div>
                                            <div>
                                                {sub.status === 'Graded' ? (
                                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-[9px] font-black uppercase">{sub.marks_awarded} Marks</span>
                                                ) : (
                                                    <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 rounded text-[9px] font-black uppercase">Pending</span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Correction & Grading Workspace */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {selectedSubmission ? (
                            <div className="bg-themePanel border-theme border-themeBorder rounded-themePanel overflow-hidden flex flex-col shadow-sm h-[600px]">
                                <div className="p-5 border-b-theme border-themeBorder bg-themeElevated flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-black text-themeText tracking-tight">{selectedSubmission.student?.full_name}</h3>
                                        <p className="text-[10px] text-themeTextSec uppercase tracking-widest font-bold">Submitted on {new Date(selectedSubmission.submitted_at).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black uppercase text-themeTextSec bg-themeApp px-3 py-1.5 rounded-lg border-theme border-themeBorderStrong">{selectedSubmission.submission_text?.split(/\s+/).filter(Boolean).length || 0} Words</span>
                                    </div>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-white dark:bg-neutral-900/50">
                                    <p className="text-sm lg:text-base leading-relaxed text-neutral-800 dark:text-neutral-300 font-serif whitespace-pre-wrap">
                                        {selectedSubmission.submission_text}
                                    </p>
                                </div>

                                {isLocked ? (
                                    <div className="p-5 border-t-theme border-themeBorder bg-rose-500/10 flex flex-col items-center justify-center gap-2">
                                        <i className="fa-solid fa-lock text-rose-500 text-xl"></i>
                                        <p className="text-sm font-black text-rose-500 uppercase tracking-widest">Locked by Controller of Examinations</p>
                                        <p className="text-[10px] font-bold text-rose-400">Grading for this assignment has been finalised.</p>
                                    </div>
                                ) : (
                                    <div className="p-5 border-t-theme border-themeBorder bg-themeElevated">
                                        <form onSubmit={handleSubmitGrade} className="flex gap-4">
                                            <div className="w-32">
                                                <label className="block text-[9px] font-black uppercase tracking-widest text-themeTextSec mb-1">Marks (/{activeAssignmentDetails?.max_marks || 100})</label>
                                                <input 
                                                    type="number" required step="0.5" min="0" max={activeAssignmentDetails?.max_marks || 100}
                                                    value={marksInput} onChange={e => setMarksInput(e.target.value)}
                                                    className="w-full bg-themeApp border-theme border-themeBorderStrong rounded text-sm font-black text-themeText px-3 py-2.5 focus:border-emerald-400 outline-none"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[9px] font-black uppercase tracking-widest text-themeTextSec mb-1">Faculty Remarks</label>
                                                <input 
                                                    type="text" required value={remarksInput} onChange={e => setRemarksInput(e.target.value)}
                                                    placeholder="Excellent logic, but missed citations..."
                                                    className="w-full bg-themeApp border-theme border-themeBorderStrong rounded text-sm text-themeText px-4 py-2.5 focus:border-emerald-400 outline-none"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <button 
                                                    type="submit" disabled={isGrading}
                                                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-[#0a0a0a] font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded transition-colors h-11"
                                                >
                                                    {isGrading ? 'Saving...' : 'Award Marks'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-themePanel border-theme border-themeBorder rounded-themePanel h-[600px] flex flex-col items-center justify-center text-center p-8">
                                <i className="fa-solid fa-file-signature text-6xl text-themeBorderStrong mb-6"></i>
                                <h2 className="text-xl font-black text-themeText tracking-tight mb-2">Select a Submission</h2>
                                <p className="text-sm text-themeTextSec">Choose a student from the inbox to read their paper and award marks.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}