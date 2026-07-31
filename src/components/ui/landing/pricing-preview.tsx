"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const Check = () => (
  <svg className="w-4 h-4 shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const Dash = () => (
  <svg className="w-4 h-4 shrink-0 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for individuals getting started with AI email.",
    cta: "Get Started",
    ctaStyle: "border border-white/15 bg-white/5 hover:bg-white/10 text-white/70",
    highlighted: false,
    features: [
      { text: "Up to 50 AI replies/month", included: true },
      { text: "Priority inbox sorting", included: true },
      { text: "Thread summaries (5/day)", included: true },
      { text: "Gmail integration", included: true },
      { text: "Deadline detection", included: false },
      { text: "Multi-language support", included: false },
      { text: "Unlimited AI replies", included: false },
    ],
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For professionals who live in their inbox and need full power.",
    cta: "Start Pro Trial",
    ctaStyle: "text-white border-none",
    ctaGrad: "linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)",
    highlighted: true,
    badge: "Most Popular",
    features: [
      { text: "Unlimited AI replies", included: true },
      { text: "Priority inbox sorting", included: true },
      { text: "Thread summaries (unlimited)", included: true },
      { text: "Gmail + Outlook integration", included: true },
      { text: "Deadline detection", included: true },
      { text: "Multi-language support (40+)", included: true },
      { text: "Priority support", included: true },
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For teams and organizations needing custom AI workflows.",
    cta: "Contact Sales",
    ctaStyle: "border border-white/15 bg-white/5 hover:bg-white/10 text-white/70",
    highlighted: false,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Team inbox management", included: true },
      { text: "Custom AI personas", included: true },
      { text: "SSO & SAML auth", included: true },
      { text: "Audit logs & compliance", included: true },
      { text: "Dedicated onboarding", included: true },
      { text: "SLA & 24/7 support", included: true },
    ],
  },
];

interface PricingPreviewProps {
  onCtaClick?: () => void;
}

export function PricingPreview({ onCtaClick }: PricingPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="pricing" ref={ref} className="w-full py-24 px-4 bg-[#0c0c0e]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-widest text-white/30 mb-3">
            Pricing
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
            Simple,{" "}
            <span style={{ background: "linear-gradient(90deg,#FF9966,#FF5E62)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              transparent
            </span>{" "}
            pricing
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/40 max-w-lg mx-auto text-base">
            Start free, upgrade when you're ready. No credit card required for Free plan.
          </motion.p>
        </motion.div>

        {/* Plans */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid md:grid-cols-3 gap-5 items-stretch"
        >
          {plans.map(({ name, price, period, description, cta, ctaStyle, ctaGrad, highlighted, badge, features }) => (
            <motion.div
              key={name}
              variants={fadeUp}
              className={`relative rounded-2xl flex flex-col p-6 gap-6 transition-all duration-300 ${highlighted ? "border-2 border-[#FF5E62]/40 bg-[#111113] shadow-[0_0_60px_-15px_rgba(255,94,98,0.3)]" : "border border-white/8 bg-[#111113] hover:border-white/15"}`}
            >
              {/* Popular badge */}
              {badge && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full text-white whitespace-nowrap"
                  style={{ background: "linear-gradient(135deg,#FF9966,#FF5E62)" }}
                >
                  {badge}
                </div>
              )}

              {/* Plan info */}
              <div>
                <div className="text-sm font-bold text-white/40 uppercase tracking-wider mb-2">{name}</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-black text-white">{price}</span>
                  {period && <span className="text-white/35 text-sm">{period}</span>}
                </div>
                <p className="text-xs text-white/40 leading-relaxed">{description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 flex-1">
                {features.map(({ text, included }) => (
                  <li key={text} className="flex items-center gap-2.5">
                    {included ? <Check /> : <Dash />}
                    <span className={`text-xs ${included ? "text-white/65" : "text-white/25"}`}>{text}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => onCtaClick?.()}
                className={`w-full py-3 rounded-xl font-bold text-sm cursor-pointer transition-all duration-200 hover:opacity-90 ${ctaStyle}`}
                style={ctaGrad ? { background: ctaGrad } : undefined}
              >
                {cta}
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

