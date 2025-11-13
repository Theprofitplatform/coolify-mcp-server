/**
 * Get Application Logs Tool
 * Retrieves logs from an application
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { GetApplicationLogsSchema } from '../../schemas/application.schemas.js';

export class GetApplicationLogsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_application_logs';
  }

  get description(): string {
    return 'Get application logs by UUID. Essential for debugging and monitoring application behavior, errors, and performance issues.';
  }

  get inputSchema(): z.ZodSchema {
    return GetApplicationLogsSchema;
  }

  async execute(args: z.infer<typeof GetApplicationLogsSchema>): Promise<string> {
    this.logger.info('Fetching application logs', {
      uuid: args.uuid,
      lines: args.lines || 100
    });

    const queryParams = args.lines ? `?lines=${args.lines}` : '?lines=100';
    const logs = await this.apiGet(`/applications/${args.uuid}/logs${queryParams}`);

    this.logger.info('Application logs retrieved successfully', { uuid: args.uuid });

    return this.formatResponse(logs);
  }
}
