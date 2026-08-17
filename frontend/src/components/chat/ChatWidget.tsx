"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, Send } from "lucide-react";
import GlassPanel from "../GlassPanel";
import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";
import { sendChatMessage } from "@/lib/api";
import { ChatMessage } from "@/lib/types";

const GREETING: ChatMessage = {
  role: "model",
  content: "Hi! I'm the WeatherDrop assistant. Ask me about current conditions or recent trends for any city.",
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const res = await sendChatMessage(nextMessages);
      setMessages([...nextMessages, { role: "model", content: res.reply }]);
    } catch {
      setMessages([
        ...nextMessages,
        { role: "model", content: "Sorry, I ran into a problem. Try again in a moment." },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSend();
  }

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
      {isOpen && (
        <GlassPanel
          elevated
          shimmer={false}
          className="flex h-[480px] w-[340px] flex-col overflow-hidden sm:w-[380px]"
        >
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Image src="/chatbot-icon.png" alt="" width={28} height={28} className="rounded-full" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-fog">WeatherDrop AI</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="cursor-pointer rounded-full p-1.5 text-fog transition-colors duration-150 hover:text-mist"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="themed-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4 [scrollbar-width:thin] [scrollbar-color:var(--color-slate)_transparent]"
          >
            {messages.map((m, i) => (
              <ChatBubble key={i} message={m} />
            ))}
            {isSending && <TypingIndicator />}
          </div>

          <div className="flex items-center gap-2 border-t border-white/5 p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about the weather..."
              disabled={isSending}
              className="flex-1 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-light text-mist placeholder:text-fog focus:border-white/20 focus:outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || !input.trim()}
              aria-label="Send message"
              className="cursor-pointer rounded-full bg-white/10 p-2.5 text-mist transition-colors duration-150 hover:bg-white/[0.15] disabled:opacity-40"
            >
              <Send className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </GlassPanel>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className="cursor-pointer transition-transform duration-150 hover:scale-105 active:scale-95"
      >
        <div
            style={{
              animation: "float-bot 2s ease-in-out infinite",
            }}
          >
            <Image src="/chatbot-icon.png" alt="Chat with WeatherDrop AI" width={96} height={96} />
        </div>
      </button>
    </div>
  );
}