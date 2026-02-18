import React, { useState } from 'react';
import { Client, PagePermission } from '../types';

interface ClientsPageProps {
  clients: Client[];
  onSelectClient: (id: string) => void;
  onNewClient: () => void;
  permission: PagePermission;
}

const ClientsPage: React.FC<ClientsPageProps> = ({ clients, onSelectClient, onNewClient, permission }) => {

  const [filter, setFilter] = useState('');

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    c.company.toLowerCase().includes(filter.toLowerCase()) ||
    c.email.toLowerCase().includes(filter.toLowerCase()) ||
    (c.phone || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Gestão de Clientes</h2>
          <p className="text-sm text-slate-500">Relacionamento e retenção</p>
        </div>
        {permission.canWrite && (
          <button
            onClick={onNewClient}
            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            <span className="material-icons-round text-lg">person_add</span> Novo Cliente
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96 flex gap-2">
            <div className="relative flex-1">
              <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 focus:ring-primary focus:border-primary placeholder-slate-400"
                placeholder="Buscar por nome, email, empresa ou telefone..."
                type="text"
              />
            </div>
            <button
              onClick={() => setFilter('')}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase font-semibold tracking-wide">
                <th className="px-6 py-4">Cliente / Empresa</th>
                <th className="px-6 py-4 hidden sm:table-cell">Contato</th>
                <th className="px-6 py-4 text-center hidden md:table-cell">Última Compra</th>
                <th className="px-6 py-4">Status / Inatividade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filtered.map(client => (
                <tr key={client.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => onSelectClient(client.id)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {client.avatar ? (
                        <img src={client.avatar} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 font-bold text-xs">{client.initials}</div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors">{client.name}</p>
                        <p className="text-xs text-slate-500">{client.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex flex-col">
                      <span className="text-slate-900 dark:text-white">{client.email}</span>
                      <span className="text-xs text-slate-500">{client.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-500 hidden md:table-cell">{client.lastPurchase}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${client.inactivityDays > 30
                      ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${client.inactivityDays > 30 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                      {client.inactivityDays} dias
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;
