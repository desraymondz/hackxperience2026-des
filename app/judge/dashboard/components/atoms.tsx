// Small presentational atoms shared across the judge dashboard.
import { C, FM } from "../constants";

export function Divider() {
  return <div style={{ width: "100%", borderTop: `1px solid ${C.borderLight}` }} />;
}

export function PlaceholderThumb({ url, alt, w, h }: { url?: string | null; alt?: string; w?: number | string; h?: number | string } = {}) {
  const width  = w ?? 87;
  const height = h ?? 51;
  return (
    <div style={{ width, height, background: C.bgThumbnail, border: `1px solid ${C.borderMedium}`, position: "relative", overflow: "hidden" }}>
      {url ? (
        <img
          src={url}
          alt={alt ?? "Project thumbnail"}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <svg width={width} height={height} style={{ position: "absolute" }}>
          <line x1="0" y1="0" x2={width} y2={height} stroke="rgba(204,0,0,0.15)" strokeWidth="1" />
          <line x1={width} y1="0" x2="0" y2={height} stroke="rgba(204,0,0,0.15)" strokeWidth="1" />
        </svg>
      )}
    </div>
  );
}

export function FieldBlock({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div style={{ minWidth: 160, flex: 1 }}>
      <div style={{ fontFamily: FM, fontSize: 11, color: C.primary, letterSpacing: "0.08em", marginBottom: 5 }}>{label}</div>
      <div style={{ fontFamily: FM, fontSize: 12, color: muted ? C.textMuted : C.textPrimary, lineHeight: "18px", wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}
