import type { Metadata } from 'next';
import OsPage, { styles } from '../_components/OsPage';
import { getIntentLabel, memoryItems, type MemoryIntent } from '@/lib/shaikh-os-memory';

export const metadata: Metadata = { title: 'Memory Center | Shaikh OS' };

const filters: Array<{ label: string; intents?: MemoryIntent[] }> = [
  { label: 'All' },
  { label: 'Tasks', intents: ['task', 'reminder'] },
  { label: 'Notes', intents: ['note'] },
  { label: 'Ideas', intents: ['idea'] },
  { label: 'Health', intents: ['health_log'] },
  { label: 'Finance', intents: ['finance_log'] },
  { label: 'Meetings', intents: ['meeting'] },
  { label: 'Decisions', intents: ['decision'] },
];

export default function MemoryPage() {
  return (
    <OsPage
      eyebrow="Memory Center"
      title="সব command, task, note, idea, decision — এক জায়গায়।"
      subtitle="Shaikh OS-এ কোনো hidden record থাকবে না। প্রতিটি item category সহ দৃশ্যমান থাকবে এবং future database row হিসেবে map করা যাবে।"
      stats={[{ label: 'Visible Memories', value: String(memoryItems.length), detail: 'প্রাথমিক unified memory seed' }]}
    >
      <section className={styles.section}>
        <div className={styles.filters} aria-label="Memory filters">
          {filters.map((filter) => (
            <a className={styles.filterLink} href={`#${filter.label.toLowerCase()}`} key={filter.label}>
              {filter.label}
            </a>
          ))}
        </div>
      </section>
      {filters.map((filter) => {
        const items = filter.intents ? memoryItems.filter((item) => filter.intents?.includes(item.intent)) : memoryItems;
        return (
          <section className={styles.section} id={filter.label.toLowerCase()} key={filter.label}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>{filter.label}</h2>
                <p>{items.length} টি visible memory</p>
              </div>
            </div>
            <div className={styles.grid}>
              {items.map((item) => (
                <article className={styles.card} key={item.id}>
                  <p className={styles.cardMeta}>{getIntentLabel(item.intent)} · {item.project}</p>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <div className={styles.badgeRow}>{item.tags.map((tag) => <span className={styles.badge} key={tag}>{tag}</span>)}</div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </OsPage>
  );
}
