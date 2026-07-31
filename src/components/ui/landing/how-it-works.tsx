"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const steps = [
  {
    number: "01",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <circle cx="9" cy="10" r="1" fill="currentColor" />
        <circle cx="12" cy="10" r="1" fill="currentColor" />
        <circle cx="15" cy="10" r="1" fill="currentColor" />
      </svg>
    ),
    title: "Connect your email",
    description: "Link your Gmail or Outlook account securely with OAuth. Zero passwords stored.",
    tag: "Gmail · Outlook",
  },
  {
    number: "02",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "AI scans & prioritizes",
    description: "Gemini reads your inbox, detects urgency, deadlines, and important senders automatically.",
    tag: "Real-time · Instant",
  },
  {
    number: "03",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    title: "Review AI drafts",
    description: "Mail Assistant prepares context-aware reply drafts. You review, tweak, or approve.",
    tag: "Smart · Accurate",
  },
  {
    number: "04",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
    title: "Send in one click",
    description: "Hit send or edit on the spot. Your inbox stays clean, your replies stay sharp.",
    tag: "1-click · Done",
  },
];

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" ref={ref} className="w-full py-24 px-4 bg-[#0c0c0e]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-widest text-white/30 mb-3">
            How it works
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
            From chaotic to calm in{" "}
            <span style={{ background: "linear-gradient(90deg,#FF9966,#FF5E62)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              4 steps
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/40 max-w-lg mx-auto text-base">
            Set up once, let AI handle the rest. No complex workflows, no steep learning curves.
          </motion.p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {steps.map(({ number, icon, title, description, tag }, i) => (
            <motion.div
              key={number}
              variants={fadeUp}
              className="relative group rounded-2xl border border-white/8 bg-[#111113] p-6 flex flex-col gap-4 hover:border-white/15 transition-colors duration-300"
            >
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-[2.4rem] -right-[0.65rem] w-5 h-px bg-white/10 z-10" />
              )}
              {/* Number */}
              <div className="flex items-start justify-between">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white/90"
                  style={{ background: "linear-gradient(135deg, rgba(255,153,102,0.15) 0%, rgba(255,94,98,0.15) 100%)", border: "1px solid rgba(255,94,98,0.2)" }}
                >
                  {icon}
                </div>
                <span className="text-5xl font-black text-white/5 leading-none select-none">{number}</span>
              </div>
              {/* Content */}
              <div>
                <h3 className="font-bold text-white text-base mb-2">{title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{description}</p>
              </div>
              {/* Tag */}
              <span className="self-start text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/8 text-white/35">
                {tag}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

