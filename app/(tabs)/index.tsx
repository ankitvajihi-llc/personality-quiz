import { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, ActivityIndicator, View, Text } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import LandingPage from "./LandingPage";
import PersonalityQuiz, {
  ArchetypeRankingUI,
  AxisScores,
} from "./PersonalityQuiz";
import ResultsScreen from "./ResultsScreen";

export default function Index() {
  const [phase, setPhase] = useState<"landing" | "quiz" | "results" | "loading">("loading");
  const [results, setResults] = useState<{
    scores: AxisScores;
    rankings: ArchetypeRankingUI[];
    resultDocId?: string;
  } | null>(null);

  const [userName, setUserName] = useState("");
  const [userUid, setUserUid] = useState<string | null>(null);
  const [fromApp, setFromApp] = useState(false);

  useEffect(() => {
    const checkForExistingResults = async () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const uid = params.get('uid');
        const source = params.get('source');
        const docId = params.get('docId'); // ✅ GET DOC ID FROM URL

        if (uid) {
          setUserUid(uid);
          setFromApp(source === 'app');
          console.log('✅ Detected UID from URL:', uid);

          // ✅ If resultDocId provided, fetch that result
          if (docId) {
            try {
              const docRef = doc(db, 'personality_quiz_results', docId);
              const docSnap = await getDoc(docRef);
              
              if (docSnap.exists()) {
                const data = docSnap.data();
                console.log('✅ Found existing quiz results:', docId);
                
                setResults({
                  scores: data.scores,
                  rankings: data.archetypes?.map((arch: any) => ({
                    key: arch.id,
                    label: arch.label,
                    match: arch.percentage,
                    color: '#D4654A',
                    emoji: '🏹',
                    arrow: '🏹',
                  })) || [],
                  resultDocId: docId, // ✅ Store the document ID for later use
                });
                setPhase("results");
                return;
              }
            } catch (error) {
              console.error("❌ Error fetching result:", error);
            }
          }
          
          // No resultDocId or not found - start fresh
          console.log('ℹ️ No existing results - starting fresh');
          setPhase("landing");
        } else {
          // No uid - normal web flow
          console.log('ℹ️ No uid - normal web visit');
          setPhase("landing");
        }
      }
    };

    checkForExistingResults();
  }, []);

  const handleStart = (name: string) => {
    setUserName(name);
    setPhase("quiz");
  };

  const handleQuizComplete = (payload: {
    scores: AxisScores;
    rankings: ArchetypeRankingUI[];
    resultDocId?: string;
  }) => {
    setResults(payload);
    setPhase("results");
  };

  const handleRetake = () => {
    setResults(null);
    setPhase("quiz");
  };

  if (phase === "loading") {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4654A" />
        <Text style={styles.loadingText}>Loading your results...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {phase === "landing" && <LandingPage onStart={handleStart} />}
      
      {phase === "quiz" && (
        <PersonalityQuiz 
          userName={userName} 
          onComplete={handleQuizComplete}
          userUid={userUid}
          fromApp={fromApp}
        />
      )}
      
      {phase === "results" && results && (
        <ResultsScreen
          scores={results.scores}
          rankings={results.rankings}
          resultDocId={results.resultDocId}
          onRetake={handleRetake}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0906",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0D0906",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#D4654A",
  },
});