'use client';

import Link from 'next/link';
import { Github, Linkedin, Twitter, Zap } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import { footerLinks } from '@/components/data';

const socials = [
  { label: 'Twitter', href: 'https://twitter.com', icon: Twitter },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
  { label: 'GitHub', href: 'https://github.com', icon: Github },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  }

  return (
    <footer className="relative border-t border-white/10 bg-black/40">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-8">
        <div>
          <Link href="#home" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-blue to-electric-purple">
              <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-base font-bold tracking-tight text-white">Xeetrix</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Elite AI agents, custom APIs, and intelligent workflow automation for global enterprises.
          </p>

          <form onSubmit={handleSubscribe} className="mt-6 flex max-w-xs gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-cyber-blue/50 focus:ring-2 focus:ring-cyber-blue/20"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-black transition-opacity hover:opacity-90"
            >
              {subscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </form>
        </div>

        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <h4 className="text-sm font-semibold text-white">{heading}</h4>
            <ul className="mt-4 space-y-3">
              {links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col-reverse items-center gap-4 border-t border-white/5 px-6 py-6 text-sm text-muted md:flex-row md:justify-between md:px-8">
        <p>© 2026 Xeetrix. All rights reserved.</p>
        <div className="flex items-center gap-4">
          {socials.map((social) => (
            <Link
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-white/30 hover:text-white"
            >
              <social.icon className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
