import type { Metadata } from 'next';
import { meetings, memoryItems, marketingMetrics } from '@/lib/shaikh-os-memory';
import { buildChiefOfStaffBriefing, type BriefingItem } from '@/lib/shaikh-os-intelligence';
import CommandForm from './CommandForm';
import OsNav from './_components/OsNav';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'আজ | Shaikh OS',
  description: 'Shaikh OS daily command center: brief, pending tasks, signals, personal health, next actions, and command input.'
};

const banglaNumber = new Intl.NumberFormat('bn-BD');
export const dynamic = 'force-dynamic';

export default function ShaikhOSPage() {
  const briefing = buildChiefOfStaffBriefing();
  const urgentTasks = memoryItems.filter((item) => item.intent === 'task' && item.priority === 'high');
  const pendingFollowUps = marketingMetrics.find((metric) => metric.label === 'Pending Follow Ups');

  return (
    <main className={styles.dashboardShell}>
      <OsNav />
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>আজ</p>
          <h1>আপনার দিনের শান্ত কমান্ড সেন্টার</h1>
          <p className={styles.subtitle}>কাজ, স্মৃতি, স্বাস্থ্য সংকেত আর পরের পদক্ষেপ—সবকিছু সহজভাবে সাজানো। আপনি শুধু বলুন, Shaikh OS আগে বুঝে নেবে।</p>
          <div className={styles.heroActions}>
            <a href="#command" className={styles.primaryButton}>Shaikh OS-কে বলুন</a>
            <a href="#briefing" className={styles.secondaryButton}>আজকের সারাংশ</a>
            <a href="/os/operations" className={styles.secondaryButton}>কাজ খুলুন</a>
          </div>
        </div>
        <aside className={styles.statusConsole} aria-label="আজকের সংক্ষিপ্ত অবস্থা">
          <div className={styles.consoleHeader}><span>Today Brief</span><strong>শান্ত ফোকাস</strong></div>
          <div className={styles.consoleMetric}><span>প্রস্তুতি</span><strong>{formatPercent(86)}</strong></div>
          <div className={styles.consoleRows}>
            <span>আজকের সারাংশ প্রস্তুত</span>
            <span>{banglaNumber.format(urgentTasks.length)}টি জরুরি কাজ</span>
            <span>{banglaNumber.format(meetings.length)}টি মিটিং দেখা দরকার</span>
            <span>{pendingFollowUps?.value ?? '০'}টি follow-up বাকি</span>
          </div>
        </aside>
      </section>

      <section id="briefing" className={styles.section}>
        <div className={styles.sectionHeader}><p className={styles.eyebrow}>Today Brief</p><h2>আজ কী গুরুত্বপূর্ণ</h2><p>শুধু দরকারি সংকেতগুলো রাখা হয়েছে—যেখানে তথ্য নেই, সেখানে আপনাকে চাপ দেওয়া হবে না।</p></div>
        <div className={styles.briefingGrid}>
          <BriefingColumn title="Pending Tasks" items={briefing.urgentTasks} empty="এখনো কিছু যোগ হয়নি। আপনি চাইলে এখান থেকে শুরু করতে পারেন।" />
          <BriefingColumn title="Important Signals" items={briefing.pendingFollowUps} empty="এখনো এই বিষয়ে কোনো তথ্য পাওয়া যায়নি।" />
          <BriefingColumn title="Health/Personal Signal" items={briefing.healthWarnings} empty="স্বাস্থ্য নিয়ে নতুন কোনো সতর্কতা নেই।" />
          <BriefingColumn title="Next Actions" items={[...briefing.upcomingMeetings, ...briefing.opportunities].slice(0, 5)} empty="পরের পদক্ষেপ এখনো তৈরি হয়নি।" />
        </div>
      </section>

      <section id="command" className={styles.section}>
        <div className={styles.commandBox}>
          <div>
            <p className={styles.eyebrow}>Ask Shaikh OS</p>
            <h2>আজ কী ঘটেছে?</h2>
            <p>কাজ, স্মৃতি, আইডিয়া, স্বাস্থ্য বা follow-up—স্বাভাবিক ভাষায় বলুন। আমি আগে বুঝে নেব, তারপর আপনার অনুমতি নিয়ে সংরক্ষণ করব।</p>
          </div>
          <CommandForm />
        </div>
      </section>
    </main>
  );
}

function BriefingColumn({ title, items, empty }: { title: string; items: BriefingItem[]; empty: string }) {
  return <article className={styles.briefingCard}><h3>{title}</h3>{items.length ? <ul>{items.map((item) => <li data-tone={item.tone ?? 'neutral'} key={item.id}><a href={item.href}><strong>{item.title}</strong><span>{item.detail}</span></a></li>)}</ul> : <p>{empty}</p>}</article>;
}

function formatPercent(value: number) { return `${banglaNumber.format(value)}%`; }
