import React, { useState, useEffect } from 'react';
import { Language } from '../translations';
import { useTypewriter } from '../hooks/useTypewriter';
import { IntroSlide } from '../types';

export interface IntroSequenceProps {
    language: Language;
    onComplete: () => void;
    playerAlignment: 'ALIVE' | 'ZOMBIE';
    slides: IntroSlide[];
}

const DataLoaderOverlay = ({ isZombie }: { isZombie: boolean }) => {
    const [progress, setProgress] = useState(0);
    const [logLine, setLogLine] = useState('');
    const [binaryStream, setBinaryStream] = useState('');

    const logsAlive = ['HANDSHAKE_INIT...', 'BYPASSING FIREWALL...', 'DECRYPTING PACKET...', 'BUFFERING VIDEO STREAM...', 'SECURING CONNECTION...'];
    const logsZombie = ['HUNTING SIGNAL...', 'CORRUPTING DATA...', 'INFECTING SYSTEM...', 'CONSUMING BANDWIDTH...', 'SPREADING VIRUS...'];
    const logs = isZombie ? logsZombie : logsAlive;
    const color = isZombie ? 'text-lime-500' : 'text-cyan-500';
    const barColor = isZombie ? 'bg-lime-600' : 'bg-cyan-600';

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => (prev >= 100 ? 100 : prev + Math.random() * 15));
            setLogLine(logs[Math.floor(Math.random() * logs.length)]);

            let nextBinary = '';
            for (let index = 0; index < 20; index += 1) {
                nextBinary += Math.random() > 0.5 ? '1' : '0';
            }
            setBinaryStream(nextBinary);
        }, 150);

        return () => clearInterval(interval);
    }, [isZombie]);

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-black p-8 font-sans">
            <div className="absolute inset-0 flex flex-wrap gap-1 break-all p-2 font-mono text-[8px] leading-none text-white opacity-10">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="w-full opacity-20">
                        {binaryStream} {binaryStream} {binaryStream}
                    </div>
                ))}
            </div>

            <div className={`mb-4 text-4xl animate-spin ${color}`}>
                {isZombie ? 'X' : 'O'}
            </div>

            <div className={`mb-2 border-x border-current bg-current/5 px-4 py-1 text-xl font-black tracking-[0.3em] ${color} animate-pulse`}>
                {isZombie ? 'FEEDING...' : 'CONNECTING...'}
            </div>

            <div className="relative mb-2 h-2 w-64 overflow-hidden border border-gray-700 bg-gray-900">
                <div
                    className={`h-full ${barColor} transition-all duration-200 ease-out`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="h-4 font-mono text-[10px] text-gray-500">
                &gt; {logLine}
            </div>
        </div>
    );
};

export const IntroSequence: React.FC<IntroSequenceProps> = ({ language, onComplete, playerAlignment, slides }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [textVisible, setTextVisible] = useState(false);

    const localizedSlides = slides.map((slide) => ({
        text: language === 'es' ? slide.textEs : slide.textEn,
        image: slide.image
    }));
    const currentSlide = localizedSlides[currentIndex];
    const typedText = useTypewriter(currentSlide?.text || '', 20, !isTransitioning && textVisible);

    useEffect(() => {
        setCurrentIndex(0);
        setIsTransitioning(false);
        setTextVisible(false);
    }, [language, playerAlignment, slides]);

    useEffect(() => {
        if (isTransitioning) return;

        setTextVisible(false);
        const timer = setTimeout(() => setTextVisible(true), 500);
        return () => clearTimeout(timer);
    }, [currentIndex, isTransitioning]);

    const handleNext = () => {
        if (isTransitioning) return;

        const nextIndex = currentIndex + 1;
        if (nextIndex >= localizedSlides.length) {
            onComplete();
            return;
        }

        setIsTransitioning(true);
        setTextVisible(false);

        const img = new Image();
        img.src = localizedSlides[nextIndex].image;

        const minTimePromise = new Promise((resolve) => setTimeout(resolve, 1500));
        const imgLoadPromise = new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
        });

        Promise.all([imgLoadPromise, minTimePromise]).then(() => {
            setCurrentIndex(nextIndex);
            setIsTransitioning(false);
        });
    };

    if (!currentSlide) return null;

    const isZombie = playerAlignment === 'ZOMBIE';
    const themeColor = isZombie ? 'text-lime-400' : 'text-cyan-400';
    const borderColor = isZombie ? 'border-lime-500' : 'border-cyan-500';
    const bgColor = isZombie ? 'bg-lime-950' : 'bg-cyan-950';
    const shadowColor = isZombie ? 'shadow-lime-500/20' : 'shadow-cyan-500/20';
    const progressColor = isZombie ? 'bg-lime-500' : 'bg-cyan-500';

    return (
        <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-black font-sans md:flex-row">
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
                <img
                    src={currentSlide.image}
                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-100 blur-3xl transition-all duration-1000"
                    referrerPolicy="no-referrer"
                    alt=""
                />
            </div>

            <div className="absolute inset-0 z-[50] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%]" />

            <div className="relative z-10 flex h-[50vh] flex-1 items-center justify-center border-b border-gray-800 bg-black/40 p-4 backdrop-blur-sm md:h-auto md:border-b-0 md:border-r md:p-12">
                <div className={`relative flex h-full w-full max-h-[80vh] max-w-5xl items-center justify-center overflow-hidden border bg-black p-1 shadow-[0_0_50px_rgba(0,0,0,0.5)] ${borderColor} ${shadowColor}`}>
                    <div className={`absolute left-0 top-0 z-20 h-4 w-4 border-l-2 border-t-2 ${borderColor}`} />
                    <div className={`absolute right-0 top-0 z-20 h-4 w-4 border-r-2 border-t-2 ${borderColor}`} />
                    <div className={`absolute bottom-0 left-0 z-20 h-4 w-4 border-b-2 border-l-2 ${borderColor}`} />
                    <div className={`absolute bottom-0 right-0 z-20 h-4 w-4 border-b-2 border-r-2 ${borderColor}`} />

                    {isTransitioning && <DataLoaderOverlay isZombie={isZombie} />}

                    <img
                        key={currentIndex}
                        src={currentSlide.image}
                        alt="Evidence"
                        className={`h-full w-full object-contain transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
                        referrerPolicy="no-referrer"
                    />

                    {!isTransitioning && (
                        <div className="absolute left-4 top-4 flex items-center gap-2 border border-gray-700 bg-black/80 px-3 py-1 animate-fade-in">
                            <div className={`h-2 w-2 rounded-full ${isZombie ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                            <span className="text-[10px] font-bold tracking-widest text-gray-300">
                                IMG_SEQ_{1024 + currentIndex} // {isZombie ? 'CORRUPTED' : 'RESTORED'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative z-20 flex w-full flex-col border-l border-gray-800 bg-slate-950 shadow-2xl md:w-[450px]">
                <div className={`border-b border-gray-800 bg-opacity-10 p-6 ${bgColor}`}>
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className={`text-xl font-black uppercase tracking-[0.2em] ${themeColor}`}>
                            {isZombie ? 'HUNGER_LOG' : 'MH0_PROTOCOL'}
                        </h2>
                        <span className="text-xs font-bold text-gray-500">v.9.0.1</span>
                    </div>

                    <div className="mt-2 h-1 w-full bg-gray-800">
                        <div
                            className={`h-full transition-all duration-500 ease-out ${progressColor}`}
                            style={{ width: `${((currentIndex + 1) / localizedSlides.length) * 100}%` }}
                        />
                    </div>

                    <div className="mt-1 flex justify-between font-mono text-[9px] text-gray-500">
                        <span>SEGMENT {currentIndex + 1} OF {localizedSlides.length}</span>
                        <span>{Math.round(((currentIndex + 1) / localizedSlides.length) * 100)}% COMPLETE</span>
                    </div>
                </div>

                <div className="relative flex-1 overflow-y-auto p-6 md:p-8">
                    {isTransitioning ? (
                        <div className="flex flex-col gap-2 animate-pulse opacity-50">
                            <div className="h-2 w-3/4 bg-gray-800" />
                            <div className="h-2 w-full bg-gray-800" />
                            <div className="h-2 w-5/6 bg-gray-800" />
                            <div className="h-2 w-1/2 bg-gray-800" />
                        </div>
                    ) : (
                        <div className={`transition-all duration-500 ${textVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}>
                            <div className="mb-4 select-none font-mono text-[10px] text-gray-600">
                                &gt; DECRYPTING AUDIO LOG...<br />
                                &gt; SUBJECT: UNKNOWN<br />
                                &gt; LOCATION: SECTOR 7<br />
                                &gt; STATUS: <span className={isZombie ? 'text-red-500' : 'text-emerald-500'}>{isZombie ? 'CRITICAL' : 'STABLE'}</span>
                            </div>

                            <p className="relative whitespace-pre-wrap border-l-2 border-gray-800 pl-4 font-mono text-sm leading-relaxed text-gray-300 md:text-base">
                                {typedText}
                                <span className="ml-1 inline-block h-[1.2em] w-2 translate-y-[2px] animate-typing-cursor align-middle bg-current" />
                            </p>
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-800 bg-black/20 p-6">
                    <button
                        onClick={handleNext}
                        disabled={isTransitioning}
                        className={`
                            group relative w-full overflow-hidden border py-4 text-xs font-black uppercase tracking-[0.3em] transition-all duration-300
                            ${isZombie ? 'border-lime-600 text-lime-500 hover:bg-lime-900/20' : 'border-cyan-600 text-cyan-500 hover:bg-cyan-900/20'}
                            ${isTransitioning ? 'cursor-wait opacity-50' : ''}
                        `}
                    >
                        <span className="relative z-10 inline-block transition-transform group-hover:translate-x-2">
                            {isTransitioning
                                ? (isZombie ? 'HUNTING...' : 'BUFFERING...')
                                : (currentIndex === localizedSlides.length - 1 ? 'INICIAR SIMULACION' : 'SIGUIENTE ENTRADA >>')}
                        </span>
                        <div className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-10 ${progressColor}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};
