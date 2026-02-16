import React, { useState, useEffect } from 'react';
import { ViewType, Order, Client, Transaction, Item, ItemCategory, PagePermission, Profile, User } from './types';
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
import EditMyProfilePage from './pages/EditMyProfilePage';
import LoginPage from './pages/LoginPage';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>((localStorage.getItem('erp_currentView') as ViewType) || 'DASHBOARD');
  const [previousView, setPreviousView] = useState<ViewType>((localStorage.getItem('erp_previousView') as ViewType) || 'DASHBOARD');
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [permissions, setPermissions] = useState<PagePermission[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(localStorage.getItem('erp_selectedClientId'));
  const [selectedId, setSelectedId] = useState<string | null>(localStorage.getItem('erp_selectedId'));
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(localStorage.getItem('erp_sidebarExpanded') === 'true');
  const [transactionCategories, setTransactionCategories] = useState<any[]>([]);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setSession(prev => {
          if (!prev) {
            setCurrentView('DASHBOARD');
            setSelectedId(null);
            setSelectedClientId(null);
          }
          return session;
        });
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('erp_currentView', currentView);
    localStorage.setItem('erp_previousView', previousView);
    localStorage.setItem('erp_sidebarExpanded', isSidebarExpanded.toString());
  }, [currentView, previousView, isSidebarExpanded]);

  useEffect(() => {
    if (selectedId) localStorage.setItem('erp_selectedId', selectedId);
    else localStorage.removeItem('erp_selectedId');
  }, [selectedId]);

  useEffect(() => {
    if (selectedClientId) localStorage.setItem('erp_selectedClientId', selectedClientId);
    else localStorage.removeItem('erp_selectedClientId');
  }, [selectedClientId]);

  // Resolve current user when session or users list changes
  useEffect(() => {
    if (session?.user?.email && users.length > 0) {
      const foundUser = users.find(u => u.email === session.user.email);
      if (foundUser) {
        setCurrentUser(foundUser);
      }
    }
  }, [session, users]);

  const refreshData = async () => {
    const { data: clientsData } = await supabase.from('clients').select('*');
    const { data: latestOrders } = await supabase.from('orders').select('client_name, created_at').order('created_at', { ascending: false });

    if (clientsData) {
      setClients(clientsData.map((c: any) => {
        const clientOrders = latestOrders?.filter(o =>
          o.client_name === c.name || o.client_name === c.company
        ) || [];

        const lastOrder = clientOrders[0];
        const lastPurchaseDate = lastOrder ? new Date(lastOrder.created_at) : null;
        const lastPurchaseStr = lastPurchaseDate
          ? lastPurchaseDate.toLocaleDateString('pt-BR')
          : 'Nenhuma';

        const inactivity = lastPurchaseDate
          ? Math.floor((new Date().getTime() - lastPurchaseDate.getTime()) / (1000 * 3600 * 24))
          : 999;

        return {
          ...c,
          lastPurchase: lastPurchaseStr,
          inactivityDays: inactivity,
        };
      }));
    }

    // Fetch items with category name if possible, or just map fields
    const { data: itemsData } = await supabase.from('items').select('*, item_categories(name)');
    if (itemsData) {
      setItems(itemsData.map((i: any) => ({
        ...i,
        unitPrice: i.unit_price,
        categoryId: i.category_id,
        categoryName: i.item_categories?.name || '', // Helper to get category name from join
      })));
    }

    const { data: categoriesData } = await supabase.from('item_categories').select('*');
    if (categoriesData) setCategories(categoriesData);

    const { data: permissionsData } = await supabase.from('page_permissions').select('*');
    if (permissionsData) {
      setPermissions(permissionsData.map((p: any) => ({
        id: p.id,
        pageName: p.page_name,
        pageKey: p.page_key,
        canRead: p.can_read,
        canWrite: p.can_write,
        canDelete: p.can_delete,
        profileId: p.profile_id,
      })));
    }

    const { data: profilesData } = await supabase.from('profiles').select('*');
    if (profilesData) setProfiles(profilesData);

    const { data: usersData } = await supabase.from('users').select('*');
    if (usersData) {
      setUsers(usersData.map((u: any) => ({
        ...u,
        profileId: u.profile_id,
      })));
    }

    const { data: trData } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    if (trData) {
      setTransactions(trData.map((t: any) => ({
        ...t,
        date: new Date(t.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      })));
    }

    const { data: trCats } = await supabase.from('transaction_categories').select('*');
    if (trCats) setTransactionCategories(trCats);

    // Fetch real orders from Supabase
    const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (ordersData) {
      setOrders(ordersData.map((o: any) => ({
        id: o.id,
        orderNumber: o.order_number,
        clientName: o.client_name,
        description: o.description,
        status: o.status,
        amount: o.amount,
        timeAgo: o.time_ago,
        clientAvatar: o.client_avatar,
        clientInitials: o.client_initials,
        paymentMethod: o.payment_method
      })));
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const getPagePermission = (view: ViewType): PagePermission => {
    // Administrator or System Owner always has full access
    const isAdmin = currentUser?.profileId === '1' || currentUser?.role === 'ADMIN';

    const defaultFullPerm: PagePermission = {
      id: 'admin',
      pageName: view,
      pageKey: view,
      canRead: true,
      canWrite: true,
      canDelete: true,
      profileId: currentUser?.profileId || ''
    };

    if (isAdmin) return defaultFullPerm;
    if (view === 'DASHBOARD') return defaultFullPerm;

    // Mapping views to their base permission keys
    let permissionKey = view;
    if (view === 'CLIENT_PROFILE' || view === 'REGISTER_CLIENT') permissionKey = 'CLIENTS';
    else if (view === 'REGISTER_ITEM' || view === 'REGISTER_CATEGORY') permissionKey = 'REGISTER_ITEM';
    else if (view === 'REGISTER_PROFILE' || view === 'REGISTER_USER') permissionKey = 'ADMIN';

    const perm = permissions.find(p => p.profileId === currentUser?.profileId && p.pageKey === permissionKey);

    return perm || {
      id: 'denied',
      pageName: view,
      pageKey: view,
      canRead: false,
      canWrite: false,
      canDelete: false,
      profileId: currentUser?.profileId || ''
    };
  };

  const handleNavigate = (view: ViewType, id?: string) => {
    const perm = getPagePermission(view);
    if (!perm.canRead && !perm.canWrite) {
      alert('Acesso negado: Você não tem permissão para acessar esta página.');
      return;
    }
    setPreviousView(currentView);
    setCurrentView(view);
    if (id) {
      setSelectedId(id);
      if (view === 'CLIENT_PROFILE' || view === 'REGISTER_CLIENT') {
        setSelectedClientId(id);
      }
    } else {
      setSelectedId(null);
      setSelectedClientId(null);
    }
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
          permission={getPagePermission('CLIENTS')}
        />;
      case 'FINANCE':
        return <FinancePage
          transactions={transactions}
          transactionCategories={transactionCategories}
          onSave={() => refreshData()}
          permission={getPagePermission('FINANCE')}
        />;
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
          onEditClient={(id) => handleNavigate('REGISTER_CLIENT', id)}
          permission={getPagePermission('NEW_ORDER')}
        />;
      case 'CLIENT_PROFILE':
        const client = clients.find(c => c.id === selectedClientId) || clients[0];
        return <ProfilePage
          client={client}
          orders={orders.filter(o => o.clientName.includes(client.name) || o.clientName.includes(client.company))}
          onNewOrder={() => handleNavigate('NEW_ORDER')}
          onEditClient={() => handleNavigate('REGISTER_CLIENT', selectedClientId || undefined)}
        />;
      case 'SETTINGS':
        return <SettingsPage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
      case 'REGISTER_CLIENT':
        return <RegisterClientPage
          editingClient={clients.find(c => c.id === selectedClientId)}
          onSave={() => {
            refreshData(); // Refresh list after save
            goBack();
          }}
          onCancel={goBack}
          permission={getPagePermission('CLIENTS')}
        />;
      case 'REGISTER_ITEM':
        return <RegisterItemPage
          items={items}
          categories={categories}
          editingItem={items.find(i => i.id === selectedId)}
          onSave={() => {
            refreshData();
          }}
          onCancel={() => handleNavigate('DASHBOARD')}
          onNavigateCategory={() => handleNavigate('REGISTER_CATEGORY')}
          onEditItem={(id) => handleNavigate('REGISTER_ITEM', id)}
          permission={getPagePermission('REGISTER_ITEM')}
        />;
      case 'REGISTER_CATEGORY':
        return <RegisterCategoryPage
          categories={categories}
          editingCategory={categories.find(c => c.id === selectedId)}
          onSave={() => {
            refreshData();
          }}
          onCancel={() => handleNavigate('DASHBOARD')}
          onEditCategory={(id) => handleNavigate('REGISTER_CATEGORY', id)}
          permission={getPagePermission('REGISTER_ITEM')}
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
          onEditProfile={(id) => handleNavigate('REGISTER_PROFILE', id)}
          onEditUser={(id) => handleNavigate('REGISTER_USER', id)}
          permission={getPagePermission('ADMIN')}
        />;
      case 'REGISTER_PROFILE':
        return <RegisterProfilePage
          profiles={profiles}
          onSave={() => {
            refreshData();
          }}
          onCancel={() => handleNavigate('ADMIN')}
          permission={getPagePermission('ADMIN')}
        />;
      case 'REGISTER_USER':
        return <RegisterUserPage
          profiles={profiles}
          editingUser={users.find(u => u.id === selectedId)}
          currentUser={currentUser}
          onSave={() => {
            refreshData();
            goBack();
          }}
          onCancel={goBack}
          permission={getPagePermission('ADMIN')}
        />;
      case 'EDIT_MY_PROFILE':
        return <EditMyProfilePage
          currentUser={currentUser}
          onSave={() => {
            refreshData();
            goBack();
          }}
          onCancel={goBack}
          permission={getPagePermission('EDIT_MY_PROFILE')}
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
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
        user={currentUser}
        onEditCurrentUser={() => handleNavigate('EDIT_MY_PROFILE')}
        checkPermission={getPagePermission}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          onSearch={(query) => {
            const q = query.toLowerCase();
            if (q.includes('client')) handleNavigate('CLIENTS');
            else if (q.includes('pedid') || q.includes('venda')) handleNavigate('NEW_ORDER');
            else if (q.includes('financ') || q.includes('caixa')) handleNavigate('FINANCE');
            else if (q.includes('config')) handleNavigate('SETTINGS');
            else if (q.includes('admin')) handleNavigate('ADMIN');
            else if (q.includes('inicio') || q.includes('dash')) handleNavigate('DASHBOARD');
            else if (q.includes('perfil')) handleNavigate('CLIENT_PROFILE');
          }}
          onSignOut={handleSignOut}
        />
        <div className="flex-1 overflow-y-auto p-4 md:p-8 animate-fadeIn">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
