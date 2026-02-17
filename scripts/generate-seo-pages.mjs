#!/usr/bin/env node
/**
 * Generates static SEO pages for playnotice.com
 * Each page targets a specific long-tail keyword with curated prompts.
 * Run: node scripts/generate-seo-pages.mjs
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public", "questions");

// ─── Page definitions ────────────────────────────────────────────────────────

const pages = [
  {
    slug: "deep-questions-to-ask",
    title: "75 Deep Questions to Ask Anyone — From NYC Street Interviews",
    h1: "Deep Questions to Ask Anyone",
    description:
      "Questions that go past small talk. Curated from Notice — a game born out of real conversations with strangers on the streets of New York City.",
    intro:
      "Some questions change the room. Not because they're complicated — because they're honest. These are the ones that made strangers on the street pause, look up, and say something real. They work at dinner tables, on long drives, and in the moments you're tired of talking about nothing.",
    prompts: [
      "If you could ask the entire world one question and get an honest answer, what would you ask?",
      "What's one thing about the person you're trying to become?",
      "If you could be remembered for one thing, what would it be?",
      "Name one thing you learned the hard way",
      "What do you wish you could tell your younger self?",
      "If you could have a conversation with any version of yourself — past or future — which one?",
      "What's something you've never said to anyone in this room?",
      "What do you think your life looks like from the outside?",
      "What are you avoiding right now?",
      "If this is as good as it gets, would that be enough?",
      "What do you think happens when we die?",
      "Will you live a great life?",
      "Name a moment that changed the direction of your life",
      "If you could change one decision, which one?",
      "What's something you're proud of that you never talk about?",
      "What's a lesson you keep having to relearn?",
      "What's one thing about love not enough people notice?",
      "What's a place that changed the way you see things?",
      "Say something honest right now. About anything",
      "What's a big thing on your mind these days?",
    ],
    related: [
      { slug: "philosophical-questions", label: "Philosophical Questions" },
      {
        slug: "deep-conversation-topics",
        label: "Deep Conversation Topics",
      },
      {
        slug: "questions-that-make-you-think",
        label: "Questions That Make You Think",
      },
    ],
    faq: [
      {
        q: "What makes a question 'deep'?",
        a: "A deep question invites someone to share something they don't usually say out loud. It doesn't have to be heavy — just honest. The best deep questions are simple enough to answer immediately but rich enough to keep you thinking after.",
      },
      {
        q: "When is the right time to ask deep questions?",
        a: "When the vibe is right — after dinner, on a long walk, late at night, or during a game like Notice. The key is that nobody feels forced. Start with lighter questions and let the conversation deepen naturally.",
      },
      {
        q: "How do you keep a deep conversation from getting awkward?",
        a: "Go first. If you ask a vulnerable question and then share your own answer honestly, it gives the other person permission to do the same. And always leave space for someone to pass — no pressure makes everything deeper.",
      },
    ],
  },
  {
    slug: "questions-to-ask-your-boyfriend",
    title: "50 Questions to Ask Your Boyfriend — Beyond the Usual",
    h1: "Questions to Ask Your Boyfriend",
    description:
      "Questions that help you actually learn something new about the person you're with. From Notice — a game built on real human conversations.",
    intro:
      "You already know his favorite food. These questions go somewhere else. They're the kind that surface something you didn't know about someone you thought you knew completely. Best used when you're both relaxed — no agenda, just curiosity.",
    prompts: [
      "Tell someone in the room something you've noticed about them but never said",
      "What's one thing about the person you're trying to become?",
      "If you could be remembered for one thing, what would it be?",
      "If your life had a title right now, what would it be?",
      "What's a question you wish someone would ask you?",
      "What meal feels like home?",
      "What are you obsessed with right now?",
      "What's a promise you will never break?",
      "If your mood right now was a color, what color is it?",
      "What is one of the best feelings in the world to you?",
      "What did you want to be when you were a kid?",
      "What is one thing 12-year-old you would say about your life right now?",
      "Do you have a dream you never told anyone about?",
      "What's something everyone assumes about you that isn't true?",
      "If you could hear what one person in this room really thinks of you, who?",
      "What's something you find beautiful that most people overlook?",
      "What's something you own that you'd never sell no matter the offer?",
      "Rate your current happiness from 1-10. Now explain the number",
    ],
    related: [
      { slug: "questions-for-couples", label: "Questions for Couples" },
      { slug: "date-night-questions", label: "Date Night Questions" },
      { slug: "deep-questions-to-ask", label: "Deep Questions to Ask" },
    ],
    faq: [
      {
        q: "How do I get my boyfriend to open up?",
        a: "Don't ask him to open up — ask him a question worth opening up for. The best way is to go first. Share your own answer honestly, and he'll follow. Questions from a game or a list feel safer than 'we need to talk.'",
      },
      {
        q: "When should I ask these questions?",
        a: "When you're already hanging out — not as a scheduled 'relationship check-in.' On a drive, while cooking, or just lying on the couch. The less formal, the more honest the answers.",
      },
    ],
  },
  {
    slug: "icebreaker-questions",
    title: "40 Icebreaker Questions That Actually Work — Not the Cringey Ones",
    h1: "Icebreaker Questions That Actually Work",
    description:
      "Icebreakers that don't make people groan. Light, fun, and genuinely interesting. From Notice — a conversation game born from NYC street interviews.",
    intro:
      "Most icebreakers are painful because they feel forced. These don't. They're light enough that anyone can answer, interesting enough that people actually want to. Works for new groups, work events, parties, or the first 10 minutes of anything.",
    prompts: [
      "Do you consider yourself a good influence or a bad influence?",
      "Everyone pick a number from 1 to 100. See who picked closest to each other",
      "If animals could talk, which one would you hear from first?",
      "Are you more of a hehe or haha type of person?",
      "What was your childhood nickname?",
      "If months were people, which one would be the rudest?",
      "What is the weirdest thing you're afraid of?",
      "What's something you believed way too long as a kid?",
      "What are you particular about?",
      "What old person tendencies do you have?",
      "If you had to get a tattoo right now, what would it be?",
      "Show the group your screen time for today",
      "If this group started a band, what would it be called?",
      "One meal, free and zero calories except the good ones — what is it?",
      "If you could master any skill overnight, what would it be?",
      "What's something you're weirdly good at that has zero practical use?",
      "Without looking — what time do you think it is? Everyone guess. Closest wins",
      "If you could fly anywhere tomorrow, expenses paid — where would you go?",
      "What song do you think they're playing in heaven right now? Queue the music",
      "Name something beautiful that's within eyesight right now",
    ],
    related: [
      { slug: "conversation-starters", label: "Conversation Starters" },
      { slug: "party-game-questions", label: "Party Game Questions" },
      { slug: "fun-questions-to-ask", label: "Fun Questions to Ask" },
    ],
    faq: [
      {
        q: "What makes a good icebreaker?",
        a: "Three things: it's easy to answer, it reveals something real (but not too personal), and it makes people curious about each other's responses. The best icebreakers make people laugh or go 'oh, interesting.'",
      },
      {
        q: "How do I use icebreakers without it feeling forced?",
        a: "Don't announce it. Just ask the question naturally, as if you're genuinely curious. 'Wait — are you more of a hehe or haha person?' lands way better than 'OK everyone, time for icebreakers!'",
      },
    ],
  },
  {
    slug: "conversation-starters",
    title: "50 Conversation Starters That Go Somewhere — Not Small Talk",
    h1: "Conversation Starters That Go Somewhere",
    description:
      "Conversation starters that skip the small talk. Interesting enough to keep going, light enough to start anywhere. From Notice, a game built on real conversations.",
    intro:
      "Small talk is fine for elevators. These are for when you actually want to talk. They work with anyone — friends, strangers, dates, family — because they tap into something everyone has: opinions, memories, and things they've been thinking about.",
    prompts: [
      "Do you consider yourself a good influence or a bad influence?",
      "Name something beautiful that's within eyesight right now",
      "What is something only you noticed today?",
      "What did you want to be when you were a kid?",
      "If you could master any skill overnight, what would it be?",
      "What are you obsessed with right now?",
      "What's the last thing you made?",
      "If you could live in any era for a week, where are you going?",
      "Name a person from history you respect and say why",
      "If you could get the whole world behind one idea, what would it be?",
      "What's one of the most underrated qualities in life?",
      "What's something you know is true that most people don't believe?",
      "If you received $5 million tomorrow, what would you do with it?",
      "What's the furthest thing you can see from where you're sitting?",
      "Name something that exists right now that would blow someone's mind 200 years ago",
      "What aspect of society do you reject?",
      "What is one reason to be optimistic about the world today?",
      "What do you think happens when we die?",
    ],
    related: [
      { slug: "icebreaker-questions", label: "Icebreaker Questions" },
      {
        slug: "questions-to-get-to-know-someone",
        label: "Questions to Get to Know Someone",
      },
      {
        slug: "dinner-party-questions",
        label: "Dinner Party Questions",
      },
    ],
    faq: [
      {
        q: "How do you start a conversation with someone you don't know?",
        a: "Ask something specific about the moment you're in. 'Name something beautiful that's within eyesight right now' works because it's about the shared environment, not personal information. Start observational, then go deeper if they're into it.",
      },
      {
        q: "What's the difference between a conversation starter and an icebreaker?",
        a: "Icebreakers are designed to get a group talking. Conversation starters are for any context — one-on-one, small groups, even texting. They're less about breaking tension and more about going somewhere interesting.",
      },
    ],
  },
  {
    slug: "questions-to-ask-friends",
    title: "45 Questions to Ask Friends — Go Deeper Than 'What's Up'",
    h1: "Questions to Ask Friends",
    description:
      "Questions for the people you already know — but want to know better. From Notice, a game that turns any group into the best conversation they've had in a while.",
    intro:
      "You've known each other for years. But when was the last time you asked something that surprised you? These questions are for the friendships you already have — to make them deeper, funnier, and more honest than your usual hangout.",
    prompts: [
      "What is your favorite thing about one of your best friends?",
      "Pick someone. What's a top memory you have with them?",
      "Who had your back when you were low?",
      "If everyone in this room had a secret talent, what would each person's be? Go around and guess",
      "Tell someone what you think their superpower is",
      "Tell someone here why you're glad they're here",
      "Point at someone. What's their theme song?",
      "If someone in this room wrote a book, what would the title be?",
      "Who in this room is most different from who they were five years ago?",
      "Describe someone in this room using only three words. Let the group guess who",
      "Who here do you think would be famous if they really tried? Why?",
      "Who here has a talent they don't take seriously enough? Call them out",
      "What's the most interesting thing about someone else in the room?",
      "Pick someone. Describe their energy today in one word",
      "If you had to send one person in this room to represent the group to aliens, who and why?",
      "If your life was a movie, what is the audience chanting for you to do right now?",
      "Who here makes you feel the most calm?",
      "Who here would you go to if everything fell apart tomorrow?",
    ],
    related: [
      {
        slug: "fun-questions-to-ask",
        label: "Fun Questions to Ask",
      },
      {
        slug: "deep-questions-to-ask",
        label: "Deep Questions to Ask",
      },
      { slug: "party-game-questions", label: "Party Game Questions" },
    ],
    faq: [
      {
        q: "How do I make friend hangouts more interesting?",
        a: "Stop defaulting to the same activities. Next time you're together, pull out a question nobody expects. It shifts the entire energy. Games like Notice exist specifically for this — 147 prompts designed to make groups actually talk.",
      },
      {
        q: "Are these questions too personal for friends?",
        a: "Depends on the friend group. But most people crave depth more than they let on. Start with the lighter ones ('What's their theme song?') and let the group decide how deep to go.",
      },
    ],
  },
  {
    slug: "fun-questions-to-ask",
    title: "40 Fun Questions to Ask — Light, Weird, and Actually Interesting",
    h1: "Fun Questions to Ask Anyone",
    description:
      "Fun questions that are actually fun — not just 'what's your favorite color.' Light, weird, and guaranteed to get a good answer. From Notice.",
    intro:
      "Not every question needs to be deep. Sometimes you just need something that makes people laugh, argue, or reveal something absurd about themselves. These are the ones that always land — light enough for anywhere, interesting enough to keep going.",
    prompts: [
      "Everyone pick a number from 1 to 100. See who picked closest to each other",
      "If animals could talk, which one would you hear from first?",
      "Are you more of a hehe or haha type of person?",
      "If months were people, which one would be the rudest?",
      "What was your childhood nickname?",
      "If this group started a band, what would it be called?",
      "If they made a movie about your life, what would it be called?",
      "Point at the person who would survive the longest in the wild. Explain",
      "If you had to send one person in this room to represent the group to aliens, who and why?",
      "Everyone point at the funniest person in the room on the count of 3. 1, 2, 3",
      "Close your eyes. Point to where you think north is. Open. Check. If correct, congratulations — you know North!",
      "Show your lock screen. Why that image?",
      "Show the group your screen time for today",
      "What's the most unhinged thing you've ever done that you'd do again?",
      "What's something you believed way too long as a kid?",
      "What is a time you got in a lot of trouble?",
      "One meal, free and zero calories except the good ones — what is it?",
      "What song do you think they're playing in heaven right now? Queue the music",
    ],
    related: [
      { slug: "icebreaker-questions", label: "Icebreaker Questions" },
      { slug: "party-game-questions", label: "Party Game Questions" },
      {
        slug: "truth-or-dare-alternatives",
        label: "Truth or Dare Alternatives",
      },
    ],
    faq: [
      {
        q: "What's a fun question to ask in a group?",
        a: "The ones where everyone has to participate. 'Everyone point at the funniest person on 3' or 'Everyone guess what time it is without looking' — these create a shared moment, not just a Q&A.",
      },
      {
        q: "How do you keep a conversation fun without it being shallow?",
        a: "Mix light and real. Start with something absurd ('If months were people, which one is the rudest?') and let it naturally lead somewhere. The best conversations oscillate between funny and honest.",
      },
    ],
  },
  {
    slug: "questions-to-get-to-know-someone",
    title:
      "50 Questions to Get to Know Someone — Fast, Real, Not Weird",
    h1: "Questions to Get to Know Someone",
    description:
      "Skip the small talk and actually learn who someone is. Questions curated from Notice — a game born from talking to strangers in NYC.",
    intro:
      "You can know someone for years and never really know them. Or you can ask the right question once and learn more in five minutes than five months of 'how was your day.' These work for anyone — new friends, dates, coworkers, or the person you've sat next to for a year.",
    prompts: [
      "Do you consider yourself a good influence or a bad influence?",
      "What's one thing about the person you're trying to become?",
      "If you could be remembered for one thing, what would it be?",
      "What did you want to be when you were a kid?",
      "What meal feels like home?",
      "What are you obsessed with right now?",
      "What is your biggest green flag?",
      "What is your biggest red flag?",
      "What's something you're weirdly good at that has zero practical use?",
      "What's a lesson you keep having to relearn?",
      "If you could master any skill overnight, what would it be?",
      "What is one thing you want to do but are too scared?",
      "What are you particular about?",
      "If you could live in any era for a week, where are you going?",
      "What's something everyone assumes about you that isn't true?",
      "What's a promise you will never break?",
      "What would be a dream come true for you?",
      "What are you avoiding right now?",
    ],
    related: [
      { slug: "conversation-starters", label: "Conversation Starters" },
      { slug: "icebreaker-questions", label: "Icebreaker Questions" },
      { slug: "deep-questions-to-ask", label: "Deep Questions to Ask" },
    ],
    faq: [
      {
        q: "How do you get to know someone fast?",
        a: "Ask questions that reveal values, not just facts. 'What's a promise you will never break?' tells you more about someone than their job title ever will. The key is asking things that require a real answer, not a rehearsed one.",
      },
      {
        q: "What questions should you avoid when getting to know someone?",
        a: "Anything that feels like an interview — rapid-fire surface questions. 'Where are you from? What do you do? Do you have siblings?' gets data, not a person. Ask fewer questions but better ones, and actually listen to the answers.",
      },
    ],
  },
  {
    slug: "deep-conversation-topics",
    title: "30 Deep Conversation Topics — For When You're Done with Small Talk",
    h1: "Deep Conversation Topics",
    description:
      "Conversation topics that actually matter. Philosophy, identity, love, meaning — framed as questions anyone can answer. From Notice.",
    intro:
      "These aren't debate topics. They're doors. Each one opens into something you've probably thought about but rarely talked about out loud. Best shared with someone you trust — or someone you want to trust you.",
    prompts: [
      "What do you think happens when we die?",
      "If this is as good as it gets, would that be enough?",
      "What's one thing about love not enough people notice?",
      "What aspect of society do you reject?",
      "What is one reason to be optimistic about the world today?",
      "If you could get the whole world behind one idea, what would it be?",
      "Name a belief you held a year ago that you've quietly dropped",
      "How do people in your life help you be a better person?",
      "What do you think your life looks like from the outside?",
      "What's something you know is true that most people don't believe?",
      "Say something honest right now. About anything",
      "\"Most people feel more alone now than they did 10 years ago.\" Address the statement like a politician",
      "What's a time you were brave? Tell the group, even if you don't feel like a hero",
      "What's something you've never said to anyone in this room?",
      "What's one of the most underrated qualities in life?",
      "If you could have a conversation with any version of yourself — past or future — which one?",
      "What would a stranger think if they walked in right now?",
      "Will you live a great life?",
    ],
    related: [
      { slug: "deep-questions-to-ask", label: "Deep Questions to Ask" },
      {
        slug: "philosophical-questions",
        label: "Philosophical Questions",
      },
      {
        slug: "questions-that-make-you-think",
        label: "Questions That Make You Think",
      },
    ],
    faq: [
      {
        q: "How do you start a deep conversation?",
        a: "You don't announce it. You just ask a better question. 'What's on your mind these days?' is a better opening than 'Let's have a deep talk.' The depth comes from the question, not from declaring your intention.",
      },
      {
        q: "What if someone isn't ready for a deep conversation?",
        a: "Then they'll give a surface answer, and that's fine. Don't push. Sometimes someone needs to hear a deep question three times before they're ready to answer it honestly. Just asking it plants the seed.",
      },
    ],
  },
  {
    slug: "party-game-questions",
    title: "35 Party Game Questions — Better Than Truth or Dare",
    h1: "Party Game Questions",
    description:
      "Questions designed for groups. Everyone participates, nobody gets bored. From Notice — a game that turns any gathering into the best one you've been to.",
    intro:
      "The best party games aren't about winning — they're about the moments that happen between rounds. These questions get the whole room involved. Everyone answers, everyone listens, and nobody checks their phone.",
    prompts: [
      "Everyone point at the funniest person in the room on the count of 3. 1, 2, 3",
      "Everyone pick a number from 1 to 100. See who picked closest to each other",
      "Show the group your screen time for today",
      "Make up a question right now. Everyone has to answer it",
      "Describe someone in this room using only three words. Let the group guess who",
      "Point at the person who would survive the longest in the wild. Explain",
      "If this group started a band, what would it be called?",
      "Who's the most intense person here? The group has to agree on one name",
      "Without looking — what time do you think it is? Everyone guess. Closest wins",
      "Close your eyes. Point to where you think north is. Open. Check. If correct, congratulations — you know North!",
      "Everyone be completely silent for 10 seconds. Then describe what you heard",
      "If everyone in this room had a secret talent, what would each person's be? Go around and guess",
      "Who here isn't seeing your vision right now? Say their name",
      "Point at someone. What's their theme song?",
      "Assign someone in the room a role in a movie. Describe their character",
      "If a stranger watched this group for 5 minutes, what would they assume about you all?",
      "Look at everyone's shoes. What do they tell you about the person?",
      "Look at everyone for 5 seconds each. Then say who looked the most uncomfortable being looked at",
    ],
    related: [
      {
        slug: "truth-or-dare-alternatives",
        label: "Truth or Dare Alternatives",
      },
      { slug: "fun-questions-to-ask", label: "Fun Questions to Ask" },
      {
        slug: "dinner-party-questions",
        label: "Dinner Party Questions",
      },
    ],
    faq: [
      {
        q: "What's a good party game that isn't drinking-related?",
        a: "Questions. Seriously. A game like Notice gives you 147 prompts that get a group laughing, arguing, and sharing things they wouldn't normally say. No setup, no equipment, no rules to explain. Just a phone in the middle of the table.",
      },
      {
        q: "How many people do you need for party game questions?",
        a: "3 is the minimum for it to feel like a group activity. 6-10 is the sweet spot. Beyond 10, split into smaller groups or you'll be waiting too long between turns.",
      },
    ],
  },
  {
    slug: "date-night-questions",
    title: "40 Date Night Questions — For Couples Who Want More Than Netflix",
    h1: "Date Night Questions",
    description:
      "Questions that turn a regular night into your favorite one. For couples who already know each other — and want to keep going deeper. From Notice.",
    intro:
      "You've done dinner and a movie. These questions make the dinner the movie. They work for couples at any stage — new, established, or somewhere in between. The only requirement is that you're both willing to answer honestly.",
    prompts: [
      "Tell someone in the room something you've noticed about them but never said",
      "What's one thing about the person you're trying to become?",
      "What meal feels like home?",
      "If your mood right now was a color, what color is it?",
      "What's something you find beautiful that most people overlook?",
      "What's a question you wish someone would ask you?",
      "What is one of the best feelings in the world to you?",
      "Give any example like what falling in love feels like",
      "If you could hear what one person in this room really thinks of you, who?",
      "What's one thing about love not enough people notice?",
      "What's something you're proud of that you never talk about?",
      "If this is as good as it gets, would that be enough?",
      "What are you avoiding right now?",
      "Do you have a dream you never told anyone about?",
      "What's a tradition you want to start but haven't yet?",
      "Name a moment that changed the direction of your life",
      "How do people in your life help you be a better person?",
      "What's a big thing on your mind these days?",
    ],
    related: [
      { slug: "questions-for-couples", label: "Questions for Couples" },
      {
        slug: "questions-to-ask-your-boyfriend",
        label: "Questions to Ask Your Boyfriend",
      },
      { slug: "deep-questions-to-ask", label: "Deep Questions to Ask" },
    ],
    faq: [
      {
        q: "How do you make date night more interesting?",
        a: "Replace screen time with question time. Literally put a phone in the middle of the table with a game like Notice and take turns. One question can lead to an hour of conversation you wouldn't have had otherwise.",
      },
      {
        q: "What if the conversation gets too heavy?",
        a: "That's actually a good sign — it means you're being real. But if you need to lighten up, switch to something fun: 'If this group started a band, what would it be called?' The best date nights move between light and deep.",
      },
    ],
  },
  {
    slug: "questions-that-make-you-think",
    title: "35 Questions That Make You Think — Really Think",
    h1: "Questions That Make You Think",
    description:
      "Questions that stop you in your tracks. The kind that don't have easy answers — just honest ones. From Notice, a game built on real conversations in NYC.",
    intro:
      "These questions don't have right answers. They have your answers. Each one asks you to notice something you might have missed — about yourself, about the room, about the way things are. Best shared, but worth sitting with alone too.",
    prompts: [
      "If you could ask the entire world one question and get an honest answer, what would you ask?",
      "Look at your hands. What's the most recent thing they did that mattered?",
      "If your life was a movie, what is the audience chanting for you to do right now?",
      "What do you think your life looks like from the outside?",
      "If you could see one measurement or statistic over everyone's heads, what would you want it to indicate?",
      "What would a stranger think if they walked in right now?",
      "If everyone in this room had met in a different lifetime, what do you think the setting would be?",
      "What's the oldest thing in this room?",
      "Right now — what are you most aware of that you weren't aware of when this game started?",
      "Name something that exists right now that would blow someone's mind 200 years ago",
      "What would you do with an extra hour every day that nobody knew about?",
      "If you could witness any moment in history — just watch, not change it — what would you pick?",
      "What's a place that changed the way you see things?",
      "What sound can you hear right now that you weren't aware of 5 seconds ago?",
      "Name a belief you held a year ago that you've quietly dropped",
      "What's one thing about this room you'll remember a week from now?",
      "What do you notice about the place you're in?",
      "What's the furthest thing you can see from where you're sitting?",
    ],
    related: [
      {
        slug: "philosophical-questions",
        label: "Philosophical Questions",
      },
      { slug: "deep-questions-to-ask", label: "Deep Questions to Ask" },
      {
        slug: "deep-conversation-topics",
        label: "Deep Conversation Topics",
      },
    ],
    faq: [
      {
        q: "Why do some questions make you think more than others?",
        a: "The best ones reframe something familiar. 'What's the oldest thing in this room?' makes you see a space you've been in a hundred times with completely fresh eyes. It's not about complexity — it's about shifting perspective.",
      },
      {
        q: "Can you use thought-provoking questions in everyday conversation?",
        a: "That's the whole point. You don't need a philosophy seminar. 'What sound can you hear right now that you weren't aware of 5 seconds ago?' works in literally any setting. The best thought-provoking questions fit into normal life.",
      },
    ],
  },
  {
    slug: "dinner-party-questions",
    title: "35 Dinner Party Questions — Turn Any Meal Into the Best One",
    h1: "Dinner Party Questions",
    description:
      "Questions that make dinner the main event. Light, interesting, and designed for groups around a table. From Notice — a conversation game built on real human moments.",
    intro:
      "The food is great. But the conversation is what people remember. These questions work around any table — with close friends or people you just met. They're the reason nobody looks at their phone until dessert.",
    prompts: [
      "Do you consider yourself a good influence or a bad influence?",
      "Name something beautiful that's within eyesight right now",
      "Name a person from history you respect and say why",
      "If you could live in any era for a week, where are you going?",
      "What did you want to be when you were a kid?",
      "If you could get the whole world behind one idea, what would it be?",
      "What's one of the most underrated qualities in life?",
      "What's something you know is true that most people don't believe?",
      "What meal feels like home?",
      "One meal, free and zero calories except the good ones — what is it?",
      "What was your childhood nickname?",
      "What is something fun you did before iPhones existed?",
      "If they made a movie about your life, what would it be called?",
      "If you could master any skill overnight, what would it be?",
      "What are you obsessed with right now?",
      "What is one reason to be optimistic about the world today?",
      "Name something that exists right now that would blow someone's mind 200 years ago",
      "What aspect of society do you reject?",
    ],
    related: [
      { slug: "conversation-starters", label: "Conversation Starters" },
      { slug: "party-game-questions", label: "Party Game Questions" },
      { slug: "icebreaker-questions", label: "Icebreaker Questions" },
    ],
    faq: [
      {
        q: "How do you start a conversation at a dinner party?",
        a: "Ask something that everyone at the table can answer but nobody expects. 'If months were people, which one would be the rudest?' gets everyone talking immediately. Avoid questions about work — people get enough of that.",
      },
      {
        q: "What's the best dinner party game?",
        a: "One that doesn't feel like a game. Notice works because you just put a phone in the middle and take turns. No boards, no cards, no rules to explain. The prompts do the work — you just show up and be honest.",
      },
    ],
  },
  {
    slug: "questions-for-couples",
    title: "40 Questions for Couples — From Surface to Soul",
    h1: "Questions for Couples",
    description:
      "Questions that help couples go deeper than their daily routine. From light to real, designed to strengthen the connection you already have. From Notice.",
    intro:
      "Long relationships have a default setting. These questions change the channel. They're for couples who love each other and want to keep discovering each other — because knowing someone isn't a destination, it's something you keep doing.",
    prompts: [
      "Tell someone in the room something you've noticed about them but never said",
      "What's a question you wish someone would ask you?",
      "What meal feels like home?",
      "What's something you're proud of that you never talk about?",
      "Name a moment that changed the direction of your life",
      "What's a promise you will never break?",
      "What's something everyone assumes about you that isn't true?",
      "How do people in your life help you be a better person?",
      "What's one thing about love not enough people notice?",
      "What is your biggest green flag?",
      "What is your biggest red flag?",
      "If this is as good as it gets, would that be enough?",
      "What's a tradition you want to start but haven't yet?",
      "What is one thing 12-year-old you would say about your life right now?",
      "If your mood right now was a color, what color is it?",
      "Give any example like what falling in love feels like",
      "What's a lesson you keep having to relearn?",
      "What's a big thing on your mind these days?",
    ],
    related: [
      { slug: "date-night-questions", label: "Date Night Questions" },
      {
        slug: "questions-to-ask-your-boyfriend",
        label: "Questions to Ask Your Boyfriend",
      },
      { slug: "deep-questions-to-ask", label: "Deep Questions to Ask" },
    ],
    faq: [
      {
        q: "How often should couples ask each other deep questions?",
        a: "There's no schedule. But if you haven't learned something new about your partner in the last month, it's time. A weekly 'question night' — even just one question — can shift the entire dynamic of a relationship.",
      },
      {
        q: "What if my partner doesn't like answering questions?",
        a: "Then make it a game. Literally. Notice turns questions into something fun, not interrogative. When both people are answering, it feels like playing — not like being questioned.",
      },
    ],
  },
  {
    slug: "philosophical-questions",
    title: "30 Philosophical Questions You Can Actually Discuss — No PhD Required",
    h1: "Philosophical Questions for Real Conversations",
    description:
      "Philosophy without the textbook. Questions about life, meaning, love, and identity that anyone can answer. From Notice — a game built on human conversations.",
    intro:
      "You don't need to have read Plato for these. They're the questions humans have been asking since the beginning — just framed in a way you can actually discuss over dinner, on a walk, or while playing a game with people you care about.",
    prompts: [
      "What do you think happens when we die?",
      "If this is as good as it gets, would that be enough?",
      "Will you live a great life?",
      "What aspect of society do you reject?",
      "If you could get the whole world behind one idea, what would it be?",
      "What is one reason to be optimistic about the world today?",
      "\"Most people feel more alone now than they did 10 years ago.\" Address the statement like a politician",
      "What do you think your life looks like from the outside?",
      "Name a belief you held a year ago that you've quietly dropped",
      "If you could have a conversation with any version of yourself — past or future — which one?",
      "If you could be remembered for one thing, what would it be?",
      "If you could ask the entire world one question and get an honest answer, what would you ask?",
      "If you could witness any moment in history — just watch, not change it — what would you pick?",
      "What's something you know is true that most people don't believe?",
      "What's one of the most underrated qualities in life?",
      "If everyone in this room had met in a different lifetime, what do you think the setting would be?",
      "Name something that exists right now that would blow someone's mind 200 years ago",
      "What's a word you think should exist but doesn't? Describe what it means",
    ],
    related: [
      {
        slug: "deep-conversation-topics",
        label: "Deep Conversation Topics",
      },
      { slug: "deep-questions-to-ask", label: "Deep Questions to Ask" },
      {
        slug: "questions-that-make-you-think",
        label: "Questions That Make You Think",
      },
    ],
    faq: [
      {
        q: "How do you discuss philosophy without it getting pretentious?",
        a: "Ask questions, don't make statements. 'What do you think happens when we die?' is philosophy. It's also just a question. The pretentiousness comes from having answers, not from asking.",
      },
      {
        q: "Can philosophical questions work in casual settings?",
        a: "That's where they work best. A bar, a bonfire, a late-night drive. Philosophy is just humans wondering about things together. The setting should be comfortable, not academic.",
      },
    ],
  },
  {
    slug: "truth-or-dare-alternatives",
    title: "25 Truth or Dare Alternatives — Same Energy, Better Questions",
    h1: "Truth or Dare Alternatives",
    description:
      "All the honesty and fun of truth or dare, without the cringe. Questions and challenges that actually make people open up. From Notice.",
    intro:
      "Truth or dare gets old fast. The truths are boring, the dares are stupid, and everyone picks truth anyway. These alternatives keep the energy but raise the bar — real honesty, real reveals, real laughs. No 'I dare you to lick the floor.'",
    prompts: [
      "Call someone you love on speaker. Tell them one thing. Skip? Say 'I am bad at noticing stuff' out loud",
      "Show the group your screen time for today",
      "Show your lock screen. Why that image?",
      "Show the group a recent photo you took",
      "Say something honest right now. About anything",
      "Tell someone in the room something you've noticed about them but never said",
      "What's something you've never said to anyone in this room?",
      "What's the most unhinged thing you've ever done that you'd do again?",
      "Who here isn't seeing your vision right now? Say their name",
      "Tell someone in this room what they are like when they think no one's watching",
      "Look at everyone for 5 seconds each. Then say who looked the most uncomfortable being looked at",
      "Everyone be completely silent for 10 seconds. Then describe what you heard",
      "Give someone a compliment you'd normally only think",
      "What's one thing you want but are too embarrassed to admit?",
      "What's the biggest thing you've forgiven someone for?",
      "What happened the last time you cried?",
      "Rate your current happiness from 1-10. Now explain the number",
      "What's a time you were embarrassed",
    ],
    related: [
      { slug: "party-game-questions", label: "Party Game Questions" },
      { slug: "fun-questions-to-ask", label: "Fun Questions to Ask" },
      { slug: "icebreaker-questions", label: "Icebreaker Questions" },
    ],
    faq: [
      {
        q: "What can you play instead of truth or dare?",
        a: "Games that ask better questions. Notice gives you 147 prompts that range from light ('Show your screen time') to genuinely revealing ('Say something honest right now'). Same energy as truth or dare, but nobody has to do anything embarrassing for a cheap laugh.",
      },
      {
        q: "What's a good game for a small group?",
        a: "3-8 people is perfect for question-based games. Put a phone in the middle, take turns. The smaller the group, the deeper it goes. Notice works for any size but gets especially good with 4-6 people.",
      },
    ],
  },
];

// ─── HTML Template ───────────────────────────────────────────────────────────

function generateHTML(page) {
  const promptCount = page.prompts.length;
  const promptsHTML = page.prompts
    .map(
      (p, i) =>
        `<li class="prompt"><span class="prompt-num">${i + 1}</span>${escapeHTML(p)}</li>`
    )
    .join("\n            ");

  const relatedHTML = page.related
    .map(
      (r) =>
        `<a href="/questions/${r.slug}/" class="related-link">${r.label}</a>`
    )
    .join("\n              ");

  const faqHTML = page.faq
    .map(
      (f) => `
          <div class="faq-item">
            <h3>${escapeHTML(f.q)}</h3>
            <p>${escapeHTML(f.a)}</p>
          </div>`
    )
    .join("");

  const faqSchemaItems = page.faq
    .map(
      (f) => `{
          "@type": "Question",
          "name": ${JSON.stringify(f.q)},
          "acceptedAnswer": {
            "@type": "Answer",
            "text": ${JSON.stringify(f.a)}
          }
        }`
    )
    .join(",\n        ");

  const itemListSchema = page.prompts
    .map(
      (p, i) => `{
          "@type": "ListItem",
          "position": ${i + 1},
          "name": ${JSON.stringify(p)}
        }`
    )
    .join(",\n        ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHTML(page.title)}</title>
  <meta name="description" content="${escapeAttr(page.description)}" />
  <meta property="og:title" content="${escapeAttr(page.title)}" />
  <meta property="og:description" content="${escapeAttr(page.description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://playnotice.com/questions/${page.slug}/" />
  <meta name="twitter:card" content="summary" />
  <link rel="canonical" href="https://playnotice.com/questions/${page.slug}/" />

  <!-- Schema: ItemList -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": ${JSON.stringify(page.h1)},
    "description": ${JSON.stringify(page.description)},
    "numberOfItems": ${promptCount},
    "itemListElement": [
      ${itemListSchema}
    ]
  }
  </script>

  <!-- Schema: FAQ -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      ${faqSchemaItems}
    ]
  }
  </script>

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0a0a0a;
      color: #e0e0e0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 640px;
      margin: 0 auto;
      padding: 60px 24px 80px;
    }
    .brand-tag {
      color: rgba(255,255,255,0.2);
      font-size: 11px;
      letter-spacing: 0.15em;
      text-transform: lowercase;
      margin-bottom: 32px;
    }
    .brand-tag a { color: rgba(255,255,255,0.3); text-decoration: none; }
    .brand-tag a:hover { color: rgba(255,255,255,0.5); }
    h1 {
      font-size: 32px;
      font-weight: 300;
      letter-spacing: 0.02em;
      color: #fff;
      margin-bottom: 20px;
      line-height: 1.3;
    }
    .intro {
      color: rgba(255,255,255,0.45);
      font-size: 15px;
      font-weight: 300;
      line-height: 1.8;
      margin-bottom: 40px;
    }
    .prompt-list {
      list-style: none;
      margin-bottom: 48px;
    }
    .prompt {
      padding: 16px 0;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.55);
      font-size: 16px;
      font-weight: 300;
      font-style: italic;
      line-height: 1.6;
    }
    .prompt-num {
      color: rgba(212,160,86,0.4);
      font-style: normal;
      font-size: 12px;
      margin-right: 12px;
      font-weight: 400;
    }
    .cta-section {
      text-align: center;
      padding: 48px 0;
      border-top: 1px solid rgba(255,255,255,0.06);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      margin-bottom: 48px;
    }
    .cta-context {
      color: rgba(255,255,255,0.3);
      font-size: 14px;
      font-weight: 300;
      margin-bottom: 6px;
    }
    .cta-count {
      color: rgba(255,255,255,0.5);
      font-size: 18px;
      font-weight: 300;
      margin-bottom: 24px;
    }
    .cta-btn {
      display: inline-block;
      background: #d4a056;
      color: #000;
      text-decoration: none;
      padding: 14px 40px;
      border-radius: 16px;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0.02em;
      transition: opacity 0.2s;
    }
    .cta-btn:hover { opacity: 0.85; }
    .cta-free {
      display: block;
      color: rgba(255,255,255,0.25);
      font-size: 12px;
      font-weight: 300;
      margin-top: 12px;
      text-decoration: none;
      letter-spacing: 0.05em;
    }
    .cta-free:hover { color: rgba(255,255,255,0.4); }
    .related-section {
      margin-bottom: 48px;
    }
    .section-label {
      color: rgba(255,255,255,0.2);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      margin-bottom: 16px;
    }
    .related-link {
      display: block;
      color: rgba(255,255,255,0.35);
      text-decoration: none;
      font-size: 14px;
      font-weight: 300;
      padding: 8px 0;
      transition: color 0.2s;
    }
    .related-link:hover { color: rgba(255,255,255,0.6); }
    .faq-section { margin-bottom: 48px; }
    .faq-item { margin-bottom: 24px; }
    .faq-item h3 {
      color: rgba(255,255,255,0.5);
      font-size: 15px;
      font-weight: 400;
      margin-bottom: 6px;
    }
    .faq-item p {
      color: rgba(255,255,255,0.3);
      font-size: 14px;
      font-weight: 300;
      line-height: 1.7;
    }
    .footer {
      text-align: center;
      padding-top: 32px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .footer-brand {
      color: rgba(255,255,255,0.2);
      font-size: 12px;
      font-weight: 300;
      margin-bottom: 12px;
    }
    .footer-brand a { color: rgba(255,255,255,0.25); text-decoration: none; }
    .footer-brand a:hover { color: rgba(255,255,255,0.45); }
    .social-links { display: flex; justify-content: center; gap: 20px; margin-bottom: 16px; }
    .social-links a {
      color: rgba(255,255,255,0.2);
      text-decoration: none;
      font-size: 12px;
      font-weight: 300;
      transition: color 0.2s;
    }
    .social-links a:hover { color: rgba(255,255,255,0.45); }
    .back-link {
      color: rgba(255,255,255,0.2);
      font-size: 12px;
      text-decoration: none;
      font-weight: 300;
    }
    .back-link:hover { color: rgba(255,255,255,0.4); }
  </style>
</head>
<body>
  <div class="container">
    <p class="brand-tag">from <a href="https://playnotice.com">notice</a> — a game by <a href="https://www.tiktok.com/@8notice9">8notice9</a></p>

    <h1>${escapeHTML(page.h1)}</h1>
    <p class="intro">${escapeHTML(page.intro)}</p>

    <ol class="prompt-list">
      ${promptsHTML}
    </ol>

    <div class="cta-section">
      <p class="cta-context">that was ${promptCount}.</p>
      <p class="cta-count">there are 147 in the full game.</p>
      <a href="https://buy.stripe.com/7sYcN72Uv4zlgrQfkOdwc01" class="cta-btn">play notice $1</a>
      <a href="/free" class="cta-free">try 10 free first →</a>
    </div>

    <div class="faq-section">
      <p class="section-label">frequently asked</p>
      ${faqHTML}
    </div>

    <div class="related-section">
      <p class="section-label">more questions</p>
      ${relatedHTML}
      <a href="/questions/" class="related-link">← all 147 questions</a>
    </div>

    <div class="footer">
      <p class="footer-brand">
        from <a href="https://www.tiktok.com/@8notice9">8notice9</a> — talking to the people in NYC
      </p>
      <div class="social-links">
        <a href="https://www.tiktok.com/@8notice9">tiktok</a>
        <a href="https://www.youtube.com/@8notice9">youtube</a>
        <a href="https://www.instagram.com/8notice9">instagram</a>
      </div>
      <a href="/" class="back-link">playnotice.com</a>
    </div>
  </div>
</body>
</html>`;
}

// ─── Sitemap ─────────────────────────────────────────────────────────────────

function generateSitemapEntries(pages) {
  const today = new Date().toISOString().slice(0, 10);
  return pages
    .map(
      (p) => `  <url>
    <loc>https://playnotice.com/questions/${p.slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("\n");
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(str) {
  return str.replace(/"/g, "&quot;").replace(/&/g, "&amp;");
}

// ─── Main ────────────────────────────────────────────────────────────────────

console.log(`Generating ${pages.length} SEO pages...\n`);

for (const page of pages) {
  const dir = join(PUBLIC_DIR, page.slug);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const html = generateHTML(page);
  writeFileSync(join(dir, "index.html"), html, "utf-8");
  console.log(`  ✓ /questions/${page.slug}/  (${page.prompts.length} prompts)`);
}

// Print sitemap entries for manual addition
console.log(`\n--- Sitemap entries to add ---\n`);
console.log(generateSitemapEntries(pages));
console.log(`\nDone! ${pages.length} pages generated.`);
