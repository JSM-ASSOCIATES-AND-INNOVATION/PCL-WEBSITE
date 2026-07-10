import React, { useEffect } from 'react';
import Navbar from '../NAVBAR/Navbar';
import { ArrowRight } from 'lucide-react';

export default function TermsAndConditions() {
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
            Terms & Conditions of Use
          </h1>
          <p className="text-brand-muted text-lg">Welcome to Prudentia College of Law</p>
        </div>

        <div className="prose prose-invert max-w-none text-brand-text/90 space-y-8">
          
          <section>
            <p>
              These terms and conditions outline the rules and regulations for the use of Prudentia College of Law's website. Prudentia College of Law is located at: 3-23, Gurramguda, Opp Badangpet Municipal Office, Balapur Mandal, R.R. Dist, Hyderabad - Telangana 501510. By accessing this website (www.prudentiacollegeoflaw.com) we assume you accept these terms and conditions in full. Do not continue to use Prudentia College of Law's website if you do not accept all of the terms and conditions stated on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8" style={{ fontFamily: "'Playfair Display', serif" }}>Terminology</h2>
            <p>
              The following terminology applies to these Terms and Conditions, Privacy Statement, and Disclaimer Notice and any or all Agreements: "Client", "You", and "Your" refers to you, the person accessing this website and accepting the College's terms and conditions. "The College", "Ourselves", "We", "Our", and "Us", refers to our College. "Party", "Parties", or "Us", refers to both the Client and ourselves, or either the Client or ourselves. All terms refer to the offer, acceptance, and consideration of payment necessary to undertake the process of our assistance to the Client in the most appropriate manner, whether by formal meetings of a fixed duration, or any other means, for the express purpose of meeting the Client's needs in respect of provision of the College's stated services/products, in accordance with and subject to, prevailing law of India. Any use of the above terminology or other words in the singular, plural, capitalization and/or he/she or they, are taken as interchangeable and therefore as referring to same.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8" style={{ fontFamily: "'Playfair Display', serif" }}>Cookies</h2>
            <p>
              We employ the use of cookies. By using Prudentia College of Law's website you consent to the use of cookies in accordance with Prudentia College of Law's privacy policy. Most modern interactive websites use cookies to enable us to retrieve user details for each visit. Cookies are used in some areas of our site to enable the functionality of this area and ease of use for those people visiting. Some of our affiliate/advertising partners may also use cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8" style={{ fontFamily: "'Playfair Display', serif" }}>License</h2>
            <p>
              Unless otherwise stated, Prudentia College of Law and/or its licensors own the intellectual property rights for all material on www.prudentiacollegeoflaw.com. All intellectual property rights are reserved. You may view and/or print pages from https://www.prudentiacollegeoflaw.com for your own personal use subject to restrictions set in these terms and conditions.
            </p>
            <h3 className="text-xl font-bold text-white mb-3 mt-6">You must not:</h3>
            <ul className="list-disc pl-6 space-y-2 text-brand-muted">
              <li>Republish material from https://www.prudentiacollegeoflaw.com</li>
              <li>Sell, rent, or sub-license material from https://www.prudentiacollegeoflaw.com</li>
              <li>Reproduce, duplicate or copy material from https://www.prudentiacollegeoflaw.com</li>
              <li>Redistribute content from Prudentia College of Law (unless content is specifically made for redistribution).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8" style={{ fontFamily: "'Playfair Display', serif" }}>Links To Third Party Sites / Ad-Servers</h2>
            <p className="mb-4">
              Occasionally, at our discretion, we may include or offer third-party products or services on our website. These third-party sites have separate and independent privacy policies. We, therefore, have no responsibility or liability for the content and activities of these linked sites. Nonetheless, we seek to protect the integrity of our site and welcome any feedback about these sites.
            </p>
            <p className="mb-4">
              We do not provide any personally identifiable information to third-party websites/advertisers/ad-servers without your consent.
            </p>
            <p>
              When we present information to our advertisers to help them understand our audience and confirm the value of advertising on our websites, it is usually in the form of aggregated statistics on traffic to various pages within our sites. If you register with our website, we may, from time to time, contact you about content and features that we believe may be of interest to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8" style={{ fontFamily: "'Playfair Display', serif" }}>What Do We Use Your Information For?</h2>
            <p className="mb-4">Any of the information we collect from you may be used in one of the following ways:</p>
            <ul className="space-y-3">
              <li className="flex gap-3 items-start"><ArrowRight className="text-[var(--primary-color)] mt-1 flex-shrink-0" size={16} /> <span><strong>To personalize your experience</strong> (your information helps us to better respond to your individual needs)</span></li>
              <li className="flex gap-3 items-start"><ArrowRight className="text-[var(--primary-color)] mt-1 flex-shrink-0" size={16} /> <span><strong>To improve our website</strong> (we continually strive to improve our website offerings based on the information and feedback we receive from you)</span></li>
              <li className="flex gap-3 items-start"><ArrowRight className="text-[var(--primary-color)] mt-1 flex-shrink-0" size={16} /> <span><strong>To administer a contest</strong>, promotion, survey or other site feature</span></li>
              <li className="flex gap-3 items-start"><ArrowRight className="text-[var(--primary-color)] mt-1 flex-shrink-0" size={16} /> <span><strong>To operate and improve</strong> our website, products, and services</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8" style={{ fontFamily: "'Playfair Display', serif" }}>Indemnity</h2>
            <p>
              You agree to indemnify, defend, and hold Prudentia College of Law, its officers, directors, employees, and agents, harmless from and against any third-party claims, liabilities, damages, losses, and expenses, including, without limitation, reasonable legal and accounting fees, arising out of or in any way connected with your access to or use of the site, application, services, or content, or your violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8" style={{ fontFamily: "'Playfair Display', serif" }}>Limitation of Liability</h2>
            <p>
              You acknowledge and agree that, to the maximum extent permitted by law, neither Prudentia College of Law nor any other party involved in creating, producing, or delivering the site, application, services, or content will be liable for any incidental, special, exemplary or consequential damages, including lost profits, loss of data or loss of goodwill, service interruption, computer damage or system failure or the cost of substitute products or services, or for any damages for personal or bodily injury or emotional distress arising out of or in connection with these terms or from the use of or inability to use the site, application, services or content, or from any communications, interactions or meetings with other users of the site or services or other persons with whom you communicate or interact as a result of your use of the site or services, whether based on warranty, contract, tort (including negligence), product liability or any other legal theory, and whether or not Prudentia College of Law has been informed of the possibility of such damage, even if a limited remedy set forth herein is found to have failed of its essential purpose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8" style={{ fontFamily: "'Playfair Display', serif" }}>Controlling Law and Jurisdiction</h2>
            <p>
              These Terms and any action related thereto shall be governed by and construed according to the laws of India under the jurisdiction of the High Court of Telangana.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8" style={{ fontFamily: "'Playfair Display', serif" }}>Entire Agreement</h2>
            <p>
              These Terms constitute the entire and exclusive understanding and agreement between Prudentia College of Law and you regarding the Site, Application, Services and Content, and these Terms supersede and replace any and all prior oral or written understandings or agreements between Prudentia College of Law and you regarding the Site, Application, Services and Content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8" style={{ fontFamily: "'Playfair Display', serif" }}>Assignment</h2>
            <p>
              You may not assign or transfer these Terms, by operation of law or otherwise, without Prudentia College of Law's prior written consent from the authorized signatory. Any attempt by you to assign or transfer these Terms, without such consent, will be null and void. Prudentia College of Law may assign or transfer these Terms, at its sole discretion, without restriction. Subject to the foregoing, these Terms will bind and inure to the benefit of the parties, their successors, personal representatives, and permitted assigns.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8" style={{ fontFamily: "'Playfair Display', serif" }}>Notice</h2>
            <p className="mb-4">
              Any notices or other communications permitted or required hereunder, including those regarding modifications to these Terms, will be in writing and given:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-brand-muted">
              <li>by Prudentia College of Law via email (in each case to the address that you provide) or</li>
              <li>by posting to the Site. For notices made by email, the date of receipt will be deemed the date on which such notice is transmitted.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8" style={{ fontFamily: "'Playfair Display', serif" }}>Disclaimer</h2>
            <p className="mb-4">
              To the maximum extent permitted by applicable federal and local laws, we exclude all representations, warranties and conditions relating to our website and the use of this website (including, without limitation, any warranties implied by law in respect of satisfactory quality, fitness for purpose and/or the use of reasonable care and skill). Nothing in this disclaimer will:
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex gap-3 items-start"><ArrowRight className="text-[var(--primary-color)] mt-1 flex-shrink-0" size={16} /> <span>Limit or exclude our or your liability for death or personal injury resulting from negligence;</span></li>
              <li className="flex gap-3 items-start"><ArrowRight className="text-[var(--primary-color)] mt-1 flex-shrink-0" size={16} /> <span>Limit or exclude our or your liability for fraud or fraudulent misrepresentation;</span></li>
              <li className="flex gap-3 items-start"><ArrowRight className="text-[var(--primary-color)] mt-1 flex-shrink-0" size={16} /> <span>Limit any of our or your liabilities in any way that is not permitted under applicable law; or</span></li>
              <li className="flex gap-3 items-start"><ArrowRight className="text-[var(--primary-color)] mt-1 flex-shrink-0" size={16} /> <span>Exclude any of our or your liabilities that may not be excluded under applicable law.</span></li>
            </ul>
            <p className="mb-4">
              The limitations and exclusions of liability set out in this Section and elsewhere in this disclaimer: (a) are subject to the preceding paragraph; and (b) govern all liabilities arising under the disclaimer or in relation to the subject matter of this disclaimer, including liabilities arising in contract, in tort (including negligence) and for breach of statutory duty.
            </p>
            <p>
              To the extent that the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8" style={{ fontFamily: "'Playfair Display', serif" }}>General</h2>
            <p>
              The failure of Prudentia College of Law to enforce any right or provision of these Terms will not constitute a waiver of future enforcement of that right or provision. The waiver of any such right or provision will be effective only if in writing and signed by a duly authorized representative of Prudentia College of Law. Except as expressly set forth in these Terms, the exercise by either party of any of its remedies under these Terms will be without prejudice to its other remedies under these Terms or otherwise. If for any reason a court of competent jurisdiction finds any provision of these Terms invalid or unenforceable, that provision will be enforced to the maximum extent permissible and the other provisions of these Terms will remain in full force and effect.
            </p>
          </section>

          <section className="bg-brand-card border border-brand-border rounded-2xl p-8 mt-12">
            <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Contacting Prudentia College of Law</h2>
            <p className="text-brand-muted">
              If you have any questions about these Terms, please contact Prudentia College of Law Administration at <strong>+91 8599000777</strong> or email us at <strong>info@prudentiacollegeoflaw.com</strong>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
