import { motion } from "framer-motion";

interface CommitScreenProps {
  deckColor: string;
  onCommit: () => void;
}

export function CommitScreen({ deckColor, onCommit }: CommitScreenProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* Central glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "80vmin",
          height: "80vmin",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${deckColor}18 0%, ${deckColor}08 40%, transparent 70%)`,
          filter: "blur(30px)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/30 text-lg font-light text-center leading-relaxed mb-12"
        >
          we encourage you to notice
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6, type: "spring", stiffness: 200, damping: 20 }}
          onClick={onCommit}
          className="relative px-12 py-5 rounded-full border"
          style={{
            borderColor: deckColor + "50",
            background: `radial-gradient(ellipse at center, ${deckColor}15 0%, transparent 70%)`,
            boxShadow: `0 0 40px ${deckColor}10, 0 0 80px ${deckColor}08`,
          }}
          whileTap={{ scale: 0.9 }}
        >
          <span
            className="text-xl tracking-[0.12em] font-light"
            style={{ color: deckColor }}
          >
            I want to play
          </span>
        </motion.button>
      </div>
    </div>
  );
}
