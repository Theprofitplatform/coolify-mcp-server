/**
 * Create Application Tool
 * Creates a new application in Coolify
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { CreateApplicationSchema } from '../../schemas/application.schemas.js';

export class CreateApplicationTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'create_application';
  }

  get description(): string {
    return 'Create a new application in Coolify. Applications are deployable units that can be sourced from Git repositories.';
  }

  get inputSchema(): z.ZodSchema {
    return CreateApplicationSchema;
  }

  async execute(args: z.infer<typeof CreateApplicationSchema>): Promise<string> {
    this.logger.info('Creating application', {
      project_uuid: args.project_uuid,
      environment_name: args.environment_name
    });

    const application = await this.apiPost('/applications', args);

    this.logger.info('Application created successfully', { application });

    return this.formatResponse(application);
  }
}
