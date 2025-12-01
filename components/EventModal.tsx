
import React from 'react';
import { translations, Language } from '../translations';
import { GlobalEvent } from '../types';

interface EventModalProps {
    event: GlobalEvent;
    isOpen: boolean;
    onAcknowledge: () => void;
    language: Language;
}

export const EventModal: React.FC<EventModalProps> = ({ event, isOpen, onAcknowledge, language }) => {
    if (!isOpen) return null;

    const t = translations[language].events;
    // Map stage to translation keys
    let eventData: { title: string, desc: string, ack: string, image?: string };
    
    switch (event.stage) {
        case 'ANOMALY': eventData = t.anomaly; break;
        case 'SURFER': eventData = t.surfer; break;
        case 'GALACTUS': eventData = t.galactus; break;
        default: eventData = t.anomaly;
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-2xl bg-slate-900 border-4 border-red-600 shadow-[0_0_100px_rgba(220,38,38,0.5)] flex flex-col overflow-hidden relative">
                
                {/* Warning Headers */}
                <div className="bg-red-600 text-black font-bold text-center py-2 tracking-[0.5em] text-lg animate-pulse">
                    /// EMERGENCY INTERRUPTION ///
                </div>
                
                {/* Main Content */}
                <div className="p-8 flex flex-col items-center text-center max-h-[80vh] overflow-y-auto">
                    
                    {eventData.image && (
                        <div className="w-full mb-6 relative border-2 border-red-500/50 shadow-lg overflow-hidden group bg-black/50">
                            <div className="relative w-full">
                                <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 animate-pulse z-10">
                                    LIVE FEED // SIGNAL UNSTABLE
                                </div>
                                <img 
                                    src={eventData.image} 
                                    alt="Event Visual" 
                                    className="w-full h-auto object-cover opacity-90 contrast-125 saturate-50 animate-flash"
                                />
                                {/* Scanlines overlay */}
                                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50"></div>
                                {/* Static Noise animation */}
                                <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none mix-blend-overlay"></div>
                            </div>
                        </div>
                    )}

                    <h2 className="text-2xl md:text-3xl font-bold text-red-500 mb-6 font-mono tracking-widest drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">
                        {eventData.title}
                    </h2>
                    
                    <div className="w-full h-px bg-red-900 mb-6"></div>
                    
                    <p className="text-base md:text-lg text-red-100 font-mono leading-relaxed max-w-prose">
                        {eventData.desc}
                    </p>

                    <div className="w-full h-px bg-red-900 mt-6 mb-8"></div>

                    <button 
                        onClick={onAcknowledge}
                        className="px-8 py-4 bg-red-900/50 border-2 border-red-500 text-red-200 font-bold tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
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
