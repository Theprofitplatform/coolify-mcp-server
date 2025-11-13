/**
 * Stop Service Tool
 * Stops a running service in Coolify
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { StopServiceSchema } from '../../schemas/service.schemas.js';

export class StopServiceTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'stop_service';
  }

  get description(): string {
    return 'Stop a running service. This will stop all containers associated with the service.';
  }

  get inputSchema(): z.ZodSchema {
    return StopServiceSchema;
  }

  async execute(args: z.infer<typeof StopServiceSchema>): Promise<string> {
    this.logger.info('Stopping service', { uuid: args.uuid });

    const result = await this.apiGet(`/services/${args.uuid}/stop`);

    this.logger.info('Service stop initiated', { uuid: args.uuid });

    return this.formatResponse(result);
  }
}
