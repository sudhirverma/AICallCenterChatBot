export type Role = "user" | "assistant" | "system";

export type ChatAttachment = {
  id: string;
  name: string;
  size: number;
  type: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  isTemp?: boolean;
  error?: boolean;
  attachments?: ChatAttachment[];
};