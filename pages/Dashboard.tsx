import React from 'react';
import { Order, OrderStatus } from '../types';
import { supabase } from '../supabaseClient';

interface DashboardProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onNewOrder: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ orders, setOrders, onNewOrder }) => {
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToColumn = (status: string) => {
    const element = document.getElementById(`column-${status}`);
    if (element && scrollContainerRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const columns: { title: string; status: OrderStatus; color: string }[] = [
    { title: 'Pendente', status: 'PENDENTE', color: 'amber' },
    { title: 'Em Preparação', status: 'PREPARACAO', color: 'primary' },
    { title: 'Enviado', status: 'ENVIADO', color: 'purple' },
    { title: 'Concluído', status: 'CONCLUIDO', color: 'emerald' },
  ];

  const updateStatus = async (id: string, newStatus: OrderStatus) => {
    // Update local state for immediate feedback
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));

    // Update Supabase
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert('Erro ao atualizar status: ' + error.message);
      // Optional: rollback local state on error
    }
  };

  return (
    <div className="space-y-8 min-h-full flex flex-col">
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
      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
        {columns.map(col => {
          const stats = orders.filter(o => o.status === col.status);
          const totalAmount = stats.reduce((acc, curr) => acc + curr.amount, 0);
          return (
            <div
              key={col.status}
              onClick={() => scrollToColumn(col.status)}
              className="min-w-[200px] flex-shrink-0 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg bg-${col.color === 'primary' ? 'primary' : col.color + '-500'}/10 flex items-center justify-center`}>
                  <span className={`material-icons-round text-${col.color === 'primary' ? 'primary' : col.color + '-500'} text-base`}>
                    {col.status === 'PENDENTE' ? 'schedule' : col.status === 'PREPARACAO' ? 'inventory_2' : col.status === 'ENVIADO' ? 'local_shipping' : 'check_circle'}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-primary transition-colors">{col.title}</p>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Pedidos:</span>
                  <span className="font-bold">{stats.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Receita:</span>
                  <span className={`font-bold text-${col.color === 'primary' ? 'primary' : col.color + '-500'}`}>R$ {totalAmount.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
          );
        })}
        {/* Total Geral */}
        <div className="min-w-[180px] flex-shrink-0 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Total Consolidado</p>
          <div className="space-y-1">
            <p className="text-lg font-black text-slate-900 dark:text-white leading-none">R$ {orders.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('pt-BR')}</p>
            <p className="text-[10px] text-slate-400 font-medium">{orders.length} pedidos no total</p>
          </div>
        </div>
      </div>

      {/* Kanban columns com barra de rolagem horizontal */}
      <div ref={scrollContainerRef} className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-4 min-w-max h-full">
          {columns.map(col => (
            <div key={col.status} id={`column-${col.status}`} className="min-w-[260px] w-[260px] flex flex-col h-full scroll-mt-20">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-${col.color === 'primary' ? 'primary' : col.color + '-400'}`}></div>
                  <span className="font-bold text-[13px] uppercase tracking-tight text-slate-600 dark:text-slate-400">{col.title}</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                    {orders.filter(o => o.status === col.status).length}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[460px] custom-scrollbar pb-2">
                {orders.filter(o => o.status === col.status).map(order => (
                  <div key={order.id} onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }} className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-[9px] font-mono text-slate-400 tracking-tighter">{order.orderNumber}</span>
                    </div>
                    <h4 className="text-[13px] font-bold mb-0.5 leading-tight">{order.clientName}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mb-2 leading-tight">{order.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        {order.clientAvatar ? (
                          <img src={order.clientAvatar} className="w-5 h-5 rounded-full" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[8px] font-bold text-indigo-600">
                            {order.clientInitials}
                          </div>
                        )}
                        <span className="text-[9px] text-slate-400 tracking-tighter">{order.timeAgo}</span>
                      </div>
                      <span className="text-[12px] font-black tracking-tight">R$ {order.amount.toLocaleString('pt-BR')}</span>
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

      {/* Modal de Detalhes do Pedido */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-lg font-bold">Detalhes do Pedido</h3>
                <p className="text-xs font-mono text-slate-500">{selectedOrder.orderNumber}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <span className="material-icons-round">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Status e Info Geral */}
              <div className="flex justify-between items-center p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {selectedOrder.clientInitials}
                  </div>
                  <div>
                    <p className="font-bold">{selectedOrder.clientName}</p>
                    <p className="text-xs text-slate-500">{selectedOrder.timeAgo}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedOrder.status === 'CONCLUIDO' ? 'bg-emerald-500 text-white' : 'bg-primary text-white'}`}>
                  {selectedOrder.status}
                </span>
              </div>

              {/* Itens */}
              <div>
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <span className="material-icons-round text-primary text-sm">shopping_basket</span>
                  Itens do Pedido
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0 text-sm">
                      <div>
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-xs text-slate-400">{item.quantity}x R$ {item.unitPrice.toLocaleString('pt-BR')}</p>
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300">R$ {item.total.toLocaleString('pt-BR')}</span>
                    </div>
                  ))}
                  {!selectedOrder.items && <p className="text-sm text-slate-500 italic">{selectedOrder.description}</p>}
                </div>
              </div>

              {/* Pagamento */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-500">Forma de Pagamento</span>
                  <span className="text-sm font-medium">{selectedOrder.paymentMethod || 'Não informado'}</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold pt-2">
                  <span>Total</span>
                  <span className="text-primary">R$ {selectedOrder.amount.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
              <button onClick={() => setShowDetailModal(false)} className="flex-1 py-3 rounded-xl font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
