import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

type Archetype =
  | "mirror"
  | "quiet"
  | "spark"
  | "observer"
  | "bridge"
  | "deep"
  | "present"
  | "challenger";

interface ArchetypeInfo {
  name: string;
  tagline: string;
  description: string;
  prompt: string;
}

interface QuizOption {
  text: string;
  archetype: Archetype;
}

interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const ARCHETYPES: Record<Archetype, ArchetypeInfo> = {
  mirror: {
    name: "The Mirror",
    tagline: "you help people see themselves",
    description:
      "You reflect things back that people didn't know they were showing. In conversation, people feel seen around you — not because you tell them who they are, but because you notice what they're already doing.",
    prompt:
      "Tell someone in the room something you've noticed about them but never said",
  },
  quiet: {
    name: "The Quiet One",
    tagline: "you notice what nobody says",
    description:
      "You hear the gaps. While everyone's talking, you're reading the room — the pauses, the deflections, the thing someone almost said but didn't. People trust you because you listen like you mean it.",
    prompt: "What emotion is sitting in the room right now? Name it",
  },
  spark: {
    name: "The Spark",
    tagline: "you start conversations nobody expects",
    description:
      "You bring the energy that shifts a room. Not loud, just unexpected. You ask the question nobody saw coming or bring up the topic that makes everyone lean in. You're the reason people stay longer than they planned.",
    prompt:
      "If everyone in this room had met in a different lifetime, what do you think the setting would be?",
  },
  observer: {
    name: "The Observer",
    tagline: "you see what others miss",
    description:
      "You catch the details. The way someone's expression changed for half a second. The thing in the room nobody else looked at twice. You notice because you're actually paying attention — and that's rarer than people think.",
    prompt:
      "Look around. What's one thing in this space you've never noticed before?",
  },
  bridge: {
    name: "The Bridge",
    tagline: "you connect people to each other",
    description:
      "You see how people fit together. You're the one who introduces the two people who end up talking all night, or who asks the question that brings someone quiet into the conversation. Groups work better when you're in them.",
    prompt:
      "Who here makes you feel the most calm?",
  },
  deep: {
    name: "The Deep End",
    tagline: "you ask the questions everyone's thinking",
    description:
      "You go there. While everyone else is circling the surface, you're already three layers in. Not because you're trying to be intense — because you're genuinely curious about what's underneath. People open up to you fast.",
    prompt:
      "If this is as good as it gets, would that be enough?",
  },
  present: {
    name: "The Present One",
    tagline: "you're here. fully.",
    description:
      "You're not thinking about what you're going to say next. You're not on your phone. You're actually here — and people feel it. Your presence makes a room feel warmer, even if you haven't said a word.",
    prompt:
      "What sound can you hear right now that you weren't aware of 5 seconds ago?",
  },
  challenger: {
    name: "The Challenger",
    tagline: "you push people to be honest",
    description:
      "You don't let people hide behind comfortable answers. Not in a harsh way — in a 'I know you have more to say' way. People respect you because you hold a standard for honesty that makes everyone around you more real.",
    prompt: "Say something honest right now. About anything",
  },
};

const QUESTIONS: QuizQuestion[] = [
  {
    question: "At a dinner party, you're usually the one who...",
    options: [
      {
        text: "notices when someone hasn't spoken and draws them in",
        archetype: "bridge",
      },
      {
        text: "asks the question that makes everyone go quiet",
        archetype: "deep",
      },
      {
        text: "says the thing nobody else was going to say",
        archetype: "challenger",
      },
      {
        text: "brings up something that changes the whole vibe",
        archetype: "spark",
      },
    ],
  },
  {
    question: "When you meet someone new, you tend to...",
    options: [
      {
        text: "pick up on something about them nobody else noticed",
        archetype: "observer",
      },
      {
        text: "ask them something that surprises them",
        archetype: "spark",
      },
      { text: "listen way more than you talk", archetype: "quiet" },
      {
        text: "make them feel like they've known you forever",
        archetype: "mirror",
      },
    ],
  },
  {
    question: "Your friends would say you're the one who...",
    options: [
      {
        text: "remembers the small details about people",
        archetype: "observer",
      },
      {
        text: "creates moments that bring the group closer",
        archetype: "bridge",
      },
      { text: "always goes deeper than expected", archetype: "deep" },
      {
        text: "is fully present — like actually here",
        archetype: "present",
      },
    ],
  },
  {
    question: "In a conversation, you feel most alive when...",
    options: [
      {
        text: "someone says something they've never told anyone",
        archetype: "quiet",
      },
      {
        text: "you help someone see something about themselves",
        archetype: "mirror",
      },
      {
        text: "the whole room is engaged and laughing",
        archetype: "spark",
      },
      {
        text: "someone challenges you to be honest",
        archetype: "challenger",
      },
    ],
  },
  {
    question: "People come to you when they need...",
    options: [
      {
        text: "to feel heard without being judged",
        archetype: "quiet",
      },
      {
        text: "the honest truth — no sugarcoating",
        archetype: "challenger",
      },
      { text: "to see the bigger picture", archetype: "observer" },
      { text: "to feel grounded and present", archetype: "present" },
    ],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

type Phase = "intro" | "questions" | "email" | "result";

export function Quiz() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questionIdx, setQuestionIdx] = useState(0);
  const [scores, setScores] = useState<Record<Archetype, number>>(
    () =>
      Object.fromEntries(
        Object.keys(ARCHETYPES).map((k) => [k, 0])
      ) as Record<Archetype, number>
  );
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Archetype | null>(null);
  const [shared, setShared] = useState(false);

  const selectAnswer = (archetype: Archetype) => {
    const newScores = { ...scores, [archetype]: scores[archetype] + 1 };
    setScores(newScores);

    if (questionIdx < QUESTIONS.length - 1) {
      setQuestionIdx(questionIdx + 1);
    } else {
      // Calculate result
      const winner = (Object.entries(newScores) as [Archetype, number][]).reduce(
        (best, [key, val]) => (val > best[1] ? [key, val] : best),
        ["mirror", 0] as [Archetype, number]
      )[0];
      setResult(winner);
      setPhase("email");
    }
  };

  const handleEmailSubmit = async () => {
    if (!email || !email.includes("@") || !email.includes(".")) {
      setEmailError(true);
      return;
    }
    setSubmitting(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "quiz" }),
      });
    } catch {
      // Still show result even if subscribe fails
    }
    setSubmitting(false);
    setPhase("result");
  };

  const skipEmail = () => {
    setPhase("result");
  };

  const handleShare = async () => {
    const info = result ? ARCHETYPES[result] : null;
    if (!info) return;

    const text = `I'm ${info.name}. "${info.tagline}" — Which Notice prompt are you?`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Which Notice prompt are you?",
          text,
          url: "https://playnotice.com/quiz",
        });
      } catch {
        // cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(
          `${text}\nhttps://playnotice.com/quiz`
        );
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {
        // clipboard not available
      }
    }
  };

  const info = result ? ARCHETYPES[result] : null;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-sm w-full text-center">
        <AnimatePresence mode="wait">
          {/* ─── Intro ──────────────────────────────────── */}
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <p className="text-white/20 text-[11px] tracking-[0.2em] mb-8">
                from notice
              </p>
              <h1 className="text-3xl font-light tracking-wide mb-4">
                which notice prompt are you?
              </h1>
              <p className="text-white/40 text-sm font-light mb-12 leading-relaxed max-w-xs">
                5 questions. 60 seconds. find out how you show up in
                conversations.
              </p>
              <motion.button
                onClick={() => setPhase("questions")}
                className="px-10 py-4 rounded-2xl text-black font-semibold text-lg tracking-wide"
                style={{ backgroundColor: "#d4a056" }}
                whileTap={{ scale: 0.97 }}
              >
                start
              </motion.button>
            </motion.div>
          )}

          {/* ─── Questions ──────────────────────────────── */}
          {phase === "questions" && (
            <motion.div
              key={`q-${questionIdx}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <p className="text-white/20 text-[11px] tracking-[0.2em] mb-10">
                {questionIdx + 1} of {QUESTIONS.length}
              </p>
              <h2 className="text-xl font-light leading-relaxed mb-10 text-white/70">
                {QUESTIONS[questionIdx].question}
              </h2>
              <div className="w-full space-y-3">
                {QUESTIONS[questionIdx].options.map((opt, i) => (
                  <motion.button
                    key={i}
                    onClick={() => selectAnswer(opt.archetype)}
                    className="w-full text-left px-5 py-4 rounded-xl border border-white/8 text-white/45 text-sm font-light leading-relaxed hover:border-white/20 hover:text-white/60 transition-all"
                    whileTap={{ scale: 0.98 }}
                  >
                    {opt.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── Email Capture ──────────────────────────── */}
          {phase === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <p className="text-white/20 text-[11px] tracking-[0.2em] mb-8">
                almost there
              </p>
              <p className="text-xl font-light text-white/60 mb-3">
                your result is ready.
              </p>
              <p className="text-white/30 text-sm font-light mb-8">
                drop your email to see which noticer you are.
              </p>
              <div className="w-full max-w-xs space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                  placeholder="your email"
                  autoComplete="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60 font-light tracking-wide text-center placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                />
                {emailError && (
                  <p className="text-white/25 text-[10px] font-light">
                    enter a valid email
                  </p>
                )}
                <motion.button
                  onClick={handleEmailSubmit}
                  disabled={submitting}
                  className="w-full py-3 rounded-xl text-black font-semibold text-sm tracking-wide"
                  style={{ backgroundColor: "#d4a056" }}
                  whileTap={{ scale: 0.97 }}
                >
                  {submitting ? "..." : "show me"}
                </motion.button>
                <button
                  onClick={skipEmail}
                  className="text-white/15 text-[10px] font-light tracking-wider hover:text-white/30 transition-colors"
                >
                  skip
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── Result ─────────────────────────────────── */}
          {phase === "result" && info && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <p className="text-white/20 text-[11px] tracking-[0.2em] mb-6">
                you are
              </p>

              {/* Result card — screenshot-ready */}
              <div className="w-full bg-white/[0.03] border border-white/8 rounded-2xl p-8 mb-8">
                <h2
                  className="text-2xl font-light tracking-wide mb-2"
                  style={{ color: "#d4a056" }}
                >
                  {info.name}
                </h2>
                <p className="text-white/50 text-sm font-light italic mb-6">
                  "{info.tagline}"
                </p>
                <p className="text-white/35 text-sm font-light leading-relaxed mb-8">
                  {info.description}
                </p>
                <div className="border-t border-white/6 pt-6">
                  <p className="text-white/20 text-[10px] tracking-[0.15em] uppercase mb-3">
                    your notice prompt
                  </p>
                  <p className="text-white/50 text-base font-light italic leading-relaxed">
                    "{info.prompt}"
                  </p>
                </div>
              </div>

              <p className="text-white/25 text-xs font-light mb-8">
                that was one prompt. there are 146 more.
              </p>

              <div className="flex flex-col items-center gap-3 w-full">
                <a
                  href="https://playnotice.com"
                  className="w-full py-4 rounded-2xl text-black font-semibold text-lg tracking-wide text-center block"
                  style={{ backgroundColor: "#d4a056" }}
                >
                  play notice
                </a>
                <motion.button
                  onClick={handleShare}
                  className="mt-4 px-8 py-3 rounded-full border border-white/15 hover:border-white/25 transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-white/35 text-sm font-light tracking-wider">
                    {shared ? "copied" : "share your result"}
                  </span>
                </motion.button>
              </div>

              <p className="text-white/15 text-[10px] font-light mt-10">
                <a
                  href="https://www.tiktok.com/@8notice9"
                  className="hover:text-white/30 transition-colors"
                >
                  by 8notice9
                </a>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
