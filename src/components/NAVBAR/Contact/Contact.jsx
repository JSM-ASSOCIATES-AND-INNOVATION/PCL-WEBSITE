import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { supabase } = await import('../../../LIB/supabaseClient');
      
      const { error } = await supabase
        .from('helpdesk_tickets')
        .insert([{
          subject: `Website Inquiry: ${formData.subject || 'General Contact'}`,
          description: `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nMessage:\n${formData.message}`,
          category: 'public_inquiry',
          status: 'Open'
        }]);

      if (error) throw error;
      
      alert('Thank you for reaching out! We will get back to you shortly.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.error("Error submitting contact form:", err);
      alert("There was an error submitting your message. Please try again or email us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-brand-bg text-brand-text pb-20">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-[#000000] z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-[#FFBF00]/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="relative z-20 pt-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-widest text-brand-text mb-6 uppercase"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Get in <span className="text-[#FFBF00]">Touch</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-brand-muted max-w-2xl mx-auto text-lg"
          >
            Reach out to Prudentia College of Law for admissions, campus tours, and general inquiries. Our dedicated administrative team is ready to assist you.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Left Split: Contact Information */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            <h2 className="text-2xl font-bold text-brand-text mb-6 uppercase tracking-wider" style={{ fontFamily: "'Playfair Display', serif" }}>
              Contact Information
            </h2>
            
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 mt-1">
                <MapPin className="text-[#FFBF00]" size={28} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-brand-text mb-1">Campus Address</h4>
                <p className="text-brand-muted leading-relaxed">
                  3-23, Gurramguda, Opp Badangpet Municipal Office, <br className="hidden md:block"/>
                  Balapur Mandal, R.R. Dist, <br className="hidden md:block"/>
                  Hyderabad - Telangana 501510
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 mt-1">
                <Phone className="text-[#FFBF00]" size={28} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-brand-text mb-1">Phone</h4>
                <p className="text-brand-muted leading-relaxed">+91 8599000777</p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 mt-1">
                <Mail className="text-[#FFBF00]" size={28} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-brand-text mb-1">Email</h4>
                <a href="mailto:info@prudentiacollegeoflaw.com" className="text-brand-muted hover:text-[#FFBF00] transition-colors leading-relaxed">
                  info@prudentiacollegeoflaw.com
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 mt-1">
                <Clock className="text-[#FFBF00]" size={28} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-brand-text mb-1">College Timings</h4>
                <p className="text-brand-muted leading-relaxed">Monday – Saturday: 9:00 AM – 4:00 PM</p>
              </div>
            </div>
          </motion.div>

          {/* Right Split: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-brand-card border border-brand-border p-8 rounded-xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFBF00] to-transparent opacity-50"></div>
            
            <h2 className="text-2xl font-bold text-brand-text mb-6 uppercase tracking-wider" style={{ fontFamily: "'Playfair Display', serif" }}>
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm text-brand-muted mb-2">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-[#FFBF00] transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="email" className="block text-sm text-brand-muted mb-2">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-[#FFBF00] transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm text-brand-muted mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-[#FFBF00] transition-colors"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm text-brand-muted mb-2">Subject / Program of Interest</label>
                <select 
                  id="subject" 
                  name="subject" 
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-[#FFBF00] transition-colors appearance-none"
                >
                  <option value="" disabled>Select a subject...</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="BA LLB Admissions">5-Year BA. LL.B Admissions</option>
                  <option value="BBA LLB Admissions">5-Year BBA. LL.B Admissions</option>
                  <option value="LLB Admissions">3-Year LL.B Admissions</option>
                  <option value="Campus Tour">Campus Tour</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm text-brand-muted mb-2">Your Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-[#FFBF00] transition-colors resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 bg-[#FFBF00] hover:bg-[#e5aa00] text-black font-bold uppercase tracking-widest py-4 rounded-lg transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                {!isSubmitting && <Send size={18} />}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Campus Location Map */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-brand-text uppercase tracking-wider" style={{ fontFamily: "'Playfair Display', serif" }}>
              Campus Location
            </h2>
            <a 
              href="https://maps.app.goo.gl/9o12kE43C4Qk5b3x9" 
              target="_blank" 
              rel="noreferrer"
              className="text-sm text-[#FFBF00] hover:text-brand-text transition-colors flex items-center space-x-2 font-bold uppercase tracking-widest"
            >
              <span>Get Directions</span>
              <span className="text-xl leading-none">↗</span>
            </a>
          </div>
          
          <div className="w-full h-[450px] rounded-xl overflow-hidden border border-[#FFBF00]/30 shadow-[0_0_30px_rgba(255,191,0,0.1)] relative group">
            {/* Dark mode filter trick applied to the iframe via CSS filter */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3809.1172608405024!2d78.5303273!3d17.310103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcba332b56e6659%3A0xc3bba4d6731d10ec!2sPrudentia%20College%20of%20Law!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0, opacity: 0.9 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Prudentia College of Law Location Map"
            ></iframe>
            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-xl"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
