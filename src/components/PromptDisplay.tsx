import { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";

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
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [tapFlash, setTapFlash] = useState(false);

  // Swipe tracking
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const dragX = useMotionValue(0);

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
    setTimeout(() => setTapFlash(false), 150);
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
    if (index === 0) {
      setStarted(false);
      return;
    }
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
          // Swipe left → advance
          advance();
        } else {
          // Swipe right → go back
          goBack();
        }
      }
      dragX.set(0);
    },
    [advance, goBack, dragX]
  );

  // Intro screen before first prompt
  if (!started) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 relative overflow-hidden">
        {/* Soft central glow behind the content */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: "70vmin",
            height: "70vmin",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${deckColor}0c 0%, ${deckColor}05 35%, transparent 70%)`,
            filter: "blur(30px)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-white/30 text-lg font-light text-center leading-relaxed mb-8"
          >
            we encourage you to notice
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col items-center"
          >
            <motion.button
              onClick={() => setStarted(true)}
              className="relative px-10 py-4 rounded-full border"
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
                notice something
              </span>
            </motion.button>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="text-white/15 text-xs font-light mt-4 tracking-wide"
            >
              tap to begin
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

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
          animate={{ opacity: progress * 0.12 }}
          transition={{ duration: 1.5 }}
          className="absolute rounded-full"
          style={{
            width: "120vmin",
            height: "120vmin",
            background: `radial-gradient(circle, ${deckColor}18 0%, transparent 60%)`,
          }}
        />
      </div>

      {/* Tap flash — brief subtle pulse on interaction */}
      <AnimatePresence>
        {tapFlash && (
          <motion.div
            initial={{ opacity: 0.08 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-[5] pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${deckColor}15 0%, transparent 60%)`,
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
            initial={{ opacity: 0, scale: 0.97, y: direction * 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: direction * -12 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`${textSize} font-light leading-relaxed text-center text-white/80 max-w-md`}
          >
            {current}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Watermark — faint branding for screenshots */}
      <div className="absolute bottom-24 left-0 right-0 flex justify-center pointer-events-none z-10">
        <p className="text-white/[0.06] text-xs tracking-[0.2em] font-light">
          notice
        </p>
      </div>

      {/* Thin progress line at very bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] z-10">
        <motion.div
          className="h-full"
          style={{ backgroundColor: deckColor + "20" }}
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
