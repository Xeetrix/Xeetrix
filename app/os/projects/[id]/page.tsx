import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OsPage, { styles } from '../../_components/OsPage';
import RelatedItems from '../../_components/RelatedItems';

export const metadata: Metadata = { title: 'Project Detail | Shaikh OS' };

type PageProps = { params: Promise<{ id: string }> };
const projects = [
  { id: 'KNLTC', name: 'KNLTC', description: 'Operational workspace for leads, marketing, finance, and follow-up execution.', next: 'Review lead callbacks and daily marketing spend.' },
  { id: 'Islamic School', name: 'Islamic School', description: 'School operations workspace for admissions, owner communication, and reporting.', next: 'Prepare admission progress report for owner review.' },
  { id: 'Xeetrix', name: 'Xeetrix', description: 'Product and agent intelligence workspace.', next: 'Continue agent memory and relationship view improvements.' },
  { id: 'Investment', name: 'Investment', description: 'Investment income, expenses, and notes workspace.', next: 'Review logged returns and allocation notes.' },
];

export function generateStaticParams() {
  return projects.map((project) => ({ id: project.id }));
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const project = projects.find((entry) => entry.id === decodedId);
  if (!project) notFound();

  return (
    <OsPage eyebrow="Project Detail" title={project.name} subtitle={project.description}>
      <section className={styles.section}>
        <article className={styles.card}>
          <p className={styles.cardMeta}>Project workspace</p>
          <h3>Description</h3>
          <p>{project.description}</p>
          <p><strong>Next:</strong> {project.next}</p>
        </article>
      </section>
      <section className={styles.section}>
        <article className={styles.card}>
          <RelatedItems type="project" id={project.id} />
        </article>
      </section>
    </OsPage>
  );
}
