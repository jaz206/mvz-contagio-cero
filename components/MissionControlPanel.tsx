import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mission, MissionStatus } from '../types';
import { Language } from '../translations';
import { MissionEditor } from './MissionEditor';
import { deleteMissionInDB, getCustomMissions, syncInitialMissionRepository, updateMissionInDB } from '../services/missionService';

interface MissionControlPanelProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    isFullAdmin: boolean;
    onRepositoryUpdated?: (missions: Mission[]) => void;
}

type AlignmentFilter = 'ALL' | 'ALIVE' | 'ZOMBIE' | 'BOTH';
type ViewMode = 'LIST' | 'MAP';

const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 92;

const getDefaultPosition = (index: number) => ({
    x: 80 + ((index % 4) * 240),
    y: 90 + (Math.floor(index / 4) * 150)
});

export const MissionControlPanel: React.FC<MissionControlPanelProps> = ({
    isOpen,
    onClose,
    language,
    canCreate,
    canEdit,
    canDelete,
    isFullAdmin,
    onRepositoryUpdated
}) => {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [alignmentFilter, setAlignmentFilter] = useState<AlignmentFilter>('ALL');
    const [statusFilter, setStatusFilter] = useState<'ALL' | MissionStatus>('ALL');
    const [viewMode, setViewMode] = useState<ViewMode>('LIST');
    const [editingMission, setEditingMission] = useState<Mission | null>(null);
    const [creatingMission, setCreatingMission] = useState(false);
    const [dragState, setDragState] = useState<{
        id: string;
        originX: number;
        originY: number;
        startX: number;
        startY: number;
    } | null>(null);
    const [draftPositions, setDraftPositions] = useState<Record<string, { x: number; y: number }>>({});
    const canvasRef = useRef<HTMLDivElement | null>(null);

    const loadMissions = async (withSync = false) => {
        setLoading(true);

        try {
            const loaded = withSync ? await syncInitialMissionRepository() : await getCustomMissions();
            setMissions(loaded);
            onRepositoryUpdated?.(loaded);
        } catch (error) {
            console.error(error);
            alert(language === 'es' ? 'No se pudieron cargar las misiones.' : 'Could not load missions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        loadMissions(true);
    }, [isOpen]);

    useEffect(() => {
        if (!dragState) return;

        const handleMouseMove = (event: MouseEvent) => {
            if (!canvasRef.current) return;

            const bounds = canvasRef.current.getBoundingClientRect();
            const nextX = Math.max(24, Math.min(bounds.width - DEFAULT_NODE_WIDTH - 24, dragState.originX + (event.clientX - dragState.startX)));
            const nextY = Math.max(24, Math.min(bounds.height - DEFAULT_NODE_HEIGHT - 24, dragState.originY + (event.clientY - dragState.startY)));

            setDraftPositions((prev) => ({
                ...prev,
                [dragState.id]: { x: nextX, y: nextY }
            }));
        };

        const handleMouseUp = async () => {
            const droppedPosition = draftPositions[dragState.id];
            setDragState(null);

            if (!droppedPosition) return;

            try {
                await updateMissionInDB(dragState.id, { mapPosition: droppedPosition });
                const refreshed = missions.map((mission) => (
                    mission.id === dragState.id ? { ...mission, mapPosition: droppedPosition } : mission
                ));
                setMissions(refreshed);
                onRepositoryUpdated?.(refreshed);
            } catch (error) {
                console.error(error);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragState, draftPositions, missions, onRepositoryUpdated]);

    const visibleMissions = useMemo(() => {
        return missions.filter((mission) => {
            const normalizedSearch = searchTerm.trim().toLowerCase();
            const matchesSearch = !normalizedSearch
                || mission.title.toLowerCase().includes(normalizedSearch)
                || mission.id.toLowerCase().includes(normalizedSearch);

            const missionAlignment = mission.alignment || 'BOTH';
            const matchesAlignment = alignmentFilter === 'ALL'
                || missionAlignment === alignmentFilter
                || (alignmentFilter !== 'BOTH' && missionAlignment === 'BOTH');

            const matchesStatus = statusFilter === 'ALL' || (mission.status || 'PUBLISHED') === statusFilter;

            return matchesSearch && matchesAlignment && matchesStatus;
        });
    }, [missions, searchTerm, alignmentFilter, statusFilter]);

    const positionedMissions = useMemo(() => {
        return visibleMissions.map((mission, index) => ({
            ...mission,
            mapPosition: draftPositions[mission.id] || mission.mapPosition || getDefaultPosition(index)
        }));
    }, [draftPositions, visibleMissions]);

    const missionById = useMemo(() => {
        return new Map(positionedMissions.map((mission) => [mission.id, mission]));
    }, [positionedMissions]);

    if (!isOpen) return null;

    const handleDeleteMission = async (mission: Mission) => {
        if (!canDelete) {
            alert(language === 'es' ? 'Tu cuenta no puede borrar misiones.' : 'Your account cannot delete missions.');
            return;
        }

        if (mission.id === 'm_intro_0' && !isFullAdmin) {
            alert(language === 'es' ? 'La MH0 solo la puede borrar el admin.' : 'Only admin can delete MH0.');
            return;
        }

        const confirmed = window.confirm(language === 'es'
            ? `Vas a borrar ${mission.title}. Esta accion no se puede deshacer.`
            : `You are about to delete ${mission.title}. This cannot be undone.`);

        if (!confirmed) return;

        await deleteMissionInDB(mission.id);
        await loadMissions();
    };

    const handleMissionSaved = async () => {
        setCreatingMission(false);
        setEditingMission(null);
        await loadMissions();
    };

    const startDragging = (event: React.MouseEvent<HTMLDivElement>, mission: Mission) => {
        if (viewMode !== 'MAP') return;
        const currentPosition = draftPositions[mission.id] || mission.mapPosition || getDefaultPosition(0);

        setDragState({
            id: mission.id,
            originX: currentPosition.x,
            originY: currentPosition.y,
            startX: event.clientX,
            startY: event.clientY
        });
    };

    return (
        <div className="fixed inset-0 z-[145] bg-slate-950/90 backdrop-blur-sm p-4">
            <MissionEditor
                isOpen={creatingMission || !!editingMission}
                onClose={() => {
                    setCreatingMission(false);
                    setEditingMission(null);
                }}
                onSave={handleMissionSaved}
                language={language}
                initialData={editingMission}
                existingMissions={missions}
            />

            <div className="flex h-full w-full flex-col overflow-hidden border border-cyan-700 bg-slate-950 shadow-2xl">
                <div className="flex items-center justify-between border-b border-cyan-900 p-4">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-600">
                            {language === 'es' ? 'Repositorio de misiones' : 'Mission repository'}
                        </div>
                        <h2 className="text-lg font-black uppercase tracking-widest text-white">
                            {language === 'es' ? 'Panel de Misiones' : 'Mission Control Panel'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        {canCreate && (
                            <button
                                onClick={() => {
                                    setEditingMission(null);
                                    setCreatingMission(true);
                                }}
                                className="border border-cyan-700 bg-cyan-900/20 px-4 py-2 text-xs font-black uppercase text-cyan-300 hover:bg-cyan-900/40"
                            >
                                {language === 'es' ? 'Crear mision' : 'Create mission'}
                            </button>
                        )}
                        <button
                            onClick={() => loadMissions()}
                            className="border border-slate-700 px-4 py-2 text-xs font-black uppercase text-slate-200 hover:bg-slate-800"
                        >
                            {language === 'es' ? 'Recargar' : 'Reload'}
                        </button>
                        <button
                            onClick={onClose}
                            className="border border-red-900 px-4 py-2 text-xs font-black uppercase text-red-300 hover:bg-red-900/20"
                        >
                            {language === 'es' ? 'Cerrar' : 'Close'}
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 p-4">
                    <input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder={language === 'es' ? 'Buscar mision...' : 'Search mission...'}
                        className="w-72 border border-slate-800 bg-black p-3 text-sm text-white outline-none focus:border-cyan-500"
                    />

                    <select
                        value={alignmentFilter}
                        onChange={(event) => setAlignmentFilter(event.target.value as AlignmentFilter)}
                        className="border border-slate-800 bg-black p-3 text-xs font-black uppercase text-cyan-300 outline-none"
                    >
                        <option value="ALL">{language === 'es' ? 'Todos los bandos' : 'All alignments'}</option>
                        <option value="ALIVE">{language === 'es' ? 'Superviviente' : 'Alive'}</option>
                        <option value="ZOMBIE">{language === 'es' ? 'Zombie' : 'Zombie'}</option>
                        <option value="BOTH">{language === 'es' ? 'Ambos' : 'Both'}</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value as 'ALL' | MissionStatus)}
                        className="border border-slate-800 bg-black p-3 text-xs font-black uppercase text-cyan-300 outline-none"
                    >
                        <option value="ALL">{language === 'es' ? 'Todos los estados' : 'All statuses'}</option>
                        <option value="DRAFT">{language === 'es' ? 'Borrador' : 'Draft'}</option>
                        <option value="PUBLISHED">{language === 'es' ? 'Publicada' : 'Published'}</option>
                    </select>

                    <div className="ml-auto flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('LIST')}
                            className={`px-4 py-2 text-xs font-black uppercase ${viewMode === 'LIST' ? 'border border-cyan-700 bg-cyan-900/20 text-cyan-300' : 'border border-slate-800 text-gray-400 hover:text-white'}`}
                        >
                            {language === 'es' ? 'Lista' : 'List'}
                        </button>
                        <button
                            onClick={() => setViewMode('MAP')}
                            className={`px-4 py-2 text-xs font-black uppercase ${viewMode === 'MAP' ? 'border border-cyan-700 bg-cyan-900/20 text-cyan-300' : 'border border-slate-800 text-gray-400 hover:text-white'}`}
                        >
                            {language === 'es' ? 'Mapa' : 'Map'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden p-4">
                    {loading ? (
                        <div className="flex h-full items-center justify-center text-cyan-400">
                            {language === 'es' ? 'Cargando misiones...' : 'Loading missions...'}
                        </div>
                    ) : viewMode === 'LIST' ? (
                        <div className="grid h-full grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 xl:grid-cols-3">
                            {visibleMissions.map((mission) => {
                                const status = mission.status || 'PUBLISHED';
                                const prereqCount = mission.prereqs?.length || 0;

                                return (
                                    <div key={mission.id} className="flex flex-col gap-3 border border-slate-800 bg-slate-900/40 p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-black uppercase tracking-wide text-white">
                                                    {mission.title}
                                                </div>
                                                <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-cyan-600">
                                                    {mission.id}
                                                </div>
                                            </div>
                                            <div className={`border px-2 py-1 text-[10px] font-black uppercase ${status === 'DRAFT' ? 'border-yellow-700 text-yellow-300' : 'border-emerald-700 text-emerald-300'}`}>
                                                {status === 'DRAFT' ? (language === 'es' ? 'Borrador' : 'Draft') : (language === 'es' ? 'Publicada' : 'Published')}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase">
                                            <span className="border border-cyan-800 px-2 py-1 text-cyan-300">{mission.alignment || 'BOTH'}</span>
                                            <span className="border border-slate-700 px-2 py-1 text-slate-300">{mission.type || 'STANDARD'}</span>
                                            {mission.isProtected && (
                                                <span className="border border-red-900 px-2 py-1 text-red-300">
                                                    {language === 'es' ? 'Protegida' : 'Protected'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-xs leading-relaxed text-slate-300">
                                            {(mission.description[0] || '').slice(0, 160)}
                                        </div>

                                        <div className="mt-auto grid grid-cols-2 gap-2 text-[10px] uppercase text-gray-400">
                                            <div>{language === 'es' ? 'Conexiones' : 'Links'}: <span className="text-cyan-300">{prereqCount}</span></div>
                                            <div>{language === 'es' ? 'Objetivos' : 'Objectives'}: <span className="text-cyan-300">{mission.objectives.length}</span></div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {canEdit && (
                                                <button
                                                    onClick={() => setEditingMission(mission)}
                                                    className="border border-cyan-700 bg-cyan-900/20 px-3 py-2 text-[10px] font-black uppercase text-cyan-300 hover:bg-cyan-900/40"
                                                >
                                                    {language === 'es' ? 'Editar' : 'Edit'}
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDeleteMission(mission)}
                                                    className="border border-red-900 px-3 py-2 text-[10px] font-black uppercase text-red-300 hover:bg-red-900/20"
                                                >
                                                    {language === 'es' ? 'Borrar' : 'Delete'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div ref={canvasRef} className="relative h-full overflow-auto border border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(8,47,73,0.35),_rgba(2,6,23,1)_65%)]">
                            <svg className="pointer-events-none absolute inset-0 h-full w-full">
                                {positionedMissions.flatMap((mission) => {
                                    const sourceX = (mission.mapPosition?.x || 0) + (DEFAULT_NODE_WIDTH / 2);
                                    const sourceY = (mission.mapPosition?.y || 0) + (DEFAULT_NODE_HEIGHT / 2);

                                    return (mission.prereqs || []).map((prereqId) => {
                                        const prereqMission = missionById.get(prereqId);
                                        if (!prereqMission?.mapPosition) return null;

                                        const targetX = prereqMission.mapPosition.x + (DEFAULT_NODE_WIDTH / 2);
                                        const targetY = prereqMission.mapPosition.y + (DEFAULT_NODE_HEIGHT / 2);

                                        return (
                                            <line
                                                key={`${mission.id}_${prereqId}`}
                                                x1={targetX}
                                                y1={targetY}
                                                x2={sourceX}
                                                y2={sourceY}
                                                stroke="rgba(34,211,238,0.45)"
                                                strokeWidth="2"
                                                strokeDasharray="8 6"
                                            />
                                        );
                                    });
                                })}
                            </svg>

                            {positionedMissions.map((mission) => {
                                const status = mission.status || 'PUBLISHED';

                                return (
                                    <div
                                        key={mission.id}
                                        onMouseDown={(event) => startDragging(event, mission)}
                                        className="absolute flex cursor-move flex-col gap-2 border border-cyan-900 bg-slate-950/95 p-3 shadow-xl"
                                        style={{
                                            left: mission.mapPosition?.x || 0,
                                            top: mission.mapPosition?.y || 0,
                                            width: DEFAULT_NODE_WIDTH,
                                            minHeight: DEFAULT_NODE_HEIGHT
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="truncate text-[11px] font-black uppercase text-white">{mission.title}</div>
                                                <div className="truncate text-[9px] uppercase tracking-[0.25em] text-cyan-600">{mission.id}</div>
                                            </div>
                                            <div className={`border px-2 py-1 text-[8px] font-black uppercase ${status === 'DRAFT' ? 'border-yellow-700 text-yellow-300' : 'border-emerald-700 text-emerald-300'}`}>
                                                {status === 'DRAFT' ? 'D' : 'P'}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 text-[8px] font-black uppercase text-slate-300">
                                            <span>{mission.alignment || 'BOTH'}</span>
                                            <span>•</span>
                                            <span>{(mission.prereqs || []).length} {language === 'es' ? 'enlaces' : 'links'}</span>
                                        </div>

                                        <div className="mt-auto flex gap-2">
                                            {canEdit && (
                                                <button
                                                    onMouseDown={(event) => event.stopPropagation()}
                                                    onClick={() => setEditingMission(mission)}
                                                    className="border border-cyan-700 bg-cyan-900/20 px-2 py-1 text-[9px] font-black uppercase text-cyan-300 hover:bg-cyan-900/40"
                                                >
                                                    {language === 'es' ? 'Editar' : 'Edit'}
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onMouseDown={(event) => event.stopPropagation()}
                                                    onClick={() => handleDeleteMission(mission)}
                                                    className="border border-red-900 px-2 py-1 text-[9px] font-black uppercase text-red-300 hover:bg-red-900/20"
                                                >
                                                    {language === 'es' ? 'Borrar' : 'Delete'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
