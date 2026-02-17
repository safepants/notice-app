import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LandingPage } from "./components/LandingPage";
import { RulesScreen } from "./components/RulesScreen";
import { CommitScreen } from "./components/CommitScreen";
import { PromptDisplay } from "./components/PromptDisplay";
import { EndScreen } from "./components/EndScreen";
import { FreeSampler } from "./components/FreeSampler";
import { Quiz } from "./components/Quiz";
import { Submit } from "./components/Submit";
import { Links } from "./components/Links";
import { AmbientBackground } from "./components/AmbientBackground";
import { usePaymentGate } from "./hooks/usePaymentGate";
import { shuffle } from "./utils/shuffle";
import type { Screen } from "./types";
import promptData from "./data/prompts.json";

const ALL_PROMPTS = promptData.decks.flatMap((d) => d.prompts);
const ACCENT_COLOR = "#d4a056";
const BONUS_PROMPT =
  "Have you noticed how profound us being alive at the same time is? The universe is a fishy coincidence, and a fish does not know it is wet!";

// Check if we're on special routes
const IS_FREE_ROUTE = window.location.pathname === "/free";
const IS_QUIZ_ROUTE = window.location.pathname === "/quiz";
const IS_SUBMIT_ROUTE = window.location.pathname === "/submit";
const IS_LINKS_ROUTE = window.location.pathname === "/links";

function App() {
  const { unlocked, unlock } = usePaymentGate();
  const [screen, setScreen] = useState<Screen>(unlocked ? "rules" : "landing");
  const [shuffledPrompts, setShuffledPrompts] = useState<string[]>([]);
  const bonusPrompt = BONUS_PROMPT;

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

  // Free sampler route — render standalone sampler page
  if (IS_FREE_ROUTE) {
    return (
      <div className="min-h-[100dvh] bg-black relative">
        <AmbientBackground />
        <div className="relative z-10">
          <FreeSampler />
        </div>
      </div>
    );
  }

  // Quiz route
  if (IS_QUIZ_ROUTE) {
    return (
      <div className="min-h-[100dvh] bg-black relative">
        <AmbientBackground />
        <div className="relative z-10">
          <Quiz />
        </div>
      </div>
    );
  }

  // Submit route — community prompt submissions
  if (IS_SUBMIT_ROUTE) {
    return (
      <div className="min-h-[100dvh] bg-black relative">
        <AmbientBackground />
        <div className="relative z-10">
          <Submit />
        </div>
      </div>
    );
  }

  // Links route — link-in-bio page (replaces Linktree)
  if (IS_LINKS_ROUTE) {
    return (
      <div className="min-h-[100dvh] bg-black relative">
        <AmbientBackground />
        <div className="relative z-10">
          <Links />
        </div>
      </div>
    );
  }

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
              bonusPrompt={bonusPrompt}
              onPlayAgain={handlePlayAgain}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
