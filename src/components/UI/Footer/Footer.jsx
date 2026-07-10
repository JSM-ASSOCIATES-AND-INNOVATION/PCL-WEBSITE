import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-brand-bg border-t border-brand-border text-brand-text py-8 md:py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-12 mb-8 md:mb-12">
          
          {/* Logo & Info */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
            <Link to="/" className="flex items-center gap-3 md:gap-4 text-brand-text mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-center bg-contain bg-no-repeat brand-crest"></div>
              <div className="flex flex-col leading-none text-left">
                <span className="font-bold tracking-wider text-base md:text-lg">PRUDENTIA</span>
                <span className="text-[10px] md:text-xs tracking-widest opacity-80 mt-1 uppercase">College of Law</span>
              </div>
            </Link>
            <p className="text-brand-muted text-xs md:text-sm leading-relaxed mb-4 md:mb-6">
              Advancing integrated legal education. Where rigorous scholarship meets uncompromising integrity.
            </p>
            <div className="flex justify-center md:justify-start gap-3 md:gap-4">
              <a href="#" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-card border border-brand-border flex items-center justify-center hover:bg-[var(--primary-color)] hover:border-[var(--primary-color)] hover:text-[#050505] transition-colors">
                <FaInstagram size={14} className="md:w-[18px] md:h-[18px]" />
              </a>
              <a href="#" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-card border border-brand-border flex items-center justify-center hover:bg-[var(--primary-color)] hover:border-[var(--primary-color)] hover:text-[#050505] transition-colors">
                <FaWhatsapp size={14} className="md:w-[18px] md:h-[18px]" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 md:col-span-1">
            <h4 className="text-[var(--primary-color)] font-bold uppercase tracking-widest text-[11px] md:text-sm mb-4 md:mb-6 border-b border-brand-border pb-2 inline-block">Quick Links</h4>
            <ul className="flex flex-col gap-2.5 md:gap-3">
              <li><Link to="/" className="text-brand-muted hover:text-[var(--primary-color)] transition-colors text-[11px] md:text-sm">Home</Link></li>
              <li><Link to="/about" className="text-brand-muted hover:text-[var(--primary-color)] transition-colors text-[11px] md:text-sm">About Us</Link></li>
              <li><Link to="/programs" className="text-brand-muted hover:text-[var(--primary-color)] transition-colors text-[11px] md:text-sm">Academics</Link></li>
              <li><Link to="/contact" className="text-brand-muted hover:text-[var(--primary-color)] transition-colors text-[11px] md:text-sm">Contact Admin</Link></li>
              <li><Link to="/apply" className="text-[var(--primary-color)] font-bold hover:text-white transition-colors text-[11px] md:text-sm">Apply Now ➔</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1 md:col-span-1">
            <h4 className="text-[var(--primary-color)] font-bold uppercase tracking-widest text-[11px] md:text-sm mb-4 md:mb-6 border-b border-brand-border pb-2 inline-block">Legal</h4>
            <ul className="flex flex-col gap-2.5 md:gap-3">
              <li><Link to="/terms" className="text-brand-muted hover:text-[var(--primary-color)] transition-colors text-[11px] md:text-sm">Terms & Conds</Link></li>
              <li><Link to="/privacy" className="text-brand-muted hover:text-[var(--primary-color)] transition-colors text-[11px] md:text-sm">Privacy Policy</Link></li>
              <li><a href="#" className="text-brand-muted hover:text-[var(--primary-color)] transition-colors text-[11px] md:text-sm">Non-Discrim</a></li>
              <li><a href="#" className="text-brand-muted hover:text-[var(--primary-color)] transition-colors text-[11px] md:text-sm">Accessibility</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-[var(--primary-color)] font-bold uppercase tracking-widest text-[11px] md:text-sm mb-4 md:mb-6 border-b border-brand-border pb-2 inline-block">Location</h4>
            <p className="text-brand-muted text-[11px] md:text-sm leading-relaxed mb-3 md:mb-4">
              3-23, Gurramguda,<br/>
              Opp Badangpet Municipal Office,<br/>
              Balapur Mandal, R.R. Dist,<br/>
              Hyderabad - 501510
            </p>
            <p className="text-brand-muted text-[11px] md:text-sm">
              <strong className="text-brand-text">Phone:</strong> +91 8599000777<br/>
              <strong className="text-brand-text">Email:</strong> info@prudentiacollegeoflaw.com
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-border pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          <p className="text-brand-muted text-[9px] md:text-xs uppercase tracking-widest text-center md:text-left">
            Copyright © {new Date().getFullYear()} Prudentia College of Law.
          </p>
          <p className="text-brand-muted text-[9px] md:text-xs uppercase tracking-widest text-center md:text-right">
            By <span className="text-[var(--primary-color)] font-bold">JSM Associates & Innovation</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
