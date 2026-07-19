import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import logo from '../../../../ASSETS/LOGOS/pcl_logo.svg';

export default function Footer() {
  return (
    <footer className="relative bg-[#050505] text-white overflow-hidden border-t border-white/10 pt-16 pb-8">
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-[var(--primary-glow)] rounded-[100%] blur-[120px] opacity-[0.04] pointer-events-none z-0" />

      <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-4">
            <Link to="/" className="flex items-center gap-4 mb-6 group">
              <img src={logo} alt="Prudentia College of Law Logo" className="h-16 w-auto group-hover:scale-105 transition-transform" />
              <div className="flex flex-col">
                <span className="font-bold tracking-[0.2em] text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                  PRUDENTIA
                </span>
                <span className="text-[10px] tracking-[0.3em] uppercase text-[var(--primary-color)] font-bold mt-1">
                  College of Law
                </span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 pr-4">
              Forging analytical minds capable of commanding courtrooms and navigating complex corporate governance. Located in the strategic heart of Hyderabad.
            </p>
            <div className="flex gap-4">
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[var(--primary-color)] hover:border-[var(--primary-color)] text-white hover:text-black transition-all">
                <FaInstagram size={16} />
              </a>
              <a href="#" aria-label="WhatsApp" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[var(--primary-color)] hover:border-[var(--primary-color)] text-white hover:text-black transition-all">
                <FaWhatsapp size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 md:col-span-2 md:col-start-6">
            <h4 className="text-[var(--primary-color)] font-bold uppercase tracking-widest text-[11px] mb-6">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/programs" className="text-gray-400 hover:text-white transition-colors">Academics</Link></li>
              <li><Link to="/campus/facilities" className="text-gray-400 hover:text-white transition-colors">Campus Life</Link></li>
              <li><Link to="/apply" className="text-gray-400 hover:text-white transition-colors">Admissions</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Map Embed */}
          <div className="col-span-1 md:col-span-4 md:col-start-9">
            <h4 className="text-[var(--primary-color)] font-bold uppercase tracking-widest text-[11px] mb-6">
              Find Us
            </h4>
            <div className="w-full h-[200px] rounded-xl overflow-hidden border border-white/10 opacity-80 hover:opacity-100 transition-opacity bg-white/5">
              <iframe 
                title="Prudentia College of Law Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12182.30520634488!2d78.4740613!3d17.385044!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99daeaebd2c7%3A0xae93b78392bafbc2!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1699999999999!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold tracking-widest text-gray-500 uppercase">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
            <p>
              &copy; {new Date().getFullYear()} Prudentia College of Law.
            </p>
            <span className="hidden md:inline text-white/20">|</span>
            <p className="text-[#FFBF00]">
              Powered by JSM Innovation x Prudentia
            </p>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-white/40">v6.0</span>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
