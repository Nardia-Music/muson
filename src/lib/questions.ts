export type Question = {
  id: string;
  prompt: string;
  choices: string[];
  correct: string;
  media?: "notation" | "audio";
  topic: string;
};

const bank: [string, string, string[], string, Question["media"]?][] = [
  [
    "pitch",
    "Name the note shown on the treble staff.",
    ["B", "D", "F", "A"],
    "Pitch",
    "notation",
  ],
  [
    "audio",
    "Listen to the two notes. Which interval do you hear?",
    ["Perfect fifth", "Minor second", "Major third", "Octave"],
    "Listening",
    "audio",
  ],
  [
    "key",
    "How many sharps are in the key signature of D major?",
    ["Two", "One", "Three", "Four"],
    "Key signatures",
  ],
  [
    "relative",
    "What is the relative minor of C major?",
    ["A minor", "C minor", "E minor", "D minor"],
    "Keys",
  ],
  [
    "time",
    "How many crotchet beats are in one bar of 3/4?",
    ["Three", "Two", "Four", "Six"],
    "Rhythm",
  ],
  [
    "tempo",
    "What does allegro indicate?",
    ["A fast tempo", "Very softly", "Gradually slower", "Detached notes"],
    "Performance directions",
  ],
  [
    "chord",
    "Which notes form a C major triad?",
    ["C, E, G", "C, E-flat, G", "C, F, A", "C, D, G"],
    "Harmony",
  ],
  [
    "dynamic",
    "What does crescendo ask the performer to do?",
    [
      "Gradually get louder",
      "Gradually get softer",
      "Speed up",
      "Stop playing",
    ],
    "Dynamics",
  ],
  [
    "rest",
    "A minim rest lasts how many crotchet beats?",
    ["Two", "One", "Three", "Four"],
    "Rhythm",
  ],
  [
    "cadence",
    "Which chord progression forms a perfect cadence?",
    ["V to I", "IV to I", "I to V", "V to VI"],
    "Harmony",
  ],
  [
    "compound",
    "How many dotted-crotchet beats are in 6/8?",
    ["Two", "Three", "Six", "Four"],
    "Time signatures",
  ],
  [
    "leading",
    "What is the leading note in G major?",
    ["F-sharp", "F", "G", "A"],
    "Scales",
  ],
];

export const questions: Question[] = bank.map(
  ([id, prompt, choices, topic, media]) => ({
    id,
    prompt,
    choices,
    correct: choices[0],
    topic,
    media,
  }),
);

export function shuffle<Value>(values: Value[]): Value[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}
