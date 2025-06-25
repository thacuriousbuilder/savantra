
import { supabase } from './config';
import { Course, Topic } from '../../types';

export interface ServiceError {
  message: string;
  code?: string;
  details?: any;
}

export interface ServiceResponse<T> {
  data: T | null;
  error: ServiceError | null;
  success: boolean;
}

export class CourseService {
  // Get current authenticated user ID
  private static async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Fetch all courses for current user
  static async getCourses(): Promise<ServiceResponse<Course[]>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: { message: 'User not authenticated' },
          success: false,
        };
      }

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

      if (error) {
        return {
          data: null,
          error: { 
            message: 'Failed to fetch courses', 
            code: error.code,
            details: error 
          },
          success: false,
        };
      }

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error: any) {
      return {
        data: null,
        error: { 
          message: 'Network error while fetching courses',
          details: error 
        },
        success: false,
      };
    }
  }

  // Create new course
  static async createCourse(
    courseData: Omit<Course, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'topicsExtracted'>
  ): Promise<ServiceResponse<Course>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: { message: 'User not authenticated' },
          success: false,
        };
      }

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('courses')
        .insert({
          ...courseData,
          userId,
          topicsExtracted: false,
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: { 
            message: 'Failed to create course', 
            code: error.code,
            details: error 
          },
          success: false,
        };
      }

      return {
        data: data,
        error: null,
        success: true,
      };
    } catch (error: any) {
      return {
        data: null,
        error: { 
          message: 'Network error while creating course',
          details: error 
        },
        success: false,
      };
    }
  }

  // Update course
  static async updateCourse(
    id: string, 
    updates: Partial<Omit<Course, 'id' | 'userId' | 'createdAt'>>
  ): Promise<ServiceResponse<Course>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: { message: 'User not authenticated' },
          success: false,
        };
      }

      // Add updatedAt timestamp
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', id)
        .eq('userId', userId) // Ensure user can only update their own courses
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: { 
            message: 'Failed to update course', 
            code: error.code,
            details: error 
          },
          success: false,
        };
      }

      if (!data) {
        return {
          data: null,
          error: { message: 'Course not found or access denied' },
          success: false,
        };
      }

      return {
        data: data,
        error: null,
        success: true,
      };
    } catch (error: any) {
      return {
        data: null,
        error: { 
          message: 'Network error while updating course',
          details: error 
        },
        success: false,
      };
    }
  }

  // Delete course
  static async deleteCourse(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: { message: 'User not authenticated' },
          success: false,
        };
      }

      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id)
        .eq('userId', userId); // Ensure user can only delete their own courses

      if (error) {
        return {
          data: null,
          error: { 
            message: 'Failed to delete course', 
            code: error.code,
            details: error 
          },
          success: false,
        };
      }

      return {
        data: true,
        error: null,
        success: true,
      };
    } catch (error: any) {
      return {
        data: null,
        error: { 
          message: 'Network error while deleting course',
          details: error 
        },
        success: false,
      };
    }
  }

  // Get topics for a course (ready for future use)
  static async getTopicsForCourse(courseId: string): Promise<ServiceResponse<Topic[]>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: { message: 'User not authenticated' },
          success: false,
        };
      }

      // First verify the course belongs to the user
      const { data: course } = await supabase
        .from('courses')
        .select('id')
        .eq('id', courseId)
        .eq('userId', userId)
        .single();

      if (!course) {
        return {
          data: null,
          error: { message: 'Course not found or access denied' },
          success: false,
        };
      }

      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('courseId', courseId)
        .order('orderIndex', { ascending: true });

      if (error) {
        return {
          data: null,
          error: { 
            message: 'Failed to fetch topics', 
            code: error.code,
            details: error 
          },
          success: false,
        };
      }

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error: any) {
      return {
        data: null,
        error: { 
          message: 'Network error while fetching topics',
          details: error 
        },
        success: false,
      };
    }
  }
}