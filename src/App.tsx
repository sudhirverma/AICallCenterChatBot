import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import ChatWindow from "./components/ChatWindow";
import InputBar from "./components/InputBar";
import { useChat } from "./hooks/useChat";
import CustomerSelect from "./components/CustomerSelect";
import PromptSelect from "./components/PromptSelect";
import promptsData from "./data/prompts.json";
import {
  getSelectedCustomerId,
  setSelectedCustomerId,
} from "./utils/customerStorage";
import type { PromptItem } from "./components/PromptSelect";

const CUSTOMER_PROFILE_URL =
  "https://raw.githubusercontent.com/bananth2008/ai-callcenter/refs/heads/main/mcp_services/customer_profile/data/customers.json";

const secondaryButtonStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "transparent",
  color: "#fff",
  cursor: "pointer",
};

export default function App(): any {
  const [customers, setCustomers] = useState<any[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [customersReloadKey, setCustomersReloadKey] = useState(0);

  const [selectedCustomerId, setSelectedCustomerIdState] = useState<string | null>(
    () => getSelectedCustomerId(),
  );

  useEffect(() => {
    let cancelled = false;

    const loadCustomers = async () => {
      try {
        setCustomersLoading(true);
        setCustomersError(null);

        const response = await fetch(CUSTOMER_PROFILE_URL);

        if (!response.ok) {
          throw new Error(`Failed to fetch customers: ${response.status}`);
        }

        const data = await response.json();

        const loadedCustomers = Array.isArray(data)
          ? data
          : data.customers ?? Object.values(data);

        if (cancelled) return;

        setCustomers(loadedCustomers as any[]);

        setSelectedCustomerIdState((current) => {
          const preferred = current ?? getSelectedCustomerId();

          if (
            preferred &&
            loadedCustomers.some(
              (customer: any) => customer.customer_id === preferred,
            )
          ) {
            return preferred;
          }

          return loadedCustomers.length > 0
            ? loadedCustomers[0].customer_id
            : null;
        });
      } catch (error) {
        console.error("Failed to load customers", error);

        if (!cancelled) {
          setCustomers([]);
          setSelectedCustomerIdState(null);
          setCustomersError(
            "Failed to load customers. Check your connection and try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setCustomersLoading(false);
        }
      }
    };

    loadCustomers();

    return () => {
      cancelled = true;
    };
  }, [customersReloadKey]);

  useEffect(() => {
    if (selectedCustomerId) setSelectedCustomerId(selectedCustomerId);
  }, [selectedCustomerId]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.customer_id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  );

  const prompts = (promptsData as any).prompts as PromptItem[];
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);

  const selectedPrompt = useMemo(
    () => prompts.find((p) => p.id === selectedPromptId) ?? null,
    [prompts, selectedPromptId],
  );

  const [inputValue, setInputValue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (selectedPrompt) {
      setInputValue(selectedPrompt.prompt);
    }
  }, [selectedPrompt]);

  const { messages, loading, error, send, clear } = useChat();
  const [confirmingClear, setConfirmingClear] = useState(false);
  const clearConfirmButtonRef = useRef<HTMLButtonElement>(null);
  const newConversationButtonRef = useRef<HTMLButtonElement>(null);
  const shouldReturnFocusRef = useRef(false);

  const requestClearConfirmation = () => {
    shouldReturnFocusRef.current = true;
    setConfirmingClear(true);
  };

  const dismissClearConfirmation = () => {
    setConfirmingClear(false);
  };

  const confirmClear = () => {
    clear();
    setConfirmingClear(false);
  };

  useEffect(() => {
    if (confirmingClear) {
      clearConfirmButtonRef.current?.focus();
    } else if (shouldReturnFocusRef.current) {
      shouldReturnFocusRef.current = false;
      newConversationButtonRef.current?.focus();
    }
  }, [confirmingClear]);

  const handleClearConfirmKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      dismissClearConfirmation();
    }
  };

  const handleSend = (promptText: string) => {
    const token = selectedCustomer?.auth_token_b64;
    const cid = selectedCustomer?.customer_id;

    send(promptText, token, cid, selectedFiles);
    setSelectedPromptId(null);
    setInputValue("");
    setSelectedFiles([]);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        background: "#0b1020",
        color: "#fff",
      }}
    >
      <aside
        style={{
          borderRight: "1px solid rgba(255,255,255,0.08)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            AI Call Center Chat Bot
          </h2>
          {selectedCustomer && (
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {selectedCustomer.name}
            </div>
          )}
        </div>

        <CustomerSelect
          customers={customers}
          value={selectedCustomerId}
          onChange={(id) => setSelectedCustomerIdState(id)}
        />

        {customersLoading && (
          <div role="status" style={{ fontSize: 12, opacity: 0.7 }}>
            Fetching customers...
          </div>
        )}

        {customersError && (
          <div
            role="alert"
            style={{
              fontSize: 12,
              color: "#ffb4b4",
              background: "rgba(255,0,0,0.08)",
              border: "1px solid rgba(255,0,0,0.18)",
              borderRadius: 8,
              padding: 10,
            }}
          >
            <div style={{ marginBottom: 8 }}>{customersError}</div>
            <button
              onClick={() => setCustomersReloadKey((key) => key + 1)}
              style={secondaryButtonStyle}
            >
              Retry
            </button>
          </div>
        )}

        <PromptSelect
          prompts={prompts}
          value={selectedPromptId}
          onChange={(id) => setSelectedPromptId(id)}
        />

        {selectedPrompt && (
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
              Selected Prompt
            </div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              {selectedPrompt.label}
            </div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>
              {selectedPrompt.prompt}
            </div>
          </div>
        )}

        {confirmingClear ? (
          <div
            role="alertdialog"
            aria-labelledby="clear-confirm-title"
            aria-describedby="clear-confirm-description"
            onKeyDown={handleClearConfirmKeyDown}
            style={{
              padding: 10,
              borderRadius: 8,
              border: "1px solid rgba(255,0,0,0.18)",
              background: "rgba(255,0,0,0.08)",
              fontSize: 12,
            }}
          >
            <div
              id="clear-confirm-title"
              style={{ fontWeight: 600, marginBottom: 4 }}
            >
              Clear this conversation?
            </div>
            <div id="clear-confirm-description" style={{ marginBottom: 8 }}>
              The current message history will be discarded.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                ref={clearConfirmButtonRef}
                onClick={confirmClear}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,0,0,0.3)",
                  background: "rgba(255,0,0,0.15)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Yes, clear
              </button>
              <button
                onClick={dismissClearConfirmation}
                style={secondaryButtonStyle}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            ref={newConversationButtonRef}
            onClick={requestClearConfirmation}
            style={secondaryButtonStyle}
          >
            New Conversation
          </button>
        )}

        <div role="status" style={{ fontSize: 12, opacity: 0.7 }}>
          Session stored in localStorage — Selected:{" "}
          {customersLoading
            ? "Fetching customers..."
            : selectedCustomer?.customer_id ?? "—"}
        </div>
      </aside>

      <main
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 16,
          gap: 12,
          minHeight: "100vh",
        }}
      >
        <div style={{ flex: 1, minHeight: 0 }}>
          <ChatWindow messages={messages} />
        </div>

        {error && (
          <div
            role="alert"
            style={{
              color: "#ffb4b4",
              background: "rgba(255,0,0,0.08)",
              border: "1px solid rgba(255,0,0,0.18)",
              borderRadius: 8,
              padding: 10,
            }}
          >
            {error}
          </div>
        )}

        <InputBar
          onSend={handleSend}
          disabled={loading}
          value={inputValue}
          onChange={setInputValue}
          files={selectedFiles}
          onFilesChange={setSelectedFiles}
          accept=".txt"
          multiple={true}
        />
      </main>
    </div>
  );
}