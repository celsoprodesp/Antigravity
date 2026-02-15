import React, { useState, useEffect } from 'react';
import { ViewType, Order, Client, Transaction, Item, ItemCategory, PagePermission, Profile, User } from '../types';
import { INITIAL_ORDERS, INITIAL_CLIENTS, INITIAL_TRANSACTIONS, INITIAL_ITEMS, INITIAL_CATEGORIES, INITIAL_PERMISSIONS, INITIAL_PROFILES, INITIAL_USERS } from './constants';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import FinancePage from './pages/FinancePage';
import NewOrderPage from './pages/NewOrderPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import RegisterClientPage from './pages/RegisterClientPage';
import RegisterItemPage from './pages/RegisterItemPage';
import RegisterCategoryPage from './pages/RegisterCategoryPage';
import AdminPage from './pages/AdminPage';
import RegisterProfilePage from './pages/RegisterProfilePage';
import RegisterUserPage from './pages/RegisterUserPage';
import LoginPage from './pages/LoginPage';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [previousView, setPreviousView] = useState<ViewType>('DASHBOARD');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [categories, setCategories] = useState<ItemCategory[]>(INITIAL_CATEGORIES);
  const [permissions, setPermissions] = useState<PagePermission[]>(INITIAL_PERMISSIONS);
  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleNavigate = (view: ViewType, id?: string) => {
    setPreviousView(currentView);
    setCurrentView(view);
    if (id) setSelectedClientId(id);
  };

  const goBack = () => {
    setCurrentView(previousView);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard orders={orders} setOrders={setOrders} onNewOrder={() => handleNavigate('NEW_ORDER')} />;
      case 'CLIENTS':
        return <ClientsPage
          clients={clients}
          onSelectClient={(id) => handleNavigate('CLIENT_PROFILE', id)}
          onNewClient={() => handleNavigate('REGISTER_CLIENT')}
        />;
      case 'FINANCE':
        return <FinancePage transactions={transactions} setTransactions={setTransactions} />;
      case 'NEW_ORDER':
        return <NewOrderPage
          clients={clients}
          items={items}
          onCancel={() => handleNavigate('DASHBOARD')}
          onSave={(newOrder) => {
            setOrders([newOrder, ...orders]);
            handleNavigate('DASHBOARD');
          }}
          onNavigateNewClient={() => handleNavigate('REGISTER_CLIENT')}
          onNavigateNewItem={() => handleNavigate('REGISTER_ITEM')}
        />;
      case 'CLIENT_PROFILE':
        const client = clients.find(c => c.id === selectedClientId) || clients[0];
        return <ProfilePage
          client={client}
          orders={orders.filter(o => o.clientName.includes(client.name) || o.clientName.includes(client.company))}
          onNewOrder={() => handleNavigate('NEW_ORDER')}
          onEditClient={() => handleNavigate('REGISTER_CLIENT')}
        />;
      case 'SETTINGS':
        return <SettingsPage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
      case 'REGISTER_CLIENT':
        return <RegisterClientPage
          onSave={(newClient) => {
            setClients(prev => [...prev, newClient]);
            goBack();
          }}
          onCancel={goBack}
        />;
      case 'REGISTER_ITEM':
        return <RegisterItemPage
          items={items}
          categories={categories}
          onSave={(newItem) => {
            setItems(prev => [...prev, newItem]);
          }}
          onCancel={goBack}
          onNavigateCategory={() => handleNavigate('REGISTER_CATEGORY')}
        />;
      case 'REGISTER_CATEGORY':
        return <RegisterCategoryPage
          categories={categories}
          onSave={(newCategory) => {
            setCategories(prev => [...prev, newCategory]);
          }}
          onCancel={goBack}
        />;
      case 'ADMIN':
        return <AdminPage
          permissions={permissions}
          setPermissions={setPermissions}
          profiles={profiles}
          users={users}
          onCancel={() => handleNavigate('DASHBOARD')}
          onNavigateRegisterProfile={() => handleNavigate('REGISTER_PROFILE')}
          onNavigateRegisterUser={() => handleNavigate('REGISTER_USER')}
        />;
      case 'REGISTER_PROFILE':
        return <RegisterProfilePage
          profiles={profiles}
          onSave={(newProfile) => {
            setProfiles(prev => [...prev, newProfile]);
          }}
          onCancel={() => handleNavigate('ADMIN')}
        />;
      case 'REGISTER_USER':
        return <RegisterUserPage
          profiles={profiles}
          onSave={(newUser) => {
            setUsers(prev => [...prev, newUser]);
            handleNavigate('ADMIN');
          }}
          onCancel={() => handleNavigate('ADMIN')}
        />;
      default:
        return <Dashboard orders={orders} setOrders={setOrders} onNewOrder={() => handleNavigate('NEW_ORDER')} />;
    }
  };

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Sidebar currentView={currentView} onNavigate={handleNavigate} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar onSearch={(q) => console.log('Search:', q)} onSignOut={handleSignOut} />
        <div className="flex-1 overflow-y-auto p-4 md:p-8 animate-fadeIn">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
