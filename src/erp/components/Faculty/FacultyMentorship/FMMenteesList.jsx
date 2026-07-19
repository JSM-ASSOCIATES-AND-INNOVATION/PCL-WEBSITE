import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../LIB/supabase/supabaseClient";
import { useERP } from "../../../context/ErpContext";

export default function FMMenteesList({ onViewStudent }) {
    const { userSession } = useERP();
    const [mentees, setMentees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [filterSemester, setFilterSemester] = useState("All");

    useEffect(() => {
        fetchMentees();
    }, []);

    const fetchMentees = async () => {
        if (!userSession?.db_id) return;
        setIsLoading(true);
        try {
            // Join mentorship with profiles to get all assigned students
            const { data, error } = await supabase
                .from('mentorship')
                .select(`
                    id,
                    student_id,
                    profiles:student_id (
                        id, name, erp_id, programme, semester, section, batch
                    )
                `)
                .eq('faculty_id', userSession.db_id);

            if (error) throw error;

            const menteeIds = data.map(m => m.student_id);
            let attendanceStats = {};
            if (menteeIds.length > 0) {
                const { data: attendanceData } = await supabase
                    .from('attendance')
                    .select('student_id, status')
                    .in('student_id', menteeIds)
                    .in('status', ['Present', 'Absent']);
                
                if (attendanceData) {
                    attendanceData.forEach(record => {
                        if (!attendanceStats[record.student_id]) {
                            attendanceStats[record.student_id] = { total: 0, present: 0 };
                        }
                        attendanceStats[record.student_id].total++;
                        if (record.status === 'Present') {
                            attendanceStats[record.student_id].present++;
                        }
                    });
                }
            }

            const formatted = data.map(m => {
                const s = m.profiles;
                let risk = 'On Track';
                let cgpa = 'N/A';
                
                const stats = attendanceStats[m.student_id];
                if (stats && stats.total > 0) {
                    const percentage = (stats.present / stats.total) * 100;
                    if (percentage < 75) risk = 'High Risk';
                    else if (percentage < 85) risk = 'Moderate';
                }

                // If no real CGPA, fallback to 'N/A' rather than Math.random()
                if (s?.cgpa) {
                    cgpa = s.cgpa;
                }

                return {
                    id: s?.id,
                    name: s?.name || 'Unknown',
                    erp_id: s?.erp_id || s?.id?.substring(0,8) || 'Unknown',
                    programme: s?.programme || 'Unknown',
                    semester: s?.semester || 'Unknown',
                    section: s?.section || 'Unknown',
                    batch: s?.batch || 'Unknown',
                    cgpa: cgpa,
                    risk: risk
                };
            });

            setMentees(formatted);
        } catch (error) {
            console.error("Error fetching mentees:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredMentees = mentees.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.erp_id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSem = filterSemester === "All" || s.semester === filterSemester;
        return matchesSearch && matchesSem;
    });

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-10">
            
            {/* Control Bar */}
            <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-themeTextSec"></i>
                        <input 
                            type="text"
                            placeholder="Search by Name or Registration No..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-lg pl-10 pr-4 py-2.5 text-xs font-bold text-themeText focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>
                    <select 
                        value={filterSemester}
                        onChange={(e) => setFilterSemester(e.target.value)}
                        className="bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-lg px-4 py-2.5 text-xs font-bold text-themeText focus:border-blue-500 outline-none appearance-none"
                    >
                        <option value="All">All Semesters</option>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                        <option value="3">Semester 3</option>
                        <option value="4">Semester 4</option>
                    </select>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">High Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Moderate</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">On Track</span>
                    </div>
                </div>
            </div>

            {/* Mentee Grid */}
            {isLoading ? (
                <div className="w-full py-20 flex justify-center"><i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-500"></i></div>
            ) : filteredMentees.length === 0 ? (
                <div className="w-full py-20 flex flex-col items-center justify-center text-center opacity-60">
                    <i className="fa-solid fa-user-slash text-5xl text-themeTextSec mb-4"></i>
                    <h3 className="text-base font-black text-themeText">No Mentees Found</h3>
                    <p className="text-xs font-bold text-themeTextSec mt-1">Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                    {filteredMentees.map(student => (
                        <div 
                            key={student.id} 
                            onClick={() => onViewStudent(student.id)}
                            className="bg-themePanel border-[length:var(--border-width)] border-themeBorder hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] rounded-themePanel p-5 flex flex-col gap-4 cursor-pointer transition-all group relative overflow-hidden"
                        >
                            {/* Risk Indicator Line */}
                            <div className={`absolute top-0 left-0 w-full h-1 ${student.risk === 'High Risk' ? 'bg-rose-500' : student.risk === 'Moderate' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>

                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-full bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong flex items-center justify-center shrink-0 overflow-hidden">
                                    <i className="fa-solid fa-user text-xl text-themeTextSec group-hover:text-blue-500 transition-colors"></i>
                                </div>
                                <div className="flex flex-col flex-1 min-w-0 pt-1">
                                    <h4 className="text-sm font-black text-themeText truncate group-hover:text-blue-500 transition-colors">{student.name}</h4>
                                    <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-0.5 truncate">{student.erp_id}</span>
                                    
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        <span className="bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-themeTextSec tracking-widest">{student.programme}</span>
                                        <span className="bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-themeTextSec tracking-widest">Sem {student.semester}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-3 border-t-[length:var(--border-width)] border-themeBorderStrong">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec">CGPA</span>
                                    <span className={`text-xs font-black ${student.cgpa < 6 ? 'text-rose-500' : 'text-themeText'}`}>{student.cgpa}</span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec">Risk</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${student.risk === 'High Risk' ? 'text-rose-500' : student.risk === 'Moderate' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                        {student.risk}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
