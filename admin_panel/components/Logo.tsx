import { BASE_PATH } from '@/lib/api';

/** FutureInnvo network mark (brand gradient) on a white tile — reads well on light and dark backgrounds. */
export default function Logo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line bg-white shadow-lg shadow-accent/20 ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-0 opacity-60" style={{ background: 'radial-gradient(circle at 75% 20%, rgb(var(--accent) / 0.25), transparent 60%)' }} aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${BASE_PATH}/logo-mark.svg`} alt="FutureInnvo" width={size} height={size} className="relative h-full w-full scale-[1.1] object-contain" />
    </span>
  );
}
