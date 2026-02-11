import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getActiveHoliday, validateCode } from "../utils/holidays";

interface LandingPageProps {
  onUnlock: () => void;
}

const previewPrompts = [
  "Tell someone in the room something you've noticed about them but never said",
  "Everyone close your eyes for 5 seconds. Open. What's the first thing you notice?",
  "What sound can you hear right now that you weren't aware of 5 seconds ago?",
  "If your life had a title right now, what would it be?",
  "What do you think happens when we die?",
];

/* ── Holiday widget: heart ── */
function HeartWidget({ tint }: { tint?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 3.0, duration: 0.8 }}
      className="flex justify-center mb-4"
    >
      <motion.svg
        width="18"
        height="16"
        viewBox="0 0 18 16"
        fill="none"
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        <path
          d="M9 15s-7-4.35-7-8.5C2 3.46 4.01 2 6.5 2 7.82 2 9 2.82 9 2.82S10.18 2 11.5 2C13.99 2 16 3.46 16 6.5 16 10.65 9 15 9 15z"
          fill={tint ?? "rgba(220, 100, 120, 0.35)"}
        />
      </motion.svg>
    </motion.div>
  );
}

export function LandingPage({ onUnlock }: LandingPageProps) {
  const holiday = getActiveHoliday();
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [codeSuccess, setCodeSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showCodeInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCodeInput]);

  const handleBuy = () => {
    window.location.href = "https://buy.stripe.com/aFa4gBamXgi35NcfkOdwc00";
  };

  const handleCodeSubmit = () => {
    const match = validateCode(code);
    if (match) {
      setCodeSuccess(true);
      setCodeError(false);
      // Brief visual confirmation, then unlock
      setTimeout(() => onUnlock(), 600);
    } else {
      setCodeError(true);
      setCode("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCodeSubmit();
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-16 overflow-y-auto">
      <div className="max-w-sm w-full text-center">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl font-light tracking-[0.08em] mb-3"
        >
          notice
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-white/50 text-base font-light tracking-wide mb-14"
        >
          a game for people who are paying attention
        </motion.p>

        {/* Prompt previews — staggered fade */}
        <div className="space-y-6 mb-14">
          {previewPrompts.map((prompt, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 + i * 0.4, duration: 0.8 }}
              className="text-white/35 text-base font-light italic leading-relaxed px-2"
            >
              {prompt}
            </motion.p>
          ))}
        </div>

        {/* Holiday widget */}
        {holiday?.widget === "heart" && (
          <HeartWidget tint={holiday.accentTint} />
        )}

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2, duration: 0.6 }}
          className="flex items-center gap-4 mb-8 px-6"
        >
          <div className="flex-1 h-px bg-white/10" />
          <p className="text-white/25 text-xs tracking-widest uppercase">
            71 notices
          </p>
          <div className="flex-1 h-px bg-white/10" />
        </motion.div>

        {/* Holiday greeting */}
        {holiday && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.4, duration: 0.6 }}
            className="text-white/20 text-xs font-light tracking-widest lowercase mb-5"
          >
            {holiday.greeting}
          </motion.p>
        )}

        {/* Buy button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.6, duration: 0.6 }}
          onClick={handleBuy}
          className="w-full py-4 rounded-2xl text-black font-semibold text-lg tracking-wide transition-all active:scale-[0.97]"
          style={{ backgroundColor: "#d4a056" }}
        >
          get notice — $1.99
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.0, duration: 0.5 }}
          className="text-white/25 text-xs mt-4 font-light"
        >
          one purchase · works offline · play forever
        </motion.p>

        {/* Secret code area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.2, duration: 0.5 }}
          className="mt-6"
        >
          <AnimatePresence mode="wait">
            {!showCodeInput ? (
              <motion.button
                key="trigger"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCodeInput(true)}
                className="text-white/12 text-[10px] font-light tracking-wider hover:text-white/25 transition-colors"
              >
                have a code?
              </motion.button>
            ) : (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-2"
              >
                {codeSuccess ? (
                  <motion.p
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-white/50 text-xs tracking-widest"
                  >
                    ✓
                  </motion.p>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value);
                          setCodeError(false);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="enter code"
                        autoComplete="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 font-light tracking-wider text-center w-36 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                      />
                      <button
                        onClick={handleCodeSubmit}
                        className="text-white/25 text-xs font-light tracking-wider hover:text-white/40 transition-colors px-2 py-2"
                      >
                        →
                      </button>
                    </div>
                    {codeError && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-white/20 text-[10px] font-light"
                      >
                        not quite
                      </motion.p>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.3, duration: 0.5 }}
          className="text-white/10 text-xs mt-8 mb-6 font-light"
        >
          by 8notice9
        </motion.p>
      </div>
    </div>
  );
}
