import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAgentTasks } from '@/lib/xeetrix-agent';
import { meetings, memoryItems, marketingMetrics } from '@/lib/shaikh-os-memory';
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

const focusBlocks = [
  { label: 'প্রধান ফোকাস', value: 'আয়ের চক্র সম্পন্ন করুন', detail: 'প্রশাসনিক কাজের আগে একটি বিক্রয়-সম্পর্কিত পদক্ষেপ শেষ করুন।' },
  { label: 'শক্তি সুরক্ষা', value: 'আগে গভীর কাজ', detail: 'প্রধান কাজ শেষ না হওয়া পর্যন্ত ছড়ানো মনোযোগে কাজ বদলাবেন না।' },
  { label: 'দিনশেষ পর্যালোচনা', value: '১৫ মিনিট রিসেট', detail: 'অসমাপ্ত কাজ সরান, ছোট নোট লিখুন, আগামীকাল পরিকল্পনা করুন।' },
];

export const dynamic = 'force-dynamic';

export default function ShaikhOSPage() {
  const urgentTasks = memoryItems.filter((item) => item.intent === 'task' && item.priority === 'high');
  const pendingFollowUps = marketingMetrics.find((metric) => metric.label === 'Pending Follow Ups');
  const healthSignals = memoryItems.filter((item) => item.intent === 'health_log');
  const agentIdeas = memoryItems.filter((item) => item.intent === 'idea');

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
          <h2>আজকের executive scan</h2>
          <p>Homepage data dump নয়—শুধু যেগুলো আজ owner attention, decision বা follow-up দরকার সেগুলো দেখানো হচ্ছে।</p>
        </div>
        <div className={styles.todayGrid}>
          <article className={styles.todayCard}>
            <span>Briefing</span>
            <h3>Revenue এবং delivery আগে</h3>
            <p>KNLTC lead follow-up ও Islamic School admission report আজকের প্রধান operational lane।</p>
            <a href="/os/briefing">Full briefing route</a>
          </article>
          <article id="urgent" className={styles.todayCard}>
            <span>Urgent Tasks</span>
            <h3>{urgentTasks.length} urgent কাজ</h3>
            <ul>{urgentTasks.map((task) => <li key={task.id}>{task.title}</li>)}</ul>
            <Suspense fallback={<TodayTasksLoadingState />}>
              <TodayTasksPreview />
            </Suspense>
          </article>
          <article className={styles.todayCard}>
            <span>Upcoming Meetings</span>
            <h3>পরবর্তী আলোচনা</h3>
            <ul>{meetings.map((meeting) => <li key={meeting.id}>{meeting.title} — {meeting.project}</li>)}</ul>
            <a href="/os/meetings">Meetings খুলুন</a>
          </article>
          <article className={styles.todayCard}>
            <span>Pending Follow Ups</span>
            <h3>{pendingFollowUps?.value ?? '০'} pending</h3>
            <p>{pendingFollowUps?.detail ?? 'Follow-up queue পরিষ্কার।'}</p>
            <a href="/os/marketing">Marketing follow ups</a>
          </article>
          <article className={`${styles.todayCard} ${styles.warningCard}`}>
            <span>Agent Alerts</span>
            <h3>Risk signals</h3>
            <ul>
              <li>{healthSignals.length} health notes — sleep/headache pattern monitor করুন।</li>
              <li>{agentIdeas.length} product idea agent review-এর জন্য অপেক্ষায়।</li>
            </ul>
            <a href="/os/agent">Agent view</a>
          </article>
          <article className={`${styles.todayCard} ${styles.focusTodayCard}`}>
            <span>Focus Project</span>
            <h3>KNLTC</h3>
            <p>আজ একটি sales-related action শেষ করুন, তারপর reporting/admin work-এ যান।</p>
            <a href="/os/operations">Operations workspace</a>
          </article>
        </div>
      </section>

      <section id="focus" className={styles.section}>
        <div className={styles.focusPanel}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>দৈনিক ফোকাস</p>
            <h2>আজকের কর্মপরিকল্পনা</h2>
            <p>এই অংশকে দৈনিক রিসেট স্তর হিসেবে ব্যবহার করুন: গুরুত্বপূর্ণ বিষয় ঠিক করুন, মনোযোগ সুরক্ষিত রাখুন এবং কাজের চক্র সম্পন্ন করুন।</p>
          </div>
          <div className={styles.focusGrid}>
            {focusBlocks.map((block) => (
              <article key={block.label}>
                <span>{block.label}</span>
                <h3>{block.value}</h3>
                <p>{block.detail}</p>
              </article>
            ))}
          </div>
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

function formatPercent(value: number) {
  return `${banglaNumber.format(value)}%`;
}

async function TodayTasksPreview() {
  const tasks = await loadTasks();
  const preview = tasks.slice(0, 2);

  if (preview.length === 0) {
    return <p>Live task board সংযুক্ত হলে Today preview এখানে দেখা যাবে।</p>;
  }

  return (
    <ul>
      {preview.map((task) => (
        <li key={task.id}>{task.title} — {task.priorityLabel}</li>
      ))}
    </ul>
  );
}

function TodayTasksLoadingState() {
  return <p>Live task preview লোড হচ্ছে…</p>;
}

async function loadTasks() {
  try {
    return await getAgentTasks();
  } catch (error) {
    console.error(error);
    return [];
  }
}
