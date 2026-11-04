/**
 * Mobii brand mark for the Admin sidebar.
 *
 * Served from the instance's `admin/public/brand/mobii.png` so a deployment can
 * swap the file without recompiling the shell. The light tile behind it is the
 * same ground the previous inlined Endora SVG used (sidebar contrast).
 */
export function BrandLogo({ className, label }: { className?: string; label: string }) {
  return (
    <img
      className={className}
      src="/brand/mobii.png"
      alt={label}
      width={22}
      height={22}
      decoding="async"
    />
  );
}
