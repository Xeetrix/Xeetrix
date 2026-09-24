"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Globe2,
  MapPin,
  ExternalLink,
  Phone,
  RotateCcw,
  Languages,
} from "lucide-react";
import { BrandGlobeIcon } from "@/components/ui/BrandLogo";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  modelUsed?: string;
  groundingType?: string;
  sources?: { title: string; url: string }[];
  searchQueries?: string[];
}

const PRESET_PROMPTS = [
  "Baggage allowance for migrant workers to Saudi Arabia (40-46kg)",
  "ঢাকা থেকে জেদ্দা বিমান টিকেটের বর্তমান ভাড়া ও লাগেজ সুবিধা কত?",
  "What are the transit visa requirements for Dubai DXB airport?",
  "শাহজালাল বিমানবন্দর (DAC) টার্মিনাল ৩ আপডেট এবং ফ্লাইটের তথ্য",
  "Student discount & extra luggage options to UK / Europe / USA",
];

export function AiFlightConcierge({
  isOpen,
  onClose,
  initialQuery,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "স্বাগতম! আমি Xeetrix AI Flight Concierge।\nআমি আপনাকে লাইভ এয়ার টিকেট ফেয়ার, রেমিট্যান্স যোদ্ধা স্পেশাল লাগেজ সুবিধা (৪০-৪৬ কেজি), ট্রানজিট ভিসা তথ্য ও এয়ারপোর্ট টার্মিনাল গাইড দিতে পারি।\n\nHello! I am your Xeetrix AI Flight Concierge powered by Gemini 3.8 Flash. How can I assist with your flight booking or travel inquiries today?",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState(initialQuery || "");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"general" | "search" | "maps">("general");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  useEffect(() => {
    if (initialQuery) {
      setInput(initialQuery);
    }
  }, [initialQuery]);

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: "assistant",
        content:
          "নতুন কনভারসেশন শুরু হয়েছে! আপনার গন্তব্য, বাজেট বা ফ্লাইট সংক্রান্ত যেকোনো প্রশ্ন বাংলায় বা ইংরেজিতে লিখুন।\n\nNew conversation started. Ask me any flight query in English or Bengali!",
        timestamp: new Date(),
      },
    ]);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const historyForApi = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyForApi,
          mode,
        }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: `asst_${Date.now()}`,
        role: "assistant",
        content: data.text || "I was unable to retrieve that information. Please connect with our 24/7 hotline.",
        timestamp: new Date(),
        modelUsed: data.modelUsed,
        groundingType: data.groundingType,
        sources: data.sources || [],
        searchQueries: data.searchQueries || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content:
            "সাময়িক নেটওয়ার্ক সমস্যা হয়েছে। আমাদের ২৪/৭ সরাসরি হেল্পলাইনে কল করুন: +880 965 803 6631। (A temporary connection error occurred. Our 24/7 ticketing desk is ready to help!)",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-end p-0 sm:p-6 bg-slate-950/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full sm:w-[500px] h-[92dvh] sm:h-[680px] max-h-[95dvh] sm:max-h-[750px] flex flex-col bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 text-white border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B5D3A] text-white p-1">
                  <BrandGlobeIcon className="w-full h-full text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-white">
                      Xeetrix AI Flight Concierge
                    </span>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span>Gemini 3.8 Flash</span>
                    <span>•</span>
                    <Languages className="h-3 w-3 inline text-emerald-400" />
                    <span>বাংলা ও English</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="নতুন চ্যাট শুরু করুন (Reset Chat)"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="Reset Chat"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="Close AI Concierge"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* AI Capability Mode Switcher */}
            <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border-b border-slate-200 overflow-x-auto text-[11px] scrollbar-none">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[9px] mr-1 shrink-0">
                Intel Mode:
              </span>
              <button
                type="button"
                onClick={() => setMode("general")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium shrink-0 transition-all ${
                  mode === "general"
                    ? "bg-[#0B5D3A] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Sparkles className="h-3 w-3" />
                Smart Assist
              </button>
              <button
                type="button"
                onClick={() => setMode("search")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium shrink-0 transition-all ${
                  mode === "search"
                    ? "bg-[#0B5D3A] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Globe2 className="h-3 w-3" />
                Google Search Live
              </button>
              <button
                type="button"
                onClick={() => setMode("maps")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium shrink-0 transition-all ${
                  mode === "maps"
                    ? "bg-[#0B5D3A] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <MapPin className="h-3 w-3" />
                Airport &amp; Maps
              </button>
            </div>

            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-[#0B5D3A] text-white rounded-br-xs shadow-xs"
                        : "bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/80"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>

                    {/* Grounding Citations */}
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1.5">
                          <Globe2 className="h-3 w-3 text-brand-700" />
                          Verified Grounded Sources:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {m.sources.map((s, idx) => (
                            <a
                              key={idx}
                              href={s.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[10px] text-brand-700 border border-slate-200 hover:border-brand-500 transition-colors truncate max-w-[200px]"
                            >
                              <span className="truncate">{s.title}</span>
                              <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadata tags */}
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span>
                        {m.modelUsed?.includes("3.8")
                          ? "Gemini 3.8 Flash"
                          : m.role === "user"
                          ? "You"
                          : "AI Assistant"}
                      </span>
                      <span>
                        {m.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="rounded-2xl rounded-bl-xs bg-slate-100 border border-slate-200 px-4 py-3 text-slate-600 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#0B5D3A]" />
                    <span className="text-xs">
                      এয়ারলাইন ডাটা এবং লাইভ তথ্য যাচাই করা হচ্ছে...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Preset prompt pills */}
            {messages.length < 3 && (
              <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                  দ্রুত প্রশ্ন নির্বাচন করুন / Frequent Inquiries:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_PROMPTS.slice(0, 3).map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      className="text-left rounded-lg bg-white px-2.5 py-1 text-[11px] text-slate-700 border border-slate-200 hover:border-[#0B5D3A] hover:text-[#0B5D3A] transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <div className="p-3 bg-white border-t border-slate-200">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="প্রশ্ন লিখুন (যেমন: ঢাকা থেকে দুবাই টিকেটের ভাড়া কত?)..."
                  disabled={isLoading}
                  className="flex-1 rounded-xl bg-slate-100 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B5D3A] focus:bg-white transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B5D3A] text-white hover:bg-[#084A2E] transition-all disabled:opacity-50 shrink-0"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Support footnote */}
              <div className="flex items-center justify-between mt-2 pt-1.5 text-[10px] text-slate-400 px-1">
                <span>২৪/৭ সরাসরি বুকিং হটলাইন:</span>
                <a
                  href={CONTACT_PHONE_TEL}
                  className="font-bold text-[#0B5D3A] hover:underline flex items-center gap-1"
                >
                  <Phone className="h-2.5 w-2.5" />
                  {CONTACT_PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Floating trigger button for the AI Concierge
 */
export function AiConciergeFloatingButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-30 hidden lg:flex items-center gap-2.5 rounded-full bg-[#0B5D3A] px-4 py-3 text-white shadow-elevated hover:bg-[#094d30] transition-all hover:scale-105 active:scale-95 group border border-emerald-400/20"
      aria-label="Open Xeetrix AI Flight Concierge"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 p-1">
        <Sparkles className="h-4 w-4 text-emerald-200 group-hover:rotate-12 transition-transform" />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-xs font-bold leading-none">AI Flight Concierge</span>
        <span className="text-[10px] text-emerald-200 font-medium">বাংলা ও English • Gemini 3.8</span>
      </div>
    </button>
  );
}
