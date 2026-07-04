export type TransactionCategory = 'Food & Dining' | 'Transport' | 'Utilities' | 'Entertainment' | 'Health';

export type OfflineTransaction = {
  id: string;
  type: 'expense';
  amount: number;
  category: TransactionCategory;
  note?: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
};

const DB_NAME = 'shaikh-os-offline';
const DB_VERSION = 1;
const STORE_NAME = 'transactions';

function openTransactionsDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('synced', 'synced', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Unable to open offline transactions database.'));
  });
}

function persistTransaction(transaction: OfflineTransaction): Promise<OfflineTransaction> {
  return openTransactionsDb().then(
    (db) => new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(transaction);

      tx.oncomplete = () => {
        db.close();
        resolve(transaction);
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error ?? new Error('Unable to save transaction.'));
      };
      tx.onabort = () => {
        db.close();
        reject(tx.error ?? new Error('Transaction save was aborted.'));
      };
    })
  );
}

export async function addTransaction(input: { amount: number; category: TransactionCategory }): Promise<OfflineTransaction> {
  const now = new Date().toISOString();
  const transaction: OfflineTransaction = {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `txn-${Date.now()}`,
    type: 'expense',
    amount: input.amount,
    category: input.category,
    createdAt: now,
    updatedAt: now,
    synced: false
  };

  return persistTransaction(transaction);
}
