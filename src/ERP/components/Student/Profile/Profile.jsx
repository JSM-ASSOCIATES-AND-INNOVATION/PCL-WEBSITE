import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase/supabaseClient';
import { useERP } from '../../../context/ErpContext';
import QuestionnaireModal from '../../shared/QuestionnaireModal';

export default function Profile() {
    const { userSession } = useERP();
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userSession?.db_id) return;
            const { data, error } = await supabase
                .from('profiles')
                .select('questionnaire_data')
                .eq('id', userSession.db_id)
                .single();
            
            if (!error && data) {
                setProfileData(data.questionnaire_data || null);
            }
            setIsLoading(false);
        };
        fetchProfile();
    }, [userSession]);

    if (isLoading) {
        return (
            <div className="flex-1 min-h-screen p-8 text-white flex flex-col gap-6 animate-pulse">
                <div className="h-32 bg-white/10 rounded-3xl w-full"></div>
                <div className="h-96 bg-white/10 rounded-3xl w-full mt-4"></div>
            </div>
        );
    }

    if (!userSession.questionnaire_completed) {
        return (
            <div className="flex-1 min-h-screen p-6 lg:p-8 flex items-center justify-center relative overflow-hidden bg-themeApp">
                <div className="absolute inset-0 bg-themeAccent/5 z-0"></div>
                <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center gap-6">
                    <i className="fa-solid fa-user-lock text-6xl text-themeAccent"></i>
                    <div>
                        <h1 className="text-3xl font-black text-themeText tracking-tight mb-2">Profile Incomplete</h1>
                        <p className="text-themeTextSec text-sm">You skipped the onboarding questionnaire. You must complete your profile before you can access this page.</p>
                    </div>
                    {/* Render the Questionnaire directly in-page without the modal wrapper overlay so they can just fill it here */}
                    <div className="w-full text-left mt-8 max-h-[70vh] overflow-y-auto no-scrollbar rounded-3xl">
                         <QuestionnaireModal 
                             onComplete={() => window.location.reload()} 
                             onSkip={() => {}} 
                         />
                    </div>
                </div>
            </div>
        );
    }

    // Readonly profile view
    return (
        <div className="flex-1 min-h-screen bg-themeApp p-6 lg:p-8 pb-32">
            <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-fade-in">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 bg-themePanel border-theme border-themeBorderStrong p-8 rounded-[2rem]">
                    <div className="w-24 h-24 rounded-[1.5rem] bg-themeAccent/20 flex items-center justify-center border border-themeAccent/40 shrink-0">
                        {userSession.profile_picture_url ? (
                            <img src={userSession.profile_picture_url} className="w-full h-full object-cover rounded-[1.5rem]" />
                        ) : (
                            <i className="fa-solid fa-user text-4xl text-themeAccent"></i>
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-black text-themeText tracking-tight">{userSession.name}</h1>
                        <p className="text-themeTextSec font-bold tracking-widest uppercase text-[10px] mt-1">{userSession.role} • {userSession.academic_batch}</p>
                        <p className="text-themeTextSec font-mono text-xs mt-2 opacity-70">ERP ID: {userSession.id}</p>
                    </div>
                    <div className="shrink-0 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <i className="fa-solid fa-shield-check"></i> Verified Profile
                    </div>
                </div>

                {/* Details Grid */}
                {profileData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        
                        <div className="bg-white/5 backdrop-blur-[40px] border border-black/5 dark:border-white/10 p-6 rounded-[2rem] flex flex-col gap-6 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest text-themeAccent border-b border-black/5 dark:border-white/10 pb-3"><i className="fa-solid fa-address-card mr-2"></i> Official Details</h3>
                            <div className="flex flex-col gap-4">
                                <div><p className="text-[10px] uppercase text-themeTextSec font-bold tracking-wider">Aadhar Number</p><p className="font-mono text-sm text-themeText opacity-90 mt-1">{profileData.aadharNumber || 'N/A'}</p></div>
                                <div><p className="text-[10px] uppercase text-themeTextSec font-bold tracking-wider">LinkedIn</p><a href={profileData.linkedInProfile} target="_blank" className="font-medium text-sm text-blue-400 mt-1 break-all hover:underline">{profileData.linkedInProfile || 'N/A'}</a></div>
                                <div><p className="text-[10px] uppercase text-themeTextSec font-bold tracking-wider">Legal Interest</p><p className="font-medium text-sm text-themeText opacity-90 mt-1 capitalize">{profileData.legalInterest?.replace('_', ' ') || 'N/A'}</p></div>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-[40px] border border-black/5 dark:border-white/10 p-6 rounded-[2rem] flex flex-col gap-6 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest text-themeAccent border-b border-black/5 dark:border-white/10 pb-3"><i className="fa-solid fa-users mr-2"></i> Family & Emergency</h3>
                            <div className="flex flex-col gap-4">
                                <div><p className="text-[10px] uppercase text-themeTextSec font-bold tracking-wider">Father's Name</p><p className="font-medium text-sm text-themeText opacity-90 mt-1">{profileData.fatherName || 'N/A'}</p></div>
                                <div><p className="text-[10px] uppercase text-themeTextSec font-bold tracking-wider">Mother's Name</p><p className="font-medium text-sm text-themeText opacity-90 mt-1">{profileData.motherName || 'N/A'}</p></div>
                                <div><p className="text-[10px] uppercase text-themeTextSec font-bold tracking-wider">Emergency Contact</p><p className="font-medium text-sm text-themeText opacity-90 mt-1">{profileData.emergencyContact || 'N/A'} - <span className="font-mono text-emerald-400">{profileData.emergencyPhone || 'N/A'}</span></p></div>
                            </div>
                        </div>

                        <div className="md:col-span-2 bg-white/5 backdrop-blur-[40px] border border-black/5 dark:border-white/10 p-6 rounded-[2rem] flex flex-col gap-6 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest text-themeAccent border-b border-black/5 dark:border-white/10 pb-3"><i className="fa-solid fa-map-location-dot mr-2"></i> Addresses</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><p className="text-[10px] uppercase text-themeTextSec font-bold tracking-wider">Present Address</p><p className="font-medium text-sm text-themeText opacity-90 mt-2 leading-relaxed">{profileData.presentAddress || 'N/A'}</p></div>
                                <div><p className="text-[10px] uppercase text-themeTextSec font-bold tracking-wider">Permanent Address</p><p className="font-medium text-sm text-themeText opacity-90 mt-2 leading-relaxed">{profileData.permanentAddress || 'N/A'}</p></div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="text-center p-12 bg-white/5 rounded-3xl border border-black/5 dark:border-white/10 text-themeTextSec">
                        <i className="fa-solid fa-database text-3xl mb-4 opacity-50"></i>
                        <p className="text-sm">Profile data could not be retrieved.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
