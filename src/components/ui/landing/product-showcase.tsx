"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

/** Large, annotated browser-frame mockup for the product showcase */
const ShowcaseMockup = () => (
  <div className="relative w-full max-w-4xl mx-auto">
    {/* Background glow */}
    <div
      className="absolute -inset-10 rounded-3xl blur-[80px] opacity-25 pointer-events-none"
      style={{ background: "radial-gradient(ellipse at 40% 70%, #FF5E62 0%, #4285F4 50%, transparent 80%)" }}
    />

    {/* Browser chrome */}
    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] bg-[#111113]">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1c] border-b border-white/8">
        <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
        <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
        <span className="w-3 h-3 rounded-full bg-[#28C940]" />
        <div className="flex-1 mx-3">
          <div className="h-6 rounded-full bg-white/5 border border-white/8 text-[11px] text-white/30 flex items-center justify-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            app.mailassistant.ai/inbox
          </div>
        </div>
        <div className="flex items-center gap-3 text-white/20">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/><path d="M17 12H3"/><path d="m11 6-6 6 6 6"/></svg>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </div>
      </div>

      {/* Full app layout */}
      <div className="flex" style={{ height: "440px" }}>
        {/* Sidebar */}
        <div className="w-52 bg-[#0e0e10] border-r border-white/6 flex flex-col p-3 gap-1 shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#FF9966]/10 to-[#FF5E62]/10 border border-[#FF5E62]/20 mb-3">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#FF9966] to-[#FF5E62] flex items-center justify-center text-[11px] font-black text-white">
              M
            </div>
            <span className="font-bold text-white text-xs">Mail Assistant</span>
          </div>
          {[
            { label: "Inbox", count: 12, active: true },
            { label: "Priority", count: 3, active: false },
            { label: "Drafts", count: 5, active: false },
            { label: "Scheduled", count: 0, active: false },
            { label: "Sent", count: 0, active: false },
            { label: "Archive", count: 0, active: false },
          ].map(({ label, count, active }) => (
            <div
              key={label}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${active ? "bg-white/10 text-white font-semibold" : "text-white/35 hover:bg-white/5 hover:text-white/55"}`}
            >
              <span>{label}</span>
              {count > 0 && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-[#FF5E62] text-white" : "bg-white/10 text-white/40"}`}>
                  {count}
                </span>
              )}
            </div>
          ))}

          <div className="mt-auto space-y-2">
            <div className="px-3 py-2 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
              <div className="text-[9px] text-emerald-400/70 uppercase tracking-wider font-bold mb-1">AI Status</div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400/80">Actively scanning</span>
              </div>
            </div>
          </div>
        </div>

        {/* Email list panel */}
        <div className="w-72 border-r border-white/6 bg-[#111113] flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-white/6 flex items-center justify-between">
            <span className="text-sm font-bold text-white/80">Inbox</span>
            <span className="text-[10px] text-[#FF9966] font-bold uppercase tracking-wider bg-[#FF9966]/10 px-2 py-0.5 rounded-full">AI Sorted</span>
          </div>
          <div className="flex-1 overflow-hidden">
            {[
              { from: "Sarah Chen", subject: "Q3 Budget — URGENT review needed", time: "9:04 AM", priority: "urgent", unread: true },
              { from: "James Liu", subject: "Partnership proposal for consideration", time: "8:41 AM", priority: "high", unread: true },
              { from: "Mira Patel", subject: "Design handoff assets are ready", time: "Yesterday", priority: "normal", unread: true },
              { from: "Recruiter", subject: "Senior role — great fit for you", time: "Yesterday", priority: "low", unread: false },
              { from: "Newsletter", subject: "Your weekly SaaS digest", time: "2d ago", priority: "auto", unread: false },
            ].map(({ from, subject, time, priority, unread }, i) => (
              <div
                key={i}
                className={`px-4 py-3 border-b border-white/4 cursor-pointer hover:bg-white/5 transition-colors ${i === 0 ? "bg-white/8" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs ${unread ? "font-bold text-white/85" : "text-white/40"}`}>{from}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-white/25">{time}</span>
                    {priority === "urgent" && <span className="w-2 h-2 rounded-full bg-red-500" />}
                    {priority === "high" && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                    {priority === "normal" && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                    {priority === "low" && <span className="w-2 h-2 rounded-full bg-white/20" />}
                    {priority === "auto" && <span className="w-2 h-2 rounded-full bg-white/10" />}
                  </div>
                </div>
                <p className={`text-[11px] truncate ${unread ? "text-white/50" : "text-white/25"}`}>{subject}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col bg-[#0f0f11] overflow-hidden">
          {/* Email header */}
          <div className="px-6 py-4 border-b border-white/6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Q3 Budget — URGENT review needed</h3>
                <div className="flex items-center gap-2 text-[11px] text-white/35">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FF9966] to-[#FF5E62] flex items-center justify-center text-[9px] font-black text-white">S</div>
                  Sarah Chen · CFO · sarah@veritas.com · 9:04 AM
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">⚡ Urgent</span>
                <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">📅 Due EOD</span>
              </div>
            </div>
          </div>

          {/* Thread summary */}
          <div className="mx-6 my-3 px-4 py-3 rounded-xl bg-[#4285F4]/8 border border-[#4285F4]/20">
            <div className="text-[9px] font-bold uppercase tracking-wider text-[#4285F4]/70 mb-1.5 flex items-center gap-1.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              AI Thread Summary
            </div>
            <p className="text-[11px] text-white/55 leading-relaxed">Sarah is requesting urgent review of Q3 budget projections before the board meeting at 3 PM today. She needs sign-off on the revised headcount figures and capex adjustments.</p>
          </div>

          {/* Email body excerpt */}
          <div className="px-6 flex-1 text-[11px] text-white/35 leading-loose overflow-hidden">
            <p>Hi Alex,</p>
            <br />
            <p>I hope this finds you well. I'm reaching out regarding the Q3 budget review that's scheduled...</p>
            <p className="text-white/15">...we need your sign-off on the revised headcount figures and capex adjustments before the board meeting at 3 PM today. The CFO is expecting updated projections...</p>
          </div>

          {/* AI Reply panel */}
          <div className="border-t border-white/6 bg-[#0e0e10] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">AI Draft Ready</span>
              <div className="flex items-center gap-1.5 text-[9px] text-emerald-400/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Confidence 94%
              </div>
            </div>
            <div className="text-[11px] text-white/50 bg-white/4 rounded-xl p-3 mb-3 leading-relaxed border border-white/6">
              Hi Sarah, thanks for flagging — I'll review the Q3 numbers and send updated projections before the 3 PM board meeting. Best, Alex
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-xl bg-white/8 text-white/50 text-[11px] font-semibold border border-white/10 hover:bg-white/12 transition-colors cursor-pointer">
                Edit Draft
              </button>
              <button
                className="flex-1 py-2 rounded-xl text-white text-[11px] font-bold border-none cursor-pointer"
                style={{ background: "linear-gradient(135deg,#FF9966,#FF5E62)" }}
              >
                Send Reply ↗
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Floating annotation 1 */}
    <motion.div
      className="absolute -top-5 left-12 hidden md:flex items-center gap-2 bg-[#1a1a1c] border border-white/10 rounded-2xl px-3.5 py-2 text-xs shadow-2xl"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" as const }}
    >
      <span className="text-[#FBBC05] text-sm">⭐</span>
      <div>
        <div className="text-white font-semibold text-[11px]">Priority Score: 98</div>
        <div className="text-white/35 text-[9px]">AI detected urgency</div>
      </div>
    </motion.div>

    {/* Floating annotation 2 */}
    <motion.div
      className="absolute -bottom-5 right-8 hidden md:flex items-center gap-2 bg-[#1a1a1c] border border-white/10 rounded-2xl px-3.5 py-2 text-xs shadow-2xl"
      animate={{ y: [0, 5, 0] }}
      transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" as const, delay: 0.5 }}
    >
      <span className="text-emerald-400 text-sm">✨</span>
      <div>
        <div className="text-white font-semibold text-[11px]">Draft in 1.2s</div>
        <div className="text-white/35 text-[9px]">Gemini AI</div>
      </div>
    </motion.div>
  </div>
);

export function ProductShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="product" ref={ref} className="w-full py-24 px-4 bg-[#0c0c0e]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-widest text-white/30 mb-3">
            Product
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
            See it in{" "}
            <span style={{ background: "linear-gradient(90deg,#FF9966,#FF5E62)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              action
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/40 max-w-lg mx-auto text-base">
            A clean, powerful interface that puts AI front and center without overwhelming you.
          </motion.p>
        </motion.div>

        {/* Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: "easeOut" as const, delay: 0.2 }}
        >
          <ShowcaseMockup />
        </motion.div>
      </div>
    </section>
  );
}

