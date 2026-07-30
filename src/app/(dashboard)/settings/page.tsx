"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  User, Mail, Bell, Shield, Palette, Cpu, LogOut,
  ChevronRight, Check, Sparkles, RefreshCw, Trash2,
  Moon, Sun, Monitor, Volume2, VolumeX, Zap, Clock,
} from "lucide-react";

// ── Section types ────────────────────────────────────────────
type Section = "profile" | "ai" | "notifications" | "appearance" | "privacy";

const SECTIONS = [
  { id: "profile" as Section, label: "Profile & Account", icon: User },
  { id: "ai" as Section, label: "AI Preferences", icon: Cpu },
  { id: "notifications" as Section, label: "Notifications", icon: Bell },
  { id: "appearance" as Section, label: "Appearance", icon: Palette },
  { id: "privacy" as Section, label: "Privacy & Security", icon: Shield },
];

// ── Toggle component ─────────────────────────────────────────
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer border-none shrink-0 ${
        enabled ? "bg-foreground" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ── Row component ─────────────────────────────────────────────
function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div className="flex-1 min-w-0 pr-6">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState<Section>("profile");

  // AI prefs
  const [autoReply, setAutoReply] = useState(false);
  const [smartSummarize, setSmartSummarize] = useState(true);
  const [aiDraftTone, setAiDraftTone] = useState<"formal" | "casual" | "friendly">("formal");

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reminderAlerts, setReminderAlerts] = useState(true);

  // Appearance
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const [compactMode, setCompactMode] = useState(false);

  // Privacy
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const user = session?.user;
  const avatarLetter = user?.name?.charAt(0) || user?.email?.charAt(0) || "U";

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* ── Sidebar nav ── */}
      <nav className="w-[220px] shrink-0 border-r border-border flex flex-col py-6 px-3 gap-1 bg-muted/20 overflow-y-auto">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">
          Settings
        </p>
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer border-none text-left ${
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted bg-transparent"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {s.label}
            </button>
          );
        })}

        {/* Spacer + logout */}
        <div className="flex-1" />
        <div className="mt-4 pt-4 border-t border-border">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50/10 transition-all duration-150 cursor-pointer border-none bg-transparent text-left"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 md:px-10 py-8">

          {/* ── PROFILE ──────────────────────────────── */}
          {activeSection === "profile" && (
            <section>
              <h1 className="text-2xl font-bold text-foreground font-display mb-1">Profile & Account</h1>
              <p className="text-sm text-muted-foreground mb-8">Manage your account information and Google connection.</p>

              {/* Avatar card */}
              <div className="rounded-2xl border border-border bg-card p-6 mb-6 flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center text-2xl font-bold shrink-0">
                  {user?.image ? (
                    <img src={user.image} alt={user.name || ""} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    avatarLetter.toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-foreground truncate">{user?.name || "—"}</p>
                  <p className="text-sm text-muted-foreground truncate">{user?.email || "—"}</p>
                  <span className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-green-600 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
                    <Check className="w-3 h-3" />
                    Google Account Connected
                  </span>
                </div>
              </div>

              {/* Info rows */}
              <div className="rounded-2xl border border-border bg-card px-5 mb-6">
                <SettingRow label="Full Name" description="Synced from your Google account">
                  <span className="text-sm text-muted-foreground">{user?.name || "—"}</span>
                </SettingRow>
                <SettingRow label="Email Address" description="Your primary Gmail account">
                  <span className="text-sm text-muted-foreground truncate max-w-[200px]">{user?.email || "—"}</span>
                </SettingRow>
                <SettingRow label="Account ID" description="Internal user identifier">
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">{user?.id?.slice(0, 16) || "—"}…</span>
                </SettingRow>
              </div>

              {/* Danger zone */}
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4">
                <h3 className="text-sm font-bold text-red-500 mb-3">Danger Zone</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Sign out of all sessions</p>
                    <p className="text-xs text-muted-foreground mt-0.5">You will be logged out and redirected to the home page.</p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer border-none shrink-0 ml-4"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ── AI PREFERENCES ───────────────────────── */}
          {activeSection === "ai" && (
            <section>
              <h1 className="text-2xl font-bold text-foreground font-display mb-1">AI Preferences</h1>
              <p className="text-sm text-muted-foreground mb-8">Configure how the AI assistant analyzes and responds to your emails.</p>

              <div className="rounded-2xl border border-border bg-card px-5 mb-6">
                <SettingRow
                  label="Auto-Reply Safe Emails"
                  description="Let AI automatically send replies for low-priority emails when no hallucination is detected."
                >
                  <Toggle enabled={autoReply} onChange={setAutoReply} />
                </SettingRow>
                <SettingRow
                  label="Smart Summarization"
                  description="Automatically generate AI summaries when you open an email."
                >
                  <Toggle enabled={smartSummarize} onChange={setSmartSummarize} />
                </SettingRow>
              </div>

              <div className="rounded-2xl border border-border bg-card px-5 mb-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest pt-4 pb-2">Default Reply Tone</p>
                <div className="flex gap-3 pb-4">
                  {(["formal", "casual", "friendly"] as const).map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setAiDraftTone(tone)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all cursor-pointer border ${
                        aiDraftTone === tone
                          ? "bg-foreground text-background border-foreground"
                          : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI info */}
              <div className="rounded-2xl border border-border bg-muted/20 p-5 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-foreground/60" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Powered by Google Gemini</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This app uses Gemini AI for email analysis, summarization, priority classification, and draft reply generation. All processing happens server-side and your emails are never stored permanently.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ── NOTIFICATIONS ─────────────────────────── */}
          {activeSection === "notifications" && (
            <section>
              <h1 className="text-2xl font-bold text-foreground font-display mb-1">Notifications</h1>
              <p className="text-sm text-muted-foreground mb-8">Control when and how you get notified about your emails.</p>

              <div className="rounded-2xl border border-border bg-card px-5 mb-6">
                <SettingRow
                  label="Email Alerts"
                  description="Get notified when new emails arrive in your inbox."
                >
                  <Toggle enabled={emailAlerts} onChange={setEmailAlerts} />
                </SettingRow>
                <SettingRow
                  label="Urgent Emails Only"
                  description="Only notify for emails classified as urgent or high priority."
                >
                  <Toggle enabled={urgentOnly} onChange={setUrgentOnly} />
                </SettingRow>
                <SettingRow
                  label="Reminder Alerts"
                  description="Get notified when AI-scheduled reminders are due."
                >
                  <Toggle enabled={reminderAlerts} onChange={setReminderAlerts} />
                </SettingRow>
                <SettingRow
                  label="Sound Effects"
                  description="Play a sound when new emails or notifications arrive."
                >
                  <div className="flex items-center gap-2">
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-muted-foreground" />
                    )}
                    <Toggle enabled={soundEnabled} onChange={setSoundEnabled} />
                  </div>
                </SettingRow>
              </div>

              <div className="rounded-2xl border border-border bg-muted/20 p-4 flex items-start gap-3">
                <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The app syncs your inbox every <strong className="text-foreground">30 seconds</strong> automatically. Push notification support will be available in a future update.
                </p>
              </div>
            </section>
          )}

          {/* ── APPEARANCE ────────────────────────────── */}
          {activeSection === "appearance" && (
            <section>
              <h1 className="text-2xl font-bold text-foreground font-display mb-1">Appearance</h1>
              <p className="text-sm text-muted-foreground mb-8">Customize how the app looks and feels.</p>

              <div className="rounded-2xl border border-border bg-card px-5 mb-6">
                <div className="py-4 border-b border-border">
                  <p className="text-sm font-medium text-foreground mb-3">Theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { id: "light", label: "Light", icon: Sun },
                      { id: "dark", label: "Dark", icon: Moon },
                      { id: "system", label: "System", icon: Monitor },
                    ] as const).map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setTheme(id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                          theme === id
                            ? "bg-foreground text-background border-foreground"
                            : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <SettingRow
                  label="Compact Mode"
                  description="Show more emails in less space by reducing padding."
                >
                  <Toggle enabled={compactMode} onChange={setCompactMode} />
                </SettingRow>
              </div>

              <div className="rounded-2xl border border-border bg-muted/20 p-4 flex items-start gap-3">
                <Zap className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Theme switching is currently a UI preview. Full system-level dark/light mode persistence will be implemented in the next release.
                </p>
              </div>
            </section>
          )}

          {/* ── PRIVACY ───────────────────────────────── */}
          {activeSection === "privacy" && (
            <section>
              <h1 className="text-2xl font-bold text-foreground font-display mb-1">Privacy & Security</h1>
              <p className="text-sm text-muted-foreground mb-8">Manage data usage and security settings for your account.</p>

              <div className="rounded-2xl border border-border bg-card px-5 mb-6">
                <SettingRow
                  label="Usage Analytics"
                  description="Help improve the app by sharing anonymous usage data. No email content is included."
                >
                  <Toggle enabled={analyticsEnabled} onChange={setAnalyticsEnabled} />
                </SettingRow>
              </div>

              {/* Security info */}
              <div className="rounded-2xl border border-border bg-card p-5 mb-6 space-y-4">
                <h3 className="text-sm font-bold text-foreground">How we handle your data</h3>
                {[
                  { icon: Shield, title: "End-to-end via Google OAuth", desc: "We never store your Gmail password. Authentication is handled securely by Google OAuth 2.0." },
                  { icon: Sparkles, title: "AI processing is server-side only", desc: "Email content is sent to Gemini AI for analysis but is never persisted to our databases." },
                  { icon: Trash2, title: "No permanent email storage", desc: "Emails are fetched fresh on each session. We only cache minimal metadata in your browser session." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Revoke access */}
              <div className="rounded-2xl border border-border bg-card px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Revoke Google Access</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Remove this app's access to your Gmail. You can re-authorize at any time.</p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer bg-transparent shrink-0 ml-4"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Revoke
                  </button>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
