import React, { useState } from 'react';
import { Profile, PagePermission } from '../types';
import { supabase } from '../supabaseClient';
import { SYSTEM_PAGES } from '../constants';

interface RegisterProfilePageProps {
    profiles: Profile[];
    editingProfile?: Profile;
    onSave: (profile: Profile) => void;
    onCancel: () => void;
    permission: PagePermission;
}

const RegisterProfilePage: React.FC<RegisterProfilePageProps> = ({ profiles, editingProfile, onSave, onCancel, permission }) => {

    const [name, setName] = useState(editingProfile?.name || '');
    const [description, setDescription] = useState(editingProfile?.description || '');

    const handleSave = async () => {
        if (!name) return alert('Preencha o nome do perfil');

        const profileData = {
            name,
            description,
        };

        if (editingProfile) {
            const { error } = await supabase
                .from('profiles')
                .update(profileData)
                .eq('id', editingProfile.id);

            if (error) {
                alert('Erro ao atualizar perfil: ' + error.message);
                return;
            }
            onSave({ ...editingProfile, ...profileData });
        } else {
            const newProfile: Profile = {
                id: Math.random().toString(36).substr(2, 9),
                ...profileData,
            };

            const { error } = await supabase.from('profiles').insert(newProfile);

            if (error) {
                alert('Erro ao salvar perfil: ' + error.message);
                return;
            }

            const defaultPermissions = SYSTEM_PAGES.map(page => ({
                id: Math.random().toString(36).substr(2, 9),
                page_name: page.name,
                page_key: page.key,
                can_read: false,
                can_write: false,
                can_delete: false,
                profile_id: newProfile.id
            }));

            const { error: permError } = await supabase.from('page_permissions').insert(defaultPermissions);
            if (permError) {
                console.error('Error creating default permissions:', permError);
                alert('Perfil criado, mas erro ao gerar permissões padrão: ' + permError.message);
            }

            onSave(newProfile);
        }

        setName('');
        setDescription('');
    };

    const handleDelete = async (id: string) => {
        if (id === '1') return alert('O perfil Administrador não pode ser excluído');
        if (!confirm('Deseja realmente excluir este perfil? Atenção: isso poderá afetar usuários e permissões.')) return;

        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) {
            alert('Erro ao excluir perfil: ' + error.message);
            return;
        }
        onSave({ id, name: '', description: '' });
    };

    const handleEditInList = (profile: Profile) => {
        setName(profile.name);
        setDescription(profile.description);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">{editingProfile ? 'Editar Perfil' : 'Cadastrar Perfil'}</h2>
                    <p className="text-sm text-slate-500">{editingProfile ? 'Atualize os dados do perfil de acesso' : 'Crie perfis de acesso para o sistema'}</p>
                </div>
                <button onClick={onCancel} className="px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    Voltar
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
                        <span className="material-icons-round text-white text-3xl">badge</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Novo Perfil</h3>
                        <p className="text-sm text-slate-500">Defina nome e descrição do perfil de acesso</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Nome do Perfil *</label>
                        <input
                            value={name} onChange={e => setName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="Ex: Gerente, Vendedor, Financeiro..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Descrição</label>
                        <textarea
                            value={description} onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                            placeholder="Descreva as responsabilidades deste perfil..."
                        />
                    </div>
                    <div className="flex gap-3">
                        {editingProfile && permission.canDelete && (
                            <button onClick={() => handleDelete(editingProfile.id)} className="flex-1 px-6 py-2.5 rounded-xl border border-red-200 text-red-500 font-medium hover:bg-red-50 transition-colors">
                                Excluir
                            </button>
                        )}
                        {permission.canWrite && (
                            <button onClick={handleSave} className="flex-[2] bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all">
                                {editingProfile ? 'Atualizar Perfil' : 'Salvar Perfil'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {profiles.length > 0 && (() => {
                const [searchFilter, setSearchFilter] = useState('');
                const [tempSearch, setTempSearch] = useState('');
                const filteredProfiles = profiles.filter(p => p.name.toLowerCase().includes(searchFilter.toLowerCase()));

                return (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <span className="material-icons-outlined text-primary text-xl">list</span>
                                <span>Perfis Cadastrados ({profiles.length})</span>
                            </h3>
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                                    <input type="text" placeholder="Filtrar perfil..." value={tempSearch} onChange={(e) => setTempSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                                </div>
                                <button onClick={() => { setTempSearch(''); setSearchFilter(''); }} className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Limpar</button>
                                <button onClick={() => setSearchFilter(tempSearch)} className="px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors">Pesquisar</button>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredProfiles.length > 0 ? filteredProfiles.map(profile => (
                                <div key={profile.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                        <span className="material-icons-round text-violet-600 dark:text-violet-400 text-xl">badge</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{profile.name}</p>
                                        <p className="text-xs text-slate-500">{profile.description}</p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {permission.canWrite && <button onClick={() => handleEditInList(profile)} className="p-2 rounded-lg text-slate-400 hover:text-primary transition-all"><span className="material-icons-round text-base">edit</span></button>}
                                        {profile.id !== '1' && permission.canDelete && <button onClick={() => handleDelete(profile.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 transition-all"><span className="material-icons-round text-base">delete</span></button>}
                                    </div>
                                </div>
                            )) : <div className="p-12 text-center text-slate-500 italic text-sm">Nenhum perfil encontrado.</div>}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default RegisterProfilePage;
