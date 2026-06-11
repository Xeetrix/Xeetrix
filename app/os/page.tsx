import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAgentProjects, getAgentTasks } from '@/lib/xeetrix-agent';
import CommandForm from './CommandForm';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Shaikh OS ড্যাশবোর্ড | Xeetrix',
  description: 'প্রকল্প, কাজ, নোট, দৈনিক ফোকাস এবং ভবিষ্যৎ AI নির্দেশনার জন্য একটি গাঢ় ব্যক্তিগত কর্মড্যাশবোর্ড।'
};

const notes = [
  {
    title: 'সিদ্ধান্তের রেকর্ড',
    copy: 'দৈনিক কাজ পরিষ্কার রাখতে জরুরি নগদপ্রবাহের পদক্ষেপকে দীর্ঘমেয়াদি Xeetrix পণ্যকাজ থেকে আলাদা রাখুন।'
  },
  {
    title: 'মিটিং স্মৃতি',
    copy: 'স্টেকহোল্ডারদের অনুরোধ আগে নোট হিসেবে রাখুন, তারপর শুধু নিশ্চিত প্রতিশ্রুতিগুলোকে কাজে রূপান্তর করুন।'
  },
  {
    title: 'Supabase-প্রস্তুত ডেটা',
    copy: 'প্রকল্প, কাজ, নোট ও ফোকাস ব্লক এখন অ্যারে কাঠামোতে সাজানো; পরে সরাসরি ডেটাবেস সারিতে যুক্ত করা যাবে।'
  },
];

const banglaNumber = new Intl.NumberFormat('bn-BD');

const focusBlocks = [
  { label: 'প্রধান ফোকাস', value: 'আয়ের চক্র সম্পন্ন করুন', detail: 'প্রশাসনিক কাজের আগে একটি বিক্রয়-সম্পর্কিত পদক্ষেপ শেষ করুন।' },
  { label: 'শক্তি সুরক্ষা', value: 'আগে গভীর কাজ', detail: 'প্রধান কাজ শেষ না হওয়া পর্যন্ত ছড়ানো মনোযোগে কাজ বদলাবেন না।' },
  { label: 'দিনশেষ পর্যালোচনা', value: '১৫ মিনিট রিসেট', detail: 'অসমাপ্ত কাজ সরান, ছোট নোট লিখুন, আগামীকাল পরিকল্পনা করুন।' },
];

export const dynamic = 'force-dynamic';

export default function ShaikhOSPage() {
  return (
    <main className={styles.dashboardShell}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Shaikh OS ড্যাশবোর্ড</p>
          <h1>প্রকল্প, কাজ, নোট ও ফোকাসের জন্য একীভূত গাঢ় কমান্ড সেন্টার।</h1>
          <p className={styles.subtitle}>
            দৈনিক বাস্তবায়ন, ভবিষ্যৎ Supabase সংরক্ষণ এবং স্বাভাবিক ভাষাকে কাঠামোবদ্ধ কাজে রূপান্তরের জন্য তৈরি ডেস্কটপ-প্রথম ব্যক্তিগত অপারেটিং ড্যাশবোর্ড।
          </p>
          <div className={styles.heroActions}>
            <a href="#projects" className={styles.primaryButton}>ড্যাশবোর্ড খুলুন</a>
            <a href="#command" className={styles.secondaryButton}>AI নির্দেশনা বক্স</a>
          </div>
        </div>

        <aside className={styles.statusConsole} aria-label="ড্যাশবোর্ড সিস্টেম অবস্থা">
          <div className={styles.consoleHeader}>
            <span>সিস্টেম অবস্থা</span>
            <strong>Supabase প্রস্তুত</strong>
          </div>
          <div className={styles.consoleMetric}>
            <span>আজকের স্কোর</span>
            <strong>{formatPercent(86)}</strong>
          </div>
          <div className={styles.consoleRows}>
            <span>প্রকল্প স্কিমা সিঙ্কড</span>
            <span>কাজের অগ্রাধিকার তালিকা</span>
            <span>নোট জ্ঞানস্তর</span>
            <span>AI নির্দেশনা প্রস্তুত</span>
          </div>
        </aside>
      </section>

      <section id="projects" className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>প্রকল্পসমূহ</p>
          <h2>কর্মক্ষেত্রসমূহ</h2>
          <p>দায়িত্বের মালিকানা, পরবর্তী পদক্ষেপ এবং অগ্রগতি—সবকিছু Supabase সংযোগের জন্য প্রস্তুতভাবে অনুসরণ করুন।</p>
        </div>
        <Suspense fallback={<ProjectsLoadingState />}>
          <ProjectsGrid />
        </Suspense>
      </section>

      <section id="tasks" className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>কাজসমূহ</p>
          <h2>কাজের তালিকা</h2>
          <p>দৈনিক পরিচালনার জন্য ফোকাসড কাজের তালিকা—জরুরিতা, প্রকল্পপ্রসঙ্গ ও সময়-ব্লক অনুযায়ী সাজানো।</p>
        </div>
        <Suspense fallback={<TasksLoadingState />}>
          <TasksBoard />
        </Suspense>
      </section>

      <section id="notes" className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>নোটসমূহ</p>
          <h2>নোট ও ধারণা</h2>
          <p>পর্যবেক্ষণ, সিদ্ধান্ত ও কাঁচা ভাবনাগুলো কাজ হওয়ার মতো প্রস্তুত না হওয়া পর্যন্ত অ্যাকশন আইটেম থেকে আলাদা রাখুন।</p>
        </div>
        <div className={styles.notesGrid}>
          {notes.map((note) => (
            <article key={note.title} className={styles.noteCard}>
              <h3>{note.title}</h3>
              <p>{note.copy}</p>
            </article>
          ))}
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

async function ProjectsGrid() {
  const projects = await loadProjects();

  if (projects.length === 0) {
    return (
      <div className={styles.projectGrid}>
        <article className={styles.projectCard}>
          <div className={styles.cardTopline}>
            <span>কোনো প্রকল্প নেই</span>
            <strong>{formatPercent(0)}</strong>
          </div>
          <h3>সক্রিয় প্রকল্প পাওয়া যায়নি</h3>
          <p>Xeetrix Agent ব্যাকএন্ডে প্রকল্প পাওয়া গেলে সেগুলো এখানে দেখা যাবে।</p>
          <div className={styles.progressTrack} aria-label="সক্রিয় প্রকল্প নেই—অগ্রগতি">
            <span style={{ width: '0%' }} />
          </div>
          <small>পরবর্তী: Xeetrix Agent-এ একটি প্রকল্প যোগ বা সিঙ্ক করুন।</small>
        </article>
      </div>
    );
  }

  return (
    <div className={styles.projectGrid}>
      {projects.map((project) => (
        <article key={project.id} className={styles.projectCard}>
          <div className={styles.cardTopline}>
            <span>{project.status}</span>
            <strong>{formatPercent(project.progress)}</strong>
          </div>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          <div className={styles.progressTrack} aria-label={`${project.name} অগ্রগতি`}>
            <span style={{ width: `${project.progress}%` }} />
          </div>
          <small>পরবর্তী: {project.next}</small>
        </article>
      ))}
    </div>
  );
}

async function TasksBoard() {
  const tasks = await loadTasks();

  if (tasks.length === 0) {
    return (
      <div className={styles.taskBoard}>
        <article className={styles.taskRow}>
          <div>
            <h3>সক্রিয় কাজ পাওয়া যায়নি</h3>
            <p>Xeetrix Agent ব্যাকএন্ডে কাজ পাওয়া গেলে সেগুলো এখানে দেখা যাবে।</p>
          </div>
          <span>—</span>
          <strong data-priority="Low">খালি</strong>
        </article>
      </div>
    );
  }

  return (
    <div className={styles.taskBoard}>
      {tasks.map((task) => (
        <article key={task.id} className={styles.taskRow}>
          <div>
            <h3>{task.title}</h3>
            <p>{task.project}</p>
          </div>
          <span>{task.due}</span>
          <strong data-priority={task.priorityTone}>{task.priorityLabel}</strong>
        </article>
      ))}
    </div>
  );
}

function ProjectsLoadingState() {
  return (
    <div className={styles.projectGrid}>
      <article className={styles.projectCard}>
        <div className={styles.cardTopline}>
          <span>লোড হচ্ছে</span>
          <strong>লাইভ</strong>
        </div>
        <h3>সক্রিয় প্রকল্প লোড হচ্ছে…</h3>
        <p>সর্বশেষ প্রকল্প মেমরির জন্য Xeetrix Agent ব্যাকএন্ডে সংযোগ করা হচ্ছে।</p>
        <div className={styles.progressTrack} aria-label="সক্রিয় প্রকল্প লোড হচ্ছে—অগ্রগতি">
          <span style={{ width: '42%' }} />
        </div>
        <small>পরবর্তী: প্রকল্প কর্মক্ষেত্র সিঙ্ক হচ্ছে।</small>
      </article>
    </div>
  );
}

function TasksLoadingState() {
  return (
    <div className={styles.taskBoard}>
      <article className={styles.taskRow}>
        <div>
          <h3>সক্রিয় কাজ লোড হচ্ছে…</h3>
          <p>Xeetrix Agent ব্যাকএন্ডে সংযোগ করা হচ্ছে।</p>
        </div>
        <span>—</span>
        <strong data-priority="Medium">লোড হচ্ছে</strong>
      </article>
    </div>
  );
}

async function loadProjects() {
  try {
    return await getAgentProjects();
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function loadTasks() {
  try {
    return await getAgentTasks();
  } catch (error) {
    console.error(error);
    return [];
  }
}
