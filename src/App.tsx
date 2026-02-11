import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LandingPage } from "./components/LandingPage";
import { RulesScreen } from "./components/RulesScreen";
import { CommitScreen } from "./components/CommitScreen";
import { PromptDisplay } from "./components/PromptDisplay";
import { EndScreen } from "./components/EndScreen";
import { AmbientBackground } from "./components/AmbientBackground";
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
  const bonusPromptRef = useRef<string | undefined>(undefined);

  // Lock scroll on game screens, allow scroll on landing
  useEffect(() => {
    if (screen === "landing") {
      document.body.classList.remove("lock-scroll");
    } else {
      document.body.classList.add("lock-scroll");
    }
    return () => document.body.classList.remove("lock-scroll");
  }, [screen]);

  const handleUnlock = useCallback(() => {
    unlock();
    setScreen("rules");
  }, [unlock]);

  const goToCommit = useCallback(() => {
    setScreen("commit");
  }, []);

  const startGame = useCallback(() => {
    const shuffled = shuffle(ALL_PROMPTS);
    bonusPromptRef.current = shuffled.pop();
    setShuffledPrompts(shuffled);
    setScreen("play");
  }, []);

  const handleEnd = useCallback(() => {
    setScreen("end");
  }, []);

  const handlePlayAgain = useCallback(() => {
    const shuffled = shuffle(ALL_PROMPTS);
    bonusPromptRef.current = shuffled.pop();
    setShuffledPrompts(shuffled);
    setScreen("play");
  }, []);

  return (
    <div className="h-[100dvh] bg-black relative">
      {/* Ambient animated background — always visible behind everything */}
      <AmbientBackground />

      <AnimatePresence mode="wait">
        {screen === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="min-h-[100dvh] relative z-10"
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
            className="h-[100dvh] relative z-10"
          >
            <RulesScreen onContinue={goToCommit} />
          </motion.div>
        )}

        {screen === "commit" && (
          <motion.div
            key="commit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="h-[100dvh] relative z-10"
          >
            <CommitScreen deckColor={ACCENT_COLOR} onCommit={startGame} />
          </motion.div>
        )}

        {screen === "play" && (
          <motion.div
            key="play"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="h-[100dvh] relative z-10"
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
            className="h-[100dvh] relative z-10"
          >
            <EndScreen
              deckColor={ACCENT_COLOR}
              totalPrompts={ALL_PROMPTS.length}
              bonusPrompt={bonusPromptRef.current}
              onPlayAgain={handlePlayAgain}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
