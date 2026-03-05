import React from 'react';
import {View, TouchableOpacity, StyleSheet, Text as RNText, Image} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/styles/theme';
import { typography } from '@/src/styles/typography';

interface NumericKeypadProps {
  onNumberPress: (num: string) => void;
  onBackspace: () => void;
  onDecimalPress?: () => void;
  disableDecimal?: boolean;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onNumberPress,
  onBackspace,
  onDecimalPress,
  disableDecimal = false,
}) => {
  const renderButton = (value: string, onPress: () => void, isSpecial: boolean = false) => {
    return (
      <TouchableOpacity
        style={[styles.button, isSpecial && styles.specialButton]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {value === 'backspace' ? (
          <Image source={require('../../../assets/images/icons/previous.png')} style={{width: 24, height: 24}}/>
          // <Ionicons name="backspace-outline" size={28} color={theme.colors.text.primary} />
        ) : (
          <RNText style={[styles.buttonText, typography.daysone]}>
            {value}
          </RNText>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {renderButton('1', () => onNumberPress('1'))}
        {renderButton('2', () => onNumberPress('2'))}
        {renderButton('3', () => onNumberPress('3'))}
      </View>

      <View style={styles.row}>
        {renderButton('4', () => onNumberPress('4'))}
        {renderButton('5', () => onNumberPress('5'))}
        {renderButton('6', () => onNumberPress('6'))}
      </View>

      <View style={styles.row}>
        {renderButton('7', () => onNumberPress('7'))}
        {renderButton('8', () => onNumberPress('8'))}
        {renderButton('9', () => onNumberPress('9'))}
      </View>

      <View style={styles.row}>
        {onDecimalPress && !disableDecimal
          ? renderButton('.', onDecimalPress, true)
          : <View style={styles.button} />}
        {renderButton('0', () => onNumberPress('0'))}
        {renderButton('backspace', onBackspace, true)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 10,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  specialButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  buttonText: {
    color: theme.colors.text.primary,
    fontSize: 32,
  },
});
