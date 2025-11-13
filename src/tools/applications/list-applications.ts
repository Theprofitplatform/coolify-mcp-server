/**
 * List Applications Tool
 * Retrieves all applications across the Coolify instance
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { ListApplicationsSchema } from '../../schemas/application.schemas.js';

export class ListApplicationsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'list_applications';
  }

  get description(): string {
    return 'List all applications across your Coolify instance. Applications are deployable units sourced from Git repositories.';
  }

  get inputSchema(): z.ZodSchema {
    return ListApplicationsSchema;
  }

  async execute(_args: z.infer<typeof ListApplicationsSchema>): Promise<string> {
    this.logger.info('Fetching all applications');

    const resources = await this.apiGet('/resources');

    if (!Array.isArray(resources) || resources.length === 0) {
      return 'No applications found.';
    }

    this.logger.info(`Found ${resources.length} application(s)`);

    return this.formatResponse(resources);
  }
}
