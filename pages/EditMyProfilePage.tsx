import React, { useState } from 'react';
import { User, PagePermission } from '../types';
import { supabase } from '../supabaseClient';

interface EditMyProfilePageProps {
    currentUser: User | null;
    onSave: () => void;
    onCancel: () => void;
    permission: PagePermission;
}

const EditMyProfilePage: React.FC<EditMyProfilePageProps> = ({ currentUser, onSave, onCancel, permission }) => {
    if (!currentUser) return null;

    const [name, setName] = useState(currentUser.name);
    const [email, setEmail] = useState(currentUser.email);
    const [avatar, setAvatar] = useState(currentUser.avatar || '');

    const handleSave = async () => {
        if (!permission.canWrite) return;

        const { error } = await supabase
            .from('users')
            .update({
                name,
                email,
                avatar
            })
            .eq('id', currentUser.id);

        if (error) {
            alert('Erro ao atualizar perfil: ' + error.message);
            return;
        }

        onSave();
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <span className="material-icons-round text-primary text-2xl">person</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Meu Perfil</h2>
                        <p className="text-sm text-slate-500 text-balance">Gerencie suas informações pessoais</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Photo Upload */}
                    <div className="flex flex-col items-center gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        <div className="relative group">
                            {avatar ? (
                                <img src={avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-md" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-4xl font-bold text-indigo-600 border-4 border-white dark:border-slate-900 shadow-md">
                                    {currentUser.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                                <span className="material-icons-round text-sm">photo_camera</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} disabled={!permission.canWrite} />
                            </label>
                        </div>
                        <p className="text-xs text-slate-500">Clique na câmera para alterar sua foto</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Nome Completo</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                placeholder="Seu nome"
                                disabled={!permission.canWrite}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">E-mail</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                placeholder="seu@email.com"
                                disabled={!permission.canWrite}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Tipo de Perfil (Role)</label>
                            <div className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed">
                                {currentUser.role || 'Usuário'}
                            </div>
                            <p className="text-[10px] text-slate-400 ml-1">Para alterar seu tipo de perfil, entre em contato com um administrador.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
                    >
                        Voltar
                    </button>
                    {permission.canWrite && (
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3.5 rounded-xl font-bold bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all"
                        >
                            Salvar Alterações
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditMyProfilePage;
