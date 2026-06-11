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

    try {
      const response = await fetch('/api/os/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: trimmedCommand }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? 'Failed to add task to Shaikh OS.');
      }

      setCommand('');
      setToastMessage('Task added to Shaikh OS');
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add task to Shaikh OS.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.commandForm} onSubmit={handleSubmit}>
      <label htmlFor="ai-command">Command</label>
      <div className={styles.inputShell} aria-busy={isSubmitting}>
        <input
          id="ai-command"
          type="text"
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          placeholder="Example: Add a high priority KNLTC follow-up for tomorrow morning"
          aria-label="Shaikh OS command input"
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting || !command.trim()}>
          {isSubmitting ? 'Queuing…' : 'Queue'}
        </button>
      </div>
      <small>Connected to Shaikh OS memory — natural language commands create tasks.</small>
      {errorMessage ? (
        <p className={styles.commandError} role="alert">
          {errorMessage}
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
