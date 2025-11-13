/**
 * Restart Application Tool
 * Restarts an application
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { RestartApplicationSchema } from '../../schemas/application.schemas.js';

export class RestartApplicationTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'restart_application';
  }

  get description(): string {
    return 'Restart an application by stopping and starting it again. Useful for applying configuration changes or recovering from issues.';
  }

  get inputSchema(): z.ZodSchema {
    return RestartApplicationSchema;
  }

  async execute(args: z.infer<typeof RestartApplicationSchema>): Promise<string> {
    this.logger.info('Restarting application', { uuid: args.uuid });

    const result = await this.apiGet(`/applications/${args.uuid}/restart`);

    this.logger.info('Application restarted successfully', { uuid: args.uuid });

    return this.formatResponse(result);
  }
}
