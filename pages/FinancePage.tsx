import React, { useState } from 'react';
import { Transaction } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleGenAI } from "@google/genai";

const DATA = [
  { name: '01 Out', receita: 4000, despesa: 2400 },
  { name: '05 Out', receita: 7000, despesa: 3000 },
  { name: '10 Out', receita: 12000, despesa: 4500 },
  { name: '15 Out', receita: 15000, despesa: 5000 },
  { name: '20 Out', receita: 22000, despesa: 7000 },
  { name: '25 Out', receita: 38000, despesa: 8500 },
  { name: '30 Out', receita: 48250, despesa: 12840 },
];

interface FinancePageProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const FinancePage: React.FC<FinancePageProps> = ({ transactions, setTransactions }) => {
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

  const categories = [...new Set(transactions.map(t => t.category))];

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
        contents: `Analise estes dados financeiros do ERP e forneça 3 insights estratégicos curtos em português:
        Receita Total: R$ 48.250,00
        Despesa Total: R$ 12.840,00
        Últimas transações: ${JSON.stringify(transactions)}`,
        config: {
          systemInstruction: "Você é um Analista de BI especialista em finanças para pequenas e médias empresas."
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

  const handleAddTransaction = () => {
    if (!newDesc || !newCategory || newAmount <= 0) return alert('Preencha todos os campos');
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}, ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: dateStr,
      description: newDesc,
      category: newCategory,
      status: 'PENDENTE',
      amount: newAmount,
      type: newType,
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setNewDesc('');
    setNewCategory('');
    setNewAmount(0);
    setNewType('RECEITA');
    setShowNewModal(false);
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
                <span className="material-icons-outlined text-primary">receipt_long</span> Novo Lançamento
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

              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <input
                  value={newCategory} onChange={e => setNewCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Ex: Vendas, Infraestrutura..."
                  list="categories-list"
                />
                <datalist id="categories-list">
                  {categories.map(cat => <option key={cat} value={cat} />)}
                </datalist>
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
          <h3 className="text-2xl font-bold">R$ 48.250,00</h3>
          <span className="text-xs text-green-500 font-medium">+12.5% vs mês anterior</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Despesas Totais</p>
          <h3 className="text-2xl font-bold">R$ 12.840,00</h3>
          <span className="text-xs text-red-500 font-medium">+3.2% vs mês anterior</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Saldo Líquido</p>
          <h3 className="text-2xl font-bold text-emerald-500">R$ 35.410,00</h3>
          <span className="text-xs text-slate-400">Margem de lucro de 73%</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-lg font-bold mb-6">Evolução da Receita</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DATA}>
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
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
