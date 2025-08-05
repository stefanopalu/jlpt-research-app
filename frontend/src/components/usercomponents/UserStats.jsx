import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { useUserStats } from '../../hooks/useUserStats';
import theme from '../../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backgroundImage: {
    flex: 1,
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    paddingTop: 40,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSizes.subheading + 6,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.primaryDark,
  },
  content: {
    padding: 18,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.primaryDark,
    textAlign: 'center',
    marginTop: 20,
  },
  errorCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  overviewCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewTitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 8,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primaryDark,
    textAlign: 'center',
  },
  typeCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  typeTitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  typeItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 14,
  },
  typeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  typeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  accuracyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accuracyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  typeStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeStatText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

const UserStats = () => {
  const { user, stats, loading, error } = useUserStats();

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return { backgroundColor: '#dcfce7', color: '#166534' };
    if (accuracy >= 60) return { backgroundColor: '#fef3c7', color: '#92400e' };
    return { backgroundColor: '#fee2e2', color: '#dc2626' };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Study Stats</Text>
        </View>
        <Text style={styles.loadingText}>Loading stats...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Study Stats</Text>
        </View>
        <View style={styles.errorCard}>
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
        <Text style={styles.loadingText}>No stats available</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../../../assets/bridge.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{user?.username || 'User'} Stats</Text>
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Overview */}
          <View style={styles.overviewCard}>
            <Text style={styles.overviewTitle}>Overview</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Questions Attempted</Text>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                  {stats.totalAttempted} / {stats.totalQuestions}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Currently Due</Text>
                <Text style={[styles.statValue, { color: '#ea580c' }]}>
                  {stats.currentlyDue}
                </Text>
              </View>
            </View>
            <View style={[styles.statsRow, { marginTop: 12 }]}>
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

          {/* Progress by Type */}
          <View style={styles.typeCard}>
            <Text style={styles.typeTitle}>Progress by Type</Text>
            {stats.byType.map((type) => {
              const accuracyColors = getAccuracyColor(type.accuracy);
              return (
                <View key={type._id} style={styles.typeItem}>
                  <View style={styles.typeHeader}>
                    <Text style={styles.typeName}>{type._id}</Text>
                    <View
                      style={[
                        styles.accuracyBadge,
                        { backgroundColor: accuracyColors.backgroundColor },
                      ]}
                    >
                      <Text
                        style={[styles.accuracyText, { color: accuracyColors.color }]}
                      >
                        {type.accuracy}%
                      </Text>
                    </View>
                  </View>
                  <View style={styles.typeStatsRow}>
                    <Text style={styles.typeStatText}>
                      Attempted: {type.attempted} / {type.totalAvailable}
                    </Text>
                    <Text style={styles.typeStatText}>Due: {type.due}</Text>
                    <Text style={styles.typeStatText}>Level: {type.avgSrsLevel}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

export default UserStats;
