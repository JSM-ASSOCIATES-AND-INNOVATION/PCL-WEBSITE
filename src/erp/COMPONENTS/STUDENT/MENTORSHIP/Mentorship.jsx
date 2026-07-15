/* eslint-disable */
import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../CONTEXT/ErpContext";
import { supabase } from "../../../LIB/SUPABASE/supabaseClient";

export default function Mentorship() {
    const { userSession } = useERP();

    // --- ZERO-LAG CACHED STATE ---
    const [mentorData, setMentorData] = useState(() => {
        const cached = sessionStorage.getItem('erp_student_mentor');
        return cached ? JSON.parse(cached) : null;
    });
    const [meetingHistory, setMeetingHistory] = useState(() => {
        const cached = sessionStorage.getItem('erp_student_meetings');
        return cached ? JSON.parse(cached) : [];
    });
    const [availableSlots, setAvailableSlots] = useState(() => {
        const cached = sessionStorage.getItem('erp_student_mentor_slots');
        return cached ? JSON.parse(cached) : [];
    });

    // --- LOCAL UI STATE ---
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingTopic, setBookingTopic] = useState("");
    const [isUrgent, setIsUrgent] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- DATA SYNC ENGINE (BACKGROUND) ---
    const fetchMentorshipData = async () => {
        const studentId = userSession?.db_id || userSession?.id;
        if (!studentId) return;
        
        try {
            // 1. Fetch Mentor Details (Assigned Faculty)
            const mentorPromise = supabase
                .from('mentorship')
                .select('faculty_id')
                .eq('student_id', studentId)
                .order('allocated_at', { ascending: false })
                .limit(1)
                .then(async ({ data: allocData }) => {
                    const alloc = allocData?.[0];
                    if (alloc?.faculty_id) {
                        const { data: mentor } = await supabase
                            .from('profiles')
                            .select('id, full_name, email, phone, department')
                            .eq('id', alloc.faculty_id)
                            .single();
                        
                        if (mentor) {
                            setMentorData(mentor);
                            sessionStorage.setItem('erp_student_mentor', JSON.stringify(mentor));

                            // 1b. Fetch Mentor's Active Availability
                            const { data: slots } = await supabase
                                .from('faculty_availability')
                                .select('*')
                                .eq('faculty_id', mentor.id)
                                .eq('is_active', true);
                            
                            if (slots) {
                                // Generate next 14 days of slots based on availability map
                                const generated = generateNext14DaysSlots(slots);
                                setAvailableSlots(generated);
                                sessionStorage.setItem('erp_student_mentor_slots', JSON.stringify(generated));
                            }
                        }
                    }
                });

            // 2. Fetch Meeting History
            const meetingsPromise = supabase
                .from('mentorship_meetings')
                .select('*')
                .eq('student_id', studentId)
                .order('scheduled_at', { ascending: false })
                .then(({ data: meetingData }) => {
                    if (meetingData) {
                        setMeetingHistory(meetingData);
                        sessionStorage.setItem('erp_student_meetings', JSON.stringify(meetingData));

                        // MARK AS READ (Read Receipts for Faculty)
                        const unseenMeetingIds = meetingData.filter(m => m.student_seen_at === null).map(m => m.id);
                        if (unseenMeetingIds.length > 0) {
                            supabase.from('mentorship_meetings')
                                .update({ student_seen_at: new Date().toISOString() })
                                .in('id', unseenMeetingIds)
                                .then(); // silent update
                        }
                    }
                });

            await Promise.all([mentorPromise, meetingsPromise]);
        } catch (error) {
            console.error("Failed to fetch mentorship data:", error);
        }
    };

    useEffect(() => {
        if (userSession) {
            fetchMentorshipData();
        }
    }, [userSession]);

    // Generator logic
    const generateNext14DaysSlots = (activeSlots) => {
        const daysMap = { 'Sunday':0, 'Monday':1, 'Tuesday':2, 'Wednesday':3, 'Thursday':4, 'Friday':5, 'Saturday':6 };
        const slots = [];
        const today = new Date();
        
        for (let i = 1; i <= 14; i++) {
            const nextDate = new Date(today);
            nextDate.setDate(today.getDate() + i);
            const dayOfWeek = nextDate.getDay();

            // Find matching slots for this day
            const daySlots = activeSlots.filter(s => daysMap[s.day_of_week] === dayOfWeek);
            
            daySlots.forEach(s => {
                const [hour, min] = s.start_time.split(':');
                const slotDate = new Date(nextDate);
                slotDate.setHours(parseInt(hour, 10), parseInt(min, 10), 0, 0);

                // Ensure it doesn't conflict with existing accepted/pending meetings
                const isBooked = meetingHistory.some(m => 
                    (m.status === 'scheduled' || m.status === 'pending') && 
                    new Date(m.scheduled_at).getTime() === slotDate.getTime()
                );

                if (!isBooked) {
                    slots.push({
                        id: `${s.id}-${i}`, // unique instance id
                        day: s.day_of_week,
                        date: nextDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
                        time: `${s.start_time.substring(0, 5)} - ${s.end_time.substring(0, 5)}`,
                        type: s.meeting_type,
                        room: s.room_link,
                        isoDate: slotDate.toISOString()
                    });
                }
            });
        }
        return slots.sort((a, b) => new Date(a.isoDate) - new Date(b.isoDate));
    };

    // --- HANDLERS ---
    const handleSlotClick = (slot) => {
        setSelectedSlot(slot);
        setIsModalOpen(true);
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!selectedSlot || !bookingTopic.trim() || !mentorData) return;

        setIsBooking(true);

        try {
            const studentId = userSession?.db_id || userSession?.id;

            // Write to Supabase with pending and urgency
            const { error } = await supabase
                .from('mentorship_meetings')
                .insert({
                    student_id: studentId,
                    faculty_id: mentorData.id,
                    topic: bookingTopic,
                    scheduled_at: selectedSlot.isoDate,
                    status: 'pending', // Requires faculty acceptance
                    is_urgent: isUrgent,
                    notes: `Requested ${selectedSlot.type} meeting at ${selectedSlot.time}.${selectedSlot.room ? ` Link: ${selectedSlot.room}` : ''}`
                });

            if (error) throw error;

            setBookingSuccess(true);
            fetchMentorshipData(); // Refresh history immediately

            setTimeout(() => {
                setBookingSuccess(false);
                setSelectedSlot(null);
                setBookingTopic("");
                setIsUrgent(false);
                setIsModalOpen(false);
            }, 1500);

        } catch (err) {
            console.error("Booking failed:", err);
            window.erpDialog.alert("Failed to book session. Please try again.");
            setIsBooking(false); // Reset on error
        }
    };

    const getStatusBadge = (status, isUrgent) => {
        if (isUrgent && status === 'pending') {
            return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-red-500/20 text-red-500 border border-red-500/30 flex items-center gap-1.5"><i className="fa-solid fa-triangle-exclamation animate-pulse"></i> Urgent Pending</span>;
        }
        switch (status) {
            case 'pending': return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-500 border border-amber-500/30">Pending</span>;
            case 'scheduled': return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center gap-1.5"><i className="fa-solid fa-check"></i> Accepted</span>;
            case 'declined': return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-500 border border-rose-500/30">Declined</span>;
            case 'completed': return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-500 border border-blue-500/30">Completed</span>;
            case 'cancelled': return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-neutral-500/20 text-neutral-400 border border-neutral-700">Cancelled</span>;
            default: return null;
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-20 lg:pb-12 animate-fade-in selection:bg-themeElevated">
            
            {/* 1. MENTOR PROFILE BANNER */}
            {mentorData ? (
                <div className={`${theme.layout.panel} rounded-themePanel p-6 lg:p-8 relative overflow-hidden border-theme border-themeBorder text-themeText flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-themeElevated rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-10 w-48 h-48 bg-themeElevated rounded-full translate-y-1/2 pointer-events-none"></div>

                    {/* Mentor Avatar */}
                    <div className="relative shrink-0 z-10 mt-2 lg:mt-0">
                        <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-themePanel flex items-center justify-center border-4 border-[#121212] bg-themeElevated text-2xl lg:text-4xl font-black text-themeText">
                            {mentorData.full_name.split(' ').map(n => n[0]).join('').replace('.', '').substring(0, 2)}
                        </div>
                        <div className="absolute -bottom-2 -right-2 lg:-bottom-3 lg:-right-3 w-6 h-6 lg:w-8 lg:h-8 bg-emerald-500 rounded-full border-4 border-[#121212] flex items-center justify-center" title="Available">
                            <i className="fa-solid fa-check text-[#050505] text-[10px] lg:text-xs font-black"></i>
                        </div>
                    </div>

                    {/* Mentor Details */}
                    <div className="flex-1 text-center lg:text-left relative z-10 w-full">
                        <p className="text-themeAccent font-bold text-[9px] lg:text-[10px] uppercase tracking-widest mb-1.5 lg:mb-2">Assigned Faculty Mentor</p>
                        <h2 className="text-2xl lg:text-4xl font-black tracking-tight mb-1 lg:mb-2 text-themeText">{mentorData.full_name}</h2>
                        <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium mb-5 lg:mb-6`}>Faculty Member • {mentorData.department || 'Department'}</p>

                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 w-full sm:w-auto">
                            <a href={`mailto:${mentorData.email}`} className="px-4 py-3 lg:py-2.5 bg-themePanel hover:bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest text-themeText transition-all flex items-center justify-center lg:justify-start gap-2 group w-full sm:w-auto">
                                <i className="fa-solid fa-envelope text-themeAccent group-hover:scale-110 transition-transform"></i> Email Mentor
                            </a>
                            {mentorData.phone && (
                                <a href={`tel:${mentorData.phone}`} className="px-4 py-3 lg:py-2.5 bg-themePanel hover:bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest text-themeText transition-all flex items-center justify-center lg:justify-start gap-2 w-full sm:w-auto hover:text-emerald-400">
                                    <i className="fa-solid fa-phone text-emerald-500"></i> {mentorData.phone}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full py-16 lg:py-24 text-center border-2 border-dashed border-themeBorder rounded-themePanel bg-themeApp px-4">
                    <i className="fa-solid fa-user-slash text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
                    <h3 className="text-xl lg:text-2xl text-themeText font-black">No Mentor Assigned</h3>
                    <p className="text-xs lg:text-sm text-themeTextSec opacity-70 mt-2 max-w-sm mx-auto">Please contact the administration office to get your faculty mentor assigned.</p>
                </div>
            )}

            {/* 2. MAIN SPLIT SECTION */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                
                {/* Left: Book a Session */}
                <div className={`flex flex-col gap-4 lg:gap-6 ${!mentorData && 'opacity-50 pointer-events-none'}`}>
                    <h3 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight flex items-center gap-3 pl-2`}>
                        <div className={`${theme.ui.logoBox} border-themeBorderStrong bg-themeElevated w-10 h-10 lg:w-12 lg:h-12 rounded-themePanel flex items-center justify-center shrink-0`}>
                            <i className="fa-regular fa-calendar-check text-themeAccent text-sm lg:text-base"></i>
                        </div>
                        Book a Session
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-3 lg:gap-4">
                        {availableSlots.length > 0 ? availableSlots.map(slot => (
                            <button 
                                key={slot.id}
                                onClick={() => handleSlotClick(slot)}
                                className={`flex flex-col text-left p-4 lg:p-5 bg-themePanel hover:bg-themeElevated border-theme border-themeBorderStrong hover:border-themeAccent/50 rounded-themePanel transition-all group active:scale-[0.98] ${theme.layout.interactive}`}
                            >
                                <div className="flex justify-between items-start mb-3 lg:mb-4 w-full">
                                    <div className="flex flex-col">
                                        <span className="text-themeAccent font-black text-[10px] lg:text-xs tracking-widest uppercase mb-1">{slot.day}</span>
                                        <span className="text-themeText font-black text-sm lg:text-base tracking-tight">{slot.date}</span>
                                    </div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-themeBorder ${slot.type === 'Virtual' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                        <i className={`fa-solid ${slot.type === 'Virtual' ? 'fa-video' : 'fa-handshake'} text-xs lg:text-sm`}></i>
                                    </div>
                                </div>
                                <div className="flex flex-col mt-auto">
                                    <span className={`${theme.text.secondary} font-black text-[10px] lg:text-xs uppercase tracking-widest`}>
                                        <i className="fa-regular fa-clock mr-1.5 opacity-70"></i>{slot.time}
                                    </span>
                                </div>
                            </button>
                        )) : (
                            <div className="col-span-full p-8 text-center bg-themePanel border-2 border-dashed border-themeBorder rounded-themePanel">
                                <i className="fa-regular fa-calendar-xmark text-3xl text-themeTextSec mb-3"></i>
                                <p className="text-sm font-medium text-themeTextSec">No available slots open for booking currently.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Meeting History & Agenda */}
                <div className={`flex flex-col gap-4 lg:gap-6 ${!mentorData && 'opacity-50 pointer-events-none'}`}>
                    <h3 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight flex items-center gap-3 pl-2`}>
                        <div className={`${theme.ui.logoBox} border-themeBorderStrong bg-themeElevated w-10 h-10 lg:w-12 lg:h-12 rounded-themePanel flex items-center justify-center shrink-0`}>
                            <i className="fa-solid fa-clock-rotate-left text-themeAccent text-sm lg:text-base"></i>
                        </div>
                        Meeting History
                    </h3>

                    <div className="flex flex-col gap-3 lg:gap-4 h-full">
                        {meetingHistory.length > 0 ? (
                            meetingHistory.map(meeting => (
                                <div key={meeting.id} className={`${theme.layout.panel} p-4 lg:p-5 rounded-themePanel border-l-4 ${meeting.is_urgent && meeting.status === 'pending' ? 'border-l-red-500' : 'border-l-themeAccent'} border-t-theme border-r-theme border-b-theme border-themeBorderStrong flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center transition-all hover:bg-themeElevated`}>
                                    <div className="flex flex-col shrink-0 min-w-[100px] lg:min-w-[120px]">
                                        <span className={`${theme.text.secondary} text-[9px] lg:text-[10px] font-black uppercase tracking-widest mb-1`}>
                                            {new Date(meeting.scheduled_at).toLocaleDateString('en-US', { weekday: 'short' })}
                                        </span>
                                        <span className="text-themeText font-black text-sm lg:text-base tracking-tight leading-none mb-1">
                                            {new Date(meeting.scheduled_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                                        </span>
                                        <span className="text-themeTextSec text-xs lg:text-sm font-medium">
                                            {new Date(meeting.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-themeText font-bold text-sm lg:text-base truncate mb-1.5">{meeting.topic}</h4>
                                        <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                                            {getStatusBadge(meeting.status, meeting.is_urgent)}
                                        </div>
                                    </div>

                                    {meeting.status === 'completed' && meeting.notes && (
                                        <button onClick={() => window.erpDialog.alert(meeting.notes, "Meeting Notes")} className="w-full sm:w-auto px-4 py-2 bg-themeElevated hover:bg-themePanel border-theme border-themeBorder rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest text-themeText transition-colors shrink-0 active:scale-95">
                                            <i className="fa-regular fa-file-lines mr-2"></i> Notes
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className={`${theme.layout.panel} p-8 lg:p-12 rounded-themePanel border-theme border-themeBorderStrong text-center h-full flex flex-col items-center justify-center`}>
                                <div className="w-16 h-16 rounded-full bg-themeElevated border-2 border-themeBorder flex items-center justify-center mb-4">
                                    <i className="fa-solid fa-mug-hot text-2xl text-themeTextSec"></i>
                                </div>
                                <h4 className="text-themeText font-black text-lg mb-2">No History</h4>
                                <p className={`${theme.text.secondary} text-sm max-w-xs mx-auto`}>You haven't scheduled any sessions with your mentor yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* BOOKING MODAL */}
            {isModalOpen && selectedSlot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="w-full max-w-lg bg-themePanel border-2 border-themeBorderStrong rounded-themePanel shadow-2xl overflow-hidden animate-slide-up relative">
                        {/* Close Button */}
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-themeElevated text-themeTextSec hover:text-themeText transition-colors z-10"
                        >
                            <i className="fa-solid fa-times"></i>
                        </button>

                        <div className="p-6 lg:p-8">
                            <h3 className="text-2xl font-black text-themeText mb-1">Request Appointment</h3>
                            <p className="text-themeTextSec text-sm mb-6">Send a mentorship request to {mentorData.full_name}</p>

                            <div className="flex bg-themeElevated rounded-lg p-4 mb-6 border border-themeBorder items-center gap-4">
                                <div className="w-12 h-12 bg-themePanel rounded-full flex items-center justify-center border border-themeBorder shrink-0">
                                    <i className="fa-regular fa-calendar-check text-themeAccent text-xl"></i>
                                </div>
                                <div>
                                    <p className="font-black text-themeText text-sm lg:text-base">{selectedSlot.day}, {selectedSlot.date}</p>
                                    <p className="text-themeTextSec text-xs font-medium uppercase tracking-wider">{selectedSlot.time} • {selectedSlot.type}</p>
                                </div>
                            </div>

                            <form onSubmit={handleBooking} className="flex flex-col gap-5">
                                <div>
                                    <label className="block text-xs font-black text-themeText uppercase tracking-widest mb-2">Discussion Topic / Agenda</label>
                                    <input 
                                        type="text" 
                                        value={bookingTopic}
                                        onChange={(e) => setBookingTopic(e.target.value)}
                                        placeholder="e.g., Guidance on Corporate Law Internships"
                                        className="w-full bg-themeApp border border-themeBorder focus:border-themeAccent rounded-lg px-4 py-3 text-themeText text-sm outline-none transition-all focus:ring-1 focus:ring-themeAccent"
                                        required
                                    />
                                </div>

                                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-4 cursor-pointer hover:bg-red-500/20 transition-colors" onClick={() => setIsUrgent(!isUrgent)}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${isUrgent ? 'bg-red-500 border-red-500' : 'border-red-500/50'}`}>
                                        {isUrgent && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-red-500 text-sm font-black tracking-tight">Mark as Urgent Request</span>
                                        <span className="text-red-500/70 text-xs">Only use this for critical or time-sensitive matters.</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={isBooking || !bookingTopic.trim()}
                                        className="w-full bg-themeAccent hover:bg-themeAccentMuted text-themeText px-6 py-4 rounded-themePanel text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden"
                                    >
                                        {bookingSuccess ? (
                                            <><i className="fa-solid fa-check-circle text-lg"></i> Request Sent!</>
                                        ) : isBooking ? (
                                            <><i className="fa-solid fa-circle-notch fa-spin text-lg"></i> Submitting...</>
                                        ) : (
                                            <><i className="fa-regular fa-paper-plane text-lg"></i> Send Booking Request</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}