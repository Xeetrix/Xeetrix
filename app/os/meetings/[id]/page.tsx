import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OsPage, { styles } from '../../_components/OsPage';
import RelatedItems from '../../_components/RelatedItems';
import { formatBanglaDateTime, meetings } from '@/lib/shaikh-os-memory';

export const metadata: Metadata = { title: 'Meeting Detail | Shaikh OS' };

type PageProps = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return meetings.map((meeting) => ({ id: meeting.id }));
}

export default async function MeetingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const meeting = meetings.find((entry) => entry.id === id);
  if (!meeting) notFound();

  return (
    <OsPage eyebrow="Meeting Detail" title={meeting.title} subtitle={meeting.outcome}>
      <section className={styles.section}>
        <article className={styles.card}>
          <p className={styles.cardMeta}>{meeting.project} · {formatBanglaDateTime(meeting.date)}</p>
          <h3>Meeting Notes</h3>
          <p>{meeting.notes}</p>
          <p><strong>Participants:</strong> {meeting.participants.join(', ')}</p>
          <p><strong>Outcome:</strong> {meeting.outcome}</p>
        </article>
      </section>
      <section className={styles.section}>
        <article className={styles.card}>
          <RelatedItems type="meeting" id={meeting.id} />
        </article>
      </section>
    </OsPage>
  );
}
