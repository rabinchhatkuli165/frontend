import { useRef, useCallback, useEffect } from "react";

// Lightweight synthesized arcade SFX using the Web Audio API.
// No external mp3s needed for blips/clicks — only bg music uses a file.
export default function useSound() {
  const ctxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const blip = useCallback(
    ({ freq = 440, duration = 0.08, type = "sine", volume = 0.05, glide } = {}) => {
      try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        if (glide) {
          osc.frequency.exponentialRampToValueAtTime(glide, ctx.currentTime + duration);
        }
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (e) {
        /* audio not available — fail silently */
      }
    },
    [getCtx]
  );

  const hover = useCallback(() => blip({ freq: 720, glide: 900, duration: 0.05, type: "triangle", volume: 0.035 }), [blip]);
  const click = useCallback(() => blip({ freq: 220, glide: 60, duration: 0.16, type: "square", volume: 0.06 }), [blip]);
  const success = useCallback(() => {
    blip({ freq: 523, duration: 0.09, type: "sine", volume: 0.05 });
    setTimeout(() => blip({ freq: 784, duration: 0.14, type: "sine", volume: 0.05 }), 90);
  }, [blip]);

  useEffect(() => () => ctxRef.current?.close?.(), []);

  return { hover, click, success };
}