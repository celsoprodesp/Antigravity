import React, { useState, useEffect, useRef } from 'react';
import { ItemCategory, PagePermission } from '../types';
import { supabase } from '../supabaseClient';

interface RegisterCategoryPageProps {
    categories: ItemCategory[];
    editingCategory?: ItemCategory;
    onSave: (category: ItemCategory) => void;
    onCancel: () => void;
    onEditCategory: (id: string) => void;
    permission: PagePermission;
}

const RegisterCategoryPage: React.FC<RegisterCategoryPageProps> = ({ categories, editingCategory, onSave, onCancel, onEditCategory, permission }) => {

    const [name, setName] = useState(editingCategory?.name || '');
    const [description, setDescription] = useState(editingCategory?.description || '');
    const [searchTerm, setSearchTerm] = useState('');
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

    const handleClear = () => {
        setName('');
        setDescription('');
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
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn text-center sm:text-left">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-center sm:text-left">Categorias de Itens</h2>
                    <p className="text-sm text-slate-500">Organize seus produtos por categorias</p>
                </div>
                <button onClick={onCancel} className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                    Voltar
                </button>
            </div>

            {/* Formulário */}
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-purple-900/30">
                        <span className="material-icons-round text-white text-3xl">category</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-left">{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</h3>
                        <p className="text-sm text-slate-500 text-left">{editingCategory ? 'Atualize os dados da categoria' : 'Crie categorias para organizar seus itens'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-2 text-left">Nome da Categoria *</label>
                        <input
                            ref={nameInputRef}
                            value={name} onChange={e => setName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="Ex: Eletrônicos"
                        />
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-2 text-left">Descrição</label>
                        <input
                            value={description} onChange={e => setDescription(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="Breve descrição..."
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button onClick={handleClear} className="w-full sm:flex-1 px-6 py-3 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        Limpar Campos
                    </button>
                    {permission.canWrite && (
                        <button onClick={handleSave} className="w-full sm:flex-[2] bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all">
                            Salvar Categoria
                        </button>
                    )}
                </div>
            </div>

            {/* Listagem de Categorias */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="font-bold flex items-center gap-2">
                        <span className="material-icons-round text-primary">list</span>
                        Categorias Cadastradas ({categories.length})
                    </h3>
                    <div className="flex w-full md:w-auto gap-2">
                        <div className="relative flex-1 md:w-64">
                            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                            <input
                                type="text"
                                placeholder="Filtrar categoria..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Limpar
                        </button>
                    </div>
                </div>
            </div>

            {categories.length > 0 && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                    {categories
                        .filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(cat => (
                            <div key={cat.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group w-[250px]">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-3">
                                        <span className="material-icons-round text-violet-600 dark:text-violet-400 text-xl">folder</span>
                                    </div>
                                    <div className="w-full overflow-hidden">
                                        <h4 className="font-semibold group-hover:text-primary transition-colors truncate px-2" title={cat.name}>{cat.name}</h4>
                                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 min-h-[2.5rem] break-words" title={cat.description}>
                                            {cat.description || 'Sem descrição'}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {permission.canWrite && (
                                        <button onClick={() => onEditCategory(cat.id)} className="p-2 rounded-lg text-slate-400 hover:text-primary transition-all">
                                            <span className="material-icons-round text-lg">edit</span>
                                        </button>
                                    )}
                                    {permission.canDelete && (
                                        <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 transition-all">
                                            <span className="material-icons-round text-lg">delete</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default RegisterCategoryPage;
