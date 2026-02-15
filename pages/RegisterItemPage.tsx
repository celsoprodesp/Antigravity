
import React, { useState } from 'react';
import { Item, ItemCategory } from '../../types';

interface RegisterItemPageProps {
    items: Item[];
    categories: ItemCategory[];
    onSave: (item: Item) => void;
    onCancel: () => void;
    onNavigateCategory: () => void;
}

const RegisterItemPage: React.FC<RegisterItemPageProps> = ({ items, categories, onSave, onCancel, onNavigateCategory }) => {
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [unitPrice, setUnitPrice] = useState(0);
    const [unit, setUnit] = useState('un');

    const handleSave = () => {
        if (!name || !categoryId || unitPrice <= 0) return alert('Preencha todos os campos');
        const cat = categories.find(c => c.id === categoryId);
        const newItem: Item = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            categoryId,
            categoryName: cat?.name || '',
            unitPrice,
            unit,
        };
        onSave(newItem);
        setName('');
        setCategoryId('');
        setUnitPrice(0);
        setUnit('un');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Cadastrar Itens</h2>
                    <p className="text-sm text-slate-500">Gerencie seu catálogo de produtos e serviços</p>
                </div>
                <button onClick={onCancel} className="px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    Voltar
                </button>
            </div>

            {/* Formulário */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
                        <span className="material-icons-round text-white text-3xl">inventory_2</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Novo Item</h3>
                        <p className="text-sm text-slate-500">Adicione ao catálogo</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Nome do Item *</label>
                        <input
                            value={name} onChange={e => setName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="Ex: Monitor 27 Dell UltraSharp"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Categoria *</label>
                        <div className="flex gap-2">
                            <select
                                value={categoryId} onChange={e => setCategoryId(e.target.value)}
                                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            >
                                <option value="">Selecione...</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                            <button
                                onClick={onNavigateCategory}
                                className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1 transition-colors whitespace-nowrap"
                            >
                                <span className="material-icons-round text-base">add_circle</span> Categoria
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Unidade</label>
                        <select
                            value={unit} onChange={e => setUnit(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            <option value="un">Unidade</option>
                            <option value="kg">Quilograma</option>
                            <option value="m">Metro</option>
                            <option value="h">Hora</option>
                            <option value="licença">Licença</option>
                            <option value="pacote">Pacote</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Preço Unitário (R$) *</label>
                        <input
                            type="number" min="0" step="0.01"
                            value={unitPrice} onChange={e => setUnitPrice(Number(e.target.value))}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                    <div className="flex items-end">
                        <button onClick={handleSave} className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all">
                            Salvar Item
                        </button>
                    </div>
                </div>
            </div>

            {/* Listagem de Itens */}
            {items.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold flex items-center gap-2">
                            <span className="material-icons-outlined text-primary text-xl">list</span>
                            Itens Cadastrados ({items.length})
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                    <th className="px-6 py-4">Nome</th>
                                    <th className="px-6 py-4">Categoria</th>
                                    <th className="px-6 py-4">Unidade</th>
                                    <th className="px-6 py-4 text-right">Preço Unit.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {items.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">{item.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-xs">{item.categoryName}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{item.unit}</td>
                                        <td className="px-6 py-4 text-right font-semibold">R$ {item.unitPrice.toLocaleString('pt-BR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegisterItemPage;
