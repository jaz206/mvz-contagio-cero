import React, { useState, useEffect } from 'react';
import { translations, Language } from '../translations';

interface IntroSequenceProps {
    language: Language;
    onComplete: () => void;
    playerAlignment: 'ALIVE' | 'ZOMBIE';
}

export const IntroSequence: React.FC<IntroSequenceProps> = ({ language, onComplete, playerAlignment }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [fadeIn, setFadeIn] = useState(true);
    
    // Estado para bloquear clics rápidos (spam click)
    const [isAnimating, setIsAnimating] = useState(false);

    // AHORA LEEMOS LOS SLIDES DIRECTAMENTE DE LAS TRADUCCIONES
    // Esto asegura que las imágenes estén presentes en ambos idiomas
    const slides = translations[language].introSequence;

    const handleNext = () => {
        if (isAnimating) return;

        setIsAnimating(true); 
        setFadeIn(false);     

        setTimeout(() => {
            if (currentIndex < slides.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setFadeIn(true);
                setIsAnimating(false); 
            } else {
                onComplete();
            }
        }, 500);
    };

    const currentSlide = slides[currentIndex];
    if (!currentSlide) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden font-mono">
            
            {/* IMAGEN DE FONDO CON EFECTOS */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
                <div 
                    className="absolute inset-0 bg-no-repeat bg-center transform scale-105 animate-[drift_20s_linear_infinite]"
                    style={{ 
                        backgroundImage: `url('${currentSlide.image}')`,
                        backgroundSize: 'contain', 
                        backgroundColor: '#000'
                    }}
                ></div>
                
                {/* Gradiente inferior */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                
                {/* Efecto de Scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
            </div>

            {/* CONTENIDO DE TEXTO */}
            <div className={`relative z-20 w-full max-w-4xl p-8 mt-auto mb-12 transition-all duration-1000 transform ${fadeIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-px flex-1 bg-cyan-900"></div>
                    <span className="text-cyan-500 text-xs font-bold tracking-[0.3em] uppercase">
                        ARCHIVO: MH0 // SECUENCIA {currentIndex + 1} DE {slides.length}
                    </span>
                    <div className="h-px flex-1 bg-cyan-900"></div>
                </div>

                <p className="text-xl md:text-2xl text-gray-200 leading-relaxed font-bold drop-shadow-lg text-center bg-black/30 p-4 rounded backdrop-blur-sm border border-white/10">
                    "{currentSlide.text}"
                </p>

                <div className="mt-8 flex justify-center">
                    <button 
                        onClick={handleNext}
                        disabled={isAnimating}
                        className={`group relative px-8 py-3 border font-bold tracking-widest transition-all duration-300
                            ${isAnimating 
                                ? 'bg-gray-800 border-gray-600 text-gray-500 cursor-wait' 
                                : 'bg-cyan-900/30 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black'}
                        `}
                    >
                        <span className="relative z-10">
                            {currentIndex === slides.length - 1 ? "INICIAR MISIÓN" : "SIGUIENTE >>"}
                        </span>
                        {!isAnimating && (
                            <div className="absolute inset-0 bg-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 -z-0"></div>
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes drift {
                    0% { transform: scale(1.05); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1.05); }
                }
            `}</style>
        </div>
    );
};