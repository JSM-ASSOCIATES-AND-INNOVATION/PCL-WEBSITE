import React, { useState, useEffect, useRef } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../LIB/supabase/supabaseClient";
import { createClient } from '@supabase/supabase-js';
import { sendSystemEmail } from '../../../LIB/EmailService';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://saswiwkahpubgivrtjwy.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhc3dpd2thaHB1YmdpdnJ0and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMjQ1ODgsImV4cCI6MjA5MzgwMDU4OH0.tDp34Pnyy3v25D6GBW7RCQVvbwiAxKBCR_8e7cTlHpA';
const provisionClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
});

export default function AdminAdmissions() {
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
                .order("created_at", { ascending: false });

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
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAdmissionsStatus = async () => {
        setIsTogglingStatus(true);
        const newStatus = !isAdmissionsOpen;
        try {
            const { error } = await supabase
                .from("system_settings")
                .upsert({
                    key: 'admissions_status',
                    value: { is_open: newStatus }
                });
            if (error) throw error;
            setIsAdmissionsOpen(newStatus);
        } catch (error) {
            console.error("Error toggling admissions status:", error);
            alert("Failed to change admissions status.");
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
            alert("Failed to reject application.");
        }
    };

    const handleApprovePipeline = async (app) => {
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
                // If user already exists, it might throw an error. We should handle it or fail gracefully.
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
        <div className="flex flex-col gap-6 animate-fade-in p-6 lg:p-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className={`font-black text-3xl lg:text-4xl text-black tracking-tighter mb-2 uppercase`}>
                        Admissions <span className="text-[#b388ff]">Command Center</span>
                    </h1>
                    <p className={`text-sm text-black/70 font-bold uppercase tracking-widest flex items-center gap-3`}>
                        Review and process incoming website applications.
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border-2 border-black shadow-[2px_2px_0_0_#050505] ${isAdmissionsOpen ? 'bg-[#00e676] text-black' : 'bg-[#ff4d4d] text-white'}`}>
                            {isAdmissionsOpen ? 'INTAKE OPEN' : 'INTAKE CLOSED'}
                        </span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={toggleAdmissionsStatus} 
                        disabled={isTogglingStatus}
                        className={`p-3 font-black text-xs uppercase tracking-widest border-2 border-black shadow-[4px_4px_0_0_#050505] active:translate-y-px active:translate-x-px active:shadow-none rounded transition-all ${isAdmissionsOpen ? 'bg-[#ff4d4d] text-white hover:bg-red-600' : 'bg-[#00e676] text-black hover:bg-green-500'}`}
                    >
                        {isTogglingStatus ? 'Processing...' : isAdmissionsOpen ? 'Close Applications' : 'Open Applications'}
                    </button>
                    <button onClick={fetchApplications} className="p-3 bg-white border-2 border-black shadow-[4px_4px_0_0_#050505] active:translate-y-px active:translate-x-px active:shadow-none rounded text-black hover:bg-gray-100 transition-all">
                        <i className="fa-solid fa-rotate-right"></i>
                    </button>
                </div>
            </div>

            <div className="flex gap-4 mb-4">
                {['all', 'pending', 'approved', 'rejected'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded uppercase tracking-widest text-xs font-black border-2 border-black transition-all shadow-[2px_2px_0_0_#050505] active:translate-y-px active:translate-x-px active:shadow-none ${filter === f ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
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
                <div className="bg-white rounded border-2 border-black shadow-[8px_8px_0_0_#050505] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black border-b-2 border-black text-xs uppercase tracking-widest text-white font-black">
                                <tr>
                                    <th className="p-4 border-r-2 border-white/20">Applicant</th>
                                    <th className="p-4 border-r-2 border-white/20">Program</th>
                                    <th className="p-4 border-r-2 border-white/20">Marks / Exams</th>
                                    <th className="p-4 border-r-2 border-white/20">Date</th>
                                    <th className="p-4 border-r-2 border-white/20">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-black">
                                {filteredApps.length === 0 ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-black font-black uppercase tracking-widest">No applications found.</td></tr>
                                ) : (
                                    filteredApps.map(app => (
                                        <tr key={app.id} className="hover:bg-gray-100 transition-colors">
                                            <td className="p-4 border-r-2 border-black">
                                                <p className="font-black text-black uppercase">{app.name}</p>
                                                <p className="text-xs text-black/70 font-bold uppercase tracking-widest mt-1">{app.email}</p>
                                                <p className="text-xs text-black/70 font-bold uppercase tracking-widest mt-0.5">{app.phone}</p>
                                            </td>
                                            <td className="p-4 text-sm font-black text-black border-r-2 border-black uppercase tracking-widest">{app.program}</td>
                                            <td className="p-4 border-r-2 border-black">
                                                <p className="text-xs text-black font-black uppercase tracking-widest mb-1">10th: <span className="text-[#b388ff]">{app.marks_10th}</span> | 12th: <span className="text-[#00e676]">{app.marks_inter}</span></p>
                                                {app.exam_tglawcet && <p className="text-xs text-black font-black uppercase tracking-widest">TGLAWCET: <span className="bg-black text-[#ffea00] px-1 rounded">{app.exam_tglawcet}</span></p>}
                                                {app.exam_clat && <p className="text-xs text-black font-black uppercase tracking-widest">CLAT: <span className="bg-black text-[#00e676] px-1 rounded">{app.exam_clat}</span></p>}
                                                {app.exam_other && <p className="text-[10px] text-black font-bold uppercase tracking-widest mt-1 opacity-70">Other Exam: {app.exam_other}</p>}
                                                {app.family_in_legal === 'Yes' && <p className="text-[10px] text-black font-bold uppercase tracking-widest mt-1 opacity-70">Legal Family: {app.family_in_legal_who}</p>}
                                            </td>
                                            <td className="p-4 text-xs text-black font-bold border-r-2 border-black">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 border-r-2 border-black">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0_0_#050505] inline-block mb-1 ${
                                                    app.status === 'approved' ? 'bg-[#00e676] text-black' :
                                                    app.status === 'rejected' ? 'bg-[#ff4d4d] text-black' :
                                                    'bg-[#ffea00] text-black'
                                                }`}>
                                                    {app.status}
                                                </span>
                                                {app.erp_id && <p className="text-[10px] font-black uppercase tracking-widest text-black/70">ID: <span className="text-black select-all">{app.erp_id}</span></p>}
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                {app.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleApprovePipeline(app)} className="p-2.5 bg-[#00e676] border-2 border-black shadow-[2px_2px_0_0_#050505] active:translate-y-px active:translate-x-px active:shadow-none text-black hover:bg-[#00c853] rounded transition-all" title="Approve">
                                                            <i className="fa-solid fa-check"></i>
                                                        </button>
                                                        <button onClick={() => handleReject(app.id)} className="p-2.5 bg-[#ff4d4d] border-2 border-black shadow-[2px_2px_0_0_#050505] active:translate-y-px active:translate-x-px active:shadow-none text-black hover:bg-[#ff3333] rounded transition-all" title="Reject">
                                                            <i className="fa-solid fa-xmark"></i>
                                                        </button>
                                                    </>
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white border-4 border-black rounded-lg w-full max-w-2xl overflow-hidden shadow-[12px_12px_0_0_#050505] flex flex-col h-[500px]">
                        <div className="bg-[#b388ff] border-b-4 border-black p-4 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <i className="fa-solid fa-robot text-black text-xl"></i>
                                <span className="font-mono text-sm font-black text-black tracking-widest uppercase">Pipeline Execution</span>
                            </div>
                            {provisionStatus !== "running" && (
                                <button onClick={() => { setShowProvisionModal(false); setGeneratedCredentials(null); }} className="w-8 h-8 flex items-center justify-center bg-white border-2 border-black rounded shadow-[2px_2px_0_0_#050505] active:shadow-none active:translate-y-px active:translate-x-px text-black transition-all">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            )}
                        </div>

                        {provisionStatus === "success" && generatedCredentials ? (
                            <div className="flex-1 bg-[#ffea00] p-6 lg:p-8 overflow-y-auto flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-[#00e676] text-black border-4 border-black shadow-[4px_4px_0_0_#050505] rounded flex items-center justify-center text-3xl mb-4">
                                    <i className="fa-solid fa-check"></i>
                                </div>
                                <h3 className={`font-black uppercase tracking-widest text-2xl text-black mb-1`}>Student Provisioned!</h3>
                                <p className={`text-sm font-bold text-black/70 mb-6 uppercase tracking-widest`}>Securely share these credentials with the student.</p>

                                <div className="w-full max-w-sm bg-white p-6 border-4 border-black flex flex-col gap-5 relative overflow-hidden text-left shadow-[8px_8px_0_0_#050505]">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-black/70">Generated ERP ID</span>
                                        <div className="bg-neutral-100 border-2 border-black p-3 text-lg font-black text-black tracking-widest select-all">
                                            {generatedCredentials.id}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-black/70">Temporary Password</span>
                                        <div className="bg-neutral-100 border-2 border-black p-3 text-lg font-black text-black tracking-widest select-all">
                                            {generatedCredentials.password}
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-black/60 leading-tight">These credentials have been emailed to the applicant. They will be prompted to change their password upon first login.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 bg-black p-4 font-mono text-xs md:text-sm overflow-y-auto flex flex-col gap-1 shadow-inner">
                                {provisionLogs.map((log, i) => (
                                    <div key={i} className={`font-bold
                                        ${log.includes('[FATAL ERROR]') || log.includes('[WARNING]') ? 'text-[#ff4d4d]' : ''}
                                        ${log.includes('[SUCCESS]') ? 'text-[#00e676]' : ''}
                                        ${log.includes('[AUTH]') ? 'text-[#ffea00]' : ''}
                                        ${log.includes('[DATABASE]') || log.includes('[EMAIL]') ? 'text-[#b388ff]' : ''}
                                        ${!log.match(/\[(FATAL ERROR|WARNING|SUCCESS|AUTH|DATABASE|EMAIL)\]/) ? 'text-white' : ''}
                                    `}>
                                        {log}
                                    </div>
                                ))}
                                {provisionStatus === "running" && (
                                    <div className="text-white animate-pulse font-black mt-2">_</div>
                                )}
                                <div ref={logsEndRef} />
                            </div>
                        )}

                        <div className="bg-white border-t-4 border-black p-4 shrink-0 flex justify-end">
                            {provisionStatus === "running" ? (
                                <div className="text-black font-mono text-sm font-black tracking-widest animate-pulse px-4 py-2 border-2 border-black shadow-[4px_4px_0_0_#050505] bg-[#ffea00] inline-block">PIPELINE ACTIVE...</div>
                            ) : (
                                <button
                                    onClick={() => { setShowProvisionModal(false); setGeneratedCredentials(null); }}
                                    className="bg-black text-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 active:translate-x-1 px-6 py-2 font-black uppercase tracking-widest rounded transition-all"
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
