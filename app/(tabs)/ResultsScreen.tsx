import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Animated,
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

const { width } = Dimensions.get("window");
const isMobile = width < 768;

// Color palette
const C = {
  bg: "#0D0906",
  darkSoft: "#4A3828",
  dark: "#2A1F17",
  orange: "#D4654A",
  gold: "#D4A843",
  goldLight: "#E8CC7A",
  goldPale: "#F5E6B8",
  teal: "#5BA89D",
  rose: "#C97B6B",
  warmBg: "#FEF6EC",
};

interface AxisScore {
  CC: number;
  MP: number;
  PS: number;
  M: number;
}

interface ArchetypeRanking {
  key: string;
  label: string;
  match: number;
  color: string;
  emoji: string;
  arrow: string;
  description?: string;
  title?: string;
}

interface ResultsScreenProps {
  scores: AxisScore;
  rankings: ArchetypeRanking[];
  onRetake: () => void;
}

const TraitBar = ({ label, value, maxVal, color, delay }: any) => {
  const [animatedWidth] = useState(new Animated.Value(0));

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(animatedWidth, {
        toValue: (value / maxVal) * 100,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }, delay);
  }, []);

  return (
    <View style={styles.traitBarContainer}>
      <View style={styles.traitBarHeader}>
        <Text style={styles.traitBarLabel}>{label}</Text>
        <Text style={[styles.traitBarValue, { color }]}>
          {value.toFixed(1)} / {maxVal}
        </Text>
      </View>
      <View style={styles.traitBarBackground}>
        <Animated.View
          style={[
            styles.traitBarFill,
            {
              backgroundColor: color,
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

const SimilarCard = ({ arch, rank, delay }: any) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), delay);
  }, [delay]);

  return (
    <View style={[styles.similarCard, { opacity: visible ? 1 : 0 }]}>
      <View style={[styles.rankBadge, { backgroundColor: arch.color }]}>
        <Text style={styles.rankBadgeText}>#{rank}</Text>
      </View>

      <View style={styles.similarCardContent}>
        <View
          style={[
            styles.similarIconCircle,
            {
              backgroundColor: `${arch.color}15`,
              borderColor: `${arch.color}40`,
            },
          ]}
        >
          <Text style={styles.similarEmoji}>{arch.emoji}</Text>
        </View>

        <View style={styles.similarInfo}>
          <Text style={styles.similarLabel}>{arch.label}</Text>
          <Text style={styles.similarPercentage}>{arch.match}%</Text>
        </View>
      </View>

      <View style={styles.similarProgressContainer}>
        <Text style={styles.similarProgressLabel}>Similarity</Text>
        <View style={styles.similarProgressBar}>
          <View
            style={[
              styles.similarProgressFill,
              {
                width: visible ? `${arch.match}%` : "0%",
                backgroundColor: arch.color,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  scores,
  rankings,
  onRetake,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [firestoreRankings, setFirestoreRankings] = useState<ArchetypeRanking[]>([]);
  const [loadingArchetypes, setLoadingArchetypes] = useState(true);

  // Fetch archetypes from Firestore
  useEffect(() => {
    const fetchArchetypes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "personality_archetypes"));
        const archetypesMap: { [key: string]: any } = {};
        
        querySnapshot.forEach((doc) => {
          archetypesMap[doc.id] = doc.data();
        });

        // Merge Firestore data with rankings structure
        const updatedRankings = rankings.map((ranking) => {
          const firestoreData = archetypesMap[ranking.key] || {};
          return {
            ...ranking,
            label: firestoreData.title || ranking.label,
            description: firestoreData.description || "",
          };
        });

        setFirestoreRankings(updatedRankings);
      } catch (error) {
        console.error("Error fetching archetypes:", error);
        setFirestoreRankings(rankings);
      } finally {
        setLoadingArchetypes(false);
      }
    };

    fetchArchetypes();
  }, [rankings]);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    setTimeout(() => setShowContent(true), 700);
  }, []);

  const displayRankings = firestoreRankings.length > 0 ? firestoreRankings : rankings;
  const primary = displayRankings[0];
  const similar = displayRankings.slice(1, 4);

  const axes = [
    { key: "CC", label: "Community Centrality", color: C.orange },
    { key: "MP", label: "Moula & Personal Devotion", color: C.gold },
    { key: "PS", label: "Practice & Engagement", color: C.teal },
    { key: "M", label: "Modernity & Independence", color: C.rose },
  ];

  if (loadingArchetypes) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your results...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        {/* Cupid mascot */}
        <View style={[styles.mascotContainer, { opacity: loaded ? 1 : 0 }]}>
          <Image
            source={require("../../assets/images/bohricupid.png")}
            style={styles.mascotImage}
            resizeMode="contain"
          />
        </View>

        {/* Primary Result */}
        <View style={[styles.primaryResult, { opacity: loaded ? 1 : 0 }]}>
          <View style={[styles.matchBadge, { backgroundColor: primary.color }]}>
            <Text style={styles.matchBadgeText}>
              {primary.arrow} {primary.match}% Match
            </Text>
          </View>

          <Text style={styles.primaryLabel}>{primary.label}</Text>
        </View>
      </View>

      <View style={styles.contentSection}>
        {/* Trait Spectrum */}
        <View style={styles.traitCard}>
          <Text style={styles.sectionTitle}>Your Trait Spectrum</Text>
          {axes.map((ax, i) => (
            <TraitBar
              key={ax.key}
              label={ax.label}
              value={scores[ax.key as keyof AxisScore]}
              maxVal={5}
              color={ax.color}
              delay={500 + i * 180}
            />
          ))}
        </View>

        {/* Description from Database */}
        {primary.description && (
          <View style={[styles.reportCard, { opacity: showContent ? 1 : 0 }]}>
            <Text style={styles.reportText}>{primary.description}</Text>
          </View>
        )}

        {/* Similar Types */}
        <View style={styles.similarSection}>
          <Text style={styles.similarSectionTitle}>
            🏹 Your Personality Neighbours
          </Text>
          <Text style={styles.similarSectionSubtitle}>
            Other archetypes Cupid's arrow grazed
          </Text>

          <View style={styles.similarCardsContainer}>
            {similar.map((arch, i) => (
              <SimilarCard
                key={arch.key}
                arch={arch}
                rank={i + 2}
                delay={200 + i * 180}
              />
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareButtonText}>Share Results 🏹</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.retakeButton} onPress={onRetake}>
            <Text style={styles.retakeButtonText}>Retake Test</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.warmBg,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.warmBg,
  },
  loadingText: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: C.darkSoft,
  },
  heroSection: {
    backgroundColor: C.bg,
    paddingTop: 48,
    paddingBottom: 72,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  mascotContainer: {
    marginBottom: 8,
  },
  mascotImage: {
    width: 160,
    height: 160,
  },
  primaryResult: {
    alignItems: "center",
    marginTop: 12,
  },
  matchBadge: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 14,
  },
  matchBadgeText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: Fonts.weights.extrabold,
    color: "#FFFFFF",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  primaryLabel: {
    fontFamily: Fonts.serif,
    fontSize: 34,
    fontWeight: Fonts.weights.extrabold,
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  contentSection: {
    maxWidth: 540,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 16,
  },
  traitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 26,
    marginTop: -34,
    shadowColor: "rgba(42, 31, 23, 0.06)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: `${C.goldPale}40`,
  },
  sectionTitle: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    fontWeight: Fonts.weights.bold,
    color: C.dark,
    marginBottom: 20,
  },
  traitBarContainer: {
    marginBottom: 18,
  },
  traitBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  traitBarLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: Fonts.weights.semibold,
    color: C.darkSoft,
  },
  traitBarValue: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: Fonts.weights.bold,
  },
  traitBarBackground: {
    height: 10,
    borderRadius: 5,
    backgroundColor: `${C.goldPale}40`,
    overflow: "hidden",
  },
  traitBarFill: {
    height: "100%",
    borderRadius: 5,
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 26,
    marginTop: 16,
    shadowColor: "rgba(42, 31, 23, 0.06)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: `${C.goldPale}40`,
  },
  reportText: {
    fontFamily: Fonts.sans,
    fontSize: 14.5,
    lineHeight: 25,
    color: "#6A6A6A",
  },
  similarSection: {
    marginTop: 40,
  },
  similarSectionTitle: {
    fontFamily: Fonts.serif,
    fontSize: 23,
    fontWeight: Fonts.weights.extrabold,
    color: C.dark,
    textAlign: "center",
    marginBottom: 4,
  },
  similarSectionSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: "#AAAAAA",
    textAlign: "center",
    marginBottom: 22,
  },
  similarCardsContainer: {
    gap: 14,
  },
  similarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 22,
    shadowColor: "rgba(42, 31, 23, 0.06)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: `${C.goldPale}50`,
    position: "relative",
  },
  rankBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingVertical: 5,
    paddingHorizontal: 14,
    paddingLeft: 18,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
  },
  rankBadgeText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: Fonts.weights.extrabold,
    color: "#FFFFFF",
  },
  similarCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  similarIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  similarEmoji: {
    fontSize: 22,
  },
  similarInfo: {
    flex: 1,
  },
  similarLabel: {
    fontFamily: Fonts.serif,
    fontSize: 17,
    fontWeight: Fonts.weights.bold,
    color: C.dark,
  },
  similarPercentage: {
    fontFamily: Fonts.sans,
    fontSize: 20,
    fontWeight: Fonts.weights.extrabold,
  },
  similarProgressContainer: {
    marginBottom: 10,
  },
  similarProgressLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: Fonts.weights.bold,
    color: "#BBBBBB",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  similarProgressBar: {
    height: 7,
    borderRadius: 4,
    backgroundColor: `${C.goldPale}40`,
    overflow: "hidden",
  },
  similarProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
    paddingBottom: 20,
  },
  shareButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 36,
    backgroundColor: C.orange,
    alignItems: "center",
    shadowColor: `${C.orange}30`,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 4,
  },
  shareButtonText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: Fonts.weights.bold,
    color: "#FFFFFF",
  },
  retakeButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: C.goldPale,
    alignItems: "center",
  },
  retakeButtonText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: Fonts.weights.bold,
    color: C.darkSoft,
  },
});

export default ResultsScreen;