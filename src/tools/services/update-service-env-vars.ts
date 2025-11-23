/**
 * Update Service Environment Variables Tool
 * Updates multiple environment variables for a service at once
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { UpdateServiceEnvVarsSchema } from '../../schemas/service.schemas.js';

export class UpdateServiceEnvVarsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'update_service_environment_variables';
  }

  get description(): string {
    return 'Update multiple environment variables for a service at once. Can optionally restart the service after update.';
  }

  get inputSchema(): z.ZodSchema {
    return UpdateServiceEnvVarsSchema;
  }

  async execute(args: z.infer<typeof UpdateServiceEnvVarsSchema>): Promise<string> {
    this.logger.info(`Updating environment variables for service: ${args.uuid}`);

    try {
      if (Object.keys(args.env_vars).length === 0) {
        return 'No environment variables provided to update.';
      }

      // Coolify API requires individual updates for each environment variable
      // We need to update them one by one
      const results: any[] = [];
      const errors: any[] = [];

      for (const [key, value] of Object.entries(args.env_vars)) {
        try {
          this.logger.debug(`Updating env var: ${key} for service ${args.uuid}`);
          
          const payload = {
            key: key,
            value: value
          };

          const result = await this.apiPost(`/services/${args.uuid}/envs`, payload);
          results.push({ key, status: 'success', result });
          
          this.logger.debug(`Successfully updated ${key}`);
        } catch (error: any) {
          this.logger.warn(`Failed to update ${key}: ${error.message}`);
          errors.push({ key, error: error.message });
        }
      }

      const successCount = results.length;
      const failCount = errors.length;

      this.logger.info(`Updated ${successCount}/${Object.keys(args.env_vars).length} environment variables for service: ${args.uuid}`);

      // Restart if requested and at least one update succeeded
      if (args.restart_after_update && successCount > 0) {
        this.logger.info(`Restarting service after env var update: ${args.uuid}`);
        try {
          await this.apiGet(`/services/${args.uuid}/restart`);
        } catch (restartError: any) {
          this.logger.error(`Failed to restart service: ${restartError.message}`);
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
      this.logger.error(`Failed to update environment variables for service ${args.uuid}`, error);
      throw new Error(`Failed to update service environment variables: ${error.message}`);
    }
  }
}
