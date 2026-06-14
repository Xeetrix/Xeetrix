import type { Metadata } from 'next';
import Link from 'next/link';
import OsPage, { styles } from '../_components/OsPage';
import { listGoogleIntelligence } from '@/lib/google-integrations';
import { contacts, financeEntries, formatBanglaDateTime, getIntentLabel, groupMemoryByDay, healthEntries, meetings, memoryItems, type MemoryIntent } from '@/lib/shaikh-os-memory';
import UniversalSearch from './UniversalSearch';

export const metadata: Metadata = { title: 'Memory | Shaikh OS' };

const memorySections: Array<{ label: string; description: string; intents: MemoryIntent[] }> = [
  { label: 'Notes', description: 'Observation এবং context যেগুলো এখনও task নয়।', intents: ['note'] },
  { label: 'Ideas', description: 'Future product, growth বা operating improvement signal।', intents: ['idea'] },
  { label: 'Decisions', description: 'Owner-approved choices যেগুলো future reasoning-এ context হবে।', intents: ['decision'] },
];

export const dynamic = 'force-dynamic';

export default async function MemoryPage() {
  const google = await listGoogleIntelligence();
  const timelineGroups = groupMemoryByDay(memoryItems);
  const days = Object.keys(timelineGroups).sort((a, b) => (a < b ? 1 : -1));

  return (
    <OsPage
      eyebrow="Memory"
      title="আমি কী জানি?"
      subtitle="Notes, ideas, decisions এবং timeline এখন Memory-এর অধীনে। কাজ, স্বাস্থ্য বা অর্থের raw records route হিসেবে থাকলেও primary navigation-এ clutter তৈরি করছে না।"
      stats={[
        { label: 'Notes', value: String(memoryItems.filter((item) => item.intent === 'note').length), detail: 'Context records' },
        { label: 'Ideas', value: String(memoryItems.filter((item) => item.intent === 'idea').length), detail: 'Possible improvements' },
        { label: 'Timeline Items', value: String(memoryItems.length), detail: 'Chronological memory history' },
      ]}
    >

      <UniversalSearch items={buildSearchItems()} />

      <section className={styles.section}>
        <div className={styles.filters} aria-label="Memory groups">
          {memorySections.map((section) => <a className={styles.filterLink} href={`#${section.label.toLowerCase()}`} key={section.label}>{section.label}</a>)}
          <a className={styles.filterLink} href="#gmail-signals">Gmail Signals</a>
          <a className={styles.filterLink} href="#workspace-documents">Workspace Documents</a>
          <a className={styles.filterLink} href="#timeline">Timeline</a>
        </div>
      </section>

      {memorySections.map((section) => {
        const items = memoryItems.filter((item) => section.intents.includes(item.intent));
        return (
          <section className={styles.section} id={section.label.toLowerCase()} key={section.label}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>{section.label}</h2>
                <p>{section.description}</p>
              </div>
            </div>
            <div className={styles.grid}>
              {items.length ? items.map((item) => (
                <article className={styles.card} key={item.id}>
                  <h3><Link href={`/os/memory/${item.id}`}>{item.title}</Link></h3>
                  <p>{item.summary}</p>
                  <div className={styles.badgeRow}>{item.tags.map((tag) => <span className={styles.badge} key={tag}>{tag}</span>)}</div>
                </article>
              )) : <article className={styles.card}><h3>No {section.label.toLowerCase()} yet</h3><p>নতুন memory command থেকে এই group পূরণ হবে।</p></article>}
            </div>
          </section>
        );
      })}


      <section className={styles.section} id="gmail-signals">
        <div className={styles.sectionHeader}><div><h2>Gmail Signals</h2><p>Imported Gmail classified into project, contact, organization, intent, priority, and follow-up signals.</p></div></div>
        <div className={styles.grid}>
          {google.gmailSignals.length ? google.gmailSignals.slice(0, 9).map((message) => (
            <article className={`${styles.card} ${message.priority === 'high' ? styles.warning : ''}`} key={message.id}>
              <p className={styles.cardMeta}>{message.project_id ?? 'General'} · {message.organization ?? 'No organization'} · {message.priority ?? 'normal'}</p>
              <h3>{message.subject}</h3>
              <p>{message.snippet}</p>
              <p><strong>Contact:</strong> {message.contact_name || message.from_email || 'Unknown'}<br /><strong>Intent:</strong> {message.intent ?? 'information'}<br /><strong>Follow-up:</strong> {message.needs_follow_up ? 'Needed' : 'Not needed'}</p>
            </article>
          )) : <article className={styles.card}><h3>No imported Gmail signals yet</h3><p>Google sync data will appear here after Gmail messages are imported.</p></article>}
        </div>
      </section>

      <section className={styles.section} id="workspace-documents">
        <div className={styles.sectionHeader}><div><h2>Recent Workspace Documents</h2><p>Imported Docs and Sheets metadata classified into project, organization, and document type.</p></div></div>
        <div className={styles.grid}>
          {google.driveSignals.length ? google.driveSignals.slice(0, 9).map((doc) => (
            <article className={styles.card} key={`${doc.workspace_type}-${doc.id}`}>
              <p className={styles.cardMeta}>{doc.workspace_type === 'sheet' ? 'Sheet' : 'Doc'} · {doc.project_id ?? 'General'} · {doc.document_type ?? 'document'}</p>
              <h3>{doc.web_url ? <a href={doc.web_url}>{doc.name}</a> : doc.name}</h3>
              <p>{doc.organization ?? 'No organization detected'}{doc.owner_name || doc.owner_email ? ` · Owner: ${doc.owner_name || doc.owner_email}` : ''}</p>
            </article>
          )) : <article className={styles.card}><h3>No imported Workspace documents yet</h3><p>Drive metadata will appear here after Docs or Sheets are imported.</p></article>}
        </div>
      </section>

      <section className={styles.section} id="timeline">
        <div className={styles.sectionHeader}>
          <div>
            <h2>Timeline</h2>
            <p>Chronological history এখন Memory-এর অংশ; dedicated route /os/timeline এখনও কাজ করে।</p>
          </div>
        </div>
        <div className={styles.timelineList}>
          {days.map((day) => (
            <article className={styles.timelineDay} key={day}>
              <h3>{day === '2026-06-12' ? 'Today' : day === '2026-06-11' ? 'Yesterday' : day}</h3>
              <ul>
                {timelineGroups[day].map((item) => (
                  <li key={item.id}><strong>{formatBanglaDateTime(item.createdAt)}</strong> — {getIntentLabel(item.intent)} saved: {item.title}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </OsPage>
  );
}


function buildSearchItems() {
  return [
    ...memoryItems.map((item) => ({
      id: item.id,
      type: getIntentLabel(item.intent),
      title: item.title,
      detail: `${item.project} · ${item.summary}`,
      href: item.intent === 'task' ? '/os/operations' : item.intent === 'health_log' || item.intent === 'finance_log' ? '/os/personal' : '/os/memory',
      keywords: item.tags.join(' '),
    })),
    ...healthEntries.map((entry) => ({
      id: entry.id,
      type: 'স্বাস্থ্য',
      title: `${entry.date} health log`,
      detail: `${entry.sleep} sleep · ${entry.mood} mood · ${entry.symptoms}`,
      href: '/os/personal',
      keywords: `${entry.energy} ${entry.symptoms}`,
    })),
    ...financeEntries.map((entry) => ({
      id: entry.id,
      type: 'অর্থ',
      title: `${entry.category} ${entry.direction}`,
      detail: `৳${entry.amount} · ${entry.description}`,
      href: '/os/personal',
      keywords: `${entry.category} ${entry.direction}`,
    })),
    ...meetings.map((meeting) => ({
      id: meeting.id,
      type: 'মিটিং',
      title: meeting.title,
      detail: `${meeting.project} · ${meeting.participants.join(', ')} · ${meeting.outcome}`,
      href: '/os/meetings',
      keywords: meeting.notes,
    })),
    ...contacts.map((contact) => ({
      id: contact.id,
      type: 'মানুষ',
      title: contact.name,
      detail: `${contact.relation} · ${contact.organization}`,
      href: '/os/contacts',
      keywords: `${contact.email} ${contact.phone} ${contact.projects.join(' ')}`,
    })),
  ];
}
