
import React from 'react';
import { ViewType } from '../../types';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const menuItems: { icon: string; view: ViewType; label: string; group?: boolean }[] = [
    { icon: 'dashboard', view: 'DASHBOARD', label: 'Dashboard' },
    { icon: 'shopping_bag', view: 'NEW_ORDER', label: 'Novo Pedido' },
    { icon: 'people', view: 'CLIENTS', label: 'Clientes' },
    { icon: 'account_balance_wallet', view: 'FINANCE', label: 'Financeiro' },
    { icon: 'inventory_2', view: 'REGISTER_ITEM', label: 'Itens', group: true },
    { icon: 'category', view: 'REGISTER_CATEGORY', label: 'Categorias' },
    { icon: 'admin_panel_settings', view: 'ADMIN', label: 'Administração', group: true },
    { icon: 'settings', view: 'SETTINGS', label: 'Configurações' },
  ];

  return (
    <aside className="w-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-6 h-full z-20 shadow-sm shrink-0">
      <div className="mb-8 w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer" onClick={() => onNavigate('DASHBOARD')}>
        <span className="text-white font-bold text-lg">E</span>
      </div>

      <nav className="flex-1 w-full flex flex-col items-center gap-4 px-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {menuItems.map((item, idx) => (
          <React.Fragment key={item.view}>
            {item.group && <div className="h-px w-8 bg-slate-200 dark:bg-slate-700 my-2" />}
            <button
              onClick={() => onNavigate(item.view)}
              className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 group relative ${currentView === item.view
                ? 'bg-primary/10 text-primary'
                : 'text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
            >
              <span className="material-icons-round text-[24px]">{item.icon}</span>
              <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {item.label}
              </span>
            </button>
          </React.Fragment>
        ))}
      </nav>

      <div className="mt-auto">
        <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm hover:border-primary transition-colors duration-200 relative group">
          <img alt="User" className="w-full h-full object-cover" src="https://picsum.photos/seed/user/100" />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
