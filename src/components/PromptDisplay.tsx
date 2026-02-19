import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { promptHash } from "../utils/promptHash";

type VoteCounts = Record<string, { up: number; down: number }>;

interface PromptDisplayProps {
  prompts: string[];
  deckColor: string;
  onEnd: () => void;
  voteCounts: VoteCounts;
  onVotesChange: (counts: VoteCounts) => void;
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
  voteCounts,
  onVotesChange,
}: PromptDisplayProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [tapFlash, setTapFlash] = useState(false);
  const [showShareHint, setShowShareHint] = useState(false);

  // Voting state
  const [myVotes, setMyVotes] = useState<Record<string, "up" | "down">>(() => {
    try {
      return JSON.parse(localStorage.getItem("notice_votes") || "{}");
    } catch {
      return {};
    }
  });
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const feedbackRef = useRef<HTMLInputElement>(null);

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

  const castVote = useCallback(
    async (dir: "up" | "down") => {
      const text = prompts[index];
      const hash = promptHash(text);

      // Already voted this direction? ignore
      if (myVotes[hash] === dir) return;

      setMyVotes((prev) => {
        const next = { ...prev, [hash]: dir };
        try {
          localStorage.setItem("notice_votes", JSON.stringify(next));
        } catch { /* quota */ }
        return next;
      });

      // Optimistic update
      onVotesChange({
        ...voteCounts,
        [hash]: {
          up: (voteCounts[hash]?.up || 0) + (dir === "up" ? 1 : 0),
          down: (voteCounts[hash]?.down || 0) + (dir === "down" ? 1 : 0),
        },
      });

      if (dir === "down") {
        setShowFeedback(true);
        setTimeout(() => feedbackRef.current?.focus(), 100);
      }

      try {
        await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text, direction: dir }),
        });
      } catch { /* fire and forget */ }
    },
    [index, prompts, myVotes, voteCounts, onVotesChange]
  );

  const submitFeedback = useCallback(async () => {
    const trimmed = feedbackText.trim();
    if (!trimmed) {
      setShowFeedback(false);
      return;
    }

    try {
      await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompts[index],
          direction: "down",
          feedback: trimmed,
        }),
      });
    } catch { /* fire and forget */ }

    setFeedbackText("");
    setShowFeedback(false);
  }, [feedbackText, prompts, index]);

  // Hide feedback when moving to next prompt
  useEffect(() => {
    setShowFeedback(false);
    setFeedbackText("");
  }, [index]);

  const current = prompts[index];
  const isLast = index === prompts.length - 1;
  const progress = (index + 1) / prompts.length;
  const currentHash = useMemo(() => promptHash(current ?? ""), [current]);
  const currentVotes = voteCounts[currentHash];
  const myVote = myVotes[currentHash];

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
        <div className="flex flex-col items-center max-w-md">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.p
              key={index}
              custom={direction}
              initial={{ opacity: 0, scale: 0.94, y: direction * 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: direction * -18 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={`${textSize} font-light leading-relaxed text-center text-white/80`}
            >
              {current}
            </motion.p>
          </AnimatePresence>

          {/* Voting row — chevron style, 44px tap targets per accessibility guidelines */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="flex items-center gap-1 mt-8"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              onClick={() => castVote("down")}
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="w-11 h-11 flex items-center justify-center"
              aria-label="skip this prompt"
            >
              <motion.svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                animate={{
                  stroke: myVote === "down" ? "#d4a056" : "rgba(255,255,255,0.15)",
                  strokeWidth: myVote === "down" ? 2 : 1.25,
                }}
                transition={{ duration: 0.2 }}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 4l4 4 4-4" />
              </motion.svg>
            </motion.button>

            {(currentVotes?.up || 0) > 0 && (
              <motion.span
                key={currentVotes.up}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="text-[10px] font-light tabular-nums min-w-[16px] text-center"
                style={{ color: "rgba(255,255,255,0.12)" }}
              >
                {currentVotes.up}
              </motion.span>
            )}

            <motion.button
              onClick={() => castVote("up")}
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="w-11 h-11 flex items-center justify-center"
              aria-label="like this prompt"
            >
              <motion.svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                animate={{
                  stroke: myVote === "up" ? "#d4a056" : "rgba(255,255,255,0.15)",
                  strokeWidth: myVote === "up" ? 2 : 1.25,
                }}
                transition={{ duration: 0.2 }}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 8l4-4 4 4" />
              </motion.svg>
            </motion.button>
          </motion.div>

          {/* Feedback input — slides in on thumbs down */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-4 w-full max-w-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex gap-2">
                  <input
                    ref={feedbackRef}
                    type="text"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitFeedback();
                      if (e.key === "Escape") setShowFeedback(false);
                    }}
                    placeholder="what would you ask instead?"
                    maxLength={280}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/50 font-light placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                  />
                  <button
                    onClick={submitFeedback}
                    className="text-white/20 text-[10px] font-light tracking-wider hover:text-white/40 transition-colors px-2"
                  >
                    send
                  </button>
                </div>
                <button
                  onClick={() => setShowFeedback(false)}
                  className="text-white/10 text-[10px] font-light tracking-wider mt-1.5 hover:text-white/20 transition-colors"
                >
                  skip
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
