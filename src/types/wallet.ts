export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';

export type TransactionType = 'send' | 'receive' | 'deposit' | 'withdraw' | 'card_spend' | 'pocket_transfer';

export type TransactionCategory = 
  | 'Transfer'
  | 'Shopping'
  | 'Food & Dining'
  | 'Entertainment'
  | 'Bills & Utilities'
  | 'Income'
  | 'Travel'
  | 'Savings'
  | 'Subscriptions';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  recipientOrSender: string;
  recipientHandle?: string;
  avatar?: string;
  amount: number;
  currency: Currency;
  category: TransactionCategory;
  date: string; // ISO date string
  status: 'completed' | 'pending' | 'failed';
  note?: string;
  cardLast4?: string;
  pocketId?: string;
  referenceNumber: string;
  fee: number;
}

export interface Card {
  id: string;
  name: string;
  cardNumber: string; // full 16 digits
  last4: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  type: 'virtual' | 'physical';
  brand: 'visa' | 'mastercard';
  isFrozen: boolean;
  monthlyLimit: number;
  currentSpent: number;
  colorScheme: 'emerald' | 'slate' | 'violet' | 'amber' | 'rose' | 'ocean';
  createdAt: string;
  onlinePaymentsEnabled?: boolean;
  internationalRoamingEnabled?: boolean;
  fraudGuardEnabled?: boolean;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'Checking' | 'Savings';
  accountNumberMasked: string;
  balance: number;
  isPrimary: boolean;
}

export interface PocketVault {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  emoji: string;
  targetDate?: string;
  color: string;
  autoSaveEnabled: boolean;
  autoSaveRoundUp: boolean;
}

export interface Contact {
  id: string;
  name: string;
  handle: string; // e.g. @sarah_m
  email: string;
  avatar: string;
  initials: string;
  recent: boolean;
}

export interface WalletUser {
  id: string;
  name: string;
  handle: string;
  email: string;
  phone: string;
  avatar: string;
  tier: 'Standard' | 'Silver' | 'Platinum';
  dailyTransferLimit: number;
  monthlyTransferLimit: number;
  pinCode: string;
}
