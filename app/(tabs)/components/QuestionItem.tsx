import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Question } from '../../utils/setupQuestions';
import { Fonts } from '../../fonts';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

interface QuestionItemProps {
    question: Question;
    currentQuestionIndex: number;
    isActive: boolean;
    selectedAnswer: number | null;
    onAnswerSelect: (value: number) => void;
    scaleOptions: Array<{ value: number; label: string }>;
}

const QuestionItem: React.FC<QuestionItemProps> = ({
    question,
    isActive,
    selectedAnswer,
    onAnswerSelect,
    scaleOptions,
}) => {
    // Color gradient for 7-point scale
    const getOptionColor = (index: number) => {
        const colors = [
            '#D9534F', // Deep Red (Agree - position 0)
            '#E9967A', // Light Red/Orange (position 1)
            '#F0AD4E', // Orange (position 2)
            '#C08A5C', // Neutral skin tone (position 3)
            '#F7C67D', // Light Yellow/Gold (position 4)
            '#E8CC7A', // Gold Light (position 5)
            '#D4AF37', // Gold/Yellow (Disagree - position 6)
        ];
        return colors[index];
    };

    // Size scaling for U-shape (bigger on ends, smaller in middle)
    const getSizeMultiplier = (index: number) => {
        const centerIndex = Math.floor(scaleOptions.length / 2); // 3 for 7-point scale
        const distanceFromCenter = Math.abs(index - centerIndex);
        return 1 + (distanceFromCenter * 0.15);
    };

    // Opacity scaling
    const getOpacity = (index: number) => {
        const opacities = [1, 0.6, 0.35, 0.3, 0.35, 0.6, 1];
        return opacities[index];
    };

    const isAnswered = selectedAnswer !== null;
    const shouldShowLabels = isActive || isAnswered;

    return (
        <View style={[
            styles.questionContainer,
            !isActive && !isAnswered && styles.questionInactive
        ]}>
            <Text style={[styles.questionText, !isActive && !isAnswered && styles.textInactive]}>
                <Text style={[styles.questionNumberInline, !isActive && !isAnswered && styles.textInactive]}>
                    {String(question.id).padStart(2, '0')}{"  "}
                </Text>
                {question.text}
            </Text>

            {/* Scale Options */}
            <View style={[
                styles.scaleContainer,
                !isActive && !isAnswered && { opacity: 0.15, pointerEvents: 'none' } as any
            ]}>
                <View style={styles.optionsRow}>
                    {scaleOptions.map((option, index) => {
                        const color = getOptionColor(index);
                        const isSelected = selectedAnswer === option.value;
                        const sizeMultiplier = getSizeMultiplier(index);
                        const baseSize = isMobile ? 28 : 34;
                        const size = baseSize * sizeMultiplier;
                        const opacity = getOpacity(index);

                        // Border color logic
                        let borderColor = '#E0E0E0';
                        if (isSelected) {
                            borderColor = color;
                        } else if (isActive || isAnswered) {
                            borderColor = color;
                        }

                        return (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.scaleOption,
                                    isSelected && styles.scaleOptionSelected
                                ]}
                                onPress={() => onAnswerSelect(option.value)}
                                activeOpacity={0.7}
                                disabled={!isActive && !isAnswered}
                            >
                                <View style={[
                                    styles.scaleCircle,
                                    {
                                        width: size,
                                        height: size,
                                        borderRadius: size / 2,
                                        borderColor: borderColor,
                                        borderWidth: isSelected ? 3 : 2.5,
                                        backgroundColor: isSelected ? color : 'transparent',
                                        opacity: (isActive || isAnswered) ? (isSelected ? 1 : opacity) : 0.15,
                                    },
                                ]}>
                                    {isSelected && (
                                        <View style={styles.checkmarkContainer}>
                                            <Text style={styles.checkmark}>✓</Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Labels */}
                {shouldShowLabels && (
                    <View style={styles.scaleLabels}>
                        <Text style={[styles.scaleLabel, { color: '#D9534F' }]}>AGREE</Text>
                        <Text style={[styles.scaleLabel, { color: '#D4AF37' }]}>DISAGREE</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    questionContainer: {
        paddingVertical: 24,
        paddingHorizontal: 0,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(245, 230, 184, 0.5)',
    },
    questionInactive: {
        opacity: 0.2,
    },
    questionText: {
        fontSize: 17,
        fontWeight: Fonts.weights.semibold,
        color: '#2A1F17',
        marginBottom: 18,
        fontFamily: Fonts.serif,
        lineHeight: 25.6,
    },
    questionNumberInline: {
        fontSize: 12,
        fontWeight: Fonts.weights.bold,
        color: '#D4654A',
        marginRight: 8,
        fontFamily: Fonts.sans,
    },
    textInactive: {
        color: '#8B7355',
    },
    scaleContainer: {
        marginTop: 0,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    scaleOption: {
        alignItems: 'center',
        padding: 4,
        justifyContent: 'center',
    },
    scaleCircle: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scaleOptionSelected: {
        transform: [{ scale: 1.05 }],
    },
    checkmarkContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    scaleLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 2,
    },
    scaleLabel: {
        fontSize: 10,
        fontWeight: Fonts.weights.bold,
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontFamily: Fonts.sans,
        opacity: 0.6,
    },
});

export default QuestionItem;