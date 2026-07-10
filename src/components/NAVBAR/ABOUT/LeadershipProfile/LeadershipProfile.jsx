import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../../Navbar.jsx';
import founderImg from '../../../../assets/pcl_founder.png';
import coFounderImg from '../../../../assets/pcl_cofounder.png';

const profiles = {
  founder: {
    id: 'founder',
    name: 'Ms. Mula Sneha Goud',
    title: 'Founder & Chairman – Prudentia College of Law',
    image: founderImg,
    bio: [
      "Education is not merely the transfer of knowledge; it is the power to transform lives, communities, and society. Guided by this belief, Ms. Sneha Mula, Founder and Chairman of Prudentia College of Law, envisioned an institution that nurtures not only legal professionals but socially conscious leaders committed to justice.",
      "A distinguished legal academic, researcher, and advocate, Ms. Sneha brings together the rare blend of courtroom experience, academic excellence, and visionary leadership. She completed her B.B.A., LL.B. (Hons.) as a Batch Topper, secured Rank I in LL.M., and qualified UGC-NET and KSET. Her doctoral research focuses on the transformative impact of Artificial Intelligence and Law, reflecting her commitment to preparing legal education for the future. Her academic journey and scholarship span areas including cyber law, privacy, competition law, constitutional values, and emerging technologies. Over the years, Ms. Sneha has served in prestigious institutions across India, including leadership roles as Dean, Head of Department, academic coordinator, mentor, and legal educator. She has trained aspiring lawyers, guided research, introduced academic reforms, organized national competitions, and championed legal awareness and student welfare.",
      "The inspiration behind Prudentia College of Law is deeply personal and purpose-driven. Rooted in values of education, opportunity, and social responsibility, Ms. Sneha envisioned a law college that bridges theory with practice and builds lawyers who combine professional competence with ethics and compassion. Inspired by a lifelong passion for teaching and a commitment to making quality legal education accessible, she sought to create an institution where talent is encouraged, voices are heard, and justice becomes a lived value rather than merely a subject of study. Under her leadership, Prudentia College of Law aspires to become a centre of academic excellence, innovation, advocacy, and public service empowering students to uphold the rule of law and contribute meaningfully to society."
    ],
    quote: "“Law is not merely a profession, it is a responsibility to protect rights, pursue truth, and shape a more just future. Prudentia College of Law was founded not only to teach law but to inspire fearless minds who will question, lead, and leave a mark on society.”",
    quoteAuthor: "- Ms. Sneha Mula"
  },
  'co-founder': {
    id: 'co-founder',
    name: 'Mr. Bharat Krishna Buddala',
    title: 'Co-Founder & Managing Director',
    image: coFounderImg,
    bio: [
      "Mr. Bharat Krishna Buddala is a dynamic education visionary and entrepreneur whose journey reflects determination, global learning, and a deep commitment to empowering young minds. Having completed his MBA from Melbourne, Australia, he gained valuable international exposure, leadership skills, and a broader understanding of how education can transform lives and societies.",
      "While studying and observing educational systems abroad, Mr. Bharat Krishna developed a strong belief that quality education should not be a privilege reserved for a few, but an opportunity accessible to all deserving students. His experiences inspired him to think beyond professional success and focus on creating a meaningful social impact through education. The inspiration to establish Prudentia College of Law emerged from his conviction that law is not merely a profession but a powerful instrument for justice, leadership, and social change. He envisioned a law college that would nurture students into ethical professionals, confident advocates, and responsible citizens capable of making a difference in society.",
      "Mr. Bharat Krishna believes that every student carries untapped potential waiting to be discovered. His vision for Prudentia College of Law is rooted in creating an environment where students are encouraged to dream fearlessly, think critically, and pursue excellence with integrity and compassion. Through Prudentia College of Law, he aspires to build not merely graduates, but future leaders who will uphold justice and contribute meaningfully to society."
    ],
    quote: "\"Education creates opportunity, and law gives that opportunity a voice. Our mission is to empower students to become both successful professionals and responsible changemakers.\"",
    quoteAuthor: "- Mr. Bharat Krishna Buddala"
  }
};

export default function LeadershipProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const profile = profiles[id];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!profile) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-brand-bg text-brand-text">
        <h2>Profile not found.</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans selection:bg-[var(--primary-color)] selection:text-black">
      <Navbar />
      
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(var(--card-border) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10 pt-32 pb-40 px-6 md:px-12 max-w-7xl mx-auto">
        
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-brand-muted hover:text-[var(--primary-color)] transition-colors mb-12 uppercase tracking-widest text-sm font-semibold"
        >
          <div className="p-2 rounded-full border border-brand-border group-hover:border-[var(--primary-color)] transition-colors">
            <ArrowLeft size={16} />
          </div>
          Back to Leadership
        </button>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
          
          {/* Left: Sticky Image */}
          <div className="w-full lg:w-5/12 shrink-0 lg:sticky lg:top-32 relative">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative rounded-3xl overflow-hidden aspect-[4/5] w-full max-w-md mx-auto lg:mx-0 shadow-2xl group"
            >
              <img 
                src={profile.image} 
                alt={profile.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none opacity-90" />
              
              <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 flex flex-col justify-end h-full pointer-events-none">
                <div className="w-12 h-1 bg-[var(--primary-color)] mb-6"></div>
                <h1 className="text-4xl md:text-5xl text-white font-bold mb-3 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {profile.name}
                </h1>
                <p className="text-[var(--primary-color)] uppercase tracking-widest text-sm font-bold">
                  {profile.title}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right: Content */}
          <div className="w-full lg:w-7/12">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="flex flex-col gap-10"
            >
              <h2 className="text-4xl lg:text-6xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Leadership & <span className="text-[var(--primary-color)]">Vision.</span>
              </h2>

              <div className="space-y-8 text-brand-muted text-lg leading-[1.8] font-light">
                {profile.bio.map((paragraph, index) => (
                  <motion.p 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + (index * 0.1) }}
                    className="text-justify first-letter:text-5xl first-letter:font-bold first-letter:text-brand-text first-letter:mr-3 first-letter:float-left first-letter:font-serif"
                  >
                    {paragraph}
                  </motion.p>
                ))}
                
                {profile.quote && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="mt-16 p-10 md:p-12 rounded-3xl bg-brand-card border border-brand-border shadow-xl relative overflow-hidden"
                  >
                    <div className="absolute -top-6 -left-2 text-[var(--primary-color)] opacity-10 text-[150px] font-serif leading-none select-none">"</div>
                    <div className="relative z-10">
                      <p className="text-brand-text text-2xl md:text-3xl font-medium italic leading-relaxed" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {profile.quote}
                      </p>
                      <div className="flex items-center gap-4 mt-8 justify-end">
                        <div className="w-8 h-[1px] bg-[var(--primary-color)]"></div>
                        <p className="text-[var(--primary-color)] font-bold text-sm tracking-widest uppercase">
                          {profile.quoteAuthor.replace('-', '').trim()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
