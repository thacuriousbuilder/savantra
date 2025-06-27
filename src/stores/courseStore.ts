import { create } from 'zustand';
import { Course, Topic } from '../types';
import { CourseService } from '../services/supabase/course';
import { TopicService } from '../services/supabase/topic';
import { ExtractedTopic } from '../services/openai/topicExtraction';

interface CourseState {
  // Course state
  courses: Course[];
  selectedCourse: Course | null;
  isLoading: boolean;
  error: string | null;
  
  // Topic state
  topics: Topic[];
  isLoadingTopics: boolean;
  topicError: string | null;
}

interface CourseActions {
  // Course CRUD operations
  fetchCourses: () => Promise<void>;
  createCourse: (courseData: Omit<Course, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'topicsExtracted'>) => Promise<{ success: boolean; course: Course | null }>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<boolean>;
  deleteCourse: (id: string) => Promise<boolean>;
  getCourseById: (id: string) => Promise<Course | null>;
  
  // Topic operations
  fetchTopicsForCourse: (courseId: string) => Promise<void>;
  saveTopicsForCourse: (courseId: string, topics: ExtractedTopic[]) => Promise<boolean>;
  createTopic: (courseId: string, topicData: Pick<Topic, 'title' | 'content' | 'orderIndex'>) => Promise<boolean>;
  updateTopic: (topicId: string, updates: Partial<Pick<Topic, 'title' | 'content' | 'orderIndex'>>) => Promise<boolean>;
  deleteTopic: (topicId: string) => Promise<boolean>;
  
  // UI state management
  setSelectedCourse: (course: Course | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setTopicError: (error: string | null) => void;
  clearTopicError: () => void;
  
  // Reset functions
  resetTopics: () => void;
  resetStore: () => void;
}

interface CourseStore extends CourseState, CourseActions {}

export const useCourseStore = create<CourseStore>((set, get) => ({
  // Initial state
  courses: [],
  selectedCourse: null,
  isLoading: false,
  error: null,
  topics: [],
  isLoadingTopics: false,
  topicError: null,

  // ========================================
  // UI STATE ACTIONS
  // ========================================
  
  setSelectedCourse: (course) => set({ selectedCourse: course }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  setTopicError: (topicError) => set({ topicError }),
  clearTopicError: () => set({ topicError: null }),
  
  resetTopics: () => set({ 
    topics: [], 
    isLoadingTopics: false, 
    topicError: null 
  }),
  
  resetStore: () => set({
    courses: [],
    selectedCourse: null,
    isLoading: false,
    error: null,
    topics: [],
    isLoadingTopics: false,
    topicError: null,
  }),

  // ========================================
  // COURSE OPERATIONS
  // ========================================

  // Fetch all courses for current user
  fetchCourses: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await CourseService.getCourses();
      
      if (response.success && response.data) {
        set({ 
          courses: response.data, 
          isLoading: false, 
          error: null 
        });
      } else {
        set({ 
          courses: [], 
          isLoading: false, 
          error: response.error?.message || 'Failed to fetch courses' 
        });
      }
    } catch (error: any) {
      console.error('Fetch courses error:', error);
      set({ 
        courses: [], 
        isLoading: false, 
        error: 'Network error - please check your connection' 
      });
    }
  },

  // Create new course
  createCourse: async (courseData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await CourseService.createCourse(courseData);
      
      if (response.success && response.data) {
        // Add new course to local state
        const updatedCourses = [response.data, ...get().courses];
        set({ 
          courses: updatedCourses, 
          isLoading: false, 
          error: null 
        });
        return { success: true, course: response.data };
      } else {
        set({ 
          isLoading: false, 
          error: response.error?.message || 'Failed to create course' 
        });
        return { success: false, course: null };
      }
    } catch (error: any) {
      console.error('Create course error:', error);
      set({ 
        isLoading: false, 
        error: 'Network error - please check your connection' 
      });
      return { success: false, course: null };
    }
  },

  // Update existing course
  updateCourse: async (id, updates) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await CourseService.updateCourse(id, updates);
      
      if (response.success && response.data) {
        // Update course in local state
        const updatedCourses = get().courses.map(course => 
          course.id === id ? response.data! : course
        );
        
        // Update selected course if it was the one being updated
        const selectedCourse = get().selectedCourse;
        const updatedSelectedCourse = selectedCourse?.id === id ? response.data! : selectedCourse;
        
        set({ 
          courses: updatedCourses,
          selectedCourse: updatedSelectedCourse,
          isLoading: false, 
          error: null 
        });
        return true;
      } else {
        set({ 
          isLoading: false, 
          error: response.error?.message || 'Failed to update course' 
        });
        return false;
      }
    } catch (error: any) {
      console.error('Update course error:', error);
      set({ 
        isLoading: false, 
        error: 'Network error - please check your connection' 
      });
      return false;
    }
  },

  // Delete course
  deleteCourse: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await CourseService.deleteCourse(id);
      
      if (response.success) {
        // Remove course from local state
        const updatedCourses = get().courses.filter(course => course.id !== id);
        
        // Clear selected course if it was the one being deleted
        const selectedCourse = get().selectedCourse;
        const updatedSelectedCourse = selectedCourse?.id === id ? null : selectedCourse;
        
        // Clear topics if they belonged to deleted course
        const topics = get().topics;
        const updatedTopics = topics.filter(topic => topic.courseId !== id);
        
        set({ 
          courses: updatedCourses,
          selectedCourse: updatedSelectedCourse,
          topics: updatedTopics,
          isLoading: false, 
          error: null 
        });
        return true;
      } else {
        set({ 
          isLoading: false, 
          error: response.error?.message || 'Failed to delete course' 
        });
        return false;
      }
    } catch (error: any) {
      console.error('Delete course error:', error);
      set({ 
        isLoading: false, 
        error: 'Network error - please check your connection' 
      });
      return false;
    }
  },

  // Get course by ID
  getCourseById: async (id) => {
    try {
      const response = await CourseService.getCourseById(id);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        set({ error: response.error?.message || 'Failed to fetch course' });
        return null;
      }
    } catch (error: any) {
      console.error('Get course by ID error:', error);
      set({ error: 'Network error - please check your connection' });
      return null;
    }
  },

  // ========================================
  // TOPIC OPERATIONS
  // ========================================

  // Fetch topics for a specific course
  fetchTopicsForCourse: async (courseId) => {
    set({ isLoadingTopics: true, topicError: null });
    
    try {
      const response = await TopicService.getTopicsForCourse(courseId);
      
      if (response.success && response.data) {
        set({ 
          topics: response.data, 
          isLoadingTopics: false, 
          topicError: null 
        });
      } else {
        set({ 
          topics: [], 
          isLoadingTopics: false, 
          topicError: response.error?.message || 'Failed to fetch topics' 
        });
      }
    } catch (error: any) {
      console.error('Fetch topics error:', error);
      set({ 
        topics: [], 
        isLoadingTopics: false, 
        topicError: 'Network error - please check your connection' 
      });
    }
  },

  // Save topics for a course (replaces existing)
  saveTopicsForCourse: async (courseId, extractedTopics) => {
    set({ isLoadingTopics: true, topicError: null });
    
    try {
      const response = await TopicService.saveTopicsForCourse(courseId, extractedTopics);
      
      if (response.success && response.data) {
        // Update local topics state
        set({ 
          topics: response.data, 
          isLoadingTopics: false, 
          topicError: null 
        });
        
        // Update course to mark as having topics extracted
        const courses = get().courses;
        const updatedCourses = courses.map(course => 
          course.id === courseId 
            ? { ...course, topicsExtracted: true, updatedAt: new Date().toISOString() }
            : course
        );
        
        // Update selected course too
        const selectedCourse = get().selectedCourse;
        const updatedSelectedCourse = selectedCourse?.id === courseId 
          ? { ...selectedCourse, topicsExtracted: true, updatedAt: new Date().toISOString() }
          : selectedCourse;
        
        set({ 
          courses: updatedCourses,
          selectedCourse: updatedSelectedCourse
        });
        
        return true;
      } else {
        set({ 
          isLoadingTopics: false, 
          topicError: response.error?.message || 'Failed to save topics' 
        });
        return false;
      }
    } catch (error: any) {
      console.error('Save topics error:', error);
      set({ 
        isLoadingTopics: false, 
        topicError: 'Network error - please check your connection' 
      });
      return false;
    }
  },

  // Create a new topic
  createTopic: async (courseId, topicData) => {
    set({ isLoadingTopics: true, topicError: null });
    
    try {
      const response = await TopicService.createTopic(courseId, topicData);
      
      if (response.success && response.data) {
        // Add new topic to local state
        const updatedTopics = [...get().topics, response.data];
        set({ 
          topics: updatedTopics, 
          isLoadingTopics: false, 
          topicError: null 
        });
        return true;
      } else {
        set({ 
          isLoadingTopics: false, 
          topicError: response.error?.message || 'Failed to create topic' 
        });
        return false;
      }
    } catch (error: any) {
      console.error('Create topic error:', error);
      set({ 
        isLoadingTopics: false, 
        topicError: 'Network error - please check your connection' 
      });
      return false;
    }
  },

  // Update a topic
  updateTopic: async (topicId, updates) => {
    set({ isLoadingTopics: true, topicError: null });
    
    try {
      const response = await TopicService.updateTopic(topicId, updates);
      
      if (response.success && response.data) {
        // Update topic in local state
        const updatedTopics = get().topics.map(topic => 
          topic.id === topicId ? response.data! : topic
        );
        set({ 
          topics: updatedTopics, 
          isLoadingTopics: false, 
          topicError: null 
        });
        return true;
      } else {
        set({ 
          isLoadingTopics: false, 
          topicError: response.error?.message || 'Failed to update topic' 
        });
        return false;
      }
    } catch (error: any) {
      console.error('Update topic error:', error);
      set({ 
        isLoadingTopics: false, 
        topicError: 'Network error - please check your connection' 
      });
      return false;
    }
  },

  // Delete a topic
  deleteTopic: async (topicId) => {
    set({ isLoadingTopics: true, topicError: null });
    
    try {
      const response = await TopicService.deleteTopic(topicId);
      
      if (response.success) {
        // Remove topic from local state
        const updatedTopics = get().topics.filter(topic => topic.id !== topicId);
        set({ 
          topics: updatedTopics, 
          isLoadingTopics: false, 
          topicError: null 
        });
        return true;
      } else {
        set({ 
          isLoadingTopics: false, 
          topicError: response.error?.message || 'Failed to delete topic' 
        });
        return false;
      }
    } catch (error: any) {
      console.error('Delete topic error:', error);
      set({ 
        isLoadingTopics: false, 
        topicError: 'Network error - please check your connection' 
      });
      return false;
    }
  },
}));