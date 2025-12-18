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
    const [isAnimating, setIsAnimating] = useState(false);

    const slides = translations[language].introSequence[playerAlignment === 'ZOMBIE' ? 'zombie' : 'alive'];

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

    // Color del tema según bando
    const themeColor = playerAlignment === 'ZOMBIE' ? 'text-lime-400' : 'text-cyan-400';
    const barColor = playerAlignment === 'ZOMBIE' ? 'bg-lime-500' : 'bg-cyan-500';

    return (
        <div className="fixed inset-0 z-[100] bg-black font-mono overflow-hidden select-none">
            
            {/* 1. CAPA DE IMAGEN (FONDO COMPLETO) */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
                <div 
                    className="absolute inset-0 bg-no-repeat bg-center bg-cover animate-[pan_40s_linear_infinite]"
                    style={{ backgroundImage: `url('${currentSlide.image}')` }}
                ></div>
                {/* Scanlines muy sutiles sobre toda la imagen */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 bg-[length:100%_3px,3px_100%] pointer-events-none"></div>
            </div>

            {/* 2. CAPA DE TEXTO (GRADIENTE INFERIOR - SIN CAJA SÓLIDA) */}
            <div className={`absolute bottom-0 left-0 right-0 z-20 flex flex-col justify-end min-h-[40vh] bg-gradient-to-t from-black via-black/90 to-transparent transition-all duration-1000 ${fadeIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                
                <div className="w-full max-w-7xl mx-auto px-6 pb-8 md:pb-12 pt-20">
                    
                    {/* Barra de progreso fina */}
                    <div className="w-full h-[2px] bg-gray-800 mb-4 relative overflow-hidden">
                        <div className={`absolute top-0 left-0 h-full ${barColor} transition-all duration-700`} style={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}></div>
                    </div>

                    {/* Cabecera pequeña */}
                    <div className="flex items-center gap-4 mb-4 opacity-80">
                        <span className={`text-[10px] font-bold tracking-[0.3em] uppercase ${themeColor}`}>
                            {playerAlignment === 'ZOMBIE' ? 'HUNGER_LOG' : 'MH0_PROTOCOL'} // {currentIndex + 1}.{slides.length}
                        </span>
                    </div>

                    {/* Texto Principal - Más ancho y legible */}
                    <p className="text-lg md:text-xl lg:text-2xl text-gray-100 leading-relaxed font-medium drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] max-w-5xl">
                        {currentSlide.text}
                    </p>

                    {/* Botón alineado a la derecha */}
                    <div className="mt-8 flex justify-end">
                        <button 
                            onClick={handleNext}
                            disabled={isAnimating}
                            className={`
                                px-8 py-3 text-xs font-black tracking-[0.2em] uppercase border transition-all duration-300 hover:bg-white hover:text-black
                                ${playerAlignment === 'ZOMBIE' ? 'border-lime-600 text-lime-500' : 'border-cyan-600 text-cyan-500'}
                            `}
                        >
                            {currentIndex === slides.length - 1 ? "INICIAR SIMULACIÓN" : "CONTINUAR_"}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pan {
                    0% { transform: scale(1.0) translate(0, 0); }
                    50% { transform: scale(1.1) translate(-2%, -1%); }
                    100% { transform: scale(1.0) translate(0, 0); }
                }
            `}</style>
        </div>
    );
};