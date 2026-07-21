/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase/supabaseClient';

export default function ForgotPasswordModal({ onClose }) {
    const [institutionalId, setInstitutionalId] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Very simple lookup to ensure the user exists before submitting a request
            // (We assume profiles table has erp_id or institutional ID mapping). 
            // If they don't, the admin will reject it anyway. We just insert the request.
            const { error: insertError } = await supabase
                .from('erp_password_reset_requests')
                .insert([{
                    institutional_id: institutionalId.trim().toLowerCase(),
                    reason: reason.trim()
                }]);

            if (insertError) throw insertError;
            
            setSuccess(true);
        } catch (err) {
            setError('Failed to submit request. Please verify your connection or try again later.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in font-sans">
            <div className="bg-themePanel w-full max-w-md rounded-[2rem] border border-themeBorder shadow-2xl p-8 relative overflow-hidden flex flex-col">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 w-8 h-8 rounded-full bg-themeElevated hover:bg-themeBorder flex items-center justify-center text-themeTextSec hover:text-themeText transition-colors outline-none z-10"
                >
                    <i className="fa-solid fa-times"></i>
                </button>

                <div className="mb-8 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-themeElevated border border-themeBorderStrong flex items-center justify-center mb-6 shadow-inner">
                        <i className="fa-solid fa-unlock-keyhole text-2xl text-themeAccent"></i>
                    </div>
                    <h2 className="text-2xl font-black text-themeText tracking-tight mb-2">Account Recovery</h2>
                    <p className="text-xs font-bold text-themeTextSec leading-relaxed">
                        Submit a password reset request to the Administration. You will receive a temporary password once approved.
                    </p>
                </div>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
                            <i className="fa-solid fa-check text-3xl text-emerald-500"></i>
                        </div>
                        <h3 className="text-lg font-black text-themeText mb-2">Request Submitted</h3>
                        <p className="text-xs font-bold text-themeTextSec mb-8">
                            Your request has been forwarded to the Administration. Please monitor your registered contact channels for updates.
                        </p>
                        <button 
                            onClick={onClose}
                            className="w-full py-4 rounded-xl bg-themeApp border border-themeBorder hover:border-themeBorderStrong text-sm font-black uppercase tracking-wider text-themeText transition-all"
                        >
                            Return to Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-xs font-bold flex items-start gap-3">
                                <i className="fa-solid fa-circle-exclamation shrink-0 mt-0.5"></i> 
                                <span className="leading-relaxed">{error}</span>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">
                                Institutional ID
                            </label>
                            <input
                                type="text"
                                value={institutionalId}
                                onChange={(e) => setInstitutionalId(e.target.value)}
                                className="w-full bg-themeApp border border-themeBorder focus:border-themeAccent rounded-xl py-4 px-5 text-sm font-bold text-themeText uppercase outline-none transition-all placeholder:text-themeTextSec placeholder:font-normal placeholder:normal-case shadow-inner"
                                placeholder="e.g. PCL-STU-2026"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">
                                Reason for Reset
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                                className="w-full bg-themeApp border border-themeBorder focus:border-themeAccent rounded-xl py-4 px-5 text-sm font-bold text-themeText outline-none transition-all placeholder:text-themeTextSec placeholder:font-normal resize-none shadow-inner"
                                placeholder="Briefly explain why you need a reset (e.g. Forgot password, locked out)"
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !institutionalId || !reason}
                            className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 flex justify-center items-center gap-3 mt-2 ${
                                isSubmitting || !institutionalId || !reason
                                ? 'bg-themeElevated text-themeTextSec cursor-not-allowed border border-themeBorder'
                                : 'bg-themeAccent text-white hover:opacity-90 hover:scale-[1.02] shadow-xl shadow-themeAccent/30 border border-transparent'
                            }`}
                        >
                            {isSubmitting ? (
                                <><i className="fa-solid fa-circle-notch fa-spin text-lg"></i> Submitting...</>
                            ) : (
                                <>Submit Request <i className="fa-solid fa-paper-plane text-sm"></i></>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
