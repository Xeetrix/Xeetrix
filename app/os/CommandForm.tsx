'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

type Brain = {
  reasoning?: { why_it_matters?: string; suggested_action?: string; related_past_context?: string[] };
  related_context?: Record<string, unknown>;
  confirmation_sections?: { understood: string; why_important: string; suggested_action: string; save_location: string; related_information: string[]; confidence: number };
};

const PERSISTENCE_ERROR_MESSAGE = 'নির্দেশনাটি বুঝেছি, কিন্তু সংরক্ষণের প্রস্তুতিতে সমস্যা হয়েছে।';

type Answer = {
  answer_type: string;
  title: string;
  summary: string;
  sections: { title: string; items: string[] }[];
};

type Plan = {
  intent: 'task' | 'reminder' | 'note' | 'idea' | 'decision' | 'meeting' | 'health_log' | 'finance_log' | 'contact' | 'follow_up' | 'unknown';
  project_name: string;
  project_id: string | null;
  title: string;
  summary: string;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  reminder_at: string | null;
  amount: number | null;
  direction: 'income' | 'expense' | null;
  category: string | null;
  people: string[];
  confidence: number;
  needs_confirmation: boolean;
  needs_clarification: boolean;
  clarification_question: string | null;
  save_target: 'tasks' | 'notes';
  save_location_label: string;
  target: 'tasks' | 'notes';
  raw_command: string;
  parser?: 'llm' | 'fallback';
};

const intentLabels: Record<Plan['intent'], string> = {
  task: 'কাজ',
  note: 'নোট',
  idea: 'ধারণা',
  meeting: 'মিটিং',
  reminder: 'রিমাইন্ডার',
  health_log: 'স্বাস্থ্য লগ',
  finance_log: 'অর্থ লগ',
  contact: 'কন্টাক্ট',
  follow_up: 'ফলো-আপ',
  decision: 'সিদ্ধান্ত',
  unknown: 'পরিষ্কার নয়',
};

const targetLabels: Record<Plan['target'], string> = {
  tasks: 'কাজ',
  notes: 'নোট',
};

const priorityLabels: Record<Plan['priority'], string> = {
  high: 'জরুরি',
  medium: 'মাঝারি',
  low: 'কম',
};

export default function CommandForm() {
  const router = useRouter();
  const [command, setCommand] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [clarificationMessage, setClarificationMessage] = useState('');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [brain, setBrain] = useState<Brain | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToastMessage('');
    }, 3200);

    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedCommand = command.trim();
    if (!trimmedCommand || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setToastMessage('');
    setClarificationMessage('');
    setPlan(null);
    setAnswer(null);
    setBrain(null);
    setPlanId(null);

    try {
      const response = await fetch('/api/os/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: trimmedCommand }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok && data?.mode !== 'clarification') {
        const message = data?.error_type === 'plan_persistence_failed' ? PERSISTENCE_ERROR_MESSAGE : data?.error;
        throw new Error(message ?? 'Shaikh OS নির্দেশনাটি বুঝতে পারেনি।');
      }

      if (data?.mode === 'answer') {
        setAnswer({ answer_type: data.answer_type, title: data.title, summary: data.summary, sections: data.sections ?? [] });
        setToastMessage('উত্তর প্রস্তুত।');
        return;
      }

      if (data?.needs_clarification) {
        setClarificationMessage(data.clarification_question ?? data.message ?? 'আরও তথ্য দরকার।');
        setPlanId(data.plan_id ?? null);
        setPlan(data.brain?.plan ?? null);
        setBrain(data.brain ?? null);
        return;
      }

      if (data?.error_type === 'plan_persistence_failed') {
        throw new Error(PERSISTENCE_ERROR_MESSAGE);
      }

      if (!data?.ok || !data?.plan_id || !data?.brain?.plan) {
        throw new Error(data?.error ?? 'Shaikh OS নির্দেশনাটি বুঝতে পারেনি।');
      }

      setPlanId(data.plan_id);
      setPlan(data.brain.plan);
      setBrain(data.brain ?? null);
      setToastMessage(data.message ?? 'নিশ্চিত করলে সংরক্ষণ করা হবে।');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Shaikh OS নির্দেশনাটি বুঝতে পারেনি।');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirm() {
    if (!planId || !plan || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setToastMessage('');

    try {
      const response = await fetch('/api/os/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirm: true, plan_id: planId }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? 'Shaikh OS-এ নির্দেশনা সংরক্ষণ করা যায়নি।');
      }

      setCommand('');
      setPlan(null);
      setAnswer(null);
      setBrain(null);
      setPlanId(null);
      setClarificationMessage('');
      setToastMessage(data.message ?? 'সংরক্ষণ করা হয়েছে।');
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Shaikh OS-এ নির্দেশনা সংরক্ষণ করা যায়নি।');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancel() {
    const previousPlan = plan;
    setPlan(null);
    setAnswer(null);
    setBrain(null);
    setClarificationMessage('');
    setToastMessage('বাতিল করা হয়েছে।');
    if (previousPlan || planId) {
      await fetch('/api/os/command', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cancel: true, plan_id: planId }) }).catch(() => null);
    }
    setPlanId(null);
  }

  return (
    <form className={styles.commandForm} onSubmit={handleSubmit}>
      <label htmlFor="ai-command">বলুন</label>
      <div className={styles.inputShell} aria-busy={isSubmitting}>
        <input
          id="ai-command"
          type="text"
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          placeholder="আজকে কী কী কাজ বাকি আছে? · আজ রাতে ঘুম ভালো হয়নি · KNLTC lead follow-up দেখাও"
          aria-label="Shaikh OS নির্দেশনা ইনপুট"
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting || !command.trim()}>
          {isSubmitting ? 'বুঝছি...' : 'বুঝুন'}
        </button>
      </div>
      <small>আমি আগে বুঝে নেব, তারপর আপনার অনুমতি নিয়ে সংরক্ষণ করব।</small>
      {errorMessage ? (
        <p className={styles.commandError} role="alert">
          {errorMessage}
        </p>
      ) : null}
      {clarificationMessage ? (
        <p className={styles.commandClarification} role="status" aria-live="polite">
          <strong>পরিষ্কার নয়:</strong> {clarificationMessage}
        </p>
      ) : null}
      {answer ? (
        <div className={styles.answerCard} role="region" aria-label="Shaikh OS উত্তর">
          <div>
            <span>প্রশ্ন</span>
            <h3>{answer.title}</h3>
            <h4>উত্তর</h4>
            <p>{answer.summary}</p>
          </div>
          <div className={styles.answerSections}>
            {answer.sections.map((section) => (
              <section key={section.title}>
                <h4>{section.title || 'পাওয়া তথ্য'}</h4>
                <ul>
                  {section.items.map((item, index) => (
                    <li key={`${section.title}-${index}`}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      ) : null}
      {plan && !plan.needs_clarification ? (
        <div className={styles.confirmationCard} role="region" aria-label="নিশ্চিত করুন">
          <div>
            <span>{intentLabels[plan.intent]}</span>
            <h3>আমি যা বুঝেছি</h3>
            <p>{brain?.confirmation_sections?.understood ?? `নিশ্চিত করলে তবেই সংরক্ষণ হবে: “${plan.title}”।`}</p>
          </div>
          <dl>
            <div>
              <dt>ধরন</dt>
              <dd>{intentLabels[plan.intent]}</dd>
            </div>
            <div>
              <dt>প্রকল্প</dt>
              <dd>{plan.project_name}</dd>
            </div>
            <div>
              <dt>শিরোনাম</dt>
              <dd>{plan.title}</dd>
            </div>
            {(plan.due_date || plan.reminder_at) ? (
              <div>
                <dt>সময়</dt>
                <dd>{formatDate(plan.due_date ?? plan.reminder_at ?? '')}</dd>
              </div>
            ) : null}
            {plan.amount !== null ? (
              <div>
                <dt>পরিমাণ</dt>
                <dd>{formatAmount(plan.amount, plan.direction)}</dd>
              </div>
            ) : null}
            <div>
              <dt>অগ্রাধিকার</dt>
              <dd>{priorityLabels[plan.priority]}</dd>
            </div>
            <div>
              <dt>কোথায় সংরক্ষণ হবে</dt>
              <dd>{brain?.confirmation_sections?.save_location || plan.save_location_label || targetLabels[plan.target]}</dd>
            </div>
            <div>
              <dt>কেন গুরুত্বপূর্ণ</dt>
              <dd>{brain?.confirmation_sections?.why_important ?? brain?.reasoning?.why_it_matters ?? 'এই তথ্য ভবিষ্যৎ context ও decision support উন্নত করবে।'}</dd>
            </div>
            <div>
              <dt>প্রস্তাবিত কাজ</dt>
              <dd>{brain?.confirmation_sections?.suggested_action ?? brain?.reasoning?.suggested_action ?? 'সংরক্ষণ করা'}</dd>
            </div>
            {brain?.confirmation_sections?.related_information?.length ? (
              <div>
                <dt>সম্পর্কিত তথ্য</dt>
                <dd>{brain.confirmation_sections.related_information.join(' · ')}</dd>
              </div>
            ) : null}
            <div>
              <dt>আস্থা</dt>
              <dd>{Math.round((brain?.confirmation_sections?.confidence ?? plan.confidence) * 100)}%</dd>
            </div>
          </dl>
          <div className={styles.confirmationActions}>
            <button type="button" onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? 'সংরক্ষণ হচ্ছে…' : 'নিশ্চিত করুন ও সংরক্ষণ'}
            </button>
            <button type="button" onClick={handleCancel} disabled={isSubmitting}>
              বাতিল
            </button>
          </div>
        </div>
      ) : null}
      {toastMessage ? (
        <div className={styles.commandToast} role="status" aria-live="polite">
          {toastMessage}
        </div>
      ) : null}
    </form>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('bn-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Dhaka',
  }).format(date);
}

function formatAmount(amount: number, direction: Plan['direction']) {
  const label = direction === 'income' ? 'আয়' : direction === 'expense' ? 'খরচ' : 'পরিমাণ';
  return `${label}: ${new Intl.NumberFormat('bn-BD').format(amount)} টাকা`;
}
