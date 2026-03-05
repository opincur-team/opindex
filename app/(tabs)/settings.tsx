import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text as RNText, Switch, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [isDark, setIsDark] = useState(true);

  const handleThemeChange = (value: boolean) => {
    setIsDark(value);
    // TODO: Implement actual theme switching
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.card}>
          <RNText style={styles.title}>Settings</RNText>
          <RNText style={styles.subtitle}>
            Configure app preferences and customize your experience
          </RNText>
        </View>

        {/* Theme Settings */}
        <View style={styles.card}>
          <RNText style={styles.cardTitle}>Theme & Appearance</RNText>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon" size={20} color="#06EBF1" style={styles.settingIcon} />
              <RNText style={styles.settingLabel}>Dark Mode</RNText>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleThemeChange}
              trackColor={{ false: '#767577', true: '#06EBF1' }}
              thumbColor={isDark ? '#ffffff' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          
          <View style={styles.themeInfo}>
            <RNText style={styles.themeInfoText}>
              Current Theme: {isDark ? 'Dark' : 'Light'}
            </RNText>
            <RNText style={styles.themeDescription}>
              Dark mode provides better battery life and reduces eye strain in low-light conditions
            </RNText>
          </View>
        </View>

        {/* Theme Preview */}
        <View style={styles.card}>
          <RNText style={styles.cardTitle}>Theme Preview</RNText>
          <View style={styles.previewContainer}>
            <RNText style={styles.previewPrimary}>
              Primary Text Color
            </RNText>
            <RNText style={styles.previewSecondary}>
              Secondary text with card background
            </RNText>
            <View style={styles.previewBox}>
              <RNText style={styles.previewTertiary}>
                Accent color elements
              </RNText>
            </View>
          </View>
        </View>

        {/* Security Settings */}
        <View style={styles.card}>
          <RNText style={styles.cardTitle}>Security</RNText>
          
          <Pressable style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="lock-closed" size={20} color="#06EBF1" style={styles.settingIcon} />
              <View style={styles.settingTextContainer}>
                <RNText style={styles.settingLabel}>Biometric Authentication</RNText>
                <RNText style={styles.settingSubtext}>Use fingerprint or face to unlock</RNText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </Pressable>

          <Pressable style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="timer" size={20} color="#06EBF1" style={styles.settingIcon} />
              <View style={styles.settingTextContainer}>
                <RNText style={styles.settingLabel}>Auto-Lock</RNText>
                <RNText style={styles.settingSubtext}>Lock wallet after inactivity</RNText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </Pressable>
        </View>

        {/* Additional Settings */}
        <View style={styles.card}>
          <RNText style={styles.cardTitle}>Additional Settings</RNText>
          
          <View style={styles.comingSoonList}>
            <View style={styles.comingSoonItem}>
              <RNText style={styles.comingSoonIcon}>🔔</RNText>
              <RNText style={styles.comingSoonText}>Notifications</RNText>
            </View>
            <View style={styles.comingSoonItem}>
              <RNText style={styles.comingSoonIcon}>🌐</RNText>
              <RNText style={styles.comingSoonText}>Language</RNText>
            </View>
            <View style={styles.comingSoonItem}>
              <RNText style={styles.comingSoonIcon}>📊</RNText>
              <RNText style={styles.comingSoonText}>Analytics</RNText>
            </View>
            <View style={styles.comingSoonItem}>
              <RNText style={styles.comingSoonIcon}>🛠️</RNText>
              <RNText style={styles.comingSoonText}>Advanced Settings</RNText>
            </View>
          </View>
          
          <View style={styles.comingSoonNote}>
            <RNText style={styles.comingSoonNoteText}>
              Additional settings will be available in future updates
            </RNText>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.card}>
          <RNText style={styles.cardTitle}>About</RNText>
          
          <View style={styles.appInfoList}>
            <View style={styles.appInfoItem}>
              <RNText style={styles.appInfoLabel}>Version</RNText>
              <RNText style={styles.appInfoValue}>1.0.0</RNText>
            </View>
            <View style={styles.appInfoItem}>
              <RNText style={styles.appInfoLabel}>Build</RNText>
              <RNText style={styles.appInfoValue}>2025.09.13</RNText>
            </View>
            <View style={styles.appInfoItem}>
              <RNText style={styles.appInfoLabel}>Network</RNText>
              <RNText style={styles.appInfoValue}>Solana Mainnet</RNText>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  card: {
    backgroundColor: 'rgba(23, 23, 23, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#a0a0a0',
    fontSize: 14,
    lineHeight: 18,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtext: {
    color: '#a0a0a0',
    fontSize: 12,
    marginTop: 2,
  },
  themeInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  themeInfoText: {
    color: '#a0a0a0',
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  themeDescription: {
    color: '#a0a0a0',
    fontSize: 12,
    lineHeight: 16,
  },
  previewContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  previewPrimary: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  previewSecondary: {
    color: '#a0a0a0',
    fontSize: 14,
    marginBottom: 12,
  },
  previewBox: {
    backgroundColor: 'rgba(6, 235, 241, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 235, 241, 0.3)',
  },
  previewTertiary: {
    color: '#06EBF1',
    fontSize: 12,
    fontWeight: '500',
  },
  comingSoonList: {
    marginBottom: 16,
  },
  comingSoonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  comingSoonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  comingSoonText: {
    color: '#a0a0a0',
    fontSize: 16,
  },
  comingSoonNote: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  comingSoonNoteText: {
    color: '#a0a0a0',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  appInfoList: {
    gap: 12,
  },
  appInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appInfoLabel: {
    color: '#a0a0a0',
    fontSize: 14,
  },
  appInfoValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});