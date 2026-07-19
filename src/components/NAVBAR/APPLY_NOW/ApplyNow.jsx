import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import campusImg from '../../../ASSETS/CAMPUS/pcl_outdoor.webp';
import { useSite } from '../../../CONTEXT/SiteContext';

export default function ApplyNow() {
  const navigate = useNavigate();
  const { isAdmissionsOpen } = useSite();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    program: 'B.A., LL.B. (Hons.)',
    familyInLegal: 'No',
    familyInLegalWho: '',
    marks10th: '',
    marksInter: '',
    examTGLAWCET: '',
    examCLAT: '',
    examOther: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { supabase } = await import('../../../LIB/supabaseClient');
      
      const { error } = await supabase
        .from('admissions_applications')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          program: formData.program,
          family_in_legal: formData.familyInLegal,
          family_in_legal_who: formData.familyInLegalWho,
          marks_10th: formData.marks10th,
          marks_inter: formData.marksInter,
          exam_tglawcet: formData.examTGLAWCET,
          exam_clat: formData.examCLAT,
          exam_other: formData.examOther,
          status: 'pending',
          source: 'website'
        }]);

      if (error) throw error;
      
      setIsSuccess(true);
      setFormData({
        name: '', email: '', phone: '', program: 'B.A., LL.B. (Hons.)',
        familyInLegal: 'No', familyInLegalWho: '', marks10th: '', marksInter: '',
        examTGLAWCET: '', examCLAT: '', examOther: ''
      });
    } catch (err) {
      console.error("Error submitting application:", err);
      alert("There was an error submitting your application. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
      <Navbar />

      <div className="flex flex-col lg:flex-row min-h-screen pt-20">
        
        {/* Left Side: Image & Narrative */}
        <div className="w-full lg:w-5/12 relative hidden lg:flex flex-col justify-end p-12 overflow-hidden h-screen sticky top-0">
          <img 
            src={campusImg} 
            alt="Prudentia Campus" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-1 bg-[var(--primary-color)] mb-6"></div>
            <h1 className="text-4xl md:text-5xl text-white font-bold mb-4 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Shape the <br/><span className="text-[var(--primary-color)]">Future of Law.</span>
            </h1>
            <p className="text-white/80 text-lg leading-relaxed max-w-sm mb-12">
              Join a legacy of rigorous scholarship and uncompromising integrity. Begin your journey at Prudentia College of Law today.
            </p>

            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className="text-[var(--primary-color)] font-bold text-3xl">240</span>
                <span className="text-white/60 text-xs uppercase tracking-widest font-semibold">Phase I Seats</span>
              </div>
              <div className="w-[1px] h-12 bg-white/20 mx-4"></div>
              <div className="flex flex-col">
                <span className="text-[var(--primary-color)] font-bold text-3xl">100%</span>
                <span className="text-white/60 text-xs uppercase tracking-widest font-semibold">Expert Faculty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Application Form */}
        <div className="w-full lg:w-7/12 flex flex-col justify-center p-6 md:p-12 lg:p-20 relative bg-brand-bg">
          
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-brand-muted hover:text-[var(--primary-color)] transition-colors uppercase tracking-widest text-xs font-semibold mb-12 w-fit"
          >
            <div className="p-2 rounded-full border border-brand-border group-hover:border-[var(--primary-color)] transition-colors">
              <ArrowLeft size={14} />
            </div>
            Go Back
          </button>

          <div className="w-full max-w-2xl relative z-10 mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Admissions Application
            </h2>
            <p className="text-brand-muted mb-10">
              Submit your preliminary details. Our admissions team will contact you to guide you through the next steps.
            </p>

            {!isAdmissionsOpen ? (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-10 text-center">
                <AlertCircle size={48} className="text-amber-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-2 text-brand-text" style={{ fontFamily: "'Playfair Display', serif" }}>Admissions Closed</h3>
                <p className="text-brand-text/80">
                  We are not currently accepting new applications for the upcoming academic year. Please check back later or contact our administration office for further details.
                </p>
              </div>
            ) : isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--primary-glow)] border border-[var(--primary-color)] rounded-3xl p-10 text-center"
              >
                <div className="w-20 h-20 bg-[var(--primary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white">
                  <Send size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-brand-text" style={{ fontFamily: "'Playfair Display', serif" }}>Application Received!</h3>
                <p className="text-brand-text/80">
                  Thank you for applying to Prudentia College of Law. We have sent a confirmation email to your address with further instructions.
                </p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="mt-8 px-6 py-2 border border-brand-border rounded-full text-sm font-semibold hover:border-[var(--primary-color)] transition-colors"
                >
                  Submit Another
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold border-b border-brand-border pb-2 text-[var(--primary-color)]">1. Personal Information</h3>
                  
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-widest text-brand-muted mb-2">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-brand-card border border-brand-border rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary-color)] text-brand-text transition-colors"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold uppercase tracking-widest text-brand-muted mb-2">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-brand-card border border-brand-border rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary-color)] text-brand-text transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold uppercase tracking-widest text-brand-muted mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-brand-card border border-brand-border rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary-color)] text-brand-text transition-colors"
                        placeholder="+91 0000000000"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold border-b border-brand-border pb-2 text-[var(--primary-color)]">2. Academic Background</h3>
                  
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-widest text-brand-muted mb-2">Program of Interest</label>
                    <div className="relative">
                      <select 
                        name="program"
                        value={formData.program}
                        onChange={handleChange}
                        className="w-full bg-brand-card border border-brand-border rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary-color)] text-brand-text appearance-none transition-colors"
                      >
                        <option value="B.A., LL.B. (Hons.)">B.A., LL.B. (Hons.) - 5 Years</option>
                        <option value="B.B.A., LL.B. (Hons.)">B.B.A., LL.B. (Hons.) - 5 Years</option>
                        <option value="LL.B. (Hons.)">LL.B. (Hons.) - 3 Years</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-muted">▼</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold uppercase tracking-widest text-brand-muted mb-2">10th Grade Marks / CGPA</label>
                      <input 
                        type="text" 
                        name="marks10th"
                        value={formData.marks10th}
                        onChange={handleChange}
                        className="w-full bg-brand-card border border-brand-border rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary-color)] text-brand-text transition-colors"
                        placeholder="e.g. 9.8 or 92%"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold uppercase tracking-widest text-brand-muted mb-2">Intermediate / 12th Marks (%)</label>
                      <input 
                        type="text" 
                        name="marksInter"
                        value={formData.marksInter}
                        onChange={handleChange}
                        className="w-full bg-brand-card border border-brand-border rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary-color)] text-brand-text transition-colors"
                        placeholder="e.g. 88%"
                      />
                    </div>
                  </div>
                </div>

                {/* Entrance Exams */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold border-b border-brand-border pb-2 text-[var(--primary-color)]">3. Entrance Exams (If Applicable)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold uppercase tracking-widest text-brand-muted mb-2">TG LAWCET Score / Rank</label>
                      <input 
                        type="text" 
                        name="examTGLAWCET"
                        value={formData.examTGLAWCET}
                        onChange={handleChange}
                        className="w-full bg-brand-card border border-brand-border rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary-color)] text-brand-text transition-colors"
                        placeholder="e.g. Rank 450"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold uppercase tracking-widest text-brand-muted mb-2">CLAT Score / Rank</label>
                      <input 
                        type="text" 
                        name="examCLAT"
                        value={formData.examCLAT}
                        onChange={handleChange}
                        className="w-full bg-brand-card border border-brand-border rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary-color)] text-brand-text transition-colors"
                        placeholder="e.g. Rank 1200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-widest text-brand-muted mb-2">Any Other Law Entrance Exam?</label>
                    <input 
                      type="text" 
                      name="examOther"
                      value={formData.examOther}
                      onChange={handleChange}
                      className="w-full bg-brand-card border border-brand-border rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary-color)] text-brand-text transition-colors"
                      placeholder="e.g. LSAT India - Score 80"
                    />
                  </div>
                </div>

                {/* Background Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold border-b border-brand-border pb-2 text-[var(--primary-color)]">4. Background Information</h3>
                  
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-widest text-brand-muted mb-2">Any family members in the Legal Field?</label>
                    <div className="flex gap-6 mt-3 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="familyInLegal" 
                          value="Yes"
                          checked={formData.familyInLegal === 'Yes'}
                          onChange={handleChange}
                          className="accent-[var(--primary-color)]"
                        />
                        <span className="text-brand-text">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="familyInLegal" 
                          value="No"
                          checked={formData.familyInLegal === 'No'}
                          onChange={handleChange}
                          className="accent-[var(--primary-color)]"
                        />
                        <span className="text-brand-text">No</span>
                      </label>
                    </div>

                    {formData.familyInLegal === 'Yes' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <label className="block text-sm font-semibold uppercase tracking-widest text-brand-muted mb-2">If yes, who? (e.g. Father is an Advocate)</label>
                        <input 
                          type="text" 
                          name="familyInLegalWho"
                          value={formData.familyInLegalWho}
                          onChange={handleChange}
                          className="w-full bg-brand-card border border-brand-border rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary-color)] text-brand-text transition-colors"
                          placeholder="Relation and Profession"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full mt-10 bg-[var(--primary-color)] text-white font-bold uppercase tracking-widest py-5 rounded-xl hover:bg-[var(--primary-hover)] transition-all shadow-lg shadow-[var(--primary-glow)] disabled:opacity-70 flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application ➔'}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
