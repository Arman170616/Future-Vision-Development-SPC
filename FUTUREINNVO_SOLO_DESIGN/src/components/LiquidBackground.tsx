import { useEffect } from 'react';

/**
 * Site-wide animated backdrop: morphing liquid blobs, a receding
 * perspective grid and a slow scan line. Pure CSS — no canvas, no particles.
 * Also drives the specular highlight on every liquid-glass surface by
 * writing the pointer position into --mx / --my on the hovered glass element.
 */
const LiquidBackground = () => {
  useEffect(() => {
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const target = (e.target as Element | null)?.closest?.('.glass-effect, .glass-effect-strong') as HTMLElement | null;
        if (!target) return;
        const rect = target.getBoundingClientRect();
        target.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        target.style.setProperty('--my', `${e.clientY - rect.top}px`);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="liquid-bg" aria-hidden="true">
      <div className="liquid-blob liquid-blob--1" />
      <div className="liquid-blob liquid-blob--2" />
      <div className="liquid-blob liquid-blob--3" />
      <div className="liquid-blob liquid-blob--4" />
      <div className="liquid-grid" />
      <div className="liquid-scan" />
      <div className="liquid-vignette" />
    </div>
  );
};

export default LiquidBackground;
