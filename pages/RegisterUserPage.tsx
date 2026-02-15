import React, { useState } from 'react';
import { Profile, User } from '../../types';

interface RegisterUserPageProps {
    profiles: Profile[];
    onSave: (newUser: User) => void;
    onCancel: () => void;
}

const RegisterUserPage: React.FC<RegisterUserPageProps> = ({ profiles, onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profileId, setProfileId] = useState(profiles[0]?.id || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !profileId) return;

        const newUser: User = {
            id: Date.now().toString(),
            name,
            email,
            profileId,
            role: profiles.find(p => p.id === profileId)?.name || 'Usuário'
        };

        onSave(newUser);
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
                    <h2 className="text-2xl font-bold">Novo Usuário</h2>
                    <p className="text-sm text-slate-500">Cadastre um novo usuário no sistema</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">

                <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Nome Completo</label>
                    <input
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
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all"
                    >
                        Salvar Usuário
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterUserPage;
