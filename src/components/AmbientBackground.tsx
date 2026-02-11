import { motion } from "framer-motion";

/**
 * Soft, slowly-drifting gradient orbs behind all screens.
 * Visible enough to make the black feel alive and warm.
 */

const orbs = [
  {
    // Warm amber — top-left drift
    color: "rgba(212, 160, 86, 0.14)",
    size: "55vmax",
    x: ["-15%", "10%", "-5%", "-15%"],
    y: ["-20%", "-5%", "10%", "-20%"],
    duration: 28,
  },
  {
    // Cool slate — bottom-right drift
    color: "rgba(120, 140, 180, 0.08)",
    size: "50vmax",
    x: ["60%", "45%", "70%", "60%"],
    y: ["55%", "70%", "50%", "55%"],
    duration: 34,
  },
  {
    // Warm rose — center drift
    color: "rgba(180, 120, 110, 0.07)",
    size: "45vmax",
    x: ["20%", "40%", "25%", "20%"],
    y: ["30%", "15%", "40%", "30%"],
    duration: 40,
  },
];

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          animate={{
            left: orb.x,
            top: orb.y,
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 65%)`,
            filter: "blur(40px)",
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
