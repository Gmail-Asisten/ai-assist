"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import type { PipelineResult, RawEmail } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Search,
  Paperclip,
  Clock,
  ChevronRight,
  MessageSquare,
  X,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

import { useParams } from "next/navigation";

export default function FolderPage() {
  const params = useParams();
  const folder = (params?.folder as string) || "inbox";
  
  // Format folder for UI display
  const folderTitle = folder.charAt(0).toUpperCase() + folder.slice(1);
  
  // Map folder name to Gmail Label ID
  const labelIds = [folder.toUpperCase()];
  const { data: session } = useSession();
  const accessToken = (session as any)?.accessToken;
  const userId = session?.user?.id;

  const [emails, setEmails] = useState<PipelineResult[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chatMessage, setChatMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", content: "Hi! I'm your AI assistant. Ask me anything about this email or your inbox." },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isProcessingEmail, setIsProcessingEmail] = useState(false);
  const processingRefs = useRef<Set<string>>(new Set());

  const selectedData = emails.find((e) => e.emailId === selectedEmailId);
  const selectedEmail = selectedData?.analysis?.rawEmail;

  // Lazy load AI features for the selected email
  useEffect(() => {
    if (!selectedEmailId || !accessToken || !selectedData) return;
    
    if (selectedData.summary || selectedData.classification || processingRefs.current.has(selectedEmailId)) {
      return;
    }

    let isMounted = true;
    processingRefs.current.add(selectedEmailId);
    setIsProcessingEmail(true);
    
    fetch("/api/agents/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailId: selectedEmailId, accessToken, userId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && isMounted) {
          setEmails(prev => prev.map(e => e.emailId === selectedEmailId ? data.data : e));
        }
      })
      .finally(() => {
        if (isMounted) setIsProcessingEmail(false);
      });

    return () => { isMounted = false; };
  }, [selectedEmailId, accessToken, userId, selectedData]);

  const fetchEmails = useCallback(async (isBackground = false) => {
    if (!accessToken) return;
    if (!isBackground) setIsLoading(true);
    setIsSyncing(true);
    setError(null);

    try {
      const res = await fetch("/api/gmail/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken,
          userId: userId || "anonymous",
          maxResults: 15,
          labelIds,
          processEmails: false,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const rawList = data.data.emails || [];
        
        setEmails(prev => {
          return rawList.map((raw: any) => {
            const existing = prev.find(e => e.emailId === raw.id);
            if (existing && (existing.summary || existing.classification)) return existing;
            return {
              emailId: raw.id,
              threadId: raw.threadId,
              analysis: { rawEmail: raw },
              classification: null,
              summary: null,
              draftReplies: null,
              reminders: []
            } as unknown as PipelineResult;
          });
        });
        
        setSelectedEmailId(prev => {
          if (!prev && rawList.length > 0) return rawList[0].id;
          return prev;
        });
      } else {
        setError(data.error || "Failed to fetch emails");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching emails");
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [accessToken, userId, folder]);

  // Initial fetch and polling
  useEffect(() => {
    // Reset state when folder changes
    setEmails([]);
    setSelectedEmailId(null);
    
    if (accessToken) {
      fetchEmails();
      // Poll every 30 seconds for new emails
      const interval = setInterval(() => {
        fetchEmails(true);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [accessToken, fetchEmails, folder]);

  // Reset chat when selecting a new email
  useEffect(() => {
    setChatHistory([
      { role: "ai", content: "Hi! I'm your AI assistant. Ask me anything about this email or your inbox." },
    ]);
  }, [selectedEmailId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedEmail) return;

    const newMessage = { role: "user", content: chatMessage };
    const updatedHistory = [...chatHistory, newMessage];
    setChatHistory(updatedHistory);
    setChatMessage("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatHistory: updatedHistory,
          emailContext: selectedEmail,
          prompt: newMessage.content,
          accessToken,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setChatHistory((prev) => [
          ...prev,
          { role: "ai", content: data.data.response },
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          { role: "ai", content: "Sorry, I encountered an error: " + data.error },
        ]);
      }
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", content: "Sorry, I couldn't connect to the server." },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getPriorityColor = (label?: string) => {
    switch (label) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-400";
      case "medium":
        return "bg-yellow-400";
      default:
        return "bg-muted-foreground/30";
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* ─── Email List ─── */}
      <div className="w-[380px] flex flex-col border-r border-border shrink-0 bg-background">
        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground tracking-tight font-display">
              {folderTitle}
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => fetchEmails(false)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                disabled={isSyncing}
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
              </button>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {emails.length} emails
              </span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search emails..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-muted/50 text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all"
            />
          </div>
        </div>

        {/* Email Items */}
        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <p className="text-sm">Loading emails...</p>
            </div>
          ) : error ? (
            <div className="p-5 text-center text-red-500 text-sm">{error}</div>
          ) : emails.length === 0 ? (
            <div className="p-5 text-center text-muted-foreground text-sm">No emails found.</div>
          ) : (
            emails.map((pipelineData) => {
              const email = pipelineData.analysis.rawEmail;
              const isSelected = selectedEmailId === email.id;
              const priorityLabel = pipelineData.classification?.priorityLabel;
              const isUrgent = priorityLabel === "urgent";

              return (
                <motion.div
                  key={email.id}
                  onClick={() => setSelectedEmailId(email.id)}
                  whileTap={{ scale: 0.99 }}
                  className={`
                    relative px-5 py-4 cursor-pointer transition-all duration-200 border-b border-border/50
                    ${isSelected
                      ? "bg-accent"
                      : "hover:bg-muted/50"
                    }
                  `}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="email-indicator"
                      className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-foreground"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}

                  <div className="flex items-start gap-3">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5
                        ${isSelected
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground"
                        }
                      `}
                    >
                      {email.fromName ? email.fromName.charAt(0) : email.from.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className={`text-sm font-semibold truncate pr-2 ${
                            !email.isRead ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {(email.fromName || email.from).split("(")[0].trim()}
                        </span>
                        <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">
                          {formatTime(email.date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        {isUrgent && (
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
                        )}
                        <span
                          className={`text-[13px] truncate ${
                            !email.isRead
                              ? "font-semibold text-foreground"
                              : "font-medium text-muted-foreground"
                          }`}
                        >
                          {email.subject}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground/70 line-clamp-1 leading-relaxed">
                        {email.snippet}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        {priorityLabel && (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white ${getPriorityColor(
                              priorityLabel
                            )}`}
                          >
                            {priorityLabel}
                          </span>
                        )}
                        {email.attachments && email.attachments.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            <Paperclip className="w-3 h-3" />
                            {email.attachments.length}
                          </span>
                        )}
                        {email.isThread && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            <MessageSquare className="w-3 h-3" />
                            {email.threadLength}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Email Detail ─── */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-background">
        <AnimatePresence mode="wait">
          {selectedData && selectedEmail ? (
            <motion.div
              key={selectedEmail.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto w-full px-8 py-8 pb-16"
            >
              {/* AI Summary Panel */}
              {isProcessingEmail && !selectedData.summary && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative rounded-2xl border border-border bg-muted/30 p-6 mb-8 overflow-hidden flex flex-col items-center justify-center gap-3 text-muted-foreground"
                >
                  <RefreshCw className="w-6 h-6 animate-spin text-foreground/40" />
                  <p className="text-sm">AI is analyzing this email...</p>
                </motion.div>
              )}

              {selectedData.summary && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative rounded-2xl border border-border bg-muted/30 p-6 mb-8 overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-foreground/20" />

                  <div className="flex justify-between items-start mb-4">
                    <h3 className="flex items-center gap-2 text-foreground font-bold text-sm uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      AI Analysis
                    </h3>
                    {selectedData.classification?.priorityLabel === "urgent" && (
                      <span className="flex items-center gap-1.5 bg-red-500/10 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-red-500/20">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Urgent
                      </span>
                    )}
                  </div>

                  <p className="text-base font-medium text-foreground mb-4 leading-relaxed">
                    {selectedData.summary.summary.oneLiner}
                  </p>

                  <ul className="space-y-2 mb-5">
                    {selectedData.summary.summary.detailed.map((point, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-muted-foreground text-sm"
                      >
                        <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/50" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  {selectedData.summary.actionItems &&
                    selectedData.summary.actionItems.length > 0 && (
                      <div className="pt-4 border-t border-border">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                          Action Items
                        </h4>
                        <div className="space-y-2.5">
                          {selectedData.summary.actionItems.map((item, idx) => (
                            <label
                              key={idx}
                              className="flex items-start gap-3 group cursor-pointer"
                            >
                              <div className="mt-0.5 w-4.5 h-4.5 rounded-md border-2 border-border flex items-center justify-center group-hover:border-foreground/40 transition-colors shrink-0">
                                <CheckCircle2 className="w-3 h-3 text-foreground opacity-0 group-hover:opacity-40 transition-opacity" />
                              </div>
                              <div className="flex-1 text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                                {item.action}
                              </div>
                              {item.deadline && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full shrink-0">
                                  <Clock className="w-3 h-3" />
                                  {new Date(item.deadline).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                </motion.div>
              )}

              {/* Email Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-5 tracking-tight font-display leading-tight">
                  {selectedEmail.subject}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground">
                    {selectedEmail.fromName ? selectedEmail.fromName.charAt(0) : selectedEmail.from.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {selectedEmail.fromName || selectedEmail.from}
                      <span className="font-normal text-muted-foreground ml-2 text-xs">
                        &lt;{selectedEmail.from}&gt;
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      to me •{" "}
                      {new Date(selectedEmail.date).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div
                className="rounded-xl border border-border bg-card p-8 mb-10 text-foreground/80 leading-relaxed text-[15px] prose-p:mb-4 prose-strong:text-foreground overflow-x-hidden break-words"
                dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml || selectedEmail.bodyText }}
              />

              {/* AI Draft Replies */}
              {selectedData.draftReplies?.drafts && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="flex items-center gap-2 font-bold text-sm text-foreground mb-4 uppercase tracking-wider">
                    <Bot className="w-4 h-4" />
                    Smart Replies
                  </h3>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {selectedData.draftReplies.quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-muted border border-border text-sm font-medium text-foreground hover:bg-accent hover:border-foreground/20 transition-all duration-200 cursor-pointer"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        {action.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {selectedData.draftReplies.drafts.map((draft, idx) => (
                      <div
                        key={idx}
                        className="group rounded-xl border border-border bg-card p-5 hover:border-foreground/20 transition-all duration-200 relative"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                            {draft.tone}
                          </span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer bg-transparent">
                              Edit
                            </button>
                            <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors cursor-pointer border-none">
                              Send Reply
                            </button>
                          </div>
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-foreground/70 leading-relaxed">
                          {draft.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center text-muted-foreground flex-col gap-3"
            >
              <Sparkles className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm">
                {isLoading ? "Fetching your latest emails..." : "Select an email to view AI analysis"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── AI Chat Sidebar ─── */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="h-full border-l border-border bg-muted/20 flex flex-col shrink-0 overflow-hidden"
          >
            {/* Chat Header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
                  <Bot className="w-4 h-4 text-background" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Ask AI</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Chat with your inbox
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer bg-transparent border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {chatHistory.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-foreground text-background rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md border border-border"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isChatLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted text-foreground rounded-2xl rounded-bl-md border border-border px-4 py-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Chat Input */}
            <div className="px-4 py-3 border-t border-border shrink-0">
              <form
                onSubmit={handleSendMessage}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder={selectedEmail ? "Ask a question..." : "Select an email first"}
                  disabled={!selectedEmail || isChatLoading}
                  className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!chatMessage.trim() || !selectedEmail || isChatLoading}
                  className="absolute right-2 w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center disabled:opacity-30 hover:bg-foreground/80 transition-all cursor-pointer border-none"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isChatOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer border-none z-50"
        >
          <Bot className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
}
