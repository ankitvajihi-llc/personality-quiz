import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebase.config";
import { Fonts } from "../fonts";
import { saveCrossProjectSnapshot } from "../utils/cloudFunctions"; // ✅ ADDED
import { ArchetypeData } from "../utils/setupArchetypes";
import { Question, QuestionWeights } from "../utils/setupQuestions";
import QuestionItem from "./components/QuestionItem";

interface Answer {
  questionId: number;
  question: string;
  answer: number;
  weights: QuestionWeights;
  dir: number;
}

export interface AxisScores {
  HP: number;
  WP: number;
  HF: number;
  CI: number;
}

interface ArchetypeMatch {
  id: string;
  archetype_id: any;
  percentage: number;
  distance: number;
}

export interface ArchetypeRankingUI {
  key: string;
  label: string;
  match: number;
  color: string;
  emoji: string;
  arrow: string;
  description?: string;
  title?: string;
}

interface PersonalityQuizProps {
  userName?: string;
  userUid?: string | null; // ✅ ADDED
  fromApp?: boolean; // ✅ ADDED
  onComplete?: (payload: {
    scores: AxisScores;
    rankings: ArchetypeRankingUI[];
    resultDocId: string;
  }) => void;
}

const { width } = Dimensions.get("window");
const isMobile = width < 768;

const PersonalityQuiz: React.FC<PersonalityQuizProps> = ({
  userName,
  userUid, // ✅ ADDED
  fromApp, // ✅ ADDED
  onComplete,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [focusedQuestionIndex, setFocusedQuestionIndex] = useState(0);
  const [archetypes, setArchetypes] = useState<ArchetypeData[]>([]);
  const [consentChoice, setConsentChoice] = useState<boolean | null>(null); // ✅ ADDED

  useEffect(() => {
    loadQuestions();
    loadArchetypes();
  }, []);

  const loadArchetypes = async () => {
    try {
      const archetypesRef = collection(db, "personality_archetypes");
      const q = query(archetypesRef, orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);

      const loadedArchetypes: ArchetypeData[] = [];
      querySnapshot.forEach((docSnap) => {
        loadedArchetypes.push({
          ...docSnap.data(),
          id: docSnap.id,
        } as ArchetypeData);
      });

      setArchetypes(loadedArchetypes);
    } catch (error) {
      console.error("Error loading archetypes:", error);
    }
  };

  const loadQuestions = async () => {
    try {
      const questionsRef = collection(db, "personality_questions");
      const q = query(questionsRef, orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);

      const loadedQuestions: Question[] = [];
      querySnapshot.forEach((doc) => {
        loadedQuestions.push(doc.data() as Question);
      });

      setQuestions(loadedQuestions);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  };

  const scaleOptions = [
    { value: 0, label: "Strongly Disagree" },
    { value: 1, label: "" },
    { value: 2, label: "" },
    { value: 3, label: "" },
    { value: 4, label: "Strongly Agree" },
  ];

  const calculateWeightedScores = (
    allAnswers: Record<number, Answer>,
  ): AxisScores => {
    console.log("=== STARTING CALCULATION ===");

    const rawScores = { HP: 0, WP: 0, HF: 0, CI: 0 };
    const maxPossible = { HP: 0, WP: 0, HF: 0, CI: 0 };

    Object.values(allAnswers).forEach((item) => {
      const rawAnswer = Number(item.answer);
      const direction = Number(item.dir);

      const wHP = Number(item.weights?.HP || 0);
      const wWP = Number(item.weights?.WP || 0);
      const wHF = Number(item.weights?.HF || 0);
      const wCI = Number(item.weights?.CI || 0);

      const adjustedAnswer = direction === -1 ? 4 - rawAnswer : rawAnswer;

      rawScores.HP += adjustedAnswer * wHP;
      rawScores.WP += adjustedAnswer * wWP;
      rawScores.HF += adjustedAnswer * wHF;
      rawScores.CI += adjustedAnswer * wCI;

      maxPossible.HP += 4 * wHP;
      maxPossible.WP += 4 * wWP;
      maxPossible.HF += 4 * wHF;
      maxPossible.CI += 4 * wCI;
    });

    console.log("Raw Sums:", rawScores);
    console.log("Max Possible:", maxPossible);

    const normalize = (raw: number, max: number) => {
      if (max === 0) return 0;
      return (raw / max) * 4;
    };

    const finalScores: AxisScores = {
      HP: Number(normalize(rawScores.HP, maxPossible.HP).toFixed(2)),
      WP: Number(normalize(rawScores.WP, maxPossible.WP).toFixed(2)),
      HF: Number(normalize(rawScores.HF, maxPossible.HF).toFixed(2)),
      CI: Number(normalize(rawScores.CI, maxPossible.CI).toFixed(2)),
    };

    console.log("Final Normalized Scores:", finalScores);
    return finalScores;
  };

  const calculateArchetypePercentages = (
    userScores: AxisScores,
  ): ArchetypeMatch[] => {
    if (archetypes.length === 0) return [];

    const MAX_DISTANCE = 8.0;

    const matches = archetypes.map((archetype) => {
      const tgtHP = Number(archetype.axes_target?.HP || 0);
      const tgtWP = Number(archetype.axes_target?.WP || 0);
      const tgtHF = Number(archetype.axes_target?.HF || 0);
      const tgtCI = Number(archetype.axes_target?.CI || 0);

      const distance = Math.sqrt(
        Math.pow(userScores.HP - tgtHP, 2) +
          Math.pow(userScores.WP - tgtWP, 2) +
          Math.pow(userScores.HF - tgtHF, 2) +
          Math.pow(userScores.CI - tgtCI, 2),
      );

      const similarity = (1 - distance / MAX_DISTANCE) * 100;

      const percentage = Math.max(
        0,
        Math.min(100, Number(similarity.toFixed(1))),
      );

      return {
        id: archetype.id,
        archetype_id: doc(db, "personality_archetypes", archetype.id),
        percentage,
        distance,
      };
    });

    return matches.sort((a, b) => b.percentage - a.percentage);
  };

  const handleAnswerSelect = (questionId: number, value: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const newAnswers = {
      ...answers,
      [questionId]: {
        questionId: question.id,
        question: question.text,
        answer: value,
        weights: question.weights,
        dir: question.dir,
      },
    };
    setAnswers(newAnswers);

    const currentBatch = questions.slice(currentQuestion, currentQuestion + 3);
    const nextUnanswered = currentBatch.findIndex(
      (q, idx) => !newAnswers[q.id] && q.id !== questionId,
    );

    if (nextUnanswered !== -1) {
      setFocusedQuestionIndex(nextUnanswered);
    }
  };

  const currentBatch = questions.slice(currentQuestion, currentQuestion + 3);
  const isBatchComplete =
    currentBatch.length > 0 && currentBatch.every((q) => !!answers[q.id]);

  useEffect(() => {
    const firstUnanswered = currentBatch.findIndex((q) => !answers[q.id]);
    setFocusedQuestionIndex(firstUnanswered !== -1 ? firstUnanswered : 0);
  }, [currentQuestion, answers, currentBatch]);

  const handleNext = async () => {
    if (!isBatchComplete) return;

    if (currentQuestion + 3 < questions.length) {
      setCurrentQuestion(currentQuestion + 3);
    } else {
      // ✅ CHANGED: Don't submit immediately if from app
      if (userUid && fromApp && consentChoice === null) {
        // Just scroll down - consent banner will show
        return;
      }
      await submitQuiz(answers);
    }
  };

  const submitQuiz = async (finalAnswers: Record<number, Answer>) => {
    setIsSubmitting(true);

    try {
      const weightedScores = calculateWeightedScores(finalAnswers);
      const archetypeMatches = calculateArchetypePercentages(weightedScores);

      const uiRankings: ArchetypeRankingUI[] = archetypeMatches
        .map((match) => {
          const archetype = archetypes.find((a) => a.id === match.id);
          if (!archetype) return null;

          return {
            key: match.id,
            match: match.percentage,
            label: archetype.title,
            title: archetype.title,
            description: archetype.description,
            color: "#D4654A",
            emoji: "🏹",
            arrow: "🏹",
          };
        })
        .filter(Boolean) as ArchetypeRankingUI[];

      const quizData = {
        userId: userUid || userId || "anonymous",
        userName: userName || "Anonymous",
        answers: finalAnswers,
        scores: weightedScores,
        archetypes: archetypeMatches.map((m) => ({
          id: m.id,
          archetype_id: m.archetype_id,
          percentage: m.percentage,
          distance: m.distance,
        })),
        totalQuestions: questions.length,
        completedAt: new Date().toISOString(),
        timestamp: new Date(),
      };

      const docRef = await addDoc(
        collection(db, "personality_quiz_results"),
        quizData,
      );

      console.log("✅ Quiz saved with ID:", docRef.id);

      // ✅ ADDED: Save snapshot if user consented
      if (userUid && consentChoice === true) {
        try {
          await saveCrossProjectSnapshot({
            uid: userUid,
            quizResultDocId: docRef.id,
            userConsent: true,
          });
          console.log("✅ Snapshot saved to main project");
        } catch (error) {
          console.error("❌ Failed to save snapshot:", error);
        }
      }

      if (onComplete) {
        onComplete({
          scores: weightedScores,
          rankings: uiRankings,
          resultDocId: docRef.id,
        });
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

  // ✅ ADDED: Check if we're on last batch and all answered
  const isOnLastBatch = currentQuestion + 3 >= questions.length;
  const allQuestionsAnswered = answeredCount === questions.length;
  const showConsentBanner =
    userUid && fromApp && isOnLastBatch && allQuestionsAnswered;
  const canSubmit = showConsentBanner
    ? consentChoice !== null
    : isBatchComplete;

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/Group 38.png")}
          style={styles.headerLogo}
          resizeMode="contain"
        />

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {answeredCount} of {questions.length} answered
          </Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>

      {currentQuestion > 0 && (
        <TouchableOpacity onPress={handlePrevious} style={styles.backButton}>
          <Text style={styles.backButtonText}>← PREVIOUS</Text>
        </TouchableOpacity>
      )}

      <View style={styles.cardContainer}>
        {currentBatch.map((q, index) => {
          const isFocused = focusedQuestionIndex === index;

          return (
            <React.Fragment key={q.id}>
              <QuestionItem
                question={q}
                isActive={isFocused}
                currentQuestionIndex={currentQuestion + index}
                selectedAnswer={answers[q.id]?.answer ?? null}
                onAnswerSelect={(val) => handleAnswerSelect(q.id, val)}
                scaleOptions={scaleOptions}
              />
              {index < currentBatch.length - 1 && (
                <View style={{ height: 0 }} />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* ✅ ADDED: Consent banner after last question */}
      {showConsentBanner && (
        <View style={styles.consentBanner}>
          <Text style={styles.consentTitle}>🏹 Link to Your Profile?</Text>
          <Text style={styles.consentText}>
            Show your personality results on your BohriCupid profile for others
            to see
          </Text>
          <View style={styles.consentButtons}>
            <TouchableOpacity
              style={[
                styles.consentButton,
                consentChoice === true && styles.consentButtonSelected,
              ]}
              onPress={() => setConsentChoice(true)}
            >
              <Text
                style={[
                  styles.consentButtonText,
                  consentChoice === true && styles.consentButtonTextSelected,
                ]}
              >
                Yes, link to profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.consentButton,
                styles.consentButtonNo,
                consentChoice === false && styles.consentButtonNoSelected,
              ]}
              onPress={() => setConsentChoice(false)}
            >
              <Text
                style={[
                  styles.consentButtonText,
                  consentChoice === false && styles.consentButtonTextSelected,
                ]}
              >
                No, keep private
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={[styles.nextButton, !canSubmit && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!canSubmit}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestion + 3 >= questions.length
              ? "See My Results 🏹"
              : "Next →"}
          </Text>
        </TouchableOpacity>

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
    backgroundColor: "#FEF6EC",
  },
  contentContainer: {
    padding: isMobile ? 16 : 24,
    maxWidth: 520,
    width: "100%",
    alignSelf: "center",
    paddingTop: 32,
    paddingBottom: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FEF6EC",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    width: "100%",
  },
  headerLogo: {
    width: isMobile ? 355 : 444,
    height: isMobile ? 119 : 149,
    marginBottom: 16,
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 2.5,
    borderColor: "#D4A843",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#D4654A",
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
    color: "#2A1F17",
    fontFamily: Fonts.serif,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
  },
  progressText: {
    fontSize: 12,
    color: "#BBBBBB",
    marginBottom: 7,
    fontWeight: Fonts.weights.medium,
    fontFamily: Fonts.sans,
  },
  progressBarBackground: {
    width: "100%",
    height: 5,
    backgroundColor: "rgba(245, 230, 184, 0.6)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#D4654A",
    borderRadius: 3,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 3,
    marginBottom: 6,
  },
  backButtonText: {
    fontSize: 12,
    color: "#D4654A",
    fontWeight: Fonts.weights.bold,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontFamily: Fonts.sans,
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: isMobile ? 4 : 4,
    paddingHorizontal: isMobile ? 26 : 26,
    width: "100%",
    shadowColor: "rgba(42, 31, 23, 0.06)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(245, 230, 184, 0.4)",
  },
  // ✅ ADDED: Consent banner styles
  consentBanner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    marginTop: 20,
    borderWidth: 2,
    borderColor: "#D4654A",
    shadowColor: "rgba(212, 101, 74, 0.2)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  consentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D4654A",
    marginBottom: 8,
    fontFamily: Fonts.serif,
    textAlign: "center",
  },
  consentText: {
    fontSize: 14,
    color: "#2A1F17",
    marginBottom: 20,
    fontFamily: Fonts.sans,
    lineHeight: 20,
    textAlign: "center",
  },
  consentButtons: {
    flexDirection: isMobile ? "column" : "row",
    gap: 12,
  },
  consentButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#D4654A",
    alignItems: "center",
  },
  consentButtonSelected: {
    backgroundColor: "#D4654A",
  },
  consentButtonNo: {
    borderColor: "#8B7355",
  },
  consentButtonNoSelected: {
    backgroundColor: "#8B7355",
    borderColor: "#8B7355",
  },
  consentButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#D4654A",
    fontFamily: Fonts.sans,
  },
  consentButtonTextSelected: {
    color: "#FFFFFF",
  },
  footerContainer: {
    marginTop: 20,
    width: "100%",
  },
  nextButton: {
    paddingVertical: 15,
    borderRadius: 36,
    backgroundColor: "#D4654A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(212, 101, 74, 0.3)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: "#DDDDDD",
    shadowOpacity: 0,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: Fonts.weights.bold,
    color: "#FFFFFF",
    fontFamily: Fonts.sans,
  },
  pageDotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 7,
    marginTop: 16,
  },
  pageDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(245, 230, 184, 0.8)",
    opacity: 0.5,
  },
  pageDotActive: {
    width: 22,
    backgroundColor: "#D4654A",
    opacity: 1,
  },
  pageDotCompleted: {
    backgroundColor: "#D4A843",
    opacity: 0.5,
  },
  completionContainer: {
    alignItems: "center",
    padding: 40,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#D4654A",
    marginBottom: 16,
  },
  completionText: {
    fontSize: 18,
    textAlign: "center",
    color: "#2A1F17",
    marginBottom: 8,
  },
  completionSubtext: {
    fontSize: 14,
    textAlign: "center",
    color: "#8B7355",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8B7355",
  },
  errorText: {
    fontSize: 18,
    color: "#D32F2F",
    textAlign: "center",
  },
});

export default PersonalityQuiz;
