import React, { useState } from 'react';
import { translations, Language } from '../translations';
import { signInWithGoogle } from '../services/authService';

interface LoginScreenProps {
    onLogin: () => void;
    onEditorLogin: (email: string, password: string) => Promise<void>;
    language: Language;
    setLanguage: (lang: Language) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onEditorLogin, language, setLanguage }) => {
    const [scanning, setScanning] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showEditorInput, setShowEditorInput] = useState(false);
    const [editorEmail, setEditorEmail] = useState('');
    const [editorPassword, setEditorPassword] = useState('');

    const t = translations[language];

    const handleScan = () => {
        setScanning(true);
        setError(null);
        setTimeout(() => {
            setSuccess(true);
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
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setScanning(false);
            setError(t.login.error);
        }
    };

    const handleEditorSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setScanning(true);
        setError(null);

        try {
            await onEditorLogin(editorEmail, editorPassword);
            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            setScanning(false);
            setError(err?.message || t.login.passError);
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center font-sans text-cyan-400 overflow-hidden">
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306b6d4' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center w-full max-w-md p-10 glass-panel shadow-2xl rounded-sm shadow-cyan-900/20">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500" />

                <div className="absolute top-4 right-4 flex gap-1">
                    {['es', 'en'].map((langCode) => (
                        <button
                            key={langCode}
                            onClick={() => setLanguage(langCode as Language)}
                            className={`text-[9px] font-bold px-2 py-1 border transition-all ${language === langCode ? 'bg-cyan-500 text-black border-cyan-400' : 'text-cyan-700 border-cyan-900 hover:text-cyan-400'}`}
                        >
                            {langCode.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="relative w-32 h-32 mb-8 flex items-center justify-center animate-glitch-skew">
                    <div className="absolute inset-0 border-2 border-cyan-900 rounded-full" />
                    <div className="absolute inset-0 border-t-2 border-cyan-400 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                    <div className="absolute inset-2 border-b-2 border-cyan-600 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.4)] bg-black relative z-10">
                        <img
                            src="https://i.pinimg.com/736x/63/1e/3a/631e3a68228c97963e78381ad11bf3bb.jpg"
                            className="w-full h-full object-cover opacity-80 mix-blend-screen"
                            alt="S.H.I.E.L.D."
                            referrerPolicy="no-referrer"
                        />
                    </div>
                </div>

                <h1 className="text-4xl font-black tracking-[0.2em] mb-1 text-white text-shadow-neon text-center">{t.login.title}</h1>
                <h2 className="text-[10px] font-bold tracking-[0.4em] text-cyan-600 mb-10 text-center uppercase">{t.login.subtitle}</h2>

                <div className="w-full border-x border-cyan-900/30 bg-black/40 p-2 mb-6 h-16 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-scan opacity-10 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent h-1/2 animate-scanline-noise" />

                    {error && <div className="text-red-500 font-bold tracking-widest text-xs animate-pulse">{error}</div>}

                    {!scanning && !success && !error && (
                        <div className="flex flex-col items-center animate-flicker">
                            <p className="text-red-500 font-bold tracking-widest text-[10px] mb-1 border border-red-900 px-2 bg-red-900/10">LOCKED</p>
                            <p className="text-cyan-600 text-[9px]">{t.login.idPrompt}</p>
                        </div>
                    )}

                    {scanning && !success && !error && (
                        <div className="w-full px-4 text-center">
                            <div className="flex justify-between text-[7px] text-cyan-700 mb-1 font-mono uppercase">
                                <span>Enc: AES-256</span>
                                <span>Signal: 89%</span>
                                <span>Port: 443</span>
                            </div>
                            <div className="flex justify-between text-[9px] text-cyan-400 mb-1 font-bold">
                                <span>{Math.random() > 0.5 ? 'SCANNING_RETINA...' : 'SYNCING_DNA...'}</span>
                                <span className="animate-pulse">PROCESSING</span>
                            </div>
                            <div className="w-full h-1 bg-cyan-900/50 relative overflow-hidden">
                                <div className="h-full bg-cyan-400 shadow-[0_0_15px_#06b6d4] animate-[expandWidth_2s_ease-out_forwards]" style={{ width: '0%' }} />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-20 animate-move-light" />
                            </div>
                            <style>{`
                                @keyframes expandWidth { to { width: 100%; } }
                                @keyframes move-light {
                                    0% { transform: translateX(-100%); }
                                    100% { transform: translateX(200%); }
                                }
                            `}</style>
                        </div>
                    )}

                    {success && (
                        <div className="text-emerald-400 font-bold tracking-[0.2em] text-sm animate-pulse text-shadow-neon">
                            {t.login.granted}
                        </div>
                    )}
                </div>

                <div className="w-full space-y-3">
                    <button
                        onClick={handleScan}
                        disabled={scanning || success}
                        className={`w-full py-4 border relative overflow-hidden group transition-all duration-200 ${success ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-cyan-950/30 border-cyan-500 text-cyan-300 hover:bg-cyan-500 hover:text-black'}`}
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                        <span className="relative z-10 font-black tracking-widest text-xs uppercase flex items-center justify-center gap-2">
                            {scanning ? '...' : (success ? 'SYSTEM UNLOCKED' : t.login.scanBtn)}
                        </span>
                    </button>

                    <button
                        onClick={handleGoogleClick}
                        disabled={scanning || success}
                        className="w-full py-3 border border-slate-700 bg-slate-900/50 text-slate-400 text-[10px] font-bold tracking-widest hover:border-white hover:text-white transition-all uppercase"
                    >
                        {t.login.googleBtn}
                    </button>
                </div>

                <div className="mt-8 w-full border-t border-cyan-900/30 pt-4">
                    {!showEditorInput ? (
                        <button
                            onClick={() => setShowEditorInput(true)}
                            className="w-full text-[9px] text-cyan-600 hover:text-cyan-300 transition-colors uppercase tracking-[0.3em]"
                        >
                            {t.login.editorBtn}
                        </button>
                    ) : (
                        <form onSubmit={handleEditorSubmit} className="space-y-3 animate-fade-in">
                            <input
                                type="email"
                                value={editorEmail}
                                onChange={(event) => setEditorEmail(event.target.value)}
                                placeholder="editor@dominio.com"
                                className="w-full bg-black border border-cyan-800 px-3 py-2 text-[11px] text-cyan-200 outline-none focus:border-cyan-500"
                                autoFocus
                                required
                            />
                            <input
                                type="password"
                                value={editorPassword}
                                onChange={(event) => setEditorPassword(event.target.value)}
                                placeholder={t.login.editorPass}
                                className="w-full bg-black border border-cyan-800 px-3 py-2 text-[11px] text-cyan-200 outline-none focus:border-cyan-500"
                                required
                            />
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 bg-cyan-900 text-cyan-200 px-3 py-2 text-[10px] border border-cyan-700 hover:bg-cyan-700 hover:text-white uppercase font-black">
                                    Entrar Editor
                                </button>
                                <button type="button" onClick={() => setShowEditorInput(false)} className="px-3 py-2 text-[10px] border border-slate-700 text-slate-400 hover:text-white hover:border-white uppercase">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="absolute bottom-2 right-4 text-[8px] text-cyan-900 font-mono">SECURE_LINK::AES-256</div>
            </div>
        </div>
    );
};
