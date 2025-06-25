
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
import { useCourseStore } from '../../stores/courseStore';
import { Course } from '../../types';
import { createCourseSchema, CreateCourseFormData } from '../../schemas/courseSchema';

interface CourseDetailScreenProps {
  course: Course;
  onBack: () => void;
  onDeleted: () => void;
}

export const CourseDetailScreen: React.FC<CourseDetailScreenProps> = ({
  course,
  onBack,
  onDeleted,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<CreateCourseFormData>({
    name: course.name,
    endDate: course.endDate,
    description: course.description || '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateCourseFormData, string>>>({});

  const { updateCourse, deleteCourse, isLoading } = useCourseStore();

  // Calculate course status
  const getCourseStatus = () => {
    const end = new Date(course.endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Ended ${Math.abs(diffDays)} days ago`, color: colors.textLight, status: 'ended' };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} day${diffDays === 1 ? '' : 's'} remaining`, color: colors.accent, status: 'urgent' };
    } else {
      const weeks = Math.ceil(diffDays / 7);
      return { text: `${weeks} week${weeks === 1 ? '' : 's'} remaining`, color: colors.textSecondary, status: 'active' };
    }
  };

  const courseStatus = getCourseStatus();

  const updateField = (field: keyof CreateCourseFormData, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      createCourseSchema.parse(editData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<Record<keyof CreateCourseFormData, string>> = {};
      error.errors?.forEach((err: any) => {
        const fieldName = err.path[0] as keyof CreateCourseFormData;
        fieldErrors[fieldName] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors below');
      return;
    }

    const success = await updateCourse(course.id, {
      name: editData.name,
      endDate: editData.endDate,
      description: editData.description || undefined,
    });

    if (success) {
      setIsEditing(false);
      Alert.alert('Success', 'Course updated successfully');
    } else {
      Alert.alert('Error', 'Failed to update course');
    }
  };

  const handleCancel = () => {
    setEditData({
      name: course.name,
      endDate: course.endDate,
      description: course.description || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Course',
      `Are you sure you want to delete "${course.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteCourse(course.id);
            if (success) {
              Alert.alert('Deleted', 'Course deleted successfully', [
                { text: 'OK', onPress: onDeleted }
              ]);
            } else {
              Alert.alert('Error', 'Failed to delete course');
            }
          }
        }
      ]
    );
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
            
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => isEditing ? handleCancel() : setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Course Info Section */}
          <View style={styles.section}>
            <View style={styles.courseHeader}>
              <View style={[styles.courseIcon, { 
                backgroundColor: courseStatus.status === 'ended' ? colors.textLight : colors.primary 
              }]}>
                <Text style={styles.courseIconText}>📚</Text>
              </View>
              
              <View style={styles.courseHeaderInfo}>
                {isEditing ? (
                  <TextInput
                    style={[styles.input, styles.titleInput, errors.name && styles.inputError]}
                    value={editData.name}
                    onChangeText={(value) => updateField('name', value)}
                    placeholder="Course name"
                    maxLength={100}
                  />
                ) : (
                  <Text style={styles.courseTitle}>{course.name}</Text>
                )}
                
                <Text style={[styles.courseStatus, { color: courseStatus.color }]}>
                  {courseStatus.text}
                </Text>
              </View>
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Course Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Course Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>End Date</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, styles.detailInput, errors.endDate && styles.inputError]}
                  value={editData.endDate}
                  onChangeText={(value) => updateField('endDate', value)}
                  placeholder="YYYY-MM-DD"
                />
              ) : (
                <Text style={styles.detailValue}>{course.endDate}</Text>
              )}
            </View>
            {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Description</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                  value={editData.description}
                  onChangeText={(value) => updateField('description', value)}
                  placeholder="Course description..."
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                  textAlignVertical="top"
                />
              ) : (
                <Text style={styles.detailValue}>
                  {course.description || 'No description provided'}
                </Text>
              )}
            </View>
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          {/* Topics Section (Placeholder) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Topics</Text>
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderIcon}>📝</Text>
              <Text style={styles.placeholderText}>No topics extracted yet</Text>
              <Text style={styles.placeholderSubtext}>
                Upload a syllabus to automatically extract course topics
              </Text>
            </View>
          </View>

          {/* Quiz History Section (Placeholder) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quiz History</Text>
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderIcon}>📊</Text>
              <Text style={styles.placeholderText}>No quizzes completed yet</Text>
              <Text style={styles.placeholderSubtext}>
                Complete quizzes to see your progress here
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          {isEditing ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.saveButton, isLoading && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteButtonText}>Delete Course</Text>
              </TouchableOpacity>
            </View>
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  backButtonText: {
    fontSize: fontSize.base,
    color: colors.primary,
    fontWeight: '600',
  },
  editButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  editButtonText: {
    fontSize: fontSize.base,
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.xl,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  courseIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  courseIconText: {
    fontSize: 24,
  },
  courseHeaderInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  courseStatus: {
    fontSize: fontSize.base,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  detailRow: {
    marginBottom: spacing.md,
  },
  detailLabel: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.accent,
  },
  titleInput: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
  detailInput: {
    marginTop: spacing.xs,
  },
  textArea: {
    minHeight: 80,
    marginTop: spacing.xs,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.accent,
    marginTop: spacing.xs,
  },
  placeholderBox: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
    marginBottom: spacing.md,
  },
  placeholderText: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  placeholderSubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
  saveButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.accent,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});