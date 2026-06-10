import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Shaikh OS Dashboard | Xeetrix',
  description: 'A dark personal dashboard for projects, tasks, notes, daily focus, and future AI commands.',
};

const projects = [
  {
    name: 'KNLTC Growth Engine',
    status: 'Active',
    progress: 72,
    description: 'Lead generation, follow-up pipelines, content offers, and the first repeatable client closing system.',
    next: 'Review 12 warm leads and assign follow-up owners.',
  },
  {
    name: 'Islamic School Ops',
    status: 'Running',
    progress: 58,
    description: 'Academic planning, teacher coordination, student visibility, and daily operational accountability.',
    next: 'Confirm tomorrow\'s class coverage and parent notes.',
  },
  {
    name: 'Xeetrix AI Platform',
    status: 'Build',
    progress: 36,
    description: 'A product workspace for agents, education tools, automations, and future AI-assisted services.',
    next: 'Define dashboard data schema and Supabase tables.',
  },
  {
    name: 'Investment Watch',
    status: 'Monitor',
    progress: 44,
    description: 'A lightweight tracker for pigeon project updates, small investments, risks, and monthly decisions.',
    next: 'Log last cash movement and owner update.',
  },
];

const tasks = [
  { title: 'Call top KNLTC prospect', project: 'KNLTC', due: '09:30', priority: 'High' },
  { title: 'Approve school weekly routine', project: 'School', due: '11:00', priority: 'High' },
  { title: 'Write 1 conversion post', project: 'Marketing', due: '14:00', priority: 'Medium' },
  { title: 'Check cash-flow notes', project: 'Finance', due: '18:00', priority: 'Medium' },
  { title: 'Brain dump tomorrow ideas', project: 'Personal', due: '21:30', priority: 'Low' },
];

const notes = [
  {
    title: 'Decision log',
    copy: 'Separate urgent cash-flow actions from long-term Xeetrix product work so daily execution stays clean.',
  },
  {
    title: 'Meeting memory',
    copy: 'Capture stakeholder requests as notes first, then convert only confirmed commitments into tasks.',
  },
  {
    title: 'Supabase-ready data',
    copy: 'Projects, tasks, notes, and focus blocks are structured as arrays now and can map directly to database rows later.',
  },
];

const focusBlocks = [
  { label: 'Primary Focus', value: 'Close revenue loop', detail: 'One sales action before admin work.' },
  { label: 'Energy Guard', value: 'Deep work first', detail: 'No scattered switching until the main task is shipped.' },
  { label: 'End-of-day Review', value: '15 min reset', detail: 'Move unfinished tasks, write a short note, plan tomorrow.' },
];

export default function ShaikhOSPage() {
  return (
    <main className={styles.dashboardShell}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Shaikh OS Dashboard</p>
          <h1>One dark command center for projects, tasks, notes, and focus.</h1>
          <p className={styles.subtitle}>
            A desktop-first personal operating dashboard designed for daily execution, future Supabase persistence,
            and an AI command box that can later turn natural language into structured work.
          </p>
          <div className={styles.heroActions}>
            <a href="#projects" className={styles.primaryButton}>Open dashboard</a>
            <a href="#command" className={styles.secondaryButton}>AI command box</a>
          </div>
        </div>

        <aside className={styles.statusConsole} aria-label="Dashboard system status">
          <div className={styles.consoleHeader}>
            <span>System status</span>
            <strong>Supabase Ready</strong>
          </div>
          <div className={styles.consoleMetric}>
            <span>Today score</span>
            <strong>86%</strong>
          </div>
          <div className={styles.consoleRows}>
            <span>Projects synced schema</span>
            <span>Tasks priority queue</span>
            <span>Notes knowledge layer</span>
            <span>AI command reserved</span>
          </div>
        </aside>
      </section>

      <section id="projects" className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Projects</p>
          <h2>Strategic lanes</h2>
          <p>Track active responsibilities with ownership, next action, and progress states ready to connect to Supabase.</p>
        </div>
        <div className={styles.projectGrid}>
          {projects.map((project) => (
            <article key={project.name} className={styles.projectCard}>
              <div className={styles.cardTopline}>
                <span>{project.status}</span>
                <strong>{project.progress}%</strong>
              </div>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <div className={styles.progressTrack} aria-label={`${project.name} progress`}>
                <span style={{ width: `${project.progress}%` }} />
              </div>
              <small>Next: {project.next}</small>
            </article>
          ))}
        </div>
      </section>

      <section id="tasks" className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Tasks</p>
          <h2>Execution queue</h2>
          <p>A focused task list for daily operations, ordered by urgency, project context, and time block.</p>
        </div>
        <div className={styles.taskBoard}>
          {tasks.map((task) => (
            <article key={task.title} className={styles.taskRow}>
              <div>
                <h3>{task.title}</h3>
                <p>{task.project}</p>
              </div>
              <span>{task.due}</span>
              <strong data-priority={task.priority}>{task.priority}</strong>
            </article>
          ))}
        </div>
      </section>

      <section id="notes" className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Notes</p>
          <h2>Knowledge capture</h2>
          <p>Keep observations, decisions, and raw thoughts separate from action items until they are ready to become tasks.</p>
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
            <p className={styles.eyebrow}>Daily Focus</p>
            <h2>Today&apos;s operating rhythm</h2>
            <p>Use this area as the daily reset layer: decide what matters, protect attention, and close the loop.</p>
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
            <p className={styles.eyebrow}>Future AI Command</p>
            <h2>Tell Shaikh OS what changed.</h2>
            <p>
              Placeholder command input for a future AI layer that can create projects, schedule tasks,
              summarize notes, and write updates back to Supabase.
            </p>
          </div>
          <form className={styles.commandForm}>
            <label htmlFor="ai-command">Command</label>
            <div className={styles.inputShell}>
              <input
                id="ai-command"
                type="text"
                placeholder="Example: Add a high priority KNLTC follow-up for tomorrow morning"
                aria-label="Future AI command input"
              />
              <button type="button">Queue</button>
            </div>
            <small>UI only for now — ready for Supabase and AI workflow integration.</small>
          </form>
        </div>
      </section>
    </main>
  );
}
