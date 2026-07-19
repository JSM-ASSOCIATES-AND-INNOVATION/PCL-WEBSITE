import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../LIB/supabase/supabaseClient";
import { useERP } from "../../../context/ErpContext";

export default function SMLeaveRequests() {
    const { userSession } = useERP();
    const [activeView, setActiveView] = useState("dashboard"); // dashboard, apply, history, details
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Stats
    const [leaves, setLeaves] = useState([]);
    const [attendance, setAttendance] = useState(89.4); // Mock attendance for now
    
    // Mentor Data
    const [mentor, setMentor] = useState(null);

    useEffect(() => {
        fetchLeavesAndMentor();
    }, []);

    const fetchLeavesAndMentor = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch Mentor
            const { data: allocData } = await supabase
                .from('mentorship')
                .select('faculty_id')
                .eq('student_id', userSession.db_id)
                .order('allocated_at', { ascending: false })
                .limit(1);
            
            if (allocData?.[0]?.faculty_id) {
                const { data: mentorProfile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', allocData[0].faculty_id)
                    .single();
                setMentor({ id: allocData[0].faculty_id, name: mentorProfile?.full_name || 'Assigned Mentor' });
            }

            // 2. Fetch Leaves
            const { data: leaveData } = await supabase
                .from('student_leaves')
                .select('*')
                .eq('student_id', userSession.db_id)
                .order('created_at', { ascending: false });

            setLeaves(leaveData || []);

            // 3. (Mock) Fetch Attendance
            setAttendance(89.4);
            
        } catch (error) {
            console.error("Error fetching leave data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplySuccess = () => {
        fetchLeavesAndMentor();
        setActiveView("dashboard");
    };

    const stats = {
        pending: leaves.filter(l => l.status === 'Pending Mentor Approval').length,
        approved: leaves.filter(l => l.status === 'Approved').length,
        rejected: leaves.filter(l => l.status === 'Rejected').length
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            
            {activeView === "dashboard" && (
                <LeaveDashboard 
                    stats={stats} 
                    attendance={attendance} 
                    onApply={() => setActiveView("apply")}
                    onViewHistory={() => setActiveView("history")}
                    recentLeaves={leaves.slice(0, 3)}
                    onViewDetails={(l) => { setSelectedLeave(l); setActiveView("details"); }}
                />
            )}

            {activeView === "apply" && (
                <ApplyLeaveForm 
                    onCancel={() => setActiveView("dashboard")} 
                    onSuccess={handleApplySuccess} 
                    mentor={mentor} 
                    attendance={attendance}
                    userSession={userSession}
                />
            )}

            {activeView === "history" && (
                <LeaveHistory 
                    leaves={leaves}
                    onBack={() => setActiveView("dashboard")}
                    onViewDetails={(l) => { setSelectedLeave(l); setActiveView("details"); }}
                />
            )}

            {activeView === "details" && selectedLeave && (
                <LeaveDetails 
                    leave={selectedLeave} 
                    mentor={mentor}
                    onBack={() => setActiveView("history")} 
                />
            )}

        </div>
    );
}

// -----------------------------------------------------------------
// Subcomponents
// -----------------------------------------------------------------

function LeaveDashboard({ stats, attendance, onApply, onViewHistory, recentLeaves, onViewDetails }) {
    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-6 flex items-center justify-between">
                <div>
                    <h2 className={`${theme.text.heading} text-xl text-themeText mb-1`}><i className="fa-solid fa-house-medical mr-2 text-amber-500"></i> My Leave Dashboard</h2>
                    <p className="text-xs text-themeTextSec font-medium">Manage your absences and approvals</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onViewHistory} className="px-4 py-2 bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong hover:border-blue-500 rounded-lg text-[10px] font-black uppercase tracking-widest text-themeText transition-colors flex items-center gap-2">
                        <i className="fa-solid fa-clock-rotate-left"></i> History
                    </button>
                    <button onClick={onApply} className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-900 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/20">
                        <i className="fa-solid fa-plus"></i> Apply Leave
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-themeElevated border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Pending Requests</p>
                    <h3 className="text-3xl font-black text-amber-500">{stats.pending}</h3>
                </div>
                <div className="bg-themeElevated border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Approved (Semester)</p>
                    <h3 className="text-3xl font-black text-emerald-500">{stats.approved}</h3>
                </div>
                <div className="bg-themeElevated border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Rejected</p>
                    <h3 className="text-3xl font-black text-rose-500">{stats.rejected}</h3>
                </div>
                <div className="bg-themeElevated border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Current Attendance</p>
                    <h3 className="text-3xl font-black text-blue-500">{attendance}%</h3>
                </div>
            </div>

            {recentLeaves.length > 0 && (
                <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-6">
                    <h3 className="text-sm font-black text-themeText uppercase tracking-widest mb-4">Recent Activity</h3>
                    <div className="flex flex-col gap-3">
                        {recentLeaves.map(leave => (
                            <div key={leave.id} onClick={() => onViewDetails(leave)} className="flex items-center justify-between p-4 bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-xl cursor-pointer hover:border-blue-500 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-themePanel border-[length:var(--border-width)] border-themeBorder flex items-center justify-center text-themeTextSec group-hover:text-blue-500 transition-colors">
                                        <i className="fa-solid fa-file-waveform"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-themeText mb-0.5">Leave Request</p>
                                        <p className="text-[10px] font-bold text-themeTextSec">{new Date(leave.start_date).toLocaleDateString()} to {new Date(leave.end_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border-[length:var(--border-width)] ${
                                    leave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                    leave.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                }`}>
                                    {leave.status === 'Pending Mentor Approval' ? 'Pending' : leave.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function ApplyLeaveForm({ onCancel, onSuccess, mentor, attendance, userSession }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const minDateStr = new Date().toISOString().split('T')[0];
    
    const [formData, setFormData] = useState({
        type: 'Medical Leave',
        startDate: minDateStr,
        endDate: minDateStr,
        reason: '',
        confirmed: false
    });

    const diffTime = Math.abs(new Date(formData.endDate) - new Date(formData.startDate));
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!mentor) {
            window.erpDialog?.alert("You do not have a mentor assigned. Please contact administration.");
            return;
        }

        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            window.erpDialog?.alert("End date cannot be before start date.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                student_id: userSession.db_id,
                start_date: formData.startDate,
                end_date: formData.endDate,
                reason: formData.reason,
                status: 'Pending Mentor Approval'
            };

            const { error } = await supabase.from('student_leaves').insert([payload]);
            if (error) throw error;
            
            // Show custom success screen (mocking it with alert for now, you can build a full screen)
            window.erpDialog?.alert("Leave Request Submitted! Your mentor has been notified.", "success");
            onSuccess();
        } catch (error) {
            console.error("Error submitting leave:", error);
            window.erpDialog?.alert("Failed to submit request.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in max-w-3xl mx-auto w-full">
            
            <div className="flex items-center gap-4 bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5">
                <button onClick={onCancel} className="w-8 h-8 rounded-lg bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong flex items-center justify-center text-themeText hover:text-amber-500 transition-colors shrink-0">
                    <i className="fa-solid fa-chevron-left"></i>
                </button>
                <h2 className={`${theme.text.heading} text-lg text-themeText`}>Apply for Leave</h2>
            </div>

            <form onSubmit={handleSubmit} className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-6 lg:p-8 flex flex-col gap-8">
                
                {/* Form Fields */}
                <div className="flex flex-col gap-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Leave Type</label>
                        <select 
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                            className="w-full bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-lg px-4 py-3 text-sm text-themeText focus:border-amber-500 outline-none"
                        >
                            <option>Medical Leave</option>
                            <option>Personal Leave</option>
                            <option>Duty Leave (Moot/Event)</option>
                            <option>Emergency</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Start Date</label>
                            <input 
                                type="date" 
                                min={minDateStr} 
                                required
                                value={formData.startDate}
                                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                className="w-full bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-lg px-4 py-3 text-sm text-themeText focus:border-amber-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">End Date</label>
                            <input 
                                type="date" 
                                min={minDateStr} 
                                required
                                value={formData.endDate}
                                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                className="w-full bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-lg px-4 py-3 text-sm text-themeText focus:border-amber-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-lg p-4 flex items-center justify-between">
                        <span className="text-xs font-bold text-themeTextSec uppercase tracking-widest">Total Days</span>
                        <span className="text-lg font-black text-themeText">{totalDays} {totalDays === 1 ? 'Day' : 'Days'}</span>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 flex justify-between">
                            <span>Reason</span>
                            <span>{formData.reason.length}/500</span>
                        </label>
                        <textarea 
                            required
                            maxLength={500}
                            rows={4}
                            value={formData.reason}
                            onChange={(e) => setFormData({...formData, reason: e.target.value})}
                            className="w-full bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-lg px-4 py-3 text-sm text-themeText focus:border-amber-500 outline-none resize-none"
                            placeholder="Provide a detailed reason for your leave..."
                        ></textarea>
                    </div>

                    {/* Classes Likley Missed Mock */}
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Classes Likely to be Missed</label>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-themeElevated border-[length:var(--border-width)] border-themeBorder px-3 py-2 rounded text-xs font-bold text-themeText flex items-center gap-2">
                                <i className="fa-solid fa-check text-amber-500"></i> Constitutional Law
                            </div>
                            <div className="bg-themeElevated border-[length:var(--border-width)] border-themeBorder px-3 py-2 rounded text-xs font-bold text-themeText flex items-center gap-2">
                                <i className="fa-solid fa-check text-amber-500"></i> Contract Law
                            </div>
                            <div className="bg-themeElevated border-[length:var(--border-width)] border-themeBorder px-3 py-2 rounded text-xs font-bold text-themeText flex items-center gap-2">
                                <i className="fa-solid fa-check text-amber-500"></i> Cyber Law
                            </div>
                        </div>
                    </div>

                </div>

                {/* Warning Card */}
                <div className="bg-amber-500/10 border-[length:var(--border-width)] border-amber-500/30 rounded-xl p-5">
                    <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-triangle-exclamation"></i> Important Notice
                    </h4>
                    <ul className="text-xs text-amber-600/80 space-y-2 font-medium">
                        <li>• This leave request will be sent directly to your assigned mentor ({mentor?.name || 'Assigned Mentor'}).</li>
                        <li>• You must produce valid supporting proof whenever requested by your mentor or the university.</li>
                        <li>• Failure to produce valid proof or submission of false information may result in rejection of your leave request and disciplinary action.</li>
                        <li>• Approval of leave does not automatically guarantee attendance exemption until your mentor explicitly approves it.</li>
                    </ul>
                </div>

                <div className="flex items-center gap-3 bg-themeElevated p-4 rounded-xl border-[length:var(--border-width)] border-themeBorderStrong cursor-pointer" onClick={() => setFormData({...formData, confirmed: !formData.confirmed})}>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${formData.confirmed ? 'bg-amber-500 border-amber-500 text-neutral-900' : 'border-themeBorder text-transparent'}`}>
                        <i className="fa-solid fa-check text-[10px]"></i>
                    </div>
                    <span className="text-xs font-bold text-themeText">I confirm that the information provided is true.</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 border-t-[length:var(--border-width)] border-themeBorderStrong pt-6">
                    <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-themeTextSec hover:text-themeText transition-colors">
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={!formData.confirmed || isSubmitting}
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-900 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                        {isSubmitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                        Submit Request
                    </button>
                </div>
            </form>
        </div>
    );
}

function LeaveHistory({ leaves, onBack, onViewDetails }) {
    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center gap-4 bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5">
                <button onClick={onBack} className="w-8 h-8 rounded-lg bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong flex items-center justify-center text-themeText hover:text-amber-500 transition-colors shrink-0">
                    <i className="fa-solid fa-chevron-left"></i>
                </button>
                <div>
                    <h2 className={`${theme.text.heading} text-lg text-themeText`}>My Leave History</h2>
                    <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">All submitted requests</p>
                </div>
            </div>

            <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-[length:var(--border-width)] border-themeBorder bg-themeElevated/50">
                                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec">Leave ID</th>
                                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec">Dates</th>
                                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec text-center">Days</th>
                                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec">Status</th>
                                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-themeBorder">
                            {leaves.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-5 py-12 text-center">
                                        <p className="text-sm font-black text-themeTextSec">No leave history found.</p>
                                    </td>
                                </tr>
                            ) : (
                                leaves.map(leave => {
                                    const diff = Math.ceil(Math.abs(new Date(leave.end_date) - new Date(leave.start_date)) / (1000 * 60 * 60 * 24)) + 1;
                                    return (
                                        <tr key={leave.id} className="hover:bg-themeElevated/30 transition-colors">
                                            <td className="px-5 py-4 text-xs font-bold text-themeText font-mono">LV-{String(leave.id).padStart(5, '0')}</td>
                                            <td className="px-5 py-4 text-xs font-medium text-themeTextSec">
                                                {new Date(leave.start_date).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})} – {new Date(leave.end_date).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})}
                                            </td>
                                            <td className="px-5 py-4 text-xs font-bold text-themeText text-center">{diff}</td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border-[length:var(--border-width)] ${
                                                    leave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    leave.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                }`}>
                                                    {leave.status === 'Pending Mentor Approval' ? 'Pending' : leave.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button onClick={() => onViewDetails(leave)} className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400">
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function LeaveDetails({ leave, mentor, onBack }) {
    const isApproved = leave.status === 'Approved';
    const isRejected = leave.status === 'Rejected';
    
    return (
        <div className="flex flex-col gap-6 animate-fade-in max-w-3xl mx-auto w-full">
            <div className="flex items-center gap-4 bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5">
                <button onClick={onBack} className="w-8 h-8 rounded-lg bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong flex items-center justify-center text-themeText hover:text-amber-500 transition-colors shrink-0">
                    <i className="fa-solid fa-chevron-left"></i>
                </button>
                <h2 className={`${theme.text.heading} text-lg text-themeText`}>Leave Details</h2>
            </div>

            <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-6 lg:p-8 flex flex-col gap-8">
                
                {/* Status Header */}
                <div className={`p-5 rounded-xl border-[length:var(--border-width)] flex flex-col gap-2 ${
                    isApproved ? 'bg-emerald-500/10 border-emerald-500/30' :
                    isRejected ? 'bg-rose-500/10 border-rose-500/30' :
                    'bg-amber-500/10 border-amber-500/30'
                }`}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Status</span>
                    <div className={`flex items-center gap-2 text-lg font-black ${
                        isApproved ? 'text-emerald-500' :
                        isRejected ? 'text-rose-500' :
                        'text-amber-500'
                    }`}>
                        {isApproved ? <i className="fa-solid fa-circle-check"></i> : 
                         isRejected ? <i className="fa-solid fa-circle-xmark"></i> : 
                         <i className="fa-solid fa-hourglass-half"></i>}
                        {leave.status}
                    </div>
                </div>

                {isApproved && (
                    <div className="grid grid-cols-2 gap-4 border-b-[length:var(--border-width)] border-themeBorder pb-6">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec block mb-1">Attendance</span>
                            <span className="text-sm font-bold text-themeText">Exempted for all approved class hours.</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec block mb-1">Approved By</span>
                            <span className="text-sm font-bold text-themeText">{mentor?.name}</span>
                        </div>
                    </div>
                )}

                {isRejected && (
                    <div className="border-b-[length:var(--border-width)] border-themeBorder pb-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec block mb-1">Mentor Remarks</span>
                        <span className="text-sm font-medium text-themeText">Request declined. Please meet your mentor for clarification.</span>
                    </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec block mb-1">Application ID</span>
                        <span className="text-sm font-bold text-themeText font-mono">LV-{String(leave.id).padStart(5, '0')}</span>
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec block mb-1">Submitted On</span>
                        <span className="text-sm font-bold text-themeText">{new Date(leave.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec block mb-1">Dates</span>
                        <span className="text-sm font-bold text-themeText">{new Date(leave.start_date).toLocaleDateString()} to {new Date(leave.end_date).toLocaleDateString()}</span>
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec block mb-1">Mentor</span>
                        <span className="text-sm font-bold text-themeText">{mentor?.name || 'Assigned Mentor'}</span>
                    </div>
                </div>

                <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec block mb-2">Reason Provided</span>
                    <div className="bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-lg p-4">
                        <p className="text-xs text-themeText leading-relaxed">{leave.reason}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
