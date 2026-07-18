import { useEffect } from "react";

/** Runs `callback` every `delayMs` while mounted — the simple stand-in for a real-time chat subscription. */
export function usePoll(callback: () => void, delayMs: number): void {
  useEffect(() => {
    const id = setInterval(callback, delayMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delayMs]);
}
