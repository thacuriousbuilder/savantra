
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';

// File upload configuration
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export interface UploadedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

interface FileUploadComponentProps {
  onFileSelected: (file: UploadedFile) => void;
  onUploadComplete?: (file: UploadedFile) => void;
  onError?: (error: string) => void;
  uploadState?: UploadState;
  progress?: number;
  disabled?: boolean;
  title?: string;
  subtitle?: string;
}

export const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  onFileSelected,
  onUploadComplete,
  onError,
  uploadState = 'idle',
  progress = 0,
  disabled = false,
  title = "Upload Syllabus",
  subtitle = "Select a PDF or Word document",
}) => {
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);

  // Validate file type and size
  const validateFile = (file: DocumentPicker.DocumentPickerAsset): string | null => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.mimeType || '')) {
      return 'Please select a PDF or Word document (.pdf, .doc, .docx)';
    }

    // Check file size
    if (file.size && file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }

    return null; // Valid file
  };

  // Handle file selection
  const handleFilePicker = async () => {
    if (disabled || uploadState === 'uploading') {
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ALLOWED_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Validate the selected file
        const validationError = validateFile(file);
        if (validationError) {
          Alert.alert('Invalid File', validationError);
          onError?.(validationError);
          return;
        }

        // Create uploaded file object
        const uploadedFile: UploadedFile = {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
          size: file.size || 0,
        };

        setSelectedFile(uploadedFile);
        onFileSelected(uploadedFile);
      }
    } catch (error: any) {
      const errorMessage = 'Failed to select file. Please try again.';
      Alert.alert('Error', errorMessage);
      onError?.(errorMessage);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Get upload state styling and content
  const getUploadStateContent = () => {
    switch (uploadState) {
      case 'uploading':
        return {
          icon: '⏳',
          text: 'Processing...',
          subtext: `${Math.round(progress)}% complete`,
          style: styles.uploadingState,
        };
      case 'success':
        return {
          icon: '✅',
          text: 'Upload Complete',
          subtext: 'File processed successfully',
          style: styles.successState,
        };
      case 'error':
        return {
          icon: '❌',
          text: 'Upload Failed',
          subtext: 'Tap to try again',
          style: styles.errorState,
        };
      default:
        return {
          icon: selectedFile ? '📄' : '📤',
          text: selectedFile ? selectedFile.name : title,
          subtext: selectedFile 
            ? `${formatFileSize(selectedFile.size)} • ${selectedFile.type.includes('pdf') ? 'PDF' : 'Word'}`
            : subtitle,
          style: selectedFile ? styles.selectedState : styles.idleState,
        };
    }
  };

  const content = getUploadStateContent();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        content.style,
        disabled && styles.disabledState,
      ]}
      onPress={handleFilePicker}
      disabled={disabled || uploadState === 'uploading'}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{content.icon}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {content.text}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {content.subtext}
        </Text>
        
        {/* Progress bar for uploading state */}
        {uploadState === 'uploading' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${progress}%` }]} 
              />
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  
  // State-specific styles
  idleState: {
    backgroundColor: colors.white,
    borderColor: colors.inputBorder,
  },
  selectedState: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
  },
  uploadingState: {
    backgroundColor: '#FEF3C7', // Light yellow
    borderColor: '#F59E0B', // Yellow
  },
  successState: {
    backgroundColor: '#D1FAE5', // Light green
    borderColor: colors.secondary,
  },
  errorState: {
    backgroundColor: '#FEE2E2', // Light red
    borderColor: colors.accent,
  },
  disabledState: {
    opacity: 0.6,
  },
  
  // Progress bar styles
  progressContainer: {
    width: '100%',
    marginTop: spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.inputBorder,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 2,
  },
});