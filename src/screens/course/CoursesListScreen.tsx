
import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { useCourseStore } from '../../stores/courseStore';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { Course } from '../../types';
import { 
  ErrorBanner, 
  NetworkError, 
  LoadingError 
} from '../../components/common/ErrorComponent';

interface CoursesListScreenProps {
  onCreateCourse: () => void;
  onCoursePress: (course: Course) => void;
}

export const CoursesListScreen: React.FC<CoursesListScreenProps> = ({
  onCreateCourse,
  onCoursePress,
}) => {
  const { 
    courses, 
    isLoading, 
    error: storeError, 
    fetchCourses, 
    deleteCourse,
    clearError: clearStoreError,
  } = useCourseStore();

  const {
    error,
    showError,
    clearError,
    handleStoreError,
    hasError,
    isNetworkError,
  } = useErrorHandler();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Handle store errors when they change
  useEffect(() => {
    if (storeError) {
      handleStoreError(storeError, 'load courses', () => {
        clearStoreError();
        fetchCourses();
      });
    }
  }, [storeError, handleStoreError, clearStoreError, fetchCourses]);

  // Calculate days until course end (unchanged)
  const getDaysUntilEnd = (endDate: string): { text: string; isUrgent: boolean; isPast: boolean } => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Ended ${Math.abs(diffDays)} days ago`, isUrgent: false, isPast: true };
    } else if (diffDays === 0) {
      return { text: 'Ends today', isUrgent: true, isPast: false };
    } else if (diffDays <= 7) {
      return { text: `Ends in ${diffDays} day${diffDays === 1 ? '' : 's'}`, isUrgent: true, isPast: false };
    } else if (diffDays <= 30) {
      const weeks = Math.ceil(diffDays / 7);
      return { text: `Ends in ${weeks} week${weeks === 1 ? '' : 's'}`, isUrgent: false, isPast: false };
    } else {
      const months = Math.ceil(diffDays / 30);
      return { text: `Ends in ${months} month${months === 1 ? '' : 's'}`, isUrgent: false, isPast: false };
    }
  };

  const getCourseIconColor = (endDate: string): string => {
    const { isUrgent, isPast } = getDaysUntilEnd(endDate);
    if (isPast) return colors.textLight;
    if (isUrgent) return colors.accent;
    return colors.primary;
  };

  const getMockProgress = (): number => {
    return Math.floor(Math.random() * 100);
  };

  const handleDeleteCourse = async (course: Course) => {
    Alert.alert(
      'Delete Course',
      `Are you sure you want to delete "${course.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const success = await deleteCourse(course.id);
            if (!success && storeError) {
              // Error handling is done through useEffect above
              console.log('Delete failed, error will be shown via useEffect');
            }
          }
        }
      ]
    );
  };

  const handleRetryFetch = () => {
    clearError();
    clearStoreError();
    fetchCourses();
  };

  const renderCourse = ({ item: course }: { item: Course }) => {
    const timeInfo = getDaysUntilEnd(course.endDate);
    const progress = getMockProgress();
    const iconColor = getCourseIconColor(course.endDate);

    return (
      <TouchableOpacity 
        style={styles.courseCard}
        onPress={() => onCoursePress(course)}
      >
        <View style={styles.courseContent}>
          <View style={[styles.courseIcon, { backgroundColor: iconColor }]}>
            <Text style={styles.courseIconText}>📚</Text>
          </View>

          <View style={styles.courseInfo}>
            <Text style={styles.courseName} numberOfLines={1}>
              {course.name}
            </Text>
            <Text style={[
              styles.courseTime,
              timeInfo.isUrgent && styles.courseTimeUrgent,
              timeInfo.isPast && styles.courseTimePast,
            ]}>
              {timeInfo.text}
            </Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => handleDeleteCourse(course)}
          >
            <Text style={styles.menuIcon}>⋯</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📚</Text>
      <Text style={styles.emptyTitle}>No courses yet</Text>
      <Text style={styles.emptyDescription}>
        Create your first course to start generating AI-powered quizzes
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onCreateCourse}>
        <Text style={styles.emptyButtonText}>Create Your First Course</Text>
      </TouchableOpacity>
    </View>
  );

  // Show network error screen if network error and no courses loaded
  if (isNetworkError && courses.length === 0 && !isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <NetworkError 
          onRetry={handleRetryFetch}
          message="Unable to load your courses. Please check your internet connection."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Error Banner */}
        {hasError && error.message && !isNetworkError && (
          <ErrorBanner
            message={error.message}
            onDismiss={clearError}
            onRetry={storeError ? handleRetryFetch : undefined}
            type="error"
          />
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Courses</Text>
          <View style={styles.headerActions}>
            <Text style={styles.filterLabel}>Recently added</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterIcon}>⚏</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Course List */}
        <FlatList
          data={courses}
          renderItem={renderCourse}
          keyExtractor={(item) => item.id}
          contentContainerStyle={courses.length === 0 ? styles.emptyList : styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={!isLoading ? renderEmpty : null}
          refreshing={isLoading}
          onRefresh={fetchCourses}
        />

        {/* Floating Add Button */}
        {courses.length > 0 && (
          <TouchableOpacity style={styles.floatingButton} onPress={onCreateCourse}>
            <Text style={styles.floatingButtonText}>+</Text>
          </TouchableOpacity>
        )}

        {/* Loading Error Modal */}
        {isLoading && storeError && (
          <LoadingError
            message="Failed to load courses. Please try again."
            onRetry={() => {
              clearStoreError();
              fetchCourses();
            }}
            onDismiss={clearStoreError}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

// Styles remain the same as before
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filterLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  filterButton: {
    padding: spacing.xs,
  },
  filterIcon: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  list: {
    paddingBottom: 80,
  },
  emptyList: {
    flex: 1,
  },
  courseCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  courseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  courseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  courseIconText: {
    fontSize: 18,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  courseTime: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  courseTimeUrgent: {
    color: colors.accent,
    fontWeight: '500',
  },
  courseTimePast: {
    color: colors.textLight,
    fontStyle: 'italic',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.inputBorder,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    minWidth: 35,
  },
  menuButton: {
    padding: spacing.xs,
  },
  menuIcon: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyDescription: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  emptyButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
});