// src/stores/courseStore.ts - UPDATED WITH PROPER TYPES
import { create } from 'zustand';
import { Course, Topic } from '../types';

interface CourseState {
  courses: Course[];
  topics: Topic[];              // NEW: Topics state
  isLoading: boolean;
  selectedCourse: Course | null;
}

interface CourseActions {
  // Course CRUD operations
  fetchCourses: () => Promise<void>;
  createCourse: (courseData: Omit<Course, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'topicsExtracted'>) => Promise<boolean>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<boolean>;
  deleteCourse: (id: string) => Promise<boolean>;
  
  // Topic operations
  fetchTopicsForCourse: (courseId: string) => Promise<void>;
  createTopics: (courseId: string, topics: Omit<Topic, 'id' | 'courseId' | 'createdAt'>[]) => Promise<boolean>;
  
  // UI state
  setSelectedCourse: (course: Course | null) => void;
  setLoading: (loading: boolean) => void;
}

interface CourseStore extends CourseState, CourseActions {}

export const useCourseStore = create<CourseStore>((set, get) => ({
  // Initial state
  courses: [],
  topics: [],                  // NEW: Topics array
  isLoading: false,
  selectedCourse: null,

  // Actions
  setSelectedCourse: (course) => set({ selectedCourse: course }),
  setLoading: (isLoading) => set({ isLoading }),

  fetchCourses: async () => {
    set({ isLoading: true });
    try {
      // TODO: Implement Supabase course fetching
      console.log('Fetching courses...');
      
      // Placeholder data with new structure
      const mockCourses: Course[] = [
        {
          id: '1',
          userId: 'user1',
          name: 'Computer Science 101',
          endDate: '2024-12-15',
          description: 'Introduction to Computer Science',
          syllabusUrl: undefined,
          topicsExtracted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      set({ courses: mockCourses, isLoading: false });
    } catch (error) {
      console.error('Fetch courses error:', error);
      set({ isLoading: false });
    }
  },

  createCourse: async (courseData) => {
    set({ isLoading: true });
    try {
      console.log('Creating course:', courseData);
      
      // Create new course with generated fields
      const newCourse: Course = {
        id: Date.now().toString(), // Temporary ID generation
        userId: 'current-user-id', // TODO: Get from auth store
        ...courseData,
        topicsExtracted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add to local state
      const courses = [...get().courses, newCourse];
      set({ courses, isLoading: false });
      return true;
    } catch (error) {
      console.error('Create course error:', error);
      set({ isLoading: false });
      return false;
    }
  },

  updateCourse: async (id, updates) => {
    set({ isLoading: true });
    try {
      console.log('Updating course:', id, updates);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      const courses = get().courses.map(course => 
        course.id === id 
          ? { ...course, ...updates, updatedAt: new Date().toISOString() }
          : course
      );
      set({ courses, isLoading: false });
      return true;
    } catch (error) {
      console.error('Update course error:', error);
      set({ isLoading: false });
      return false;
    }
  },

  deleteCourse: async (id) => {
    set({ isLoading: true });
    try {
      console.log('Deleting course:', id);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove from local state
      const courses = get().courses.filter(course => course.id !== id);
      set({ courses, isLoading: false });
      return true;
    } catch (error) {
      console.error('Delete course error:', error);
      set({ isLoading: false });
      return false;
    }
  },

  fetchTopicsForCourse: async (courseId) => {
    set({ isLoading: true });
    try {
      console.log('Fetching topics for course:', courseId);
      
      // TODO: Implement Supabase topic fetching
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({ isLoading: false });
    } catch (error) {
      console.error('Fetch topics error:', error);
      set({ isLoading: false });
    }
  },

  createTopics: async (courseId, topicsData) => {
    set({ isLoading: true });
    try {
      console.log('Creating topics for course:', courseId, topicsData);
      
      // TODO: Implement Supabase topic creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('Create topics error:', error);
      set({ isLoading: false });
      return false;
    }
  },
}));