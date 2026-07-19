import React, { useEffect, useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../../../LIB/supabaseClient';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';

const EventsPreview = forwardRef((props, ref) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('admin_events')
        .select('*')
        .eq('is_public', true)
        .gte('event_date', now)
        .order('event_date', { ascending: true })
        .limit(3);
      
      if (!error && data) {
        setEvents(data);
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  const containerVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="slide w-full py-12 md:py-20 relative flex items-center justify-center bg-[var(--bg-color)] overflow-hidden" ref={ref} {...props}>
      <div className="absolute top-0 left-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_left,_var(--primary-glow)_0%,_transparent_70%)] pointer-events-none opacity-20 z-0"></div>
      
      <div className="container relative z-10 w-full max-w-7xl mx-auto px-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={itemVars}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <span className="block text-xs md:text-sm uppercase tracking-[0.2em] text-[var(--primary-color)] font-bold mb-3">Campus Life</span>
              <h2 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-light)]">Happenings</span>
              </h2>
            </div>
            <Link to="/events" className="group flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest text-[var(--text-color)] hover:text-[var(--primary-color)] transition-colors">
              All Events <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-[var(--card-border)] border-t-[var(--primary-color)] rounded-full animate-spin"></div>
          </div>
        ) : events.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            className="py-20 text-center border border-[var(--card-border)] rounded-3xl bg-[var(--card-bg)]/50 backdrop-blur-md"
          >
            <p className="text-[var(--text-muted)] text-lg">No upcoming public events scheduled at the moment.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Featured Event (First one) */}
            <motion.div variants={itemVars} className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-2xl h-[400px] lg:h-auto">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80')] bg-cover bg-center group-hover:scale-105 transition-transform duration-[1.5s]"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              
              <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-[var(--primary-color)] text-black px-4 py-2 rounded-lg text-center font-bold">
                    <span className="block text-2xl leading-none">15</span>
                    <span className="block text-[10px] uppercase tracking-widest">Oct</span>
                  </div>
                  <span className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase text-white border border-white/10">Guest Lecture</span>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  The Future of Constitutional Law
                </h3>
                <p className="text-gray-300 text-sm mb-6 max-w-md line-clamp-2">
                  Hon'ble Justice serves as the chief guest for our inaugural lecture series on constitutional amendments.
                </p>
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
                  <span className="flex items-center gap-2"><Clock size={16}/> 10:00 AM</span>
                  <span className="flex items-center gap-2"><MapPin size={16}/> Main Auditorium</span>
                </div>
              </div>
            </motion.div>

            {/* Other Events List */}
            <div className="flex flex-col gap-4">
              {[2, 3, 4].map((item, idx) => (
                <motion.div key={idx} variants={itemVars} className="group flex flex-col sm:flex-row bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden hover:border-[var(--primary-color)]/30 transition-colors shadow-lg cursor-pointer">
                  <div className="w-full sm:w-40 h-40 sm:h-auto bg-[url('https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80')] bg-cover bg-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <div className="p-6 flex flex-col justify-center flex-1">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-[var(--primary-color)] tracking-widest uppercase mb-2">
                      <span>22 Oct, 2026</span>
                      <span className="w-1 h-1 rounded-full bg-white/30"></span>
                      <span className="text-[var(--text-muted)]">Moot Court</span>
                    </div>
                    <h4 className="text-xl font-bold mb-2 text-white group-hover:text-[var(--primary-color)] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                      National Level Moot Court Competition Phase {idx + 1}
                    </h4>
                    <p className="text-[var(--text-muted)] text-xs line-clamp-1 mb-4">
                      Participate in the ultimate test of legal argumentation and courtroom etiquette.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mt-auto">
                      <ArrowRight size={14} className="text-[var(--primary-color)] group-hover:translate-x-2 transition-transform" /> 
                      <span className="group-hover:text-white transition-colors">Read More</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
          </div>
        )}
      </div>
    </section>
  );
});

EventsPreview.displayName = 'EventsPreview';
export default EventsPreview;
