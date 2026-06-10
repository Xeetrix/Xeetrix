import styles from './page.module.css';

const focusAreas = [
  {
    label: 'KNLTC',
    role: 'Sales & Marketing Manager',
    priority: 'Priority 1',
    summary: 'Lead generation, follow-up, content, team monitoring, and first client closing.',
    metrics: ['0 closed clients yet', 'Commission model planned', 'Cash flow priority'],
  },
  {
    label: 'Islamic School',
    role: 'Academic In-charge',
    priority: 'Priority 2',
    summary: 'Academic operations, teacher coordination, student affairs, and daily institutional responsibilities.',
    metrics: ['60+ students', '4–5 teachers', 'Stable base'],
  },
  {
    label: 'Xeetrix',
    role: 'Founder Vision',
    priority: 'Priority 3',
    summary: 'Technology parent brand for AI systems, education platforms, automation, and future products.',
    metrics: ['AI Agent Platform', 'Education vision', 'Long-term asset'],
  },
  {
    label: 'Investments',
    role: 'Monitor & Decide',
    priority: 'Priority 4',
    summary: 'Pigeon project and other small investments need light tracking, not daily attention.',
    metrics: ['Pigeon project', 'Low-time mode', 'Optional growth'],
  },
];

const todayBlocks = [
  {
    title: 'Critical Focus',
    items: ['KNLTC lead follow-up', 'One conversion-focused marketing action', 'Cash-flow related decision'],
  },
  {
    title: 'Academic Duty',
    items: ['School operations check', 'Teacher/student issue review', 'Tomorrow academic preparation'],
  },
  {
    title: 'Personal Stability',
    items: ['Sleep target check', 'Food/water reminder', 'Ibadah and emotional reset'],
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
          <p className={styles.eyebrow}>Personal Command Center</p>
          <h1>Shaikh OS</h1>
          <p className={styles.subtitle}>
            A visual operating system to organize KNLTC, school responsibilities, Xeetrix vision,
            investments, health, time, money, and daily execution in one place.
          </p>
          <div className={styles.actions}>
            <a href="#today" className={styles.primaryButton}>Plan Today</a>
            <a href="#projects" className={styles.secondaryButton}>View Projects</a>
          </div>
        </div>

        <aside className={styles.agentCard}>
          <div className={styles.cardHeader}>
            <span>Shaikh Agent</span>
            <strong>Training Mode</strong>
          </div>
          <div className={styles.agentPrompt}>
            <p>“Tell me everything in your head. I will sort it into projects, tasks, risks, and priorities.”</p>
          </div>
          <div className={styles.agentGrid}>
            <span>Think clearly</span>
            <span>Decide clearly</span>
            <span>Execute consistently</span>
          </div>
        </aside>
      </section>

      <section id="today" className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Today</p>
          <h2>Daily Control Board</h2>
          <p>Start every day by reducing noise and choosing the few actions that matter most.</p>
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
          <p className={styles.eyebrow}>Projects</p>
          <h2>Life Areas & Active Responsibilities</h2>
          <p>Each area has a role, a priority, and a clear operating mode.</p>
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
            <p className={styles.eyebrow}>Personal Systems</p>
            <h2>Not another task app. A warehouse for your mind.</h2>
            <p className={styles.commandText}>
              Shaikh OS starts as a visual command center. Later it will connect with Shaikh Agent,
              KNLTC leads, notes, finance, reminders, and weekly reviews.
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
