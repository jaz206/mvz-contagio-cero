import React, { useState, useEffect, useRef } from 'react';
import { translations, Language } from '../translations';
import { useTypewriter } from '../hooks/useTypewriter';

// --- COMPONENTE INTERNO: PANTALLA DE CARGA TEMÁTICA ---
const DataLoaderOverlay = ({ isZombie }: { isZombie: boolean }) => {
    const [progress, setProgress] = useState(0);
    const [logLine, setLogLine] = useState("");
    const [binaryStream, setBinaryStream] = useState("");

    const logsAlive = ["HANDSHAKE_INIT...", "BYPASSING FIREWALL...", "DECRYPTING PACKET...", "BUFFERING VIDEO STREAM...", "SECURING CONNECTION..."];
    const logsZombie = ["HUNTING SIGNAL...", "CORRUPTING DATA...", "INFECTING SYSTEM...", "CONSUMING BANDWIDTH...", "SPREADING VIRUS..."];
    const logs = isZombie ? logsZombie : logsAlive;

    const color = isZombie ? "text-lime-500" : "text-cyan-500";
    const barColor = isZombie ? "bg-lime-600" : "bg-cyan-600";

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => (prev >= 100 ? 100 : prev + Math.random() * 15));
            setLogLine(logs[Math.floor(Math.random() * logs.length)]);

            // Generar "stream" binario aleatorio
            let bin = "";
            for (let i = 0; i < 20; i++) bin += Math.random() > 0.5 ? "1" : "0";
            setBinaryStream(bin);
        }, 150);
        return () => clearInterval(interval);
    }, [isZombie]);

    return (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center font-sans p-8 overflow-hidden">
            <div className="absolute inset-0 opacity-10 font-mono text-[8px] flex flex-wrap gap-1 leading-none break-all p-2 text-white">
                {Array.from({ length: 20 }).map((_, i) => <div key={i} className="w-full opacity-20">{binaryStream} {binaryStream} {binaryStream}</div>)}
            </div>

            <div className={`text-4xl mb-4 animate-spin ${color}`}>
                {isZombie ? '☣' : '✇'}
            </div>

            <div className={`text-xl font-black tracking-[0.3em] mb-2 ${color} animate-pulse px-4 py-1 border-x border-current bg-current/5 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                {isZombie ? 'FEEDING...' : 'CONNECTING...'}
            </div>

            <div className="w-64 h-2 bg-gray-900 border border-gray-700 relative overflow-hidden mb-2">
                <div
                    className={`h-full ${barColor} shadow-[0_0_10px_currentColor] transition-all duration-200 ease-out`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="text-[10px] text-gray-500 h-4 font-mono">
                &gt; {logLine}
            </div>
        </div>
    );
};

export const IntroSequence: React.FC<IntroSequenceProps> = ({ language, onComplete, playerAlignment }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [textVisible, setTextVisible] = useState(false);

    const slides = translations[language].introSequence[playerAlignment === 'ZOMBIE' ? 'zombie' : 'alive'];
    const currentSlide = slides[currentIndex];
    const typedText = useTypewriter(currentSlide?.text || "", 20, !isTransitioning && textVisible);

    useEffect(() => {
        if (!isTransitioning) {
            setTextVisible(false);
            const timer = setTimeout(() => setTextVisible(true), 500);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, isTransitioning]);

    const handleNext = () => {
        if (isTransitioning) return;

        const nextIndex = currentIndex + 1;

        // Si es el final, terminar
        if (nextIndex >= slides.length) {
            onComplete();
            return;
        }

        // 1. ACTIVAR MODO CARGA (Muestra el overlay)
        setIsTransitioning(true);
        setTextVisible(false);

        // 2. PRECARGAR LA SIGUIENTE IMAGEN REALMENTE
        const img = new Image();
        img.src = slides[nextIndex].image;

        // Definir tiempo mínimo de "efecto" para que no sea un parpadeo feo si carga muy rápido
        const minTimePromise = new Promise(resolve => setTimeout(resolve, 1500));

        // Promesa de carga de imagen
        const imgLoadPromise = new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // Si falla, avanzamos igual para no bloquear
        });

        // 3. ESPERAR A QUE AMBAS COSAS TERMINEN (Tiempo mínimo + Carga real)
        Promise.all([imgLoadPromise, minTimePromise]).then(() => {
            setCurrentIndex(nextIndex);
            setIsTransitioning(false);
        });
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
        <div className="fixed inset-0 z-[100] bg-black font-sans overflow-hidden flex flex-col md:flex-row">

            {/* --- FONDO AMBIENTAL (Blur Trick) --- */}
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
                <img
                    src={currentSlide.image}
                    className="absolute inset-0 w-full h-full object-cover blur-3xl scale-110 opacity-100 transition-all duration-1000"
                    referrerPolicy="no-referrer"
                    alt=""
                />
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

                    {/* --- AQUÍ ESTÁ LA MAGIA: OVERLAY DE CARGA --- */}
                    {isTransitioning && <DataLoaderOverlay isZombie={isZombie} />}

                    {/* IMAGEN PRINCIPAL */}
                    {/* Usamos key={currentIndex} para forzar que React recree la imagen y no intente transicionar la anterior */}
                    <img
                        key={currentIndex}
                        src={currentSlide.image}
                        alt="Evidence"
                        className={`w-full h-full object-contain transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
                        referrerPolicy="no-referrer"
                    />

                    {/* Etiqueta de "LIVE FEED" o "ARCHIVE" */}
                    {!isTransitioning && (
                        <div className="absolute top-4 left-4 bg-black/80 px-3 py-1 border border-gray-700 flex items-center gap-2 animate-fade-in">
                            <div className={`w-2 h-2 rounded-full ${isZombie ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                            <span className="text-[10px] text-gray-300 tracking-widest font-bold">
                                IMG_SEQ_{1024 + currentIndex} // {isZombie ? 'CORRUPTED' : 'RESTORED'}
                            </span>
                        </div>
                    )}
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
                    {/* Si está cargando, mostramos estática o vacío en el texto también */}
                    {isTransitioning ? (
                        <div className="flex flex-col gap-2 opacity-50 animate-pulse">
                            <div className="h-2 bg-gray-800 w-3/4"></div>
                            <div className="h-2 bg-gray-800 w-full"></div>
                            <div className="h-2 bg-gray-800 w-5/6"></div>
                            <div className="h-2 bg-gray-800 w-1/2"></div>
                        </div>
                    ) : (
                        <div className={`transition-all duration-500 ${textVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>

                            {/* Decoración de código antes del texto */}
                            <div className="text-[10px] text-gray-600 mb-4 font-mono select-none">
                                &gt; DECRYPTING AUDIO LOG...<br />
                                &gt; SUBJECT: UNKNOWN<br />
                                &gt; LOCATION: SECTOR 7<br />
                                &gt; STATUS: <span className={isZombie ? 'text-red-500' : 'text-emerald-500'}>{isZombie ? 'CRITICAL' : 'STABLE'}</span>
                            </div>

                            <p className="text-sm md:text-base text-gray-300 leading-relaxed font-mono whitespace-pre-wrap border-l-2 border-gray-800 pl-4 relative">
                                {typedText}
                                <span className={`animate-typing-cursor inline-block w-2 bg-current ml-1 align-middle translate-y-[2px]`} style={{ height: '1.2em' }}></span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Pie del Terminal (Botones) */}
                <div className="p-6 border-t border-gray-800 bg-black/20">
                    <button
                        onClick={handleNext}
                        disabled={isTransitioning}
                        className={`
                            w-full py-4 text-xs font-black tracking-[0.3em] uppercase border transition-all duration-300 group relative overflow-hidden
                            ${isZombie
                                ? 'border-lime-600 text-lime-500 hover:bg-lime-900/20'
                                : 'border-cyan-600 text-cyan-500 hover:bg-cyan-900/20'}
                            ${isTransitioning ? 'opacity-50 cursor-wait' : ''}
                        `}
                    >
                        <span className="relative z-10 group-hover:translate-x-2 transition-transform inline-block">
                            {isTransitioning
                                ? (isZombie ? "HUNTING..." : "BUFFERING...")
                                : (currentIndex === slides.length - 1 ? "INICIAR SIMULACIÓN" : "SIGUIENTE ENTRADA >>")}
                        </span>
                        {/* Efecto de barrido al hacer hover */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${progressColor}`}></div>
                    </button>
                </div>
            </div>
        </div>
    );
};