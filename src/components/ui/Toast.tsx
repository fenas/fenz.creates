"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "success", description?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, description, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-[12px] bg-[var(--surface-elevated)] border border-[var(--border)] shadow-[0_12px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] text-[var(--text-primary)] animate-in fade-in slide-in-from-bottom-3 duration-200"
          >
            <div className="mt-0.5 flex-shrink-0">
              {toast.type === "success" && (
                <CheckCircle2 className="w-4 h-4 text-[var(--accent)] stroke-[2]" />
              )}
              {toast.type === "error" && (
                <AlertCircle className="w-4 h-4 text-rose-500 stroke-[1.75]" />
              )}
              {toast.type === "info" && (
                <Info className="w-4 h-4 text-[var(--text-secondary)] stroke-[1.75]" />
              )}
            </div>
            <div className="flex-1 text-xs">
              <div className="font-medium text-[var(--text-primary)]">{toast.message}</div>
              {toast.description && (
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-2">
                  {toast.description}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-[6px] transition-colors"
            >
              <X className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
