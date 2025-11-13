/**
 * Create Project Tool
 * Creates a new project in Coolify
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { CreateProjectSchema } from '../../schemas/project.schemas.js';

export class CreateProjectTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'create_project';
  }

  get description(): string {
    return 'Create a new project. Projects organize applications and services into logical groups.';
  }

  get inputSchema(): z.ZodSchema {
    return CreateProjectSchema;
  }

  async execute(args: z.infer<typeof CreateProjectSchema>): Promise<string> {
    this.logger.info('Creating project', { name: args.name });

    const project = await this.apiPost('/projects', args);

    this.logger.info('Project created successfully', { project });

    return this.formatResponse(project);
  }
}
