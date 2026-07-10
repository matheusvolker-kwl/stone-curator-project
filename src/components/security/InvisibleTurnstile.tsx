import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

// Turnstile invisible/managed. Runs automatically in the background.
// Never blocks the form: if the widget fails to render or a token doesn't
// arrive within `timeoutMs`, getToken() resolves to null and the caller
// falls back to the honeypot + server-side validation.

const TURNSTILE_SITE_KEY = "0x4AAAAAADvqfB5u6x5egdiF";
const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface InvisibleTurnstileAPI {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      "timeout-callback"?: () => void;
      size?: string;
      appearance?: string;
      execution?: string;
      theme?: string;
      retry?: string;
    },
  ) => string;
  execute: (widgetId: string) => void;
  remove: (widgetId: string) => void;
  reset: (widgetId?: string) => void;
  getResponse?: (widgetId?: string) => string | undefined;
}

function ts(): InvisibleTurnstileAPI | undefined {
  return typeof window === "undefined"
    ? undefined
    : (window as unknown as { turnstile?: InvisibleTurnstileAPI }).turnstile;
}


let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("turnstile script failed")));
      return;
    }
    const s = document.createElement("script");
    s.src = TURNSTILE_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("turnstile script failed"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export interface InvisibleTurnstileHandle {
  /** Resolves with a token or null if unavailable within timeoutMs. Never rejects. */
  getToken: (timeoutMs?: number) => Promise<string | null>;
}

const InvisibleTurnstile = forwardRef<InvisibleTurnstileHandle>((_props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const pendingRef = useRef<((token: string | null) => void) | null>(null);
  const readyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadTurnstileScript()
      .then(() => {
        if (cancelled || !hostRef.current || !window.turnstile) return;
        try {
          widgetIdRef.current = window.turnstile.render(hostRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            size: "invisible",
            appearance: "interaction-only",
            execution: "execute",
            retry: "auto",
            callback: (token: string) => {
              const resolve = pendingRef.current;
              pendingRef.current = null;
              resolve?.(token);
            },
            "error-callback": () => {
              const resolve = pendingRef.current;
              pendingRef.current = null;
              resolve?.(null);
            },
            "expired-callback": () => {
              // token expired between issuance and use — treat as unavailable
            },
            "timeout-callback": () => {
              const resolve = pendingRef.current;
              pendingRef.current = null;
              resolve?.(null);
            },
          });
          readyRef.current = true;
        } catch (e) {
          console.warn("turnstile render failed", e);
        }
      })
      .catch((err) => console.warn("Turnstile load failed", err));

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch { /* noop */ }
        widgetIdRef.current = null;
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    getToken: (timeoutMs = 3500) =>
      new Promise<string | null>((resolve) => {
        // If widget never mounted, fall back immediately after the timeout.
        if (!readyRef.current || !widgetIdRef.current || !window.turnstile) {
          const start = Date.now();
          const poll = () => {
            if (readyRef.current && widgetIdRef.current && window.turnstile) {
              startExecute();
            } else if (Date.now() - start >= timeoutMs) {
              resolve(null);
            } else {
              window.setTimeout(poll, 120);
            }
          };
          poll();
          return;
        }
        startExecute();

        function startExecute() {
          const wid = widgetIdRef.current!;
          try {
            window.turnstile!.reset(wid);
          } catch { /* noop */ }
          pendingRef.current = resolve;
          try {
            window.turnstile!.execute(wid);
          } catch {
            pendingRef.current = null;
            resolve(null);
            return;
          }
          window.setTimeout(() => {
            if (pendingRef.current === resolve) {
              pendingRef.current = null;
              resolve(null);
            }
          }, timeoutMs);
        }
      }),
  }), []);

  // Reserve zero visible space — invisible widget mounts in-place.
  return <div ref={hostRef} aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} />;
});

InvisibleTurnstile.displayName = "InvisibleTurnstile";

export default InvisibleTurnstile;
