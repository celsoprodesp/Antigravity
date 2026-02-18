import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';

interface SearchOrdersPageProps {
    orders: Order[];
    onViewOrder?: (order: Order) => void;
    onEditOrder?: (id: string) => void;
    onCancel: () => void;
}

const SearchOrdersPage: React.FC<SearchOrdersPageProps> = ({ orders, onCancel, onEditOrder }) => {
    const [clientFilter, setClientFilter] = useState('');
    const [orderFilter, setOrderFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const filteredOrders = orders.filter(order => {
        const matchesClient = order.clientName.toLowerCase().includes(clientFilter.toLowerCase());
        const matchesOrderNum = order.orderNumber.toLowerCase().includes(orderFilter.toLowerCase());
        const matchesStatus = statusFilter === '' || order.status === statusFilter;

        // Date range filtering
        let matchesDate = true;
        if (order.createdAt) {
            const [day, month, year] = order.createdAt.split('/').map(Number);
            const orderDate = new Date(year, month - 1, day);
            orderDate.setHours(0, 0, 0, 0);

            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                if (orderDate < start) matchesDate = false;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(0, 0, 0, 0);
                if (orderDate > end) matchesDate = false;
            }
        }

        return matchesClient && matchesOrderNum && matchesStatus && matchesDate;
    });

    const handleClear = () => {
        setClientFilter('');
        setOrderFilter('');
        setStartDate('');
        setEndDate('');
        setStatusFilter('');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-10">
            {/* Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-slideUp border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-icons-round text-2xl">receipt_long</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{selectedOrder.orderNumber}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white ${selectedOrder.status === 'PENDENTE' ? 'bg-amber-500' :
                                            selectedOrder.status === 'PREPARACAO' ? 'bg-primary' :
                                                selectedOrder.status === 'ENVIADO' ? 'bg-purple-500' :
                                                    selectedOrder.status === 'CONCLUIDO' ? 'bg-emerald-500' :
                                                        'bg-rose-500'
                                            }`}>
                                            {selectedOrder.status}
                                        </span>
                                        <span className="text-xs text-slate-400">• {selectedOrder.timeAgo}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                            >
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>

                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Cliente</h4>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold">
                                            {selectedOrder.clientName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700 dark:text-slate-200">{selectedOrder.clientName}</p>
                                            <p className="text-xs text-slate-400">{selectedOrder.paymentMethod || 'Pagamento na entrega'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Total do Pedido</h4>
                                    <p className="text-3xl font-black text-primary tracking-tighter">R$ {selectedOrder.amount.toLocaleString('pt-BR')}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Produtos</h4>
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-800 rounded text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700">
                                                    {item.quantity}x
                                                </span>
                                                <span className="font-medium text-slate-600 dark:text-slate-300">{item.itemName}</span>
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-slate-200">R$ {item.total?.toLocaleString('pt-BR')}</span>
                                        </div>
                                    )) || (
                                            <p className="text-xs text-slate-500 italic px-2">{selectedOrder.description}</p>
                                        )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 transition-all"
                            >
                                Concluir Visualização
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Pesquisar Pedido</h2>
                    <p className="text-sm text-slate-500">Filtre seus pedidos por número, cliente ou data</p>
                </div>
                <button onClick={onCancel} className="px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    Voltar
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2 ml-1">Pedido</label>
                        <input
                            type="text"
                            placeholder="Número..."
                            value={orderFilter}
                            onChange={(e) => setOrderFilter(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2 ml-1">Cliente</label>
                        <input
                            type="text"
                            placeholder="Nome do cliente..."
                            value={clientFilter}
                            onChange={(e) => setClientFilter(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2 ml-1">Data Início</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2 ml-1">Data Fim</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                </div>
                {startDate && endDate && startDate > endDate && (
                    <div className="flex items-center gap-2 text-rose-500 text-xs font-semibold animate-pulse ml-1">
                        <span className="material-icons-round text-sm">warning</span>
                        Data início não pode ser maior que a data fim
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="w-full sm:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
                            className="w-full sm:w-48 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                        >
                            <option value="">Todos os Status</option>
                            <option value="PENDENTE">Pendente</option>
                            <option value="PREPARACAO">Em Preparação</option>
                            <option value="ENVIADO">Enviado</option>
                            <option value="CONCLUIDO">Concluído</option>
                            <option value="CANCELADO">Cancelado</option>
                        </select>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={handleClear}
                            className="flex-1 sm:flex-none px-6 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                <th className="px-6 py-4">Pedido</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Valor</th>
                                <th className="px-6 py-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs font-bold">{order.orderNumber}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                                                    {order.clientName.charAt(0)}
                                                </div>
                                                <span className="font-medium">{order.clientName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{order.createdAt || order.timeAgo}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${order.status === 'PENDENTE' ? 'bg-amber-100 text-amber-600' :
                                                order.status === 'PREPARACAO' ? 'bg-blue-100 text-blue-600' :
                                                    order.status === 'ENVIADO' ? 'bg-purple-100 text-purple-600' :
                                                        order.status === 'CONCLUIDO' ? 'bg-emerald-100 text-emerald-600' :
                                                            'bg-rose-100 text-rose-600'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold">R$ {order.amount.toLocaleString('pt-BR')}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                                                    title="Visualizar"
                                                >
                                                    <span className="material-icons-round text-lg">visibility</span>
                                                </button>
                                                <button
                                                    onClick={() => onEditOrder?.(order.id)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-all"
                                                    title="Editar"
                                                >
                                                    <span className="material-icons-round text-lg">edit</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                                        Nenhum pedido encontrado com os filtros selecionados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SearchOrdersPage;
