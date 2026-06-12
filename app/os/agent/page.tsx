import type { Metadata } from 'next';
import OsPage, { styles } from '../_components/OsPage';
import { contacts, memoryItems } from '@/lib/shaikh-os-memory';

export const metadata: Metadata = { title: 'Agent Brain | Shaikh OS' };

export default function AgentPage() {
  const projects = ['KNLTC', 'Islamic School', 'Xeetrix', 'Investment', 'Personal'];
  const ideas = memoryItems.filter((item) => item.intent === 'idea');
  const decisions = memoryItems.filter((item) => item.intent === 'decision');
  const openTasks = memoryItems.filter((item) => item.intent === 'task');
  return <OsPage eyebrow="What Agent Knows" title="AI-এর brain view." subtitle="Projects, contacts, ideas, decisions, open tasks এবং warnings একসাথে—এটাই Personal AI Chief of Staff-এর context map।"><section className={styles.section}><div className={styles.grid}><article className={styles.card}><h3>Projects</h3><ul>{projects.map((project) => <li key={project}>{project}</li>)}</ul></article><article className={styles.card}><h3>Contacts</h3><ul>{contacts.map((contact) => <li key={contact.id}>{contact.name} — {contact.organization}</li>)}</ul></article><article className={styles.card}><h3>Ideas</h3><ul>{ideas.map((idea) => <li key={idea.id}>{idea.title}</li>)}</ul></article><article className={styles.card}><h3>Decisions</h3><ul>{decisions.map((decision) => <li key={decision.id}>{decision.title}</li>)}</ul></article><article className={styles.card}><h3>Open Tasks</h3><ul>{openTasks.map((task) => <li key={task.id}>{task.title}</li>)}</ul></article><article className={`${styles.card} ${styles.warning}`}><h3>Warnings</h3><ul><li>Repeated sleep/headache signal watch করুন।</li><li>KNLTC follow-up queue ageing হচ্ছে।</li></ul></article></div></section></OsPage>;
}
