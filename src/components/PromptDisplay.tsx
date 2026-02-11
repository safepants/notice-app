import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PromptDisplayProps {
  prompts: string[];
  deckColor: string;
  onEnd: () => void;
}

/** Haptic tick — tiny 10ms vibration on supported devices */
function haptic() {
  if (navigator.vibrate) navigator.vibrate(10);
}

/** Dynamic text class based on prompt length */
function getTextSize(text: string): string {
  if (text.length > 200) return "text-base";
  if (text.length > 120) return "text-lg";
  return "text-xl";
}

/** Spring transition for buttons */
const springTap = {
  whileTap: { scale: 0.92 },
  transition: { type: "spring" as const, stiffness: 400, damping: 17 },
};

export function PromptDisplay({
  prompts,
  deckColor,
  onEnd,
}: PromptDisplayProps) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const current = prompts[index];
  const isLast = index === prompts.length - 1;

  const textSize = useMemo(() => getTextSize(current ?? ""), [current]);

  // Generate ring data — each visited prompt leaves a ring
  const rings = Array.from({ length: index + 1 }, (_, i) => {
    const ringProgress = (i + 1) / prompts.length;
    return {
      key: i,
      scale: 0.15 + (index - i) * (1.8 / prompts.length),
      opacity: 0.025 + ringProgress * 0.015,
    };
  });

  const advance = useCallback(() => {
    haptic();
    if (isLast) {
      onEnd();
      return;
    }
    setDirection(1);
    setIndex((prev) => prev + 1);
  }, [isLast, onEnd]);

  const goBack = useCallback(() => {
    haptic();
    if (index === 0) {
      setStarted(false);
      return;
    }
    setDirection(-1);
    setIndex((prev) => prev - 1);
  }, [index]);

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
              onClick={() => {
                haptic();
                setStarted(true);
              }}
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
      </div>

      {/* Prompt area — centered, tap to advance */}
      <div
        className="flex-1 flex items-center justify-center px-10 cursor-pointer relative z-10"
        onClick={advance}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.p
            key={index}
            custom={direction}
            initial={{ opacity: 0, y: direction * 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction * -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
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

      {/* Bottom controls */}
      <div className="px-6 pb-10 flex items-center justify-between relative z-10">
        <motion.button
          onClick={goBack}
          className="text-sm font-light text-white/20"
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          back
        </motion.button>

        <motion.button
          onClick={advance}
          className="px-8 py-3 rounded-full border"
          style={{
            borderColor: deckColor + "30",
            background: `radial-gradient(ellipse at center, ${deckColor}08 0%, transparent 70%)`,
          }}
          {...springTap}
        >
          <span
            className="text-base tracking-[0.12em] font-light"
            style={{ color: deckColor + "cc" }}
          >
            notice more
          </span>
        </motion.button>

        <div className="w-8" />
      </div>
    </div>
  );
}
