import type { Metadata } from 'next';
import OsPage, { styles } from '../_components/OsPage';
import { contacts, memoryItems } from '@/lib/shaikh-os-memory';
import { buildChiefOfStaffBriefing, type BriefingItem } from '@/lib/shaikh-os-intelligence';
import { getRelatedItems } from '@/lib/shaikh-os-relationships';

export const metadata: Metadata = { title: 'Agent | Shaikh OS' };

export default function AgentPage() {
  const briefing = buildChiefOfStaffBriefing();
  const decisions = memoryItems.filter((item) => item.intent === 'decision');
  const openTasks = memoryItems.filter((item) => item.intent === 'task');
  const admissionReviewRelated = getRelatedItems('meeting', 'meeting-admission');
  const knltcConnections = getRelatedItems('project', 'KNLTC');

  return (
    <OsPage
      eyebrow="Agent"
      title="AI Chief of Staff কী দেখছে?"
      subtitle="Static cards নয়—available memory থেকে observations, risks, recommendations, opportunities এবং open questions তৈরি করা agent briefing।"
      stats={[
        { label: 'Recommendations', value: String(briefing.recommendations.length), detail: 'Suggested next moves' },
        { label: 'Risks', value: String(briefing.risks.length), detail: 'Needs owner attention' },
        { label: 'Open Questions', value: String(briefing.openQuestions.length), detail: 'Clarifications needed' },
      ]}
    >
      <AgentSection id="observations" title="Observations" description="Agent memory থেকে আজকের context scan।" items={briefing.observations} />
      <AgentSection id="risks" title="Risks" description="Health, finance এবং follow-up signals যেগুলো execution quality কমাতে পারে।" items={briefing.risks} warning />
      <AgentSection id="recommendations" title="Recommendations" description="আজকের suggested action order।" items={briefing.recommendations} />
      <AgentSection id="opportunities" title="Opportunities" description="Memory-তে থাকা upside signals।" items={briefing.opportunities} good empty="নতুন opportunity নেই। Memory-তে idea যোগ করলে এখানে agent review হবে।" />
      <AgentSection id="questions" title="Open Questions" description="যেসব clarification পেলে assistant আরও ভালো সিদ্ধান্ত সাজাতে পারবে।" items={briefing.openQuestions} />

      <section className={styles.section} id="relationship-map">
        <div className={styles.sectionHeader}><div><h2>Relationship Map</h2><p>Agent এখন generic relationships থেকে meeting, contact, report এবং project context একসাথে পড়ে।</p></div></div>
        <div className={styles.grid}>
          <article className={styles.card}>
            <p className={styles.cardMeta}>Meeting context</p>
            <h3>School Admission Review</h3>
            <p>Related:</p>
            <ul>
              {admissionReviewRelated.map((item) => <li key={`${item.type}-${item.id}`}>{item.title}</li>)}
            </ul>
          </article>
        </div>
      </section>

      <section className={styles.section} id="related-context">
        <div className={styles.sectionHeader}><div><h2>Related Context</h2><p>Relationship intelligence remains visible here for agent reasoning instead of overview card clutter.</p></div></div>
        <div className={styles.grid}>
          <article className={styles.card}>
            <p className={styles.cardMeta}>KNLTC context</p>
            <h3>Connections</h3>
            <ul>{knltcConnections.map((item) => <li key={`${item.type}-${item.id}`}>{item.title} — {item.relationshipType}</li>)}</ul>
          </article>
        </div>
      </section>

      <section className={styles.section} id="connections">
        <div className={styles.sectionHeader}><div><h2>Connections</h2><p>People, decisions, and open work remain available to the agent as connected context.</p></div></div>
        <div className={styles.grid}>
          <article className={styles.card}><h3>Contacts</h3><ul>{contacts.map((contact) => <li key={contact.id}>{contact.name} — {contact.organization}</li>)}</ul></article>
          <article className={styles.card}><h3>Decisions</h3><ul>{decisions.length ? decisions.map((decision) => <li key={decision.id}>{decision.title}</li>) : <li>এখনও decision নেই।</li>}</ul></article>
          <article className={styles.card}><h3>Open Tasks</h3><ul>{openTasks.length ? openTasks.map((task) => <li key={task.id}>{task.title}</li>) : <li>Open task নেই।</li>}</ul></article>
        </div>
      </section>

      <section className={styles.section} id="knows">
        <div className={styles.sectionHeader}><div><h2>What Agent Knows</h2><p>Projects, contacts, decisions এবং open tasks-এর current context map।</p></div></div>
        <div className={styles.grid}>
          <article className={styles.card}><h3>Contacts</h3><ul>{contacts.map((contact) => <li key={contact.id}>{contact.name} — {contact.organization}</li>)}</ul></article>
          <article className={styles.card}><h3>Decisions</h3><ul>{decisions.length ? decisions.map((decision) => <li key={decision.id}>{decision.title}</li>) : <li>এখনও decision নেই।</li>}</ul></article>
          <article className={styles.card}><h3>Open Tasks</h3><ul>{openTasks.length ? openTasks.map((task) => <li key={task.id}>{task.title}</li>) : <li>Open task নেই।</li>}</ul></article>
        </div>
      </section>
    </OsPage>
  );
}

function AgentSection({ id, title, description, items, warning, good, empty = 'এই মুহূর্তে কোনো item নেই।' }: { id: string; title: string; description: string; items: BriefingItem[]; warning?: boolean; good?: boolean; empty?: string }) {
  return (
    <section className={styles.section} id={id}>
      <div className={styles.sectionHeader}><div><h2>{title}</h2><p>{description}</p></div></div>
      <div className={styles.grid}>
        {items.length ? items.map((item) => (
          <article className={`${styles.card} ${warning ? styles.warning : ''} ${good || item.tone === 'good' ? styles.good : ''}`} key={item.id}>
            <p className={styles.cardMeta}>{title}</p>
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
            <a className={styles.filterLink} href={item.href}>Source খুলুন</a>
          </article>
        )) : <article className={styles.card}><h3>{empty}</h3><p>নতুন data save হলে এই অংশ update হবে।</p></article>}
      </div>
    </section>
  );
}
