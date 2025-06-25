// Types for topic extraction
export interface ExtractedTopic {
    id: string;
    title: string;
    order: number;
    keywords?: string[];
  }
  
  export interface TopicExtractionResponse {
    success: boolean;
    topics: ExtractedTopic[];
    error?: string;
    metadata?: {
      totalTopics: number;
      processingTime: number;
      confidence: number;
    };
  }
  
  export interface OpenAIConfig {
    apiKey: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
  
  export class TopicExtractionService {
    private static config: OpenAIConfig = {
      apiKey: '', // Will be set from environment
      model: 'gpt-3.5-turbo',
      maxTokens: 2000,
      temperature: 0.3, // Lower temperature for more consistent results
    };
  
    // Initialize with API key
    static initialize(apiKey: string) {
      this.config.apiKey = apiKey;
    }
  
    // Main topic extraction method
    static async extractTopics(syllabusText: string): Promise<TopicExtractionResponse> {
      const startTime = Date.now();
  
      try {
        // Validate inputs
        if (!this.config.apiKey) {
          return {
            success: false,
            topics: [],
            error: 'OpenAI API key not configured',
          };
        }
  
        if (!syllabusText || syllabusText.trim().length < 50) {
          return {
            success: false,
            topics: [],
            error: 'Syllabus text is too short. Please provide more detailed content.',
          };
        }
  
        // Clean and prepare the text
        const cleanedText = this.cleanSyllabusText(syllabusText);
        
        // Create the prompt
        const prompt = this.createExtractionPrompt(cleanedText);
  
        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: [
              {
                role: 'system',
                content: 'You are an expert educational content analyzer. Extract course topics from syllabi with high accuracy and consistency.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature,
            response_format: { type: 'json_object' },
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
  
        const data = await response.json();
        
        // Parse and validate the response
        const topics = await this.parseOpenAIResponse(data);
        const processingTime = Date.now() - startTime;
  
        return {
          success: true,
          topics,
          metadata: {
            totalTopics: topics.length,
            processingTime,
            confidence: this.calculateConfidence(topics),
          },
        };
  
      } catch (error: any) {
        console.error('Topic extraction error:', error);
        
        return {
          success: false,
          topics: [],
          error: this.getErrorMessage(error),
        };
      }
    }
  
    // Create optimized prompt for topic extraction
    private static createExtractionPrompt(syllabusText: string): string {
      return `
  Please analyze the following course syllabus and extract the main topics/units that will be covered in the course.
  
  For each topic, provide:
  1. A clear, concise title
  2. Key concepts/keywords related to the topic
  
  Format your response as a JSON object with this exact structure:
  {
    "topics": [
      {
        "title": "Topic Title",
        "keywords": ["keyword1", "keyword2", "keyword3"]
      }
    ]
  }
  
  Guidelines:
  - Extract 5-15 main topics (avoid too granular or too broad)
  - Focus on learning objectives, not administrative details
  - Order topics logically (introductory to advanced)
  - Be consistent with naming conventions
  - Skip course policies, grading, textbooks, etc.
  - Include 2-5 relevant keywords per topic
  
  Syllabus Text:
  ${syllabusText}
  
  Respond with valid JSON only:`;
    }
  
    // Clean and prepare syllabus text
    private static cleanSyllabusText(text: string): string {
      return text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
        .trim()
        .substring(0, 8000); // Limit length to stay within token limits
    }
  
    // Parse OpenAI response and validate structure
    private static async parseOpenAIResponse(data: any): Promise<ExtractedTopic[]> {
      try {
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('No content in OpenAI response');
        }
  
        const parsed = JSON.parse(content);
        if (!parsed.topics || !Array.isArray(parsed.topics)) {
          throw new Error('Invalid response format: topics array not found');
        }
  
        // Validate and transform topics
        const topics: ExtractedTopic[] = parsed.topics.map((topic: any, index: number) => {
          if (!topic.title) {
            throw new Error(`Topic ${index + 1} missing title`);
          }
  
          return {
            id: `topic-${index + 1}`,
            title: topic.title.trim(),
            order: index + 1,
            keywords: Array.isArray(topic.keywords) ? topic.keywords.filter((k: any) => typeof k === 'string') : undefined,
          };
        });
  
        if (topics.length === 0) {
          throw new Error('No valid topics extracted');
        }
  
        return topics;
  
      } catch (error: any) {
        console.error('Response parsing error:', error);
        throw new Error(`Failed to parse AI response: ${error.message}`);
      }
    }
  
    // Calculate confidence score based on topic quality
    private static calculateConfidence(topics: ExtractedTopic[]): number {
      let score = 0;
      
      // Base score for having topics
      if (topics.length > 0) score += 40;
      
      // Score for reasonable number of topics
      if (topics.length >= 5 && topics.length <= 15) score += 30;
      
      // Score for topics with keywords
      const withKeywords = topics.filter(t => t.keywords && t.keywords.length > 0).length;
      score += (withKeywords / topics.length) * 30;
      
      return Math.min(100, Math.max(0, score));
    }
  
    // Get user-friendly error message
    private static getErrorMessage(error: any): string {
      const message = error.message || 'Unknown error';
      
      if (message.includes('API key')) {
        return 'OpenAI API key is invalid or missing. Please check your configuration.';
      }
      
      if (message.includes('quota') || message.includes('billing')) {
        return 'OpenAI API quota exceeded. Please check your billing settings.';
      }
      
      if (message.includes('rate limit')) {
        return 'Too many requests. Please wait a moment and try again.';
      }
      
      if (message.includes('network') || message.includes('fetch')) {
        return 'Network error. Please check your internet connection and try again.';
      }
      
      return `Topic extraction failed: ${message}`;
    }
  
    // Test method with sample data
    static async testWithSampleData(): Promise<TopicExtractionResponse> {
      const sampleSyllabus = `
        Computer Science 101 - Introduction to Programming
        
        Course Description:
        This course provides an introduction to computer programming using Python. Students will learn fundamental programming concepts, data structures, and problem-solving techniques.
        
        Learning Objectives:
        - Understand basic programming concepts
        - Write and debug Python programs
        - Implement data structures and algorithms
        - Apply object-oriented programming principles
        
        Course Topics:
        Week 1-2: Introduction to Programming and Python Basics
        Week 3-4: Variables, Data Types, and Operators
        Week 5-6: Control Structures (if/else, loops)
        Week 7-8: Functions and Modules
        Week 9-10: Lists, Tuples, and Dictionaries
        Week 11-12: Object-Oriented Programming
        Week 13-14: File I/O and Exception Handling
        Week 15-16: Final Projects and Review
      `;
  
      return this.extractTopics(sampleSyllabus);
    }
  }
  
  