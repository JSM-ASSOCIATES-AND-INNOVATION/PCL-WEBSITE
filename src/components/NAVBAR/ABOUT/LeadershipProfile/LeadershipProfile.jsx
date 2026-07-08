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
      <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] text-white">
        <h2>Profile not found.</h2>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="h-screen w-full bg-[#050505] pt-32 pb-40 px-6 md:px-12 flex justify-center font-sans text-white overflow-y-auto overflow-x-hidden">
        
        {/* Background Gradient */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-[#000000] z-0 pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl">
          
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-[#FFBF00] transition-colors mb-12 uppercase tracking-widest text-sm font-semibold"
          >
            <ArrowLeft size={18} /> Back to About
          </button>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
            
            {/* Left: Image */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full lg:w-2/5 shrink-0 self-stretch"
            >
              <div className="lg:sticky lg:top-0 lg:h-screen flex flex-col justify-center pb-20 lg:pb-0">
                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] aspect-[3/4] w-full max-w-[400px] mx-auto lg:mx-0 bg-[#0a0a0a]">
                <img 
                  src={profile.image} 
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-full p-8">
                  <h1 className="text-3xl md:text-4xl text-white font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {profile.name}
                  </h1>
                  <p className="text-[#FFBF00] uppercase tracking-widest text-sm md:text-base font-semibold">
                    {profile.title}
                  </p>
                </div>
              </div>
              </div>
            </motion.div>

            {/* Right: Content */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="w-full lg:w-3/5"
            >
              <div className="flex flex-col gap-6">
                <div className="h-1 w-20 bg-[#FFBF00] mb-6" />
                
                <h2 className="text-3xl lg:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Leadership & <span className="text-gray-500">Vision.</span>
                </h2>

                <div className="space-y-6 text-gray-300 text-lg md:text-xl leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {profile.bio.map((paragraph, index) => (
                    <motion.p 
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 + (index * 0.1) }}
                      className="text-justify"
                    >
                      {paragraph}
                    </motion.p>
                  ))}
                  
                  {profile.quote && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                      className="mt-12 mb-20 p-8 rounded-2xl bg-[#FFBF00]/5 border border-[#FFBF00]/20 relative"
                    >
                      <div className="absolute top-4 left-4 text-[#FFBF00]/20 text-6xl font-serif leading-none">"</div>
                      <p className="text-[#FFBF00] text-xl md:text-2xl font-medium italic relative z-10" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {profile.quote}
                      </p>
                      <p className="text-[#FFBF00]/80 mt-4 font-semibold text-right text-sm tracking-widest uppercase relative z-10">
                        {profile.quoteAuthor}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
            
          </div>
        </div>
      </div>
    </>
  );
}
