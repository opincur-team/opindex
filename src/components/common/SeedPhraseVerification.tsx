import React, { useState, useEffect } from 'react';
import { View, Text as RNText, TouchableOpacity, StyleSheet } from 'react-native';
import { Button } from '@/src/components/ui';
import {InnerContainer} from "@/src/components/ui/InnerContainer";
import {typography} from "@/src/styles/typography";

interface SeedPhraseVerificationProps {
  originalSeedPhrase: string[];
  onVerificationComplete: (success: boolean) => void;
  onRetry?: () => void;
}

export const SeedPhraseVerification: React.FC<SeedPhraseVerificationProps> = ({
  originalSeedPhrase,
  onVerificationComplete,
  onRetry,
}) => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [verificationIndices, setVerificationIndices] = useState<number[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    initializeVerification();
  }, [originalSeedPhrase]);

  const initializeVerification = () => {
    // Select 6 random words to verify (or less if seed phrase is shorter)
    const numWordsToVerify = Math.min(4, originalSeedPhrase.length);
    const indices: number[] = [];
    while (indices.length < numWordsToVerify) {
      const randomIndex = Math.floor(Math.random() * originalSeedPhrase.length);
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }
    indices.sort((a, b) => a - b);
    setVerificationIndices(indices);

    // Create shuffled array with correct words and some decoy words
    const correctWords = indices.map(i => originalSeedPhrase[i]);
    const decoyWords = generateDecoyWords(correctWords, originalSeedPhrase);
    const allWords = [...correctWords, ...decoyWords];
    setShuffledWords(shuffleArray(allWords));

    setSelectedWords([]);
    setCurrentWordIndex(0);
    setIsComplete(false);
    setShowResult(false);
  };

  const generateDecoyWords = (correctWords: string[], seedPhrase: string[]): string[] => {
    const commonWords = [
      'abandon', 'ability', 'about', 'above', 'absent', 'absorb', 'abstract',
      'access', 'account', 'achieve', 'acquire', 'across', 'action', 'actor',
      'address', 'adjust', 'admit', 'adult', 'advance', 'advice', 'afford',
      'afraid', 'again', 'against', 'agent', 'agree', 'ahead', 'alarm',
      'alert', 'alien', 'allow', 'almost', 'alone', 'already', 'alter',
      'always', 'amazing', 'among', 'amount', 'anchor', 'ancient', 'anger'
    ];

    const decoys = [];
    const usedWords = new Set([...correctWords, ...seedPhrase]);

    for (const word of commonWords) {
      if (!usedWords.has(word) && decoys.length < 6) {
        decoys.push(word);
      }
    }

    return decoys.slice(0, Math.min(6, decoys.length));
  };

  const shuffleArray = (array: string[]): string[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleWordSelect = (word: string) => {
    const newSelectedWords = [...selectedWords, word];
    setSelectedWords(newSelectedWords);

    if (currentWordIndex < verificationIndices.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setIsComplete(true);
      setTimeout(() => {
        checkVerification(newSelectedWords);
      }, 500);
    }
  };

  const checkVerification = (selected: string[]) => {
    const isCorrect = verificationIndices.every((index, i) => {
      return selected[i] === originalSeedPhrase[index];
    });

    setShowResult(true);
    setTimeout(() => {
      onVerificationComplete(isCorrect);
    }, 1000);
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    initializeVerification();
  };

  const removeLastWord = () => {
    if (selectedWords.length > 0 && !isComplete) {
      setSelectedWords(selectedWords.slice(0, -1));
      setCurrentWordIndex(Math.max(0, currentWordIndex - 1));
    }
  };

  const getCurrentPrompt = () => {
    if (isComplete) {
      return showResult ? 'Verification Complete!' : 'Checking...';
    }
    const wordNumber = verificationIndices[currentWordIndex] + 1;
    return `Select word #${wordNumber}`;
  };

  const isVerificationSuccessful = () => {
    return verificationIndices.every((index, i) => {
      return selectedWords[i] === originalSeedPhrase[index];
    });
  };

  const getWordSlotStyle = (i: number) => {
    if (!selectedWords[i]) return styles.wordSlotEmpty;
    if (showResult) {
      const originalIndex = verificationIndices[i];
      return selectedWords[i] === originalSeedPhrase[originalIndex] 
        ? styles.wordSlotSuccess 
        : styles.wordSlotError;
    }
    return styles.wordSlotFilled;
  };

  return (
    <InnerContainer>
      <View style={styles.container}>

        <RNText style={[
          typography.jura400,
          typography.textWhite,
          styles.prompt]}>
          {getCurrentPrompt()}
        </RNText>

        {/* Selected Words Display */}
        <InnerContainer style={{width: '100%'}}>
          <View style={styles.selectedWordsContainer}>
            <View style={styles.selectedWordsGrid}>
              {verificationIndices.map((originalIndex, i) => (
                <View
                  key={originalIndex}
                  style={[styles.wordSlot, getWordSlotStyle(i)]}
                >
                  <RNText style={[
                    typography.daysone,
                    typography.textWhite,
                    styles.wordSlotText
                  ]}>
                    {selectedWords[i] || `${originalIndex + 1}`}
                  </RNText>
                </View>
              ))}
            </View>
          </View>
        </InnerContainer>


        {/* Word Selection */}
        {!isComplete && (
          <>
            <View style={styles.wordsGrid}>
              {shuffledWords.map((word, index) => (
                <TouchableOpacity
                  key={`${word}-${index}`}
                  onPress={() => handleWordSelect(word)}
                  style={styles.wordButton}
                >
                  <InnerContainer style={{width:'100%', minHeight: 44, justifyContent: 'center',}}>
                    <RNText style={[
                      typography.jura400,
                      typography.textWhite,
                      styles.wordButtonText
                    ]}>
                      {word}
                    </RNText>
                  </InnerContainer>
                </TouchableOpacity>
              ))}
            </View>

            {selectedWords.length > 0 && (
              <View style={styles.buttonContainer}>
                <Button
                  title="Remove Last Word"
                  onPress={removeLastWord}
                  variant="outline"
                />
              </View>
            )}
          </>
        )}

        {/* Result Display */}
        {showResult && (
          <View style={[
            styles.resultCard,
            isVerificationSuccessful() ? styles.resultSuccess : styles.resultError
          ]}>
            <RNText style={[
              styles.resultTitle,
              isVerificationSuccessful() ? styles.resultTitleSuccess : styles.resultTitleError
            ]}>
              {isVerificationSuccessful() ? '✅ Verification Successful!' : '❌ Verification Failed'}
            </RNText>
            <RNText style={styles.resultText}>
              {isVerificationSuccessful()
                ? 'Your seed phrase has been verified successfully.'
                : 'Some words were incorrect. Please try again.'
              }
            </RNText>
            {!isVerificationSuccessful() && (
              <View style={styles.buttonContainer}>
                <Button
                  title="Try Again"
                  onPress={handleRetry}
                  variant="outline"
                />
              </View>
            )}
          </View>
        )}
      </View>
    </InnerContainer>

  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  prompt: {
    marginBottom: 10,
    textAlign: 'center',
  },
  selectedWordsContainer: {
    marginBottom: 10,
  },
  selectedWordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    minHeight: 60,
    minWidth: 160,
    borderRadius: 16,
    gap: 10,
    padding: 10,
  },
  wordSlot: {
    margin: 4,
    padding: 10,
    borderRadius: 16,
    minWidth: 60,
  },
  wordSlotEmpty: {
    backgroundColor: 'rgba(60, 60, 60, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  wordSlotFilled: {
    backgroundColor: 'rgba(6, 235, 241, 0.2)',
    borderColor: '#06EBF1',
  },
  wordSlotSuccess: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    borderColor: '#00FF88',
  },
  wordSlotError: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderColor: '#ff0000',
  },
  wordSlotText: {
    textAlign: 'center',
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    padding: 0,
    marginBottom: 0,
    marginTop: 10
  },
  wordButton: {
    width: '48%',
    padding: 0,
    minHeight: 44,
  },
  wordButtonText: {
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 10,
  },
  resultCard: {
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
  },
  resultSuccess: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderColor: '#00FF88',
  },
  resultError: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderColor: '#ff0000',
  },
  resultTitle: {
    marginBottom: 8,
  },
  resultTitleSuccess: {
    color: '#00FF88',
  },
  resultTitleError: {
    color: '#ff4444',
  },
  resultText: {
    color: '#a0a0a0',
  },
});
