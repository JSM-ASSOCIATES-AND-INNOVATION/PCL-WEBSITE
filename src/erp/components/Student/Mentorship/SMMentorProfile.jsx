import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../LIB/supabase/supabaseClient";
import { useERP } from "../../../context/ErpContext";

export default function SMMentorProfile() {
    const { userSession } = useERP();
    const [mentor, setMentor] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Booking Form State
    const [isBooking, setIsBooking] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedMode, setSelectedMode] = useState("In-Person");
    const [purpose, setPurpose] = useState("");
    const [description, setDescription] = useState("");

    // Mock slots since we don't have a timetable generation backend yet
    const availableDates = ["2026-07-17", "2026-07-18", "2026-07-20"];
    const availableTimes = ["10:30 AM", "11:00 AM", "02:00 PM", "03:30 PM"];

    useEffect(() => {
        fetchMentor();
    }, []);

    const fetchMentor = async () => {
        if (!userSession?.db_id) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('mentorship')
                .select(`
                    faculty_id,
                    profiles!mentorship_faculty_id_fkey (
                        id, full_name, department, email
                    )
                `)
                .eq('student_id', userSession.db_id)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            if (data) setMentor(data.profiles);
        } catch (error) {
            console.error("Error fetching mentor:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBookAppointment = (e) => {
        e.preventDefault();
        if(!selectedDate || !selectedTime || !purpose) {
            window.erpDialog?.alert("Please fill all required fields.");
            return;
        }

        setIsBooking(true);
        // Simulate network request
        setTimeout(() => {
            setIsBooking(false);
            window.erpDialog?.alert("Appointment request submitted successfully! You will be notified when your mentor confirms.");
            // Reset form
            setSelectedDate("");
            setSelectedTime("");
            setPurpose("");
            setDescription("");
        }, 1000);
    };

    if (isLoading) {
        return <div className="w-full py-32 flex justify-center"><i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-500"></i></div>;
    }

    if (!mentor) {
        return (
            <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-12 flex flex-col items-center justify-center text-center opacity-70">
                <i className="fa-solid fa-user-slash text-5xl text-themeTextSec mb-4"></i>
                <h3 className="text-sm font-black text-themeText">No Mentor Assigned</h3>
                <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-2">Please contact the administration office.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 animate-fade-in pb-10 relative">
            
            {isBooking && (
                <div className="absolute inset-0 bg-themeApp/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
                    <div className="bg-themeElevated p-6 rounded-xl border-[length:var(--border-width)] border-themeBorderStrong shadow-2xl flex flex-col items-center gap-4">
                        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-500"></i>
                        <span className="text-xs font-black uppercase tracking-widest text-themeText">Submitting Request...</span>
                    </div>
                </div>
            )}

            {/* Left Column: Mentor Identity */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
                
                <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel overflow-hidden flex flex-col relative">
                    <div className="h-24 bg-indigo-500/20 border-b-[length:var(--border-width)] border-indigo-500/30 w-full relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.2),transparent_50%)]"></div>
                    </div>
                    <div className="px-6 pb-6 pt-0 flex flex-col items-center text-center relative -mt-12">
                        <div className="w-24 h-24 rounded-full bg-themeElevated border-4 border-themePanel flex items-center justify-center mb-4 shadow-lg">
                            <i className="fa-solid fa-user-tie text-4xl text-themeTextSec"></i>
                        </div>
                        <h2 className={`${theme.text.heading} text-xl text-themeText`}>{mentor.full_name}</h2>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mt-1 mb-4 bg-indigo-500/10 px-3 py-1 rounded-full">{mentor.department}</span>
                        
                        <div className="w-full flex flex-col gap-3 mt-2 pt-4 border-t-[length:var(--border-width)] border-themeBorderStrong">
                            <div className="flex items-center gap-3 text-xs font-bold text-themeTextSec justify-center">
                                <i className="fa-solid fa-envelope w-4"></i> {mentor.email || 'faculty@domain.edu'}
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-themeTextSec justify-center">
                                <i className="fa-solid fa-door-closed w-4 text-emerald-500"></i> Cabin 402, Block A
                            </div>
                        </div>

                        <div className="w-full mt-6 flex gap-2">
                            <button className="flex-1 py-3 bg-themeElevated hover:bg-themeBorder text-themeTextSec hover:text-themeText border-[length:var(--border-width)] border-themeBorderStrong rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                <i className="fa-solid fa-message"></i> Message
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-6">
                    <h3 className={`${theme.text.heading} text-sm tracking-tight text-themeText mb-4 flex items-center gap-2`}>
                        <i className="fa-solid fa-clock text-themeTextSec"></i> Consultation Hours
                    </h3>
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center p-3 bg-themeElevated rounded border-[length:var(--border-width)] border-themeBorderStrong">
                            <span className="text-[10px] font-black uppercase tracking-widest text-themeText">Monday</span>
                            <span className="text-[10px] font-bold text-themeTextSec">02:00 PM - 04:00 PM</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-themeElevated rounded border-[length:var(--border-width)] border-themeBorderStrong">
                            <span className="text-[10px] font-black uppercase tracking-widest text-themeText">Wednesday</span>
                            <span className="text-[10px] font-bold text-themeTextSec">11:00 AM - 01:00 PM</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-themeElevated rounded border-[length:var(--border-width)] border-themeBorderStrong">
                            <span className="text-[10px] font-black uppercase tracking-widest text-themeText">Friday</span>
                            <span className="text-[10px] font-bold text-themeTextSec">03:00 PM - 05:00 PM</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Right Column: Book Appointment */}
            <div className="w-full lg:w-2/3 flex flex-col">
                <form onSubmit={handleBookAppointment} className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-6 lg:p-8 flex flex-col h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>
                    
                    <h3 className={`${theme.text.heading} text-xl tracking-tight text-themeText mb-1`}>Book an Appointment</h3>
                    <p className="text-xs font-bold text-themeTextSec mb-8">Select an available slot to schedule a mentorship session.</p>

                    <div className="flex flex-col gap-6 relative z-10">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Date Selection */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">1. Select Date <span className="text-rose-500">*</span></label>
                                <select 
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    required
                                    className="w-full bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-lg px-4 py-3 text-xs font-bold text-themeText focus:border-indigo-500 outline-none appearance-none"
                                >
                                    <option value="">Choose an available date...</option>
                                    {availableDates.map(d => (
                                        <option key={d} value={d}>{new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Time Selection */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">2. Select Time <span className="text-rose-500">*</span></label>
                                <select 
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    required
                                    disabled={!selectedDate}
                                    className="w-full bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-lg px-4 py-3 text-xs font-bold text-themeText focus:border-indigo-500 outline-none appearance-none disabled:opacity-50"
                                >
                                    <option value="">Choose a time slot...</option>
                                    {availableTimes.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                                {!selectedDate && <span className="text-[9px] text-themeTextSec">Select a date first</span>}
                            </div>
                        </div>

                        {/* Purpose Selection */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">3. Meeting Purpose <span className="text-rose-500">*</span></label>
                            <select 
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                required
                                className="w-full bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-lg px-4 py-3 text-xs font-bold text-themeText focus:border-indigo-500 outline-none appearance-none"
                            >
                                <option value="">What would you like to discuss?</option>
                                <option value="Academic Guidance">Academic Guidance (Scores, Backlogs)</option>
                                <option value="Attendance Discussion">Attendance Discussion</option>
                                <option value="Leave Discussion">Leave Discussion / Medical Proof Verification</option>
                                <option value="Internship Guidance">Internship Guidance / Placement</option>
                                <option value="Research Guidance">Research Guidance</option>
                                <option value="Career Guidance">Career / Higher Studies</option>
                                <option value="Personal Mentorship">Personal Mentorship</option>
                                <option value="General Discussion">General Discussion</option>
                            </select>
                        </div>

                        {/* Mode Selection (Radio buttons disguised as cards) */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">4. Meeting Mode <span className="text-rose-500">*</span></label>
                            <div className="flex gap-4">
                                <label className={`flex-1 p-4 rounded-lg border-[length:var(--border-width)] cursor-pointer transition-all flex flex-col items-center gap-2 ${selectedMode === 'In-Person' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' : 'bg-themeElevated border-themeBorderStrong text-themeTextSec hover:border-themeText'}`}>
                                    <input type="radio" name="mode" value="In-Person" checked={selectedMode === 'In-Person'} onChange={() => setSelectedMode('In-Person')} className="sr-only" />
                                    <i className="fa-solid fa-handshake text-xl"></i>
                                    <span className="text-[10px] font-black uppercase tracking-widest">In-Person (Cabin)</span>
                                </label>
                                <label className={`flex-1 p-4 rounded-lg border-[length:var(--border-width)] cursor-pointer transition-all flex flex-col items-center gap-2 ${selectedMode === 'Online' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' : 'bg-themeElevated border-themeBorderStrong text-themeTextSec hover:border-themeText'}`}>
                                    <input type="radio" name="mode" value="Online" checked={selectedMode === 'Online'} onChange={() => setSelectedMode('Online')} className="sr-only" />
                                    <i className="fa-solid fa-video text-xl"></i>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Online (Teams/Zoom)</span>
                                </label>
                            </div>
                        </div>

                        {/* Brief Description */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">5. Brief Description (Optional)</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add any specific context or questions for your mentor..."
                                className="w-full h-24 bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-lg px-4 py-3 text-xs font-bold text-themeText focus:border-indigo-500 outline-none resize-none"
                            ></textarea>
                        </div>

                        <div className="mt-auto pt-6 border-t-[length:var(--border-width)] border-themeBorderStrong">
                            <button 
                                type="submit"
                                className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                <i className="fa-solid fa-paper-plane"></i> Submit Request
                            </button>
                        </div>

                    </div>
                </form>
            </div>
            
        </div>
    );
}
