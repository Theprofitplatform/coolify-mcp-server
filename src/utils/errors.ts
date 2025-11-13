/**
 * Error Handling Utilities
 * Custom error types and error handling functions
 */

import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

export class CoolifyApiError extends McpError {
  constructor(message: string, public statusCode?: number, public details?: any) {
    super(ErrorCode.InternalError, message);
    this.name = 'CoolifyApiError';
  }
}

export class ValidationError extends McpError {
  constructor(message: string, public validationErrors?: any) {
    super(ErrorCode.InvalidRequest, message);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends McpError {
  constructor(public retryAfter?: number) {
    const message = retryAfter
      ? `Rate limit exceeded. Retry after ${retryAfter} seconds.`
      : 'Rate limit exceeded. Please wait before making more requests.';
    super(ErrorCode.InternalError, message);
    this.name = 'RateLimitError';
  }
}

export class AuthenticationError extends McpError {
  constructor(message = 'Authentication failed. Invalid or expired API token.') {
    super(ErrorCode.InvalidRequest, message);
    this.name = 'AuthenticationError';
  }
}

export class ResourceNotFoundError extends McpError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with ID '${id}' not found`
      : `${resource} not found`;
    super(ErrorCode.InvalidRequest, message);
    this.name = 'ResourceNotFoundError';
  }
}

/**
 * Convert Axios errors to appropriate MCP errors
 */
export function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    switch (status) {
      case 401:
      case 403:
        throw new AuthenticationError();

      case 404:
        throw new ResourceNotFoundError('Resource');

      case 429:
        const retryAfter = error.response?.headers['retry-after'];
        throw new RateLimitError(retryAfter ? parseInt(retryAfter) : undefined);

      case 422:
        throw new ValidationError('Validation failed', data);

      default:
        throw new CoolifyApiError(
          error.message || 'API request failed',
          status,
          data
        );
    }
  }

  if (error instanceof Error) {
    throw new McpError(ErrorCode.InternalError, error.message);
  }

  throw new McpError(ErrorCode.InternalError, 'Unknown error occurred');
}

/**
 * Format error for user-friendly display
 */
export function formatError(error: Error): string {
  if (error instanceof CoolifyApiError) {
    let message = `Coolify API Error: ${error.message}`;
    if (error.statusCode) {
      message += ` (Status: ${error.statusCode})`;
    }
    if (error.details) {
      message += `\nDetails: ${JSON.stringify(error.details, null, 2)}`;
    }
    return message;
  }

  if (error instanceof ValidationError) {
    let message = `Validation Error: ${error.message}`;
    if (error.validationErrors) {
      message += `\nErrors: ${JSON.stringify(error.validationErrors, null, 2)}`;
    }
    return message;
  }

  if (error instanceof RateLimitError) {
    return `Rate Limit: ${error.message}`;
  }

  if (error instanceof AuthenticationError) {
    return `Authentication: ${error.message}`;
  }

  if (error instanceof ResourceNotFoundError) {
    return `Not Found: ${error.message}`;
  }

  return `Error: ${error.message}`;
}
