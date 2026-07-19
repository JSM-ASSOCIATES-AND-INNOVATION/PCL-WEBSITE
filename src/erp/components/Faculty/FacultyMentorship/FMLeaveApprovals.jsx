import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../LIB/supabase/supabaseClient";
import { useERP } from "../../../context/ErpContext";

export default function FMLeaveApprovals({ onViewStudent, setPendingCount }) {
    const { userSession } = useERP();
    const [leaves, setLeaves] = useState([]);
    const [activeTab, setActiveTab] = useState("Pending"); // Pending, Approved, Rejected, Leave History
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        pending: 0,
        approvedToday: 0,
        rejectedToday: 0,
        totalThisMonth: 0
    });

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        if (!userSession?.db_id) return;
        setIsLoading(true);

        try {
            // 1. Fetch mentees
            const { data: mentees } = await supabase
                .from('mentorship')
                .select('student_id')
                .eq('faculty_id', userSession.db_id);
            
            const menteeIds = mentees?.map(m => m.student_id) || [];

            if (menteeIds.length === 0) {
                setLeaves([]);
                if (setPendingCount) setPendingCount(0);
                setIsLoading(false);
                return;
            }

            // 2. Fetch all leave requests for mentees
            const { data: leaveData, error } = await supabase
                .from('student_leaves')
                .select('id, student_id, start_date, end_date, reason, status, created_at, profiles:student_id(name)')
                .in('student_id', menteeIds)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const allLeaves = leaveData || [];
            setLeaves(allLeaves);

            // 3. Compute Stats
            const todayStr = new Date().toISOString().split('T')[0];
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            let pending = 0;
            let approvedToday = 0;
            let rejectedToday = 0;
            let totalThisMonth = 0;

            allLeaves.forEach(leave => {
                if (leave.status === 'Pending Mentor Approval') pending++;
                
                const createdDate = new Date(leave.created_at);
                if (createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear) {
                    totalThisMonth++;
                }

                // Naive logic for "today" - assuming reviewed_at exists, but using created_at for simplicity here
                // if we don't have reviewed_at tracking. 
                // Let's just mock today's approvals/rejections based on a simplistic check or leave as 0 if unknown.
                if (leave.status === 'Approved' && leave.created_at.startsWith(todayStr)) approvedToday++;
                if (leave.status === 'Rejected' && leave.created_at.startsWith(todayStr)) rejectedToday++;
            });

            setStats({
                pending,
                approvedToday,
                rejectedToday,
                totalThisMonth
            });

            if (setPendingCount) setPendingCount(pending);

        } catch (error) {
            console.error("Error fetching leave approvals:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (leaveId, action) => {
        setIsProcessing(true);
        try {
            const newStatus = action === 'Approve' ? 'Approved' : 'Rejected';
            
            const { error } = await supabase
                .from('student_leaves')
                .update({ status: newStatus })
                .eq('id', leaveId);
            
            if (error) throw error;

            window.erpDialog?.alert(`Leave request ${newStatus.toLowerCase()} successfully.`);
            fetchLeaves(); // Re-fetch to update stats and list
        } catch (error) {
            console.error("Error updating leave:", error);
            window.erpDialog?.alert(`Failed to ${action.toLowerCase()} leave request.`, "error");
        } finally {
            setIsProcessing(false);
        }
    };

    // Filtering
    const filteredLeaves = leaves.filter(leave => {
        // Status filter
        if (activeTab === "Pending" && leave.status !== 'Pending Mentor Approval') return false;
        if (activeTab === "Approved" && leave.status !== 'Approved') return false;
        if (activeTab === "Rejected" && leave.status !== 'Rejected') return false;
        // If "Leave History", show all
        
        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (leave.profiles?.name?.toLowerCase().includes(q) || leave.reason?.toLowerCase().includes(q));
        }

        return true;
    });

    const StatCard = ({ label, value, color }) => (
        <div className={`bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5 flex flex-col justify-between hover:border-${color}-500/50 transition-colors group`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec group-hover:text-themeText transition-colors mb-2">{label}</p>
            <h3 className={`text-3xl font-black text-${color}-500`}>{isLoading ? "-" : value}</h3>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            
            {/* Header Title */}
            <div className="flex items-center gap-3 bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                    <i className="fa-solid fa-house-medical"></i>
                </div>
                <div>
                    <h2 className={`${theme.text.heading} text-lg tracking-tight text-themeText`}>Student Leave Approvals</h2>
                    <p className={`${theme.text.secondary} text-[10px] font-bold uppercase tracking-widest mt-0.5`}>Manage mentee absences</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <StatCard label="Pending Requests" value={stats.pending} color="amber" />
                <StatCard label="Approved Today" value={stats.approvedToday} color="emerald" />
                <StatCard label="Rejected Today" value={stats.rejectedToday} color="rose" />
                <StatCard label="Total Requests This Month" value={stats.totalThisMonth} color="blue" />
            </div>

            {/* Filters and Search */}
            <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between sticky top-4 z-20 shadow-sm">
                
                {/* Tabs */}
                <div className="flex bg-themeElevated p-1 rounded-lg border-[length:var(--border-width)] border-themeBorderStrong overflow-x-auto max-w-full">
                    {["Pending", "Approved", "Rejected", "Leave History"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md text-[10px] whitespace-nowrap font-black uppercase tracking-widest transition-all ${
                                activeTab === tab 
                                    ? 'bg-blue-500 text-white shadow-md' 
                                    : 'text-themeTextSec hover:text-themeText'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full lg:w-72 shrink-0">
                    <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-themeTextSec"></i>
                    <input 
                        type="text" 
                        placeholder="Search Student..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-lg pl-10 pr-4 py-2 text-xs text-themeText focus:border-blue-500 outline-none transition-colors"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-4 relative">
                {isProcessing && (
                    <div className="absolute inset-0 z-30 bg-themeApp/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-500"></i>
                    </div>
                )}

                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-500"></i>
                    </div>
                ) : filteredLeaves.length === 0 ? (
                    <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-12 flex flex-col items-center justify-center text-center opacity-70">
                        <i className="fa-regular fa-folder-open text-5xl text-themeTextSec mb-4"></i>
                        <h3 className="text-sm font-black text-themeText">No Records Found</h3>
                        <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-2">No leave requests match the current filter.</p>
                    </div>
                ) : (
                    filteredLeaves.map(leave => (
                        <div key={leave.id} className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5 lg:p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center hover:border-blue-500/50 transition-colors">
                            
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h4 
                                        className="text-sm font-black text-themeText hover:text-blue-500 cursor-pointer transition-colors"
                                        onClick={() => onViewStudent(leave.student_id)}
                                    >
                                        {leave.profiles?.name || 'Unknown Student'}
                                    </h4>
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border-[length:var(--border-width)] ${
                                        leave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                        leave.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                    }`}>
                                        {leave.status === 'Pending Mentor Approval' ? 'Pending' : leave.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-themeTextSec uppercase tracking-widest mb-3">
                                    <span>
                                        <i className="fa-regular fa-calendar mr-1"></i>
                                        {new Date(leave.start_date).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})} - {new Date(leave.end_date).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})}
                                    </span>
                                    <span>•</span>
                                    <span>
                                        Submitted: {new Date(leave.created_at).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})}
                                    </span>
                                </div>
                                <div className="bg-themeElevated p-3 rounded-lg border-[length:var(--border-width)] border-themeBorderStrong">
                                    <p className="text-xs text-themeText italic">"{leave.reason}"</p>
                                </div>
                            </div>

                            {leave.status === 'Pending Mentor Approval' && (
                                <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-32 shrink-0 border-t lg:border-t-0 border-themeBorderStrong pt-4 lg:pt-0">
                                    <button 
                                        onClick={() => handleAction(leave.id, 'Approve')}
                                        disabled={isProcessing}
                                        className="flex-1 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest border-[length:var(--border-width)] border-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <i className="fa-solid fa-check"></i> Approve
                                    </button>
                                    <button 
                                        onClick={() => handleAction(leave.id, 'Reject')}
                                        disabled={isProcessing}
                                        className="flex-1 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest border-[length:var(--border-width)] border-rose-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <i className="fa-solid fa-xmark"></i> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

        </div>
    );
}
