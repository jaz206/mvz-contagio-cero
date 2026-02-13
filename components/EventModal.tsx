import React from 'react';
import { translations, Language } from '../translations';
import { GlobalEvent } from '../types';

interface EventModalProps {
    event: GlobalEvent;
    isOpen: boolean;
    onAcknowledge: () => void;
    language: Language;
    playerAlignment: 'ALIVE' | 'ZOMBIE' | null;
}

export const EventModal: React.FC<EventModalProps> = ({ event, isOpen, onAcknowledge, language, playerAlignment }) => {
    if (!isOpen) return null;

    const t = translations[language].events;

    // Determinar la clave del evento (anomaly, surfer, galactus)
    let eventKey: keyof typeof t = 'anomaly';
    if (event.stage === 'SURFER') eventKey = 'surfer';
    if (event.stage === 'GALACTUS') eventKey = 'galactus';

    // Determinar el bando (por defecto ALIVE si es null)
    const alignmentKey = playerAlignment === 'ZOMBIE' ? 'zombie' : 'alive';

    // Obtener los datos correctos
    const eventData = t[eventKey][alignmentKey];

    // Color del tema según bando
    const isZombie = playerAlignment === 'ZOMBIE';
    const borderColor = isZombie ? 'border-lime-600' : 'border-red-600';
    const textColor = isZombie ? 'text-lime-500' : 'text-red-500';
    const btnColor = isZombie ? 'bg-lime-900/50 border-lime-500 text-lime-200 hover:bg-lime-600' : 'bg-red-900/50 border-red-500 text-red-200 hover:bg-red-600';
    const shadowColor = isZombie ? 'shadow-[0_0_100px_rgba(101,163,13,0.5)]' : 'shadow-[0_0_100px_rgba(220,38,38,0.5)]';

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-2xl bg-slate-900 border-4 ${borderColor} ${shadowColor} flex flex-col overflow-hidden relative`}>

                {/* Warning Headers */}
                <div className={`${isZombie ? 'bg-lime-600' : 'bg-red-600'} text-black font-bold text-center py-2 tracking-[0.5em] text-lg animate-pulse`}>
                    /// {isZombie ? 'HUNGER ALERT' : 'EMERGENCY INTERRUPTION'} ///
                </div>

                {/* Main Content */}
                <div className="p-8 flex flex-col items-center text-center max-h-[80vh] overflow-y-auto">

                    {('image' in eventData && eventData.image) && (
                        <div className={`w-full mb-6 relative border-2 ${isZombie ? 'border-lime-500/50' : 'border-red-500/50'} shadow-lg overflow-hidden group bg-black/50`}>
                            <div className="relative w-full">
                                <div className={`absolute top-2 left-2 ${isZombie ? 'bg-lime-600' : 'bg-red-600'} text-white text-[10px] font-bold px-2 py-0.5 animate-pulse z-10`}>
                                    LIVE FEED // SIGNAL UNSTABLE
                                </div>
                                <img
                                    src={eventData.image}
                                    alt="Event Visual"
                                    className="w-full h-auto object-cover opacity-90 contrast-125 saturate-50 animate-flash"
                                    referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50"></div>
                                <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none mix-blend-overlay"></div>
                            </div>
                        </div>
                    )}

                    <h2 className={`text-2xl md:text-3xl font-bold ${textColor} mb-6 font-mono tracking-widest drop-shadow-md`}>
                        {eventData.title}
                    </h2>

                    <div className={`w-full h-px ${isZombie ? 'bg-lime-900' : 'bg-red-900'} mb-6`}></div>

                    <p className={`text-base md:text-lg ${isZombie ? 'text-lime-100' : 'text-red-100'} font-mono leading-relaxed max-w-prose`}>
                        {eventData.desc}
                    </p>

                    <div className={`w-full h-px ${isZombie ? 'bg-lime-900' : 'bg-red-900'} mt-6 mb-8`}></div>

                    <button
                        onClick={onAcknowledge}
                        className={`px-8 py-4 border-2 font-bold tracking-widest transition-all duration-300 shadow-lg ${btnColor}`}
                    >
                        {eventData.ack}
                    </button>
                </div>

                {/* Decorative Scanlines */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]"></div>
            </div>
        </div>
    );
};