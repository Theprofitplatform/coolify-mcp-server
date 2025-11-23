/**
 * Start Application Tool
 * Starts a stopped application
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { StartApplicationSchema } from '../../schemas/application.schemas.js';

export class StartApplicationTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'start_application';
  }

  get description(): string {
    return 'Start a stopped application. This will start the application container and make it available.';
  }

  get inputSchema(): z.ZodSchema {
    return StartApplicationSchema;
  }

  async execute(args: z.infer<typeof StartApplicationSchema>): Promise<string> {
    this.logger.info(`Starting application: ${args.uuid}`);

    try {
      const result = await this.apiGet(`/applications/${args.uuid}/start`);

      this.logger.info(`Successfully started application: ${args.uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to start application ${args.uuid}`, error);
      throw new Error(`Failed to start application: ${error.message}`);
    }
  }
}
