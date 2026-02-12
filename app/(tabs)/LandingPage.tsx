import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Fonts } from "../fonts";

const { width } = Dimensions.get("window");
const isMobile = width < 768;

interface LandingPageProps {
  onStart: (name: string) => void;
}

const ARCHETYPES = [
  { emoji: "🕌", label: "Devoted", color: "#D4A843" },
  { emoji: "🔍", label: "Thinker", color: "#5BA89D" },
  { emoji: "⚖️", label: "Harmonizer", color: "#7A9E7E" },
  { emoji: "🏛️", label: "Keeper", color: "#E8896F" },
  { emoji: "🦅", label: "Independent", color: "#C97B6B" },
];

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [name, setName] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleStart = () => {
    if (!name.trim()) return;
    onStart(name.trim());
  };

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Decorative arrows */}
      {[...Array(5)].map((_, i) => (
        <Text
          key={i}
          style={[
            styles.floatingArrow,
            {
              top: `${15 + i * 18}%` as any,
              left: `${8 + i * 18}%` as any,
            },
          ]}
        >
          🏹
        </Text>
      ))}

      <View style={styles.geometricCircle} />
      <View style={styles.geometricSquare} />

      <View style={styles.content}>
        <View style={styles.mascotContainer}>
          <Image
            source={require("../../assets/images/Bohri Cupid w title.png")}
            style={styles.mascotImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.subtitle}>PERSONALITY DISCOVERY</Text>

        <Text style={styles.description}>
          Deen, Duniya? Or is it complicated? Reveal your true Bohra
          personality. Discover how you relate to faith, community, tradition,
          and modern life through 21 thoughtful questions.
        </Text>

        <View style={styles.archetypeContainer}>
          {ARCHETYPES.map((archetype, index) => (
            <View
              key={index}
              style={[
                styles.archetypePill,
                {
                  borderColor: archetype.color + "40",
                  backgroundColor: archetype.color + "15",
                },
              ]}
            >
              <Text style={[styles.archetypeText, { color: archetype.color }]}>
                {archetype.emoji} {archetype.label}
              </Text>
            </View>
          ))}
        </View>

        {/* ✨ Elegant Name Input */}
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: isFocused ? "#D4A843" : "rgba(212, 168, 67, 0.4)",
              shadowOpacity: isFocused ? 0.18 : 0.08,
            },
          ]}
        >
          <Text style={styles.inputIcon}>💌</Text>
          <TextInput
            placeholder="Enter your name"
            placeholderTextColor="#B8A999"
            value={name}
            onChangeText={setName}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={[
              styles.textInput,
              { outlineWidth: 0 }, // ✅ remove blue border on web
            ]}
          />
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.ctaButton, { opacity: name.trim() ? 1 : 0.5 }]}
          onPress={handleStart}
          activeOpacity={0.85}
          disabled={!name.trim()}
        >
          <Text style={styles.ctaButtonText}>Start</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          20 questions · 5 minutes · No right or wrong answers
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#FEF6EC",
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#FEF6EC",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    position: "relative",
    minHeight: Dimensions.get("window").height,
  },
  floatingArrow: {
    position: "absolute",
    fontSize: isMobile ? 14 : 16,
    opacity: 0.12,
  },
  geometricCircle: {
    position: "absolute",
    top: "8%",
    right: "8%",
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: "rgba(212, 168, 67, 0.2)",
    borderRadius: 50,
  },
  geometricSquare: {
    position: "absolute",
    bottom: "12%",
    left: "6%",
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: "rgba(212, 101, 74, 0.2)",
    transform: [{ rotate: "45deg" }],
  },
  content: {
    alignItems: "center",
    maxWidth: 440,
    width: "100%",
    zIndex: 1,
  },
  mascotContainer: {
    marginBottom: 24,
  },
  mascotImage: {
    width: isMobile ? 140 : 180,
    height: isMobile ? 140 : 180,
  },
  subtitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: "#D4A843",
    letterSpacing: 1,
    marginBottom: 24,
    textAlign: "center",
    textTransform: "uppercase",
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: "#8B7355",
    lineHeight: 25.5,
    marginBottom: 32,
    textAlign: "center",
  },
  archetypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 36,
  },
  archetypePill: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  archetypeText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: Fonts.weights.semibold,
  },

  /* ✨ New Elegant Input */
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9F2",
    borderRadius: 30,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    paddingVertical: 16,
    width: "100%",
    marginBottom: 28,
    shadowColor: "#D4A843",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 15,
    elevation: 2,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
    opacity: 0.7,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#4E3B2C",
    fontFamily: Fonts.sans,
    outlineStyle: "none",
  } as any,

  ctaButton: {
    paddingVertical: 16,
    paddingHorizontal: 52,
    borderRadius: 40,
    backgroundColor: "#D4654A",
    shadowColor: "#D4654A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },
  ctaButtonText: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: Fonts.weights.bold,
    color: "#FFFFFF",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  footerText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: "#BBBBBB",
    marginTop: 18,
    textAlign: "center",
  },
});

export default LandingPage;
