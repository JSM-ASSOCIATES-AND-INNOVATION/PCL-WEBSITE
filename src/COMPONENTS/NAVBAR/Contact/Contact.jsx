/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, ChevronDown, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../../LIB/supabaseClient';
import { useSiteContent } from '../../../LIB/hooks/useSiteContent';

const SUBJECT_OPTIONS = [
  { value: 'General Inquiry', label: 'General Inquiry' },
  { value: 'BA LLB Admissions', label: '5-Year BA. LL.B Admissions' },
  { value: 'BBA LLB Admissions', label: '5-Year BBA. LL.B Admissions' },
  { value: 'LLB Admissions', label: '3-Year LL.B Admissions' },
  { value: 'Campus Tour', label: 'Campus Tour' }
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+\d][\d\s-]{6,}$/;

export default function Contact() {
  const { content } = useSiteContent('/contact', 'contact_main');
  
  const cms = {
    heading: content?.heading || "Get in",
    heading_highlight: content?.heading_highlight || "Touch",
    subheading: content?.subheading || "Reach out to Prudentia College of Law for admissions, campus tours, and general inquiries. Our dedicated administrative team is ready to assist you.",
    address: content?.address || "3-23, Gurramguda, Opp Badangpet Municipal Office, Balapur Mandal, R.R. Dist, Hyderabad - Telangana 501510",
    phone: content?.phone || "+91 8599000777",
    email: content?.email || "info@prudentiacollegeoflaw.com",
    timings: content?.timings || "Monday – Saturday: 9:00 AM – 4:00 PM"
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Please enter your name.';
    if (!formData.email.trim()) {
      errors.email = 'Please enter your email.';
    } else if (!EMAIL_PATTERN.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (formData.phone.trim() && !PHONE_PATTERN.test(formData.phone.trim())) {
      errors.phone = 'Please enter a valid phone number.';
    }
    if (!formData.message.trim()) errors.message = 'Please enter a message.';
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('helpdesk_tickets')
        .insert([{
          subject: `Website Inquiry: ${formData.subject || 'General Contact'}`,
          description: `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nMessage:\n${formData.message}`,
          category: 'public_inquiry',
          status: 'Open'
        }]);

      if (error) throw error;

      setStatus({ type: 'success', message: 'Thank you for reaching out! We will get back to you shortly.' });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Error submitting your message. Please email us directly.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center bg-[var(--bg-color)] overflow-x-hidden font-sans text-[var(--text-color)] pb-32 transition-colors duration-300">

      <div className="relative z-20 pt-32 md:pt-48 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-widest text-[var(--text-color)] mb-8 uppercase" 
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {cms.heading} <span className="text-[var(--primary-color)] italic pr-2">{cms.heading_highlight}</span>
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }} 
            animate={{ opacity: 1, scaleX: 1 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-[1px] w-32 bg-[var(--primary-color)]/50 mx-auto mb-8 origin-center"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {cms.subheading}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20 mb-32">
          {/* Left Column: Contact Information */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-2 space-y-12"
          >
            <div>
              <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-8 uppercase tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>
                Contact Details
              </h2>
            </div>

            <div className="flex items-start gap-6 group cursor-default">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center group-hover:border-[var(--primary-color)]/50 group-hover:bg-[var(--primary-color)]/10 transition-all duration-300 shadow-md">
                <MapPin className="text-[var(--primary-color)]" size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Campus Address</h4>
                <p className="text-[var(--text-color)] text-lg leading-relaxed font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {cms.address.split(',').map((part, i) => (
                    <React.Fragment key={i}>
                      {part.trim()}{i < cms.address.split(',').length - 1 ? ', ' : ''}
                      {(i === 1 || i === 3) && <br className="hidden md:block" />}
                    </React.Fragment>
                  ))}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6 group cursor-default">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center group-hover:border-[var(--primary-color)]/50 group-hover:bg-[var(--primary-color)]/10 transition-all duration-300 shadow-md">
                <Phone className="text-[var(--primary-color)]" size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Phone</h4>
                <a href={`tel:${cms.phone.replace(/\s+/g, '')}`} className="text-[var(--text-color)] font-medium text-xl hover:text-[var(--primary-color)] transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {cms.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-6 group cursor-default">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center group-hover:border-[var(--primary-color)]/50 group-hover:bg-[var(--primary-color)]/10 transition-all duration-300 shadow-md">
                <Mail className="text-[var(--primary-color)]" size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Email</h4>
                <a href={`mailto:${cms.email}`} className="text-[var(--text-color)] font-medium text-lg hover:text-[var(--primary-color)] transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {cms.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-6 group cursor-default">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center group-hover:border-[var(--primary-color)]/50 group-hover:bg-[var(--primary-color)]/10 transition-all duration-300 shadow-md">
                <Clock className="text-[var(--primary-color)]" size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">College Timings</h4>
                <p className="text-[var(--text-color)] font-medium text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>{cms.timings}</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="lg:col-span-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[32px] p-8 md:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden group hover:border-[var(--primary-color)]/30 hover:shadow-[0_0_40px_var(--primary-glow)] transition-all duration-500"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary-color)] to-transparent opacity-30 group-hover:opacity-70 transition-opacity duration-500"></div>

            <h2 className="text-3xl font-bold text-[var(--text-color)] mb-8 uppercase tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>
              Send Us a Message
            </h2>

            <AnimatePresence mode="wait">
              {status && (
                <motion.div
                  key={status.type}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-start gap-3 rounded-xl px-6 py-4 text-sm font-bold tracking-widest uppercase mb-8 ${
                    status.type === 'success'
                      ? 'bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/40 text-[var(--primary-color)]'
                      : 'bg-red-500/10 border border-red-500/40 text-red-500'
                  }`}
                >
                  {status.type === 'success' ? (
                    <CheckCircle2 className="flex-shrink-0 mt-0.5" size={18} />
                  ) : (
                    <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
                  )}
                  <span>{status.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Full Name <span className="text-[var(--primary-color)]">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full bg-[var(--bg-color)] border rounded-xl px-6 py-4 text-[var(--text-color)] focus:outline-none transition-colors shadow-inner ${
                      fieldErrors.name ? 'border-red-500/60 focus:border-red-500' : 'border-[var(--card-border)] focus:border-[var(--primary-color)]'
                    }`}
                    placeholder="John Doe"
                  />
                  {fieldErrors.name && <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{fieldErrors.name}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full bg-[var(--bg-color)] border rounded-xl px-6 py-4 text-[var(--text-color)] focus:outline-none transition-colors shadow-inner ${
                      fieldErrors.phone ? 'border-red-500/60 focus:border-red-500' : 'border-[var(--card-border)] focus:border-[var(--primary-color)]'
                    }`}
                    placeholder="+91 98765 43210"
                  />
                  {fieldErrors.phone && <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{fieldErrors.phone}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Email Address <span className="text-[var(--primary-color)]">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full bg-[var(--bg-color)] border rounded-xl px-6 py-4 text-[var(--text-color)] focus:outline-none transition-colors shadow-inner ${
                      fieldErrors.email ? 'border-red-500/60 focus:border-red-500' : 'border-[var(--card-border)] focus:border-[var(--primary-color)]'
                    }`}
                    placeholder="john@example.com"
                  />
                  {fieldErrors.email && <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{fieldErrors.email}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="subject" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Inquiry Type</label>
                  <div className="relative">
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-6 py-4 text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)] transition-colors appearance-none cursor-pointer shadow-inner"
                    >
                      <option value="" disabled>Select inquiry type...</option>
                      {SUBJECT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={20} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Message <span className="text-[var(--primary-color)]">*</span></label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className={`w-full bg-[var(--bg-color)] border rounded-xl px-6 py-4 text-[var(--text-color)] focus:outline-none transition-colors resize-none shadow-inner ${
                    fieldErrors.message ? 'border-red-500/60 focus:border-red-500' : 'border-[var(--card-border)] focus:border-[var(--primary-color)]'
                  }`}
                  placeholder="How can we assist you?"
                ></textarea>
                {fieldErrors.message && <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{fieldErrors.message}</span>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-5 rounded-xl font-bold uppercase tracking-widest text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                  isSubmitting 
                  ? 'bg-[var(--card-bg)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--card-border)]'
                  : 'bg-[var(--primary-color)] text-black hover:bg-white shadow-[0_0_30px_rgba(255,191,0,0.3)] hover:scale-[1.02]'
                }`}
              >
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Campus Location Map */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full mb-20"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[var(--text-color)] uppercase tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>
              Our <span className="text-[var(--primary-color)] italic">Location</span>
            </h2>
            <a
              href="https://maps.app.goo.gl/9o12kE43C4Qk5b3x9"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[var(--primary-color)] hover:text-[var(--text-color)] transition-colors flex items-center gap-2 font-bold uppercase tracking-widest border border-[var(--primary-color)] hover:border-[var(--text-color)] px-4 py-2 rounded-full"
            >
              Get Directions <span className="text-lg leading-none">↗</span>
            </a>
          </div>

          <div className="w-full h-[500px] rounded-[32px] overflow-hidden border border-[var(--card-border)] shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative bg-[var(--card-bg)]">
            <iframe
              src="https://maps.google.com/maps?q=Prudentia%20College%20of%20Law,%20Gurramguda,%20Hyderabad&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Prudentia College of Law Location Map"
            ></iframe>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
