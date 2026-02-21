import { motion } from "framer-motion";

const LINKS = [
  { label: "play notice", href: "https://playnotice.com", highlight: true },
  { label: "which prompt are you?", href: "https://playnotice.com/quiz" },
  { label: "submit a prompt for the game", href: "https://playnotice.com/submit" },
  { label: "150+ conversation questions", href: "https://playnotice.com/questions/" },
  { label: "get prompt picks from the AI", href: "https://chatgpt.com/g/g-6996d8c194b8819180559ca34d7c67b0-notice-conversation-starter", external: true },
  { label: "the essay", href: "https://playnotice.com/essay/" },
  { label: "substack", href: "https://becauseis.substack.com", external: true },
];

const SOCIALS = [
  { label: "tiktok", href: "https://www.tiktok.com/@8notice9" },
  { label: "youtube", href: "https://www.youtube.com/@8notice9" },
  { label: "instagram", href: "https://www.instagram.com/8notice9" },
];

export function Links() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-16 overflow-y-auto">
      <div className="max-w-xs w-full text-center">
        {/* Title */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-3xl font-light tracking-[0.08em] mb-2"
        >
          notice
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-white/40 text-xs font-light tracking-wide mb-10"
        >
          a game for people paying attention
        </motion.p>

        {/* Links */}
        <div className="flex flex-col gap-3 mb-10">
          {LINKS.map((link, i) => (
            <motion.a
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.35 }}
              className={`block w-full py-3.5 rounded-xl text-sm font-normal tracking-wide transition-all active:scale-[0.97] ${
                link.highlight
                  ? "text-black"
                  : "text-white/70 border border-white/10 hover:border-white/20"
              }`}
              style={link.highlight ? { backgroundColor: "#d4a056" } : undefined}
            >
              {link.label}
            </motion.a>
          ))}
        </div>

        {/* Socials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="flex items-center justify-center gap-6"
        >
          {SOCIALS.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 text-xs font-light tracking-wider hover:text-white/50 transition-colors"
            >
              {s.label}
            </a>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.4 }}
          className="text-white/15 text-[10px] font-light tracking-wide mt-8"
        >
          @8notice9 — talking to the people
        </motion.p>
      </div>
    </div>
  );
}
