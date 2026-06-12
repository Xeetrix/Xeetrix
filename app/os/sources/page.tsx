import type { Metadata } from 'next';
import OsPage, { styles } from '../_components/OsPage';
import { sourceConnections } from '@/lib/shaikh-os-memory';

export const metadata: Metadata = { title: 'Sources | Shaikh OS' };

export default function SourcesPage() {
  return <OsPage eyebrow="Connected Data Sources" title="Future-ready integrations foundation." subtitle="OAuth এখনো implement করা হয়নি; শুধু metadata foundation রাখা হয়েছে যাতে পরে Google, social এবং WhatsApp Business safely connect করা যায়।"><section className={styles.section}><div className={styles.grid}>{sourceConnections.map((source) => <article className={styles.card} key={source.id}><p className={styles.cardMeta}>{source.status}</p><h3>{source.name}</h3><p>{source.accountHint}</p><p>Last sync: {source.lastSync}</p></article>)}</div></section></OsPage>;
}
