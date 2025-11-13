/**
 * Get Version Tool
 * Retrieves Coolify version information
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { GetVersionSchema } from '../../schemas/health.schemas.js';

export class GetVersionTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_version';
  }

  get description(): string {
    return 'Get Coolify version information. Returns the current version of the Coolify instance.';
  }

  get inputSchema(): z.ZodSchema {
    return GetVersionSchema;
  }

  async execute(_args: z.infer<typeof GetVersionSchema>): Promise<string> {
    this.logger.info('Fetching Coolify version');

    const version = await this.apiGet('/version');

    this.logger.info('Version retrieved successfully');

    return this.formatResponse(version);
  }
}
