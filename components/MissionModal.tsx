import React, { useState, useEffect } from 'react';
import { Mission } from '../types';
import { translations, Language } from '../translations';

interface MissionModalProps {
  mission: Mission;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (missionId: string) => void;
  onReactivate?: (missionId: string) => void;
  onEdit?: (mission: Mission) => void; 
  language: Language;
  isCompleted?: boolean;
  isEditorMode?: boolean; 
}

export const MissionModal: React.FC<MissionModalProps> = ({ mission, isOpen, onClose, onComplete, onReactivate, onEdit, language, isCompleted, isEditorMode }) => {
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const t = translations[language].missionModal;

  useEffect(() => {
    setReporting(false);
    setReportSuccess(false);
    setShowMap(false);
  }, [mission]);

  if (!isOpen) return null;

  const handleReportClick = () => {
    setReporting(true);
    setTimeout(() => {
      setReporting(false);
      setReportSuccess(true);
      setTimeout(() => {
         onComplete(mission.id);
         onClose();
      }, 1500);
    }, 3000);
  };

  const handleReactivateClick = () => {
      if (onReactivate) {
          onReactivate(mission.id);
          onClose();
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Container */}
      <div className={`relative w-full max-w-3xl bg-slate-900 border-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] overflow-hidden ${isCompleted || reportSuccess ? 'border-emerald-600 shadow-emerald-900/20' : 'border-cyan-600 shadow-cyan-900/20'}`}>
        
        {/* Header */}
        <div className={`border-b p-4 flex justify-between items-center relative ${isCompleted || reportSuccess ? 'bg-emerald-900/40 border-emerald-600' : 'bg-cyan-900/40 border-cyan-600'}`}>
            <div className={`absolute top-0 left-0 w-24 h-1 ${isCompleted || reportSuccess ? 'bg-emerald-400' : 'bg-cyan-400'}`}></div>
            <h2 className={`text-xl md:text-2xl font-bold tracking-widest font-mono uppercase ${isCompleted || reportSuccess ? 'text-emerald-300' : 'text-cyan-300'}`}>
                {isCompleted || reportSuccess ? 'MISSION COMPLETE' : t.title}
            </h2>
            <div className="flex gap-2 items-center">
                {isEditorMode && onEdit && (
                    <button onClick={() => onEdit(mission)} className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] px-2 py-1 font-bold uppercase">EDIT (DB)</button>
                )}
                <div className={`font-bold border px-2 py-0.5 text-xs animate-pulse ${isCompleted || reportSuccess ? 'text-emerald-400 border-emerald-500' : 'text-red-500 border-red-500'}`}>
                    {isCompleted || reportSuccess ? 'ARCHIVED' : 'TOP SECRET'}
                </div>
            </div>
        </div>

        {/* Content Scrollable Area */}
        <div className="p-6 overflow-y-auto font-mono text-cyan-100 scrollbar-thin scrollbar-thumb-cyan-700 scrollbar-track-slate-900">
            
            {/* Mission Title & Location */}
            <div className="mb-6 border-b border-cyan-800 pb-4">
                <div className="flex justify-between items-end mb-2">
                    <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                        {mission.title}
                    </h3>
                    <div className="text-right">
                         <div className="text-[10px] text-cyan-500 uppercase">{t.threat}</div>
                         <div className={`text-sm md:text-base font-bold ${isCompleted ? 'text-emerald-500' : 'text-red-500'}`}>{isCompleted ? 'NEUTRALIZED' : mission.threatLevel}</div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-cyan-400 mb-2">
                    <span className="bg-cyan-900/50 px-2 py-0.5 rounded border border-cyan-800">LOC: {mission.location.state.toUpperCase()}</span>
                    <span className="bg-cyan-900/50 px-2 py-0.5 rounded border border-cyan-800">COORDS: {mission.location.coordinates[1].toFixed(4)}, {mission.location.coordinates[0].toFixed(4)}</span>
                </div>

                {/* REQUISITOS DE EXPANSIÓN */}
                {mission.requirements && mission.requirements.length > 0 && (
                    <div className="mt-3">
                        <div className="text-[9px] text-cyan-600 font-bold uppercase mb-1 tracking-widest">REQUISITOS TÁCTICOS (EXPANSIONES)</div>
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

            {/* Briefing */}
            <div className="mb-6">
                <h4 className={`text-xs font-bold tracking-[0.2em] mb-3 border-l-2 pl-2 uppercase ${isCompleted ? 'text-emerald-500 border-emerald-500' : 'text-cyan-500 border-cyan-500'}`}>
                    {t.briefing}
                </h4>
                <div className="space-y-3 text-sm md:text-base leading-relaxed text-gray-300">
                    {mission.description.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
            </div>

            {/* Objectives */}
            <div className="bg-slate-950/50 border border-cyan-900/50 p-4 rounded-sm mb-6">
                <h4 className={`text-xs font-bold tracking-[0.2em] mb-4 border-l-2 pl-2 uppercase ${isCompleted ? 'text-emerald-500 border-emerald-500' : 'text-cyan-500 border-cyan-500'}`}>
                     {t.objectives}
                </h4>
                <div className="space-y-4">
                    {mission.objectives.map((obj, idx) => (
                        <div key={idx} className="flex gap-3">
                            <div className={`w-6 h-6 shrink-0 border rounded-full flex items-center justify-center text-xs font-bold ${isCompleted || reportSuccess ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400' : 'bg-red-900/30 border-red-500 text-red-400'}`}>
                                {isCompleted || reportSuccess ? '✓' : idx + 1}
                            </div>
                            <div>
                                <h5 className={`font-bold text-sm mb-1 ${isCompleted || reportSuccess ? 'text-emerald-300' : 'text-red-300'}`}>{obj.title}</h5>
                                <p className="text-xs md:text-sm text-gray-400">{obj.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-cyan-800 bg-slate-900/90 flex justify-between items-center gap-4">
            <button 
                onClick={onClose}
                disabled={reporting}
                className="px-6 py-3 border border-cyan-700 text-cyan-500 text-xs font-bold tracking-widest hover:bg-cyan-900/20 hover:text-cyan-300 transition-colors disabled:opacity-50"
            >
                {t.cancel}
            </button>
            
            <div className="flex gap-3">
                {/* BOTÓN AMARILLO: VER DETALLE (MAPA) */}
                {mission.layoutUrl && (
                    <button 
                        onClick={() => setShowMap(true)}
                        className="px-4 py-3 bg-yellow-600 hover:bg-yellow-500 text-black text-xs font-black tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-all flex items-center gap-2"
                    >
                        <span>🗺️</span> VER DETALLE DE LA MISIÓN
                    </button>
                )}

                {isCompleted && onReactivate && (
                    <button 
                        onClick={handleReactivateClick}
                        className="px-6 py-3 border border-yellow-600 text-yellow-500 text-xs font-bold tracking-widest hover:bg-yellow-900/20 hover:text-yellow-300 transition-colors"
                    >
                        {t.reactivate}
                    </button>
                )}

                <button 
                    disabled={isCompleted || reporting || reportSuccess}
                    className={`px-6 py-3 text-white text-xs font-bold tracking-widest border shadow transition-all
                        ${isCompleted || reportSuccess
                            ? 'bg-emerald-900/50 border-emerald-800 text-emerald-500 cursor-not-allowed' 
                            : 'bg-emerald-700/80 hover:bg-emerald-600 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'}
                        ${reporting ? 'animate-pulse cursor-wait' : ''}
                    `}
                    onClick={() => {
                        if(!isCompleted) {
                            handleReportClick();
                        }
                    }}
                >
                    {reporting ? t.sending : (reportSuccess || isCompleted ? `✓ ${t.sent}` : t.complete)}
                </button>
                
                {!isCompleted && !reporting && !reportSuccess && (
                    <button 
                        className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
                        onClick={onClose}
                    >
                        {t.accept}
                    </button>
                )}
            </div>
        </div>

        {/* --- VISOR DE MAPA (LIGHTBOX) --- */}
        {showMap && mission.layoutUrl && (
            <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setShowMap(false)}>
                <div className="relative max-w-full max-h-full flex flex-col items-center">
                    <img 
                        src={mission.layoutUrl} 
                        alt="Tactical Map" 
                        className="max-w-[95vw] max-h-[85vh] object-contain border-2 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.3)]"
                        onClick={(e) => e.stopPropagation()} 
                    />
                    <div className="mt-4 flex gap-4">
                        <button 
                            onClick={() => setShowMap(false)}
                            className="px-6 py-2 bg-red-900/80 text-white font-bold tracking-widest border border-red-600 hover:bg-red-800"
                        >
                            CERRAR VISOR
                        </button>
                        <a 
                            href={mission.layoutUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-6 py-2 bg-cyan-900/80 text-white font-bold tracking-widest border border-cyan-600 hover:bg-cyan-800"
                            onClick={(e) => e.stopPropagation()}
                        >
                            ABRIR ORIGINAL ↗
                        </a>
                    </div>
                </div>
            </div>
        )}

        {/* Decor Lines */}
        <div className={`absolute bottom-2 right-2 w-4 h-4 border-b border-r ${isCompleted || reportSuccess ? 'border-emerald-500' : 'border-cyan-500'}`}></div>
        <div className={`absolute bottom-2 left-2 w-4 h-4 border-b border-l ${isCompleted || reportSuccess ? 'border-emerald-500' : 'border-cyan-500'}`}></div>

      </div>
    </div>
  );
};