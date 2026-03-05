import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/ui';
import { walletService } from '@/src/services/walletService';
import { theme } from '@/src/styles/theme';
import { commonStyles } from '@/src/styles/common';
import { typography } from '@/src/styles/typography';

interface BackupReminderProps {
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export const BackupReminder: React.FC<BackupReminderProps> = ({
  onDismiss,
  showDismiss = true,
}) => {
  const router = useRouter();
  const [shouldShow, setShouldShow] = useState(false);
  const [backupStatus, setBackupStatus] = useState<any>(null);

  useEffect(() => {
    checkBackupStatus();
  }, []);

  const checkBackupStatus = async () => {
    try {
      const needsReminder = await walletService.shouldRemindBackup();
      const status = await walletService.getWalletBackupStatus();
      
      setShouldShow(needsReminder);
      setBackupStatus(status);
    } catch (error) {
      console.error('Failed to check backup status:', error);
    }
  };

  const handleBackupNow = () => {
    router.push('/(auth)/seed-phrase-backup');
  };

  const handleDismiss = () => {
    setShouldShow(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleRemindLater = () => {
    // Could implement a "remind me in X days" feature here
    setShouldShow(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!shouldShow) {
    return null;
  }

  const getMessage = () => {
    if (!backupStatus?.hasBackup) {
      return {
        title: '⚠️ Wallet Not Backed Up',
        message: 'Your wallet is not backed up. If you lose your device, you will lose access to your funds permanently.',
        urgency: 'critical' as const
      };
    }

    if (!backupStatus?.lastBackupVerified) {
      return {
        title: '📋 Verify Your Backup',
        message: 'Please verify that you have safely backed up your seed phrase.',
        urgency: 'high' as const
      };
    }

    const daysSinceVerification = (Date.now() - backupStatus.lastBackupVerified.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceVerification > 30) {
      return {
        title: '🔄 Backup Reminder',
        message: `It's been ${Math.floor(daysSinceVerification)} days since you last verified your backup. Consider reviewing your seed phrase.`,
        urgency: 'medium' as const
      };
    }

    return null;
  };

  const messageInfo = getMessage();

  if (!messageInfo) {
    return null;
  }

  const cardStyle = {
    critical: styles.cardCritical,
    high: styles.cardHigh,
    medium: styles.cardMedium
  }[messageInfo.urgency];

  const textStyle = {
    critical: styles.textCritical,
    high: styles.textHigh,
    medium: styles.textMedium
  }[messageInfo.urgency];

  return (
    <Card style={[styles.cardContainer, cardStyle]}>
      <View style={[styles.row, styles.headerRow, commonStyles.mb3]}>
        <View style={[commonStyles.flex1, styles.contentContainer]}>
          <Text style={[typography.jura600, typography.textBase, commonStyles.mb2, textStyle]}>
            {messageInfo.title}
          </Text>
          <Text style={[typography.jura400, typography.textSm, textStyle]}>
            {messageInfo.message}
          </Text>
        </View>

        {showDismiss && (
          <TouchableOpacity onPress={handleDismiss}>
            <Text style={styles.dismissButton}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.row}>
        <Button
          title={!backupStatus?.hasBackup ? 'Backup Now' : 'Verify Backup'}
          onPress={handleBackupNow}
          style={[commonStyles.flex1, commonStyles.mr3]}
          variant={messageInfo.urgency === 'critical' ? 'primary' : 'outline'}
        />

        {messageInfo.urgency !== 'critical' && (
          <Button
            title="Later"
            onPress={handleRemindLater}
            variant="outline"
            style={commonStyles.flex1}
          />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  // Card container base styles
  cardContainer: {
    padding: theme.spacing[4],
    borderWidth: 2,
    marginHorizontal: theme.spacing[4],
    marginVertical: theme.spacing[2],
  },

  // Card urgency styles
  cardCritical: {
    borderColor: theme.colors.red[500],
    backgroundColor: 'rgba(127, 29, 29, 0.2)', // red-900/20
  },
  cardHigh: {
    borderColor: theme.colors.yellow[500],
    backgroundColor: 'rgba(113, 63, 18, 0.2)', // yellow-900/20
  },
  cardMedium: {
    borderColor: theme.colors.blue[500],
    backgroundColor: 'rgba(30, 58, 138, 0.2)', // blue-900/20
  },

  // Text urgency colors
  textCritical: {
    color: theme.colors.red[400],
  },
  textHigh: {
    color: theme.colors.yellow[400],
  },
  textMedium: {
    color: theme.colors.blue[400],
  },

  // Layout styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRow: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contentContainer: {
    paddingRight: theme.spacing[3],
  },

  // Dismiss button
  dismissButton: {
    color: theme.colors.gray[500],
    fontSize: theme.fontSize.xl,
  },
});