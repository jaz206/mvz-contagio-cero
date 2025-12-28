import React, { useState, useEffect, useMemo } from 'react';
import { HeroTemplate, Mission, HeroClass } from '../types';
import { 
    getHeroTemplates, 
    getCustomMissions, 
    deleteHeroInDB, 
    deleteMissionInDB 
} from '../services/dbService';
import { CharacterEditor } from './CharacterEditor';
import { MissionEditor } from './MissionEditor';
import { auth } from '../firebaseConfig'; // Importamos auth para verificar identidad real

// --- CONSTANTES DE FACCIONES ---
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

const BASE_GAME_MISSIONS: Mission[] = [
    { id: 'm_intro_0', title: "MH0: CADENAS ROTAS", description: [], objectives: [], location: { state: 'Ohio', coordinates: [0,0] }, threatLevel: 'N/A' }
];

interface DatabaseManagerProps {
    isOpen: boolean;
    onClose: () => void;
    language: 'es' | 'en';
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({ isOpen, onClose, language }) => {
    const [activeTab, setActiveTab] = useState<'HEROES' | 'MISSIONS'>('MISSIONS');
    const [heroes, setHeroes] = useState<HeroTemplate[]>([]);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // --- FILTROS DE HÉROES ---
    const [heroFilterAlignment, setHeroFilterAlignment] = useState<'ALL' | 'ALIVE' | 'ZOMBIE'>('ALL');
    const [heroFilterClass, setHeroFilterClass] = useState<'ALL' | HeroClass>('ALL'); 
    const [heroFilterLinked, setHeroFilterLinked] = useState<'ALL' | 'LINKED' | 'UNLINKED'>('ALL'); 

    // --- FILTROS DE MISIONES ---
    const [missionFilterAlignment, setMissionFilterAlignment] = useState<'ALL' | 'ALIVE' | 'ZOMBIE' | 'BOTH'>('ALL');
    const [missionFilterDifficulty, setMissionFilterDifficulty] = useState<string>('ALL');

    // UI State
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['KINGPIN', 'MAGNETO', 'HULK', 'DOOM', 'NEUTRAL', 'GALACTUS']));

    // Edición
    const [editingHero, setEditingHero] = useState<HeroTemplate | null>(null);
    const [editingMission, setEditingMission] = useState<Mission | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [h, m] = await Promise.all([getHeroTemplates(), getCustomMissions()]);
            setHeroes(h);
            setMissions(m);
        } catch (e) {
            console.error("Error cargando datos:", e);
            alert("Error al conectar con la base de datos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) loadData();
    }, [isOpen]);

    const handleExportData = () => {
        const dataToExport = activeTab === 'HEROES' ? heroes : missions;
        const fileName = activeTab === 'HEROES' ? 'shield_heroes_backup.json' : 'shield_missions_backup.json';

        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // --- AGRUPACIÓN INTELIGENTE DE MISIONES ---
    const groupedMissions = useMemo(() => {
        const groups: Record<string, Mission[]> = {
            KINGPIN: [], MAGNETO: [], HULK: [], DOOM: [], NEUTRAL: [], GALACTUS: []
        };

        let filtered = missions.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));

        if (missionFilterAlignment !== 'ALL') {
            filtered = filtered.filter(m => m.alignment === missionFilterAlignment || m.alignment === 'BOTH');
        }
        if (missionFilterDifficulty !== 'ALL') {
            filtered = filtered.filter(m => m.threatLevel.includes(missionFilterDifficulty));
        }

        filtered.forEach(m => {
            if (m.type === 'GALACTUS') {
                groups.GALACTUS.push(m);
            } else {
                const faction = getFactionForState(m.location.state);
                if (groups[faction]) groups[faction].push(m);
                else groups.NEUTRAL.push(m);
            }
        });

        return groups;
    }, [missions, searchTerm, missionFilterAlignment, missionFilterDifficulty]);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(section)) newSet.delete(section); else newSet.add(section);
            return newSet;
        });
    };

    // --- SEGURIDAD MEJORADA ---
    const verifyAdmin = (): boolean => {
        const currentUser = auth?.currentUser;
        
        // REEMPLAZA ESTO CON TU UID REAL DE FIREBASE (Lo puedes ver en la consola de Firebase Auth)
        // Esto es mucho más seguro que una contraseña en el código cliente.
        const ALLOWED_ADMIN_UIDS = [
            "TU_UID_DE_FIREBASE_AQUI", 
            "OTRO_UID_SI_ES_NECESARIO" 
        ];

        // Si no hay usuario o no está en la lista blanca
        if (!currentUser || !ALLOWED_ADMIN_UIDS.includes(currentUser.uid)) {
            // Fallback para desarrollo local si no has configurado el UID aún
            const devPassword = import.meta.env.VITE_ADMIN_PASSWORD;
            if (devPassword) {
                 const input = prompt("⚠ MODO DESARROLLO ⚠\nIntroduce contraseña de admin:");
                 return input === devPassword;
            }
            
            alert("⛔ ACCESO DENEGADO: No tienes permisos de administrador (UID no autorizado).");
            return false;
        }

        return true;
    };

    const handleDeleteMission = async (id: string) => { 
        if (verifyAdmin()) {
            if (window.confirm("¿ESTÁS SEGURO? Esta acción es irreversible.")) { 
                setLoading(true);
                await deleteMissionInDB(id); 
                await loadData(); 
            }
        }
    };

    const handleDeleteHero = async (id: string) => { 
        if (verifyAdmin()) {
            if (window.confirm("¿ESTÁS SEGURO? Esta acción es irreversible.")) { 
                setLoading(true);
                await deleteHeroInDB(id); 
                await loadData(); 
            }
        }
    };

    const getPrereqName = (prereqId: string) => {
        const m = missions.find(mis => mis.id === prereqId);
        return m ? m.title : prereqId;
    };

    const getDifficultyColor = (threat: string) => {
        if (threat.includes('Fácil') || threat.includes('Latente')) return 'border-emerald-500 text-emerald-400';
        if (threat.includes('Intermedia') || threat.includes('Insaciable')) return 'border-yellow-500 text-yellow-400';
        if (threat.includes('Difícil') || threat.includes('Desatada')) return 'border-orange-500 text-orange-400';
        if (threat.includes('Muy difícil') || threat.includes('Gamma') || threat.includes('OMEGA')) return 'border-red-600 text-red-500';
        return 'border-gray-500 text-gray-400';
    };

    // --- FILTRADO DE HÉROES ACTUALIZADO ---
    const filteredHeroes = heroes.filter(h => {
        const matchesSearch = (h.alias + h.defaultName).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAlignment = heroFilterAlignment === 'ALL' || h.defaultAlignment === heroFilterAlignment;
        const matchesClass = heroFilterClass === 'ALL' || h.defaultClass === heroFilterClass;

        let matchesLinked = true;
        if (heroFilterLinked === 'LINKED') {
            matchesLinked = !!h.relatedHeroId;
        } else if (heroFilterLinked === 'UNLINKED') {
            matchesLinked = !h.relatedHeroId;
        }

        return matchesSearch && matchesAlignment && matchesClass && matchesLinked;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col font-mono">
            
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
                    <h2 className="text-xl font-black text-cyan-400 tracking-widest uppercase">DATABASE MANAGER</h2>
                    <div className="flex gap-2">
                        <button onClick={() => setActiveTab('HEROES')} className={`px-4 py-1 text-xs font-bold border ${activeTab === 'HEROES' ? 'bg-cyan-600 text-white border-cyan-400' : 'text-cyan-600 border-cyan-900'}`}>HÉROES ({heroes.length})</button>
                        <button onClick={() => setActiveTab('MISSIONS')} className={`px-4 py-1 text-xs font-bold border ${activeTab === 'MISSIONS' ? 'bg-cyan-600 text-white border-cyan-400' : 'text-cyan-600 border-cyan-900'}`}>MISIONES ({missions.length})</button>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={handleExportData} 
                        className="bg-emerald-900/50 border border-emerald-500 text-emerald-300 px-4 py-2 text-xs font-bold hover:bg-emerald-800 flex items-center gap-2"
                    >
                        <span>💾</span> EXPORTAR JSON
                    </button>
                    <button onClick={onClose} className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-2 text-xs font-bold hover:bg-red-800">CERRAR</button>
                </div>
            </div>

            {/* TOOLBAR & FILTERS */}
            <div className="bg-slate-900/50 p-4 border-b border-cyan-900 flex flex-wrap gap-4 items-center">
                <input type="text" placeholder="BUSCAR..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-950 border border-cyan-700 p-2 text-cyan-200 text-xs w-64 focus:outline-none focus:border-cyan-400" />
                
                {activeTab === 'HEROES' && (
                    <>
                        <select value={heroFilterAlignment} onChange={e => setHeroFilterAlignment(e.target.value as any)} className="bg-slate-950 border border-cyan-800 text-xs text-cyan-300 p-2">
                            <option value="ALL">TODOS LOS BANDOS</option>
                            <option value="ALIVE">🛡️ VIVOS (ALIVE)</option>
                            <option value="ZOMBIE">🧟 ZOMBIES</option>
                        </select>

                        <select value={heroFilterClass} onChange={e => setHeroFilterClass(e.target.value as any)} className="bg-slate-950 border border-cyan-800 text-xs text-cyan-300 p-2">
                            <option value="ALL">TODAS LAS CLASES</option>
                            <option value="BRAWLER">👊 BRAWLER</option>
                            <option value="SCOUT">⚡ SCOUT</option>
                            <option value="TACTICIAN">🧠 TACTICIAN</option>
                            <option value="BLASTER">💥 BLASTER</option>
                        </select>

                        <select value={heroFilterLinked} onChange={e => setHeroFilterLinked(e.target.value as any)} className="bg-slate-950 border border-purple-800 text-xs text-purple-300 p-2">
                            <option value="ALL">VINCULACIÓN (TODOS)</option>
                            <option value="LINKED">🔗 VINCULADOS / SIN VARIANTE</option>
                            <option value="UNLINKED">🚫 SIN VINCULAR</option>
                        </select>
                    </>
                )}

                {activeTab === 'MISSIONS' && (
                    <>
                        <select value={missionFilterAlignment} onChange={e => setMissionFilterAlignment(e.target.value as any)} className="bg-slate-950 border border-cyan-800 text-xs text-cyan-300 p-2">
                            <option value="ALL">TODOS LOS BANDOS</option>
                            <option value="ALIVE">🛡️ HÉROES</option>
                            <option value="ZOMBIE">🧟 ZOMBIES</option>
                            <option value="BOTH">⚖️ AMBOS</option>
                        </select>
                        <select value={missionFilterDifficulty} onChange={e => setMissionFilterDifficulty(e.target.value)} className="bg-slate-950 border border-cyan-800 text-xs text-cyan-300 p-2">
                            <option value="ALL">CUALQUIER DIFICULTAD</option>
                            <option value="Fácil">FÁCIL (VERDE)</option>
                            <option value="Intermedia">INTERMEDIA (AMARILLO)</option>
                            <option value="Difícil">DIFÍCIL (NARANJA)</option>
                            <option value="Muy difícil">EXTREMA (ROJO)</option>
                        </select>
                    </>
                )}
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 relative">
                {loading && <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-20 text-cyan-500 animate-pulse">CARGANDO DATOS...</div>}
                
                {activeTab === 'HEROES' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {filteredHeroes.map(h => (
                            <div key={h.id} className={`p-3 border flex gap-3 group relative transition-all ${h.relatedHeroId ? 'border-purple-500/50 bg-purple-900/10' : 'border-cyan-900 bg-cyan-950/10'}`}>
                                <div className="w-12 h-12 bg-black border border-gray-700 shrink-0 relative">
                                    <img src={h.imageUrl} alt="" className="w-full h-full object-cover" />
                                    {/* Indicador de Vinculación */}
                                    {h.relatedHeroId && (
                                        <div 
                                            className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold border border-white ${h.relatedHeroId === 'NO_VARIANT' ? 'bg-red-600' : 'bg-purple-600'}`} 
                                            title={h.relatedHeroId === 'NO_VARIANT' ? "Sin Variante" : "Vinculado"}
                                        >
                                            {h.relatedHeroId === 'NO_VARIANT' ? 'Ø' : '∞'}
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-bold text-xs text-cyan-400 truncate" title={h.alias}>{h.alias}</div>
                                    <div className="text-[9px] text-gray-500 truncate">{h.defaultName}</div>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`text-[8px] font-bold px-1 rounded border ${h.defaultAlignment === 'ZOMBIE' ? 'border-lime-600 text-lime-500' : 'border-blue-600 text-blue-400'}`}>
                                            {h.defaultAlignment}
                                        </span>
                                        <span className="text-[8px] font-bold px-1 rounded border border-gray-600 text-gray-400">
                                            {h.defaultClass}
                                        </span>
                                    </div>
                                </div>
                                <div className="absolute right-2 bottom-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 p-1 rounded z-10">
                                    <button onClick={() => setEditingHero(h)} className="bg-blue-900 text-blue-300 px-2 py-1 text-[9px] border border-blue-700 hover:bg-blue-800">EDIT</button>
                                    <button onClick={() => handleDeleteHero(h.id)} className="bg-red-900 text-red-300 px-2 py-1 text-[9px] border border-red-700 hover:bg-red-800">DEL</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedMissions).map(([faction, factionMissions]) => {
                            if (factionMissions.length === 0) return null;
                            const isExpanded = expandedSections.has(faction);
                            
                            let headerColor = 'bg-slate-800 border-slate-600 text-slate-300';
                            if (faction === 'KINGPIN') headerColor = 'bg-purple-900/40 border-purple-600 text-purple-300';
                            if (faction === 'MAGNETO') headerColor = 'bg-red-900/40 border-red-600 text-red-300';
                            if (faction === 'HULK') headerColor = 'bg-lime-900/40 border-lime-600 text-lime-300';
                            if (faction === 'DOOM') headerColor = 'bg-cyan-900/40 border-cyan-600 text-cyan-300';
                            if (faction === 'GALACTUS') headerColor = 'bg-fuchsia-900/40 border-fuchsia-600 text-fuchsia-300';

                            return (
                                <div key={faction} className="border border-gray-800 rounded overflow-hidden">
                                    <button 
                                        onClick={() => toggleSection(faction)}
                                        className={`w-full p-3 flex justify-between items-center border-b ${headerColor} transition-colors hover:brightness-110`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="font-black tracking-widest text-sm uppercase">{faction}</span>
                                            <span className="text-xs bg-black/30 px-2 py-0.5 rounded">{factionMissions.length}</span>
                                        </div>
                                        <span className="text-xs">{isExpanded ? '▲' : '▼'}</span>
                                    </button>
                                    
                                    {isExpanded && (
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-slate-900/50">
                                            {factionMissions.map(m => {
                                                const diffColor = getDifficultyColor(m.threatLevel);
                                                const isIntro = m.isIntroMission || m.type === 'INTRODUCTORY';
                                                const isBoss = m.type && m.type.startsWith('BOSS');
                                                const hasPrereq = (m.prereqs && m.prereqs.length > 0) || m.prereq;

                                                let cardBg = 'bg-slate-800/40 hover:bg-slate-800';
                                                let cardBorder = diffColor.replace('text-', 'border-');

                                                if (isBoss) {
                                                    cardBg = 'bg-gradient-to-br from-purple-900/30 to-slate-900 hover:from-purple-900/50';
                                                    cardBorder = 'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
                                                }

                                                return (
                                                    <div key={m.id} className={`p-3 border-l-4 transition-all relative group flex flex-col gap-2 ${cardBg} ${cardBorder}`}>
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1 min-w-0">
                                                                {isIntro && <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">⭐ INTRODUCCIÓN</div>}
                                                                {isBoss && <div className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1">💀 JEFE DE ZONA</div>}
                                                                
                                                                <h4 className="font-bold text-xs text-white truncate" title={m.title}>{m.title}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className={`text-[9px] font-bold ${diffColor.split(' ')[1]}`}>{m.threatLevel}</span>
                                                                    <span className="text-[8px] text-gray-500">| {m.location.state}</span>
                                                                </div>
                                                            </div>
                                                            <div className={`text-[9px] px-1.5 py-0.5 rounded border ${m.alignment === 'ZOMBIE' ? 'border-lime-600 text-lime-400' : m.alignment === 'ALIVE' ? 'border-cyan-600 text-cyan-400' : 'border-gray-600 text-gray-400'}`}>
                                                                {m.alignment === 'BOTH' ? 'AMBOS' : m.alignment}
                                                            </div>
                                                        </div>

                                                        {hasPrereq && (
                                                            <div className="mt-2 pt-2 border-t border-gray-700/50">
                                                                <div className="text-[8px] text-gray-500 uppercase font-bold mb-1">REQUIERE COMPLETAR:</div>
                                                                <div className="flex flex-col gap-1">
                                                                    {(m.prereqs || [m.prereq]).map((pid: any) => (
                                                                        <div key={pid} className="flex items-center gap-1 text-[9px] text-yellow-500/80 truncate">
                                                                            <span>🔗</span>
                                                                            <span title={pid}>{getPrereqName(pid)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="mt-auto pt-2 text-[8px] text-gray-600 font-mono truncate">ID: {m.id}</div>

                                                        <div className="absolute right-2 bottom-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 p-1 rounded">
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
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};