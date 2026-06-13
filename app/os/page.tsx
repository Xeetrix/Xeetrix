import type { Metadata } from 'next';
import { meetings, memoryItems, marketingMetrics } from '@/lib/shaikh-os-memory';
import { buildChiefOfStaffBriefing, type BriefingItem } from '@/lib/shaikh-os-intelligence';
import CommandForm from './CommandForm';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Today | Shaikh OS',
  description: 'আজ কী attention দরকার—Daily Briefing, urgent tasks, meetings, follow ups, agent alerts এবং focus project।'
};

const banglaNumber = new Intl.NumberFormat('bn-BD');

const primaryNav = [
  { href: '/os', label: 'Today' },
  { href: '/os/memory', label: 'Memory' },
  { href: '/os/operations', label: 'Operations' },
  { href: '/os/personal', label: 'Personal' },
  { href: '/os/agent', label: 'Agent' },
];

export const dynamic = 'force-dynamic';

export default function ShaikhOSPage() {
  const briefing = buildChiefOfStaffBriefing();
  const urgentTasks = memoryItems.filter((item) => item.intent === 'task' && item.priority === 'high');
  const pendingFollowUps = marketingMetrics.find((metric) => metric.label === 'Pending Follow Ups');

  return (
    <main className={styles.dashboardShell}>
      <nav className={styles.osNav} aria-label="Shaikh OS primary sections">
        {primaryNav.map((item) => (
          <a href={item.href} key={item.href}>{item.label}</a>
        ))}
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Today</p>
          <h1>আজ কী attention দরকার?</h1>
          <p className={styles.subtitle}>
            Shaikh OS এখন workflow-first: briefing, urgent কাজ, upcoming meetings, pending follow ups, agent alerts এবং একটিমাত্র focus project আগে দেখায়।
          </p>
          <div className={styles.heroActions}>
            <a href="#briefing" className={styles.primaryButton}>Daily Briefing দেখুন</a>
            <a href="#urgent" className={styles.secondaryButton}>Urgent Tasks</a>
            <a href="/os/operations" className={styles.secondaryButton}>Operations খুলুন</a>
          </div>
        </div>

        <aside className={styles.statusConsole} aria-label="আজকের ফোকাস অবস্থা">
          <div className={styles.consoleHeader}>
            <span>আজকের অপারেটিং প্রশ্ন</span>
            <strong>Focus first</strong>
          </div>
          <div className={styles.consoleMetric}>
            <span>Today readiness</span>
            <strong>{formatPercent(86)}</strong>
          </div>
          <div className={styles.consoleRows}>
            <span>Daily Briefing প্রস্তুত</span>
            <span>{urgentTasks.length} urgent task attention চাই</span>
            <span>{meetings.length} upcoming meeting review</span>
            <span>{pendingFollowUps?.value ?? '০'} pending follow ups</span>
          </div>
        </aside>
      </section>

      <section id="briefing" className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Daily Briefing</p>
          <h2>Agent Daily Briefing</h2>
          <p>AI Chief of Staff আজ urgent কাজ, meeting, follow-up, health/finance warning, opportunity এবং open question একসাথে সাজিয়েছে।</p>
        </div>
        <div className={styles.briefingGrid}>
          <BriefingColumn title="আজকের জরুরি কাজ" items={briefing.urgentTasks} empty="আজ high-priority task নেই। Command box থেকে নতুন priority যোগ করুন।" />
          <BriefingColumn title="Upcoming meetings" items={briefing.upcomingMeetings} empty="আজ কোনো upcoming meeting পাওয়া যায়নি।" />
          <BriefingColumn title="Pending follow-ups" items={briefing.pendingFollowUps} empty="Follow-up queue পরিষ্কার।" />
          <BriefingColumn title="Health warnings" items={briefing.healthWarnings} empty="স্বাস্থ্য warning নেই—energy routine বজায় রাখুন।" />
          <BriefingColumn title="Finance warnings" items={briefing.financeWarnings} empty="অর্থ warning নেই—নতুন expense/income log করলে এখানে আসবে।" />
          <BriefingColumn title="Opportunities" items={briefing.opportunities} empty="নতুন opportunity নেই। Idea capture করলে Memory ও Agent-এ দেখা যাবে।" />
          <BriefingColumn title="Open questions" items={briefing.openQuestions} empty="আজ agent-এর কোনো open question নেই।" />
        </div>
      </section>

      <section id="command" className={styles.section}>
        <div className={styles.commandBox}>
          <div>
            <p className={styles.eyebrow}>AI নির্দেশনা</p>
            <h2>Shaikh OS-কে জানান কী পরিবর্তন হয়েছে।</h2>
            <p>
              স্বাভাবিক ভাষায় Shaikh OS মেমরিতে আপডেট যোগ করুন, যাতে সিস্টেম কাজ তৈরি করতে, প্রকল্প হালনাগাদ রাখতে এবং প্রতিটি নির্দেশনার পর ড্যাশবোর্ড রিফ্রেশ করতে পারে।
            </p>
          </div>
          <CommandForm />
        </div>
      </section>
    </main>
  );
}


function BriefingColumn({ title, items, empty }: { title: string; items: BriefingItem[]; empty: string }) {
  return (
    <article className={styles.briefingCard}>
      <h3>{title}</h3>
      {items.length ? (
        <ul>
          {items.map((item) => (
            <li data-tone={item.tone ?? 'neutral'} key={item.id}>
              <a href={item.href}>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : <p>{empty}</p>}
    </article>
  );
}

function formatPercent(value: number) {
  return `${banglaNumber.format(value)}%`;
}
