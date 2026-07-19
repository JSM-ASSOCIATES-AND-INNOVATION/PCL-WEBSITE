import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../LIB/supabase/supabaseClient';
import WeeklyChart from '../../../shared/WeeklyChart';

export default function ScheduleBuilder() {
    const [schedule, setSchedule] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [faculties, setFaculties] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Filter State
    const [selectedBatch, setSelectedBatch] = useState('BBA LL.B. (Hons.)'); // Example fallback
    
    // Form State
    const [subjectId, setSubjectId] = useState('');
    const [roomId, setRoomId] = useState('');
    const [facultyId, setFacultyId] = useState('');
    const [day, setDay] = useState(1);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Classrooms
            const { data: roomData } = await supabase.from('academic_classrooms').select('id, name').eq('status', 'Active');
            setRooms(roomData || []);
            if (roomData?.length > 0) setRoomId(roomData[0].id);

            // 2. Fetch Subjects (for the dropdown)
            const { data: subData } = await supabase.from('subjects').select('id, name, theme_color, faculty_id, faculty:profiles(full_name)');
            setSubjects(subData || []);
            if (subData?.length > 0) setSubjectId(subData[0].id);

            // 2.5 Fetch Faculties
            const { data: facData } = await supabase.from('profiles').select('id, full_name').eq('role', 'faculty');
            setFaculties(facData || []);

            // 3. Fetch Active Semesters (to construct batch names)
            const { data: semData } = await supabase.from('academic_semesters').select('id, name, programme').eq('is_active_globally', true);
            setSemesters(semData || []);
            if (semData?.length > 0 && !semData.find(s => `${s.programme} - ${s.name}` === selectedBatch)) {
                setSelectedBatch(`${semData[0].programme} - ${semData[0].name}`);
            }

            // 4. Fetch actual schedule for the selected batch
            if (selectedBatch) {
                const { data: schedData, error } = await supabase
                    .from('class_schedule')
                    .select(`
                        id, batch, day_of_week, start_time, end_time,
                        subject:subjects(name, theme_color, faculty:profiles(full_name)),
                        room:academic_classrooms(name),
                        faculty:profiles(full_name)
                    `)
                    .eq('batch', selectedBatch);
                
                if (error) throw error;
                
                // Transform to match WeeklyChart expected format
                const daysMap = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };
                
                const formatted = (schedData || []).map(s => ({
                    id: s.id,
                    day: daysMap[s.day_of_week],
                    time: s.start_time.slice(0, 5), // '09:00:00' -> '09:00'
                    endTime: s.end_time.slice(0, 5),
                    subject: s.subject?.name,
                    color: s.subject?.theme_color,
                    room: s.room?.name,
                    faculty: s.faculty?.full_name || s.subject?.faculty?.full_name,
                }));
                
                setSchedule(formatted);
            }
        } catch (err) {
            console.error("Failed to fetch schedule data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedBatch]);

    useEffect(() => {
        if (subjectId && subjects.length > 0) {
            const selectedSub = subjects.find(s => s.id === subjectId);
            if (selectedSub && selectedSub.faculty_id) {
                setFacultyId(selectedSub.faculty_id);
            } else {
                setFacultyId('');
            }
        }
    }, [subjectId, subjects]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('class_schedule').insert([{
                batch: selectedBatch,
                subject_id: subjectId,
                room_id: roomId,
                faculty_id: facultyId || null,
                day_of_week: parseInt(day),
                start_time: startTime,
                end_time: endTime,
                status: 'Scheduled'
            }]);

            if (error) throw error;

            setIsCreating(false);
            fetchData();
        } catch (err) {
            console.error("Failed to add class:", err);
            window.erpDialog?.alert("Error adding class. Check console.");
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-black text-themeText">Timetable Builder</h2>
                    <p className="text-xs font-bold text-themeTextSec">Construct exact schedules directly injected into student and faculty feeds.</p>
                </div>
                
                <div className="flex gap-4 items-center w-full md:w-auto">
                    <div className="relative">
                        <i className="fa-solid fa-layer-group absolute left-4 top-1/2 -translate-y-1/2 text-themeTextSec text-xs"></i>
                        <select 
                            value={selectedBatch} 
                            onChange={e => setSelectedBatch(e.target.value)} 
                            className="bg-themeElevated border border-themeBorderStrong rounded-xl pl-10 pr-4 py-2 text-sm font-bold text-themeText outline-none appearance-none"
                        >
                            {semesters.map(s => (
                                <option key={s.id} value={`${s.programme} - ${s.name}`}>{s.programme} - {s.name}</option>
                            ))}
                        </select>
                    </div>

                    <button onClick={() => setIsCreating(!isCreating)} className="bg-themeAccent text-[#0a0a0a] px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity whitespace-nowrap">
                        {isCreating ? <><i className="fa-solid fa-xmark mr-2"></i> Cancel</> : <><i className="fa-solid fa-plus mr-2"></i> Add Class</>}
                    </button>
                </div>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="bg-themeElevated border border-themeBorderStrong rounded-2xl p-6 flex flex-col gap-4 shadow-lg animate-fade-in">
                    <h3 className="text-sm font-black text-themeText">Schedule New Class for {selectedBatch}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Subject</label>
                            <select value={subjectId} onChange={e => setSubjectId(e.target.value)} required className="w-full bg-themePanel border border-themeBorder focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none appearance-none">
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Day</label>
                            <select value={day} onChange={e => setDay(e.target.value)} required className="w-full bg-themePanel border border-themeBorder focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none appearance-none">
                                <option value="1">Monday</option>
                                <option value="2">Tuesday</option>
                                <option value="3">Wednesday</option>
                                <option value="4">Thursday</option>
                                <option value="5">Friday</option>
                                <option value="6">Saturday</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Start Time</label>
                            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required className="w-full bg-themePanel border border-themeBorder focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none color-scheme-dark" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">End Time</label>
                            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required className="w-full bg-themePanel border border-themeBorder focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none color-scheme-dark" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mt-2">
                        <div className="lg:col-span-2">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec block">Faculty</label>
                                {subjects.find(s => s.id === subjectId)?.faculty_id && (
                                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">Auto-Assigned</span>
                                )}
                            </div>
                            <select value={facultyId} onChange={e => setFacultyId(e.target.value)} required className="w-full bg-themePanel border border-themeBorder focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none appearance-none">
                                <option value="">-- Select Faculty --</option>
                                {faculties.map(f => <option key={f.id} value={f.id}>{f.full_name}</option>)}
                            </select>
                        </div>
                        <div className="lg:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Classroom</label>
                            <select value={roomId} onChange={e => setRoomId(e.target.value)} required className="w-full bg-themePanel border border-themeBorder focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none appearance-none">
                                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                        <div className="lg:col-span-2 flex justify-end items-end">
                            <button type="submit" className="bg-themeAccent text-[#0a0a0a] px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg w-full">
                                Add to Grid
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-themeAccent border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <WeeklyChart schedule={schedule} role="admin" />
            )}
        </div>
    );
}
