"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Rocket } from "lucide-react"
import { useRouter } from "next/navigation"
import confetti from "canvas-confetti"
import { useSettings } from "@/lib/hooks/use-settings"

// Brand palette (kept inline per project convention — see CLAUDE.md)
const RED = "#c00000"
const DARK_RED = "#A20000"
const DARK_TEXT = "#1d1c17"
const OFF_WHITE = "#fef9f1"
const CREAM_BG = "#f2ede5"

interface SubmitProjectButtonProps {
  /** Where the button navigates to. Defaults to the submission page. */
  href?: string
}

/**
 * Floating, brutalist "Submit Project" CTA.
 *
 * Collapsed it's a 64px red square with a rocket; on hover it expands to reveal
 * a monospace "SUBMIT // PROJECT" label. Clicking fires a celebratory confetti
 * burst, then routes to the submission page — a joyful "submissions are open"
 * signal that follows the user down the page.
 */
export default function SubmitProjectButton({
  href = "/submit",
}: SubmitProjectButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const router = useRouter()

  // Submissions must be open before the CTA appears. Both flags from the
  // `settings` table have to be TRUE; the hook live-subscribes to changes, so
  // toggling them in Supabase shows/hides the button in real time.
  const { settings, loading } = useSettings()
  const submissionsOpen =
    settings.submission_status && settings.resubmission_status

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()

    // Burst from the button's corner of the screen.
    confetti({
      particleCount: 90,
      spread: 75,
      startVelocity: 45,
      origin: { x: 0.92, y: 0.92 },
      angle: 110,
      colors: [RED, DARK_RED, OFF_WHITE, CREAM_BG],
      disableForReducedMotion: true,
    })

    // Let the confetti breathe for a beat before navigating.
    window.setTimeout(() => router.push(href), 550)
  }

  // Hide entirely until settings load and confirm submissions are open.
  if (loading || !submissionsOpen) return null

  return (
    <div className="relative">
      <a href={href} onClick={handleClick} aria-label="Submit your project">
        <motion.div
          initial={{ width: 64 }}
          animate={{
            width: isHovered ? 318 : 64,
            backgroundColor: isHovered ? DARK_RED : RED,
          }}
          whileTap={{ x: 4, y: 4, boxShadow: `0px 0px 0px ${DARK_TEXT}` }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="relative flex h-16 items-center justify-center overflow-hidden border-2 cursor-pointer"
          style={{
            borderColor: DARK_TEXT,
            boxShadow: `5px 5px 0px ${DARK_TEXT}`,
          }}
        >
          {/* Rocket — collapses to a perfectly centred icon, sits left of the
              label once expanded */}
          <div className="flex h-16 w-9 shrink-0 items-center justify-center">
            <motion.div
              animate={{ rotate: isHovered ? -12 : 0, y: isHovered ? -2 : 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <Rocket size={26} strokeWidth={2.5} color={OFF_WHITE} />
            </motion.div>
          </div>

          {/* Label — width collapses to 0 so the rocket stays dead-centre when
              closed; the group is centred together once expanded */}
          <motion.div
            animate={{ width: isHovered ? 210 : 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <motion.span
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -8 }}
              transition={{ duration: 0.2, delay: isHovered ? 0.08 : 0 }}
              className="block whitespace-nowrap pl-3 pr-1 font-mono text-sm font-bold uppercase tracking-wider"
              style={{ color: OFF_WHITE }}
            >
              Submit{" "}
              <span style={{ opacity: 0.55 }}>{"//"}</span> Project
            </motion.span>
          </motion.div>
        </motion.div>
      </a>

      {/* "Submissions open" live pulse */}
      <span className="pointer-events-none absolute -top-1.5 -right-1.5 flex h-4 w-4">
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full"
          style={{ backgroundColor: OFF_WHITE }}
          animate={{ scale: [1, 1.9], opacity: [0.7, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
        />
        <span
          className="relative inline-flex h-4 w-4 rounded-full border-2"
          style={{ backgroundColor: RED, borderColor: OFF_WHITE }}
        />
      </span>
    </div>
  )
}
