import React from 'react';
import { Modal as RNModal, View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
  animationType?: 'slide' | 'fade' | 'none';
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnBackdrop = true,
  size = 'md',
  animationType = 'slide',
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { width: 320, maxHeight: 384 };
      case 'md':
        return { width: '91.67%' as const, maxHeight: 600 };
      case 'lg':
        return { width: '100%' as const, maxWidth: 672, maxHeight: 700 };
      case 'full':
        return { width: '100%' as const, height: '100%' as const };
      default:
        return { width: '91.67%' as const, maxHeight: 600 };
    }
  };

  const sizeStyles = getSizeStyles();
  const isFullSize = size === 'full';

  return (
    <RNModal
      visible={visible}
      animationType={animationType}
      transparent
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
        <TouchableWithoutFeedback onPress={closeOnBackdrop ? onClose : undefined}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View 
                style={[
                  {
                    // Card elevated styles
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.25)',
                    shadowColor: 'rgba(0, 0, 0, 0.4)',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 1,
                    shadowRadius: 16,
                    elevation: 16,
                    overflow: 'hidden',
                    // Conditional border radius
                    borderRadius: isFullSize ? 0 : 20,
                  },
                  sizeStyles
                ]}
              >
                {/* Header */}
                {(title || showCloseButton) && (
                  <View style={{
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: 'rgba(255, 255, 255, 0.2)'
                  }}>
                    {title ? (
                      <Text variant="subheading" style={{ flex: 1 }}>
                        {title}
                      </Text>
                    ) : (
                      <View style={{ flex: 1 }} />
                    )}
                    
                    {showCloseButton && (
                      <TouchableOpacity
                        onPress={onClose}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: '#2A2A2A',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: 12
                        }}
                      >
                        <Text size="lg" style={{ color: '#808080' }}>×</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                
                {/* Content */}
                <View style={{ flex: 1, padding: 16 }}>
                  {children}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </RNModal>
  );
};

// Confirmation Modal Component
interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={false}
    >
      <View style={{ gap: 24 }}>
        <Text variant="body" align="center">
          {message}
        </Text>
        
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button
            title={cancelText}
            onPress={onClose}
            variant="secondary"
            style={{ flex: 1 }}
          />
          <Button
            title={confirmText}
            onPress={handleConfirm}
            variant={variant === 'danger' ? 'secondary' : 'primary'}
            style={{ 
              flex: 1,
              ...(variant === 'danger' && { backgroundColor: '#FF3333' })
            }}
          />
        </View>
      </View>
    </Modal>
  );
};