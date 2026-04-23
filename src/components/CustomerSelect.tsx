import type { Customer } from "../types/customer";

export default function CustomerSelect({
  customers,
  value,
  onChange,
  loading = false,
}: {
  customers: Customer[];
  value: string | null;
  onChange: (id: string) => void;
  loading?: boolean;
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
      <span style={{ fontSize: 13, color: "var(--muted)" }}>Select Customer</span>

      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.15)",
          backgroundColor: "rgba(255,255,255,0.05)",
          color: "#e6eef8", // ✅ always visible on dark background
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
        {loading ? (
          <option value="">Fetching customers...</option>
        ) : (
          <>
            <option value="" style={{
              backgroundColor: "#0b1220",
              color: "#9aa4b2",
            }}>— Choose customer —</option>
            {customers.map((c) => (
              <option key={c.customer_id} value={c.customer_id} style={{
                backgroundColor: "#0b1220",
                color: "#e6eef8",
              }}>
                {c.customer_id} — {c.name}
              </option>
            ))}
          </>
        )}
      </select>
    </label>
  );
}