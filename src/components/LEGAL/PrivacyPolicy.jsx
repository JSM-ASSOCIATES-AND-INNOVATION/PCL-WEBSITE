import React, { useEffect } from 'react';
import Navbar from '../NAVBAR/Navbar';
import { ArrowRight } from 'lucide-react';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
      <Navbar />

      <div className="pt-32 pb-20 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="mb-12 border-b border-brand-border pb-8">
          <div className="w-16 h-1 bg-[var(--primary-color)] mb-6"></div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Privacy Policy
          </h1>
          <p className="text-brand-muted text-lg">Prudentia College of Law</p>
        </div>

        <div className="prose prose-invert max-w-none text-brand-text/90 space-y-8">
          
          <section>
            <p>
              Prudentia College of Law ("Prudentia," "we," "us," or "our") is committed to protecting and respecting your privacy. This Privacy Policy describes the types of information we collect on our website, www.prudentiacollegeoflaw.com, how we use that information, and the choices you have about your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8" style={{ fontFamily: "'Playfair Display', serif" }}>General</h2>
            <p>
              This Website with the URL www.prudentiacollegeoflaw.com ("Website/Site") is operated by Prudentia College of Law ("We/Our/Us"). We collect your personal information and process your personal data in accordance with the IT Act, 2000 (21 of 2000) and other applicable national and state laws relating to the processing of personal data. Please read the following carefully to understand our views and practices regarding your personal data. Our privacy policy is subject to change at any time without notice. To make sure you are aware of any changes, please review this policy periodically. All partner firms and any third parties working with or for us, and who have access to personal information, will be expected to read and comply with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8" style={{ fontFamily: "'Playfair Display', serif" }}>How We Collect Information</h2>
            
            <h3 className="text-xl font-bold text-white mb-3 mt-6">From you directly and through this Site</h3>
            <p className="mb-4">
              We may collect information through the Website when you visit. The data we collect depends on the context of your interactions with our Website.
            </p>
            
            <h3 className="text-xl font-bold text-white mb-3 mt-6">Through business interactions</h3>
            <p className="mb-4">
              We may collect information through business interactions with you.
            </p>
            
            <h3 className="text-xl font-bold text-white mb-3 mt-6">From other sources</h3>
            <p>
              We may receive information from other sources, such as public databases, joint marketing partners, social media platforms, or other third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8" style={{ fontFamily: "'Playfair Display', serif" }}>Information We Collect</h2>
            
            <h3 className="text-xl font-bold text-white mb-3 mt-6">Non-Personally Identifiable Information (Non-PII)</h3>
            <p className="mb-4">
              We collect non-PII through various technologies, including cookies and log files. This may include information such as your browser type, operating system, IP address, the pages you visit on our site, and the time and duration of your visits. We use this information to analyze trends, administer the site, track user movement, and gather broad demographic information for aggregate use.
            </p>
            
            <h3 className="text-xl font-bold text-white mb-3 mt-6">Personally Identifiable Information (PII)</h3>
            <p className="mb-4">
              We only collect PII that you voluntarily provide, such as your name, email address, phone number, and program of interest when you use the "Apply Now", "Contact Us" forms, or similar features. We use this information to respond to your inquiries, process your applications, and provide you with the information or services you request.
            </p>
            
            <h3 className="text-xl font-bold text-white mb-3 mt-6">Automatically Collected Information</h3>
            <p>
              When you visit our Site, some information is automatically collected. This may include information such as the operating system running on your device, Internet Protocol (IP) address, access times, browser type and language, and the website you visited before our Site. We also collect information about how you use our products or services, such as the full Uniform Resource Locators (URL) clickstream to, through, and from our website (including date and time); cookie number; products and/or content you viewed or searched for; page response times; download errors; length of visits to certain pages; page interaction information (such as scrolling, clicks, and mouse-overs).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8" style={{ fontFamily: "'Playfair Display', serif" }}>Use of Information</h2>
            <p className="mb-4">We use the information we collect for the following purposes:</p>
            <ul className="space-y-3">
              <li className="flex gap-3 items-start"><ArrowRight className="text-[var(--primary-color)] mt-1 flex-shrink-0" size={16} /> <span>To operate and improve our website, products, and services;</span></li>
              <li className="flex gap-3 items-start"><ArrowRight className="text-[var(--primary-color)] mt-1 flex-shrink-0" size={16} /> <span>To process applications and admission procedures;</span></li>
              <li className="flex gap-3 items-start"><ArrowRight className="text-[var(--primary-color)] mt-1 flex-shrink-0" size={16} /> <span>To respond to your comments and questions and provide customer service;</span></li>
              <li className="flex gap-3 items-start"><ArrowRight className="text-[var(--primary-color)] mt-1 flex-shrink-0" size={16} /> <span>To personalize your experience on our website;</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8" style={{ fontFamily: "'Playfair Display', serif" }}>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes to our practices or for other operational, legal, or regulatory reasons.
            </p>
          </section>

          <section className="bg-brand-card border border-brand-border rounded-2xl p-8 mt-12">
            <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Contacting Prudentia College of Law</h2>
            <p className="text-brand-muted">
              If you have any questions about this Privacy Policy, please contact our Administration at <strong>+91 8599000777</strong> or email us at <strong>info@prudentiacollegeoflaw.com</strong>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
