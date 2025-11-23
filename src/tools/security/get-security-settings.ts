/**
 * Get Security Settings Tool
 * Retrieves security configuration and settings
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GetSecuritySettingsSchema = z.object({
  team_id: z.string().optional().describe('Team ID (optional, defaults to current team)'),
});

export class GetSecuritySettingsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_security_settings';
  }

  get description(): string {
    return 'Get security settings including authentication requirements, API access policies, and security configurations.';
  }

  get inputSchema(): z.ZodSchema {
    return GetSecuritySettingsSchema;
  }

  async execute(args: z.infer<typeof GetSecuritySettingsSchema>): Promise<string> {
    this.logger.info('Fetching security settings');

    try {
      const endpoint = args.team_id 
        ? `/teams/${args.team_id}/security-settings`
        : '/security-settings';
      
      const settings = await this.apiGet(endpoint);

      this.logger.info('Successfully fetched security settings');

      return this.formatResponse(settings);
    } catch (error: any) {
      this.logger.error('Failed to fetch security settings', error);
      throw new Error(`Failed to get security settings: ${error.message}`);
    }
  }
}
