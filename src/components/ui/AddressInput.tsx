import React, { useState, useEffect } from 'react';
import {View, TouchableOpacity, StyleSheet, Text as RNText, Image} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Input } from './Input';
import { Ionicons } from '@expo/vector-icons';
import { isValidSolanaAddress } from '@/src/utils/addressValidator';
import { theme } from '@/src/styles/theme';

interface AddressInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onValidAddress?: (address: string) => void;
  autoValidate?: boolean;
  /** User's own wallet address - used to prevent self-transfers */
  userAddress?: string;
}

const importIcon = require('../../../assets/images/icons/import.png');

export const AddressInput: React.FC<AddressInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Enter Solana address',
  onValidAddress,
  autoValidate = true,
  userAddress,
}) => {
  const [error, setError] = useState<string>('');
  const [hasClipboard, setHasClipboard] = useState<boolean>(false);

  // Check clipboard on mount
  useEffect(() => {
    checkClipboard();
  }, []);

  const checkClipboard = async () => {
    try {
      const clipboardText = await Clipboard.getStringAsync();
      if (clipboardText && isValidSolanaAddress(clipboardText)) {
        setHasClipboard(true);
      } else {
        setHasClipboard(false);
      }
    } catch (error) {
      console.error('Failed to check clipboard:', error);
      setHasClipboard(false);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await Clipboard.getStringAsync();
      if (clipboardText) {
        onChangeText(clipboardText);
        validateAddress(clipboardText);
      }
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
    }
  };

  const validateAddress = (address: string) => {
    if (!address) {
      setError('');
      return;
    }

    if (!isValidSolanaAddress(address)) {
      setError('Invalid Solana address');
      return;
    }

    // Check for self-transfer
    if (userAddress && address.toLowerCase() === userAddress.toLowerCase()) {
      setError('Cannot send to your own address');
      return;
    }

    setError('');
    if (onValidAddress) {
      onValidAddress(address);
    }
  };

  const handleChange = (text: string) => {
    onChangeText(text);
    if (autoValidate) {
      validateAddress(text);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        variant='ghost'
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.white}
        autoCapitalize="none"
        autoCorrect={false}
        error={error}
        rightIcon={
          hasClipboard && !value ? (
            <TouchableOpacity onPress={handlePaste} style={styles.pasteButton}>
              <Image source={importIcon} style={{width: 20, height: 20}} />
            </TouchableOpacity>
          ) : value ? (
            <TouchableOpacity onPress={() => onChangeText('')} style={styles.pasteButton}>
              <Ionicons name="close-circle" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          ) : null
        }
      />

      {value && !error && (
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
          <RNText style={[styles.successText]}>
            Valid address
          </RNText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  pasteButton: {
    padding: 4,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 10,
    gap: 10,
    flex: 1
  },
  successText: {
    color: theme.colors.success,
  },
  input: {

  }
});
