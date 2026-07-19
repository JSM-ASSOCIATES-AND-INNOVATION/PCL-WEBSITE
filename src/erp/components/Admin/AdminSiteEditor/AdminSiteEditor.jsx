/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { theme } from '../../../theme';
import { supabase } from '../../../LIB/supabase/supabaseClient';

export default function AdminSiteEditor() {
    const [loading, setLoading] = useState(false);
    
    // Hardcoded structure of the website pages and sections for the CMS schema
    const siteStructure = {
        "/": {
            name: "Home Page",
            sections: [
                {
                    id: "hero",
                    name: "Hero Section",
                    fields: [
                        { key: "title", label: "Main Title", type: "text", placeholder: "e.g. Prudentia College of Law" },
                        { key: "subtitle", label: "Subtitle", type: "text", placeholder: "e.g. Forging the legal minds of tomorrow" },
                        { key: "cta_text", label: "Call to Action Text", type: "text", placeholder: "e.g. Explore Programs" }
                    ]
                },
                {
                    id: "about_snippet",
                    name: "About Snippet",
                    fields: [
                        { key: "heading", label: "Heading", type: "text", placeholder: "e.g. Why Choose Us?" },
                        { key: "description", label: "Description", type: "textarea", placeholder: "Short description about the college..." }
                    ]
                }
            ]
        },
        "/about": {
            name: "About Us Page",
            sections: [
                {
                    id: "intro",
                    name: "Introduction",
                    fields: [
                        { key: "title", label: "Page Title", type: "text" },
                        { key: "content", label: "Main Content", type: "textarea" }
                    ]
                }
            ]
        }
    };

    const [selectedPage, setSelectedPage] = useState("/");
    const [selectedSection, setSelectedSection] = useState("hero");
    const [contentData, setContentData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [fetchError, setFetchError] = useState(false);

    useEffect(() => {
        if (selectedPage && selectedSection) {
            fetchContent();
        }
    }, [selectedPage, selectedSection]);

    const fetchContent = async () => {
        setLoading(true);
        setFetchError(false);
        try {
            const { data, error } = await supabase
                .from('website_content')
                .select('content')
                .eq('page_path', selectedPage)
                .eq('section_name', selectedSection)
                .maybeSingle();

            if (error) throw error;
            
            if (data && data.content) {
                setContentData(data.content);
            } else {
                // Reset to empty structure if not found
                const defaultContent = {};
                const fields = siteStructure[selectedPage].sections.find(s => s.id === selectedSection)?.fields || [];
                fields.forEach(f => defaultContent[f.key] = "");
                setContentData(defaultContent);
            }
        } catch (err) {
            console.error("Error fetching content:", err);
            // Likely table doesn't exist yet
            setFetchError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('website_content')
                .upsert({
                    page_path: selectedPage,
                    section_name: selectedSection,
                    content: contentData,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'page_path,section_name' });

            if (error) throw error;
            
            if (window.erpDialog) {
                window.erpDialog.alert("Content saved successfully and is now live on the website!");
            } else {
                alert("Content saved successfully!");
            }
        } catch (err) {
            console.error("Save error:", err);
            if (window.erpDialog) {
                window.erpDialog.alert(`Failed to save content. Ensure database schema is updated. ${err.message}`);
            } else {
                alert("Failed to save content.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleFieldChange = (key, value) => {
        setContentData(prev => ({ ...prev, [key]: value }));
    };

    const currentSectionConfig = siteStructure[selectedPage]?.sections.find(s => s.id === selectedSection);

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in relative z-10 selection:bg-themeElevated">
            
            {/* Header */}
            <div className="bg-themeElevated rounded-themePanel p-6 lg:p-8 relative overflow-hidden border-theme border-themeBorder text-themeText">
                <div className="absolute top-0 right-0 w-64 h-64 lg:w-96 lg:h-96 bg-themeElevated rounded-full lg:-translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 lg:w-64 lg:h-64 bg-fuchsia-500/10 rounded-full lg:translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex items-center gap-4 lg:gap-5">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-globe text-fuchsia-500 text-2xl lg:text-3xl"></i>
                        </div>
                        <div>
                            <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-themeText mb-1`}>Site Editor</h1>
                            <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium`}>Manage public website content directly from the ERP.</p>
                        </div>
                    </div>
                </div>
            </div>

            {fetchError && (
                <div className="bg-rose-500/10 border-l-4 border-rose-500 p-4 rounded text-rose-500">
                    <p className="font-bold"><i className="fa-solid fa-triangle-exclamation mr-2"></i> Database Error</p>
                    <p className="text-sm mt-1">Failed to fetch content. Ensure that the <code>website_content</code> table has been created using the updated <code>supabase_updates.sql</code> script.</p>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Left Sidebar - Navigation */}
                <div className={`${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-6 w-full lg:w-1/4 h-fit shrink-0`}>
                    <h2 className="text-sm font-black text-themeText mb-4 uppercase tracking-widest">Site Structure</h2>
                    
                    <div className="flex flex-col gap-4">
                        {Object.entries(siteStructure).map(([path, pageConfig]) => (
                            <div key={path} className="flex flex-col gap-1">
                                <div className="text-xs font-bold text-themeTextSec uppercase tracking-wider mb-2 pl-2 border-l-2 border-themeBorderStrong">
                                    {pageConfig.name} <span className="lowercase text-[10px] opacity-50">({path})</span>
                                </div>
                                <div className="flex flex-col gap-1 pl-4">
                                    {pageConfig.sections.map(section => (
                                        <button
                                            key={section.id}
                                            onClick={() => { setSelectedPage(path); setSelectedSection(section.id); }}
                                            className={`text-left px-4 py-2 text-sm rounded-lg transition-colors font-semibold ${selectedPage === path && selectedSection === section.id 
                                                ? 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20' 
                                                : 'text-themeText hover:bg-themeElevated border border-transparent'}`}
                                        >
                                            {section.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Editor Panel */}
                <div className={`${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-6 lg:p-8 flex-1 min-h-[500px] flex flex-col`}>
                    <div className="flex justify-between items-center mb-8 border-b-theme border-themeBorder pb-4">
                        <div>
                            <h2 className="text-xl font-black text-white">{currentSectionConfig?.name}</h2>
                            <p className="text-xs text-themeTextSec font-mono mt-1">Editing content for: {siteStructure[selectedPage]?.name} &gt; {currentSectionConfig?.name}</p>
                        </div>
                        {loading && <i className="fa-solid fa-circle-notch fa-spin text-fuchsia-500 text-xl"></i>}
                    </div>

                    <div className="flex-1 flex flex-col gap-6">
                        {currentSectionConfig?.fields.map(field => (
                            <div key={field.key}>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 pl-1">
                                    {field.label}
                                </label>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        value={contentData[field.key] || ""}
                                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                        placeholder={field.placeholder || ""}
                                        rows="4"
                                        className="w-full bg-themeElevated border-theme border-themeBorder hover:border-themeBorderStrong focus:border-fuchsia-500 text-themeText rounded-xl px-4 py-3 text-sm font-medium transition-colors outline-none resize-y placeholder:text-themeTextSec"
                                    ></textarea>
                                ) : (
                                    <input
                                        type={field.type}
                                        value={contentData[field.key] || ""}
                                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                        placeholder={field.placeholder || ""}
                                        className="w-full bg-themeElevated border-theme border-themeBorder hover:border-themeBorderStrong focus:border-fuchsia-500 text-themeText rounded-xl px-4 py-3.5 text-sm font-medium transition-colors outline-none placeholder:text-themeTextSec"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t-theme border-themeBorder flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || fetchError}
                            className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(192,38,211,0.3)] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving ? (
                                <><i className="fa-solid fa-circle-notch fa-spin"></i> Publishing...</>
                            ) : (
                                <><i className="fa-solid fa-cloud-arrow-up"></i> Publish Changes</>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
