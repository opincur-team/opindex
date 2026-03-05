import React, { useState, useRef } from 'react';
import { View, Text, TextInput, ScrollView, Alert, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as bip39 from 'bip39';
import { Button, Card } from '@/src/components/ui';
import { theme } from '@/src/styles/theme';
import { commonStyles } from '@/src/styles/common';
import { typography } from '@/src/styles/typography';
import {InnerContainer} from "@/src/components/ui/InnerContainer";

interface SeedPhraseInputProps {
  onSeedPhraseChange: (seedPhrase: string[]) => void;
  onValidationChange?: (isValid: boolean) => void;
  expectedWordCount?: 12 | 24;
  autoFocus?: boolean;
}

export const SeedPhraseInput: React.FC<SeedPhraseInputProps> = ({
  onSeedPhraseChange,
  onValidationChange,
  expectedWordCount = 12,
  autoFocus = true,
}) => {
  const [words, setWords] = useState<string[]>(new Array(expectedWordCount).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Official BIP39 wordlist (2048 words)
  const bip39WordList = bip39.wordlists.english;

  const handleWordChange = (index: number, word: string) => {
    // Only allow letters and spaces - remove any other characters
    const sanitizedWord = word.replace(/[^a-zA-Z\s]/g, '');

    // Auto-focus next input only when space is pressed
    const shouldMoveToNext = sanitizedWord.includes(' ');

    const newWords = [...words];
    newWords[index] = sanitizedWord.trim().toLowerCase();
    setWords(newWords);
    onSeedPhraseChange(newWords);

    const isValid = validateSeedPhrase(newWords);
    if (onValidationChange) {
      onValidationChange(isValid);
    }

    if (shouldMoveToNext) {
      const nextIndex = index + 1;
      if (nextIndex < expectedWordCount && inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex]?.focus();
      }
    }
  };

  const validateSeedPhrase = (seedPhrase: string[]): boolean => {
    const nonEmptyWords = seedPhrase.filter(word => word.length > 0);
    if (nonEmptyWords.length !== expectedWordCount) {
      return false;
    }

    // Strict validation: all words must be in official BIP39 wordlist
    return nonEmptyWords.every(word => bip39WordList.includes(word));
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await Clipboard.getStringAsync();
      if (clipboardText) {
        // Split by whitespace and trim each word
        const wordsFromPaste = clipboardText
          .trim()
          .split(/\s+/)
          .map(word => word.trim().toLowerCase())
          .filter(word => word.length > 0);

        // Check if word count matches expected
        if (wordsFromPaste.length !== expectedWordCount) {
          Alert.alert(
            'Invalid Seed Phrase',
            `Expected ${expectedWordCount} words, but found ${wordsFromPaste.length} words.`
          );
          return;
        }

        // Populate the word inputs
        const newWords = [...wordsFromPaste];
        setWords(newWords);
        onSeedPhraseChange(newWords);

        // Validate and notify
        const isValid = validateSeedPhrase(newWords);
        if (onValidationChange) {
          onValidationChange(isValid);
        }

        // Show success or validation error
        if (isValid) {
          Alert.alert('Success', 'Seed phrase loaded successfully!');
        } else {
          Alert.alert(
            'Invalid Words',
            'Some words are not in the BIP39 wordlist. Please check your seed phrase.'
          );
        }
      }
    } catch {
      Alert.alert('Error', 'Failed to paste from clipboard');
    }
  };

  // const clearAll = () => {
  //   const emptyWords = new Array(expectedWordCount).fill('');
  //   setWords(emptyWords);
  //   onSeedPhraseChange(emptyWords);
  //   if (onValidationChange) {
  //     onValidationChange(false);
  //   }
  //   setActiveIndex(0);
  //   inputRefs.current[0]?.focus();
  // };
  //
  // const nonEmptyWordCount = words.filter(word => word.length > 0).length;
  // const isValid = validateSeedPhrase(words);

  return (
    <InnerContainer style={{marginTop: 10}}>
      <View style={{padding: 10}}>
        {/* Individual Word Inputs */}
        {/*<ScrollView*/}
        {/*  style={[commonStyles.mb4, styles.scrollView]}*/}
        {/*>*/}
        {/*  */}
        {/*</ScrollView>*/}
        <View style={styles.wordGrid}>
          {words.map((word, index) => (
            <View key={index} style={styles.wordInputWrapper}>
              <InnerContainer style={{paddingHorizontal: 10}}>
                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10, paddingRight: 10}}>
                  <Text style={[typography.textBase, typography.textWhite, typography.daysone]}>
                    {index + 1}
                  </Text>
                  <TextInput
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    value={word}
                    onChangeText={(text) => handleWordChange(index, text)}
                    onFocus={() => setActiveIndex(index)}
                    placeholder={`Word ${index + 1}`}
                    placeholderTextColor="#666"
                    style={styles.wordInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                    autoFocus={autoFocus && index === 0}
                  />
                </View>
              </InnerContainer>
            </View>
          ))}
        </View>

        <Button
          title="insert YOUR seed phrase"
          onPress={handlePasteFromClipboard}
          variant="primary"
        />
        {/* Status Display */}
        {/*<View style={[styles.statusRow, commonStyles.mb4]}>*/}
        {/*  <Text style={[typography.textSm, typography.textGray400, typography.jura400]}>*/}
        {/*    Progress: {nonEmptyWordCount}/{expectedWordCount} words*/}
        {/*  </Text>*/}
        {/*  <View style={[*/}
        {/*    styles.statusBadge,*/}
        {/*    isValid ? styles.badgeValid : nonEmptyWordCount > 0 ? styles.badgeIncomplete : styles.badgeEmpty*/}
        {/*  ]}>*/}
        {/*    <Text style={[*/}
        {/*      typography.textXs,*/}
        {/*      typography.jura400,*/}
        {/*      isValid ? typography.textGreen400 : nonEmptyWordCount > 0 ? typography.textYellow400 : typography.textGray400*/}
        {/*    ]}>*/}
        {/*      {isValid ? '✅ Valid' : nonEmptyWordCount > 0 ? '⏳ Incomplete' : '⭕ Empty'}*/}
        {/*    </Text>*/}
        {/*  </View>*/}
        {/*</View>*/}

        {/* Action Buttons */}
        {/*<View style={styles.buttonRow}>*/}
        {/*  <Button*/}
        {/*    title="Clear All"*/}
        {/*    onPress={clearAll}*/}
        {/*    variant="outline"*/}
        {/*  />*/}
        {/*</View>*/}



      </View>

      {/*<Card style={commonStyles.mt2}>*/}

      {/*</Card>*/}
    </InnerContainer>

  );
};

const styles = StyleSheet.create({
  // Scroll view and word grid
  scrollView: {
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  wordInputWrapper: {
    width: '48%',
    marginBottom: theme.spacing[3],
  },
  wordInput: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    color: theme.colors.white,
    fontFamily: theme.fontFamily.juraMedium,
  },

  // Status display
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.sm,
  },
  badgeValid: {
    backgroundColor: theme.colors.green[800],
  },
  badgeIncomplete: {
    backgroundColor: theme.colors.yellow[800],
  },
  badgeEmpty: {
    backgroundColor: theme.colors.gray[800],
  },

  // Action buttons
  buttonRow: {
    flexDirection: 'row',
  },

  // Warning box
  warningBox: {
    padding: theme.spacing[3],
    backgroundColor: 'rgba(127, 29, 29, 0.2)', // red-900 with 20% opacity
    borderWidth: theme.borderWidth.default,
    borderColor: theme.colors.red[700],
    borderRadius: theme.borderRadius.lg,
  },
});
