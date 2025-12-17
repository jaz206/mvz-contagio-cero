import React, { useState, useEffect } from 'react';
import { translations, Language } from '../translations';
import { HeroTemplate, HeroClass, HeroStats } from '../types';
import { createHeroTemplateInDB, updateHeroTemplate } from '../services/dbService';

interface CharacterEditorProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    initialData?: HeroTemplate | null; // Nuevo prop para editar
    onSave?: () => void; // Callback para refrescar la lista
}

const HERO_CLASSES: HeroClass[] = ['BRAWLER', 'SCOUT', 'TACTICIAN', 'BLASTER'];

export const CharacterEditor: React.FC<CharacterEditorProps> = ({ isOpen, onClose, language, initialData, onSave }) => {
    const [name, setName] = useState('');
    const [alias, setAlias] = useState('');
    const [heroClass, setHeroClass] = useState<HeroClass>('BRAWLER');
    const [stats, setStats] = useState<HeroStats>({ strength: 5, agility: 5, intellect: 5 });
    const [bio, setBio] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [alignment, setAlignment] = useState<'ALIVE' | 'ZOMBIE'>('ALIVE');
    const [saving, setSaving] = useState(false);

    // Cargar datos si estamos editando
    useEffect(() => {
        if (initialData) {
            setName(initialData.defaultName);
            setAlias(initialData.alias || '');
            setHeroClass(initialData.defaultClass);
            setStats(initialData.defaultStats);
            setBio(initialData.bio || '');
            setImageUrl(initialData.imageUrl);
            setAlignment(initialData.defaultAlignment || 'ALIVE');
        } else {
            // Resetear si es nuevo
            setName(''); setAlias(''); setHeroClass('BRAWLER');
            setStats({ strength: 5, agility: 5, intellect: 5 });
            setBio(''); setImageUrl(''); setAlignment('ALIVE');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const templateData: any = {
            defaultName: name,
            alias: alias.toUpperCase(),
            defaultClass: heroClass,
            defaultStats: stats,
            bio,
            imageUrl,
            defaultAlignment: alignment,
            objectives: initialData?.objectives || [],
            currentStory: initialData?.currentStory || ''
        };

        try {
            if (initialData && initialData.id) {
                // MODO EDICIÓN
                await updateHeroTemplate(initialData.id, templateData);
                alert("PERSONAJE ACTUALIZADO");
            } else {
                // MODO CREACIÓN
                await createHeroTemplateInDB(templateData);
                alert("PERSONAJE CREADO");
            }
            
            if (onSave) onSave();
            onClose();
        } catch (error) {
            console.error(error);
            alert("ERROR AL GUARDAR");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-slate-900 border-2 border-cyan-500 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="bg-cyan-900/40 p-4 border-b border-cyan-600 flex justify-between items-center">
                    <h3 className="text-cyan-300 font-bold tracking-widest uppercase">
                        {initialData ? `EDITING: ${initialData.alias}` : 'CREATE NEW CHARACTER (DB)'}
                    </h3>
                    <button onClick={onClose} className="text-cyan-500 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto font-mono flex flex-col gap-4 scrollbar-thin scrollbar-thumb-cyan-900">
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-cyan-600 font-bold block mb-1 uppercase">REAL NAME</label>
                            <input value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200 focus:border-cyan-400 outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] text-cyan-600 font-bold block mb-1 uppercase">ALIAS (CODENAME)</label>
                            <input value={alias} onChange={e => setAlias(e.target.value)} required className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200 focus:border-cyan-400 outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-cyan-600 font-bold block mb-1 uppercase">CLASS</label>
                            <select value={heroClass} onChange={e => setHeroClass(e.target.value as HeroClass)} className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200">
                                {HERO_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-cyan-600 font-bold block mb-1 uppercase">ALIGNMENT</label>
                            <select value={alignment} onChange={e => setAlignment(e.target.value as any)} className="w-full bg-slate-950 border border-cyan-800 p-2 text-white font-bold">
                                <option value="ALIVE">🛡️ HERO (ALIVE)</option>
                                <option value="ZOMBIE">🧟 ZOMBIE (UNDEAD)</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 border border-cyan-900/30 p-3">
                        <label className="text-[10px] text-cyan-500 font-bold block mb-2 uppercase">BASE STATS</label>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-[9px] text-red-400 block">STRENGTH</label>
                                <input type="number" min="1" max="10" value={stats.strength} onChange={e => setStats({...stats, strength: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-red-900 p-1 text-center text-white" />
                            </div>
                            <div>
                                <label className="text-[9px] text-green-400 block">AGILITY</label>
                                <input type="number" min="1" max="10" value={stats.agility} onChange={e => setStats({...stats, agility: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-green-900 p-1 text-center text-white" />
                            </div>
                            <div>
                                <label className="text-[9px] text-blue-400 block">INTELLECT</label>
                                <input type="number" min="1" max="10" value={stats.intellect} onChange={e => setStats({...stats, intellect: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-blue-900 p-1 text-center text-white" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-cyan-600 font-bold block mb-1 uppercase">IMAGE URL</label>
                        <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200 text-xs" />
                    </div>

                    <div>
                        <label className="text-[10px] text-cyan-600 font-bold block mb-1 uppercase">BIO / LORE</label>
                        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} className="w-full bg-slate-950 border border-cyan-800 p-2 text-cyan-200 text-xs" />
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-cyan-800">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-red-900 text-red-500 text-xs font-bold uppercase hover:bg-red-900/20">CANCEL</button>
                        <button type="submit" disabled={saving} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
                            {saving ? 'SAVING...' : (initialData ? 'UPDATE CHARACTER' : 'CREATE CHARACTER')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};