import React, { useState, useEffect, useRef } from 'react';
import { Mission } from '../types';
import { translations, Language } from '../translations';
import { DraggablePdfWindow } from './DraggablePdfWindow'; // <--- IMPORTANTE

interface MissionModalProps {
    mission: Mission;
    isOpen: boolean;
    onClose: () => void;
    onComplete: (missionId: string) => void;
    onReactivate?: (missionId: string) => void;
    onEdit?: (mission: Mission) => void;
    onDelete?: (missionId: string) => void;
    language: Language;
    isCompleted?: boolean;
    isEditorMode?: boolean;
}

export const MissionModal: React.FC<MissionModalProps> = ({
    mission, isOpen, onClose, onComplete, onReactivate, onEdit, onDelete,
    language, isCompleted, isEditorMode
}) => {
    const [reporting, setReporting] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [showPdf, setShowPdf] = useState(false);
    const [typedDescription, setTypedDescription] = useState<string[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const t = translations[language].missionModal;

    const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

    useEffect(() => {
        setReporting(false);
        setReportSuccess(false);
        setShowMap(false);
        setShowPdf(false);

        // Typing Effect Logic
        if (isOpen && mission.description && !isCompleted && !reportSuccess) {
            setTypedDescription([]);
            setIsTyping(true);
            let pIdx = 0;
            let charIdx = 0;
            const paragraphs = mission.description;
            const currentTyped: string[] = Array(paragraphs.length).fill("");

            const typeChar = () => {
                if (pIdx >= paragraphs.length) {
                    setIsTyping(false);
                    return;
                }

                currentTyped[pIdx] = paragraphs[pIdx].substring(0, charIdx + 1);
                setTypedDescription([...currentTyped]);
                charIdx++;

                if (charIdx >= paragraphs[pIdx].length) {
                    pIdx++;
                    charIdx = 0;
                }

                const delay = Math.random() * 10 + 5;
                const timeout = setTimeout(typeChar, delay);
                timeoutsRef.current.push(timeout);
            };

            const initialTimeout = setTimeout(typeChar, 300);
            timeoutsRef.current.push(initialTimeout);
        } else {
            setTypedDescription(mission.description || []);
            setIsTyping(false);
        }

        return () => {
            timeoutsRef.current.forEach(clearTimeout);
            timeoutsRef.current = [];
        };
    }, [mission, isOpen]);

    if (!isOpen) return null;

    const handleReportClick = () => {
        setReporting(true);
        const t1 = setTimeout(() => {
            setReporting(false);
            setReportSuccess(true);
            if (!mission.outcomeText) {
                const t2 = setTimeout(() => {
                    onComplete(mission.id);
                    onClose();
                }, 1500);
                timeoutsRef.current.push(t2);
            }
        }, 3000);
        timeoutsRef.current.push(t1);
    };

    const handleManualCloseReport = () => {
        onComplete(mission.id);
        onClose();
    };

    const handleReactivateClick = () => {
        if (onReactivate) {
            onReactivate(mission.id);
            onClose();
        }
    };

    const showOutcome = reportSuccess && mission.outcomeText;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Fondo oscuro del modal principal */}
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={onClose}></div>

            {/* --- VISOR DE PDF FLOTANTE (NUEVO) --- */}
            {/* Se renderiza fuera del contenedor principal del modal para que pueda flotar por encima */}
            {showPdf && mission.pdfUrl && (
                <DraggablePdfWindow
                    url={mission.pdfUrl}
                    title={`DOC CLASIFICADO: ${mission.title}`}
                    onClose={() => setShowPdf(false)}
                />
            )}

            {/* Contenedor Principal del Modal de Misión */}
            <div className={`relative w-full max-w-3xl glass-panel shadow-[0_0_80px_rgba(0,0,0,0.6)] flex flex-col max-h-[90vh] overflow-hidden rounded-sm ${isCompleted || reportSuccess ? 'border-emerald-600/50 shadow-emerald-900/10' : 'border-cyan-600/50 shadow-cyan-900/10'}`}>

                {/* Header */}
                <div className={`border-b p-5 flex justify-between items-center relative ${isCompleted || reportSuccess ? 'bg-emerald-900/20 border-emerald-600/50' : 'bg-cyan-900/20 border-cyan-600/50'}`}>
                    <div className={`absolute top-0 left-0 w-32 h-1 ${isCompleted || reportSuccess ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]'}`}></div>

                    <div className="flex flex-col">
                        <h2 className={`text-xl md:text-2xl font-black tracking-[0.2em] font-mono uppercase ${isCompleted || reportSuccess ? 'text-emerald-400' : 'text-cyan-400'}`}>
                            {isCompleted || reportSuccess ? 'MISSION COMPLETE' : t.title}
                        </h2>
                        <span className="text-[9px] font-mono text-cyan-700/80 tracking-widest font-bold">SERIAL_KEY: {mission.id}</span>
                    </div>

                    <div className="flex gap-2 items-center">
                        <div className={`font-bold border-2 px-3 py-1 text-[10px] tracking-widest font-mono ${isCompleted || reportSuccess ? 'text-emerald-400 border-emerald-500/50 bg-emerald-950/20' : 'text-red-500 border-red-500/50 bg-red-950/20 animate-pulse'}`}>
                            {isCompleted || reportSuccess ? 'ARCHIVED' : 'TOP SECRET'}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto font-sans text-cyan-50/90 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-slate-950/50">
                    <div className="mb-8 border-b border-cyan-900/50 pb-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                            <h3 className="text-3xl md:text-4xl font-black text-white/90 tracking-tight leading-none uppercase">
                                {mission.title}
                            </h3>
                            <div className="text-right border-l md:border-l-0 md:pl-0 pl-4 border-cyan-800">
                                <div className="text-[9px] text-cyan-600 font-bold uppercase tracking-[0.3em] mb-1">{t.threat}</div>
                                <div className={`text-lg md:text-xl font-black tracking-widest font-mono ${isCompleted ? 'text-emerald-500' : 'text-red-600'}`}>
                                    {isCompleted ? 'NEUTRALIZED' : (mission.threatLevel || 'UNKNOWN')}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] font-mono font-bold text-cyan-500/80">
                            <span className="bg-cyan-950/30 px-3 py-1 border border-cyan-800/30 rounded-full tracking-tighter">OS_ZONE: {mission.location.state.toUpperCase()}</span>
                            <span className="bg-cyan-950/30 px-3 py-1 border border-cyan-800/30 rounded-full tracking-tighter">NAV_POS: {mission.location.coordinates[1].toFixed(4)}, {mission.location.coordinates[0].toFixed(4)}</span>
                        </div>
                        {mission.requirements && mission.requirements.length > 0 && (
                            <div className="mt-3">
                                <div className="text-[9px] text-cyan-600 font-bold uppercase mb-1 tracking-widest">REQUISITOS TÁCTICOS</div>
                                <div className="flex flex-wrap gap-2">
                                    {mission.requirements.map((req, idx) => (
                                        <span key={idx} className="text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded shadow-sm">
                                            📦 {req}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {showOutcome ? (
                        <div className="animate-fade-in space-y-4">
                            <h4 className="text-[10px] font-black tracking-[0.4em] uppercase text-emerald-500 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-emerald-500/30"></span> {t.outcomeTitle}
                            </h4>
                            <div className="p-6 bg-emerald-950/20 border border-emerald-500/30 text-emerald-100 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium rounded-sm">
                                {mission.outcomeText}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* --- BOTÓN DE PDF --- */}
                            {mission.pdfUrl && (
                                <div className="mb-6 animate-fade-in">
                                    <button
                                        onClick={() => setShowPdf(true)}
                                        className="w-full py-3 bg-red-900/20 border border-red-500/50 hover:bg-red-900/40 hover:border-red-500 text-red-300 font-bold tracking-widest flex items-center justify-center gap-3 transition-all group shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                                    >
                                        <span className="text-xl group-hover:scale-110 transition-transform">📄</span>
                                        <span>ABRIR DOCUMENTO CLASIFICADO (PDF)</span>
                                        <span className="text-xs opacity-50 group-hover:opacity-100 border-l border-red-700 pl-2 ml-2">CLICK TO OPEN</span>
                                    </button>
                                </div>
                            )}

                            <div className="mb-8 group">
                                <h4 className={`text-[10px] font-black tracking-[0.4em] mb-4 uppercase flex items-center gap-2 ${isCompleted ? 'text-emerald-500' : 'text-cyan-500'}`}>
                                    <span className={`w-8 h-[1px] ${isCompleted ? 'bg-emerald-500/30' : 'bg-cyan-500/30'}`}></span> {t.briefing}
                                </h4>
                                <div className="space-y-4 text-sm md:text-base leading-relaxed text-slate-300 font-medium font-sans">
                                    {(isTyping ? typedDescription : mission.description).map((paragraph, index) => (
                                        <p key={index} className={isTyping && index === typedDescription.length - 1 ? "after:content-['_'] after:animate-pulse after:text-cyan-400" : ""}>
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-950/40 border border-white/5 p-6 rounded-sm mb-8">
                                <h4 className={`text-[10px] font-black tracking-[0.4em] mb-6 uppercase flex items-center gap-2 ${isCompleted ? 'text-emerald-500' : 'text-cyan-500'}`}>
                                    <span className={`w-8 h-[1px] ${isCompleted ? 'bg-emerald-500/30' : 'bg-cyan-500/30'}`}></span> {t.objectives}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {mission.objectives.map((obj, idx) => (
                                        <div key={idx} className="flex gap-4 group">
                                            <div className={`w-8 h-8 shrink-0 border-2 rounded-sm flex items-center justify-center text-[10px] font-black transition-all duration-500 ${isCompleted || reportSuccess ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-slate-900 border-slate-700 text-slate-500 group-hover:border-cyan-500 group-hover:text-cyan-400'}`}>
                                                {(isCompleted || reportSuccess) ? 'DONE' : (idx + 1).toString().padStart(2, '0')}
                                            </div>
                                            <div className="flex flex-col">
                                                <h5 className={`font-black text-xs tracking-widest uppercase mb-1 transition-colors ${isCompleted || reportSuccess ? 'text-emerald-400' : 'text-white/80 group-hover:text-cyan-400'}`}>{obj.title}</h5>
                                                <p className="text-[11px] text-slate-500 leading-snug font-medium">{obj.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-cyan-900/50 bg-slate-950/40 flex justify-between items-center gap-4">
                    {showOutcome ? (
                        <div className="w-full flex justify-end">
                            <button onClick={handleManualCloseReport} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-600 text-black text-[10px] font-black tracking-[0.3em] shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all uppercase font-mono">
                                {t.closeReport}
                            </button>
                        </div>
                    ) : (
                        <>
                            <button onClick={onClose} disabled={reporting} className="px-6 py-3 border border-cyan-700/50 text-cyan-500 text-[10px] font-black tracking-widest hover:bg-cyan-900/20 hover:text-cyan-300 transition-all disabled:opacity-50 uppercase font-mono">
                                {t.cancel}
                            </button>

                            <div className="flex gap-4">
                                {mission.layoutUrl && (
                                    <button onClick={() => setShowMap(true)} className="px-5 py-3 bg-yellow-600 hover:bg-yellow-500 text-black text-[10px] font-black tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all flex items-center gap-2 uppercase font-mono">
                                        <span>🗺️</span> MAP
                                    </button>
                                )}

                                {isCompleted && onReactivate && (
                                    <button onClick={handleReactivateClick} className="px-6 py-3 border border-yellow-600/50 text-yellow-500 text-[10px] font-black tracking-widest hover:bg-yellow-900/20 hover:text-yellow-300 transition-all uppercase font-mono">
                                        {t.reactivate}
                                    </button>
                                )}

                                <button
                                    disabled={isCompleted || reporting || reportSuccess}
                                    className={`px-8 py-3 text-black text-[10px] font-black tracking-widest border-2 shadow transition-all uppercase font-mono
                                ${isCompleted || reportSuccess
                                            ? 'bg-emerald-900/30 border-emerald-800 text-emerald-500 cursor-not-allowed'
                                            : 'bg-emerald-500 hover:bg-emerald-400 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)]'}
                                ${reporting ? 'animate-pulse cursor-wait' : ''}
                            `}
                                    onClick={() => { if (!isCompleted) handleReportClick(); }}
                                >
                                    {reporting ? t.sending : (reportSuccess || isCompleted ? `✓ ${t.sent}` : t.complete)}
                                </button>

                                {!isCompleted && !reporting && !reportSuccess && (
                                    <button className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all uppercase font-mono" onClick={onClose}>
                                        {t.accept}
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Visor de Mapa */}
                {showMap && mission.layoutUrl && (
                    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setShowMap(false)}>
                        <div className="relative max-w-full max-h-full flex flex-col items-center">
                            <img src={mission.layoutUrl} alt="Tactical Map" className="max-w-[95vw] max-h-[85vh] object-contain border-2 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.3)]" onClick={(e) => e.stopPropagation()} referrerPolicy="no-referrer" />
                            <button onClick={() => setShowMap(false)} className="mt-4 px-6 py-2 bg-red-900/80 text-white font-bold tracking-widest border border-red-600 hover:bg-red-800">CERRAR VISOR</button>
                        </div>
                    </div>
                )}

                <div className={`absolute bottom-2 right-2 w-4 h-4 border-b border-r ${isCompleted || reportSuccess ? 'border-emerald-500' : 'border-cyan-500'}`}></div>
                <div className={`absolute bottom-2 left-2 w-4 h-4 border-b border-l ${isCompleted || reportSuccess ? 'border-emerald-500' : 'border-cyan-500'}`}></div>
            </div>
        </div>
    );
};