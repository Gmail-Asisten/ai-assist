"use client";

import React, { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const faqs = [
  {
    question: "Is my email data secure?",
    answer:
      "Absolutely. We use OAuth 2.0 — we never store your Gmail/Outlook password. Email content is processed in-memory by Gemini AI and never persisted on our servers. All data is encrypted in transit via TLS 1.3 and we are SOC 2 compliant.",
  },
  {
    question: "Which email providers are supported?",
    answer:
      "Mail Assistant currently supports Gmail and Google Workspace accounts, with Microsoft Outlook & Office 365 integration available on Pro and Enterprise plans. IMAP support for other providers is on our roadmap.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer:
      "Yes! The Pro plan comes with a 14-day free trial — no credit card required. You can experience all Pro features and upgrade or cancel at any time before the trial ends.",
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer:
      "Yes, cancel anytime from your account settings. Your plan stays active until the end of your billing period, and you'll never be charged again. No cancellation fees, ever.",
  },
  {
    question: "How does the AI draft replies?",
    answer:
      "Mail Assistant sends the email thread context to Google Gemini AI, which analyzes tone, intent, urgency, and your previous writing style to generate a contextually appropriate reply. You always review before sending — the AI drafts, you decide.",
  },
  {
    question: "What languages does Mail Assistant support?",
    answer:
      "The AI can read and write in 40+ languages including English, Spanish, French, German, Portuguese, Indonesian, Japanese, Korean, and more. It auto-detects the sender's language and matches it in the reply draft.",
  },
];

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      variants={fadeUp}
      className="border-b border-white/8 last:border-none"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 cursor-pointer bg-transparent border-none group"
        id={`faq-${index}`}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
      >
        <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" as const }}
          className="shrink-0 w-6 h-6 rounded-full border border-white/15 flex items-center justify-center text-white/40 group-hover:border-white/30 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-answer-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" as const }}
            className="overflow-hidden"
          >
            <p className="text-sm text-white/45 leading-relaxed pb-5 pr-10">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="faq" ref={ref} className="w-full py-24 px-4 bg-[#09090b]">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-widest text-white/30 mb-3">
            FAQ
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
            Common{" "}
            <span style={{ background: "linear-gradient(90deg,#FF9966,#FF5E62)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              questions
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/40 max-w-md mx-auto text-base">
            Everything you need to know before getting started.
          </motion.p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="rounded-2xl border border-white/8 bg-[#111113] px-6 divide-white/8"
        >
          {faqs.map(({ question, answer }, i) => (
            <FAQItem key={question} question={question} answer={answer} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

