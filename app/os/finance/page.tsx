import type { Metadata } from 'next';
import OsPage, { styles } from '../_components/OsPage';
import { financeEntries } from '@/lib/shaikh-os-memory';

export const metadata: Metadata = { title: 'Finance | Shaikh OS' };

const money = new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 });

export default function FinancePage() {
  const income = financeEntries.filter((entry) => entry.direction === 'income').reduce((sum, entry) => sum + entry.amount, 0);
  const expense = financeEntries.filter((entry) => entry.direction === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
  return <OsPage eyebrow="Finance System" title="Income, expenses, investments — category wise." subtitle="Personal, KNLTC, School, Xeetrix এবং Investment direction সহ track হবে।" stats={[{ label: 'Income', value: money.format(income), detail: 'Logged inflow' }, { label: 'Expenses', value: money.format(expense), detail: 'Logged outflow' }]}><section className={styles.section}><div className={styles.grid}>{financeEntries.map((entry) => <article className={styles.card} key={entry.id}><p className={styles.cardMeta}>{entry.category} · {entry.date}</p><h3 className={entry.direction === 'income' ? styles.amountIncome : styles.amountExpense}>{money.format(entry.amount)} {entry.direction}</h3><p>{entry.description}</p></article>)}</div></section></OsPage>;
}
