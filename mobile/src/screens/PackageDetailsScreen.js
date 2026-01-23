import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS, PACKAGE_CONTENTS, HAZMAT_QUESTIONS } from '../utils/constants';

export default function PackageDetailsScreen({ navigation, route }) {
  const { fromAddress, toAddress } = route.params;

  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('lb'); // 'lb' or 'oz'
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    height: '',
  });
  const [contents, setContents] = useState(null);
  const [declaredValue, setDeclaredValue] = useState('');
  const [hazmatAnswers, setHazmatAnswers] = useState(
    HAZMAT_QUESTIONS.map(() => null) // null = unanswered, false = no, true = yes
  );
  const [showHazmat, setShowHazmat] = useState(false);

  const handleContentSelect = (contentId) => {
    setContents(contentId);
    setShowHazmat(true);
  };

  const handleHazmatAnswer = (index, answer) => {
    const newAnswers = [...hazmatAnswers];
    newAnswers[index] = answer;
    setHazmatAnswers(newAnswers);
  };

  const hasHazmat = hazmatAnswers.some((a) => a === true);
  const allHazmatAnswered = hazmatAnswers.every((a) => a !== null);

  const handleNext = () => {
    if (!weight || parseFloat(weight) <= 0) {
      Alert.alert('Missing Information', 'Please enter the package weight');
      return;
    }

    if (!contents) {
      Alert.alert('Missing Information', 'Please select the package contents type');
      return;
    }

    if (showHazmat && !allHazmatAnswered) {
      Alert.alert('Hazmat Screening', 'Please answer all hazardous materials questions');
      return;
    }

    if (hasHazmat) {
      Alert.alert(
        'Hazardous Materials',
        'Packages containing hazardous materials require special handling. Please visit your local USPS office for assistance.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Convert weight to ounces for API
    const weightInOunces = weightUnit === 'lb'
      ? parseFloat(weight) * 16
      : parseFloat(weight);

    navigation.navigate('ServiceSelection', {
      fromAddress,
      toAddress,
      packageDetails: {
        weight: weightInOunces,
        dimensions: {
          length: parseFloat(dimensions.length) || 6,
          width: parseFloat(dimensions.width) || 6,
          height: parseFloat(dimensions.height) || 6,
        },
        contents,
        declaredValue: parseFloat(declaredValue) || 0,
        hazmatScreening: true,
      },
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Package Weight *</Text>
        <View style={styles.weightRow}>
          <TextInput
            style={[styles.input, styles.weightInput]}
            value={weight}
            onChangeText={setWeight}
            placeholder="0.0"
            keyboardType="decimal-pad"
          />
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.unitButton, weightUnit === 'lb' && styles.unitButtonActive]}
              onPress={() => setWeightUnit('lb')}
            >
              <Text style={[styles.unitText, weightUnit === 'lb' && styles.unitTextActive]}>
                lb
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitButton, weightUnit === 'oz' && styles.unitButtonActive]}
              onPress={() => setWeightUnit('oz')}
            >
              <Text style={[styles.unitText, weightUnit === 'oz' && styles.unitTextActive]}>
                oz
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dimensions (inches) - Optional</Text>
        <View style={styles.dimensionsRow}>
          <View style={styles.dimensionInput}>
            <Text style={styles.dimLabel}>Length</Text>
            <TextInput
              style={styles.input}
              value={dimensions.length}
              onChangeText={(v) => setDimensions({ ...dimensions, length: v })}
              placeholder="6"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.dimensionInput}>
            <Text style={styles.dimLabel}>Width</Text>
            <TextInput
              style={styles.input}
              value={dimensions.width}
              onChangeText={(v) => setDimensions({ ...dimensions, width: v })}
              placeholder="6"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.dimensionInput}>
            <Text style={styles.dimLabel}>Height</Text>
            <TextInput
              style={styles.input}
              value={dimensions.height}
              onChangeText={(v) => setDimensions({ ...dimensions, height: v })}
              placeholder="6"
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What's in the package? *</Text>
        <View style={styles.contentsGrid}>
          {PACKAGE_CONTENTS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.contentOption,
                contents === item.id && styles.contentOptionActive,
              ]}
              onPress={() => handleContentSelect(item.id)}
            >
              <Text
                style={[
                  styles.contentText,
                  contents === item.id && styles.contentTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Declared Value (USD) - Optional</Text>
        <View style={styles.valueRow}>
          <Text style={styles.dollarSign}>$</Text>
          <TextInput
            style={[styles.input, styles.valueInput]}
            value={declaredValue}
            onChangeText={setDeclaredValue}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {showHazmat && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hazardous Materials Screening *</Text>
          <Text style={styles.hazmatSubtitle}>
            Federal law prohibits mailing hazardous materials
          </Text>
          {HAZMAT_QUESTIONS.map((question, index) => (
            <View key={index} style={styles.hazmatQuestion}>
              <Text style={styles.questionText}>{question}</Text>
              <View style={styles.yesNoRow}>
                <TouchableOpacity
                  style={[
                    styles.yesNoButton,
                    hazmatAnswers[index] === false && styles.noButtonActive,
                  ]}
                  onPress={() => handleHazmatAnswer(index, false)}
                >
                  <Text
                    style={[
                      styles.yesNoText,
                      hazmatAnswers[index] === false && styles.yesNoTextActive,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.yesNoButton,
                    hazmatAnswers[index] === true && styles.yesButtonActive,
                  ]}
                  onPress={() => handleHazmatAnswer(index, true)}
                >
                  <Text
                    style={[
                      styles.yesNoText,
                      hazmatAnswers[index] === true && styles.yesNoTextActive,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next: Select Service</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.grayDark,
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 8,
    padding: 14,
    fontSize: 18,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightInput: {
    flex: 1,
    textAlign: 'center',
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.grayLight,
    borderRadius: 8,
    overflow: 'hidden',
  },
  unitButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  unitButtonActive: {
    backgroundColor: COLORS.primary,
  },
  unitText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gray,
  },
  unitTextActive: {
    color: COLORS.white,
  },
  dimensionsRow: {
    flexDirection: 'row',
  },
  dimensionInput: {
    flex: 1,
  },
  dimLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
    textAlign: 'center',
  },
  contentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  contentOption: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  contentOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  contentText: {
    color: COLORS.grayDark,
    fontSize: 14,
  },
  contentTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dollarSign: {
    fontSize: 20,
    color: COLORS.gray,
    marginRight: 8,
  },
  valueInput: {
    flex: 1,
  },
  hazmatSubtitle: {
    color: COLORS.gray,
    fontSize: 13,
    marginBottom: 16,
  },
  hazmatQuestion: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 14,
    color: COLORS.grayDark,
    marginBottom: 8,
  },
  yesNoRow: {
    flexDirection: 'row',
  },
  yesNoButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    alignItems: 'center',
  },
  noButtonActive: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  yesButtonActive: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  yesNoText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: 'bold',
  },
  yesNoTextActive: {
    color: COLORS.white,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 40,
  },
});
