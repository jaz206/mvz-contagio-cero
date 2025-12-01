
import React, { useState } from 'react';
import { translations, Language } from '../translations';
import { Mission, Objective } from '../types';
import { createMissionInDB } from '../services/dbService';

interface MissionEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (mission: Mission) => void;
    language: Language;
}

const STATES_LIST = [
    'Washington', 'Oregon', 'California', 'Nevada', 'Idaho', 'Montana', 'Wyoming', 'Utah', 'Arizona', 'Colorado', 'New Mexico',
    'North Dakota', 'South Dakota', 'Nebraska', 'Kansas', 'Oklahoma', 'Texas', 'Minnesota', 'Iowa', 'Missouri', 'Arkansas', 'Louisiana',
    'Wisconsin', 'Illinois', 'Mississippi', 'Michigan', 'Indiana', 'Ohio', 'Kentucky', 'Tennessee', 'Alabama', 'Florida',
    'Georgia', 'South Carolina', 'North Carolina', 'Virginia', 'West Virginia', 'Maryland', 'Delaware', 'Pennsylvania', 'New Jersey',
    'New York', 'Connecticut', 'Rhode Island', 'Massachusetts', 'Vermont', 'New Hampshire', 'Maine', 'Alaska', 'Hawaii', 'District of Columbia'
];

export const MissionEditor: React.FC<MissionEditorProps> = ({ isOpen, onClose, onSave, language }) => {
    const t = translations[language].missionEditor;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [locationState, setLocationState] = useState(STATES_LIST[0]);
    const [threatLevel, setThreatLevel] = useState('HIGH');
    const [type, setType] = useState<'STANDARD' | 'SHIELD_BASE' | 'BOSS'>('STANDARD');
    const [pdfUrl, setPdfUrl] = useState('');
    const [objectives, setObjectives] = useState<Objective[]>([{ title: '', desc: '' }]);
    const [saving, setSaving] = useState(false);

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

        const coords = [-98.5, 39.8]; // Default center, real geocoding would be better but this works for now

        // Create base object without optional fields to avoid 'undefined' error in Firestore
        const baseMissionData = {
            title,
            description: description.split('\n').filter(p => p.trim() !== ''),
            location: {
                state: locationState,
                coordinates: [
                    coords[0] + (Math.random() * 10 - 5), 
                    coords[1] + (Math.random() * 5 - 2.5)
                ] as [number, number] // Random jitter
            },
            threatLevel,
            type,
            objectives: objectives.filter(o => o.title && o.desc),
        };

        // Only add pdfUrl if it has content
        const newMissionData: Omit<Mission, 'id'> = {
            ...baseMissionData,
            ...(pdfUrl.trim() ? { pdfUrl: pdfUrl.trim() } : {})
        };

        try {
            const id = await createMissionInDB(newMissionData);
            onSave({ ...newMissionData, id });
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
                    <h3 className="text-cyan-300 font-bold tracking-widest">{t.title}</h3>
                    <button onClick={onClose} className="text-cyan-500 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto font-mono flex flex-col gap-4">
                    {/* Title */}
                    <div>
                        <label className="text-[10px] text-cyan-600 font-bold block mb-1">{t.missionTitle}</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200 focus:border-cyan-400 outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* State */}
                        <div>
                            <label className="text-[10px] text-cyan-600 font-bold block mb-1">{t.location}</label>
                            <select value={locationState} onChange={e => setLocationState(e.target.value)} className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200">
                                {STATES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        {/* Threat */}
                        <div>
                            <label className="text-[10px] text-cyan-600 font-bold block mb-1">{t.threat}</label>
                            <input value={threatLevel} onChange={e => setThreatLevel(e.target.value)} className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200" />
                        </div>
                    </div>

                    {/* Type & PDF */}
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
                            <label className="text-[10px] text-cyan-600 font-bold block mb-1">{t.pdfUrl}</label>
                            <input value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} placeholder="https://..." className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200" />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-[10px] text-cyan-600 font-bold block mb-1">{t.description}</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200" />
                    </div>

                    {/* Objectives */}
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
