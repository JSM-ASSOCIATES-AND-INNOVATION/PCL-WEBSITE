import React, { forwardRef, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const EventsSection = forwardRef(({ windowWidth }, ref) => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            const { data, error } = await supabase
                .from('admin_events')
                .select('*')
                .eq('is_public', true)
                .gte('event_date', new Date().toISOString()) // Only upcoming events
                .order('event_date', { ascending: true })
                .limit(4);
            
            if (!error && data) {
                setEvents(data);
            }
        };

        fetchEvents();
    }, []);

    return (
        <section className="slide bg-[var(--bg-color)] flex items-center justify-center relative overflow-hidden" ref={el => { if(ref && ref.current) ref.current[4] = el; else if(typeof ref === 'function') ref(el); }}>
            
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: 'radial-gradient(var(--text-color) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            <div className="container relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-0 flex flex-col justify-center h-full">
                <div className="flex flex-col gap-3 md:gap-6 mb-8 md:mb-12">
                    <div className="w-10 md:w-16 h-1 bg-[var(--primary-color)]"></div>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-brand-text" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Upcoming <br className="md:hidden" />
                        <span className="text-[var(--primary-color)]">Events.</span>
                    </h2>
                    <p className="text-brand-muted text-sm md:text-xl font-light max-w-2xl">
                        Discover what's happening at Prudentia College of Law. Join our seminars, moot courts, and cultural fests.
                    </p>
                </div>

                {events.length === 0 ? (
                    <div className="w-full py-20 border border-brand-border/50 rounded-3xl flex flex-col items-center justify-center bg-brand-card/30 backdrop-blur-sm">
                        <p className="text-brand-muted text-lg">More events coming soon.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {events.map((evt) => {
                            const evtDate = new Date(evt.event_date);
                            return (
                                <div key={evt.id} className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-lg group hover:-translate-y-2 hover:border-[var(--primary-color)] transition-all duration-300">
                                    {evt.image_url ? (
                                        <div className="h-40 overflow-hidden relative">
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                                            <img src={evt.image_url} alt={evt.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        </div>
                                    ) : (
                                        <div className="h-32 bg-[var(--primary-glow)] flex items-center justify-center text-[var(--primary-color)] opacity-50 relative overflow-hidden">
                                            <i className="fa-solid fa-calendar-star text-4xl"></i>
                                        </div>
                                    )}
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-[10px] font-bold text-[var(--primary-color)] uppercase tracking-widest bg-[var(--primary-glow)] px-2 py-1 rounded">
                                                {evtDate.toLocaleDateString("en-US", { month: 'short', day: '2-digit' })}
                                            </span>
                                            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest flex items-center gap-1">
                                                <i className="fa-regular fa-clock"></i> {evtDate.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-brand-text leading-tight mb-2 group-hover:text-[var(--primary-color)] transition-colors">{evt.title}</h3>
                                        <p className="text-brand-muted text-xs line-clamp-3 leading-relaxed mb-4">{evt.description}</p>
                                        <div className="flex items-center gap-2 text-xs font-medium text-brand-text">
                                            <i className="fa-solid fa-location-dot text-[var(--primary-color)]"></i> {evt.location || 'Campus'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
});

EventsSection.displayName = 'EventsSection';
export default EventsSection;
