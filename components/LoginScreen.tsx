
import React, { useState } from 'react';
import { translations, Language } from '../translations';
import { signInWithGoogle } from '../services/authService';

interface LoginScreenProps {
  onLogin: () => void;
  onGoogleLogin: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGoogleLogin, language, setLanguage }) => {
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = translations[language];

  const handleScan = () => {
    setScanning(true);
    setError(null);
    // Simulate scan duration
    setTimeout(() => {
      setSuccess(true);
      // Wait a moment after success to transition
      setTimeout(() => {
        onLogin();
      }, 1500);
    }, 2000);
  };

  const handleGoogleClick = async () => {
      try {
        setScanning(true);
        setError(null);
        await signInWithGoogle();
        // The App component will handle the state change via onAuthStateChanged
        setSuccess(true);
        // Note: we don't strictly need to call onGoogleLogin manually if the parent listens to Auth state,
        // but for compatibility with the prop interface, we can leave it or just let the effect handle it.
      } catch (err) {
        console.error(err);
        setScanning(false);
        setError(t.login.error);
      }
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center font-mono text-cyan-400 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-5" 
           style={{backgroundImage: 'linear-gradient(rgba(6,182,212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-cyan-800"></div>
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-cyan-800"></div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-md p-8 border border-cyan-900 bg-slate-900/90 shadow-[0_0_50px_rgba(6,182,212,0.1)] backdrop-blur-sm">
        
        {/* Language Selector */}
        <div className="absolute top-4 right-4 flex gap-2">
            <button 
                onClick={() => setLanguage('es')}
                className={`text-[10px] px-2 py-1 border transition-all ${language === 'es' ? 'bg-cyan-900 text-white border-cyan-400' : 'text-cyan-700 border-cyan-900 hover:text-cyan-400'}`}
            >
                ES
            </button>
            <button 
                onClick={() => setLanguage('en')}
                className={`text-[10px] px-2 py-1 border transition-all ${language === 'en' ? 'bg-cyan-900 text-white border-cyan-400' : 'text-cyan-700 border-cyan-900 hover:text-cyan-400'}`}
            >
                EN
            </button>
        </div>

        {/* Logo */}
        <div className="w-24 h-24 mb-6 border-4 border-cyan-500 rounded-full flex items-center justify-center relative shadow-[0_0_20px_rgba(6,182,212,0.3)] overflow-hidden">
            <div className="absolute inset-2 border border-cyan-800 rounded-full z-10"></div>
            <img 
                src="https://i.pinimg.com/736x/63/1e/3a/631e3a68228c97963e78381ad11bf3bb.jpg"
                className="w-full h-full object-cover opacity-90 relative z-0"
                alt="S.H.I.E.L.D."
            />
        </div>

        {/* Header */}
        <h1 className="text-3xl font-bold tracking-[0.3em] mb-2 text-cyan-200">{t.login.title}</h1>
        <h2 className="text-sm tracking-[0.2em] text-cyan-600 mb-8">{t.login.subtitle}</h2>

        {/* Status Box */}
        <div className="w-full border border-cyan-900 bg-slate-950 p-4 mb-8 relative overflow-hidden h-24 flex items-center justify-center">
            {!scanning && !success && !error && (
                 <div className="text-center animate-pulse">
                    <p className="text-red-500 font-bold tracking-widest text-xs mb-1">{t.login.clearance}</p>
                    <p className="text-cyan-700 text-[10px]">{t.login.idPrompt}</p>
                 </div>
            )}

            {error && (
                <div className="text-center animate-pulse">
                    <p className="text-red-500 font-bold tracking-widest text-xs mb-1">⚠ {error}</p>
                </div>
            )}
            
            {scanning && !success && !error && (
                <div className="w-full flex flex-col items-center">
                    <p className="text-cyan-400 tracking-widest text-xs mb-2 animate-pulse">{t.login.scanning}</p>
                    <div className="w-3/4 h-1 bg-cyan-900 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 animate-[scan_2s_ease-in-out_infinite] w-full origin-left scale-x-0" style={{animationName: 'expandWidth', animationDuration: '2s', animationFillMode: 'forwards'}}></div>
                    </div>
                    {/* Inline style for the one-off animation */}
                    <style>{`
                        @keyframes expandWidth {
                            0% { width: 0%; }
                            100% { width: 100%; }
                        }
                    `}</style>
                </div>
            )}

            {success && (
                <div className="text-center">
                    <p className="text-emerald-400 font-bold tracking-widest text-xs mb-1 border-b border-emerald-900 pb-1">{t.login.granted}</p>
                </div>
            )}
        </div>

        {/* Biometric Button */}
        <button 
            onClick={handleScan}
            disabled={scanning || success}
            className={`
                group relative w-full py-4 px-6 border border-cyan-500 mb-4
                font-bold tracking-widest text-sm transition-all duration-300
                ${success ? 'bg-emerald-900/50 border-emerald-500 text-emerald-300' : 'bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-300'}
                ${scanning ? 'opacity-50 cursor-wait' : ''}
            `}
        >
            <span className="relative z-10">
                {scanning ? '...' : (success ? 'AUTHORIZED' : t.login.scanBtn)}
            </span>
            <div className="absolute inset-0 bg-cyan-400/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
        </button>

        {/* Google Button */}
        <button 
            onClick={handleGoogleClick}
            disabled={scanning || success}
            className={`
                group relative w-full py-3 px-6 border border-slate-600 
                font-bold tracking-widest text-xs transition-all duration-300 flex items-center justify-center gap-3
                ${scanning ? 'opacity-50 cursor-wait' : 'bg-slate-800 hover:bg-slate-700 hover:border-white text-gray-300 hover:text-white'}
            `}
        >
             {/* Simple Google G Icon Mockup */}
             <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
             </svg>
            <span className="relative z-10">
                {t.login.googleBtn}
            </span>
        </button>

        <div className="mt-6 text-[10px] text-cyan-800">
            SECURE CONNECTION // ENCRYPTED: AES-256
        </div>

      </div>
    </div>
  );
};
