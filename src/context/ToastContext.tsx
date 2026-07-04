"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// Global bridge: fire a toast from outside React tree (e.g., ShopContext, utils)
export function fireToast(message: string, type: ToastType = "info", duration = 4000) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("app:toast", { detail: { message, type, duration } })
  );
}

const styles: Record<ToastType, { border: string; icon: string }> = {
  success: { border: "border-l-emerald-500", icon: "text-emerald-500" },
  error:   { border: "border-l-red-500",     icon: "text-red-500"     },
  warning: { border: "border-l-amber-500",   icon: "text-amber-500"   },
  info:    { border: "border-l-[#3D2FB3]",   icon: "text-[#3D2FB3]"   },
};

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 flex-shrink-0" />,
  error:   <XCircle     className="h-5 w-5 flex-shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 flex-shrink-0" />,
  info:    <Info        className="h-5 w-5 flex-shrink-0" />,
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const s = styles[toast.type];
  return (
    <div
      className={`
        flex items-start gap-3 rounded-2xl bg-white
        border border-gray-100 border-l-4 ${s.border}
        px-4 py-3.5 shadow-xl shadow-black/10
        min-w-[280px] max-w-[400px] pointer-events-auto
        animate-[slideInRight_0.3s_ease_forwards]
      `}
    >
      <span className={`mt-0.5 ${s.icon}`}>{icons[toast.type]}</span>
      <p className="flex-1 text-[13.5px] font-medium leading-snug text-gray-800">
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) { clearTimeout(timer); timersRef.current.delete(id); }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev.slice(-4), { id, type, message, duration }]);
      const timer = setTimeout(() => dismiss(id), duration);
      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  // Listen for global bridge events (used by ShopContext or other non-React contexts)
  useEffect(() => {
    const handler = (e: Event) => {
      const { message, type, duration } = (e as CustomEvent).detail;
      addToast(message, type, duration);
    };
    window.addEventListener("app:toast", handler);
    return () => window.removeEventListener("app:toast", handler);
  }, [addToast]);

  const toast   = useCallback((m: string, t?: ToastType, d?: number) => addToast(m, t, d), [addToast]);
  const success = useCallback((m: string, d?: number) => addToast(m, "success", d), [addToast]);
  const error   = useCallback((m: string, d?: number) => addToast(m, "error",   d), [addToast]);
  const warning = useCallback((m: string, d?: number) => addToast(m, "warning", d), [addToast]);
  const info    = useCallback((m: string, d?: number) => addToast(m, "info",    d), [addToast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
