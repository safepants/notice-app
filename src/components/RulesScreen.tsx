import { motion } from "framer-motion";

interface RulesScreenProps {
  onContinue: () => void;
}

export function RulesScreen({ onContinue }: RulesScreenProps) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-sm w-full text-center"
      >
        <h2 className="text-3xl font-light tracking-wide mb-12">how to play</h2>

        <div className="space-y-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">
              first
            </p>
            <p className="text-white/80 text-lg font-light">
              everyone says "I want to play"
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">
              then
            </p>
            <p className="text-white/80 text-lg font-light">
              say what you notice
            </p>
          </motion.div>
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          onClick={onContinue}
          className="text-lg font-light tracking-wide active:opacity-60 transition-opacity"
          style={{ color: "#d4a056" }}
        >
          play →
        </motion.button>
      </motion.div>
    </div>
  );
}
