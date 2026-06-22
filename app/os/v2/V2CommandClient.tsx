'use client';

import { useMemo, useState } from 'react';
import styles from './v2.module.css';

type ApiState = 'ask' | 'thinking' | 'confirmation' | 'saved' | 'answer' | 'clarify' | 'error';
type Brain = { understanding?: string; confidence?: number; intent?: string };
type ApiResult = { mode?: string; answer?: string; error?: string; question?: string; session_id?: string; plan_id?: string; understanding?: string; brain?: Brain; confirmation?: { title?: string | null; action_type?: string; project_name?: string | null; message?: string; payload?: Record<string, unknown> }; message?: string };

export default function V2CommandClient() {
  const [command, setCommand] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [state, setState] = useState<ApiState>('ask');
  const [result, setResult] = useState<ApiResult | null>(null);
  const understanding = useMemo(() => result?.understanding || result?.brain?.understanding, [result]);

  async function send() {
    if (!command.trim()) return;
    setState('thinking');
    setResult(null);
    const data = await post({ command, session_id: sessionId }).catch((error) => ({ mode: 'error', error: error.message }) as ApiResult);
    if (data.session_id) setSessionId(data.session_id);
    setResult(data);
    setState(data.mode === 'answer' ? 'answer' : data.mode === 'plan' ? 'confirmation' : data.mode === 'clarify' ? 'clarify' : 'error');
  }

  async function confirm(confirmPlan: boolean) {
    if (!result?.plan_id) return;
    setState('thinking');
    const data = await post({ plan_id: result.plan_id, session_id: sessionId, [confirmPlan ? 'confirm' : 'cancel']: true }).catch((error) => ({ mode: 'error', error: error.message }) as ApiResult);
    setResult(data);
    setState(confirmPlan && data.mode === 'saved' ? 'saved' : data.mode === 'cancelled' ? 'ask' : 'error');
    if (confirmPlan && data.mode === 'saved') setCommand('');
  }

  return <div className={styles.card}>
    <div className={styles.state}>{stateLabel(state)}</div>
    <label className={styles.label} htmlFor="v2-command">আপনার কথা</label>
    <textarea id="v2-command" value={command} onChange={(event) => setCommand(event.target.value)} placeholder="আজ কী করতে হবে, কী জানতে চান, বা কী মনে রাখতে হবে?" rows={5} />
    <button onClick={send} disabled={state === 'thinking'}>{state === 'thinking' ? 'ভাবছি…' : 'Shaikh OS-কে বলুন'}</button>

    {understanding ? <section className={styles.panel}>
      <p className={styles.badge}>Understanding</p>
      <h2>আমি যেভাবে বুঝেছি</h2>
      <p>{understanding}</p>
    </section> : null}

    {state === 'confirmation' && result?.confirmation ? <section className={styles.panel}>
      <p className={styles.badge}>Confirmation</p>
      <h2>{result.confirmation.title || 'নতুন পরিকল্পনা'}</h2>
      <p>কাজের ধরন: {result.confirmation.action_type}</p>
      {result.confirmation.project_name ? <p>প্রজেক্ট: {result.confirmation.project_name}</p> : null}
      <pre>{JSON.stringify(result.confirmation.payload ?? {}, null, 2)}</pre>
      <strong>এটা execute করলে v2 canonical table-এ সংরক্ষণ হবে। নিশ্চিত করবেন?</strong>
      <div className={styles.actions}><button onClick={() => confirm(true)}>হ্যাঁ, save করো</button><button onClick={() => confirm(false)} className={styles.ghost}>না, বাতিল</button></div>
    </section> : null}

    {state === 'clarify' ? <section className={styles.panel}><p className={styles.badge}>Clarify</p><h2>একটা প্রশ্ন</h2><p>{result?.question}</p></section> : null}
    {state === 'saved' ? <section className={styles.saved}><p className={styles.badge}>Saved</p><h2>সংরক্ষণ হয়েছে</h2><p>{result?.message}</p></section> : null}
    {state === 'answer' ? <section className={styles.panel}><p className={styles.badge}>Answer</p><h2>উত্তর</h2><p>{result?.answer || 'এখনো কোনো তথ্য পাওয়া যায়নি'}</p></section> : null}
    {state === 'error' ? <section className={styles.error}><p className={styles.badge}>Error</p><h2>সমস্যা হয়েছে</h2><p>{result?.error || 'কিছু সমস্যা হয়েছে।'}</p></section> : null}
  </div>;
}

async function post(body: Record<string, unknown>) {
  const response = await fetch('/api/v2/command', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data as ApiResult;
}

function stateLabel(state: ApiState) {
  return ({ ask: 'Ready', thinking: 'Observe → Recall → Reason', confirmation: 'Confirm', saved: 'Saved', answer: 'Answer', clarify: 'Clarify', error: 'Error' })[state];
}
