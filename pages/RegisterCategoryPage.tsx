
import React, { useState } from 'react';
import { ItemCategory } from '../../types';

interface RegisterCategoryPageProps {
    categories: ItemCategory[];
    onSave: (category: ItemCategory) => void;
    onCancel: () => void;
}

const RegisterCategoryPage: React.FC<RegisterCategoryPageProps> = ({ categories, onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSave = () => {
        if (!name) return alert('Preencha o nome da categoria');
        const newCategory: ItemCategory = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            description,
        };
        onSave(newCategory);
        setName('');
        setDescription('');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Categorias de Itens</h2>
                    <p className="text-sm text-slate-500">Organize seus produtos por categorias</p>
                </div>
                <button onClick={onCancel} className="px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                    <span className="material-icons-round text-base">arrow_back</span> Voltar
                </button>
            </div>

            {/* Formulário */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-purple-900/30">
                        <span className="material-icons-round text-white text-3xl">category</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Nova Categoria</h3>
                        <p className="text-sm text-slate-500">Crie categorias para organizar seus itens</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Nome da Categoria *</label>
                        <input
                            value={name} onChange={e => setName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="Ex: Eletrônicos"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Descrição</label>
                        <input
                            value={description} onChange={e => setDescription(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="Breve descrição..."
                        />
                    </div>
                    <div className="flex items-end">
                        <button onClick={handleSave} className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all">
                            Salvar Categoria
                        </button>
                    </div>
                </div>
            </div>

            {/* Listagem de Categorias */}
            {categories.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(cat => (
                        <div key={cat.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                                    <span className="material-icons-round text-violet-600 dark:text-violet-400">folder</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold group-hover:text-primary transition-colors">{cat.name}</h4>
                                    <p className="text-xs text-slate-500 mt-1">{cat.description || 'Sem descrição'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RegisterCategoryPage;
