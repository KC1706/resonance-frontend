import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The blueprint frame every card/figure/primary-panel wears in this system:
 * a square, hairline-bordered box with "+" registration marks at the corners.
 * Renders the four <i class="corner …"> children so screens don't repeat them.
 */
export function Blueprint({
  children,
  className,
  style,
  elev,
  ...props
}: HTMLAttributes<HTMLDivElement> & { elev?: "sm" | "md" | "lg" }) {
  return (
    <div className={cn("blueprint", elev && `elev-${elev}`, className)} style={style} {...props}>
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
      {children}
    </div>
  );
}

/** Small uppercase steel kicker used above titles across the prototype. */
export function Kicker({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="card-kicker" style={{ margin: 0, ...style }}>
      {children}
    </div>
  );
}

/** A coloured tag. Pass explicit background/color for state tags. */
export function Tag({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={cn("tag", className)} style={style}>
      {children}
    </span>
  );
}

/** The recurring four-up metric tile (Home, oversight, commercial…). */
export function StatCard({
  label,
  value,
  sub,
  color,
  onClick,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  color?: string;
  onClick?: () => void;
}) {
  return (
    <Blueprint
      style={{ padding: "var(--space-4)", cursor: onClick ? "pointer" : undefined }}
      onClick={onClick}
    >
      <div
        className="text-muted"
        style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em" }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: 34,
          lineHeight: 1,
          marginTop: 6,
          color: color ?? "var(--color-text)",
        }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-muted" style={{ fontSize: 11, marginTop: 3 }}>
          {sub}
        </div>
      )}
    </Blueprint>
  );
}
