import React, { useState } from 'react';
import { View, Text as RNText, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { Button } from '@/src/components/ui';
import {InnerContainer} from "@/src/components/ui/InnerContainer";
import {typography} from "@/src/styles/typography";

interface SeedPhraseDisplayProps {
  seedPhrase: string[];
  isBlurred?: boolean;
  showCopyButton?: boolean;
  showWordNumbers?: boolean;
  onReveal?: () => void;
}

export const SeedPhraseDisplay: React.FC<SeedPhraseDisplayProps> = ({
  seedPhrase,
  isBlurred = false,
  showCopyButton = false,
  showWordNumbers = true,
  onReveal,
}) => {
  const [isRevealed, setIsRevealed] = useState(!isBlurred);

  const handleReveal = () => {
    if (onReveal) {
      onReveal();
    }
    setIsRevealed(true);
  };

  const handleCopyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(seedPhrase.join(' '));
      Alert.alert('Copied', 'Seed phrase copied. Clipboard will be cleared in 30 seconds.');

      // Auto-clear clipboard after 30 seconds for security
      setTimeout(async () => {
        try {
          await Clipboard.setStringAsync('');
        } catch {
          // Ignore errors when clearing clipboard
        }
      }, 30000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy seed phrase');
    }
  };

  return (
    <InnerContainer style={{marginBottom: 10}}>
      <View style={styles.container}>
        {!isRevealed ? (
          <View style={styles.revealContainer}>

            <LinearGradient
              colors={['#FFA600', '#F76E0C']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.43 }}
              style={styles.warningCard}
            >
              <RNText style={[
                typography.daysone,
                typography.textWhite,
                typography.textXs,
                typography.uppercase,
                styles.warningText
              ]}>WARNING: Your seed phrase is the key to your wallet. No one but you should ever see it. Lose your seed — lose your crypto. !!!
              </RNText>
              <RNText style={[
                typography.daysone,
                typography.textWhite,
                typography.uppercase,
                typography.textXs,
                styles.warningText
              ]}>
                Welcome to the freedom of Web 3.0.
              </RNText>

            </LinearGradient>

            <Button variant='primary' title='Reveal Seed Phrase' onPress={handleReveal} style={styles.revealButton}/>
            {/*<TouchableOpacity*/}
            {/*  onPress={handleReveal}*/}
            {/*  style={styles.revealButton}*/}
            {/*>*/}
            {/*  <RNText style={styles.revealButtonText}></RNText>*/}
            {/*</TouchableOpacity>*/}
          </View>
        ) : (
          <>
            <View style={styles.seedGrid}>
              {seedPhrase.map((word, index) => (

                  <InnerContainer key={index} style={{minHeight: 44,
                    width: '48%',
                    padding: 10,
                    marginBottom: 10,

                  }}>

                    <View style={styles.wordContent}>
                      {showWordNumbers && (
                        <RNText style={[
                          typography.daysone,
                          typography.textWhite,
                          styles.wordNumber
                        ]}>
                          {index + 1}
                        </RNText>
                      )}
                      <RNText style={[
                        typography.jura400,
                        typography.textWhite,
                        typography.textBase,
                        styles.wordText
                      ]}>
                        {word}
                      </RNText>
                    </View>


                  </InnerContainer>

              ))}

            </View>

            {showCopyButton && (
              <Button variant="primary"
                title="Copy THE Seed Phrase"
                onPress={handleCopyToClipboard}
              />
            )}
          </>
        )}

      </View>
    </InnerContainer>

  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  revealContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 360,
  },
  revealText: {
    color: '#a0a0a0',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  revealButton: {
    width: '100%',
  },
  revealButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  seedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  wordCard: {
  },
  wordContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordNumber: {
    marginRight: 8,
    minWidth: 20,
  },
  wordText: {
    flex: 1,
  },
  warningCard: {
    borderColor: 'rgba(180, 83, 9, 0.7)',
    borderRadius: 20,
    padding: 10,
  },
  warningText: {
    textAlign: 'center',
  },



});
