import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OsPage, { styles } from '../../_components/OsPage';
import RelatedItems from '../../_components/RelatedItems';
import { formatBanglaDateTime, memoryItems } from '@/lib/shaikh-os-memory';

export const metadata: Metadata = { title: 'Task Detail | Shaikh OS' };

type PageProps = { params: Promise<{ id: string }> };
const tasks = memoryItems.filter((item) => item.intent === 'task');

export function generateStaticParams() {
  return tasks.map((task) => ({ id: task.id }));
}

export default async function TaskDetailPage({ params }: PageProps) {
  const { id } = await params;
  const task = tasks.find((entry) => entry.id === id);
  if (!task) notFound();

  return (
    <OsPage eyebrow="Task Detail" title={task.title} subtitle={task.summary}>
      <section className={styles.section}>
        <article className={styles.card}>
          <p className={styles.cardMeta}>{task.project} · {formatBanglaDateTime(task.createdAt)}</p>
          <h3>Execution Summary</h3>
          <p>{task.summary}</p>
          <p><strong>Priority:</strong> {task.priority ?? 'medium'}</p>
          <div className={styles.badgeRow}>{task.tags.map((tag) => <span className={styles.badge} key={tag}>{tag}</span>)}</div>
        </article>
      </section>
      <section className={styles.section}>
        <article className={styles.card}>
          <RelatedItems type="task" id={task.id} />
        </article>
      </section>
    </OsPage>
  );
}
