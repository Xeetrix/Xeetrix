import type { Metadata } from 'next';
import OsPage, { styles } from '../_components/OsPage';
import { marketingMetrics } from '@/lib/shaikh-os-memory';

export const metadata: Metadata = { title: 'Marketing | Shaikh OS' };

export default function MarketingPage() {
  return <OsPage eyebrow="Marketing Operations" title="Content, campaigns, leads, follow ups." subtitle="KNLTC এবং future ventures-এর posts, leads, replies, team activity এক অপারেশন board-এ।" stats={marketingMetrics}><section className={styles.section}><div className={styles.twoColumn}>{['Content', 'Campaigns', 'Leads', 'Follow Ups', 'Team Activity'].map((area) => <article className={styles.card} key={area}><p className={styles.cardMeta}>Operation lane</p><h3>{area}</h3><p>Daily ownership, status, blocker এবং next action এখানে database-backed হবে।</p></article>)}</div></section></OsPage>;
}
