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
  disabled,
  value: controlledValue,
  onChange,
  files = [],
  onFilesChange,
  accept,
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
    return Boolean(internal.trim() || files.length);
  }, [internal, files.length]);

  const handleChange = (nextValue: string) => {
    setInternal(nextValue);
    onChange?.(nextValue);
  };

  const mergeFiles = (incoming: FileList | null): File[] => {
    if (!incoming) return files;

    const merged = [...files];
    const seen = new Set(
      merged.map((file) => `${file.name}-${file.size}-${file.lastModified}`),
    );

    Array.from(incoming).forEach((file) => {
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      if (!seen.has(key)) {
        merged.push(file);
        seen.add(key);
      }
    });

    return merged;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = mergeFiles(event.target.files);
    onFilesChange?.(nextFiles);
    event.target.value = "";
  };

  const removeFile = (index: number) => {
    const nextFiles = files.filter((_, fileIndex) => fileIndex !== index);
    onFilesChange?.(nextFiles);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;

    onSend(internal.trim());

    setInternal("");
    onChange?.("");
    onFilesChange?.([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {files.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {files.map((file, index) => (
            <div
              key={`${file.name}-${file.size}-${file.lastModified}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                maxWidth: "100%",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  title={file.name}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 220,
                  }}
                >
                  {file.name}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {formatFileSize(file.size)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeFile(index)}
                disabled={disabled}
                aria-label={`Remove ${file.name}`}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "inherit",
                  cursor: "pointer",
                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        <input
          ref={fileInputRef}
          type="file"
          hidden
          multiple={multiple}
          accept={accept}
          onChange={handleFileSelect}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            height: "44px",
            flexShrink: 0,
          }}
        >
          Attach
        </button>

        <textarea
          ref={textareaRef}
          placeholder="Type your message"
          value={internal}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.06)",
            background: "transparent",
            color: "inherit",
            resize: "none",
            overflowY: "auto",
            minHeight: "44px",
            maxHeight: "200px",
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
            cursor: "pointer",
            height: "44px",
            flexShrink: 0,
          }}
        >
          Send
        </button>
      </div>
    </form>
  );
}