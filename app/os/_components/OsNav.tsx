'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './os-pages.module.css';

const navItems = [
  { href: '/os', label: 'আজ', helper: 'Home' },
  { href: '/os/memory', label: 'স্মৃতি', helper: 'Memory' },
  { href: '/os/operations', label: 'কাজ', helper: 'Work' },
  { href: '/os/personal', label: 'ব্যক্তিগত', helper: 'Personal' },
  { href: '/os/agent', label: 'সহকারী', helper: 'Agent' },
  { href: '/os/improve', label: 'উন্নয়ন', helper: 'Improve' },
  { href: '/os/sources', label: 'সংযোগ', helper: 'Sources' },
];

export default function OsNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Shaikh OS primary sections">
      {navItems.map((item) => {
        const active = item.href === '/os' ? pathname === '/os' : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined}>
            <span>{item.label}</span>
            <small>{item.helper}</small>
          </Link>
        );
      })}
    </nav>
  );
}
