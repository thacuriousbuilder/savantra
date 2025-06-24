
import { z } from 'zod';

// Course creation form validation schema
export const createCourseSchema = z.object({
  name: z
    .string()
    .min(1, 'Course name is required')
    .min(3, 'Course name must be at least 3 characters')
    .max(100, 'Course name must be less than 100 characters')
    .trim(),
  
  endDate: z
    .string()
    .min(1, 'End date is required')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time for date-only comparison
      return selectedDate >= today;
    }, 'End date must be today or in the future'),
  
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .transform((val) => val?.trim() || undefined), // Convert empty string to undefined
});

// Type inference from schema
export type CreateCourseFormData = z.infer<typeof createCourseSchema>;

// Form field names for consistent referencing
export const COURSE_FORM_FIELDS = {
  NAME: 'name',
  END_DATE: 'endDate', 
  DESCRIPTION: 'description',
} as const;