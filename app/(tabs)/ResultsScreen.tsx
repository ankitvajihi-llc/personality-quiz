import { BlurView } from "expo-blur";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { db } from "../firebase.config";
import { Fonts } from "../fonts";

const { width } = Dimensions.get("window");
const isMobile = width < 768;

// --- CONFIG & COLORS ---
const SLIDER_LABELS = [
  { value: 1, emoji: "😅", label: "Not me at all", subtext: "Cupid missed!" },
  { value: 2, emoji: "🤔", label: "Kinda off", subtext: "Close but no cigar" },
  { value: 3, emoji: "😏", label: "Somewhat", subtext: "Getting warmer..." },
  {
    value: 4,
    emoji: "😊",
    label: "Pretty accurate",
    subtext: "Cupid's got aim!",
  },
  { value: 5, emoji: "🎯", label: "That's SO me!", subtext: "Bullseye!" },
];

const C = {
  bg: "#FEF6EC",
  darkSoft: "#8B7355",
  dark: "#2A1F17",
  orange: "#D4654A",
  gold: "#D4A843",
  goldLight: "#E8CC7A",
  goldPale: "#F5E6B8",
  teal: "#5BA89D",
  rose: "#C97B6B",
  warmBg: "#FEF6EC",
};

// --- TYPES ---
interface AxisScore {
  HP: number;
  WP: number;
  HF: number;
  CI: number;
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
  imageUrl?: string;
}

interface ResultsScreenProps {
  scores: AxisScore;
  rankings: ArchetypeRanking[];
  onRetake: () => void;
}

// --- COMPONENTS ---

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

const GridCard = ({ arch, rank, delay, onPress }: any) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), delay);
  }, [delay]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(arch)}
      style={[styles.gridCard, { opacity: visible ? 1 : 0 }]}
    >
      <View style={[styles.rankBadge, { backgroundColor: arch.color }]}>
        <Text style={styles.rankBadgeText}>#{rank}</Text>
      </View>

      <View style={styles.gridImageWrapper}>
        {arch.imageUrl ? (
          <Image
            source={{ uri: arch.imageUrl }}
            style={styles.gridImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.gridImagePlaceholder,
              { backgroundColor: `${arch.color}15` },
            ]}
          >
            <Text style={styles.gridEmoji}>{arch.emoji}</Text>
          </View>
        )}
      </View>

      <View style={styles.gridCardInfo}>
        <Text style={styles.gridLabel} numberOfLines={1}>
          {arch.label}
        </Text>
        <Text style={[styles.gridMatch, { color: arch.match > 70 ? "#4CAF50" : arch.match >= 50 ? "#FF9800" : "#E53935" }]}>
          {arch.match}% match
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const ArchetypeModal = ({
  arch,
  visible,
  onClose,
}: {
  arch: ArchetypeRanking | null;
  visible: boolean;
  onClose: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
          tension: 80,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  if (!arch) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <BlurView intensity={40} tint="dark" style={modalStyles.backdrop}>
        <Pressable style={modalStyles.backdropPress} onPress={handleClose}>
          <Animated.View
            style={[
              modalStyles.container,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              {/* Close button */}
              <TouchableOpacity
                style={modalStyles.closeBtn}
                onPress={handleClose}
              >
                <Text style={modalStyles.closeBtnText}>x</Text>
              </TouchableOpacity>

              <ScrollView
                style={modalStyles.scrollView}
                contentContainerStyle={modalStyles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Image */}
                <View style={modalStyles.imageWrapper}>
                  {arch.imageUrl ? (
                    <Image
                      source={{ uri: arch.imageUrl }}
                      style={modalStyles.image}
                      resizeMode="contain"
                    />
                  ) : (
                    <View
                      style={[
                        modalStyles.imagePlaceholder,
                        { backgroundColor: `${arch.color}15` },
                      ]}
                    >
                      <Text style={{ fontSize: 72 }}>{arch.emoji}</Text>
                    </View>
                  )}
                </View>

                {/* Match badge */}
                <View
                  style={[
                    modalStyles.matchBadge,
                    { backgroundColor: arch.color },
                  ]}
                >
                  <Text style={modalStyles.matchBadgeText}>
                    {arch.arrow} {arch.match}% Match
                  </Text>
                </View>

                {/* Title */}
                <Text style={modalStyles.title}>{arch.label}</Text>

                {/* Description */}
                {arch.description ? (
                  <View style={modalStyles.descriptionContainer}>
                    <Markdown style={markdownStyles}>
                      {arch.description.replace(/\\n/g, "\n")}
                    </Markdown>
                  </View>
                ) : (
                  <Text style={modalStyles.noDescription}>
                    No description available yet.
                  </Text>
                )}
              </ScrollView>
            </Pressable>
          </Animated.View>
        </Pressable>
      </BlurView>
    </Modal>
  );
};

// --- NEW ACCURACY SLIDER COMPONENT ---
const AccuracySlider = () => {
  const [value, setValue] = useState(3);
  const [submitted, setSubmitted] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);

  const pan = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const current = SLIDER_LABELS[value - 1];

  // Calculate thumb position based on value
  const getPositionFromValue = (val: number) => {
    return ((val - 1) / 4) * trackWidth;
  };

  // Calculate value from position
  const getValueFromPosition = (position: number) => {
    if (trackWidth === 0) return value;
    const stepWidth = trackWidth / 4;
    const step = Math.round(position / stepWidth);
    return Math.max(1, Math.min(5, step + 1));
  };

  // Pulse animation
  const triggerPulse = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Pan responder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        // Set offset to current position
        pan.setOffset(getPositionFromValue(value));
        pan.setValue(0);
      },

      onPanResponderMove: (_, gestureState) => {
        // Update pan value
        pan.setValue(gestureState.dx);
      },

      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();

        // Get final position
        const finalPosition = getPositionFromValue(value) + gestureState.dx;
        const clampedPosition = Math.max(
          0,
          Math.min(trackWidth, finalPosition),
        );

        // Calculate new value
        const newValue = getValueFromPosition(clampedPosition);

        // Snap to position
        const targetPosition = getPositionFromValue(newValue);

        Animated.spring(pan, {
          toValue: targetPosition,
          useNativeDriver: false,
          friction: 7,
          tension: 40,
        }).start();

        if (newValue !== value) {
          setValue(newValue);
          triggerPulse();
        }
      },
    }),
  ).current;

  // Update pan position when value changes
  useEffect(() => {
    if (trackWidth > 0) {
      Animated.spring(pan, {
        toValue: getPositionFromValue(value),
        useNativeDriver: false,
        friction: 7,
        tension: 40,
      }).start();
    }
  }, [value, trackWidth]);

  const handleTap = (newValue: number) => {
    setValue(newValue);
    triggerPulse();
  };

  const handleSubmit = () => {
    setSubmitted(true);
    console.log("Feedback submitted:", value);
    // TODO: Save to Firestore
  };

  if (submitted) {
    return (
      <View style={sliderStyles.container}>
        <Text style={{ fontSize: 48, marginBottom: 8 }}>💖</Text>
        <Text style={sliderStyles.submittedTitle}>
          Thanks for your feedback!
        </Text>
        <Text style={sliderStyles.submittedSub}>
          Cupid appreciates your honesty
        </Text>
      </View>
    );
  }

  const thumbLeft = pan.interpolate({
    inputRange: [0, trackWidth || 1],
    outputRange: [0, trackWidth || 1],
    extrapolate: "clamp",
  });

  return (
    <View style={sliderStyles.container}>
      <Text style={sliderStyles.title}>How accurate is this?</Text>
      <Text style={sliderStyles.subtitle}>
        Let Cupid know how well the arrow landed
      </Text>

      {/* Emoji Feedback */}
      <View style={sliderStyles.emojiContainer}>
        <Animated.Text
          style={[sliderStyles.emoji, { transform: [{ scale: scaleAnim }] }]}
        >
          {current.emoji}
        </Animated.Text>
        <Text style={sliderStyles.label}>{current.label}</Text>
        <Text style={sliderStyles.subtext}>{current.subtext}</Text>
      </View>

      {/* Slider Track */}
      <View style={sliderStyles.sliderWrapper}>
        <View
          style={sliderStyles.trackContainer}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        >
          {/* Background */}
          <View style={sliderStyles.trackBackground} />

          {/* Fill */}
          <Animated.View
            style={[
              sliderStyles.trackFill,
              {
                width: thumbLeft,
              },
            ]}
          />

          {/* Dots */}
          <View style={sliderStyles.dotsContainer} pointerEvents="none">
            {[1, 2, 3, 4, 5].map((v) => (
              <View
                key={v}
                style={[
                  sliderStyles.dot,
                  { left: `${((v - 1) / 4) * 100}%` },
                  v <= value && sliderStyles.dotActive,
                  v === value && sliderStyles.dotCurrent,
                ]}
              />
            ))}
          </View>

          {/* Draggable Thumb */}
          <Animated.View
            style={[
              sliderStyles.thumb,
              {
                transform: [{ translateX: thumbLeft }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={sliderStyles.thumbInner}>
              <Text style={sliderStyles.thumbIcon}>🏹</Text>
            </View>
          </Animated.View>
        </View>

        {/* Labels */}
        <View style={sliderStyles.labelsRow}>
          {[1, 2, 3, 4, 5].map((v) => (
            <TouchableOpacity
              key={v}
              onPress={() => handleTap(v)}
              style={sliderStyles.labelTouch}
            >
              <Text
                style={[
                  sliderStyles.labelText,
                  v === value && sliderStyles.labelTextActive,
                ]}
              >
                {v}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={sliderStyles.submitBtn} onPress={handleSubmit}>
        <Text style={sliderStyles.submitBtnText}>Submit Feedback ✨</Text>
      </TouchableOpacity>
    </View>
  );
};
// --- MAIN RESULTS SCREEN ---
const ResultsScreen: React.FC<ResultsScreenProps> = ({
  scores,
  rankings,
  onRetake,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [firestoreRankings, setFirestoreRankings] = useState<
    ArchetypeRanking[]
  >([]);
  const [loadingArchetypes, setLoadingArchetypes] = useState(true);
  const [selectedArch, setSelectedArch] = useState<ArchetypeRanking | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchArchetypes = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "personality_archetypes"),
        );
        const archetypesMap: { [key: string]: any } = {};

        querySnapshot.forEach((doc) => {
          archetypesMap[doc.id] = doc.data();
        });

        const updatedRankings = rankings.map((ranking) => {
          const firestoreData = archetypesMap[ranking.key] || {};
          return {
            ...ranking,
            label: firestoreData.title || ranking.label,
            description: firestoreData.description || "",
            imageUrl: firestoreData.imageUrl || "",
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

  const displayRankings =
    firestoreRankings.length > 0 ? firestoreRankings : rankings;
  const primary = displayRankings[0];
  const similar = displayRankings.slice(1, 5);

  const axes = [
    { key: "HP", label: "Habitual Practice", color: C.orange },
    { key: "WP", label: "Why Practice", color: C.gold },
    { key: "HF", label: "How Faith", color: C.teal },
    { key: "CI", label: "Community Importance", color: C.rose },
  ];

  const handleShare = async () => {
    try {
      const shareMessage = `🏹 Bohri Cupid Personality Results\n\nMy Top Match: ${primary.label} (${primary.match}%)\n\nDiscover your Bohra personality with Bohri Cupid!`;
      await Share.share({
        message: shareMessage,
        title: "My Bohri Cupid Results",
      });
    } catch (error) {
      Alert.alert("Error", "Unable to share results");
    }
  };

  if (loadingArchetypes) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your results...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.mascotContainer, { opacity: loaded ? 1 : 0 }]}>
            <Image
              source={require("../../assets/images/bohricupid.png")}
              style={styles.mascotImage}
              resizeMode="contain"
            />
          </View>

          <View style={[styles.primaryResult, { opacity: loaded ? 1 : 0 }]}>
            <View
              style={[styles.matchBadge, { backgroundColor: primary.color }]}
            >
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
                maxVal={4}
                color={ax.color}
                delay={500 + i * 180}
              />
            ))}
          </View>

          {/* Description */}
          {primary.description && (
            <View style={[styles.reportCard, { opacity: showContent ? 1 : 0 }]}>
              <Markdown style={markdownStyles}>
                {primary.description.replace(/\\n/g, "\n")}
              </Markdown>
            </View>
          )}

          {/* ACCURACY SLIDER IS HERE */}
          <View style={{ opacity: showContent ? 1 : 0 }}>
            <AccuracySlider />
          </View>

          {/* Similar Types */}
          <View style={styles.similarSection}>
            <Text style={styles.similarSectionTitle}>Bohra Compatibility</Text>
            <Text style={styles.similarSectionSubtitle}>
              Your Compatibility with Other Types of Bohras
            </Text>
            <View style={styles.gridContainer}>
              {similar.map((arch, i) => (
                <GridCard
                  key={arch.key}
                  arch={arch}
                  rank={i + 2}
                  delay={200 + i * 180}
                  onPress={(a: ArchetypeRanking) => {
                    setSelectedArch(a);
                    setModalVisible(true);
                  }}
                />
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>Share Results 🏹</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.retakeButton} onPress={onRetake}>
              <Text style={styles.retakeButtonText}>Retake Test</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <ArchetypeModal
        arch={selectedArch}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

// --- STYLES ---

const markdownStyles = StyleSheet.create({
  body: {
    fontFamily: Fonts.sans,
    fontSize: 14.5,
    lineHeight: 25,
    color: "#6A6A6A",
  },
  heading1: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    fontWeight: "bold",
    color: C.dark,
    marginTop: 10,
    marginBottom: 10,
  },
  heading2: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    fontWeight: "bold",
    color: C.darkSoft,
    marginTop: 12,
    marginBottom: 6,
  },
  strong: { fontFamily: Fonts.sans, fontWeight: "bold", color: C.orange },
  paragraph: { marginTop: 0, marginBottom: 10 },
});

const sliderStyles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    marginTop: 16,
    width: "100%",
    alignItems: "center",
    shadowColor: "rgba(42, 31, 23, 0.06)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: `${C.goldPale}40`,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    fontWeight: "bold",
    color: C.dark,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: C.darkSoft,
    marginTop: 4,
    marginBottom: 20,
  },
  emojiContainer: { alignItems: "center", marginBottom: 24 },
  emoji: { fontSize: 52, marginBottom: 8 },
  label: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    fontWeight: "bold",
    color: C.orange,
    marginBottom: 4,
  },
  subtext: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: C.darkSoft,
    fontStyle: "italic",
  },

  sliderWrapper: { width: "100%", marginBottom: 24 },
  trackContainer: { height: 32, justifyContent: "center" },
  trackBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(212, 101, 74, 0.15)",
    width: "100%",
  },
  trackFill: {
    position: "absolute",
    height: 8,
    borderRadius: 4,
    backgroundColor: C.orange,
    left: 0,
  },

  dotsContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.8)",
    marginLeft: -5,
  },
  dotActive: { backgroundColor: C.orange },
  dotCurrent: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: -7,
    borderWidth: 2,
    borderColor: "#FFF",
    backgroundColor: C.orange,
  },

  thumb: { position: "absolute", left: 0, zIndex: 10 },
  thumbInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.orange,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -16,
    shadowColor: C.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  thumbIcon: { fontSize: 14 },

  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  labelTouch: { width: 30, alignItems: "center" },
  labelText: {
    fontSize: 13,
    color: C.darkSoft,
    fontWeight: "400",
    opacity: 0.5,
  },
  labelTextActive: { color: C.orange, fontWeight: "bold", opacity: 1 },

  submitBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: C.orange,
    width: "100%",
    alignItems: "center",
  },
  submitBtnText: {
    fontFamily: Fonts.sans,
    color: C.orange,
    fontWeight: "bold",
    fontSize: 15,
  },
  submittedTitle: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    fontWeight: "bold",
    color: C.orange,
    marginBottom: 6,
  },
  submittedSub: { fontFamily: Fonts.sans, fontSize: 13, color: C.darkSoft },
});

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  backdropPress: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "100%",
    maxWidth: 480,
    maxHeight: "85%",
    overflow: "hidden",
    shadowColor: "rgba(0,0,0,0.3)",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 10,
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollView: {
    maxHeight: Dimensions.get("window").height * 0.8,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  imageWrapper: {
    paddingTop: 16,
  },
  image: {
    width: "100%",
    height: 220,
  },
  imagePlaceholder: {
    width: "100%",
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  matchBadge: {
    alignSelf: "center",
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: -16,
  },
  matchBadgeText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    fontWeight: "800",
    color: C.dark,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  descriptionContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  noDescription: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: C.darkSoft,
    textAlign: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    fontStyle: "italic",
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.warmBg },
  contentContainer: { paddingBottom: 40 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.warmBg,
  },
  loadingText: { fontFamily: Fonts.sans, fontSize: 16, color: C.darkSoft },
  heroSection: {
    backgroundColor: C.bg,
    paddingTop: 48,
    paddingBottom: 72,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: `${C.goldPale}60`,
  },
  mascotContainer: { marginBottom: 8 },
  mascotImage: { width: 160, height: 160 },
  primaryResult: { alignItems: "center", marginTop: 12 },
  matchBadge: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 14,
  },
  matchBadgeText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  primaryLabel: {
    fontFamily: Fonts.serif,
    fontSize: 34,
    fontWeight: "800",
    color: C.dark,
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
    fontWeight: "bold",
    color: C.dark,
    marginBottom: 20,
  },
  traitBarContainer: { marginBottom: 18 },
  traitBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  traitBarLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: "600",
    color: C.darkSoft,
  },
  traitBarValue: { fontFamily: Fonts.sans, fontSize: 13, fontWeight: "bold" },
  traitBarBackground: {
    height: 10,
    borderRadius: 5,
    backgroundColor: `${C.goldPale}40`,
    overflow: "hidden",
  },
  traitBarFill: { height: "100%", borderRadius: 5 },

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

  similarSection: { marginTop: 40 },
  similarSectionTitle: {
    fontFamily: Fonts.serif,
    fontSize: 23,
    fontWeight: "800",
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
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    width: "48%" as any,
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
    zIndex: 1,
  },
  rankBadgeText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  gridImageWrapper: {
    padding: 12,
  },
  gridImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
  },
  gridImagePlaceholder: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  gridEmoji: { fontSize: 48 },
  gridCardInfo: {
    padding: 12,
    alignItems: "center",
  },
  gridLabel: {
    fontFamily: Fonts.serif,
    fontSize: 15,
    fontWeight: "bold",
    color: C.dark,
    textAlign: "center",
    marginBottom: 4,
  },
  gridMatch: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: "700",
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
    fontWeight: "bold",
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
    fontWeight: "bold",
    color: C.darkSoft,
  },
});

export default ResultsScreen;
