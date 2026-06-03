import React, { useEffect, useMemo, useState } from 'react';
import { HeroTemplate, IntroConfig, IntroSlide, LoginAccessMode, Mission, StaffAccount, StaffPermissions, StoryConfig, StorySlide, ZoneControlConfig, ZoneControlKey } from '../types';
import {
    createEditorAccount,
    listStaffAccounts,
    updateStaffRole,
    updateStaffPermissions,
    updateStaffStatus
} from '../services/staffService';
import { getLoginAccessConfig, saveLoginAccessMode } from '../services/accessControlService';
import { deleteHeroInDB, getHeroTemplates, syncHeroRepositoryToDB, updateHeroTemplate } from '../services/heroService';
import { preferGithubCharacterImage } from '../services/characterGithubImageService';
import { isStoryLockedAlias } from '../services/storyLockService';
import { getDefaultZoneControlConfig } from '../services/zoneControlService';
import { CharacterEditor } from './CharacterEditor';

interface AdminStaffPanelProps {
    isOpen: boolean;
    onClose: () => void;
    currentAdminUid?: string;
    introConfig: IntroConfig;
    onSaveIntroConfig: (config: IntroConfig) => Promise<void>;
    storyConfig: StoryConfig;
    onSaveStoryConfig: (config: StoryConfig) => Promise<void>;
    missions: Mission[];
    zoneControlConfig: ZoneControlConfig | null;
    onSaveZoneControlConfig: (config: ZoneControlConfig) => Promise<void>;
    omegaCylinders: number;
    onSetOmegaCylinders: (value: number) => void;
}

const MAX_OMEGA_CYLINDERS = 15;

const clonePermissions = (permissions: StaffPermissions): StaffPermissions => ({
    missions: { ...permissions.missions },
    characters: { ...permissions.characters }
});

const cloneIntroConfig = (config: IntroConfig): IntroConfig => ({
    alive: config.alive.map((slide) => ({ ...slide })),
    zombie: config.zombie.map((slide) => ({ ...slide }))
});

const cloneStoryConfig = (config: StoryConfig): StoryConfig => ({
    slides: config.slides.map((slide) => ({ ...slide }))
});

const createEmptySlide = (alignment: 'alive' | 'zombie', index: number): IntroSlide => ({
    id: `${alignment}_${Date.now()}_${index}`,
    textEs: '',
    textEn: '',
    image: ''
});

const createEmptyStorySlide = (index: number): StorySlide => ({
    id: `story_${Date.now()}_${index}`,
    textEs: '',
    textEn: '',
    image: ''
});

const ZONE_STATE_SETS: Record<ZoneControlKey, Set<string>> = {
    magneto: new Set(['Washington', 'Oregon', 'California', 'Nevada', 'Idaho', 'Montana', 'Wyoming', 'Utah', 'Arizona', 'Colorado', 'Alaska', 'Hawaii']),
    kingpin: new Set(['Maine', 'New Hampshire', 'Vermont', 'New York', 'Massachusetts', 'Rhode Island', 'Connecticut', 'New Jersey', 'Pennsylvania', 'Delaware', 'Maryland', 'West Virginia', 'Virginia', 'District of Columbia']),
    hulk: new Set(['North Dakota', 'South Dakota', 'Nebraska', 'Kansas', 'Oklahoma', 'Texas', 'New Mexico', 'Minnesota', 'Iowa', 'Missouri', 'Wisconsin', 'Illinois', 'Michigan', 'Indiana', 'Ohio']),
    doom: new Set(['Arkansas', 'Louisiana', 'Mississippi', 'Alabama', 'Tennessee', 'Kentucky', 'Georgia', 'Florida', 'South Carolina', 'North Carolina'])
};

const getMissionZone = (mission: Mission): ZoneControlKey | 'neutral' => {
    const state = mission.location?.state || '';
    if (ZONE_STATE_SETS.magneto.has(state)) return 'magneto';
    if (ZONE_STATE_SETS.kingpin.has(state)) return 'kingpin';
    if (ZONE_STATE_SETS.hulk.has(state)) return 'hulk';
    if (ZONE_STATE_SETS.doom.has(state)) return 'doom';
    return 'neutral';
};

const cloneZoneDraft = (config: ZoneControlConfig): ZoneControlConfig => ({
    zones: {
        magneto: [...config.zones.magneto],
        kingpin: [...config.zones.kingpin],
        hulk: [...config.zones.hulk],
        doom: [...config.zones.doom]
    }
});

export const AdminStaffPanel: React.FC<AdminStaffPanelProps> = ({
    isOpen,
    onClose,
    currentAdminUid,
    introConfig,
    onSaveIntroConfig,
    storyConfig,
    onSaveStoryConfig,
    missions,
    zoneControlConfig,
    onSaveZoneControlConfig,
    omegaCylinders,
    onSetOmegaCylinders
}) => {
    const [activeTab, setActiveTab] = useState<'staff' | 'characters' | 'story' | 'intro' | 'zones'>('staff');
    const [introMode, setIntroMode] = useState<'alive' | 'zombie'>('alive');

    const [accounts, setAccounts] = useState<StaffAccount[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newRole, setNewRole] = useState<'admin' | 'editor' | 'tester'>('editor');
    const [creating, setCreating] = useState(false);
    const [loginAccessMode, setLoginAccessMode] = useState<LoginAccessMode>('DEVELOPMENT');
    const [savingAccessMode, setSavingAccessMode] = useState(false);

    const [introDraft, setIntroDraft] = useState<IntroConfig>(cloneIntroConfig(introConfig));
    const [savingIntro, setSavingIntro] = useState(false);
    const [storyDraft, setStoryDraft] = useState<StoryConfig>(cloneStoryConfig(storyConfig));
    const [savingStory, setSavingStory] = useState(false);
    const [heroes, setHeroes] = useState<HeroTemplate[]>([]);
    const [loadingHeroes, setLoadingHeroes] = useState(false);
    const [syncingHeroes, setSyncingHeroes] = useState(false);
    const [heroSearch, setHeroSearch] = useState('');
    const [editingHero, setEditingHero] = useState<HeroTemplate | null>(null);
    const [creatingHero, setCreatingHero] = useState(false);
    const [zoneDraft, setZoneDraft] = useState<ZoneControlConfig>(cloneZoneDraft(zoneControlConfig || getDefaultZoneControlConfig(missions)));
    const [savingZones, setSavingZones] = useState(false);

    const loadAccounts = async () => {
        setLoading(true);
        setError(null);

        try {
            const loaded = await listStaffAccounts();
            setAccounts(loaded);
            const accessConfig = await getLoginAccessConfig();
            setLoginAccessMode(accessConfig.mode);
        } catch (err) {
            console.error(err);
            setError('No se pudieron cargar las cuentas.');
        } finally {
            setLoading(false);
        }
    };

    const loadHeroes = async () => {
        setLoadingHeroes(true);
        setError(null);

        try {
            const loadedHeroes = await getHeroTemplates();
            setHeroes(loadedHeroes);
        } catch (err) {
            console.error(err);
            setError('No se pudieron cargar los personajes.');
        } finally {
            setLoadingHeroes(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        setActiveTab('staff');
        setEditingHero(null);
        setCreatingHero(false);
        setIntroDraft(cloneIntroConfig(introConfig));
        setStoryDraft(cloneStoryConfig(storyConfig));
        setZoneDraft(cloneZoneDraft(zoneControlConfig || getDefaultZoneControlConfig(missions)));
        loadAccounts();
    }, [isOpen, introConfig, storyConfig, zoneControlConfig, missions]);

    useEffect(() => {
        if (!isOpen || activeTab !== 'characters' || heroes.length > 0) return;
        loadHeroes();
    }, [activeTab, heroes.length, isOpen]);

    const handleCreateEditor = async (event: React.FormEvent) => {
        event.preventDefault();
        setCreating(true);
        setError(null);

        try {
            await createEditorAccount({
                displayName,
                email,
                password,
                role: newRole
            });
            setDisplayName('');
            setEmail('');
            setPassword('');
            setNewRole('editor');
            await loadAccounts();
        } catch (err: any) {
            console.error(err);
            setError(err?.message || 'No se pudo crear la cuenta.');
        } finally {
            setCreating(false);
        }
    };

    const handleToggleStatus = async (account: StaffAccount) => {
        try {
            await updateStaffStatus(account.uid, !account.isActive);
            setAccounts((prev) => prev.map((item) => (
                item.uid === account.uid ? { ...item, isActive: !item.isActive } : item
            )));
        } catch (err) {
            console.error(err);
            setError('No se pudo cambiar el estado de la cuenta.');
        }
    };

    const handleRoleChange = async (account: StaffAccount, role: 'admin' | 'editor' | 'tester') => {
        try {
            await updateStaffRole(account.uid, role);
            setAccounts((prev) => prev.map((item) => (
                item.uid === account.uid ? { ...item, role } : item
            )));
        } catch (err) {
            console.error(err);
            setError('No se pudo cambiar el rol.');
        }
    };

    const handlePermissionChange = async (
        account: StaffAccount,
        block: keyof StaffPermissions,
        action: 'view' | 'create' | 'edit' | 'delete',
        checked: boolean
    ) => {
        const nextPermissions = clonePermissions(account.permissions);
        nextPermissions[block][action] = checked;

        try {
            await updateStaffPermissions(account.uid, nextPermissions);
            setAccounts((prev) => prev.map((item) => (
                item.uid === account.uid ? { ...item, permissions: nextPermissions } : item
            )));
        } catch (err) {
            console.error(err);
            setError('No se pudo guardar el permiso.');
        }
    };

    const renderPermissionRow = (account: StaffAccount, block: keyof StaffPermissions, label: string) => {
        const blockPermissions = account.permissions[block];

        return (
            <div className="border border-slate-800 bg-slate-950/50 p-3">
                <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-cyan-400">{label}</div>
                <div className="grid grid-cols-2 gap-2 text-[10px] md:grid-cols-4">
                    {(['view', 'create', 'edit', 'delete'] as const).map((action) => (
                        <label key={action} className="flex items-center gap-2 border border-slate-800 px-2 py-2 uppercase text-gray-300">
                            <input
                                type="checkbox"
                                checked={blockPermissions[action]}
                                disabled={account.role === 'admin'}
                                onChange={(event) => handlePermissionChange(account, block, action, event.target.checked)}
                            />
                            <span>{action}</span>
                        </label>
                    ))}
                </div>
            </div>
        );
    };

    const updateSlide = (alignment: 'alive' | 'zombie', slideIndex: number, field: keyof IntroSlide, value: string) => {
        setIntroDraft((prev) => {
            const next = cloneIntroConfig(prev);
            next[alignment][slideIndex] = {
                ...next[alignment][slideIndex],
                [field]: value
            };
            return next;
        });
    };

    const moveSlide = (alignment: 'alive' | 'zombie', slideIndex: number, direction: -1 | 1) => {
        setIntroDraft((prev) => {
            const next = cloneIntroConfig(prev);
            const nextIndex = slideIndex + direction;
            if (nextIndex < 0 || nextIndex >= next[alignment].length) return prev;

            const slides = [...next[alignment]];
            const [slide] = slides.splice(slideIndex, 1);
            slides.splice(nextIndex, 0, slide);
            next[alignment] = slides;
            return next;
        });
    };

    const removeSlide = (alignment: 'alive' | 'zombie', slideIndex: number) => {
        setIntroDraft((prev) => {
            const next = cloneIntroConfig(prev);
            next[alignment] = next[alignment].filter((_, index) => index !== slideIndex);
            return next;
        });
    };

    const addSlide = (alignment: 'alive' | 'zombie') => {
        setIntroDraft((prev) => {
            const next = cloneIntroConfig(prev);
            next[alignment] = [...next[alignment], createEmptySlide(alignment, next[alignment].length + 1)];
            return next;
        });
    };

    const handleSaveIntro = async () => {
        setSavingIntro(true);
        setError(null);

        try {
            await onSaveIntroConfig(introDraft);
        } catch (err) {
            console.error(err);
            setError('No se pudo guardar la intro.');
        } finally {
            setSavingIntro(false);
        }
    };

    const updateStorySlide = (slideIndex: number, field: keyof StorySlide, value: string) => {
        setStoryDraft((prev) => {
            const next = cloneStoryConfig(prev);
            next.slides[slideIndex] = {
                ...next.slides[slideIndex],
                [field]: value
            };
            return next;
        });
    };

    const moveStorySlide = (slideIndex: number, direction: -1 | 1) => {
        setStoryDraft((prev) => {
            const next = cloneStoryConfig(prev);
            const nextIndex = slideIndex + direction;
            if (nextIndex < 0 || nextIndex >= next.slides.length) return prev;

            const slides = [...next.slides];
            const [slide] = slides.splice(slideIndex, 1);
            slides.splice(nextIndex, 0, slide);
            next.slides = slides;
            return next;
        });
    };

    const removeStorySlide = (slideIndex: number) => {
        setStoryDraft((prev) => {
            const next = cloneStoryConfig(prev);
            next.slides = next.slides.filter((_, index) => index !== slideIndex);
            return next;
        });
    };

    const addStorySlide = () => {
        setStoryDraft((prev) => {
            const next = cloneStoryConfig(prev);
            next.slides = [...next.slides, createEmptyStorySlide(next.slides.length + 1)];
            return next;
        });
    };

    const handleSaveStory = async () => {
        setSavingStory(true);
        setError(null);

        try {
            await onSaveStoryConfig(storyDraft);
        } catch (err) {
            console.error(err);
            setError('No se pudo guardar la historia inicial.');
        } finally {
            setSavingStory(false);
        }
    };

    const handleToggleZoneMission = (zone: ZoneControlKey, missionId: string) => {
        setZoneDraft((prev) => {
            const next = cloneZoneDraft(prev);
            const current = next.zones[zone];
            next.zones[zone] = current.includes(missionId)
                ? current.filter((item) => item !== missionId)
                : [...current, missionId];
            return next;
        });
    };

    const handleResetZoneDraft = () => {
        setZoneDraft(cloneZoneDraft(getDefaultZoneControlConfig(missions)));
    };

    const handleSaveZoneControl = async () => {
        setSavingZones(true);
        setError(null);

        try {
            await onSaveZoneControlConfig(zoneDraft);
        } catch (err) {
            console.error(err);
            setError('No se pudo guardar el control de zonas.');
        } finally {
            setSavingZones(false);
        }
    };

    const handleAccessModeChange = async (mode: LoginAccessMode) => {
        setSavingAccessMode(true);
        setError(null);

        try {
            await saveLoginAccessMode(mode);
            setLoginAccessMode(mode);
        } catch (err) {
            console.error(err);
            setError('No se pudo guardar el modo de acceso.');
        } finally {
            setSavingAccessMode(false);
        }
    };

    const handleDeleteHero = async (heroId: string) => {
        const confirmed = window.confirm('Vas a borrar este personaje. Esta accion no se puede deshacer.');
        if (!confirmed) return;

        try {
            await deleteHeroInDB(heroId);
            await loadHeroes();
        } catch (err) {
            console.error(err);
            setError('No se pudo borrar el personaje.');
        }
    };

    const handleToggleHeroPlayable = async (hero: HeroTemplate) => {
        if (isStoryLockedAlias(hero.alias)) {
            alert('Este personaje queda bloqueado por la historia y no se puede cambiar desde aqui.');
            return;
        }

        try {
            await updateHeroTemplate(hero.id, { isSelectable: hero.isSelectable === false });
            await loadHeroes();
        } catch (err) {
            console.error(err);
            setError('No se pudo cambiar el estado del personaje.');
        }
    };

    const handleSyncHeroes = async () => {
        const confirmed = window.confirm('Voy a guardar toda la ficha de cada heroe en Firebase. ¿Continuar?');
        if (!confirmed) return;

        setSyncingHeroes(true);
        setError(null);

        try {
            const total = await syncHeroRepositoryToDB();
            await loadHeroes();
            alert(`Heroes actualizados en Firebase: ${total}`);
        } catch (err) {
            console.error(err);
            setError('No se pudieron guardar los heroes en Firebase.');
        } finally {
            setSyncingHeroes(false);
        }
    };

    const activeSlides = introDraft[introMode];
    const filteredHeroes = useMemo(() => {
        const query = heroSearch.trim().toLowerCase();
        if (!query) return heroes;
        return heroes.filter((hero) => (
            `${hero.alias} ${hero.defaultName}`.toLowerCase().includes(query)
        ));
    }, [heroSearch, heroes]);

    const zoneMissionGroups = useMemo(() => {
        const groups: Record<ZoneControlKey, Mission[]> = {
            magneto: [],
            kingpin: [],
            hulk: [],
            doom: []
        };

        missions.forEach((mission) => {
            if (!mission?.id) return;
            if (mission.type === 'GALACTUS') return;
            const zone = getMissionZone(mission);
            if (zone !== 'neutral') {
                groups[zone].push(mission);
            }
        });

        (Object.keys(groups) as ZoneControlKey[]).forEach((zone) => {
            groups[zone].sort((a, b) => {
                const roleA = a.missionRole || 'PRIMARY';
                const roleB = b.missionRole || 'PRIMARY';
                if (roleA !== roleB) return roleA === 'PRIMARY' ? -1 : 1;
                return a.title.localeCompare(b.title, 'es');
            });
        });

        return groups;
    }, [missions]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
            <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden border border-cyan-700 bg-slate-950 shadow-2xl">
                {editingHero && (
                    <CharacterEditor
                        isOpen={true}
                        onClose={() => setEditingHero(null)}
                        language="es"
                        initialData={editingHero}
                        onSave={async () => {
                            await loadHeroes();
                            setEditingHero(null);
                        }}
                    />
                )}

                {creatingHero && (
                    <CharacterEditor
                        isOpen={true}
                        onClose={() => setCreatingHero(false)}
                        language="es"
                        onSave={async () => {
                            await loadHeroes();
                            setCreatingHero(false);
                        }}
                    />
                )}

                <div className="flex items-center justify-between border-b border-cyan-900 p-4">
                    <div>
                        <div className="text-xs font-black uppercase tracking-[0.3em] text-cyan-600">Panel Admin</div>
                        <h2 className="text-lg font-black uppercase tracking-widest text-white">Control de Editores, Personajes, Historia e Intro</h2>
                    </div>
                    <button onClick={onClose} className="border border-red-900 px-4 py-2 text-xs font-black uppercase text-red-400 hover:bg-red-900/20">
                        Cerrar
                    </button>
                </div>

                <div className="flex items-center gap-2 border-b border-slate-800 p-4">
                    <button
                        onClick={() => setActiveTab('staff')}
                        className={`px-4 py-2 text-xs font-black uppercase ${activeTab === 'staff' ? 'border border-cyan-700 bg-cyan-900/20 text-cyan-300' : 'border border-slate-800 text-gray-400 hover:text-white'}`}
                    >
                        Editores
                    </button>
                    <button
                        onClick={() => setActiveTab('characters')}
                        className={`px-4 py-2 text-xs font-black uppercase ${activeTab === 'characters' ? 'border border-cyan-700 bg-cyan-900/20 text-cyan-300' : 'border border-slate-800 text-gray-400 hover:text-white'}`}
                    >
                        Personajes
                    </button>
                    <button
                        onClick={() => setActiveTab('zones')}
                        className={`px-4 py-2 text-xs font-black uppercase ${activeTab === 'zones' ? 'border border-cyan-700 bg-cyan-900/20 text-cyan-300' : 'border border-slate-800 text-gray-400 hover:text-white'}`}
                    >
                        Zonas
                    </button>
                    <button
                        onClick={() => setActiveTab('story')}
                        className={`px-4 py-2 text-xs font-black uppercase ${activeTab === 'story' ? 'border border-cyan-700 bg-cyan-900/20 text-cyan-300' : 'border border-slate-800 text-gray-400 hover:text-white'}`}
                    >
                        Historia Inicial
                    </button>
                    <button
                        onClick={() => setActiveTab('intro')}
                        className={`px-4 py-2 text-xs font-black uppercase ${activeTab === 'intro' ? 'border border-cyan-700 bg-cyan-900/20 text-cyan-300' : 'border border-slate-800 text-gray-400 hover:text-white'}`}
                    >
                        Intro MH0 / MZ0
                    </button>
                </div>

                {activeTab === 'staff' ? (
                    <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 xl:grid-cols-[320px_1fr]">
                        <div className="overflow-y-auto border-r border-slate-800 p-4">
                            <div className="mb-6 border border-slate-800 bg-slate-900/40 p-4">
                                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">Acceso con Cuenta</div>
                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        disabled={savingAccessMode}
                                        onClick={() => handleAccessModeChange('PUBLIC')}
                                        className={`border px-4 py-3 text-xs font-black uppercase ${loginAccessMode === 'PUBLIC' ? 'border-emerald-600 bg-emerald-950/30 text-emerald-300' : 'border-slate-700 text-slate-200 hover:bg-slate-800'} disabled:opacity-50`}
                                    >
                                        Publico
                                    </button>
                                    <button
                                        disabled={savingAccessMode}
                                        onClick={() => handleAccessModeChange('DEVELOPMENT')}
                                        className={`border px-4 py-3 text-xs font-black uppercase ${loginAccessMode === 'DEVELOPMENT' ? 'border-yellow-600 bg-yellow-950/30 text-yellow-300' : 'border-slate-700 text-slate-200 hover:bg-slate-800'} disabled:opacity-50`}
                                    >
                                        Desarrollo
                                    </button>
                                </div>
                                <div className="mt-3 text-[11px] leading-relaxed text-gray-400">
                                    {loginAccessMode === 'PUBLIC'
                                        ? 'Ahora puede entrar cualquiera con cuenta.'
                                        : 'Ahora solo pueden entrar las cuentas activas que tu hayas marcado. La via local sigue funcionando.'}
                                </div>
                            </div>

                            <div className="mb-6 border border-slate-800 bg-slate-900/40 p-4">
                                <div className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">Viales Omega</div>
                                <div className="mb-3 flex items-center justify-between border border-cyan-900/40 bg-black/40 px-3 py-3">
                                    <div className="text-[11px] uppercase tracking-widest text-gray-400">Cantidad actual</div>
                                    <div className="text-2xl font-black text-cyan-300">{omegaCylinders}/{MAX_OMEGA_CYLINDERS}</div>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={MAX_OMEGA_CYLINDERS}
                                    step={1}
                                    value={omegaCylinders}
                                    onChange={(event) => onSetOmegaCylinders(Number(event.target.value))}
                                    className="w-full accent-cyan-500"
                                />
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onSetOmegaCylinders(Math.max(0, omegaCylinders - 1))}
                                        className="border border-slate-700 px-3 py-2 text-xs font-black uppercase text-slate-200 hover:bg-slate-800"
                                    >
                                        -1
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onSetOmegaCylinders(0)}
                                        className="border border-amber-800 bg-amber-950/20 px-3 py-2 text-xs font-black uppercase text-amber-300 hover:bg-amber-900/30"
                                    >
                                        Poner a 0
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onSetOmegaCylinders(Math.min(MAX_OMEGA_CYLINDERS, omegaCylinders + 1))}
                                        className="border border-cyan-700 bg-cyan-900/20 px-3 py-2 text-xs font-black uppercase text-cyan-300 hover:bg-cyan-900/40"
                                    >
                                        +1
                                    </button>
                                </div>
                                <div className="mt-3 text-[11px] leading-relaxed text-gray-400">
                                    Aqui decides cuantas dosis hay disponibles en la partida actual, de 0 a {MAX_OMEGA_CYLINDERS}.
                                </div>
                            </div>

                            <div className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">Nueva Cuenta</div>
                            <form onSubmit={handleCreateEditor} className="space-y-3">
                                <input
                                    value={displayName}
                                    onChange={(event) => setDisplayName(event.target.value)}
                                    placeholder="Nombre visible"
                                    className="w-full border border-slate-800 bg-black p-3 text-sm text-white outline-none focus:border-cyan-500"
                                    required
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="email@dominio.com"
                                    className="w-full border border-slate-800 bg-black p-3 text-sm text-white outline-none focus:border-cyan-500"
                                    required
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Contrasena temporal opcional"
                                    className="w-full border border-slate-800 bg-black p-3 text-sm text-white outline-none focus:border-cyan-500"
                                    minLength={6}
                                />
                                <select
                                    value={newRole}
                                    onChange={(event) => setNewRole(event.target.value as 'admin' | 'editor' | 'tester')}
                                    className="w-full border border-slate-800 bg-black p-3 text-sm text-white outline-none focus:border-cyan-500"
                                >
                                    <option value="tester">Tester</option>
                                    <option value="editor">Editor</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="w-full bg-cyan-700 px-4 py-3 text-xs font-black uppercase text-black hover:bg-cyan-600 disabled:opacity-50"
                                >
                                    {creating ? 'Creando...' : 'Crear Cuenta'}
                                </button>
                            </form>

                            <div className="mt-6 border-t border-slate-800 pt-4 text-[11px] leading-relaxed text-gray-400">
                                <div>Las cuentas nuevas pueden nacer como editor, tester o admin.</div>
                                <div>El borrado sigue siendo solo para admin hasta que tu lo abras.</div>
                            </div>

                            {error && (
                                <div className="mt-4 border border-red-900 bg-red-950/30 p-3 text-xs text-red-300">
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="overflow-y-auto p-4">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">Cuentas y Permisos</div>
                                <button onClick={loadAccounts} className="border border-cyan-900 px-3 py-2 text-xs font-black uppercase text-cyan-300 hover:bg-cyan-900/20">
                                    Recargar
                                </button>
                            </div>

                            {loading ? (
                                <div className="text-sm text-cyan-400">Cargando cuentas...</div>
                            ) : (
                                <div className="space-y-4">
                                    {accounts.map((account) => (
                                        <div key={account.uid} className="space-y-4 border border-slate-800 bg-slate-900/40 p-4">
                                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                <div>
                                                    <div className="font-black uppercase tracking-wide text-white">{account.displayName}</div>
                                                    <div className="text-sm text-gray-400">{account.email}</div>
                                                    <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-cyan-600">
                                                        {account.role === 'admin' ? 'Admin' : account.role === 'tester' ? 'Tester' : 'Editor'}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {account.role !== 'admin' && (
                                                        <select
                                                            value={account.role}
                                                            onChange={(event) => handleRoleChange(account, event.target.value as 'admin' | 'editor' | 'tester')}
                                                            className="border border-slate-700 bg-black px-2 py-2 text-[10px] font-black uppercase text-cyan-300"
                                                        >
                                                            <option value="tester">Tester</option>
                                                            <option value="editor">Editor</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    )}
                                                    <span className={`border px-3 py-1 text-[10px] font-black uppercase ${account.isActive ? 'border-emerald-700 text-emerald-300' : 'border-yellow-700 text-yellow-300'}`}>
                                                        {account.isActive ? 'Activo' : 'Pausado'}
                                                    </span>
                                                    {account.role !== 'admin' && (
                                                        <button
                                                            onClick={() => handleToggleStatus(account)}
                                                            className="border border-slate-700 px-3 py-2 text-xs font-black uppercase text-slate-200 hover:bg-slate-800"
                                                        >
                                                            {account.isActive ? 'Desactivar' : 'Activar'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {renderPermissionRow(account, 'missions', 'Bloque Misiones')}
                                            {renderPermissionRow(account, 'characters', 'Bloque Personajes')}

                                            {account.uid === currentAdminUid && (
                                                <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-500">
                                                    Tu cuenta admin siempre mantiene control total.
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : activeTab === 'characters' ? (
                    <div className="flex min-h-0 flex-1 flex-col">
                        <div className="flex items-center justify-between border-b border-slate-800 p-4">
                            <div className="text-[11px] text-gray-400">
                                Aqui puedes editar el nombre, la imagen, la ficha y el texto que sale en el bunker.
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    value={heroSearch}
                                    onChange={(event) => setHeroSearch(event.target.value)}
                                    placeholder="Buscar personaje..."
                                    className="w-64 border border-slate-800 bg-black p-3 text-sm text-white outline-none focus:border-cyan-500"
                                />
                                <button
                                    onClick={() => setCreatingHero(true)}
                                    className="border border-cyan-800 bg-cyan-900/20 px-3 py-2 text-xs font-black uppercase text-cyan-300 hover:bg-cyan-900/40"
                                >
                                    Nuevo Personaje
                                </button>
                                <button
                                    onClick={handleSyncHeroes}
                                    disabled={syncingHeroes}
                                    className="border border-emerald-800 bg-emerald-900/20 px-3 py-2 text-xs font-black uppercase text-emerald-300 hover:bg-emerald-900/40 disabled:opacity-50"
                                >
                                    {syncingHeroes ? 'Guardando...' : 'Guardar en Firebase'}
                                </button>
                                <button
                                    onClick={loadHeroes}
                                    className="border border-slate-700 px-3 py-2 text-xs font-black uppercase text-slate-200 hover:bg-slate-800"
                                >
                                    Recargar
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto p-4">
                            {loadingHeroes ? (
                                <div className="text-sm text-cyan-400">Cargando personajes...</div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {filteredHeroes.map((hero) => (
                                        <div key={hero.id} className="group flex gap-3 border border-slate-800 bg-slate-900/40 p-3">
                                            <div className="h-20 w-20 shrink-0 overflow-hidden border border-slate-700 bg-black">
                                                <img src={preferGithubCharacterImage(hero.alias, hero.defaultAlignment, hero.imageUrl)} alt={hero.alias} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-sm font-black uppercase tracking-wide text-white">{hero.alias}</div>
                                                <div className="truncate text-xs text-gray-400">{hero.defaultName}</div>
                                                <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase">
                                                    <span className="border border-cyan-900 px-2 py-1 text-cyan-300">{hero.defaultAlignment}</span>
                                                    <span className="border border-slate-700 px-2 py-1 text-slate-300">{hero.defaultClass}</span>
                                                </div>
                                                <div className="mt-2 line-clamp-2 text-[11px] text-gray-500">
                                                    {typeof hero.bio === 'string' ? hero.bio : (hero.bio?.es || '')}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleToggleHeroPlayable(hero)}
                                                    className={`border px-3 py-2 text-xs font-black uppercase ${hero.isSelectable === false
                                                        ? 'border-emerald-800 bg-emerald-900/20 text-emerald-300 hover:bg-emerald-900/40'
                                                        : 'border-amber-800 bg-amber-900/20 text-amber-300 hover:bg-amber-900/40'}`}
                                                >
                                                    {isStoryLockedAlias(hero.alias)
                                                        ? 'Bloqueo fijo'
                                                        : hero.isSelectable === false ? 'Bloqueado' : 'Jugable'}
                                                </button>
                                                <button
                                                    onClick={() => setEditingHero(hero)}
                                                    className="border border-blue-800 bg-blue-900/20 px-3 py-2 text-xs font-black uppercase text-blue-300 hover:bg-blue-900/40"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteHero(hero.id)}
                                                    className="border border-red-900 px-3 py-2 text-xs font-black uppercase text-red-300 hover:bg-red-900/20"
                                                >
                                                    Borrar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {error && (
                                <div className="mt-4 border border-red-900 bg-red-950/30 p-3 text-xs text-red-300">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                ) : activeTab === 'zones' ? (
                    <div className="flex min-h-0 flex-1 flex-col">
                        <div className="flex items-center justify-between border-b border-slate-800 p-4">
                            <div className="text-[11px] text-gray-400">
                                Elige qué misiones deben quedar hechas para que cada zona cambie de color.
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleResetZoneDraft}
                                    className="border border-slate-700 px-3 py-2 text-xs font-black uppercase text-slate-200 hover:bg-slate-800"
                                >
                                    Volver a base
                                </button>
                                <button
                                    onClick={handleSaveZoneControl}
                                    disabled={savingZones}
                                    className="border border-emerald-800 bg-emerald-900/20 px-3 py-2 text-xs font-black uppercase text-emerald-300 hover:bg-emerald-900/40 disabled:opacity-50"
                                >
                                    {savingZones ? 'Guardando...' : 'Guardar Zonas'}
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto p-4 space-y-4">
                            {(Object.keys(zoneMissionGroups) as ZoneControlKey[]).map((zone) => {
                                const selectedIds = zoneDraft.zones[zone] || [];
                                const zoneLabel = zone.toUpperCase();
                                const missionsForZone = zoneMissionGroups[zone];

                                return (
                                    <div key={zone} className="border border-slate-800 bg-slate-900/40 p-4">
                                        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <div className="text-sm font-black uppercase tracking-widest text-white">{zoneLabel}</div>
                                                <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-600">
                                                    {selectedIds.length} misiones marcadas
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setZoneDraft((prev) => ({
                                                        zones: {
                                                            ...prev.zones,
                                                            [zone]: missionsForZone.map((mission) => mission.id)
                                                        }
                                                    }))}
                                                    className="border border-cyan-800 bg-cyan-900/20 px-3 py-2 text-xs font-black uppercase text-cyan-300 hover:bg-cyan-900/40"
                                                >
                                                    Marcar todas
                                                </button>
                                                <button
                                                    onClick={() => setZoneDraft((prev) => ({
                                                        zones: {
                                                            ...prev.zones,
                                                            [zone]: []
                                                        }
                                                    }))}
                                                    className="border border-red-900 px-3 py-2 text-xs font-black uppercase text-red-300 hover:bg-red-900/20"
                                                >
                                                    Limpiar
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                                            {missionsForZone.length === 0 ? (
                                                <div className="border border-slate-800 bg-black/30 p-3 text-xs text-gray-500">
                                                    No hay misiones en esta zona.
                                                </div>
                                            ) : missionsForZone.map((mission) => {
                                                const checked = selectedIds.includes(mission.id);
                                                return (
                                                    <button
                                                        key={mission.id}
                                                        type="button"
                                                        onClick={() => handleToggleZoneMission(zone, mission.id)}
                                                        className={`text-left border p-3 transition-colors ${checked
                                                            ? 'border-cyan-500 bg-cyan-950/30 text-cyan-200'
                                                            : 'border-slate-800 bg-black/25 text-slate-300 hover:bg-slate-800/70'}`}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <div className="text-sm font-black uppercase tracking-wide text-white">{mission.title}</div>
                                                                <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-600">
                                                                    {mission.location.state}
                                                                </div>
                                                            </div>
                                                            <div className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                                                                {(mission.missionRole || 'PRIMARY') === 'OPTIONAL' ? 'Opcional' : 'Principal'}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            {error && (
                                <div className="mt-4 border border-red-900 bg-red-950/30 p-3 text-xs text-red-300">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                ) : activeTab === 'story' ? (
                    <div className="flex min-h-0 flex-1 flex-col">
                        <div className="flex items-center justify-between border-b border-slate-800 p-4">
                            <div className="text-[11px] text-gray-400">
                                Esta es la historia principal que sale antes de elegir bando.
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={addStorySlide}
                                    className="border border-cyan-800 bg-cyan-900/20 px-3 py-2 text-xs font-black uppercase text-cyan-300 hover:bg-cyan-900/40"
                                >
                                    Anadir Slide
                                </button>
                                <button
                                    onClick={handleSaveStory}
                                    disabled={savingStory}
                                    className="border border-emerald-800 bg-emerald-900/20 px-3 py-2 text-xs font-black uppercase text-emerald-300 hover:bg-emerald-900/40 disabled:opacity-50"
                                >
                                    {savingStory ? 'Guardando...' : 'Guardar Historia'}
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto p-4">
                            <div className="space-y-4">
                                {storyDraft.slides.map((slide, index) => (
                                    <div key={slide.id} className="space-y-4 border border-slate-800 bg-slate-900/40 p-4">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <div className="text-sm font-black uppercase tracking-widest text-white">
                                                    Slide {index + 1}
                                                </div>
                                                <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-600">
                                                    Historia de apertura
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => moveStorySlide(index, -1)} className="border border-slate-700 px-3 py-2 text-xs font-black uppercase text-slate-200 hover:bg-slate-800">
                                                    Subir
                                                </button>
                                                <button onClick={() => moveStorySlide(index, 1)} className="border border-slate-700 px-3 py-2 text-xs font-black uppercase text-slate-200 hover:bg-slate-800">
                                                    Bajar
                                                </button>
                                                <button onClick={() => removeStorySlide(index)} className="border border-red-900 px-3 py-2 text-xs font-black uppercase text-red-300 hover:bg-red-900/20">
                                                    Borrar
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_260px]">
                                            <div className="space-y-2">
                                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">Texto ES</div>
                                                <textarea
                                                    value={slide.textEs}
                                                    onChange={(event) => updateStorySlide(index, 'textEs', event.target.value)}
                                                    rows={8}
                                                    className="w-full border border-slate-800 bg-black p-3 text-sm text-white outline-none focus:border-cyan-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">Texto EN</div>
                                                <textarea
                                                    value={slide.textEn}
                                                    onChange={(event) => updateStorySlide(index, 'textEn', event.target.value)}
                                                    rows={8}
                                                    className="w-full border border-slate-800 bg-black p-3 text-sm text-white outline-none focus:border-cyan-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">Imagen</div>
                                                <input
                                                    value={slide.image}
                                                    onChange={(event) => updateStorySlide(index, 'image', event.target.value)}
                                                    placeholder="https://..."
                                                    className="w-full border border-slate-800 bg-black p-3 text-sm text-white outline-none focus:border-cyan-500"
                                                />
                                                <div className="h-48 overflow-hidden border border-slate-800 bg-black">
                                                    {slide.image ? (
                                                        <img
                                                            src={slide.image}
                                                            alt={`Preview historia ${index + 1}`}
                                                            className="h-full w-full object-cover"
                                                            referrerPolicy="no-referrer"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-gray-500">
                                                            Sin imagen
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {error && (
                                <div className="mt-4 border border-red-900 bg-red-950/30 p-3 text-xs text-red-300">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex min-h-0 flex-1 flex-col">
                        <div className="flex items-center justify-between border-b border-slate-800 p-4">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIntroMode('alive')}
                                    className={`px-4 py-2 text-xs font-black uppercase ${introMode === 'alive' ? 'border border-cyan-700 bg-cyan-900/20 text-cyan-300' : 'border border-slate-800 text-gray-400 hover:text-white'}`}
                                >
                                    MH0 Superviviente
                                </button>
                                <button
                                    onClick={() => setIntroMode('zombie')}
                                    className={`px-4 py-2 text-xs font-black uppercase ${introMode === 'zombie' ? 'border border-lime-700 bg-lime-900/20 text-lime-300' : 'border border-slate-800 text-gray-400 hover:text-white'}`}
                                >
                                    MZ0 Zombie
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => addSlide(introMode)}
                                    className="border border-cyan-800 bg-cyan-900/20 px-3 py-2 text-xs font-black uppercase text-cyan-300 hover:bg-cyan-900/40"
                                >
                                    Anadir Slide
                                </button>
                                <button
                                    onClick={handleSaveIntro}
                                    disabled={savingIntro}
                                    className="border border-emerald-800 bg-emerald-900/20 px-3 py-2 text-xs font-black uppercase text-emerald-300 hover:bg-emerald-900/40 disabled:opacity-50"
                                >
                                    {savingIntro ? 'Guardando...' : 'Guardar Intro'}
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto p-4">
                            <div className="mb-4 text-[11px] text-gray-400">
                                Edita cada slide con su texto en espanol, su texto en ingles y la imagen que quieres mostrar.
                            </div>

                            <div className="space-y-4">
                                {activeSlides.map((slide, index) => (
                                    <div key={slide.id} className="space-y-4 border border-slate-800 bg-slate-900/40 p-4">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <div className="text-sm font-black uppercase tracking-widest text-white">
                                                    Slide {index + 1}
                                                </div>
                                                <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-600">
                                                    {introMode === 'alive' ? 'MH0 Protocol' : 'MZ0 Protocol'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => moveSlide(introMode, index, -1)} className="border border-slate-700 px-3 py-2 text-xs font-black uppercase text-slate-200 hover:bg-slate-800">
                                                    Subir
                                                </button>
                                                <button onClick={() => moveSlide(introMode, index, 1)} className="border border-slate-700 px-3 py-2 text-xs font-black uppercase text-slate-200 hover:bg-slate-800">
                                                    Bajar
                                                </button>
                                                <button onClick={() => removeSlide(introMode, index)} className="border border-red-900 px-3 py-2 text-xs font-black uppercase text-red-300 hover:bg-red-900/20">
                                                    Borrar
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_260px]">
                                            <div className="space-y-2">
                                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">Texto ES</div>
                                                <textarea
                                                    value={slide.textEs}
                                                    onChange={(event) => updateSlide(introMode, index, 'textEs', event.target.value)}
                                                    rows={8}
                                                    className="w-full border border-slate-800 bg-black p-3 text-sm text-white outline-none focus:border-cyan-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">Texto EN</div>
                                                <textarea
                                                    value={slide.textEn}
                                                    onChange={(event) => updateSlide(introMode, index, 'textEn', event.target.value)}
                                                    rows={8}
                                                    className="w-full border border-slate-800 bg-black p-3 text-sm text-white outline-none focus:border-cyan-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">Imagen</div>
                                                <input
                                                    value={slide.image}
                                                    onChange={(event) => updateSlide(introMode, index, 'image', event.target.value)}
                                                    placeholder="https://..."
                                                    className="w-full border border-slate-800 bg-black p-3 text-sm text-white outline-none focus:border-cyan-500"
                                                />
                                                <div className="h-48 overflow-hidden border border-slate-800 bg-black">
                                                    {slide.image ? (
                                                        <img
                                                            src={slide.image}
                                                            alt={`Preview ${index + 1}`}
                                                            className="h-full w-full object-cover"
                                                            referrerPolicy="no-referrer"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-gray-500">
                                                            Sin imagen
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {error && (
                                <div className="mt-4 border border-red-900 bg-red-950/30 p-3 text-xs text-red-300">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
