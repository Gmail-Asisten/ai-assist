"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const testimonials = [
  {
    name: "Sarah Nguyen",
    role: "Head of Operations · Luminary Inc.",
    avatar: "SN",
    avatarGrad: "from-[#4285F4] to-[#34A853]",
    quote:
      "Mail Assistant completely transformed how our team handles client communication. We went from drowning in 300+ emails a day to inbox zero by lunch. The AI drafts are shockingly accurate.",
    stars: 5,
  },
  {
    name: "Marcus De Vries",
    role: "Founder & CEO · Axon Labs",
    avatar: "MD",
    avatarGrad: "from-[#FF9966] to-[#FF5E62]",
    quote:
      "As a solo founder, I used to lose 3+ hours daily to email. Mail Assistant gives me that time back. The deadline detection caught a missed investor follow-up — literally saved a deal.",
    stars: 5,
  },
  {
    name: "Priya Rangan",
    role: "Product Manager · Strata AI",
    avatar: "PR",
    avatarGrad: "from-[#FBBC05] to-[#EA4335]",
    quote:
      "Thread summaries alone are worth it. I manage 6 product threads at once — the AI distills each one into a clear 3-line brief. Game changer for async teams.",
    stars: 5,
  },
];

export function TestimonialSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="testimonials" ref={ref} className="w-full py-24 px-4 bg-[#09090b]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-widest text-white/30 mb-3">
            Testimonials
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
            Loved by teams who{" "}
            <span style={{ background: "linear-gradient(90deg,#FF9966,#FF5E62)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              live in their inbox
            </span>
          </motion.h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid md:grid-cols-3 gap-6"
        >
          {testimonials.map(({ name, role, avatar, avatarGrad, quote, stars }) => (
            <motion.div
              key={name}
              variants={fadeUp}
              className="relative rounded-2xl border border-white/8 bg-[#111113] p-6 flex flex-col gap-5 hover:border-white/15 transition-colors duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: stars }).map((_, i) => (
                  <svg key={i} className="w-4 h-4" viewBox="0 0 24 24" fill="#FBBC05">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-white/55 leading-relaxed flex-1">
                &ldquo;{quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-white text-xs font-black shrink-0`}
                >
                  {avatar}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{name}</div>
                  <div className="text-[11px] text-white/35">{role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

