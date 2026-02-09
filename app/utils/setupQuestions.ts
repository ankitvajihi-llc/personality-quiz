import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.config';  // Adjust the path as needed
export interface QuestionWeights {
  CC: number;  // Community Centrality
  MP: number;  // Motivation for Practice
  PS: number;  // Practice Style
  M: number;   // Modernity
}

export interface Question {
  id: number;
  text: string;
  category: string;
  weights: QuestionWeights;
  order: number;
}

export const questions: Question[] = [
  {
    id: 1,
    text: "I'm deeply connected to the Bohra community and its practices",
    category: "community_centrality",
    weights: { CC: 0.7, MP: 0.3, PS: 0.0, M: 0.0 },
    order: 1
  },
  {
    id: 2,
    text: "During vaaz, I think about the message and what it means",
    category: "motivation_for_practice",
    weights: { CC: 0.0, MP: 0.3, PS: 0.7, M: 0.0 },
    order: 2
  },
  {
    id: 3,
    text: "I do maatham with focus and feeling.",
    category: "practice_style",
    weights: { CC: 0.2, MP: 0.0, PS: 0.8, M: 0.0 },
    order: 3
  },
  {
    id: 4,
    text: "I attend religious events to please my family and community",
    category: "motivation_for_practice",
    weights: { CC: 0.6, MP: 0.2, PS: 0.0, M: 0.2 },
    order: 4
  },
  {
    id: 5,
    text: "I reflect on my own understanding of faith, sometimes differently",
    category: "modernity",
    weights: { CC: 0.0, MP: 0.0, PS: 0.3, M: 0.7 },
    order: 5
  },
  {
    id: 6,
    text: "My daily routine often includes religious practices and community",
    category: "community_centrality",
    weights: { CC: 0.5, MP: 0.0, PS: 0.5, M: 0.0 },
    order: 6
  },
  {
    id: 7,
    text: "I shape my daily life more by personal priorities than by Bohra",
    category: "modernity",
    weights: { CC: 0.0, MP: 0.0, PS: 0.0, M: 1.0 },
    order: 7
  },
  {
    id: 8,
    text: "I follow Bohra principles while adapting them to fit modern",
    category: "modernity",
    weights: { CC: 0.0, MP: 0.3, PS: 0.0, M: 0.7 },
    order: 8
  },
  {
    id: 9,
    text: "Asking for razaa from Moula is meaningful when making decisions",
    category: "practice_style",
    weights: { CC: 0.3, MP: 0.7, PS: 0.0, M: 0.0 },
    order: 9
  },
  {
    id: 10,
    text: "I like to understand the reasons behind religious traditions",
    category: "motivation_for_practice",
    weights: { CC: 0.0, MP: 0.2, PS: 0.5, M: 0.3 },
    order: 10
  },
  {
    id: 11,
    text: "Certain moments during vaaz feel especially meaningful to",
    category: "motivation_for_practice",
    weights: { CC: 0.3, MP: 0.3, PS: 0.4, M: 0.0 },
    order: 11
  },
  {
    id: 12,
    text: "I make life choices based on what feels right for me, while",
    category: "modernity",
    weights: { CC: 0.0, MP: 0.3, PS: 0.0, M: 0.7 },
    order: 12
  },
  {
    id: 13,
    text: "Being part of the Bohra community is an important part of",
    category: "community_centrality",
    weights: { CC: 0.6, MP: 0.4, PS: 0.0, M: 0.0 },
    order: 13
  },
  {
    id: 14,
    text: "I try hard to attend multiple days of Moharram, not only Ashara",
    category: "practice_style",
    weights: { CC: 0.4, MP: 0.0, PS: 0.6, M: 0.0 },
    order: 14
  },
  {
    id: 15,
    text: "I sometimes find it hard to stay fully focused during vaaz or",
    category: "practice_style",
    weights: { CC: 0.0, MP: 0.0, PS: 0.0, M: 0.0 },
    order: 15
  },
  {
    id: 16,
    text: "Participating in khidmat for the community is an important",
    category: "community_centrality",
    weights: { CC: 0.4, MP: 0.4, PS: 0.2, M: 0.0 },
    order: 16
  },
  {
    id: 17,
    text: "I keep personal boundaries while participating in religious",
    category: "modernity",
    weights: { CC: 0.0, MP: 0.2, PS: 0.0, M: 0.8 },
    order: 17
  },
  {
    id: 18,
    text: "I enjoy Bohra cultural traditions along with the religious",
    category: "community_centrality",
    weights: { CC: 0.0, MP: 0.0, PS: 0.6, M: 0.4 },
    order: 18
  },
  {
    id: 19,
    text: "Sometimes I reflect on how my personal choices align with",
    category: "modernity",
    weights: { CC: 0.0, MP: 0.2, PS: 0.0, M: 0.8 },
    order: 19
  },
  {
    id: 20,
    text: "Having Aqa Moula name my children is meaningful to me.",
    category: "community_centrality",
    weights: { CC: 0.3, MP: 0.7, PS: 0.0, M: 0.0 },
    order: 20
  }
];

// Function to upload questions to Firestore
export const uploadQuestionsToFirestore = async () => {
  try {
    const questionsRef = collection(db, 'personality_questions');
    
    for (const question of questions) {
      await setDoc(doc(questionsRef, `question_${question.id}`), question);
      console.log(`Uploaded question ${question.id}`);
    }
    
    console.log('All questions uploaded successfully!');
    return true;
  } catch (error) {
    console.error('Error uploading questions:', error);
    return false;
  }
};