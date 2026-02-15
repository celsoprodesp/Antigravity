
import { Order, Client, Transaction, Item, ItemCategory, PagePermission, Profile } from '../types';

export const INITIAL_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: '#ORD-3920',
    clientName: 'Eletrônicos LTDA',
    description: '5x Monitores 27" Dell UltraSharp',
    status: 'PENDENTE',
    amount: 8450,
    timeAgo: '12 min ago',
    clientAvatar: 'https://picsum.photos/seed/eletronicos/100'
  },
  {
    id: '2',
    orderNumber: '#ORD-3921',
    clientName: 'Studio Design 404',
    description: 'Pacote Adobe Creative Cloud (Licença Anual)',
    status: 'PENDENTE',
    amount: 2100,
    timeAgo: '45 min ago',
    clientInitials: 'JS'
  },
  {
    id: '3',
    orderNumber: '#ORD-3918',
    clientName: 'Tech Solutions',
    description: 'Servidores Rack 2U - Configuração Alta',
    status: 'PREPARACAO',
    amount: 12800,
    timeAgo: '3h ago',
    clientAvatar: 'https://picsum.photos/seed/tech/100'
  },
  {
    id: '4',
    orderNumber: '#ORD-3910',
    clientName: 'Global Logistics',
    description: 'Frota de Tablets para Motoristas',
    status: 'ENVIADO',
    amount: 15000,
    timeAgo: 'Yesterday',
    clientAvatar: 'https://picsum.photos/seed/logistics/100'
  },
  {
    id: '5',
    orderNumber: '#ORD-3890',
    clientName: 'Consultório Dr. André',
    description: 'Impressora 3D Médica',
    status: 'CONCLUIDO',
    amount: 5600,
    timeAgo: '2 days ago',
    clientInitials: 'CA'
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Mariana Costa',
    company: 'Tech Solutions Ltda',
    email: 'mariana@techsolutions.com',
    phone: '(11) 98765-4321',
    lastPurchase: '20 Out 2023',
    inactivityDays: 2,
    initials: 'MC',
    status: 'ATIVO',
    classification: 'NORMAL'
  },
  {
    id: '2',
    name: 'Carlos Mendes',
    company: 'Consultoria Ágil',
    email: 'carlos@agilconsult.com',
    phone: '(21) 99999-8888',
    lastPurchase: '05 Ago 2023',
    inactivityDays: 78,
    initials: 'CM',
    status: 'ATIVO',
    classification: 'RISCO'
  },
  {
    id: '3',
    name: 'Fernanda Lima',
    company: 'Freelancer',
    email: 'nanda.lima@email.com',
    phone: '(31) 98877-6655',
    lastPurchase: '15 Out 2023',
    inactivityDays: 7,
    avatar: 'https://picsum.photos/seed/fernanda/100',
    initials: 'FL',
    status: 'ATIVO',
    classification: 'NORMAL'
  },
  {
    id: '4',
    name: 'Roberto Almeida',
    company: 'Grupo Almeida',
    email: 'roberto@grupoalmeida.com.br',
    phone: '(41) 3333-2222',
    lastPurchase: '18 Set 2023',
    inactivityDays: 34,
    initials: 'RA',
    status: 'ATIVO',
    classification: 'VIP'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    date: 'Hoje, 14:30',
    description: 'Pagamento #PED-2023-89',
    category: 'Vendas',
    status: 'CONFIRMADO',
    amount: 1250,
    type: 'RECEITA'
  },
  {
    id: '2',
    date: 'Ontem, 09:15',
    description: 'AWS Cloud Services',
    category: 'Infraestrutura',
    status: 'PAGO',
    amount: 450.90,
    type: 'DESPESA'
  },
  {
    id: '3',
    date: '28 Out, 16:45',
    description: 'Consultoria Técnica',
    category: 'Serviços',
    status: 'PENDENTE',
    amount: 3800,
    type: 'RECEITA'
  }
];

export const INITIAL_CATEGORIES: ItemCategory[] = [
  { id: '1', name: 'Eletrônicos', description: 'Equipamentos eletrônicos e de informática' },
  { id: '2', name: 'Software', description: 'Licenças de software e assinaturas' },
  { id: '3', name: 'Periféricos', description: 'Acessórios e periféricos de computador' },
  { id: '4', name: 'Serviços', description: 'Serviços de consultoria e suporte' },
];

export const INITIAL_ITEMS: Item[] = [
  { id: '1', name: 'Monitor 27" Dell UltraSharp', categoryId: '1', categoryName: 'Eletrônicos', unitPrice: 1690, unit: 'un' },
  { id: '2', name: 'Teclado Mecânico Logitech', categoryId: '3', categoryName: 'Periféricos', unitPrice: 450, unit: 'un' },
  { id: '3', name: 'Licença Adobe Creative Cloud', categoryId: '2', categoryName: 'Software', unitPrice: 2100, unit: 'licença' },
  { id: '4', name: 'Mouse Wireless MX Master', categoryId: '3', categoryName: 'Periféricos', unitPrice: 380, unit: 'un' },
  { id: '5', name: 'Servidor Rack 2U', categoryId: '1', categoryName: 'Eletrônicos', unitPrice: 6400, unit: 'un' },
];

export const INITIAL_PERMISSIONS: PagePermission[] = [
  // Admin Permissions (Full Access)
  { id: '1', pageName: 'Dashboard', pageKey: 'DASHBOARD', canRead: true, canWrite: true, canDelete: true, profileId: '1' },
  { id: '2', pageName: 'Novo Pedido', pageKey: 'NEW_ORDER', canRead: true, canWrite: true, canDelete: true, profileId: '1' },
  { id: '3', pageName: 'Gestão de Clientes', pageKey: 'CLIENTS', canRead: true, canWrite: true, canDelete: true, profileId: '1' },
  { id: '4', pageName: 'Fluxo de Caixa', pageKey: 'FINANCE', canRead: true, canWrite: true, canDelete: true, profileId: '1' },
  { id: '5', pageName: 'Cadastro de Clientes', pageKey: 'REGISTER_CLIENT', canRead: true, canWrite: true, canDelete: true, profileId: '1' },
  { id: '6', pageName: 'Cadastro de Itens', pageKey: 'REGISTER_ITEM', canRead: true, canWrite: true, canDelete: true, profileId: '1' },
  { id: '7', pageName: 'Administração', pageKey: 'ADMIN', canRead: true, canWrite: true, canDelete: true, profileId: '1' },

  // Operador Permissions (Restricted)
  { id: '11', pageName: 'Dashboard', pageKey: 'DASHBOARD', canRead: true, canWrite: false, canDelete: false, profileId: '2' },
  { id: '12', pageName: 'Novo Pedido', pageKey: 'NEW_ORDER', canRead: true, canWrite: true, canDelete: false, profileId: '2' },
  { id: '13', pageName: 'Gestão de Clientes', pageKey: 'CLIENTS', canRead: true, canWrite: false, canDelete: false, profileId: '2' },
  { id: '14', pageName: 'Fluxo de Caixa', pageKey: 'FINANCE', canRead: false, canWrite: false, canDelete: false, profileId: '2' },
  { id: '15', pageName: 'Cadastro de Clientes', pageKey: 'REGISTER_CLIENT', canRead: true, canWrite: true, canDelete: false, profileId: '2' },
  { id: '16', pageName: 'Cadastro de Itens', pageKey: 'REGISTER_ITEM', canRead: true, canWrite: false, canDelete: false, profileId: '2' },
  { id: '17', pageName: 'Administração', pageKey: 'ADMIN', canRead: false, canWrite: false, canDelete: false, profileId: '2' },
];

export const INITIAL_PROFILES: Profile[] = [
  { id: '1', name: 'Administrador', description: 'Acesso total ao sistema' },
  { id: '3', name: 'Visualizador', description: 'Apenas leitura' },
];

export const INITIAL_USERS: import('../types').User[] = [
  { id: '1', name: 'Administrador Sistema', email: 'admin@erpr.com', profileId: '1', role: 'Super Admin' },
  { id: '2', name: 'João Silva', email: 'joao.silva@erpr.com', profileId: '2', role: 'Vendas' },
  { id: '3', name: 'Maria Souza', email: 'maria.souza@erpr.com', profileId: '2', role: 'Atendimento' },
];
