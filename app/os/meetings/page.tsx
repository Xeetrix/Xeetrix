import type { Metadata } from 'next';
import OsPage, { styles } from '../_components/OsPage';
import { formatBanglaDateTime, meetings } from '@/lib/shaikh-os-memory';

export const metadata: Metadata = { title: 'Meetings | Shaikh OS' };

export default function MeetingsPage() {
  return <OsPage eyebrow="Meeting System" title="মিটিং, participants, notes এবং outcome." subtitle="প্রতিটি আলোচনা শুধু calendar event নয়—decision memory ও follow-up source।"><section className={styles.section}><div className={styles.grid}>{meetings.map((meeting) => <article className={styles.card} key={meeting.id}><p className={styles.cardMeta}>{meeting.project} · {formatBanglaDateTime(meeting.date)}</p><h3>{meeting.title}</h3><p>Participants: {meeting.participants.join(', ')}</p><p>{meeting.notes}</p><p><strong>Outcome:</strong> {meeting.outcome}</p></article>)}</div></section></OsPage>;
}
