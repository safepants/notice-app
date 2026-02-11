import { useState } from "react";
import { motion } from "framer-motion";

interface EndScreenProps {
  deckColor: string;
  totalPrompts: number;
  bonusPrompt?: string;
  onPlayAgain: () => void;
}

/** Haptic tick */
function haptic() {
  if (navigator.vibrate) navigator.vibrate(10);
}

export function EndScreen({ deckColor, totalPrompts, bonusPrompt, onPlayAgain }: EndScreenProps) {
  const [showBonus, setShowBonus] = useState(false);

  const rings = Array.from({ length: Math.min(totalPrompts, 40) }, (_, i) => ({
    key: i,
    delay: i * 0.04,
    targetScale: 0.2 + (i / totalPrompts) * 2,
  }));

  const handleShare = async () => {
    haptic();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "notice",
          text: "a game for people who pay attention",
          url: window.location.origin,
        });
      } catch {
        // User cancelled share — that's fine
      }
    }
  };

  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 relative overflow-hidden">
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
        className="relative z-10 text-center flex flex-col items-center"
      >
        <p className="text-white/40 text-lg font-light mb-10">
          you noticed everything
        </p>

        {/* Bonus "one more" prompt */}
        {bonusPrompt && !showBonus && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            onClick={() => {
              haptic();
              setShowBonus(true);
            }}
            className="text-white/20 text-sm font-light tracking-wider mb-8 hover:text-white/35 transition-colors"
          >
            one more?
          </motion.button>
        )}

        {showBonus && bonusPrompt && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-white/60 text-lg font-light leading-relaxed max-w-xs mb-10 italic"
          >
            {bonusPrompt}
          </motion.p>
        )}

        <div className="flex flex-col items-center gap-4">
          <motion.button
            onClick={() => {
              haptic();
              onPlayAgain();
            }}
            className="px-10 py-4 rounded-full border"
            style={{
              borderColor: deckColor + "40",
              background: `radial-gradient(ellipse at center, ${deckColor}10 0%, transparent 70%)`,
            }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <span
              className="text-lg tracking-[0.15em] font-light"
              style={{ color: deckColor }}
            >
              notice again
            </span>
          </motion.button>

          {canShare && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              onClick={handleShare}
              className="text-white/20 text-xs font-light tracking-wider hover:text-white/35 transition-colors mt-2"
              whileTap={{ scale: 0.92 }}
            >
              share notice
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
