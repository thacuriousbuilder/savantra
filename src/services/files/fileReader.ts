// File: src/services/files/fileReader.ts

export interface FileReadResult {
    success: boolean;
    text?: string;
    error?: string;
    metadata?: {
      fileName: string;
      fileSize: number;
      fileType: string;
      processingTime: number;
      textLength: number;
    };
  }
  
  export interface FileInfo {
    uri: string;
    name: string;
    type: string;
    size: number;
  }
  
  export class FileReaderService {
    // Main method to read text from any supported file
    static async readFileText(file: FileInfo): Promise<FileReadResult> {
      const startTime = Date.now();
      
      try {
        // Validate file
        const validation = this.validateFile(file);
        if (!validation.isValid) {
          return {
            success: false,
            error: validation.error,
          };
        }
  
        let extractedText: string;
  
        // Determine file type and extract text accordingly
        if (file.type.includes('pdf')) {
          extractedText = await this.extractFromPDF(file);
        } else if (file.type.includes('word') || file.type.includes('document') || file.name.endsWith('.docx')) {
          extractedText = await this.extractFromWord(file);
        } else {
          return {
            success: false,
            error: `Unsupported file type: ${file.type}`,
          };
        }
  
        // Clean and validate extracted text
        const cleanedText = this.cleanExtractedText(extractedText);
        
        if (!cleanedText || cleanedText.length < 50) {
          return {
            success: false,
            error: 'Could not extract meaningful text from the file. The file may be image-based or corrupted.',
          };
        }
  
        const processingTime = Date.now() - startTime;
  
        return {
          success: true,
          text: cleanedText,
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            processingTime,
            textLength: cleanedText.length,
          },
        };
  
      } catch (error: any) {
        console.error('File reading error:', error);
        return {
          success: false,
          error: this.getErrorMessage(error),
        };
      }
    }
  
    // Validate file before processing
    private static validateFile(file: FileInfo): { isValid: boolean; error?: string } {
      // Check file size (50MB limit)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          isValid: false,
          error: 'File size exceeds 50MB limit. Please use a smaller file.',
        };
      }
  
      // Check file type
      const supportedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
  
      const isSupported = supportedTypes.some(type => file.type.includes(type)) || 
                         file.name.endsWith('.pdf') || 
                         file.name.endsWith('.doc') || 
                         file.name.endsWith('.docx');
  
      if (!isSupported) {
        return {
          isValid: false,
          error: 'Unsupported file type. Please select a PDF or Word document.',
        };
      }
  
      return { isValid: true };
    }
  
    // Extract text from PDF files
    private static async extractFromPDF(file: FileInfo): Promise<string> {
      try {
        console.log('PDF extraction - using mock implementation for now');
        
        // Don't try to fetch mobile file URIs - they're not network URLs
        // Mobile file URIs look like: file:///var/mobile/...
        // We can't fetch them directly without proper file reading libraries
        
        console.log(`Processing PDF file: ${file.name}`);
        console.log(`File URI: ${file.uri}`);
        console.log(`File size: ${file.size} bytes`);
        
        // For mock implementation, return content based on filename patterns
        // In real implementation, we'd use a library like:
        // - expo-document-picker with FileSystem.readAsStringAsync()
        // - react-native-pdf-lib for actual PDF parsing
        // - Server-side processing for complex PDFs
        
        return this.getMockPDFContent(file.name);
        
      } catch (error: any) {
        console.error('PDF extraction error:', error);
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
      }
    }
  
    // Extract text from Word documents
    private static async extractFromWord(file: FileInfo): Promise<string> {
      try {
        console.log('Word extraction - using mock implementation for now');
        
        // Same issue - can't fetch mobile file URIs directly
        // Need proper file reading libraries for real implementation
        
        console.log(`Processing Word file: ${file.name}`);
        console.log(`File URI: ${file.uri}`);
        console.log(`File size: ${file.size} bytes`);
        
        // Return mock content for testing
        return this.getMockWordContent(file.name);
        
      } catch (error: any) {
        console.error('Word extraction error:', error);
        throw new Error(`Failed to extract text from Word document: ${error.message}`);
      }
    }
  
    // Clean and normalize extracted text
    private static cleanExtractedText(text: string): string {
      if (!text) return '';
      
      return text
        .replace(/\r\n/g, '\n')           // Normalize line endings
        .replace(/\r/g, '\n')             // Handle old Mac line endings
        .replace(/\n{3,}/g, '\n\n')       // Reduce excessive line breaks
        .replace(/[ \t]+/g, ' ')          // Normalize whitespace
        .replace(/^\s+|\s+$/g, '')        // Trim start and end
        .replace(/[^\x20-\x7E\n]/g, '')   // Remove non-printable characters (keep newlines)
        .substring(0, 10000);             // Limit length for processing
    }
  
    // Mock PDF content for testing
    private static getMockPDFContent(fileName: string): string {
      return `
  Course Syllabus: Advanced Computer Science
  Professor: Dr. Emily Chen
  Department: Computer Science
  Semester: Fall 2024
  
  Course Description:
  This advanced course covers sophisticated topics in computer science including advanced algorithms, data structures, machine learning fundamentals, and software architecture patterns. Students will engage in hands-on projects and research.
  
  Learning Objectives:
  Upon completion of this course, students will be able to:
  - Design and analyze complex algorithms and data structures
  - Understand machine learning concepts and applications
  - Implement scalable software architecture patterns
  - Conduct independent research in computer science
  - Work effectively in team-based development projects
  
  Course Topics and Schedule:
  
  Week 1-2: Advanced Algorithm Analysis
  - Time and space complexity analysis
  - Advanced sorting and searching algorithms
  - Dynamic programming techniques
  - Graph algorithms and optimization
  
  Week 3-4: Advanced Data Structures
  - Self-balancing trees (AVL, Red-Black)
  - Hash tables and collision resolution
  - Heaps and priority queues
  - Disjoint set data structures
  
  Week 5-6: Machine Learning Fundamentals
  - Supervised learning algorithms
  - Unsupervised learning techniques
  - Neural networks and deep learning basics
  - Model evaluation and validation
  
  Week 7-8: Software Architecture Patterns
  - Design patterns and principles
  - Microservices architecture
  - Event-driven systems
  - Scalability and performance optimization
  
  Week 9-10: Database Systems and Big Data
  - Advanced SQL and query optimization
  - NoSQL databases and use cases
  - Big data processing frameworks
  - Data warehouse concepts
  
  Week 11-12: Distributed Systems
  - Consensus algorithms
  - Fault tolerance and reliability
  - Load balancing and caching strategies
  - Cloud computing concepts
  
  Week 13-14: Security and Cryptography
  - Cryptographic algorithms and protocols
  - Web application security
  - Network security principles
  - Privacy and data protection
  
  Week 15-16: Final Projects and Presentations
  - Independent research projects
  - Peer code reviews
  - Project presentations
  - Course reflection and feedback
  
  Assessment Methods:
  - Programming Assignments: 40%
  - Midterm Examination: 20%
  - Final Project: 25%
  - Class Participation: 10%
  - Peer Reviews: 5%
  
  Required Materials:
  - "Introduction to Algorithms" by Cormen, Leiserson, Rivest, and Stein
  - "Designing Data-Intensive Applications" by Martin Kleppmann
  - Access to development environment (provided)
  
  Prerequisites:
  - Data Structures and Algorithms (CS 201)
  - Software Engineering (CS 301)
  - Statistics (MATH 203)
  
  Office Hours:
  Monday, Wednesday, Friday: 2:00-4:00 PM
  Or by appointment
  
  Course Policies:
  - Late assignments penalized 10% per day
  - Collaboration encouraged on projects, individual work on exams
  - Academic integrity strictly enforced
  - Regular attendance expected
      `.trim();
    }
  
    // Mock Word content for testing
    private static getMockWordContent(fileName: string): string {
      return `
  Business Analytics 301
  Professor: Dr. Michael Rodriguez
  School of Business Administration
  Spring 2024
  
  COURSE OVERVIEW
  
  This course introduces students to the fundamental concepts and techniques of business analytics. Students will learn to use data-driven approaches to solve business problems and make strategic decisions.
  
  LEARNING OUTCOMES
  
  By the end of this course, students will be able to:
  1. Apply statistical methods to business data analysis
  2. Use analytics software tools for data visualization
  3. Interpret and communicate analytical findings
  4. Develop data-driven business recommendations
  5. Understand ethical considerations in data analytics
  
  COURSE CONTENT
  
  Module 1: Introduction to Business Analytics (Weeks 1-2)
  - Overview of analytics in business
  - Types of analytics: descriptive, predictive, prescriptive
  - Data sources and collection methods
  - Analytics project lifecycle
  
  Module 2: Statistical Foundations (Weeks 3-4)
  - Descriptive statistics and data summarization
  - Probability distributions
  - Hypothesis testing
  - Correlation and regression analysis
  
  Module 3: Data Visualization (Weeks 5-6)
  - Principles of effective visualization
  - Chart types and when to use them
  - Dashboard design
  - Storytelling with data
  
  Module 4: Predictive Analytics (Weeks 7-9)
  - Linear and logistic regression
  - Decision trees and random forests
  - Clustering techniques
  - Model validation and selection
  
  Module 5: Business Intelligence (Weeks 10-11)
  - Data warehousing concepts
  - OLAP and data cubes
  - Key performance indicators (KPIs)
  - Balanced scorecard methodology
  
  Module 6: Advanced Topics (Weeks 12-13)
  - Text analytics and sentiment analysis
  - Social media analytics
  - Customer analytics and segmentation
  - Supply chain analytics
  
  Module 7: Ethics and Implementation (Weeks 14-15)
  - Privacy and data protection
  - Bias in analytics models
  - Change management for analytics
  - Building an analytics culture
  
  Module 8: Final Projects (Week 16)
  - Student project presentations
  - Peer feedback and discussion
  - Course wrap-up and reflection
  
  ASSESSMENT STRUCTURE
  
  Individual Assignments: 30%
  - Weekly analytics exercises
  - Software proficiency demonstrations
  - Case study analyses
  
  Group Project: 35%
  - Real-world business analytics project
  - Data collection and analysis
  - Final presentation and report
  
  Examinations: 30%
  - Midterm exam (15%)
  - Final exam (15%)
  
  Class Participation: 5%
  - Discussion contributions
  - Peer feedback
  - Workshop activities
  
  REQUIRED RESOURCES
  
  Textbooks:
  - "Business Analytics: Data Analysis and Decision Making" by Albright & Winston
  - "Storytelling with Data" by Cole Nussbaumer Knaflic
  
  Software:
  - Microsoft Excel with Analysis ToolPak
  - Tableau (student license provided)
  - R or Python (optional but recommended)
  
  COURSE POLICIES
  
  Attendance: Regular attendance is expected. More than two unexcused absences may result in grade reduction.
  
  Late Work: Assignments submitted late will be penalized 5% per day unless prior arrangements are made.
  
  Academic Integrity: All work must be original. Proper citation required for all sources. Collaboration guidelines will be specified for each assignment.
  
  Accommodations: Students with documented disabilities should contact the Office of Disability Services to arrange reasonable accommodations.
  
  SCHEDULE OF IMPORTANT DATES
  
  January 15: Course begins
  February 19: Midterm exam
  March 11-15: Spring break (no classes)
  April 16: Group project presentations begin
  May 7: Final exam
  May 10: Course ends
      `.trim();
    }
  
    // Get user-friendly error message
    private static getErrorMessage(error: any): string {
      const message = error.message || 'Unknown error';
      
      if (message.includes('network') || message.includes('fetch')) {
        return 'Network error while reading file. Please check your connection and try again.';
      }
      
      if (message.includes('permission') || message.includes('access')) {
        return 'Permission denied. Please ensure the app has access to read files.';
      }
      
      if (message.includes('corrupted') || message.includes('invalid')) {
        return 'The file appears to be corrupted or invalid. Please try a different file.';
      }
      
      return `File reading failed: ${message}`;
    }
  
    // Test method with sample file info
    static async testWithSampleFile(): Promise<FileReadResult> {
      const sampleFile: FileInfo = {
        uri: 'file://sample-syllabus.pdf',
        name: 'CS-Advanced-Syllabus.pdf',
        type: 'application/pdf',
        size: 1024 * 500, // 500KB
      };
  
      return this.readFileText(sampleFile);
    }
  }
  
