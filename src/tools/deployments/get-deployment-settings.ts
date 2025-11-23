/**
 * Get Deployment Settings Tool
 * Retrieves deployment configuration for an application
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GetDeploymentSettingsSchema = z.object({
  uuid: z.string().describe('UUID of the application'),
});

export class GetDeploymentSettingsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_deployment_settings';
  }

  get description(): string {
    return 'Get deployment settings for an application including build pack, install command, build command, and start command.';
  }

  get inputSchema(): z.ZodSchema {
    return GetDeploymentSettingsSchema;
  }

  async execute(args: z.infer<typeof GetDeploymentSettingsSchema>): Promise<string> {
    this.logger.info(`Fetching deployment settings for: ${args.uuid}`);

    try {
      const settings = await this.apiGet(`/applications/${args.uuid}/deployment-settings`);

      this.logger.info(`Successfully fetched deployment settings for: ${args.uuid}`);

      return this.formatResponse(settings);
    } catch (error: any) {
      this.logger.error(`Failed to fetch deployment settings for ${args.uuid}`, error);
      throw new Error(`Failed to get deployment settings: ${error.message}`);
    }
  }
}
