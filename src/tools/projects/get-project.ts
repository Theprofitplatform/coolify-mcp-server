/**
 * Get Project Tool
 * Retrieves details of a specific project
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { GetProjectSchema } from '../../schemas/project.schemas.js';

export class GetProjectTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_project';
  }

  get description(): string {
    return 'Get details of a specific project including its environments.';
  }

  get inputSchema(): z.ZodSchema {
    return GetProjectSchema;
  }

  async execute(args: z.infer<typeof GetProjectSchema>): Promise<string> {
    this.logger.info('Fetching project', { uuid: args.project_uuid });

    const project = await this.apiGet(`/projects/${args.project_uuid}`);

    this.logger.info('Project retrieved successfully');

    return this.formatResponse(project);
  }
}
