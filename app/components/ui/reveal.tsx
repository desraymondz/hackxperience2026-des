"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BRUTAL_EASE } from "./motion-ui";

interface RevealProps {
  children: React.ReactNode;
  /** Optional stagger delay in seconds. */
  delay?: number;
  className?: string;
  /** Vertical travel in px */
  y?: number;
  /** Subtle scale from value → 1 */
  scale?: number;
}

/**
 * Scroll-into-view reveal. Children fade and rise into place the first time
 * they enter the viewport. Honours `prefers-reduced-motion`.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
  y = 36,
  scale = 0.97,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, scale }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.65, ease: BRUTAL_EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
