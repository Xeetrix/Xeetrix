'use client';

import { useState } from 'react';
import styles from './v2.module.css';

type ApiState = 'ask' | 'understanding' | 'confirmation' | 'saved' | 'answer' | 'error';
type ApiResult = { mode?: string; answer?: string; error?: string; plan_id?: string; confirmation?: { title?: string | null; action_type?: string; project_name?: string | null; message?: string; payload?: Record<string, unknown> }; message?: string };

export default function V2CommandClient() {
  const [command, setCommand] = useState('');
  const [state, setState] = useState<ApiState>('ask');
  const [result, setResult] = useState<ApiResult | null>(null);

  async function send() {
    if (!command.trim()) return;
    setState('understanding');
    setResult(null);
    const data = await post({ command }).catch((error) => ({ mode: 'error', error: error.message }));
    setResult(data);
    setState(data.mode === 'answer' ? 'answer' : data.mode === 'plan' ? 'confirmation' : 'error');
  }

  async function confirm(confirm: boolean) {
    if (!result?.plan_id) return;
    setState('understanding');
    const data = await post({ plan_id: result.plan_id, [confirm ? 'confirm' : 'cancel']: true }).catch((error) => ({ mode: 'error', error: error.message }));
    setResult(data);
    setState(confirm && data.mode === 'saved' ? 'saved' : data.mode === 'cancelled' ? 'ask' : 'error');
    if (confirm && data.mode === 'saved') setCommand('');
  }

  return <div className={styles.card}>
    <div className={styles.state}>{stateLabel(state)}</div>
    <textarea value={command} onChange={(event) => setCommand(event.target.value)} placeholder="আজ কী করতে হবে বা মনে রাখতে হবে?" rows={5} />
    <button onClick={send} disabled={state === 'understanding'}>{state === 'understanding' ? 'আমি বুঝেছি…' : 'Ask'}</button>

    {state === 'confirmation' && result?.confirmation ? <section className={styles.panel}>
      <p className={styles.badge}>আমি বুঝেছি</p>
      <h2>{result.confirmation.title || 'নতুন পরিকল্পনা'}</h2>
      <p>Action: {result.confirmation.action_type}</p>
      {result.confirmation.project_name ? <p>Project: {result.confirmation.project_name}</p> : null}
      <pre>{JSON.stringify(result.confirmation.payload ?? {}, null, 2)}</pre>
      <strong>নিশ্চিত করবেন?</strong>
      <div className={styles.actions}><button onClick={() => confirm(true)}>Confirm</button><button onClick={() => confirm(false)} className={styles.ghost}>Cancel</button></div>
    </section> : null}

    {state === 'saved' ? <section className={styles.panel}><h2>সংরক্ষণ হয়েছে</h2><p>{result?.message}</p></section> : null}
    {state === 'answer' ? <section className={styles.panel}><h2>Answer</h2><p>{result?.answer || 'এখনো কোনো তথ্য পাওয়া যায়নি'}</p></section> : null}
    {state === 'error' ? <section className={styles.error}><h2>Error</h2><p>{result?.error || 'কিছু সমস্যা হয়েছে।'}</p></section> : null}
  </div>;
}

async function post(body: Record<string, unknown>) {
  const response = await fetch('/api/v2/command', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data as ApiResult;
}

function stateLabel(state: ApiState) {
  return ({ ask: 'Ask', understanding: 'Understanding', confirmation: 'Confirmation', saved: 'Saved', answer: 'Answer', error: 'Error' })[state];
}
