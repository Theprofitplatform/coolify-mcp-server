/**
 * List Projects Tool
 * Retrieves all projects accessible by the current user
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { ListProjectsSchema } from '../../schemas/project.schemas.js';

export class ListProjectsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'list_projects';
  }

  get description(): string {
    return 'List all projects accessible by the current user. Projects organize applications and services into logical groups.';
  }

  get inputSchema(): z.ZodSchema {
    return ListProjectsSchema;
  }

  async execute(_args: z.infer<typeof ListProjectsSchema>): Promise<string> {
    this.logger.info('Fetching all projects');

    const projects = await this.apiGet('/projects');

    if (!Array.isArray(projects) || projects.length === 0) {
      return 'No projects found.';
    }

    this.logger.info(`Found ${projects.length} project(s)`);

    return this.formatResponse(projects);
  }
}
