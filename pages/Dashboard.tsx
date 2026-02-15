
import React from 'react';
import { Order, OrderStatus } from '../../types';

interface DashboardProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onNewOrder: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ orders, setOrders, onNewOrder }) => {
  const columns: { title: string; status: OrderStatus; color: string }[] = [
    { title: 'Pendente', status: 'PENDENTE', color: 'amber' },
    { title: 'Em Preparação', status: 'PREPARACAO', color: 'primary' },
    { title: 'Enviado', status: 'ENVIADO', color: 'purple' },
    { title: 'Concluído', status: 'CONCLUIDO', color: 'emerald' },
  ];

  const updateStatus = (id: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold">Fluxo de Pedidos</h2>
          <p className="text-sm text-slate-500">Gerencie a logística em tempo real</p>
        </div>
        <button onClick={onNewOrder} className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
          <span className="material-icons-round text-lg">add</span> Novo Pedido
        </button>
      </div>

      {/* Cards com barra de rolagem horizontal */}
      <div className="flex gap-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
        <div className="min-w-[260px] flex-shrink-0 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-icons-round text-primary text-xl">receipt_long</span>
            </div>
            <p className="text-sm text-slate-500">Total de Pedidos</p>
          </div>
          <h3 className="text-2xl font-bold">{orders.length}</h3>
        </div>
        <div className="min-w-[260px] flex-shrink-0 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <span className="material-icons-round text-amber-500 text-xl">schedule</span>
            </div>
            <p className="text-sm text-slate-500">Receita Pendente</p>
          </div>
          <h3 className="text-2xl font-bold">R$ {orders.filter(o => o.status !== 'CONCLUIDO').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('pt-BR')}</h3>
        </div>
        <div className="min-w-[260px] flex-shrink-0 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <span className="material-icons-round text-emerald-500 text-xl">check_circle</span>
            </div>
            <p className="text-sm text-slate-500">Pedidos Concluídos</p>
          </div>
          <h3 className="text-2xl font-bold text-emerald-500">{orders.filter(o => o.status === 'CONCLUIDO').length}</h3>
        </div>
        <div className="min-w-[260px] flex-shrink-0 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <span className="material-icons-round text-purple-500 text-xl">local_shipping</span>
            </div>
            <p className="text-sm text-slate-500">Em Trânsito</p>
          </div>
          <h3 className="text-2xl font-bold text-purple-500">{orders.filter(o => o.status === 'ENVIADO').length}</h3>
        </div>
        <div className="min-w-[260px] flex-shrink-0 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <span className="material-icons-round text-blue-500 text-xl">attach_money</span>
            </div>
            <p className="text-sm text-slate-500">Valor Total</p>
          </div>
          <h3 className="text-2xl font-bold">R$ {orders.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('pt-BR')}</h3>
        </div>
      </div>

      {/* Kanban columns com barra de rolagem horizontal */}
      <div className="flex-1 overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
        <div className="flex gap-6 min-w-max h-full">
          {columns.map(col => (
            <div key={col.status} className="min-w-[320px] w-[320px] flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full bg-${col.color === 'primary' ? 'primary' : col.color + '-400'}`}></div>
                  <span className="font-semibold text-sm">{col.title}</span>
                  <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {orders.filter(o => o.status === col.status).length}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {orders.filter(o => o.status === col.status).map(order => (
                  <div key={order.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-mono text-slate-400">{order.orderNumber}</span>
                    </div>
                    <h4 className="font-medium mb-1">{order.clientName}</h4>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">{order.description}</p>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        {order.clientAvatar ? (
                          <img src={order.clientAvatar} className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                            {order.clientInitials}
                          </div>
                        )}
                        <span className="text-xs text-slate-400">{order.timeAgo}</span>
                      </div>
                      <span className="text-sm font-semibold">R$ {order.amount.toLocaleString('pt-BR')}</span>
                    </div>

                    <div className="mt-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {columns.filter(c => c.status !== order.status).map(c => (
                        <button
                          key={c.status}
                          onClick={(e) => { e.stopPropagation(); updateStatus(order.id, c.status); }}
                          className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white px-2 py-1 rounded transition-colors"
                        >
                          {c.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
