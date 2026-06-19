import type { Metadata } from 'next';
import OsPage, { styles } from '../_components/OsPage';
import { financeEntries, healthEntries } from '@/lib/shaikh-os-memory';

export const metadata: Metadata = { title: 'ব্যক্তিগত | Shaikh OS' };

const money = new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 });
const reviewCards = [
  { title: 'Daily রিভিউ', copy: 'দিনশেষে অসমাপ্ত কাজ, energy এবং আগামীকালের focus লিখুন।' },
  { title: 'Weekly রিভিউ', copy: 'Projects, finance, health signals এবং relationship follow-ups একবার scan করুন।' },
  { title: 'Monthly রিভিউ', copy: 'Income, expenses, investment notes এবং personal capacity trend compare করুন।' },
];

export default function ব্যক্তিগতPage() {
  const income = financeEntries.filter((entry) => entry.direction === 'income').reduce((sum, entry) => sum + entry.amount, 0);
  const expense = financeEntries.filter((entry) => entry.direction === 'expense').reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <OsPage
      eyebrow="ব্যক্তিগত"
      title="আমি কেমন করছি?"
      subtitle="স্বাস্থ্য, finance এবং reviews এখন ব্যক্তিগত section-এর অধীনে—ব্যক্তিগত capacity ও wellbeing operational work থেকে আলাদা কিন্তু connected।"
      stats={[
        { label: 'স্বাস্থ্য Logs', value: String(healthEntries.length), detail: 'Sleep, mood, energy, symptoms' },
        { label: 'Income', value: money.format(income), detail: 'Logged inflow' },
        { label: 'Expenses', value: money.format(expense), detail: 'Logged outflow' },
      ]}
    >
      <section className={styles.section} id="health">
        <div className={styles.sectionHeader}><div><h2>স্বাস্থ্য</h2><p>Sleep, mood, energy এবং symptoms trend ব্যক্তিগত wellbeing-এর core signal।</p></div></div>
        <div className={styles.grid}>{healthEntries.map((entry) => <article className={styles.card} key={entry.id}><p className={styles.cardMeta}>{entry.date}</p><h3>{entry.symptoms}</h3><p>Sleep: {entry.sleep}<br />Mood: {entry.mood}<br />Energy: {entry.energy}</p></article>)}</div>
      </section>

      <section className={styles.section} id="finance">
        <div className={styles.sectionHeader}><div><h2>অর্থ</h2><p>Income, expenses এবং investments ব্যক্তিগত financial health-এর মধ্যে grouped।</p></div></div>
        <div className={styles.grid}>{financeEntries.map((entry) => <article className={styles.card} key={entry.id}><p className={styles.cardMeta}>{entry.category} · {entry.date}</p><h3 className={entry.direction === 'income' ? styles.amountIncome : styles.amountExpense}>{money.format(entry.amount)} {entry.direction}</h3><p>{entry.description}</p></article>)}</div>
      </section>

      <section className={styles.section} id="reviews">
        <div className={styles.sectionHeader}><div><h2>রিভিউs</h2><p>Self-management cadence: daily reset, weekly scan, monthly direction check।</p></div></div>
        <div className={styles.grid}>{reviewCards.map((review) => <article className={styles.card} key={review.title}><p className={styles.cardMeta}>রিভিউ cadence</p><h3>{review.title}</h3><p>{review.copy}</p></article>)}</div>
      </section>
    </OsPage>
  );
}
