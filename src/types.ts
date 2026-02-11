export interface Deck {
  id: string;
  name: string;
  description: string;
  color: string;
  prompts: string[];
}

export type Screen = "landing" | "rules" | "play" | "end";
