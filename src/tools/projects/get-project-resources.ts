/**
 * Get Project Resources Tool
 * Retrieves all resources within a specific project
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GetProjectResourcesSchema = z.object({
  uuid: z.string().describe('UUID of the project'),
});

export class GetProjectResourcesTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_project_resources';
  }

  get description(): string {
    return 'Get all resources (applications, databases, services) within a specific project. Provides a complete overview of project infrastructure.';
  }

  get inputSchema(): z.ZodSchema {
    return GetProjectResourcesSchema;
  }

  async execute(args: z.infer<typeof GetProjectResourcesSchema>): Promise<string> {
    this.logger.info(`Fetching resources for project: ${args.uuid}`);

    try {
      const resources = await this.apiGet(`/projects/${args.uuid}/resources`);

      this.logger.info(`Successfully fetched resources for project: ${args.uuid}`);

      return this.formatResponse(resources);
    } catch (error: any) {
      this.logger.error(`Failed to fetch resources for project ${args.uuid}`, error);
      throw new Error(`Failed to get project resources: ${error.message}`);
    }
  }
}
