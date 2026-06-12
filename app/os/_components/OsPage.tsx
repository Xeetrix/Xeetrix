import Link from 'next/link';
import styles from './os-pages.module.css';

export type StatCard = {
  label: string;
  value: string;
  detail: string;
};

export type OsPageProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  stats?: StatCard[];
  children: React.ReactNode;
};

const navItems = [
  { href: '/os', label: 'Home' },
  { href: '/os/memory', label: 'Memory' },
  { href: '/os/timeline', label: 'Timeline' },
  { href: '/os/briefing', label: 'Briefing' },
  { href: '/os/agent', label: 'Agent Brain' },
  { href: '/os/contacts', label: 'Contacts' },
  { href: '/os/meetings', label: 'Meetings' },
  { href: '/os/health', label: 'Health' },
  { href: '/os/finance', label: 'Finance' },
  { href: '/os/sources', label: 'Sources' },
  { href: '/os/marketing', label: 'Marketing' },
];

export default function OsPage({ eyebrow, title, subtitle, stats = [], children }: OsPageProps) {
  return (
    <main className={styles.shell}>
      <nav className={styles.nav} aria-label="Shaikh OS sections">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {stats.length ? (
          <div className={styles.statGrid}>
            {stats.map((stat) => (
              <article className={styles.statCard} key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                <p>{stat.detail}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      {children}
    </main>
  );
}

export { styles };
