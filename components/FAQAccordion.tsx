'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { faqCategories, faqItems, type FaqCategory } from '@/lib/content/faq';
import { cn } from '@/lib/utils';

export function FAQAccordion() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FaqCategory | 'All'>('All');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return faqItems.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category;
      const matchesQuery =
        query.trim().length === 0 ||
        item.question.toLowerCase().includes(query.toLowerCase()) ||
        item.answer.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search FAQs"
            aria-label="Search frequently asked questions"
            className="w-full rounded-full border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyber-blue/60 focus:ring-2 focus:ring-cyber-blue/20"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['All', ...faqCategories] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
              className={cn(
                'rounded-full border px-4 py-2 text-xs font-medium transition-colors',
                category === cat
                  ? 'border-transparent bg-white text-black'
                  : 'border-white/10 bg-white/[0.03] text-white/70 hover:text-white',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 divide-y divide-white/10 rounded-3xl border border-white/10 bg-white/[0.02]">
        {filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-muted">No FAQs match your search. Try a different term.</p>
        )}
        {filtered.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.question}>
              <h3>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-sm font-medium text-white">{item.question}</span>
                  <ChevronDown
                    className={cn('h-4 w-4 shrink-0 text-white/50 transition-transform', isOpen && 'rotate-180')}
                  />
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-sm leading-relaxed text-muted">{item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
