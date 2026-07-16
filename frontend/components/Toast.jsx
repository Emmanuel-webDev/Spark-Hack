"use client";
import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { C } from "../lib/tokens";
import { X, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ message, type = "info", duration = 4000 }) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration);
  }, []);

  const remove = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);

  const ICONS = {
    success: <CheckCircle size={16} />,
    error:   <XCircle size={16} />,
    warn:    <AlertTriangle size={16} />,
    info:    <Info size={16} />,
  };
  const COLORS = {
    success: { bg: "#f0faf5", border: "#b8dfc9", color: "#2d7a50" },
    error:   { bg: "#fdf0f0", border: "#f5c6c3", color: "#8b2a2a" },
    warn:    { bg: "#fdf6e3", border: "#f5d8a0", color: "#8a5a00" },
    info:    { bg: "#f5ebfa", border: "#d4b8e0", color: "#49225B" },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
        zIndex: 9999, display: "flex", flexDirection: "column", gap: 10,
        alignItems: "center", width: "calc(100% - 32px)", maxWidth: 420, pointerEvents: "none",
      }}>
        {toasts.map(t => {
          const col = COLORS[t.type] || COLORS.info;
          return (
            <div key={t.id} style={{
              background: col.bg, border: `1px solid ${col.border}`, color: col.color,
              borderRadius: 10, padding: "12px 16px",
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", boxShadow: "0 4px 16px #49225B22",
              animation: "fadeup 250ms ease",
              pointerEvents: "all",
              fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif",
              fontSize: 13, fontWeight: 500,
            }}>
              {ICONS[t.type]}
              <span style={{ flex: 1 }}>{t.message}</span>
              <button onClick={() => remove(t.id)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: col.color, opacity: 0.6, padding: 2, display: "flex",
              }}>
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}