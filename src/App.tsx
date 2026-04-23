import { useEffect, useMemo, useState } from "react";
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
import type { Customer } from "./types/customer";

const CUSTOMER_PROFILE_URL =
  "https://raw.githubusercontent.com/bananth2008/ai-callcenter/refs/heads/main/mcp_services/customer_profile/data/customers.json";

type RemoteCustomer = Customer & {
  segment?: string;
  account_status?: string;
  relationship_value?: string;
  tenure_years?: number;
  account_type?: string;
  email?: string;
  phone?: string;
};

type RemoteCustomerMap = Record<string, RemoteCustomer>;
type NormalizedCustomersResponse = { customers: RemoteCustomer[] };

function normalizeCustomers(payload: unknown): RemoteCustomer[] {
  if (!payload || typeof payload !== "object") return [];

  // Case 1: already in { customers: [...] } shape
  if (
    "customers" in payload &&
    Array.isArray((payload as NormalizedCustomersResponse).customers)
  ) {
    return (payload as NormalizedCustomersResponse).customers;
  }

  // Case 2: keyed object { "11111": {...}, "12345": {...} }
  return Object.values(payload as RemoteCustomerMap).map((customer) => ({
    ...customer,
    contact: {
      ...(customer.contact ?? {}),
      email: customer.contact?.email ?? customer.email,
      phone: customer.contact?.phone ?? customer.phone,
    },
    account: {
      ...(customer.account ?? {}),
      account_type: customer.account?.account_type ?? customer.account_type ?? "",
      account_id: customer.account?.account_id ?? customer.customer_id,
      routing_number: customer.account?.routing_number ?? "",
      balance: customer.account?.balance ?? 0,
      currency: customer.account?.currency ?? "INR",
    },
  }));
}

export default function App(): any {
  const [customers, setCustomers] = useState<RemoteCustomer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);

  const [selectedCustomerId, setSelectedCustomerIdState] = useState<string | null>(
    () => getSelectedCustomerId()
  );

  useEffect(() => {
    let cancelled = false;

    const loadCustomers = async () => {
      try {
        setCustomersLoading(true);

        const response = await fetch(CUSTOMER_PROFILE_URL, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch customers: ${response.status}`);
        }

        const rawData = await response.json();
        const normalizedCustomers = normalizeCustomers(rawData);

        if (cancelled) return;

        setCustomers(normalizedCustomers);

        setSelectedCustomerIdState((current) => {
          if (
            current &&
            normalizedCustomers.some((c) => c.customer_id === current)
          ) {
            return current;
          }

          return normalizedCustomers.length > 0
            ? normalizedCustomers[0].customer_id
            : null;
        });
      } catch (error) {
        console.error("Failed to load customers from remote source", error);

        if (!cancelled) {
          setCustomers([]);
          setSelectedCustomerIdState(null);
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
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      setSelectedCustomerId(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.customer_id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId]
  );

  const prompts = (promptsData as any).prompts as PromptItem[];
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);

  const selectedPrompt = useMemo(
    () => prompts.find((p) => p.id === selectedPromptId) ?? null,
    [prompts, selectedPromptId]
  );

  const [inputValue, setInputValue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (selectedPrompt) {
      setInputValue(selectedPrompt.prompt);
    }
  }, [selectedPrompt]);

  const { messages, loading, error, send, clear } = useChat();

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
      {/* Sidebar */}
      <aside
        style={{
          borderRight: "1px solid rgba(255,255,255,0.08)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Updated Header */}
        <div className="brand-card">
          <h1>AI Call Center Chat Bot</h1>
          {selectedCustomer && <p>{selectedCustomer.name}</p>}
        </div>

        <CustomerSelect
          customers={customers}
          value={selectedCustomerId}
          onChange={(id) => setSelectedCustomerIdState(id)}
          loading={customersLoading}
        />

        <PromptSelect
          prompts={prompts}
          value={selectedPromptId}
          onChange={setSelectedPromptId}
        />

        {selectedPrompt && (
          <div className="selected-prompt-card">
            <h3>Selected Prompt</h3>
            <strong>{selectedPrompt.label}</strong>
            <p>{selectedPrompt.prompt}</p>
          </div>
        )}

        <button
          onClick={clear}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "transparent",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          New Conversation
        </button>

        <p className="session-note">
          Session stored in localStorage — Selected:{" "}
          {customersLoading
            ? "Fetching customers..."
            : selectedCustomer?.customer_id ?? "—"}
        </p>
      </aside>

      {/* Main Chat */}
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 16,
          gap: 12,
          minHeight: "100vh",
        }}
      >
        {error && <div
          role="alert"
          style={{
            color: "#ffb4b4",
            background: "rgba(255,0,0,0.08)",
            border: "1px solid rgba(255,0,0,0.18)",
            borderRadius: 8,
            padding: 10,
          }}
        >{error}</div>}

        <div style={{ flex: 1, minHeight: 0 }}>
          <ChatWindow messages={messages} loading={loading} />
        </div>

        <InputBar
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          loading={loading}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
        />
      </main>
    </div>
  );
}
