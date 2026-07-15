/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { theme } from '../../../theme';
import { useERP } from '../../../CONTEXT/ErpContext';
import { supabase } from '../../../LIB/SUPABASE/supabaseClient';

export default function AdminFees() {
    const { userSession } = useERP();
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'invoice', 'ledger'
    const [loading, setLoading] = useState(false);

    // --- OVERVIEW STATE ---
    const [overviewData, setOverviewData] = useState({ totalExpected: 0, totalCollected: 0, pendingCount: 0 });
    const [fetchingOverview, setFetchingOverview] = useState(true);

    // --- INVOICE GEN STATE ---
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [type, setType] = useState('Tuition');
    const [fetchingBatches, setFetchingBatches] = useState(true);

    // --- STUDENT LEDGER STATE ---
    const [searchQuery, setSearchQuery] = useState('');
    const [studentResults, setStudentResults] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentLedger, setStudentLedger] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (activeTab === 'overview') fetchOverview();
        if (activeTab === 'invoice') fetchBatches();
    }, [activeTab]);

    // ================== TAB 1: OVERVIEW ==================
    const fetchOverview = async () => {
        setFetchingOverview(true);
        try {
            const { data: invoices, error } = await supabase.from('fee_invoices').select('amount, status');
            if (error) throw error;
            
            let expected = 0;
            let collected = 0;
            let count = 0;

            if (invoices) {
                invoices.forEach(inv => {
                    expected += Number(inv.amount);
                    if (inv.status === 'paid') collected += Number(inv.amount);
                    if (inv.status === 'pending') count += 1;
                });
            }
            setOverviewData({ totalExpected: expected, totalCollected: collected, pendingCount: count });
        } catch (e) {
            console.error(e);
        } finally {
            setFetchingOverview(false);
        }
    };

    // ================== TAB 2: INVOICE GEN ==================
    const fetchBatches = async () => {
        if (batches.length > 0) return;
        try {
            const { data, error } = await supabase.from('profiles').select('academic_batch').eq('role', 'student');
            if (error) throw error;
            const distinctBatches = [...new Set(data.map(item => item.academic_batch).filter(Boolean))].sort();
            setBatches(distinctBatches);
        } catch (err) {
            console.error(err);
        } finally {
            setFetchingBatches(false);
        }
    };

    const handleGenerateInvoices = async (e) => {
        e.preventDefault();
        if (!selectedBatch || !title || !amount || !dueDate || !type) return window.erpDialog.alert('Please fill all fields.');
        setLoading(true);
        try {
            const { data: students, error: studentError } = await supabase.from('profiles').select('id').eq('role', 'student').eq('academic_batch', selectedBatch);
            if (studentError) throw studentError;
            if (!students || students.length === 0) return window.erpDialog.alert(`No students found for batch ${selectedBatch}.`);
            
            const invoices = students.map(student => ({
                student_id: student.id,
                title,
                amount: Number(amount),
                due_date: dueDate,
                type: type,
                status: 'pending'
            }));
            
            const { error: insertError } = await supabase.from('fee_invoices').insert(invoices);
            if (insertError) throw insertError;
            
            window.erpDialog.alert(`Successfully generated fees for ${students.length} students.`);
            setTitle(''); setAmount(''); setDueDate('');
        } catch (error) {
            console.error(error);
            window.erpDialog.alert('Failed to generate fee invoices.');
        } finally {
            setLoading(false);
        }
    };

    // ================== TAB 3: STUDENT LEDGERS ==================
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery) return;
        setIsSearching(true);
        setSelectedStudent(null);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, erp_id, academic_batch')
                .eq('role', 'student')
                .or(`full_name.ilike.%${searchQuery}%,erp_id.ilike.%${searchQuery}%`)
                .limit(10);
            if (error) throw error;
            setStudentResults(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const loadStudentLedger = async (student) => {
        setSelectedStudent(student);
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('fee_invoices')
                .select('*')
                .eq('student_id', student.id)
                .order('due_date', { ascending: false });
            if (error) throw error;
            setStudentLedger(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPayment = async (invoiceId, invoiceAmount, invoiceTitle) => {
        const confirm = window.confirm(`Are you sure you want to mark "${invoiceTitle}" as Paid manually?`);
        if (!confirm) return;
        setLoading(true);
        try {
            // Mark Paid
            const { error: invError } = await supabase.from('fee_invoices').update({ status: 'paid' }).eq('id', invoiceId);
            if (invError) throw invError;
            
            // Insert Txn
            const transactionId = `MAN${Math.floor(Math.random() * 100000000)}`;
            const { error: txnError } = await supabase.from('fee_transactions').insert({
                id: transactionId,
                student_id: selectedStudent.id,
                amount: invoiceAmount,
                status: 'successful',
                method: 'Manual Cash/Cheque',
                purpose: invoiceTitle
            });
            if (txnError) throw txnError;

            window.erpDialog.alert("Payment Recorded Successfully.");
            loadStudentLedger(selectedStudent); // Refresh
        } catch (e) {
            console.error(e);
            window.erpDialog.alert("Failed to record payment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in relative z-10 selection:bg-themeElevated">
            
            {/* Header */}
            <div className="bg-themeElevated rounded-themePanel p-6 lg:p-8 relative overflow-hidden border-theme border-themeBorder text-themeText">
                <div className="absolute top-0 right-0 w-64 h-64 lg:w-96 lg:h-96 bg-themeElevated rounded-full lg:-translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 lg:w-64 lg:h-64 bg-emerald-500/10 rounded-full lg:translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex items-center gap-4 lg:gap-5">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-coins text-emerald-500 text-2xl lg:text-3xl"></i>
                        </div>
                        <div>
                            <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-themeText mb-1`}>Finance Ledger</h1>
                            <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium`}>Master finance control center.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-themeElevated p-1.5 rounded-xl border-theme border-themeBorder w-fit relative z-10 overflow-x-auto max-w-full gap-1">
                {['overview', 'invoice', 'ledger'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`whitespace-nowrap px-6 py-2.5 rounded-lg text-xs lg:text-sm font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-emerald-500 text-[#0a0a0a] shadow-lg shadow-emerald-500/20' : 'text-themeTextSec hover:text-themeText'}`}
                    >
                        {tab === 'overview' ? 'Overview' : tab === 'invoice' ? 'Generate Invoices' : 'Student Ledgers'}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {fetchingOverview ? (
                            <div className="col-span-full py-12 text-center text-themeTextSec"><i className="fa-solid fa-circle-notch fa-spin text-3xl text-emerald-500"></i></div>
                        ) : (
                            <>
                                <div className={`${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-8 relative overflow-hidden`}>
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                    <p className="text-[10px] font-black text-themeTextSec uppercase tracking-widest mb-2">Total Expected Revenue</p>
                                    <h2 className="text-3xl font-black text-white font-mono">₹{overviewData.totalExpected.toLocaleString()}</h2>
                                </div>
                                <div className={`${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-8 relative overflow-hidden`}>
                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                    <p className="text-[10px] font-black text-themeTextSec uppercase tracking-widest mb-2">Total Collected</p>
                                    <h2 className="text-3xl font-black text-emerald-400 font-mono">₹{overviewData.totalCollected.toLocaleString()}</h2>
                                </div>
                                <div className={`${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-8 relative overflow-hidden`}>
                                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                                    <p className="text-[10px] font-black text-themeTextSec uppercase tracking-widest mb-2">Pending Invoices</p>
                                    <h2 className="text-3xl font-black text-rose-400 font-mono">{overviewData.pendingCount}</h2>
                                    <p className="text-xs font-bold text-themeTextSec mt-2">Deficit: <span className="text-white">₹{(overviewData.totalExpected - overviewData.totalCollected).toLocaleString()}</span></p>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* TAB 2: INVOICE GENERATOR */}
                {activeTab === 'invoice' && (
                    <div className={`${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-6 lg:p-8 max-w-2xl`}>
                        <h2 className="text-lg font-black text-themeText mb-6">Bulk Invoice Generation</h2>
                        <form onSubmit={handleGenerateInvoices} className="flex flex-col gap-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 pl-1">Target Batch</label>
                                    <div className="relative">
                                        <select 
                                            value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} required
                                            className="w-full bg-themeElevated border-theme border-themeBorder hover:border-themeBorderStrong text-themeText rounded-xl px-4 py-3.5 text-sm font-bold transition-colors appearance-none outline-none focus:border-emerald-500"
                                        >
                                            <option value="" disabled>Select Batch...</option>
                                            {batches.map(b => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                        <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec text-xs pointer-events-none"></i>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 pl-1">Fee Type</label>
                                    <div className="relative">
                                        <select 
                                            value={type} onChange={e => setType(e.target.value)} required
                                            className="w-full bg-themeElevated border-theme border-themeBorder hover:border-themeBorderStrong text-themeText rounded-xl px-4 py-3.5 text-sm font-bold transition-colors appearance-none outline-none focus:border-emerald-500"
                                        >
                                            {['Tuition', 'Hostel', 'Library', 'Examination', 'Fine', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec text-xs pointer-events-none"></i>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 pl-1">Invoice Title</label>
                                <input 
                                    type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Fall Semester Tuition 2026"
                                    className="w-full bg-themeElevated border-theme border-themeBorder hover:border-themeBorderStrong focus:border-emerald-500 text-themeText rounded-xl px-4 py-3.5 text-sm font-medium transition-colors outline-none placeholder:text-themeTextSec"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 pl-1">Amount (₹)</label>
                                    <input 
                                        type="number" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0.00" min="1"
                                        className="w-full bg-themeElevated border-theme border-themeBorder hover:border-themeBorderStrong focus:border-emerald-500 text-themeText rounded-xl px-4 py-3.5 text-sm font-mono transition-colors outline-none placeholder:text-themeTextSec"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 pl-1">Due Date</label>
                                    <input 
                                        type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required
                                        className="w-full bg-themeElevated border-theme border-themeBorder hover:border-themeBorderStrong focus:border-emerald-500 text-themeText rounded-xl px-4 py-3.5 text-sm font-bold transition-colors outline-none"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" disabled={loading}
                                className="mt-4 w-full bg-emerald-500 hover:bg-emerald-400 text-[#0a0a0a] py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {loading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Generating...</> : <><i className="fa-solid fa-paper-plane"></i> Generate Bulk Invoices</>}
                            </button>
                        </form>
                    </div>
                )}

                {/* TAB 3: STUDENT LEDGER SEARCH */}
                {activeTab === 'ledger' && (
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Search Panel */}
                        <div className={`${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-6 w-full lg:w-1/3 h-fit`}>
                            <h2 className="text-sm font-black text-themeText mb-4 uppercase tracking-widest">Lookup Student</h2>
                            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                                <input 
                                    type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Name or ERP ID"
                                    className="flex-1 bg-themeElevated border-theme border-themeBorder text-themeText rounded-lg px-4 py-2 text-sm outline-none focus:border-emerald-500"
                                />
                                <button type="submit" disabled={isSearching} className="bg-emerald-500 text-[#0a0a0a] px-4 py-2 rounded-lg font-black"><i className={`fa-solid ${isSearching ? 'fa-spinner fa-spin' : 'fa-search'}`}></i></button>
                            </form>
                            
                            <div className="flex flex-col gap-2">
                                {studentResults.map(s => (
                                    <button key={s.id} onClick={() => loadStudentLedger(s)} className={`text-left p-3 rounded-lg border-theme transition-colors flex flex-col ${selectedStudent?.id === s.id ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-themeElevated border-themeBorder hover:border-themeBorderStrong text-themeText'}`}>
                                        <span className="font-black text-sm">{s.full_name}</span>
                                        <span className="text-[10px] font-bold opacity-70 uppercase font-mono">{s.erp_id} &bull; {s.academic_batch}</span>
                                    </button>
                                ))}
                                {studentResults.length === 0 && !isSearching && searchQuery && <p className="text-xs text-themeTextSec text-center">No students found.</p>}
                            </div>
                        </div>

                        {/* Ledger View Panel */}
                        {selectedStudent ? (
                            <div className={`${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-6 flex-1 relative min-h-[400px]`}>
                                <div className="border-b-theme border-themeBorder pb-4 mb-6 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-black text-white">{selectedStudent.full_name}'s Ledger</h2>
                                        <p className="text-xs text-themeTextSec font-mono uppercase mt-1">{selectedStudent.erp_id} | {selectedStudent.academic_batch}</p>
                                    </div>
                                    <i className="fa-solid fa-file-invoice-dollar text-3xl text-themeTextSec opacity-30"></i>
                                </div>

                                {loading ? (
                                    <div className="py-20 text-center"><i className="fa-solid fa-circle-notch fa-spin text-2xl text-emerald-500"></i></div>
                                ) : studentLedger.length === 0 ? (
                                    <div className="py-16 text-center text-themeTextSec border-2 border-dashed border-themeBorder rounded-xl">
                                        <p className="text-sm font-bold">No invoices found for this student.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {studentLedger.map(inv => (
                                            <div key={inv.id} className="bg-themeElevated border-theme border-themeBorder rounded-lg p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-themeBorderStrong transition-colors">
                                                <div>
                                                    <p className="text-white font-bold">{inv.title}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec bg-themePanel px-2 py-0.5 rounded border border-themeBorder">{inv.type}</span>
                                                        <span className="text-[10px] text-themeTextSec font-mono">Due: {new Date(inv.due_date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 shrink-0">
                                                    <span className="text-lg font-black font-mono text-white">₹{Number(inv.amount).toLocaleString()}</span>
                                                    {inv.status === 'paid' ? (
                                                        <span className="text-xs font-black uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20"><i className="fa-solid fa-check mr-1"></i> Paid</span>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleRecordPayment(inv.id, inv.amount, inv.title)}
                                                            className="text-xs font-black uppercase text-emerald-500 hover:text-[#0a0a0a] border border-emerald-500 hover:bg-emerald-500 px-3 py-1.5 rounded transition-colors shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                                        >
                                                            Record Payment
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden lg:flex flex-1 border-2 border-dashed border-themeBorder rounded-themePanel items-center justify-center opacity-50">
                                <p className="text-sm font-bold text-themeTextSec">Search and select a student to view their ledger.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
