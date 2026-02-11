import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getActiveHoliday, validateCode } from "../utils/holidays";
import promptData from "../data/prompts.json";

const TOTAL_PROMPTS = promptData.decks.reduce((sum, d) => sum + d.prompts.length, 0);

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
      transition={{ delay: 1.2, duration: 0.5 }}
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
        {/* Title — fast fade in */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-6xl font-light tracking-[0.08em] mb-3"
        >
          notice
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-white/50 text-base font-light tracking-wide mb-14"
        >
          a game for people who are paying attention
        </motion.p>

        {/* Prompt previews — fast stagger */}
        <div className="space-y-6 mb-14">
          {previewPrompts.map((prompt, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
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
          transition={{ delay: 1.3, duration: 0.4 }}
          className="flex items-center gap-4 mb-8 px-6"
        >
          <div className="flex-1 h-px bg-white/10" />
          <p className="text-white/25 text-xs tracking-widest flex items-center gap-1.5">
            {TOTAL_PROMPTS}
            <svg width="10" height="9" viewBox="0 0 18 16" fill="none" className="opacity-60">
              <path
                d="M9 15s-7-4.35-7-8.5C2 3.46 4.01 2 6.5 2 7.82 2 9 2.82 9 2.82S10.18 2 11.5 2C13.99 2 16 3.46 16 6.5 16 10.65 9 15 9 15z"
                fill="currentColor"
              />
            </svg>
          </p>
          <div className="flex-1 h-px bg-white/10" />
        </motion.div>

        {/* Holiday greeting */}
        {holiday && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.4 }}
            className="text-white/20 text-xs font-light tracking-widest lowercase mb-5"
          >
            {holiday.greeting}
          </motion.p>
        )}

        {/* Buy button */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.4 }}
          onClick={handleBuy}
          className="w-full py-4 rounded-2xl text-black font-semibold text-lg tracking-wide transition-all active:scale-[0.97]"
          style={{ backgroundColor: "#d4a056" }}
        >
          get notice — $1.99
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 0.4 }}
          className="text-white/25 text-xs mt-4 font-light"
        >
          one purchase · works offline · play forever
        </motion.p>

        {/* Secret code area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.4 }}
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.9, duration: 0.4 }}
          className="mt-8 mb-6 flex flex-col items-center gap-3"
        >
          <a
            href="https://www.tiktok.com/@8notice9"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/10 text-xs font-light hover:text-white/20 transition-colors"
          >
            by 8notice9
          </a>
          <div className="flex items-center gap-5">
            {/* TikTok */}
            <a href="https://www.tiktok.com/@8notice9" target="_blank" rel="noopener noreferrer" className="text-white/10 hover:text-white/25 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z"/>
              </svg>
            </a>
            {/* YouTube */}
            <a href="https://www.youtube.com/@8notice9" target="_blank" rel="noopener noreferrer" className="text-white/10 hover:text-white/25 transition-colors">
              <svg width="16" height="14" viewBox="0 0 24 18" fill="currentColor">
                <path d="M23.5 2.84A3.01 3.01 0 0 0 21.38.7C19.52.18 12 .18 12 .18s-7.52 0-9.38.52A3.01 3.01 0 0 0 .5 2.84 31.6 31.6 0 0 0 0 9a31.6 31.6 0 0 0 .5 6.16 3.01 3.01 0 0 0 2.12 2.14C4.48 17.82 12 17.82 12 17.82s7.52 0 9.38-.52a3.01 3.01 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 9a31.6 31.6 0 0 0-.5-6.16zM9.55 12.86V5.14L15.82 9l-6.27 3.86z"/>
              </svg>
            </a>
            {/* Instagram */}
            <a href="https://www.instagram.com/8notice9" target="_blank" rel="noopener noreferrer" className="text-white/10 hover:text-white/25 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.97.24 2.44.41.61.24 1.05.52 1.51.98.46.46.74.9.98 1.51.17.47.36 1.27.41 2.44.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.97-.41 2.44a4.07 4.07 0 0 1-.98 1.51c-.46.46-.9.74-1.51.98-.47.17-1.27.36-2.44.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.97-.24-2.44-.41a4.07 4.07 0 0 1-1.51-.98 4.07 4.07 0 0 1-.98-1.51c-.17-.47-.36-1.27-.41-2.44C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.24-1.97.41-2.44.24-.61.52-1.05.98-1.51a4.07 4.07 0 0 1 1.51-.98c.47-.17 1.27-.36 2.44-.41C8.84 2.17 9.22 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.96 5.96 0 0 0-2.16 1.41A5.96 5.96 0 0 0 .57 4.2C.27 4.96.07 5.84.01 7.11.01 8.39 0 8.8 0 12.06s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.41 2.16a5.96 5.96 0 0 0 2.16 1.41c.76.3 1.64.5 2.91.56C8.39 24 8.8 24 12.06 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.96 5.96 0 0 0 2.16-1.41 5.96 5.96 0 0 0 1.41-2.16c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.96 5.96 0 0 0-1.41-2.16A5.96 5.96 0 0 0 19.91.63C19.15.33 18.27.13 17 .07 15.72.01 15.31 0 12.05 0H12zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.4a1.44 1.44 0 1 0-2.88 0 1.44 1.44 0 0 0 2.88 0z"/>
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
