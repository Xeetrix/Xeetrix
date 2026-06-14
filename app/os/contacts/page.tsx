import type { Metadata } from 'next';
import OsPage, { styles } from '../_components/OsPage';
import { contacts } from '@/lib/shaikh-os-memory';

export const metadata: Metadata = { title: 'Contacts | Shaikh OS' };

export default function ContactsPage() {
  return (
    <OsPage eyebrow="Contact Management" title="মানুষ, relation, organization এবং project memory." subtitle="Agent পরে contacts reference করতে পারবে—Abbu, KNLTC Team, School Owner, Teachers এবং Leads আলাদা context হিসেবে থাকবে।">
      <section className={styles.section}><div className={styles.grid}>{contacts.map((contact) => <article className={styles.card} key={contact.id}><p className={styles.cardMeta}>{contact.relation}</p><h3>{contact.name}</h3><p>{contact.organization}</p><p>Phone: {contact.phone}<br />Email: {contact.email}</p><div className={styles.badgeRow}>{contact.projects.map((project) => <span className={styles.badge} key={project}>{project}</span>)}</div></article>)}</div></section>
    </OsPage>
  );
}
