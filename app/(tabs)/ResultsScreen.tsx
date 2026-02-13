import { BlurView } from "expo-blur";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
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
  resultDocId: string;
  onRetake: () => void;
}

// --- COMPONENTS ---

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
        <Text
          style={[
            styles.gridMatch,
            {
              color:
                arch.match > 70
                  ? "#4CAF50"
                  : arch.match >= 50
                    ? "#FF9800"
                    : "#E53935",
            },
          ]}
        >
          {arch.match}% match
        </Text>
        <View style={styles.learnMoreBtn}>
          <Text style={styles.learnMoreText}>Learn More</Text>
        </View>
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

// --- ACCURACY SLIDER COMPONENT ---
const AccuracySlider = ({ resultDocId }: { resultDocId: string }) => {
  const [value, setValue] = useState(3);

  const [trackWidth, setTrackWidth] = useState(0);

  const thumbAnim = useRef(new Animated.Value(0.5)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Refs to avoid stale closures in PanResponder
  const valueRef = useRef(value);
  const trackWidthRef = useRef(trackWidth);
  valueRef.current = value;
  trackWidthRef.current = trackWidth;

  const current = SLIDER_LABELS[value - 1];

  const animateToValue = (newValue: number) => {
    const fraction = (newValue - 1) / 4;
    Animated.spring(thumbAnim, {
      toValue: fraction,
      useNativeDriver: false,
      friction: 7,
      tension: 80,
    }).start();
  };

  const triggerPulse = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const updateFeedback = async (newValue: number) => {
    try {
      const resultRef = doc(db, "personality_quiz_results", resultDocId);
      await updateDoc(resultRef, { feedback: newValue });
    } catch (error) {
      console.error("Error updating feedback:", error);
    }
  };

  const selectValue = (newValue: number) => {
    setValue(newValue);
    animateToValue(newValue);
    triggerPulse();
    updateFeedback(newValue);
  };

  // Track the drag start value so we always compute from the correct origin
  const dragStartValueRef = useRef(value);

  // PanResponder for drag - uses refs for fresh values
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 5,

      onPanResponderGrant: () => {
        // Capture the value at drag start
        dragStartValueRef.current = valueRef.current;
      },

      onPanResponderMove: (_, gs) => {
        const tw = trackWidthRef.current;
        if (tw === 0) return;
        const startPos = ((dragStartValueRef.current - 1) / 4) * tw;
        const newPos = Math.max(0, Math.min(tw, startPos + gs.dx));
        thumbAnim.setValue(newPos / tw);

        // Live-snap: update value state as thumb crosses step boundaries
        const stepWidth = tw / 4;
        const snappedValue = Math.max(
          1,
          Math.min(5, Math.round(newPos / stepWidth) + 1),
        );
        if (snappedValue !== valueRef.current) {
          valueRef.current = snappedValue;
          setValue(snappedValue);
          triggerPulse();
        }
      },

      onPanResponderRelease: (_, gs) => {
        const tw = trackWidthRef.current;
        if (tw === 0) return;
        const startPos = ((dragStartValueRef.current - 1) / 4) * tw;
        const finalPos = Math.max(0, Math.min(tw, startPos + gs.dx));
        const stepWidth = tw / 4;
        const newValue = Math.max(
          1,
          Math.min(5, Math.round(finalPos / stepWidth) + 1),
        );

        setValue(newValue);
        valueRef.current = newValue;
        animateToValue(newValue);
        updateFeedback(newValue);
      },
    }),
  ).current;

  // Set initial position once track is measured
  useEffect(() => {
    if (trackWidth > 0) {
      thumbAnim.setValue((value - 1) / 4);
    }
  }, [trackWidth]);



  const fillWidth = thumbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const thumbTranslate = thumbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, trackWidth],
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
            style={[sliderStyles.trackFill, { width: fillWidth }]}
          />

          {/* Tap targets for each step */}
          <View style={sliderStyles.dotsContainer}>
            {[1, 2, 3, 4, 5].map((v) => (
              <TouchableOpacity
                key={v}
                onPress={() => selectValue(v)}
                style={[
                  sliderStyles.dotTouchArea,
                  { left: `${((v - 1) / 4) * 100}%` },
                ]}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    sliderStyles.dot,
                    v <= value && sliderStyles.dotActive,
                    v === value && sliderStyles.dotCurrent,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Thumb */}
          <Animated.View
            style={[
              sliderStyles.thumb,
              { transform: [{ translateX: thumbTranslate }] },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={sliderStyles.thumbInner}>
              {/* Removed the text to avoid accidental selection */}
            </View>
          </Animated.View>
        </View>

        {/* Labels */}
        <View style={sliderStyles.labelsRow}>
          {[1, 2, 3, 4, 5].map((v) => (
            <TouchableOpacity
              key={v}
              onPress={() => selectValue(v)}
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

    </View>
  );
};
// --- MAIN RESULTS SCREEN ---
const ResultsScreen: React.FC<ResultsScreenProps> = ({
  rankings,
  resultDocId,
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

  // animated background pulse behind mascot to fill empty space
  const bgScale = useRef(new Animated.Value(1)).current;
  const bgOpacity = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    // start from baseline
    bgScale.setValue(1);
    bgOpacity.setValue(0.25);

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bgScale, {
            toValue: 1.06,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bgOpacity, {
            toValue: 0.5,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bgScale, {
            toValue: 1,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bgOpacity, {
            toValue: 0.25,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
      { iterations: -1 },
    );

    pulse.start();
    return () => pulse.stop();
  }, [bgScale, bgOpacity]);

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
            <Animated.View
              style={[
                styles.mascotBg,
                {
                  backgroundColor: primary?.color || C.gold,
                  transform: [{ scale: bgScale }],
                  opacity: bgOpacity,
                },
              ]}
            />

            {primary && primary.imageUrl ? (
              <Image
                source={{ uri: primary.imageUrl }}
                style={styles.mascotImage}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={require("../../assets/images/bohricupid.png")}
                style={styles.mascotImage}
                resizeMode="contain"
              />
            )}
          </View>

          <View style={[styles.primaryResult, { opacity: loaded ? 1 : 0 }]}>
            <Text style={styles.primaryLabel}>{primary.label}</Text>
            <View
              style={[styles.matchBadge, { backgroundColor: primary.color }]}
            >
              <Text style={styles.matchBadgeText}>
                {primary.arrow} {primary.match}% Match
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.contentSection}>
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
            <AccuracySlider resultDocId={resultDocId} />
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
    fontSize: 15.5,
    lineHeight: 26,
    color: "#565656",
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
  dotTouchArea: {
    position: "absolute",
    width: 36,
    height: 36,
    marginLeft: -18,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.8)",
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
    paddingBottom: 12,
  },
  imageWrapper: {},
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
    fontSize: 15,
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
    paddingTop: 24,
    paddingBottom: 2,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  mascotContainer: {
    marginBottom: 2,
    position: "relative",
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  mascotBg: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    zIndex: 0,
  },
  mascotImage: { width: 300, height: 300, zIndex: 1 },
  primaryResult: { alignItems: "center", marginTop: 12 },
  matchBadge: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 20,
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
    marginBottom: 14,
    textAlign: "center",
  },
  contentSection: {
    maxWidth: 540,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 16,
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
    fontSize: 14,
    fontWeight: "800",
  },
  learnMoreBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.orange,
  },
  learnMoreText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: "700",
    color: C.orange,
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
