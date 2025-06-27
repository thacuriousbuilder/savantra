
import { supabase } from './config';
import { Topic } from '../../types';
import { ExtractedTopic } from '../../services/openai/topicExtraction';

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

export class TopicService {
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

  // Verify course belongs to current user
  private static async verifyCourseOwnership(courseId: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.log('🔍 verifyCourseOwnership: No user ID');
        return false;
      }

      console.log('🔍 verifyCourseOwnership: Checking course:', courseId, 'for user:', userId);

      const { data: course, error } = await supabase
        .from('courses')
        .select('id, "userId"') // Fixed: properly quote the column name
        .eq('id', courseId)
        .eq('"userId"', userId) // Fixed: properly quote the column name in the query
        .single();

      if (error) {
        console.error('🔍 verifyCourseOwnership: Query error:', error);
        return false;
      }

      console.log('🔍 verifyCourseOwnership: Query result:', course);
      return !!course;
    } catch (error) {
      console.error('🔍 verifyCourseOwnership: Exception:', error);
      return false;
    }
  }

  // Save topics for a course (replaces existing topics)
  static async saveTopicsForCourse(
    courseId: string, 
    extractedTopics: ExtractedTopic[]
  ): Promise<ServiceResponse<Topic[]>> {
    try {
      console.log('🔍 TopicService: Starting save for course:', courseId);
      console.log('🔍 TopicService: Number of topics:', extractedTopics.length);

      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.log('🔍 TopicService: User not authenticated');
        return {
          data: null,
          error: { message: 'User not authenticated' },
          success: false,
        };
      }

      console.log('🔍 TopicService: User authenticated:', userId);

      // Verify course ownership
      const hasAccess = await this.verifyCourseOwnership(courseId);
      if (!hasAccess) {
        console.log('🔍 TopicService: Course access denied');
        return {
          data: null,
          error: { message: 'Course not found or access denied' },
          success: false,
        };
      }

      console.log('🔍 TopicService: Course access verified');

      // Delete existing topics for this course
      console.log('🔍 TopicService: Deleting existing topics...');
      const { error: deleteError } = await supabase
        .from('topics')
        .delete()
        .eq('"courseId"', courseId); // Fixed: properly quote the column name

      if (deleteError) {
        console.error('🔍 TopicService: Delete error:', deleteError);
        return {
          data: null,
          error: { 
            message: 'Failed to clear existing topics', 
            code: deleteError.code,
            details: deleteError 
          },
          success: false,
        };
      }

      console.log('🔍 TopicService: Existing topics deleted');

      // Convert ExtractedTopics to Topic format for database
      const topicsToInsert = extractedTopics.map((topic, index) => ({
        "courseId": courseId, // Fixed: properly quote the column name
        title: topic.title,
        content: topic.keywords ? topic.keywords.join(', ') : '',
        "orderIndex": topic.order || index + 1, // Fixed: properly quote the column name
        "createdAt": new Date().toISOString(), // Fixed: properly quote the column name
      }));

      console.log('🔍 TopicService: Topics to insert:', topicsToInsert);

      // If no topics to insert, just update the course
      if (topicsToInsert.length === 0) {
        console.log('🔍 TopicService: No topics to insert, updating course...');
        // Update course to mark topics as extracted (even if empty)
        await supabase
          .from('courses')
          .update({ 
            "topicsExtracted": true, // Fixed: properly quote the column name
            "updatedAt": new Date().toISOString() // Fixed: properly quote the column name
          })
          .eq('id', courseId);

        return {
          data: [],
          error: null,
          success: true,
        };
      }

      // Insert new topics
      console.log('🔍 TopicService: Inserting new topics...');
      const { data, error } = await supabase
        .from('topics')
        .insert(topicsToInsert)
        .select();

      if (error) {
        console.error('🔍 TopicService: Insert error:', error);
        return {
          data: null,
          error: { 
            message: 'Failed to save topics', 
            code: error.code,
            details: error 
          },
          success: false,
        };
      }

      console.log('🔍 TopicService: Topics inserted successfully:', data);

      // Update course to mark topics as extracted
      console.log('🔍 TopicService: Updating course topicsExtracted flag...');
      const { error: updateError } = await supabase
        .from('courses')
        .update({ 
          "topicsExtracted": true, // Fixed: properly quote the column name
          "updatedAt": new Date().toISOString() // Fixed: properly quote the column name
        })
        .eq('id', courseId);

      if (updateError) {
        console.error('🔍 TopicService: Course update error:', updateError);
        // Don't fail the whole operation for this
      }

      console.log('🔍 TopicService: Save completed successfully');

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error: any) {
      console.error('🔍 TopicService: Unexpected error:', error);
      return {
        data: null,
        error: { 
          message: 'Network error while saving topics',
          details: error 
        },
        success: false,
      };
    }
  }

  // Get topics for a course
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

      // Verify course ownership
      const hasAccess = await this.verifyCourseOwnership(courseId);
      if (!hasAccess) {
        return {
          data: null,
          error: { message: 'Course not found or access denied' },
          success: false,
        };
      }

      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('"courseId"', courseId) // Fixed: properly quote the column name
        .order('"orderIndex"', { ascending: true }); // Fixed: properly quote the column name

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

  // Create a new topic
  static async createTopic(
    courseId: string,
    topicData: Pick<Topic, 'title' | 'content' | 'orderIndex'>
  ): Promise<ServiceResponse<Topic>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: { message: 'User not authenticated' },
          success: false,
        };
      }

      // Verify course ownership
      const hasAccess = await this.verifyCourseOwnership(courseId);
      if (!hasAccess) {
        return {
          data: null,
          error: { message: 'Course not found or access denied' },
          success: false,
        };
      }

      const { data, error } = await supabase
        .from('topics')
        .insert({
          ...topicData,
          courseId, // Fixed: match database column name
          createdAt: new Date().toISOString(), // Fixed: match database column name
        })
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: { 
            message: 'Failed to create topic', 
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
          message: 'Network error while creating topic',
          details: error 
        },
        success: false,
      };
    }
  }

  // Update a single topic
  static async updateTopic(
    topicId: string,
    updates: Partial<Pick<Topic, 'title' | 'content' | 'orderIndex'>>
  ): Promise<ServiceResponse<Topic>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: { message: 'User not authenticated' },
          success: false,
        };
      }

      // Verify topic belongs to user's course
      const { data: topic } = await supabase
        .from('topics')
        .select('courseId, courses!inner(userId)') // Fixed: match database column name
        .eq('id', topicId)
        .single();

      if (!topic || (topic as any).courses.userId !== userId) {
        return {
          data: null,
          error: { message: 'Topic not found or access denied' },
          success: false,
        };
      }

      const { data, error } = await supabase
        .from('topics')
        .update(updates)
        .eq('id', topicId)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: { 
            message: 'Failed to update topic', 
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
          message: 'Network error while updating topic',
          details: error 
        },
        success: false,
      };
    }
  }

  // Delete a topic
  static async deleteTopic(topicId: string): Promise<ServiceResponse<boolean>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          data: null,
          error: { message: 'User not authenticated' },
          success: false,
        };
      }

      // Verify topic belongs to user's course
      const { data: topic } = await supabase
        .from('topics')
        .select('courseId, courses!inner(userId)') // Fixed: match database column name
        .eq('id', topicId)
        .single();

      if (!topic || (topic as any).courses.userId !== userId) {
        return {
          data: null,
          error: { message: 'Topic not found or access denied' },
          success: false,
        };
      }

      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', topicId);

      if (error) {
        return {
          data: null,
          error: { 
            message: 'Failed to delete topic', 
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
          message: 'Network error while deleting topic',
          details: error 
        },
        success: false,
      };
    }
  }

  // Convert Topic to ExtractedTopic format (for UI)
  static topicToExtractedTopic(topic: Topic): ExtractedTopic {
    return {
      id: topic.id,
      title: topic.title,
      order: topic.orderIndex,
      keywords: topic.content ? topic.content.split(', ').filter(k => k.trim()) : [],
    };
  }

  // Convert ExtractedTopic to Topic format (for database)
  static extractedTopicToTopic(
    extractedTopic: ExtractedTopic, 
    courseId: string
  ): Omit<Topic, 'id' | 'createdAt'> {
    return {
      courseId,
      title: extractedTopic.title,
      content: extractedTopic.keywords ? extractedTopic.keywords.join(', ') : '',
      orderIndex: extractedTopic.order,
    };
  }
}