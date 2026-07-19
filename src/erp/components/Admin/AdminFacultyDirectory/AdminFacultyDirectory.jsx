/* eslint-disable */
import React, { useState, useEffect } from "react";
import { supabase } from "../../../LIB/supabase/supabaseClient";
import { useERP } from "../../../context/ErpContext";
import { sendSystemEmail } from '../../../LIB/EmailService';
import { createClient } from '@supabase/supabase-js';

// Safe provisioning client so admin doesn't get logged out
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://saswiwkahpubgivrtjwy.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhc3dpd2thaHB1YmdpdnJ0and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMjQ1ODgsImV4cCI6MjA5MzgwMDU4OH0.tDp34Pnyy3v25D6GBW7RCQVvbwiAxKBCR_8e7cTlHpA';
const provisionClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
});

export default function AdminFacultyDirectory() {
    const { userSession } = useERP();
    const [faculties, setFaculties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [provisionSuccess, setProvisionSuccess] = useState(false);
    const [provisionLogs, setProvisionLogs] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        designation: '',
        specialisation: '',
        degrees: '',
        office: '',
        phone: '',
        linkedin: '',
        scholar: '',
        image_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // default avatar
        is_public: true
    });

    useEffect(() => {
        fetchDirectory();
    }, []);

    const fetchDirectory = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    id, 
                    full_name, 
                    email, 
                    department, 
                    erp_id,
                    faculty_profiles (
                        designation,
                        specialisation,
                        is_public
                    )
                `)
                .eq('role', 'faculty');

            if (error) throw error;
            setFaculties(data || []);
        } catch (error) {
            console.error("Failed to fetch faculty directory:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleProvisionSubmit = async (e) => {
        e.preventDefault();
        setIsProvisioning(true);
        setProvisionLogs([]);
        setProvisionSuccess(false);

        const email = formData.email.trim();
        const prefix = "FAC-";

        try {
            // 1. Generate sequential ERP ID
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
            setProvisionLogs(prev => [...prev, `[${generatedId}] Initializing provisioning...`]);

            // 2. Generate secure password
            const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
            let generatedPassword = "Jsm#";
            for (let i = 0; i < 6; i++) {
                generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
            }

            // 3. Create Auth Account
            setProvisionLogs(prev => [...prev, `[${generatedId}] Creating authentication identity...`]);
            const { data: authData, error: authError } = await provisionClient.auth.signUp({
                email: email,
                password: generatedPassword,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("User creation failed.");
            const userId = authData.user.id;

            // 4. Create base Profile
            setProvisionLogs(prev => [...prev, `[${generatedId}] Creating internal ERP profile...`]);
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: userId,
                erp_id: generatedId,
                full_name: formData.name,
                email: email,
                role: 'faculty',
                department: formData.department,
                status: 'Active'
            });
            if (profileError) throw profileError;

            // 5. Create Public Faculty Profile
            setProvisionLogs(prev => [...prev, `[${generatedId}] Registering public website schema...`]);
            const { error: facultyProfileError } = await supabase.from('faculty_profiles').upsert({
                id: userId,
                designation: formData.designation,
                specialisation: formData.specialisation,
                degrees: formData.degrees,
                office_address: formData.office,
                phone: formData.phone,
                linkedin_url: formData.linkedin,
                scholar_url: formData.scholar,
                image_url: formData.image_url,
                education: [],
                research: [],
                projects: [],
                patents: [],
                awards: [],
                is_public: formData.is_public
            });

            if (facultyProfileError) {
                console.error("Faculty profile error", facultyProfileError);
                setProvisionLogs(prev => [...prev, `WARNING: Public website profile creation encountered an issue.`]);
            }

            // 6. Send Email
            setProvisionLogs(prev => [...prev, `[${generatedId}] Dispatching encrypted credentials...`]);
            try {
                await sendSystemEmail('ONBOARDING', email, {
                    erp_id: generatedId,
                    password: generatedPassword,
                    login_url: window.location.origin
                });
                setProvisionLogs(prev => [...prev, `[${generatedId}] SUCCESS: Automated workflow completed.`]);
            } catch (emailErr) {
                console.error("EmailJS Error:", emailErr);
                setProvisionLogs(prev => [...prev, `[${generatedId}] WARNING: Email dispatch failed.`]);
            }

            setProvisionSuccess(true);
            fetchDirectory(); // refresh list
        } catch (err) {
            console.error(err);
            setProvisionLogs(prev => [...prev, `ERROR: ${err.message}`]);
        } finally {
            setIsProvisioning(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 bg-[#f4f4f0] min-h-screen relative p-4 lg:p-8 selection:bg-[#ffeb3b]">
            
            {/* 1. HEADER BANNER */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-[#40c4ff] border-2 border-black shadow-[8px_8px_0_0_#050505] p-6 lg:p-8 relative">
                <div className="relative z-10 w-full lg:w-auto flex-1">
                    <h1 className="font-black text-3xl lg:text-4xl text-black tracking-tighter uppercase mb-2">
                        Public <span className="text-white drop-shadow-[2px_2px_0_#000]">Faculty Directory</span>
                    </h1>
                    <p className="text-sm text-black font-bold uppercase tracking-widest">
                        Manage faculty profiles & provision accounts for the public website.
                    </p>
                </div>
                
                <button
                    onClick={() => {
                        setFormData({
                            name: '', email: '', department: '', designation: '', specialisation: '', degrees: '', office: '', phone: '', linkedin: '', scholar: '', image_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', is_public: true
                        });
                        setProvisionSuccess(false);
                        setShowModal(true);
                    }}
                    className="relative z-10 w-full md:w-auto shrink-0 bg-[#ffea00] hover:bg-[#69f0ae] text-black border-2 border-black px-6 py-4 rounded-none text-xs font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none shadow-[4px_4px_0_0_#050505]"
                >
                    <i className="fa-solid fa-user-plus text-base"></i> Add New Faculty
                </button>
            </div>

            {/* 2. DIRECTORY GRID */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12 opacity-50">
                    <i className="fa-solid fa-circle-notch fa-spin text-4xl mb-4"></i>
                    <p className="font-black uppercase tracking-widest">Loading Directory...</p>
                </div>
            ) : faculties.length === 0 ? (
                <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_#050505] p-12 text-center">
                    <i className="fa-solid fa-chalkboard-user text-5xl text-gray-300 mb-4"></i>
                    <h3 className="font-black uppercase text-xl mb-2">No Faculty Found</h3>
                    <p className="text-gray-500 font-bold text-sm">Add a faculty member to populate the public website.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {faculties.map((fac) => (
                        <div key={fac.id} className="bg-white border-2 border-black shadow-[8px_8px_0_0_#050505] flex flex-col group hover:-translate-y-1 hover:shadow-[12px_12px_0_0_#050505] transition-all">
                            <div className="p-5 border-b-2 border-black bg-neutral-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-[#b388ff] border-2 border-black shadow-[2px_2px_0_0_#050505] flex items-center justify-center font-black text-lg">
                                        {fac.full_name?.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black uppercase tracking-wide truncate">{fac.full_name}</p>
                                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest truncate">{fac.erp_id}</p>
                                    </div>
                                </div>
                                <div className={`w-3 h-3 border-2 border-black rounded-full ${fac.faculty_profiles?.is_public ? 'bg-[#00e676]' : 'bg-[#ff4d4d]'}`} title={fac.faculty_profiles?.is_public ? 'Public' : 'Hidden'}></div>
                            </div>
                            <div className="p-5 flex flex-col gap-2 flex-1">
                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">Department</p>
                                <p className="text-sm font-bold bg-neutral-100 border-2 border-black p-2 shadow-[2px_2px_0_0_#050505] truncate">{fac.department || 'N/A'}</p>
                                
                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-500 mt-2">Designation</p>
                                <p className="text-sm font-bold bg-[#ffeb3b]/30 border-2 border-black p-2 shadow-[2px_2px_0_0_#050505] truncate">{fac.faculty_profiles?.designation || 'N/A'}</p>
                                
                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-500 mt-2">Specialisation</p>
                                <p className="text-sm font-bold border-2 border-black p-2 shadow-[2px_2px_0_0_#050505] truncate">{fac.faculty_profiles?.specialisation || 'N/A'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 3. PROVISIONING MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-3xl border-4 border-black flex flex-col max-h-[90vh] shadow-[12px_12px_0_0_#050505]">
                        <div className="bg-[#b388ff] p-5 lg:p-6 text-black relative shrink-0 border-b-4 border-black flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight">Add New Faculty</h3>
                                <p className="text-xs font-bold uppercase tracking-widest opacity-80">Provisions account & updates website.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0_0_#050505] hover:bg-[#ff4d4d] hover:text-white transition-colors">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        <div className="overflow-y-auto p-5 lg:p-6 flex-1 bg-neutral-100 no-scrollbar">
                            {provisionSuccess ? (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 bg-[#69f0ae] border-4 border-black shadow-[4px_4px_0_0_#050505] mx-auto flex items-center justify-center text-4xl mb-4">
                                        <i className="fa-solid fa-check"></i>
                                    </div>
                                    <h2 className="text-2xl font-black uppercase tracking-widest mb-2">Faculty Added!</h2>
                                    <p className="font-bold text-gray-600 uppercase text-xs mb-6">Website synchronized successfully.</p>
                                    <div className="bg-black text-[#69f0ae] p-4 text-left font-mono text-xs border-4 border-black max-h-40 overflow-y-auto mx-auto max-w-lg mb-8 shadow-[4px_4px_0_0_#050505]">
                                        {provisionLogs.map((log, i) => <div key={i}>&gt; {log}</div>)}
                                    </div>
                                    <button onClick={() => setShowModal(false)} className="bg-white border-2 border-black shadow-[4px_4px_0_0_#050505] px-8 py-3 font-black uppercase text-sm hover:bg-gray-100 transition-colors">
                                        Close Window
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleProvisionSubmit} className="flex flex-col gap-5">
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-white border-2 border-black p-3 font-bold shadow-[2px_2px_0_0_#050505] focus:bg-[#ffeb3b] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full bg-white border-2 border-black p-3 font-bold shadow-[2px_2px_0_0_#050505] focus:bg-[#ffeb3b] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Department</label>
                                            <select name="department" value={formData.department} onChange={handleInputChange} required className="w-full bg-white border-2 border-black p-3 font-bold shadow-[2px_2px_0_0_#050505] focus:bg-[#ffeb3b] outline-none appearance-none">
                                                <option value="">Select Department...</option>
                                                <option value="Department of Legal Studies">Department of Legal Studies</option>
                                                <option value="Department of Management">Department of Management</option>
                                                <option value="Department of Public Policy">Department of Public Policy</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Designation</label>
                                            <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} required placeholder="e.g. Professor of Law" className="w-full bg-white border-2 border-black p-3 font-bold shadow-[2px_2px_0_0_#050505] focus:bg-[#ffeb3b] outline-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Specialisation Area</label>
                                        <input type="text" name="specialisation" value={formData.specialisation} onChange={handleInputChange} placeholder="e.g. Constitutional Law, Human Rights" className="w-full bg-white border-2 border-black p-3 font-bold shadow-[2px_2px_0_0_#050505] focus:bg-[#ffeb3b] outline-none" />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Degrees (Comma Separated)</label>
                                        <input type="text" name="degrees" value={formData.degrees} onChange={handleInputChange} placeholder="e.g. B.A., LL.B., LL.M." className="w-full bg-white border-2 border-black p-3 font-bold shadow-[2px_2px_0_0_#050505] focus:bg-[#ffeb3b] outline-none" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Office Location</label>
                                            <input type="text" name="office" value={formData.office} onChange={handleInputChange} placeholder="e.g. Block A, Room 101" className="w-full bg-white border-2 border-black p-3 font-bold shadow-[2px_2px_0_0_#050505] focus:bg-[#ffeb3b] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Contact Phone</label>
                                            <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="e.g. +91 98765 43210" className="w-full bg-white border-2 border-black p-3 font-bold shadow-[2px_2px_0_0_#050505] focus:bg-[#ffeb3b] outline-none" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">LinkedIn URL</label>
                                            <input type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange} placeholder="https://linkedin.com/in/..." className="w-full bg-white border-2 border-black p-3 font-bold shadow-[2px_2px_0_0_#050505] focus:bg-[#ffeb3b] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Google Scholar URL</label>
                                            <input type="url" name="scholar" value={formData.scholar} onChange={handleInputChange} placeholder="https://scholar.google.com/..." className="w-full bg-white border-2 border-black p-3 font-bold shadow-[2px_2px_0_0_#050505] focus:bg-[#ffeb3b] outline-none" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-[#ffea00]/30 border-2 border-black shadow-[2px_2px_0_0_#050505]">
                                        <input type="checkbox" name="is_public" checked={formData.is_public} onChange={handleInputChange} className="w-5 h-5 border-2 border-black cursor-pointer" />
                                        <label className="text-[10px] font-black uppercase tracking-widest cursor-pointer">Visible on Public Website</label>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isProvisioning}
                                        className="mt-4 w-full bg-[#00e676] hover:bg-[#b388ff] text-black border-4 border-black p-4 font-black uppercase tracking-widest text-sm shadow-[8px_8px_0_0_#050505] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all disabled:opacity-50"
                                    >
                                        {isProvisioning ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Provision Account & Publish"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
