import type { Metadata } from 'next';
import OsPage, { styles } from '../_components/OsPage';
import { meetings, memoryItems } from '@/lib/shaikh-os-memory';

export const metadata: Metadata = { title: 'Daily Briefing | Shaikh OS' };

export default function BriefingPage() {
  const urgentTasks = memoryItems.filter((item) => item.intent === 'task' && item.priority === 'high');
  const ideas = memoryItems.filter((item) => item.intent === 'idea');
  const healthCount = memoryItems.filter((item) => item.intent === 'health_log').length;
  return (
    <OsPage eyebrow="Daily Briefing" title="আজ কী attention দরকার?" subtitle="Chief of Staff briefing urgent work, meetings, follow-ups, warnings এবং opportunities একসাথে তুলে ধরে।">
      <section className={styles.section}>
        <div className={styles.twoColumn}>
          <article className={styles.briefingPanel}>
            <h3>Today Focus</h3>
            <ul>{urgentTasks.map((task) => <li key={task.id}>{task.title}</li>)}</ul>
          </article>
          <article className={styles.briefingPanel}>
            <h3>Upcoming Meetings</h3>
            <ul>{meetings.map((meeting) => <li key={meeting.id}>{meeting.title} — {meeting.project}</li>)}</ul>
          </article>
          <article className={`${styles.briefingPanel} ${styles.warning}`}>
            <h3>Warnings</h3>
            <ul><li>{healthCount + 2} health-related notes this week — sleep/headache pattern monitor করুন।</li><li>১৭ pending follow ups owner review চাই।</li></ul>
          </article>
          <article className={`${styles.briefingPanel} ${styles.good}`}>
            <h3>Opportunities</h3>
            <ul>{ideas.map((idea) => <li key={idea.id}>New Xeetrix idea detected: {idea.title}</li>)}</ul>
          </article>
        </div>
      </section>
    </OsPage>
  );
}
