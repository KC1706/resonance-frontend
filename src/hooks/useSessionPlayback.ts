import { useCallback, useEffect, useRef, useState } from "react";
import { SESSION_END } from "@/features/counsellor/liveSession";

export type PlaybackStatus = "empty" | "ready" | "playing" | "paused" | "done";

/**
 * Drives the Live Cockpit's scripted playback. The <audio> element is the
 * master clock (so pause/seek stay in sync with what the room hears); if audio
 * can't play, a synthetic clock takes over so the demo never freezes.
 * Exposes `time` (seconds) — the cockpit renders `deriveState(time)`.
 */
export function useSessionPlayback() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [status, setStatus] = useState<PlaybackStatus>("empty");
  const [time, setTime] = useState(0);
  const [source, setSource] = useState<string | null>(null);

  const rafRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const synthBaseRef = useRef<number | null>(null); // ms; set only when audio can't drive

  timeRef.current = time;

  const stopLoop = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const loop = useCallback(() => {
    const a = audioRef.current;
    let t: number;
    if (synthBaseRef.current !== null) t = (performance.now() - synthBaseRef.current) / 1000;
    else if (a) t = a.currentTime;
    else t = timeRef.current;

    if (t >= SESSION_END) {
      timeRef.current = SESSION_END;
      setTime(SESSION_END);
      setStatus("done");
      a?.pause();
      synthBaseRef.current = null;
      stopLoop();
      return;
    }
    timeRef.current = t;
    setTime(t);
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const load = useCallback((src: string) => {
    stopLoop();
    synthBaseRef.current = null;
    const a = audioRef.current;
    if (a) {
      a.src = src;
      a.currentTime = 0;
    }
    setSource(src);
    setTime(0);
    timeRef.current = 0;
    setStatus("ready");
  }, []);

  const start = useCallback(() => {
    setStatus("playing");
    const a = audioRef.current;
    const resumeFrom = timeRef.current >= SESSION_END ? 0 : timeRef.current;
    if (resumeFrom === 0) timeRef.current = 0;

    const runSynthetic = () => {
      synthBaseRef.current = performance.now() - resumeFrom * 1000;
      stopLoop();
      rafRef.current = requestAnimationFrame(loop);
    };

    if (a && source) {
      a.currentTime = resumeFrom;
      a.play()
        .then(() => {
          synthBaseRef.current = null;
          stopLoop();
          rafRef.current = requestAnimationFrame(loop);
        })
        .catch(runSynthetic); // autoplay blocked / decode error → keep the demo running
    } else {
      runSynthetic();
    }
  }, [loop, source]);

  const pause = useCallback(() => {
    stopLoop();
    audioRef.current?.pause();
    synthBaseRef.current = null; // resume recomputes from timeRef
    setStatus("paused");
  }, []);

  const seek = useCallback((sec: number) => {
    const clamped = Math.max(0, Math.min(SESSION_END, sec));
    const a = audioRef.current;
    if (a) a.currentTime = clamped;
    if (synthBaseRef.current !== null) synthBaseRef.current = performance.now() - clamped * 1000;
    timeRef.current = clamped;
    setTime(clamped);
    setStatus((s) => (s === "done" && clamped < SESSION_END ? "paused" : s));
  }, []);

  const reset = useCallback(() => {
    stopLoop();
    synthBaseRef.current = null;
    const a = audioRef.current;
    if (a) a.pause();
    if (a) a.currentTime = 0;
    setTime(0);
    timeRef.current = 0;
    setStatus(source ? "ready" : "empty");
  }, [source]);

  // If an uploaded file is shorter than the script, keep the timeline running
  // to the end on the synthetic clock rather than freezing at the audio's end.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnded = () => {
      if (timeRef.current < SESSION_END) {
        synthBaseRef.current = performance.now() - timeRef.current * 1000;
        if (rafRef.current === null) rafRef.current = requestAnimationFrame(loop);
      }
    };
    a.addEventListener("ended", onEnded);
    return () => a.removeEventListener("ended", onEnded);
  }, [loop]);

  useEffect(() => () => stopLoop(), []);

  return { audioRef, status, time, source, load, start, pause, reset, seek };
}
