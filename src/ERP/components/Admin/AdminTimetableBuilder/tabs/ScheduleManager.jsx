/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../LIB/supabase/supabaseClient';

const DAYS_OF_WEEK = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

export default function ScheduleManager() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('16:00');
    const [offDays, setOffDays] = useState(['Saturday', 'Sunday']);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('institution_schedule')
                .select('*')
                .eq('programme', 'GLOBAL')
                .single();

            if (error && error.code !== 'PGRST116') throw error; // ignore no rows error

            if (data) {
                setSettings(data);
                // Supabase TIME is HH:mm:ss, html input time expects HH:mm
                setStartTime(data.start_time.substring(0, 5));
                setEndTime(data.end_time.substring(0, 5));
                setOffDays(data.off_days || []);
            }
        } catch (err) {
            console.error("Failed to fetch schedule settings:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const toggleOffDay = (day) => {
        setOffDays(prev => 
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('institution_schedule')
                .upsert({
                    programme: 'GLOBAL',
                    start_time: startTime + ':00',
                    end_time: endTime + ':00',
                    off_days: offDays,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'programme' });

            if (error) throw error;
            
            window.erpDialog?.alert("Schedule settings saved successfully.");
            fetchSettings();
        } catch (err) {
            console.error("Failed to save schedule settings:", err);
            window.erpDialog?.alert("Error saving settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <i className="fa-solid fa-spinner fa-spin text-themeAccent text-3xl"></i>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-in relative">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-themeText">Institution Timings & Schedule</h2>
                    <p className="text-xs font-bold text-themeTextSec">Configure global college timings and define weekly off days.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="bg-themeElevated border border-themeBorderStrong rounded-2xl p-6 flex flex-col gap-6 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Operating Hours */}
                    <div className="flex flex-col gap-4 bg-themePanel p-5 rounded-2xl border border-themeBorder">
                        <div className="flex items-center gap-3 border-b border-themeBorder pb-3">
                            <i className="fa-regular fa-clock text-blue-500 text-lg"></i>
                            <h3 className="text-sm font-black text-themeText">Operating Hours</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">College Start Time</label>
                                <input 
                                    type="time" 
                                    value={startTime} 
                                    onChange={e => setStartTime(e.target.value)} 
                                    required 
                                    className="w-full bg-themeElevated border border-themeBorder focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none color-scheme-dark" 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">College End Time</label>
                                <input 
                                    type="time" 
                                    value={endTime} 
                                    onChange={e => setEndTime(e.target.value)} 
                                    required 
                                    className="w-full bg-themeElevated border border-themeBorder focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none color-scheme-dark" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Weekly Off Days */}
                    <div className="flex flex-col gap-4 bg-themePanel p-5 rounded-2xl border border-themeBorder">
                        <div className="flex items-center gap-3 border-b border-themeBorder pb-3">
                            <i className="fa-regular fa-calendar-xmark text-rose-500 text-lg"></i>
                            <h3 className="text-sm font-black text-themeText">Weekly Off Days</h3>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            {DAYS_OF_WEEK.map(day => {
                                const isOff = offDays.includes(day);
                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => toggleOffDay(day)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                            isOff 
                                            ? 'bg-rose-500/20 text-rose-500 border border-rose-500/50 shadow-md shadow-rose-500/10' 
                                            : 'bg-themeElevated text-themeTextSec border border-themeBorderStrong hover:border-themeText hover:text-themeText'
                                        }`}
                                    >
                                        {isOff ? <i className="fa-solid fa-xmark mr-1"></i> : <i className="fa-solid fa-check mr-1 text-emerald-500"></i>}
                                        {day.substring(0, 3)}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-[10px] font-bold text-themeTextSec mt-2">
                            Click a day to toggle it as a working day or an off day.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-themeBorder">
                    <button 
                        type="submit" 
                        disabled={saving}
                        className="bg-themeAccent text-[#0a0a0a] px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-themeAccent/20"
                    >
                        {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                        Save Global Schedule
                    </button>
                </div>
            </form>
        </div>
    );
}
