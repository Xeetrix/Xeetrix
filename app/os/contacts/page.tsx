import type { Metadata } from 'next';
import OsPage, { styles } from '../_components/OsPage';
import { listGoogleIntelligence } from '@/lib/google-integrations';
import { contacts } from '@/lib/shaikh-os-memory';

export const metadata: Metadata = { title: 'Contacts | Shaikh OS' };

export const dynamic = 'force-dynamic';

export default async function ContactsPage() {
  const google = await listGoogleIntelligence();
  return (
    <OsPage eyebrow="Contact Management" title="মানুষ, relation, organization এবং project memory." subtitle="Agent পরে contacts reference করতে পারবে—Abbu, KNLTC Team, School Owner, Teachers এবং Leads আলাদা context হিসেবে থাকবে।">
      <section className={styles.section}><div className={styles.grid}>{contacts.map((contact) => <article className={styles.card} key={contact.id}><p className={styles.cardMeta}>{contact.relation}</p><h3>{contact.name}</h3><p>{contact.organization}</p><p>Phone: {contact.phone}<br />Email: {contact.email}</p><div className={styles.badgeRow}>{contact.projects.map((project) => <span className={styles.badge} key={project}>{project}</span>)}</div></article>)}</div></section>
      <section className={styles.section} id="google-contact-candidates"><div className={styles.sectionHeader}><div><h2>Google Contact Candidates</h2><p>Only candidates extracted from imported senders, attendees, and document owners are shown.</p></div></div><div className={styles.grid}>{google.contactCandidates.length ? google.contactCandidates.slice(0, 12).map((candidate) => <article className={styles.card} key={candidate.id}><p className={styles.cardMeta}>{candidate.source}</p><h3>{candidate.name}</h3><p>{candidate.email ?? 'No email'}<br />{candidate.organization ?? 'No organization detected'}</p><div className={styles.badgeRow}>{candidate.project ? <span className={styles.badge}>{candidate.project}</span> : null}</div></article>) : <article className={styles.card}><h3>No Google contact candidates yet</h3><p>Imported Google data will populate this list.</p></article>}</div></section>
    </OsPage>
  );
}
