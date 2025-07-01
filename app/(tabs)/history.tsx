import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Field, getAllFields } from '@/constants/Fields';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

// Dynamic Message type based on field configuration
type Message = {
  id: string;
  date: Date;
  timestamp: Date;
} & {
  [K in string]: string;
};

type FieldHistory = {
  field: Field;
  entries: Array<{
    id: string;
    date: Date;
    content: string;
  }>;
};

export default function HistoryScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [allFields, setAllFields] = useState<Field[]>([]);
  const [fieldHistories, setFieldHistories] = useState<FieldHistory[]>([]);
  const [expandedFields, setExpandedFields] = useState<Set<number>>(new Set());
  const colorScheme = useColorScheme();

  // Load all fields and messages
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      // Load fields
      const fields = await getAllFields();
      setAllFields(fields);

      // Load messages
      const saved = await AsyncStorage.getItem('notes');
      if (saved) {
        const parsed = JSON.parse(saved).map((msg: any) => ({
          ...msg,
          date: msg.date ? new Date(msg.date) : new Date(),
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        }));
        setMessages(parsed);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Process messages into field histories
  useEffect(() => {
    const histories: FieldHistory[] = allFields
      .map(field => {
        const entries = messages
          .filter(msg => {
            const content = msg[field.key as keyof Message];
            return typeof content === 'string' && content.trim().length > 0;
          })
          .map(msg => ({
            id: msg.id,
            date: msg.date,
            content: msg[field.key as keyof Message] as string,
          }))
          .sort((a, b) => b.date.getTime() - a.date.getTime()); // Most recent first

        return {
          field,
          entries,
        };
      })
      .filter(history => history.entries.length > 0) // Only show fields with entries
      .sort((a, b) => b.entries.length - a.entries.length); // Sort by number of entries (descending)

    setFieldHistories(histories);
  }, [messages, allFields]);

  const toggleFieldExpansion = (fieldId: number) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(fieldId)) {
      newExpanded.delete(fieldId);
    } else {
      newExpanded.add(fieldId);
    }
    setExpandedFields(newExpanded);
  };

  const renderFieldHistory = ({ item }: { item: FieldHistory }) => {
    const isExpanded = expandedFields.has(item.field.id);
    const hasEntries = item.entries.length > 0;

    return (
      <View style={styles.fieldContainer}>
        <TouchableOpacity
          style={[
            styles.fieldHeader,
            hasEntries && styles.fieldHeaderWithEntries,
            !hasEntries && styles.fieldHeaderEmpty
          ]}
          onPress={() => toggleFieldExpansion(item.field.id)}
          disabled={!hasEntries}
        >
          <View style={styles.fieldHeaderContent}>
            <ThemedText style={styles.fieldLabel}>
              {item.field.label.replace(':', '')}
            </ThemedText>
            <View style={styles.fieldHeaderRight}>
              <ThemedText style={styles.entryCount}>
                {item.entries.length}
              </ThemedText>
              {hasEntries && (
                <IconSymbol
                  name={isExpanded ? "chevron.up" : "chevron.down"}
                  size={16}
                  color={Colors[colorScheme ?? 'light'].text}
                />
              )}
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && hasEntries && (
          <View style={styles.entriesContainer}>
            <FlatList
              data={item.entries}
              keyExtractor={(entry) => entry.id}
              renderItem={({ item: entry }) => (
                <View style={styles.entryItem}>
                  <View style={styles.entryHeader}>
                    <ThemedText style={styles.entryDate}>
                      {entry.date.toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.entryContent}>
                    {entry.content}
                  </ThemedText>
                </View>
              )}
              ItemSeparatorComponent={() => (
                <View style={[
                  styles.entrySeparator,
                  { backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault }
                ]} />
              )}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.subtitle}>
          Your past notes organized by topic
        </ThemedText>
      </View>

      <FlatList
        data={fieldHistories}
        keyExtractor={(item) => item.field.key}
        renderItem={renderFieldHistory}
        ItemSeparatorComponent={() => (
          <View style={[
            styles.fieldSeparator,
            { backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault }
          ]} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    padding: 20,
    paddingBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  listContent: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 8,
  },
  fieldHeader: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
  },
  fieldHeaderWithEntries: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
  fieldHeaderEmpty: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  fieldHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  fieldHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  entriesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(0, 255, 255, 0.02)',
    borderRadius: 8,
  },
  entryItem: {
    marginBottom: 12,
  },
  entryHeader: {
    marginBottom: 6,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  entryContent: {
    fontSize: 15,
    lineHeight: 22,
  },
  fieldSeparator: {
    height: 1,
    marginVertical: 8,
  },
  entrySeparator: {
    height: 1,
    marginVertical: 8,
  },
}); 