'use client';

import { useMemo, useState } from 'react';
import styles from '../_components/os-pages.module.css';

type SearchItem = { id: string; type: string; title: string; detail: string; href: string; keywords: string };

export default function UniversalSearch({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items.slice(0, 6);
    return items.filter((item) => `${item.title} ${item.detail} ${item.type} ${item.keywords}`.toLowerCase().includes(normalized)).slice(0, 12);
  }, [items, query]);

  return (
    <section className={styles.section} id="universal-search">
      <div className={styles.briefingPanel}>
        <p className={styles.cardMeta}>Universal Search</p>
        <h3>Memory Agent Search</h3>
        <div className={styles.searchShell}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="স্মৃতি, কাজ, সিদ্ধান্ত বা মানুষ খুঁজুন…"
            aria-label="Universal memory search"
          />
        </div>
        <div className={styles.searchResults} aria-live="polite">
          {results.length ? results.map((item) => (
            <a href={item.href} className={styles.searchResult} key={item.id}>
              <span>{item.type}</span>
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
            </a>
          )) : <p>কোনো ফল পাওয়া যায়নি। নতুন note, task, decision বা contact যোগ করলে এখানে দেখা যাবে।</p>}
        </div>
      </div>
    </section>
  );
}
