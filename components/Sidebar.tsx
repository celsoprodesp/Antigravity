
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType, id?: string) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  user: { id: string; name: string; email: string; avatar?: string } | null;
  onEditCurrentUser: () => void;
  checkPermission: (view: ViewType) => { canRead: boolean; canWrite: boolean };
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isExpanded, setIsExpanded, user, onEditCurrentUser, checkPermission }) => {

  const menuItems: { icon: string; view: ViewType; label: string; group?: boolean }[] = [
    { icon: 'dashboard', view: 'DASHBOARD' as ViewType, label: 'Dashboard' },
    { icon: 'shopping_bag', view: 'NEW_ORDER' as ViewType, label: 'Novo Pedido' },
    { icon: 'people', view: 'CLIENTS' as ViewType, label: 'Clientes' },
    { icon: 'account_balance_wallet', view: 'FINANCE' as ViewType, label: 'Financeiro' },
    { icon: 'inventory_2', view: 'REGISTER_ITEM' as ViewType, label: 'Itens', group: true },
    { icon: 'category', view: 'REGISTER_CATEGORY' as ViewType, label: 'Categorias' },
    { icon: 'admin_panel_settings', view: 'ADMIN' as ViewType, label: 'Administração', group: true },
    { icon: 'settings', view: 'SETTINGS' as ViewType, label: 'Configurações' },
  ].filter(item => {
    const perm = checkPermission(item.view);
    return perm.canRead || perm.canWrite;
  });

  return (
    <aside className={`${isExpanded ? 'w-80' : 'w-20'} h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-6 z-20 shadow-sm shrink-0 transition-all duration-300 ease-in-out relative`}>
      {/* Close button for mobile */}
      <button
        onClick={() => onNavigate('DASHBOARD')} // This is just to trigger the closing logic in App.tsx if needed, or we can add a specific onClose
        className="md:hidden absolute top-4 right-4 text-slate-400 hover:text-primary transition-colors"
      >
        <span className="material-icons-round">close</span>
      </button>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-md z-30 text-slate-400 hover:text-primary transition-colors hidden md:block"
      >
        <span className="material-icons-round text-sm">{isExpanded ? 'chevron_left' : 'chevron_right'}</span>
      </button>

      <div className={`mb-8 ${isExpanded ? 'w-56 px-4 flex items-center gap-3' : 'w-10 h-10 flex items-center justify-center'} bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg shadow-primary/20 cursor-pointer transition-all duration-300`} onClick={() => onNavigate('DASHBOARD')}>
        <div className="w-10 h-10 shrink-0 flex items-center justify-center">
          <span className="text-white font-bold text-lg">E</span>
        </div>
        {isExpanded && <span className="text-white font-bold text-sm tracking-tighter whitespace-nowrap overflow-hidden">ERP MINIMALISTA</span>}
      </div>

      <nav className={`flex-1 w-full flex flex-col ${isExpanded ? 'items-start px-4' : 'items-center px-2'} gap-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent transition-all duration-300`}>

        {menuItems.map((item, idx) => (
          <React.Fragment key={item.view}>
            {item.group && <div className="h-px w-8 bg-slate-200 dark:bg-slate-700 my-2" />}
            <button
              onClick={() => onNavigate(item.view)}
              className={`w-full ${isExpanded ? 'px-3 py-2.5 flex items-center gap-3' : 'w-12 h-12 flex items-center justify-center'} rounded-xl transition-all duration-200 group relative ${currentView === item.view
                ? 'bg-primary/10 text-primary'
                : 'text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
            >
              <span className="material-icons-round text-[24px]">{item.icon}</span>
              {isExpanded ? (
                <span className="font-medium text-sm whitespace-nowrap overflow-hidden">{item.label}</span>
              ) : (
                <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                  {item.label}
                </span>
              )}
            </button>
          </React.Fragment>
        ))}
      </nav>

      <div className={`mt-auto w-full ${isExpanded ? 'px-4' : 'flex justify-center'}`}>
        <div
          onClick={() => onEditCurrentUser()}
          className={`flex items-center gap-3 p-2 rounded-xl border border-transparent cursor-pointer ${isExpanded ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'hover:scale-110'} transition-all`}
        >
          <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm hover:border-primary transition-colors duration-200 shrink-0 relative bg-slate-200 dark:bg-slate-700">
            {user?.avatar ? (
              <img alt="User" className="w-full h-full object-cover" src={user.avatar} />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </button>
          {isExpanded && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate leading-none mb-1">
                {user?.name || 'Carregando...'}
              </p>
              <p className="text-[10px] text-slate-500 truncate leading-none">
                {user?.email || ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
