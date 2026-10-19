"use client";

import { useEffect, useRef } from "react";

export function FloatingMenu({ open, onClose, className = "", children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = event => { if (ref.current && !ref.current.contains(event.target)) onClose(); };
    const onKey = event => { if (event.key === "Escape") onClose(); };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  if (!open) return null;
  return <div ref={ref} className={`absolute z-40 rounded-xl border border-border bg-card p-2 shadow-2xl ${className}`}>{children}</div>;
}
