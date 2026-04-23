// src/components/ChatWindow.tsx
import { useEffect, useRef } from "react";
import Message from "./Message";
import type { Message as Msg } from "../types/chat";

export default function ChatWindow({
  messages,
  loading,
}: {
  messages: Msg[];
  loading?: boolean;
}) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  return (
    <div className="chat-window" role="log" aria-live="polite">
      {messages.length === 0 ? (
        <div className="empty">No messages yet — say hello 👋</div>
      ) : (
        messages.map((m) => <Message key={m.id} message={m} />)
      )}

      {/* Loading skeleton bubble (assistant) */}
      {loading && (
        <div className="message assistant" aria-hidden>
          <div className="bubble skeleton-bubble">
            <div className="skeleton-content">
              <div className="skeleton-line short" />
              <div className="skeleton-line medium" />
              <div className="skeleton-line long" />
            </div>

            {/* animated progress line (moving) */}
            <div className="skeleton-progress" aria-hidden>
              <div className="progress-bar" />
            </div>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
