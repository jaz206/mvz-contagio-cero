import React, { useEffect, useState } from 'react';
import { IntroConfig, IntroSlide, StaffAccount, StaffPermissions } from '../types';
import {
    createEditorAccount,
    listStaffAccounts,
    updateStaffPermissions,
    updateStaffStatus
} from '../services/staffService';

interface AdminStaffPanelProps {
    isOpen: boolean;
    onClose: () => void;
    currentAdminUid?: string;
    introConfig: IntroConfig;
    onSaveIntroConfig: (config: IntroConfig) => Promise<void>;
}

const clonePermissions = (permissions: StaffPermissions): StaffPermissions => ({
    missions: { ...permissions.missions },
    characters: { ...permissions.characters }
});

const cloneIntroConfig = (config: IntroConfig): IntroConfig => ({
    alive: config.alive.map((slide) => ({ ...slide })),
    zombie: config.zombie.map((slide) => ({ ...slide }))
});

const createEmptySlide = (alignment: 'alive' | 'zombie', index: number): IntroSlide => ({
    id: `${alignment}_${Date.now()}_${index}`,
    textEs: '',
    textEn: '',
    image: ''
});

export const AdminStaffPanel: React.FC<AdminStaffPanelProps> = ({
    isOpen,
    onClose,
    currentAdminUid,
    introConfig,
    onSaveIntroConfig
}) => {
    const [activeTab, setActiveTab] = useState<'staff' | 'intro'>('staff');
    const [introMode, setIntroMode] = useState<'alive' | 'zombie'>('alive');

    const [accounts, setAccounts] = useState<StaffAccount[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [creating, setCreating] = useState(false);

    const [introDraft, setIntroDraft] = useState<IntroConfig>(cloneIntroConfig(introConfig));
    const [savingIntro, setSavingIntro] = useState(false);

    const loadAccounts = async () => {
        setLoading(true);
        setError(null);

        try {
            const loaded = await listStaffAccounts();
            setAccounts(loaded);
        } catch (err) {
            console.error(err);
            setError('No se pudieron cargar las cuentas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        setIntroDraft(cloneIntroConfig(introConfig));
        loadAccounts();
    }, [isOpen, introConfig]);

    if (!isOpen) return null;

    const handleCreateEditor = async (event: React.FormEvent) => {
        event.preventDefault();
        setCreating(true);
        setError(null);

        try {
            await createEditorAccount({
                displayName,
                email,
                password
            });
            setDisplayName('');
            setEmail('');
            setPassword('');
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

    const activeSlides = introDraft[introMode];

    return (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
            <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden border border-cyan-700 bg-slate-950 shadow-2xl">
                <div className="flex items-center justify-between border-b border-cyan-900 p-4">
                    <div>
                        <div className="text-xs font-black uppercase tracking-[0.3em] text-cyan-600">Panel Admin</div>
                        <h2 className="text-lg font-black uppercase tracking-widest text-white">Control de Editores e Intro</h2>
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
                        onClick={() => setActiveTab('intro')}
                        className={`px-4 py-2 text-xs font-black uppercase ${activeTab === 'intro' ? 'border border-cyan-700 bg-cyan-900/20 text-cyan-300' : 'border border-slate-800 text-gray-400 hover:text-white'}`}
                    >
                        Intro MH0
                    </button>
                </div>

                {activeTab === 'staff' ? (
                    <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 xl:grid-cols-[320px_1fr]">
                        <div className="overflow-y-auto border-r border-slate-800 p-4">
                            <div className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">Nuevo Editor</div>
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
                                    placeholder="Contrasena temporal"
                                    className="w-full border border-slate-800 bg-black p-3 text-sm text-white outline-none focus:border-cyan-500"
                                    minLength={6}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="w-full bg-cyan-700 px-4 py-3 text-xs font-black uppercase text-black hover:bg-cyan-600 disabled:opacity-50"
                                >
                                    {creating ? 'Creando...' : 'Crear Cuenta'}
                                </button>
                            </form>

                            <div className="mt-6 border-t border-slate-800 pt-4 text-[11px] leading-relaxed text-gray-400">
                                <div>Las cuentas nuevas nacen con permisos de misiones.</div>
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
                                                        {account.role === 'admin' ? 'Admin' : 'Editor'}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
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
                                    Hunger Zombie
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
                                                    {introMode === 'alive' ? 'MH0 Protocol' : 'Hunger Log'}
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
