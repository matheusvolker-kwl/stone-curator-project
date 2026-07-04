import { useLocation } from "react-router-dom";
import { type ReactNode } from "react";
export default function RouteTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return <>{children}</>;
  return <div key={pathname} className="motion-safe:animate-fade-in">{children}</div>;
}
