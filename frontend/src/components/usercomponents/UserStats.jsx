import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useUserStats } from '../../hooks/useUserStats';
import theme from '../../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: theme.colors.tertiary,
    paddingVertical: 20,
    paddingHorizontal: 24,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSizes.subheading + 4,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    marginBottom: 8,
  },
  statsContainer: {
    padding: 16,
  },
  overviewContainer: {
    marginBottom: 24,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  typeContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  typeItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  typeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textTransform: 'capitalize',
  },
  accuracyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  accuracyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  typeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  typeStatText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

const UserStats = () => {
  const { user, stats, loading, error } = useUserStats();
  console.log('UserStats component:', { user, stats, loading, error });
  
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Study Stats</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading stats...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Study Stats</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading stats: {error.message}</Text>
        </View>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Study Stats</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No stats available</Text>
        </View>
      </View>
    );
  }

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return { backgroundColor: '#dcfce7', color: '#166534' };
    if (accuracy >= 60) return { backgroundColor: '#fef3c7', color: '#92400e' };
    return { backgroundColor: '#fee2e2', color: '#dc2626' };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{user?.username || 'User'} Stats</Text>
      </View>

      <ScrollView style={styles.statsContainer}>
        {/* Overview Stats */}
        <View style={styles.overviewContainer}>
          <Text style={styles.overviewTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Questions Attempted</Text>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {stats.totalAttempted}
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Currently Due</Text>
              <Text style={[styles.statValue, { color: '#ea580c' }]}>
                {stats.currentlyDue}
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Overall Accuracy</Text>
              <Text style={[styles.statValue, { color: '#16a34a' }]}>
                {stats.overallAccuracy}%
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Mastery Rate</Text>
              <Text style={[styles.statValue, { color: '#9333ea' }]}>
                {stats.overallMasteryRate}%
              </Text>
            </View>
          </View>
        </View>

        {/* Question Types */}
        <View style={styles.typeContainer}>
          <Text style={styles.typeTitle}>Progress by Type</Text>
          {stats.byType.map((type) => (
            <View key={type._id} style={styles.typeItem}>
              <View style={styles.typeHeader}>
                <Text style={styles.typeName}>{type._id}</Text>
                <View style={[styles.accuracyBadge, getAccuracyColor(type.accuracy)]}>
                  <Text style={[styles.accuracyText, { color: getAccuracyColor(type.accuracy).color }]}>
                    {type.accuracy}%
                  </Text>
                </View>
              </View>
              <View style={styles.typeStats}>
                <Text style={styles.typeStatText}>Attempted: {type.attempted}</Text>
                <Text style={styles.typeStatText}>Due: {type.due}</Text>
                <Text style={styles.typeStatText}>Level: {type.avgSrsLevel}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default UserStats;