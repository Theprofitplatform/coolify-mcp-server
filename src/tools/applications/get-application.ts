/**
 * Get Application Tool
 * Retrieves detailed information about a specific application
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { GetApplicationSchema } from '../../schemas/application.schemas.js';

export class GetApplicationTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_application';
  }

  get description(): string {
    return 'Get detailed information about a specific application including configuration, status, domains, and environment settings.';
  }

  get inputSchema(): z.ZodSchema {
    return GetApplicationSchema;
  }

  async execute(args: z.infer<typeof GetApplicationSchema>): Promise<string> {
    this.logger.info(`Fetching application details for: ${args.uuid}`);

    try {
      const application = await this.apiGet(`/applications/${args.uuid}`);

      if (!application) {
        return `Application not found: ${args.uuid}`;
      }

      this.logger.info(`Successfully fetched application: ${application.name || args.uuid}`);

      return this.formatResponse(application);
    } catch (error: any) {
      this.logger.error(`Failed to fetch application ${args.uuid}`, error);
      throw new Error(`Failed to get application: ${error.message}`);
    }
  }
}
