/**
 * Base Tool Class
 * Abstract base class for all Coolify MCP tools
 */

import { AxiosInstance } from 'axios';
import { z } from 'zod';
import type { ToolDefinition, ToolResult, CoolifyVersion } from '../types/tool.js';
import { Logger, createLogger } from '../utils/logger.js';
import { handleApiError, formatError } from '../utils/errors.js';
import { validateInput } from '../utils/validators.js';

export abstract class BaseTool {
  protected logger: Logger;

  constructor(
    protected apiClient: AxiosInstance,
    protected version?: CoolifyVersion
  ) {
    // Logger will be initialized by subclass
    this.logger = createLogger('Tool');
  }

  /**
   * Initialize logger with tool name (call in subclass constructor)
   */
  protected initLogger(): void {
    this.logger = createLogger(this.name);
  }

  /**
   * Tool name (must be unique across all tools)
   */
  abstract get name(): string;

  /**
   * Tool description for MCP protocol
   */
  abstract get description(): string;

  /**
   * Zod validation schema for input parameters
   */
  abstract get inputSchema(): z.ZodSchema;

  /**
   * Execute the tool with given arguments
   */
  abstract execute(args: any): Promise<string>;

  /**
   * Get the MCP tool definition
   */
  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.zodToJsonSchema(this.inputSchema),
    };
  }

  /**
   * Execute tool with validation and error handling
   */
  async run(args: unknown): Promise<ToolResult> {
    this.logger.debug(`Executing tool: ${this.name}`, { args });

    try {
      // Validate input
      const validatedArgs = validateInput(this.inputSchema, args);

      // Execute tool
      const result = await this.execute(validatedArgs);

      this.logger.debug(`Tool execution successful: ${this.name}`);

      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    } catch (error) {
      this.logger.error(`Tool execution failed: ${this.name}`, error);

      // Handle and format error
      try {
        handleApiError(error);
      } catch (handledError) {
        const errorMessage =
          handledError instanceof Error
            ? formatError(handledError)
            : 'Unknown error occurred';

        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
        };
      }
    }

    // Fallback (should never reach here)
    return {
      content: [
        {
          type: 'text',
          text: 'An unexpected error occurred',
        },
      ],
    };
  }

  /**
   * Convert Zod schema to JSON Schema for MCP protocol
   */
  protected zodToJsonSchema(schema: z.ZodSchema): any {
    // Import zodToJsonSchema dynamically
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { zodToJsonSchema: converter } = require('zod-to-json-schema');
      return converter(schema);
    } catch (error) {
      // Fallback to manual conversion if zod-to-json-schema not available
      this.logger.warn('zod-to-json-schema not available, using fallback conversion');
      return this.manualZodToJsonSchema(schema);
    }
  }

  /**
   * Manual fallback for Zod to JSON Schema conversion
   */
  private manualZodToJsonSchema(schema: z.ZodSchema): any {
    // Support both Zod 3.x (_def.shape) and Zod 4.x (def.shape)
    const shape = (schema as any).shape || (schema as any).def?.shape || (schema as any)._def?.shape;
    
    if (!shape) {
      return {
        type: 'object',
        properties: {},
      };
    }

    const properties: any = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      const zodType = value as any;
      
      // Check if optional or has default - support both Zod 3.x and 4.x
      const typeName = zodType.type || zodType.def?.type || zodType._def?.typeName;
      const isOptional = typeName === 'optional' || typeName === 'ZodOptional';
      const hasDefault = typeName === 'default' || typeName === 'ZodDefault';
      
      // Always pass the full zodType to preserve descriptions
      properties[key] = this.zodTypeToJsonSchema(zodType);
      
      // Only add to required if not optional or has default
      if (!isOptional && !hasDefault) {
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      ...(required.length > 0 && { required }),
    };
  }

  /**
   * Convert individual Zod type to JSON Schema
   */
  private zodTypeToJsonSchema(zodType: any): any {
    // Support both Zod 3.x (_def.typeName) and Zod 4.x (type or def.type)
    const typeName = zodType.type || zodType.def?.type || zodType._def?.typeName;
    
    // Get description - check multiple possible locations
    const description = zodType.description || zodType.def?.description || zodType._def?.description;

    const baseSchema: any = {};
    if (description) {
      baseSchema.description = description;
    }

    // Handle both Zod 3.x style (ZodString) and Zod 4.x style (string)
    switch (typeName) {
      case 'string':
      case 'ZodString':
        return { ...baseSchema, type: 'string' };
      case 'number':
      case 'ZodNumber':
        return { ...baseSchema, type: 'number' };
      case 'boolean':
      case 'ZodBoolean':
        return { ...baseSchema, type: 'boolean' };
      case 'array':
      case 'ZodArray':
        const arrayType = zodType.def?.type || zodType._def?.type;
        return {
          ...baseSchema,
          type: 'array',
          items: arrayType ? this.zodTypeToJsonSchema(arrayType) : { type: 'string' },
        };
      case 'object':
      case 'ZodObject':
        return this.manualZodToJsonSchema(zodType);
      case 'optional':
      case 'ZodOptional':
      case 'default':
      case 'ZodDefault':
        // For optional/default types, get the schema from inner type
        const innerType = zodType.def?.innerType || zodType._def?.innerType;
        const innerSchema = this.zodTypeToJsonSchema(innerType);
        // Preserve description from the wrapper if inner type doesn't have one
        if (description && !innerSchema.description) {
          innerSchema.description = description;
        }
        return innerSchema;
      default:
        // Default fallback
        return { ...baseSchema, type: 'string' };
    }
  }

  /**
   * Format API response as string
   */
  protected formatResponse(data: any): string {
    if (typeof data === 'string') {
      return data;
    }

    if (Array.isArray(data)) {
      if (data.length === 0) {
        return 'No items found.';
      }
      return JSON.stringify(data, null, 2);
    }

    if (typeof data === 'object' && data !== null) {
      return JSON.stringify(data, null, 2);
    }

    return String(data);
  }

  /**
   * Check if a feature is available in current Coolify version
   */
  protected isFeatureAvailable(minVersion: string): boolean {
    if (!this.version) {
      return true; // Assume available if version unknown
    }

    const [minMajor, minMinor, minPatch] = minVersion
      .split('-')[0]
      .split('.')
      .map(Number);

    return (
      this.version.major > minMajor ||
      (this.version.major === minMajor && this.version.minor > minMinor) ||
      (this.version.major === minMajor &&
        this.version.minor === minMinor &&
        this.version.patch >= minPatch)
    );
  }

  /**
   * Make API request with error handling
   */
  protected async apiGet<T = any>(endpoint: string): Promise<T> {
    try {
      const response = await this.apiClient.get<T>(endpoint);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error; // TypeScript requirement, never reached
    }
  }

  /**
   * Make POST API request with error handling
   */
  protected async apiPost<T = any>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.apiClient.post<T>(endpoint, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Make PUT API request with error handling
   */
  protected async apiPut<T = any>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.apiClient.put<T>(endpoint, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Make DELETE API request with error handling
   */
  protected async apiDelete<T = any>(endpoint: string): Promise<T> {
    try {
      const response = await this.apiClient.delete<T>(endpoint);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Make PATCH API request with error handling
   */
  protected async apiPatch<T = any>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.apiClient.patch<T>(endpoint, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
}
