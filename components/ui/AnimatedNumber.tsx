'use client'

import { useEffect } from 'react'
import { useMotionValue, useTransform, animate, motion, useReducedMotion } from 'framer-motion'

interface Props {
  value: number
  format: (n: number) => string
  className?: string
  duration?: number
}

/** Smoothly counts from its previous value to `value` and renders via `format`. */
export default function AnimatedNumber({ value, format, className, duration = 1.1 }: Props) {
  const reduce = useReducedMotion()
  const mv = useMotionValue(value)
  const text = useTransform(mv, latest => format(latest))

  useEffect(() => {
    if (reduce) {
      mv.set(value)
      return
    }
    const controls = animate(mv, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    })
    return controls.stop
  }, [value, duration, reduce, mv])

  return <motion.span className={className}>{text}</motion.span>
}
