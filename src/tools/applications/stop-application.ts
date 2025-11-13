/**
 * Stop Application Tool
 * Stops a running application
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { StopApplicationSchema } from '../../schemas/application.schemas.js';

export class StopApplicationTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'stop_application';
  }

  get description(): string {
    return 'Stop a running application. This will gracefully shut down the application container.';
  }

  get inputSchema(): z.ZodSchema {
    return StopApplicationSchema;
  }

  async execute(args: z.infer<typeof StopApplicationSchema>): Promise<string> {
    this.logger.info('Stopping application', { uuid: args.uuid });

    const result = await this.apiGet(`/applications/${args.uuid}/stop`);

    this.logger.info('Application stopped successfully', { uuid: args.uuid });

    return this.formatResponse(result);
  }
}
