import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { Course } from '../../types';
import { ExtractedTopic } from '../../services/openai/topicExtraction';

interface ReviewTopicsScreenProps {
  course: Course;
  topics: ExtractedTopic[];
  onBack: () => void;
  onSave: (topics: ExtractedTopic[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ReviewTopicsScreen: React.FC<ReviewTopicsScreenProps> = ({
  course,
  topics: initialTopics,
  onBack,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [topics, setTopics] = useState<ExtractedTopic[]>(initialTopics);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Add a new topic
  const addNewTopic = () => {
    const newTopic: ExtractedTopic = {
      id: `topic-${Date.now()}`,
      title: 'New Topic',
      order: topics.length + 1,
      keywords: [],
    };
    
    setTopics([...topics, newTopic]);
    startEditing(newTopic.id, newTopic.title);
  };

  // Start editing a topic
  const startEditing = (topicId: string, currentTitle: string) => {
    setEditingId(topicId);
    setEditingTitle(currentTitle);
  };

  // Save topic edit
  const saveEdit = () => {
    if (!editingId || !editingTitle.trim()) return;

    setTopics(prevTopics =>
      prevTopics.map(topic =>
        topic.id === editingId
          ? { ...topic, title: editingTitle.trim() }
          : topic
      )
    );
    
    setEditingId(null);
    setEditingTitle('');
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  // Remove topic with confirmation
  const removeTopic = (topicId: string, topicTitle: string) => {
    Alert.alert(
      'Remove Topic',
      `Are you sure you want to remove "${topicTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setTopics(prevTopics => {
              const filtered = prevTopics.filter(topic => topic.id !== topicId);
              // Reorder remaining topics
              return filtered.map((topic, index) => ({
                ...topic,
                order: index + 1,
              }));
            });
          },
        },
      ]
    );
  };

  // Handle save all topics
  const handleSave = () => {
    if (topics.length === 0) {
      Alert.alert(
        'No Topics',
        'Please add at least one topic before saving.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Save Topics',
      `Save ${topics.length} topics for "${course.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: () => onSave(topics),
        },
      ]
    );
  };

  // Handle cancel with confirmation if topics were modified
  const handleCancel = () => {
    const hasChanges = JSON.stringify(topics) !== JSON.stringify(initialTopics);
    
    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: onCancel,
          },
        ]
      );
    } else {
      onCancel();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Text style={styles.title}>Review Topics</Text>
              <Text style={styles.subtitle}>Edit and organize your course topics</Text>
              
              <View style={styles.courseInfo}>
                <Text style={styles.courseLabel}>Course:</Text>
                <Text style={styles.courseName}>{course.name}</Text>
              </View>
            </View>
          </View>

          {/* Topics Section */}
          <View style={styles.section}>
            <View style={styles.topicsHeader}>
              <Text style={styles.sectionTitle}>
                Course Topics ({topics.length})
              </Text>
              <TouchableOpacity style={styles.addButton} onPress={addNewTopic}>
                <Text style={styles.addButtonText}>+ Add Topic</Text>
              </TouchableOpacity>
            </View>

            {topics.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyTitle}>No topics yet</Text>
                <Text style={styles.emptyText}>
                  Add your first topic to get started
                </Text>
              </View>
            ) : (
              topics.map((topic, index) => (
                <View key={topic.id} style={styles.topicCard}>
                  <View style={styles.topicHeader}>
                    <Text style={styles.topicNumber}>{index + 1}.</Text>
                    
                    {editingId === topic.id ? (
                      <View style={styles.editingContainer}>
                        <TextInput
                          style={styles.editInput}
                          value={editingTitle}
                          onChangeText={setEditingTitle}
                          onSubmitEditing={saveEdit}
                          onBlur={saveEdit}
                          autoFocus
                          placeholder="Enter topic title"
                          placeholderTextColor={colors.placeholder}
                        />
                        <View style={styles.editActions}>
                          <TouchableOpacity
                            style={styles.saveEditButton}
                            onPress={saveEdit}
                          >
                            <Text style={styles.saveEditText}>✓</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.cancelEditButton}
                            onPress={cancelEdit}
                          >
                            <Text style={styles.cancelEditText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.topicTitleContainer}
                        onPress={() => startEditing(topic.id, topic.title)}
                      >
                        <Text style={styles.topicTitle}>{topic.title}</Text>
                        <Text style={styles.editHint}>Tap to edit</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeTopic(topic.id, topic.title)}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Keywords */}
                  {topic.keywords && topic.keywords.length > 0 && (
                    <View style={styles.keywordsContainer}>
                      <Text style={styles.keywordsLabel}>Keywords:</Text>
                      <View style={styles.keywordsList}>
                        {topic.keywords.map((keyword, keyIndex) => (
                          <View key={keyIndex} style={styles.keywordTag}>
                            <Text style={styles.keywordText}>{keyword}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.saveButton, (topics.length === 0 || isLoading) && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={topics.length === 0 || isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : `Save ${topics.length} Topic${topics.length !== 1 ? 's' : ''}`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>💡 Tips</Text>
            <Text style={styles.helpText}>• Tap any topic title to edit it</Text>
            <Text style={styles.helpText}>• Add topics in logical learning order</Text>
            <Text style={styles.helpText}>• Topics help generate better quizzes</Text>
            <Text style={styles.helpText}>• You can always edit these later</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  backButtonText: {
    fontSize: fontSize.base,
    color: colors.primary,
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  courseInfo: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  courseLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  courseName: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.primary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  topicsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  topicCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  topicNumber: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: spacing.sm,
    minWidth: 20,
  },
  editingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  editInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  saveEditButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  saveEditText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
  },
  cancelEditButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  cancelEditText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
  },
  topicTitleContainer: {
    flex: 1,
  },
  topicTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  editHint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  removeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  removeButtonText: {
    color: colors.accent,
    fontSize: fontSize.base,
    fontWeight: 'bold',
  },
  keywordsContainer: {
    marginTop: spacing.sm,
  },
  keywordsLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  keywordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  keywordTag: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  keywordText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  actions: {
    marginBottom: spacing.xl,
  },
  saveButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  helpContainer: {
    backgroundColor: '#f0f9ff',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  helpTitle: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  helpText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
});