"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUp } from "lucide-react"

// Brand palette (kept inline per project convention — see CLAUDE.md)
const RED = "#c00000"
const DARK_RED = "#A20000"
const DARK_TEXT = "#1d1c17"
const OFF_WHITE = "#fef9f1"

/**
 * Brutalist "back to top" button. Fades in once the user scrolls past the fold
 * and smooth-scrolls to the top of the page. Designed to sit at the bottom of
 * the floating action stack (below the Submit Project CTA).
 */
export default function ScrollToTopButton() {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1, backgroundColor: RED }}
          exit={{ opacity: 0, scale: 0.6 }}
          whileHover={{ backgroundColor: DARK_RED }}
          whileTap={{ x: 4, y: 4, boxShadow: `0px 0px 0px ${DARK_TEXT}` }}
          transition={{ duration: 0.2 }}
          className="flex h-14 w-14 items-center justify-center border-2 cursor-pointer"
          style={{
            borderColor: DARK_TEXT,
            boxShadow: `5px 5px 0px ${DARK_TEXT}`,
          }}
        >
          <ArrowUp size={24} strokeWidth={2.75} color={OFF_WHITE} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
