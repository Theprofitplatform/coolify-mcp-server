/**
 * Set Service Environment Variable Tool
 * Sets a single environment variable for a service
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { SetServiceEnvVarSchema } from '../../schemas/service.schemas.js';

export class SetServiceEnvVarTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'set_service_environment_variable';
  }

  get description(): string {
    return 'Set a single environment variable for a service. Useful for configuring service behavior.';
  }

  get inputSchema(): z.ZodSchema {
    return SetServiceEnvVarSchema;
  }

  async execute(args: z.infer<typeof SetServiceEnvVarSchema>): Promise<string> {
    this.logger.info(`Setting environment variable ${args.key} for service: ${args.uuid}`);

    try {
      const payload = {
        key: args.key,
        value: args.value
      };

      const result = await this.apiPost(`/services/${args.uuid}/envs`, payload);

      this.logger.info(`Successfully set environment variable ${args.key} for service: ${args.uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to set environment variable for service ${args.uuid}`, error);
      throw new Error(`Failed to set service environment variable: ${error.message}`);
    }
  }
}
