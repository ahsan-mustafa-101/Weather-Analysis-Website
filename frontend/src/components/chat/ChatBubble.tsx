"use client";

import { ChatMessage } from "@/lib/types";

export default function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm font-light ${
          isUser
            ? "bg-white/10 text-mist"
            : "border border-white/5 bg-white/[0.03] text-mist"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}