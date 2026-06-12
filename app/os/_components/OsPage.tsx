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
  { href: '/os', label: 'Today' },
  { href: '/os/memory', label: 'Memory' },
  { href: '/os/operations', label: 'Operations' },
  { href: '/os/personal', label: 'Personal' },
  { href: '/os/agent', label: 'Agent' },
];

export default function OsPage({ eyebrow, title, subtitle, stats = [], children }: OsPageProps) {
  return (
    <main className={styles.shell}>
      <nav className={styles.nav} aria-label="Shaikh OS primary sections">
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
