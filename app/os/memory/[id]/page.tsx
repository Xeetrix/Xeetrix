import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OsPage, { styles } from '../../_components/OsPage';
import RelatedItems from '../../_components/RelatedItems';
import { formatBanglaDateTime, getIntentLabel, memoryItems } from '@/lib/shaikh-os-memory';

export const metadata: Metadata = { title: 'Memory Detail | Shaikh OS' };

type PageProps = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return memoryItems.map((item) => ({ id: item.id }));
}

export default async function MemoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const item = memoryItems.find((entry) => entry.id === id);
  if (!item) notFound();

  return (
    <OsPage eyebrow="Memory Detail" title={item.title} subtitle={item.summary}>
      <section className={styles.section}>
        <article className={styles.card}>
          <p className={styles.cardMeta}>{getIntentLabel(item.intent)} · {item.project} · {formatBanglaDateTime(item.createdAt)}</p>
          <h3>Summary</h3>
          <p>{item.summary}</p>
          <div className={styles.badgeRow}>{item.tags.map((tag) => <span className={styles.badge} key={tag}>{tag}</span>)}</div>
        </article>
      </section>
      <section className={styles.section}>
        <article className={styles.card}>
          <RelatedItems type={item.intent} id={item.id} />
        </article>
      </section>
    </OsPage>
  );
}
