"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { 
  Sparkles, Activity, Target, AlertTriangle, AlertCircle, Clock, ArrowUpRight, ShieldCheck, Mail
} from "lucide-react";
import type { InboxSummaryOutput } from "@/agents/summary-generator";

export default function SummaryPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<InboxSummaryOutput | null>(null);
  const [totalEmails, setTotalEmails] = useState(0);

  const fetchSummary = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      setLoading(true);
      setError(null);
      
      // 1. Fetch raw emails
      const syncRes = await fetch("/api/gmail/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: session.accessToken,
          userId: session.user.email,
          maxResults: 50,
          processEmails: false

        })
      });
      const syncData = await syncRes.json();
      
      if (!syncData.success) {
        throw new Error(syncData.error);
      }
      
      const rawEmails = syncData.data.emails;
      setTotalEmails(rawEmails.length);

      if (rawEmails.length === 0) {
        setLoading(false);
        return;
      }

      // 2. Generate Global Summary
      const sumRes = await fetch("/api/agents/global-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: rawEmails })
      });
      const sumData = await sumRes.json();
      
      if (!sumData.success) {
        throw new Error(sumData.error);
      }
      
      setSummary(sumData.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"></div>
        
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }} 
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-16 h-16 rounded-2xl bg-foreground text-background flex items-center justify-center mb-6 relative z-10 shadow-2xl"
        >
          <Sparkles className="w-8 h-8" />
        </motion.div>
        <h2 className="text-2xl font-bold font-display text-foreground relative z-10">AI is Analyzing your Inbox...</h2>
        <p className="text-muted-foreground mt-2 relative z-10">Fetching the latest emails and generating an executive briefing.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center p-8 bg-red-500/10 rounded-3xl border border-red-500/20 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-500 mb-2">Analysis Failed</h2>
          <p className="text-red-400 text-sm mb-6">{error}</p>
          <button 
            onClick={fetchSummary}
            className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-bold transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-center">
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No emails found to summarize.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-8 md:p-12 relative">
      <div className="absolute top-0 right-0 w-1/2 h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-5xl mx-auto space-y-10 relative z-10">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Executive Briefing
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight tracking-tight">
            Inbox Overview
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {summary.executiveSummary}
          </p>
        </motion.div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-card border border-border p-5 rounded-2xl flex flex-col justify-between">
            <Mail className="w-6 h-6 text-muted-foreground mb-4" />
            <div>
              <p className="text-3xl font-bold text-foreground">{totalEmails}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Emails Analyzed</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex flex-col justify-between">
            <AlertTriangle className="w-6 h-6 text-red-500 mb-4" />
            <div>
              <p className="text-3xl font-bold text-red-500">{summary.urgencyBreakdown.urgent}</p>
              <p className="text-xs text-red-500/80 uppercase tracking-wider font-semibold mt-1">Urgent Items</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-2xl flex flex-col justify-between">
            <Clock className="w-6 h-6 text-orange-500 mb-4" />
            <div>
              <p className="text-3xl font-bold text-orange-500">{summary.urgencyBreakdown.high}</p>
              <p className="text-xs text-orange-500/80 uppercase tracking-wider font-semibold mt-1">High Priority</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="bg-green-500/10 border border-green-500/20 p-5 rounded-2xl flex flex-col justify-between">
            <ShieldCheck className="w-6 h-6 text-green-500 mb-4" />
            <div>
              <p className="text-3xl font-bold text-green-500">{summary.urgencyBreakdown.low}</p>
              <p className="text-xs text-green-500/80 uppercase tracking-wider font-semibold mt-1">Low / Safe</p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Action Items List */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="space-y-5">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-foreground" />
              <h3 className="text-lg font-bold font-display text-foreground">Top Action Items</h3>
            </div>
            <div className="bg-card border border-border rounded-3xl p-2 space-y-1">
              {summary.topActionItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors">
                  <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
                    item.priority === "urgent" ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" :
                    item.priority === "high" ? "bg-orange-500" :
                    item.priority === "medium" ? "bg-blue-500" : "bg-green-500"
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground leading-relaxed">{item.action}</p>
                  </div>
                </div>
              ))}
              {summary.topActionItems.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No critical action items found in the recent emails.
                </div>
              )}
            </div>
          </motion.div>

          {/* Division Breakdown */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="space-y-5">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-foreground" />
              <h3 className="text-lg font-bold font-display text-foreground">Category Breakdown</h3>
            </div>
            <div className="bg-card border border-border rounded-3xl p-6 grid gap-6">
              {summary.categoryBreakdown.map((cat, idx) => {
                const percentage = Math.round((cat.count / Math.max(1, totalEmails)) * 100);
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">{cat.category}</span>
                      <span className="text-sm text-muted-foreground">{cat.count} emails ({percentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 + (idx * 0.1), ease: "easeOut" }}
                        className="h-full bg-foreground rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
              {summary.categoryBreakdown.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-4">
                  No clear categories identified.
                </div>
              )}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
