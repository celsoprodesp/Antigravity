import React, { useState } from 'react';
import { PagePermission, Profile, User } from '../../types';

interface AdminPageProps {
    permissions: PagePermission[];
    setPermissions: React.Dispatch<React.SetStateAction<PagePermission[]>>;
    profiles: Profile[];
    users: User[];
    onCancel: () => void;
    onNavigateRegisterProfile: () => void;
    onNavigateRegisterUser: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({
    permissions, setPermissions, profiles, users,
    onCancel, onNavigateRegisterProfile, onNavigateRegisterUser
}) => {
    const [selectedProfileId, setSelectedProfileId] = useState(profiles[0]?.id || '1');

    // Filtrar permissões pelo perfil selecionado
    // Se não existirem permissões para este perfil (ex: novo perfil), mostra vazio ou padrão
    const currentPermissions = permissions.filter(p => p.profileId === selectedProfileId);

    const togglePermission = (id: string, field: 'canRead' | 'canWrite' | 'canDelete') => {
        setPermissions(prev => prev.map(p =>
            p.id === id ? { ...p, [field]: !p[field] } : p
        ));
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna Esquerda: Perfis e Permissões */}
                <div className="lg:col-span-2 space-y-6">
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
                            <select
                                value={selectedProfileId}
                                onChange={e => setSelectedProfileId(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            >
                                {profiles.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <p className="mt-2 text-xs text-slate-500">
                                {profiles.find(p => p.id === selectedProfileId)?.description}
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-xl">Página / Recurso</th>
                                        <th className="px-4 py-3 text-center w-24">Ler</th>
                                        <th className="px-4 py-3 text-center w-24">Escrever</th>
                                        <th className="px-4 py-3 text-center w-24 rounded-tr-xl">Excluir</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {currentPermissions.length > 0 ? (
                                        currentPermissions.map(permission => (
                                            <tr key={permission.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-4 py-3 font-medium">{permission.pageName}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => togglePermission(permission.id, 'canRead')}
                                                        className={`w-10 h-6 rounded-full transition-colors relative ${permission.canRead ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                                                    >
                                                        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${permission.canRead ? 'translate-x-4' : 'translate-x-0'}`} />
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => togglePermission(permission.id, 'canWrite')}
                                                        className={`w-10 h-6 rounded-full transition-colors relative ${permission.canWrite ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                                                    >
                                                        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${permission.canWrite ? 'translate-x-4' : 'translate-x-0'}`} />
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => togglePermission(permission.id, 'canDelete')}
                                                        className={`w-10 h-6 rounded-full transition-colors relative ${permission.canDelete ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                                                    >
                                                        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${permission.canDelete ? 'translate-x-4' : 'translate-x-0'}`} />
                                                    </button>
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

                {/* Coluna Direita: Usuários */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold flex items-center gap-2">
                                <span className="material-icons-round text-primary">people</span> Usuários
                            </h3>
                            <button
                                onClick={onNavigateRegisterUser}
                                className="bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-1"
                            >
                                <span className="material-icons-round text-sm">add</span> Novo
                            </button>
                        </div>

                        <div className="space-y-4">
                            {users.map(user => {
                                const userProfile = profiles.find(p => p.id === user.profileId);
                                return (
                                    <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                                            {user.avatar ?
                                                <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt={user.name} />
                                                : user.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{user.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                                            {userProfile?.name || 'Sem perfil'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
