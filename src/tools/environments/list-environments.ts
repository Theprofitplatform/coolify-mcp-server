/**
 * List Environments Tool
 * Retrieves all environments in a project
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { ListEnvironmentsSchema } from '../../schemas/environment.schemas.js';

export class ListEnvironmentsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'list_environments';
  }

  get description(): string {
    return 'List all environments in a project. Use this to get environment names needed for other operations.';
  }

  get inputSchema(): z.ZodSchema {
    return ListEnvironmentsSchema;
  }

  async execute(args: z.infer<typeof ListEnvironmentsSchema>): Promise<string> {
    this.logger.info('Fetching environments for project', { project_uuid: args.project_uuid });

    const environments = await this.apiGet(`/projects/${args.project_uuid}/environments`);

    if (!Array.isArray(environments) || environments.length === 0) {
      return 'No environments found in this project.';
    }

    this.logger.info(`Found ${environments.length} environment(s)`);

    return this.formatResponse(environments);
  }
}
