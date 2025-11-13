/**
 * Restart Service Tool
 * Restarts a service in Coolify
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { RestartServiceSchema } from '../../schemas/service.schemas.js';

export class RestartServiceTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'restart_service';
  }

  get description(): string {
    return 'Restart a service. This will stop and then start all containers associated with the service.';
  }

  get inputSchema(): z.ZodSchema {
    return RestartServiceSchema;
  }

  async execute(args: z.infer<typeof RestartServiceSchema>): Promise<string> {
    this.logger.info('Restarting service', { uuid: args.uuid });

    const result = await this.apiGet(`/services/${args.uuid}/restart`);

    this.logger.info('Service restart initiated', { uuid: args.uuid });

    return this.formatResponse(result);
  }
}
