import React, { useState } from "react";
import type { Message as Msg } from "../types/chat";
import { useDotsAnimation } from "../hooks/useDotsAnimation";

const tryParseJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const extractHumanMessage = (data: any): string | null => {
  if (!data) return null;

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (
    data.action_result &&
    typeof data.action_result.message === "string" &&
    data.action_result.message.trim()
  ) {
    return data.action_result.message;
  }

  if (data.action === "get_balance" && data.action_result) {
    const r = data.action_result;

    if (r.balance) {
      return `The current balance is ${r.balance} ${r.currency ?? ""}.`;
    }
  }

  if (data.action === "get_customer_info" && data.action_result) {
    const r = data.action_result;
    const parts: string[] = [];

    if (r.name) parts.push(`Name: ${r.name}`);
    if (r.account_id) parts.push(`Account: ${r.account_id}`);

    if (typeof r.balance !== "undefined") {
      parts.push(`Balance: ${r.balance} ${r.currency ?? ""}`);
    }

    if (parts.length) return parts.join(" • ");
  }

  if (data.llm_output) {
    if (typeof data.llm_output === "string") {
      const parsed = tryParseJson(data.llm_output);

      if (parsed) {
        const fromNested = extractHumanMessage(parsed);
        if (fromNested) return fromNested;
      }
    } else if (typeof data.llm_output === "object") {
      const fromNested = extractHumanMessage(data.llm_output);
      if (fromNested) return fromNested;
    }
  }

  for (const k of Object.keys(data)) {
    const val = data[k];

    if (typeof val === "string") {
      const parsed = tryParseJson(val);

      if (parsed) {
        const fromParsed = extractHumanMessage(parsed);
        if (fromParsed) return fromParsed;
      }
    }
  }

  return null;
};

const Message: React.FC<{ message: Msg }> = ({ message }) => {
  const isUser = message.role === "user";
  const [showRaw, setShowRaw] = useState(false);

  const parsed = typeof message.text === "string" ? tryParseJson(message.text) : null;
  const humanText = parsed ? extractHumanMessage(parsed) : null;

  const dots = useDotsAnimation(
    typeof message.text === "string" && message.text.trim()
      ? message.text
      : "loading",
    400
  );

  const bubbleStyle: React.CSSProperties = {
    maxWidth: "78%",
    padding: "12px 14px",
    borderRadius: 14,
    background: isUser ? "rgba(66, 153, 225, 0.22)" : "rgba(255,255,255,0.06)",
    border: message.error
      ? "1px solid rgba(255, 99, 99, 0.45)"
      : "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        margin: "10px 0",
      }}
    >
      <div style={bubbleStyle}>
        {message.isTemp ? (
          <div>
            {message.text.replace(/\.+$/, "")}
            {dots}
          </div>
        ) : (
          <>
            {message.text ? <div>{humanText ?? message.text}</div> : null}

            {message.attachments?.length ? (
              <div
                style={{
                  marginTop: message.text ? 10 : 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {message.attachments.map((file) => (
                  <div
                    key={file.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      fontSize: 13,
                    }}
                  >
                    <span>📎</span>

                    <span
                      title={file.name}
                      style={{
                        fontWeight: 600,
                        maxWidth: 260,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {file.name}
                    </span>

                    <span style={{ opacity: 0.7 }}>
                      {formatFileSize(file.size)}
                    </span>

                    {file.type ? (
                      <span style={{ opacity: 0.55 }}>{file.type}</span>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {parsed && (
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowRaw((v) => !v)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#9ecbff",
                    cursor: "pointer",
                    padding: 0,
                    fontSize: 12,
                  }}
                >
                  {showRaw ? "Hide raw response" : "Show raw response"}
                </button>

                {showRaw && (
                  <pre
                    style={{
                      marginTop: 8,
                      padding: 10,
                      borderRadius: 8,
                      background: "rgba(0,0,0,0.25)",
                      overflowX: "auto",
                      fontSize: 12,
                    }}
                  >
                    {JSON.stringify(parsed, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Message;