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
    // Basic implementation - can be enhanced with zod-to-json-schema library
    return {
      type: 'object',
      properties: {},
      required: [],
    };
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
}
