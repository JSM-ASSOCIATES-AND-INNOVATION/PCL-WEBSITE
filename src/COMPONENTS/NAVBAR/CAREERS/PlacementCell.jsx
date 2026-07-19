/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ArrowRight, Building, CheckCircle, Mail, Phone, MapPin, Send } from 'lucide-react';
import { supabase } from '../../../LIB/supabaseClient';

const PlacementCell = () => {
    const [formData, setFormData] = useState({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');

        try {
            const { error } = await supabase.from('placement_inquiries').insert([
                {
                    company_name: formData.company_name,
                    contact_person: formData.contact_person,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message,
                    status: 'pending'
                }
            ]);

            if (error) throw error;
            
            // Notify Admin
            const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
            await supabase.from('notices').insert([{
                notice_id: noticeId,
                title: 'New Placement Inquiry',
                category: 'System Alert',
                target_audience: 'admin',
                priority: 'high',
                content: `A new placement inquiry has been submitted by ${formData.company_name} (${formData.contact_person}).`,
                author_name: 'System',
                author_id: null
            }]);

            setIsSuccess(true);
        } catch (err) {
            console.error('Submission error:', err);
            setErrorMsg('Failed to submit your inquiry. Please check your network and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
            {/* Hero Section */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full text-center mb-20 relative z-10"
            >
                <span className="text-[var(--primary-color)] font-bold tracking-[0.2em] uppercase text-sm mb-4 block">
                    Corporate Relations
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-[var(--text-color)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Placement Cell
                </h1>
                <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Connecting exceptional legal minds with industry-leading law firms, corporate houses, and esteemed chambers.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 relative z-10">
                {/* Information Side */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <h2 className="text-3xl font-bold mb-6 text-[var(--text-color)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Partner With Us
                    </h2>
                    <p className="text-[var(--text-muted)] leading-relaxed mb-8" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        The Prudentia Placement Cell is committed to bridging the gap between academia and the professional legal landscape. We invite organizations to participate in our recruitment drives and discover the next generation of legal talent.
                    </p>

                    <div className="space-y-8 mb-12">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-[var(--primary-color)]/10 flex items-center justify-center shrink-0">
                                <Briefcase className="text-[var(--primary-color)]" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[var(--text-color)] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Campus Recruitment</h3>
                                <p className="text-[var(--text-muted)] text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>Host on-campus or virtual recruitment drives tailored to your hiring needs.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-[var(--primary-color)]/10 flex items-center justify-center shrink-0">
                                <Building className="text-[var(--primary-color)]" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[var(--text-color)] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Internship Programs</h3>
                                <p className="text-[var(--text-muted)] text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>Engage our students early through structured summer and winter internship placements.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-[var(--text-color)] mb-4">Contact Placement Office</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                                <Mail size={16} className="text-[var(--primary-color)]" /> placements@prudentiacollege.edu
                            </div>
                            <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                                <Phone size={16} className="text-[var(--primary-color)]" /> +91 98765 43210
                            </div>
                            <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                                <MapPin size={16} className="text-[var(--primary-color)]" /> Placement Cell, Admin Block, PCL Campus
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Form Side */}
                <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    {isSuccess ? (
                        <div className="h-full min-h-[500px] flex flex-col justify-center items-center p-10 rounded-[32px] border border-[var(--primary-color)]/20 bg-[var(--primary-color)]/5 text-center">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[var(--primary-color)] mb-6">
                                <CheckCircle size={80} />
                            </motion.div>
                            <h2 className="text-3xl font-bold mb-4 text-[var(--text-color)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Inquiry Received
                            </h2>
                            <p className="text-[var(--text-muted)] text-lg mb-8" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Thank you for your interest in recruiting at Prudentia. Our placement coordinator will contact you shortly to discuss the next steps.
                            </p>
                            <button 
                                onClick={() => {
                                    setIsSuccess(false);
                                    setFormData({ company_name: '', contact_person: '', email: '', phone: '', message: '' });
                                }}
                                className="px-6 py-3 rounded-full border border-[var(--primary-color)] text-[var(--primary-color)] font-bold text-xs uppercase tracking-widest hover:bg-[var(--primary-color)] hover:text-[#000] transition-colors"
                            >
                                Submit Another Inquiry
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-8 md:p-10 rounded-[32px] border border-[var(--card-border)] bg-[var(--card-bg)] shadow-lg backdrop-blur-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-color)]/10 rounded-full blur-3xl"></div>
                            
                            <h3 className="text-2xl font-bold mb-8 text-[var(--text-color)] relative z-10" style={{ fontFamily: "'Playfair Display', serif" }}>Recruiter Interest Form</h3>
                            
                            <div className="space-y-6 relative z-10">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Company / Firm Name *</label>
                                    <input 
                                        type="text" required name="company_name" value={formData.company_name} onChange={handleChange}
                                        className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)] transition-all"
                                        placeholder="e.g. Legal Associates & Co."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Contact Person *</label>
                                    <input 
                                        type="text" required name="contact_person" value={formData.contact_person} onChange={handleChange}
                                        className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)] transition-all"
                                        placeholder="e.g. Jane Doe"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Email Address *</label>
                                        <input 
                                            type="email" required name="email" value={formData.email} onChange={handleChange}
                                            className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)] transition-all"
                                            placeholder="jane@company.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Phone Number</label>
                                        <input 
                                            type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                            className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)] transition-all"
                                            placeholder="+91..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Message / Requirements *</label>
                                    <textarea 
                                        required name="message" value={formData.message} onChange={handleChange} rows="4"
                                        className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)] transition-all resize-none"
                                        placeholder="Tell us about the roles you are hiring for..."
                                    />
                                </div>

                                {errorMsg && (
                                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                        {errorMsg}
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[var(--text-color)] text-[var(--bg-color)] font-bold text-xs uppercase tracking-widest hover:bg-[var(--primary-color)] hover:text-[#000] transition-colors mt-4 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>Submit Inquiry <Send size={16} /></>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default PlacementCell;
