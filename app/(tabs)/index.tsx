import { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import LandingPage from "./LandingPage";
import PersonalityQuiz, {
  ArchetypeRankingUI,
  AxisScores,
} from "./PersonalityQuiz";
import ResultsScreen from "./ResultsScreen";

export default function Index() {
  const [phase, setPhase] = useState<"landing" | "quiz" | "results">("landing");
  const [results, setResults] = useState<{
    scores: AxisScores;
    rankings: ArchetypeRankingUI[];
  } | null>(null);

  const handleStart = () => {
    setPhase("quiz");
  };

  const handleQuizComplete = (payload: {
    scores: AxisScores;
    rankings: ArchetypeRankingUI[];
  }) => {
    setResults(payload);
    setPhase("results");
  };

  const handleRetake = () => {
    setResults(null);
    setPhase("quiz");
  };

  return (
    <SafeAreaView style={styles.container}>
      {phase === "landing" && <LandingPage onStart={handleStart} />}
      {phase === "quiz" && <PersonalityQuiz onComplete={handleQuizComplete} />}
      {phase === "results" && results && (
        <ResultsScreen
          scores={results.scores}
          rankings={results.rankings}
          onRetake={handleRetake}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0906", // Dark background for landing page
  },
});

// import { SafeAreaView, StyleSheet } from 'react-native';
// import UploadQuestions from './UploadQuestions';

// export default function Index() {
//   return (
//     <SafeAreaView style={styles.container}>
//       <UploadQuestions />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
// });
