import type { Metadata } from 'next';
import V2CommandClient from './V2CommandClient';
import styles from './v2.module.css';

export const metadata: Metadata = { title: 'Shaikh OS v2', description: 'Clean Shaikh OS v2 command foundation.' };

export default function ShaikhOsV2Page() {
  return <main className={styles.shell}>
    <section className={styles.hero}>
      <p>Shaikh OS v2 Core</p>
      <h1>একটাই source of truth, LLM-first command flow.</h1>
      <span>নতুন v2 UI — পুরনো UI অপরিবর্তিত আছে।</span>
    </section>
    <V2CommandClient />
  </main>;
}
