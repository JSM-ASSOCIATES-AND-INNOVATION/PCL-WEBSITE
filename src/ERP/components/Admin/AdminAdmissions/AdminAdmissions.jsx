import React, { useState, useEffect, useRef } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../lib/supabase/supabaseClient";
import { createClient } from '@supabase/supabase-js';
import { sendSystemEmail } from '../../../lib/EmailService';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://saswiwkahpubgivrtjwy.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhc3dpd2thaHB1YmdpdnJ0and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMjQ1ODgsImV4cCI6MjA5MzgwMDU4OH0.tDp34Pnyy3v25D6GBW7RCQVvbwiAxKBCR_8e7cTlHpA';
const provisionClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
});

export default function AdminAdmissions({ isHubView = false }) {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [isAdmissionsOpen, setIsAdmissionsOpen] = useState(true);
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);

    // Automation Modal State
    const [showProvisionModal, setShowProvisionModal] = useState(false);
    const [provisionLogs, setProvisionLogs] = useState([]);
    const [provisionStatus, setProvisionStatus] = useState("idle"); // idle, running, success, error
    const [generatedCredentials, setGeneratedCredentials] = useState(null);
    const logsEndRef = useRef(null);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [provisionLogs]);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setIsLoading(true);
        try {
            // Fetch applications
            const { data: appData, error: appError } = await supabase
                .from("admissions_applications")
                .select("*")
                .order("submitted_at", { ascending: false });

            if (appError) {
                console.warn("Table admissions_applications might not exist or no rows:", appError);
            } else {
                setApplications(appData || []);
            }

            // Fetch admissions status
            const { data: settingsData, error: settingsError } = await supabase
                .from("system_settings")
                .select("value")
                .eq("key", "admissions_status")
                .single();
            
            if (!settingsError && settingsData?.value) {
                setIsAdmissionsOpen(settingsData.value.is_open !== false);
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleAdmissions = async () => {
        setIsTogglingStatus(true);
        try {
            const newState = !isAdmissionsOpen;
            const { error } = await supabase
                .from("system_settings")
                .upsert({ 
                    key: "admissions_status", 
                    value: { is_open: newState } 
                }, { onConflict: 'key' });
                
            if (error) throw error;
            setIsAdmissionsOpen(newState);
            window.erpDialog?.alert(`Admissions are now ${newState ? 'OPEN' : 'CLOSED'}`);
        } catch (error) {
            window.erpDialog?.alert("Failed to toggle admissions status");
        } finally {
            setIsTogglingStatus(false);
        }
    };

    const addLog = (msg) => {
        setProvisionLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const handleReject = async (id) => {
        try {
            const { error } = await supabase.from("admissions_applications").update({ status: 'rejected' }).eq("id", id);
            if (error) throw error;
            fetchApplications();
        } catch (error) {
            window.erpDialog?.alert("Failed to reject application.");
        }
    };

    const handleApprovePipeline = async (app) => {
        if (!window.confirm(`Are you sure you want to approve ${app.name} and provision their ERP account?`)) return;

        setShowProvisionModal(true);
        setProvisionStatus("running");
        setProvisionLogs([
            `[SYSTEM] Initializing Admission Automation Pipeline for ${app.name}...`,
            `[SYSTEM] Contact Email: ${app.email}`
        ]);

        try {
            // 1. ID Generation
            let shortcut = "BBL"; // BBA LLB default
            if (app.program && app.program.includes("BA LLB")) shortcut = "BAL";
            if (app.program && app.program.trim() === "LLB") shortcut = "LLB";

            const prefix = `26${shortcut}`;
            addLog(`[SYSTEM] Calculating sequential ERP ID for prefix ${prefix}...`);
            
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
                if (!isNaN(parsedNum)) nextNum = parsedNum + 1;
            }
            
            const generatedId = `${prefix}${nextNum.toString().padStart(4, '0')}`;
            addLog(`[SUCCESS] Generated ERP ID: ${generatedId}`);

            // 2. Mark as approved and save ERP ID
            addLog("[DATABASE] Updating application status to Approved and assigning ERP ID...");
            const { error: updateError } = await supabase.from("admissions_applications").update({ 
                status: 'approved', 
                erp_id: generatedId 
            }).eq("id", app.id);
            if (updateError) throw updateError;

            // 3. Generate Password & Auth
            const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
            let generatedPassword = "Jsm#";
            for (let i = 0; i < 6; i++) generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));

            addLog(`[AUTH] Registering secure credentials in Supabase Edge Network...`);
            const { data: authData, error: authError } = await provisionClient.auth.signUp({
                email: app.email,
                password: generatedPassword,
            });

            if (authError) {
                if (authError.message.includes("already registered")) {
                    addLog(`[WARNING] A user with email ${app.email} is already registered in Auth.`);
                    throw new Error("User already exists in Authentication system.");
                } else {
                    throw authError;
                }
            }
            if (!authData.user) throw new Error("Auth creation failed silently.");

            // 4. Create Profile
            addLog(`[DATABASE] Registering ${generatedId} in active student profiles...`);
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: authData.user.id,
                erp_id: generatedId,
                full_name: app.name,
                email: app.email,
                role: 'student',
                academic_batch: app.program || 'BA LLB',
                department: 'Law',
                status: 'Active'
            });

            if (profileError) throw profileError;

            // 4.5 Generate Fee Invoice
            addLog(`[FINANCE] Generating initial ₹50,000 admission fee invoice...`);
            const invoiceDate = new Date();
            invoiceDate.setDate(invoiceDate.getDate() + 14); // Due in 14 days
            const { error: invoiceError } = await supabase.from('fee_invoices').insert({
                student_id: authData.user.id,
                title: 'Semester 1 Tuition Fee',
                amount: 50000,
                due_date: invoiceDate.toISOString().split('T')[0],
                type: 'Tuition',
                status: 'pending'
            });
            if (invoiceError) {
                addLog(`[WARNING] Failed to generate invoice: ${invoiceError.message}. Please generate manually.`);
            } else {
                addLog(`[SUCCESS] Initial fee invoice generated successfully.`);
            }

            // 5. Send Welcome Email
            addLog(`[EMAIL] Dispatching secure welcome letter and credentials via EmailJS...`);
            try {
                await sendSystemEmail('ONBOARDING', app.email, {
                    erp_id: generatedId,
                    password: generatedPassword,
                    login_url: window.location.origin
                });
                addLog(`[SUCCESS] Welcome letter successfully dispatched to ${app.email}!`);
            } catch (emailErr) {
                console.error("EmailJS Error:", emailErr);
                addLog(`[WARNING] Email dispatch failed: ${emailErr.message}. The account was created successfully, but credentials must be provided manually.`);
            }

            setProvisionStatus("success");
            setGeneratedCredentials({ id: generatedId, password: generatedPassword });
            addLog(`[SYSTEM] Pipeline complete! ${app.name} is officially enrolled.`);
            fetchApplications(); // Refresh list to remove from pending
        } catch (error) {
            setProvisionStatus("error");
            addLog(`[FATAL ERROR] ${error.message}`);
            addLog(`[SYSTEM] Pipeline aborted. Please resolve the issue and try again.`);
        }
    };

    const filteredApps = filter === "all" ? applications : applications.filter(a => a.status === filter);

    return (
        <div className={`flex flex-col gap-6 animate-fade-in ${isHubView ? 'w-full' : 'max-w-7xl mx-auto p-6 lg:p-8 pb-32'}`}>
            {/* Header and Tabs */}
            {!isHubView && (
                <div className={`w-full relative overflow-hidden rounded-[2rem] shadow-2xl p-6 lg:p-8 flex flex-col gap-6 border border-themeBorder bg-gradient-to-r from-themeAccent to-themeAccent/80 mb-4`}>
                    {/* Background Decorations */}
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-overlay pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 mix-blend-overlay pointer-events-none"></div>

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                        <div className="flex items-center gap-4 lg:gap-5">
                            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1rem] bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                                <i className="fa-solid fa-user-graduate text-white text-2xl lg:text-3xl drop-shadow-md"></i>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-white drop-shadow-md`}>Admissions Command Center</h1>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest border border-white/20 ${isAdmissionsOpen ? 'bg-emerald-500/20 text-emerald-100' : 'bg-rose-500/20 text-rose-100'}`}>
                                        {isAdmissionsOpen ? 'INTAKE OPEN' : 'INTAKE CLOSED'}
                                    </span>
                                </div>
                                <p className="text-white/80 text-xs lg:text-sm font-medium tracking-wide">Review and process incoming website applications.</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 w-full lg:w-auto">
                            <button
                                onClick={handleToggleAdmissions}
                                disabled={isTogglingStatus}
                                className={`flex-1 lg:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 border border-white/20 backdrop-blur-md ${isAdmissionsOpen ? 'bg-rose-500/20 hover:bg-rose-500 text-white' : 'bg-emerald-500/20 hover:bg-emerald-500 text-white'}`}
                            >
                                <i className={`fa-solid ${isAdmissionsOpen ? 'fa-lock' : 'fa-lock-open'}`}></i>
                                {isTogglingStatus ? 'Processing...' : (isAdmissionsOpen ? 'Close Admissions' : 'Open Admissions')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`flex flex-wrap lg:flex-nowrap p-1.5 bg-themeElevated backdrop-blur-md rounded-2xl border border-themeBorderStrong relative z-10 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar ${!isHubView ? '-mt-10 lg:-mt-12 ml-6 lg:ml-8' : 'mb-2'}`}>
                {['all', 'pending', 'approved', 'rejected'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap min-w-max ${
                            filter === f 
                                ? 'bg-themeAccent text-white shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-themeAccent scale-100' 
                                : 'text-themeTextSec hover:text-themeText hover:bg-themePanel border border-transparent scale-95 hover:scale-100'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin w-8 h-8 border-4 border-themeAccent border-t-transparent rounded-full"></div>
                </div>
            ) : (
                <div className="bg-themePanel rounded-themePanel border-theme border-themeBorder shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-themeElevated border-b-theme border-themeBorder text-xs uppercase tracking-widest text-themeTextSec font-black">
                                <tr>
                                    <th className="p-4 border-r-theme border-themeBorder">Applicant</th>
                                    <th className="p-4 border-r-theme border-themeBorder">Program</th>
                                    <th className="p-4 border-r-theme border-themeBorder">Marks / Exams</th>
                                    <th className="p-4 border-r-theme border-themeBorder">Date</th>
                                    <th className="p-4 border-r-theme border-themeBorder">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-themeBorder">
                                {filteredApps.length === 0 ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-themeTextSec font-black uppercase tracking-widest">No applications found.</td></tr>
                                ) : (
                                    filteredApps.map(app => (
                                        <tr key={app.id} className="hover:bg-themeElevated transition-colors group">
                                            <td className="p-4 border-r-theme border-themeBorder">
                                                <p className="font-black text-themeText">{app.name}</p>
                                                <p className="text-xs text-themeTextSec font-medium mt-1">{app.email}</p>
                                                <p className="text-xs text-themeTextSec font-medium mt-0.5">{app.phone}</p>
                                            </td>
                                            <td className="p-4 text-sm font-black text-themeText border-r-theme border-themeBorder">{app.program}</td>
                                            <td className="p-4 border-r-theme border-themeBorder">
                                                <p className="text-xs text-themeText font-black uppercase tracking-widest mb-1">
                                                    10th: <span className="text-indigo-400">{app.marks_10th}</span> | 12th: <span className="text-emerald-400">{app.marks_inter}</span>
                                                </p>
                                                {app.exam_tglawcet && <p className="text-xs text-themeText font-black uppercase tracking-widest">TGLAWCET: <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">{app.exam_tglawcet}</span></p>}
                                                {app.exam_clat && <p className="text-xs text-themeText font-black uppercase tracking-widest mt-1">CLAT: <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{app.exam_clat}</span></p>}
                                                {app.exam_other && <p className="text-[10px] text-themeTextSec font-bold uppercase tracking-widest mt-2">Other Exam: {app.exam_other}</p>}
                                                {app.family_in_legal === 'Yes' && <p className="text-[10px] text-themeTextSec font-bold uppercase tracking-widest mt-1">Legal Family: {app.family_in_legal_who}</p>}
                                            </td>
                                            <td className="p-4 text-xs text-themeTextSec font-medium border-r-theme border-themeBorder">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 border-r-theme border-themeBorder">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-themeBorder inline-block mb-2 ${
                                                    app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                                    app.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                                                    'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                                }`}>
                                                    {app.status}
                                                </span>
                                                {app.erp_id && <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">ID: <span className="text-themeText select-all">{app.erp_id}</span></p>}
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                {app.status === 'pending' && (
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleApprovePipeline(app)} className="w-8 h-8 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-all" title="Approve">
                                                            <i className="fa-solid fa-check"></i>
                                                        </button>
                                                        <button onClick={() => handleReject(app.id)} className="w-8 h-8 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all" title="Reject">
                                                            <i className="fa-solid fa-xmark"></i>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Automation Pipeline Modal */}
            {showProvisionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-themePanel border-theme border-themeBorder rounded-themePanel w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
                        <div className="bg-themeElevated border-b-theme border-themeBorder p-5 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <i className="fa-solid fa-robot text-themeAccent text-xl"></i>
                                <span className="font-mono text-sm font-black text-themeText tracking-widest uppercase">Pipeline Execution</span>
                            </div>
                            {provisionStatus !== "running" && (
                                <button onClick={() => { setShowProvisionModal(false); setGeneratedCredentials(null); }} className="w-8 h-8 flex items-center justify-center bg-themeApp hover:bg-themeElevated rounded-full border border-themeBorderStrong text-themeTextSec hover:text-themeText transition-all">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            )}
                        </div>

                        {provisionStatus === "success" && generatedCredentials ? (
                            <div className="flex-1 p-6 lg:p-8 overflow-y-auto flex flex-col items-center justify-center text-center bg-emerald-500/5">
                                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-3xl mb-4">
                                    <i className="fa-solid fa-check"></i>
                                </div>
                                <h3 className={`font-black uppercase tracking-widest text-2xl text-themeText mb-1`}>Student Provisioned!</h3>
                                <p className={`text-sm font-medium text-themeTextSec mb-6 uppercase tracking-widest`}>Securely share these credentials with the student.</p>

                                <div className="w-full max-w-sm bg-themeApp p-6 rounded-2xl border border-themeBorderStrong flex flex-col gap-5 text-left shadow-lg">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec ml-1">Generated ERP ID</span>
                                        <div className="bg-themePanel border border-themeBorder p-3 rounded-lg text-base font-black text-themeText tracking-widest select-all text-center">
                                            {generatedCredentials.id}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec ml-1">Temporary Password</span>
                                        <div className="bg-themePanel border border-themeBorder p-3 rounded-lg text-base font-black text-themeText tracking-widest select-all text-center">
                                            {generatedCredentials.password}
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-themeTextSec leading-relaxed text-center mt-2">These credentials have been emailed to the applicant. They will be prompted to change their password upon first login.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 bg-[#0a0a0a] p-5 font-mono text-xs md:text-sm overflow-y-auto flex flex-col gap-1.5 shadow-inner">
                                {provisionLogs.map((log, i) => (
                                    <div key={i} className={`font-bold
                                        ${log.includes('[FATAL ERROR]') || log.includes('[WARNING]') ? 'text-rose-500' : ''}
                                        ${log.includes('[SUCCESS]') ? 'text-emerald-400' : ''}
                                        ${log.includes('[AUTH]') ? 'text-amber-400' : ''}
                                        ${log.includes('[DATABASE]') || log.includes('[EMAIL]') ? 'text-indigo-400' : ''}
                                        ${log.includes('[SYSTEM]') ? 'text-blue-400' : ''}
                                        ${log.includes('[FINANCE]') ? 'text-emerald-400' : ''}
                                        ${!log.match(/\[(FATAL ERROR|WARNING|SUCCESS|AUTH|DATABASE|EMAIL|SYSTEM|FINANCE)\]/) ? 'text-white/80' : ''}
                                    `}>
                                        {log}
                                    </div>
                                ))}
                                {provisionStatus === "running" && (
                                    <div className="text-white/50 animate-pulse font-black mt-2">_</div>
                                )}
                                <div ref={logsEndRef} />
                            </div>
                        )}

                        <div className="bg-themeElevated border-t-theme border-themeBorder p-4 shrink-0 flex justify-end">
                            {provisionStatus === "running" ? (
                                <div className="text-amber-400 font-mono text-sm font-black tracking-widest animate-pulse px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded">PIPELINE ACTIVE...</div>
                            ) : (
                                <button
                                    onClick={() => { setShowProvisionModal(false); setGeneratedCredentials(null); }}
                                    className="bg-themeApp hover:bg-neutral-800 text-themeText border border-themeBorderStrong px-6 py-2.5 font-black uppercase tracking-widest rounded-lg transition-colors"
                                >
                                    {provisionStatus === "success" ? "Done & Close" : "Close Pipeline"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
