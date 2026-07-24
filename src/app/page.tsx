"use client";

import { useState } from "react";
import { MOCK_RAW_EMAILS, MOCK_PIPELINE_RESULTS } from "@/lib/mock-data";

export default function Home() {
  const [selectedEmailId, setSelectedEmailId] = useState<string>(MOCK_RAW_EMAILS[0].id);

  const selectedEmail = MOCK_RAW_EMAILS.find((e) => e.id === selectedEmailId);
  const aiData = selectedEmailId ? MOCK_PIPELINE_RESULTS[selectedEmailId] : null;

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Email List Column */}
      <div style={{ 
        width: '350px', 
        borderRight: '1px solid var(--border-glass)', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'rgba(15, 17, 21, 0.4)'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-glass)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Inbox</h2>
          <input 
            type="text" 
            placeholder="Search emails..." 
            style={{ 
              width: '100%', padding: '10px 15px', borderRadius: '8px', 
              border: '1px solid var(--border-glass)', 
              background: 'var(--bg-glass)', color: 'white',
              outline: 'none'
            }} 
          />
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {MOCK_RAW_EMAILS.map((email) => (
            <div 
              key={email.id} 
              onClick={() => setSelectedEmailId(email.id)}
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-glass)',
                cursor: 'pointer',
                background: selectedEmailId === email.id ? 'var(--bg-surface-hover)' : 'transparent',
                transition: 'background var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: selectedEmailId === email.id ? '600' : '500', color: selectedEmailId === email.id ? 'var(--accent-secondary)' : 'var(--text-primary)' }}>
                  {email.fromName.split(' ')[0]}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {new Date(email.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {email.subject}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {email.snippet}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Detail Column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '30px' }}>
        {selectedEmail ? (
          <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            
            {/* AI Summary Panel */}
            {aiData && (
              <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', borderLeft: '4px solid var(--accent-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)' }}>
                    ✨ AI Analysis
                  </h3>
                  {aiData.classification?.priorityLabel === 'urgent' && (
                    <span style={{ background: 'rgba(239, 35, 60, 0.2)', color: 'var(--accent-danger)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      🔥 URGENT
                    </span>
                  )}
                </div>
                
                <p style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '16px' }}>
                  {aiData.summary?.summary.oneLiner}
                </p>
                
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {aiData.summary?.summary.detailed.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>

                {aiData.summary?.actionItems && aiData.summary.actionItems.length > 0 && (
                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
                    <h4 style={{ marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>ACTION ITEMS:</h4>
                    {aiData.summary.actionItems.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <input type="checkbox" style={{ accentColor: 'var(--accent-secondary)' }} />
                        <span>{item.action}</span>
                        <span style={{ fontSize: '0.75rem', background: 'var(--bg-glass)', padding: '2px 6px', borderRadius: '4px' }}>
                          {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'No deadline'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Email Header */}
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>{selectedEmail.subject}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {selectedEmail.fromName.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: '500' }}>{selectedEmail.fromName} <span style={{ color: 'var(--text-tertiary)', fontWeight: 'normal' }}>&lt;{selectedEmail.from}&gt;</span></div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>to me • {new Date(selectedEmail.date).toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div 
              className="glass-card" 
              style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '30px', marginBottom: '30px', lineHeight: '1.6' }}
              dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
            />

            {/* AI Draft Replies */}
            {aiData?.draftReplies?.drafts && (
              <div>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🤖 Smart Replies
                </h3>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  {aiData.draftReplies.quickActions.map((action, idx) => (
                    <button key={idx} className="btn btn-glass" style={{ borderRadius: '20px' }}>
                      {action.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {aiData.draftReplies.drafts.map((draft, idx) => (
                    <div key={idx} className="glass-card" style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '-10px', right: '20px', background: 'var(--accent-primary)', padding: '2px 10px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {draft.tone}
                      </div>
                      <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{draft.body}</p>
                      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button className="btn btn-glass">Edit</button>
                        <button className="btn btn-primary">Send Reply</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
            Select an email to view details
          </div>
        )}
      </div>
    </div>
  );
}
