export type Question = {
  id: string;
  prompt: string;
  choices: string[];
  correct: string;
  media?: "notation" | "audio";
  topic: string;
};

const bank: [string, string, string[], string, Question["media"]?][] = [
  ["pitch", "The notes are written in alto clef. What is the ascending interval from the lower note to the upper note?", ["Minor sixth", "Major sixth", "Perfect fifth", "Minor seventh"], "Clefs and intervals", "notation"],
  ["audio", "Listen to the ascending interval. Which interval results when it is inverted?", ["Perfect fourth", "Perfect fifth", "Major third", "Minor sixth"], "Interval inversion", "audio"],
  ["key", "Which minor key has a key signature of five sharps?", ["G-sharp minor", "C-sharp minor", "D-sharp minor", "F-sharp minor"], "Key signatures"],
  ["relative", "Which is the descending form of G melodic minor in its conventional classical form?", ["G, F, E-flat, D, C, B-flat, A, G", "G, F-sharp, E, D, C, B-flat, A, G", "G, F-sharp, E-flat, D, C, B-flat, A, G", "G, F, E, D, C, B, A, G"], "Minor scales"],
  ["time", "A bar of 9/8 contains two dotted crotchets followed by one quaver. Which single rest completes the bar?", ["Crotchet rest", "Quaver rest", "Dotted-crotchet rest", "Minim rest"], "Compound metre"],
  ["tempo", "What does poco rallentando e diminuendo mean?", ["Gradually a little slower and softer", "Immediately much slower and louder", "Gradually faster and softer", "Maintain speed and play very softly"], "Performance directions"],
  ["chord", "In C major, a chord has E in the bass with G and C above it. Identify the chord and inversion.", ["Tonic triad in first inversion", "Tonic triad in second inversion", "Mediant triad in root position", "Subdominant triad in first inversion"], "Triads and inversions"],
  ["dynamic", "Which notes form the dominant seventh chord in B minor?", ["F-sharp, A-sharp, C-sharp, E", "F-sharp, A, C-sharp, E", "B, D, F-sharp, A", "F-sharp, A-sharp, C-sharp, E-sharp"], "Dominant sevenths"],
  ["rest", "A B-flat clarinet plays written F-sharp. What is the sounding pitch?", ["E", "G-sharp", "F-sharp", "E-flat"], "Transposing instruments"],
  ["cadence", "In A minor, the chords E major followed by F major form which cadence?", ["Interrupted cadence", "Perfect cadence", "Plagal cadence", "Imperfect cadence"], "Cadences in minor keys"],
  ["compound", "A melody in D major is transposed up a perfect fifth. What is the new key and its key signature?", ["A major: three sharps", "G major: one sharp", "B major: five sharps", "A minor: no sharps or flats"], "Transposition"],
  ["leading", "Which accidental is required for the leading note of E harmonic minor?", ["D-sharp", "D-natural", "C-sharp", "F-double-sharp"], "Harmonic minor"],
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
