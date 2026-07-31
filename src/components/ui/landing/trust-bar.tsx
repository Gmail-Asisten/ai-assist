"use client";

import React, { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const companies = [
  {
    name: "Veritas Corp",
    logo: (
      <svg viewBox="0 0 80 24" fill="none" className="h-6 w-auto">
        <text x="0" y="18" fontSize="16" fontWeight="700" fill="currentColor" fontFamily="sans-serif">Veritas</text>
      </svg>
    ),
  },
  {
    name: "Luminary",
    logo: (
      <svg viewBox="0 0 80 24" fill="none" className="h-6 w-auto">
        <circle cx="10" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
        <text x="20" y="17" fontSize="13" fontWeight="700" fill="currentColor" fontFamily="sans-serif">Luminary</text>
      </svg>
    ),
  },
  {
    name: "Axon Labs",
    logo: (
      <svg viewBox="0 0 80 24" fill="none" className="h-6 w-auto">
        <path d="M0 20L8 4L16 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="20" y="17" fontSize="13" fontWeight="700" fill="currentColor" fontFamily="sans-serif">Axon Labs</text>
      </svg>
    ),
  },
  {
    name: "Nova HQ",
    logo: (
      <svg viewBox="0 0 80 24" fill="none" className="h-6 w-auto">
        <rect x="0" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="21" y="17" fontSize="13" fontWeight="700" fill="currentColor" fontFamily="sans-serif">Nova HQ</text>
      </svg>
    ),
  },
  {
    name: "Strata AI",
    logo: (
      <svg viewBox="0 0 80 24" fill="none" className="h-6 w-auto">
        <path d="M0 8h14M0 12h10M0 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <text x="18" y="17" fontSize="13" fontWeight="700" fill="currentColor" fontFamily="sans-serif">Strata AI</text>
      </svg>
    ),
  },
];

export function TrustBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="w-full py-16 bg-[#09090b] border-y border-white/6">
      <div className="max-w-5xl mx-auto px-4">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center text-sm text-white/35 font-semibold uppercase tracking-widest mb-10"
        >
          Trusted by 500+ teams worldwide
        </motion.p>

        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-14"
        >
          {companies.map(({ name, logo }) => (
            <motion.div
              key={name}
              variants={fadeUp}
              className="text-white/25 hover:text-white/55 transition-colors duration-300 cursor-default"
              title={name}
            >
              {logo}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

