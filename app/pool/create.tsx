import { View, Text, StyleSheet } from 'react-native';

export default function CreatePoolScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Pool</Text>
      <Text style={styles.subtitle}>
        Create a new liquidity pool for token pairs
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});