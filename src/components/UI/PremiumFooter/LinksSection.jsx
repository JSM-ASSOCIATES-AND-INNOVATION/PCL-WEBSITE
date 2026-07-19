import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import logo from '../../../ASSETS/LOGOS/pcl_logo.svg';

export default function LinksSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 xl:gap-12 mb-16 relative z-10">
      {/* Brand & Identity */}
      <div className="flex flex-col">
        <Link to="/" className="flex items-center gap-4 mb-6 group w-fit">
          <img 
            src={logo} 
            alt="Prudentia College of Law Logo" 
            className="h-14 lg:h-16 w-auto group-hover:scale-105 transition-transform"
            style={{ filter: "invert(72%) sepia(87%) saturate(1476%) hue-rotate(346deg) brightness(101%) contrast(106%)" }}
          />
          <div className="flex flex-col">
            <span className="font-bold tracking-[0.2em] text-xl lg:text-2xl text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              PRUDENTIA
            </span>
            <span className="text-[9px] lg:text-[10px] tracking-[0.3em] uppercase text-[var(--primary-color)] font-bold mt-1">
              College of Law
            </span>
          </div>
        </Link>
        <p className="text-[var(--text-muted)] text-sm mb-8 leading-relaxed max-w-sm font-medium">
          Forging analytical minds capable of commanding courtrooms and navigating complex corporate governance.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-col">
        <h4 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold mb-6">Navigation</h4>
        <ul className="flex flex-col gap-4">
          <li><Link to="/" className="text-white/80 hover:text-[var(--primary-color)] transition-colors text-sm font-medium">Home</Link></li>
          <li><Link to="/about" className="text-white/80 hover:text-[var(--primary-color)] transition-colors text-sm font-medium">About Us</Link></li>
          <li><Link to="/programs" className="text-white/80 hover:text-[var(--primary-color)] transition-colors text-sm font-medium">Programs</Link></li>
          <li><Link to="/campus/facilities" className="text-white/80 hover:text-[var(--primary-color)] transition-colors text-sm font-medium">Campus Life</Link></li>
          <li><Link to="/blogs" className="text-white/80 hover:text-[var(--primary-color)] transition-colors text-sm font-medium">Blogs</Link></li>
        </ul>
      </div>

      {/* Resources & Legal */}
      <div className="flex flex-col">
        <h4 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold mb-6">Resources</h4>
        <ul className="flex flex-col gap-4">
          <li><Link to="/apply" className="text-white/80 hover:text-[var(--primary-color)] transition-colors text-sm font-medium">Admissions</Link></li>
          <li><Link to="/events" className="text-white/80 hover:text-[var(--primary-color)] transition-colors text-sm font-medium">Events</Link></li>
          <li><Link to="/privacy" className="text-white/80 hover:text-[var(--primary-color)] transition-colors text-sm font-medium">Privacy Policy</Link></li>
          <li><Link to="/terms" className="text-white/80 hover:text-[var(--primary-color)] transition-colors text-sm font-medium">Terms of Service</Link></li>
        </ul>
      </div>

      {/* Social & Contact */}
      <div className="flex flex-col">
        <h4 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold mb-6">Connect</h4>
        <ul className="flex flex-col gap-4 mb-6">
          <li><a href="mailto:info@prudentiacollegeoflaw.com" className="text-white/80 hover:text-[var(--primary-color)] transition-colors text-sm font-medium">info@prudentiacollegeoflaw.com</a></li>
          <li><a href="tel:+918599000777" className="text-white/80 hover:text-[var(--primary-color)] transition-colors text-sm font-medium">+91 8599000777</a></li>
          <li><span className="text-[var(--text-muted)] text-sm font-medium">Hyderabad, India</span></li>
        </ul>

        <div className="flex gap-4">
          <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[var(--primary-color)] hover:text-black hover:border-[var(--primary-color)] transition-all hover:scale-110" aria-label="Instagram">
            <FaInstagram size={18} />
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[var(--primary-color)] hover:text-black hover:border-[var(--primary-color)] transition-all hover:scale-110" aria-label="WhatsApp">
            <FaWhatsapp size={18} />
          </a>
        </div>
      </div>
    </div>
  );
}
