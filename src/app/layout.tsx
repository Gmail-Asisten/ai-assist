import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Gmail Assistant",
  description: "Smart email management with Gemini AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <aside className="sidebar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', height: '40px', 
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', 
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '1.2rem'
              }}>
                AI
              </div>
              <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Mail Assistant</h2>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
              <a href="#" className="glass-card" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', textDecoration: 'none', color: 'var(--text-primary)', borderColor: 'rgba(255,255,255,0.2)', background: 'var(--bg-surface-hover)' }}>
                <span>📥 Inbox</span>
                <span style={{ background: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem' }}>3</span>
              </a>
              <a href="#" className="glass-card" style={{ padding: '12px', textDecoration: 'none', color: 'var(--text-secondary)' }}>
                <span>⭐ Starred</span>
              </a>
              <a href="#" className="glass-card" style={{ padding: '12px', textDecoration: 'none', color: 'var(--text-secondary)' }}>
                <span>🚀 Sent</span>
              </a>
              <a href="#" className="glass-card" style={{ padding: '12px', textDecoration: 'none', color: 'var(--text-secondary)' }}>
                <span>🗑️ Trash</span>
              </a>
            </nav>
            
            <div style={{ marginTop: 'auto' }}>
              <button className="btn btn-glass" style={{ width: '100%' }}>
                ⚙️ Settings
              </button>
            </div>
          </aside>
          
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
