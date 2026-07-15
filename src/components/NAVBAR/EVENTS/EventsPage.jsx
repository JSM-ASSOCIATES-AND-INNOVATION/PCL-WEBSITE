/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../LIB/supabaseClient';

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            const { data, error } = await supabase
                .from('admin_events')
                .select('*')
                .eq('is_public', true)
                .order('event_date', { ascending: true });
            
            if (!error && data) {
                setEvents(data);
            }
            setLoading(false);
        };

        fetchEvents();
    }, []);

    // Split events into upcoming and past
    const now = new Date();
    const upcomingEvents = events.filter(e => new Date(e.event_date) >= now);
    const pastEvents = events.filter(e => new Date(e.event_date) < now).sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

    const renderEventCard = (evt) => {
        const evtDate = new Date(evt.event_date);
        return (
            <div key={evt.id} className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-lg group hover:-translate-y-2 hover:border-[var(--primary-color)] transition-all duration-300 flex flex-col">
                {evt.image_url ? (
                    <div className="h-48 overflow-hidden relative shrink-0">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                        <img src={evt.image_url} alt={evt.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                ) : (
                    <div className="h-48 bg-[var(--primary-glow)] flex items-center justify-center text-[var(--primary-color)] opacity-50 relative overflow-hidden shrink-0">
                        <i className="fa-solid fa-calendar-star text-5xl"></i>
                    </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold text-[var(--primary-color)] uppercase tracking-widest bg-[var(--primary-glow)] px-3 py-1.5 rounded">
                            {evtDate.toLocaleDateString("en-US", { month: 'short', day: '2-digit', year: 'numeric' })}
                        </span>
                        <span className="text-xs font-bold text-brand-muted uppercase tracking-widest flex items-center gap-1.5">
                            <i className="fa-regular fa-clock"></i> {evtDate.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-brand-text leading-tight mb-3 group-hover:text-[var(--primary-color)] transition-colors">{evt.title}</h3>
                    <p className="text-brand-muted text-sm line-clamp-4 leading-relaxed mb-6 flex-1">{evt.description}</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-brand-text mt-auto pt-4 border-t border-brand-border/50">
                        <i className="fa-solid fa-location-dot text-[var(--primary-color)]"></i> {evt.location || 'Campus'}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-[var(--bg-color)] min-h-screen pt-32 pb-20 relative overflow-hidden">
            {/* Subtle grid background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: 'radial-gradient(var(--text-color) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            <div className="container relative z-10 max-w-7xl mx-auto px-6">
                
                {/* Header */}
                <div className="flex flex-col gap-4 mb-16 text-center items-center">
                    <div className="w-16 h-1 bg-[var(--primary-color)] mb-2"></div>
                    <h1 className="text-4xl md:text-6xl font-bold text-brand-text" style={{ fontFamily: "'Playfair Display', serif" }}>
                        College <span className="text-[var(--primary-color)]">Events</span>
                    </h1>
                    <p className="text-brand-muted text-lg max-w-2xl">
                        Stay updated with all the upcoming seminars, workshops, moot courts, and cultural activities happening at Prudentia College of Law.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-12 h-12 border-4 border-brand-border border-t-[var(--primary-color)] rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {/* Upcoming Events */}
                        <div className="mb-20">
                            <h2 className="text-2xl font-bold text-brand-text mb-8 border-b border-brand-border pb-4 flex items-center gap-3">
                                <i className="fa-solid fa-calendar-bolt text-[var(--primary-color)]"></i> Upcoming Events
                            </h2>
                            
                            {upcomingEvents.length === 0 ? (
                                <div className="py-16 text-center border border-brand-border/50 rounded-2xl bg-brand-card/30">
                                    <p className="text-brand-muted text-lg">No upcoming events scheduled at the moment.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {upcomingEvents.map(renderEventCard)}
                                </div>
                            )}
                        </div>

                        {/* Past Events */}
                        {pastEvents.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold text-brand-text mb-8 border-b border-brand-border pb-4 flex items-center gap-3 opacity-80">
                                    <i className="fa-solid fa-clock-rotate-left text-brand-muted"></i> Past Events
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 opacity-70 grayscale-[30%] hover:grayscale-0 transition-all duration-500">
                                    {pastEvents.map(renderEventCard)}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
