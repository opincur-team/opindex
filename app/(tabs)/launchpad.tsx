import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text as RNText, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/src/components/ui';

export default function LaunchpadScreen() {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenSupply, setTokenSupply] = useState('');

  const handleCreateToken = () => {
    console.log('Create token:', { tokenName, tokenSymbol, tokenSupply });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <RNText style={styles.title}>Token Launchpad</RNText>
          <RNText style={styles.subtitle}>
            Create and manage your tokens with our powerful launchpad
          </RNText>
        </View>

        {/* Token Creation Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="rocket" size={24} color="#06EBF1" />
            <RNText style={styles.cardTitle}>Create New Token</RNText>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <RNText style={styles.inputLabel}>Token Name</RNText>
              <TextInput
                style={styles.textInput}
                value={tokenName}
                onChangeText={setTokenName}
                placeholder="Enter token name"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <RNText style={styles.inputLabel}>Token Symbol</RNText>
              <TextInput
                style={styles.textInput}
                value={tokenSymbol}
                onChangeText={setTokenSymbol}
                placeholder="e.g., MYT"
                placeholderTextColor="#666"
                maxLength={6}
              />
            </View>

            <View style={styles.inputGroup}>
              <RNText style={styles.inputLabel}>Initial Supply</RNText>
              <TextInput
                style={styles.textInput}
                value={tokenSupply}
                onChangeText={setTokenSupply}
                placeholder="1000000"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>

            <Button
              title="Create Token (Coming Soon)"
              onPress={handleCreateToken}
              disabled={true}
              style={styles.createButton}
            />
          </View>
        </View>

        {/* Active Launches */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trending-up" size={24} color="#22c55e" />
            <RNText style={styles.cardTitle}>Active Launches</RNText>
          </View>

          <View style={styles.emptyState}>
            <Ionicons name="rocket-outline" size={48} color="#666" />
            <RNText style={styles.emptyStateTitle}>No Active Launches</RNText>
            <RNText style={styles.emptyStateText}>
              Your created tokens will appear here once launched
            </RNText>
          </View>
        </View>

        {/* Pool Management */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="water" size={24} color="#3b82f6" />
            <RNText style={styles.cardTitle}>Pool Management</RNText>
          </View>

          <View style={styles.poolActions}>
            <Pressable style={styles.poolActionItem}>
              <View style={styles.poolActionLeft}>
                <View style={[styles.poolActionIcon, styles.primaryIcon]}>
                  <Ionicons name="add" size={20} color="#06EBF1" />
                </View>
                <View style={styles.poolActionText}>
                  <RNText style={styles.poolActionTitle}>Create Pool</RNText>
                  <RNText style={styles.poolActionSubtitle}>Add liquidity to your token</RNText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </Pressable>

            <Pressable style={styles.poolActionItem}>
              <View style={styles.poolActionLeft}>
                <View style={[styles.poolActionIcon, styles.secondaryIcon]}>
                  <Ionicons name="bar-chart" size={20} color="#22c55e" />
                </View>
                <View style={styles.poolActionText}>
                  <RNText style={styles.poolActionTitle}>Manage Liquidity</RNText>
                  <RNText style={styles.poolActionSubtitle}>Add or remove liquidity</RNText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </Pressable>

            <Pressable style={styles.poolActionItem}>
              <View style={styles.poolActionLeft}>
                <View style={[styles.poolActionIcon, styles.warningIcon]}>
                  <Ionicons name="analytics" size={20} color="#eab308" />
                </View>
                <View style={styles.poolActionText}>
                  <RNText style={styles.poolActionTitle}>Pool Analytics</RNText>
                  <RNText style={styles.poolActionSubtitle}>View trading statistics</RNText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </Pressable>
          </View>
        </View>

        {/* Launchpad Stats */}
        <View style={styles.card}>
          <RNText style={styles.cardTitle}>Launchpad Statistics</RNText>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <RNText style={styles.statValue}>0</RNText>
              <RNText style={styles.statLabel}>Tokens Created</RNText>
            </View>
            <View style={styles.statItem}>
              <RNText style={styles.statValue}>$0.00</RNText>
              <RNText style={styles.statLabel}>Total Value</RNText>
            </View>
            <View style={styles.statItem}>
              <RNText style={styles.statValue}>0</RNText>
              <RNText style={styles.statLabel}>Active Pools</RNText>
            </View>
            <View style={styles.statItem}>
              <RNText style={styles.statValue}>$0.00</RNText>
              <RNText style={styles.statLabel}>Liquidity Provided</RNText>
            </View>
          </View>
        </View>

        {/* Coming Soon Notice */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={20} color="#3b82f6" style={styles.infoIcon} />
            <View style={styles.infoTextContainer}>
              <RNText style={styles.infoTitle}>
                Launchpad Features Coming Soon
              </RNText>
              <RNText style={styles.infoText}>
                Token creation, pool management, and analytics are currently in development. The interface is ready for when these features are implemented.
              </RNText>
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
    paddingVertical: 24,
  },
  header: {
    marginBottom: 24,
    paddingTop: 16,
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
  card: {
    backgroundColor: 'rgba(23, 23, 23, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  formSection: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#a0a0a0',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  createButton: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#a0a0a0',
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 250,
  },
  poolActions: {
    gap: 12,
  },
  poolActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  poolActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  poolActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  primaryIcon: {
    backgroundColor: 'rgba(6, 235, 241, 0.2)',
  },
  secondaryIcon: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  warningIcon: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
  },
  poolActionText: {
    flex: 1,
  },
  poolActionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  poolActionSubtitle: {
    color: '#a0a0a0',
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    minWidth: '45%',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: '#a0a0a0',
    fontSize: 12,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    color: '#93c5fd',
    fontSize: 14,
    lineHeight: 18,
  },
});