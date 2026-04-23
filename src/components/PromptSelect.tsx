// src/components/PromptSelect.tsx
import type { Dispatch, SetStateAction } from "react";

export type PromptItem = {
  id: string;
  label: string;
  prompt: string;
};

export default function PromptSelect({
  prompts,
  value,
  onChange,
}: {
  prompts: PromptItem[];
  value: string | null;
  onChange: Dispatch<SetStateAction<string | null>>;
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        width: "100%",
      }}
    >
      <span style={{ fontSize: 13, color: "var(--muted)" }}>Select Prompt</span>

      <select
        aria-label="Select prompt"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.15)",
          backgroundColor: "rgba(255,255,255,0.05)",
          color: "#e6eef8",
          fontSize: 14,
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
          appearance: "none",
          cursor: "pointer",
          outline: "none",
          transition: "border-color 0.2s, background-color 0.2s",
        }}
        onFocus={(e) =>
          (e.currentTarget.style.borderColor = "var(--accent)")
        }
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")
        }
      >
        <option
          value=""
          disabled
          style={{
            backgroundColor: "#0b1220",
            color: "#9aa4b2",
          }}
        >
          — Choose a prompt —
        </option>

        {prompts.map((p) => (
          <option
            key={p.id}
            value={p.id}
            style={{
              backgroundColor: "#0b1220",
              color: "#e6eef8",
            }}
          >
            {p.id} — {p.label}
          </option>
        ))}
      </select>
    </label>
  );
}
