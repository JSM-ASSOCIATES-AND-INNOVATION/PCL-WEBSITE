import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../context/ErpContext";
import { supabase } from "../../../lib/supabase/supabaseClient";

// Zero-lag cache keys
const CACHE_KEY_COURSES = "faculty_materials_courses_v2";
const CACHE_KEY_MODULES = "faculty_materials_modules_v2";
const CACHE_KEY_MATERIALS = "faculty_materials_files_v2";

export default function CourseMaterials() {
    const { userSession } = useERP();

    // Cache initializers
    const [facultyCourses, setFacultyCourses] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem(CACHE_KEY_COURSES)) || []; } catch { return []; }
    });
    
    const [activeCourseId, setActiveCourseId] = useState(() => {
        try { 
            const cachedCourses = JSON.parse(sessionStorage.getItem(CACHE_KEY_COURSES)) || [];
            return cachedCourses.length > 0 ? cachedCourses[0].id : "";
        } catch { return ""; }
    });
    
    const [modulesBySubject, setModulesBySubject] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem(CACHE_KEY_MODULES)) || {}; } catch { return {}; }
    });

    const [materialsBySubject, setMaterialsBySubject] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem(CACHE_KEY_MATERIALS)) || {}; } catch { return {}; }
    });

    const [editingModule, setEditingModule] = useState(null);
    const [facultyContent, setFacultyContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Initial Fetch
    const fetchData = async () => {
        if (!userSession?.db_id) return;
        try {
            // 1. Fetch Assigned Subjects from Timetable
            const { data: scheduleData, error: scheduleError } = await supabase
                .from('timetable')
                .select('subject_id, subjects(name, code)')
                .eq('faculty_id', userSession.db_id);

            if (scheduleError) throw scheduleError;

            // Deduplicate subjects
            const uniqueSubjects = [];
            const seen = new Set();
            (scheduleData || []).forEach(item => {
                if (item.subject_id && !seen.has(item.subject_id) && item.subjects) {
                    seen.add(item.subject_id);
                    uniqueSubjects.push({
                        id: item.subject_id,
                        subject_name: item.subjects.name,
                        subject_code: item.subjects.code
                    });
                }
            });

            setFacultyCourses(uniqueSubjects);
            sessionStorage.setItem(CACHE_KEY_COURSES, JSON.stringify(uniqueSubjects));

            if (uniqueSubjects.length > 0 && (!activeCourseId || !uniqueSubjects.find(s => s.id === activeCourseId))) {
                setActiveCourseId(uniqueSubjects[0].id);
            }

            // 2. Fetch Modules & Materials
            const subjectIds = uniqueSubjects.map(c => c.id);
            if (subjectIds.length > 0) {
                const [modulesRes, materialsRes] = await Promise.all([
                    supabase.from('course_modules').select('*').in('subject_id', subjectIds),
                    supabase.from('course_materials').select('*').in('subject_id', subjectIds).order('created_at', { ascending: false })
                ]);
                
                if (modulesRes.error) throw modulesRes.error;
                if (materialsRes.error) throw materialsRes.error;

                // Group modules
                const groupedMods = {};
                (modulesRes.data || []).forEach(mod => {
                    if (!groupedMods[mod.subject_id]) groupedMods[mod.subject_id] = [];
                    groupedMods[mod.subject_id].push(mod);
                });
                for (const key in groupedMods) {
                    groupedMods[key].sort((a, b) => (a.module_order || a.id) - (b.module_order || b.id));
                }
                setModulesBySubject(groupedMods);
                sessionStorage.setItem(CACHE_KEY_MODULES, JSON.stringify(groupedMods));

                // Group materials
                const groupedMats = {};
                (materialsRes.data || []).forEach(mat => {
                    if (!groupedMats[mat.subject_id]) groupedMats[mat.subject_id] = [];
                    groupedMats[mat.subject_id].push(mat);
                });
                setMaterialsBySubject(groupedMats);
                sessionStorage.setItem(CACHE_KEY_MATERIALS, JSON.stringify(groupedMats));
            }

        } catch (err) {
            console.error("Error fetching courses/modules:", err);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userSession]);

    // Derived State
    const activeCourse = facultyCourses.find(c => c.id === activeCourseId);
    const activeModules = activeCourse ? (modulesBySubject[activeCourse.id] || []) : [];
    const activeMaterials = activeCourse ? (materialsBySubject[activeCourse.id] || []) : [];

    // Additional Resource State
    const [showResourceForm, setShowResourceForm] = useState(false);
    const [resourceTitle, setResourceTitle] = useState("");
    const [resourceType, setResourceType] = useState("Lecture Slides");
    const [resourceLink, setResourceLink] = useState("");
    const [resourceNotes, setResourceNotes] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    // Handlers
    const handleSaveEdits = async () => {
        if (!editingModule || !activeCourse) return;
        setIsSaving(true);
        try {
            const { error } = await supabase.from("course_modules").update({
                faculty_edited_content: facultyContent
            }).eq("id", editingModule.id);

            if (error) throw error;

            // Optimistic update
            const updatedGroup = { ...modulesBySubject };
            if (updatedGroup[activeCourse.id]) {
                updatedGroup[activeCourse.id] = updatedGroup[activeCourse.id].map(mod => 
                    mod.id === editingModule.id ? { ...mod, faculty_edited_content: facultyContent } : mod
                );
                setModulesBySubject(updatedGroup);
                sessionStorage.setItem(CACHE_KEY_MODULES, JSON.stringify(updatedGroup));
            }
            
            setEditingModule(null);
        } catch (err) {
            console.error("Error saving edits:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const togglePublish = async (mod) => {
        if (!activeCourse) return;
        try {
            const newPublishState = !mod.is_published;

            // Optimistic UI update first
            const updatedGroup = { ...modulesBySubject };
            if (updatedGroup[activeCourse.id]) {
                updatedGroup[activeCourse.id] = updatedGroup[activeCourse.id].map(m => 
                    m.id === mod.id ? { ...m, is_published: newPublishState } : m
                );
                setModulesBySubject(updatedGroup);
                sessionStorage.setItem(CACHE_KEY_MODULES, JSON.stringify(updatedGroup));
            }

            const { error } = await supabase.from("course_modules").update({
                is_published: newPublishState
            }).eq("id", mod.id);

            if (error) throw error;

        } catch (err) {
            console.error("Error toggling publish:", err);
        }
    };

    const handleUploadResource = async (e) => {
        e.preventDefault();
        if (!activeCourse) return;
        setIsUploading(true);
        try {
            const { data, error } = await supabase.from('course_materials').insert({
                faculty_id: userSession.db_id,
                subject_id: activeCourse.id,
                title: resourceTitle,
                content_text: resourceNotes,
                file_url: resourceLink,
                material_type: resourceType,
                module_week: 'General'
            }).select().single();
            
            if (error) throw error;
            
            // Optimistic UI update
            const updatedMats = { ...materialsBySubject };
            if (!updatedMats[activeCourse.id]) updatedMats[activeCourse.id] = [];
            updatedMats[activeCourse.id] = [data, ...updatedMats[activeCourse.id]];
            setMaterialsBySubject(updatedMats);
            sessionStorage.setItem(CACHE_KEY_MATERIALS, JSON.stringify(updatedMats));

            setShowResourceForm(false);
            setResourceTitle("");
            setResourceLink("");
            setResourceNotes("");
        } catch (err) {
            console.error(err);
            window.erpDialog?.alert("Failed to add resource.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteResource = async (id) => {
        if (!activeCourse) return;
        try {
            const { error } = await supabase.from('course_materials').delete().eq('id', id);
            if (error) throw error;

            // Optimistic UI update
            const updatedMats = { ...materialsBySubject };
            if (updatedMats[activeCourse.id]) {
                updatedMats[activeCourse.id] = updatedMats[activeCourse.id].filter(m => m.id !== id);
                setMaterialsBySubject(updatedMats);
                sessionStorage.setItem(CACHE_KEY_MATERIALS, JSON.stringify(updatedMats));
            }
        } catch (err) {
            console.error("Error deleting resource:", err);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in">
            <div className={`${theme.layout.panelElevated} p-6 flex flex-col lg:flex-row justify-between items-center gap-6`}>
                <div>
                    <h1 className={`${theme.text.heading} text-2xl tracking-tight mb-1`}>Course Materials</h1>
                    <p className={`${theme.text.secondary} text-sm font-medium`}>Review admin-drafted modules and publish resources.</p>
                </div>
                <div className="w-full sm:w-64 lg:w-72">
                    <select
                        value={activeCourseId}
                        onChange={(e) => setActiveCourseId(e.target.value)}
                        className={`w-full bg-themeApp ${theme.layout.divider} border-theme text-themeText rounded-themeBtn px-4 py-3 text-sm font-bold outline-none cursor-pointer focus:border-themeBorderStrong transition-colors`}
                    >
                        {facultyCourses.length === 0 ? <option value="">No Courses Assigned</option> : 
                            facultyCourses.map(c => <option key={c.id} value={c.id}>{c.subject_name}</option>)
                        }
                    </select>
                </div>
            </div>

            {facultyCourses.length > 0 && activeModules.length === 0 && activeMaterials.length === 0 ? (
                <div className={`${theme.layout.panel} p-12 text-center flex flex-col items-center justify-center gap-3`}>
                    <div className="w-12 h-12 rounded-full bg-themeElevated flex items-center justify-center text-themeTextSec mb-2 border-theme border-themeBorder">
                        <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <h3 className={`${theme.text.primary} font-semibold`}>No Content Available</h3>
                    <p className={`${theme.text.secondary} text-sm max-w-md`}>No modules or additional resources have been uploaded for this course yet.</p>
                </div>
            ) : null}

            {/* ADMIN DRAFTED MODULES SECTION */}
            {activeModules.length > 0 && (
                <div className="flex flex-col gap-4">
                    <h2 className="text-themeText text-lg font-black tracking-tight mb-2 uppercase text-themeTextSec opacity-70">Admin Drafted Modules</h2>
                    {activeModules.map(mod => (
                        <div key={mod.id} className={`${theme.layout.panel} p-6 flex flex-col gap-5 hover:border-themeBorderStrong transition-colors duration-300`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme border-themeBorder pb-4">
                                <div>
                                    <h3 className={`${theme.text.primary} text-lg font-bold`}>{mod.module_title || "Untitled Module"}</h3>
                                </div>
                                <button 
                                    onClick={() => togglePublish(mod)} 
                                    className={`px-4 py-2 rounded-themeBtn text-xs font-bold uppercase tracking-wider transition-colors duration-300 w-max border-theme border-transparent ${
                                        mod.is_published 
                                        ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 hover:border-emerald-500/30" 
                                        : "bg-themeElevated text-themeTextSec hover:bg-themeBorder hover:text-themeText"
                                    }`}
                                >
                                    {mod.is_published ? "● Published" : "○ Draft"}
                                </button>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <span className={`${theme.text.overline} flex items-center gap-2`}>
                                        Admin Base Content
                                    </span>
                                    <div className={`${theme.layout.panelElevated} p-4 text-sm ${theme.text.primary} leading-relaxed whitespace-pre-wrap`}>
                                        {mod.base_content || <span className="italic opacity-50">No base content provided.</span>}
                                    </div>
                                </div>

                                {editingModule?.id === mod.id ? (
                                    <div className="flex flex-col gap-3 animate-fade-in">
                                        <span className={`${theme.text.overline} text-themeAccent flex items-center gap-2`}>
                                            Your Edits
                                        </span>
                                        <textarea 
                                            value={facultyContent} 
                                            onChange={e => setFacultyContent(e.target.value)} 
                                            className={`w-full ${theme.layout.panelElevated} p-4 text-sm ${theme.text.primary} min-h-[160px] resize-y focus:outline-none focus:border-themeAccent transition-colors`}
                                            placeholder="Add your lecture notes, additional materials, or assignments here..."
                                        />
                                        <div className="flex items-center gap-3 pt-2">
                                            <button 
                                                onClick={handleSaveEdits} 
                                                disabled={isSaving} 
                                                className={theme.action.btnPrimary}
                                            >
                                                {isSaving ? "Saving..." : "Save Edits"}
                                            </button>
                                            <button 
                                                onClick={() => setEditingModule(null)} 
                                                disabled={isSaving}
                                                className={theme.action.btnSecondary}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <span className={`${theme.text.overline} flex items-center gap-2`}>
                                            Faculty Edits (Visible to Students)
                                        </span>
                                        <div className={`${theme.layout.panelElevated} p-4 text-sm ${theme.text.primary} min-h-[80px] leading-relaxed whitespace-pre-wrap`}>
                                            {mod.faculty_edited_content || <span className="italic opacity-50">No additional edits provided.</span>}
                                        </div>
                                        <div className="pt-2">
                                            <button 
                                                onClick={() => { 
                                                    setEditingModule(mod); 
                                                    setFacultyContent(mod.faculty_edited_content || mod.base_content || ""); 
                                                }} 
                                                className="px-5 py-2.5 rounded-themeBtn bg-themeElevated text-themeAccent border-theme border-themeBorder hover:border-themeAccent text-sm font-bold transition-colors w-max"
                                            >
                                                Edit Material
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ADDITIONAL RESOURCES SECTION */}
            {facultyCourses.length > 0 && activeCourse && (
                <div className={`${theme.layout.panelElevated} p-6 border-theme border-themeBorderStrong mb-6`}>
                    <div className="flex justify-between items-center mb-4 border-b border-theme border-themeBorder pb-4">
                        <h2 className={`${theme.text.heading} text-lg`}><i className="fa-brands fa-google-drive text-themeAccent mr-2"></i> Additional Resources</h2>
                        <button onClick={() => setShowResourceForm(!showResourceForm)} className="px-4 py-2 bg-themeElevated hover:bg-themePanel border-theme border-themeBorder rounded-themeBtn text-[10px] font-black uppercase tracking-widest text-themeText transition-colors">
                            {showResourceForm ? "Close Form" : "Upload Resource"}
                        </button>
                    </div>

                    {showResourceForm && (
                        <form onSubmit={handleUploadResource} className="flex flex-col gap-4 animate-fade-in mb-8 bg-themeApp p-5 rounded-themePanel border-theme border-themeBorder">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input required placeholder="Resource Title (e.g., Week 1 Slides)" value={resourceTitle} onChange={e=>setResourceTitle(e.target.value)} className={`w-full bg-themeElevated border-theme border-themeBorder text-themeText rounded-themeBtn px-4 py-3 text-sm focus:border-themeBorderStrong outline-none transition-colors`} />
                                <select value={resourceType} onChange={e=>setResourceType(e.target.value)} className={`w-full bg-themeElevated border-theme border-themeBorder text-themeText rounded-themeBtn px-4 py-3 text-sm focus:border-themeBorderStrong outline-none transition-colors`}>
                                    <option value="Lecture Slides">Lecture Slides</option>
                                    <option value="Reading Material">Reading Material</option>
                                    <option value="Syllabus">Syllabus</option>
                                </select>
                            </div>
                            <input required placeholder="Google Drive / Cloud Link" value={resourceLink} onChange={e=>setResourceLink(e.target.value)} className={`w-full bg-themeElevated border-theme border-themeBorder text-themeText rounded-themeBtn px-4 py-3 text-sm focus:border-themeBorderStrong outline-none transition-colors`} />
                            <textarea placeholder="Additional Notes or Context..." value={resourceNotes} onChange={e=>setResourceNotes(e.target.value)} className={`w-full bg-themeElevated border-theme border-themeBorder text-themeText rounded-themeBtn px-4 py-3 text-sm focus:border-themeBorderStrong outline-none transition-colors min-h-[80px] resize-y`} />
                            <button disabled={isUploading} type="submit" className={`w-full py-3 bg-themeAccent hover:bg-themeAccent/80 text-[#0a0a0a] font-black uppercase tracking-widest text-xs rounded-themeBtn transition-colors disabled:opacity-50`}>
                                {isUploading ? "Uploading..." : "Publish Resource"}
                            </button>
                        </form>
                    )}

                    {/* Ledger of Uploaded Resources */}
                    {activeMaterials.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {activeMaterials.map(mat => (
                                <div key={mat.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-themeApp border-theme border-themeBorder rounded-themePanel hover:border-themeBorderStrong transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-themeElevated flex items-center justify-center text-themeTextSec shrink-0">
                                            <i className={`fa-solid ${
                                                mat.material_type === 'Syllabus' ? 'fa-book text-themeAccent' : 
                                                mat.material_type === 'Lecture Slides' ? 'fa-display text-blue-400' : 'fa-file-pdf text-rose-400'
                                            }`}></i>
                                        </div>
                                        <div>
                                            <h4 className="text-themeText font-bold text-sm tracking-tight">{mat.title}</h4>
                                            <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-themeTextSec mt-1">
                                                <span>{mat.material_type}</span>
                                                <span>•</span>
                                                <span>{new Date(mat.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {mat.file_url && (
                                            <a href={mat.file_url} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-themeElevated text-themeTextSec hover:text-white hover:bg-blue-500/20 transition-colors">
                                                <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                                            </a>
                                        )}
                                        <button onClick={() => handleDeleteResource(mat.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-themeElevated text-themeTextSec hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                                            <i className="fa-solid fa-trash text-xs"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-themeTextSec text-xs text-center py-6">No additional resources uploaded yet.</p>
                    )}
                </div>
            )}
        </div>
    );
}
