import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PromptDisplayProps {
  prompts: string[];
  deckColor: string;
  onEnd: () => void;
}

/** Dynamic text class based on prompt length */
function getTextSize(text: string): string {
  if (text.length > 200) return "text-base";
  if (text.length > 120) return "text-lg";
  return "text-xl";
}

export function PromptDisplay({
  prompts,
  deckColor,
  onEnd,
}: PromptDisplayProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [tapFlash, setTapFlash] = useState(false);
  const [showShareHint, setShowShareHint] = useState(false);

  // Swipe tracking
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const shareTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Show share hint every 15th prompt (index 14, 29, 44, etc.)
  useEffect(() => {
    if ((index + 1) % 15 === 0 && index > 0) {
      setShowShareHint(true);
      shareTimerRef.current = setTimeout(() => setShowShareHint(false), 3500);
    } else {
      setShowShareHint(false);
    }
    return () => {
      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
    };
  }, [index]);

  const handleSharePrompt = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareHint(false);
    if (navigator.share) {
      try {
        await navigator.share({
          title: "notice",
          text: `"${current}" — from notice, a game for people paying attention`,
          url: "https://playnotice.com",
        });
      } catch {
        // User cancelled
      }
    } else {
      // Desktop: copy the prompt + link
      try {
        await navigator.clipboard.writeText(
          `"${current}" — from notice → playnotice.com`
        );
      } catch {
        // Clipboard unavailable
      }
    }
  };

  const current = prompts[index];
  const isLast = index === prompts.length - 1;
  const progress = (index + 1) / prompts.length;

  const textSize = useMemo(() => getTextSize(current ?? ""), [current]);

  // Generate ring data — each visited prompt leaves a ring
  const rings = Array.from({ length: Math.min(index + 1, 50) }, (_, i) => {
    const ringProgress = (i + 1) / prompts.length;
    return {
      key: i,
      scale: 0.15 + (index - i) * (1.8 / prompts.length),
      opacity: 0.025 + ringProgress * 0.015,
    };
  });

  // Brief visual pulse on tap
  const flashPulse = useCallback(() => {
    setTapFlash(true);
    setTimeout(() => setTapFlash(false), 200);
  }, []);

  const advance = useCallback(() => {
    flashPulse();
    if (isLast) {
      onEnd();
      return;
    }
    setDirection(1);
    setIndex((prev) => prev + 1);
  }, [isLast, onEnd, flashPulse]);

  const goBack = useCallback(() => {
    if (index === 0) return;
    flashPulse();
    setDirection(-1);
    setIndex((prev) => prev - 1);
  }, [index, flashPulse]);

  // Swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Only count horizontal swipes (not vertical scrolls)
      if (absDx > 50 && absDx > absDy * 1.5) {
        if (dx < 0) {
          advance();
        } else {
          goBack();
        }
      }
    },
    [advance, goBack]
  );

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Background rings — accumulate with each prompt */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {rings.map((ring) => (
          <motion.div
            key={ring.key}
            initial={{ scale: 0.1, opacity: 0 }}
            animate={{ scale: ring.scale, opacity: ring.opacity }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute rounded-full border"
            style={{
              width: "100vmin",
              height: "100vmin",
              borderColor: deckColor,
            }}
          />
        ))}

        {/* Ambient warmth that builds with progression */}
        <motion.div
          animate={{ opacity: progress * 0.35 }}
          transition={{ duration: 1.5 }}
          className="absolute rounded-full"
          style={{
            width: "120vmin",
            height: "120vmin",
            background: `radial-gradient(circle, ${deckColor}30 0%, transparent 60%)`,
          }}
        />
      </div>

      {/* Tap flash — visible warm pulse on interaction */}
      <AnimatePresence>
        {tapFlash && (
          <motion.div
            initial={{ opacity: 0.20 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 z-[5] pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${deckColor}30 0%, transparent 60%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Prompt area — tap or swipe to navigate */}
      <div
        className="flex-1 flex items-center justify-center px-10 cursor-pointer relative z-10"
        onClick={advance}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.p
            key={index}
            custom={direction}
            initial={{ opacity: 0, scale: 0.94, y: direction * 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: direction * -18 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`${textSize} font-light leading-relaxed text-center text-white/80 max-w-md`}
          >
            {current}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Share hint — appears every 15th prompt, auto-fades */}
      <AnimatePresence>
        {showShareHint && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-28 left-0 right-0 flex justify-center z-20"
          >
            <button
              onClick={handleSharePrompt}
              className="text-white/15 text-[11px] font-light tracking-wider hover:text-white/30 transition-colors px-4 py-2"
            >
              share this one?
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Watermark — faint branding for screenshots */}
      <div className="absolute bottom-24 left-0 right-0 flex justify-center pointer-events-none z-10">
        <p className="text-white/[0.06] text-xs tracking-[0.2em] font-light">
          notice
        </p>
      </div>

      {/* Progress line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] z-10">
        <motion.div
          className="h-full"
          style={{ backgroundColor: deckColor + "50" }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Bottom controls */}
      <div className="px-6 pb-8 flex items-center justify-between relative z-10">
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            goBack();
          }}
          className="text-sm font-light text-white/20 py-2 px-3"
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          back
        </motion.button>

        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            advance();
          }}
          className="px-8 py-3 rounded-full border"
          style={{
            borderColor: deckColor + "30",
            background: `radial-gradient(ellipse at center, ${deckColor}08 0%, transparent 70%)`,
          }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <span
            className="text-base tracking-[0.12em] font-light"
            style={{ color: deckColor + "cc" }}
          >
            notice more
          </span>
        </motion.button>

        <div className="w-12" />
      </div>
    </div>
  );
}
