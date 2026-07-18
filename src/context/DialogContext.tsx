import {
  createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode,
} from "react";
import { Blueprint } from "@/components/Blueprint";
import { state as tone } from "@/lib/state";

type DialogKind = "alert" | "confirm" | "prompt";

interface DialogOptions {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  defaultValue?: string;
  placeholder?: string;
  /** prompt only — if true (default), the confirm button stays disabled until non-blank text is entered. */
  required?: boolean;
}

interface DialogState extends DialogOptions {
  kind: DialogKind;
  message: string;
}

interface DialogContextValue {
  alert: (message: string, opts?: Pick<DialogOptions, "title" | "confirmLabel">) => Promise<void>;
  confirm: (message: string, opts?: Pick<DialogOptions, "title" | "confirmLabel" | "cancelLabel" | "destructive">) => Promise<boolean>;
  prompt: (message: string, opts?: DialogOptions) => Promise<string | null>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

/**
 * App-styled replacements for window.alert/confirm/prompt — same blueprint
 * card language as the rest of the product, not a browser chrome popup.
 * Mount once near the root; screens call useDialog() instead of the globals.
 */
export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [inputValue, setInputValue] = useState("");
  const resolveRef = useRef<(value: boolean | string | null | void) => void>();
  const inputRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!dialog) return;
    const el = dialog.kind === "prompt" ? inputRef.current : confirmRef.current;
    el?.focus();
    if (dialog.kind === "prompt") inputRef.current?.select();
  }, [dialog]);

  const open = useCallback((kind: DialogKind, message: string, opts?: DialogOptions) => {
    return new Promise<boolean | string | null | void>((resolve) => {
      resolveRef.current = resolve;
      setInputValue(opts?.defaultValue ?? "");
      setDialog({ kind, message, ...opts });
    });
  }, []);

  function settle(value: boolean | string | null | void) {
    resolveRef.current?.(value);
    setDialog(null);
  }

  const value: DialogContextValue = {
    alert: (message, opts) => open("alert", message, opts) as Promise<void>,
    confirm: (message, opts) => open("confirm", message, opts) as Promise<boolean>,
    prompt: (message, opts) => open("prompt", message, opts) as Promise<string | null>,
  };

  const requiredBlocked = dialog?.kind === "prompt" && dialog.required !== false && !inputValue.trim();

  function handlePrimary() {
    if (dialog?.kind === "prompt") settle(inputValue.trim() ? inputValue.trim() : null);
    else if (dialog?.kind === "confirm") settle(true);
    else settle();
  }

  function handleSecondary() {
    if (dialog?.kind === "prompt" || dialog?.kind === "confirm") settle(dialog.kind === "prompt" ? null : false);
  }

  return (
    <DialogContext.Provider value={value}>
      {children}
      {dialog && (
        <div
          role="presentation"
          onKeyDown={(e) => { if (e.key === "Escape") handleSecondary(); }}
          style={{
            position: "fixed", inset: 0, background: "rgba(20, 20, 20, 0.45)",
            display: "grid", placeItems: "center", zIndex: 1000,
          }}
          onMouseDown={(e) => { if (e.target === e.currentTarget && dialog.kind !== "alert") handleSecondary(); }}
        >
          <form
            onSubmit={(e) => { e.preventDefault(); if (!requiredBlocked) handlePrimary(); }}
            style={{ width: 360, maxWidth: "calc(100vw - 32px)" }}
          >
            <Blueprint style={{ padding: "var(--space-5)", background: "var(--color-bg)" }} elev="lg">
              {dialog.title && <h4 style={{ margin: "0 0 8px" }}>{dialog.title}</h4>}
              <p style={{ margin: "0 0 var(--space-4)", fontSize: 13.5, lineHeight: 1.5 }}>{dialog.message}</p>

              {dialog.kind === "prompt" && (
                <input
                  ref={inputRef}
                  className="input"
                  style={{ marginBottom: "var(--space-4)" }}
                  placeholder={dialog.placeholder}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              )}

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                {dialog.kind !== "alert" && (
                  <button type="button" className="btn btn-secondary" onClick={handleSecondary}>
                    {dialog.cancelLabel ?? "Cancel"}
                  </button>
                )}
                <button
                  ref={confirmRef}
                  type="submit"
                  disabled={requiredBlocked}
                  className="btn btn-primary"
                  style={dialog.destructive ? { background: tone.esc.fg, borderColor: tone.esc.fg, opacity: requiredBlocked ? 0.5 : 1 } : { opacity: requiredBlocked ? 0.5 : 1 }}
                >
                  {dialog.confirmLabel ?? (dialog.kind === "alert" ? "OK" : "Confirm")}
                </button>
              </div>
            </Blueprint>
          </form>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within DialogProvider");
  return ctx;
}
