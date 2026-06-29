"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export const BRUTAL_EASE = [0.16, 1, 0.3, 1] as const;

export const revealItemVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: BRUTAL_EASE },
  },
};

interface RevealStaggerProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}

export function RevealStagger({
  children,
  className,
  stagger = 0.08,
  delay = 0,
}: RevealStaggerProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

interface RevealItemProps {
  children: React.ReactNode;
  className?: string;
}

export function RevealItem({ children, className }: RevealItemProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={revealItemVariants}
    >
      {children}
    </motion.div>
  );
}

type HoverLiftProps = {
  children: React.ReactNode;
  className?: string;
  lift?: number;
  style?: React.CSSProperties;
};

/** Brutalist card lift on hover — springy, not floaty. */
export function HoverLift({
  children,
  className,
  lift = -6,
  style,
}: HoverLiftProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      whileHover={{ y: lift, scale: 1.015 }}
      whileTap={{ y: 0, scale: 0.995 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
    >
      {children}
    </motion.div>
  );
}

interface HoverScaleProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
}

export function HoverScale({ children, className, scale = 1.04 }: HoverScaleProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      transition={{ type: "spring", stiffness: 380, damping: 18 }}
    >
      {children}
    </motion.div>
  );
}
