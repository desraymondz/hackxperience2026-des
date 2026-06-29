"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CustomSelect.module.css";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  "aria-label"?: string;
  variant?: "toolbar" | "controls" | "edit";
  className?: string;
}

export default function CustomSelect({
  value,
  options,
  onChange,
  disabled = false,
  "aria-label": ariaLabel,
  variant = "toolbar",
  className,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function onOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => { document.removeEventListener("mousedown", onOutsideClick); };
  }, [isOpen]);

  const current = options.find((o) => o.value === value);
  const isDark = variant === "edit";

  const triggerCls = [
    styles.trigger,
    variant === "toolbar" ? styles.triggerToolbar
      : variant === "controls" ? styles.triggerControls
      : styles.triggerEdit,
    disabled ? styles.triggerDisabled : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={`${styles.wrapper}${className ? ` ${className}` : ""}`} ref={ref}>
      <button
        type="button"
        className={triggerCls}
        onClick={() => { if (!disabled) setIsOpen((o) => !o); }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        disabled={disabled}
      >
        <span>{current?.label ?? value}</span>
        <span className={`${styles.chevron}${isOpen ? ` ${styles.chevronOpen}` : ""}`}>▼</span>
      </button>
      {isOpen && !disabled && (
        <ul
          className={`${styles.menu} ${isDark ? styles.menuDark : styles.menuLight}`}
          role="listbox"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                className={[
                  styles.option,
                  isDark ? styles.optionDark : styles.optionLight,
                  isSelected
                    ? isDark ? styles.optionSelectedDark : styles.optionSelectedLight
                    : "",
                ].filter(Boolean).join(" ")}
                onMouseDown={() => { onChange(opt.value); setIsOpen(false); }}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
