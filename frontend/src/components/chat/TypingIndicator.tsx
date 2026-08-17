"use client";

export default function TypingIndicator() {
  return (
    <div className="flex w-full justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fog [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fog [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fog" />
      </div>
    </div>
  );
}