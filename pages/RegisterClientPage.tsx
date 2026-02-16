import React, { useState, useEffect, useRef } from 'react';
import { Client, PagePermission } from '../types';
import { supabase } from '../supabaseClient';

interface RegisterClientPageProps {
    editingClient?: Client;
    onSave: (client: Client) => void;
    onCancel: () => void;
    permission: PagePermission;
}

const RegisterClientPage: React.FC<RegisterClientPageProps> = ({ editingClient, onSave, onCancel, permission }) => {

    const [name, setName] = useState(editingClient?.name || '');
    const [company, setCompany] = useState(editingClient?.company || '');
    const [email, setEmail] = useState(editingClient?.email || '');
    const [phone, setPhone] = useState(editingClient?.phone || '');
    const [status, setStatus] = useState<'ATIVO' | 'INATIVO'>(editingClient?.status || 'ATIVO');
    const [classification, setClassification] = useState<'NORMAL' | 'VIP' | 'RISCO'>(editingClient?.classification || 'NORMAL');
    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingClient) {
            setName(editingClient.name);
            setCompany(editingClient.company);
            setEmail(editingClient.email);
            setPhone(editingClient.phone);
            setStatus(editingClient.status);
            setClassification(editingClient.classification);

            setTimeout(() => {
                if (nameInputRef.current) nameInputRef.current.focus();
            }, 0);
        } else {
            setName('');
            setCompany('');
            setEmail('');
            setPhone('');
            setStatus('ATIVO');
            setClassification('NORMAL');
        }
    }, [editingClient]);

    const handleSave = async () => {
        if (!name || !email) return alert('Preencha nome e email');
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        const clientData = {
            name,
            company: company || 'Autônomo',
            email,
            phone,
            initials,
            status,
            classification,
        };

        if (editingClient) {
            const { error } = await supabase
                .from('clients')
                .update(clientData)
                .eq('id', editingClient.id);

            if (error) {
                alert('Erro ao atualizar cliente: ' + error.message);
                return;
            }
            onSave({ ...editingClient, ...clientData });
        } else {
            const newClient: Client = {
                id: Math.random().toString(36).substr(2, 9),
                ...clientData,
                lastPurchase: 'Nunca',
                inactivityDays: 0,
            };

            const { error } = await supabase.from('clients').insert({
                id: newClient.id,
                ...clientData,
                last_purchase: newClient.lastPurchase,
                inactivity_days: newClient.inactivityDays
            });

            if (error) {
                alert('Erro ao salvar cliente: ' + error.message);
                return;
            }
            onSave(newClient);
        }
    };

    const handleDelete = async () => {
        if (!editingClient) return;
        if (!confirm('Deseja realmente excluir este cliente?')) return;

        const { error } = await supabase.from('clients').delete().eq('id', editingClient.id);
        if (error) {
            alert('Erro ao excluir cliente: ' + error.message);
            return;
        }
        onSave(editingClient); // Pass the client to notify deletion (App will refresh list)
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold">{editingClient ? 'Editar Cliente' : 'Cadastrar Cliente'}</h2>
                    <p className="text-sm text-slate-500">{editingClient ? 'Atualize os dados do cliente' : 'Preencha os dados do novo cliente'}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="material-icons-round text-white text-3xl">person_add</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Dados Pessoais</h3>
                        <p className="text-sm text-slate-500">Informações básicas do cliente</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                        <input
                            ref={nameInputRef}
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

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button type="button" onClick={onCancel} className="w-full sm:flex-1 px-6 py-3 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors order-3 sm:order-1">Voltar</button>
                    {editingClient && permission.canDelete && (
                        <button type="button" onClick={handleDelete} className="w-full sm:flex-1 px-6 py-3 rounded-xl text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors order-2">Excluir</button>
                    )}
                    {permission.canWrite && (
                        <button type="button" onClick={handleSave} className="w-full sm:flex-[2] bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all order-1 sm:order-2">Salvar Cliente</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegisterClientPage;
