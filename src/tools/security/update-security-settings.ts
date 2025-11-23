/**
 * Update Security Settings Tool
 * Updates security configuration and policies
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const UpdateSecuritySettingsSchema = z.object({
  team_id: z.string().optional().describe('Team ID (optional, defaults to current team)'),
  require_2fa: z.boolean().optional().describe('Require two-factor authentication'),
  api_rate_limit: z.number().optional().describe('API rate limit per minute'),
  session_timeout: z.number().optional().describe('Session timeout in minutes'),
  allowed_ip_ranges: z.array(z.string()).optional().describe('Allowed IP ranges (CIDR notation)'),
});

export class UpdateSecuritySettingsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'update_security_settings';
  }

  get description(): string {
    return 'Update security settings including 2FA requirements, API rate limits, session timeouts, and IP restrictions.';
  }

  get inputSchema(): z.ZodSchema {
    return UpdateSecuritySettingsSchema;
  }

  async execute(args: z.infer<typeof UpdateSecuritySettingsSchema>): Promise<string> {
    const { team_id, ...settings } = args;
    
    this.logger.info('Updating security settings');

    try {
      const cleanSettings = Object.fromEntries(
        Object.entries(settings).filter(([_, v]) => v !== undefined)
      );

      if (Object.keys(cleanSettings).length === 0) {
        return 'No settings provided. Please specify at least one setting to update.';
      }

      const endpoint = team_id 
        ? `/teams/${team_id}/security-settings`
        : '/security-settings';
      
      const result = await this.apiPatch(endpoint, cleanSettings);

      this.logger.info('Successfully updated security settings');

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error('Failed to update security settings', error);
      throw new Error(`Failed to update security settings: ${error.message}`);
    }
  }
}
