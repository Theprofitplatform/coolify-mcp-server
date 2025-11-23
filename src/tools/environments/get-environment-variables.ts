/**
 * Get Environment Variables Tool
 * Retrieves all environment variables for an environment
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GetEnvironmentVariablesSchema = z.object({
  project_uuid: z.string().describe('UUID of the project'),
  environment_name: z.string().describe('Name of the environment'),
});

export class GetEnvironmentVariablesTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_environment_variables';
  }

  get description(): string {
    return 'Get all environment variables configured for a specific environment. Useful for reviewing and auditing environment configurations.';
  }

  get inputSchema(): z.ZodSchema {
    return GetEnvironmentVariablesSchema;
  }

  async execute(args: z.infer<typeof GetEnvironmentVariablesSchema>): Promise<string> {
    this.logger.info(`Fetching environment variables for: ${args.environment_name} in project ${args.project_uuid}`);

    try {
      const variables = await this.apiGet(
        `/projects/${args.project_uuid}/environments/${args.environment_name}/variables`
      );

      this.logger.info(`Successfully fetched environment variables for: ${args.environment_name}`);

      return this.formatResponse(variables);
    } catch (error: any) {
      this.logger.error(`Failed to fetch environment variables for ${args.environment_name}`, error);
      throw new Error(`Failed to get environment variables: ${error.message}`);
    }
  }
}
