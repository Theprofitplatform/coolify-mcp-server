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
  // SECURITY: Strict UUID validation (standard UUID v4 format or Coolify-style alphanumeric)
  uuid: z.string().regex(/^[a-zA-Z0-9\-]+$/, 'Invalid UUID format - only alphanumeric and hyphens allowed'),

  // Standard UUID v4 format (more strict)
  uuidV4: z.string().regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    'Invalid UUID v4 format'
  ),

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

  // SECURITY: Safe string for shell commands (no special characters)
  safeString: z.string().regex(/^[a-zA-Z0-9_\-\.\/]+$/, 'Contains unsafe characters'),

  // SECURITY: Environment variable key (alphanumeric, underscore, dash)
  envVarKey: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Invalid environment variable name'),
};

/**
 * Create an optional version of a schema
 */
export function optional<T>(schema: z.ZodSchema<T>): z.ZodOptional<z.ZodSchema<T>> {
  return schema.optional();
}

/**
 * Sanitize input to prevent injection attacks
 * SECURITY: Enhanced to prevent SQL and command injection
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters and null bytes
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/[;&|$`(){}[\]\/]/g, '') // Remove shell metacharacters including forward slash
    .replace(/['"]/g, '') // Remove quotes (SQL injection prevention)
    .trim();
}

/**
 * Sanitize SQL string by escaping single quotes
 * SECURITY: Use this for any user input that goes into SQL queries
 */
export function sanitizeSqlString(input: string): string {
  return input.replace(/'/g, "''");
}

/**
 * Validate and sanitize UUID
 * SECURITY: Ensures UUID only contains safe characters
 */
export function sanitizeUuid(uuid: string): string {
  const sanitized = uuid.trim();
  if (!/^[a-zA-Z0-9\-]+$/.test(sanitized)) {
    throw new Error('Invalid UUID format detected');
  }
  return sanitizeSqlString(sanitized);
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
