import React from 'react';
import { User, Profile, PagePermission } from '../types';

interface UserManagementPageProps {
    users: User[];
    profiles: Profile[];
    onNavigateRegisterUser: () => void;
    onEditUser: (id: string) => void;
    onCancel: () => void;
    permission: PagePermission;
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({
    users, profiles, onNavigateRegisterUser, onEditUser, onCancel, permission
}) => {
    const [nameFilter, setNameFilter] = React.useState('');
    const [emailFilter, setEmailFilter] = React.useState('');
    const [profileFilter, setProfileFilter] = React.useState('');
    const [roleFilter, setRoleFilter] = React.useState('');

    const handleClear = () => {
        setNameFilter('');
        setEmailFilter('');
        setProfileFilter('');
        setRoleFilter('');
    };

    const filteredUsers = users.filter(user => {
        const matchesName = user.name.toLowerCase().includes(nameFilter.toLowerCase());
        const matchesEmail = user.email.toLowerCase().includes(emailFilter.toLowerCase());
        const matchesProfile = !profileFilter || user.profileId === profileFilter;
        const matchesRole = (user.role || '').toLowerCase().includes(roleFilter.toLowerCase());
        return matchesName && matchesEmail && matchesProfile && matchesRole;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Gestão de Usuários</h2>
                    <p className="text-sm text-slate-500">Gerencie quem tem acesso ao sistema</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        Voltar
                    </button>
                    {permission.canWrite && (
                        <button
                            onClick={onNavigateRegisterUser}
                            className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                        >
                            <span className="material-icons-round text-base">person_add</span> Novo Usuário
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2 ml-1">Usuário</label>
                        <input type="text" placeholder="Nome..." value={nameFilter} onChange={e => setNameFilter(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2 ml-1">Email</label>
                        <input type="text" placeholder="Email..." value={emailFilter} onChange={e => setEmailFilter(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2 ml-1">Perfil</label>
                        <select value={profileFilter} onChange={e => setProfileFilter(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none">
                            <option value="">Todos</option>
                            {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2 ml-1">Cargo/Setor</label>
                        <input type="text" placeholder="Cargo..." value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={handleClear} className="px-6 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Limpar Filtros</button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-51 dark:bg-slate-900/50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                <th className="px-6 py-4">Usuário</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Perfil</th>
                                <th className="px-6 py-4">Cargo/Setor</th>
                                <th className="px-6 py-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => {
                                    const userProfile = profiles.find(p => p.id === user.profileId);
                                    return (
                                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt={user.name} /> : user.name.charAt(0)}
                                                    </div>
                                                    <span className="font-semibold">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">
                                                    {userProfile?.name || 'Sem perfil'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{user.role || '-'}</td>
                                            <td className="px-6 py-4 text-center">
                                                {permission.canWrite && (
                                                    <button onClick={() => onEditUser(user.id)} className="p-2 rounded-lg text-slate-400 hover:text-primary transition-all">
                                                        <span className="material-icons-round text-lg">edit</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                                        Nenhum usuário encontrado com os filtros selecionados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagementPage;
