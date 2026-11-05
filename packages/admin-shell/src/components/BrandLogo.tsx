/**
 * Mobii brand mark for the Admin sidebar.
 *
 * Served from `admin/public/brand/mobii.png`. The PNG already fills a square
 * tile, so the sidebar host must not add padding or a light ground around it.
 */
export function BrandLogo({ className, label }: { className?: string; label: string }) {
  return (
    <img
      className={className}
      src="/brand/mobii.png"
      alt={label}
      width={28}
      height={28}
      decoding="async"
    />
  );
}
