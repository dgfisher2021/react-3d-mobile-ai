import { useEffect, useRef, useState } from 'react';
import { RefreshCw, Send, Sparkles, X } from 'lucide-react';
import { QUICK_CHIPS } from '../../constants/quickChips';
import { parseAIResponse } from '../../hooks/useAIResponseParser';
import type { ChatMessage, Theme, ThemeName } from '../../types';

interface AssistPanelProps {
  theme: Theme;
  themeName: ThemeName;
  onClose: () => void;
}

// A static lookup that mocks the Anthropic API responses for the quick prompts.
// This keeps the demo fully interactive on GitHub Pages (no backend/keys).
const MOCK_RESPONSES: Record<string, string> = {
  'What are the 5 ticket types and their naming conventions?': `We use 5 ticket types:
1. Epic: PROJECT: Epic Title
2. Story: Clear action statement
3. Bug: [Area]: Broken behavior
4. Task: Technical action verb
5. Spike: Prefixed with [Spike]`,
  'Explain all the title/naming conventions for each ticket type': `Each ticket type has a strict title format:
1. Epic: PROJECT: Epic Title — e.g. "iPPMech: Bid Board"
2. Story: Clear action statement — e.g. "Add filter by trade"
3. Bug: [Area]: Broken behavior — e.g. "MFR: Total shows NaN"
4. Task: Technical action verb — e.g. "Set up DB migration"
5. Spike: [Spike] prefix — e.g. "[Spike] Evaluate PDF libs"`,
  'What are our 4 sprint ceremonies and when do they happen?': `We run 4 ceremonies each sprint:
1. Daily Standup: 15 min every weekday
2. Sprint Planning: 60 min on first day of sprint
3. Sprint Retro: 45 min on last day of sprint
4. Dept Sprint Sync: 30 min after planning`,
  'Explain the classification hierarchy and the Golden Rule': `Classification goes Initiative > Project > Epic > Story > Task.
1. Initiative: 12-24 months, multiple projects
2. Project: 1-6 months, multiple epics
3. Epic: 2-10 weeks, multiple stories
4. Story: 1-5 days, optional sub-tasks
5. Task: Hours to days, atomic

The Golden Rule: "Does this need sub-items that THEMSELVES need sub-items?" If yes, it's a higher level.`,
};

const FALLBACK =
  'This demo uses a mocked Standards AI to stay honest on GitHub Pages. Try one of the chips below for a scripted answer.';

export function AssistPanel({ theme, themeName, onClose }: AssistPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', content: text.trim(), id: Date.now() }]);
    setInputText('');
    setIsThinking(true);
    // Simulate latency
    await new Promise((r) => setTimeout(r, 650));
    const reply = MOCK_RESPONSES[text.trim()] ?? FALLBACK;
    setMessages((prev) => [...prev, { role: 'assistant', content: reply, id: Date.now() + 1 }]);
    setIsThinking(false);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: themeName === 'dark' ? 'rgba(11,20,38,0.78)' : 'rgba(240,242,248,0.75)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
      }}
    >
      <div style={{ height: 30 }} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 18px 10px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={15} color="#319795" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: theme.headers }}>
              Standards Assistant
            </span>
          </div>
          <span
            style={{
              fontSize: '0.52rem',
              fontWeight: 600,
              color: '#319795',
              background: 'rgba(49,151,149,0.12)',
              borderRadius: 20,
              padding: '1px 6px',
              marginTop: 2,
              display: 'inline-block',
            }}
          >
            MOCK DEMO
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {messages.length > 0 && (
            <div
              onClick={() => setMessages([])}
              style={circleBtn(theme)}
              role="button"
              aria-label="Reset chat"
            >
              <RefreshCw size={13} color={theme.muted} />
            </div>
          )}
          <div onClick={onClose} style={circleBtn(theme)} role="button" aria-label="Close">
            <X size={14} color={theme.muted} />
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 14px' }}>
        {messages.length === 0 && (
          <div style={{ padding: '30px 10px', textAlign: 'center' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                margin: '0 auto 14px',
                background: 'linear-gradient(135deg, rgba(49,130,206,0.15), rgba(49,151,149,0.15))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={26} color="#319795" />
            </div>
            <div
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: theme.headers,
                marginBottom: 4,
              }}
            >
              Ask me anything
            </div>
            <div
              style={{ fontSize: '0.62rem', color: theme.muted, marginBottom: 18, lineHeight: 1.5 }}
            >
              Ticket templates, naming conventions, meeting agendas, classification rules
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
              {QUICK_CHIPS.map((chip, i) => (
                <div
                  key={i}
                  onClick={() => sendMessage(chip.prompt)}
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: 500,
                    color: '#319795',
                    background: 'rgba(49,151,149,0.08)',
                    border: '1px solid rgba(49,151,149,0.18)',
                    borderRadius: 20,
                    padding: '8px 14px',
                    cursor: 'pointer',
                  }}
                >
                  {chip.label}
                </div>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const segments = !isUser ? parseAIResponse(msg.content) : null;
          const hasRich = segments && segments.some((s) => s.type === 'list-item');
          return (
            <div key={msg.id} style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: '0.52rem',
                  fontWeight: 600,
                  color: theme.muted,
                  marginBottom: 4,
                  textAlign: isUser ? 'right' : 'left',
                }}
              >
                {isUser ? 'You' : 'Standards AI'}
              </div>
              {isUser ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '10px 14px',
                      borderRadius: '16px 16px 4px 16px',
                      background: 'linear-gradient(135deg, #3182CE, #319795)',
                      color: '#FFF',
                      fontSize: '0.67rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ) : hasRich ? (
                <div
                  style={{
                    background:
                      themeName === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.35)',
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: 16,
                    overflow: 'hidden',
                  }}
                >
                  {segments!.map((seg, si) => {
                    if (seg.type === 'text') {
                      return (
                        <div
                          key={si}
                          style={{
                            padding: '10px 14px',
                            fontSize: '0.65rem',
                            lineHeight: 1.6,
                            color: theme.bodyText,
                          }}
                        >
                          {seg.content}
                        </div>
                      );
                    }
                    const ac = seg.color || '#319795';
                    return (
                      <div
                        key={si}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '10px 14px',
                          background: `${ac}${themeName === 'dark' ? '08' : '06'}`,
                          borderBottom:
                            si < segments!.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                        }}
                      >
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 7,
                            flexShrink: 0,
                            background: `${ac}18`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.58rem',
                            fontWeight: 700,
                            color: ac,
                            marginTop: 1,
                          }}
                        >
                          {seg.num}
                        </div>
                        <div style={{ flex: 1 }}>
                          {seg.label && (
                            <div
                              style={{
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                color: ac,
                                marginBottom: 2,
                              }}
                            >
                              {seg.label}
                            </div>
                          )}
                          <div
                            style={{ fontSize: '0.62rem', lineHeight: 1.5, color: theme.bodyText }}
                          >
                            {seg.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    maxWidth: '90%',
                    padding: '10px 14px',
                    borderRadius: '16px 16px 16px 4px',
                    background: theme.aiBubbleBg,
                    color: theme.bodyText,
                    fontSize: '0.65rem',
                    lineHeight: 1.6,
                    border: `1px solid ${theme.cardBorder}`,
                  }}
                >
                  {msg.content}
                </div>
              )}
            </div>
          );
        })}
        {isThinking && (
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: '0.52rem',
                fontWeight: 600,
                color: theme.muted,
                marginBottom: 4,
              }}
            >
              Standards AI
            </div>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '16px 16px 16px 4px',
                background: theme.aiBubbleBg,
                border: `1px solid ${theme.cardBorder}`,
                display: 'flex',
                gap: 6,
                width: 'fit-content',
              }}
            >
              {[0, 1, 2].map((j) => (
                <div
                  key={j}
                  className="think-dot"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#319795',
                    animationDelay: `${j * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {messages.length > 0 && !isThinking && (
        <div style={{ padding: '4px 14px 6px', display: 'flex', gap: 6, overflow: 'auto' }}>
          {QUICK_CHIPS.map((chip, i) => (
            <div
              key={i}
              onClick={() => sendMessage(chip.prompt)}
              style={{
                fontSize: '0.55rem',
                fontWeight: 500,
                color: '#319795',
                background: 'rgba(49,151,149,0.08)',
                border: '1px solid rgba(49,151,149,0.15)',
                borderRadius: 16,
                padding: '5px 10px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {chip.label}
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '8px 14px 20px', borderTop: `1px solid ${theme.cardBorder}` }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: theme.chipBg,
            borderRadius: 24,
            padding: '8px 10px 8px 16px',
            border: `1px solid ${theme.cardBorder}`,
          }}
        >
          <input
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
            placeholder="Ask about standards..."
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: theme.headers,
              fontSize: '0.68rem',
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          <div
            onClick={() => sendMessage(inputText)}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: inputText.trim()
                ? 'linear-gradient(135deg, #3182CE, #319795)'
                : theme.chipBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() ? 'pointer' : 'default',
            }}
          >
            <Send size={15} color={inputText.trim() ? '#FFF' : theme.muted} />
          </div>
        </div>
      </div>
    </div>
  );
}

function circleBtn(theme: Theme) {
  return {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: theme.chipBg,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${theme.cardBorder}`,
  } as const;
}
