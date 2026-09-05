import { useEffect, useRef, useState } from "react";
import "./otp.css";
import { sendSystemEmail } from '../../lib/EmailService';
import campusImg from '../../../ASSETS/CAMPUS/PCL_CAMPUS.webp';

export default function OTPVerification({ email, onVerify, onLogout }) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [state, setState] = useState("idle"); // idle | loading | success | error | locked
  const inputs = useRef([]);
  const [expectedOtp, setExpectedOtp] = useState('');
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 5;

  const [resendTimer, setResendTimer] = useState(60);
  const [resendCount, setResendCount] = useState(0);
  const [showSentToast, setShowSentToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState('');
  const hasInitialized = useRef(false);

  const generateAndSendOTP = () => {
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    setExpectedOtp(generated);
    
    if (email) {
      sendSystemEmail('ERP_LOGIN_OTP', {
          to_email: email,
          otp: generated
      }).then(() => {
          setShowSentToast(true);
          setTimeout(() => setShowSentToast(false), 3000);
      }).catch(err => {
          console.error("OTP send failed:", err);
          setShowErrorToast('Failed to send OTP. Check backend server.');
          setTimeout(() => setShowErrorToast(''), 4000);
      });
    }
  };

  useEffect(() => {
    if (hasInitialized.current) return;
    if (email) {
      hasInitialized.current = true;
      generateAndSendOTP();
    }
  }, [email]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleResend = () => {
    if (resendTimer > 0 || resendCount >= 1) return;
    setResendCount(prev => prev + 1);
    setResendTimer(60);
    setOtp(["", "", "", ""]);
    inputs.current[0]?.focus();
    setState("idle");
    generateAndSendOTP();
  };

  const value = otp.join("");

  useEffect(() => {
    if (value.length === 4) verify(value);
  }, [value]);

  const verify = async (code) => {
    if (attempts >= MAX_ATTEMPTS) {
      setState("locked");
      return;
    }
    setState("loading");
    await new Promise(r => setTimeout(r, 1200));

    if (code === expectedOtp) {
      setState("success");
      setTimeout(() => {
        if (onVerify) {
           localStorage.setItem('erp_otp_verified', Date.now().toString());
           onVerify();
        }
      }, 1500);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setState("locked");
        setTimeout(() => { if (onLogout) onLogout(); }, 3000);
      } else {
        setState("error");
        setTimeout(() => {
          setOtp(["", "", "", ""]);
          inputs.current[0]?.focus();
          setState("idle");
        }, 900);
      }
    }
  };

  const change = (e, i) => {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 3) inputs.current[i + 1].focus();
  };

  const keyDown = (e, i) => {
    if (e.key === "Backspace" && !otp[i] && i > 0)
      inputs.current[i - 1].focus();
  };

  const paste = (e) => {
    const data = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);

    if (!data) return;
    e.preventDefault();

    const arr = data.split("");
    while (arr.length < 4) arr.push("");
    setOtp(arr);
    if (data.length === 4) {
      inputs.current[3]?.focus();
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-4">
      
      {/* Background Image & Overlay */}
      <div className="fixed inset-0 -z-10">
          <img src={campusImg} alt="Campus Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[var(--bg-color)]/80 backdrop-blur-sm"></div>
      </div>

      <div className="glass-container relative z-10 w-full max-w-sm mx-auto !mt-0 !p-8 md:!p-10 text-[var(--text-color)]">
        
        {/* OTP Sent Toast */}
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-[var(--card-bg)] border border-[var(--primary-color)] text-[var(--primary-color)] px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300 shadow-[0_0_20px_rgba(255,191,0,0.2)] z-50 ${showSentToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          <i className="fa-solid fa-paper-plane mr-2"></i>OTP Sent to Email
        </div>
        
        {/* OTP Error Toast */}
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-rose-500/10 border border-rose-500 text-rose-500 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300 shadow-[0_0_20px_rgba(244,63,94,0.2)] z-50 ${showErrorToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          <i className="fa-solid fa-triangle-exclamation mr-2"></i>{showErrorToast}
        </div>

        <h3 className="text-center font-bold text-2xl font-['Outfit'] tracking-tight mb-8">Verification</h3>

        {state === "success" ? (
          <div className="flex flex-col items-center justify-center py-4">
            <p className="text-[var(--primary-color)] font-bold uppercase tracking-[0.2em] text-[10px] mb-8">Verified Successfully</p>

            <div className="orb relative w-[72px] h-[72px] flex items-center justify-center rounded-full bg-[var(--primary-color)]/20 border-2 border-[var(--primary-color)] shadow-[0_0_20px_rgba(255,191,0,0.5)]">
              <div className="core text-[var(--primary-color)] text-3xl font-black">✓</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            <div className="flex justify-center gap-3 w-full" onPaste={paste}>
              {otp.map((n, i) => (
                <input
                  key={i}
                  ref={el => (inputs.current[i] = el)}
                  value={n}
                  maxLength={1}
                  inputMode="numeric"
                  onChange={(e) => change(e, i)}
                  onKeyDown={(e) => keyDown(e, i)}
                  className="w-12 h-14 md:w-14 md:h-16 text-center text-xl md:text-2xl font-black bg-black/5 dark:bg-white/10 backdrop-blur-md border border-[var(--card-border)] focus:border-[var(--primary-color)] outline-none rounded-xl transition-all shadow-inner text-[var(--text-color)]"
                />
              ))}
            </div>

            <div className="h-10 flex items-center justify-center mt-6 w-full">
              {state === "loading" && (
                <i className="fa-solid fa-circle-notch fa-spin text-[var(--primary-color)] text-xl"></i>
              )}

              {state === "error" && (
                <span className="text-rose-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                  Invalid code — {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts !== 1 ? 's' : ''} left
                </span>
              )}

              {state === "locked" && (
                <span className="text-rose-500 text-[10px] font-bold uppercase tracking-[0.2em] text-center leading-relaxed">
                  Maximum attempts reached.<br/>Signing out...
                </span>
              )}
            </div>
            
            <div className="flex flex-col items-center mt-6 w-full gap-4 border-t border-[var(--card-border)] pt-6">
              <button 
                onClick={handleResend}
                disabled={resendTimer > 0 || resendCount >= 1}
                className={`tlh-btn w-full justify-center !py-3.5 !text-[10px] tracking-[0.15em] ${(resendTimer > 0 || resendCount >= 1) ? 'opacity-50' : ''}`}
                style={{ pointerEvents: (resendTimer > 0 || resendCount >= 1) ? 'none' : 'auto' }}
              >
                <span className="z-10">
                  {resendCount >= 1 ? 'MAX RESENDS REACHED' : (resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP')}
                </span>
                {resendTimer <= 0 && resendCount < 1 && <i className="fa-solid fa-rotate-right z-10"></i>}
              </button>

              <button 
                onClick={onLogout} 
                className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--text-muted)] hover:text-rose-500 transition-colors mt-2"
              >
                Cancel & Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
