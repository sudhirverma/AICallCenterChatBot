import React, { useEffect, useMemo, useRef, useState } from "react";

type InputBarProps = {
  onSend: (value: string) => void;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  files?: File[];
  onFilesChange?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function InputBar({
  onSend,
  disabled = false,
  value: controlledValue,
  onChange,
  files = [],
  onFilesChange,
  accept = ".txt,.pdf,.doc,.docx,.csv,.json",
  multiple = true,
}: InputBarProps) {
  const [internal, setInternal] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof controlledValue === "string") {
      setInternal(controlledValue);
    }
  }, [controlledValue]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [internal]);

  const canSubmit = useMemo(() => {
    return Boolean(internal.trim() || files.length > 0);
  }, [internal, files.length]);

  const handleChange = (nextValue: string) => {
    setInternal(nextValue);
    onChange?.(nextValue);
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);

    console.log("Selected files:", selected);

    if (selected.length === 0) return;

    const merged = [...files];

    selected.forEach((file) => {
      const alreadyExists = merged.some(
        (existing) =>
          existing.name === file.name &&
          existing.size === file.size &&
          existing.lastModified === file.lastModified
      );

      if (!alreadyExists) {
        merged.push(file);
      }
    });

    onFilesChange?.(merged);

    event.target.value = "";
  };

  const removeFile = (index: number) => {
    const nextFiles = files.filter((_, i) => i !== index);
    onFilesChange?.(nextFiles);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (disabled || !canSubmit) return;

    onSend(internal.trim());

    setInternal("");
    onChange?.("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        disabled={disabled}
        style={{ display: "none" }}
      />

      {files.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 10,
            padding: "8px 10px",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          {files.map((file, index) => (
            <div
              key={`${file.name}-${file.size}-${file.lastModified}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 10px",
                borderRadius: 999,
                background: "rgba(66,153,225,0.18)",
                border: "1px solid rgba(66,153,225,0.35)",
                color: "#fff",
                fontSize: 13,
                maxWidth: "100%",
              }}
            >
              <span>📎</span>

              <span
                title={file.name}
                style={{
                  maxWidth: 260,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontWeight: 600,
                }}
              >
                {file.name}
              </span>

              <span style={{ opacity: 0.75 }}>{formatFileSize(file.size)}</span>

              <button
                type="button"
                onClick={() => removeFile(index)}
                disabled={disabled}
                aria-label={`Remove ${file.name}`}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#fff",
                  cursor: disabled ? "not-allowed" : "pointer",
                  fontSize: 18,
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
        }}
      >
        <button
          type="button"
          onClick={handleAttachClick}
          disabled={disabled}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
            color: "#fff",
            cursor: disabled ? "not-allowed" : "pointer",
            height: 44,
            flexShrink: 0,
          }}
        >
          Attach
        </button>

        <textarea
          ref={textareaRef}
          value={internal}
          placeholder={
            files.length > 0
              ? "Add a message for the attached file..."
              : "Type your message..."
          }
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          rows={1}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
            color: "#fff",
            resize: "none",
            overflowY: "auto",
            minHeight: 44,
            maxHeight: 200,
            fontFamily:
              "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
            fontSize: 14,
            lineHeight: "1.5",
          }}
        />

        <button
          type="submit"
          disabled={disabled || !canSubmit}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            cursor: disabled || !canSubmit ? "not-allowed" : "pointer",
            height: 44,
            flexShrink: 0,
            opacity: disabled || !canSubmit ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </div>
    </form>
  );
}