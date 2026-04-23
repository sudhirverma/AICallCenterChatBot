import type { Message } from "../types/chat";

const API_BASE =
  (import.meta.env.VITE_CHAT_API as string) || "http://localhost:8000";

type SendPromptOptions = {
  customerId?: string;
  authTokenB64?: string;
  files?: File[];
};

type UploadResponse = {
  customer_id: string;
  document_type: string;
  employment_type: string;
  income: number | null;
  income_formatted: string;
  document_context: string;
  message: string;
};

type ChatApiResponse = {
  customer_id: string;
  response: string;
  intent: string;
  tools_called: string[];
  escalated: boolean;
};

async function readFileAsText(file: File): Promise<string> {
  return await file.text();
}

async function uploadDocument(
  customerId: string,
  file: File,
  authTokenB64?: string,
): Promise<UploadResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authTokenB64) {
    headers.Authorization = `Basic ${authTokenB64}`;
  }

  const documentText = await readFileAsText(file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      customer_id: customerId,
      document_text: documentText,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Upload API error: ${res.status} ${body}`);
  }

  return (await res.json()) as UploadResponse;
}

export async function sendPrompt(
  prompt: string,
  sessionId: string,
  options?: SendPromptOptions,
): Promise<Message> {
  const { customerId, authTokenB64, files = [] } = options ?? {};

  if (!customerId) {
    throw new Error("customerId is required");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authTokenB64) {
    headers.Authorization = `Basic ${authTokenB64}`;
  }

  let documentContext = "";

  if (files.length > 0) {
    const uploadResults = await Promise.all(
      files.map((file) => uploadDocument(customerId, file, authTokenB64)),
    );

    documentContext = uploadResults
      .map((result) => result.document_context)
      .join("\n");
  }

  const payload = {
    customer_id: customerId,
    message: prompt,
    document_context: documentContext,
    session_id: sessionId,
  };

  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Chat API error: ${res.status} ${body}`);
  }

  const json = (await res.json()) as ChatApiResponse;

  return {
    id: String(Date.now()),
    role: "assistant",
    text: json.response,
    timestamp: new Date().toISOString(),
  };
}