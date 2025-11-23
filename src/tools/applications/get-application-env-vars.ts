/**
 * Get Application Environment Variables Tool
 * Retrieves all environment variables for a specific application
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { GetApplicationEnvVarsSchema } from '../../schemas/application.schemas.js';

export class GetApplicationEnvVarsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_application_environment_variables';
  }

  get description(): string {
    return 'Get all environment variables configured for a specific application. Essential for configuration management and debugging.';
  }

  get inputSchema(): z.ZodSchema {
    return GetApplicationEnvVarsSchema;
  }

  async execute(args: z.infer<typeof GetApplicationEnvVarsSchema>): Promise<string> {
    this.logger.info(`Fetching environment variables for application: ${args.uuid}`);

    try {
      const envVars = await this.apiGet(`/applications/${args.uuid}/envs`);

      if (!envVars || (Array.isArray(envVars) && envVars.length === 0)) {
        return `No environment variables found for application: ${args.uuid}`;
      }

      this.logger.info(`Successfully fetched environment variables for application: ${args.uuid}`);

      return this.formatResponse(envVars);
    } catch (error: any) {
      this.logger.error(`Failed to fetch environment variables for ${args.uuid}`, error);
      throw new Error(`Failed to get environment variables: ${error.message}`);
    }
  }
}
