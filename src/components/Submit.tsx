import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "intro" | "writing" | "submitted";

const EXAMPLES = [
  "Do you consider yourself a good influence or a bad influence?",
  "What's something beautiful you walked past today without stopping?",
  "When was the last time you changed your mind about something important?",
];

export function Submit() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [prompt, setPrompt] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (phase === "writing" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [phase]);

  const handleSubmit = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || trimmed.length < 5) return;

    setSubmitting(true);

    try {
      await fetch("/api/submit-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          name: name.trim() || "anonymous",
        }),
      });
    } catch {
      // Silent — submission logged server-side regardless
    }

    setSubmitting(false);
    setPhase("submitted");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleShare = async () => {
    const text = `"${prompt.trim()}" — submitted to notice`;
    const url = "https://playnotice.com/submit";

    if (navigator.share) {
      try {
        await navigator.share({ title: "notice", text, url });
      } catch {
        /* cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch {
        /* clipboard unavailable */
      }
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-16 overflow-y-auto">
      <div className="max-w-sm w-full text-center">
        <AnimatePresence mode="wait">
          {/* ── INTRO ── */}
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="text-white/25 text-[11px] tracking-[0.15em] font-light mb-6"
              >
                notice
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl font-light tracking-wide leading-snug mb-4"
              >
                what should the world
                <br />
                <span style={{ color: "#d4a056" }}>notice?</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="text-white/35 text-sm font-light leading-relaxed mb-10 max-w-xs"
              >
                notice is built from real conversations with strangers.
                <br />
                now it's your turn.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="text-white/20 text-xs font-light tracking-wide mb-4"
              >
                prompts that made it into the game
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="space-y-4 mb-12"
              >
                {EXAMPLES.map((ex, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 + i * 0.2, duration: 0.4 }}
                    className="text-white/30 text-sm font-light italic leading-relaxed px-2"
                  >
                    &ldquo;{ex}&rdquo;
                  </motion.p>
                ))}
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.4 }}
                onClick={() => setPhase("writing")}
                whileTap={{ scale: 0.97 }}
                className="w-full max-w-xs py-4 rounded-2xl text-black font-semibold text-base tracking-wide transition-all"
                style={{ backgroundColor: "#d4a056" }}
              >
                submit a prompt
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.7, duration: 0.4 }}
                className="text-white/15 text-[10px] font-light tracking-wide mt-3"
              >
                if it lands, it goes in the game
              </motion.p>
            </motion.div>
          )}

          {/* ── WRITING ── */}
          {phase === "writing" && (
            <motion.div
              key="writing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-white/25 text-[11px] tracking-[0.15em] font-light mb-8"
              >
                notice
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="text-white/40 text-sm font-light tracking-wide mb-6"
              >
                write something worth asking out loud
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="w-full max-w-xs"
              >
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="your prompt..."
                  maxLength={280}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-base text-white/70 font-light leading-relaxed placeholder:text-white/15 focus:outline-none focus:border-white/25 transition-colors resize-none"
                />

                <div className="flex justify-between items-center mt-2 px-1">
                  <p className="text-white/15 text-[10px] font-light">
                    {prompt.length}/280
                  </p>
                  <p className="text-white/15 text-[10px] font-light">
                    enter to submit
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="w-full max-w-xs mt-6"
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="your name or @ (optional)"
                  maxLength={60}
                  autoComplete="off"
                  autoCapitalize="off"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60 font-light tracking-wide placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                />
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                onClick={handleSubmit}
                disabled={submitting || prompt.trim().length < 5}
                whileTap={{ scale: 0.97 }}
                className="w-full max-w-xs py-4 rounded-2xl text-black font-semibold text-base tracking-wide transition-all mt-6 disabled:opacity-40"
                style={{ backgroundColor: "#d4a056" }}
              >
                {submitting ? "sending..." : "submit"}
              </motion.button>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                onClick={() => setPhase("intro")}
                className="text-white/20 text-xs font-light tracking-wider hover:text-white/35 transition-colors mt-4"
              >
                &larr; back
              </motion.button>
            </motion.div>
          )}

          {/* ── SUBMITTED ── */}
          {phase === "submitted" && (
            <motion.div
              key="submitted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-white/25 text-[11px] tracking-[0.15em] font-light mb-8"
              >
                notice
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-2xl font-light tracking-wide mb-3"
                style={{ color: "#d4a056" }}
              >
                received.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="text-white/35 text-sm font-light leading-relaxed mb-8 max-w-xs"
              >
                if it makes people stop and think —
                <br />
                it goes in the game.
              </motion.p>

              {/* Show what they submitted */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="border-l-2 border-[#d4a056]/30 pl-4 mb-10 max-w-xs text-left"
              >
                <p className="text-white/40 text-sm font-light italic leading-relaxed">
                  &ldquo;{prompt.trim()}&rdquo;
                </p>
                {name.trim() && (
                  <p className="text-white/20 text-xs font-light mt-2">
                    — {name.trim()}
                  </p>
                )}
              </motion.div>

              {/* Share */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.4 }}
                onClick={handleShare}
                whileTap={{ scale: 0.97 }}
                className="text-white/30 text-xs font-light tracking-wider hover:text-white/50 transition-colors mb-8"
              >
                {shareCopied ? "copied" : "share what you submitted"}
              </motion.button>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.4 }}
                className="flex flex-col items-center gap-4"
              >
                <button
                  onClick={() => {
                    setPrompt("");
                    setName("");
                    setPhase("writing");
                  }}
                  className="text-white/30 text-sm font-light tracking-wide hover:text-white/50 transition-colors"
                >
                  submit another
                </button>

                <a
                  href="/"
                  className="text-white/20 text-xs font-light tracking-wider hover:text-white/35 transition-colors"
                >
                  play notice →
                </a>
              </motion.div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.4 }}
                className="mt-12"
              >
                <a
                  href="https://www.tiktok.com/@8notice9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/15 text-xs font-light hover:text-white/30 transition-colors"
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
