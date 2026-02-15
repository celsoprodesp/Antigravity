
import React from 'react';

interface SettingsPageProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ isDarkMode, setIsDarkMode }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div>
        <h2 className="text-2xl font-bold">Configurações</h2>
        <p className="text-sm text-slate-500">Personalize sua experiência no ERP</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 space-y-10">
          <section>
            <h3 className="text-lg font-bold mb-6">Aparência</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setIsDarkMode(false)}
                className={`p-4 rounded-xl border-2 transition-all ${!isDarkMode ? 'border-primary bg-primary/5 shadow-md' : 'border-slate-100 dark:border-slate-800'}`}
              >
                <div className="h-20 bg-slate-100 rounded mb-3 flex items-center justify-center">
                   <span className="material-icons text-slate-400">light_mode</span>
                </div>
                <span className="font-bold">Claro</span>
              </button>
              <button 
                onClick={() => setIsDarkMode(true)}
                className={`p-4 rounded-xl border-2 transition-all ${isDarkMode ? 'border-primary bg-primary/5 shadow-md' : 'border-slate-100 dark:border-slate-800'}`}
              >
                <div className="h-20 bg-slate-800 rounded mb-3 flex items-center justify-center">
                   <span className="material-icons text-slate-500">dark_mode</span>
                </div>
                <span className="font-bold">Escuro</span>
              </button>
            </div>
          </section>

          <section>
             <h3 className="text-lg font-bold mb-6">Notificações</h3>
             <div className="space-y-4">
               {[
                 { label: 'Alertas de Estoque Baixo', checked: true },
                 { label: 'Novos Pedidos Pendentes', checked: true },
                 { label: 'Relatórios Semanais por E-mail', checked: false },
               ].map((item, idx) => (
                 <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="font-medium">{item.label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={item.checked} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                 </div>
               ))}
             </div>
          </section>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button className="px-6 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors">Cancelar</button>
            <button className="bg-primary text-white px-8 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20">Salvar Alterações</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
