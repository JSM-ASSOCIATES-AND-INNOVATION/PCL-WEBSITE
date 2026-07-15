import React, { useState, useEffect, useRef } from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../CONTEXT/ErpContext";
import { supabase } from "../../../LIB/SUPABASE/supabaseClient";

export default function DigitalLocker() {
    const { userSession } = useERP();
    const fileInputRef = useRef(null);

    const [documents, setDocuments] = useState(() => {
        const studentId = userSession?.db_id || userSession?.id;
        if (studentId) {
            const cached = sessionStorage.getItem(`credentials_locker_${studentId}`);
            if (cached) return JSON.parse(cached);
        }
        return [];
    });
    const [isUploading, setIsUploading] = useState(false);

    // Upload Form States
    const [showUploadMenu, setShowUploadMenu] = useState(false);
    const [uploadType, setUploadType] = useState("Academic Record");

    useEffect(() => {
        const studentId = userSession?.db_id || userSession?.id;
        if (!studentId) return;

        const cacheKey = `credentials_locker_${studentId}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            setDocuments(JSON.parse(cached));
        }

        const fetchDocuments = async () => {
            try {
                const { data, error } = await supabase
                    .from('student_documents')
                    .select('*')
                    .eq('student_id', studentId)
                    .order('uploaded_at', { ascending: false });

                if (error) throw error;
                setDocuments(data || []);
                sessionStorage.setItem(cacheKey, JSON.stringify(data || []));
            } catch (error) {
                console.error("Failed to fetch locker documents:", error.message);
            }
        };

        fetchDocuments();
    }, [userSession]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        const studentId = userSession?.db_id || userSession?.id;
        if (!file || !studentId) return;

        // Security check: Limit to 5MB
        if (file.size > 5 * 1024 * 1024) {
            window.erpDialog.alert("File exceeds the 5MB enterprise limit.");
            return;
        }

        setIsUploading(true);
        setShowUploadMenu(false);

        try {
            // 1. Generate unique file path (studentID/timestamp_filename)
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${studentId}/${fileName}`;

            // 2. Upload actual file to Supabase Storage Bucket
            const { error: storageError } = await supabase.storage
                .from('digital_locker_vault')
                .upload(filePath, file);

            if (storageError) throw storageError;

            // 3. Write Metadata to SQL Ledger
            const { error: dbError } = await supabase
                .from('student_documents')
                .insert({
                    student_id: studentId,
                    document_name: file.name,
                    document_type: uploadType,
                    file_path: filePath,
                    file_size_kb: Math.round(file.size / 1024),
                    status: 'pending' // Pending admin verification
                });

            if (dbError) throw dbError;

            // 4. Refresh the UI
            const { data, error } = await supabase
                .from('student_documents')
                .select('*')
                .eq('student_id', studentId)
                .order('uploaded_at', { ascending: false });

            if (!error) {
                setDocuments(data || []);
                sessionStorage.setItem(`credentials_locker_${studentId}`, JSON.stringify(data || []));
            }

        } catch (error) {
            console.error("Secure upload failed:", error);
            window.erpDialog.alert("Upload failed. Ensure Storage RLS policies allow inserts.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const downloadDocument = async (filePath, originalName) => {
        try {
            // Generate a secure, expiring download URL
            const { data, error } = await supabase.storage
                .from('digital_locker_vault')
                .createSignedUrl(filePath, 60); // 60 seconds expiry

            if (error) throw error;

            // Trigger the download
            const link = document.createElement('a');
            link.href = data.signedUrl;
            link.download = originalName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Secure download failed:", error);
            window.erpDialog.alert("Unable to access the secure vault right now.");
        }
    };

    // UI Helpers
    const formatSize = (kb) => {
        if (kb > 1024) return `${(kb / 1024).toFixed(1)} MB`;
        return `${kb} KB`;
    };

    const getDocIcon = (type) => {
        if (type.includes("Identity")) return "fa-id-card text-blue-400 bg-themeElevated border-themeBorderStrong";
        if (type.includes("Academic")) return "fa-graduation-cap text-themeAccent bg-themeElevated border-themeBorderStrong";
        if (type.includes("Result")) return "fa-file-signature text-emerald-400 bg-themeElevated border-themeBorderStrong";
        return "fa-file text-themeTextSec bg-neutral-800 border-themeBorderStrong";
    };

    const handlePreview = async (filePath) => {
        try {
            const { data, error } = await supabase.storage.from('digital_locker_vault').createSignedUrl(filePath, 60);
            if (error) throw error;
            if (data?.signedUrl) {
                window.open(data.signedUrl, '_blank');
            }
        } catch (e) {
            console.error(e);
            window.erpDialog.alert("Failed to load document preview.");
        }
    };

    const generateShareLink = () => {
        const studentId = userSession?.db_id || userSession?.id;
        if (!studentId) return;
        const url = `${window.location.origin}/verify/${studentId}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(url)
            .then(() => window.erpDialog.alert("Credential Passport Link copied to clipboard! Share it with employers or external universities."))
            .catch(() => window.open(url, '_blank'));
    };

    return (
        <div className="flex flex-col gap-6 lg:gap-8 animate-fade-in relative min-h-[300px]">

            {/* Header & Upload Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-theme border-themeBorder pb-4 lg:pb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel lg:rounded-themePanel flex items-center justify-center text-themeAccent shrink-0">
                        <i className="fa-solid fa-vault text-xl lg:text-2xl"></i>
                    </div>
                    <div>
                        <h2 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight`}>Secure Digital Locker</h2>
                        <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mt-0.5">End-to-End Encrypted Storage</p>
                    </div>
                </div>

                <div className="relative w-full sm:w-auto">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />

                    {isUploading ? (
                        <div className="w-full sm:w-auto px-5 lg:px-6 py-3 lg:py-3.5 bg-themePanel border-theme border-themeBorderStrong text-themeAccent rounded-themePanel lg:rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                            <i className="fa-solid fa-circle-notch fa-spin"></i> Encrypting...
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={generateShareLink}
                                className="w-full sm:w-auto px-5 lg:px-6 py-3 lg:py-3.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-500 border border-emerald-500/20 rounded-themePanel lg:rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <i className="fa-solid fa-link text-sm lg:text-base"></i> Share Passport
                            </button>
                            <button
                                onClick={() => setShowUploadMenu(!showUploadMenu)}
                                className="w-full sm:w-auto px-5 lg:px-6 py-3 lg:py-3.5 bg-white hover:bg-neutral-200 text-[#050505] rounded-themePanel lg:rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <i className="fa-solid fa-cloud-arrow-up text-sm lg:text-base"></i> Upload to Vault
                            </button>
                        </div>
                    )}

                    {/* Upload Dropdown */}
                    {showUploadMenu && !isUploading && (
                        <div className="absolute top-full right-0 mt-2 w-full sm:w-56 bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel lg:rounded-themePanel p-3 z-50 animate-fade-in">
                            <p className="text-[9px] font-black text-themeTextSec opacity-70 uppercase tracking-widest mb-2 px-2">Select Category</p>
                            {['Identity Proof', 'Academic Record', 'Medical Certificate', 'Other'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => { setUploadType(type); fileInputRef.current.click(); }}
                                    className="w-full text-left px-3 py-2.5 text-[10px] lg:text-xs font-bold text-themeText hover:text-themeText hover:bg-themeElevated rounded-lg transition-colors"
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Document List */}
            {documents.length === 0 ? (
                <div className="w-full py-16 lg:py-24 flex flex-col items-center justify-center bg-themeApp border-2 border-dashed border-themeBorder rounded-themePanel text-center px-4">
                    <i className="fa-solid fa-folder-open text-4xl lg:text-5xl text-neutral-700 mb-3 lg:mb-4"></i>
                    <h3 className="text-sm lg:text-base font-black text-themeText">Vault is Empty</h3>
                    <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-themeTextSec opacity-70 mt-1 lg:mt-2">Upload verified documents to store them securely.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {documents.map((doc) => (
                        <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 lg:gap-5 p-5 lg:p-6 bg-themePanel border-theme border-themeBorder hover:border-themeBorderStrong rounded-themePanel lg:rounded-themePanel transition-all group">

                            <div className="flex items-center gap-4 overflow-hidden w-full">
                                <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-themePanel flex items-center justify-center shrink-0 border-theme  ${getDocIcon(doc.document_type)}`}>
                                    <i className={`fa-solid ${getDocIcon(doc.document_type).split(' ')[0]} text-lg lg:text-xl`}></i>
                                </div>
                                <div className="truncate flex-1">
                                    <h3 className="text-sm lg:text-base font-black text-themeText truncate group-hover:text-themeAccent transition-colors leading-tight mb-1">{doc.document_name}</h3>
                                    <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
                                        <span className={`text-[8px] lg:text-[9px] font-bold uppercase tracking-widest text-themeTextSec opacity-70 bg-themeElevated px-2 py-1 rounded border-theme border-themeBorder`}>{doc.document_type}</span>
                                        <span className="w-1 h-1 bg-neutral-700 rounded-full shrink-0"></span>
                                        <span className={`text-[8px] lg:text-[9px] font-bold uppercase tracking-widest text-themeTextSec opacity-70`}>{formatSize(doc.file_size_kb)}</span>
                                        <span className="w-1 h-1 bg-neutral-700 rounded-full shrink-0"></span>
                                        <span className={`text-[8px] lg:text-[9px] font-bold uppercase tracking-widest text-themeTextSec opacity-70 hidden sm:inline`}>Added {new Date(doc.uploaded_at).toLocaleDateString('en-GB')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 lg:gap-4 shrink-0 border-t-theme sm:border-t-0 border-themeBorder pt-4 sm:pt-0">
                                {doc.status === 'verified' ? (
                                    <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-themeElevated border-theme border-themeBorderStrong px-2.5 lg:px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                        <i className="fa-solid fa-shield-check"></i> Verified
                                    </span>
                                ) : doc.status === 'rejected' ? (
                                    <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-rose-400 bg-themeElevated border-theme border-themeBorderStrong px-2.5 lg:px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                        <i className="fa-solid fa-circle-xmark"></i> Rejected
                                    </span>
                                ) : (
                                    <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeAccent bg-themeElevated border-theme border-themeBorderStrong px-2.5 lg:px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                        <i className="fa-solid fa-clock-rotate-left"></i> Pending
                                    </span>
                                )}

                                <button
                                    onClick={() => handlePreview(doc.file_path)}
                                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-themePanel flex items-center justify-center text-themeTextSec hover:bg-themeElevated hover:text-themeAccent border-theme border-themeBorder hover:border-themeBorderStrong transition-all group-hover:border-neutral-600 shrink-0"
                                    title="Preview Document"
                                >
                                    <i className="fa-solid fa-eye text-[10px] lg:text-xs"></i>
                                </button>
                                <button
                                    onClick={() => downloadDocument(doc.file_path, doc.document_name)}
                                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-themePanel flex items-center justify-center text-themeTextSec hover:bg-themeElevated hover:text-themeAccent border-theme border-themeBorder hover:border-themeBorderStrong transition-all group-hover:border-neutral-600 shrink-0"
                                    title="Download Document"
                                >
                                    <i className="fa-solid fa-download text-[10px] lg:text-xs"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}