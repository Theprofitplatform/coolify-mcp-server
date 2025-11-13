/**
 * Validation Utilities
 * Common validation functions and helpers
 */

import { z } from 'zod';
import { ValidationError } from './errors.js';

/**
 * Validate input against a Zod schema
 */
export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid input parameters', error.issues);
    }
    throw error;
  }
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  uuid: z.string().regex(/^[a-zA-Z0-9]+$/, 'Invalid UUID format'),

  url: z.string().url('Invalid URL format'),

  email: z.string().email('Invalid email format'),

  port: z.number().int().min(1).max(65535, 'Port must be between 1 and 65535'),

  ipv4: z
    .string()
    .regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IPv4 address'),

  domain: z
    .string()
    .regex(
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
      'Invalid domain name'
    ),

  nonEmptyString: z.string().min(1, 'Value cannot be empty'),

  positiveInteger: z.number().int().positive('Value must be a positive integer'),
};

/**
 * Create an optional version of a schema
 */
export function optional<T>(schema: z.ZodSchema<T>): z.ZodOptional<z.ZodSchema<T>> {
  return schema.optional();
}

/**
 * Sanitize input to prevent injection attacks
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/[;|&$`]/g, '') // Remove shell metacharacters
    .trim();
}

/**
 * Validate and sanitize object keys
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const sanitizedKey = sanitizeString(key);
    sanitized[sanitizedKey] =
      typeof value === 'string' ? sanitizeString(value) : value;
  }
  return sanitized;
}
