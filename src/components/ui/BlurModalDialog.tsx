/**
 * BlurModalDialog - A reusable modal dialog component with blur effect
 *
 * @example
 * ```tsx
 * import { BlurModalDialog } from '@/src/components/ui';
 * import { Button } from '@/src/components/ui';
 *
 * function MyComponent() {
 *   const [visible, setVisible] = useState(false);
 *
 *   return (
 *     <BlurModalDialog
 *       visible={visible}
 *       onClose={() => setVisible(false)}
 *       title="Confirm Action"
 *       actions={
 *         <View style={{ flexDirection: 'row', gap: 10 }}>
 *           <Button title="Cancel" onPress={() => setVisible(false)} />
 *           <Button title="Confirm" onPress={handleConfirm} />
 *         </View>
 *       }
 *     >
 *       <Text>Are you sure you want to proceed?</Text>
 *     </BlurModalDialog>
 *   );
 * }
 * ```
 */

import React from 'react';
import { View, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Text as RNText } from 'react-native';
import { BlurContainer } from './BlurContainer';
import { BlurOverlay } from './BlurOverlay';
import { InnerContainer } from './InnerContainer';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/styles/theme';
import { typography } from '@/src/styles/typography';

interface BlurModalDialogProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  children: React.ReactNode;
  maxWidth?: number;
  actions?: React.ReactNode;
  loading?: boolean;
}

export const BlurModalDialog: React.FC<BlurModalDialogProps> = ({
  visible,
  onClose,
  title,
  showCloseButton = true,
  children,
  maxWidth = 400,
  actions,
  loading = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurOverlay>
        <BlurContainer style={[styles.modalContainer, { maxWidth }]}>
          <InnerContainer style={styles.modalContent}>
            {/* Header */}
            {(title || showCloseButton) && (
              <View style={styles.header}>
                {title && (
                  <RNText
                    style={[
                      typography.textPrimary,
                      typography.daysone,
                      typography.uppercase,
                      styles.title,
                    ]}
                  >
                    {title}
                  </RNText>
                )}
                {showCloseButton && (
                  <TouchableOpacity
                    onPress={onClose}
                    disabled={loading}
                    style={styles.closeButton}
                  >
                    <Ionicons
                      name="close"
                      size={28}
                      color={theme.colors.white}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Content */}
            <View style={styles.content}>{children}</View>

            {/* Actions Footer */}
            {actions && <View style={styles.actionsContainer}>{actions}</View>}
          </InnerContainer>
        </BlurContainer>
      </BlurOverlay>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 30,
  },
  modalContent: {
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    marginRight: -40
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  content: {
    marginBottom: 10,
  },
  actionsContainer: {
    marginTop: 10,
  },
});
