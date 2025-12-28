import React, { useState, useEffect } from 'react';
import { translations, Language } from '../translations';

interface IntroSequenceProps {
    language: Language;
    onComplete: () => void;
    playerAlignment: 'ALIVE' | 'ZOMBIE';
}

export const IntroSequence: React.FC<IntroSequenceProps> = ({ language, onComplete, playerAlignment }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [textVisible, setTextVisible] = useState(false);

    const slides = translations[language].introSequence[playerAlignment === 'ZOMBIE' ? 'zombie' : 'alive'];
    const currentSlide = slides[currentIndex];

    // --- NUEVO: PRE-CARGA DE IMÁGENES ---
    // Esto descarga todos los GIFs en segundo plano nada más montar el componente
    useEffect(() => {
        slides.forEach((slide) => {
            const img = new Image();
            img.src = slide.image;
        });
    }, [slides]);

    // Efecto de entrada para el texto cada vez que cambia la slide
    useEffect(() => {
        setTextVisible(false);
        const timer = setTimeout(() => setTextVisible(true), 500);
        return () => clearTimeout(timer);
    }, [currentIndex]);

    const handleNext = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setTextVisible(false);

        setTimeout(() => {
            if (currentIndex < slides.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setIsAnimating(false);
            } else {
                onComplete();
            }
        }, 800); // Tiempo para la transición de salida
    };

    if (!currentSlide) return null;

    // Configuración de colores según bando
    const isZombie = playerAlignment === 'ZOMBIE';
    const themeColor = isZombie ? 'text-lime-400' : 'text-cyan-400';
    const borderColor = isZombie ? 'border-lime-500' : 'border-cyan-500';
    const bgColor = isZombie ? 'bg-lime-950' : 'bg-cyan-950';
    const shadowColor = isZombie ? 'shadow-lime-500/20' : 'shadow-cyan-500/20';
    const progressColor = isZombie ? 'bg-lime-500' : 'bg-cyan-500';

    return (
        <div className="fixed inset-0 z-[100] bg-black font-mono overflow-hidden flex flex-col md:flex-row">
            
            {/* --- FONDO AMBIENTAL (Blur Trick) --- */}
            {/* Esto asegura que no haya bordes negros feos, usa la misma imagen borrosa para llenar huecos */}
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
                <div 
                    className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 blur-3xl scale-110 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
                    style={{ backgroundImage: `url('${currentSlide.image}')` }}
                ></div>
            </div>

            {/* --- EFECTO CRT / SCANLINES (Overlay Global) --- */}
            <div className="absolute inset-0 z-[50] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%]"></div>

            {/* --- IZQUIERDA: VISOR DE IMAGEN (70% ancho en desktop) --- */}
            <div className="relative flex-1 flex items-center justify-center p-4 md:p-12 z-10 h-[50vh] md:h-auto border-b md:border-b-0 md:border-r border-gray-800 bg-black/40 backdrop-blur-sm">
                
                {/* Marco de la imagen */}
                <div className={`relative w-full h-full max-w-5xl max-h-[80vh] border ${borderColor} ${shadowColor} shadow-[0_0_50px_rgba(0,0,0,0.5)] p-1 flex items-center justify-center bg-black overflow-hidden group`}>
                    
                    {/* Esquinas decorativas */}
                    <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 ${borderColor} z-20`}></div>
                    <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 ${borderColor} z-20`}></div>
                    <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${borderColor} z-20`}></div>
                    <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 ${borderColor} z-20`}></div>

                    {/* IMAGEN PRINCIPAL (Object Contain para no cortar nada) */}
                    <img 
                        src={currentSlide.image} 
                        alt="Evidence" 
                        className={`w-full h-full object-contain transition-all duration-1000 ${isAnimating ? 'scale-110 opacity-0 blur-sm' : 'scale-100 opacity-100 blur-0'}`}
                    />

                    {/* Etiqueta de "LIVE FEED" o "ARCHIVE" */}
                    <div className="absolute top-4 left-4 bg-black/80 px-3 py-1 border border-gray-700 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isZombie ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                        <span className="text-[10px] text-gray-300 tracking-widest font-bold">
                            IMG_SEQ_{1024 + currentIndex} // {isZombie ? 'CORRUPTED' : 'RESTORED'}
                        </span>
                    </div>
                </div>
            </div>

            {/* --- DERECHA: TERMINAL DE DATOS (30% ancho en desktop) --- */}
            <div className="relative w-full md:w-[450px] flex flex-col z-20 bg-slate-950 border-l border-gray-800 shadow-2xl">
                
                {/* Cabecera del Terminal */}
                <div className={`p-6 border-b border-gray-800 ${bgColor} bg-opacity-10`}>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className={`text-xl font-black tracking-[0.2em] uppercase ${themeColor}`}>
                            {isZombie ? 'HUNGER_LOG' : 'MH0_PROTOCOL'}
                        </h2>
                        <span className="text-xs text-gray-500 font-bold">v.9.0.1</span>
                    </div>
                    {/* Barra de progreso */}
                    <div className="w-full h-1 bg-gray-800 mt-2">
                        <div 
                            className={`h-full ${progressColor} transition-all duration-500 ease-out`} 
                            style={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-500 mt-1 font-mono">
                        <span>SEGMENT {currentIndex + 1} OF {slides.length}</span>
                        <span>{Math.round(((currentIndex + 1) / slides.length) * 100)}% COMPLETE</span>
                    </div>
                </div>

                {/* Cuerpo del Texto (Scrollable) */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto relative">
                    <div className={`transition-all duration-700 ${textVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                        
                        {/* Decoración de código antes del texto */}
                        <div className="text-[10px] text-gray-600 mb-4 font-mono select-none">
                            &gt; DECRYPTING AUDIO LOG...<br/>
                            &gt; SUBJECT: UNKNOWN<br/>
                            &gt; LOCATION: SECTOR 7<br/>
                            &gt; STATUS: <span className={isZombie ? 'text-red-500' : 'text-emerald-500'}>{isZombie ? 'CRITICAL' : 'STABLE'}</span>
                        </div>

                        <p className="text-sm md:text-base text-gray-300 leading-relaxed font-mono whitespace-pre-wrap border-l-2 border-gray-800 pl-4">
                            {currentSlide.text}
                        </p>

                        {/* Cursor parpadeante al final */}
                        <span className={`inline-block w-2 h-4 ml-1 align-middle ${progressColor} animate-pulse`}></span>
                    </div>
                </div>

                {/* Pie del Terminal (Botones) */}
                <div className="p-6 border-t border-gray-800 bg-black/20">
                    <button 
                        onClick={handleNext}
                        disabled={isAnimating}
                        className={`
                            w-full py-4 text-xs font-black tracking-[0.3em] uppercase border transition-all duration-300 group relative overflow-hidden
                            ${isZombie 
                                ? 'border-lime-600 text-lime-500 hover:bg-lime-900/20' 
                                : 'border-cyan-600 text-cyan-500 hover:bg-cyan-900/20'}
                        `}
                    >
                        <span className="relative z-10 group-hover:translate-x-2 transition-transform inline-block">
                            {currentIndex === slides.length - 1 ? "INICIAR SIMULACIÓN" : "SIGUIENTE ENTRADA >>"}
                        </span>
                        {/* Efecto de barrido al hacer hover */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${progressColor}`}></div>
                    </button>
                </div>
            </div>
        </div>
    );
};