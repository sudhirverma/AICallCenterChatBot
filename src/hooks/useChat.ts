import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Message as Msg, ChatAttachment } from "../types/chat";
import { getSessionId } from "../utils/session";
import { sendPrompt } from "../services/api";

const STORAGE_KEY_PREFIX = "chat_messages_";

const toAttachmentMeta = (files: File[]): ChatAttachment[] =>
  files.map((file) => ({
    id: `${file.name}-${file.size}-${file.lastModified}`,
    name: file.name,
    size: file.size,
    type: file.type,
  }));

export function useChat() {
  const sessionId = getSessionId();
  const storageKey = `${STORAGE_KEY_PREFIX}${sessionId}`;

  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as Msg[]) : [];
    } catch (e) {
      console.error("Failed to parse messages from localStorage", e);
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save messages", e);
    }
  }, [messages, storageKey]);

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);

    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.error("Failed to clear storage", e);
    }
  }, [storageKey]);

  const send = useCallback(
    async (
      prompt: string,
      authTokenB64?: string,
      customerId?: string,
      files: File[] = []
    ) => {
      setError(null);

      const userMsg: Msg = {
        id: `${Date.now()}-u`,
        role: "user",
        text: prompt,
        timestamp: new Date().toISOString(),
        attachments: toAttachmentMeta(files),
      };

      setMessages((m) => [...m, userMsg]);

      const tempId = `temp-${uuidv4()}`;

      const tempMsg: Msg = {
        id: tempId,
        role: "assistant",
        text: files.length ? "Uploading files and loading info..." : "Loading info...",
        timestamp: new Date().toISOString(),
        isTemp: true,
      };

      setMessages((m) => [...m, tempMsg]);
      setLoading(true);

      try {
        const res: any = await sendPrompt(prompt, sessionId, {
          customerId,
          authTokenB64,
          files,
        });

        let assistantText = "";

        if (!res) {
          assistantText = "No response from server.";
        } else if (typeof res === "string") {
          assistantText = res;
        } else if (typeof res === "object") {
          assistantText =
            (res.message as string) ||
            (res.text as string) ||
            (res.action_result?.message as string) ||
            JSON.stringify(res);
        } else {
          assistantText = String(res);
        }

        const assistantMsg: Msg = {
          id: `${Date.now()}-a`,
          role: "assistant",
          text: assistantText,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? assistantMsg : m))
        );
      } catch (err: any) {
        console.error("send error:", err);

        const errText = err?.message ?? "Unknown error";
        setError(errText);

        const errMsg: Msg = {
          id: `err-${Date.now()}`,
          role: "assistant",
          text: `Error: ${errText}`,
          timestamp: new Date().toISOString(),
          error: true,
        };

        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? errMsg : m))
        );
      } finally {
        setLoading(false);
      }
    },
    [sessionId]
  );

  return {
    messages,
    loading,
    error,
    send,
    clear,
    setMessages,
  };
}

export default useChat;