import React, { useState, useEffect } from 'react';
import { translations, Language } from '../translations';
import { Mission, Objective, WorldStage, MissionType, MissionStatus, MissionRole } from '../types';
import { createMissionInDB, updateMissionInDB } from '../services/missionService';
import { fetchMissionPdfOptions, MissionPdfOption } from '../services/missionPdfRepositoryService';
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
    const [status, setStatus] = useState<MissionStatus>('DRAFT');
    const [missionRole, setMissionRole] = useState<MissionRole>('PRIMARY');
    const [cureVialChance, setCureVialChance] = useState(0);
    const [guaranteedCureVial, setGuaranteedCureVial] = useState(false);

    const [triggerStage, setTriggerStage] = useState<WorldStage>('NORMAL');

    const [prereqs, setPrereqs] = useState<string[]>([]);
    const [selectedPrereqToAdd, setSelectedPrereqToAdd] = useState('');

    const [objectives, setObjectives] = useState<Objective[]>([{ title: '', desc: '' }]);

    const [requirements, setRequirements] = useState<string[]>([]);
    const [selectedExpansionId, setSelectedExpansionId] = useState(GAME_EXPANSIONS[0].id);

    const [layoutUrl, setLayoutUrl] = useState('');
    const [pdfUrl, setPdfUrl] = useState(''); // NUEVO ESTADO
    const [saving, setSaving] = useState(false);
    const [isPdfPickerOpen, setIsPdfPickerOpen] = useState(false);
    const [pdfPickerLoading, setPdfPickerLoading] = useState(false);
    const [pdfPickerError, setPdfPickerError] = useState('');
    const [pdfPickerQuery, setPdfPickerQuery] = useState('');
    const [repoPdfOptions, setRepoPdfOptions] = useState<MissionPdfOption[]>([]);

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
            setStatus(initialData.status || 'DRAFT');
            setMissionRole(initialData.missionRole || 'PRIMARY');
            setCureVialChance(initialData.cureVialChance ?? 0);
            setGuaranteedCureVial(initialData.guaranteedCureVial || false);

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
            setStatus('DRAFT');
            setMissionRole('PRIMARY');
            setCureVialChance(0);
            setGuaranteedCureVial(false);
            setTriggerStage('NORMAL');
            setPrereqs([]);
            setObjectives([{ title: '', desc: '' }]);
            setRequirements([]);
            setLayoutUrl('');
            setPdfUrl('');
        }

        setIsPdfPickerOpen(false);
        setPdfPickerError('');
        setPdfPickerQuery('');
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

    const handleOpenPdfPicker = async () => {
        setIsPdfPickerOpen(true);
        setPdfPickerError('');
        setPdfPickerLoading(true);

        try {
            const options = await fetchMissionPdfOptions();
            setRepoPdfOptions(options);
        } catch (error) {
            setPdfPickerError((error as Error).message || 'No se pudo cargar la lista de PDFs.');
        } finally {
            setPdfPickerLoading(false);
        }
    };

    const handleSelectRepoPdf = (option: MissionPdfOption) => {
        setPdfUrl(option.url);
        setIsPdfPickerOpen(false);
        setPdfPickerQuery('');
        setPdfPickerError('');
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
            status,
            triggerStage: type === 'GALACTUS' ? triggerStage : null,
            objectives: objectives.filter(o => o.title && o.desc),
            prereq: prereqs.length > 0 ? prereqs[0] : null,
            prereqs: prereqs,
            requirements,
            missionRole: isLockedPrimaryMission ? 'PRIMARY' : missionRole,
            layoutUrl: layoutUrl.trim() || null,
            pdfUrl: pdfUrl.trim() || null, // GUARDAR PDF
            cureVialChance: guaranteedCureVial ? 100 : cureVialChance,
            guaranteedCureVial,
            isProtected: initialData?.isProtected || false,
            mapPosition: initialData?.mapPosition || null
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

    const isZombie = alignment === 'ZOMBIE';
    const isBoth = alignment === 'BOTH';
    const isLockedPrimaryMission = !!initialData && (
        initialData.id === 'm_intro_0'
        || (initialData.alignment === 'ZOMBIE' && initialData.isIntroMission === true)
        || initialData.title.toUpperCase().includes('MZ0')
    );
    const themeColor = isZombie ? 'lime' : (isBoth ? 'yellow' : 'cyan');
    const accentClass = isZombie ? 'text-lime-500' : (isBoth ? 'text-yellow-500' : 'text-cyan-500');
    const borderClass = isZombie ? 'border-lime-800' : (isBoth ? 'border-yellow-800' : 'border-cyan-800');
    const focusClass = isZombie ? 'focus:border-lime-400' : (isBoth ? 'focus:border-yellow-400' : 'focus:border-cyan-400');
    const bgHeaderClass = isZombie ? 'bg-lime-900/40' : (isBoth ? 'bg-yellow-900/40' : 'bg-cyan-900/40');
    const buttonClass = isZombie ? 'bg-lime-600 hover:bg-lime-500' : (isBoth ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-cyan-600 hover:bg-cyan-500');
    const filteredPdfOptions = repoPdfOptions.filter(option => {
        if (!pdfPickerQuery.trim()) return true;
        const normalizedQuery = pdfPickerQuery.trim().toLowerCase();
        return option.name.toLowerCase().includes(normalizedQuery) || option.path.toLowerCase().includes(normalizedQuery);
    });

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in overflow-hidden">
            <div className={`w-full max-w-7xl glass-panel shadow-2xl flex flex-col max-h-[95vh] relative rounded-sm border-t-2 ${isZombie ? 'border-lime-500 shadow-lime-900/20' : (isBoth ? 'border-yellow-500 shadow-yellow-900/20' : 'border-cyan-500 shadow-cyan-900/20')}`}>

                <div className={`${bgHeaderClass} p-4 border-b ${borderClass} flex justify-between items-center`}>
                    <div className="flex items-center gap-4">
                        <div className={`text-2xl ${accentClass} font-black animate-pulse`}>
                            {isZombie ? '☣' : (isBoth ? '⚖' : '🛡️')}
                        </div>
                        <h3 className={`${accentClass} font-black tracking-[0.2em] uppercase text-sm`}>
                            {initialData ? `MODIFICANDO PROTOCOLO DE MISIÓN: ${initialData.title}` : 'ESTABLECER NUEVA OPERACIÓN TÁCTICA'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <span className="text-xs mr-2 font-mono">[ESC]</span> ✕
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden font-mono">
                    {/* FORMULARIO */}
                    <form onSubmit={handleSubmit} className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 scrollbar-thin scrollbar-thumb-slate-800 border-r border-slate-800">
                        <div className="grid grid-cols-2 gap-6">
                            {/* COLUMNA 1: BÁSICOS */}
                            <div className="space-y-6">
                                <div>
                                    <label className={`text-[10px] ${accentClass} font-black block mb-1 uppercase tracking-widest`}>NOMBRE DEL OPERATIVO</label>
                                    <input value={title} onChange={e => setTitle(e.target.value)} required className={`w-full bg-slate-950 border ${borderClass} p-2 text-white ${focusClass} outline-none transition-all uppercase`} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={`text-[10px] ${accentClass} font-black block mb-1 uppercase tracking-widest`}>CLASIFICACIÓN</label>
                                        <select value={type} onChange={e => setType(e.target.value as MissionType)} className={`w-full bg-slate-950 border ${borderClass} p-2 text-white outline-none cursor-pointer text-xs`}>
                                            <option value="STANDARD">ESTÁNDAR</option>
                                            <option value="INTRODUCTORY">INTRODUCTORIA</option>
                                            <option value="SHIELD_BASE">BASE S.H.I.E.L.D.</option>
                                            <option value="BOSS_KINGPIN">JEFE: KINGPIN</option>
                                            <option value="BOSS_MAGNETO">JEFE: MAGNETO</option>
                                            <option value="BOSS_DOOM">JEFE: DOOM</option>
                                            <option value="BOSS_HULK">JEFE: HULK</option>
                                            <option value="GALACTUS">LLEGADA DE GALACTUS</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`text-[10px] ${accentClass} font-black block mb-1 uppercase tracking-widest`}>BANDO OPERATIVO</label>
                                        <select value={alignment} onChange={e => setAlignment(e.target.value as any)} className={`w-full bg-slate-950 border ${borderClass} p-2 text-white font-black outline-none cursor-pointer text-xs`}>
                                            <option value="ALIVE">🛡️ HÉROES (HUMANOS)</option>
                                            <option value="ZOMBIE">🧟 ZOMBIES (INFECTADOS)</option>
                                            <option value="BOTH">⚖️ AMBOS (COOPERATIVO)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className={`text-[10px] ${accentClass} font-black block mb-1 uppercase tracking-widest`}>NIVEL DE AMENAZA BIOLÓGICA</label>
                                    <select value={threatLevel} onChange={e => setThreatLevel(e.target.value)} className={`w-full bg-slate-950 border ${borderClass} p-2 text-yellow-500 font-bold outline-none cursor-pointer text-xs`}>
                                        {THREAT_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className={`text-[10px] ${accentClass} font-black block mb-1 uppercase tracking-widest`}>ESTADO DE PUBLICACION</label>
                                    <select value={status} onChange={e => setStatus(e.target.value as MissionStatus)} className={`w-full bg-slate-950 border ${borderClass} p-2 text-white font-bold outline-none cursor-pointer text-xs`}>
                                        <option value="DRAFT">BORRADOR</option>
                                        <option value="PUBLISHED">PUBLICADA</option>
                                    </select>
                                </div>

                                <div className="bg-slate-900/30 border border-emerald-900/40 p-4 space-y-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <label className="text-[10px] text-emerald-400 font-black block uppercase tracking-widest">VIALES DE CURA</label>
                                        <span className="text-[9px] uppercase tracking-[0.22em] text-slate-500">MAX 15 EN PARTIDA</span>
                                    </div>

                                    <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-300 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={guaranteedCureVial}
                                            onChange={(event) => setGuaranteedCureVial(event.target.checked)}
                                            className="h-4 w-4 accent-emerald-500"
                                        />
                                        Vial asegurado
                                    </label>

                                    <div>
                                        <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Posibilidad vial (%)
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            step={5}
                                            value={cureVialChance}
                                            onChange={(event) => setCureVialChance(Number(event.target.value || 0))}
                                            disabled={guaranteedCureVial}
                                            className="w-full bg-slate-950 border border-emerald-800 p-2 text-white outline-none transition-all disabled:opacity-50"
                                        />
                                    </div>

                                    <div className="text-[10px] leading-relaxed text-slate-400">
                                        Si esta misión entrega vial, se sumará automáticamente al búnker al completarla.
                                    </div>
                                </div>

                                <div>
                                    <label className={`text-[10px] ${accentClass} font-black block mb-1 uppercase tracking-widest`}>PESO EN LA CAMPAÑA</label>
                                    <select
                                        value={isLockedPrimaryMission ? 'PRIMARY' : missionRole}
                                        onChange={e => setMissionRole(e.target.value as MissionRole)}
                                        disabled={isLockedPrimaryMission}
                                        className={`w-full bg-slate-950 border ${borderClass} p-2 text-white font-bold outline-none cursor-pointer text-xs disabled:opacity-60 disabled:cursor-not-allowed`}
                                    >
                                        <option value="PRIMARY">PRINCIPAL</option>
                                        <option value="OPTIONAL">SECUNDARIA OPCIONAL</option>
                                    </select>
                                    {isLockedPrimaryMission && (
                                        <div className="mt-2 text-[10px] text-emerald-400 uppercase tracking-widest">
                                            MH0 y MZ0 siempre son principales.
                                        </div>
                                    )}
                                </div>

                                <div className={`p-4 border ${isIntroMission ? 'border-emerald-500 bg-emerald-900/10' : 'border-slate-800 bg-slate-900/20'} flex items-center gap-4 transition-all`}>
                                    <input type="checkbox" id="isIntro" checked={isIntroMission} onChange={e => setIsIntroMission(e.target.checked)} className="w-5 h-5 accent-emerald-500 cursor-pointer" />
                                    <label htmlFor="isIntro" className={`text-[10px] font-black ${isIntroMission ? 'text-emerald-400' : 'text-gray-500'} cursor-pointer uppercase tracking-tighter`}>
                                        ESTABLECER COMO MISIÓN DE INICIO (AUTO-DESPLIEGUE)
                                    </label>
                                </div>

                                {/* REQUISITOS */}
                                <div className="bg-slate-900/30 border border-slate-800 p-4 space-y-4">
                                    <label className="text-[10px] text-cyan-600 font-black block uppercase tracking-widest">CADENA DE MANDO (PRERREQUISITOS)</label>
                                    <div className="flex gap-2">
                                        <select value={selectedPrereqToAdd} onChange={e => setSelectedPrereqToAdd(e.target.value)} className="flex-1 bg-black border border-slate-800 p-2 text-[10px] text-gray-400 outline-none">
                                            <option value="">-- VINCULAR CON MISIÓN ANTERIOR --</option>
                                            {validPrereqOptions.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                                        </select>
                                        <button type="button" onClick={handleAddPrereq} disabled={!selectedPrereqToAdd} className="bg-cyan-900/30 border border-cyan-700 text-cyan-400 px-3 py-1 text-[10px] font-black uppercase hover:bg-cyan-800 transition-all disabled:opacity-30">AÑADIR</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {prereqs.map(pid => (
                                            <div key={pid} className="bg-cyan-950 border border-cyan-800 px-2 py-1 flex items-center gap-2">
                                                <span className="text-[9px] text-cyan-300 uppercase truncate max-w-[100px]">{existingMissions.find(em => em.id === pid)?.title || pid}</span>
                                                <button type="button" onClick={() => handleRemovePrereq(pid)} className="text-red-500 hover:text-white">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* COLUMNA 2: LOCALIZACIÓN Y RECURSOS */}
                            <div className="space-y-6">
                                <div>
                                    <label className={`text-[10px] ${accentClass} font-black block mb-4 uppercase tracking-widest`}>SITUACIÓN GEOGRÁFICA (ESTADO)</label>
                                    {/* GRID DE ESTADOS SIMPLIFICADO Y TÁCTICO */}
                                    <div className="bg-black border border-slate-800 p-3 max-h-48 overflow-y-auto grid grid-cols-4 gap-1 scrollbar-thin scrollbar-thumb-slate-800">
                                        {STATES_LIST.map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setLocationState(s)}
                                                className={`text-[8px] p-2 border ${locationState === s ? 'bg-cyan-900 border-cyan-400 text-white' : 'border-slate-900 text-gray-600 hover:border-slate-700'} font-black transition-all uppercase truncate`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-900/30 border border-slate-800 p-4 space-y-4">
                                    <label className="text-[10px] text-blue-500 font-black block uppercase tracking-widest text-center border-b border-blue-900 pb-2">SUMINISTROS REQUERIDOS (EXPANSIONES)</label>
                                    <div className="flex gap-2">
                                        <select value={selectedExpansionId} onChange={e => setSelectedExpansionId(e.target.value)} className="flex-1 bg-black border border-slate-800 p-2 text-[10px] text-blue-400 outline-none">
                                            {GAME_EXPANSIONS.map(exp => <option key={exp.id} value={exp.id}>{exp.name}</option>)}
                                        </select>
                                        <button type="button" onClick={handleAddRequirement} className="bg-blue-900/30 border border-blue-700 text-blue-400 px-3 py-1 text-[10px] font-black uppercase hover:bg-blue-800">AÑADIR</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {requirements.map(reqId => (
                                            <div key={reqId} className="bg-blue-950 border border-blue-800 px-2 py-1 flex items-center gap-2">
                                                <span className="text-[9px] text-blue-300 uppercase truncate max-w-[100px]">{getExpansionName(reqId)}</span>
                                                <button type="button" onClick={() => handleRemoveRequirement(reqId)} className="text-red-500 hover:text-white">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className={`text-[10px] ${accentClass} font-black block mb-1 uppercase tracking-widest`}>URL TÁCTICA (MAPA/LAYOUT)</label>
                                        <input value={layoutUrl} onChange={e => setLayoutUrl(e.target.value)} placeholder="https://..." className={`w-full bg-slate-950 border ${borderClass} p-2 text-white text-[10px] ${focusClass} outline-none transition-all`} />
                                    </div>
                                    <div>
                                        <label className={`text-[10px] text-yellow-600 font-black block mb-1 uppercase tracking-widest`}>ENLACE EXPEDIENTE FÍSICO (PDF)</label>
                                        <input value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} placeholder="https://..." className={`w-full bg-slate-950 border border-yellow-900 p-2 text-yellow-200 text-[10px] focus:border-yellow-500 outline-none transition-all`} />
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <button type="button" onClick={handleOpenPdfPicker} className="bg-yellow-900/30 border border-yellow-700 text-yellow-300 px-3 py-1 text-[10px] font-black uppercase hover:bg-yellow-800 transition-all">
                                                Buscar PDF en GitHub
                                            </button>
                                            {pdfUrl && (
                                                <button type="button" onClick={() => setPdfUrl('')} className="bg-slate-900 border border-slate-700 text-gray-300 px-3 py-1 text-[10px] font-black uppercase hover:border-white transition-all">
                                                    Limpiar enlace
                                                </button>
                                            )}
                                        </div>
                                        <div className="mt-2 text-[9px] text-yellow-300/70 uppercase tracking-wide">
                                            Repositorio conectado: jaz206 / MisionesMZC
                                        </div>
                                        {isPdfPickerOpen && (
                                            <div className="mt-3 border border-yellow-900 bg-black/70">
                                                <div className="p-3 border-b border-yellow-900/50 flex flex-col gap-3">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="text-[10px] text-yellow-300 font-black uppercase tracking-widest">
                                                            Selector de anexo PDF
                                                        </div>
                                                        <button type="button" onClick={() => setIsPdfPickerOpen(false)} className="text-[10px] text-gray-500 hover:text-white uppercase">
                                                            Cerrar
                                                        </button>
                                                    </div>
                                                    <input
                                                        value={pdfPickerQuery}
                                                        onChange={e => setPdfPickerQuery(e.target.value)}
                                                        placeholder="Buscar por nombre o carpeta..."
                                                        className="w-full bg-slate-950 border border-yellow-900 p-2 text-yellow-100 text-[10px] focus:border-yellow-500 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="max-h-64 overflow-y-auto">
                                                    {pdfPickerLoading ? (
                                                        <div className="p-4 text-[10px] text-yellow-300 uppercase tracking-widest">
                                                            Cargando PDFs...
                                                        </div>
                                                    ) : pdfPickerError ? (
                                                        <div className="p-4 text-[10px] text-red-400 uppercase tracking-wide">
                                                            {pdfPickerError}
                                                        </div>
                                                    ) : filteredPdfOptions.length === 0 ? (
                                                        <div className="p-4 text-[10px] text-gray-400 uppercase tracking-wide">
                                                            No hay PDFs que coincidan con esa busqueda.
                                                        </div>
                                                    ) : (
                                                        filteredPdfOptions.map(option => (
                                                            <button
                                                                key={option.path}
                                                                type="button"
                                                                onClick={() => handleSelectRepoPdf(option)}
                                                                className={`w-full text-left px-3 py-3 border-b border-slate-900 hover:bg-yellow-950/30 transition-all ${pdfUrl === option.url ? 'bg-yellow-900/20' : 'bg-transparent'}`}
                                                            >
                                                                <div className="text-[10px] text-yellow-200 font-black uppercase truncate">
                                                                    {option.name}
                                                                </div>
                                                                <div className="text-[9px] text-gray-500 break-all">
                                                                    {option.path}
                                                                </div>
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* DESCRIPCIÓN Y OBJETIVOS */}
                        <div className="space-y-6">
                            <div>
                                <label className={`text-[10px] ${accentClass} font-black block mb-1 uppercase tracking-widest`}>RESUMEN DE INTELIGENCIA (DESCRIPCIÓN)</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className={`w-full bg-slate-950 border ${borderClass} p-3 text-white text-xs ${focusClass} outline-none resize-none leading-relaxed italic`} placeholder="FLAVOR TEXT..." />
                            </div>

                            <div className="bg-slate-900/30 border border-slate-800 p-4">
                                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                                    <label className={`text-[10px] ${accentClass} font-black uppercase tracking-widest`}>DIRECTIVAS OPERACIONALES (OBJETIVOS)</label>
                                    <button type="button" onClick={handleAddObjective} className={`text-[9px] ${accentClass} border border-current px-4 py-1 font-black hover:bg-white/5`}>NUEVA DIRECTIVA</button>
                                </div>
                                <div className="space-y-4">
                                    {objectives.map((obj, i) => (
                                        <div key={i} className="flex gap-4 items-start group">
                                            <div className={`w-6 h-6 border ${borderClass} flex items-center justify-center text-[10px] font-black shrink-0 mt-1 uppercase`}>{i + 1}</div>
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <input placeholder="TÍTULO DIRECTIVA" value={obj.title} onChange={e => handleObjectiveChange(i, 'title', e.target.value)} className={`bg-slate-950 border ${borderClass} p-2 text-xs text-white outline-none focus:border-white transition-all uppercase`} />
                                                <input placeholder="PARÁMETROS DE ÉXITO" value={obj.desc} onChange={e => handleObjectiveChange(i, 'desc', e.target.value)} className="bg-slate-950 border border-slate-800 p-2 text-xs text-gray-500 outline-none focus:border-white transition-all" />
                                            </div>
                                            <button type="button" onClick={() => setObjectives(objectives.filter((_, idx) => idx !== i))} className="text-red-900 hover:text-red-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-emerald-600 font-black block mb-1 uppercase tracking-widest">PROTOCOLO DE RECOMPRENSA (OUTCOME TEXT)</label>
                                <textarea value={outcomeText} onChange={e => setOutcomeText(e.target.value)} rows={3} className="w-full bg-slate-950 border border-emerald-900 p-3 text-emerald-200 text-xs focus:border-emerald-400 outline-none resize-none" placeholder="Texto al completar..." />
                            </div>
                        </div>

                        {/* ACCIONES */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
                            <button type="button" onClick={onClose} className="px-6 py-2 border border-red-900 text-red-500 text-[10px] font-black uppercase hover:bg-red-900/20 transition-all">ABORTAR</button>
                            <button type="submit" disabled={saving} className={`px-10 py-2 ${buttonClass} text-white text-[10px] font-black uppercase shadow-lg transition-all active:scale-95 disabled:opacity-50`}>
                                {saving ? 'TRANSMITIENDO...' : (initialData ? 'ACTUALIZAR PROTOCOLO' : 'REGISTRAR OPERACIÓN')}
                            </button>
                        </div>
                    </form>

                    {/* BRIEFING PREVIEW PANEL */}
                    <div className="hidden xl:flex w-96 bg-black/60 p-6 flex-col border-l border-slate-800 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 select-none">
                        <div className="mb-4">
                            <h4 className={`text-[10px] ${accentClass} font-black uppercase tracking-[0.4em] mb-1`}>LIVE BRIEFING</h4>
                            <div className={`h-px bg-gradient-to-r ${isZombie ? 'from-lime-500' : (isBoth ? 'from-yellow-500' : 'from-cyan-500')} to-transparent`}></div>
                        </div>

                        <div className="space-y-6">
                            {/* MINI TACTICAL HEADER */}
                            <div className="bg-slate-900/40 border-l-4 border-current p-4" style={{ color: isZombie ? '#84cc16' : (isBoth ? '#eab308' : '#06b6d4') }}>
                                <div className="text-[8px] opacity-70 mb-1 font-mono uppercase">LOCALIZACIÓN: {locationState}</div>
                                <h1 className="text-xl font-black text-white uppercase tracking-tighter leading-none mb-2">{title || 'OPERACIÓN_SIN_NOMBRE'}</h1>
                                <div className="flex gap-2">
                                    <span className="text-[8px] font-black border border-current px-2 py-0.5">{threatLevel.split(' (')[0].toUpperCase()}</span>
                                    <span className="text-[8px] font-black bg-white/10 px-2 py-0.5">{type}</span>
                                </div>
                            </div>

                            {/* DECODED INTEL */}
                            <div className="space-y-2">
                                <div className="text-[8px] text-gray-500 font-black tracking-widest uppercase font-mono">INTELIGENCIA DE CAMPO</div>
                                <div className="text-[10px] text-gray-300 italic leading-relaxed font-serif border-l border-slate-800 pl-4 py-1">
                                    {description || 'ESPERANDO TRANSMISIÓN DE DATOS...'}
                                </div>
                            </div>

                            {/* TACTICAL OBJECTIVES */}
                            <div className="space-y-4">
                                <div className="text-[8px] text-gray-500 font-black tracking-widest uppercase font-mono">DIRECTIVAS ASIGNADAS</div>
                                {objectives.filter(o => o.title).map((obj, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className={`w-1 h-1 rounded-full bg-current mt-1 ${accentClass}`}></div>
                                        <div>
                                            <div className="text-[10px] font-black text-white uppercase tracking-tight leading-tight">{obj.title}</div>
                                            <div className="text-[9px] text-gray-500 font-mono italic">{obj.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* SCANLINE OVERLAY PREVIEW */}
                            <div className="relative aspect-video bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                                {layoutUrl ? (
                                    <img src={layoutUrl} className="w-full h-full object-cover opacity-50 grayscale" referrerPolicy="no-referrer" />
                                ) : (
                                    <div className="text-gray-800 text-[9px] font-mono">[LAYOUT_PENDIENTE]</div>
                                )}
                                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
                                <div className="absolute top-2 left-2 text-[7px] text-cyan-500 font-mono animate-pulse uppercase tracking-[0.2em]">REC ● LIVE_FEED</div>
                            </div>

                            <div className="p-4 border border-slate-800 bg-slate-900/20 text-[8px] text-gray-600 font-mono leading-tight">
                                // SYNC_STATUS: PENDING<br />
                                // BYTES_RECEIVED: {title.length * 1024} KB<br />
                                // AUTH_LEVEL: ADM_ONLY<br />
                                // ENCRYPTION: MIL_SPEC_2048
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
