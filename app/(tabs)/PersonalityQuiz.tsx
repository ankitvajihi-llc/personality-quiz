import { addDoc, collection, doc, getDocs, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../firebase.config';
import { Question, QuestionWeights } from '../utils/setupQuestions';
import QuestionItem from './components/QuestionItem';
import { Fonts } from '../fonts';
import { ArchetypeData } from '../utils/setupArchetypes';
import {
  ARCHETYPE_PROFILES,
  ArchetypeProfile,
} from '../utils/archetypeProfiles';

interface Answer {
  questionId: number;
  question: string;
  answer: number;
  weights: QuestionWeights;
}

export interface AxisScores {
  CC: number;
  MP: number;
  PS: number;
  M: number;
}

interface ArchetypeMatch {
  id: string;
  archetype_id: any; // Firestore DocumentReference
  percentage: number;
}

export interface ArchetypeRankingUI extends ArchetypeProfile {
  key: string;
  match: number;
}

interface PersonalityQuizProps {
  onComplete?: (payload: { scores: AxisScores; rankings: ArchetypeRankingUI[] }) => void;
}

const { width } = Dimensions.get('window');
const isMobile = width < 768;

const PersonalityQuiz: React.FC<PersonalityQuizProps> = ({ onComplete }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [focusedQuestionIndex, setFocusedQuestionIndex] = useState(0);
  const [archetypes, setArchetypes] = useState<ArchetypeData[]>([]);


  useEffect(() => {
    loadQuestions();
    loadArchetypes();

  }, []);

const loadArchetypes = async () => {
  try {
    const archetypesRef = collection(db, 'personality_archetypes');
    const q = query(archetypesRef, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const loadedArchetypes: ArchetypeData[] = [];
    querySnapshot.forEach((docSnap) => {
      loadedArchetypes.push({
        ...docSnap.data(),
        id: docSnap.id  // Store the Firestore document ID
      } as ArchetypeData);
    });
    
    setArchetypes(loadedArchetypes);
  } catch (error) {
    console.error('Error loading archetypes:', error);
  }
};
  const loadQuestions = async () => {
    try {
      const questionsRef = collection(db, 'personality_questions');
      const q = query(questionsRef, orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);

      const loadedQuestions: Question[] = [];
      querySnapshot.forEach((doc) => {
        loadedQuestions.push(doc.data() as Question);
      });

      setQuestions(loadedQuestions);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  // 5-point scale options
  const scaleOptions = [
    { value: 1, label: 'Strongly Agree' },
    { value: 2, label: '' },
    { value: 3, label: '' },
    { value: 4, label: '' },
    { value: 5, label: 'Strongly Disagree' },
  ];

const calculateWeightedScores = (allAnswers: Record<number, Answer>): AxisScores => {
  // Step 1: Calculate raw weighted contributions
  const rawScores: AxisScores = { CC: 0, MP: 0, PS: 0, M: 0 };
  
  Object.values(allAnswers).forEach((answer) => {
    rawScores.CC += answer.answer * answer.weights.CC;
    rawScores.MP += answer.answer * answer.weights.MP;
    rawScores.PS += answer.answer * answer.weights.PS;
    rawScores.M += answer.answer * answer.weights.M;
  });

  // Step 2: Calculate max possible scores for each axis
  const maxPossible: AxisScores = { CC: 0, MP: 0, PS: 0, M: 0 };
  
  questions.forEach((question) => {
    maxPossible.CC += 5 * question.weights.CC;
    maxPossible.MP += 5 * question.weights.MP;
    maxPossible.PS += 5 * question.weights.PS;
    maxPossible.M += 5 * question.weights.M;
  });

  // Step 3: Normalize to 0-5 scale
  // Formula: (Raw Sum ÷ Max Possible) × 5
  const normalizedScores: AxisScores = {
    CC: maxPossible.CC > 0 ? (rawScores.CC / maxPossible.CC) * 5 : 0,
    MP: maxPossible.MP > 0 ? (rawScores.MP / maxPossible.MP) * 5 : 0,
    PS: maxPossible.PS > 0 ? (rawScores.PS / maxPossible.PS) * 5 : 0,
    M: maxPossible.M > 0 ? (rawScores.M / maxPossible.M) * 5 : 0,
  };

  // Round to 2 decimal places
  return {
    CC: Math.round(normalizedScores.CC * 100) / 100,
    MP: Math.round(normalizedScores.MP * 100) / 100,
    PS: Math.round(normalizedScores.PS * 100) / 100,
    M: Math.round(normalizedScores.M * 100) / 100,
  };
};

const calculateArchetypePercentages = (userScores: AxisScores): ArchetypeMatch[] => {
  if (archetypes.length === 0) {
    console.warn('No archetypes loaded');
    return [];
  }

  // Step 1: Calculate Euclidean distance for each archetype
  const archetypeDistances = archetypes.map((archetype) => {
    const target = archetype.axes_target;
    
    // Distance = √[Σ(user_score - target)²]
    const distance = Math.sqrt(
      Math.pow(userScores.CC - target.CC, 2) +
      Math.pow(userScores.MP - target.MP, 2) +
      Math.pow(userScores.PS - target.PS, 2) +
      Math.pow(userScores.M - target.M, 2)
    );

    return {
      archetype,
      distance,
    };
  });

  // Step 2: Max possible distance in 4D space (0-5 scale)
  // = √(5² + 5² + 5² + 5²) = 10
  const maxDistance = 10;

  // Step 3: Convert distance to similarity percentage
  // Similarity % = (1 - distance/maxDistance) × 100
  const archetypeMatches: ArchetypeMatch[] = archetypeDistances.map(({ archetype, distance }) => {
    const similarity = (1 - (distance / maxDistance)) * 100;
    const percentage = Math.max(0, Math.min(100, Math.round(similarity * 10) / 10));

    // Create Firestore document reference
    const archetypeRef = doc(db, 'personality_archetypes', archetype.id);

    return {
      id: archetype.id,
      archetype_id: archetypeRef,
      percentage,
    };
  });

  // Step 4: Sort by percentage (highest first)
  archetypeMatches.sort((a, b) => b.percentage - a.percentage);

  return archetypeMatches;
};

  const handleAnswerSelect = (questionId: number, value: number) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const newAnswers = {
      ...answers,
      [questionId]: {
        questionId: question.id,
        question: question.text,
        answer: value,
        weights: question.weights
      }
    };
    setAnswers(newAnswers);

    // Auto-advance focus to next unanswered question in batch
    const currentBatch = questions.slice(currentQuestion, currentQuestion + 3);
    const nextUnanswered = currentBatch.findIndex((q, idx) => 
      !newAnswers[q.id] && q.id !== questionId
    );
    
    if (nextUnanswered !== -1) {
      setFocusedQuestionIndex(nextUnanswered);
    }
  };

  const currentBatch = questions.slice(currentQuestion, currentQuestion + 3);
  const isBatchComplete = currentBatch.length > 0 && currentBatch.every(q => !!answers[q.id]);

  useEffect(() => {
    // Reset focus when page changes
    const firstUnanswered = currentBatch.findIndex(q => !answers[q.id]);
    setFocusedQuestionIndex(firstUnanswered !== -1 ? firstUnanswered : 0);
  }, [currentQuestion, answers, currentBatch]);

  const handleNext = async () => {
    if (!isBatchComplete) return;

    if (currentQuestion + 3 < questions.length) {
      setCurrentQuestion(currentQuestion + 3);
    } else {
      await submitQuiz(answers);
    }
  };

  const submitQuiz = async (finalAnswers: Record<number, Answer>) => {
    setIsSubmitting(true);

    try {
      const weightedScores = calculateWeightedScores(finalAnswers);
      const archetypeMatches = calculateArchetypePercentages(weightedScores);

      // Build UI-friendly rankings from matches using static profiles
      const uiRankings: ArchetypeRankingUI[] = archetypeMatches
        .map((match) => {
          const profile = ARCHETYPE_PROFILES[match.id];
          if (!profile) return null;
          return {
            key: match.id,
            match: match.percentage,
            ...profile,
          };
        })
        .filter(Boolean) as ArchetypeRankingUI[];

      const quizData = {
        userId: userId || 'anonymous',
        answers: finalAnswers,
        scores: weightedScores,
        archetypes: archetypeMatches,
        totalQuestions: questions.length,
        completedAt: new Date().toISOString(),
        timestamp: new Date()
      };

      const docRef = await addDoc(collection(db, 'personality_quiz_results'), quizData);

      console.log('Quiz saved with ID:', docRef.id);
      console.log('Weighted Scores:', weightedScores);

      // Let parent screen transition to the rich results view
      if (onComplete) {
        onComplete({ scores: weightedScores, rankings: uiRankings });
      }

      setIsComplete(true);
    } catch (error) {
      console.error("Error saving quiz:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion >= 3) {
      setCurrentQuestion(currentQuestion - 3);
    } else if (currentQuestion > 0) {
      setCurrentQuestion(0);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#D4654A" />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No questions available.</Text>
      </View>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;
  const totalPages = Math.ceil(questions.length / 3);
  const currentPage = Math.floor(currentQuestion / 3);

  if (isSubmitting) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#D4654A" />
        <Text style={styles.loadingText}>Calculating your results...</Text>
      </View>
    );
  }

  if (isComplete) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.completionContainer}>
          <Text style={styles.completionTitle}>🎉 Thank You!</Text>
          <Text style={styles.completionText}>
            Your Bohri Cupid personality assessment is complete.
          </Text>
          <Text style={styles.completionSubtext}>
            Your results have been saved.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🏹</Text>
          </View>
          <Text style={styles.logo}>Bohri Cupid</Text>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {answeredCount} of {questions.length} answered
          </Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>

      {/* Previous Button */}
      {currentQuestion > 0 && (
        <TouchableOpacity onPress={handlePrevious} style={styles.backButton}>
          <Text style={styles.backButtonText}>← PREVIOUS</Text>
        </TouchableOpacity>
      )}

      {/* Question Card */}
      <View style={styles.cardContainer}>
        {currentBatch.map((q, index) => {
          const isFocused = focusedQuestionIndex === index;

          return (
            <React.Fragment key={q.id}>
              <QuestionItem
                question={q}
                isActive={isFocused}
                currentQuestionIndex={currentQuestion + index}
                selectedAnswer={answers[q.id]?.answer || null}
                onAnswerSelect={(val) => handleAnswerSelect(q.id, val)}
                scaleOptions={scaleOptions}
              />
              {index < currentBatch.length - 1 && <View style={{ height: 0 }} />}
            </React.Fragment>
          );
        })}
      </View>

      {/* Next Button */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !isBatchComplete && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!isBatchComplete}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestion + 3 >= questions.length ? 'See My Results 🏹' : 'Next →'}
          </Text>
        </TouchableOpacity>

        {/* Page Dots */}
        <View style={styles.pageDotsContainer}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.pageDot,
                i === currentPage && styles.pageDotActive,
                i < currentPage && styles.pageDotCompleted,
              ]}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF6EC',
  },
  contentContainer: {
    padding: isMobile ? 16 : 24,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 32,
    paddingBottom: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF6EC',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#D4A843',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4654A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4,
  },
  logoEmoji: {
    fontSize: 18,
  },
  logo: {
    fontSize: 20,
    fontWeight: Fonts.weights.bold,
    color: '#2A1F17',
    fontFamily: Fonts.serif,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    color: '#BBBBBB',
    marginBottom: 7,
    fontWeight: Fonts.weights.medium,
    fontFamily: Fonts.sans,
  },
  progressBarBackground: {
    width: '100%',
    height: 5,
    backgroundColor: 'rgba(245, 230, 184, 0.6)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D4654A',
    borderRadius: 3,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    marginBottom: 6,
  },
  backButtonText: {
    fontSize: 12,
    color: '#D4654A',
    fontWeight: Fonts.weights.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: Fonts.sans,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: isMobile ? 4 : 4,
    paddingHorizontal: isMobile ? 26 : 26,
    width: '100%',
    shadowColor: 'rgba(42, 31, 23, 0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 230, 184, 0.4)',
  },
  footerContainer: {
    marginTop: 20,
    width: '100%',
  },
  nextButton: {
    paddingVertical: 15,
    borderRadius: 36,
    backgroundColor: '#D4654A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(212, 101, 74, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#DDDDDD',
    shadowOpacity: 0,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: Fonts.weights.bold,
    color: '#FFFFFF',
    fontFamily: Fonts.sans,
  },
  pageDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
    marginTop: 16,
  },
  pageDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(245, 230, 184, 0.8)',
    opacity: 0.5,
  },
  pageDotActive: {
    width: 22,
    backgroundColor: '#D4654A',
    opacity: 1,
  },
  pageDotCompleted: {
    backgroundColor: '#D4A843',
    opacity: 0.5,
  },
  completionContainer: {
    alignItems: 'center',
    padding: 40,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4654A',
    marginBottom: 16,
  },
  completionText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#2A1F17',
    marginBottom: 8,
  },
  completionSubtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#8B7355',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B7355',
  },
  errorText: {
    fontSize: 18,
    color: '#D32F2F',
    textAlign: 'center',
  },
});

export default PersonalityQuiz;