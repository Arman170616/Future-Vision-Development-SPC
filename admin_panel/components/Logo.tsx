import { BASE_PATH } from '@/lib/api';

/** Future Vision Development crescent-and-rocket mark on its light-blue tile — reads well on light and dark backgrounds. */
export default function Logo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line shadow-lg shadow-accent/20 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${BASE_PATH}/logo-tile.svg`} alt="Future Vision Development" width={size} height={size} className="relative h-full w-full object-cover" />
    </span>
  );
}
