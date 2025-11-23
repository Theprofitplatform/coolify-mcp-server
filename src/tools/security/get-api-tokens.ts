/**
 * Get API Tokens Tool
 * Retrieves all API tokens for the current user/team
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GetApiTokensSchema = z.object({});

export class GetApiTokensTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_api_tokens';
  }

  get description(): string {
    return 'Get all API tokens for the current user or team. Use for managing API access and security.';
  }

  get inputSchema(): z.ZodSchema {
    return GetApiTokensSchema;
  }

  async execute(args: z.infer<typeof GetApiTokensSchema>): Promise<string> {
    this.logger.info('Fetching API tokens');

    try {
      const tokens = await this.apiGet('/api-tokens');

      this.logger.info('Successfully fetched API tokens');

      return this.formatResponse(tokens);
    } catch (error: any) {
      this.logger.error('Failed to fetch API tokens', error);
      throw new Error(`Failed to get API tokens: ${error.message}`);
    }
  }
}
