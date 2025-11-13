/**
 * Start Service Tool
 * Starts a stopped service in Coolify
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { StartServiceSchema } from '../../schemas/service.schemas.js';

export class StartServiceTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'start_service';
  }

  get description(): string {
    return 'Start a stopped service. This will start all containers associated with the service.';
  }

  get inputSchema(): z.ZodSchema {
    return StartServiceSchema;
  }

  async execute(args: z.infer<typeof StartServiceSchema>): Promise<string> {
    this.logger.info('Starting service', { uuid: args.uuid });

    const result = await this.apiGet(`/services/${args.uuid}/start`);

    this.logger.info('Service start initiated', { uuid: args.uuid });

    return this.formatResponse(result);
  }
}
