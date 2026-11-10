// Adapted from Aceternity UI "Timeline" (ui.aceternity.com): a line that fills as you scroll.
// Restyled to the site palette; heading copy removed.
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'

interface TimelineEntry {
  title: string
  content: ReactNode
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([e]) => setHeight(e.contentRect.height))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start 70%', 'end 60%'] })
  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height])
  const opacityTransform = useTransform(scrollYProgress, [0, 0.05], [0, 1])

  return (
    <div className="w-full" ref={containerRef}>
      <div ref={ref} className="relative">
        {data.map((item, index) => (
          <div key={index} className="flex justify-start pt-8 first:pt-2 md:gap-10 md:pt-14">
            <div className="sticky top-24 z-10 flex max-w-xs flex-col items-center self-start md:w-full md:flex-row lg:max-w-sm">
              <div className="absolute left-1 flex size-8 items-center justify-center rounded-full bg-paper">
                <div className="size-3.5 rounded-full border border-rule bg-tint" />
              </div>
              <h3 className="m-0 hidden text-[26px] leading-8 text-ink-2 md:block md:pl-16">{item.title}</h3>
            </div>
            <div className="relative w-full pl-14 pr-2 md:pl-4">
              <h3 className="m-0 mb-2 block text-[20px] text-ink-2 md:hidden">{item.title}</h3>
              {item.content}
            </div>
          </div>
        ))}
        <div
          style={{ height: `${height}px` }}
          className="absolute left-[19px] top-0 w-[2px] overflow-hidden bg-rule [mask-image:linear-gradient(to_bottom,transparent_0%,black_6%,black_94%,transparent_100%)]"
        >
          <motion.div style={{ height: heightTransform, opacity: opacityTransform }} className="absolute inset-x-0 top-0 w-[2px] bg-accent" />
        </div>
      </div>
    </div>
  )
}
