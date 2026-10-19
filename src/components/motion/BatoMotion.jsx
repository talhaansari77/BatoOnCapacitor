import React, { forwardRef } from "react";
import { motion as framerMotion, useReducedMotion } from "framer-motion";

// Shared customer motion: retain final values, skip JS-driven entrances,
// progress animations, gestures and exits when the customer requests less motion.
const components = new Map();
export const motion = new Proxy({}, {
  get(_target, tag) {
    if (!components.has(tag)) {
      const Component = framerMotion[tag];
      const ReducedAwareMotion = forwardRef(function BatoMotion(props, ref) {
        const reduce = useReducedMotion();
        const transition = reduce
          ? { type: "tween", duration: 0, delay: 0 }
          : { duration: 0.22, ...props.transition,
              ...(typeof props.transition?.duration === "number" ? { duration: Math.min(props.transition.duration, 0.25) } : {}),
              ...(typeof props.transition?.delay === "number" ? { delay: Math.min(props.transition.delay, 0.1) } : {}) };
        return <Component {...props} ref={ref} transition={transition}
          initial={reduce ? false : props.initial}
          whileHover={reduce ? undefined : props.whileHover}
          whileTap={reduce ? undefined : props.whileTap}
          layout={reduce ? false : props.layout} />;
      });
      components.set(tag, ReducedAwareMotion);
    }
    return components.get(tag);
  }
});
export const useBatoReducedMotion = useReducedMotion;
export function BatoReveal({ children, delay = 0, y = 10, className }) {
  return <motion.div className={className} initial={{ opacity: 0, y }}
    animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay }}>{children}</motion.div>;
}
