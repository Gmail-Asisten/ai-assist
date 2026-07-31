"use client";

import React from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 80, damping: 18, delay },
  }),
};

/** Inline SVG: Google Gemini coloured "G" star logo */
const GeminiIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 4C24 4 13 16 13 24C13 32 24 44 24 44C24 44 35 32 35 24C35 16 24 4 24 4Z" fill="url(#g1)" />
    <path d="M4 24C4 24 16 13 24 13C32 13 44 24 44 24C44 24 32 35 24 35C16 35 4 24 4 24Z" fill="url(#g2)" />
    <defs>
      <linearGradient id="g1" x1="13" y1="4" x2="35" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4285F4" />
        <stop offset="1" stopColor="#EA4335" />
      </linearGradient>
      <linearGradient id="g2" x1="4" y1="24" x2="44" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FBBC05" />
        <stop offset="1" stopColor="#34A853" />
      </linearGradient>
    </defs>
  </svg>
);

/** Browser-frame mockup of the inbox dashboard — mobile-responsive */
const DashboardMockup = () => (
  <div className="relative w-full max-w-3xl mx-auto px-2 sm:px-0">
    {/* Glow behind the frame */}
    <div
      className="absolute -inset-4 sm:-inset-6 rounded-3xl blur-3xl opacity-25 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse at 50% 60%, #FF5E62 0%, #FF9966 40%, transparent 70%)",
      }}
    />
    {/* Browser chrome */}
    <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#111113]">
      {/* Top bar */}
      <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-[#1a1a1c] border-b border-white/8">
        <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF5F57]" />
        <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FFBD2E]" />
        <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#28C940]" />
        <div className="flex-1 mx-2 sm:mx-3">
          <div className="h-4 sm:h-5 rounded-full bg-white/5 border border-white/8 text-[9px] sm:text-[10px] text-white/30 flex items-center justify-center font-mono truncate px-2">
            app.mailassistant.ai/inbox
          </div>
        </div>
      </div>

      {/* App body */}
      <div className="flex h-60 sm:h-72 md:h-80 text-xs overflow-hidden">
        {/* Sidebar — hidden on mobile */}
        <div className="hidden md:flex md:w-40 lg:w-48 bg-[#0e0e10] border-r border-white/8 p-3 flex-col gap-1 shrink-0">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5 mb-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FF9966] to-[#FF5E62]" />
            <span className="text-white/70 font-semibold text-[11px]">Mail Assistant</span>
          </div>
          {[
            { label: "Inbox", count: "12", active: true },
            { label: "Priority", count: "3", active: false },
            { label: "Drafts", count: "5", active: false },
            { label: "Sent", count: "", active: false },
            { label: "Archive", count: "", active: false },
          ].map(({ label, count, active }) => (
            <div
              key={label}
              className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] ${active ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5"}`}
            >
              <span>{label}</span>
              {count && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-[#FF5E62] text-white" : "bg-white/10 text-white/50"}`}>
                  {count}
                </span>
              )}
            </div>
          ))}
          <div className="mt-auto">
            <div className="text-[9px] text-white/20 uppercase tracking-wider px-2 mb-1">AI Status</div>
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/50 text-[10px]">Active</span>
            </div>
          </div>
        </div>

        {/* Email list — always visible */}
        <div className="flex-1 overflow-hidden border-r border-white/8 bg-[#111113] min-w-0">
          <div className="px-3 py-2 border-b border-white/8 flex items-center justify-between">
            <span className="text-white/60 font-semibold text-[11px]">Inbox · 12 unread</span>
            <span className="text-[9px] text-[#FF9966] font-bold uppercase tracking-wider">AI Sorted</span>
          </div>
          {[
            { from: "Sarah Chen", subject: "Q3 Budget Review — URGENT", time: "9:04 AM", tag: "Urgent", tagColor: "#FF5E62", read: false },
            { from: "James Liu", subject: "Partnership proposal for review", time: "8:41 AM", tag: "Follow-up", tagColor: "#FBBC05", read: false },
            { from: "Mira Patel", subject: "Design assets ready for handoff", time: "Yesterday", tag: "Info", tagColor: "#34A853", read: true },
            { from: "Newsletter", subject: "Your weekly SaaS digest is here", time: "Yesterday", tag: "Low", tagColor: "#4285F4", read: true },
          ].map(({ from, subject, time, tag, tagColor, read }) => (
            <div
              key={subject}
              className={`px-2.5 sm:px-3 py-2 sm:py-2.5 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!read ? "bg-white/3" : ""}`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className={`font-semibold ${read ? "text-white/40" : "text-white/80"} text-[11px] truncate pr-2`}>{from}</span>
                <span className="text-white/25 text-[9px] shrink-0">{time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] truncate ${read ? "text-white/25" : "text-white/55"}`}>{subject}</span>
                <span
                  className="shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: `${tagColor}20`, color: tagColor }}
                >
                  {tag}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* AI reply panel — hidden on mobile/tablet, shown on lg+ */}
        <div className="hidden lg:flex lg:w-48 xl:w-56 bg-[#0e0e10] p-3 flex-col gap-2 shrink-0">
          <div className="text-[9px] text-white/30 uppercase tracking-wider font-bold">AI Draft Reply</div>
          <div className="flex-1 rounded-xl bg-white/5 border border-white/8 p-2.5 text-[10px] text-white/50 leading-relaxed">
            Hi Sarah,<br /><br />
            Thanks for flagging this—I'll review the Q3 numbers by EOD and send updated projections.
            <br /><br />
            Best,<br />Alex
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button className="text-[9px] py-1.5 rounded-lg bg-white/8 text-white/50 font-medium border border-white/10 hover:bg-white/12 transition-colors">
              Edit
            </button>
            <button className="text-[9px] py-1.5 rounded-lg font-bold text-white border-none"
              style={{ background: "linear-gradient(135deg,#FF9966,#FF5E62)" }}>
              Send ↗
            </button>
          </div>
          <div className="text-[8px] text-white/20 text-center">Confidence: 94%</div>
        </div>
      </div>
    </div>

    {/* Floating badges — hidden on very small screens */}
    <motion.div
      className="hidden sm:flex absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-[#1a1a1c] border border-white/10 rounded-xl md:rounded-2xl px-2.5 md:px-3 py-1.5 md:py-2 text-xs items-center gap-2 shadow-xl"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" as const }}
    >
      <span className="text-emerald-400 text-sm md:text-base">✓</span>
      <div>
        <div className="text-white font-semibold text-[10px] md:text-[11px]">12 emails sorted</div>
        <div className="text-white/40 text-[9px]">by AI in 2s</div>
      </div>
    </motion.div>

    <motion.div
      className="hidden sm:flex absolute -bottom-3 -left-3 md:-bottom-4 md:-left-4 bg-[#1a1a1c] border border-white/10 rounded-xl md:rounded-2xl px-2.5 md:px-3 py-1.5 md:py-2 text-xs items-center gap-2 shadow-xl"
      animate={{ y: [0, 6, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" as const, delay: 0.5 }}
    >
      <span className="text-[#FF9966] text-sm md:text-base">⚡</span>
      <div>
        <div className="text-white font-semibold text-[10px] md:text-[11px]">Draft ready</div>
        <div className="text-white/40 text-[9px]">Confidence 94%</div>
      </div>
    </motion.div>
  </div>
);

interface HeroSectionProps {
  onCtaClick?: () => void;
}

export function HeroSection({ onCtaClick }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative w-full min-h-screen flex flex-col items-center justify-center pt-28 pb-20 px-4 overflow-hidden bg-[#09090b]"
    >
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 50%, transparent 100%)",
        }}
      />
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] blur-[120px] opacity-20 z-0"
        style={{ background: "radial-gradient(ellipse, #FF5E62 0%, transparent 70%)" }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Badge */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0}
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-white/70 font-medium"
        >
          <GeminiIcon />
          <span>Powered by Mail Assistance</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0.1}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-center leading-none mb-6"
          style={{
            background: "linear-gradient(180deg, #ffffff 40%, rgba(255,255,255,0.45) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Manage Your Inbox
          <br />
          <span style={{
            background: "linear-gradient(90deg, #FF9966, #FF5E62)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            with Superhuman AI
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0.2}
          className="max-w-2xl text-center text-base sm:text-lg text-white/55 leading-relaxed mb-10"
        >
          Automate replies, prioritize urgent emails, and summarize long threads instantly.
          Your smartest email assistant that understands context, detects deadlines, and
          drafts perfect responses — all powered by Gemini.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0.3}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={onCtaClick}
            className="px-8 py-3.5 rounded-full text-white font-bold text-base shadow-lg border-none cursor-pointer"
            style={{ background: "linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)" }}
          >
            Start for Free
          </motion.button>
          <motion.a
            href="#how-it-works"
            whileHover={{ scale: 1.03 }}
            className="px-8 py-3.5 rounded-full text-white/70 font-semibold text-base border border-white/15 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer no-underline"
          >
            See how it works →
          </motion.a>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.45, duration: 0.8, type: "spring", stiffness: 60, damping: 20 }}
          className="w-full"
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}

