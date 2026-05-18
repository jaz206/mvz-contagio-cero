import React, { useEffect, useState } from 'react';
import { StaffAccount, StaffPermissions } from '../types';
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
}

const clonePermissions = (permissions: StaffPermissions): StaffPermissions => ({
    missions: { ...permissions.missions },
    characters: { ...permissions.characters }
});

export const AdminStaffPanel: React.FC<AdminStaffPanelProps> = ({ isOpen, onClose, currentAdminUid }) => {
    const [accounts, setAccounts] = useState<StaffAccount[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [creating, setCreating] = useState(false);

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
        loadAccounts();
    }, [isOpen]);

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
                <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">{label}</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                    {(['view', 'create', 'edit', 'delete'] as const).map((action) => (
                        <label key={action} className="flex items-center gap-2 border border-slate-800 px-2 py-2 text-gray-300 uppercase">
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

    return (
        <div className="fixed inset-0 z-[140] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-6xl max-h-[92vh] overflow-hidden border border-cyan-700 bg-slate-950 shadow-2xl flex flex-col">
                <div className="border-b border-cyan-900 p-4 flex items-center justify-between">
                    <div>
                        <div className="text-xs text-cyan-600 font-black uppercase tracking-[0.3em]">Panel Admin</div>
                        <h2 className="text-lg text-white font-black uppercase tracking-widest">Gestion de Editores</h2>
                    </div>
                    <button onClick={onClose} className="border border-red-900 text-red-400 px-4 py-2 text-xs font-black uppercase hover:bg-red-900/20">
                        Cerrar
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-0 flex-1 min-h-0">
                    <div className="border-r border-slate-800 p-4 overflow-y-auto">
                        <div className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.3em] mb-3">Nuevo Editor</div>
                        <form onSubmit={handleCreateEditor} className="space-y-3">
                            <input
                                value={displayName}
                                onChange={(event) => setDisplayName(event.target.value)}
                                placeholder="Nombre visible"
                                className="w-full bg-black border border-slate-800 p-3 text-sm text-white outline-none focus:border-cyan-500"
                                required
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="email@dominio.com"
                                className="w-full bg-black border border-slate-800 p-3 text-sm text-white outline-none focus:border-cyan-500"
                                required
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Contrasena temporal"
                                className="w-full bg-black border border-slate-800 p-3 text-sm text-white outline-none focus:border-cyan-500"
                                minLength={6}
                                required
                            />
                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-black px-4 py-3 text-xs font-black uppercase"
                            >
                                {creating ? 'Creando...' : 'Crear Cuenta'}
                            </button>
                        </form>

                        <div className="mt-6 border-t border-slate-800 pt-4 text-[11px] text-gray-400 leading-relaxed">
                            <div>Las cuentas nuevas nacen con permisos de misiones.</div>
                            <div>El borrado sigue siendo solo para admin hasta que tu lo abras.</div>
                        </div>

                        {error && (
                            <div className="mt-4 border border-red-900 bg-red-950/30 p-3 text-xs text-red-300">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="p-4 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.3em]">Cuentas y Permisos</div>
                            <button onClick={loadAccounts} className="border border-cyan-900 text-cyan-300 px-3 py-2 text-xs font-black uppercase hover:bg-cyan-900/20">
                                Recargar
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-cyan-400 text-sm">Cargando cuentas...</div>
                        ) : (
                            <div className="space-y-4">
                                {accounts.map((account) => (
                                    <div key={account.uid} className="border border-slate-800 bg-slate-900/40 p-4 space-y-4">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                            <div>
                                                <div className="text-white font-black uppercase tracking-wide">{account.displayName}</div>
                                                <div className="text-sm text-gray-400">{account.email}</div>
                                                <div className="text-[10px] text-cyan-600 uppercase tracking-[0.3em] mt-1">
                                                    {account.role === 'admin' ? 'Admin' : 'Editor'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase border ${account.isActive ? 'border-emerald-700 text-emerald-300' : 'border-yellow-700 text-yellow-300'}`}>
                                                    {account.isActive ? 'Activo' : 'Pausado'}
                                                </span>
                                                {account.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleToggleStatus(account)}
                                                        className="border border-slate-700 text-slate-200 px-3 py-2 text-xs font-black uppercase hover:bg-slate-800"
                                                    >
                                                        {account.isActive ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {renderPermissionRow(account, 'missions', 'Bloque Misiones')}
                                        {renderPermissionRow(account, 'characters', 'Bloque Personajes')}

                                        {account.uid === currentAdminUid && (
                                            <div className="text-[10px] text-cyan-500 uppercase tracking-[0.3em]">
                                                Tu cuenta admin siempre mantiene control total.
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
