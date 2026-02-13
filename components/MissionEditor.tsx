import React, { useState, useEffect } from 'react';
import { translations, Language } from '../translations';
import { Mission, Objective, WorldStage, MissionType } from '../types';
import { createMissionInDB, updateMissionInDB } from '../services/missionService';
import { GAME_EXPANSIONS } from '../data/gameContent';

interface MissionEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (mission: Mission) => void;
    language: Language;
    initialData?: Mission | null;
    existingMissions?: Mission[];
}

const STATE_CENTERS: Record<string, [number, number]> = {
    'Alabama': [-86.9, 32.8], 'Alaska': [-152.4, 61.3], 'Arizona': [-111.4, 34.0], 'Arkansas': [-92.3, 34.9],
    'California': [-119.6, 36.1], 'Colorado': [-105.3, 39.0], 'Connecticut': [-72.7, 41.6], 'Delaware': [-75.5, 39.3],
    'District of Columbia': [-77.0, 38.9], 'Florida': [-81.6, 27.7], 'Georgia': [-83.6, 33.0], 'Hawaii': [-157.5, 20.5],
    'Idaho': [-114.4, 44.2], 'Illinois': [-89.0, 40.3], 'Indiana': [-86.1, 40.2], 'Iowa': [-93.2, 42.0],
    'Kansas': [-96.7, 38.5], 'Kentucky': [-84.2, 37.6], 'Louisiana': [-91.8, 31.1], 'Maine': [-69.3, 45.3],
    'Maryland': [-76.8, 39.0], 'Massachusetts': [-71.5, 42.2], 'Michigan': [-84.5, 43.3], 'Minnesota': [-94.6, 45.6],
    'Mississippi': [-89.6, 32.7], 'Missouri': [-92.2, 38.4], 'Montana': [-110.4, 46.9], 'Nebraska': [-99.9, 41.1],
    'Nevada': [-117.0, 38.8], 'New Hampshire': [-71.5, 43.4], 'New Jersey': [-74.5, 40.2], 'New Mexico': [-106.2, 34.8],
    'New York': [-74.9, 42.1], 'North Carolina': [-79.8, 35.6], 'North Dakota': [-99.9, 47.5], 'Ohio': [-82.7, 40.3],
    'Oklahoma': [-96.9, 35.5], 'Oregon': [-120.6, 44.0], 'Pennsylvania': [-77.2, 40.5], 'Rhode Island': [-71.5, 41.6],
    'South Carolina': [-80.9, 33.8], 'South Dakota': [-99.9, 44.2], 'Tennessee': [-86.3, 35.7], 'Texas': [-97.5, 31.0],
    'Utah': [-111.8, 39.2], 'Vermont': [-72.7, 44.0], 'Virginia': [-78.1, 37.7], 'Washington': [-120.7, 47.4],
    'West Virginia': [-80.9, 38.4], 'Wisconsin': [-89.6, 44.2], 'Wyoming': [-107.3, 42.7]
};

const STATES_LIST = Object.keys(STATE_CENTERS).sort();

const THREAT_LEVELS = [
    "Infección latente (Fácil)",
    "Hambre insaciable (Intermedia)",
    "Plaga desatada (Difícil)",
    "Apocalipsis Gamma (Muy difícil)"
];

export const MissionEditor: React.FC<MissionEditorProps> = ({ isOpen, onClose, onSave, language, initialData, existingMissions = [] }) => {
    const t = translations[language].missionEditor;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [outcomeText, setOutcomeText] = useState('');
    const [locationState, setLocationState] = useState(STATES_LIST[0]);
    const [threatLevel, setThreatLevel] = useState(THREAT_LEVELS[1]);
    const [type, setType] = useState<MissionType>('STANDARD');
    const [alignment, setAlignment] = useState<'ALIVE' | 'ZOMBIE' | 'BOTH'>('BOTH');
    const [isIntroMission, setIsIntroMission] = useState(false);

    const [triggerStage, setTriggerStage] = useState<WorldStage>('NORMAL');

    const [prereqs, setPrereqs] = useState<string[]>([]);
    const [selectedPrereqToAdd, setSelectedPrereqToAdd] = useState('');

    const [objectives, setObjectives] = useState<Objective[]>([{ title: '', desc: '' }]);

    const [requirements, setRequirements] = useState<string[]>([]);
    const [selectedExpansionId, setSelectedExpansionId] = useState(GAME_EXPANSIONS[0].id);

    const [layoutUrl, setLayoutUrl] = useState('');
    const [pdfUrl, setPdfUrl] = useState(''); // NUEVO ESTADO
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description.join('\n'));
            setOutcomeText(initialData.outcomeText || '');
            setLocationState(initialData.location.state);
            setThreatLevel(initialData.threatLevel || THREAT_LEVELS[1]);
            setType(initialData.type || 'STANDARD');
            setAlignment(initialData.alignment || 'BOTH');
            setTriggerStage(initialData.triggerStage || 'NORMAL');
            setIsIntroMission(initialData.isIntroMission || false);

            if (initialData.prereqs && initialData.prereqs.length > 0) {
                setPrereqs(initialData.prereqs);
            } else if (initialData.prereq) {
                setPrereqs([initialData.prereq]);
            } else {
                setPrereqs([]);
            }

            setObjectives(initialData.objectives.length > 0 ? initialData.objectives : [{ title: '', desc: '' }]);
            setRequirements(initialData.requirements || []);
            setLayoutUrl(initialData.layoutUrl || '');
            setPdfUrl(initialData.pdfUrl || ''); // CARGAR PDF
        } else {
            setTitle('');
            setDescription('');
            setOutcomeText('');
            setLocationState(STATES_LIST[0]);
            setThreatLevel(THREAT_LEVELS[1]);
            setType('STANDARD');
            setAlignment('BOTH');
            setIsIntroMission(false);
            setTriggerStage('NORMAL');
            setPrereqs([]);
            setObjectives([{ title: '', desc: '' }]);
            setRequirements([]);
            setLayoutUrl('');
            setPdfUrl('');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleAddObjective = () => {
        setObjectives([...objectives, { title: '', desc: '' }]);
    };

    const handleObjectiveChange = (index: number, field: 'title' | 'desc', value: string) => {
        const newObjs = [...objectives];
        newObjs[index] = { ...newObjs[index], [field]: value };
        setObjectives(newObjs);
    };

    const handleAddRequirement = () => {
        if (!requirements.includes(selectedExpansionId)) {
            setRequirements([...requirements, selectedExpansionId]);
        }
    };

    const handleRemoveRequirement = (reqIdToRemove: string) => {
        setRequirements(requirements.filter(r => r !== reqIdToRemove));
    };

    const handleAddPrereq = () => {
        if (selectedPrereqToAdd && !prereqs.includes(selectedPrereqToAdd)) {
            setPrereqs([...prereqs, selectedPrereqToAdd]);
            setSelectedPrereqToAdd('');
        }
    };

    const handleRemovePrereq = (idToRemove: string) => {
        setPrereqs(prereqs.filter(id => id !== idToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        let finalCoordinates: [number, number];
        if (initialData && initialData.location.state === locationState) {
            finalCoordinates = initialData.location.coordinates;
        } else {
            const center = STATE_CENTERS[locationState] || [-98.5, 39.8];
            const jitterX = (Math.random() - 0.5) * 2.0;
            const jitterY = (Math.random() - 0.5) * 1.5;
            finalCoordinates = [center[0] + jitterX, center[1] + jitterY];
        }

        const missionPayload: any = {
            title,
            description: description.split('\n').filter(p => p.trim() !== ''),
            outcomeText: outcomeText.trim() || null,
            location: { state: locationState, coordinates: finalCoordinates },
            threatLevel,
            type,
            alignment,
            isIntroMission,
            triggerStage: type === 'GALACTUS' ? triggerStage : null,
            objectives: objectives.filter(o => o.title && o.desc),
            prereq: prereqs.length > 0 ? prereqs[0] : null,
            prereqs: prereqs,
            requirements,
            layoutUrl: layoutUrl.trim() || null,
            pdfUrl: pdfUrl.trim() || null, // GUARDAR PDF
        };

        try {
            if (initialData && initialData.id) {
                await updateMissionInDB(initialData.id, missionPayload);
                onSave({ ...missionPayload, id: initialData.id });
            } else {
                const id = await createMissionInDB(missionPayload);
                onSave({ ...missionPayload, id });
            }
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to save mission: " + (error as any).message);
        } finally {
            setSaving(false);
        }
    };

    const validPrereqOptions = existingMissions.filter(m => {
        if (initialData && m.id === initialData.id) return false;
        if (prereqs.includes(m.id)) return false;

        const mAlign = m.alignment || 'ALIVE';
        if (alignment === 'BOTH') return true;
        if (mAlign === 'BOTH') return true;
        return mAlign === alignment;
    });

    const getExpansionName = (id: string) => {
        const exp = GAME_EXPANSIONS.find(e => e.id === id);
        return exp ? exp.name : id;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl bg-slate-900 border-2 border-cyan-500 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="bg-cyan-900/40 p-4 border-b border-cyan-600 flex justify-between items-center">
                    <h3 className="text-cyan-300 font-bold tracking-widest uppercase">
                        {initialData ? `EDITING: ${initialData.title}` : t.title}
                    </h3>
                    <button onClick={onClose} className="text-cyan-500 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto font-mono flex flex-col gap-4 scrollbar-thin scrollbar-thumb-cyan-900">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-cyan-600 font-bold block mb-1 uppercase">{t.missionTitle}</label>
                                <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200 focus:border-cyan-400 outline-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] text-cyan-600 font-bold block mb-1 uppercase">{t.location}</label>
                                    <select value={locationState} onChange={e => setLocationState(e.target.value)} className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200">
                                        {STATES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-cyan-600 font-bold block mb-1 uppercase">{t.threat}</label>
                                    <select value={threatLevel} onChange={e => setThreatLevel(e.target.value)} className="w-full bg-slate-950 border border-cyan-800 p-2 text-yellow-400 font-bold">
                                        {THREAT_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] text-cyan-600 font-bold block mb-1 uppercase">{t.type}</label>
                                    <select value={type} onChange={e => setType(e.target.value as MissionType)} className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200">
                                        <option value="STANDARD">STANDARD</option>
                                        <option value="INTRODUCTORY">INTRODUCTORIA (VERDE)</option>
                                        <option value="SHIELD_BASE">BASE S.H.I.E.L.D.</option>
                                        <option value="BOSS_KINGPIN">BOSS - KINGPIN</option>
                                        <option value="BOSS_MAGNETO">BOSS - MAGNETO</option>
                                        <option value="BOSS_DOOM">BOSS - DOOM</option>
                                        <option value="BOSS_HULK">BOSS - HULK</option>
                                        <option value="GALACTUS">EVENTO GALACTUS</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-cyan-600 font-bold block mb-1 uppercase">MODO</label>
                                    <select
                                        value={alignment}
                                        onChange={e => { setAlignment(e.target.value as any); setPrereqs([]); }}
                                        className="w-full bg-slate-950 border border-cyan-800 p-2 text-white font-bold"
                                    >
                                        <option value="ALIVE">🛡️ HÉROES</option>
                                        <option value="ZOMBIE">🧟 ZOMBIES</option>
                                        <option value="BOTH">⚖️ AMBOS</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 border border-emerald-500/50 bg-emerald-900/10">
                                <input
                                    type="checkbox"
                                    id="isIntro"
                                    checked={isIntroMission}
                                    onChange={e => setIsIntroMission(e.target.checked)}
                                    className="w-5 h-5 accent-emerald-500 cursor-pointer"
                                />
                                <div>
                                    <label htmlFor="isIntro" className="text-xs font-bold text-emerald-400 cursor-pointer uppercase">ES MISIÓN INICIAL (INTRO)</label>
                                    <div className="text-[9px] text-emerald-600">Aparecerá automáticamente tras la intro.</div>
                                </div>
                            </div>

                            {type === 'GALACTUS' && (
                                <div className="bg-purple-900/20 border border-purple-500/50 p-2 animate-fade-in">
                                    <label className="text-[10px] text-purple-400 font-bold block mb-1 uppercase">ETAPA DE ACTIVACIÓN</label>
                                    <select
                                        value={triggerStage}
                                        onChange={e => setTriggerStage(e.target.value as WorldStage)}
                                        className="w-full bg-slate-950 border border-purple-500 p-2 text-purple-200 font-bold"
                                    >
                                        <option value="SURFER">LLEGADA DE SILVER SURFER (ETAPA 2)</option>
                                        <option value="GALACTUS">LLEGADA DE GALACTUS (ETAPA 3)</option>
                                    </select>
                                </div>
                            )}

                            <div className="bg-slate-900/50 border border-cyan-900/30 p-3">
                                <label className="text-[10px] text-cyan-600 font-bold block mb-2 uppercase">{t.prereq} (MÚLTIPLES)</label>
                                <div className="flex gap-2 mb-2">
                                    <select
                                        value={selectedPrereqToAdd}
                                        onChange={e => setSelectedPrereqToAdd(e.target.value)}
                                        className="flex-1 bg-slate-950 border border-cyan-800 p-2 text-xs text-cyan-200 min-w-0"
                                    >
                                        <option value="">-- SELECCIONAR MISIÓN --</option>
                                        {validPrereqOptions.map(m => (
                                            <option key={m.id} value={m.id}>
                                                {m.title} (ID: {m.id})
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={handleAddPrereq}
                                        disabled={!selectedPrereqToAdd}
                                        className="bg-cyan-900/50 border border-cyan-600 text-cyan-300 px-3 py-1 text-[10px] font-bold uppercase disabled:opacity-50 shrink-0"
                                    >
                                        + AÑADIR
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {prereqs.map((pid) => {
                                        const m = existingMissions.find(em => em.id === pid);
                                        return (
                                            <div key={pid} className="flex items-center gap-2 bg-cyan-950 border border-cyan-800 px-2 py-1 rounded">
                                                <span className="text-[10px] text-cyan-300 truncate max-w-[150px]">{m ? m.title : pid}</span>
                                                <button type="button" onClick={() => handleRemovePrereq(pid)} className="text-red-400 font-bold hover:text-red-200">×</button>
                                            </div>
                                        );
                                    })}
                                    {prereqs.length === 0 && <span className="text-[10px] text-gray-600 italic">Sin requisitos previos</span>}
                                </div>
                            </div>

                            <div className="bg-slate-900/50 border border-blue-900/30 p-3">
                                <label className="text-[10px] text-blue-400 font-bold block mb-2 uppercase">REQUISITOS (EXPANSIONES)</label>
                                <div className="flex gap-2 mb-2">
                                    <select
                                        value={selectedExpansionId}
                                        onChange={e => setSelectedExpansionId(e.target.value)}
                                        className="flex-1 bg-slate-950 border border-blue-800 p-2 text-xs text-blue-200 min-w-0"
                                    >
                                        {GAME_EXPANSIONS.map(exp => (
                                            <option key={exp.id} value={exp.id}>{exp.name}</option>
                                        ))}
                                    </select>
                                    <button type="button" onClick={handleAddRequirement} className="bg-blue-900/50 border border-blue-600 text-blue-300 px-3 py-1 text-[10px] font-bold uppercase shrink-0">+ AÑADIR</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {requirements.map((reqId, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-blue-950 border border-blue-800 px-2 py-1 rounded">
                                            <span className="text-[10px] text-blue-300">{getExpansionName(reqId)}</span>
                                            <button type="button" onClick={() => handleRemoveRequirement(reqId)} className="text-red-400 font-bold">×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-900/50 border border-cyan-900/30 p-3">
                                <label className="text-[10px] text-cyan-500 font-bold block mb-2 uppercase">RECURSOS EXTERNOS</label>
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-[9px] text-cyan-700 block mb-1">URL IMAGEN MAPA (LAYOUT)</label>
                                        <input value={layoutUrl} onChange={e => setLayoutUrl(e.target.value)} placeholder="https://..." className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200 text-xs" />
                                    </div>
                                    {/* --- NUEVO CAMPO PDF --- */}
                                    <div>
                                        <label className="text-[9px] text-cyan-700 block mb-1">URL ARCHIVO PDF (MISIÓN)</label>
                                        <input value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} placeholder="https://... (Drive/Dropbox/Direct Link)" className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200 text-xs" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-cyan-600 font-bold block mb-1 uppercase">{t.description} (FLAVOR TEXT)</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={8} className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200 text-xs" />
                            </div>

                            <div>
                                <label className="text-[10px] text-emerald-600 font-bold block mb-1 uppercase">{t.outcome}</label>
                                <textarea
                                    value={outcomeText}
                                    onChange={e => setOutcomeText(e.target.value)}
                                    rows={4}
                                    placeholder="Texto que aparecerá al completar la misión..."
                                    className="w-full bg-slate-950 border border-emerald-800 p-2 text-emerald-200 text-xs focus:border-emerald-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-950/50 p-4 border border-cyan-900/50 mt-2">
                        <div className="flex justify-between mb-2">
                            <label className="text-[10px] text-cyan-600 font-bold uppercase">{t.objectives}</label>
                            <button type="button" onClick={handleAddObjective} className="text-[10px] text-cyan-400 hover:text-white border border-cyan-700 px-2 uppercase">+ {t.addObjective}</button>
                        </div>
                        {objectives.map((obj, i) => (
                            <div key={i} className="mb-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                <input placeholder={t.objTitle} value={obj.title} onChange={e => handleObjectiveChange(i, 'title', e.target.value)} className="bg-slate-900 border border-cyan-900 p-1 text-xs text-cyan-200" />
                                <input placeholder={t.objDesc} value={obj.desc} onChange={e => handleObjectiveChange(i, 'desc', e.target.value)} className="bg-slate-900 border border-cyan-900 p-1 text-xs text-gray-400" />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-cyan-800">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-red-900 text-red-500 text-xs font-bold uppercase hover:bg-red-900/20">{t.cancel}</button>
                        <button type="submit" disabled={saving} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
                            {saving ? 'GUARDANDO...' : t.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};