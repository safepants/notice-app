import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getActiveHoliday } from "../utils/holidays";
import { shuffle } from "../utils/shuffle";
import promptData from "../data/prompts.json";

const ALL_PROMPTS = promptData.decks.flatMap((d) => d.prompts);
const TOTAL_PROMPTS = ALL_PROMPTS.length;

interface LandingPageProps {
  onUnlock: () => void;
}

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

  // Randomize preview prompts + gameplay preview on each visit
  const previewPrompts = useMemo(() => shuffle(ALL_PROMPTS).slice(0, 5), []);
  const gameplayPrompt = useMemo(() => shuffle(ALL_PROMPTS)[0], []);

  useEffect(() => {
    if (showCodeInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCodeInput]);

  const [giftCopied, setGiftCopied] = useState(false);

  const handleBuy = () => {
    window.location.href = "https://buy.stripe.com/7sYcN72Uv4zlgrQfkOdwc01";
  };

  const handleGift = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "notice",
          text: "this game is $1. thought of you.",
          url: "https://playnotice.com",
        });
      } catch {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText("https://playnotice.com");
        setGiftCopied(true);
        setTimeout(() => setGiftCopied(false), 2000);
      } catch {
        // Clipboard not available
      }
    }
  };

  const handleCodeSubmit = async () => {
    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.valid) {
        setCodeSuccess(true);
        setCodeError(false);
        setTimeout(() => onUnlock(), 600);
      } else {
        setCodeError(true);
        setCode("");
      }
    } catch {
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
          className="text-white/55 text-base font-light tracking-wide mb-14"
        >
          a game for people paying attention
        </motion.p>

        {/* Example label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="text-white/30 text-xs uppercase tracking-[0.2em] mb-6 font-normal"
        >
          here's what's inside
        </motion.p>

        {/* Prompt previews — fast stagger */}
        <div className="space-y-6 mb-14">
          {previewPrompts.map((prompt, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
              className="text-white/40 text-base font-light italic leading-relaxed px-2"
            >
              "{prompt}"
            </motion.p>
          ))}
        </div>

        {/* Live gameplay preview — randomized prompt each visit */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mb-10 flex justify-center"
        >
          <div className="w-[200px] aspect-[9/16] rounded-2xl overflow-hidden border border-white/8 bg-[#0a0a0a] relative flex flex-col shadow-lg shadow-black/40">
            {/* Ambient ring */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div
                className="rounded-full border border-[#d4a056]/10"
                style={{ width: "70%", height: "70%" }}
              />
            </div>
            {/* Prompt text */}
            <div className="flex-1 flex items-center justify-center px-4 relative z-10">
              <p className="text-[10px] font-light leading-relaxed text-center text-white/75">
                {gameplayPrompt}
              </p>
            </div>
            {/* Bottom bar */}
            <div className="px-3 pb-3 flex items-center justify-between relative z-10">
              <span className="text-[7px] text-white/20 font-light">back</span>
              <span
                className="text-[7px] font-light px-3 py-1.5 rounded-full border"
                style={{
                  borderColor: "rgba(212,160,86,0.25)",
                  color: "rgba(212,160,86,0.8)",
                }}
              >
                notice more
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-[1px] w-full">
              <div className="h-full w-[18%] bg-[#d4a056]/40" />
            </div>
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.4 }}
          className="flex items-center gap-4 mb-4 px-6"
        >
          <div className="flex-1 h-px bg-white/12" />
        </motion.div>

        {/* Notices count above CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.35, duration: 0.4 }}
          className="text-white/50 text-sm font-normal tracking-wide mb-4"
        >
          {TOTAL_PROMPTS} things you can notice and talk about with people
        </motion.div>

        {/* Try free link */}
        <motion.a
          href="/free"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.4 }}
          className="inline-block text-white/30 text-xs font-light tracking-wider hover:text-white/45 transition-colors mb-4"
        >
          want to try first? 10 free prompts →
        </motion.a>

        {/* Tagline above button */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.45, duration: 0.4 }}
          className="text-white/25 text-xs font-light tracking-widest lowercase mb-5"
        >
          be one who notices
        </motion.p>

        {/* Buy button */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.4 }}
          onClick={handleBuy}
          className="w-full py-4 rounded-2xl text-black font-semibold text-lg tracking-wide transition-all active:scale-[0.97]"
          style={{ backgroundColor: "#d4a056" }}
        >
          play notice $1
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 0.4 }}
          className="mt-4 text-[11px] font-normal tracking-[0.18em] uppercase"
          style={{ color: "rgba(212, 160, 86, 0.4)" }}
        >
          one purchase · play forever
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.75, duration: 0.4 }}
          className="text-white/25 text-[10px] mt-2 font-light tracking-wide"
        >
          no accounts · works offline · no data collected
        </motion.p>

        {/* Gift link */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.4 }}
          onClick={handleGift}
          className="text-white/25 text-[10px] mt-3 font-light tracking-wider hover:text-white/40 transition-colors"
        >
          {giftCopied ? "link copied" : "gift this to someone"}
        </motion.button>

        {/* Secret code area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.85, duration: 0.4 }}
          className="mt-4"
        >
          <AnimatePresence mode="wait">
            {!showCodeInput ? (
              <motion.button
                key="trigger"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCodeInput(true)}
                className="text-white/30 text-[11px] font-light tracking-wider hover:text-white/45 transition-colors"
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

        {/* Quiet reactions — social proof as ambient texture */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0, duration: 0.6 }}
          className="mt-10 flex flex-col items-center gap-3"
        >
          {[
            "we skipped the bar and just sat in the living room with this for 3 hours",
            "nobody opened their phone the whole night",
            "my roommate said something I didn\u2019t know after years of living together",
          ].map((reaction, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.1 + i * 0.25, duration: 0.5 }}
              className="text-white/20 text-[11px] font-light italic tracking-wide"
            >
              &ldquo;{reaction}&rdquo;
            </motion.p>
          ))}
        </motion.div>

        {/* Video loop — ambient proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8, duration: 0.8 }}
          className="mt-10 w-full max-w-[240px] mx-auto"
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full rounded-2xl opacity-60"
            src="/notice-loop.mp4"
          />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.0, duration: 0.4 }}
          className="mt-8 mb-6 flex flex-col items-center gap-3"
        >
          <a
            href="https://www.tiktok.com/@8notice9"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 text-xs font-light hover:text-white/45 transition-colors"
          >
            by 8notice9
          </a>
          <div className="flex items-center gap-5">
            {/* TikTok */}
            <a href="https://www.tiktok.com/@8notice9" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/50 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z"/>
              </svg>
            </a>
            {/* YouTube */}
            <a href="https://www.youtube.com/@8notice9" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/50 transition-colors">
              <svg width="16" height="14" viewBox="0 0 24 18" fill="currentColor">
                <path d="M23.5 2.84A3.01 3.01 0 0 0 21.38.7C19.52.18 12 .18 12 .18s-7.52 0-9.38.52A3.01 3.01 0 0 0 .5 2.84 31.6 31.6 0 0 0 0 9a31.6 31.6 0 0 0 .5 6.16 3.01 3.01 0 0 0 2.12 2.14C4.48 17.82 12 17.82 12 17.82s7.52 0 9.38-.52a3.01 3.01 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 9a31.6 31.6 0 0 0-.5-6.16zM9.55 12.86V5.14L15.82 9l-6.27 3.86z"/>
              </svg>
            </a>
            {/* Instagram */}
            <a href="https://www.instagram.com/8notice9" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/50 transition-colors">
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
