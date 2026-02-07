
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useLogItems } from '@/hooks/useLogItems';
import { formatDateTime } from '@/utils/dateUtils';
import { IconSymbol } from '@/components/IconSymbol';
import { ConfirmModal } from '@/components/ConfirmModal';

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { items, deleteItem, deleteLog } = useLogItems();

  const [deleteItemModalVisible, setDeleteItemModalVisible] = useState(false);
  const [deleteLogModalVisible, setDeleteLogModalVisible] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const item = items.find((i) => i.id === id);

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'History' }} />
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Item not found</Text>
      </View>
    );
  }

  const handleDeleteItem = () => {
    console.log('User confirmed delete item:', item.title);
    deleteItem(item.id);
    setDeleteItemModalVisible(false);
    router.back();
  };

  const handleDeleteLog = () => {
    if (selectedLogId) {
      console.log('User confirmed delete log:', selectedLogId);
      deleteLog(item.id, selectedLogId);
      setDeleteLogModalVisible(false);
      setSelectedLogId(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: item.title,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                console.log('User tapped delete item button');
                setDeleteItemModalVisible(true);
              }}
            >
              <IconSymbol
                ios_icon_name="trash"
                android_material_icon_name="delete"
                size={22}
                color={theme.danger}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Text>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: colorScheme === 'dark' ? theme.primaryLight : theme.primaryLight },
            ]}
          >
            <Text style={[styles.categoryText, { color: theme.primary }]}>{item.category}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>History</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            {item.logs.length === 0 ? 'No logs yet' : `${item.logs.length} log entries`}
          </Text>
        </View>

        {item.logs.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <IconSymbol
              ios_icon_name="clock"
              android_material_icon_name="schedule"
              size={48}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No logs yet. Tap &quot;Log It&quot; to record when you complete this task.
            </Text>
          </View>
        ) : (
          <View>
            {item.logs.map((log, index) => (
              <View
                key={log.id}
                style={[styles.logCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={styles.logContent}>
                  <View style={styles.logLeft}>
                    <View
                      style={[
                        styles.logNumber,
                        { backgroundColor: theme.primaryLight, borderColor: theme.primary },
                      ]}
                    >
                      <Text style={[styles.logNumberText, { color: theme.primary }]}>
                        {item.logs.length - index}
                      </Text>
                    </View>
                    <Text style={[styles.logDate, { color: theme.text }]}>
                      {formatDateTime(log.timestamp)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('User tapped delete log button');
                      setSelectedLogId(log.id);
                      setDeleteLogModalVisible(true);
                    }}
                  >
                    <IconSymbol
                      ios_icon_name="trash"
                      android_material_icon_name="delete"
                      size={20}
                      color={theme.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <ConfirmModal
        visible={deleteItemModalVisible}
        title="Delete Item?"
        message={`Are you sure you want to delete "${item.title}"? This will remove all log history.`}
        confirmText="Delete"
        cancelText="Cancel"
        destructive={true}
        onConfirm={handleDeleteItem}
        onCancel={() => setDeleteItemModalVisible(false)}
      />

      <ConfirmModal
        visible={deleteLogModalVisible}
        title="Delete Log Entry?"
        message="Are you sure you want to delete this log entry?"
        confirmText="Delete"
        cancelText="Cancel"
        destructive={true}
        onConfirm={handleDeleteLog}
        onCancel={() => {
          setDeleteLogModalVisible(false);
          setSelectedLogId(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  itemTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  emptyCard: {
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
  logCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  logContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logNumberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  logDate: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
});
