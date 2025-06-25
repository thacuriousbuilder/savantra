import { create } from 'zustand';
import { Course, Topic } from '../types';
import { CourseService } from '../services/supabase/course';

interface CourseState {
  courses: Course[];
  topics: Topic[];
  isLoading: boolean;
  selectedCourse: Course | null;
  error: string | null;
}

interface CourseActions {
  // Course CRUD operations
  fetchCourses: () => Promise<void>;
  createCourse: (courseData: Omit<Course, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'topicsExtracted'>) => Promise<boolean>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<boolean>;
  deleteCourse: (id: string) => Promise<boolean>;
  
  // Topic operations
  fetchTopicsForCourse: (courseId: string) => Promise<void>;
  
  // UI state management
  setSelectedCourse: (course: Course | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

interface CourseStore extends CourseState, CourseActions {}

export const useCourseStore = create<CourseStore>((set, get) => ({
  // Initial state
  courses: [],
  topics: [],
  isLoading: false,
  selectedCourse: null,
  error: null,

  // UI state actions
  setSelectedCourse: (course) => set({ selectedCourse: course }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

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
        return true;
      } else {
        set({ 
          isLoading: false, 
          error: response.error?.message || 'Failed to create course' 
        });
        return false;
      }
    } catch (error: any) {
      console.error('Create course error:', error);
      set({ 
        isLoading: false, 
        error: 'Network error - please check your connection' 
      });
      return false;
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

  // Fetch topics for a specific course
  fetchTopicsForCourse: async (courseId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await CourseService.getTopicsForCourse(courseId);
      
      if (response.success && response.data) {
        set({ 
          topics: response.data, 
          isLoading: false, 
          error: null 
        });
      } else {
        set({ 
          topics: [], 
          isLoading: false, 
          error: response.error?.message || 'Failed to fetch topics' 
        });
      }
    } catch (error: any) {
      console.error('Fetch topics error:', error);
      set({ 
        topics: [], 
        isLoading: false, 
        error: 'Network error - please check your connection' 
      });
    }
  },
}));