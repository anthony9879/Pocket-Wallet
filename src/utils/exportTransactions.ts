import { Transaction, Currency } from '../types/wallet';

/**
 * Formats a given number into a clean currency string or decimal
 */
export const formatCurrencyAmount = (amount: number, currency: Currency): string => {
  const symbols: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
  };
  return `${symbols[currency] || '$'}${amount.toFixed(2)}`;
};

/**
 * Escapes fields for CSV according to RFC 4180
 */
const escapeCSVField = (field: string | number | undefined | null): string => {
  if (field === undefined || field === null) return '""';
  const str = String(field);
  // If field contains quotes, commas, or newlines, wrap in quotes and escape quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
};

/**
 * Generates and triggers downloading of transaction history as a CSV file.
 * Automatically adds UTF-8 BOM so applications like Microsoft Excel,
 * Apple Numbers, and Google Sheets open special characters correctly.
 */
export const downloadTransactionsCSV = (
  transactions: Transaction[],
  currency: Currency = 'USD',
  filename?: string
): void => {
  const headers = [
    'Transaction ID',
    'Date & Time',
    'Title / Merchant',
    'Counterparty',
    'PocketPay Handle',
    'Type',
    'Category',
    'Status',
    'Direction',
    'Amount',
    'Currency',
    'Fee',
    'Card Last 4',
    'Note / Memo',
    'Reference ID'
  ];

  const rows = transactions.map((tx) => {
    const isIncoming = tx.type === 'receive' || tx.type === 'deposit' || tx.type === 'withdraw';
    const direction = isIncoming ? 'Credit (+)' : 'Debit (-)';
    const formattedDate = new Date(tx.date).toISOString().replace('T', ' ').slice(0, 19);

    return [
      escapeCSVField(tx.id),
      escapeCSVField(formattedDate),
      escapeCSVField(tx.title),
      escapeCSVField(tx.recipientOrSender),
      escapeCSVField(tx.recipientHandle || ''),
      escapeCSVField(tx.type),
      escapeCSVField(tx.category),
      escapeCSVField(tx.status),
      escapeCSVField(direction),
      escapeCSVField(tx.amount.toFixed(2)),
      escapeCSVField(tx.currency || currency),
      escapeCSVField((tx.fee || 0).toFixed(2)),
      escapeCSVField(tx.cardLast4 ? `•••• ${tx.cardLast4}` : ''),
      escapeCSVField(tx.note || ''),
      escapeCSVField(tx.referenceNumber || tx.id)
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  
  // UTF-8 BOM to ensure Excel detects encoding properly
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const today = new Date().toISOString().slice(0, 10);
  const actualFilename = filename || `pocket-wallet-transactions-${today}.csv`;

  triggerBlobDownload(blob, actualFilename);
};

/**
 * Helper to trigger file download via temporary anchor element
 */
const triggerBlobDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 150);
};
