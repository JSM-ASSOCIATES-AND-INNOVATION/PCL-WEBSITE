import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../context/ErpContext";
import { supabase } from "../../../lib/supabase/supabaseClient";

export default function AcademicDetails() {
    const { userSession } = useERP();
    
    // Initialize academicData using sessionStorage caching (zero-lag)
    const getCachedData = () => {
        const studentId = userSession?.db_id || userSession?.id;
        if (!studentId) return null;
        try {
            const cached = sessionStorage.getItem(`credentials_academic_${studentId}`);
            if (cached) return JSON.parse(cached);
        } catch (e) {
            console.error("Failed to parse cached academic data", e);
        }
        return null;
    };

    const [academicData, setAcademicData] = useState(getCachedData());

    useEffect(() => {
        const studentId = userSession?.db_id || userSession?.id;
        if (!studentId) return;

        const fetchOfficialRecord = async () => {
            try {
                // Fetch authoritative record from backend and semester results in parallel
                const [profileResponse, resultsResponse] = await Promise.all([
                    supabase
                        .from('profiles')
                        .select('erp_id, academic_batch, department, created_at')
                        .eq('id', studentId) 
                        .single(),
                    supabase
                        .from('semester_results')
                        .select('sgpa, credits')
                        .eq('student_id', studentId)
                ]);

                if (profileResponse.error) throw profileResponse.error;

                const profileData = profileResponse.data;
                const resultsData = resultsResponse.data || [];

                // Parse the batch string (e.g., 'BBA-LLB-5A') to extract semester intelligently
                const batchParts = profileData.academic_batch ? profileData.academic_batch.split('-') : [];
                const semNumber = batchParts.length >= 3 ? batchParts[2].replace(/[^0-9]/g, '') : '';
                const semesterInfo = semNumber ? `Semester ${semNumber}` : "Ongoing";

                // GPA calculation logic (incorporating it seamlessly based on prompt)
                let cgpaDisplay = null;
                if (resultsData && resultsData.length > 0) {
                    let totalPoints = 0;
                    let totalCredits = 0;
                    let hasCredits = false;
                    
                    resultsData.forEach(sem => {
                        if (sem.sgpa && sem.credits) {
                            totalPoints += sem.sgpa * sem.credits;
                            totalCredits += sem.credits;
                            hasCredits = true;
                        }
                    });
                    
                    if (hasCredits && totalCredits > 0) {
                        cgpaDisplay = (totalPoints / totalCredits).toFixed(2);
                    } else {
                        const validSgpas = resultsData.filter(s => s.sgpa).map(s => s.sgpa);
                        if (validSgpas.length > 0) {
                            const sum = validSgpas.reduce((a, b) => a + b, 0);
                            cgpaDisplay = (sum / validSgpas.length).toFixed(2);
                        }
                    }
                }

                // Format the payload for the Enterprise UI
                const newDetails = [
                    { label: "Official ERP ID", value: profileData.erp_id || "Unassigned", icon: "fa-id-card", color: "text-themeAccent" },
                    { label: "Academic Program", value: profileData.department || "B.B.A. LL.B. (Hons.)", icon: "fa-scale-balanced", color: "text-blue-400" },
                    { label: "Designated Batch", value: profileData.academic_batch || "Unassigned", icon: "fa-users-rectangle", color: "text-emerald-400" },
                    { label: "Current Progression", value: semesterInfo, icon: "fa-stairs", color: "text-themeAccent" },
                    { label: "Admission Year", value: profileData.created_at ? new Date(profileData.created_at).getFullYear().toString() : "2024", icon: "fa-calendar-check", color: "text-rose-400" },
                    { label: "Enrollment Status", value: "Active & Verified", icon: "fa-shield-check", color: "text-emerald-500" },
                ];

                if (cgpaDisplay) {
                    newDetails.push({ label: "Cumulative GPA", value: cgpaDisplay, icon: "fa-graduation-cap", color: "text-amber-400" });
                }

                setAcademicData(newDetails);
                sessionStorage.setItem(`credentials_academic_${studentId}`, JSON.stringify(newDetails));

            } catch (err) {
                console.error("Failed to load academic details:", err.message);
            }
        };

        fetchOfficialRecord();
    }, [userSession]);

    if (!academicData) return null;

    return (
        <div className="flex flex-col gap-6 lg:gap-8 animate-fade-in">
            {/* Header with Verification Seal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-theme border-themeBorder pb-4 lg:pb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 lg:w-14 lg:h-14 bg-themeElevated border-theme border-themeBorderStrong rounded-xl lg:rounded-themePanel flex items-center justify-center text-themeAccent shrink-0">
                        <i className="fa-solid fa-file-certificate text-sm lg:text-2xl"></i>
                    </div>
                    <div>
                        <h2 className={`${theme.text.heading} text-base lg:text-xl text-themeText tracking-tight`}>
                            Academic Registry
                        </h2>
                        <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mt-0.5">
                            University Master Ledger
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-themeElevated border-theme border-themeBorderStrong rounded-lg lg:rounded-themePanel w-fit">
                    <i className="fa-solid fa-badge-check text-emerald-500"></i>
                    <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-emerald-400">Verified</span>
                </div>
            </div>

            {/* The Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5">
                {academicData.map((item, i) => (
                    <div key={i} className="bg-themePanel p-3.5 lg:p-6 rounded-xl lg:rounded-themePanel border-theme border-themeBorder flex items-center gap-3 lg:gap-4 hover:border-neutral-600 transition-colors group">
                        <div className={`w-10 h-10 lg:w-14 lg:h-14 bg-themeElevated border-theme border-themeBorder rounded-xl lg:rounded-themePanel flex items-center justify-center text-sm lg:text-xl shrink-0 group-hover:scale-110 transition-transform ${item.color}`}>
                            <i className={`fa-solid ${item.icon}`}></i>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5 lg:mb-1 truncate">
                                {item.label}
                            </p>
                            <p className={`text-sm lg:text-base font-black tracking-tight truncate ${item.label === "Enrollment Status" ? "text-emerald-500" : item.label === "Cumulative GPA" ? "text-amber-400" : "text-themeText"}`}>
                                {item.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}