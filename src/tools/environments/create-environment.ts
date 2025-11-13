/**
 * Create Environment Tool
 * Creates a new environment in a project
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { CreateEnvironmentSchema } from '../../schemas/environment.schemas.js';

export class CreateEnvironmentTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'create_environment';
  }

  get description(): string {
    return 'Create a new environment in a project. Environments help organize deployments (e.g., production, staging, development).';
  }

  get inputSchema(): z.ZodSchema {
    return CreateEnvironmentSchema;
  }

  async execute(args: z.infer<typeof CreateEnvironmentSchema>): Promise<string> {
    this.logger.info('Creating environment', { name: args.name, project_uuid: args.project_uuid });

    const environment = await this.apiPost('/environments', args);

    this.logger.info('Environment created successfully', { environment });

    return this.formatResponse(environment);
  }
}
