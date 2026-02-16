import React, { useState, useEffect, useRef } from 'react';
import { Profile, User } from '../types';
import { supabase } from '../supabaseClient';

interface RegisterUserPageProps {
    profiles: Profile[];
    editingUser?: User;
    onSave: (user: User) => void;
    onCancel: () => void;
}

const RegisterUserPage: React.FC<RegisterUserPageProps> = ({ profiles, editingUser, onSave, onCancel }) => {
    const [name, setName] = useState(editingUser?.name || '');
    const [email, setEmail] = useState(editingUser?.email || '');
    const [profileId, setProfileId] = useState(editingUser?.profileId || profiles[0]?.id || '');
    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingUser) {
            setName(editingUser.name);
            setEmail(editingUser.email);
            setProfileId(editingUser.profileId);

            setTimeout(() => {
                if (nameInputRef.current) nameInputRef.current.focus();
            }, 0);
        } else {
            setName('');
            setEmail('');
            setProfileId(profiles[0]?.id || '');
        }
    }, [editingUser, profiles]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !profileId) return;

        const role = profiles.find(p => p.id === profileId)?.name || 'Usuário';
        const userData = {
            name,
            email,
            profile_id: profileId,
            role
        };

        if (editingUser) {
            const { error } = await supabase
                .from('users')
                .update(userData)
                .eq('id', editingUser.id);

            if (error) {
                alert('Erro ao atualizar usuário: ' + error.message);
                return;
            }
            onSave({ ...editingUser, ...userData, profileId: userData.profile_id });
        } else {
            const newUser: User = {
                id: Date.now().toString(),
                name,
                email,
                profileId,
                role
            };

            const { error } = await supabase.from('users').insert({
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                profile_id: newUser.profileId,
                role: newUser.role
            });

            if (error) {
                alert('Erro ao salvar usuário: ' + error.message);
                return;
            }
            onSave(newUser);
        }
    };

    const handleDelete = async () => {
        if (!editingUser) return;
        if (!confirm('Deseja realmente excluir este usuário?')) return;

        const { error } = await supabase.from('users').delete().eq('id', editingUser.id);
        if (error) {
            alert('Erro ao excluir usuário: ' + error.message);
            return;
        }
        onSave(editingUser); // Trigger refresh
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onCancel}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <span className="material-icons-round text-slate-500">arrow_back</span>
                </button>
                <div>
                    <h2 className="text-2xl font-bold">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                    <p className="text-sm text-slate-500">{editingUser ? 'Atualize os dados do usuário' : 'Cadastre um novo usuário no sistema'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">

                <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Nome Completo</label>
                    <input
                        ref={nameInputRef}
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        placeholder="Ex: João Silva"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">E-mail</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        placeholder="Ex: joao@empresa.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Perfil de Acesso</label>
                    <div className="grid grid-cols-1 gap-3">
                        {profiles.map(profile => (
                            <label
                                key={profile.id}
                                className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${profileId === profile.id
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="profile"
                                    value={profile.id}
                                    checked={profileId === profile.id}
                                    onChange={(e) => setProfileId(e.target.value)}
                                    className="w-4 h-4 text-primary focus:ring-primary"
                                />
                                <div className="ml-3">
                                    <span className="block text-sm font-medium text-slate-900 dark:text-white">{profile.name}</span>
                                    <span className="block text-xs text-slate-500">{profile.description}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    {editingUser && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="flex-1 px-6 py-3 rounded-xl border border-red-200 text-red-500 font-medium hover:bg-red-50 transition-colors"
                        >
                            Excluir
                        </button>
                    )}
                    <button
                        type="submit"
                        className="flex-[2] px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all"
                    >
                        {editingUser ? 'Atualizar Usuário' : 'Salvar Usuário'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterUserPage;
