import type { Metadata } from 'next';
import { getAgentProjects, getAgentTasks } from '@/lib/xeetrix-agent';
import { contacts, formatBanglaDateTime, marketingMetrics, meetings } from '@/lib/shaikh-os-memory';
import OsPage, { styles } from '../_components/OsPage';
import RelatedItems from '../_components/RelatedItems';

export const metadata: Metadata = { title: 'Operations | Shaikh OS' };
export const dynamic = 'force-dynamic';

const operatingProjects = ['KNLTC', 'Islamic School', 'Xeetrix', 'Investment'];
const fallbackProjects = operatingProjects.map((project) => ({
  id: project,
  name: project,
  status: 'Workspace',
  progress: 0,
  description: 'Agent backend project data synced হলে এখানে live ownership, blocker এবং next action দেখা যাবে।',
  next: 'Next action define করুন।',
}));

export default async function OperationsPage() {
  const projects = await loadProjects();
  const tasks = await loadTasks();

  return (
    <OsPage
      eyebrow="Operations"
      title="কোন কাজ কোথায় এগোচ্ছে?"
      subtitle="Projects, tasks, meetings, marketing এবং contacts এখন একটি Operations workspace-এর অধীনে grouped—top-level navigation আর scattered নয়।"
      stats={[
        { label: 'Projects', value: String(operatingProjects.length), detail: 'KNLTC, Islamic School, Xeetrix, Investment' },
        { label: 'Tasks', value: String(tasks.length), detail: 'Live backend task board preview' },
        { label: 'Meetings', value: String(meetings.length), detail: 'Upcoming and recorded discussions' },
      ]}
    >
      <section className={styles.section} id="projects">
        <div className={styles.sectionHeader}>
          <div>
            <h2>Projects</h2>
            <p>চারটি primary workstream একই operational map-এ রাখা হয়েছে।</p>
          </div>
        </div>
        <div className={styles.grid}>
          {(projects.length ? projects : fallbackProjects).map((project) => (
            <article className={styles.card} key={project.id}>
              <p className={styles.cardMeta}>{project.status}</p>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <p><strong>Next:</strong> {project.next}</p>
              <RelatedItems type="project" id={project.name} />
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} id="tasks">
        <div className={styles.sectionHeader}>
          <div>
            <h2>Tasks</h2>
            <p>Daily execution items Operations-এর মধ্যে থাকে; homepage শুধু urgent preview দেখায়।</p>
          </div>
        </div>
        <div className={styles.grid}>
          {tasks.length ? tasks.map((task) => (
            <article className={styles.card} key={task.id}>
              <p className={styles.cardMeta}>{task.project} · {task.due}</p>
              <h3>{task.title}</h3>
              <p>Priority: {task.priorityLabel}</p>
              <RelatedItems type="task" id={task.id} />
            </article>
          )) : <article className={styles.card}><h3>সক্রিয় কাজ পাওয়া যায়নি</h3><p>Xeetrix Agent ব্যাকএন্ডে কাজ পাওয়া গেলে সেগুলো এখানে দেখা যাবে।</p></article>}
        </div>
      </section>

      <section className={styles.section} id="meetings">
        <div className={styles.sectionHeader}>
          <div>
            <h2>Meetings</h2>
            <p>মিটিংগুলো decision memory ও follow-up source হিসেবে Operations-এ grouped।</p>
          </div>
        </div>
        <div className={styles.grid}>
          {meetings.map((meeting) => (
            <article className={styles.card} key={meeting.id}>
              <p className={styles.cardMeta}>{meeting.project} · {formatBanglaDateTime(meeting.date)}</p>
              <h3>{meeting.title}</h3>
              <p>Participants: {meeting.participants.join(', ')}</p>
              <p><strong>Outcome:</strong> {meeting.outcome}</p>
              <RelatedItems type="meeting" id={meeting.id} />
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} id="marketing">
        <div className={styles.sectionHeader}>
          <div>
            <h2>Marketing</h2>
            <p>Content, campaigns, leads এবং follow-ups Operations-এর growth lane।</p>
          </div>
        </div>
        <div className={styles.grid}>{marketingMetrics.map((metric) => <article className={styles.card} key={metric.label}><p className={styles.cardMeta}>Marketing metric</p><h3>{metric.value}</h3><p>{metric.label} — {metric.detail}</p></article>)}</div>
      </section>

      <section className={styles.section} id="contacts">
        <div className={styles.sectionHeader}>
          <div>
            <h2>Contacts</h2>
            <p>People context operational handoff ও follow-up-এর সাথে রাখা হয়েছে।</p>
          </div>
        </div>
        <div className={styles.grid}>{contacts.map((contact) => <article className={styles.card} key={contact.id}><p className={styles.cardMeta}>{contact.relation}</p><h3>{contact.name}</h3><p>{contact.organization}</p><div className={styles.badgeRow}>{contact.projects.map((project) => <span className={styles.badge} key={project}>{project}</span>)}</div><RelatedItems type="contact" id={contact.id} /></article>)}</div>
      </section>
    </OsPage>
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
