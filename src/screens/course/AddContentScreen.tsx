// File: src/screens/course/AddContentScreen.tsx

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

type ProcessingStep = 'idle' | 'reading' | 'extracting' | 'reviewing' | 'saving';

export const AddContentScreen: React.FC<AddContentScreenProps> = ({
  course,
  onSkip,
  onComplete,
}) => {
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [extractedTopics, setExtractedTopics] = useState<ExtractedTopic[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Handle file selection
  const handleFileSelected = (file: UploadedFile) => {
    setSelectedFile(file);
    setUploadState('idle');
    setProcessingStep('idle');
    setExtractedTopics([]);
    setIsEditing(false);
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

      // Success!
      setProgress(100);
      setProcessingStep('reviewing');
      setUploadState('success');
      setExtractedTopics(topicsResult.topics);
      
      Alert.alert(
        'Success!', 
        `Extracted ${topicsResult.topics.length} topics from your syllabus. Review them below.`
      );

    } catch (error: any) {
      setProcessingStep('idle');
      setUploadState('error');
      setProgress(0);
      Alert.alert('Processing Failed', error.message || 'Failed to process syllabus');
    }
  };

  // Add a new topic manually
  const addTopic = () => {
    const newTopic: ExtractedTopic = {
      id: `topic-${extractedTopics.length + 1}`,
      title: 'New Topic',
      order: extractedTopics.length + 1,
      keywords: [],
    };
    setExtractedTopics([...extractedTopics, newTopic]);
    setIsEditing(true);
  };

  // Remove a topic
  const removeTopic = (topicId: string) => {
    const updatedTopics = extractedTopics
      .filter(topic => topic.id !== topicId)
      .map((topic, index) => ({ ...topic, order: index + 1 }));
    setExtractedTopics(updatedTopics);
  };

  // Save topics and continue
  const saveAndContinue = async () => {
    if (extractedTopics.length === 0) {
      Alert.alert('No Topics', 'Please extract topics from syllabus or add them manually');
      return;
    }

    setProcessingStep('saving');
    
    try {
      // TODO: Save topics to database here
      // await CourseService.saveTopics(course.id, extractedTopics);
      
      Alert.alert('Success!', 'Course content added successfully', [
        { text: 'Continue', onPress: () => onComplete(extractedTopics) }
      ]);
    } catch (error: any) {
      setProcessingStep('reviewing');
      Alert.alert('Save Failed', 'Failed to save course topics. Please try again.');
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

  const isProcessing = processingStep === 'reading' || processingStep === 'extracting' || processingStep === 'saving';
  const hasTopics = extractedTopics.length > 0;

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
              <Text style={styles.courseName}>{course.name}</Text>
            </View>
          </View>

          {/* File Upload Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Upload Syllabus</Text>
            <FileUploadComponent
              onFileSelected={handleFileSelected}
              uploadState={uploadState}
              progress={progress}
              title="Upload Course Syllabus"
              subtitle="Select PDF or Word document"
              disabled={isProcessing}
            />
            
            {selectedFile && !hasTopics && (
              <TouchableOpacity
                style={[styles.processButton, isProcessing && styles.buttonDisabled]}
                onPress={processSyllabus}
                disabled={isProcessing}
              >
                <Text style={styles.processButtonText}>
                  {processingStep === 'reading' && 'Reading file...'}
                  {processingStep === 'extracting' && 'Extracting topics...'}
                  {processingStep !== 'reading' && processingStep !== 'extracting' && 'Extract Topics'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Topics Review Section */}
          {hasTopics && (
            <View style={styles.section}>
              <View style={styles.topicsHeader}>
                <Text style={styles.sectionTitle}>2. Review Topics</Text>
                <TouchableOpacity style={styles.addTopicButton} onPress={addTopic}>
                  <Text style={styles.addTopicText}>+ Add Topic</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.topicsDescription}>
                {extractedTopics.length} topics extracted. You can edit, add, or remove topics below.
              </Text>

              {extractedTopics.map((topic, index) => (
                <View key={topic.id} style={styles.topicCard}>
                  <View style={styles.topicHeader}>
                    <Text style={styles.topicNumber}>{index + 1}.</Text>
                    <Text style={styles.topicTitle}>{topic.title}</Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeTopic(topic.id)}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {topic.keywords && topic.keywords.length > 0 && (
                    <View style={styles.keywordsContainer}>
                      {topic.keywords.map((keyword: string, keyIndex: number) => (
                        <View key={keyIndex} style={styles.keywordTag}>
                          <Text style={styles.keywordText}>{keyword}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            {hasTopics ? (
              <TouchableOpacity
                style={[styles.continueButton, isProcessing && styles.buttonDisabled]}
                onPress={saveAndContinue}
                disabled={isProcessing}
              >
                <Text style={styles.continueButtonText}>
                  {processingStep === 'saving' ? 'Saving...' : 'Save & Continue'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.manualButton} onPress={addTopic}>
                <Text style={styles.manualButtonText}>Add Topics Manually</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip for Now</Text>
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>💡 Tips</Text>
            <Text style={styles.helpText}>• Upload your course syllabus for best results</Text>
            <Text style={styles.helpText}>• AI will extract main topics and learning objectives</Text>
            <Text style={styles.helpText}>• You can edit, add, or remove topics before saving</Text>
            <Text style={styles.helpText}>• Topics help generate personalized quizzes later</Text>
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
  topicsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addTopicButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  addTopicText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  topicsDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
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
  topicTitle: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.textPrimary,
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
  continueButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  manualButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  manualButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  skipButtonText: {
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