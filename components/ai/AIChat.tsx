'use client';

import { motion } from 'framer-motion';
import { ArrowUp, BrainCircuit, RotateCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import {
  AI_DISCLAIMER,
  AI_NAME,
  AI_SUGGESTED_PROMPTS,
  answer,
} from '@/lib/ai';
import type { ClinicSnapshot } from '@/lib/ai';
import { cn } from '@/lib/utils';
import type { AIMessage } from '@/types';

interface AIChatProps {
  snapshot: ClinicSnapshot;
}

const EASE = [0.22, 1, 0.36, 1] as const;

function greeting(clinicName: string): AIMessage {
  return {
    id: 'msg_welcome',
    role: 'assistant',
    content: `I have ${clinicName}'s schedule, patient register, inventory and billing loaded. Ask me anything about how the clinic is running.`,
    createdAt: new Date().toISOString(),
    suggestions: AI_SUGGESTED_PROMPTS.slice(0, 3),
  };
}

/** Renders assistant text, preserving the paragraph and line breaks. */
function MessageBody({ content }: { content: string }) {
  return (
    <>
      {content.split('\n').map((line, i) =>
        line.trim() === '' ? (
          <span key={i} className="block h-2" />
        ) : (
          <span key={i} className="block">
            {line}
          </span>
        ),
      )}
    </>
  );
}

export function AIChat({ snapshot }: AIChatProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    greeting(snapshot.clinicName),
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, thinking]);

  const send = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || thinking) return;

      const userMessage: AIMessage = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      setMessages((current) => [...current, userMessage]);
      setInput('');
      setThinking(true);

      // A brief delay so the typing indicator reads as deliberate work.
      const result = await answer(trimmed, snapshot);
      await new Promise((resolve) => setTimeout(resolve, 620));

      setMessages((current) => [
        ...current,
        {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: result.content,
          createdAt: new Date().toISOString(),
          data: result.data,
          suggestions: result.suggestions,
        },
      ]);
      setThinking(false);
      inputRef.current?.focus();
    },
    [snapshot, thinking],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send(input);
    }
  };

  const suggestions = useMemo(() => {
    const last = messages[messages.length - 1];
    return last?.role === 'assistant' ? (last.suggestions ?? []) : [];
  }, [messages]);

  return (
    <div className="flex h-[calc(100svh-180px)] min-h-[520px] flex-col border border-white/10 bg-[#1A1C1E]">
      {/* ---------------- header ---------------- */}
      <header className="dt-chamfer-tr flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="dt-chamfer-xs flex h-9 w-9 items-center justify-center bg-[#15BCDF]">
            <BrainCircuit size={17} strokeWidth={1.6} className="text-[#1A1C1E]" />
          </span>
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-white">
              {AI_NAME}
            </h2>
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className="dt-dot-pulse h-[5px] w-[5px] bg-[#15BCDF]"
                aria-hidden="true"
              />
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/50">
                STATUS: ONLINE
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <TechnicalLabel
            label="CONTEXT"
            value={`${snapshot.patients.length} PATIENTS`}
            tone="dark"
          />
          <button
            type="button"
            onClick={() => setMessages([greeting(snapshot.clinicName)])}
            className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/45 transition-colors hover:text-white"
          >
            <RotateCw size={11} strokeWidth={2} aria-hidden="true" />
            RESET
          </button>
        </div>
      </header>

      {/* ---------------- messages ---------------- */}
      <div
        ref={scrollRef}
        className="dt-scroll dt-scroll-dark flex-1 space-y-5 overflow-y-auto p-5"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.map((message) => {
          const isUser = message.role === 'user';

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className={cn(
                'flex flex-col gap-1.5',
                isUser ? 'items-end' : 'items-start',
              )}
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
                {isUser ? 'USER' : 'AI'}
              </span>

              <div
                className={cn(
                  'dt-chamfer-xs max-w-[min(85%,640px)] px-4 py-3 text-[13px] leading-[1.65]',
                  isUser
                    ? 'bg-white/8 text-white/85'
                    : 'border border-[#15BCDF]/30 bg-[#15BCDF]/[0.07] text-white/90',
                )}
              >
                <MessageBody content={message.content} />

                {/* Structured data table */}
                {message.data && message.data.length > 0 && (
                  <dl className="mt-4 divide-y divide-white/10 border-t border-white/12 pt-1">
                    {message.data.map((row, i) => (
                      <div
                        key={i}
                        className="flex items-baseline justify-between gap-4 py-2"
                      >
                        <dt className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/45">
                          {row.label}
                        </dt>
                        <dd className="dt-mono shrink-0 text-right text-[11px] font-bold text-[#3FD0EF]">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        {thinking && (
          <div className="flex flex-col items-start gap-1.5">
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
              AI
            </span>
            <div className="dt-chamfer-xs flex items-center gap-1.5 border border-[#15BCDF]/25 bg-[#15BCDF]/[0.05] px-4 py-3.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-[5px] w-[5px] bg-[#15BCDF]"
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---------------- suggestions ---------------- */}
      {suggestions.length > 0 && !thinking && (
        <div className="dt-scroll dt-scroll-dark flex gap-2 overflow-x-auto border-t border-white/10 px-5 py-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => send(suggestion)}
              className="dt-chamfer-xs shrink-0 border border-white/14 bg-white/[0.04] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-white/60 transition-colors hover:border-[#15BCDF] hover:text-white"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* ---------------- composer ---------------- */}
      <div className="border-t border-white/10 p-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2.5"
        >
          <label htmlFor="dt-ai-input" className="dt-sr-only">
            Ask DENTRA AI about your clinic
          </label>
          <textarea
            id="dt-ai-input"
            ref={inputRef}
            rows={1}
            value={input}
            disabled={thinking}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about the schedule, patients, stock or revenue…"
            className="dt-textarea dt-input-dark max-h-[120px] min-h-[46px] flex-1 resize-none py-3.5 text-[13px]"
          />

          <button
            type="submit"
            disabled={!input.trim() || thinking}
            aria-label="Send message"
            className="dt-chamfer-xs flex h-[46px] w-[46px] shrink-0 items-center justify-center border border-[#0FA3C2] bg-[#15BCDF] text-[#1A1C1E] transition-colors hover:bg-[#3FD0EF] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ArrowUp size={17} strokeWidth={2.2} />
          </button>
        </form>

        <p className="mt-3 text-[9.5px] leading-[1.6] text-white/30">
          {AI_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
