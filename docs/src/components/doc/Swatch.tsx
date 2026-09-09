export function Swatch({ hex, name, role }: { hex: string; name: string; role: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
      {/* A pale color (Light Grey, Premium White) reads as basically-white
          in dark mode and as basically-blending-into-the-page in light mode
          (the page background here IS Light Grey) - simultaneous contrast,
          same literal color, not a bug (verified: identical computed rgb()
          in both themes). An inset ring on the swatch itself, independent
          of whatever surrounds it, keeps every swatch legible regardless. */}
      <div className="h-20 ring-1 ring-inset ring-black/10" style={{ backgroundColor: hex }} />
      <div className="p-3 bg-white dark:bg-(--premium-dark-grey)">
        <p className="font-heading font-bold text-xs text-gray-900 dark:text-gray-100">{name}</p>
        <p className="text-[11px] text-gray-400 font-mono mt-0.5">{hex}</p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">{role}</p>
      </div>
    </div>
  );
}
