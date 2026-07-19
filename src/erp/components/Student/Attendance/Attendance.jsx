/* eslint-disable */
import React, { useState, useEffect, useCallback } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../LIB/supabase/supabaseClient";
import { useERP } from "../../../context/ErpContext"; 

export default function Attendance() {
    const { userSession } = useERP();

    // --- CACHE KEYS ---
    const CACHE_KEY = 'att_data_v3';
    const cached = (fallback) => {
        try { const d = sessionStorage.getItem(CACHE_KEY); return d ? JSON.parse(d) : fallback; }
        catch { return fallback; }
    };

    const [attendanceData, setAttendanceData] = useState(() => cached([]));
    const [overallAttendance, setOverallAttendance] = useState(() => {
        const d = cached([]);
        if (!d.length) return 0;
        const tot = d.reduce((a, c) => a + Number(c.total_classes), 0);
        const att = d.reduce((a, c) => a + Number(c.attended_classes), 0);
        return tot === 0 ? 0 : ((att / tot) * 100).toFixed(1);
    });
    const [fetchError, setFetchError] = useState(null);

    // --- MODAL STATES ---
    const [activeSubject, setActiveSubject] = useState(null);
    const [showScanner, setShowScanner] = useState(false);
    const [scanSuccess, setScanSuccess] = useState(false);

    // --- BACKGROUND FETCH (no loading gate) ---
    const fetchAcademicData = useCallback(async () => {
        const studentId = userSession?.db_id || userSession?.id;
        if (!studentId) return;
        setFetchError(null);
        try {
            // 1. Fetch RAW verifiable attendance linked to the core timetable
            const { data, error } = await supabase
                .from('attendance')
                .select(`
                    status,
                    timestamp,
                    class_id,
                    timetable!inner(
                        subject_id,
                        faculty_id,
                        subjects(name, code)
                    )
                `)
                .eq('student_id', studentId)
                .order('timestamp', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                // 2. Client-Side Aggregation
                const subjectMap = {};
                data.forEach(record => {
                    const subjId = record.timetable.subject_id;
                    const subjObj = record.timetable.subjects; 
                    const facId = record.timetable.faculty_id;
                    
                    if(!subjectMap[subjId]) {
                        subjectMap[subjId] = {
                            id: subjId,
                            course_code: subjObj?.code || 'N/A',
                            course_name: subjObj?.name || 'Unknown Course',
                            faculty_id: facId,
                            faculty_name: '—',
                            total_classes: 0,
                            attended_classes: 0,
                            records: []
                        };
                    }
                    
                    if (record.status !== 'excused') {
                        subjectMap[subjId].total_classes += 1;
                        if(record.status === 'present') {
                            subjectMap[subjId].attended_classes += 1;
                        }
                    }

                    // Add to chronological ledger
                    subjectMap[subjId].records.push({
                        id: Math.random().toString(),
                        timestamp: record.timestamp,
                        status: record.status
                    });
                });

                const groupedData = Object.values(subjectMap);

                // 3. Resolve Faculty Names Safely
                const facIds = [...new Set(groupedData.map(d => d.faculty_id))];
                if(facIds.length > 0) {
                    const { data: profs } = await supabase.from('profiles').select('id, full_name').in('id', facIds);
                    groupedData.forEach(d => {
                        const prof = profs?.find(p => p.id === d.faculty_id);
                        if(prof) d.faculty_name = prof.full_name;
                    });
                }

                // 4. Compute Semesters Stats
                setAttendanceData(groupedData);
                const totalClasses = groupedData.reduce((acc, curr) => acc + Number(curr.total_classes), 0);
                const totalAttended = groupedData.reduce((acc, curr) => acc + Number(curr.attended_classes), 0);
                const overall = totalClasses === 0 ? 0 : ((totalAttended / totalClasses) * 100).toFixed(1);
                
                setOverallAttendance(overall);
                try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(groupedData)); } catch {}
            } else {
                setAttendanceData([]);
                setOverallAttendance(0);
            }
        } catch (error) {
            console.error("Attendance Sync Error:", error.message);
            if (!attendanceData.length) {
                setFetchError("Unable to sync attendance records with the core engine.");
            }
        }
    }, [userSession]);

    useEffect(() => { fetchAcademicData(); }, [fetchAcademicData]);

    // Dynamic Ring Colorizer
    const getRingColor = (percentage) => {
        if (percentage >= 85) return "text-emerald-500";
        if (percentage >= 75) return "text-themeAccent";
        return "text-rose-500";
    };

    const handleSimulateScan = () => {
        setScanSuccess(true);
        setTimeout(() => {
            setScanSuccess(false);
            setShowScanner(false);
            // Optionally refetch data here to show the new 'present' status
        }, 2000);
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-20 lg:pb-12 animate-fade-in selection:bg-themeElevated relative">

            {/* 1. MASTER HEADER */}
            <div className={`flex flex-col lg:flex-row lg:items-end justify-between gap-6 ${theme.layout.panel} p-6 lg:p-8 rounded-themePanel  border-theme border-themeBorder print:border-none print:shadow-none print:p-0`}>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel lg:rounded-themePanel flex items-center justify-center text-emerald-400 text-2xl lg:text-3xl shrink-0 print:hidden shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <i className="fa-solid fa-clipboard-check"></i>
                    </div>
                    <div>
                        <h1 className={`${theme.text.heading} text-2xl lg:text-3xl text-themeText mb-1 tracking-tight print:text-black`}>Verified Attendance</h1>
                        <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium print:text-gray-600`}>Official class participation synced seamlessly with the global timetable.</p>
                    </div>
                </div>
            </div>

            {/* 2. ERROR BANNER (only if no cached data at all) */}
            {fetchError && !attendanceData.length ? (
                <div className="w-full py-16 lg:py-24 border-2 border-dashed border-themeBorderStrong rounded-themePanel flex flex-col items-center justify-center bg-themeElevated px-4 print:hidden">
                    <i className="fa-solid fa-link-slash text-4xl lg:text-5xl text-rose-500 mb-4"></i>
                    <h3 className={`${theme.text.heading} text-xl lg:text-2xl text-themeText tracking-tight`}>Connection Lost</h3>
                    <p className={`text-xs lg:text-sm ${theme.text.muted} mt-2 text-center`}>{fetchError}</p>
                    <button
                        onClick={fetchAcademicData}
                        className="mt-4 px-4 py-2 bg-themeAccent hover:bg-themeAccentDark text-white rounded-themePanel text-xs font-bold uppercase tracking-widest"
                    >
                        Retry Sync
                    </button>
                </div>
            ) : (

                /* 3. DYNAMIC CONTENT GRID — always rendered instantly */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 animate-fade-in">

                    {/* Overall Semester Health Card */}
                    <div className="md:col-span-2 xl:col-span-3 bg-themeElevated rounded-themePanel p-6 lg:p-8 relative overflow-hidden border-theme border-themeBorder text-themeText flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8 print:border-gray-300 print:shadow-none print:bg-white print:text-black hover:border-themeBorderStrong transition-colors duration-300">
                        <div className={`absolute top-0 right-0 w-64 h-64 lg:w-96 lg:h-96 rounded-full  lg:-translate-y-1/2 translate-x-1/3 pointer-events-none print:hidden ${overallAttendance >= 75 ? 'bg-emerald-500/5' : 'bg-rose-500/5'}`}></div>

                        <div className="relative z-10 text-center lg:text-left flex-1">
                            <p className={`${overallAttendance >= 75 ? 'text-emerald-500' : 'text-rose-500'} font-bold text-[10px] lg:text-xs uppercase tracking-widest mb-2 lg:mb-3 flex items-center justify-center lg:justify-start gap-2`}>
                                <i className={`fa-solid ${overallAttendance >= 75 ? 'fa-shield-check' : 'fa-triangle-exclamation'}`}></i> Current Semester Health
                            </p>
                            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter mb-2 lg:mb-3 text-themeText print:text-black">{overallAttendance}% <span className="text-xl lg:text-2xl text-themeTextSec opacity-70 font-bold tracking-normal uppercase">Overall</span></h2>
                            <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium print:text-gray-600 max-w-lg mx-auto lg:mx-0`}>
                                {overallAttendance >= 75
                                    ? "You are safely above the 75% university requirement. Keep it up!"
                                    : "Warning: You are falling below the university attendance mandate."}
                            </p>
                        </div>

                        <button
                            onClick={() => window.print()}
                            className={`print:hidden w-full lg:w-auto px-6 py-4 bg-themeApp hover:bg-neutral-800 border-theme border-themeBorderStrong rounded-themePanel lg:rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest text-themeText transition-all relative z-10 shrink-0 flex items-center justify-center gap-2 group active:scale-95 hover:shadow-xl`}
                        >
                            <i className="fa-solid fa-file-pdf text-themeAccent group-hover:scale-110 transition-transform"></i> Download Official Report
                        </button>
                    </div>

                    {/* Subject Attendance Cards */}
                    {attendanceData.length === 0 ? (
                        <div className="md:col-span-2 xl:col-span-3 flex flex-col items-center justify-center py-16 lg:py-24 text-center border-2 border-dashed border-themeBorder rounded-themePanel bg-themeApp px-4 print:border-gray-400 print:bg-transparent">
                            <i className={`fa-solid fa-book-blank text-4xl lg:text-5xl ${theme.text.muted} mb-4 print:text-gray-400`}></i>
                            <p className="text-themeText font-bold text-sm lg:text-base print:text-black">No Verified Records</p>
                            <p className={`${theme.text.secondary} text-[10px] lg:text-xs mt-1 lg:mt-2 font-bold uppercase tracking-widest print:text-gray-600`}>Your professors have not published any verified attendance logs yet.</p>
                        </div>
                    ) : (
                        attendanceData.map((subject, index) => {
                            const percentage = subject.total_classes === 0 ? 0 : Math.round((subject.attended_classes / subject.total_classes) * 100);
                            const radius = 36;
                            const circumference = 2 * Math.PI * radius;
                            const strokeDashoffset = circumference - (percentage / 100) * circumference;

                            return (
                                <div 
                                    key={index} 
                                    onClick={() => setActiveSubject(subject)}
                                    className={`${theme.layout.panel} border-theme border-themeBorder p-5 lg:p-6 rounded-themePanel lg:rounded-themePanel hover:border-themeAccent/50 hover:shadow-[0_0_20px_rgba(250,204,21,0.1)] transition-all duration-300 group flex items-center gap-5 lg:gap-6 cursor-pointer print:border-gray-300 print:shadow-none print:bg-white active:scale-[0.98] relative overflow-hidden`}
                                >
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <i className="fa-solid fa-arrow-up-right-from-square text-themeTextSec text-xs"></i>
                                    </div>

                                    {/* SVG Progress Ring */}
                                    <div className="relative w-20 h-20 lg:w-24 lg:h-24 shrink-0 print:drop-shadow-none">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-neutral-800 print:text-gray-200" />
                                            <circle
                                                cx="48" cy="48" r={radius}
                                                stroke="currentColor" strokeWidth="8" fill="transparent"
                                                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                                                className={`${getRingColor(percentage)} transition-all duration-1000 ease-out print:text-gray-800`}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-lg lg:text-xl font-black text-themeText print:text-black">{percentage}%</span>
                                        </div>
                                    </div>

                                    {/* Subject Details */}
                                    <div className="flex-1 w-full min-w-0">
                                        <p className={`text-[9px] lg:text-[10px] font-black ${theme.text.muted} uppercase tracking-widest mb-1 print:text-gray-500 truncate`}>{subject.course_code}</p>
                                        <h3 className="text-base lg:text-lg font-black text-themeText leading-tight mb-2 group-hover:text-emerald-400 transition-colors print:text-black truncate">{subject.course_name}</h3>
                                        <p className={`text-[9px] lg:text-[10px] font-bold ${theme.text.secondary} uppercase tracking-widest mb-3 lg:mb-4 flex items-center gap-1.5 print:text-gray-600 truncate`}>
                                            <i className="fa-solid fa-user-tie text-themeAccent/50 print:text-gray-400"></i> <span className="truncate">{subject.faculty_name}</span>
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] lg:text-xs font-bold bg-themePanel w-fit px-3 py-1.5 rounded-lg border-theme border-themeBorder print:bg-gray-100 print:border-gray-300 print:shadow-none">
                                            <span className="text-themeText print:text-black">{subject.attended_classes}</span>
                                            <span className={`${theme.text.muted} print:text-gray-600`}>/ {subject.total_classes} Classes</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* 4. SUBJECT DRILL-DOWN MODAL */}
            {activeSubject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/95 backdrop-blur-md p-4 animate-fade-in no-print">
                    <div className="bg-themePanel border-theme border-themeBorder p-6 lg:p-8 rounded-themePanel flex flex-col max-w-2xl w-full max-h-[90vh] relative shadow-2xl overflow-hidden">
                        
                        {/* Header Area */}
                        <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-themeAccent mb-1">{activeSubject.course_code}</p>
                                <h2 className="text-2xl font-black text-themeText tracking-tight">{activeSubject.course_name}</h2>
                                <p className="text-xs text-themeTextSec mt-1"><i className="fa-solid fa-user-tie"></i> Prof. {activeSubject.faculty_name}</p>
                            </div>
                            <button onClick={() => setActiveSubject(null)} className="w-10 h-10 flex items-center justify-center text-themeTextSec opacity-70 hover:text-white bg-themeElevated rounded-full border-theme border-themeBorderStrong transition-colors shrink-0">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        {/* Predictive Math & QR Area */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-themeElevated p-5 rounded-themePanel border-theme border-themeBorder flex flex-col justify-center">
                                {(() => {
                                    const percentage = activeSubject.total_classes === 0 ? 0 : Math.round((activeSubject.attended_classes / activeSubject.total_classes) * 100);
                                    if (percentage >= 75) {
                                        const safeMisses = Math.floor(activeSubject.attended_classes / 0.75) - activeSubject.total_classes;
                                        return (
                                            <>
                                                <p className="text-emerald-400 text-sm font-black mb-1"><i className="fa-solid fa-shield-check mr-1"></i> You are Safe ({percentage}%)</p>
                                                <p className="text-xs text-themeTextSec font-medium">You can afford to miss <strong className="text-themeText">{safeMisses}</strong> more classes and remain above 75%.</p>
                                            </>
                                        );
                                    } else {
                                        const classesNeeded = Math.ceil((0.75 * activeSubject.total_classes - activeSubject.attended_classes) / 0.25);
                                        return (
                                            <>
                                                <p className="text-rose-400 text-sm font-black mb-1"><i className="fa-solid fa-triangle-exclamation mr-1"></i> Under 75% Mandate ({percentage}%)</p>
                                                <p className="text-xs text-themeTextSec font-medium">You need to attend <strong className="text-white">{classesNeeded}</strong> more consecutive classes to reach 75%.</p>
                                            </>
                                        );
                                    }
                                })()}
                            </div>
                            <div className="bg-gradient-to-br from-blue-900/20 to-blue-500/10 border border-blue-500/20 p-5 rounded-themePanel flex flex-col justify-between items-center text-center">
                                <div>
                                    <p className="text-xs font-black text-blue-400 mb-1">Live Class Session</p>
                                    <p className="text-[10px] text-themeTextSec font-medium max-w-[200px]">Faculty generates a unique, rotating QR token. Manual overrides allowed.</p>
                                </div>
                                <button 
                                    onClick={() => setShowScanner(true)}
                                    className="mt-3 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                >
                                    <i className="fa-solid fa-expand"></i> Launch QR Scanner
                                </button>
                            </div>
                        </div>

                        {/* Chronological Ledger */}
                        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar border border-[#222] rounded-xl bg-[#0a0a0a]">
                            <div className="sticky top-0 bg-[#121212] border-b border-[#222] p-3 z-10 flex justify-between items-center">
                                <h3 className="text-xs font-black uppercase tracking-widest text-themeTextSec">Chronological Ledger</h3>
                                <span className="text-[10px] text-themeTextSec">{activeSubject.records.length} Records</span>
                            </div>
                            <div className="p-3 flex flex-col gap-2">
                                {activeSubject.records.length === 0 ? (
                                    <p className="text-xs text-themeTextSec text-center py-8">No attendance records found.</p>
                                ) : (
                                    activeSubject.records.map((rec) => {
                                        const d = new Date(rec.timestamp);
                                        return (
                                            <div key={rec.id} className="flex items-center justify-between p-3 bg-[#161616] border border-[#222] rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-md flex items-center justify-center border ${
                                                        rec.status === 'present' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                                        rec.status === 'absent' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                                                        'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                                    }`}>
                                                        <i className={`fa-solid ${
                                                            rec.status === 'present' ? 'fa-check' :
                                                            rec.status === 'absent' ? 'fa-xmark' : 'fa-shield'
                                                        }`}></i>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                                        <p className="text-[10px] text-gray-500 font-medium">{d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                    rec.status === 'present' ? 'text-emerald-400' :
                                                    rec.status === 'absent' ? 'text-rose-400' : 'text-amber-400'
                                                }`}>
                                                    {rec.status}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. LIVE QR SCANNER MODAL */}
            {showScanner && (
                <div className="fixed inset-0 z-[60] flex flex-col bg-black animate-fade-in no-print">
                    {/* Header Overlay */}
                    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
                        <button onClick={() => setShowScanner(false)} className="w-10 h-10 flex items-center justify-center text-white bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-colors">
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>
                        <div className="text-center">
                            <p className="text-xs font-black text-white uppercase tracking-widest">{activeSubject?.course_code}</p>
                            <p className="text-[10px] text-white/70 uppercase">Live Scanner</p>
                        </div>
                        <div className="w-10 h-10"></div> {/* Spacer for alignment */}
                    </div>

                    {/* Camera Simulation View */}
                    <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                        {/* Fake Camera Feed Background */}
                        <div className="absolute inset-0 bg-[#121212] opacity-80" style={{ backgroundImage: 'radial-gradient(circle at center, #222 0%, #000 100%)' }}></div>
                        
                        {/* Targeting Reticle */}
                        <div className="relative w-72 h-72 z-10">
                            {/* Reticle Corners */}
                            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>

                            {/* Laser Line */}
                            <div className="absolute left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)] animate-[scan_2s_ease-in-out_infinite]"></div>

                            {/* Scan Success Overlay */}
                            {scanSuccess && (
                                <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 backdrop-blur-sm rounded-xl animate-fade-in border border-emerald-500/50">
                                    <div className="flex flex-col items-center">
                                        <i className="fa-solid fa-check-circle text-6xl text-emerald-400 mb-2 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]"></i>
                                        <p className="text-white font-black uppercase tracking-widest text-sm drop-shadow-md">Verified</p>
                                    </div>
                                </div>
                            )}

                            <style jsx>{`
                                @keyframes scan {
                                    0% { top: 5%; opacity: 0; }
                                    10% { opacity: 1; }
                                    90% { opacity: 1; }
                                    100% { top: 95%; opacity: 0; }
                                }
                            `}</style>
                        </div>
                    </div>

                    {/* Footer Overlay */}
                    <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-center z-10 bg-gradient-to-t from-black/90 to-transparent">
                        <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-4 py-2 rounded-full mb-6 backdrop-blur-md">
                            <i className="fa-solid fa-shield-halved text-blue-400"></i>
                            <p className="text-[10px] text-blue-100 font-bold uppercase tracking-widest">Anti-Spoofing Enabled: Short-Lived Token required</p>
                        </div>
                        
                        <button 
                            onClick={handleSimulateScan}
                            disabled={scanSuccess}
                            className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-sm rounded-full w-full max-w-sm hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                        >
                            <i className="fa-solid fa-camera"></i> Simulate Scan
                        </button>
                        <p className="text-xs text-white/50 mt-4 font-medium text-center max-w-xs">Scan the rotating QR code projected by your professor. Photos sent via messaging apps will be rejected.</p>
                    </div>
                </div>
            )}
        </div>
    );
}