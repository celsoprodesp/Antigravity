import React, { useState } from 'react';
import { Client, Order, OrderStatus, Item, OrderItem, PagePermission } from '../types';
import { supabase } from '../supabaseClient';

interface NewOrderPageProps {
  clients: Client[];
  items: Item[];
  onCancel: () => void;
  onSave: (order: Order) => void;
  onNavigateNewClient: () => void;
  onNavigateNewItem: () => void;
  onEditClient: (id: string) => void;
  permission: PagePermission;
}

const NewOrderPage: React.FC<NewOrderPageProps> = ({
  clients, items, onCancel, onSave,
  onNavigateNewClient, onNavigateNewItem, onEditClient, permission
}) => {

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [status, setStatus] = useState<OrderStatus>('PENDENTE');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('PIX');

  const addItem = () => {
    const item = items.find(i => i.id === selectedItemId);
    if (!item) return;
    const existing = orderItems.find(oi => oi.itemId === item.id);
    if (existing) {
      setOrderItems(prev => prev.map(oi =>
        oi.itemId === item.id
          ? { ...oi, quantity: oi.quantity + quantity, total: (oi.quantity + quantity) * oi.unitPrice }
          : oi
      ));
    } else {
      setOrderItems(prev => [...prev, {
        itemId: item.id,
        itemName: item.name,
        quantity,
        unitPrice: item.unitPrice,
        total: quantity * item.unitPrice,
      }]);
    }
    setSelectedItemId('');
    setQuantity(1);
  };

  const removeItem = (itemId: string) => {
    setOrderItems(prev => prev.filter(oi => oi.itemId !== itemId));
  };

  const totalAmount = orderItems.reduce((acc, oi) => acc + oi.total, 0);

  const handleSave = async () => {
    if (!selectedClient) return alert('Selecione um cliente');
    if (orderItems.length === 0) return alert('Adicione pelo menos um item');

    const orderId = Math.random().toString(36).substr(2, 9);
    const orderNumber = `#ORD-${Math.floor(Math.random() * 10000)}`;

    const newOrder: Order = {
      id: orderId,
      orderNumber: orderNumber,
      clientName: selectedClient.name,
      description: orderItems.map(oi => `${oi.quantity}x ${oi.itemName}`).join(', '),
      status,
      amount: totalAmount,
      timeAgo: 'Agora',
      clientAvatar: selectedClient.avatar,
      clientInitials: selectedClient.initials,
      items: orderItems,
      paymentMethod,
    };

    // 1. Salvar o pedido (Order)
    const { error: orderError } = await supabase.from('orders').insert({
      id: newOrder.id,
      order_number: newOrder.orderNumber,
      client_name: newOrder.clientName,
      description: newOrder.description,
      status: newOrder.status,
      amount: newOrder.amount,
      time_ago: newOrder.timeAgo,
      client_avatar: newOrder.clientAvatar,
      client_initials: newOrder.clientInitials,
      payment_method: newOrder.paymentMethod
    });

    if (orderError) {
      alert('Erro ao salvar pedido: ' + orderError.message);
      return;
    }

    // 2. Salvar os itens do pedido (OrderItems)
    const dbItems = orderItems.map(oi => ({
      id: Math.random().toString(36).substr(2, 9),
      order_id: orderId,
      item_name: oi.itemName,
      quantity: oi.quantity,
      unit_price: oi.unitPrice,
      total: oi.total.toString() // assuming total is a string in OrderItem based on previous code or just good to keep consistent
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(dbItems);

    if (itemsError) {
      console.error('Erro ao salvar itens do pedido:', itemsError);
      alert('Pedido salvo, mas erro ao registrar os itens: ' + itemsError.message);
    }

    onSave(newOrder);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn h-full overflow-y-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Novo Pedido</h2>
          <p className="text-sm text-slate-500">Preencha os dados da venda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Dados do Cliente */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <span className="material-icons-outlined text-primary">person</span> Dados do Cliente
            </h3>
            <div className="flex gap-2">
              {selectedClient && (
                <button
                  onClick={() => onEditClient(selectedClient.id)}
                  className="text-slate-400 hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium"
                  title="Editar cliente selecionado"
                >
                  <span className="material-icons-round text-base">edit</span> Editar
                </button>
              )}
              <button
                onClick={onNavigateNewClient}
                className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1 transition-colors whitespace-nowrap"
              >
                <span className="material-icons-round text-base">add_circle</span> Novo Cliente
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Selecionar Cliente</label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={selectedClient?.id || ''}
              onChange={(e) => setSelectedClient(clients.find(c => c.id === e.target.value) || null)}
            >
              <option value="">Selecione...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
            </select>
          </div>

          {selectedClient && (
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                {selectedClient.initials}
              </div>
              <div>
                <p className="font-bold">{selectedClient.name}</p>
                <p className="text-xs text-slate-500">{selectedClient.email}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Status Inicial</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="PENDENTE">Pendente</option>
              <option value="PREPARACAO">Preparação</option>
              <option value="ENVIADO">Enviado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Forma de Pagamento</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Cartão de Débito">Cartão de Débito</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="PIX">PIX</option>
              <option value="Boleto">Boleto</option>
            </select>
          </div>
        </section>

        {/* Itens do Pedido */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <span className="material-icons-outlined text-primary">shopping_cart</span> Itens do Pedido
            </h3>
            <button
              onClick={onNavigateNewItem}
              className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1 transition-colors"
            >
              <span className="material-icons-round text-base">add_circle</span> Cadastrar Item
            </button>
          </div>

          {/* Adicionar Item */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1 text-slate-500">Item</label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Selecione um item...</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.name} - R$ {i.unitPrice.toLocaleString('pt-BR')}</option>)}
              </select>
            </div>
            <div className="w-20">
              <label className="block text-xs font-medium mb-1 text-slate-500">Qtd</label>
              <input
                type="number" min="1" value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <button
              onClick={addItem}
              disabled={!selectedItemId}
              className="bg-primary hover:bg-primary-dark disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm"
            >
              <span className="material-icons-round text-base">add</span>
            </button>
          </div>

          {/* Tabela de Itens */}
          {orderItems.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="text-left px-4 py-3">Item</th>
                    <th className="text-center px-2 py-3">Qtd</th>
                    <th className="text-right px-3 py-3">Unit.</th>
                    <th className="text-right px-3 py-3">Total</th>
                    <th className="text-center px-2 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {orderItems.map(oi => (
                    <tr key={oi.itemId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium truncate max-w-[160px]">{oi.itemName}</td>
                      <td className="px-2 py-3 text-center text-slate-600 dark:text-slate-400">{oi.quantity}</td>
                      <td className="px-3 py-3 text-right text-slate-500">R$ {oi.unitPrice.toLocaleString('pt-BR')}</td>
                      <td className="px-3 py-3 text-right font-semibold">R$ {oi.total.toLocaleString('pt-BR')}</td>
                      <td className="px-2 py-3 text-center">
                        <button onClick={() => removeItem(oi.itemId)} className="text-red-400 hover:text-red-600 transition-colors">
                          <span className="material-icons-round text-base">close</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 flex justify-between items-center border-t border-slate-200 dark:border-slate-700">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total do Pedido</span>
                <span className="text-lg font-bold text-primary">R$ {totalAmount.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <span className="material-icons-outlined text-4xl mb-2 block">inventory_2</span>
              <p className="text-sm">Nenhum item adicionado</p>
              <p className="text-xs mt-1">Use o seletor acima para adicionar itens ao pedido</p>
            </div>
          )}
        </section>
      </div>

      <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
        <button onClick={onCancel} className="flex-1 px-8 py-4 rounded-xl font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancelar Pedido</button>
        {permission.canWrite ? (
          <button onClick={handleSave} className="flex-[2] bg-primary hover:bg-primary-dark text-white px-10 py-4 rounded-xl font-bold shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2">
            <span className="material-icons-round">check_circle</span>
            Finalizar e Salvar Pedido
          </button>
        ) : (
          <button disabled className="flex-[2] bg-slate-200 text-slate-500 px-10 py-4 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2">
            <span className="material-icons-round">lock</span>
            Sem Permissão para Salvar
          </button>
        )}
      </div>
    </div>
  );
};

export default NewOrderPage;
