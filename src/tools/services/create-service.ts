/**
 * Create Service Tool
 * Creates a new service in Coolify
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { CreateServiceSchema } from '../../schemas/service.schemas.js';

export class CreateServiceTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'create_service';
  }

  get description(): string {
    return 'Create a new service on a specified server. Services are containerized applications that run on your Coolify servers. Either "type" or "docker_compose_raw" must be provided - you cannot specify both.';
  }

  get inputSchema(): z.ZodSchema {
    return CreateServiceSchema;
  }

  async execute(args: z.infer<typeof CreateServiceSchema>): Promise<string> {
    this.logger.info('Creating service', {
      name: args.name,
      server_uuid: args.server_uuid,
      project_uuid: args.project_uuid,
      type: args.type || 'custom',
    });

    const service = await this.apiPost('/services', args);

    this.logger.info('Service created successfully', { service });

    return this.formatResponse(service);
  }
}
