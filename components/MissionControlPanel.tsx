import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Language } from '../translations';
import { Mission, MissionStatus } from '../types';
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

const DEFAULT_NODE_WIDTH = 190;
const DEFAULT_NODE_HEIGHT = 104;

const getDefaultPosition = (index: number) => ({
    x: 80 + ((index % 4) * 240),
    y: 90 + (Math.floor(index / 4) * 150)
});

const normalizeAlignment = (mission: Mission) => mission.alignment || 'BOTH';
const normalizeStatus = (mission: Mission) => mission.status || 'PUBLISHED';

const canLinkMissions = (source: Mission, target: Mission) => {
    const sourceAlignment = normalizeAlignment(source);
    const targetAlignment = normalizeAlignment(target);

    if (sourceAlignment === 'BOTH' || targetAlignment === 'BOTH') return true;
    return sourceAlignment === targetAlignment;
};

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
    const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
    const [selectedPrereqToAdd, setSelectedPrereqToAdd] = useState('');
    const [savingInspector, setSavingInspector] = useState(false);
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
            setSelectedMissionId((prev) => {
                if (!prev) return loaded[0]?.id || null;
                return loaded.some((mission) => mission.id === prev) ? prev : loaded[0]?.id || null;
            });
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

            const missionAlignment = normalizeAlignment(mission);
            const matchesAlignment = alignmentFilter === 'ALL'
                || missionAlignment === alignmentFilter
                || (alignmentFilter !== 'BOTH' && missionAlignment === 'BOTH');

            const matchesStatus = statusFilter === 'ALL' || normalizeStatus(mission) === statusFilter;

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
        return new Map(missions.map((mission) => [mission.id, mission]));
    }, [missions]);

    const positionedMissionById = useMemo(() => {
        return new Map(positionedMissions.map((mission) => [mission.id, mission]));
    }, [positionedMissions]);

    const selectedMission = useMemo(() => {
        if (!selectedMissionId) return null;
        return missionById.get(selectedMissionId) || null;
    }, [missionById, selectedMissionId]);

    const incomingMissions = useMemo(() => {
        if (!selectedMission) return [];
        return missions.filter((mission) => (mission.prereqs || []).includes(selectedMission.id));
    }, [missions, selectedMission]);

    const availablePrereqTargets = useMemo(() => {
        if (!selectedMission) return [];

        return missions.filter((mission) => {
            if (mission.id === selectedMission.id) return false;
            if ((selectedMission.prereqs || []).includes(mission.id)) return false;
            return canLinkMissions(selectedMission, mission);
        });
    }, [missions, selectedMission]);

    if (!isOpen) return null;

    const replaceMission = (updatedMission: Mission) => {
        const refreshed = missions.map((mission) => mission.id === updatedMission.id ? updatedMission : mission);
        setMissions(refreshed);
        onRepositoryUpdated?.(refreshed);
    };

    const applyMissionPatch = async (missionId: string, patch: Partial<Mission>) => {
        const currentMission = missionById.get(missionId);
        if (!currentMission) return;

        setSavingInspector(true);

        try {
            await updateMissionInDB(missionId, patch);
            replaceMission({ ...currentMission, ...patch });
        } catch (error) {
            console.error(error);
            alert(language === 'es' ? 'No se pudo guardar el cambio.' : 'Could not save the change.');
        } finally {
            setSavingInspector(false);
        }
    };

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

    const handleAddPrereq = async () => {
        if (!selectedMission || !selectedPrereqToAdd) return;

        const nextPrereqs = [...(selectedMission.prereqs || []), selectedPrereqToAdd];
        await applyMissionPatch(selectedMission.id, {
            prereq: nextPrereqs[0] || undefined,
            prereqs: nextPrereqs
        });
        setSelectedPrereqToAdd('');
    };

    const handleRemovePrereq = async (prereqId: string) => {
        if (!selectedMission) return;

        const nextPrereqs = (selectedMission.prereqs || []).filter((item) => item !== prereqId);
        await applyMissionPatch(selectedMission.id, {
            prereq: nextPrereqs[0] || undefined,
            prereqs: nextPrereqs
        });
    };

    const startDragging = (event: React.MouseEvent<HTMLDivElement>, mission: Mission) => {
        if (viewMode !== 'MAP') return;

        const currentPosition = draftPositions[mission.id] || mission.mapPosition || getDefaultPosition(0);
        setSelectedMissionId(mission.id);
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

            <div className="flex h-full w-full overflow-hidden border border-cyan-700 bg-slate-950 shadow-2xl">
                <div className="flex min-w-0 flex-1 flex-col">
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
                                    const status = normalizeStatus(mission);
                                    const prereqCount = mission.prereqs?.length || 0;
                                    const isSelected = mission.id === selectedMissionId;

                                    return (
                                        <div
                                            key={mission.id}
                                            onClick={() => setSelectedMissionId(mission.id)}
                                            className={`flex cursor-pointer flex-col gap-3 border p-4 transition-colors ${isSelected ? 'border-cyan-500 bg-cyan-950/20' : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/70'}`}
                                        >
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
                                                <span className="border border-cyan-800 px-2 py-1 text-cyan-300">{normalizeAlignment(mission)}</span>
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
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            setEditingMission(mission);
                                                        }}
                                                        className="border border-cyan-700 bg-cyan-900/20 px-3 py-2 text-[10px] font-black uppercase text-cyan-300 hover:bg-cyan-900/40"
                                                    >
                                                        {language === 'es' ? 'Editar' : 'Edit'}
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleDeleteMission(mission);
                                                        }}
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
                                <div className="pointer-events-none absolute left-4 top-4 z-20 flex gap-2 text-[10px] uppercase tracking-[0.25em]">
                                    <span className="border border-emerald-700 bg-black/60 px-2 py-1 text-emerald-300">{language === 'es' ? 'Publicada' : 'Published'}</span>
                                    <span className="border border-yellow-700 bg-black/60 px-2 py-1 text-yellow-300">{language === 'es' ? 'Borrador' : 'Draft'}</span>
                                    <span className="border border-cyan-700 bg-black/60 px-2 py-1 text-cyan-300">{language === 'es' ? 'Arrastra para ordenar' : 'Drag to arrange'}</span>
                                </div>

                                <svg className="pointer-events-none absolute inset-0 h-full w-full">
                                    {positionedMissions.flatMap((mission) => {
                                        const sourceX = (mission.mapPosition?.x || 0) + (DEFAULT_NODE_WIDTH / 2);
                                        const sourceY = (mission.mapPosition?.y || 0) + (DEFAULT_NODE_HEIGHT / 2);

                                        return (mission.prereqs || []).map((prereqId) => {
                                            const prereqMission = positionedMissionById.get(prereqId);
                                            if (!prereqMission?.mapPosition) return null;

                                            const targetX = prereqMission.mapPosition.x + (DEFAULT_NODE_WIDTH / 2);
                                            const targetY = prereqMission.mapPosition.y + (DEFAULT_NODE_HEIGHT / 2);
                                            const isHighlighted = mission.id === selectedMissionId || prereqId === selectedMissionId;

                                            return (
                                                <line
                                                    key={`${mission.id}_${prereqId}`}
                                                    x1={targetX}
                                                    y1={targetY}
                                                    x2={sourceX}
                                                    y2={sourceY}
                                                    stroke={isHighlighted ? 'rgba(34,211,238,0.92)' : 'rgba(34,211,238,0.32)'}
                                                    strokeWidth={isHighlighted ? '3' : '2'}
                                                    strokeDasharray={isHighlighted ? '0' : '8 6'}
                                                />
                                            );
                                        });
                                    })}
                                </svg>

                                {positionedMissions.map((mission) => {
                                    const status = normalizeStatus(mission);
                                    const isSelected = mission.id === selectedMissionId;
                                    const borderTone = status === 'DRAFT' ? 'border-yellow-700' : 'border-emerald-700';
                                    const textTone = status === 'DRAFT' ? 'text-yellow-300' : 'text-emerald-300';

                                    return (
                                        <div
                                            key={mission.id}
                                            onMouseDown={(event) => startDragging(event, mission)}
                                            onClick={() => setSelectedMissionId(mission.id)}
                                            onDoubleClick={() => canEdit && setEditingMission(mission)}
                                            className={`absolute flex cursor-move flex-col gap-2 border bg-slate-950/95 p-3 shadow-xl transition-colors ${isSelected ? 'border-cyan-400 ring-2 ring-cyan-500/40' : borderTone}`}
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
                                                <div className={`border px-2 py-1 text-[8px] font-black uppercase ${textTone} ${borderTone}`}>
                                                    {status === 'DRAFT' ? 'D' : 'P'}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 text-[8px] font-black uppercase text-slate-300">
                                                <span>{normalizeAlignment(mission)}</span>
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
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <aside className="w-[360px] border-l border-slate-800 bg-slate-950/90 p-4 overflow-y-auto">
                    {selectedMission ? (
                        <div className="space-y-5">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-600">
                                    {language === 'es' ? 'Inspector' : 'Inspector'}
                                </div>
                                <h3 className="mt-2 text-lg font-black uppercase tracking-wide text-white">
                                    {selectedMission.title}
                                </h3>
                                <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-cyan-700">
                                    {selectedMission.id}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase">
                                <span className="border border-cyan-800 px-2 py-1 text-cyan-300">{normalizeAlignment(selectedMission)}</span>
                                <span className={`border px-2 py-1 ${normalizeStatus(selectedMission) === 'DRAFT' ? 'border-yellow-700 text-yellow-300' : 'border-emerald-700 text-emerald-300'}`}>
                                    {normalizeStatus(selectedMission) === 'DRAFT' ? (language === 'es' ? 'Borrador' : 'Draft') : (language === 'es' ? 'Publicada' : 'Published')}
                                </span>
                                {selectedMission.isProtected && (
                                    <span className="border border-red-900 px-2 py-1 text-red-300">
                                        {language === 'es' ? 'Protegida' : 'Protected'}
                                    </span>
                                )}
                            </div>

                            <div className="border border-slate-800 bg-black/30 p-3 text-sm leading-relaxed text-slate-300">
                                {(selectedMission.description || []).join(' ').slice(0, 280) || (language === 'es' ? 'Sin descripcion.' : 'No description.')}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {canEdit && (
                                    <button
                                        onClick={() => setEditingMission(selectedMission)}
                                        className="border border-cyan-700 bg-cyan-900/20 px-3 py-3 text-xs font-black uppercase text-cyan-300 hover:bg-cyan-900/40"
                                    >
                                        {language === 'es' ? 'Editar completa' : 'Full edit'}
                                    </button>
                                )}
                                {canDelete && (
                                    <button
                                        onClick={() => handleDeleteMission(selectedMission)}
                                        className="border border-red-900 px-3 py-3 text-xs font-black uppercase text-red-300 hover:bg-red-900/20"
                                    >
                                        {language === 'es' ? 'Borrar' : 'Delete'}
                                    </button>
                                )}
                            </div>

                            {canEdit && (
                                <div className="space-y-3 border border-slate-800 bg-slate-900/30 p-4">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">
                                        {language === 'es' ? 'Publicacion rapida' : 'Quick publish'}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            disabled={savingInspector || normalizeStatus(selectedMission) === 'DRAFT'}
                                            onClick={() => applyMissionPatch(selectedMission.id, { status: 'DRAFT' })}
                                            className="border border-yellow-700 px-3 py-2 text-[10px] font-black uppercase text-yellow-300 hover:bg-yellow-900/20 disabled:opacity-40"
                                        >
                                            {language === 'es' ? 'Pasar a borrador' : 'Set draft'}
                                        </button>
                                        <button
                                            disabled={savingInspector || normalizeStatus(selectedMission) === 'PUBLISHED'}
                                            onClick={() => applyMissionPatch(selectedMission.id, { status: 'PUBLISHED' })}
                                            className="border border-emerald-700 px-3 py-2 text-[10px] font-black uppercase text-emerald-300 hover:bg-emerald-900/20 disabled:opacity-40"
                                        >
                                            {language === 'es' ? 'Publicar' : 'Publish'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3 border border-slate-800 bg-slate-900/30 p-4">
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">
                                    {language === 'es' ? 'Aparece despues de...' : 'Appears after...'}
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        value={selectedPrereqToAdd}
                                        onChange={(event) => setSelectedPrereqToAdd(event.target.value)}
                                        className="flex-1 border border-slate-800 bg-black p-3 text-xs text-white outline-none"
                                    >
                                        <option value="">{language === 'es' ? 'Elegir mision anterior' : 'Choose previous mission'}</option>
                                        {availablePrereqTargets.map((mission) => (
                                            <option key={mission.id} value={mission.id}>
                                                {mission.title}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        disabled={!canEdit || !selectedPrereqToAdd || savingInspector}
                                        onClick={handleAddPrereq}
                                        className="border border-cyan-700 bg-cyan-900/20 px-3 py-2 text-[10px] font-black uppercase text-cyan-300 hover:bg-cyan-900/40 disabled:opacity-40"
                                    >
                                        {language === 'es' ? 'Conectar' : 'Link'}
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {(selectedMission.prereqs || []).length > 0 ? (
                                        (selectedMission.prereqs || []).map((prereqId) => {
                                            const prereqMission = missionById.get(prereqId);

                                            return (
                                                <div key={prereqId} className="flex items-center justify-between gap-2 border border-slate-800 bg-black/30 px-3 py-2">
                                                    <div className="min-w-0">
                                                        <div className="truncate text-xs font-bold text-white">
                                                            {prereqMission?.title || prereqId}
                                                        </div>
                                                        <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-700">
                                                            {prereqId}
                                                        </div>
                                                    </div>
                                                    {canEdit && (
                                                        <button
                                                            disabled={savingInspector}
                                                            onClick={() => handleRemovePrereq(prereqId)}
                                                            className="border border-red-900 px-2 py-1 text-[10px] font-black uppercase text-red-300 hover:bg-red-900/20 disabled:opacity-40"
                                                        >
                                                            {language === 'es' ? 'Quitar' : 'Remove'}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-xs text-gray-500">
                                            {language === 'es' ? 'Esta mision no depende de ninguna otra.' : 'This mission has no dependencies.'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3 border border-slate-800 bg-slate-900/30 p-4">
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">
                                    {language === 'es' ? 'Desbloquea a...' : 'Unlocks...'}
                                </div>
                                <div className="space-y-2">
                                    {incomingMissions.length > 0 ? (
                                        incomingMissions.map((mission) => (
                                            <button
                                                key={mission.id}
                                                onClick={() => setSelectedMissionId(mission.id)}
                                                className="w-full border border-slate-800 bg-black/30 px-3 py-2 text-left hover:border-cyan-700 hover:bg-cyan-950/20"
                                            >
                                                <div className="truncate text-xs font-bold text-white">{mission.title}</div>
                                                <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-700">{mission.id}</div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-xs text-gray-500">
                                            {language === 'es' ? 'Ninguna mision depende de esta todavia.' : 'No mission depends on this one yet.'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-500">
                            {language === 'es' ? 'Selecciona una mision para verla mejor.' : 'Select a mission to inspect it.'}
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};
