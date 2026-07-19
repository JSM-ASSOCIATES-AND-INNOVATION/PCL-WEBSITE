import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../lib/supabase/supabaseClient";

export default function AdminLegalAid({ isHubView = false }) {
    const [diaries, setDiaries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDiaries();
    }, []);

    const fetchDiaries = async () => {
        try {
            // Also join with users table to get student name if possible. 
            // In a simple setup, we just select all from cle_diaries.
            const { data, error } = await supabase
                .from('cle_diaries')
                .select('*, student:users(name, roll_number)')
                .order('created_at', { ascending: false });
                
            if (error) {
                if (error.code === '42P01') {
                    setDiaries([]);
                } else {
                    throw error;
                }
            } else {
                setDiaries(data || []);
            }
        } catch (err) {
            console.error("Failed to load CLE diaries", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const { error } = await supabase
                .from('cle_diaries')
                .update({ status })
                .eq('id', id);
                
            if (error) throw error;
            fetchDiaries();
        } catch (err) {
            console.error("Failed to update status", err);
            window.erpDialog.alert("Failed to update status");
        }
    };

    return (
        <div className={`w-full ${isHubView ? 'bg-transparent text-themeText font-sans' : 'max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in selection:bg-themeElevated'}`}>
            {/* Header */}
            {!isHubView && (
                <div className={`w-full relative overflow-hidden rounded-[2rem] shadow-2xl p-6 lg:p-8 flex flex-col gap-6 border border-themeBorder bg-gradient-to-r from-themeAccent to-themeAccent/80`}>
                    {/* Background Decorations */}
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-overlay pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 mix-blend-overlay pointer-events-none"></div>

                    <div className="flex items-center gap-4 lg:gap-5 relative z-10 mb-2">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1rem] bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                            <i className="fa-solid fa-hand-holding-hand text-white text-2xl lg:text-3xl drop-shadow-md"></i>
                        </div>
                        <div>
                            <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-white mb-1 drop-shadow-md`}>Legal Aid Clinic (CLE)</h1>
                            <p className="text-white/80 text-xs lg:text-sm font-medium tracking-wide">Review and verify student clinic diaries.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-themePanel rounded-themePanel border-theme border-themeBorder p-6">
                <h2 className="text-xl font-bold text-themeText mb-4">Pending CLE Diaries</h2>
                
                {isLoading ? (
                    <div className="text-themeTextSec py-8 text-center">Loading...</div>
                ) : diaries.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-themeBorder rounded-themePanel">
                        <i className="fa-solid fa-check-double text-4xl text-neutral-600 mb-4"></i>
                        <p className="text-themeTextSec font-bold">No pending CLE Diaries to review.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {diaries.map(d => (
                            <div key={d.id} className="bg-themeElevated p-5 rounded-themePanel border-theme border-themeBorder flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${d.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-theme border-emerald-500/20' : d.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-theme border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-theme border-amber-500/20'}`}>
                                            {d.status}
                                        </span>
                                        <span className="text-themeText font-bold text-sm">Week {d.week_number}</span>
                                        <span className="text-themeTextSec text-xs ml-auto">
                                            {d.student ? `${d.student.name} (${d.student.roll_number || 'N/A'})` : 'Student ID: ' + d.student_id}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-themeText mb-1">{d.case_title}</h3>
                                    <p className="text-xs text-themeTextSec mb-2"><i className="fa-solid fa-gavel mr-1"></i> {d.court_name}</p>
                                    <div className="bg-themePanel p-3 rounded border-theme border-themeBorderStrong">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-1">Learning Outcome</p>
                                        <p className="text-xs text-themeText italic leading-relaxed">"{d.learning_outcome}"</p>
                                    </div>
                                </div>
                                <div className="flex flex-row md:flex-col gap-2 shrink-0">
                                    {d.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleStatusUpdate(d.id, 'approved')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded transition-colors flex-1 text-center">
                                                <i className="fa-solid fa-check mr-1"></i> Approve
                                            </button>
                                            <button onClick={() => handleStatusUpdate(d.id, 'rejected')} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded transition-colors flex-1 text-center">
                                                <i className="fa-solid fa-xmark mr-1"></i> Reject
                                            </button>
                                        </>
                                    )}
                                    {d.status !== 'pending' && (
                                        <button onClick={() => handleStatusUpdate(d.id, 'pending')} className="px-4 py-2 bg-themePanel border-theme border-themeBorder hover:bg-themeElevated text-themeTextSec font-bold text-xs rounded transition-colors w-full text-center">
                                            Reset Status
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
