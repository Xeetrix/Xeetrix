"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Lock, PackageSearch } from "lucide-react";
import { MartLogo } from "./MartLogo";
import {
  MART_ADDRESS,
  MART_BRAND_NAME,
  MART_CONTACT_EMAIL,
  MART_CONTACT_PHONE,
  MART_CONTACT_TEL,
} from "@/lib/martApi";

interface MartFooterProps {
  onOpenTrackOrder?: () => void;
}

export function MartFooter({ onOpenTrackOrder }: MartFooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand Identity */}
          <div className="space-y-4">
            <MartLogo inverted />
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Your trusted destination for authentic electronics, daily essentials, and verified
              lifestyle products with fast Cash on Delivery across Bangladesh.
            </p>
          </div>

          {/* Customer Navigation */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">
              Customer Service
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/mart#mart-catalog" className="hover:text-white transition-colors">
                  Browse All Products
                </Link>
              </li>
              {onOpenTrackOrder && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenTrackOrder}
                    className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <PackageSearch className="h-3.5 w-3.5 text-gold-400" />
                    <span>Track Your Order</span>
                  </button>
                </li>
              )}
              <li>
                <Link
                  href="/mart/admin"
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Store Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Store Contact */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">
              Store Support Desk
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5 text-slate-300">
                <MapPin className="h-4 w-4 text-gold-400 shrink-0 mt-0.5" />
                <span>{MART_ADDRESS}</span>
              </li>
              <li>
                <a
                  href={`mailto:${MART_CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-2.5 text-white hover:text-gold-400 transition-colors"
                >
                  <Mail className="h-4 w-4 text-gold-400 shrink-0" />
                  <span>{MART_CONTACT_EMAIL}</span>
                </a>
              </li>
              <li>
                <a
                  href={MART_CONTACT_TEL}
                  className="inline-flex items-center gap-2.5 font-mono font-semibold text-white hover:text-gold-400 transition-colors tabular-nums"
                >
                  <Phone className="h-4 w-4 text-gold-400 shrink-0" />
                  <span>{MART_CONTACT_PHONE}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {MART_BRAND_NAME}. All rights reserved.</p>
          <p>
            Customer Helpline:{" "}
            <span className="font-mono text-slate-300 tabular-nums">{MART_CONTACT_PHONE}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
