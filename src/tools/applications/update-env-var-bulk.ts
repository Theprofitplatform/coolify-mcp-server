/**
 * Bulk Update Environment Variables Tool
 * Alternative implementation using direct database access when API fails
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { UpdateApplicationEnvVarsSchema } from '../../schemas/application.schemas.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class BulkUpdateEnvVarsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'bulk_update_application_environment_variables';
  }

  get description(): string {
    return 'Bulk update multiple environment variables for an application using optimized method. Falls back to direct database access if API fails. Supports both API and local Coolify installations.';
  }

  get inputSchema(): z.ZodSchema {
    return UpdateApplicationEnvVarsSchema;
  }

  async execute(args: z.infer<typeof UpdateApplicationEnvVarsSchema>): Promise<string> {
    this.logger.info(`Bulk updating environment variables for application: ${args.uuid}`);

    try {
      if (Object.keys(args.env_vars).length === 0) {
        return 'No environment variables provided to update.';
      }

      // Try API method first
      this.logger.debug('Attempting API-based update...');
      const apiResult = await this.tryApiUpdate(args);
      
      if (apiResult.success) {
        return this.formatResponse(apiResult);
      }

      // If API fails, try direct database method (if Coolify is local)
      this.logger.warn('API update failed, attempting direct database access...');
      const dbResult = await this.tryDatabaseUpdate(args);
      
      if (dbResult.success) {
        return this.formatResponse(dbResult);
      }

      // Both methods failed
      throw new Error('Both API and database update methods failed. Please update manually via Coolify dashboard.');

    } catch (error: any) {
      this.logger.error(`Failed to update environment variables for ${args.uuid}`, error);
      throw new Error(`Failed to update environment variables: ${error.message}`);
    }
  }

  private async tryApiUpdate(args: z.infer<typeof UpdateApplicationEnvVarsSchema>): Promise<any> {
    try {
      // Get existing environment variables
      const envVarsResponse = await this.apiGet(`/applications/${args.uuid}/envs`);
      const existingEnvVars = Array.isArray(envVarsResponse) ? envVarsResponse : [];

      // Build map of variable names to UUIDs
      const envVarMap = new Map<string, string>();
      for (const envVar of existingEnvVars) {
        if (envVar.key && envVar.uuid && !envVar.is_preview) {
          envVarMap.set(envVar.key, envVar.uuid);
        }
      }

      const results: any[] = [];
      const errors: any[] = [];

      // Update each variable
      for (const [key, value] of Object.entries(args.env_vars)) {
        try {
          const existingUuid = envVarMap.get(key);
          
          if (existingUuid) {
            // Try PATCH to /envs/{uuid}
            try {
              await this.apiPatch(`/envs/${existingUuid}`, { value });
              results.push({ key, status: 'updated' });
            } catch (patchError: any) {
              // If PATCH fails, try application-scoped endpoint
              await this.apiPatch(`/applications/${args.uuid}/envs/${existingUuid}`, { value });
              results.push({ key, status: 'updated' });
            }
          } else {
            // Create new variable
            await this.apiPost(`/applications/${args.uuid}/envs`, {
              key,
              value,
              is_preview: false
            });
            results.push({ key, status: 'created' });
          }
        } catch (error: any) {
          this.logger.warn(`API update failed for ${key}: ${error.message}`);
          errors.push({ key, error: error.message });
        }
      }

      const successCount = results.length;

      // Restart if requested and at least one update succeeded
      if (args.restart_after_update && successCount > 0) {
        try {
          await this.apiGet(`/applications/${args.uuid}/restart`);
        } catch (restartError: any) {
          errors.push({ key: 'restart', error: restartError.message });
        }
      }

      return {
        success: successCount > 0,
        method: 'api',
        updated_count: successCount,
        failed_count: errors.length,
        total: Object.keys(args.env_vars).length,
        restarted: args.restart_after_update && successCount > 0,
        successful_updates: results.map(r => r.key),
        failed_updates: errors.length > 0 ? errors : undefined
      };

    } catch (error: any) {
      this.logger.warn(`API method failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  private async tryDatabaseUpdate(args: z.infer<typeof UpdateApplicationEnvVarsSchema>): Promise<any> {
    try {
      this.logger.info('Attempting direct database update (requires local Coolify installation)');

      // First, get existing env var UUIDs
      const getUuidsQuery = `
        SELECT key, uuid 
        FROM environment_variables 
        WHERE resourceable_type = 'App\\\\Models\\\\Application' 
        AND resourceable_id = (SELECT id FROM applications WHERE uuid = '${args.uuid}')
        AND is_preview = false
        AND key IN (${Object.keys(args.env_vars).map(k => `'${k}'`).join(',')})
      `;

      const { stdout: uuidResult } = await execAsync(
        `docker exec coolify-db psql -U coolify -d coolify -t -c "${getUuidsQuery}"`
      );

      // Parse UUIDs
      const uuidMap = new Map<string, string>();
      const lines = uuidResult.trim().split('\n');
      for (const line of lines) {
        const [key, uuid] = line.trim().split('|').map(s => s.trim());
        if (key && uuid) {
          uuidMap.set(key, uuid);
        }
      }

      // Build UPDATE queries
      const updates: string[] = [];
      for (const [key, value] of Object.entries(args.env_vars)) {
        const uuid = uuidMap.get(key);
        if (uuid) {
          // Escape single quotes in value
          const escapedValue = value.replace(/'/g, "''");
          updates.push(`UPDATE environment_variables SET value = '${escapedValue}', updated_at = NOW() WHERE uuid = '${uuid}';`);
        }
      }

      if (updates.length === 0) {
        return { success: false, error: 'No variables found to update' };
      }

      // Execute updates
      const updateQuery = updates.join('\n');
      await execAsync(
        `docker exec coolify-db psql -U coolify -d coolify -c "${updateQuery}"`
      );

      // Restart application if requested
      if (args.restart_after_update) {
        try {
          await this.apiGet(`/applications/${args.uuid}/restart`);
        } catch (restartError: any) {
          this.logger.warn(`Restart failed: ${restartError.message}`);
        }
      }

      return {
        success: true,
        method: 'database',
        updated_count: updates.length,
        failed_count: 0,
        total: Object.keys(args.env_vars).length,
        restarted: args.restart_after_update,
        successful_updates: Array.from(uuidMap.keys()),
        note: 'Updated via direct database access'
      };

    } catch (error: any) {
      this.logger.warn(`Database method failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
