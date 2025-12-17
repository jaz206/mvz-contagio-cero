import React, { useState, useEffect } from 'react';
import { HeroTemplate, Mission, HeroStats } from '../types';
import { getHeroTemplates, getCustomMissions, deleteHeroInDB, deleteMissionInDB, seedExpansionsToDB, updateHeroTemplate } from '../services/dbService';
import { CharacterEditor } from './CharacterEditor';
import { MissionEditor } from './MissionEditor';

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
    
    // Filtros
    const [heroFilter, setHeroFilter] = useState<'ALL' | 'ALIVE' | 'ZOMBIE'>('ALL');

    // Edición
    const [editingHero, setEditingHero] = useState<HeroTemplate | null>(null);
    const [editingMission, setEditingMission] = useState<Mission | null>(null);

    // --- ESTADOS PARA FUSIÓN ---
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showMergeModal, setShowMergeModal] = useState(false);
    // Estado temporal para el objeto fusionado
    const [mergedHero, setMergedHero] = useState<HeroTemplate | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const h = await getHeroTemplates();
            const m = await getCustomMissions();
            setHeroes(h);
            setMissions(m);
            setSelectedIds([]); // Limpiar selección al recargar
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) loadData();
    }, [isOpen]);

    // --- LÓGICA DE SELECCIÓN ---
    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            if (selectedIds.length < 2) {
                setSelectedIds([...selectedIds, id]);
            } else {
                alert("Solo puedes fusionar 2 personajes a la vez.");
            }
        }
    };

    // --- INICIAR FUSIÓN ---
    const startMerge = () => {
        if (selectedIds.length !== 2) return;
        const heroA = heroes.find(h => h.id === selectedIds[0]);
        // Por defecto, el resultado inicial es una copia del Héroe A
        if (heroA) setMergedHero({ ...heroA });
        setShowMergeModal(true);
    };

    // --- EJECUTAR FUSIÓN EN BBDD ---
    const executeMerge = async () => {
        if (!mergedHero || selectedIds.length !== 2) return;
        
        // El ID que conservaremos es el del primer seleccionado (o el que hayamos decidido usar como base)
        const targetId = selectedIds[0]; 
        const idToDelete = selectedIds[1];

        if (!window.confirm(`ESTA ACCIÓN ES IRREVERSIBLE:\n\n1. Se actualizará el héroe con ID: ${targetId}\n2. Se ELIMINARÁ permanentemente el héroe con ID: ${idToDelete}\n\n¿Proceder?`)) {
            return;
        }

        setLoading(true);
        try {
            // 1. Actualizar el superviviente con los datos mezclados
            // Aseguramos que el ID del objeto a guardar sea el correcto
            const finalData = { ...mergedHero, id: targetId };
            await updateHeroTemplate(targetId, finalData);

            // 2. Eliminar el duplicado
            await deleteHeroInDB(idToDelete);

            alert("FUSIÓN COMPLETADA CON ÉXITO");
            setShowMergeModal(false);
            setMergedHero(null);
            await loadData();
        } catch (error) {
            console.error(error);
            alert("ERROR DURANTE LA FUSIÓN");
        } finally {
            setLoading(false);
        }
    };

    // --- HELPERS DE GESTIÓN ---
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

    // --- RENDERIZADO DE FILTROS ---
    const filteredHeroes = heroes.filter(h => {
        const matchesSearch = (h.alias + h.defaultName).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = heroFilter === 'ALL' || h.defaultAlignment === heroFilter;
        return matchesSearch && matchesType;
    });

    const filteredMissions = missions.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));

    // --- SUB-COMPONENTE: FILA DE COMPARACIÓN ---
    const ComparisonRow = ({ label, valueA, valueB, fieldKey, subKey }: { label: string, valueA: any, valueB: any, fieldKey: keyof HeroTemplate, subKey?: keyof HeroStats }) => {
        if (!mergedHero) return null;

        // Determinar el valor actual seleccionado en el mergedHero
        let currentValue: any;
        if (subKey && fieldKey === 'defaultStats') {
            currentValue = (mergedHero.defaultStats as any)[subKey];
        } else {
            currentValue = mergedHero[fieldKey];
        }

        const isSelectedA = currentValue === valueA;
        const isSelectedB = currentValue === valueB;

        const handleSelect = (val: any) => {
            if (subKey && fieldKey === 'defaultStats') {
                setMergedHero({
                    ...mergedHero,
                    defaultStats: {
                        ...mergedHero.defaultStats,
                        [subKey]: val
                    }
                });
            } else {
                setMergedHero({ ...mergedHero, [fieldKey]: val });
            }
        };

        return (
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-800 items-center hover:bg-white/5">
                <div className="text-[10px] font-bold text-gray-400 uppercase">{label}</div>
                
                {/* Opción A */}
                <div 
                    onClick={() => handleSelect(valueA)}
                    className={`cursor-pointer p-2 border text-xs truncate transition-all ${isSelectedA ? 'border-emerald-500 bg-emerald-900/20 text-emerald-300' : 'border-gray-700 text-gray-500 opacity-60'}`}
                >
                    {String(valueA)}
                </div>

                {/* Opción B */}
                <div 
                    onClick={() => handleSelect(valueB)}
                    className={`cursor-pointer p-2 border text-xs truncate transition-all ${isSelectedB ? 'border-emerald-500 bg-emerald-900/20 text-emerald-300' : 'border-gray-700 text-gray-500 opacity-60'}`}
                >
                    {String(valueB)}
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col font-mono">
            
            {/* --- MODAL DE FUSIÓN --- */}
            {showMergeModal && mergedHero && selectedIds.length === 2 && (
                <div className="fixed inset-0 z-[150] bg-black/95 flex items-center justify-center p-4">
                    <div className="w-full max-w-5xl bg-slate-900 border-2 border-purple-500 shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="bg-purple-900/30 p-4 border-b border-purple-600 flex justify-between items-center">
                            <div>
                                <h3 className="text-purple-300 font-bold tracking-widest uppercase text-lg">PROTOCOLO DE FUSIÓN</h3>
                                <p className="text-[10px] text-purple-400">SELECCIONA LOS DATOS QUE DESEAS CONSERVAR EN EL ARCHIVO FINAL</p>
                            </div>
                            <button onClick={() => { setShowMergeModal(false); setMergedHero(null); }} className="text-purple-500 hover:text-white font-bold">✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {(() => {
                                const heroA = heroes.find(h => h.id === selectedIds[0])!;
                                const heroB = heroes.find(h => h.id === selectedIds[1])!;

                                return (
                                    <div className="space-y-2">
                                        {/* Cabeceras */}
                                        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                                            <div className="text-xs font-bold text-gray-500">CAMPO</div>
                                            <div className="text-xs font-bold text-cyan-400 border-b border-cyan-800 pb-1">ORIGEN A (ID: {heroA.id})</div>
                                            <div className="text-xs font-bold text-orange-400 border-b border-orange-800 pb-1">ORIGEN B (ID: {heroB.id})</div>
                                        </div>

                                        <ComparisonRow label="NOMBRE REAL" fieldKey="defaultName" valueA={heroA.defaultName} valueB={heroB.defaultName} />
                                        <ComparisonRow label="ALIAS (CODENAME)" fieldKey="alias" valueA={heroA.alias} valueB={heroB.alias} />
                                        <ComparisonRow label="CLASE" fieldKey="defaultClass" valueA={heroA.defaultClass} valueB={heroB.defaultClass} />
                                        <ComparisonRow label="ALINEACIÓN" fieldKey="defaultAlignment" valueA={heroA.defaultAlignment} valueB={heroB.defaultAlignment} />
                                        
                                        <div className="py-2"><div className="h-px bg-gray-800"></div></div>
                                        
                                        <ComparisonRow label="FUERZA (STR)" fieldKey="defaultStats" subKey="strength" valueA={heroA.defaultStats.strength} valueB={heroB.defaultStats.strength} />
                                        <ComparisonRow label="AGILIDAD (AGI)" fieldKey="defaultStats" subKey="agility" valueA={heroA.defaultStats.agility} valueB={heroB.defaultStats.agility} />
                                        <ComparisonRow label="INTELECTO (INT)" fieldKey="defaultStats" subKey="intellect" valueA={heroA.defaultStats.intellect} valueB={heroB.defaultStats.intellect} />

                                        <div className="py-2"><div className="h-px bg-gray-800"></div></div>

                                        <ComparisonRow label="IMAGEN URL" fieldKey="imageUrl" valueA={heroA.imageUrl} valueB={heroB.imageUrl} />
                                        
                                        {/* Previsualización de imagen */}
                                        <div className="grid grid-cols-3 gap-4 py-2 items-center">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase">PREVIEW</div>
                                            <div className="h-20 bg-black flex justify-center"><img src={heroA.imageUrl} className="h-full object-contain" alt="A" /></div>
                                            <div className="h-20 bg-black flex justify-center"><img src={heroB.imageUrl} className="h-full object-contain" alt="B" /></div>
                                        </div>

                                        <div className="py-2"><div className="h-px bg-gray-800"></div></div>

                                        <div className="grid grid-cols-3 gap-4 py-2">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase">BIO / HISTORIA</div>
                                            <div onClick={() => setMergedHero({...mergedHero, bio: heroA.bio || ''})} className={`cursor-pointer p-2 border text-[10px] h-24 overflow-y-auto ${mergedHero.bio === heroA.bio ? 'border-emerald-500 bg-emerald-900/20' : 'border-gray-700 opacity-60'}`}>{heroA.bio}</div>
                                            <div onClick={() => setMergedHero({...mergedHero, bio: heroB.bio || ''})} className={`cursor-pointer p-2 border text-[10px] h-24 overflow-y-auto ${mergedHero.bio === heroB.bio ? 'border-emerald-500 bg-emerald-900/20' : 'border-gray-700 opacity-60'}`}>{heroB.bio}</div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="p-4 border-t border-purple-800 bg-slate-900 flex justify-end gap-4">
                            <button onClick={() => { setShowMergeModal(false); setMergedHero(null); }} className="px-4 py-2 border border-gray-600 text-gray-400 text-xs font-bold hover:text-white">CANCELAR</button>
                            <button onClick={executeMerge} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold tracking-widest shadow-[0_0_20px_rgba(147,51,234,0.5)]">CONFIRMAR FUSIÓN Y GUARDAR</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Editores Modales Normales */}
            {editingHero && (
                <CharacterEditor 
                    isOpen={true} 
                    onClose={() => setEditingHero(null)} 
                    language={language} 
                    initialData={editingHero}
                    onSave={loadData}
                />
            )}
            {editingMission && (
                <MissionEditor 
                    isOpen={true} 
                    onClose={() => setEditingMission(null)} 
                    language={language} 
                    initialData={editingMission}
                    onSave={() => { setEditingMission(null); loadData(); }}
                />
            )}

            {/* Header */}
            <div className="bg-slate-900 border-b border-cyan-600 p-4 flex justify-between items-center shadow-lg z-10">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-black text-cyan-400 tracking-widest uppercase">DATABASE MANAGER // ADMIN</h2>
                    <div className="flex gap-2">
                        <button onClick={() => setActiveTab('HEROES')} className={`px-4 py-1 text-xs font-bold border ${activeTab === 'HEROES' ? 'bg-cyan-600 text-white border-cyan-400' : 'text-cyan-600 border-cyan-900'}`}>HÉROES ({heroes.length})</button>
                        <button onClick={() => setActiveTab('MISSIONS')} className={`px-4 py-1 text-xs font-bold border ${activeTab === 'MISSIONS' ? 'bg-cyan-600 text-white border-cyan-400' : 'text-cyan-600 border-cyan-900'}`}>MISIONES ({missions.length})</button>
                    </div>
                </div>
                <div className="flex gap-4">
                    {/* Botón de Fusión */}
                    {activeTab === 'HEROES' && (
                        <button 
                            onClick={startMerge} 
                            disabled={selectedIds.length !== 2}
                            className={`px-4 py-2 text-xs font-bold border transition-all ${selectedIds.length === 2 ? 'bg-purple-600 text-white border-purple-400 animate-pulse' : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'}`}
                        >
                            ⚡ FUSIONAR ({selectedIds.length}/2)
                        </button>
                    )}

                    <button onClick={handleSync} className="bg-blue-900/50 border border-blue-500 text-blue-300 px-4 py-2 text-xs font-bold hover:bg-blue-800">☁ SYNC LOCAL &rarr; DB</button>
                    <button onClick={onClose} className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-2 text-xs font-bold hover:bg-red-800">CERRAR</button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-slate-900/50 p-4 border-b border-cyan-900 flex gap-4 items-center">
                <input 
                    type="text" 
                    placeholder="BUSCAR..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-950 border border-cyan-700 p-2 text-cyan-200 text-xs w-64 focus:outline-none focus:border-cyan-400"
                />
                
                {activeTab === 'HEROES' && (
                    <div className="flex gap-2">
                        <button onClick={() => setHeroFilter('ALL')} className={`px-3 py-1 text-[10px] border ${heroFilter === 'ALL' ? 'bg-gray-700 text-white' : 'border-gray-700 text-gray-500'}`}>TODOS</button>
                        <button onClick={() => setHeroFilter('ALIVE')} className={`px-3 py-1 text-[10px] border ${heroFilter === 'ALIVE' ? 'bg-cyan-700 text-white' : 'border-cyan-900 text-cyan-700'}`}>🛡️ VIVOS</button>
                        <button onClick={() => setHeroFilter('ZOMBIE')} className={`px-3 py-1 text-[10px] border ${heroFilter === 'ZOMBIE' ? 'bg-lime-700 text-white' : 'border-lime-900 text-lime-700'}`}>🧟 ZOMBIES</button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 relative">
                {loading && <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-20 text-cyan-500 animate-pulse">CARGANDO DATOS...</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {activeTab === 'HEROES' ? (
                        filteredHeroes.map(h => {
                            const isSelected = selectedIds.includes(h.id);
                            return (
                                <div 
                                    key={h.id} 
                                    className={`p-3 border flex gap-3 relative group transition-all ${isSelected ? 'border-purple-500 bg-purple-900/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : h.defaultAlignment === 'ZOMBIE' ? 'border-lime-900 bg-lime-950/10' : 'border-cyan-900 bg-cyan-950/10'}`}
                                >
                                    {/* Checkbox de Selección */}
                                    <div className="absolute top-2 left-2 z-10">
                                        <input 
                                            type="checkbox" 
                                            checked={isSelected} 
                                            onChange={() => toggleSelection(h.id)}
                                            className="w-4 h-4 cursor-pointer accent-purple-500"
                                        />
                                    </div>

                                    <div className="w-12 h-12 bg-black border border-gray-700 shrink-0 ml-6">
                                        <img src={h.imageUrl} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className={`font-bold text-xs truncate ${h.defaultAlignment === 'ZOMBIE' ? 'text-lime-400' : 'text-cyan-400'}`}>{h.alias}</h4>
                                            <span className="text-[9px] text-gray-500">{h.defaultAlignment}</span>
                                        </div>
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
                        filteredMissions.map(m => (
                            <div key={m.id} className="p-3 border border-yellow-900 bg-yellow-950/10 flex flex-col relative group">
                                <h4 className="font-bold text-xs text-yellow-500 truncate">{m.title}</h4>
                                <p className="text-[9px] text-gray-400 mt-1">{m.location.state} - {m.threatLevel}</p>
                                <p className="text-[9px] text-gray-600 font-mono mt-1">ID: {m.id}</p>
                                <div className="absolute right-2 bottom-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditingMission(m)} className="bg-blue-900 text-blue-300 px-2 py-1 text-[9px] border border-blue-700 hover:bg-blue-800">EDIT</button>
                                    <button onClick={() => handleDeleteMission(m.id)} className="bg-red-900 text-red-300 px-2 py-1 text-[9px] border border-red-700 hover:bg-red-800">DEL</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};