/**
 * Set Application Environment Variable Tool
 * Sets a single environment variable for an application
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { SetApplicationEnvVarSchema } from '../../schemas/application.schemas.js';

export class SetApplicationEnvVarTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'set_application_environment_variable';
  }

  get description(): string {
    return 'Set a single environment variable for an application. Can be set for all deployments or preview deployments only.';
  }

  get inputSchema(): z.ZodSchema {
    return SetApplicationEnvVarSchema;
  }

  async execute(args: z.infer<typeof SetApplicationEnvVarSchema>): Promise<string> {
    this.logger.info(`Setting environment variable ${args.key} for application: ${args.uuid}`);

    try {
      const payload = {
        key: args.key,
        value: args.value,
        is_preview: args.is_preview || false
      };

      const result = await this.apiPost(`/applications/${args.uuid}/envs`, payload);

      this.logger.info(`Successfully set environment variable ${args.key} for application: ${args.uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to set environment variable for ${args.uuid}`, error);
      throw new Error(`Failed to set environment variable: ${error.message}`);
    }
  }
}
