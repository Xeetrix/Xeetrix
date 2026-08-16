'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'submitting' | 'success';

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
};

function Field({ id, label, type = 'text', required = true, textarea = false }: FieldProps) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const floating = focused || value.length > 0;

  const sharedClasses =
    'peer w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 pt-6 pb-2 text-sm text-white outline-none transition-colors focus:border-cyber-blue/60 focus:ring-2 focus:ring-cyber-blue/20';

  return (
    <div className="relative">
      {textarea ? (
        <textarea
          id={id}
          name={id}
          required={required}
          rows={5}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(sharedClasses, 'resize-none')}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={sharedClasses}
        />
      )}
      <label
        htmlFor={id}
        className={cn(
          'pointer-events-none absolute left-5 transition-all duration-200',
          floating ? 'top-2.5 text-[11px] text-cyber-blue' : 'top-4 text-sm text-white/40',
        )}
      >
        {label}
      </label>
    </div>
  );
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    window.setTimeout(() => setStatus('success'), 1200);
  }

  return (
    <section id="contact" className="relative mx-auto w-full max-w-3xl px-6 py-28 md:px-8">
      <SectionHeader
        eyebrow="Contact"
        title="Let's engineer your advantage"
        description="Tell us about your operation. We'll come back with where automation moves the needle fastest."
        align="center"
      />

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="card-glass mt-14 rounded-3xl border border-white/10 p-6 sm:p-10"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field id="name" label="Full name" />
          <Field id="email" label="Work email" type="email" />
        </div>
        <div className="mt-5">
          <Field id="company" label="Company" />
        </div>
        <div className="mt-5">
          <Field id="message" label="Tell us about your goals" textarea />
        </div>

        <button
          type="submit"
          disabled={status !== 'idle'}
          className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-black shadow-glow transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === 'idle' && (
            <>
              Send Message
              <Send className="h-4 w-4" />
            </>
          )}
          {status === 'submitting' && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Message sent
            </>
          )}
        </button>
      </motion.form>
    </section>
  );
}
