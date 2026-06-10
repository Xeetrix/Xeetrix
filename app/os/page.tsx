import styles from './page.module.css';

const focusAreas = [
  {
    label: 'KNLTC',
    role: 'সেলস ও মার্কেটিং ম্যানেজার',
    priority: 'প্রায়োরিটি ১',
    summary: 'লিড জেনারেশন, ফলোআপ, কনটেন্ট, টিম মনিটরিং এবং প্রথম ক্লায়েন্ট ক্লোজ করাই এখন মূল লক্ষ্য।',
    metrics: ['এখনো ০ ক্লোজড ক্লায়েন্ট', 'কমিশন মডেল পরিকল্পিত', 'ক্যাশ ফ্লো সবচেয়ে জরুরি'],
  },
  {
    label: 'ইসলামিক স্কুল',
    role: 'একাডেমিক ইনচার্জ',
    priority: 'প্রায়োরিটি ২',
    summary: 'একাডেমিক অপারেশন, শিক্ষক সমন্বয়, ছাত্র ব্যবস্থাপনা এবং প্রতিষ্ঠানের দৈনন্দিন দায়িত্ব।',
    metrics: ['৬০+ শিক্ষার্থী', '৪–৫ জন শিক্ষক', 'স্থিতিশীল ভিত্তি'],
  },
  {
    label: 'Xeetrix',
    role: 'ফাউন্ডার ভিশন',
    priority: 'প্রায়োরিটি ৩',
    summary: 'AI সিস্টেম, এডুকেশন প্ল্যাটফর্ম, অটোমেশন এবং ভবিষ্যৎ প্রোডাক্টের জন্য টেক parent brand।',
    metrics: ['AI Agent Platform', 'এডুকেশন ভিশন', 'দীর্ঘমেয়াদি asset'],
  },
  {
    label: 'ইনভেস্টমেন্ট',
    role: 'মনিটর ও সিদ্ধান্ত',
    priority: 'প্রায়োরিটি ৪',
    summary: 'কবুতর প্রজেক্ট এবং অন্যান্য ছোট ইনভেস্টমেন্ট হালকা মনিটরিং দরকার, প্রতিদিনের মূল ফোকাস না।',
    metrics: ['কবুতর প্রজেক্ট', 'কম সময়ের মনিটরিং', 'অপশনাল গ্রোথ'],
  },
];

const todayBlocks = [
  {
    title: 'জরুরি ফোকাস',
    items: ['KNLTC লিড ফলোআপ', 'একটি conversion-focused marketing action', 'ক্যাশ ফ্লো সম্পর্কিত সিদ্ধান্ত'],
  },
  {
    title: 'একাডেমিক দায়িত্ব',
    items: ['স্কুল অপারেশন চেক', 'শিক্ষক/শিক্ষার্থী বিষয় review', 'আগামী দিনের academic preparation'],
  },
  {
    title: 'ব্যক্তিগত স্থিতিশীলতা',
    items: ['ঘুমের টার্গেট চেক', 'খাবার/পানি reminder', 'ইবাদত ও emotion reset'],
  },
];

const personalSystems = [
  'Brain Dump',
  'Daily Priority',
  'Weekly Review',
  'Money Check',
  'Health Check-in',
  'Emotion Reset',
];

export default function ShaikhOSPage() {
  return (
    <main className={styles.osShell}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>পার্সোনাল কমান্ড সেন্টার</p>
          <h1>Shaikh OS</h1>
          <p className={styles.subtitle}>
            KNLTC, স্কুলের দায়িত্ব, Xeetrix ভিশন, ইনভেস্টমেন্ট, স্বাস্থ্য, সময়, টাকা
            এবং দৈনন্দিন কাজ—সবকিছু এক জায়গায় সাজানোর জন্য একটি visual operating system।
          </p>
          <div className={styles.actions}>
            <a href="#today" className={styles.primaryButton}>আজকের প্ল্যান</a>
            <a href="#projects" className={styles.secondaryButton}>প্রজেক্ট দেখুন</a>
          </div>
        </div>

        <aside className={styles.agentCard}>
          <div className={styles.cardHeader}>
            <span>Shaikh Agent</span>
            <strong>Training Mode</strong>
          </div>
          <div className={styles.agentPrompt}>
            <p>“মাথায় যা আছে সব লিখে দিন। আমি এগুলোকে প্রজেক্ট, কাজ, ঝুঁকি এবং priority অনুযায়ী সাজিয়ে দেব।”</p>
          </div>
          <div className={styles.agentGrid}>
            <span>পরিষ্কারভাবে চিন্তা</span>
            <span>পরিষ্কারভাবে সিদ্ধান্ত</span>
            <span>নিয়মিত execution</span>
          </div>
        </aside>
      </section>

      <section id="today" className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>আজ</p>
          <h2>Daily Control Board</h2>
          <p>প্রতিদিন noise কমিয়ে সবচেয়ে গুরুত্বপূর্ণ অল্প কয়েকটি কাজ বেছে নেওয়ার জায়গা।</p>
        </div>
        <div className={styles.todayGrid}>
          {todayBlocks.map((block) => (
            <article key={block.title} className={styles.panel}>
              <h3>{block.title}</h3>
              <ul>
                {block.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="projects" className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>প্রজেক্ট</p>
          <h2>জীবনের প্রধান দায়িত্ব ও active areas</h2>
          <p>প্রতিটি area-র role, priority এবং operating mode পরিষ্কারভাবে দেখা যাবে।</p>
        </div>
        <div className={styles.projectGrid}>
          {focusAreas.map((area) => (
            <article key={area.label} className={styles.projectCard}>
              <div className={styles.projectTopline}>
                <span>{area.priority}</span>
                <strong>{area.role}</strong>
              </div>
              <h3>{area.label}</h3>
              <p>{area.summary}</p>
              <div className={styles.metricList}>
                {area.metrics.map((metric) => <span key={metric}>{metric}</span>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.commandLayout}>
          <div>
            <p className={styles.eyebrow}>পার্সোনাল সিস্টেম</p>
            <h2>আরেকটা task app না। এটা আপনার মাথার warehouse।</h2>
            <p className={styles.commandText}>
              Shaikh OS প্রথমে visual command center হিসেবে শুরু হচ্ছে। পরে এটি Shaikh Agent,
              KNLTC leads, notes, finance, reminders এবং weekly review-এর সাথে connect হবে।
            </p>
          </div>
          <div className={styles.systemGrid}>
            {personalSystems.map((system) => <span key={system}>{system}</span>)}
          </div>
        </div>
      </section>
    </main>
  );
}
