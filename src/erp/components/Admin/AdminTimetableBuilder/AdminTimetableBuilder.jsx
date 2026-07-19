/* eslint-disable */
import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../context/ErpContext";
import { supabase } from "../../../LIB/supabase/supabaseClient"; 
import BarCompliance from "./BarCompliance";
import AutoGenerator from "./AutoGenerator";
import AdminElectiveResolution from "./AdminElectiveResolution";

export default function AdminTimetableBuilder() {
    const { batches, faculty, rooms, subjects } = useERP();

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];

    const [selectedBatch, setSelectedBatch] = useState(batches?.[0]?.id || "");
    const [paintMode, setPaintMode] = useState(false); 

    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [selectedRoom, setSelectedRoom] = useState("");
    const [selectedType, setSelectedType] = useState("Lecture");

    const [activeTab, setActiveTab] = useState("Timetable");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Database Timetable State
    const [dbTimetable, setDbTimetable] = useState({}); // { day: { "09:00 AM": slotObj } }
    const [isLoadingTimetable, setIsLoadingTimetable] = useState(false);
    const [mobileSelectedDay, setMobileSelectedDay] = useState(days[0]);

    // Subject Form
    const [subjName, setSubjName] = useState("");
    const [subjCode, setSubjCode] = useState("");
    const [subjCredits, setSubjCredits] = useState("");
    const [subjBatch, setSubjBatch] = useState(batches?.[0]?.id || "");
    const [subjIsElective, setSubjIsElective] = useState(false);
    const [subjMaxSeats, setSubjMaxSeats] = useState("");

    // Module Form
    const [modSubject, setModSubject] = useState("");
    const [modTitle, setModTitle] = useState("");
    const [modContent, setModContent] = useState("");

    useEffect(() => {
        if (selectedBatch) {
            fetchTimetable();
        }
    }, [selectedBatch]);

    // --- Time Formatters ---
    const formatToDBTime = (timeStr) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours, 10);
        if (hours === 12) hours = 0;
        if (modifier === 'PM') hours += 12;
        return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
    };

    const formatToUITime = (dbTimeStr) => {
        // "09:00:00" -> "09:00 AM"
        if(!dbTimeStr) return "";
        let [hours, minutes] = dbTimeStr.split(':');
        hours = parseInt(hours, 10);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    };

    const getEndTimeStr = (startTimeStr, type) => {
        const [time, modifier] = startTimeStr.split(' ');
        let [hours, minutes] = time.split(':');
        let h = parseInt(hours, 10);

        let addedMins = type === "Practical" ? 120 : 90;
        let totalMins = parseInt(minutes, 10) + addedMins;

        h += Math.floor(totalMins / 60);
        let m = totalMins % 60;

        let newMod = modifier;
        if (h >= 12) {
            if (h > 12) h -= 12;
            if (modifier === 'AM') newMod = 'PM';
        }

        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${newMod}`;
    };

    // --- DB Interactions ---
    const fetchTimetable = async () => {
        setIsLoadingTimetable(true);
        try {
            const { data, error } = await supabase
                .from('timetable')
                .select('*, subjects(name, code), profiles:auth.users!timetable_faculty_id_fkey(full_name)')
                .eq('batch_id', selectedBatch);

            if (error) throw error;

            // Manual join mapping if needed since profiles references auth.users implicitly
            // To be totally safe, we fetch profiles directly for the mapped IDs
            const facultyIds = data.map(d => d.faculty_id);
            const { data: profData } = await supabase.from('profiles').select('id, full_name').in('id', facultyIds);
            
            const grid = {};
            data.forEach(slot => {
                const day = slot.day_of_week;
                const uiStart = formatToUITime(slot.start_time);
                if (!grid[day]) grid[day] = {};
                
                const profName = profData?.find(p => p.id === slot.faculty_id)?.full_name || "Unknown Faculty";
                
                grid[day][uiStart] = {
                    id: slot.id,
                    subject: slot.subjects?.name || "Unknown",
                    subject_code: slot.subjects?.code,
                    facultyName: profName,
                    room: slot.room,
                    endTime: formatToUITime(slot.end_time)
                };
            });
            setDbTimetable(grid);
        } catch (err) {
            console.error("Error fetching timetable:", err);
        } finally {
            setIsLoadingTimetable(false);
        }
    };

    const handleCellClick = async (day, time) => {
        const slot = getSlot(day, time);

        if (paintMode && isToolboxReady) {
            if (slot) {
                window.erpDialog.alert("Slot is already occupied. Use Eraser first.");
                return;
            }
            
            setIsSubmitting(true);
            try {
                // Find IDs
                const subjectObj = subjects.find(s => s.code === selectedSubject);
                const dbStartTime = formatToDBTime(time);
                const dbEndTime = formatToDBTime(getEndTimeStr(time, selectedType));

                const { error } = await supabase.from('timetable').insert({
                    day_of_week: day,
                    start_time: dbStartTime,
                    end_time: dbEndTime,
                    subject_id: subjectObj.id,
                    faculty_id: selectedFaculty,
                    batch_id: selectedBatch,
                    room: `${selectedRoom} (${selectedType})` // Embed type here since it's not in schema
                });
                
                if (error) throw error;
                fetchTimetable();
            } catch(e) {
                console.error(e);
                window.erpDialog.alert("Failed to assign slot.");
            } finally {
                setIsSubmitting(false);
            }
        } else if (!paintMode && slot) {
            setIsSubmitting(true);
            try {
                const { error } = await supabase.from('timetable').delete().eq('id', slot.id);
                if (error) throw error;
                fetchTimetable();
            } catch(e) {
                console.error(e);
                window.erpDialog.alert("Failed to delete slot.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const getSlot = (day, time) => {
        return dbTimetable[day]?.[time] || null;
    };

    const isToolboxReady = selectedSubject !== "" && selectedFaculty !== "" && selectedRoom !== "";

    // --- UI Render ---
    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in selection:bg-themeElevated">
            
            {/* HEADER BANNER */}
            <div className="bg-themeElevated rounded-themePanel p-6 lg:p-8 relative overflow-hidden border-theme border-themeBorder text-themeText flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-themeElevated">
                <div className="absolute top-0 right-0 w-64 h-64 lg:w-96 lg:h-96 bg-themeElevated rounded-full lg:-translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 lg:w-64 lg:h-64 bg-indigo-500/10 rounded-full lg:translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                <div className="relative z-10 w-full lg:w-auto flex-1">
                    <div className="flex items-center gap-4 lg:gap-5 mb-3 lg:mb-2">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-themePanel bg-themeElevated border-theme border-themeBorderStrong flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-calendar-plus text-themeAccent text-2xl lg:text-3xl"></i>
                        </div>
                        <div>
                            <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-themeText mb-1`}>Timetable Builder</h1>
                            <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium`}>Instantly publish live schedules directly to the database.</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 w-full lg:w-auto min-w-[280px]">
                    <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeAccent mb-1.5 ml-1`}>Target Batch (Curriculum)</label>
                    <div className="relative">
                        <select
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            className="w-full bg-themePanel border-theme border-themeBorderStrong text-themeText rounded-themePanel px-4 py-3 lg:py-3.5 text-xs lg:text-sm font-bold outline-none focus:border-themeAccent focus:ring-2 focus:ring-themeAccent/20 appearance-none cursor-pointer transition-all"
                        >
                            {batches?.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                        <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec opacity-70 pointer-events-none text-xs"></i>
                    </div>
                </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex bg-themeElevated p-1.5 rounded-xl border-theme border-themeBorder w-fit overflow-x-auto max-w-full">
                <button onClick={() => setActiveTab("Timetable")} className={`whitespace-nowrap px-6 py-2.5 rounded-lg text-xs lg:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'Timetable' ? 'bg-themeAccent text-themeText shadow-lg' : 'text-themeTextSec hover:text-themeText'}`}>Grid</button>
                <button onClick={() => setActiveTab("Subjects")} className={`whitespace-nowrap px-6 py-2.5 rounded-lg text-xs lg:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'Subjects' ? 'bg-themeAccent text-themeText shadow-lg' : 'text-themeTextSec hover:text-themeText'}`}>Subjects</button>
                <button onClick={() => setActiveTab("Modules")} className={`whitespace-nowrap px-6 py-2.5 rounded-lg text-xs lg:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'Modules' ? 'bg-themeAccent text-themeText shadow-lg' : 'text-themeTextSec hover:text-themeText'}`}>Modules</button>
                <button onClick={() => setActiveTab("ElectiveResolution")} className={`whitespace-nowrap px-6 py-2.5 rounded-lg text-xs lg:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'ElectiveResolution' ? 'bg-themeAccent text-themeText shadow-lg' : 'text-themeTextSec hover:text-themeText'}`}>Electives</button>
                <button onClick={() => setActiveTab("BarCompliance")} className={`whitespace-nowrap px-6 py-2.5 rounded-lg text-xs lg:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'BarCompliance' ? 'bg-themeAccent text-themeText shadow-lg' : 'text-themeTextSec hover:text-themeText'}`}>Bar Compliance</button>
            </div>

            {activeTab === "Timetable" && (
                <div className="flex flex-col w-full gap-4">
                    <AutoGenerator batches={batches} subjects={subjects} onGenerateComplete={() => fetchTimetable()} />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                        {/* TOOLBOX (Configurator) */}
                        <div className="lg:col-span-3 flex flex-col gap-6">
                            <div className={`${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-5 flex flex-col gap-5 sticky top-20 z-20 shadow-themeElevated`}>
                                <div>
                                    <h2 className={`${theme.text.heading} text-lg text-themeText tracking-tight`}><i className="fa-solid fa-screwdriver-wrench text-themeAccent mr-2"></i>Toolbox</h2>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label className={`block text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-1.5`}>Subject</label>
                                        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-lg px-3 py-2.5 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-all">
                                            <option value="">-- Select Subject --</option>
                                            {subjects?.filter(s => s.batch_id === selectedBatch).map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`block text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-1.5`}>Faculty</label>
                                        <select value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.target.value)} className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-lg px-3 py-2.5 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-all">
                                            <option value="">-- Select Faculty --</option>
                                            {faculty?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={`block text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-1.5`}>Room</label>
                                            <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-lg px-3 py-2.5 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-all">
                                                <option value="">-- Room --</option>
                                                {rooms?.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-1.5`}>Type</label>
                                            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-lg px-3 py-2.5 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-all">
                                                <option value="Lecture">Lecture</option>
                                                <option value="Seminar">Seminar</option>
                                                <option value="Practical">Practical</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t-theme border-themeBorder flex gap-2">
                                    <button onClick={() => setPaintMode(true)} disabled={!isToolboxReady || isSubmitting} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${paintMode && isToolboxReady ? 'bg-themeAccent text-themeText shadow-lg' : !isToolboxReady ? 'bg-themeElevated text-neutral-600 border border-themeBorder' : 'bg-themeElevated border border-themeBorderStrong hover:border-themeAccent hover:text-themeAccent text-themeText'}`}>
                                        <i className="fa-solid fa-paint-roller mr-1"></i> Paint
                                    </button>
                                    <button onClick={() => setPaintMode(false)} disabled={isSubmitting} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!paintMode ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-themeElevated border border-themeBorderStrong hover:border-rose-500 hover:text-rose-500 text-themeText'}`}>
                                        <i className="fa-solid fa-eraser mr-1"></i> Eraser
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* DESKTOP TIMETABLE VIEW (Hidden on Mobile) */}
                        <div className="hidden lg:flex col-span-9 bg-themePanel rounded-themePanel border-theme border-themeBorder overflow-hidden flex-col min-h-[600px] h-full relative z-10 shadow-themeElevated">
                            {isLoadingTimetable && (
                                <div className="absolute inset-0 bg-themePanel/80 backdrop-blur-sm z-50 flex items-center justify-center">
                                    <i className="fa-solid fa-circle-notch fa-spin text-3xl text-themeAccent"></i>
                                </div>
                            )}
                            <div className="overflow-auto flex-1 no-scrollbar relative">
                                <table className="w-full text-left border-collapse min-w-[800px] h-full table-fixed">
                                    <thead>
                                        <tr>
                                            <th className="bg-themeElevated border-b-theme border-r-theme border-themeBorder p-4 w-28 sticky left-0 top-0 z-30"><span className={`text-[10px] font-black ${theme.text.muted} uppercase tracking-widest`}>Time</span></th>
                                            {days.map(day => (
                                                <th key={day} className="bg-themeElevated border-b-theme border-r-theme border-themeBorder p-4 text-center sticky top-0 z-20 w-40">
                                                    <span className="text-[10px] font-black text-themeText uppercase tracking-widest">{day}</span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {timeSlots.map((time) => (
                                            <tr key={time} className="border-b-theme border-themeBorder group">
                                                <td className="p-4 border-r-theme border-themeBorder bg-themeElevated sticky left-0 z-10 w-28 text-center group-hover:bg-themePanel transition-colors">
                                                    <span className="text-sm font-black text-themeText">{time.split(" ")[0]}</span>
                                                    <span className={`block text-[9px] font-bold ${theme.text.muted} uppercase tracking-widest mt-0.5`}>{time.split(" ")[1]}</span>
                                                </td>

                                                {days.map(day => {
                                                    const slot = getSlot(day, time);
                                                    return (
                                                        <td key={`${day}-${time}`} onClick={() => handleCellClick(day, time)} className={`p-2 border-r-theme border-themeBorder relative transition-all duration-200 cursor-pointer h-28 align-top ${paintMode && !slot && isToolboxReady ? 'hover:bg-themeElevated hover:border-themeAccent/50' : !paintMode && slot ? 'hover:bg-rose-500/10 hover:border-rose-500/50' : 'hover:bg-themeElevated'} bg-themeApp`}>
                                                            {slot ? (
                                                                <div className="w-full h-full bg-themePanel border-theme border-themeBorderStrong rounded-lg p-2.5 flex flex-col justify-between group/slot relative overflow-hidden shadow-sm">
                                                                    {!paintMode && (
                                                                        <div className="absolute inset-0 bg-rose-500/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-all duration-200 z-10">
                                                                            <i className="fa-solid fa-trash-can text-white text-xl"></i>
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <p className="text-xs font-black text-themeText mb-1 truncate leading-tight" title={slot.subject}>{slot.subject}</p>
                                                                        <div className="flex flex-col gap-0.5">
                                                                            <span className={`text-[9px] font-bold uppercase tracking-widest ${theme.text.secondary} truncate`}><i className="fa-solid fa-user-tie text-themeAccent mr-1.5"></i> {slot.facultyName}</span>
                                                                            <span className={`text-[9px] font-bold uppercase tracking-widest ${theme.text.secondary} truncate`}><i className="fa-solid fa-location-dot text-themeAccent mr-1.5"></i> {slot.room}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex justify-between items-end mt-2 pt-1.5 border-t-theme border-themeBorder">
                                                                        <span className={`text-[9px] font-bold ${theme.text.muted}`}>{time.split(' ')[0]} - {slot.endTime?.split(' ')[0]}</span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-transparent rounded-lg transition-all">
                                                                    {paintMode && isToolboxReady && <i className="fa-solid fa-plus text-themeAccent/40 text-xl opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200"></i>}
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* MOBILE TIMETABLE VIEW (List layout, Hidden on Desktop) */}
                        <div className="lg:hidden flex flex-col gap-4">
                            {/* Day Selector */}
                            <div className="flex bg-themePanel p-1 rounded-lg border-theme border-themeBorder overflow-x-auto no-scrollbar">
                                {days.map(day => (
                                    <button 
                                        key={day} 
                                        onClick={() => setMobileSelectedDay(day)}
                                        className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded transition-colors whitespace-nowrap ${mobileSelectedDay === day ? 'bg-themeElevated text-themeAccent shadow-sm' : 'text-themeTextSec'}`}
                                    >
                                        {day.substring(0,3)}
                                    </button>
                                ))}
                            </div>

                            {/* Mobile Slots List */}
                            <div className="flex flex-col gap-3 relative">
                                {isLoadingTimetable && (
                                    <div className="absolute inset-0 bg-themeApp/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
                                        <i className="fa-solid fa-circle-notch fa-spin text-2xl text-themeAccent"></i>
                                    </div>
                                )}
                                
                                {timeSlots.map(time => {
                                    const slot = getSlot(mobileSelectedDay, time);
                                    return (
                                        <div 
                                            key={time} 
                                            onClick={() => handleCellClick(mobileSelectedDay, time)}
                                            className={`${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-4 flex gap-4 items-center relative overflow-hidden transition-all ${paintMode && !slot && isToolboxReady ? 'active:scale-[0.98] border-themeAccent/50 bg-themeElevated' : !paintMode && slot ? 'active:scale-[0.98] border-rose-500/50 bg-rose-500/5' : ''}`}
                                        >
                                            <div className="flex flex-col items-center justify-center w-14 shrink-0 border-r-theme border-themeBorderStrong pr-4">
                                                <span className="text-sm font-black text-themeText">{time.split(' ')[0]}</span>
                                                <span className="text-[9px] font-bold text-themeTextSec uppercase">{time.split(' ')[1]}</span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                {slot ? (
                                                    <div className="flex flex-col gap-1">
                                                        <p className="text-xs font-black text-themeText truncate">{slot.subject}</p>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-[10px] font-bold text-themeTextSec truncate"><i className="fa-solid fa-user-tie text-themeAccent mr-1"></i> {slot.facultyName.split(' ')[0]}</span>
                                                            <span className="text-[10px] font-bold text-themeTextSec truncate"><i className="fa-solid fa-location-dot text-themeAccent mr-1"></i> {slot.room}</span>
                                                        </div>
                                                        {!paintMode && (
                                                            <div className="absolute top-2 right-2 bg-rose-500/10 text-rose-500 px-2 py-1 rounded text-[9px] font-black uppercase">
                                                                Tap to Erase
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center h-full opacity-40">
                                                        {paintMode && isToolboxReady ? (
                                                            <span className="text-[10px] font-black uppercase text-themeAccent"><i className="fa-solid fa-plus mr-1"></i> Tap to Paint</span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold uppercase text-themeTextSec">Empty Slot</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* OTHER TABS (Unchanged layout for Subjects/Modules to save space) */}
            {activeTab === "Subjects" && (
                <div className="bg-themePanel p-6 rounded-themePanel border-theme border-themeBorder max-w-2xl">
                    <h2 className="text-lg font-black text-themeText mb-4"><i className="fa-solid fa-book-medical text-themeAccent mr-2"></i>Create New Subject</h2>
                    <form className="flex flex-col gap-4" onSubmit={async (e) => {
                        e.preventDefault();
                        setIsSubmitting(true);
                        try {
                            await supabase.from("subjects").insert({ name: subjName, code: subjCode, credits: parseInt(subjCredits), batch_id: subjBatch, is_elective: subjIsElective, max_seats: subjIsElective ? parseInt(subjMaxSeats) : null, category: subjIsElective ? 'Elective' : 'Core' });
                            window.erpDialog.alert("Subject Created Successfully!");
                            setSubjName(""); setSubjCode(""); setSubjCredits(""); setSubjIsElective(false); setSubjMaxSeats("");
                        } catch(err) { console.error(err); } finally { setIsSubmitting(false); }
                    }}>
                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="Subject Name" required value={subjName} onChange={e=>setSubjName(e.target.value)} className="w-full bg-themeElevated border-theme border-themeBorder rounded-lg px-4 py-3 text-sm text-themeText focus:border-themeAccent outline-none" />
                            <input placeholder="Subject Code" required value={subjCode} onChange={e=>setSubjCode(e.target.value)} className="w-full bg-themeElevated border-theme border-themeBorder rounded-lg px-4 py-3 text-sm text-themeText focus:border-themeAccent outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="Credits" required value={subjCredits} onChange={e=>setSubjCredits(e.target.value)} className="w-full bg-themeElevated border-theme border-themeBorder rounded-lg px-4 py-3 text-sm text-themeText focus:border-themeAccent outline-none" />
                            <select value={subjBatch} onChange={e=>setSubjBatch(e.target.value)} className="w-full bg-themeElevated border-theme border-themeBorder rounded-lg px-4 py-3 text-sm text-themeText focus:border-themeAccent outline-none">
                                <option value="">Select Batch</option>
                                {batches?.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <input type="checkbox" checked={subjIsElective} onChange={e=>setSubjIsElective(e.target.checked)} className="w-4 h-4 accent-themeAccent" />
                            <label className="text-themeText text-sm font-bold">Is Elective?</label>
                        </div>
                        {subjIsElective && (
                            <input type="number" placeholder="Max Seats" required value={subjMaxSeats} onChange={e=>setSubjMaxSeats(e.target.value)} className="w-full bg-themeElevated border-theme border-themeBorder rounded-lg px-4 py-3 text-sm text-themeText focus:border-themeAccent outline-none" />
                        )}
                        <button disabled={isSubmitting} type="submit" className="w-full bg-themeAccent text-themeText font-black uppercase tracking-widest text-xs py-3.5 rounded-lg hover:bg-themeAccentMuted transition-colors mt-2">{isSubmitting ? "Saving..." : "Create Subject"}</button>
                    </form>
                </div>
            )}

            {activeTab === "Modules" && (
                <div className="bg-themePanel p-6 rounded-themePanel border-theme border-themeBorder max-w-2xl">
                    <h2 className="text-lg font-black text-themeText mb-4"><i className="fa-solid fa-puzzle-piece text-themeAccent mr-2"></i>Create Course Module</h2>
                    <form className="flex flex-col gap-4" onSubmit={async (e) => {
                        e.preventDefault();
                        setIsSubmitting(true);
                        try {
                            await supabase.from("course_modules").insert({ subject_id: modSubject, module_title: modTitle, base_content: modContent });
                            window.erpDialog.alert("Module Created Successfully!");
                            setModTitle(""); setModContent("");
                        } catch(err) { console.error(err); } finally { setIsSubmitting(false); }
                    }}>
                        <select required value={modSubject} onChange={e=>setModSubject(e.target.value)} className="w-full bg-themeElevated border-theme border-themeBorder rounded-lg px-4 py-3 text-sm text-themeText focus:border-themeAccent outline-none">
                            <option value="">Select Subject</option>
                            {subjects?.map(s=><option key={s.id || s.code} value={s.id || s.code}>{s.name} ({s.code})</option>)}
                        </select>
                        <input placeholder="Module Title" required value={modTitle} onChange={e=>setModTitle(e.target.value)} className="w-full bg-themeElevated border-theme border-themeBorder rounded-lg px-4 py-3 text-sm text-themeText focus:border-themeAccent outline-none" />
                        <textarea placeholder="Base Content (Admin Draft)" required value={modContent} onChange={e=>setModContent(e.target.value)} className="w-full bg-themeElevated border-theme border-themeBorder rounded-lg px-4 py-3 text-sm text-themeText focus:border-themeAccent outline-none h-32 resize-none"></textarea>
                        <button disabled={isSubmitting} type="submit" className="w-full bg-themeAccent text-themeText font-black uppercase tracking-widest text-xs py-3.5 rounded-lg hover:bg-themeAccentMuted transition-colors mt-2">{isSubmitting ? "Saving..." : "Create Module"}</button>
                    </form>
                </div>
            )}

            {activeTab === "BarCompliance" && <BarCompliance />}
            {activeTab === "ElectiveResolution" && <AdminElectiveResolution />}

        </div>
    );
}