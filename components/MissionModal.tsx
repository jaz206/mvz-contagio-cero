import React, { useState, useEffect, useRef } from 'react';
import { Mission, MissionCompletionReward } from '../types';
import { translations, Language } from '../translations';
import { DraggablePdfWindow } from './DraggablePdfWindow';

interface MissionModalProps {
    mission: Mission;
    isOpen: boolean;
    onClose: () => void;
    onComplete: (missionId: string, reward?: MissionCompletionReward) => void;
    onReactivate?: (missionId: string) => void;
    onEdit?: (mission: Mission) => void;
    onDelete?: (missionId: string) => void;
    language: Language;
    isCompleted?: boolean;
    isEditorMode?: boolean;
    disableClose?: boolean;
}

export const MissionModal: React.FC<MissionModalProps> = ({
    mission,
    isOpen,
    onClose,
    onComplete,
    onReactivate,
    onEdit,
    onDelete,
    language,
    isCompleted,
    isEditorMode,
    disableClose = false
}) => {
    const [reporting, setReporting] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [showPdf, setShowPdf] = useState(false);
    const [typedDescription, setTypedDescription] = useState<string[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [foundCureVial, setFoundCureVial] = useState(false);
    const completionCommittedRef = useRef(false);
    const t = translations[language].missionModal;
    const typingTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
    const flowTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
    const isPdfAttachment = mission.pdfUrl?.toLowerCase().includes('.pdf') ?? false;
    const vialChance = Math.max(0, Math.min(100, mission.cureVialChance || 0));
    const rollCureVial = () => {
        if (mission.guaranteedCureVial) return true;
        if (vialChance <= 0) return false;
        return Math.random() * 100 < vialChance;
    };
    const missionRoleLabel = (mission.missionRole || 'PRIMARY') === 'OPTIONAL'
        ? (language === 'es' ? 'SECUNDARIA OPCIONAL' : 'OPTIONAL SIDE MISSION')
        : (language === 'es' ? 'MISION PRINCIPAL' : 'MAIN MISSION');

    useEffect(() => {
        if (reportSuccess) {
            return;
        }

        completionCommittedRef.current = false;
        setReporting(false);
        setReportSuccess(false);
        setShowMap(false);
        setShowPdf(false);
        setFoundCureVial(false);

        if (isOpen && mission.description && !isCompleted && !reportSuccess) {
            setTypedDescription([]);
            setIsTyping(true);

            let paragraphIndex = 0;
            let charIndex = 0;
            const paragraphs = mission.description;
            const currentTyped: string[] = Array(paragraphs.length).fill('');

            const typeChar = () => {
                if (paragraphIndex >= paragraphs.length) {
                    setIsTyping(false);
                    return;
                }

                currentTyped[paragraphIndex] = paragraphs[paragraphIndex].substring(0, charIndex + 1);
                setTypedDescription([...currentTyped]);
                charIndex += 1;

                if (charIndex >= paragraphs[paragraphIndex].length) {
                    paragraphIndex += 1;
                    charIndex = 0;
                }

                const timeout = setTimeout(typeChar, Math.random() * 10 + 5);
                typingTimeoutsRef.current.push(timeout);
            };

            const initialTimeout = setTimeout(typeChar, 300);
            typingTimeoutsRef.current.push(initialTimeout);
        } else {
            setTypedDescription(mission.description || []);
            setIsTyping(false);
        }

        return () => {
            typingTimeoutsRef.current.forEach(clearTimeout);
            typingTimeoutsRef.current = [];
        };
    }, [mission, isOpen, isCompleted, reportSuccess]);

    useEffect(() => {
        return () => {
            flowTimeoutsRef.current.forEach(clearTimeout);
            flowTimeoutsRef.current = [];
        };
    }, []);

    if (!isOpen) return null;

    const commitCompletion = async (shouldClose = true, vialFoundOverride?: boolean) => {
        if (completionCommittedRef.current) return;
        completionCommittedRef.current = true;
        const reward = {
            foundCureVial: typeof vialFoundOverride === 'boolean' ? vialFoundOverride : foundCureVial,
            keepModalOpen: !shouldClose
        };
        await onComplete(mission.id, reward);
        if (shouldClose) {
            onClose();
        }
    };

    const handleReportClick = () => {
        setReporting(true);
        const timeout = setTimeout(() => {
            setReporting(false);
            const vialFound = rollCureVial();
            setFoundCureVial(vialFound);
            setReportSuccess(true);

            if (mission.outcomeText) {
                void commitCompletion(false, vialFound);
            } else {
                const closeTimeout = setTimeout(() => {
                    void commitCompletion(true, vialFound);
                }, 1500);
                flowTimeoutsRef.current.push(closeTimeout);
            }
        }, 3000);
        flowTimeoutsRef.current.push(timeout);
    };

    const handleManualCloseReport = () => {
        if (completionCommittedRef.current) {
            onClose();
            return;
        }
        void commitCompletion(true);
    };

    const handleReactivateClick = () => {
        if (!onReactivate) return;
        onReactivate(mission.id);
        onClose();
    };

    const showOutcome = reportSuccess && mission.outcomeText;
    const foundVialNotice = reportSuccess && foundCureVial;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                onClick={
                    disableClose
                        ? undefined
                        : (reportSuccess ? () => { void commitCompletion(); } : onClose)
                }
            />

            {showPdf && mission.pdfUrl && isPdfAttachment && (
                <DraggablePdfWindow
                    url={mission.pdfUrl}
                    title={`DOC CLASIFICADO: ${mission.title}`}
                    onClose={() => setShowPdf(false)}
                />
            )}

            <div className={`relative w-full max-w-3xl glass-panel shadow-[0_0_80px_rgba(0,0,0,0.6)] flex flex-col max-h-[90vh] overflow-hidden rounded-sm ${isCompleted || reportSuccess ? 'border-emerald-600/50 shadow-emerald-900/10' : 'border-cyan-600/50 shadow-cyan-900/10'}`}>
                <div className={`border-b p-5 flex justify-between items-center relative ${isCompleted || reportSuccess ? 'bg-emerald-900/20 border-emerald-600/50' : 'bg-cyan-900/20 border-cyan-600/50'}`}>
                    <div className={`absolute top-0 left-0 w-32 h-1 ${isCompleted || reportSuccess ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]'}`} />

                    <div className="flex flex-col">
                        <h2 className={`text-xl md:text-2xl font-black tracking-[0.2em] font-mono uppercase ${isCompleted || reportSuccess ? 'text-emerald-400' : 'text-cyan-400'}`}>
                            {isCompleted || reportSuccess ? 'MISSION COMPLETE' : t.title}
                        </h2>
                        <span className="text-[9px] font-mono text-cyan-700/80 tracking-widest font-bold">SERIAL_KEY: {mission.id}</span>
                    </div>

                    <div className="font-bold border-2 px-3 py-1 text-[10px] tracking-widest font-mono text-red-500 border-red-500/50 bg-red-950/20">
                        {isCompleted || reportSuccess ? 'ARCHIVED' : 'TOP SECRET'}
                    </div>
                </div>

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
                            <span className={`px-3 py-1 border rounded-full tracking-tighter ${(mission.missionRole || 'PRIMARY') === 'OPTIONAL' ? 'bg-amber-950/30 border-amber-700/40 text-amber-300' : 'bg-sky-950/30 border-sky-700/40 text-sky-300'}`}>
                                {missionRoleLabel}
                            </span>
                        </div>
                    </div>

                    {showOutcome ? (
                        <div className="animate-fade-in space-y-4">
                            <h4 className="text-[10px] font-black tracking-[0.4em] uppercase text-emerald-500 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-emerald-500/30" /> {t.outcomeTitle}
                            </h4>
                            {foundVialNotice && (
                                <div className="border border-emerald-500/40 bg-emerald-950/30 p-4 text-emerald-200 font-black uppercase tracking-[0.2em] text-sm">
                                    {language === 'es' ? 'HABEIS ENCONTRADO UN VIAL DE CURA' : 'YOU HAVE FOUND A CURE VIAL'}
                                </div>
                            )}
                            <div className="p-6 bg-emerald-950/20 border border-emerald-500/30 text-emerald-100 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium rounded-sm">
                                {mission.outcomeText}
                            </div>
                        </div>
                    ) : (
                        <>
                            {mission.pdfUrl && (
                                <div className="mb-6 animate-fade-in">
                                    <button
                                        onClick={() => {
                                            if (isPdfAttachment) {
                                                setShowPdf(true);
                                                return;
                                            }

                                            window.open(mission.pdfUrl, '_blank', 'noopener,noreferrer');
                                        }}
                                        className="w-full py-3 bg-red-900/20 border border-red-500/50 hover:bg-red-900/40 hover:border-red-500 text-red-300 font-bold tracking-widest flex items-center justify-center gap-3 transition-all group shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                                    >
                                        <span className="text-xl group-hover:scale-110 transition-transform">PDF</span>
                                        <span>{language === 'es' ? 'ABRIR ANEXO CLASIFICADO' : 'OPEN CLASSIFIED ATTACHMENT'}</span>
                                    </button>
                                </div>
                            )}

                            <div className="mb-8 group">
                                <h4 className={`text-[10px] font-black tracking-[0.4em] mb-4 uppercase flex items-center gap-2 ${isCompleted ? 'text-emerald-500' : 'text-cyan-500'}`}>
                                    <span className={`w-8 h-[1px] ${isCompleted ? 'bg-emerald-500/30' : 'bg-cyan-500/30'}`} /> {t.briefing}
                                </h4>
                                {foundVialNotice && (
                                    <div className="mb-4 border border-emerald-500/40 bg-emerald-950/30 px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-200">
                                        {language === 'es' ? 'HABEIS ENCONTRADO UN VIAL DE CURA' : 'YOU HAVE FOUND A CURE VIAL'}
                                    </div>
                                )}
                                <div className="space-y-4 text-sm md:text-base leading-relaxed text-slate-300 font-medium font-sans">
                                    {(isTyping ? typedDescription : mission.description).map((paragraph, index) => (
                                        <p key={index} className={isTyping && index === typedDescription.length - 1 ? "after:content-['_'] after:animate-pulse after:text-cyan-400" : ''}>
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-950/40 border border-white/5 p-6 rounded-sm mb-8">
                                <h4 className={`text-[10px] font-black tracking-[0.4em] mb-6 uppercase flex items-center gap-2 ${isCompleted ? 'text-emerald-500' : 'text-cyan-500'}`}>
                                    <span className={`w-8 h-[1px] ${isCompleted ? 'bg-emerald-500/30' : 'bg-cyan-500/30'}`} /> {t.objectives}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {mission.objectives.map((objective, index) => (
                                        <div key={index} className="flex gap-4 group">
                                            <div className={`w-8 h-8 shrink-0 border-2 rounded-sm flex items-center justify-center text-[10px] font-black transition-all duration-500 ${isCompleted || reportSuccess ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-slate-900 border-slate-700 text-slate-500 group-hover:border-cyan-500 group-hover:text-cyan-400'}`}>
                                                {(isCompleted || reportSuccess) ? 'DONE' : (index + 1).toString().padStart(2, '0')}
                                            </div>
                                            <div className="flex flex-col">
                                                <h5 className={`font-black text-xs tracking-widest uppercase mb-1 transition-colors ${isCompleted || reportSuccess ? 'text-emerald-400' : 'text-white/80 group-hover:text-cyan-400'}`}>
                                                    {objective.title}
                                                </h5>
                                                <p className="text-[11px] text-slate-500 leading-snug font-medium">{objective.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="p-6 border-t border-cyan-900/50 bg-slate-950/40 flex justify-between items-center gap-4">
                    {showOutcome ? (
                        <div className="w-full flex justify-end">
                            <button onClick={handleManualCloseReport} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-600 text-black text-[10px] font-black tracking-[0.3em] transition-all uppercase font-mono">
                                {t.closeReport}
                            </button>
                        </div>
                    ) : (
                        <>
                            {!disableClose && (
                                <button onClick={onClose} disabled={reporting} className="px-6 py-3 border border-cyan-700/50 text-cyan-500 text-[10px] font-black tracking-widest hover:bg-cyan-900/20 hover:text-cyan-300 transition-all disabled:opacity-50 uppercase font-mono">
                                    {t.cancel}
                                </button>
                            )}

                            <div className="flex gap-4 flex-wrap justify-end">
                                {isEditorMode && onEdit && (
                                    <button onClick={() => onEdit(mission)} className="px-6 py-3 border border-cyan-600/50 text-cyan-300 text-[10px] font-black tracking-widest hover:bg-cyan-900/20 transition-all uppercase font-mono">
                                        Editar
                                    </button>
                                )}

                                {isEditorMode && onDelete && (
                                    <button onClick={() => onDelete(mission.id)} className="px-6 py-3 border border-red-600/50 text-red-300 text-[10px] font-black tracking-widest hover:bg-red-900/20 transition-all uppercase font-mono">
                                        Borrar
                                    </button>
                                )}

                                {mission.layoutUrl && (
                                    <button onClick={() => setShowMap(true)} className="px-5 py-3 bg-yellow-600 hover:bg-yellow-500 text-black text-[10px] font-black tracking-widest transition-all flex items-center gap-2 uppercase font-mono">
                                        MAP
                                    </button>
                                )}

                                {isCompleted && onReactivate && (
                                    <button onClick={handleReactivateClick} className="px-6 py-3 border border-yellow-600/50 text-yellow-500 text-[10px] font-black tracking-widest hover:bg-yellow-900/20 hover:text-yellow-300 transition-all uppercase font-mono">
                                        {t.reactivate}
                                    </button>
                                )}

                                <button
                                    disabled={isCompleted || reporting || reportSuccess}
                                    className={`px-8 py-3 text-black text-[10px] font-black tracking-widest border-2 transition-all uppercase font-mono ${isCompleted || reportSuccess ? 'bg-emerald-900/30 border-emerald-800 text-emerald-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 border-emerald-400'} ${reporting ? 'animate-pulse cursor-wait' : ''}`}
                                    onClick={() => { if (!isCompleted) handleReportClick(); }}
                                >
                                    {reporting ? t.sending : (reportSuccess || isCompleted ? `OK ${t.sent}` : t.complete)}
                                </button>

                                {!disableClose && !isCompleted && !reporting && !reportSuccess && (
                                    <button className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black tracking-widest transition-all uppercase font-mono" onClick={onClose}>
                                        {t.accept}
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {showMap && mission.layoutUrl && (
                    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setShowMap(false)}>
                        <div className="relative max-w-full max-h-full flex flex-col items-center">
                            <img src={mission.layoutUrl} alt="Tactical Map" className="max-w-[95vw] max-h-[85vh] object-contain border-2 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.3)]" onClick={(event) => event.stopPropagation()} referrerPolicy="no-referrer" />
                            <button onClick={() => setShowMap(false)} className="mt-4 px-6 py-2 bg-red-900/80 text-white font-bold tracking-widest border border-red-600 hover:bg-red-800">
                                CERRAR VISOR
                            </button>
                        </div>
                    </div>
                )}

                <div className={`absolute bottom-2 right-2 w-4 h-4 border-b border-r ${isCompleted || reportSuccess ? 'border-emerald-500' : 'border-cyan-500'}`} />
                <div className={`absolute bottom-2 left-2 w-4 h-4 border-b border-l ${isCompleted || reportSuccess ? 'border-emerald-500' : 'border-cyan-500'}`} />
            </div>
        </div>
    );
};
