/**
 * Tool Type Definitions
 * Defines interfaces for MCP tools and their components
 */

import { z } from 'zod';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
    examples?: any[];
    additionalInfo?: {
      responseFormat?: string;
      usage?: string;
      notes?: string[];
      relatedTools?: string[];
    };
  };
}

export interface ToolExecutionContext {
  apiClient: any; // AxiosInstance
  version?: CoolifyVersion;
}

export interface CoolifyVersion {
  version: string;
  major: number;
  minor: number;
  patch: number;
  beta?: number;
}

export interface ToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

export type ValidationSchema = z.ZodSchema<any>;
