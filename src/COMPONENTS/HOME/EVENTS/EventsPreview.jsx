import React, { useEffect, useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../../../LIB/supabaseClient';
import { Calendar, Clock, MapPin, ArrowRight, AlertCircle } from 'lucide-react';

import fallbackLogo from '../../../ASSETS/LOGOS/pcl_logo.svg';

// Stock fallbacks used only when an event has no image_url of its own.
const FALLBACK_IMAGES = [fallbackLogo];

const formatDay = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit' });

const formatMonth = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short' });

const formatFullDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const formatTime = (dateStr) =>
  new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

const EventsPreview = forwardRef((props, ref) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      const now = new Date().toISOString();
      const { data, error: fetchError } = await supabase
        .from('admin_events')
        .select('*')
        .eq('is_public', true)
        .gte('event_date', now)
        .order('event_date', { ascending: true })
        .limit(3);

      if (!isMounted) return;

      if (fetchError) {
        setError(fetchError.message || 'Something went wrong while loading events.');
        setEvents([]);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const containerVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };

  const itemVars = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const [featured, ...rest] = events;

  return (
    <section
      className="slide w-full py-12 md:py-20 relative flex items-center justify-center bg-[var(--bg-color)] overflow-hidden"
      ref={ref}
      {...props}
    >
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
              <span className="block text-xs md:text-sm uppercase tracking-[0.2em] text-[var(--primary-color)] font-bold mb-3">
                Campus Life
              </span>
              <h2
                className="text-4xl md:text-5xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Latest{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-light)]">
                  Happenings
                </span>
              </h2>
            </div>
            <Link
              to="/events"
              className="group flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest text-[var(--text-color)] hover:text-[var(--primary-color)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-color)] rounded"
            >
              All Events{' '}
              <ArrowRight
                size={16}
                className="group-hover:translate-x-2 transition-transform"
                aria-hidden="true"
              />
            </Link>
          </div>
        </motion.div>

        {loading ? (
          <div
            className="flex justify-center items-center py-20"
            role="status"
            aria-live="polite"
          >
            <div className="w-10 h-10 border-4 border-[var(--card-border)] border-t-[var(--primary-color)] rounded-full animate-spin"></div>
            <span className="sr-only">Loading upcoming events…</span>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="py-20 text-center border border-[var(--card-border)] rounded-3xl bg-[var(--card-bg)]/50 backdrop-blur-md flex flex-col items-center gap-3"
            role="alert"
          >
            <AlertCircle size={28} className="text-[var(--primary-color)]" aria-hidden="true" />
            <p className="text-[var(--text-muted)] text-lg">
              We couldn't load events right now. Please try again shortly.
            </p>
          </motion.div>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="py-20 text-center border border-[var(--card-border)] rounded-3xl bg-[var(--card-bg)]/50 backdrop-blur-md"
          >
            <p className="text-[var(--text-muted)] text-lg">
              No upcoming public events scheduled at the moment.
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVars}
          >
            {/* Featured Event (first upcoming event) */}
            <motion.div variants={itemVars}>
              <Link
                to={`/events/${featured.slug || featured.id}`}
                className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-2xl h-[320px] sm:h-[400px] lg:h-full block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-color)]"
              >
                <div
                  className="absolute inset-0 bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-[1.5s]"
                  style={{
                    backgroundImage: `url('${featured.image_url || FALLBACK_IMAGES[0]}')`,
                    backgroundSize: featured.image_url ? 'cover' : 'contain',
                    backgroundColor: featured.image_url ? 'transparent' : '#ffffff',
                    backgroundPosition: 'center',
                  }}
                  role="img"
                  aria-label={featured.title}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-[var(--primary-color)] text-black px-4 py-2 rounded-lg text-center font-bold">
                      <span className="block text-2xl leading-none">
                        {formatDay(featured.event_date)}
                      </span>
                      <span className="block text-[10px] uppercase tracking-widest">
                        {formatMonth(featured.event_date)}
                      </span>
                    </div>
                    {featured.category && (
                      <span className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase text-white border border-white/10">
                        {featured.category}
                      </span>
                    )}
                  </div>

                  <h3
                    className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {featured.title}
                  </h3>
                  {featured.description && (
                    <p className="text-gray-300 text-sm mb-6 max-w-md line-clamp-2">
                      {featured.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
                    <span className="flex items-center gap-2">
                      <Clock size={16} aria-hidden="true" /> {formatTime(featured.event_date)}
                    </span>
                    {featured.location && (
                      <span className="flex items-center gap-2">
                        <MapPin size={16} aria-hidden="true" /> {featured.location}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Remaining upcoming events */}
            <div className="hidden lg:flex flex-col gap-4">
              {rest.length > 0 ? (
                rest.map((event) => (
                  <motion.div key={event.id} variants={itemVars}>
                    <Link
                      to={`/events/${event.slug || event.id}`}
                      className="group flex flex-col sm:flex-row bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden hover:border-[var(--primary-color)]/30 transition-colors shadow-lg cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-color)]"
                    >
                      <div
                        className="w-full sm:w-40 h-40 sm:h-auto bg-center bg-no-repeat overflow-hidden relative flex-shrink-0"
                        style={{
                          backgroundImage: `url('${
                            event.image_url ||
                            FALLBACK_IMAGES[(event.id?.length || 1) % FALLBACK_IMAGES.length]
                          }')`,
                          backgroundSize: event.image_url ? 'cover' : 'contain',
                          backgroundColor: event.image_url ? 'transparent' : '#ffffff'
                        }}
                        role="img"
                        aria-label={event.title}
                      >
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                      </div>
                      <div className="p-6 flex flex-col justify-center flex-1 min-w-0">
                        <div className="flex items-center gap-3 text-[10px] font-bold text-[var(--primary-color)] tracking-widest uppercase mb-2">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={12} aria-hidden="true" />
                            {formatFullDate(event.event_date)}
                          </span>
                          {event.category && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-white/30"></span>
                              <span className="text-[var(--text-muted)]">{event.category}</span>
                            </>
                          )}
                        </div>
                        <h4
                          className="text-xl font-bold mb-2 text-[var(--text-color)] group-hover:text-[var(--primary-color)] transition-colors truncate"
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                          {event.title}
                        </h4>
                        {event.description && (
                          <p className="text-[var(--text-muted)] text-xs line-clamp-1 mb-4">
                            {event.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mt-auto">
                          <ArrowRight
                            size={14}
                            className="text-[var(--primary-color)] group-hover:translate-x-2 transition-transform"
                            aria-hidden="true"
                          />
                          <span className="group-hover:text-[var(--text-color)] transition-colors">
                            Read More
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  variants={itemVars}
                  className="flex-1 flex items-center justify-center text-center border border-dashed border-[var(--card-border)] rounded-2xl p-8"
                >
                  <p className="text-[var(--text-muted)] text-sm">
                    More events will appear here as they're scheduled.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
});

EventsPreview.displayName = 'EventsPreview';
export default EventsPreview;
