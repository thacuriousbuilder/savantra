
import { supabase } from './config';
import { Course } from '../../types';

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
        .eq('userId', userId) // Fixed: match database column name // Fixed: match database column name
        .order('createdAt', { ascending: false }); // Fixed: match database column name

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
          userId, // Fixed: match database column name
          topicsExtracted: false, // Fixed: match database column name
          createdAt: now, // Fixed: match database column name
          updatedAt: now, // Fixed: match database column name
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
        updatedAt: new Date().toISOString(), // Fixed: match database column name
      };

      const { data, error } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', id)
        .eq('userId', userId) // Fixed: match database column name
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

  // Delete course (and all associated topics)
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

      // Note: Topics will be deleted automatically via CASCADE constraint
      // when the course is deleted (if properly set up in database)
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id)
        .eq('userId', userId); // Fixed: match database column name

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

  // Get course by ID (with ownership verification)
  static async getCourseById(id: string): Promise<ServiceResponse<Course>> {
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
        .eq('id', id)
        .eq('userId', userId)
        .single();

      if (error) {
        return {
          data: null,
          error: { 
            message: 'Course not found or access denied', 
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
          message: 'Network error while fetching course',
          details: error 
        },
        success: false,
      };
    }
  }

  // Mark course as having topics extracted
  static async markTopicsExtracted(id: string): Promise<ServiceResponse<Course>> {
    return this.updateCourse(id, { topicsExtracted: true }); // Fixed: match database column name
  }
}