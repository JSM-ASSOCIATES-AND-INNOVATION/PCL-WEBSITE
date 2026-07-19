/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { theme } from '../../../theme';
import { supabase } from '../../../lib/supabase/supabaseClient';

export default function AdminSiteEditor({ isHubView = false }) {
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
                        { key: "title1", label: "Main Title Top", type: "text", placeholder: "e.g. Advancing" },
                        { key: "title2", label: "Main Title Bottom", type: "text", placeholder: "e.g. Integrated Legal Education" },
                        { key: "description", label: "Description", type: "textarea", placeholder: "Where rigorous scholarship meets..." },
                        { key: "btn1_text", label: "Primary Button Text", type: "text", placeholder: "e.g. Apply Now" },
                        { key: "btn1_link", label: "Primary Button Link", type: "select", options: [{label: "Apply Page", value: "/apply"}, {label: "Programs", value: "/programs"}, {label: "About Us", value: "/about"}, {label: "Contact", value: "/contact"}] },
                        { key: "btn2_text", label: "Secondary Button Text", type: "text", placeholder: "e.g. Explore Programs" },
                        { key: "btn2_link", label: "Secondary Button Link", type: "select", options: [{label: "Programs", value: "/programs"}, {label: "Campus", value: "/campus/facilities"}, {label: "Admissions", value: "/admissions"}] },
                        { key: "btn3_text", label: "Tertiary Button Text", type: "text", placeholder: "e.g. Campus" },
                        { key: "btn3_link", label: "Tertiary Button Link", type: "select", options: [{label: "Campus", value: "/campus/facilities"}, {label: "About Us", value: "/about"}, {label: "Contact", value: "/contact"}] }
                    ]
                },
                {
                    id: "about_snippet",
                    name: "About Snippet (Philosophy)",
                    fields: [
                        { key: "tagline", label: "Tagline", type: "text", placeholder: "e.g. Our Philosophy" },
                        { key: "heading1", label: "Heading Line 1", type: "text", placeholder: "e.g. Forging Legal" },
                        { key: "heading2", label: "Heading Line 2 (Highlighted)", type: "text", placeholder: "e.g. Excellence." },
                        { key: "description", label: "Description", type: "textarea", placeholder: "Short description about the college..." },
                        { key: "btn_text", label: "Button Text", type: "text", placeholder: "e.g. Explore Our Legacy" },
                        { key: "btn_link", label: "Button Link", type: "select", options: [{label: "About Us", value: "/about"}, {label: "Programs", value: "/programs"}, {label: "Apply Page", value: "/apply"}] }
                    ]
                },
                {
                    id: "academics_snippet",
                    name: "Academics Snippet",
                    fields: [
                        { key: "heading", label: "Heading", type: "text", placeholder: "e.g. Academic Excellence." },
                        { key: "prog1_title", label: "Program 1 Title", type: "text", placeholder: "e.g. BA LL.B" },
                        { key: "prog1_focus", label: "Program 1 Focus (Italic)", type: "text", placeholder: "e.g. Honors" },
                        { key: "prog1_duration", label: "Program 1 Duration Badge", type: "text", placeholder: "e.g. 5-Year Integrated" },
                        { key: "prog1_desc", label: "Program 1 Description", type: "textarea" },
                        { key: "prog1_link", label: "Program 1 Link", type: "select", options: [{label: "BA LLB", value: "/programs/ba-llb"}, {label: "BBA LLB", value: "/programs/bba-llb"}, {label: "LLB", value: "/programs/llb"}] },
                        { key: "prog1_img", label: "Program 1 Image", type: "select", options: [{label: "Classroom 1", value: "classroom1"}, {label: "Classroom 2", value: "classroom2"}, {label: "Classroom 3", value: "classroom3"}, {label: "Entrance", value: "entrance"}, {label: "Outdoor", value: "outdoor"}] },
                        
                        { key: "prog2_title", label: "Program 2 Title", type: "text", placeholder: "e.g. BBA LL.B" },
                        { key: "prog2_focus", label: "Program 2 Focus (Italic)", type: "text", placeholder: "e.g. Honors" },
                        { key: "prog2_duration", label: "Program 2 Duration Badge", type: "text", placeholder: "e.g. 5-Year Corporate" },
                        { key: "prog2_desc", label: "Program 2 Description", type: "textarea" },
                        { key: "prog2_link", label: "Program 2 Link", type: "select", options: [{label: "BA LLB", value: "/programs/ba-llb"}, {label: "BBA LLB", value: "/programs/bba-llb"}, {label: "LLB", value: "/programs/llb"}] },
                        { key: "prog2_img", label: "Program 2 Image", type: "select", options: [{label: "Classroom 1", value: "classroom1"}, {label: "Classroom 2", value: "classroom2"}, {label: "Classroom 3", value: "classroom3"}, {label: "Entrance", value: "entrance"}, {label: "Outdoor", value: "outdoor"}] },
                        
                        { key: "prog3_title", label: "Program 3 Title", type: "text", placeholder: "e.g. LL.B" },
                        { key: "prog3_focus", label: "Program 3 Focus (Italic)", type: "text", placeholder: "e.g. Standard" },
                        { key: "prog3_duration", label: "Program 3 Duration Badge", type: "text", placeholder: "e.g. 3-Year Graduate" },
                        { key: "prog3_desc", label: "Program 3 Description", type: "textarea" },
                        { key: "prog3_link", label: "Program 3 Link", type: "select", options: [{label: "BA LLB", value: "/programs/ba-llb"}, {label: "BBA LLB", value: "/programs/bba-llb"}, {label: "LLB", value: "/programs/llb"}] },
                        { key: "prog3_img", label: "Program 3 Image", type: "select", options: [{label: "Classroom 1", value: "classroom1"}, {label: "Classroom 2", value: "classroom2"}, {label: "Classroom 3", value: "classroom3"}, {label: "Entrance", value: "entrance"}, {label: "Outdoor", value: "outdoor"}] }
                    ]
                },
                {
                    id: "advantages_snippet",
                    name: "Advantages Snippet",
                    fields: [
                        { key: "hero_img", label: "Hero Image", type: "select", options: [{label: "Justice Statue", value: "justice"}, {label: "Classroom 1", value: "classroom1"}, {label: "Classroom 2", value: "classroom2"}, {label: "Classroom 3", value: "classroom3"}, {label: "Entrance", value: "entrance"}, {label: "Outdoor", value: "outdoor"}] },
                        { key: "tagline", label: "Tagline", type: "text", placeholder: "e.g. Why Prudentia" },
                        { key: "heading1", label: "Heading Line 1", type: "text", placeholder: "e.g. The Prudentia" },
                        { key: "heading2", label: "Heading Line 2 (Highlighted)", type: "text", placeholder: "e.g. Advantage." },
                        { key: "btn_text", label: "Button Text", type: "text", placeholder: "e.g. Explore All Facilities" },
                        { key: "btn_link", label: "Button Link", type: "select", options: [{label: "Facilities", value: "/campus/facilities"}, {label: "About Us", value: "/about"}, {label: "Programs", value: "/programs"}] },
                        
                        { key: "card1_title", label: "Card 1 Title", type: "text", placeholder: "e.g. Industry Integration" },
                        { key: "card1_desc", label: "Card 1 Description", type: "textarea" },
                        { key: "card1_link", label: "Card 1 Link", type: "text", placeholder: "e.g. /campus/facilities/corporate-placements" },
                        
                        { key: "card2_title", label: "Card 2 Title", type: "text", placeholder: "e.g. Practical Training" },
                        { key: "card2_desc", label: "Card 2 Description", type: "textarea" },
                        { key: "card2_link", label: "Card 2 Link", type: "text", placeholder: "e.g. /campus/facilities/moot-court" },

                        { key: "card3_title", label: "Card 3 Title", type: "text", placeholder: "e.g. Legal Aid Clinic" },
                        { key: "card3_desc", label: "Card 3 Description", type: "textarea" },
                        { key: "card3_link", label: "Card 3 Link", type: "text", placeholder: "e.g. /campus/facilities/legal-aid-clinic" },

                        { key: "card4_title", label: "Card 4 Title", type: "text", placeholder: "e.g. Integrated Civil Services" },
                        { key: "card4_desc", label: "Card 4 Description", type: "textarea" },
                        { key: "card4_link", label: "Card 4 Link", type: "text", placeholder: "e.g. /campus/facilities/integrated-coaching" }
                    ]
                },
                {
                    id: "contact_snippet",
                    name: "Contact Metrics Snippet",
                    fields: [
                        { key: "heading_line1", label: "Heading Line 1", type: "text", placeholder: "e.g. Uncompromising" },
                        { key: "heading_highlight", label: "Heading Highlight", type: "text", placeholder: "e.g. Excellence." },
                        { key: "heading_line2", label: "Heading Line 2", type: "text", placeholder: "e.g. Accessible to All." },
                        { key: "description", label: "Description", type: "textarea", placeholder: "Experience world-class legal education..." },
                        { key: "btn_text", label: "Button Text", type: "text", placeholder: "e.g. Apply Now" },
                        { key: "btn_link", label: "Button Link", type: "select", options: [{label: "Apply Page", value: "/apply"}, {label: "Contact", value: "/contact"}] },
                        
                        { key: "metric1_value", label: "Metric 1 Number", type: "text", placeholder: "e.g. 240" },
                        { key: "metric1_label", label: "Metric 1 Label", type: "text", placeholder: "e.g. Elite Phase I Scholars" },
                        
                        { key: "metric2_value", label: "Metric 2 Number", type: "text", placeholder: "e.g. 100" },
                        { key: "metric2_suffix", label: "Metric 2 Suffix", type: "text", placeholder: "e.g. %" },
                        { key: "metric2_label", label: "Metric 2 Label", type: "text", placeholder: "e.g. Distinguished Faculty" },
                        
                        { key: "metric3_value", label: "Metric 3 Number", type: "text", placeholder: "e.g. 1200" },
                        { key: "metric3_suffix", label: "Metric 3 Suffix", type: "text", placeholder: "e.g. +" },
                        { key: "metric3_label", label: "Metric 3 Label", type: "text", placeholder: "e.g. Future Capacity" }
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
                },
                {
                    id: "mission",
                    name: "Mission",
                    fields: [
                        { key: "content", label: "Mission Statement", type: "textarea" }
                    ]
                },
                {
                    id: "vision",
                    name: "Vision",
                    fields: [
                        { key: "content", label: "Vision Statement", type: "textarea" }
                    ]
                },
                {
                    id: "motto",
                    name: "Motto",
                    fields: [
                        { key: "content", label: "College Motto", type: "text" }
                    ]
                }
            ]
        },
        "/programs": {
            name: "Programs Page",
            sections: [
                {
                    id: "intro",
                    name: "Introduction",
                    fields: [
                        { key: "title", label: "Page Title", type: "text" },
                        { key: "content", label: "Description", type: "textarea" }
                    ]
                },
                {
                    id: "admissions",
                    name: "Admissions & Fees",
                    fields: [
                        { key: "title", label: "Section Title", type: "text", placeholder: "e.g. Admissions & Fee Structure" },
                        { key: "subtitle", label: "Quote / Subtitle", type: "textarea", placeholder: "e.g. We are committed to offering quality legal education..." },
                        { key: "state_counselling_desc", label: "State Counselling Description", type: "text", placeholder: "e.g. 80% Seats via TS LAWCET" },
                        { key: "management_desc", label: "Management Quota Description", type: "text", placeholder: "e.g. 20% Seats Direct" },
                        { key: "fee_counselling", label: "Counselling Fee", type: "text", placeholder: "e.g. Rs. 20,000 / yr" },
                        { key: "fee_management", label: "Management Fee Info", type: "textarea", placeholder: "e.g. Fees are subject to incurring expenditure..." },
                        { key: "eligibility_5yr", label: "5-Year Courses Eligibility", type: "textarea", placeholder: "e.g. Pass in Intermediate (10+2) with min 45% marks" },
                        { key: "eligibility_3yr", label: "3-Year Course Eligibility", type: "textarea", placeholder: "e.g. Graduate in any discipline with min 45% marks" }
                    ]
                },
                {
                    id: "documents",
                    name: "Documents Required",
                    fields: [
                        { key: "title", label: "Section Title", type: "text", placeholder: "e.g. Documents Required" },
                        { key: "subtitle", label: "Subtitle", type: "textarea", placeholder: "e.g. Originals and photocopies required at admission." },
                        { key: "doc_list", label: "List of Documents (comma separated)", type: "textarea", placeholder: "e.g. SSC Certificate, Intermediate Certificate, TS LAWCET Hall Ticket..." }
                    ]
                },
                {
                    id: "collaborations",
                    name: "Educational Collaborations",
                    fields: [
                        { key: "title", label: "Section Title", type: "text", placeholder: "e.g. Educational Collaborations" },
                        { key: "subtitle", label: "Focus Title", type: "text", placeholder: "e.g. Career Focus & Coaching" },
                        { key: "description", label: "Description", type: "textarea", placeholder: "e.g. We provide specialized coaching integrated with the curriculum..." },
                        { key: "partner_name", label: "Partner Highlight Name", type: "text", placeholder: "e.g. Sarat Chandra IAS Academy" },
                        { key: "feature1_title", label: "Feature 1 Title", type: "text", placeholder: "e.g. Judicial Orientation" },
                        { key: "feature1_desc", label: "Feature 1 Description", type: "text" },
                        { key: "feature2_title", label: "Feature 2 Title", type: "text", placeholder: "e.g. Civil Services" },
                        { key: "feature2_desc", label: "Feature 2 Description", type: "text" },
                        { key: "feature3_title", label: "Feature 3 Title", type: "text", placeholder: "e.g. Industry Integration" },
                        { key: "feature3_desc", label: "Feature 3 Description", type: "text" }
                    ]
                }
            ]
        },
        "/programs/bba-llb": {
            name: "BBA. LL.B Program",
            sections: [
                {
                    id: "program_details",
                    name: "Program Details",
                    fields: [
                        { key: "badge1", label: "Badge 1", type: "text", placeholder: "e.g. 5 Years Integrated" },
                        { key: "badge2", label: "Badge 2", type: "text", placeholder: "e.g. Undergraduate" },
                        { key: "title", label: "Program Title", type: "text", placeholder: "e.g. BBA. LL.B" },
                        { key: "title_highlight", label: "Title Highlight (Italic)", type: "text", placeholder: "e.g. Honors" },
                        { key: "description", label: "Short Description", type: "textarea" },
                        { key: "overview_text", label: "Program Overview", type: "textarea" },
                        
                        { key: "focus_1", label: "Focus Area 1", type: "text" },
                        { key: "focus_2", label: "Focus Area 2", type: "text" },
                        { key: "focus_3", label: "Focus Area 3", type: "text" },
                        { key: "focus_4", label: "Focus Area 4", type: "text" },
                        { key: "focus_5", label: "Focus Area 5", type: "text" },
                        
                        { key: "curriculum_m1_title", label: "Milestone 1 Title", type: "text", placeholder: "e.g. Years 1 & 2" },
                        { key: "curriculum_m1_badge", label: "Milestone 1 Badge", type: "text", placeholder: "e.g. Foundational" },
                        { key: "curriculum_m1_desc", label: "Milestone 1 Description", type: "textarea" },
                        
                        { key: "curriculum_m2_title", label: "Milestone 2 Title", type: "text", placeholder: "e.g. Years 3 & 4" },
                        { key: "curriculum_m2_badge", label: "Milestone 2 Badge", type: "text", placeholder: "e.g. Core Law & Business" },
                        { key: "curriculum_m2_desc", label: "Milestone 2 Description", type: "textarea" },
                        
                        { key: "curriculum_m3_title", label: "Milestone 3 Title", type: "text", placeholder: "e.g. Year 5" },
                        { key: "curriculum_m3_badge", label: "Milestone 3 Badge", type: "text", placeholder: "e.g. Clinical & Advanced" },
                        { key: "curriculum_m3_desc", label: "Milestone 3 Description", type: "textarea" },

                        { key: "fact_duration", label: "Duration Fact", type: "text" },
                        { key: "fact_eligibility", label: "Eligibility Fact", type: "text" },
                        { key: "fact_mode", label: "Admission Mode Fact", type: "text" }
                    ]
                }
            ]
        },
        "/programs/ba-llb": {
            name: "BA. LL.B Program",
            sections: [
                {
                    id: "program_details",
                    name: "Program Details",
                    fields: [
                        { key: "badge1", label: "Badge 1", type: "text", placeholder: "e.g. 5 Years Integrated" },
                        { key: "badge2", label: "Badge 2", type: "text", placeholder: "e.g. Undergraduate" },
                        { key: "title", label: "Program Title", type: "text", placeholder: "e.g. BA. LL.B" },
                        { key: "title_highlight", label: "Title Highlight (Italic)", type: "text", placeholder: "e.g. Honors" },
                        { key: "description", label: "Short Description", type: "textarea" },
                        { key: "overview_text", label: "Program Overview", type: "textarea" },
                        
                        { key: "focus_1", label: "Focus Area 1", type: "text" },
                        { key: "focus_2", label: "Focus Area 2", type: "text" },
                        { key: "focus_3", label: "Focus Area 3", type: "text" },
                        { key: "focus_4", label: "Focus Area 4", type: "text" },
                        { key: "focus_5", label: "Focus Area 5", type: "text" },
                        
                        { key: "curriculum_m1_title", label: "Milestone 1 Title", type: "text", placeholder: "e.g. Years 1 & 2" },
                        { key: "curriculum_m1_badge", label: "Milestone 1 Badge", type: "text", placeholder: "e.g. Foundational" },
                        { key: "curriculum_m1_desc", label: "Milestone 1 Description", type: "textarea" },
                        
                        { key: "curriculum_m2_title", label: "Milestone 2 Title", type: "text", placeholder: "e.g. Years 3 & 4" },
                        { key: "curriculum_m2_badge", label: "Milestone 2 Badge", type: "text", placeholder: "e.g. Core Law" },
                        { key: "curriculum_m2_desc", label: "Milestone 2 Description", type: "textarea" },
                        
                        { key: "curriculum_m3_title", label: "Milestone 3 Title", type: "text", placeholder: "e.g. Year 5" },
                        { key: "curriculum_m3_badge", label: "Milestone 3 Badge", type: "text", placeholder: "e.g. Clinical & Advanced" },
                        { key: "curriculum_m3_desc", label: "Milestone 3 Description", type: "textarea" },

                        { key: "fact_duration", label: "Duration Fact", type: "text" },
                        { key: "fact_eligibility", label: "Eligibility Fact", type: "text" },
                        { key: "fact_mode", label: "Admission Mode Fact", type: "text" }
                    ]
                }
            ]
        },
        "/programs/llb": {
            name: "LL.B Program",
            sections: [
                {
                    id: "program_details",
                    name: "Program Details",
                    fields: [
                        { key: "badge1", label: "Badge 1", type: "text", placeholder: "e.g. 3 Years Standard" },
                        { key: "badge2", label: "Badge 2", type: "text", placeholder: "e.g. Postgraduate Degree" },
                        { key: "title", label: "Program Title", type: "text", placeholder: "e.g. LL.B" },
                        { key: "title_highlight", label: "Title Highlight (Italic)", type: "text", placeholder: "e.g. Standard" },
                        { key: "description", label: "Short Description", type: "textarea" },
                        { key: "overview_text", label: "Program Overview", type: "textarea" },
                        
                        { key: "focus_1", label: "Focus Area 1", type: "text" },
                        { key: "focus_2", label: "Focus Area 2", type: "text" },
                        { key: "focus_3", label: "Focus Area 3", type: "text" },
                        { key: "focus_4", label: "Focus Area 4", type: "text" },
                        { key: "focus_5", label: "Focus Area 5", type: "text" },
                        
                        { key: "curriculum_m1_title", label: "Milestone 1 Title", type: "text", placeholder: "e.g. Year 1" },
                        { key: "curriculum_m1_badge", label: "Milestone 1 Badge", type: "text", placeholder: "e.g. Substantive Law" },
                        { key: "curriculum_m1_desc", label: "Milestone 1 Description", type: "textarea" },
                        
                        { key: "curriculum_m2_title", label: "Milestone 2 Title", type: "text", placeholder: "e.g. Year 2" },
                        { key: "curriculum_m2_badge", label: "Milestone 2 Badge", type: "text", placeholder: "e.g. Procedural Law" },
                        { key: "curriculum_m2_desc", label: "Milestone 2 Description", type: "textarea" },
                        
                        { key: "curriculum_m3_title", label: "Milestone 3 Title", type: "text", placeholder: "e.g. Year 3" },
                        { key: "curriculum_m3_badge", label: "Milestone 3 Badge", type: "text", placeholder: "e.g. Clinical & Practice" },
                        { key: "curriculum_m3_desc", label: "Milestone 3 Description", type: "textarea" },

                        { key: "fact_duration", label: "Duration Fact", type: "text" },
                        { key: "fact_eligibility", label: "Eligibility Fact", type: "text" },
                        { key: "fact_mode", label: "Admission Mode Fact", type: "text" }
                    ]
                }
            ]
        },
        "/campus/facilities": {
            name: "Campus Facilities",
            sections: [
                {
                    id: "intro",
                    name: "Introduction",
                    fields: [
                        { key: "title", label: "Page Title", type: "text" },
                        { key: "content", label: "Description", type: "textarea" }
                    ]
                }
            ]
        },
        "/contact": {
            name: "Contact Us",
            sections: [
                {
                    id: "contact_main",
                    name: "Main Contact Information",
                    fields: [
                        { key: "heading", label: "Heading Line 1", type: "text", placeholder: "e.g. Get in" },
                        { key: "heading_highlight", label: "Heading Highlight (Italic)", type: "text", placeholder: "e.g. Touch" },
                        { key: "subheading", label: "Subheading/Description", type: "textarea", placeholder: "Reach out to Prudentia..." },
                        { key: "address", label: "Campus Address", type: "textarea", placeholder: "3-23, Gurramguda..." },
                        { key: "phone", label: "Phone Number", type: "text", placeholder: "+91 8599000777" },
                        { key: "email", label: "Email Address", type: "text", placeholder: "info@prudentiacollegeoflaw.com" },
                        { key: "timings", label: "College Timings", type: "text", placeholder: "Monday – Saturday: 9:00 AM – 4:00 PM" }
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
                .select('content_data')
                .eq('page_path', selectedPage)
                .eq('section_id', selectedSection)
                .maybeSingle();

            if (error) {
                throw error;
            } else {
                setContentData(data?.content_data || {});
            }
        } catch (err) {
            console.error("Failed to load section content:", err);
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
                    section_id: selectedSection,
                    content_data: contentData,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'page_path, section_id' });

            if (error) throw error;
            
            if (window.erpDialog) {
                window.erpDialog.alert("Content saved successfully and is now live on the public website.");
            } else {
                window.erpDialog?.alert("Saved successfully!");
            }
        } catch (err) {
            console.error("Save error:", err);
            if (window.erpDialog) {
                window.erpDialog.alert(`Failed to save content. Ensure database schema is updated. ${err.message}`);
            } else {
                window.erpDialog?.alert("Failed to save content.");
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
        <div className={`w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in relative z-10 selection:bg-themeElevated ${isHubView ? 'bg-transparent text-themeText font-sans' : ''}`}>
            
            {/* Header */}
            {!isHubView && (
                <div className={`w-full relative overflow-hidden rounded-[2rem] shadow-2xl p-6 lg:p-8 flex flex-col gap-6 border border-themeBorder bg-gradient-to-r from-themeAccent to-themeAccent/80 mb-6`}>
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-overlay pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 mix-blend-overlay pointer-events-none"></div>

                    <div className="flex items-center gap-4 lg:gap-5 relative z-10 mb-2">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1rem] bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                            <i className="fa-solid fa-globe text-white text-2xl lg:text-3xl drop-shadow-md"></i>
                        </div>
                        <div>
                            <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-white mb-1 drop-shadow-md`}>Site Editor</h1>
                            <p className="text-white/80 text-xs lg:text-sm font-medium tracking-wide">Manage public website content directly from the ERP.</p>
                        </div>
                    </div>
                </div>
            )}

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
                                                ? 'bg-themeAccent/10 text-themeAccent border border-themeAccent/30' 
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
                        {loading && <i className="fa-solid fa-circle-notch fa-spin text-themeAccent text-xl"></i>}
                    </div>

                    <div className="flex-1 flex flex-col gap-6">
                        {currentSectionConfig?.fields.map(field => (
                            <div key={field.key}>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 pl-1">
                                    {field.label}
                                </label>
                                {field.type === 'select' ? (
                                    <select
                                        value={contentData[field.key] || ""}
                                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                        className="w-full bg-themeElevated border-theme border-themeBorder hover:border-themeBorderStrong focus:border-themeAccent focus:ring-1 focus:ring-themeAccent text-themeText rounded-xl px-4 py-3.5 text-sm font-medium transition-all outline-none"
                                    >
                                        <option value="" disabled>Select an option...</option>
                                        {field.options?.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                ) : field.type === 'textarea' ? (
                                    <textarea
                                        value={contentData[field.key] || ""}
                                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                        placeholder={field.placeholder || ""}
                                        maxLength={field.maxLength || 400}
                                        rows="4"
                                        className="w-full bg-themeElevated border-theme border-themeBorder hover:border-themeBorderStrong focus:border-themeAccent focus:ring-1 focus:ring-themeAccent text-themeText rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none resize-y placeholder:text-themeTextSec"
                                    ></textarea>
                                ) : (
                                    <input
                                        type={field.type}
                                        value={contentData[field.key] || ""}
                                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                        placeholder={field.placeholder || ""}
                                        maxLength={field.maxLength || 80}
                                        className="w-full bg-themeElevated border-theme border-themeBorder hover:border-themeBorderStrong focus:border-themeAccent focus:ring-1 focus:ring-themeAccent text-themeText rounded-xl px-4 py-3.5 text-sm font-medium transition-all outline-none placeholder:text-themeTextSec"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t-theme border-themeBorder flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || fetchError}
                            className="bg-themeAccent hover:bg-themeAccent/90 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(var(--theme-accent),0.3)] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
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
