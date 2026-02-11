import { motion } from "framer-motion";

interface EndScreenProps {
  deckColor: string;
  totalPrompts: number;
  onPlayAgain: () => void;
}

export function EndScreen({ deckColor, totalPrompts, onPlayAgain }: EndScreenProps) {
  // Generate all the rings for the bloom effect
  const rings = Array.from({ length: Math.min(totalPrompts, 40) }, (_, i) => ({
    key: i,
    delay: i * 0.04,
    targetScale: 0.2 + (i / totalPrompts) * 2,
  }));

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Bloom — all rings pulse outward together */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {rings.map((ring) => (
          <motion.div
            key={ring.key}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, ring.targetScale, ring.targetScale * 1.05],
              opacity: [0, 0.06, 0.03],
            }}
            transition={{
              duration: 2.5,
              delay: ring.delay,
              ease: "easeOut",
            }}
            className="absolute rounded-full border"
            style={{
              width: "100vmin",
              height: "100vmin",
              borderColor: deckColor,
            }}
          />
        ))}

        {/* Central glow */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
          className="absolute rounded-full"
          style={{
            width: "30vmin",
            height: "30vmin",
            background: `radial-gradient(circle, ${deckColor}15 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="relative z-10 text-center"
      >
        <p className="text-white/40 text-lg font-light mb-12">
          you noticed everything
        </p>

        <button
          onClick={onPlayAgain}
          className="px-10 py-4 rounded-full border transition-all active:scale-[0.96]"
          style={{
            borderColor: deckColor + "40",
            background: `radial-gradient(ellipse at center, ${deckColor}10 0%, transparent 70%)`,
          }}
        >
          <span
            className="text-lg tracking-[0.15em] font-light"
            style={{ color: deckColor }}
          >
            notice again
          </span>
        </button>
      </motion.div>
    </div>
  );
}
