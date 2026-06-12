import type { Metadata } from 'next';
import OsPage, { styles } from '../_components/OsPage';
import { formatBanglaDateTime, getIntentLabel, groupMemoryByDay, memoryItems } from '@/lib/shaikh-os-memory';

export const metadata: Metadata = { title: 'Agent Timeline | Shaikh OS' };

export default function TimelinePage() {
  const groups = groupMemoryByDay(memoryItems);
  const days = Object.keys(groups).sort((a, b) => (a < b ? 1 : -1));
  return (
    <OsPage eyebrow="Agent Timeline" title="জীবনের chronological history." subtitle="আজ, গতকাল এবং আগের সব command/action সময় অনুযায়ী দেখা যাবে—owner যেন নিজের জীবন অপারেটিং history বুঝতে পারেন।">
      <section className={styles.section}>
        <div className={styles.timelineList}>
          {days.map((day) => (
            <article className={styles.timelineDay} key={day}>
              <h3>{day === '2026-06-12' ? 'Today' : day === '2026-06-11' ? 'Yesterday' : day}</h3>
              <ul>
                {groups[day].map((item) => (
                  <li key={item.id}><strong>{formatBanglaDateTime(item.createdAt)}</strong> — {getIntentLabel(item.intent)} saved: {item.title}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </OsPage>
  );
}
