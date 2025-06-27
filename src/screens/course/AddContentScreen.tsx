import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { Course } from '../../types';
import { ExtractedTopic } from '../../services/openai/topicExtraction';
import { FileUploadComponent, UploadedFile, UploadState } from '../../components/common/FileUploadComponent';
import { FileReaderService } from '../../services/files/fileReader';
import { TopicExtractionService } from '../../services/openai/topicExtraction';

interface AddContentScreenProps {
  course: Course;
  onSkip: () => void;
  onComplete: (topics: ExtractedTopic[]) => void;
}

type ProcessingStep = 'idle' | 'reading' | 'extracting' | 'complete';

export const AddContentScreen: React.FC<AddContentScreenProps> = ({
  course,
  onSkip,
  onComplete,
}) => {
  // Debug logging to see what course object is being passed
  console.log('AddContentScreen received course:', course);
  console.log('Course name:', course?.name);
  console.log('Course object keys:', Object.keys(course || {}));

  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);

  // Handle file selection
  const handleFileSelected = (file: UploadedFile) => {
    setSelectedFile(file);
    setUploadState('idle');
    setProcessingStep('idle');
  };

  // Process uploaded syllabus
  const processSyllabus = async () => {
    if (!selectedFile) {
      Alert.alert('No File', 'Please select a syllabus file first');
      return;
    }

    setUploadState('uploading');
    setProcessingStep('reading');
    setProgress(0);

    try {
      // Step 1: Read file content
      setProgress(25);
      const fileInfo = {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
      };

      const fileResult = await FileReaderService.readFileText(fileInfo);
      
      if (!fileResult.success || !fileResult.text) {
        throw new Error(fileResult.error || 'Failed to read file content');
      }

      // Step 2: Extract topics with AI
      setProcessingStep('extracting');
      setProgress(60);

      const topicsResult = await TopicExtractionService.extractTopics(fileResult.text);
      
      if (!topicsResult.success || !topicsResult.topics) {
        throw new Error(topicsResult.error || 'Failed to extract topics');
      }

      // Success! Navigate immediately to ReviewTopics
      setProgress(100);
      setProcessingStep('complete');
      setUploadState('success');
      
      // Show success message and auto-navigate
      Alert.alert(
        'Success!', 
        `Extracted ${topicsResult.topics.length} topics from your syllabus.`,
        [
          { 
            text: 'Review Topics', 
            onPress: () => onComplete(topicsResult.topics)
          }
        ]
      );

    } catch (error: any) {
      setProcessingStep('idle');
      setUploadState('error');
      setProgress(0);
      Alert.alert('Processing Failed', error.message || 'Failed to process syllabus');
    }
  };

  // Skip content addition
  const handleSkip = () => {
    Alert.alert(
      'Skip Content Addition?',
      'You can always add syllabus content later from the course details.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: onSkip }
      ]
    );
  };

  // Add topics manually (navigate to ReviewTopics with empty array)
  const handleAddManually = () => {
    onComplete([]); // Navigate to ReviewTopics with no initial topics
  };

  const isProcessing = processingStep === 'reading' || processingStep === 'extracting';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Course Content</Text>
            <Text style={styles.subtitle}>
              Upload your syllabus to automatically extract course topics
            </Text>
            <View style={styles.courseInfo}>
              <Text style={styles.courseLabel}>Adding content to:</Text>
              <Text style={styles.courseName}>
                {course?.name || 'New Course'}
              </Text>
            </View>
          </View>

          {/* File Upload Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upload Syllabus</Text>
            <Text style={styles.sectionDescription}>
              Select a PDF or Word document containing your course syllabus. 
              Our AI will extract the main topics and learning objectives.
            </Text>
            
            <FileUploadComponent
              onFileSelected={handleFileSelected}
              uploadState={uploadState}
              progress={progress}
              title="Upload Course Syllabus"
              subtitle="Select PDF or Word document"
              disabled={isProcessing}
            />
            
            {selectedFile && processingStep === 'idle' && (
              <TouchableOpacity
                style={styles.processButton}
                onPress={processSyllabus}
              >
                <Text style={styles.processButtonText}>Extract Topics</Text>
              </TouchableOpacity>
            )}

            {isProcessing && (
              <View style={styles.processingInfo}>
                <Text style={styles.processingText}>
                  {processingStep === 'reading' && '📖 Reading file content...'}
                  {processingStep === 'extracting' && '🧠 Extracting topics with AI...'}
                </Text>
                <Text style={styles.processingSubtext}>
                  This may take a few moments
                </Text>
              </View>
            )}
          </View>

          {/* Alternative Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alternative Options</Text>
            
            <TouchableOpacity 
              style={styles.manualButton} 
              onPress={handleAddManually}
              disabled={isProcessing}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionIcon}>✏️</Text>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Add Topics Manually</Text>
                  <Text style={styles.optionDescription}>
                    Create course topics yourself without uploading a file
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.skipButton} 
              onPress={handleSkip}
              disabled={isProcessing}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionIcon}>⏭️</Text>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Skip for Now</Text>
                  <Text style={styles.optionDescription}>
                    Add course content later from course settings
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>💡 Tips for Best Results</Text>
            <Text style={styles.helpText}>• Upload your official course syllabus for best topic extraction</Text>
            <Text style={styles.helpText}>• PDF and Word documents work best</Text>
            <Text style={styles.helpText}>• Clear, text-based documents give better results than scanned images</Text>
            <Text style={styles.helpText}>• You can always edit the extracted topics in the next step</Text>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
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
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  courseInfo: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  courseLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  courseName: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  processButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  processButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  processingInfo: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  processingText: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  processingSubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  manualButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  skipButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  optionIcon: {
    fontSize: 24,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  optionDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
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