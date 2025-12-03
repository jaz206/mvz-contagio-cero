
import React, { useState, useEffect } from 'react';
import { translations, Language } from '../translations';
import { Mission, Objective } from '../types';
import { createMissionInDB, updateMissionInDB } from '../services/dbService';

interface MissionEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (mission: Mission) => void;
    language: Language;
    initialData?: Mission | null;
    existingMissions?: Mission[];
}

// Approximate center coordinates [Longitude, Latitude]
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

// Generate list from keys to ensure consistency
const STATES_LIST = Object.keys(STATE_CENTERS).sort();

export const MissionEditor: React.FC<MissionEditorProps> = ({ isOpen, onClose, onSave, language, initialData, existingMissions = [] }) => {
    const t = translations[language].missionEditor;
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [locationState, setLocationState] = useState(STATES_LIST[0]);
    const [threatLevel, setThreatLevel] = useState('HIGH');
    const [type, setType] = useState<'STANDARD' | 'SHIELD_BASE' | 'BOSS'>('STANDARD');
    const [pdfUrl, setPdfUrl] = useState('');
    const [prereq, setPrereq] = useState('');
    const [objectives, setObjectives] = useState<Objective[]>([{ title: '', desc: '' }]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description.join('\n'));
            setLocationState(initialData.location.state);
            setThreatLevel(initialData.threatLevel);
            setType(initialData.type || 'STANDARD');
            setPdfUrl(initialData.pdfUrl || '');
            setPrereq(initialData.prereq || '');
            setObjectives(initialData.objectives.length > 0 ? initialData.objectives : [{ title: '', desc: '' }]);
        } else {
            setTitle('');
            setDescription('');
            setLocationState(STATES_LIST[0]);
            setThreatLevel('HIGH');
            setType('STANDARD');
            setPdfUrl('');
            setPrereq('');
            setObjectives([{ title: '', desc: '' }]);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        let finalCoordinates: [number, number];

        // CHECK: Did the user change the state? Or is it a new mission?
        const stateChanged = !initialData || initialData.location.state !== locationState;

        if (stateChanged) {
            // FIX: Use specific state center, NOT defaultCenter
            const center = STATE_CENTERS[locationState] || [-98.5, 39.8]; 
            // Small Jitter ~ +/- 1.0 degree to keep it inside the state roughly
            const jitterX = (Math.random() - 0.5) * 2.0; 
            const jitterY = (Math.random() - 0.5) * 1.5;
            finalCoordinates = [center[0] + jitterX, center[1] + jitterY];
        } else {
            // Keep OLD coordinates if state didn't change
            finalCoordinates = initialData.location.coordinates;
        }

        const baseMissionData = {
            title,
            description: description.split('\n').filter(p => p.trim() !== ''),
            location: {
                state: locationState,
                coordinates: finalCoordinates
            },
            threatLevel,
            type,
            objectives: objectives.filter(o => o.title && o.desc),
            prereq: prereq || undefined,
        };

        const missionPayload: any = {
            ...baseMissionData,
            ...(pdfUrl.trim() ? { pdfUrl: pdfUrl.trim() } : {})
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
            alert("Failed to save mission");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl bg-slate-900 border-2 border-cyan-500 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="bg-cyan-900/40 p-4 border-b border-cyan-600 flex justify-between items-center">
                    <h3 className="text-cyan-300 font-bold tracking-widest">
                        {initialData ? `EDITING: ${initialData.title}` : t.title}
                    </h3>
                    <button onClick={onClose} className="text-cyan-500 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto font-mono flex flex-col gap-4">
                    <div>
                        <label className="text-[10px] text-cyan-600 font-bold block mb-1">{t.missionTitle}</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200 focus:border-cyan-400 outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-cyan-600 font-bold block mb-1">{t.location}</label>
                            <select value={locationState} onChange={e => setLocationState(e.target.value)} className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200">
                                {STATES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-cyan-600 font-bold block mb-1">{t.threat}</label>
                            <input value={threatLevel} onChange={e => setThreatLevel(e.target.value)} className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-cyan-600 font-bold block mb-1">{t.type}</label>
                            <select value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200">
                                <option value="STANDARD">STANDARD</option>
                                <option value="SHIELD_BASE">SHIELD BASE</option>
                                <option value="BOSS">BOSS</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-cyan-600 font-bold block mb-1">{t.prereq}</label>
                            <select value={prereq} onChange={e => setPrereq(e.target.value)} className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200">
                                <option value="">-- NONE --</option>
                                {existingMissions
                                    .filter(m => !initialData || m.id !== initialData.id)
                                    .map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.title}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="text-[10px] text-cyan-600 font-bold block mb-1">{t.pdfUrl}</label>
                            <input value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} placeholder="https://..." className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200" />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-cyan-600 font-bold block mb-1">{t.description}</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200" />
                    </div>

                    <div className="bg-slate-950/50 p-4 border border-cyan-900/50">
                        <div className="flex justify-between mb-2">
                            <label className="text-[10px] text-cyan-600 font-bold">{t.objectives}</label>
                            <button type="button" onClick={handleAddObjective} className="text-[10px] text-cyan-400 hover:text-white border border-cyan-700 px-2">+ {t.addObjective}</button>
                        </div>
                        {objectives.map((obj, i) => (
                            <div key={i} className="mb-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                <input placeholder={t.objTitle} value={obj.title} onChange={e => handleObjectiveChange(i, 'title', e.target.value)} className="bg-slate-900 border border-cyan-900 p-1 text-xs text-cyan-200" />
                                <input placeholder={t.objDesc} value={obj.desc} onChange={e => handleObjectiveChange(i, 'desc', e.target.value)} className="bg-slate-900 border border-cyan-900 p-1 text-xs text-gray-400" />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-cyan-800">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-red-900 text-red-500 text-xs font-bold">{t.cancel}</button>
                        <button type="submit" disabled={saving} className="px-6 py-2 bg-cyan-600 text-white text-xs font-bold">{saving ? 'SAVING...' : t.save}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
