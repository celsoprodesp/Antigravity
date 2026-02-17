
import React from 'react';
import { Client, Order } from '../types';

interface ProfilePageProps {
  client: Client;
  orders: Order[];
  onNewOrder: () => void;
  onEditClient: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ client, orders, onNewOrder, onEditClient }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto pb-10">
      {/* Profile Sidebar */}
      <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary mb-4">
            {client.initials}
          </div>
          <h2 className="text-xl font-bold">{client.name}</h2>
          <p className="text-sm text-slate-500 mb-4">{client.company}</p>
          <div className="flex gap-2 mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${client.status === 'ATIVO'
              ? 'bg-green-100 text-green-700 border-green-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
              {client.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
            </span>
            {client.classification === 'VIP' && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200">VIP</span>
            )}
            {client.classification === 'RISCO' && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-200">Risco</span>
            )}
          </div>

          <div className="w-full space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6 text-left">
            <div className="flex items-center gap-3 text-sm">
              <span className="material-icons-outlined text-slate-400">email</span>
              <span className="truncate">{client.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="material-icons-outlined text-slate-400">phone</span>
              <span>{client.phone}</span>
            </div>
          </div>
          <div className="w-full mt-6 space-y-3">
            <button
              onClick={onEditClient}
              className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-icons-round text-base">edit</span> Editar Cliente
            </button>
            <button
              onClick={onNewOrder}
              className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-medium shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-icons-round text-base">add</span> Novo Pedido
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Ticket Médio</p>
          <p className="text-2xl font-bold">R$ {orders.length > 0 ? Math.round(orders.reduce((acc, o) => acc + o.amount, 0) / orders.length).toLocaleString('pt-BR') : '0'}</p>
        </div>
      </div>

      {/* Main Stats and History */}
      <div className="lg:col-span-8 xl:col-span-9 space-y-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Histórico de Pedidos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-slate-500 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                  <th className="py-4">ID do Pedido</th>
                  <th className="py-4">Data</th>
                  <th className="py-4">Status</th>
                  <th className="py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50 dark:divide-slate-800">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 font-bold text-primary">{o.orderNumber}</td>
                    <td className="py-4 text-slate-500">{o.createdAt}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${o.status === 'CONCLUIDO' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 text-right font-bold">R$ {o.amount.toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 italic">Nenhum pedido registrado para este cliente.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
