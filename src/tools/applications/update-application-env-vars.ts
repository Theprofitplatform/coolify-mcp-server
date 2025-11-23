/**
 * Update Application Environment Variables Tool
 * Updates multiple environment variables for an application at once
 * 
 * Implementation Notes:
 * - Coolify API requires PATCH to /envs/{uuid} endpoint for existing variables
 * - Must fetch existing variables first to get their UUIDs
 * - Creates new variables with POST if they don't exist
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { UpdateApplicationEnvVarsSchema } from '../../schemas/application.schemas.js';

export class UpdateApplicationEnvVarsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'update_application_environment_variables';
  }

  get description(): string {
    return 'Update multiple environment variables for an application at once. Can optionally restart the application after update.';
  }

  get inputSchema(): z.ZodSchema {
    return UpdateApplicationEnvVarsSchema;
  }

  async execute(args: z.infer<typeof UpdateApplicationEnvVarsSchema>): Promise<string> {
    this.logger.info(`Updating environment variables for application: ${args.uuid}`);

    try {
      if (Object.keys(args.env_vars).length === 0) {
        return 'No environment variables provided to update.';
      }

      // First, get existing environment variables to find their UUIDs
      this.logger.debug(`Fetching existing environment variables for application ${args.uuid}`);
      let existingEnvVars: any[] = [];
      try {
        const envVarsResponse = await this.apiGet(`/applications/${args.uuid}/envs`);
        existingEnvVars = Array.isArray(envVarsResponse) ? envVarsResponse : [];
      } catch (error: any) {
        this.logger.warn(`Could not fetch existing env vars: ${error.message}`);
      }

      // Build a map of variable names to UUIDs (for non-preview variables)
      const envVarMap = new Map<string, string>();
      for (const envVar of existingEnvVars) {
        if (envVar.key && envVar.uuid && !envVar.is_preview) {
          envVarMap.set(envVar.key, envVar.uuid);
        }
      }

      // Update each environment variable
      const results: any[] = [];
      const errors: any[] = [];

      for (const [key, value] of Object.entries(args.env_vars)) {
        try {
          this.logger.debug(`Updating env var: ${key} for application ${args.uuid}`);
          
          const existingUuid = envVarMap.get(key);
          
          if (existingUuid) {
            // Variable exists - use PATCH to update it
            this.logger.debug(`Updating existing variable ${key} with UUID ${existingUuid}`);
            const payload = { value: value };
            const result = await this.apiPatch(`/applications/${args.uuid}/envs/${existingUuid}`, payload);
            results.push({ key, status: 'updated', result });
          } else {
            // Variable doesn't exist - create it
            this.logger.debug(`Creating new variable ${key}`);
            const payload = {
              key: key,
              value: value,
              is_preview: false
            };
            const result = await this.apiPost(`/applications/${args.uuid}/envs`, payload);
            results.push({ key, status: 'created', result });
          }
          
          this.logger.debug(`Successfully processed ${key}`);
        } catch (error: any) {
          this.logger.warn(`Failed to update ${key}: ${error.message}`);
          errors.push({ key, error: error.message });
        }
      }

      const successCount = results.length;
      const failCount = errors.length;

      this.logger.info(`Updated ${successCount}/${Object.keys(args.env_vars).length} environment variables for application: ${args.uuid}`);

      // Restart if requested and at least one update succeeded
      if (args.restart_after_update && successCount > 0) {
        this.logger.info(`Restarting application after env var update: ${args.uuid}`);
        try {
          await this.apiGet(`/applications/${args.uuid}/restart`);
        } catch (restartError: any) {
          this.logger.error(`Failed to restart application: ${restartError.message}`);
          errors.push({ key: 'restart', error: restartError.message });
        }
      }

      return this.formatResponse({
        success: successCount > 0,
        updated_count: successCount,
        failed_count: failCount,
        total: Object.keys(args.env_vars).length,
        restarted: args.restart_after_update && successCount > 0,
        successful_updates: results.map(r => r.key),
        failed_updates: errors.length > 0 ? errors : undefined
      });
    } catch (error: any) {
      this.logger.error(`Failed to update environment variables for ${args.uuid}`, error);
      throw new Error(`Failed to update environment variables: ${error.message}`);
    }
  }
}
