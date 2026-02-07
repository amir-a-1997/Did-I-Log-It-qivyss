
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useLogItems } from '@/hooks/useLogItems';
import { formatDateTime } from '@/utils/dateUtils';
import { IconSymbol } from '@/components/IconSymbol';
import { IconButton } from '@/components/IconButton';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useTheme } from '@/contexts/ThemeContext';

export default function HistoryScreen() {
  const { effectiveColorScheme } = useTheme();
  const theme = colors[effectiveColorScheme];
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { items, loading, clearItemHistory } = useLogItems();
  const [clearModalVisible, setClearModalVisible] = useState(false);

  const item = items.find((i) => i.id === id);

  useEffect(() => {
    if (!loading && !item) {
      console.log('Item not found, navigating back to home');
      router.back();
    }
  }, [item, loading, router]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  if (!item) {
    return null;
  }

  const handleClearHistory = () => {
    console.log('User tapped Clear History button');
    setClearModalVisible(true);
  };

  const handleDeleteLog = async () => {
    console.log('User confirmed Clear History');
    await clearItemHistory(item.id);
    setClearModalVisible(false);
  };

  const sortedLogs = [...item.logs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const lastLoggedText = item.logs.length > 0 ? formatDateTime(item.logs[0].timestamp) : 'Never logged';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: item.title,
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Category
            </Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              {item.category}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Last Logged
            </Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              {lastLoggedText}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Total Logs
            </Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              {item.logs.length}
            </Text>
          </View>
        </View>

        {item.logs.length > 0 && (
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: theme.danger }]}
            onPress={handleClearHistory}
          >
            <IconSymbol
              ios_icon_name="trash"
              android_material_icon_name="delete"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.clearButtonText}>Clear History</Text>
          </TouchableOpacity>
        )}

        <View style={styles.historySection}>
          <Text style={[styles.historyTitle, { color: theme.text }]}>
            History
          </Text>
          <Text style={[styles.historyCount, { color: theme.textSecondary }]}>
            {item.logs.length} log entries
          </Text>
        </View>

        {sortedLogs.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <IconSymbol
              ios_icon_name="clock"
              android_material_icon_name="schedule"
              size={48}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No history yet
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Tap "Log It" to record when you complete this task
            </Text>
          </View>
        ) : (
          sortedLogs.map((log, index) => {
            const logDate = formatDateTime(log.timestamp);
            return (
              <View
                key={log.id}
                style={[
                  styles.logCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <View style={[styles.logIndicator, { backgroundColor: theme.primary }]} />
                <View style={styles.logContent}>
                  <Text style={[styles.logDate, { color: theme.text }]}>
                    {logDate}
                  </Text>
                  <Text style={[styles.logIndex, { color: theme.textSecondary }]}>
                    Entry #{sortedLogs.length - index}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <ConfirmModal
        visible={clearModalVisible}
        title="Clear History?"
        message={`This will permanently delete all ${item.logs.length} log entries for "${item.title}". This cannot be undone.`}
        confirmText="Clear History"
        cancelText="Cancel"
        destructive={true}
        onConfirm={handleDeleteLog}
        onCancel={() => setClearModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  historySection: {
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  historyCount: {
    fontSize: 14,
  },
  emptyCard: {
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  logCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  logIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  logContent: {
    flex: 1,
  },
  logDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  logIndex: {
    fontSize: 14,
  },
});
