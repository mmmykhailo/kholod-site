import { cn } from "~/lib/utils";

type GridBackgroundProps = {
  gridSize?: number;
  offset?: number;
  className?: string;
};

export default function GridBackground({
  gridSize = 160,
  offset = 20,
  className,
}: GridBackgroundProps) {
  return (
    <div
      className={cn(
        "absolute inset-y-0 left-1/2 -translate-x-1/2 w-screen -z-10 opacity-50 border-t border-b border-slate-400",
        "before:bg-slate-100 before:content-[''] before:absolute before:inset-0 before:opacity-30",
        className,
      )}
      style={{
        backgroundImage: `
          linear-gradient(to right, rgb(0 0 0 / 0.15) 1px, transparent 1px),
          linear-gradient(to bottom, rgb(0 0 0 / 0.15) 1px, transparent 1px)
        `,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${offset}px ${offset}px`,
      }}
    />
  );
}
