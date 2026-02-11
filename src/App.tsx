import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LandingPage } from "./components/LandingPage";
import { RulesScreen } from "./components/RulesScreen";
import { PromptDisplay } from "./components/PromptDisplay";
import { EndScreen } from "./components/EndScreen";
import { usePaymentGate } from "./hooks/usePaymentGate";
import { shuffle } from "./utils/shuffle";
import type { Screen } from "./types";
import promptData from "./data/prompts.json";

const ALL_PROMPTS = promptData.decks.flatMap((d) => d.prompts);
const ACCENT_COLOR = "#d4a056";

function App() {
  const { unlocked, unlock } = usePaymentGate();
  const [screen, setScreen] = useState<Screen>(unlocked ? "rules" : "landing");
  const [shuffledPrompts, setShuffledPrompts] = useState<string[]>([]);

  const handleUnlock = useCallback(() => {
    unlock();
    setScreen("rules");
  }, [unlock]);

  const startGame = useCallback(() => {
    setShuffledPrompts(shuffle(ALL_PROMPTS));
    setScreen("play");
  }, []);

  const handleEnd = useCallback(() => {
    setScreen("end");
  }, []);

  const handlePlayAgain = useCallback(() => {
    setShuffledPrompts(shuffle(ALL_PROMPTS));
    setScreen("play");
  }, []);

  return (
    <div className="h-full bg-black">
      <AnimatePresence mode="wait">
        {screen === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            <LandingPage onUnlock={handleUnlock} />
          </motion.div>
        )}

        {screen === "rules" && (
          <motion.div
            key="rules"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            <RulesScreen onContinue={startGame} />
          </motion.div>
        )}

        {screen === "play" && (
          <motion.div
            key="play"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            <PromptDisplay
              prompts={shuffledPrompts}
              deckColor={ACCENT_COLOR}
              onEnd={handleEnd}
            />
          </motion.div>
        )}

        {screen === "end" && (
          <motion.div
            key="end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            <EndScreen
              deckColor={ACCENT_COLOR}
              totalPrompts={ALL_PROMPTS.length}
              onPlayAgain={handlePlayAgain}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
