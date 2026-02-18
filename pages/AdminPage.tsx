import React, { useState } from 'react';
import { PagePermission, Profile, User } from '../types';
import { supabase } from '../supabaseClient';
import { SYSTEM_PAGES } from '../constants';

interface AdminPageProps {
    permissions: PagePermission[];
    setPermissions: React.Dispatch<React.SetStateAction<PagePermission[]>>;
    profiles: Profile[];
    users: User[];
    onCancel: () => void;
    onNavigateRegisterProfile: () => void;
    onNavigateRegisterUser: () => void;
    onEditProfile: (id: string) => void;
    onEditUser: (id: string) => void;
    permission: PagePermission;
}

const AdminPage: React.FC<AdminPageProps> = ({
    permissions, setPermissions, profiles, users,
    onCancel, onNavigateRegisterProfile, onNavigateRegisterUser,
    onEditProfile, onEditUser, permission
}) => {
    const [selectedProfileId, setSelectedProfileId] = useState(profiles[0]?.id || '1');

    // Listar permissões para todas as páginas do sistema
    const currentPermissions = SYSTEM_PAGES.map(page => {
        const existing = permissions.find(p => p.profileId === selectedProfileId && p.pageKey === page.key);
        return existing || {
            id: `temp-${page.key}-${selectedProfileId}`,
            pageName: page.name,
            pageKey: page.key,
            canRead: false,
            canWrite: false,
            canDelete: false,
            profileId: selectedProfileId
        };
    });

    const togglePermission = (id: string, field: 'canRead' | 'canWrite' | 'canDelete') => {
        // Prevent editing Admin permissions
        if (selectedProfileId === '1') return;

        setPermissions(prev => {
            const exists = prev.some(p => p.id === id);
            if (exists) {
                return prev.map(p => {
                    if (p.id !== id) return p;

                    const updated = { ...p, [field]: !p[field] };

                    // Logic: If Write or Delete is ON, Read MUST be ON
                    if ((field === 'canWrite' || field === 'canDelete') && updated[field]) {
                        updated.canRead = true;
                    }

                    // Logic: If Read is OFF, Write and Delete MUST be OFF
                    if (field === 'canRead' && !updated.canRead) {
                        updated.canWrite = false;
                        updated.canDelete = false;
                    }

                    return updated;
                });
            } else {
                // If it's a virtual/temp permission, create a real record in state
                const pageKey = id.split('-')[1];
                const page = SYSTEM_PAGES.find(sp => sp.key === pageKey);

                const newPerm = {
                    id: Math.random().toString(36).substr(2, 9),
                    pageName: page?.name || pageKey,
                    pageKey: pageKey,
                    canRead: field === 'canRead',
                    canWrite: field === 'canWrite',
                    canDelete: field === 'canDelete',
                    profileId: selectedProfileId
                };

                // Apply dependencies to the new record
                if ((field === 'canWrite' || field === 'canDelete')) {
                    newPerm.canRead = true;
                }

                return [...prev, newPerm];
            }
        });
    };

    const handleSavePermissions = async () => {
        if (selectedProfileId === '1') return; // Should not happen if button disabled

        const permissionsToSave = permissions.filter(p => p.profileId === selectedProfileId);

        try {
            // Upsert all permissions for this profile
            const { error } = await supabase
                .from('page_permissions')
                .upsert(permissionsToSave.map(p => ({
                    id: p.id,
                    page_name: p.pageName,
                    page_key: p.pageKey,
                    can_read: p.canRead,
                    can_write: p.canWrite,
                    can_delete: p.canDelete,
                    profile_id: p.profileId
                })));

            if (error) throw error;
            alert('Permissões salvas com sucesso!');
        } catch (error: any) {
            console.error('Error saving permissions:', error);
            alert('Erro ao salvar permissões: ' + error.message);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Administração do Sistema</h2>
                    <p className="text-sm text-slate-500">Gerencie usuários, perfis e permissões de acesso</p>
                </div>
                <button onClick={onCancel} className="px-6 py-2 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    Voltar
                </button>
                {selectedProfileId !== '1' && permission.canWrite && (
                    <button
                        onClick={handleSavePermissions}
                        className="ml-3 bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-xl text-sm font-medium shadow-lg shadow-primary/20 transition-all"
                    >
                        Salvar Alterações
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Coluna Única: Perfis e Permissões */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold flex items-center gap-2">
                                <span className="material-icons-round text-primary">badge</span> Perfis e Permissões
                            </h3>
                            <button
                                onClick={onNavigateRegisterProfile}
                                className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/5"
                            >
                                <span className="material-icons-round text-base">add_circle</span> Novo Perfil
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Selecione o Perfil para Configurar</label>
                            <div className="flex gap-2">
                                <select
                                    value={selectedProfileId}
                                    onChange={e => setSelectedProfileId(e.target.value)}
                                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                >
                                    {profiles.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                {selectedProfileId !== '1' && (
                                    <button
                                        onClick={() => onEditProfile(selectedProfileId)}
                                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-all"
                                        title="Editar Perfil"
                                    >
                                        <span className="material-icons-round text-lg">edit</span>
                                    </button>
                                )}
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                                {profiles.find(p => p.id === selectedProfileId)?.description}
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-xl">Página / Recurso</th>
                                        <th className="px-4 py-3 text-center w-32">Leitura</th>
                                        <th className="px-4 py-3 text-center w-32">Escrita</th>
                                        <th className="px-4 py-3 text-center w-32 rounded-tr-xl">Exclusão</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {currentPermissions.length > 0 ? (
                                        currentPermissions.map(permission => (
                                            <tr key={permission.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-4 py-3 font-medium">{permission.pageName}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() => togglePermission(permission.id, 'canRead')}
                                                            disabled={selectedProfileId === '1'}
                                                            className={`w-11 h-6 rounded-full transition-all duration-300 relative flex items-center shadow-inner ${permission.canRead ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'} ${selectedProfileId === '1' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:ring-4 hover:ring-primary/10'}`}
                                                            title={permission.canRead ? 'Ativado' : 'Desativado'}
                                                        >
                                                            <span className={`absolute left-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 border border-slate-100 ${permission.canRead ? 'translate-x-5' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() => togglePermission(permission.id, 'canWrite')}
                                                            disabled={selectedProfileId === '1'}
                                                            className={`w-11 h-6 rounded-full transition-all duration-300 relative flex items-center shadow-inner ${permission.canWrite ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'} ${selectedProfileId === '1' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:ring-4 hover:ring-primary/10'}`}
                                                            title={permission.canWrite ? 'Ativado' : 'Desativado'}
                                                        >
                                                            <span className={`absolute left-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 border border-slate-100 ${permission.canWrite ? 'translate-x-5' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() => togglePermission(permission.id, 'canDelete')}
                                                            disabled={selectedProfileId === '1'}
                                                            className={`w-11 h-6 rounded-full transition-all duration-300 relative flex items-center shadow-inner ${permission.canDelete ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'} ${selectedProfileId === '1' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:ring-4 hover:ring-primary/10'}`}
                                                            title={permission.canDelete ? 'Ativado' : 'Desativado'}
                                                        >
                                                            <span className={`absolute left-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 border border-slate-100 ${permission.canDelete ? 'translate-x-5' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                                Nenhuma permissão configurada para este perfil.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
