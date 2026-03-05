import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal } from '@/src/components/ui/Modal';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Recipient } from '@/src/types/recipient';
import { validateRecipientName } from '@/src/utils/recipientHelpers';
import {BlurModalDialog} from "@/src/components/ui";

interface RecipientEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  recipient?: Recipient | null;
  address?: string;
}

export const RecipientEditModal: React.FC<RecipientEditModalProps> = ({
  visible,
  onClose,
  onSave,
  recipient,
  address,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setName(recipient?.name || '');
      setError('');
    }
  }, [visible, recipient]);

  const handleSave = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Name cannot be empty');
      return;
    }

    if (!validateRecipientName(trimmedName)) {
      setError('Name must be between 1 and 50 characters');
      return;
    }

    onSave(trimmedName);
    onClose();
  };

  const isEditing = !!recipient;

  return (
    <BlurModalDialog onClose={onClose}
                     visible={visible}
                     title={isEditing ? 'Edit Recipient' : 'Add Recipient'}
                     size="sm">
      <View style={styles.container}>
        <Input
          label="Name"
          placeholder="Enter a name for this recipient"
          value={name}
          onChangeText={(text) => {
            if (text?.length > 20) {
              text = text.slice(0, 20);
            }
            setName(text);
            setError('');
          }}
          error={error}
          autoFocus
          maxLength={50}
        />

        {address && !isEditing && (
          <Input
            label="Address"
            value={address}
            editable={false}
            style={styles.addressInput}
          />
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="secondary"
            style={styles.button}
          />
          <Button
            title="Save"
            onPress={handleSave}
            variant="primary"
            style={styles.button}
          />
        </View>
      </View>

    </BlurModalDialog>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  addressInput: {
    opacity: 0.7,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
});
