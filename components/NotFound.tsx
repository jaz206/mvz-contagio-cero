import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-red-600 font-mono relative overflow-hidden">
            {/* Background Noise */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse pointer-events-none"></div>

            {/* Scanning Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_15px_#ef4444] animate-scanline pointer-events-none"></div>

            <div className="z-10 flex flex-col items-center text-center p-8 border-4 border-red-900 bg-red-950/20 backdrop-blur-md max-w-lg animate-glitch-intense">
                <div className="text-8xl mb-4">404</div>
                <h1 className="text-2xl font-black tracking-[0.3em] mb-2">ERROR: SEÑAL PERDIDA</h1>
                <div className="h-px w-full bg-red-900 mb-6"></div>
                <p className="text-sm text-red-400 mb-8 leading-relaxed font-bold uppercase tracking-widest">
                    Coordenadas no válidas. El sector solicitado ha sido purgado o se encuentra fuera del rango de los satélites de S.H.I.E.L.D.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 border-2 border-red-600 bg-red-600 text-black font-black hover:bg-black hover:text-red-600 transition-all uppercase tracking-tighter"
                    >
                        REESTABLECER ENLACE
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 border-2 border-red-900 text-red-400 font-black hover:bg-red-900 hover:text-white transition-all uppercase tracking-tighter"
                    >
                        VOLVER
                    </button>
                </div>
            </div>

            {/* Decorative bottom text */}
            <div className="absolute bottom-8 text-[9px] tracking-[0.5em] opacity-30">
                PROPERTY_OF_SHIELD_CLASSIFIED_LEVEL_10
            </div>

            <style>{`
                @keyframes glitch-intense {
                    0% { transform: translate(0); }
                    20% { transform: translate(-5px, 2px) skew(5deg); }
                    40% { transform: translate(5px, -2px) skew(-5deg); }
                    60% { transform: translate(-2px, 5px) scale(1.05); }
                    80% { transform: translate(2px, -5px) scale(0.95); }
                    100% { transform: translate(0); }
                }
                .animate-glitch-intense {
                    animation: glitch-intense 0.5s infinite alternate-reverse;
                }
            `}</style>
        </div>
    );
};
