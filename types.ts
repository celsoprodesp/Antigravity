
export type OrderStatus = 'PENDENTE' | 'PREPARACAO' | 'ENVIADO' | 'CONCLUIDO';

export interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  description: string;
  status: OrderStatus;
  amount: number;
  timeAgo: string;
  clientInitials?: string;
  clientAvatar?: string;
  items?: OrderItem[];
  paymentMethod?: string;
  createdAt?: string;
}

export interface OrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  lastPurchase: string;
  inactivityDays: number;
  avatar?: string;
  initials: string;
  status: 'ATIVO' | 'INATIVO';
  classification: 'NORMAL' | 'VIP' | 'RISCO';
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  status: 'CONFIRMADO' | 'PAGO' | 'PENDENTE';
  amount: number;
  type: 'RECEITA' | 'DESPESA';
}

export interface Item {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  unitPrice: number;
  unit: string;
}

export interface ItemCategory {
  id: string;
  name: string;
  description: string;
}

export interface PagePermission {
  id: string;
  pageName: string;
  pageKey: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  profileId: string;
}

export interface Profile {
  id: string;
  name: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profileId: string;
  avatar?: string;
  role?: string; // Optional display role
}

export type ViewType = 'DASHBOARD' | 'CLIENTS' | 'FINANCE' | 'NEW_ORDER' | 'SETTINGS' | 'CLIENT_PROFILE' | 'REGISTER_CLIENT' | 'REGISTER_ITEM' | 'REGISTER_CATEGORY' | 'ADMIN' | 'REGISTER_PROFILE' | 'REGISTER_USER' | 'EDIT_MY_PROFILE';
