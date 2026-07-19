/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../LIB/supabase/supabaseClient';

export default function ApprovalCenter() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('timetable_requests')
                .select(`
                    id, request_type, requested_date, requested_start_time, requested_end_time, reason, status, conflict_check_status, created_at,
                    faculty:profiles(full_name),
                    subject:subjects(name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (err) {
            console.error("Failed to fetch requests:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('timetable_requests')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            fetchRequests();
        } catch (err) {
            console.error(`Failed to ${newStatus} request:`, err);
            window.erpDialog?.alert(`Error trying to ${newStatus} the request.`);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div>
                <h2 className="text-xl font-black text-themeText">Approval Center</h2>
                <p className="text-xs font-bold text-themeTextSec">Review faculty timetable requests and validate conflicts.</p>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-themeAccent border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : requests.length === 0 ? (
                <div className="h-40 flex items-center justify-center border border-themeBorder border-dashed rounded-2xl">
                    <p className="text-sm font-bold text-themeTextSec">No pending requests at this time.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {requests.map(req => (
                        <div key={req.id} className="bg-themePanel border border-themeBorder rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-2 py-1 bg-themeElevated border border-themeBorderStrong rounded-md text-[9px] font-black uppercase tracking-widest text-themeTextSec">{req.request_type}</span>
                                    <span className="text-[10px] font-black text-themeTextSec"><i className="fa-regular fa-clock"></i> {new Date(req.created_at).toLocaleDateString()}</span>
                                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                        req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                        req.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                    }`}>
                                        {req.status}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-themeText">{req.subject?.name || 'Unknown Subject'}</h3>
                                <p className="text-sm font-bold text-themeTextSec mt-1">Faculty: <span className="text-themeText">{req.faculty?.full_name || 'Unknown'}</span></p>
                                
                                <p className="text-sm font-bold text-themeTextSec mt-1">
                                    Requested Slot: <span className="text-themeAccent">
                                        {req.requested_date ? new Date(req.requested_date).toLocaleDateString() : ''} 
                                        {req.requested_start_time ? ` ${req.requested_start_time.slice(0,5)} - ${req.requested_end_time.slice(0,5)}` : ''}
                                    </span>
                                </p>
                                
                                <p className="text-xs font-bold text-themeText mt-3 bg-themeElevated p-3 rounded-lg border border-themeBorderStrong">"{req.reason}"</p>
                            </div>

                            {req.status === 'Pending' && (
                                <div className="w-full lg:w-72 shrink-0 bg-themeElevated border border-themeBorderStrong rounded-xl p-4 flex flex-col gap-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1">Action Required</p>
                                        <span className="text-xs font-bold text-themeTextSec">Please review and respond to this faculty request.</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <button onClick={() => handleAction(req.id, 'Rejected')} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Reject</button>
                                        <button onClick={() => handleAction(req.id, 'Approved')} className="bg-emerald-500 text-[#0a0a0a] hover:opacity-90 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-opacity shadow-lg">Approve</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
