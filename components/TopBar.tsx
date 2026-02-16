
import React from 'react';

interface TopBarProps {
  onSearch: (query: string) => void;
  onSignOut: () => void;
  toggleMobileMenu: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onSearch, onSignOut, toggleMobileMenu }) => {
  return (
    <header className="h-20 px-4 md:px-8 flex items-center justify-between shrink-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileMenu}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <span className="material-icons-round">menu</span>
        </button>
        <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">ERP Minimalista</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block group">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
          <input
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearch(e.currentTarget.value);
              }
            }}
            className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64 transition-all shadow-sm"
            placeholder="Buscar páginas (Enter)..."
            type="text"
          />
        </div>

        <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-800 transition-all relative">
          <span className="material-icons-outlined">notifications</span>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-background-dark"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

        <button onClick={onSignOut} className="text-sm text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1 font-medium whitespace-nowrap">
          <span className="material-icons-outlined text-base">logout</span> <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
