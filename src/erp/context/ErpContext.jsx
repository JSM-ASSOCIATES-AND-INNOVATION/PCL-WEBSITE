"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/supabaseClient';

const ErpContext = createContext();
export const useERP = () => useContext(ErpContext);

// --- STRICT ROLE GUARD ---
const VALID_ROLES = ['student', 'faculty', 'admin'];

export const ErpProvider = ({ children }) => {
    // --- 1. INSTANT BOOT PROTOCOL (ZERO-LATENCY CACHE) ---
    const [userSession, setUserSession] = useState(() => {
        const cachedSession = localStorage.getItem('jsmerp_master_session');
        return cachedSession ? JSON.parse(cachedSession) : null;
    });

    // If we found a cached session, do NOT show the initial app loading screen!
    const [isAppLoading, setIsAppLoading] = useState(() => {
        return !localStorage.getItem('jsmerp_master_session');
    });

    const [notices, setNotices] = useState([]);

    // --- 1.5 GLOBAL UI STATE ---
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        const cachedState = localStorage.getItem('jsmerp_sidebar_collapsed');
        return cachedState === 'true';
    });

    const toggleSidebar = () => {
        setIsSidebarCollapsed(prev => {
            const newState = !prev;
            localStorage.setItem('jsmerp_sidebar_collapsed', String(newState));
            return newState;
        });
    };

    const [activeTheme, setActiveTheme] = useState(() => {
        const stored = localStorage.getItem('jsmerp_theme');
        if (stored) return stored;
        
        // Auto-detect system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark-luxury';
        }
        return 'marble-executive';
    });

    const [layoutPreference, setLayoutPreference] = useState(() => {
        return localStorage.getItem('jsmerp_layout') || 'topbar';
    });

    const changeLayout = (newLayout) => {
        setLayoutPreference(newLayout);
        localStorage.setItem('jsmerp_layout', newLayout);
    };

    const changeTheme = (newTheme) => {
        setActiveTheme(newTheme);
    };

    useEffect(() => {
        document.body.setAttribute('data-theme', activeTheme);
        localStorage.setItem('jsmerp_theme', activeTheme);
    }, [activeTheme]);

    // Navigation Layout State
    const [navLayout, setNavLayout] = useState(() => {
        return localStorage.getItem('jsmerp_nav_layout') || 'topnav'; // 'classic' | 'topnav'
    });

    const changeNavLayout = (layout) => {
        setNavLayout(layout);
        localStorage.setItem('jsmerp_nav_layout', layout);
    };

    // --- 2. SECURE PROFILE FETCHER (BACKGROUND REVALIDATION) ---
    const loadProfile = async (userId, userEmail) => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error || !profile) {
                await supabase.auth.signOut();
                throw new Error("Profile not found in database.");
            }

            const normalizedRole = profile.role?.toLowerCase().trim();

            // SECURITY HARDENING: Catch invalid database roles
            if (!VALID_ROLES.includes(normalizedRole)) {
                console.error(`CRITICAL: Invalid role "${profile.role}" for user ${userId}`);
                await supabase.auth.signOut();
                setUserSession(null);
                localStorage.removeItem('jsmerp_master_session'); // Purge bad cache
                throw new Error(`System Error: Unrecognized role '${profile.role}'. Contact Administration.`);
            }

            const sessionData = {
                id: profile.erp_id,
                db_id: userId,
                name: profile.full_name,
                email: userEmail,
                role: normalizedRole,
                academic_batch: profile.academic_batch,
                questionnaire_completed: profile.questionnaire_completed || false,
            };

            // Update UI and write to permanent cache
            setUserSession(sessionData);
            localStorage.setItem('jsmerp_master_session', JSON.stringify(sessionData));

        } catch (err) {
            console.error("Profile load failed:", err.message);
            setUserSession(null);
            localStorage.removeItem('jsmerp_master_session');
        } finally {
            setIsAppLoading(false);
        }
    };

    // --- 3. SINGLE-SOURCE AUTHENTICATION LISTENER ---
    useEffect(() => {
        let isMounted = true;

        // Failsafe: Guarantee the loading screen vanishes after 4 seconds
        const fallbackTimer = setTimeout(() => {
            if (isMounted) setIsAppLoading(false);
        }, 4000);

        // Check for active session on app boot (Background Check)
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                if (isMounted) setIsAppLoading(false);
                return;
            }
            if (isMounted && session?.user) {
                loadProfile(session.user.id, session.user.email);
            } else if (isMounted) {
                setIsAppLoading(false);
                localStorage.removeItem('jsmerp_master_session'); // Cleanup dead sessions
            }
        });

        // Listen for Login / Logout events
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            if (!isMounted) return;
            if (session?.user) {
                loadProfile(session.user.id, session.user.email);
            } else {
                setUserSession(null);
                setNotices([]);
                setIsAppLoading(false);
                localStorage.removeItem('jsmerp_master_session'); // Purge cache on logout
            }
        });

        return () => {
            isMounted = false;
            clearTimeout(fallbackTimer);
            listener.subscription?.unsubscribe();
        };
    }, []);

    // --- 4. LIGHTNING-FAST LOGIN ENGINE ---
    const login = async (credential, password) => {
        try {
            let cleanCredential = credential.toLowerCase().trim();
            
            // MAGIC SHORTHAND MAPPING FOR DEV
            if (cleanCredential === '26bbl') cleanCredential = '26bbl7020';
            if (cleanCredential === 'fac') cleanCredential = 'fac0001';
            if (cleanCredential === 'adm') cleanCredential = 'adm0001';

            const emailToLogin = cleanCredential.includes('@')
                ? cleanCredential
                : `${cleanCredential}_v2@jsm.edu`;

            // Step 1: Check Auth Vault
            const { data, error } = await supabase.auth.signInWithPassword({
                email: emailToLogin,
                password: password,
            });

            if (error) {
                return { success: false, error: { message: "Invalid credentials. Please verify your ID and password." } };
            }

            // Step 2: Ensure they exist in the Profiles table with a valid role
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (profileError || !profile) {
                await supabase.auth.signOut();
                return { success: false, error: { message: "Account authenticated, but your Profile is missing in the database. Contact Admin." } };
            }

            const normalizedRole = profile.role?.toLowerCase().trim();

            if (!VALID_ROLES.includes(normalizedRole)) {
                await supabase.auth.signOut();
                return { success: false, error: { message: `System configuration error: Invalid role '${profile.role}'. Contact Administration.` } };
            }

            // Let the onAuthStateChange listener (which just fired) handle state & caching cleanly!
            return { success: true };

        } catch (err) {
            console.error("Login catch error:", err);
            return { success: false, error: { message: "Server error. Check internet connection." } };
        }
    };

    // --- 5. LOGOUT ACTION ---
    const logout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('jsmerp_master_session'); // Hard purge cache
    };

    // --- 6. GLOBAL NOTICES & PUSH NOTIFICATIONS ---
    useEffect(() => {
        if (userSession) {
            const role = userSession.role;
            const filterNotice = (n) => {
                if (role === 'admin') return true;
                if (n.author_id === userSession.db_id) return true;
                if (n.target_audience === 'global') return true;
                if (role === 'student' && n.target_audience === 'student') return true;
                if (role === 'faculty' && n.target_audience === 'faculty') return true;
                if (n.target_audience === 'class' && n.target_id === userSession.academic_batch) return true;
                if (n.target_audience === 'person' && n.target_id === userSession.erp_id) return true;
                return false;
            };

            // Initial fetch
            supabase.from('admin_notices').select('*').order('created_at', { ascending: false })
                .then(({ data }) => { 
                    if (data) {
                        setNotices(data.filter(filterNotice));
                    }
                });

            // Request Push Notification Permission
            if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
                Notification.requestPermission();
            }

            // Realtime Listener for new notices (Push Notifications)
            const noticeChannel = supabase.channel('realtime_notices')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_notices' }, (payload) => {
                    const newNotice = payload.new;
                    if (filterNotice(newNotice)) {
                        setNotices(prev => [newNotice, ...prev]);
                        
                        // Trigger Native Push Notification
                        if ("Notification" in window && Notification.permission === "granted") {
                            new Notification(`New Notice: ${newNotice.title}`, {
                                body: newNotice.content,
                                icon: '/favicon.ico'
                            });
                        }
                    }
                })
                .subscribe();

            return () => {
                supabase.removeChannel(noticeChannel);
            };
        }
    }, [userSession]);

    // --- 7. LEGACY FALLBACKS (Prevents components from crashing if they use old features) ---
    const [attendanceCache, setAttendanceCache] = useState({});
    const updateAttendanceCache = (id, data) => setAttendanceCache(prev => ({ ...prev, [id]: data }));
    const clearAttendanceCache = () => setAttendanceCache({});
    // --- 8. GLOBAL TIMETABLE ENGINE (Zero‑Latency) ---
    const [globalTimetable, setGlobalTimetable] = useState({}); // { batchId: { day: { time: slotObj } } }
    const [facultyTimetable, setFacultyTimetable] = useState([]); // array of slots for logged‑in faculty

    // Fetch master timetable for all batches (admin view)
    useEffect(() => {
        if (!userSession) return;
        const fetchMaster = async () => {
            try {
                const { data, error } = await supabase.from('timetable').select('*');
                if (error) throw error;
                // Organize into nested object for fast lookup
                const organized = {};
                data.forEach(slot => {
                    const batch = slot.batch_id || 'DEFAULT';
                    organized[batch] = organized[batch] || {};
                    organized[batch][slot.day_of_week] = organized[batch][slot.day_of_week] || {};
                    organized[batch][slot.day_of_week][slot.start_time] = slot;
                });
                setGlobalTimetable(organized);
            } catch (e) {
                console.error('Failed to load global timetable', e);
            }
        };
        fetchMaster();
    }, [userSession]);

    // Fetch faculty‑specific schedule
    useEffect(() => {
        if (!userSession?.db_id) return;
        const fetchFaculty = async () => {
            try {
                const { data, error } = await supabase
                    .from('timetable')
                    .select('*, subjects(name, code)')
                    .eq('faculty_id', userSession.db_id)
                    .order('start_time', { ascending: true });
                if (error) throw error;
                setFacultyTimetable(data || []);
            } catch (e) {
                console.error('Failed to load faculty timetable', e);
            }
        };
        fetchFaculty();
    }, [userSession]);

    // Helper getters
    const getTimetableForBatch = (batchId) => globalTimetable[batchId] || {};
    const getFacultySlots = () => facultyTimetable;

    const value = {
        userSession, isAppLoading, login, logout,
        isSidebarCollapsed, toggleSidebar,
        layoutPreference, changeLayout,
        activeTheme, changeTheme,
        navLayout, changeNavLayout,
        notices, addNotice: async (notice) => {
            if (!userSession) return;
            try {
                const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
                const insertData = {
                    notice_id: noticeId,
                    title: notice.title,
                    category: notice.category || 'General',
                    target_audience: notice.target_audience || notice.target_role || 'global',
                    target_id: notice.target_id || null,
                    priority: notice.priority || 'normal',
                    content: notice.content,
                    author_name: notice.author_name || userSession.name,
                    author_id: userSession.db_id
                };
                const { data, error } = await supabase.from('admin_notices').insert([insertData]).select();
                if (error) throw error;
                // realtime listener handles state update, but we can optimistically update
                if (data && data.length > 0) {
                    setNotices(prev => [data[0], ...prev]);
                }
                return { success: true, data };
            } catch (e) {
                console.error('Add notice failed', e);
                return { success: false, error: e };
            }
        }, deleteNotice: async (id) => {
            if (!userSession) return;
            try {
                const { error } = await supabase.from('admin_notices').delete().eq('id', id);
                if (error) throw error;
                setNotices(prev => prev.filter(n => n.id !== id));
                return { success: true };
            } catch (e) {
                console.error('Delete notice failed', e);
                return { success: false, error: e };
            }
        }, refreshNotices: async () => {
            if (!userSession) return;
            try {
                const { data, error } = await supabase.from('admin_notices').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                setNotices(data);
                return { success: true, data };
            } catch (e) {
                console.error('Refresh notices failed', e);
                return { success: false, error: e };
            }
        },
        batches: [], faculty: [], rooms: [], subjects: [], globalTimetable, facultyTimetable,
        getTimetableForBatch,
        getFacultySlots,
        // Attendance helpers
        fetchAttendance: async (batchId) => {
            if (!userSession) return;
            try {
                const { data, error } = await supabase.from('attendance').select('*').eq('batch_id', batchId);
                if (error) throw error;
                const byDay = {};
                data.forEach(rec => {
                    const day = rec.day_of_week || 'Unknown';
                    byDay[day] = byDay[day] || [];
                    byDay[day].push(rec);
                });
                setAttendanceCache(prev => ({ ...prev, [batchId]: byDay }));
            } catch (e) {
                console.error('Failed to load attendance', e);
            }
        },
        getAttendanceForDay: (batchId, day) => {
            return (attendanceCache[batchId] && attendanceCache[batchId][day]) || [];
        },
        requestLeave: async (classId, reason) => {
            if (!userSession) return { success: false };
            try {
                const { data, error } = await supabase.from('leave_requests').insert([
                    {
                        student_id: userSession.db_id,
                        class_id: classId,
                        reason,
                        status: 'pending'
                    }
                ]);
                if (error) throw error;
                return { success: true, data };
            } catch (e) {
                console.error('Leave request failed', e);
                return { success: false, error: e };
            }
        },
        approveLeave: async (requestId, decision) => {
            if (!userSession) return { success: false };
            try {
                const { data, error } = await supabase.from('leave_requests')
                    .update({ status: decision, reviewed_at: new Date().toISOString(), mentor_id: userSession.db_id })
                    .eq('id', requestId);
                if (error) throw error;
                return { success: true, data };
            } catch (e) {
                console.error('Leave approval failed', e);
                return { success: false, error: e };
            }
        },
        attendanceCache, updateAttendanceCache, clearAttendanceCache,
        assignSlot: async () => { }, clearSlot: async () => { }, submitAttendance: async () => { },
        publishAssignment: async () => { }, submitGrade: async () => { }, submitMarksToCOE: async () => { },
        processStudentRequest: async () => { }, processFacultyLeave: async () => { },
        submitFacultyLeave: async () => { }, updateMeetingNotes: async () => { }
    };

    return (
        <ErpContext.Provider value={value}>
            {children}
        </ErpContext.Provider>
    );
};