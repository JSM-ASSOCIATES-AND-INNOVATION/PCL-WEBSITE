/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import { sendSystemEmail } from '../../../lib/EmailService';
import { supabase } from '../../../lib/supabase/supabaseClient';
import { theme } from "../../../theme";
import { createClient } from '@supabase/supabase-js';
import AdminStudentCVModal from './AdminStudentCVModal';
import AdminUserProfileModal from './AdminUserProfileModal';
import AdminPasswordResetsModal from './AdminPasswordResetsModal';

// Safe provisioning client so admin doesn't get logged out
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://saswiwkahpubgivrtjwy.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhc3dpd2thaHB1YmdpdnJ0and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMjQ1ODgsImV4cCI6MjA5MzgwMDU4OH0.tDp34Pnyy3v25D6GBW7RCQVvbwiAxKBCR_8e7cTlHpA';
const provisionClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
});

const CACHE_KEY = 'admin_user_directory';

export default function UserManagement({ isHubView = false }) {
    const [activeTab, setActiveTab] = useState("students"); // 'students', 'faculty', 'disciplinary'
    const [showProvisionModal, setShowProvisionModal] = useState(false);
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [provisionSuccess, setProvisionSuccess] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("name_asc"); // name_asc, name_desc, id_asc, id_desc, status

    const [selectedQuestionnaireUser, setSelectedQuestionnaireUser] = useState(null);
    const [qFormData, setQFormData] = useState({});

    // Profile Modal State
    const [selectedProfileUser, setSelectedProfileUser] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // Provisioning Form State
    const [newUserRole, setNewUserRole] = useState("student");
    const [bulkEmails, setBulkEmails] = useState("");
    const [assignment, setAssignment] = useState("");
    const [provisionLogs, setProvisionLogs] = useState([]);
    
    // Feature state
    const [showPasswordResetsModal, setShowPasswordResetsModal] = useState(false);

    // Actual Data
    const [usersData, setUsersData] = useState(() => {
        if (typeof window !== "undefined") {
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached) return JSON.parse(cached);
        }
        return { students: [], faculty: [], disciplinary: [] };
    });
    const [isLoading, setIsLoading] = useState(!sessionStorage.getItem(CACHE_KEY));
    const [cvStudentId, setCvStudentId] = useState(null);

    // --- DATA FETCHER ---
    const fetchDirectory = async () => {
        try {
            const { data: profiles, error } = await supabase.from('profiles').select('*');
            if (error) throw error;

            const structuredData = { students: [], faculty: [], disciplinary: [] };

            profiles.forEach(p => {
                const mapped = {
                    db_id: p.id,
                    id: p.erp_id,
                    name: p.full_name,
                    batch: p.academic_batch,
                    department: p.department,
                    email: p.email,
                    status: p.status || 'Active',
                    questionnaire_data: p.questionnaire_data
                };

                if (mapped.status === 'Suspended') {
                    structuredData.disciplinary.push(mapped);
                }

                if (p.role === 'student') {
                    structuredData.students.push(mapped);
                } else if (p.role === 'faculty') {
                    structuredData.faculty.push(mapped);
                }
            });

            setUsersData(structuredData);
            if (typeof window !== "undefined") {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify(structuredData));
            }
        } catch (error) {
            console.error("Failed to fetch directory:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDirectory();
    }, []);

    // --- ADMIN ACTIONS ---
    const handleToggleStatus = async (user) => {
        const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
        const confirmMsg = newStatus === 'Suspended' 
            ? `Are you sure you want to suspend ${user.name}? They will lose access to the portal.`
            : `Reactivate account for ${user.name}?`;
            
        if (!(await window.erpDialog.confirm(confirmMsg))) return;

        try {
            // Optimistic update
            const updatedUsers = { ...usersData };
            const list = user.batch ? updatedUsers.students : updatedUsers.faculty;
            const index = list.findIndex(u => u.db_id === user.db_id);
            if (index !== -1) list[index].status = newStatus;
            
            if (newStatus === 'Suspended') {
                updatedUsers.disciplinary.push({...list[index], status: newStatus});
            } else {
                updatedUsers.disciplinary = updatedUsers.disciplinary.filter(u => u.db_id !== user.db_id);
            }

            setUsersData(updatedUsers);

            const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', user.db_id);
            if (error) {
                fetchDirectory(); // revert
                throw error;
            }
        } catch (error) {
            window.erpDialog.alert("Failed to update status: " + error.message);
        }
    };

    const handleResetPassword = async (user) => {
        if (!(await window.erpDialog.confirm(`Issue a password reset for ${user.name} (${user.email})?`))) return;
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(user.email);
            if (error) throw error;
            window.erpDialog.alert("Password reset email sent to " + user.email);
        } catch (error) {
            window.erpDialog.alert("Failed to send reset: " + error.message);
        }
    };

    // --- PROVISIONING LOGIC ---
    const openProvisionWizard = () => {
        setNewUserRole("student");
        setBulkEmails("");
        setAssignment("");
        setProvisionLogs([]);
        setShowProvisionModal(true);
    };

    const closeProvisionWizard = () => {
        setShowProvisionModal(false);
    };

    const handleProvisionSubmit = async (e) => {
        e.preventDefault();
        if (!bulkEmails.trim() || !assignment) return;

        setIsProvisioning(true);
        setProvisionLogs([]);

        const emails = bulkEmails.split(',').map(e => e.trim()).filter(e => e);

        let shortcut = "BBL";
        if (assignment === "BA LLB") shortcut = "BAL";
        if (assignment === "LLB") shortcut = "LLB";

        for (const email of emails) {
            try {
                const prefix = newUserRole === "student" ? `26${shortcut}` : "FAC-";
                
                // --- SEQUENTIAL ID AUTOMATION ---
                // Fetch the highest existing ID for this prefix to sequentially generate the next one
                const { data: highestIdData, error: highestIdError } = await supabase
                    .from('profiles')
                    .select('erp_id')
                    .ilike('erp_id', `${prefix}%`)
                    .order('erp_id', { ascending: false })
                    .limit(1);
                
                let nextNum = 1;
                if (highestIdData && highestIdData.length > 0 && highestIdData[0].erp_id) {
                    const lastId = highestIdData[0].erp_id;
                    const numPart = lastId.replace(prefix, '');
                    const parsedNum = parseInt(numPart, 10);
                    if (!isNaN(parsedNum)) {
                        nextNum = parsedNum + 1;
                    }
                }
                
                const generatedId = `${prefix}${nextNum.toString().padStart(4, '0')}`;
                // --------------------------------

                const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
                let generatedPassword = "Jsm#";
                for (let i = 0; i < 6; i++) {
                    generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
                }

                setProvisionLogs(prev => [...prev, `[${generatedId}] Generating credentials for ${email}...`]);

                const { data: authData, error: authError } = await provisionClient.auth.signUp({
                    email: email,
                    password: generatedPassword,
                });

                if (authError) throw authError;
                if (!authData.user) throw new Error("User creation failed.");

                const userId = authData.user.id;
                setProvisionLogs(prev => [...prev, `[${generatedId}] Auth created. Inserting profile...`]);

                const { error: profileError } = await supabase.from('profiles').upsert({
                    id: userId,
                    erp_id: generatedId,
                    full_name: `${newUserRole === 'student' ? 'Student' : 'Faculty'} (${generatedId})`,
                    email: email,
                    role: newUserRole,
                    academic_batch: newUserRole === 'student' ? assignment : null,
                    department: newUserRole === 'faculty' ? assignment : null,
                    status: 'Active'
                });

                if (profileError) throw profileError;

                setProvisionLogs(prev => [...prev, `[${generatedId}] Profile inserted. Triggering EmailJS dispatch...`]);

                try {
                    await sendSystemEmail('ONBOARDING', email, {
                        erp_id: generatedId,
                        password: generatedPassword,
                        login_url: window.location.origin
                    });
                    setProvisionLogs(prev => [...prev, `[${generatedId}] SUCCESS: Email dispatched.`]);
                } catch (emailErr) {
                    console.error("EmailJS Error:", emailErr);
                    setProvisionLogs(prev => [...prev, `[${generatedId}] WARNING: ${emailErr.message}`]);
                    setProvisionLogs(prev => [...prev, `[${generatedId}] WARNING: Identity created, but EmailJS dispatch failed. Manual distribution required. PW: ${generatedPassword}`]);
                }
            } catch (err) {
                console.error(err);
                setProvisionLogs(prev => [...prev, `[ERROR] Pipeline aborted for ${email}: ${err.message}`]);
            }
        }
        
        setProvisionLogs(prev => [...prev, "--- Mass provisioning pipeline completed successfully ---"]);
        
        setIsProvisioning(false);
        setProvisionSuccess(true);
        fetchDirectory();
    };

    // handleResetPassword is defined above

    const getSortedFilteredList = () => {
        let list = usersData[activeTab] || [];
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            list = list.filter(u => 
                u.name?.toLowerCase().includes(query) || 
                u.id?.toLowerCase().includes(query) || 
                u.email?.toLowerCase().includes(query)
            );
        }
        list.sort((a, b) => {
            switch (sortBy) {
                case 'name_asc': return (a.name || '').localeCompare(b.name || '');
                case 'name_desc': return (b.name || '').localeCompare(a.name || '');
                case 'id_asc': return (a.id || '').localeCompare(b.id || '');
                case 'id_desc': return (b.id || '').localeCompare(a.id || '');
                case 'status': return (a.status || '').localeCompare(b.status || '');
                default: return 0;
            }
        });
        return list;
    };

    const currentList = getSortedFilteredList();

    return (
        <div className={`w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in selection:bg-themeElevated ${isHubView ? 'bg-transparent text-themeText font-sans' : ''}`}>

            {/* 1. MASTER HEADER */}
            {!isHubView && (
                <div className={`w-full relative overflow-hidden rounded-[2rem] shadow-2xl p-6 lg:p-8 flex flex-col gap-6 border border-themeBorder bg-gradient-to-r from-themeAccent to-themeAccent/80`}>
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-overlay pointer-events-none"></div>
                    
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                        <div className="flex items-center gap-4 lg:gap-5">
                            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1rem] bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                                <i className="fa-solid fa-users-gear text-white text-2xl lg:text-3xl drop-shadow-md"></i>
                            </div>
                            <div>
                                <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-white mb-1 drop-shadow-md`}>User Access Management</h1>
                                <p className="text-white/80 text-xs lg:text-sm font-medium tracking-wide">Provision accounts, manage roles, and enforce disciplinary actions.</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 w-full lg:w-auto">
                            <button
                                onClick={() => setShowPasswordResetsModal(true)}
                                className="flex-1 lg:flex-none px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 border border-white/30 backdrop-blur-md"
                            >
                                <i className="fa-solid fa-unlock-keyhole text-base"></i> Password Resets
                            </button>
                            <button
                                onClick={() => setShowProvisionModal(true)}
                                className="flex-1 lg:flex-none px-6 py-3 bg-white hover:bg-white/90 text-themeAccent rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 border border-white/50"
                            >
                                <i className="fa-solid fa-user-plus text-base"></i> Rapid Provisioning
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* FAB FOR HUB VIEW */}
            {isHubView && (
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setShowProvisionModal(true)}
                        className="bg-themeAccent hover:bg-themeAccentMuted text-white px-6 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all shadow-lg flex justify-center items-center gap-2 border border-themeAccent active:scale-[0.98]"
                    >
                        <i className="fa-solid fa-user-plus text-base"></i> Rapid Provisioning
                    </button>
                </div>
            )}

            {/* 2. CONTROLS & DIRECTORY */}
            <div className="flex flex-col gap-4 lg:gap-6 animate-fade-in">

                {/* Top Controls: Tabs, Search, Sort */}
                <div className={`${theme.layout.panel} rounded-themePanel p-4 lg:p-5 flex flex-col lg:flex-row justify-between items-center gap-4 border-theme border-themeBorder shadow-sm`}>
                    
                    {/* Tabs */}
                    <div className="flex p-1.5 bg-themeApp rounded-themePanel border-theme border-themeBorder w-full lg:w-auto shrink-0">
                        <button
                            onClick={() => setActiveTab('students')}
                            className={`flex-1 lg:flex-none px-4 lg:px-6 py-2.5 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'students' ? "bg-themeElevated text-themeAccent shadow-sm border-theme border-themeBorderStrong" : "text-themeTextSec opacity-70 hover:text-themeText hover:bg-themeElevated/50 border-theme border-transparent"}`}
                        >
                            Students <span className="ml-2 px-1.5 py-0.5 bg-themeApp rounded-md text-[9px] text-themeTextSec">{usersData.students.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('faculty')}
                            className={`flex-1 lg:flex-none px-4 lg:px-6 py-2.5 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'faculty' ? "bg-themeElevated text-themeAccent shadow-sm border-theme border-themeBorderStrong" : "text-themeTextSec opacity-70 hover:text-themeText hover:bg-themeElevated/50 border-theme border-transparent"}`}
                        >
                            Faculty <span className="ml-2 px-1.5 py-0.5 bg-themeApp rounded-md text-[9px] text-themeTextSec">{usersData.faculty.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('disciplinary')}
                            className={`flex-1 lg:flex-none px-4 lg:px-6 py-2.5 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'disciplinary' ? "bg-rose-500/10 text-rose-500 shadow-sm border-theme border-rose-500/20" : "text-themeTextSec opacity-70 hover:text-rose-400 hover:bg-rose-500/5 border-theme border-transparent"}`}
                        >
                            Disciplinary <span className="ml-2 px-1.5 py-0.5 bg-themeApp rounded-md text-[9px] text-themeTextSec">{usersData.disciplinary.length}</span>
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                        {/* Search */}
                        <div className="relative w-full sm:w-64 group">
                            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-themeTextSec opacity-70 group-focus-within:text-themeAccent transition-colors text-sm"></i>
                            <input
                                type="text"
                                placeholder="Search Name, ID, Email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-themeApp border-theme border-themeBorder rounded-themePanel pl-10 pr-4 py-3 text-xs lg:text-sm font-bold text-themeText focus:bg-themeElevated focus:border-themeAccent outline-none transition-all placeholder:text-neutral-600"
                            />
                        </div>

                        {/* Sort */}
                        <div className="relative w-full sm:w-48">
                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full bg-themeApp border-theme border-themeBorder rounded-themePanel px-4 py-3 text-xs lg:text-sm font-bold text-themeText focus:bg-themeElevated focus:border-themeAccent outline-none appearance-none cursor-pointer"
                            >
                                <option value="name_asc">Sort: Name (A-Z)</option>
                                <option value="name_desc">Sort: Name (Z-A)</option>
                                <option value="id_asc">Sort: ERP ID (Asc)</option>
                                <option value="id_desc">Sort: ERP ID (Desc)</option>
                                <option value="status">Sort: Status</option>
                            </select>
                            <i className="fa-solid fa-arrow-down-a-z absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec opacity-70 pointer-events-none text-sm"></i>
                        </div>
                    </div>
                </div>

                {/* Data Grid / Mobile Cards */}
                <div className={`${theme.layout.panel} rounded-themePanel lg:rounded-themePanel overflow-hidden border-theme border-themeBorder shadow-sm min-h-[400px]`}>
                    
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-themeApp border-b-theme border-themeBorder">
                                    <th className={`p-4 lg:p-5 pl-5 lg:pl-6 text-[9px] lg:text-[10px] font-black ${theme.text.muted} uppercase tracking-widest w-12 lg:w-16`}>Status</th>
                                    <th className={`p-4 lg:p-5 text-[9px] lg:text-[10px] font-black ${theme.text.muted} uppercase tracking-widest`}>User Profile</th>
                                    <th className={`p-4 lg:p-5 text-[9px] lg:text-[10px] font-black ${theme.text.muted} uppercase tracking-widest`}>{activeTab === 'students' ? 'Curriculum / Batch' : 'Department'}</th>
                                    <th className={`p-4 lg:p-5 pr-5 lg:pr-6 text-[9px] lg:text-[10px] font-black ${theme.text.muted} uppercase tracking-widest text-right`}>Admin Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-themeBorder">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center text-themeTextSec opacity-70 font-bold text-sm">
                                            <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Loading directory...
                                        </td>
                                    </tr>
                                ) : currentList.map((user, i) => (
                                    <tr key={i} className="hover:bg-themeApp transition-colors group">
                                        <td className="p-4 lg:p-5 pl-5 lg:pl-6">
                                            <div className={`w-3 h-3 rounded-full border-2 ${user.status === 'Active' ? 'bg-emerald-500 border-emerald-900 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-rose-500 border-rose-900 shadow-[0_0_8px_rgba(244,63,94,0.4)]'}`} title={user.status}></div>
                                        </td>
                                        <td className="p-4 lg:p-5">
                                            <div className="flex items-center gap-4 cursor-pointer group/profile" onClick={() => { setSelectedProfileUser(user); setIsProfileModalOpen(true); }}>
                                                <div className={`w-10 h-10 rounded-themePanel flex items-center justify-center font-black text-sm border-theme shrink-0 group-hover/profile:shadow-lg transition-shadow ${activeTab === 'students' ? 'bg-themeElevated text-themeAccent border-themeBorderStrong' : 'bg-themeElevated text-blue-400 border-themeBorderStrong'}`}>
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-themeText group-hover/profile:text-themeAccent transition-colors truncate">{user.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-[10px] font-bold ${theme.text.muted} uppercase tracking-widest shrink-0`}>{user.id}</span>
                                                        <span className="w-1 h-1 bg-neutral-700 rounded-full shrink-0"></span>
                                                        <span className={`text-[10px] font-medium text-themeAccent/80 truncate`}>{user.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 lg:p-5">
                                            <span className={`text-xs font-bold text-themeText bg-themeApp px-3 py-1.5 rounded-lg border-theme border-themeBorder inline-block truncate max-w-none`}>
                                                {user.batch || user.department || "Unassigned"}
                                            </span>
                                        </td>
                                        <td className="p-4 lg:p-5 pr-5 lg:pr-6">
                                            <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                {activeTab === 'students' && (
                                                    <button onClick={() => setCvStudentId(user.db_id)} className="w-8 h-8 rounded-lg bg-themeApp border-theme border-themeBorderStrong hover:border-emerald-500 hover:text-emerald-400 text-themeTextSec flex items-center justify-center transition-colors shadow-sm" title="View Student CV">
                                                        <i className="fa-solid fa-file-pdf text-[10px]"></i>
                                                    </button>
                                                )}
                                                <button onClick={() => handleResetPassword(user)} className="w-8 h-8 rounded-lg bg-themeApp border-theme border-themeBorderStrong hover:border-indigo-500 hover:text-themeAccent text-themeTextSec flex items-center justify-center transition-colors shadow-sm" title="Reset Password">
                                                    <i className="fa-solid fa-key text-[10px]"></i>
                                                </button>
                                                {activeTab === 'students' && (
                                                    <button onClick={() => { setSelectedQuestionnaireUser(user); setQFormData(user.questionnaire_data || { legalInterest: '', accommodation: '', emergencyContact: '', emergencyPhone: '' }); }} className="w-8 h-8 rounded-lg bg-themeApp border-theme border-themeBorderStrong hover:border-amber-500 hover:text-amber-400 text-themeTextSec flex items-center justify-center transition-colors shadow-sm" title="Edit Questionnaire">
                                                        <i className="fa-solid fa-clipboard-list text-[10px]"></i>
                                                    </button>
                                                )}
                                                <button onClick={() => handleToggleStatus(user)} className={`w-8 h-8 rounded-lg bg-themeApp border-theme flex items-center justify-center transition-colors shadow-sm ${user.status === 'Active' ? 'border-themeBorderStrong hover:border-rose-500 hover:text-rose-500 text-themeTextSec' : 'border-rose-500/50 bg-rose-500/10 text-rose-500 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'}`} title={user.status === 'Active' ? 'Suspend Account' : 'Reactivate'}>
                                                    <i className={`fa-solid ${user.status === 'Active' ? 'fa-ban' : 'fa-rotate-left'} text-[10px]`}></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!isLoading && currentList.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center text-themeTextSec opacity-70 font-bold text-sm">
                                            No users found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden flex flex-col divide-y divide-themeBorder bg-themeApp">
                        {isLoading ? (
                            <div className="py-10 text-center text-themeTextSec opacity-70 font-bold text-xs">
                                <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Loading directory...
                            </div>
                        ) : currentList.map((user, i) => (
                            <div key={i} className="p-4 flex flex-col gap-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0 cursor-pointer group/profile" onClick={() => { setSelectedProfileUser(user); setIsProfileModalOpen(true); }}>
                                        <div className={`w-10 h-10 rounded-themePanel flex items-center justify-center font-black text-sm border-theme shrink-0 group-hover/profile:shadow-lg transition-shadow ${activeTab === 'students' ? 'bg-themeElevated text-themeAccent border-themeBorderStrong' : 'bg-themeElevated text-blue-400 border-themeBorderStrong'}`}>
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-themeText group-hover/profile:text-themeAccent transition-colors truncate">{user.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`text-[10px] font-bold ${theme.text.muted} uppercase tracking-widest shrink-0`}>{user.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                        {user.status}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 text-xs font-medium text-themeAccent/80 bg-themeElevated p-2 rounded-lg border-theme border-themeBorderStrong truncate">
                                    <i className="fa-solid fa-envelope text-themeTextSec"></i> {user.email}
                                </div>

                                <div className="flex items-center justify-between mt-1">
                                    <span className={`text-[10px] font-bold text-themeText bg-themeElevated px-2 py-1 rounded-md border-theme border-themeBorderStrong truncate max-w-[150px]`}>
                                        {user.batch || user.department || "Unassigned"}
                                    </span>

                                    <div className="flex gap-2">
                                        <button onClick={() => handleResetPassword(user)} className="w-8 h-8 rounded-lg bg-themeElevated border-theme border-themeBorderStrong text-themeTextSec flex items-center justify-center">
                                            <i className="fa-solid fa-key text-[10px]"></i>
                                        </button>
                                        {activeTab === 'students' && (
                                            <button onClick={() => { setSelectedQuestionnaireUser(user); setQFormData(user.questionnaire_data || { legalInterest: '', accommodation: '', emergencyContact: '', emergencyPhone: '' }); }} className="w-8 h-8 rounded-lg bg-themeElevated border-theme border-themeBorderStrong text-amber-500 flex items-center justify-center">
                                                <i className="fa-solid fa-clipboard-list text-[10px]"></i>
                                            </button>
                                        )}
                                        <button onClick={() => handleToggleStatus(user)} className={`w-8 h-8 rounded-lg border-theme flex items-center justify-center ${user.status === 'Active' ? 'bg-themeElevated border-themeBorderStrong text-rose-400' : 'bg-rose-500 border-rose-600 text-white'}`}>
                                            <i className={`fa-solid ${user.status === 'Active' ? 'fa-ban' : 'fa-rotate-left'} text-[10px]`}></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {!isLoading && currentList.length === 0 && (
                            <div className="py-10 text-center text-themeTextSec opacity-70 font-bold text-xs">
                                No users found matching your criteria.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. PROVISIONING WIZARD MODAL */}
            {showProvisionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-themePanel w-full max-w-2xl rounded-themePanel lg:rounded-themePanel overflow-hidden border-theme border-themeBorder flex flex-col max-h-[90vh] shadow-2xl">

                        {/* Modal Header */}
                        <div className="bg-themeElevated p-5 lg:p-6 text-themeText relative shrink-0 border-b-theme border-themeBorder">
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <h3 className="text-lg lg:text-xl font-black tracking-tight mb-1 text-themeText">Provision New Account</h3>
                                    <p className={`text-[10px] lg:text-xs text-themeAccent font-medium`}>Generate credentials and assign records.</p>
                                </div>
                                <button onClick={closeProvisionWizard} className="w-8 h-8 flex items-center justify-center rounded-full bg-themeApp hover:bg-themeBorder border-theme border-themeBorderStrong text-themeText transition-colors shrink-0">
                                    <i className="fa-solid fa-xmark text-sm"></i>
                                </button>
                            </div>
                        </div>

                        {/* Modal Form Content */}
                        <div className="overflow-y-auto p-5 lg:p-6 flex-1 bg-themeApp no-scrollbar">
                            {provisionSuccess ? (
                                <div className="flex flex-col items-center justify-center py-8 lg:py-10 animate-fade-in text-center">
                                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-themeElevated text-emerald-400 border-theme border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] rounded-full flex items-center justify-center text-3xl lg:text-4xl mb-4">
                                        <i className="fa-solid fa-check"></i>
                                    </div>
                                    <h3 className={`${theme.text.heading} text-xl lg:text-2xl text-themeText mb-1`}>Account Provisioned!</h3>
                                    <p className={`text-xs lg:text-sm ${theme.text.muted} mb-6 lg:mb-8`}>Securely share these credentials.</p>

                                    <div className="w-full max-w-sm bg-themePanel rounded-themePanel p-5 lg:p-6 border-theme border-themeBorder flex flex-col gap-4 relative overflow-hidden text-left">
                                        <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>

                                        <div className="border-t-theme border-themeBorder pt-3 lg:pt-4">
                                            <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-2 block`}>Automation Logs</span>
                                            <div className="bg-themeApp border-theme border-themeBorder rounded-lg p-3 text-left font-mono text-[10px] lg:text-xs h-32 overflow-y-auto">
                                                {provisionLogs.map((log, i) => (
                                                    <div key={i} className={`mb-1 ${log.includes('SUCCESS') ? 'text-emerald-400' : log.includes('ERROR') || log.includes('WARNING') ? 'text-rose-400' : 'text-themeTextSec'}`}>
                                                        &gt; {log}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <button onClick={closeProvisionWizard} className="mt-6 lg:mt-8 text-[10px] lg:text-xs font-black uppercase tracking-widest text-themeTextSec opacity-70 hover:text-themeText transition-colors">
                                        Done & Close
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleProvisionSubmit} className="flex flex-col gap-5 lg:gap-6">

                                    {/* Role Selector */}
                                    <div className="flex p-1.5 bg-themePanel rounded-themePanel border-theme border-themeBorder w-full">
                                        <button type="button" onClick={() => setNewUserRole("student")} className={`flex-1 py-3 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${newUserRole === 'student' ? 'bg-themeElevated text-themeAccent shadow-sm border-theme border-themeBorderStrong' : 'text-neutral-600 hover:text-themeText'}`}>Student</button>
                                        <button type="button" onClick={() => setNewUserRole("faculty")} className={`flex-1 py-3 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${newUserRole === 'faculty' ? 'bg-themeElevated text-themeAccent shadow-sm border-theme border-themeBorderStrong' : 'text-neutral-600 hover:text-themeText'}`}>Faculty</button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 lg:gap-5">
                                        <div>
                                            <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-1.5 ml-1`}>
                                                {newUserRole === 'student' ? 'Assign Batch' : 'Assign Department'}
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={assignment}
                                                    onChange={(e) => setAssignment(e.target.value)}
                                                    className="w-full border-theme border-themeBorderStrong rounded-themePanel px-4 py-3 text-xs lg:text-sm font-bold bg-themePanel text-themeText focus:bg-themeElevated focus:border-themeAccent outline-none transition-all appearance-none cursor-pointer"
                                                    required
                                                >
                                                    {newUserRole === 'student' ? (
                                                        <>
                                                            <option value="">Select Batch...</option>
                                                            <option value="BBA LLB">BBA LLB (BBL)</option>
                                                            <option value="BA LLB">BA LLB (BAL)</option>
                                                            <option value="LLB">LLB (LLB)</option>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <option value="">Select Department...</option>
                                                            <option value="Corporate Law">Corporate Law</option>
                                                            <option value="Taxation & Finance">Taxation & Finance</option>
                                                        </>
                                                    )}
                                                </select>
                                                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec opacity-70 pointer-events-none text-xs"></i>
                                            </div>
                                        </div>

                                        <div>
                                            <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-1.5 ml-1 flex justify-between`}>
                                                <span>Bulk Email List</span>
                                                <span className="text-themeAccent">Comma-separated</span>
                                            </label>
                                            <textarea
                                                rows="4"
                                                value={bulkEmails}
                                                onChange={(e) => setBulkEmails(e.target.value)}
                                                placeholder="e.g. john@jsm.edu.in, sarah@jsm.edu.in"
                                                className="w-full border-theme border-themeBorderStrong rounded-themePanel px-4 py-3 text-xs lg:text-sm font-bold bg-themePanel text-themeText focus:bg-themeElevated focus:border-themeAccent outline-none transition-all placeholder:text-neutral-600 resize-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Logs Display during provisioning */}
                                    {isProvisioning && (
                                        <div className="bg-themeApp border-theme border-themeBorder rounded-lg p-3 text-left font-mono text-[10px] h-32 overflow-y-auto mt-2">
                                            {provisionLogs.map((log, i) => (
                                                <div key={i} className={`mb-1 ${log.includes('SUCCESS') ? 'text-emerald-400' : log.includes('ERROR') || log.includes('WARNING') ? 'text-rose-400' : 'text-themeTextSec'}`}>
                                                    &gt; {log}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </form>
                            )}
                        </div>

                        {/* Modal Footer */}
                        {!provisionSuccess && (
                            <div className="p-4 lg:p-5 border-t-theme border-themeBorder bg-themePanel shrink-0 flex flex-col sm:flex-row gap-3">
                                <button type="button" onClick={closeProvisionWizard} className="w-full sm:w-auto px-6 py-3.5 bg-themeElevated hover:bg-themeBorder text-themeTextSec hover:text-themeText rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-colors border-theme border-themeBorderStrong active:scale-95">Cancel</button>
                                <button onClick={handleProvisionSubmit} disabled={isProvisioning || !bulkEmails || !assignment} className="w-full sm:flex-1 bg-themeAccent hover:bg-themeAccentMuted text-white rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2 group relative overflow-hidden active:scale-[0.98] shadow-lg">
                                    {!isProvisioning && bulkEmails && assignment && (
                                        <div className="absolute inset-0 w-full h-full -translate-x-full group-hover:"></div>
                                    )}
                                    {isProvisioning ? <><i className="fa-solid fa-circle-notch fa-spin text-sm"></i> Provisioning...</> : <><i className="fa-solid fa-server text-sm"></i> Execute Provisioning</>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 4. ADMIN QUESTIONNAIRE OVERRIDE MODAL */}
            {selectedQuestionnaireUser && (
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className={`w-full max-w-lg bg-themePanel border-theme border-themeBorder shadow-2xl rounded-themePanel overflow-hidden flex flex-col max-h-[90vh]`}>
                        <div className="p-6 border-b-theme border-themeBorder flex justify-between items-center bg-themeElevated">
                            <div>
                                <h3 className={`${theme.text.heading} text-lg text-themeText`}>Edit Questionnaire Data</h3>
                                <p className="text-xs text-themeTextSec font-medium mt-1">For: {selectedQuestionnaireUser.name} ({selectedQuestionnaireUser.id})</p>
                            </div>
                            <button onClick={() => setSelectedQuestionnaireUser(null)} className="w-8 h-8 rounded-full bg-themeApp text-themeTextSec hover:text-themeText flex items-center justify-center border-theme border-themeBorderStrong transition-colors">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex flex-col gap-5 custom-scrollbar bg-themeApp">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] text-themeTextSec uppercase tracking-widest font-bold ml-1">Legal Interest</label>
                                    <input type="text" value={qFormData.legalInterest || ''} onChange={e => setQFormData({...qFormData, legalInterest: e.target.value})} className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeAccent transition-colors" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] text-themeTextSec uppercase tracking-widest font-bold ml-1">Blood Group</label>
                                    <input type="text" value={qFormData.bloodGroup || ''} onChange={e => setQFormData({...qFormData, bloodGroup: e.target.value})} className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeAccent transition-colors" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] text-themeTextSec uppercase tracking-widest font-bold ml-1">Aadhar Number</label>
                                    <input type="text" value={qFormData.aadharNumber || ''} onChange={e => setQFormData({...qFormData, aadharNumber: e.target.value})} className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeAccent transition-colors" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] text-themeTextSec uppercase tracking-widest font-bold ml-1">Past Legal Gens</label>
                                    <input type="text" value={qFormData.pastLegalGenerations || ''} onChange={e => setQFormData({...qFormData, pastLegalGenerations: e.target.value})} className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeAccent transition-colors" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] text-themeTextSec uppercase tracking-widest font-bold ml-1">Father's Name</label>
                                    <input type="text" value={qFormData.fatherName || ''} onChange={e => setQFormData({...qFormData, fatherName: e.target.value})} className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeAccent transition-colors" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] text-themeTextSec uppercase tracking-widest font-bold ml-1">Mother's Name</label>
                                    <input type="text" value={qFormData.motherName || ''} onChange={e => setQFormData({...qFormData, motherName: e.target.value})} className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeAccent transition-colors" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-themeTextSec uppercase tracking-widest font-bold ml-1">Present Address</label>
                                <textarea rows="2" value={qFormData.presentAddress || ''} onChange={e => setQFormData({...qFormData, presentAddress: e.target.value})} className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeAccent transition-colors resize-none" />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-themeTextSec uppercase tracking-widest font-bold ml-1">Permanent Address</label>
                                <textarea rows="2" value={qFormData.permanentAddress || ''} onChange={e => setQFormData({...qFormData, permanentAddress: e.target.value})} className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeAccent transition-colors resize-none" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] text-themeTextSec uppercase tracking-widest font-bold ml-1">Emergency Contact Name</label>
                                    <input type="text" value={qFormData.emergencyContact || ''} onChange={e => setQFormData({...qFormData, emergencyContact: e.target.value})} className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeAccent transition-colors" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] text-themeTextSec uppercase tracking-widest font-bold ml-1">Emergency Phone</label>
                                    <input type="text" value={qFormData.emergencyPhone || ''} onChange={e => setQFormData({...qFormData, emergencyPhone: e.target.value})} className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel p-3.5 text-xs font-bold text-themeText outline-none focus:border-themeAccent transition-colors" />
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border-t-theme border-themeBorder bg-themePanel flex justify-end gap-3 shrink-0">
                            <button onClick={() => setSelectedQuestionnaireUser(null)} className="px-6 py-3 bg-themeElevated hover:bg-themeBorder text-themeTextSec hover:text-themeText rounded-themePanel text-[10px] font-black uppercase tracking-widest transition-colors border-theme border-themeBorderStrong">Cancel</button>
                            <button onClick={handleSaveQuestionnaire} className="px-6 py-3 bg-themeAccent hover:bg-themeAccentMuted text-white rounded-themePanel text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95">Save Override</button>
                        </div>
                    </div>
                </div>
            )}
            {/* User Profile Modal */}
            <AdminUserProfileModal 
                user={selectedProfileUser} 
                isOpen={isProfileModalOpen} 
                onClose={() => setIsProfileModalOpen(false)} 
            />

            {showPasswordResetsModal && (
                <AdminPasswordResetsModal onClose={() => setShowPasswordResetsModal(false)} />
            )}
        </div>
    );
}