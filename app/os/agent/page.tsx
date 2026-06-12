import type { Metadata } from 'next';
import OsPage, { styles } from '../_components/OsPage';
import { contacts, memoryItems } from '@/lib/shaikh-os-memory';

export const metadata: Metadata = { title: 'Agent | Shaikh OS' };

const recommendationCards = [
  { title: 'Lead follow-up first', copy: 'KNLTC pending replies ও high-priority leads আগে clear করলে revenue cycle দ্রুত বন্ধ হবে।' },
  { title: 'Admission report next', copy: 'Islamic School owner review-এর আগে concise admission progress report প্রস্তুত করুন।' },
];

const riskCards = [
  { title: 'Energy risk', copy: 'Sleep/headache pattern repeated হলে daily execution quality কমতে পারে।' },
  { title: 'Follow-up backlog', copy: 'Marketing pending follow-ups জমলে lead quality ও response speed কমে যাবে।' },
];

const openQuestions = [
  'আজ KNLTC-এর কোন lead segment owner-level decision দরকার?',
  'Islamic School admission report-এর final reviewer কে?',
  'Xeetrix Agent Memory View idea product backlog-এ কখন ঢুকবে?',
];

export default function AgentPage() {
  const ideas = memoryItems.filter((item) => item.intent === 'idea');
  const decisions = memoryItems.filter((item) => item.intent === 'decision');
  const openTasks = memoryItems.filter((item) => item.intent === 'task');

  return (
    <OsPage
      eyebrow="Agent"
      title="AI কী ভাবছে?"
      subtitle="Recommendations, risks, opportunities, open questions এবং what agent knows—সব agent reasoning এক জায়গায় grouped।"
      stats={[
        { label: 'Recommendations', value: String(recommendationCards.length), detail: 'Suggested next moves' },
        { label: 'Risks', value: String(riskCards.length), detail: 'Needs owner attention' },
        { label: 'Known Items', value: String(memoryItems.length), detail: 'Current memory context' },
      ]}
    >
      <section className={styles.section} id="recommendations">
        <div className={styles.sectionHeader}><div><h2>Recommendations</h2><p>Agent-এর suggested action order।</p></div></div>
        <div className={styles.grid}>{recommendationCards.map((card) => <article className={styles.card} key={card.title}><p className={styles.cardMeta}>Recommendation</p><h3>{card.title}</h3><p>{card.copy}</p></article>)}</div>
      </section>

      <section className={styles.section} id="risks">
        <div className={styles.sectionHeader}><div><h2>Risks</h2><p>যে signals decision বা behavior change চাইতে পারে।</p></div></div>
        <div className={styles.grid}>{riskCards.map((card) => <article className={`${styles.card} ${styles.warning}`} key={card.title}><p className={styles.cardMeta}>Risk</p><h3>{card.title}</h3><p>{card.copy}</p></article>)}</div>
      </section>

      <section className={styles.section} id="opportunities">
        <div className={styles.sectionHeader}><div><h2>Opportunities</h2><p>Memory থেকে পাওয়া possible upside।</p></div></div>
        <div className={styles.grid}>{ideas.map((idea) => <article className={`${styles.card} ${styles.good}`} key={idea.id}><p className={styles.cardMeta}>{idea.project}</p><h3>{idea.title}</h3><p>{idea.summary}</p></article>)}</div>
      </section>

      <section className={styles.section} id="questions">
        <div className={styles.sectionHeader}><div><h2>Open Questions</h2><p>Agent এখনো যেসব clarification চাইছে।</p></div></div>
        <div className={styles.grid}>{openQuestions.map((question) => <article className={styles.card} key={question}><p className={styles.cardMeta}>Question</p><h3>{question}</h3></article>)}</div>
      </section>

      <section className={styles.section} id="knows">
        <div className={styles.sectionHeader}><div><h2>What Agent Knows</h2><p>Projects, contacts, decisions এবং open tasks-এর current context map।</p></div></div>
        <div className={styles.grid}>
          <article className={styles.card}><h3>Contacts</h3><ul>{contacts.map((contact) => <li key={contact.id}>{contact.name} — {contact.organization}</li>)}</ul></article>
          <article className={styles.card}><h3>Decisions</h3><ul>{decisions.map((decision) => <li key={decision.id}>{decision.title}</li>)}</ul></article>
          <article className={styles.card}><h3>Open Tasks</h3><ul>{openTasks.map((task) => <li key={task.id}>{task.title}</li>)}</ul></article>
        </div>
      </section>
    </OsPage>
  );
}
