import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAgentProjects, getAgentTasks } from '@/lib/xeetrix-agent';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Shaikh OS Dashboard | Xeetrix',
  description: 'A dark personal dashboard for projects, tasks, notes, daily focus, and future AI commands.',
};

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

export const dynamic = 'force-dynamic';

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
        <Suspense fallback={<ProjectsLoadingState />}>
          <ProjectsGrid />
        </Suspense>
      </section>

      <section id="tasks" className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Tasks</p>
          <h2>Execution queue</h2>
          <p>A focused task list for daily operations, ordered by urgency, project context, and time block.</p>
        </div>
        <Suspense fallback={<TasksLoadingState />}>
          <TasksBoard />
        </Suspense>
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

async function ProjectsGrid() {
  const projects = await loadProjects();

  if (projects.length === 0) {
    return (
      <div className={styles.projectGrid}>
        <article className={styles.projectCard}>
          <div className={styles.cardTopline}>
            <span>No projects</span>
            <strong>0%</strong>
          </div>
          <h3>No live projects found</h3>
          <p>Projects from the Xeetrix Agent backend will appear here as soon as they are available.</p>
          <div className={styles.progressTrack} aria-label="No live projects progress">
            <span style={{ width: '0%' }} />
          </div>
          <small>Next: Add or sync a project in Xeetrix Agent.</small>
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
  );
}

async function TasksBoard() {
  const tasks = await loadTasks();

  if (tasks.length === 0) {
    return (
      <div className={styles.taskBoard}>
        <article className={styles.taskRow}>
          <div>
            <h3>No live tasks found</h3>
            <p>Tasks from the Xeetrix Agent backend will appear here as soon as they are available.</p>
          </div>
          <span>—</span>
          <strong data-priority="Low">Empty</strong>
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
          <strong data-priority={task.priority}>{task.priority}</strong>
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
          <span>Loading</span>
          <strong>Live</strong>
        </div>
        <h3>Loading live projects…</h3>
        <p>Connecting to the Xeetrix Agent backend for the latest project memory.</p>
        <div className={styles.progressTrack} aria-label="Loading live projects progress">
          <span style={{ width: '42%' }} />
        </div>
        <small>Next: Syncing project lanes.</small>
      </article>
    </div>
  );
}

function TasksLoadingState() {
  return (
    <div className={styles.taskBoard}>
      <article className={styles.taskRow}>
        <div>
          <h3>Loading live tasks…</h3>
          <p>Connecting to the Xeetrix Agent backend.</p>
        </div>
        <span>—</span>
        <strong data-priority="Medium">Loading</strong>
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
