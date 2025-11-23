/**
 * Update Deployment Settings Tool
 * Updates deployment configuration for an application
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const UpdateDeploymentSettingsSchema = z.object({
  uuid: z.string().describe('UUID of the application'),
  build_pack: z.enum(['nixpacks', 'dockerfile', 'docker-compose', 'static']).optional().describe('Build pack to use'),
  install_command: z.string().optional().describe('Install command (e.g., npm ci)'),
  build_command: z.string().optional().describe('Build command (e.g., npm run build)'),
  start_command: z.string().optional().describe('Start command (e.g., npm start)'),
  base_directory: z.string().optional().describe('Base directory for the build'),
  publish_directory: z.string().optional().describe('Directory to publish (for static sites)'),
});

export class UpdateDeploymentSettingsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'update_deployment_settings';
  }

  get description(): string {
    return 'Update deployment settings for an application including build pack, commands, and directories.';
  }

  get inputSchema(): z.ZodSchema {
    return UpdateDeploymentSettingsSchema;
  }

  async execute(args: z.infer<typeof UpdateDeploymentSettingsSchema>): Promise<string> {
    const { uuid, ...settings } = args;
    
    this.logger.info(`Updating deployment settings for: ${uuid}`);

    try {
      const cleanSettings = Object.fromEntries(
        Object.entries(settings).filter(([_, v]) => v !== undefined)
      );

      if (Object.keys(cleanSettings).length === 0) {
        return 'No settings provided. Please specify at least one setting to update.';
      }

      const result = await this.apiPatch(`/applications/${uuid}/deployment-settings`, cleanSettings);

      this.logger.info(`Successfully updated deployment settings for: ${uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to update deployment settings for ${uuid}`, error);
      throw new Error(`Failed to update deployment settings: ${error.message}`);
    }
  }
}
