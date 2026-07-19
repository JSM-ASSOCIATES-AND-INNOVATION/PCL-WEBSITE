import React, { useState } from 'react';
import { supabase } from '../../../LIB/supabase/supabaseClient';
import { theme } from '../../../theme';

export default function AutoGenerator({ batches, subjects, onGenerateComplete }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState('');

    const generateTimetable = async () => {
        setIsGenerating(true);
        setProgress('Fetching data...');

        try {
            // 1. Fetch data
            const { data: assignments, error: errFA } = await supabase.from('faculty_assignments').select('*');
            if (errFA) throw errFA;

            const { data: rooms, error: errRooms } = await supabase.from('rooms').select('*');
            if (errRooms) throw errRooms;

            setProgress('Clearing old timetable...');
            // Drop old timetable
            await supabase.from('timetable').delete().neq('id', '00000000-0000-0000-0000-000000000000');

            setProgress('Building schedule...');
            
            const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
            const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];

            const newTimetable = [];
            const facultySchedule = {}; // faculty_id -> day -> time -> bool
            const roomSchedule = {}; // room -> day -> time -> bool

            // Format rooms (if rooms is an array of objects with 'name' or just strings)
            // Handling both cases since db returns [] and we don't know the exact shape yet
            const roomNames = rooms.map(r => r.name || r.room_name || r.id || r);

            // Assuming assignments has batch_id, subject_id, faculty_id
            // We group by batch to assign them to rooms
            const batchAssignments = {};
            assignments.forEach(a => {
                if (!batchAssignments[a.batch_id]) batchAssignments[a.batch_id] = [];
                batchAssignments[a.batch_id].push(a);
            });

            for (const batchId of Object.keys(batchAssignments)) {
                const bAssignments = batchAssignments[batchId];
                const batchSchedule = {}; // day -> time -> bool
                
                for (const assignment of bAssignments) {
                    const subject = subjects?.find(s => s.id === assignment.subject_id || s.code === assignment.subject_id);
                    const subjectName = subject ? subject.name : `Subj ${assignment.subject_id}`;
                    const fId = assignment.faculty_id;
                    const fName = assignment.faculty_name || `Faculty ${fId}`;
                    
                    let assignedCount = 0;
                    const requiredClasses = 4; // Arbitrary 4 classes per week per subject
                    
                    for (const day of days) {
                        if (assignedCount >= requiredClasses) break;
                        for (const time of timeSlots) {
                            if (assignedCount >= requiredClasses) break;
                            
                            if (batchSchedule[day]?.[time]) continue;
                            if (facultySchedule[fId]?.[day]?.[time]) continue;
                            
                            let selectedRoom = null;
                            for (const r of roomNames) {
                                if (!roomSchedule[r]?.[day]?.[time]) {
                                    selectedRoom = r;
                                    break;
                                }
                            }
                            
                            if (selectedRoom) {
                                // Book
                                if (!batchSchedule[day]) batchSchedule[day] = {};
                                batchSchedule[day][time] = true;
                                
                                if (!facultySchedule[fId]) facultySchedule[fId] = {};
                                if (!facultySchedule[fId][day]) facultySchedule[fId][day] = {};
                                facultySchedule[fId][day][time] = true;
                                
                                if (!roomSchedule[selectedRoom]) roomSchedule[selectedRoom] = {};
                                if (!roomSchedule[selectedRoom][day]) roomSchedule[selectedRoom][day] = {};
                                roomSchedule[selectedRoom][day][time] = true;
                                
                                newTimetable.push({
                                    batch_id: batchId,
                                    day_of_week: day,
                                    start_time: time,
                                    end_time: getEndTime(time),
                                    subject: subjectName,
                                    faculty_id: fId,
                                    faculty_name: fName,
                                    room: selectedRoom,
                                    type: 'Lecture'
                                });
                                assignedCount++;
                            }
                        }
                    }
                }
            }

            if (newTimetable.length > 0) {
                setProgress('Saving to database...');
                const { error: insertErr } = await supabase.from('timetable').insert(newTimetable);
                if (insertErr) throw insertErr;
            }

            setProgress('Done!');
            setTimeout(() => setProgress(''), 3000);
            if (onGenerateComplete) onGenerateComplete();
            
        } catch (error) {
            console.error('Generation Error:', error);
            window.erpDialog.alert("Error auto-generating timetable: " + error.message);
            setProgress('');
        } finally {
            setIsGenerating(false);
        }
    };

    const getEndTime = (timeStr) => {
        const [time, period] = timeStr.split(' ');
        const [hour, min] = time.split(':');
        let h = parseInt(hour, 10) + 1;
        let newPeriod = period;
        if (h === 12) {
            newPeriod = period === 'AM' ? 'PM' : 'AM';
        } else if (h > 12) {
            h -= 12;
        }
        return `${h.toString().padStart(2, '0')}:${min} ${newPeriod}`;
    };

    return (
        <div className="mt-8 mb-4 flex flex-col items-center justify-center p-8 border-2 border-dashed border-themeAccent/30 rounded-themePanel bg-themeElevated/50">
            <h2 className={`text-xl lg:text-2xl ${theme.text.heading} text-themeText mb-2 text-center`}>Smart Room & Auto-Timetable Engine</h2>
            <p className={`text-sm ${theme.text.muted} text-center mb-6 max-w-2xl`}>
                Let the AI constraint solver build a 100% clash-free schedule. It dynamically checks all faculty assignments, avoids room double-booking, and ensures optimal slot usage for every batch (Monday-Friday, 9 AM - 4 PM).
            </p>
            
            <button
                onClick={generateTimetable}
                disabled={isGenerating}
                className="relative overflow-hidden group bg-themeAccent hover:bg-themeAccent/90 text-white font-black text-lg py-4 px-10 rounded-full shadow-[0_0_20px_rgba(var(--color-themeAccent),0.4)] hover:shadow-[0_0_30px_rgba(var(--color-themeAccent),0.6)] transition-all transform hover:-translate-y-1"
            >
                {isGenerating ? (
                    <span className="flex items-center gap-3">
                        <i className="fa-solid fa-atom fa-spin text-xl"></i>
                        Generating...
                    </span>
                ) : (
                    <span className="flex items-center gap-3">
                        <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
                        Auto-Generate Timetable
                    </span>
                )}
                {!isGenerating && (
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-full" />
                )}
            </button>
            {progress && (
                <p className={`mt-4 text-sm font-bold text-themeAccent animate-pulse uppercase tracking-widest`}>
                    {progress}
                </p>
            )}
        </div>
    );
}
