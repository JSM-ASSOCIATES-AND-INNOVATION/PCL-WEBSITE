/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import React, { useState } from 'react';
import { supabase } from '../../LIB/SUPABASE/supabaseClient';

export default function DevSeeder() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleSeed = async () => {
        setLoading(true);
        setStatus('Seeding users... Make sure Email Confirmations are disabled in Supabase!');

        try {
            // 1. STUDENT
            const sRes = await supabase.auth.signUp({ email: '26bbl7020_v2@jsm.edu', password: 'password123' });
            if (sRes.data?.user) {
                await supabase.from('profiles').insert({
                    id: sRes.data.user.id,
                    erp_id: '26BBL7020',
                    full_name: 'Swaroop (Student)',
                    email: '26bbl7020_v2@jsm.edu',
                    role: 'student',
                    academic_batch: 'BBA LLB',
                    questionnaire_completed: true,
                    questionnaire_data: {
                        linkedInProfile: "https://linkedin.com/in/swaroop-student",
                        legalInterest: "Corporate Law",
                        fatherName: "Mr. Sharma",
                        motherName: "Mrs. Sharma",
                        parentOccupation: "Business",
                        pastLegalGenerations: "No",
                        pastLegalGenerationsDetails: "",
                        bloodGroup: "O+",
                        presentAddress: "123 Campus Residency, Block A, City Center",
                        permanentAddress: "456 Heritage Residency, Sector 5, Hometown",
                        sameAsPresentAddress: false,
                        aadharNumber: "123456789012",
                        emergencyContact: "Mr. Sharma (Father)",
                        emergencyPhone: "+91 9876543210"
                    }
                });
            } else if (sRes.error) {
                throw new Error("Student: " + sRes.error.message);
            }

            // 2. FACULTY
            const fRes = await supabase.auth.signUp({ email: 'fac0001_v2@jsm.edu', password: 'password123' });
            if (fRes.data?.user) {
                await supabase.from('profiles').insert({
                    id: fRes.data.user.id,
                    erp_id: 'FAC0001',
                    full_name: 'Prof. Swaroop',
                    email: 'fac0001_v2@jsm.edu',
                    role: 'faculty',
                    questionnaire_completed: true,
                    questionnaire_data: {
                        linkedInProfile: "https://linkedin.com/in/swaroop-faculty",
                        legalInterest: "Constitutional Law",
                        bloodGroup: "A+"
                    }
                });
            }

            // 3. ADMIN
            const aRes = await supabase.auth.signUp({ email: 'adm0001_v2@jsm.edu', password: 'password123' });
            if (aRes.data?.user) {
                await supabase.from('profiles').insert({
                    id: aRes.data.user.id,
                    erp_id: 'ADM0001',
                    full_name: 'Admin Swaroop',
                    email: 'adm0001_v2@jsm.edu',
                    role: 'admin',
                    questionnaire_completed: true,
                    questionnaire_data: {
                        linkedInProfile: "https://linkedin.com/in/swaroop-admin",
                        bloodGroup: "B+"
                    }
                });
            }

            setStatus('Seeding Complete! You can now log in.');
        } catch (err) {
            console.error(err);
            setStatus('Error seeding: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8 p-4 border border-rose-500 rounded-lg bg-black text-center">
            <p className="text-[10px] text-rose-500 mb-2 font-black uppercase tracking-widest">Dev Mode Only</p>
            <p className="text-[9px] text-themeTextSec mb-3">Ensure "Confirm Email" is disabled in Supabase Auth settings before clicking.</p>
            <button 
                onClick={handleSeed} 
                disabled={loading}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-themePanel transition-all text-xs"
            >
                {loading ? 'Seeding...' : 'Fix Auth & Seed Users'}
            </button>
            {status && <p className="text-xs text-green-400 mt-3 font-medium">{status}</p>}
        </div>
    );
}
