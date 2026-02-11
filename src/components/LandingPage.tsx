import { motion } from "framer-motion";

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

export function LandingPage({ onUnlock: _onUnlock }: LandingPageProps) {
  const handleBuy = () => {
    window.location.href = "https://buy.stripe.com/aFa4gBamXgi35NcfkOdwc00";
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

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.3, duration: 0.5 }}
          className="text-white/10 text-xs mt-10 mb-6 font-light"
        >
          by 8notice9
        </motion.p>
      </div>
    </div>
  );
}
