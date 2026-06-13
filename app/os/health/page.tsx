import type { Metadata } from 'next';
import OsPage, { styles } from '../_components/OsPage';
import RelatedItems from '../_components/RelatedItems';
import { healthEntries } from '@/lib/shaikh-os-memory';

export const metadata: Metadata = { title: 'Health | Shaikh OS' };

export default function HealthPage() {
  return <OsPage eyebrow="Health System" title="Sleep, mood, energy, symptoms trend." subtitle="Repeated health issues detect করার জন্য ৭ দিন ও ৩০ দিনের pattern card রাখা হয়েছে।" stats={[{ label: 'Last 7 Days', value: '৩ logs', detail: '২ বার sleep কম / headache signal' }, { label: 'Last 30 Days', value: 'Watch', detail: 'Repeated headache হলে warning escalated হবে' }]}><section className={styles.section}><div className={styles.grid}>{healthEntries.map((entry) => <article className={styles.card} key={entry.id}><p className={styles.cardMeta}>{entry.date}</p><h3>{entry.symptoms}</h3><p>Sleep: {entry.sleep}<br />Mood: {entry.mood}<br />Energy: {entry.energy}</p><RelatedItems type="health_log" id={entry.id} /></article>)}</div></section></OsPage>;
}
