import type { ReactNode } from "react";
import { domMax, LazyMotion } from "motion/react";

// Currently loading sync because https://github.com/TanStack/router/discussions/2764
export function LazyMotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      {children}
    </LazyMotion>
  );
}
