"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const features = [
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 10h8M8 14h5" />
      </svg>
    ),
    title: "Smart Replies",
    description: "AI drafts contextually-aware replies that match your tone and communication style.",
    accentColor: "#FF9966",
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "Priority Scoring",
    description: "Every email gets a priority score based on sender, urgency signals, and deadlines.",
    accentColor: "#FBBC05",
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: "Thread Summaries",
    description: "Long email chains condensed to a 3-line TL;DR so you catch up in seconds, not minutes.",
    accentColor: "#34A853",
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Deadline Detection",
    description: "AI parses every email for due dates, follow-up signals, and time-sensitive requests.",
    accentColor: "#EA4335",
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "AI-Powered Inbox",
    description: "Your entire inbox, reorganized. AI auto-archives spam and surfaces what actually matters.",
    accentColor: "#4285F4",
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: "Multi-language Support",
    description: "Reply in 40+ languages. AI detects the sender's language and matches it automatically.",
    accentColor: "#FF9966",
  },
];

export function FeaturesGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" ref={ref} className="w-full py-24 px-4 bg-[#09090b]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-widest text-white/30 mb-3">
            Features
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
            Everything your inbox needs,{" "}
            <span style={{ background: "linear-gradient(90deg,#FF9966,#FF5E62)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              nothing it doesn't
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/40 max-w-lg mx-auto text-base">
            Six powerful AI capabilities working together to make your email life effortless.
          </motion.p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map(({ icon, title, description, accentColor }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="group relative rounded-2xl border border-white/8 bg-[#111113] p-6 flex flex-col gap-4 hover:border-white/15 transition-all duration-300 cursor-default overflow-hidden"
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(ellipse at 0% 0%, ${accentColor}15 0%, transparent 60%)` }}
              />

              {/* Icon */}
              <div
                className="relative w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30`, color: accentColor }}
              >
                {icon}
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="font-bold text-white text-base mb-2">{title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

