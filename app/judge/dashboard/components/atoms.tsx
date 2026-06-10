// Small presentational atoms shared across the judge dashboard.
import { C, FM } from "../constants";

export function RedBar() {
  return <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.red, pointerEvents: "none" }} />;
}

export function Divider() {
  return <div style={{ width: "100%", borderTop: `1px solid ${C.muted}` }} />;
}

export function PlaceholderThumb({ url, alt }: { url?: string | null; alt?: string } = {}) {
  return (
    <div style={{ width: 87, height: 51, background: "rgba(245,240,232,0.06)", border: `1px solid ${C.darkRed}`, position: "relative", overflow: "hidden" }}>
      {url ? (
        <img
          src={url}
          alt={alt ?? "Project thumbnail"}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <svg width="87" height="51" style={{ position: "absolute" }}>
          <line x1="0" y1="0" x2="87" y2="51" stroke="rgba(204,0,0,0.15)" strokeWidth="1" />
          <line x1="87" y1="0" x2="0" y2="51" stroke="rgba(204,0,0,0.15)" strokeWidth="1" />
        </svg>
      )}
    </div>
  );
}

export function FieldBlock({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div style={{ minWidth: 160, flex: 1 }}>
      <div style={{ fontFamily: FM, fontSize: 11, color: C.red, letterSpacing: "0.08em", marginBottom: 5 }}>{label}</div>
      <div style={{ fontFamily: FM, fontSize: 12, color: muted ? C.muted2 : C.offWhite, lineHeight: "18px", wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}
