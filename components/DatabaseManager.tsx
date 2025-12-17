import React, { useState, useEffect, useMemo } from 'react';
import { HeroTemplate, Mission, HeroStats } from '../types';
import { 
    getHeroTemplates, 
    getCustomMissions, 
    deleteHeroInDB, 
    deleteMissionInDB, 
    seedExpansionsToDB, 
    updateHeroTemplate,
    updateMissionInDB 
} from '../services/dbService';
import { CharacterEditor } from './CharacterEditor';
import { MissionEditor } from './MissionEditor';

// --- CONSTANTES DE FACCIONES Y MISIONES BASE ---
const FACTION_STATES = {
    magneto: new Set(['Washington', 'Oregon', 'California', 'Nevada', 'Idaho', 'Montana', 'Wyoming', 'Utah', 'Arizona', 'Colorado', 'Alaska', 'Hawaii']),
    kingpin: new Set(['Maine', 'New Hampshire', 'Vermont', 'New York', 'Massachusetts', 'Rhode Island', 'Connecticut', 'New Jersey', 'Pennsylvania', 'Delaware', 'Maryland', 'West Virginia', 'Virginia', 'District of Columbia']),
    hulk: new Set(['North Dakota', 'South Dakota', 'Nebraska', 'Kansas', 'Oklahoma', 'Texas', 'New Mexico', 'Minnesota', 'Iowa', 'Missouri', 'Wisconsin', 'Illinois', 'Michigan', 'Indiana', 'Ohio']),
    doom: new Set(['Arkansas', 'Louisiana', 'Mississippi', 'Alabama', 'Tennessee', 'Kentucky', 'Georgia', 'Florida', 'South Carolina', 'North Carolina'])
};

const getFactionForState = (state: string) => {
    if (FACTION_STATES.magneto.has(state)) return 'MAGNETO';
    if (FACTION_STATES.kingpin.has(state)) return 'KINGPIN';
    if (FACTION_STATES.hulk.has(state)) return 'HULK';
    if (FACTION_STATES.doom.has(state)) return 'DOOM';
    return 'NEUTRAL';
};

// Misiones base mínimas para que aparezcan como opciones de requisito en el editor
const BASE_GAME_MISSIONS: Mission[] = [
    { id: 'm_intro_0', title: "MH0: CADENAS ROTAS", description: [], objectives: [], location: { state: 'Ohio', coordinates: [0,0] }, threatLevel: 'N/A' }
];

interface DatabaseManagerProps {
    isOpen: boolean;
    onClose: () => void;
    language: 'es' | 'en';
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({ isOpen, onClose, language }) => {
    const [activeTab, setActiveTab] = useState<'HEROES' | 'MISSIONS'>('HEROES');
    const [heroes, setHeroes] = useState<HeroTemplate[]>([]);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filtros y Estados de UI
    const [heroFilter, setHeroFilter] = useState<'ALL' | 'ALIVE' | 'ZOMBIE'>('ALL');
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['ALIVE', 'ZOMBIE', 'BOTH']));

    // Edición
    const [editingHero, setEditingHero] = useState<HeroTemplate | null>(null);
    const [editingMission, setEditingMission] = useState<Mission | null>(null);

    // Fusión
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showMergeModal, setShowMergeModal] = useState(false);
    const [mergedHero, setMergedHero] = useState<HeroTemplate | null>(null);
    const [mergedMission, setMergedMission] = useState<Mission | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const h = await getHeroTemplates();
            const m = await getCustomMissions();
            setHeroes(h);
            setMissions(m);
            setSelectedIds([]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) loadData();
    }, [isOpen]);

    // --- LÓGICA DE AGRUPACIÓN DE MISIONES POR ALINEACIÓN ---
    const missionsByAlignment = useMemo(() => {
        const groups: Record<string, Mission[]> = {
            ALIVE: [],
            ZOMBIE: [],
            BOTH: []
        };

        const filtered = missions.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));

        filtered.forEach(m => {
            const align = m.alignment || 'BOTH';
            if (groups[align]) {
                groups[align].push(m);
            } else {
                groups.BOTH.push(m);
            }
        });

        return groups;
    }, [missions, searchTerm]);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(section)) newSet.delete(section);
            else newSet.add(section);
            return newSet;
        });
    };

    // --- LÓGICA DE FUSIÓN ---
    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(sid => sid !== id));
        else if (selectedIds.length < 2) setSelectedIds([...selectedIds, id]);
        else alert("Solo puedes fusionar 2 elementos a la vez.");
    };

    const startMerge = () => {
        if (selectedIds.length !== 2) return;
        
        if (activeTab === 'HEROES') {
            const heroA = heroes.find(h => h.id === selectedIds[0]);
            if (heroA) setMergedHero({ ...heroA });
        } else {
            const missionA = missions.find(m => m.id === selectedIds[0]);
            if (missionA) setMergedMission({ ...missionA });
        }
        setShowMergeModal(true);
    };

    const executeMerge = async () => {
        if (selectedIds.length !== 2) return;
        const targetId = selectedIds[0]; 
        const idToDelete = selectedIds[1];

        if (!window.confirm(`ESTA ACCIÓN ES IRREVERSIBLE:\n\n1. Se actualizará el elemento con ID: ${targetId}\n2. Se ELIMINARÁ permanentemente el elemento con ID: ${idToDelete}\n\n¿Proceder?`)) return;

        setLoading(true);
        try {
            if (activeTab === 'HEROES' && mergedHero) {
                const finalData = { ...mergedHero, id: targetId };
                await updateHeroTemplate(targetId, finalData);
                await deleteHeroInDB(idToDelete);
            } else if (activeTab === 'MISSIONS' && mergedMission) {
                const finalData = { ...mergedMission, id: targetId };
                await updateMissionInDB(targetId, finalData);
                await deleteMissionInDB(idToDelete);
            }

            alert("FUSIÓN COMPLETADA CON ÉXITO");
            setShowMergeModal(false);
            setMergedHero(null);
            setMergedMission(null);
            await loadData();
        } catch (error) {
            console.error(error);
            alert("ERROR DURANTE LA FUSIÓN");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteHero = async (id: string) => {
        if (window.confirm("¿ELIMINAR HÉROE PERMANENTEMENTE?")) {
            await deleteHeroInDB(id);
            loadData();
        }
    };

    const handleDeleteMission = async (id: string) => {
        if (window.confirm("¿ELIMINAR MISIÓN PERMANENTEMENTE?")) {
            await deleteMissionInDB(id);
            loadData();
        }
    };

    const handleSync = async () => {
        if (window.confirm("Esto sobrescribirá los datos en Firebase con los archivos locales. ¿Continuar?")) {
            setLoading(true);
            await seedExpansionsToDB();
            await loadData();
            setLoading(false);
        }
    };

    const filteredHeroes = heroes.filter(h => {
        const matchesSearch = (h.alias + h.defaultName).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = heroFilter === 'ALL' || h.defaultAlignment === heroFilter;
        return matchesSearch && matchesType;
    });

    // --- COMPONENTES DE COMPARACIÓN ---
    const ComparisonRowHero = ({ label, valueA, valueB, fieldKey, subKey }: { label: string, valueA: any, valueB: any, fieldKey: keyof HeroTemplate, subKey?: keyof HeroStats }) => {
        if (!mergedHero) return null;
        let currentValue: any;
        if (subKey && fieldKey === 'defaultStats') currentValue = (mergedHero.defaultStats as any)[subKey];
        else currentValue = mergedHero[fieldKey];
        
        const isSelectedA = JSON.stringify(currentValue) === JSON.stringify(valueA);
        const isSelectedB = JSON.stringify(currentValue) === JSON.stringify(valueB);
        
        const handleSelect = (val: any) => {
            if (subKey && fieldKey === 'defaultStats') setMergedHero({ ...mergedHero, defaultStats: { ...mergedHero.defaultStats, [subKey]: val } });
            else setMergedHero({ ...mergedHero, [fieldKey]: val });
        };
        
        return (
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-800 items-center hover:bg-white/5">
                <div className="text-[10px] font-bold text-gray-400 uppercase">{label}</div>
                <div onClick={() => handleSelect(valueA)} className={`cursor-pointer p-2 border text-xs truncate transition-all ${isSelectedA ? 'border-emerald-500 bg-emerald-900/20 text-emerald-300' : 'border-gray-700 text-gray-500 opacity-60'}`}>{String(valueA)}</div>
                <div onClick={() => handleSelect(valueB)} className={`cursor-pointer p-2 border text-xs truncate transition-all ${isSelectedB ? 'border-emerald-500 bg-emerald-900/20 text-emerald-300' : 'border-gray-700 text-gray-500 opacity-60'}`}>{String(valueB)}</div>
            </div>
        );
    };

    const ComparisonRowMission = ({ label, valueA, valueB, fieldKey }: { label: string, valueA: any, valueB: any, fieldKey: keyof Mission }) => {
        if (!mergedMission) return null;
        const currentValue = mergedMission[fieldKey];
        const isSelectedA = JSON.stringify(currentValue) === JSON.stringify(valueA);
        const isSelectedB = JSON.stringify(currentValue) === JSON.stringify(valueB);

        const handleSelect = (val: any) => {
            setMergedMission({ ...mergedMission, [fieldKey]: val });
        };

        const renderValue = (val: any) => {
            if (Array.isArray(val)) return `[ARRAY] ${val.length} items`;
            if (typeof val === 'object' && val !== null) return JSON.stringify(val);
            return String(val);
        };

        return (
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-800 items-center hover:bg-white/5">
                <div className="text-[10px] font-bold text-gray-400 uppercase">{label}</div>
                <div onClick={() => handleSelect(valueA)} className={`cursor-pointer p-2 border text-xs overflow-hidden transition-all ${isSelectedA ? 'border-emerald-500 bg-emerald-900/20 text-emerald-300' : 'border-gray-700 text-gray-500 opacity-60'}`}>
                    <div className="truncate" title={JSON.stringify(valueA, null, 2)}>{renderValue(valueA)}</div>
                </div>
                <div onClick={() => handleSelect(valueB)} className={`cursor-pointer p-2 border text-xs overflow-hidden transition-all ${isSelectedB ? 'border-emerald-500 bg-emerald-900/20 text-emerald-300' : 'border-gray-700 text-gray-500 opacity-60'}`}>
                    <div className="truncate" title={JSON.stringify(valueB, null, 2)}>{renderValue(valueB)}</div>
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col font-mono">
            
            {/* MODAL DE FUSIÓN */}
            {showMergeModal && selectedIds.length === 2 && (
                <div className="fixed inset-0 z-[150] bg-black/95 flex items-center justify-center p-4">
                    <div className="w-full max-w-5xl bg-slate-900 border-2 border-purple-500 shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="bg-purple-900/30 p-4 border-b border-purple-600 flex justify-between items-center">
                            <div><h3 className="text-purple-300 font-bold tracking-widest uppercase text-lg">PROTOCOLO DE FUSIÓN: {activeTab}</h3><p className="text-[10px] text-purple-400">SELECCIONA LOS DATOS QUE DESEAS CONSERVAR</p></div>
                            <button onClick={() => { setShowMergeModal(false); setMergedHero(null); setMergedMission(null); }} className="text-purple-500 hover:text-white font-bold">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            
                            {activeTab === 'HEROES' && mergedHero && (() => {
                                const heroA = heroes.find(h => h.id === selectedIds[0])!;
                                const heroB = heroes.find(h => h.id === selectedIds[1])!;
                                return (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-3 gap-4 mb-4 text-center"><div className="text-xs font-bold text-gray-500">CAMPO</div><div className="text-xs font-bold text-cyan-400 border-b border-cyan-800 pb-1">ORIGEN A ({heroA.id})</div><div className="text-xs font-bold text-orange-400 border-b border-orange-800 pb-1">ORIGEN B ({heroB.id})</div></div>
                                        <ComparisonRowHero label="NOMBRE REAL" fieldKey="defaultName" valueA={heroA.defaultName} valueB={heroB.defaultName} />
                                        <ComparisonRowHero label="ALIAS" fieldKey="alias" valueA={heroA.alias} valueB={heroB.alias} />
                                        <ComparisonRowHero label="CLASE" fieldKey="defaultClass" valueA={heroA.defaultClass} valueB={heroB.defaultClass} />
                                        <ComparisonRowHero label="ALINEACIÓN" fieldKey="defaultAlignment" valueA={heroA.defaultAlignment} valueB={heroB.defaultAlignment} />
                                        <div className="py-2"><div className="h-px bg-gray-800"></div></div>
                                        <ComparisonRowHero label="STR" fieldKey="defaultStats" subKey="strength" valueA={heroA.defaultStats.strength} valueB={heroB.defaultStats.strength} />
                                        <ComparisonRowHero label="AGI" fieldKey="defaultStats" subKey="agility" valueA={heroA.defaultStats.agility} valueB={heroB.defaultStats.agility} />
                                        <ComparisonRowHero label="INT" fieldKey="defaultStats" subKey="intellect" valueA={heroA.defaultStats.intellect} valueB={heroB.defaultStats.intellect} />
                                        <div className="py-2"><div className="h-px bg-gray-800"></div></div>
                                        <ComparisonRowHero label="IMAGEN URL" fieldKey="imageUrl" valueA={heroA.imageUrl} valueB={heroB.imageUrl} />
                                        <div className="grid grid-cols-3 gap-4 py-2 items-center"><div className="text-[10px] font-bold text-gray-400 uppercase">PREVIEW</div><div className="h-20 bg-black flex justify-center"><img src={heroA.imageUrl} className="h-full object-contain" alt="A" /></div><div className="h-20 bg-black flex justify-center"><img src={heroB.imageUrl} className="h-full object-contain" alt="B" /></div></div>
                                        <div className="py-2"><div className="h-px bg-gray-800"></div></div>
                                        <div className="grid grid-cols-3 gap-4 py-2"><div className="text-[10px] font-bold text-gray-400 uppercase">BIO</div><div onClick={() => setMergedHero({...mergedHero, bio: heroA.bio || ''})} className={`cursor-pointer p-2 border text-[10px] h-24 overflow-y-auto ${mergedHero.bio === heroA.bio ? 'border-emerald-500 bg-emerald-900/20' : 'border-gray-700 opacity-60'}`}>{heroA.bio}</div><div onClick={() => setMergedHero({...mergedHero, bio: heroB.bio || ''})} className={`cursor-pointer p-2 border text-[10px] h-24 overflow-y-auto ${mergedHero.bio === heroB.bio ? 'border-emerald-500 bg-emerald-900/20' : 'border-gray-700 opacity-60'}`}>{heroB.bio}</div></div>
                                    </div>
                                );
                            })()}

                            {activeTab === 'MISSIONS' && mergedMission && (() => {
                                const missionA = missions.find(m => m.id === selectedIds[0])!;
                                const missionB = missions.find(m => m.id === selectedIds[1])!;
                                return (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-3 gap-4 mb-4 text-center"><div className="text-xs font-bold text-gray-500">CAMPO</div><div className="text-xs font-bold text-cyan-400 border-b border-cyan-800 pb-1">ORIGEN A ({missionA.id})</div><div className="text-xs font-bold text-orange-400 border-b border-orange-800 pb-1">ORIGEN B ({missionB.id})</div></div>
                                        <ComparisonRowMission label="TÍTULO" fieldKey="title" valueA={missionA.title} valueB={missionB.title} />
                                        <ComparisonRowMission label="NIVEL AMENAZA" fieldKey="threatLevel" valueA={missionA.threatLevel} valueB={missionB.threatLevel} />
                                        <ComparisonRowMission label="TIPO" fieldKey="type" valueA={missionA.type} valueB={missionB.type} />
                                        <ComparisonRowMission label="ALINEACIÓN" fieldKey="alignment" valueA={missionA.alignment} valueB={missionB.alignment} />
                                        <ComparisonRowMission label="UBICACIÓN" fieldKey="location" valueA={missionA.location} valueB={missionB.location} />
                                        <div className="py-2"><div className="h-px bg-gray-800"></div></div>
                                        <div className="grid grid-cols-3 gap-4 py-2"><div className="text-[10px] font-bold text-gray-400 uppercase">DESCRIPCIÓN</div>
                                            <div onClick={() => setMergedMission({...mergedMission, description: missionA.description})} className={`cursor-pointer p-2 border text-[10px] h-24 overflow-y-auto ${JSON.stringify(mergedMission.description) === JSON.stringify(missionA.description) ? 'border-emerald-500 bg-emerald-900/20' : 'border-gray-700 opacity-60'}`}>{missionA.description.join('\n')}</div>
                                            <div onClick={() => setMergedMission({...mergedMission, description: missionB.description})} className={`cursor-pointer p-2 border text-[10px] h-24 overflow-y-auto ${JSON.stringify(mergedMission.description) === JSON.stringify(missionB.description) ? 'border-emerald-500 bg-emerald-900/20' : 'border-gray-700 opacity-60'}`}>{missionB.description.join('\n')}</div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 py-2"><div className="text-[10px] font-bold text-gray-400 uppercase">OBJETIVOS</div>
                                            <div onClick={() => setMergedMission({...mergedMission, objectives: missionA.objectives})} className={`cursor-pointer p-2 border text-[10px] h-24 overflow-y-auto ${JSON.stringify(mergedMission.objectives) === JSON.stringify(missionA.objectives) ? 'border-emerald-500 bg-emerald-900/20' : 'border-gray-700 opacity-60'}`}>{missionA.objectives.map(o => `• ${o.title}`).join('\n')}</div>
                                            <div onClick={() => setMergedMission({...mergedMission, objectives: missionB.objectives})} className={`cursor-pointer p-2 border text-[10px] h-24 overflow-y-auto ${JSON.stringify(mergedMission.objectives) === JSON.stringify(missionB.objectives) ? 'border-emerald-500 bg-emerald-900/20' : 'border-gray-700 opacity-60'}`}>{missionB.objectives.map(o => `• ${o.title}`).join('\n')}</div>
                                        </div>
                                        <ComparisonRowMission label="REQUISITOS" fieldKey="requirements" valueA={missionA.requirements} valueB={missionB.requirements} />
                                        <ComparisonRowMission label="PREREQUISITOS" fieldKey="prereqs" valueA={missionA.prereqs} valueB={missionB.prereqs} />
                                        <ComparisonRowMission label="LAYOUT URL" fieldKey="layoutUrl" valueA={missionA.layoutUrl} valueB={missionB.layoutUrl} />
                                    </div>
                                );
                            })()}

                        </div>
                        <div className="p-4 border-t border-purple-800 bg-slate-900 flex justify-end gap-4">
                            <button onClick={() => { setShowMergeModal(false); setMergedHero(null); setMergedMission(null); }} className="px-4 py-2 border border-gray-600 text-gray-400 text-xs font-bold hover:text-white">CANCELAR</button>
                            <button onClick={executeMerge} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold tracking-widest shadow-[0_0_20px_rgba(147,51,234,0.5)]">CONFIRMAR FUSIÓN</button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDITORES */}
            {editingHero && <CharacterEditor isOpen={true} onClose={() => setEditingHero(null)} language={language} initialData={editingHero} onSave={loadData} />}
            {editingMission && (
                <MissionEditor 
                    isOpen={true} 
                    onClose={() => setEditingMission(null)} 
                    language={language} 
                    initialData={editingMission} 
                    existingMissions={[...BASE_GAME_MISSIONS, ...missions]}
                    onSave={() => { setEditingMission(null); loadData(); }} 
                />
            )}

            {/* HEADER */}
            <div className="bg-slate-900 border-b border-cyan-600 p-4 flex justify-between items-center shadow-lg z-10">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-black text-cyan-400 tracking-widest uppercase">DATABASE MANAGER // ADMIN</h2>
                    <div className="flex gap-2">
                        <button onClick={() => { setActiveTab('HEROES'); setSelectedIds([]); }} className={`px-4 py-1 text-xs font-bold border ${activeTab === 'HEROES' ? 'bg-cyan-600 text-white border-cyan-400' : 'text-cyan-600 border-cyan-900'}`}>HÉROES ({heroes.length})</button>
                        <button onClick={() => { setActiveTab('MISSIONS'); setSelectedIds([]); }} className={`px-4 py-1 text-xs font-bold border ${activeTab === 'MISSIONS' ? 'bg-cyan-600 text-white border-cyan-400' : 'text-cyan-600 border-cyan-900'}`}>MISIONES ({missions.length})</button>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={startMerge} disabled={selectedIds.length !== 2} className={`px-4 py-2 text-xs font-bold border transition-all ${selectedIds.length === 2 ? 'bg-purple-600 text-white border-purple-400 animate-pulse' : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'}`}>⚡ FUSIONAR ({selectedIds.length}/2)</button>
                    <button onClick={handleSync} className="bg-purple-900/50 border border-purple-500 text-purple-300 px-4 py-2 text-xs font-bold hover:bg-purple-800">☁ SYNC LOCAL &rarr; DB</button>
                    <button onClick={onClose} className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-2 text-xs font-bold hover:bg-red-800">CERRAR</button>
                </div>
            </div>

            {/* TOOLBAR */}
            <div className="bg-slate-900/50 p-4 border-b border-cyan-900 flex gap-4 items-center">
                <input type="text" placeholder="BUSCAR..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-950 border border-cyan-700 p-2 text-cyan-200 text-xs w-64 focus:outline-none focus:border-cyan-400" />
                {activeTab === 'HEROES' && (
                    <div className="flex gap-2">
                        <button onClick={() => setHeroFilter('ALL')} className={`px-3 py-1 text-[10px] border ${heroFilter === 'ALL' ? 'bg-gray-700 text-white' : 'border-gray-700 text-gray-500'}`}>TODOS</button>
                        <button onClick={() => setHeroFilter('ALIVE')} className={`px-3 py-1 text-[10px] border ${heroFilter === 'ALIVE' ? 'bg-cyan-700 text-white' : 'border-cyan-900 text-cyan-700'}`}>🛡️ VIVOS</button>
                        <button onClick={() => setHeroFilter('ZOMBIE')} className={`px-3 py-1 text-[10px] border ${heroFilter === 'ZOMBIE' ? 'bg-lime-700 text-white' : 'border-lime-900 text-lime-700'}`}>🧟 ZOMBIES</button>
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 relative">
                {loading && <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-20 text-cyan-500 animate-pulse">CARGANDO DATOS...</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {activeTab === 'HEROES' ? (
                        filteredHeroes.map(h => {
                            const isSelected = selectedIds.includes(h.id);
                            return (
                                <div key={h.id} className={`p-3 border flex gap-3 relative group transition-all ${isSelected ? 'border-purple-500 bg-purple-900/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : h.defaultAlignment === 'ZOMBIE' ? 'border-lime-900 bg-lime-950/10' : 'border-cyan-900 bg-cyan-950/10'}`}>
                                    <div className="absolute top-2 left-2 z-10"><input type="checkbox" checked={isSelected} onChange={() => toggleSelection(h.id)} className="w-4 h-4 cursor-pointer accent-purple-500" /></div>
                                    <div className="w-12 h-12 bg-black border border-gray-700 shrink-0 ml-6"><img src={h.imageUrl} alt="" className="w-full h-full object-cover" /></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start"><h4 className={`font-bold text-xs truncate ${h.defaultAlignment === 'ZOMBIE' ? 'text-lime-400' : 'text-cyan-400'}`}>{h.alias}</h4><span className="text-[9px] text-gray-500">{h.defaultAlignment}</span></div>
                                        <p className="text-[9px] text-gray-400 truncate">{h.defaultName}</p>
                                        <p className="text-[9px] text-gray-600 font-mono mt-1 truncate" title={h.id}>ID: {h.id}</p>
                                    </div>
                                    <div className="absolute right-2 bottom-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setEditingHero(h)} className="bg-blue-900 text-blue-300 px-2 py-1 text-[9px] border border-blue-700 hover:bg-blue-800">EDIT</button>
                                        <button onClick={() => handleDeleteHero(h.id)} className="bg-red-900 text-red-300 px-2 py-1 text-[9px] border border-red-700 hover:bg-red-800">DEL</button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        // --- RENDERIZADO DE MISIONES AGRUPADAS POR ALINEACIÓN ---
                        ['ALIVE', 'ZOMBIE', 'BOTH'].map(alignKey => {
                            const groupMissions = missionsByAlignment[alignKey];
                            if (!groupMissions || groupMissions.length === 0) return null;
                            
                            const isExpanded = expandedSections.has(alignKey);
                            let headerColor = 'bg-gray-800 border-gray-600 text-gray-300';
                            let title = 'EVENTOS GLOBALES / AMBOS';
                            
                            if (alignKey === 'ALIVE') { headerColor = 'bg-cyan-900/50 border-cyan-600 text-cyan-300'; title = '🛡️ CAMPAÑA DE HÉROES'; }
                            if (alignKey === 'ZOMBIE') { headerColor = 'bg-lime-900/50 border-lime-600 text-lime-300'; title = '🧟 CAMPAÑA ZOMBIE'; }

                            return (
                                <div key={alignKey} className="col-span-full mb-4 border border-gray-800">
                                    <button 
                                        onClick={() => toggleSection(alignKey)}
                                        className={`w-full p-3 flex justify-between items-center border-b ${headerColor} transition-colors hover:brightness-110`}
                                    >
                                        <span className="font-black tracking-widest text-sm">{title} ({groupMissions.length})</span>
                                        <span className="text-xs">{isExpanded ? '▲' : '▼'}</span>
                                    </button>
                                    
                                    {isExpanded && (
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-slate-900/50">
                                            {groupMissions.map(m => {
                                                const isSelected = selectedIds.includes(m.id);
                                                const faction = getFactionForState(m.location.state);
                                                return (
                                                    <div key={m.id} className={`p-3 border flex flex-col relative group transition-all ${isSelected ? 'border-purple-500 bg-purple-900/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-slate-700 bg-slate-800/50 hover:border-cyan-500'}`}>
                                                        <div className="absolute top-2 left-2 z-10"><input type="checkbox" checked={isSelected} onChange={() => toggleSelection(m.id)} className="w-4 h-4 cursor-pointer accent-purple-500" /></div>
                                                        <div className="ml-6">
                                                            <div className="flex justify-between items-start">
                                                                <h4 className="font-bold text-xs text-white truncate pr-2">{m.title}</h4>
                                                                <span className="text-[8px] px-1 border border-gray-600 text-gray-400 rounded">{faction}</span>
                                                            </div>
                                                            <p className="text-[9px] text-gray-400 mt-1">{m.location.state} - <span className={m.threatLevel.includes('OMEGA') ? 'text-red-500 font-bold' : 'text-yellow-500'}>{m.threatLevel}</span></p>
                                                            <p className="text-[9px] text-gray-600 font-mono mt-1 truncate" title={m.id}>ID: {m.id}</p>
                                                        </div>
                                                        <div className="absolute right-2 bottom-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => setEditingMission(m)} className="bg-blue-900 text-blue-300 px-2 py-1 text-[9px] border border-blue-700 hover:bg-blue-800">EDIT</button>
                                                            <button onClick={() => handleDeleteMission(m.id)} className="bg-red-900 text-red-300 px-2 py-1 text-[9px] border border-red-700 hover:bg-red-800">DEL</button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
