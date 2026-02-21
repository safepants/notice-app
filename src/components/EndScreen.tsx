import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [copied, setCopied] = useState(false);

  const rings = Array.from({ length: Math.min(totalPrompts, 40) }, (_, i) => ({
    key: i,
    delay: i * 0.04,
    targetScale: 0.2 + (i / totalPrompts) * 2,
  }));

  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  const handleShare = async () => {
    haptic();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "notice",
          text: `I just noticed ${totalPrompts} things. your turn.`,
          url: "https://playnotice.com",
        });
      } catch {
        // User cancelled share — that's fine
      }
    }
  };

  const handleGift = async () => {
    haptic();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "notice",
          text: "it's free. thought of you.",
          url: "https://playnotice.com",
        });
      } catch {
        // User cancelled
      }
    } else {
      // Desktop fallback — copy link
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    haptic();
    try {
      await navigator.clipboard.writeText("https://playnotice.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

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
          {/* Play again — primary action */}
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

          {/* Share — prominent, styled button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            onClick={canShare ? handleShare : handleCopyLink}
            className="px-8 py-3 rounded-full border border-white/15 hover:border-white/25 transition-colors mt-1"
            whileTap={{ scale: 0.92 }}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span
                  key="copied"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-white/40 text-sm font-light tracking-wider"
                >
                  copied ✓
                </motion.span>
              ) : (
                <motion.span
                  key="share"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-white/35 text-sm font-light tracking-wider"
                >
                  share notice
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Gift prompt */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            onClick={handleGift}
            className="text-white/15 text-[11px] font-light tracking-wider hover:text-white/30 transition-colors mt-1"
            whileTap={{ scale: 0.95 }}
          >
            it's free. send it to someone you'd want to play with.
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
