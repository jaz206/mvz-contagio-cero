import React, { useState, useEffect } from 'react';
import { HeroTemplate, Mission } from '../types';
import { getHeroTemplates, getCustomMissions, deleteHeroInDB, deleteMissionInDB, seedExpansionsToDB } from '../services/dbService';
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
    
    // Filtro visual para héroes
    const [heroFilter, setHeroFilter] = useState<'ALL' | 'ALIVE' | 'ZOMBIE'>('ALL');

    // Estados para edición
    const [editingHero, setEditingHero] = useState<HeroTemplate | null>(null);
    const [editingMission, setEditingMission] = useState<Mission | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const h = await getHeroTemplates();
            const m = await getCustomMissions();
            setHeroes(h);
            setMissions(m);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) loadData();
    }, [isOpen]);

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

    if (!isOpen) return null;

    // Filtrado de Héroes
    const filteredHeroes = heroes.filter(h => {
        const matchesSearch = (h.alias + h.defaultName).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = heroFilter === 'ALL' || h.defaultAlignment === heroFilter;
        return matchesSearch && matchesType;
    });

    // Filtrado de Misiones
    const filteredMissions = missions.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col font-mono">
            {/* Editores Modales */}
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
                    <button onClick={handleSync} className="bg-purple-900/50 border border-purple-500 text-purple-300 px-4 py-2 text-xs font-bold hover:bg-purple-800">☁ SYNC LOCAL -> DB</button>
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
                        filteredHeroes.map(h => (
                            <div key={h.id} className={`p-3 border flex gap-3 relative group ${h.defaultAlignment === 'ZOMBIE' ? 'border-lime-900 bg-lime-950/10' : 'border-cyan-900 bg-cyan-950/10'}`}>
                                <div className="w-12 h-12 bg-black border border-gray-700 shrink-0">
                                    <img src={h.imageUrl} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className={`font-bold text-xs truncate ${h.defaultAlignment === 'ZOMBIE' ? 'text-lime-400' : 'text-cyan-400'}`}>{h.alias}</h4>
                                        <span className="text-[9px] text-gray-500">{h.defaultAlignment}</span>
                                    </div>
                                    <p className="text-[9px] text-gray-400 truncate">{h.defaultName}</p>
                                    <p className="text-[9px] text-gray-600 font-mono mt-1">ID: {h.id}</p>
                                </div>
                                <div className="absolute right-2 bottom-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditingHero(h)} className="bg-blue-900 text-blue-300 px-2 py-1 text-[9px] border border-blue-700 hover:bg-blue-800">EDIT</button>
                                    <button onClick={() => handleDeleteHero(h.id)} className="bg-red-900 text-red-300 px-2 py-1 text-[9px] border border-red-700 hover:bg-red-800">DEL</button>
                                </div>
                            </div>
                        ))
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