import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase.config";

// UPDATED WEIGHT STRUCTURE (HP, WP, HF, CI)
export interface QuestionWeights {
  HP: number; // Habitual Practice
  WP: number; // Why Practice
  HF: number; // How Faith
  CI: number; // Community Importance
}

export interface Question {
  id: number;
  text: string;
  category: string;
  weights: QuestionWeights;
  dir: number; // Direction: 1 for normal, -1 for inverse
  order: number;
}

export const questions: Question[] = [
  {
    id: 1,
    text: "I'm deeply connected to the Bohra community and its practices.",
    category: "community_centrality",
    weights: { HP: 0.4, WP: 0.0, HF: 0.0, CI: 0.6 },
    dir: 1,
    order: 1,
  },
  {
    id: 2,
    text: "During vaaz, I think about the message and what it means for me.",
    category: "motivation_for_practice",
    weights: { HP: 0.3, WP: 0.7, HF: 0.0, CI: 0.0 },
    dir: 1,
    order: 2,
  },
  {
    id: 3,
    text: "I do maatham with focus and feeling.",
    category: "motivation_for_practice",
    weights: { HP: 0.3, WP: 0.5, HF: 0.2, CI: 0.0 },
    dir: 1,
    order: 3,
  },
  {
    id: 4,
    text: "I attend religious events to please my family and community.",
    category: "motivation_for_practice",
    weights: { HP: 0.0, WP: 1.0, HF: 0.0, CI: 0.0 },
    dir: -1,
    order: 4,
  },
  {
    id: 5,
    text: "I reflect on my own understanding of faith, sometimes differently from traditional teachings.",
    category: "faith_approach",
    weights: { HP: 0.0, WP: 0.3, HF: 0.7, CI: 0.0 },
    dir: -1,
    order: 5,
  },
  {
    id: 6,
    text: "My daily routine often includes religious practices and community service.",
    category: "habitual_practice",
    weights: { HP: 0.6, WP: 0.0, HF: 0.0, CI: 0.4 },
    dir: 1,
    order: 6,
  },
  {
    id: 7,
    text: "I shape my daily life more by personal priorities than by Bohra practices.",
    category: "habitual_practice",
    weights: { HP: 1.0, WP: 0.0, HF: 0.0, CI: 0.0 },
    dir: -1,
    order: 7,
  },
  {
    id: 8,
    text: "I follow Bohra principles while adapting them to fit modern life.",
    category: "faith_approach",
    weights: { HP: 0.3, WP: 0.0, HF: 0.7, CI: 0.0 },
    dir: -1,
    order: 8,
  },
  {
    id: 9,
    text: "Asking for razaa from Moula is meaningful when making important life choices.",
    category: "faith_approach",
    weights: { HP: 0.0, WP: 0.4, HF: 0.6, CI: 0.0 },
    dir: 1,
    order: 9,
  },
  {
    id: 10,
    text: "I like to understand the reasons behind religious traditions and practices.",
    category: "motivation_for_practice",
    weights: { HP: 0.0, WP: 0.6, HF: 0.4, CI: 0.0 },
    dir: -1,
    order: 10,
  },
  {
    id: 11,
    text: "Certain moments during vaaz feel especially meaningful to me.",
    category: "motivation_for_practice",
    weights: { HP: 0.3, WP: 0.7, HF: 0.0, CI: 0.0 },
    dir: 1,
    order: 11,
  },
  {
    id: 12,
    text: "I make life choices based on what feels right for me, whilst also considering Bohra teachings.",
    category: "faith_approach",
    weights: { HP: 0.0, WP: 0.3, HF: 0.7, CI: 0.0 },
    dir: -1,
    order: 12,
  },
  {
    id: 13,
    text: "Being part of the Bohra community is an important part of my personal life.",
    category: "community_centrality",
    weights: { HP: 0.3, WP: 0.0, HF: 0.0, CI: 0.7 },
    dir: 1,
    order: 13,
  },
  {
    id: 14,
    text: "I try hard to attend multiple days of Moharram, not only Ashura.",
    category: "habitual_practice",
    weights: { HP: 0.6, WP: 0.0, HF: 0.2, CI: 0.2 },
    dir: 1,
    order: 14,
  },
  {
    id: 15,
    text: "I sometimes find it hard to stay fully focused during vaaz or other religious events.",
    category: "motivation_for_practice",
    weights: { HP: 0.3, WP: 0.7, HF: 0.0, CI: 0.0 },
    dir: -1,
    order: 15,
  },
  {
    id: 16,
    text: "Participating in khidmat for the community is an important part of my life.",
    category: "community_centrality",
    weights: { HP: 0.3, WP: 0.2, HF: 0.0, CI: 0.5 },
    dir: 1,
    order: 16,
  },
  {
    id: 17,
    text: "I keep personal boundaries while participating in religious and community activities.",
    category: "faith_approach",
    weights: { HP: 0.0, WP: 0.0, HF: 0.6, CI: 0.4 },
    dir: -1,
    order: 17,
  },
  {
    id: 18,
    text: "I enjoy Bohra cultural traditions along with the religious practices.",
    category: "community_centrality",
    weights: { HP: 0.3, WP: 0.2, HF: 0.0, CI: 0.5 },
    dir: 1,
    order: 18,
  },
  {
    id: 19,
    text: "Sometimes I reflect on how my personal choices align with community expectations.",
    category: "community_centrality",
    weights: { HP: 0.0, WP: 0.3, HF: 0.0, CI: 0.7 },
    dir: 1,
    order: 19,
  },
  {
    id: 20,
    text: "Having Aqa Moula name my children is meaningful to me.",
    category: "faith_approach",
    weights: { HP: 0.0, WP: 0.3, HF: 0.5, CI: 0.2 },
    dir: 1,
    order: 20,
  },
];

// Function to upload questions to Firestore
export const uploadQuestionsToFirestore = async () => {
  try {
    const questionsRef = collection(db, "personality_questions");

    for (const question of questions) {
      await setDoc(doc(questionsRef, `question_${question.id}`), question);
      console.log(`Uploaded question ${question.id}`);
    }

    console.log("All questions uploaded successfully!");
    return true;
  } catch (error) {
    console.error("Error uploading questions:", error);
    return false;
  }
};
