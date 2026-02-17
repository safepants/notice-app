import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Curated arc: light → observational → deep → action
const SAMPLER_PROMPTS = [
  "Everyone pick a number from 1 to 100. See who picked closest to each other.",
  "What sound can you hear right now that you weren't aware of 5 seconds ago?",
  "Name something beautiful that's within eyesight right now.",
  "Look at everyone for 5 seconds each. Who looked the most uncomfortable being looked at?",
  "Show the group your screen time for today.",
  "What's something you know is true that most people don't believe?",
  "Tell someone in the room something you've noticed about them but never said.",
  "If this is as good as it gets, would that be enough?",
  "What emotion is sitting in the room right now? Name it.",
  "Call someone you love on speaker. Tell them one thing.",
];

// Show first 3 ungated so visitors feel the product before giving email
const UNGATED_COUNT = 3;

export function FreeSampler() {
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const previewPrompts = SAMPLER_PROMPTS.slice(0, UNGATED_COUNT);
  const gatedPrompts = SAMPLER_PROMPTS.slice(UNGATED_COUNT);

  const handleSubmit = async () => {
    if (!email || !email.includes("@") || !email.includes(".")) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setUnlocked(true);

    // Fire-and-forget email capture
    try {
      fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "free-sampler" }),
      });
    } catch {
      // Silent fail — prompts already revealed
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const handleBuy = () => {
    window.location.href = "https://buy.stripe.com/7sYcN72Uv4zlgrQfkOdwc01";
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-16 overflow-y-auto">
      <div className="max-w-sm w-full text-center">
        {/* Title */}
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
          className="text-white/50 text-base font-light tracking-wide mb-10"
        >
          a game for people paying attention
        </motion.p>

        {/* Preview prompts — always visible, no email required */}
        <div className="space-y-5 mb-10">
          {previewPrompts.map((prompt, i) => (
            <motion.p
              key={`preview-${i}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.3, duration: 0.5 }}
              className="text-white/45 text-base font-light italic leading-relaxed px-2"
            >
              &ldquo;{prompt}&rdquo;
            </motion.p>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!unlocked ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, delay: 0.5 + UNGATED_COUNT * 0.3 + 0.2 }}
              className="flex flex-col items-center gap-4"
            >
              {/* Context line */}
              <p className="text-white/30 text-sm font-light mb-1 leading-relaxed">
                that was 3. there are 7 more here —<br />
                and 147 in the full game.
              </p>

              {/* Divider */}
              <div className="flex items-center gap-4 w-full max-w-xs px-4 mb-1">
                <div className="flex-1 h-px bg-white/8" />
              </div>

              <p className="text-white/25 text-xs font-light tracking-wide mb-1">
                enter your email to unlock the rest
              </p>

              <div className="flex items-center gap-2 w-full max-w-xs">
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(false);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="your@email.com"
                  autoComplete="email"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 font-light tracking-wide placeholder:text-white/15 focus:outline-none focus:border-white/25 transition-colors"
                />
              </div>

              <motion.button
                onClick={handleSubmit}
                whileTap={{ scale: 0.97 }}
                className="w-full max-w-xs py-3.5 rounded-2xl text-black font-semibold text-base tracking-wide transition-all"
                style={{ backgroundColor: "#d4a056" }}
              >
                unlock 7 more
              </motion.button>

              {emailError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white/25 text-xs font-light"
                >
                  enter a valid email
                </motion.p>
              )}

              <p className="text-white/15 text-[10px] font-light tracking-wide mt-2">
                no spam · just things worth noticing
              </p>

              {/* Link back to main page */}
              <a
                href="/"
                className="text-white/20 text-xs font-light tracking-wider hover:text-white/35 transition-colors mt-4"
              >
                &larr; back to playnotice.com
              </a>
            </motion.div>
          ) : (
            <motion.div
              key="gated-prompts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              {/* Gated prompts — staggered reveal */}
              <div className="space-y-5 mb-14">
                {gatedPrompts.map((prompt, i) => (
                  <motion.p
                    key={`gated-${i}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.25, duration: 0.5 }}
                    className="text-white/45 text-base font-light italic leading-relaxed px-2"
                  >
                    &ldquo;{prompt}&rdquo;
                  </motion.p>
                ))}
              </div>

              {/* CTA block — appears after all prompts */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + gatedPrompts.length * 0.25 + 0.5, duration: 0.6 }}
                className="flex flex-col items-center gap-3"
              >
                {/* Divider */}
                <div className="flex items-center gap-4 mb-2 px-6 w-full max-w-xs">
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <p className="text-white/50 text-lg font-light mb-1">
                  that was 10.
                </p>
                <p className="text-white/30 text-sm font-light mb-6">
                  there are 147 more.
                </p>

                <motion.button
                  onClick={handleBuy}
                  whileTap={{ scale: 0.97 }}
                  className="w-full max-w-xs py-4 rounded-2xl text-black font-semibold text-lg tracking-wide transition-all"
                  style={{ backgroundColor: "#d4a056" }}
                >
                  play notice $1
                </motion.button>

                <p className="text-white/25 text-xs mt-2 font-light">
                  one purchase · play forever
                </p>

                <p className="text-white/20 text-[10px] mt-1 font-light tracking-wide">
                  no accounts · works offline · no data collected
                </p>

                {/* Footer */}
                <a
                  href="https://www.tiktok.com/@8notice9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/20 text-xs font-light hover:text-white/35 transition-colors mt-6"
                >
                  by 8notice9
                </a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
