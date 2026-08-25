'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { contactSchema, type ContactInput } from '@/lib/validation/contact';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(data: ContactInput) {
    setStatus('submitting');
    setServerError(null);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'Something went wrong. Please try again.');
      }
      setStatus('success');
      reset();
    } catch (error) {
      setStatus('error');
      setServerError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    }
  }

  const inputClasses =
    'w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-cyber-blue/60 focus:ring-2 focus:ring-cyber-blue/20';

  return (
    <section id="contact" className="relative mx-auto w-full max-w-3xl px-6 py-28 md:px-8">
      <SectionHeader
        eyebrow="Contact"
        title="Let's talk about your setup"
        description="Tell us where your business is today. We'll follow up with clear next steps."
        align="center"
      />

      {status === 'success' ? (
        <div className="card-glass mt-14 flex flex-col items-center gap-3 rounded-3xl border border-white/10 p-10 text-center">
          <CheckCircle2 className="h-8 w-8 text-cyber-blue" />
          <p className="text-lg font-semibold text-white">Message received</p>
          <p className="max-w-sm text-sm text-muted">{"We'll be in touch soon. " }Most inquiries receive a reply within one business day.</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="card-glass mt-14 rounded-3xl border border-white/10 p-6 sm:p-10"
        >
          {/* Honeypot field — hidden from real users, catches basic bots */}
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block text-xs font-medium text-white/60">
                Full name
              </label>
              <input id="name" className={inputClasses} {...register('name')} aria-invalid={Boolean(errors.name)} />
              {errors.name && (
                <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-medium text-white/60">
                Work email
              </label>
              <input
                id="email"
                type="email"
                className={inputClasses}
                {...register('email')}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && (
                <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="company" className="mb-2 block text-xs font-medium text-white/60">
              Company (optional)
            </label>
            <input id="company" className={inputClasses} {...register('company')} />
          </div>

          <div className="mt-5">
            <label htmlFor="message" className="mb-2 block text-xs font-medium text-white/60">
              Tell us about your goals
            </label>
            <textarea
              id="message"
              rows={5}
              className={cn(inputClasses, 'resize-none')}
              {...register('message')}
              aria-invalid={Boolean(errors.message)}
            />
            {errors.message && (
              <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="h-3.5 w-3.5" /> {errors.message.message}
              </p>
            )}
          </div>

          {status === 'error' && serverError && (
            <p role="alert" className="mt-5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" /> {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-black shadow-glow transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === 'submitting' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send Message
                <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}
    </section>
  );
}
