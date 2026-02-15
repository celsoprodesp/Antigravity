
import React, { useState } from 'react';
import { Client } from '../../types';

interface RegisterClientPageProps {
    onSave: (client: Client) => void;
    onCancel: () => void;
}

const RegisterClientPage: React.FC<RegisterClientPageProps> = ({ onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState<'ATIVO' | 'INATIVO'>('ATIVO');
    const [classification, setClassification] = useState<'NORMAL' | 'VIP' | 'RISCO'>('NORMAL');

    const handleSave = () => {
        if (!name || !email) return alert('Preencha nome e email');
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const newClient: Client = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            company: company || 'Autônomo',
            email,
            phone,
            lastPurchase: 'Nunca',
            inactivityDays: 0,
            initials,
            status,
            classification,
        };
        onSave(newClient);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Cadastrar Cliente</h2>
                    <p className="text-sm text-slate-500">Preencha os dados do novo cliente</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Voltar</button>
                    <button onClick={handleSave} className="bg-primary hover:bg-primary-dark text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all">Salvar</button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="material-icons-round text-white text-3xl">person_add</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Dados Pessoais</h3>
                        <p className="text-sm text-slate-500">Informações básicas do cliente</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                        <input
                            value={name} onChange={e => setName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="João da Silva"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Empresa</label>
                        <input
                            value={company} onChange={e => setCompany(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="Empresa LTDA"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <input
                            type="email" value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="email@exemplo.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Telefone</label>
                        <input
                            value={phone} onChange={e => setPhone(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="(11) 99999-9999"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Status</label>
                        <select
                            value={status} onChange={e => setStatus(e.target.value as 'ATIVO' | 'INATIVO')}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            <option value="ATIVO">Ativo</option>
                            <option value="INATIVO">Inativo</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Classificação</label>
                        <select
                            value={classification} onChange={e => setClassification(e.target.value as 'NORMAL' | 'VIP' | 'RISCO')}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            <option value="NORMAL">Normal</option>
                            <option value="VIP">VIP</option>
                            <option value="RISCO">Risco</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterClientPage;
