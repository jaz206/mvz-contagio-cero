import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    type: 'CURE' | 'INFECT' | 'WARNING'; // Para cambiar el color
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, onClose, onConfirm, title, message, confirmText, cancelText = "CANCELAR", type 
}) => {
    if (!isOpen) return null;

    let colorClass = 'border-cyan-500 text-cyan-400';
    let btnClass = 'bg-cyan-600 hover:bg-cyan-500';
    let bgGlow = 'shadow-[0_0_50px_rgba(6,182,212,0.2)]';

    if (type === 'CURE') {
        colorClass = 'border-emerald-500 text-emerald-400';
        btnClass = 'bg-emerald-600 hover:bg-emerald-500';
        bgGlow = 'shadow-[0_0_50px_rgba(16,185,129,0.2)]';
    } else if (type === 'INFECT') {
        colorClass = 'border-lime-500 text-lime-400';
        btnClass = 'bg-lime-600 hover:bg-lime-500';
        bgGlow = 'shadow-[0_0_50px_rgba(132,204,22,0.2)]';
    } else if (type === 'WARNING') {
        colorClass = 'border-red-500 text-red-400';
        btnClass = 'bg-red-600 hover:bg-red-500';
        bgGlow = 'shadow-[0_0_50px_rgba(239,68,68,0.2)]';
    }

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/95 backdrop-blur-sm p-4 animate-fade-in">
            <div className={`w-full max-w-md bg-slate-900 border-2 ${colorClass} ${bgGlow} flex flex-col relative overflow-hidden`}>
                
                {/* Scanlines decorativas */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] pointer-events-none opacity-20"></div>

                <div className={`p-4 border-b ${colorClass} bg-slate-950/50 font-black tracking-[0.2em] uppercase text-lg flex items-center gap-2`}>
                    <span className="animate-pulse">⚠</span> {title}
                </div>

                <div className="p-6 text-center relative z-10">
                    <p className="font-mono text-sm md:text-base text-white leading-relaxed whitespace-pre-line">
                        {message}
                    </p>
                </div>

                <div className="p-4 flex gap-4 justify-center bg-slate-950/80 border-t border-slate-800 relative z-10">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 border border-slate-600 text-slate-400 hover:text-white hover:border-white text-xs font-bold tracking-widest uppercase transition-all"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={() => { onConfirm(); onClose(); }}
                        className={`px-6 py-2 text-black text-xs font-bold tracking-widest uppercase transition-all shadow-lg ${btnClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};