/**
 * Get Service Environment Variables Tool
 * Retrieves all environment variables for a specific service
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { GetServiceEnvVarsSchema } from '../../schemas/service.schemas.js';

export class GetServiceEnvVarsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_service_environment_variables';
  }

  get description(): string {
    return 'Get all environment variables configured for a specific service. Essential for service configuration management.';
  }

  get inputSchema(): z.ZodSchema {
    return GetServiceEnvVarsSchema;
  }

  async execute(args: z.infer<typeof GetServiceEnvVarsSchema>): Promise<string> {
    this.logger.info(`Fetching environment variables for service: ${args.uuid}`);

    try {
      const envVars = await this.apiGet(`/services/${args.uuid}/envs`);

      if (!envVars || (Array.isArray(envVars) && envVars.length === 0)) {
        return `No environment variables found for service: ${args.uuid}`;
      }

      this.logger.info(`Successfully fetched environment variables for service: ${args.uuid}`);

      return this.formatResponse(envVars);
    } catch (error: any) {
      this.logger.error(`Failed to fetch environment variables for service ${args.uuid}`, error);
      throw new Error(`Failed to get service environment variables: ${error.message}`);
    }
  }
}
