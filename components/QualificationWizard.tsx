'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { MagneticButton } from '@/components/ui/MagneticButton';
import { pricingPackages } from '@/lib/content/pricing';
import { deriveNeeds, wizardQuestions, type WizardAnswers } from '@/lib/content/wizard';
import { qualificationSchema, type QualificationInput } from '@/lib/validation/qualification';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const businessStageOptions: { value: QualificationInput['businessStage']; label: string }[] = [
  { value: 'idea', label: 'Still at the idea stage' },
  { value: 'existing-no-us-entity', label: 'Operating, but no US entity yet' },
  { value: 'has-us-entity-needs-more', label: 'Have a US entity, need more infrastructure' },
];

export function QualificationWizard() {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<WizardAnswers>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const totalSteps = wizardQuestions.length + 1;
  const currentQuestion = step < wizardQuestions.length ? wizardQuestions[step] : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QualificationInput>({ resolver: zodResolver(qualificationSchema) });

  const recommendation = useMemo(() => {
    const needs = deriveNeeds(answers);
    const needsWebsiteOrPayments = needs.includes('website') || needs.includes('payments');
    const needsBankingOnly = needs.includes('banking') || needs.includes('compliance');
    if (needsWebsiteOrPayments) return pricingPackages[2];
    if (needsBankingOnly) return pricingPackages[1];
    return pricingPackages[0];
  }, [answers]);

  function selectOption(questionId: string, value: string, multiSelect?: boolean) {
    setAnswers((prev) => {
      if (!multiSelect) return { ...prev, [questionId]: [value] };
      const existing = prev[questionId] ?? [];
      const next = existing.includes(value) ? existing.filter((v) => v !== value) : [...existing, value];
      return { ...prev, [questionId]: next };
    });
  }

  function goNext() {
    setStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }

  function goBack() {
    setStep((prev) => Math.max(prev - 1, 0));
  }

  async function onSubmit(data: QualificationInput) {
    setStatus('submitting');
    setServerError(null);
    try {
      const response = await fetch('/api/qualification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'Something went wrong. Please try again.');
      }
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setServerError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    }
  }

  const inputClasses =
    'w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-cyber-blue/60 focus:ring-2 focus:ring-cyber-blue/20';

  if (status === 'success') {
    return (
      <div className="card-glass rounded-[32px] border border-white/10 p-8 sm:p-12">
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-cyber-blue">
          Your Recommended Path
        </span>
        <div className="mt-6 flex items-center gap-3">
          <CheckCircle2 className="h-7 w-7 text-cyber-blue" />
          <h3 className="text-2xl font-semibold text-white">Application received</h3>
        </div>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
          Based on your answers, our <strong className="text-white">{recommendation.name}</strong> package is the
          closest starting point. This is a recommendation only, not a final quote — we&rsquo;ll confirm the right setup
          with you directly.
        </p>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm font-semibold text-white">{recommendation.name} — {recommendation.price}</p>
          <ul className="mt-4 space-y-2">
            {recommendation.features.slice(0, 4).map((feature) => (
              <li key={feature} className="flex gap-2 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyber-blue" /> {feature}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-6 text-sm text-muted">{siteResponseNote}</p>
        <div className="mt-8">
          <MagneticButton href="/pricing">See Full Pricing</MagneticButton>
        </div>
      </div>
    );
  }

  return (
    <div className="card-glass rounded-[32px] border border-white/10 p-6 sm:p-10">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-white/40">
          Step {step + 1} of {totalSteps}
        </p>
        <p className="text-xs font-medium text-white/40">{Math.round(((step + 1) / totalSteps) * 100)}%</p>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyber-blue to-electric-purple"
          animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduceMotion ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
          transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10"
        >
          {currentQuestion ? (
            <div>
              <h3 className="text-xl font-semibold text-white">{currentQuestion.question}</h3>
              {currentQuestion.helper && <p className="mt-2 text-sm text-muted">{currentQuestion.helper}</p>}
              <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {currentQuestion.options.map((option) => {
                  const selected = (answers[currentQuestion.id] ?? []).includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => selectOption(currentQuestion.id, option.value, currentQuestion.multiSelect)}
                      aria-pressed={selected}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl border px-5 py-4 text-left text-sm font-medium transition-colors',
                        selected
                          ? 'border-cyber-blue/50 bg-cyber-blue/10 text-white'
                          : 'border-white/10 bg-white/[0.03] text-white/70 hover:text-white',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                          currentQuestion.multiSelect ? 'rounded' : 'rounded-full',
                          selected ? 'border-cyber-blue bg-cyber-blue' : 'border-white/20',
                        )}
                      >
                        {selected && <Check className="h-3 w-3 text-white" />}
                      </span>
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <h3 className="text-xl font-semibold text-white">Almost there — where should we send your path?</h3>
              <p className="mt-2 text-sm text-muted">We&rsquo;ll confirm your recommended setup by email.</p>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="mb-2 block text-xs font-medium text-white/60">
                    Full name
                  </label>
                  <input id="fullName" className={inputClasses} {...register('fullName')} />
                  {errors.fullName && (
                    <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.fullName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-xs font-medium text-white/60">
                    Email
                  </label>
                  <input id="email" type="email" className={inputClasses} {...register('email')} />
                  {errors.email && (
                    <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="country" className="mb-2 block text-xs font-medium text-white/60">
                    Country
                  </label>
                  <input id="country" className={inputClasses} {...register('country')} />
                  {errors.country && (
                    <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.country.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="businessStage" className="mb-2 block text-xs font-medium text-white/60">
                    Business stage
                  </label>
                  <select id="businessStage" className={inputClasses} defaultValue="" {...register('businessStage')}>
                    <option value="" disabled>
                      Select one
                    </option>
                    {businessStageOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-black">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.businessStage && (
                    <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.businessStage.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="message" className="mb-2 block text-xs font-medium text-white/60">
                  Anything else we should know? (optional)
                </label>
                <textarea id="message" rows={4} className={cn(inputClasses, 'resize-none')} {...register('message')} />
              </div>

              {/* Hidden fields carrying wizard answers into validated payload */}
              <input type="hidden" value={(answers.businessType ?? ['other'])[0]} {...register('businessType')} />
              <input type="hidden" value={(answers.hasCompany ?? ['no'])[0]} {...register('hasUsCompany')} />
              <input type="hidden" value={(answers.hasEin ?? ['not-sure'])[0]} {...register('einStatus')} />
              <input type="hidden" value={(answers.needsBanking ?? ['no'])[0]} {...register('needsBanking')} />
              <input type="hidden" value={(answers.needsPayments ?? ['no'])[0]} {...register('needsPayments')} />
              <input
                type="hidden"
                value={answers.hasWebsite?.[0] === 'yes' ? 'no' : 'yes'}
                {...register('needsWebsite')}
              />
              <input
                type="hidden"
                value={(answers.volume ?? [''])[0]}
                {...register('expectedMonthlyVolume')}
              />
              <input type="hidden" value="" {...register('website')} />

              {status === 'error' && serverError && (
                <p role="alert" className="mt-5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {serverError}
                </p>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-6 text-sm font-medium text-white/80 transition-colors hover:border-white/30"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-semibold text-black shadow-glow transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Start Your Application'
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </AnimatePresence>

      {currentQuestion && (
        <div className="mt-10 flex justify-between border-t border-white/5 pt-6">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-white/80 transition-colors hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={(answers[currentQuestion.id] ?? []).length === 0}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

const siteResponseNote = "We'll follow up by email with next steps. Most inquiries receive a reply within one business day.";
