import type { Metadata } from 'next';
import Link from 'next/link';
import { listGoogleIntelligence } from '@/lib/google-integrations';
import { getAgentProjects, getAgentTasks } from '@/lib/xeetrix-agent';
import { contacts, formatBanglaDateTime, marketingMetrics, meetings } from '@/lib/shaikh-os-memory';
import OsPage, { styles } from '../_components/OsPage';

export const metadata: Metadata = { title: 'Work | Shaikh OS' };
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
  const google = await listGoogleIntelligence();

  return (
    <OsPage
      eyebrow="কাজ"
      title="কাজ"
      subtitle="প্রকল্প, কাজ, মিটিং, follow-up এবং marketing এক জায়গায় রাখা হয়েছে—যাতে কাজের অবস্থা দ্রুত বোঝা যায়।"
      stats={[
        { label: 'প্রকল্প', value: String(operatingProjects.length), detail: 'KNLTC, Islamic School, Xeetrix, Investment' },
        { label: 'কাজ', value: String(tasks.length), detail: 'চলমান কাজ' },
        { label: 'মিটিং', value: String(meetings.length), detail: 'আসন্ন ও সংরক্ষিত আলোচনা' },
      ]}
    >
      <section className={styles.section} id="projects">
        <div className={styles.sectionHeader}>
          <div>
            <h2>প্রকল্প</h2>
            <p>প্রধান workstream গুলো একসাথে দেখা যায়।</p>
          </div>
        </div>
        <div className={styles.grid}>
          {(projects.length ? projects : fallbackProjects).map((project) => (
            <article className={styles.card} key={project.id}>
              <h3><Link href={`/os/projects/${encodeURIComponent(project.name)}`}>{project.name}</Link></h3>
              <p>{project.description}</p>
              <p><strong>Next:</strong> {project.next}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} id="tasks">
        <div className={styles.sectionHeader}>
          <div>
            <h2>কাজ</h2>
            <p>প্রতিদিনের কাজ এখানে থাকে; আজ পেজে শুধু জরুরি preview দেখা যায়।</p>
          </div>
        </div>
        <div className={styles.grid}>
          {tasks.length ? tasks.map((task) => (
            <article className={styles.card} key={task.id}>
              <p className={styles.cardMeta}>{task.project} · {task.due}</p>
              <h3>{task.title}</h3>
              <p>Priority: {task.priorityLabel}</p>
              <Link className={styles.filterLink} href={`/os/tasks/${task.id}`}>Open detail</Link>
            </article>
          )) : <article className={styles.card}><h3>সক্রিয় কাজ পাওয়া যায়নি</h3><p>Xeetrix Agent ব্যাকএন্ডে কাজ পাওয়া গেলে সেগুলো এখানে দেখা যাবে।</p></article>}
        </div>
      </section>


      <section className={styles.section} id="google-operations-signals">
        <div className={styles.sectionHeader}><div><h2>Google কাজের সংকেত</h2><p>Google থেকে পাওয়া follow-up ও ডকুমেন্ট সংকেত এখানে দেখা যায়।</p></div></div>
        <div className={styles.grid}>
          {google.gmailSignals.filter((message) => message.needs_follow_up || message.priority === 'high').slice(0, 6).map((message) => (
            <article className={`${styles.card} ${message.priority === 'high' ? styles.warning : ''}`} key={message.id}>
              <p className={styles.cardMeta}>{message.project_id ?? 'General'} · {message.intent ?? 'information'} · {message.priority ?? 'normal'}</p>
              <h3>{message.subject}</h3>
              <p>{message.contact_name || message.from_email || 'Unknown sender'}{message.needs_follow_up ? ' · Follow-up needed' : ''}</p>
            </article>
          ))}
          {google.driveSignals.slice(0, 6).map((doc) => (
            <article className={styles.card} key={`${doc.workspace_type}-${doc.id}`}>
              <p className={styles.cardMeta}>{doc.project_id ?? 'General'} · {doc.document_type ?? 'document'}</p>
              <h3>{doc.name}</h3>
              <p>{doc.organization ?? 'No organization detected'}</p>
            </article>
          ))}
          {!google.gmailSignals.length && !google.driveSignals.length ? <article className={styles.card}><h3>No Google operations signals yet</h3><p>Imported Gmail and Drive data will appear here.</p></article> : null}
        </div>
      </section>

      <section className={styles.section} id="meetings">
        <div className={styles.sectionHeader}>
          <div>
            <h2>মিটিং</h2>
            <p>মিটিংগুলো সিদ্ধান্ত, স্মৃতি এবং follow-up বুঝতে সাহায্য করে।</p>
          </div>
        </div>
        <div className={styles.grid}>
          {meetings.map((meeting) => (
            <article className={styles.card} key={meeting.id}>
              <p className={styles.cardMeta}>{meeting.project} · {formatBanglaDateTime(meeting.date)}</p>
              <h3>{meeting.title}</h3>
              <p>Participants: {meeting.participants.join(', ')}</p>
              <p><strong>Outcome:</strong> {meeting.outcome}</p>
              <Link className={styles.filterLink} href={`/os/meetings/${meeting.id}`}>Open detail</Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} id="marketing">
        <div className={styles.sectionHeader}>
          <div>
            <h2>Marketing</h2>
            <p>Content, campaign, lead এবং follow-up—growth কাজগুলো এখানে থাকে।</p>
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
        <div className={styles.grid}>{contacts.map((contact) => <article className={styles.card} key={contact.id}><p className={styles.cardMeta}>{contact.relation}</p><h3>{contact.name}</h3><p>{contact.organization}</p><div className={styles.badgeRow}>{contact.projects.map((project) => <span className={styles.badge} key={project}>{project}</span>)}</div></article>)}</div>
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
