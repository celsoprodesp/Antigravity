import React, { useState } from 'react';
import { Transaction } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../supabaseClient';

// DATA removed in favor of dynamic calculation

interface FinancePageProps {
  transactions: Transaction[];
  transactionCategories: any[];
  onSave: () => void;
}

const FinancePage: React.FC<FinancePageProps> = ({ transactions, transactionCategories, onSave }) => {
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ category: '', dateFrom: '', dateTo: '' });

  // New transaction form
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState(0);
  const [newType, setNewType] = useState<'RECEITA' | 'DESPESA'>('RECEITA');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);


  const filteredTransactions = transactions.filter(t => {
    if (appliedFilters.category && t.category !== appliedFilters.category) return false;

    // Filtro de Data
    if (appliedFilters.dateFrom || appliedFilters.dateTo) {
      // Converter data da transação "DD/MM, HH:mm" para objeto Date para comparação
      // Assumindo ano atual para simplificação, já que o formato não tem ano
      const currentYear = new Date().getFullYear();

      // Parse robusto da data (suporta "Hoje", "Ontem", "DD MMM", "DD/MM")
      let transDate: Date | null = null;
      const dateStr = t.date.split(',')[0].trim(); // Pega a parte da data antes da vírgula (se houver)

      if (dateStr.toLowerCase() === 'hoje') {
        transDate = new Date();
        transDate.setHours(0, 0, 0, 0);
      } else if (dateStr.toLowerCase() === 'ontem') {
        transDate = new Date();
        transDate.setDate(transDate.getDate() - 1);
        transDate.setHours(0, 0, 0, 0);
      } else {
        // Tenta formatos numéricos e textuais
        const parts = dateStr.split(/[\/\s]+/); // Divide por / ou espaço
        if (parts.length >= 2) {
          const day = parseInt(parts[0]);
          let monthIndex = -1;

          // Mapa de meses abreviados (ajuste conforme necessario)
          const monthsMap: { [key: string]: number } = {
            'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5,
            'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11
          };

          if (isNaN(parseInt(parts[1]))) {
            // Formato DD MMM (ex: 28 Out)
            const monthStr = parts[1].toLowerCase().substring(0, 3);
            monthIndex = monthsMap[monthStr] !== undefined ? monthsMap[monthStr] : -1;
          } else {
            // Formato DD/MM
            monthIndex = parseInt(parts[1]) - 1;
          }

          if (day > 0 && monthIndex >= 0) {
            transDate = new Date(currentYear, monthIndex, day);
          }
        }
      }

      if (transDate) {
        if (appliedFilters.dateFrom) {
          const fromDate = new Date(appliedFilters.dateFrom); // YYYY-MM-DD
          fromDate.setHours(0, 0, 0, 0);
          if (transDate < fromDate) return false;
        }

        if (appliedFilters.dateTo) {
          const toDate = new Date(appliedFilters.dateTo); // YYYY-MM-DD
          toDate.setHours(23, 59, 59, 999);
          if (transDate > toDate) return false;
        }
      }
    }

    return true;
  });

  // Agrupar transações por data para o gráfico
  const chartData = React.useMemo(() => {
    const dataMap = new Map<string, { name: string, receita: number, despesa: number }>();

    // Ordenar transações por data (assumindo formato string simples por enquanto, ideal seria converter para Date)
    const sorted = [...filteredTransactions].reverse(); // Assumindo que vêm do mais novo para o mais antigo

    sorted.forEach(t => {
      const dateKey = t.date.split(',')[0]; // Pega só a data DD/MM
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, { name: dateKey, receita: 0, despesa: 0 });
      }
      const entry = dataMap.get(dateKey)!;
      if (t.type === 'RECEITA') {
        entry.receita += t.amount;
      } else {
        entry.despesa += t.amount;
      }
    });

    return Array.from(dataMap.values());
  }, [filteredTransactions]);

  const handleSearch = () => {
    setAppliedFilters({ category: filterCategory, dateFrom: filterDateFrom, dateTo: filterDateTo });
  };

  const handleClear = () => {
    setFilterCategory('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setAppliedFilters({ category: '', dateFrom: '', dateTo: '' });
  };

  const getAiInsights = async () => {
    setLoadingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analise estes dados exclusivamente da tabela de lançamentos do ERP e forneça 3 insights estratégicos curtos em português:
        Dados: ${JSON.stringify(transactions)}`,
        config: {
          systemInstruction: "Você é um Analista Financeiro especialista. Sua análise deve se basear APENAS nos dados fornecidos da tabela de lançamentos."
        }
      });
      setAiInsights(response.text || "Sem insights no momento.");
    } catch (error) {
      console.error(error);
      setAiInsights("Erro ao carregar insights. Verifique se a API Key está configurada no arquivo .env.local");
    } finally {
      setLoadingAi(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!newDesc || !newCategory || newAmount <= 0) return alert('Preencha todos os campos');

    const trData = {
      description: newDesc,
      category: newCategory,
      status: 'CONFIRMADO',
      amount: newAmount,
      type: newType,
      date: newDate
    };

    if (editingTransaction) {
      const { error } = await supabase.from('transactions').update(trData).eq('id', editingTransaction.id);
      if (error) return alert('Erro ao atualizar lançamento: ' + error.message);
    } else {
      const { error } = await supabase.from('transactions').insert({
        id: Math.random().toString(36).substr(2, 9),
        ...trData
      });
      if (error) return alert('Erro ao salvar lançamento: ' + error.message);
    }

    onSave();
    setEditingTransaction(null);
    setNewDesc('');
    setNewCategory('');
    setNewAmount(0);
    setNewType('RECEITA');
    setNewDate(new Date().toISOString().split('T')[0]);
    setShowNewModal(false);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Deseja realmente excluir este lançamento?')) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) return alert(error.message);
    onSave();
  };

  const handleEditTransaction = (t: Transaction) => {
    setEditingTransaction(t);
    setNewDesc(t.description);
    setNewCategory(t.category);
    setNewAmount(t.amount);
    setNewType(t.type);
    // Assuming date format matches or we just use current date
    setNewDate(new Date().toISOString().split('T')[0]);
    setShowNewModal(true);
  };

  const handleAddCategory = async () => {
    if (!newCatName) return;
    const { error } = await supabase.from('transaction_categories').insert({
      id: Math.random().toString(36).substr(2, 9),
      name: newCatName
    });
    if (error) return alert(error.message);
    setNewCatName('');
    onSave();
  };

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase.from('transaction_categories').delete().eq('id', id);
    if (error) return alert(error.message);
    onSave();
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold">Fluxo de Caixa</h2>
          <p className="text-sm text-slate-500">Analytics e gestão financeira</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={getAiInsights}
            disabled={loadingAi}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-icons-round text-base">{loadingAi ? 'sync' : 'auto_awesome'}</span>
            <span>{loadingAi ? 'Analisando...' : 'Insights Estratégicos'}</span>
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <span className="material-icons-round text-base">add</span>
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Modal Novo Lançamento */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setShowNewModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-6 mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="material-icons-outlined text-primary">receipt_long</span> {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-icons-round">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <input
                  value={newDesc} onChange={e => setNewDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Ex: Pagamento fornecedor..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select
                    value={newType} onChange={e => setNewType(e.target.value as 'RECEITA' | 'DESPESA')}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="RECEITA">Receita</option>
                    <option value="DESPESA">Despesa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Valor (R$)</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={newAmount} onChange={e => setNewAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Categoria</label>
                  <div className="flex gap-2">
                    <select
                      value={newCategory} onChange={e => setNewCategory(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">Selecione...</option>
                      {transactionCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                    <button
                      onClick={() => setShowCategoryModal(true)}
                      className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-primary hover:bg-primary/10 transition-all"
                      title="Gerenciar Categorias"
                    >
                      <span className="material-icons-round text-base">add</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data</label>
                  <input
                    type="date"
                    value={newDate} onChange={e => setNewDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowNewModal(false)} className="px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
              <button onClick={handleAddTransaction} className="bg-primary hover:bg-primary-dark text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {aiInsights && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 p-4 rounded-xl text-emerald-800 dark:text-emerald-300 animate-fadeIn">
          <div className="flex gap-2 mb-2 font-bold items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-icons-round text-sm">auto_awesome</span>
              <span>Insights Estratégicos</span>
            </div>
            <button onClick={() => setAiInsights(null)} className="text-emerald-400 hover:text-emerald-600 transition-colors">
              <span className="material-icons-round text-base">close</span>
            </button>
          </div>
          <div className="text-sm whitespace-pre-wrap">{aiInsights}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Receita Total</p>
          <h3 className="text-2xl font-bold">R$ {transactions.filter(t => t.type === 'RECEITA').reduce((acc, t) => acc + t.amount, 0).toLocaleString('pt-BR')}</h3>
          <span className="text-xs text-green-500 font-medium">Lançamentos confirmados</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Despesas Totais</p>
          <h3 className="text-2xl font-bold">R$ {transactions.filter(t => t.type === 'DESPESA').reduce((acc, t) => acc + t.amount, 0).toLocaleString('pt-BR')}</h3>
          <span className="text-xs text-red-500 font-medium">Saídas registradas</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Saldo Líquido</p>
          <h3 className="text-2xl font-bold text-emerald-500">R$ {(transactions.filter(t => t.type === 'RECEITA').reduce((acc, t) => acc + t.amount, 0) - transactions.filter(t => t.type === 'DESPESA').reduce((acc, t) => acc + t.amount, 0)).toLocaleString('pt-BR')}</h3>
          <span className="text-xs text-slate-400">Diferença entre entradas e saídas</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-lg font-bold mb-6">Evolução da Receita</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#137fec" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#137fec" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="receita" stroke="#137fec" strokeWidth={3} fillOpacity={1} fill="url(#colorRec)" />
              <Area type="monotone" dataKey="despesa" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h3 className="font-bold">Últimos Lançamentos</h3>
            {/* Filtros */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 whitespace-nowrap">De:</label>
                <input
                  type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 whitespace-nowrap">Até:</label>
                <input
                  type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <select
                value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Todas Categorias</option>
                {transactionCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
              </select>
              <button
                onClick={handleSearch}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm flex items-center gap-1"
              >
                <span className="material-icons-round text-sm">search</span>
                <span>Pesquisar</span>
              </button>
              {(appliedFilters.category || appliedFilters.dateFrom || appliedFilters.dateTo) && (
                <button
                  onClick={handleClear}
                  className="text-xs text-primary hover:text-primary-dark font-medium transition-colors"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-slate-500">{t.date}</td>
                  <td className="px-6 py-4 font-medium">{t.description}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-xs">{t.category}</span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${t.type === 'RECEITA' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {t.type === 'RECEITA' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEditTransaction(t)} className="p-1.5 rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-all">
                        <span className="material-icons-round text-sm">edit</span>
                      </button>
                      <button onClick={() => handleDeleteTransaction(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                        <span className="material-icons-round text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal Gestão de Categorias */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] animate-fadeIn" onClick={() => setShowCategoryModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-6 mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Categorias de Lançamentos</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-icons-round">close</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da Categoria</label>
              <input
                value={newCatName} onChange={e => setNewCatName(e.target.value)}
                placeholder="Ex: Marketing, Viagens..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Categorias Atuais</p>
              {transactionCategories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="text-sm font-medium">{cat.name}</span>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <span className="material-icons-round text-sm">delete</span>
                  </button>
                </div>
              ))}
              <div className="pt-4">
                <button
                  onClick={handleAddCategory}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all"
                >
                  Salvar Categoria
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancePage;
