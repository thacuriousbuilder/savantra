
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { useCourseStore } from '../../stores/courseStore';
import { createCourseSchema, CreateCourseFormData, COURSE_FORM_FIELDS } from '../../schemas/courseSchema';

interface CreateCourseScreenProps {
  onBack: () => void;
  onSuccess: (courseId: string) => void;
}

export const CreateCourseScreen: React.FC<CreateCourseScreenProps> = ({
  onBack,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateCourseFormData>({
    name: '',
    endDate: '',
    description: '',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof CreateCourseFormData, string>>>({});
  const { createCourse, isLoading } = useCourseStore();

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Get minimum date (today)
  const getMinDate = (): string => {
    return formatDateForInput(new Date());
  };

  const updateField = (field: keyof CreateCourseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      createCourseSchema.parse(formData);
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors below');
      return;
    }

    const success = await createCourse({
      name: formData.name,
      endDate: formData.endDate,
      description: formData.description || undefined,
    });

    if (success) {
      Alert.alert('Success!', 'Course created successfully', [
        { text: 'OK', onPress: () => onSuccess('new-course-id') }
      ]);
    } else {
      Alert.alert('Error', 'Failed to create course. Please try again.');
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
            
            <Text style={styles.title}>Create New Course</Text>
            <Text style={styles.subtitle}>Add a course to start generating quizzes</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Course Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Course Name *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="e.g., Computer Science 101"
                placeholderTextColor={colors.placeholder}
                value={formData.name}
                onChangeText={(value) => updateField(COURSE_FORM_FIELDS.NAME, value)}
                autoCapitalize="words"
                maxLength={100}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* End Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Course End Date *</Text>
              <TextInput
                style={[styles.input, errors.endDate && styles.inputError]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.placeholder}
                value={formData.endDate}
                onChangeText={(value) => updateField(COURSE_FORM_FIELDS.END_DATE, value)}
                keyboardType="default"
              />
              <Text style={styles.helpText}>
                Minimum date: {getMinDate()}
              </Text>
              {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                placeholder="Brief description of the course..."
                placeholderTextColor={colors.placeholder}
                value={formData.description}
                onChangeText={(value) => updateField(COURSE_FORM_FIELDS.DESCRIPTION, value)}
                multiline
                numberOfLines={3}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.helpText}>
                {formData.description?.length || 0}/500 characters
              </Text>
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Creating Course...' : 'Create Course'}
            </Text>
          </TouchableOpacity>
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
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  form: {
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    fontWeight: '500',
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
    borderColor: colors.accent, // Pink for errors
  },
  textArea: {
    minHeight: 80,
  },
  helpText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.accent, // Pink for errors
    marginTop: spacing.xs,
  },
  submitButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
});