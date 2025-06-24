// src/services/supabase/courses.ts
import { supabase } from './config';
import { Course, Topic } from '../../types';

export class CourseService {
  // Fetch all courses for current user
  static async getCourses(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Create new course
  static async createCourse(courseData: Omit<Course, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'topicsExtracted'>): Promise<Course> {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('courses')
      .insert({
        ...courseData,
        userId: userData.user.id,
        topicsExtracted: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update course
  static async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete course
  static async deleteCourse(id: string): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Get topics for a course
  static async getTopicsForCourse(courseId: string): Promise<Topic[]> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('courseId', courseId)
      .order('orderIndex', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}