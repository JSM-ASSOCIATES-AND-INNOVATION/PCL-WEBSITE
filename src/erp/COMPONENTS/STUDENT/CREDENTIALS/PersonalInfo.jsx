import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../CONTEXT/ErpContext";
import { supabase } from "../../../LIB/SUPABASE/supabaseClient";

export default function PersonalInfo() {
    const { userSession } = useERP();
    const studentId = userSession?.db_id || userSession?.id;

    // --- STATE ---
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

    // Live Data State (Editable)
    const [formData, setFormData] = useState(() => {
        if (studentId) {
            const cachedP = sessionStorage.getItem(`credentials_personal_p_${studentId}`);
            if (cachedP) return JSON.parse(cachedP);
        }
        return {
            fullName: "",
            email: userSession?.email || "",
            phone: "",
            dob: ""
        };
    });

    // Locked Data from Questionnaire
    const [qData, setQData] = useState(() => {
        if (studentId) {
            const cachedQ = sessionStorage.getItem(`credentials_personal_q_${studentId}`);
            if (cachedQ) return JSON.parse(cachedQ);
        }
        return {};
    });

    // --- DATA SYNC ENGINE ---
    useEffect(() => {
        if (!studentId) return;

        const fetchPersonalData = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('full_name, phone, dob, questionnaire_data')
                    .eq('id', studentId)
                    .single();

                if (error) throw error;

                const freshFormData = {
                    fullName: data.full_name || "Unknown Identity",
                    email: userSession?.email || "", // Auth Email is locked
                    phone: data.phone || "",
                    dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : ""
                };
                
                // Prioritize userSession data if newly completed, otherwise db data
                const freshQData = userSession?.questionnaire_data || data.questionnaire_data || {};

                sessionStorage.setItem(`credentials_personal_p_${studentId}`, JSON.stringify(freshFormData));
                sessionStorage.setItem(`credentials_personal_q_${studentId}`, JSON.stringify(freshQData));

                setFormData(freshFormData);
                setQData(freshQData);
            } catch (err) {
                console.error("Error fetching personal info:", err);
            }
        };

        fetchPersonalData();
    }, [studentId, userSession?.email, userSession?.questionnaire_completed, userSession?.questionnaire_data]);

    // --- UPDATE ENGINE ---
    const handleSave = async () => {
        setIsSaving(true);
        setStatusMessage({ type: "", text: "" });

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    phone: formData.phone,
                    dob: formData.dob || null
                })
                .eq('id', studentId);

            if (error) throw error;

            sessionStorage.setItem(`credentials_personal_p_${studentId}`, JSON.stringify(formData));

            setIsEditing(false);
            setStatusMessage({ type: "success", text: "Profile registry updated successfully." });

            setTimeout(() => setStatusMessage({ type: "", text: "" }), 3000);
        } catch (err) {
            console.error("Save failed:", err);
            setStatusMessage({ type: "error", text: "Failed to sync with the university server." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Helper to render a locked field card
    const LockedField = ({ label, icon, value, isMono = false, isLink = false, colSpan = false }) => (
        <div className={`bg-themePanel p-3.5 lg:p-5 rounded-xl lg:rounded-themePanel border-theme border-themeBorder relative opacity-90 ${colSpan ? 'md:col-span-2' : ''}`}>
            <label className="block text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5 lg:mb-1 ml-1">{label}</label>
            <div className="flex items-center gap-2 lg:gap-3 mt-1.5 lg:mt-2">
                <i className={`${icon} text-neutral-600 ml-1 text-xs lg:text-sm`}></i>
                {isLink && value ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="w-full bg-transparent text-xs lg:text-base font-bold text-themeAccent hover:underline outline-none truncate block">
                        {value}
                    </a>
                ) : (
                    <span className={`w-full text-xs lg:text-base font-bold text-themeTextSec truncate ${isMono ? 'font-mono' : ''}`}>
                        {value || 'Not Provided'}
                    </span>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-5 lg:gap-8 animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-theme border-themeBorder pb-4 lg:pb-6 gap-3">
                <div>
                    <h2 className={`${theme.text.heading} text-base lg:text-xl text-themeText tracking-tight`}>
                        Identity Registry
                    </h2>
                    <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mt-0.5 lg:mt-1">
                        Manage your demographic and emergency contact details
                    </p>
                </div>

                <div className="flex items-center gap-2 lg:gap-3">
                    {statusMessage.text && (
                        <span className={`text-[8px] lg:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 px-2 lg:px-3 py-1.5 rounded-lg ${statusMessage.type === "success" ? "bg-themeElevated text-emerald-400 border-theme border-themeBorderStrong" : "bg-themeElevated text-rose-400 border-theme border-themeBorderStrong"}`}>
                            <i className={`fa-solid ${statusMessage.type === "success" ? "fa-check-circle" : "fa-triangle-exclamation"}`}></i>
                            <span className="hidden sm:inline">{statusMessage.text}</span>
                            <span className="sm:hidden">{statusMessage.type === "success" ? "Saved" : "Failed"}</span>
                        </span>
                    )}

                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="px-3 lg:px-5 py-2 lg:py-2.5 bg-themePanel hover:bg-themeElevated text-themeText border-theme border-themeBorder hover:border-amber-500 rounded-xl lg:rounded-themePanel text-[9px] lg:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0">
                            <i className="fa-solid fa-pen text-themeAccent"></i> <span className="hidden sm:inline">Request</span> Edit
                        </button>
                    ) : (
                        <button onClick={handleSave} disabled={isSaving} className="px-3 lg:px-5 py-2 lg:py-2.5 bg-amber-500 hover:bg-amber-400 text-[#050505] rounded-xl lg:rounded-themePanel text-[9px] lg:text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-70 shrink-0">
                            {isSaving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                            {isSaving ? 'Syncing...' : 'Commit'}
                        </button>
                    )}
                </div>
            </div>

            {/* Editable Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-6">
                
                {/* Full Name (Locked) */}
                <div className="bg-themePanel p-3.5 lg:p-5 rounded-xl lg:rounded-themePanel border-theme border-themeBorder relative">
                    <label className="block text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5 lg:mb-1 ml-1">Legal Name</label>
                    <div className="flex items-center gap-2 lg:gap-3 mt-1.5 lg:mt-2">
                        <i className="fa-solid fa-user text-neutral-600 ml-1 text-xs lg:text-sm"></i>
                        <input type="text" value={formData.fullName} disabled className="w-full bg-transparent text-xs lg:text-base font-bold text-themeTextSec outline-none cursor-not-allowed" />
                    </div>
                    <i className="fa-solid fa-lock absolute top-3.5 lg:top-5 right-3.5 lg:right-5 text-neutral-700 text-[9px] lg:text-xs"></i>
                </div>

                {/* Email (Locked) */}
                <div className="bg-themePanel p-3.5 lg:p-5 rounded-xl lg:rounded-themePanel border-theme border-themeBorder relative">
                    <label className="block text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5 lg:mb-1 ml-1">University Email</label>
                    <div className="flex items-center gap-2 lg:gap-3 mt-1.5 lg:mt-2">
                        <i className="fa-solid fa-envelope text-neutral-600 ml-1 text-xs lg:text-sm"></i>
                        <input type="email" value={formData.email} disabled className="w-full bg-transparent text-xs lg:text-base font-bold text-themeTextSec outline-none cursor-not-allowed truncate" />
                    </div>
                    <i className="fa-solid fa-lock absolute top-3.5 lg:top-5 right-3.5 lg:right-5 text-neutral-700 text-[9px] lg:text-xs"></i>
                </div>

                {/* Phone */}
                <div className={`p-3.5 lg:p-5 rounded-xl lg:rounded-themePanel border-theme transition-colors ${isEditing ? 'bg-themeElevated border-themeBorderStrong' : 'bg-themePanel border-themeBorder'}`}>
                    <label className="block text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5 lg:mb-1 ml-1">Personal Contact Number</label>
                    <div className="flex items-center gap-2 lg:gap-3 mt-1.5 lg:mt-2">
                        <i className={`fa-solid fa-phone ${isEditing ? 'text-themeAccent' : 'text-neutral-600'} ml-1 transition-colors text-xs lg:text-sm`}></i>
                        <input
                            type="text" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing}
                            className={`w-full bg-transparent text-xs lg:text-base font-bold outline-none ${isEditing ? 'text-themeText' : 'text-themeTextSec cursor-not-allowed'}`}
                            placeholder="+91 XXXXX XXXXX"
                        />
                    </div>
                </div>

                {/* DOB */}
                <div className={`p-3.5 lg:p-5 rounded-xl lg:rounded-themePanel border-theme transition-colors ${isEditing ? 'bg-themeElevated border-themeBorderStrong' : 'bg-themePanel border-themeBorder'}`}>
                    <label className="block text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5 lg:mb-1 ml-1">Date of Birth</label>
                    <div className="flex items-center gap-2 lg:gap-3 mt-1.5 lg:mt-2">
                        <i className={`fa-regular fa-calendar ${isEditing ? 'text-themeAccent' : 'text-neutral-600'} ml-1 transition-colors text-xs lg:text-sm`}></i>
                        <input
                            type="date" name="dob" value={formData.dob} onChange={handleInputChange} disabled={!isEditing}
                            className={`w-full bg-transparent text-xs lg:text-base font-bold outline-none ${isEditing ? 'text-themeText' : 'text-themeTextSec cursor-not-allowed'} [color-scheme:dark]`}
                        />
                    </div>
                </div>

            </div>

            {/* Institutional Questionnaire Locked Records */}
            <div className="pt-4 lg:pt-8 border-t-theme border-themeBorder">
                <h3 className="text-[9px] lg:text-xs font-black text-themeText uppercase tracking-widest mb-4 lg:mb-6 flex items-center justify-between flex-wrap gap-2">
                    <span className="flex items-center gap-2">
                        <div className="w-7 h-7 lg:w-10 lg:h-10 rounded-lg lg:rounded-themePanel bg-themeElevated flex items-center justify-center border-theme border-themeBorderStrong">
                            <i className="fa-solid fa-shield-halved text-themeAccent text-xs lg:text-sm"></i>
                        </div>
                        Institutional Locked Records
                    </span>
                    <span className="text-[8px] lg:text-[9px] text-themeTextSec font-bold flex items-center gap-1.5 px-2 lg:px-3 py-1 lg:py-1.5 bg-themePanel border-theme border-themeBorder rounded-md">
                        <i className="fa-solid fa-lock text-rose-500"></i> Cannot Edit
                    </span>
                </h3>

                {/* Check if questionnaire data exists */}
                {Object.keys(qData).length === 0 ? (
                    <div className="text-center py-8 lg:py-12 bg-themePanel rounded-xl lg:rounded-themePanel border-theme border-themeBorder border-dashed">
                        <i className="fa-solid fa-clipboard-question text-3xl lg:text-4xl text-themeTextSec opacity-40 mb-3"></i>
                        <h4 className="text-sm font-bold text-themeText mb-1">No Questionnaire Data Found</h4>
                        <p className="text-xs text-themeTextSec max-w-sm mx-auto">
                            The onboarding questionnaire has not been completed yet. Data will appear here after submission.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-6">
                        
                        <LockedField label="Aadhar Number" icon="fa-solid fa-id-card" value={qData.aadharNumber} isMono />
                        <LockedField label="Blood Group" icon="fa-solid fa-droplet" value={qData.bloodGroup} />
                        <LockedField label="Legal Interest" icon="fa-solid fa-scale-balanced" value={qData.legalInterest} />
                        <LockedField label="LinkedIn Profile" icon="fa-brands fa-linkedin" value={qData.linkedInProfile} isLink />
                        <LockedField label="Legal Lineage" icon="fa-solid fa-people-arrows" value={qData.pastLegalGenerations === 'Yes' ? qData.pastLegalGenerationsDetails : 'No Prior Lineage'} />
                        <LockedField label="Father's Name" icon="fa-solid fa-user-tie" value={qData.fatherName} />
                        <LockedField label="Mother's Name" icon="fa-solid fa-user" value={qData.motherName} />
                        <LockedField label="Parent/Guardian Occupation" icon="fa-solid fa-briefcase" value={qData.parentOccupation} colSpan />

                        {/* Emergency Contact - inline grid */}
                        <div className="bg-themePanel p-3.5 lg:p-5 rounded-xl lg:rounded-themePanel border-theme border-themeBorder relative opacity-90 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                            <div>
                                <label className="block text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5 lg:mb-1 ml-1">Emergency Contact</label>
                                <div className="flex items-center gap-2 lg:gap-3 mt-1.5 lg:mt-2">
                                    <i className="fa-solid fa-heart-pulse text-neutral-600 ml-1 text-xs lg:text-sm"></i>
                                    <span className="text-xs lg:text-base font-bold text-themeTextSec">{qData.emergencyContact || 'Not Provided'}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5 lg:mb-1 ml-1">Emergency Phone</label>
                                <div className="flex items-center gap-2 lg:gap-3 mt-1.5 lg:mt-2">
                                    <i className="fa-solid fa-phone text-neutral-600 ml-1 text-xs lg:text-sm"></i>
                                    <span className="text-xs lg:text-base font-bold text-themeTextSec font-mono">{qData.emergencyPhone || 'Not Provided'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Addresses */}
                        <div className="bg-themePanel p-3.5 lg:p-5 rounded-xl lg:rounded-themePanel border-theme border-themeBorder relative opacity-90 md:col-span-2">
                            <label className="block text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5 lg:mb-1 ml-1">Permanent Address</label>
                            <div className="flex items-start gap-2 lg:gap-3 mt-1.5 lg:mt-2">
                                <i className="fa-solid fa-map-location-dot text-neutral-600 ml-1 mt-0.5 text-xs lg:text-sm"></i>
                                <p className="text-xs lg:text-base font-bold text-themeTextSec">{qData.permanentAddress || 'Not Provided'}</p>
                            </div>
                        </div>
                        <div className="bg-themePanel p-3.5 lg:p-5 rounded-xl lg:rounded-themePanel border-theme border-themeBorder relative opacity-90 md:col-span-2">
                            <label className="block text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5 lg:mb-1 ml-1">Present Address</label>
                            <div className="flex items-start gap-2 lg:gap-3 mt-1.5 lg:mt-2">
                                <i className="fa-solid fa-location-dot text-neutral-600 ml-1 mt-0.5 text-xs lg:text-sm"></i>
                                <p className="text-xs lg:text-base font-bold text-themeTextSec">{qData.presentAddress || 'Not Provided'}</p>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}