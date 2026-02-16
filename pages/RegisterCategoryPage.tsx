
import React, { useState, useEffect, useRef } from 'react';
import { ItemCategory } from '../types';
import { supabase } from '../supabaseClient';

interface RegisterCategoryPageProps {
    categories: ItemCategory[];
    editingCategory?: ItemCategory;
    onSave: (category: ItemCategory) => void;
    onCancel: () => void;
    onEditCategory: (id: string) => void;
}

const RegisterCategoryPage: React.FC<RegisterCategoryPageProps> = ({ categories, editingCategory, onSave, onCancel, onEditCategory }) => {
    const [name, setName] = useState(editingCategory?.name || '');
    const [description, setDescription] = useState(editingCategory?.description || '');
    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingCategory) {
            setName(editingCategory.name);
            setDescription(editingCategory.description);

            setTimeout(() => {
                if (nameInputRef.current) nameInputRef.current.focus();
            }, 0);
        } else {
            setName('');
            setDescription('');
        }
    }, [editingCategory]);

    const handleSave = async () => {
        if (!name) return alert('Preencha o nome da categoria');

        const categoryData = {
            name,
            description,
        };

        if (editingCategory) {
            const { error } = await supabase
                .from('item_categories')
                .update(categoryData)
                .eq('id', editingCategory.id);

            if (error) {
                alert('Erro ao atualizar categoria: ' + error.message);
                return;
            }
            onSave({ ...editingCategory, ...categoryData });
        } else {
            const newCategory: ItemCategory = {
                id: Math.random().toString(36).substr(2, 9),
                ...categoryData,
            };

            const { error } = await supabase.from('item_categories').insert(newCategory);

            if (error) {
                alert('Erro ao salvar categoria: ' + error.message);
                return;
            }
            onSave(newCategory);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir esta categoria? Atenção: isso poderá afetar itens vinculados.')) return;

        const { error } = await supabase.from('item_categories').delete().eq('id', id);
        if (error) {
            alert('Erro ao excluir categoria: ' + error.message);
            return;
        }
        onSave({ id, name: '', description: '' }); // Trigger refresh
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
                        <h3 className="font-bold text-lg">{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</h3>
                        <p className="text-sm text-slate-500">{editingCategory ? 'Atualize os dados da categoria' : 'Crie categorias para organizar seus itens'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Nome da Categoria *</label>
                        <input
                            ref={nameInputRef}
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
                            <div className="mt-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onEditCategory(cat.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-all">
                                    <span className="material-icons-round text-sm">edit</span>
                                </button>
                                <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                    <span className="material-icons-round text-sm">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RegisterCategoryPage;
