import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Language } from '../translations';
import { Mission, MissionStatus, MissionType } from '../types';
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
type FactionFilter = 'ALL' | 'magneto' | 'kingpin' | 'hulk' | 'doom' | 'neutral';
type BulkAlignmentValue = 'UNCHANGED' | 'ALIVE' | 'ZOMBIE' | 'BOTH';
type BulkStatusValue = 'UNCHANGED' | MissionStatus;
type BulkTypeValue = 'UNCHANGED' | MissionType;

const DEFAULT_NODE_WIDTH = 190;
const DEFAULT_NODE_HEIGHT = 104;
const MISSION_TYPE_OPTIONS: MissionType[] = [
    'STANDARD',
    'INTRODUCTORY',
    'SHIELD_BASE',
    'BOSS_KINGPIN',
    'BOSS_MAGNETO',
    'BOSS_DOOM',
    'BOSS_HULK',
    'GALACTUS'
];

const getMissionTypeLabel = (type?: MissionType) => {
    switch (type) {
        case 'INTRODUCTORY': return 'INTRO';
        case 'SHIELD_BASE': return 'BASE SHIELD';
        case 'BOSS_KINGPIN': return 'JEFE KINGPIN';
        case 'BOSS_MAGNETO': return 'JEFE MAGNETO';
        case 'BOSS_DOOM': return 'JEFE DOOM';
        case 'BOSS_HULK': return 'JEFE HULK';
        case 'GALACTUS': return 'GALACTUS';
        case 'STANDARD':
        default:
            return 'ESTANDAR';
    }
};

const getMissionTypeZoneLabel = (mission: Mission) => {
    const zoneLabel = FACTION_STYLES[getFactionForState(mission.location.state)].label;
    return `${getMissionTypeLabel(mission.type)} (${zoneLabel})`;
};

const FACTION_STATES = {
    magneto: new Set(['Washington', 'Oregon', 'California', 'Nevada', 'Idaho', 'Montana', 'Wyoming', 'Utah', 'Arizona', 'Colorado', 'Alaska', 'Hawaii']),
    kingpin: new Set(['Maine', 'New Hampshire', 'Vermont', 'New York', 'Massachusetts', 'Rhode Island', 'Connecticut', 'New Jersey', 'Pennsylvania', 'Delaware', 'Maryland', 'West Virginia', 'Virginia', 'District of Columbia']),
    hulk: new Set(['North Dakota', 'South Dakota', 'Nebraska', 'Kansas', 'Oklahoma', 'Texas', 'New Mexico', 'Minnesota', 'Iowa', 'Missouri', 'Wisconsin', 'Illinois', 'Michigan', 'Indiana', 'Ohio']),
    doom: new Set(['Arkansas', 'Louisiana', 'Mississippi', 'Alabama', 'Tennessee', 'Kentucky', 'Georgia', 'Florida', 'South Carolina', 'North Carolina'])
};

const getFactionForState = (state: string) => {
    if (FACTION_STATES.magneto.has(state)) return 'magneto';
    if (FACTION_STATES.kingpin.has(state)) return 'kingpin';
    if (FACTION_STATES.hulk.has(state)) return 'hulk';
    if (FACTION_STATES.doom.has(state)) return 'doom';
    return 'neutral';
};

const FACTION_STYLES = {
    magneto: {
        label: 'MAGNETO',
        edge: 'border-red-700',
        badge: 'border-red-700 text-red-300',
        glow: 'shadow-[0_0_20px_rgba(185,28,28,0.25)]',
        line: 'rgba(248,113,113,0.65)'
    },
    kingpin: {
        label: 'KINGPIN',
        edge: 'border-purple-700',
        badge: 'border-purple-700 text-purple-300',
        glow: 'shadow-[0_0_20px_rgba(126,34,206,0.25)]',
        line: 'rgba(192,132,252,0.65)'
    },
    hulk: {
        label: 'HULK',
        edge: 'border-lime-700',
        badge: 'border-lime-700 text-lime-300',
        glow: 'shadow-[0_0_20px_rgba(101,163,13,0.25)]',
        line: 'rgba(163,230,53,0.65)'
    },
    doom: {
        label: 'DOOM',
        edge: 'border-cyan-700',
        badge: 'border-cyan-700 text-cyan-300',
        glow: 'shadow-[0_0_20px_rgba(8,145,178,0.25)]',
        line: 'rgba(103,232,249,0.65)'
    },
    neutral: {
        label: 'NEUTRAL',
        edge: 'border-slate-600',
        badge: 'border-slate-600 text-slate-300',
        glow: 'shadow-[0_0_20px_rgba(100,116,139,0.18)]',
        line: 'rgba(148,163,184,0.45)'
    }
} as const;

const getDefaultPosition = (index: number) => ({
    x: 80 + ((index % 4) * 240),
    y: 90 + (Math.floor(index / 4) * 150)
});

const normalizeAlignment = (mission: Mission) => mission.alignment || 'BOTH';
const normalizeStatus = (mission: Mission) => mission.status || 'PUBLISHED';
const normalizeMissionRole = (mission: Mission) => mission.missionRole || 'PRIMARY';
const getMissionRoleLabel = (mission: Mission, language: Language) => (
    normalizeMissionRole(mission) === 'OPTIONAL'
        ? (language === 'es' ? 'Secundaria' : 'Optional')
        : (language === 'es' ? 'Principal' : 'Primary')
);

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
    const [factionFilter, setFactionFilter] = useState<FactionFilter>('ALL');
    const [viewMode, setViewMode] = useState<ViewMode>('LIST');
    const [editingMission, setEditingMission] = useState<Mission | null>(null);
    const [creatingMission, setCreatingMission] = useState(false);
    const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
    const [selectedPrereqToAdd, setSelectedPrereqToAdd] = useState('');
    const [connectMode, setConnectMode] = useState(false);
    const [savingInspector, setSavingInspector] = useState(false);
    const [selectedMissionIds, setSelectedMissionIds] = useState<string[]>([]);
    const [bulkAlignment, setBulkAlignment] = useState<BulkAlignmentValue>('UNCHANGED');
    const [bulkStatus, setBulkStatus] = useState<BulkStatusValue>('UNCHANGED');
    const [bulkType, setBulkType] = useState<BulkTypeValue>('UNCHANGED');
    const [bulkSaving, setBulkSaving] = useState(false);
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
            setSelectedMissionIds((prev) => prev.filter((missionId) => loaded.some((mission) => mission.id === missionId)));
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
            const draggedMissionId = dragState.id;
            const droppedPosition = draftPositions[dragState.id];
            setDragState(null);

            if (!droppedPosition) return;

            try {
                await updateMissionInDB(draggedMissionId, { mapPosition: droppedPosition });
                const refreshed = missions.map((mission) => (
                    mission.id === draggedMissionId ? { ...mission, mapPosition: droppedPosition } : mission
                ));
                setMissions(refreshed);
                setDraftPositions((prev) => {
                    const next = { ...prev };
                    delete next[draggedMissionId];
                    return next;
                });
                onRepositoryUpdated?.(refreshed);
            } catch (error) {
                console.error(error);
                setDraftPositions((prev) => {
                    const next = { ...prev };
                    delete next[draggedMissionId];
                    return next;
                });
                alert(language === 'es' ? 'No se pudo guardar la nueva posicion.' : 'Could not save the new position.');
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
            const matchesFaction = factionFilter === 'ALL' || getFactionForState(mission.location.state) === factionFilter;

            return matchesSearch && matchesAlignment && matchesStatus && matchesFaction;
        });
    }, [missions, searchTerm, alignmentFilter, statusFilter, factionFilter]);

    const positionedMissions = useMemo(() => {
        return visibleMissions.map((mission, index) => ({
            ...mission,
            mapPosition: draftPositions[mission.id] || mission.mapPosition || getDefaultPosition(index)
        }));
    }, [draftPositions, visibleMissions]);

    const selectedMissions = useMemo(() => {
        return missions.filter((mission) => selectedMissionIds.includes(mission.id));
    }, [missions, selectedMissionIds]);

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

    useEffect(() => {
        setSelectedPrereqToAdd('');
        setConnectMode(false);
    }, [selectedMissionId]);

    useEffect(() => {
        setSelectedMissionIds((prev) => prev.filter((missionId) => missions.some((mission) => mission.id === missionId)));
    }, [missions]);

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

    const toggleMissionSelection = (missionId: string) => {
        setSelectedMissionIds((prev) => (
            prev.includes(missionId)
                ? prev.filter((item) => item !== missionId)
                : [...prev, missionId]
        ));
    };

    const handleSelectAllVisible = () => {
        setSelectedMissionIds(visibleMissions.map((mission) => mission.id));
    };

    const handleClearSelection = () => {
        setSelectedMissionIds([]);
    };

    const handleQuickStatusFilter = (nextStatus: 'ALL' | MissionStatus) => {
        setStatusFilter(nextStatus);
    };

    const handleQuickFactionFilter = (nextFaction: FactionFilter) => {
        setFactionFilter(nextFaction);
    };

    const handleQuickResetFilters = () => {
        setFactionFilter('ALL');
        setStatusFilter('ALL');
    };

    const handleApplyBulkChanges = async () => {
        if (!canEdit) return;

        if (selectedMissions.length === 0) {
            alert(language === 'es' ? 'Primero marca al menos una mision.' : 'Select at least one mission first.');
            return;
        }

        const patch: Partial<Mission> = {};

        if (bulkAlignment !== 'UNCHANGED') patch.alignment = bulkAlignment;
        if (bulkStatus !== 'UNCHANGED') patch.status = bulkStatus;
        if (bulkType !== 'UNCHANGED') patch.type = bulkType;

        if (Object.keys(patch).length === 0) {
            alert(language === 'es' ? 'Elige al menos un cambio antes de aplicar.' : 'Choose at least one change before applying.');
            return;
        }

        setBulkSaving(true);

        try {
            await Promise.all(selectedMissions.map((mission) => updateMissionInDB(mission.id, patch)));

            const selectedIds = new Set(selectedMissionIds);
            const refreshed = missions.map((mission) => (
                selectedIds.has(mission.id) ? { ...mission, ...patch } : mission
            ));

            setMissions(refreshed);
            onRepositoryUpdated?.(refreshed);
            setBulkAlignment('UNCHANGED');
            setBulkStatus('UNCHANGED');
            setBulkType('UNCHANGED');
            alert(language === 'es' ? 'Cambios aplicados a las misiones marcadas.' : 'Changes applied to selected missions.');
        } catch (error) {
            console.error(error);
            alert(language === 'es' ? 'No se pudieron aplicar los cambios en bloque.' : 'Could not apply bulk changes.');
        } finally {
            setBulkSaving(false);
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

    const handleMapMissionClick = async (mission: Mission) => {
        if (!connectMode || !selectedMission || !canEdit) {
            setSelectedMissionId(mission.id);
            return;
        }

        if (mission.id === selectedMission.id) {
            setSelectedMissionId(mission.id);
            return;
        }

        if (!canLinkMissions(selectedMission, mission)) {
            alert(language === 'es'
                ? 'Esas misiones no se pueden conectar por el bando que tienen.'
                : 'Those missions cannot be linked because of their alignment.');
            return;
        }

        const alreadyLinked = (selectedMission.prereqs || []).includes(mission.id);
        const nextPrereqs = alreadyLinked
            ? (selectedMission.prereqs || []).filter((item) => item !== mission.id)
            : [...(selectedMission.prereqs || []), mission.id];

        await applyMissionPatch(selectedMission.id, {
            prereq: nextPrereqs[0] || undefined,
            prereqs: nextPrereqs
        });
    };

    const startDragging = (event: React.MouseEvent<HTMLDivElement>, mission: Mission) => {
        if (viewMode !== 'MAP') return;
        if (event.button !== 0) return;

        event.preventDefault();

        const currentPosition = draftPositions[mission.id] || mission.mapPosition || getDefaultPosition(0);
        if (!connectMode) {
            setSelectedMissionId(mission.id);
        }
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

                    {canEdit && (
                        <div className="flex flex-wrap items-end gap-3 border-b border-slate-800 bg-slate-900/30 p-4">
                            <div className="min-w-[160px]">
                                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">
                                    {language === 'es' ? 'Seleccion multiple' : 'Multi select'}
                                </div>
                                <div className="text-sm font-bold text-white">
                                    {selectedMissionIds.length} {language === 'es' ? 'marcadas' : 'selected'}
                                </div>
                            </div>

                            <select
                                value={bulkAlignment}
                                onChange={(event) => setBulkAlignment(event.target.value as BulkAlignmentValue)}
                                className="border border-slate-800 bg-black p-3 text-xs font-black uppercase text-cyan-300 outline-none"
                            >
                                <option value="UNCHANGED">{language === 'es' ? 'Bando: sin cambio' : 'Alignment: no change'}</option>
                                <option value="ALIVE">{language === 'es' ? 'Heroes' : 'Alive'}</option>
                                <option value="ZOMBIE">{language === 'es' ? 'Zombis' : 'Zombie'}</option>
                                <option value="BOTH">{language === 'es' ? 'Ambos' : 'Both'}</option>
                            </select>

                            <select
                                value={bulkStatus}
                                onChange={(event) => setBulkStatus(event.target.value as BulkStatusValue)}
                                className="border border-slate-800 bg-black p-3 text-xs font-black uppercase text-cyan-300 outline-none"
                            >
                                <option value="UNCHANGED">{language === 'es' ? 'Publicacion: sin cambio' : 'Publication: no change'}</option>
                                <option value="DRAFT">{language === 'es' ? 'Borrador' : 'Draft'}</option>
                                <option value="PUBLISHED">{language === 'es' ? 'Publicada' : 'Published'}</option>
                            </select>

                            <select
                                value={bulkType}
                                onChange={(event) => setBulkType(event.target.value as BulkTypeValue)}
                                className="border border-slate-800 bg-black p-3 text-xs font-black uppercase text-cyan-300 outline-none"
                            >
                                <option value="UNCHANGED">{language === 'es' ? 'Clasificacion: sin cambio' : 'Classification: no change'}</option>
                                {MISSION_TYPE_OPTIONS.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>

                            <button
                                onClick={handleSelectAllVisible}
                                className="border border-slate-700 px-4 py-3 text-[10px] font-black uppercase text-slate-200 hover:bg-slate-800"
                            >
                                {language === 'es' ? 'Marcar visibles' : 'Select visible'}
                            </button>

                            <button
                                onClick={handleClearSelection}
                                className="border border-slate-700 px-4 py-3 text-[10px] font-black uppercase text-slate-200 hover:bg-slate-800"
                            >
                                {language === 'es' ? 'Limpiar marca' : 'Clear selection'}
                            </button>

                            <button
                                disabled={bulkSaving || selectedMissionIds.length === 0}
                                onClick={handleApplyBulkChanges}
                                className="border border-cyan-700 bg-cyan-900/20 px-4 py-3 text-[10px] font-black uppercase text-cyan-300 hover:bg-cyan-900/40 disabled:opacity-40"
                            >
                                {bulkSaving
                                    ? (language === 'es' ? 'Aplicando...' : 'Applying...')
                                    : (language === 'es' ? 'Aplicar cambios' : 'Apply changes')}
                            </button>
                        </div>
                    )}

                    <div className="flex-1 overflow-hidden p-4">
                        {loading ? (
                            <div className="flex h-full items-center justify-center text-cyan-400">
                                {language === 'es' ? 'Cargando misiones...' : 'Loading missions...'}
                            </div>
                        ) : viewMode === 'LIST' ? (
                            <div className="grid h-full grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 xl:grid-cols-3">
                                {visibleMissions.map((mission) => {
                                    const status = normalizeStatus(mission);
                                    const missionRole = normalizeMissionRole(mission);
                                    const prereqCount = mission.prereqs?.length || 0;
                                    const isSelected = mission.id === selectedMissionId;
                                    const isMarked = selectedMissionIds.includes(mission.id);
                                    const faction = getFactionForState(mission.location.state);
                                    const factionStyle = FACTION_STYLES[faction];

                                    return (
                                        <div
                                            key={mission.id}
                                            onClick={() => setSelectedMissionId(mission.id)}
                                            className={`flex cursor-pointer flex-col gap-3 border-l-4 p-4 transition-colors ${factionStyle.edge} ${factionStyle.glow} ${isSelected ? 'border-cyan-500 bg-cyan-950/20' : 'border-y border-r border-slate-800 bg-slate-900/40 hover:bg-slate-900/70'}`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex min-w-0 items-start gap-3">
                                                    {canEdit && (
                                                        <button
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                toggleMissionSelection(mission.id);
                                                            }}
                                                            className={`mt-0.5 h-5 w-5 border text-[10px] font-black uppercase ${isMarked ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300' : 'border-slate-700 text-slate-500 hover:border-cyan-700 hover:text-cyan-300'}`}
                                                        >
                                                            {isMarked ? 'X' : ''}
                                                        </button>
                                                    )}
                                                    <div className="min-w-0">
                                                        <div className="truncate text-sm font-black uppercase tracking-wide text-white">
                                                            {mission.title}
                                                        </div>
                                                        <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-cyan-600">
                                                            {mission.id}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isMarked && (
                                                        <div className="border border-cyan-700 px-2 py-1 text-[10px] font-black uppercase text-cyan-300">
                                                            {language === 'es' ? 'Marcada' : 'Selected'}
                                                        </div>
                                                    )}
                                                    <div className={`border px-2 py-1 text-[10px] font-black uppercase ${status === 'DRAFT' ? 'border-yellow-700 text-yellow-300' : 'border-emerald-700 text-emerald-300'}`}>
                                                        {status === 'DRAFT' ? (language === 'es' ? 'Borrador' : 'Draft') : (language === 'es' ? 'Publicada' : 'Published')}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase">
                                                <span className={`border px-2 py-1 ${factionStyle.badge}`}>{getMissionTypeZoneLabel(mission)}</span>
                                                <span className="border border-cyan-800 px-2 py-1 text-cyan-300">{normalizeAlignment(mission)}</span>
                                                <span className={`border px-2 py-1 ${missionRole === 'OPTIONAL' ? 'border-amber-700 text-amber-300' : 'border-sky-700 text-sky-300'}`}>
                                                    {getMissionRoleLabel(mission, language)}
                                                </span>
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
                            <div ref={canvasRef} className="relative h-full overflow-auto border border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(8,47,73,0.35),_rgba(2,6,23,1)_65%)] select-none">
                                <div className="absolute left-4 top-4 z-20 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.25em]">
                                    <button
                                        onClick={() => handleQuickStatusFilter('PUBLISHED')}
                                        className={`border px-2 py-1 ${statusFilter === 'PUBLISHED' ? 'border-emerald-500 bg-emerald-950/50 text-emerald-200' : 'border-emerald-700 bg-black/60 text-emerald-300'}`}
                                    >
                                        {language === 'es' ? 'Publicada' : 'Published'}
                                    </button>
                                    <button
                                        onClick={() => handleQuickStatusFilter('DRAFT')}
                                        className={`border px-2 py-1 ${statusFilter === 'DRAFT' ? 'border-yellow-500 bg-yellow-950/50 text-yellow-200' : 'border-yellow-700 bg-black/60 text-yellow-300'}`}
                                    >
                                        {language === 'es' ? 'Borrador' : 'Draft'}
                                    </button>
                                    <button
                                        onClick={handleQuickResetFilters}
                                        className={`border px-2 py-1 ${statusFilter === 'ALL' && factionFilter === 'ALL' ? 'border-cyan-400 bg-cyan-950/50 text-cyan-200' : 'border-cyan-700 bg-black/60 text-cyan-300'}`}
                                    >
                                        {language === 'es' ? 'Todas' : 'All'}
                                    </button>
                                    {Object.entries(FACTION_STYLES).map(([key, value]) => (
                                        <button
                                            key={key}
                                            onClick={() => handleQuickFactionFilter(key as FactionFilter)}
                                            className={`border bg-black/60 px-2 py-1 ${factionFilter === key ? 'bg-white/10 text-white' : value.badge}`}
                                        >
                                            {value.label}
                                        </button>
                                    ))}
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
                                            const factionLine = FACTION_STYLES[getFactionForState(mission.location.state)].line;

                                            return (
                                                <line
                                                    key={`${mission.id}_${prereqId}`}
                                                    x1={targetX}
                                                    y1={targetY}
                                                    x2={sourceX}
                                                    y2={sourceY}
                                                    stroke={isHighlighted ? factionLine : 'rgba(148,163,184,0.28)'}
                                                    strokeWidth={isHighlighted ? '3' : '2'}
                                                    strokeDasharray={isHighlighted ? '0' : '8 6'}
                                                />
                                            );
                                        });
                                    })}
                                </svg>

                                {positionedMissions.map((mission) => {
                                    const status = normalizeStatus(mission);
                                    const missionRole = normalizeMissionRole(mission);
                                    const isSelected = mission.id === selectedMissionId;
                                    const isMarked = selectedMissionIds.includes(mission.id);
                                    const faction = getFactionForState(mission.location.state);
                                    const factionStyle = FACTION_STYLES[faction];
                                    const borderTone = status === 'DRAFT' ? 'border-yellow-700' : factionStyle.edge;
                                    const textTone = status === 'DRAFT' ? 'text-yellow-300' : 'text-emerald-300';
                                    const isLinkTarget = connectMode
                                        && !!selectedMission
                                        && mission.id !== selectedMission.id
                                        && canLinkMissions(selectedMission, mission);
                                    const isAlreadyLinked = !!selectedMission && (selectedMission.prereqs || []).includes(mission.id);

                                    return (
                                        <div
                                            key={mission.id}
                                            onMouseDown={(event) => startDragging(event, mission)}
                                            onClick={() => handleMapMissionClick(mission)}
                                            onDoubleClick={() => canEdit && setEditingMission(mission)}
                                            className={`absolute flex cursor-move flex-col gap-2 border bg-slate-950/95 p-3 shadow-xl transition-colors select-none ${factionStyle.glow} ${isSelected ? 'border-cyan-400 ring-2 ring-cyan-500/40' : borderTone} ${missionRole === 'OPTIONAL' ? 'border-dashed' : ''} ${isLinkTarget ? 'ring-2 ring-violet-500/30' : ''}`}
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
                                                <div className="flex items-center gap-1">
                                                    {canEdit && (
                                                        <button
                                                            onMouseDown={(event) => {
                                                                event.stopPropagation();
                                                                event.preventDefault();
                                                            }}
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                toggleMissionSelection(mission.id);
                                                            }}
                                                            className={`h-5 w-5 border text-[9px] font-black uppercase ${isMarked ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300' : 'border-slate-700 text-slate-500 hover:border-cyan-700 hover:text-cyan-300'}`}
                                                        >
                                                            {isMarked ? 'X' : ''}
                                                        </button>
                                                    )}
                                                    <div className={`border px-2 py-1 text-[8px] font-black uppercase ${textTone} ${borderTone}`}>
                                                        {status === 'DRAFT' ? 'D' : 'P'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 text-[8px] font-black uppercase text-slate-300">
                                                <span className={factionStyle.badge}>{getMissionTypeZoneLabel(mission)}</span>
                                                <span>{normalizeAlignment(mission)}</span>
                                                <span>•</span>
                                                <span className={missionRole === 'OPTIONAL' ? 'text-amber-300' : 'text-sky-300'}>
                                                    {getMissionRoleLabel(mission, language)}
                                                </span>
                                                <span>•</span>
                                                <span>{(mission.prereqs || []).length} {language === 'es' ? 'enlaces' : 'links'}</span>
                                                {isAlreadyLinked && <span className="text-violet-300">{language === 'es' ? 'conectada' : 'linked'}</span>}
                                                {isMarked && <span className="text-cyan-300">{language === 'es' ? 'marcada' : 'selected'}</span>}
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
                                <span className={`border px-2 py-1 ${FACTION_STYLES[getFactionForState(selectedMission.location.state)].badge}`}>
                                    {getMissionTypeZoneLabel(selectedMission)}
                                </span>
                                <span className="border border-cyan-800 px-2 py-1 text-cyan-300">{normalizeAlignment(selectedMission)}</span>
                                <span className={`border px-2 py-1 ${normalizeMissionRole(selectedMission) === 'OPTIONAL' ? 'border-amber-700 text-amber-300' : 'border-sky-700 text-sky-300'}`}>
                                    {getMissionRoleLabel(selectedMission, language)}
                                </span>
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
                                {viewMode === 'MAP' && canEdit && (
                                    <button
                                        disabled={savingInspector}
                                        onClick={() => setConnectMode((prev) => !prev)}
                                        className={`w-full border px-3 py-2 text-[10px] font-black uppercase ${connectMode ? 'border-violet-500 bg-violet-950/30 text-violet-300' : 'border-slate-700 text-slate-200 hover:bg-slate-800'} disabled:opacity-40`}
                                    >
                                        {connectMode
                                            ? (language === 'es' ? 'Salir de modo conectar' : 'Exit link mode')
                                            : (language === 'es' ? 'Modo conectar desde el mapa' : 'Map link mode')}
                                    </button>
                                )}
                                {connectMode && (
                                    <div className="text-xs text-violet-300">
                                        {language === 'es'
                                            ? 'Ahora pulsa otra mision en el mapa para conectarla o quitar la conexion.'
                                            : 'Now click another mission on the map to link or unlink it.'}
                                    </div>
                                )}
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
