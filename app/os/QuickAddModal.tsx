'use client';

import { FormEvent, useMemo, useState } from 'react';
import { addTransaction, type TransactionCategory } from '@/lib/offline-transactions';
import styles from './QuickAddModal.module.css';

const categories: TransactionCategory[] = ['Food & Dining', 'Transport', 'Utilities', 'Entertainment', 'Health'];

type View = 'menu' | 'expense';

export default function QuickAddModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>('menu');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Food & Dining');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState('');
  const parsedAmount = useMemo(() => Number(amount), [amount]);

  const resetForm = () => {
    setAmount('');
    setCategory('Food & Dining');
  };

  const closeModal = () => {
    setIsOpen(false);
    setView('menu');
    resetForm();
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3200);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      showToast('Please enter a valid expense amount.');
      return;
    }

    setIsSaving(true);

    try {
      await addTransaction({ amount: parsedAmount, category });
      showToast(`Saved ${formatCurrency(parsedAmount)} in ${category}.`);
      resetForm();
      setView('menu');
      window.setTimeout(() => setIsOpen(false), 650);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to save transaction.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button className={styles.floatingButton} type="button" onClick={() => setIsOpen(true)} aria-haspopup="dialog">
        <span>+</span>
        Quick Add
      </button>

      {isOpen ? (
        <div className={styles.overlay} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeModal()}>
          <section className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby="quick-add-title">
            <div className={styles.handle} />
            <div className={styles.header}>
              <div>
                <p className={styles.eyebrow}>{view === 'expense' ? 'New expense' : 'Quick add'}</p>
                <h2 id="quick-add-title">{view === 'expense' ? 'Log a real transaction' : 'What would you like to save?'}</h2>
              </div>
              <button className={styles.iconButton} type="button" onClick={closeModal} aria-label="Close quick add">×</button>
            </div>

            {view === 'menu' ? (
              <div className={styles.menuGrid}>
                <button className={styles.actionCard} type="button" onClick={() => setView('expense')}>
                  <span className={styles.actionIcon}>$</span>
                  <strong>Add Expense</strong>
                  <small>Capture an offline transaction with amount and category.</small>
                </button>
                <button className={styles.actionCard} type="button" disabled>
                  <span className={styles.actionIcon}>✓</span>
                  <strong>Add Task</strong>
                  <small>Coming soon</small>
                </button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.field}>
                  <span>Amount</span>
                  <div className={styles.amountInputWrap}>
                    <span aria-hidden="true">$</span>
                    <input autoFocus inputMode="decimal" min="0" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" />
                  </div>
                </label>

                <label className={styles.field}>
                  <span>Category</span>
                  <select value={category} onChange={(event) => setCategory(event.target.value as TransactionCategory)}>
                    {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>

                <div className={styles.formActions}>
                  <button className={styles.secondaryButton} type="button" onClick={() => setView('menu')}>Back</button>
                  <button className={styles.submitButton} type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save Transaction'}</button>
                </div>
              </form>
            )}
          </section>
        </div>
      ) : null}

      {toast ? <div className={styles.toast} role="status" aria-live="polite">{toast}</div> : null}
    </>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}
