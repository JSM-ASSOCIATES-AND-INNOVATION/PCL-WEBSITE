import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import campusImg from '../../../ASSETS/CAMPUS/pcl_outdoor.webp';
import { useSite } from '../../../CONTEXT/SiteContext';
import { supabase } from '../../../LIB/supabaseClient';

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
  const [errorMsg, setErrorMsg] = useState('');

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
    setErrorMsg('');
    
    try {
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
      
      // Notify Admin
      const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
      await supabase.from('notices').insert([{
        notice_id: noticeId,
        title: 'New Admission Application',
        category: 'System Alert',
        target_audience: 'admin',
        priority: 'high',
        content: `A new admission application has been submitted by ${formData.name} for ${formData.program}.`,
        author_name: 'System',
        author_id: null
      }]);

      setIsSuccess(true);
      setFormData({
        name: '', email: '', phone: '', program: 'B.A., LL.B. (Hons.)',
        familyInLegal: 'No', familyInLegalWho: '', marks10th: '', marksInter: '',
        examTGLAWCET: '', examCLAT: '', examOther: ''
      });
    } catch (err) {
      console.error("Error submitting application:", err);
      setErrorMsg("There was an error submitting your application. Please check your network or try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] font-sans">
      <Navbar />

      <div className="flex flex-col lg:flex-row min-h-screen pt-20">
        
        {/* Left Side: Image & Narrative */}
        <div className="w-full lg:w-5/12 relative hidden lg:flex flex-col justify-end p-12 overflow-hidden h-screen sticky top-0">
          <img 
            src={campusImg} 
            alt="Prudentia Campus" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
          <div className="absolute inset-0 bg-[var(--primary-color)] mix-blend-overlay opacity-20"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-1 bg-[var(--primary-color)] mb-6"></div>
            <h1 className="text-4xl md:text-5xl text-white font-extrabold mb-4 leading-tight tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Shape the <br/><span className="text-[var(--primary-color)]">Future of Law.</span>
            </h1>
            <p className="text-white/80 text-lg leading-relaxed max-w-sm mb-12 font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Join a legacy of rigorous scholarship and uncompromising integrity. Begin your journey at Prudentia College of Law today.
            </p>

            <div className="flex gap-6 backdrop-blur-md bg-black/30 p-6 rounded-2xl border border-white/10 w-fit">
              <div className="flex flex-col">
                <span className="text-[var(--primary-color)] font-black text-3xl">240</span>
                <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Phase I Seats</span>
              </div>
              <div className="w-[1px] h-12 bg-white/20 mx-2"></div>
              <div className="flex flex-col">
                <span className="text-[var(--primary-color)] font-black text-3xl">100%</span>
                <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Expert Faculty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Application Form */}
        <div className="w-full lg:w-7/12 flex flex-col justify-center p-6 md:p-12 lg:p-20 relative bg-[var(--bg-color)]">
          
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors uppercase tracking-widest text-[10px] font-black mb-12 w-fit"
          >
            <div className="p-2 rounded-full border border-[var(--card-border)] group-hover:border-[var(--primary-color)] group-hover:bg-[var(--primary-color)]/10 transition-colors">
              <ArrowLeft size={14} />
            </div>
            Go Back
          </button>

          <div className="w-full max-w-2xl relative z-10 mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Admissions <span className="text-[var(--primary-color)]">Portal</span>
            </h2>
            <p className="text-[var(--text-muted)] mb-10 text-lg leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Submit your preliminary details. Our admissions committee will contact you to guide you through the next steps of enrollment.
            </p>

            {!isAdmissionsOpen ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-amber-500/5 border border-amber-500/20 rounded-[32px] p-10 text-center relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
                <AlertCircle size={48} className="text-amber-500 mx-auto mb-6 relative z-10" />
                <h3 className="text-2xl font-bold mb-2 text-[var(--text-color)] relative z-10" style={{ fontFamily: "'Playfair Display', serif" }}>Admissions Closed</h3>
                <p className="text-[var(--text-muted)] relative z-10" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  We are not currently accepting new applications for the upcoming academic year. Please check back later or contact our administration office for further details.
                </p>
              </motion.div>
            ) : isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--primary-color)]/5 border border-[var(--primary-color)]/20 rounded-[32px] p-10 text-center relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-color)]/20 rounded-full blur-3xl"></div>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="w-20 h-20 bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/30 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                  <CheckCircle size={32} />
                </motion.div>
                <h3 className="text-3xl font-extrabold mb-2 text-[var(--text-color)] relative z-10" style={{ fontFamily: "'Playfair Display', serif" }}>Application Received!</h3>
                <p className="text-[var(--text-muted)] text-lg mb-8 relative z-10" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Thank you for applying to Prudentia College of Law. Your application is under review by the admissions committee. You will be contacted shortly via email.
                </p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="px-8 py-4 bg-[var(--text-color)] text-[var(--bg-color)] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[var(--primary-color)] hover:text-[#000] transition-colors relative z-10"
                >
                  Submit Another
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 bg-[var(--card-bg)] p-8 md:p-10 rounded-[32px] border border-[var(--card-border)] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary-color)]/5 rounded-full blur-3xl pointer-events-none"></div>
                
                {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center">
                        {errorMsg}
                    </div>
                )}

                {/* Personal Information */}
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center font-black text-sm">1</div>
                    <h3 className="text-xl font-bold text-[var(--text-color)]" style={{ fontFamily: "'Playfair Display', serif" }}>Personal Information</h3>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Full Name *</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary-color)] text-[var(--text-color)] text-sm font-medium transition-all"
                      placeholder="e.g. Jane Doe"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Email Address *</label>
                      <input 
                        type="email" 
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary-color)] text-[var(--text-color)] text-sm font-medium transition-all"
                        placeholder="jane@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Phone Number *</label>
                      <input 
                        type="tel" 
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary-color)] text-[var(--text-color)] text-sm font-medium transition-all"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-6 relative z-10 pt-6 border-t border-[var(--card-border)]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center font-black text-sm">2</div>
                    <h3 className="text-xl font-bold text-[var(--text-color)]" style={{ fontFamily: "'Playfair Display', serif" }}>Academic Background</h3>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Program of Interest *</label>
                    <div className="relative">
                      <select 
                        name="program"
                        value={formData.program}
                        onChange={handleChange}
                        className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary-color)] text-[var(--text-color)] text-sm font-medium appearance-none transition-all cursor-pointer"
                      >
                        <option value="B.A., LL.B. (Hons.)">B.A., LL.B. (Hons.) - 5 Years</option>
                        <option value="B.B.A., LL.B. (Hons.)">B.B.A., LL.B. (Hons.) - 5 Years</option>
                        <option value="LL.B. (Hons.)">LL.B. (Hons.) - 3 Years</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]"><i className="fa-solid fa-chevron-down"></i></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">10th Grade Marks / CGPA *</label>
                      <input 
                        type="text" 
                        required
                        name="marks10th"
                        value={formData.marks10th}
                        onChange={handleChange}
                        className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary-color)] text-[var(--text-color)] text-sm font-medium transition-all"
                        placeholder="e.g. 9.8 or 92%"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">12th Grade Marks (%) *</label>
                      <input 
                        type="text" 
                        required
                        name="marksInter"
                        value={formData.marksInter}
                        onChange={handleChange}
                        className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary-color)] text-[var(--text-color)] text-sm font-medium transition-all"
                        placeholder="e.g. 88%"
                      />
                    </div>
                  </div>
                </div>

                {/* Entrance Exams */}
                <div className="space-y-6 relative z-10 pt-6 border-t border-[var(--card-border)]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center font-black text-sm">3</div>
                    <h3 className="text-xl font-bold text-[var(--text-color)]" style={{ fontFamily: "'Playfair Display', serif" }}>Entrance Exams (Optional)</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">TG LAWCET Score / Rank</label>
                      <input 
                        type="text" 
                        name="examTGLAWCET"
                        value={formData.examTGLAWCET}
                        onChange={handleChange}
                        className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary-color)] text-[var(--text-color)] text-sm font-medium transition-all"
                        placeholder="e.g. Rank 450"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">CLAT Score / Rank</label>
                      <input 
                        type="text" 
                        name="examCLAT"
                        value={formData.examCLAT}
                        onChange={handleChange}
                        className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary-color)] text-[var(--text-color)] text-sm font-medium transition-all"
                        placeholder="e.g. Rank 1200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Any Other Law Entrance Exam?</label>
                    <input 
                      type="text" 
                      name="examOther"
                      value={formData.examOther}
                      onChange={handleChange}
                      className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary-color)] text-[var(--text-color)] text-sm font-medium transition-all"
                      placeholder="e.g. LSAT India - Score 80"
                    />
                  </div>
                </div>

                {/* Background Information */}
                <div className="space-y-6 relative z-10 pt-6 border-t border-[var(--card-border)]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center font-black text-sm">4</div>
                    <h3 className="text-xl font-bold text-[var(--text-color)]" style={{ fontFamily: "'Playfair Display', serif" }}>Background Information</h3>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Any family members in the Legal Field?</label>
                    <div className="flex gap-6 mt-3 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="familyInLegal" 
                          value="Yes"
                          checked={formData.familyInLegal === 'Yes'}
                          onChange={handleChange}
                          className="accent-[var(--primary-color)] w-4 h-4"
                        />
                        <span className="text-[var(--text-color)] text-sm font-medium">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="familyInLegal" 
                          value="No"
                          checked={formData.familyInLegal === 'No'}
                          onChange={handleChange}
                          className="accent-[var(--primary-color)] w-4 h-4"
                        />
                        <span className="text-[var(--text-color)] text-sm font-medium">No</span>
                      </label>
                    </div>

                    {formData.familyInLegal === 'Yes' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">If yes, who?</label>
                        <input 
                          type="text" 
                          name="familyInLegalWho"
                          value={formData.familyInLegalWho}
                          onChange={handleChange}
                          className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary-color)] text-[var(--text-color)] text-sm font-medium transition-all"
                          placeholder="e.g. Father is an Advocate at High Court"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full mt-10 bg-[var(--text-color)] text-[var(--bg-color)] font-black uppercase tracking-widest py-5 rounded-xl hover:bg-[var(--primary-color)] hover:text-[#000] transition-all shadow-xl disabled:opacity-70 flex items-center justify-center gap-3 text-xs relative z-10"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Submit Application <Send size={16} /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
