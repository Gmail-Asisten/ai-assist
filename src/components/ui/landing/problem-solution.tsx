"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const BeforeCard = () => (
  <div className="relative rounded-2xl border border-white/8 bg-[#111113] overflow-hidden">
    {/* Label */}
    <div className="flex items-center gap-2 px-5 py-3 border-b border-white/8 bg-[#0e0e10]">
      <span className="w-2 h-2 rounded-full bg-red-500/70" />
      <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Before Mail Assistant</span>
    </div>
    {/* Chaotic inbox illustration */}
    <div className="p-5 space-y-2.5">
      {[
        { from: "Boss", subject: "URGENT — where is the report??", badge: "!!!", badgeClass: "bg-red-500/20 text-red-400" },
        { from: "Newsletter 1", subject: "Weekly digest you haven't read...", badge: "×47", badgeClass: "bg-white/5 text-white/30" },
        { from: "Newsletter 2", subject: "Don't miss this amazing offer", badge: "×89", badgeClass: "bg-white/5 text-white/30" },
        { from: "Client", subject: "Re: Re: Re: Re: Re: Re: Meeting notes", badge: "old", badgeClass: "bg-white/5 text-white/25" },
        { from: "Auto-reply", subject: "Thank you for contacting support #482", badge: "", badgeClass: "" },
        { from: "HR", subject: "Action required: fill in your timesheet", badge: "3d", badgeClass: "bg-amber-500/20 text-amber-400" },
      ].map(({ from, subject, badge, badgeClass }, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3 border border-white/5"
        >
          <div className="w-7 h-7 rounded-full bg-white/10 shrink-0 flex items-center justify-center text-[10px] text-white/40 font-bold">
            {from[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-white/50 truncate">{from}</div>
            <div className="text-[10px] text-white/25 truncate">{subject}</div>
          </div>
          {badge && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${badgeClass}`}>{badge}</span>
          )}
        </div>
      ))}
      <div className="text-center text-[10px] text-white/20 pt-1">+ 234 more unread</div>
      {/* Overwhelmed indicator */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-red-500/15 bg-red-500/5 mt-2">
        <span className="text-red-400 text-base">😩</span>
        <span className="text-[10px] text-red-400/70">3 hours lost on emails today</span>
      </div>
    </div>
  </div>
);

const AfterCard = () => (
  <div className="relative rounded-2xl border border-white/8 bg-[#111113] overflow-hidden">
    {/* Label */}
    <div className="flex items-center gap-2 px-5 py-3 border-b border-white/8 bg-[#0e0e10]">
      <span className="w-2 h-2 rounded-full bg-emerald-400" />
      <span className="text-xs font-bold text-white/40 uppercase tracking-wider">After Mail Assistant</span>
    </div>
    {/* Clean inbox illustration */}
    <div className="p-5 space-y-2.5">
      {[
        { from: "Boss", subject: "URGENT — where is the report??", tag: "⚡ Priority", tagClass: "bg-[#FF5E62]/20 text-[#FF9966]", replied: true },
        { from: "Client", subject: "Re: Meeting notes", tag: "✓ Summarized", tagClass: "bg-emerald-500/15 text-emerald-400", replied: true },
        { from: "HR", subject: "Action required: fill in your timesheet", tag: "📅 Deadline: Today", tagClass: "bg-amber-500/15 text-amber-400", replied: false },
      ].map(({ from, subject, tag, tagClass, replied }, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/8"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF9966] to-[#FF5E62] shrink-0 flex items-center justify-center text-[10px] text-white font-bold">
            {from[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-white/80 truncate">{from}</div>
            <div className="text-[10px] text-white/40 truncate">{subject}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${tagClass}`}>{tag}</span>
            {replied && <span className="text-[8px] text-emerald-400/60">AI drafted ✓</span>}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/8 bg-white/3 mt-1">
        <span className="text-white/30 text-xs">🗂</span>
        <span className="text-[10px] text-white/30">47 newsletters auto-archived</span>
      </div>
      {/* Happy indicator */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-500/15 bg-emerald-500/5 mt-2">
        <span className="text-emerald-400 text-base">🎉</span>
        <span className="text-[10px] text-emerald-400/80">Inbox zero achieved in 4 minutes</span>
      </div>
    </div>
  </div>
);

export function ProblemSolutionSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="problem-solution" ref={ref} className="w-full py-24 px-4 bg-[#09090b]">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-widest text-white/30 mb-3">
            The Problem
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
            Email was{" "}
            <span style={{ background: "linear-gradient(90deg,#FF9966,#FF5E62)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              supposed
            </span>{" "}
            to be simple.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/45 max-w-xl mx-auto text-base">
            The average professional spends 2.5 hours a day on email. Mail Assistant gives that time back.
          </motion.p>
        </motion.div>

        {/* Before / After grid */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid md:grid-cols-2 gap-6"
        >
          <motion.div variants={fadeUp}>
            <BeforeCard />
          </motion.div>
          <motion.div variants={fadeUp}>
            <AfterCard />
          </motion.div>
        </motion.div>

        {/* Arrow between */}
        <div className="hidden md:flex items-center justify-center -mt-[calc(50%+40px)] pointer-events-none">
          {/* not overlayed — just a decorative separator below */}
        </div>

        {/* Stats row */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-3 gap-4 mt-10"
        >
          {[
            { stat: "2.5h", label: "saved per day" },
            { stat: "94%", label: "draft accuracy" },
            { stat: "10×", label: "faster triage" },
          ].map(({ stat, label }) => (
            <motion.div
              key={stat}
              variants={fadeUp}
              className="rounded-2xl bg-white/4 border border-white/8 p-5 text-center"
            >
              <div
                className="text-3xl font-black mb-1"
                style={{ background: "linear-gradient(135deg,#FF9966,#FF5E62)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
              >
                {stat}
              </div>
              <div className="text-xs text-white/40 font-medium">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

