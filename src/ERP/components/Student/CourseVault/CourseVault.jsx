/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase/supabaseClient";
import { theme } from "../../../theme";
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function CourseVault({ isEmbedded = false }) {
    const [materials, setMaterials] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");

    useEffect(() => {
        let isMounted = true;
        const fetchVaultData = async () => {
            try {
                // 1. Get user session
                const sessionStr = sessionStorage.getItem("userSession");
                if (!sessionStr) return;
                const userSession = JSON.parse(sessionStr);
                const batchId = userSession.batch_id;

                if (!batchId) {
                    if (isMounted) setIsLoading(false);
                    return;
                }

                // 2. Fetch assigned subjects for this student's batch
                const { data: subjectData, error: subErr } = await supabase
                    .from('subjects')
                    .select('id, name, code, semester')
                    .eq('batch_id', batchId);

                if (subErr) throw subErr;
                
                if (isMounted && subjectData) {
                    setSubjects(subjectData);
                }

                if (!subjectData || subjectData.length === 0) {
                    if (isMounted) setIsLoading(false);
                    return;
                }

                const subjectIds = subjectData.map(s => s.id);

                // 3. Fetch materials from course_resources (where Faculty uploads links)
                const { data: resourceData, error: resErr } = await supabase
                    .from('course_resources')
                    .select('id, title, url, type, created_at, subject_id, profiles!faculty_id(full_name)')
                    .in('subject_id', subjectIds)
                    .order('created_at', { ascending: false });

                if (resErr) throw resErr;

                if (isMounted && resourceData) {
                    // Map subject names onto resources
                    const enrichedMaterials = resourceData.map(res => {
                        const sub = subjectData.find(s => s.id === res.subject_id);
                        return {
                            ...res,
                            course_name: sub ? sub.name : 'Unknown Course',
                            course_code: sub ? sub.code : '',
                            faculty_name: res.profiles?.full_name || 'Faculty'
                        };
                    });
                    setMaterials(enrichedMaterials);
                }
            } catch (error) {
                console.error("Error fetching Course Vault data:", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchVaultData();
        return () => { isMounted = false; };
    }, []);

    const getTypeIcon = (type) => {
        switch (type) {
            case "Drive Link": return "fa-brands fa-google-drive text-emerald-400";
            case "PDF Document": return "fa-solid fa-file-pdf text-rose-400";
            case "Video Lecture": return "fa-brands fa-youtube text-red-500";
            case "Web Resource": return "fa-solid fa-link text-blue-400";
            default: return "fa-solid fa-folder-open text-themeAccent";
        }
    };

    const getTypesList = () => {
        const types = new Set(materials.map(m => m.type));
        return ['All', ...Array.from(types)];
    };

    const filteredMaterials = activeFilter === "All" ? materials : materials.filter(m => m.type === activeFilter);

    // Group by Subject Name
    const groupedMaterials = filteredMaterials.reduce((acc, curr) => {
        if (!acc[curr.course_name]) acc[curr.course_name] = [];
        acc[curr.course_name].push(curr);
        return acc;
    }, {});

    return (
        <div className={`w-full flex flex-col ${!isEmbedded ? "h-auto xl:h-[calc(100vh-9rem)] xl:min-h-[600px] min-h-full relative flex-1 bg-themeApp text-themeText selection:bg-themeAccent/30 overflow-x-hidden xl:overflow-hidden font-sans" : ""}`}>
            <div className={`relative z-20 w-full max-w-7xl mx-auto flex flex-col xl:flex-row ${!isEmbedded ? "gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 h-auto xl:h-full overflow-visible xl:overflow-hidden" : ""}`}>
                <div className={`flex-1 flex flex-col gap-6 overflow-visible ${!isEmbedded ? "xl:overflow-y-auto custom-scrollbar pb-10 xl:pb-0 h-auto xl:h-full relative xl:pr-2" : ""}`}>
                    
                    {/* SINGLE MASTER HEADER */}
                    <PageHeader 
                        icon="fa-brands fa-google-drive" 
                        title="Course Vault" 
                        subtitle="Access official course materials and study links." 
                        isEmbedded={isEmbedded}
                        rightContent={
                            materials.length > 0 && (
                                <div className="flex flex-wrap lg:flex-nowrap p-1.5 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] shadow-[0_10px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_20px_rgba(0,0,0,0.2)] rounded-2xl border border-black/10 dark:border-white/20 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar relative z-10">
                                    {getTypesList().map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setActiveFilter(filter)}
                                            className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${
                                                activeFilter === filter 
                                                ? 'bg-white dark:bg-white/20 backdrop-blur-[80px] text-black dark:text-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border border-black/10 dark:border-white/40 scale-100' 
                                                : 'text-black/60 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 border border-transparent scale-95 hover:scale-100'
                                            }`}
                                        >
                                            {filter === 'All' ? 'All Resources' : filter}
                                        </button>
                                    ))}
                                </div>
                            )
                        }
                    />

{/* CONTENT GRID */}
                    <div className="flex flex-col gap-8 animate-fade-in pb-12">
                        {isLoading ? (
                            <div className="flex flex-col gap-6 w-full animate-pulse opacity-70 p-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-32 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-xl"></div>
        <div className="h-32 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-xl"></div>
        <div className="h-32 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-xl"></div>
    </div>
    <div className="h-64 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-xl mt-4"></div>
</div>
                        ) : filteredMaterials.length === 0 ? (
                            <div className="w-full py-16 lg:py-24 border-2 border-dashed border-white/20 rounded-[2rem] flex flex-col items-center justify-center bg-white/5 backdrop-blur-[80px] shadow-inner text-center px-4">
                                <i className={`fa-brands fa-google-drive text-4xl lg:text-5xl text-themeTextSec opacity-50 mb-4`}></i>
                                <h3 className={`${theme.text.heading} text-xl lg:text-2xl text-themeText tracking-tight`}>Vault is Empty</h3>
                                <p className={`${theme.text.secondary} text-xs lg:text-sm mt-2 max-w-sm`}>No materials have been published to this section yet.</p>
                            </div>
                        ) : (
                            Object.entries(groupedMaterials).map(([subjectName, items]) => {
                                const subjectCode = items[0]?.course_code;
                                return (
                                    <div key={subjectName} className="flex flex-col gap-5">
                                        
                                        <div className="flex items-center gap-3 border-b-theme border-black/5 dark:border-white/10 pb-3">
                                            <div className="w-8 h-8 rounded-lg bg-themeAccent/20 flex items-center justify-center border border-themeAccent/30 shrink-0">
                                                <i className="fa-solid fa-folder-open text-themeAccent text-sm"></i>
                                            </div>
                                            <div>
                                                <h3 className={`${theme.text.heading} text-lg lg:text-xl text-themeText leading-none`}>
                                                    {subjectName}
                                                </h3>
                                                {subjectCode && <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mt-1 block">{subjectCode}</span>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {items.map(item => (
                                                <a 
                                                    key={item.id} 
                                                    href={item.url} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="bg-white/10 backdrop-blur-[80px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] border border-white/20 p-5 rounded-[1.5rem] hover:border-themeAccent/50 hover:-translate-y-1 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] transition-all group flex flex-col justify-between min-h-[140px]"
                                                >
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border border-black/5 dark:border-white/10 bg-white/5 shadow-sm group-hover:scale-110 transition-transform origin-left ${getTypeIcon(item.type).split(' ').slice(2).join(' ')}`}>
                                                                <i className={`${getTypeIcon(item.type).split(' ')[0]} ${getTypeIcon(item.type).split(' ')[1]}`}></i>
                                                            </div>
                                                            <div className="bg-themeElevated/50 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest text-themeTextSec border border-white/5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]">
                                                                {item.type}
                                                            </div>
                                                        </div>
                                                        <h4 className="text-sm font-bold text-themeText group-hover:text-themeAccent transition-colors leading-snug line-clamp-2">
                                                            {item.title}
                                                        </h4>
                                                    </div>
                                                    
                                                    <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[9px] font-bold text-themeTextSec uppercase tracking-widest opacity-70">
                                                        <span><i className="fa-solid fa-user-tie mr-1"></i> {item.faculty_name.split(' ')[0]}</span>
                                                        <span>{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>

                                    </div>
                                );
                            })
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
