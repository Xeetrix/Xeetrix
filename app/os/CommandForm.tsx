'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function CommandForm() {
  const router = useRouter();
  const [command, setCommand] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [clarificationMessage, setClarificationMessage] = useState('');

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

    try {
      const response = await fetch('/api/os/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: trimmedCommand }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? 'Shaikh OS-এ নির্দেশনা সংরক্ষণ করা যায়নি।');
      }

      if (data?.needs_clarification) {
        setClarificationMessage(data.clarification ?? 'আরও তথ্য দরকার।');
        setToastMessage(data.message ?? 'নির্দেশনাটি পর্যালোচনার জন্য রাখা হয়েছে।');
        return;
      }

      if (!data?.ok) {
        throw new Error(data?.error ?? 'Shaikh OS-এ নির্দেশনা সংরক্ষণ করা যায়নি।');
      }

      setCommand('');
      setToastMessage(data.message ?? 'Shaikh OS-এ নির্দেশনা সংরক্ষণ হয়েছে');
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Shaikh OS-এ নির্দেশনা সংরক্ষণ করা যায়নি।');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.commandForm} onSubmit={handleSubmit}>
      <label htmlFor="ai-command">নির্দেশনা</label>
      <div className={styles.inputShell} aria-busy={isSubmitting}>
        <input
          id="ai-command"
          type="text"
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          placeholder="উদাহরণ: আগামীকাল সকালে KNLTC ফলোআপটি জরুরি অগ্রাধিকার দিয়ে যোগ করুন"
          aria-label="Shaikh OS নির্দেশনা ইনপুট"
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting || !command.trim()}>
          {isSubmitting ? 'তালিকাভুক্ত হচ্ছে…' : 'তালিকাভুক্ত করুন'}
        </button>
      </div>
      <small>Shaikh OS মেমরির সঙ্গে যুক্ত — স্বাভাবিক ভাষার নির্দেশনা থেকে কাজ তৈরি হয়।</small>
      {errorMessage ? (
        <p className={styles.commandError} role="alert">
          {errorMessage}
        </p>
      ) : null}
      {clarificationMessage ? (
        <p className={styles.commandClarification} role="status" aria-live="polite">
          {clarificationMessage}
        </p>
      ) : null}
      {toastMessage ? (
        <div className={styles.commandToast} role="status" aria-live="polite">
          {toastMessage}
        </div>
      ) : null}
    </form>
  );
}
