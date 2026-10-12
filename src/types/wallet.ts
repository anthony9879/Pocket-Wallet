export type TransactionType = 'send' | 'receive' | 'top_up' | 'withdraw' | 'card_payment' | 'vault_deposit' | 'vault_withdraw' | 'cashback';

export type Category = 
  | 'Shopping'
  | 'Food & Dining'
  | 'Bills & Utilities'
  | 'Entertainment'
  | 'Travel & Transport'
  | 'Health'
  | 'Income & Salary'
  | 'Transfers'
  | 'Savings'
  | 'Other';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  recipientOrSender: string;
  amount: number; // positive for income/top-up/cashback, negative for expenses/sends
  currency: string;
  category: Category;
  timestamp: string; // ISO string
  status: 'completed' | 'pending' | 'failed';
  note?: string;
  referenceNumber: string;
  cardId?: string;
  avatar?: string;
}

export interface VirtualCard {
  id: string;
  name: string;
  type: 'virtual' | 'physical' | 'disposable';
  cardNumber: string; // formatted 16 digits
  cardHolder: string;
  expiry: string;
  cvv: string;
  isFrozen: boolean;
  spendingLimit: number; // monthly limit
  currentSpent: number;
  onlinePaymentsEnabled: boolean;
  internationalEnabled: boolean;
  colorScheme: 'emerald' | 'indigo' | 'violet' | 'amber' | 'rose' | 'slate';
  brand: 'visa' | 'mastercard';
}

export interface Contact {
  id: string;
  name: string;
  handle: string; // e.g. @sarah
  email: string;
  phone: string;
  avatar: string;
  favorite: boolean;
  recent: boolean;
}

export interface SavingsVault {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  category: string;
  emoji: string;
  deadline?: string;
  autoRoundup: boolean;
  color: string;
}

export interface Budget {
  category: Category;
  limit: number;
  spent: number;
  period: 'monthly';
}

export interface PerkOffer {
  id: string;
  merchant: string;
  cashbackPercent: number;
  category: string;
  expiresIn: string;
  isActive: boolean;
  logo: string;
  description: string;
}

export interface UserProfile {
  name: string;
  email: string;
  handle: string;
  pocketId: string;
  currency: string;
  avatar: string;
  cashbackPoints: number; // e.g. $42.50 in reward value
  biometricsEnabled: boolean;
  notificationsEnabled: boolean;
}
