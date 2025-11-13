/**
 * Batch Update Environment Variables Tool
 * Update environment variables across multiple applications
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { BatchUpdateEnvVarsSchema } from '../../schemas/batch.schemas.js';
import { formatError } from '../../utils/errors.js';

interface BatchResult {
  uuid: string;
  status: 'success' | 'failed';
  name?: string;
  vars_updated?: number;
  restarted?: boolean;
  error?: string;
}

export class BatchUpdateEnvVarsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'batch_update_env_vars';
  }

  get description(): string {
    return 'Update environment variables across multiple applications. Useful for API key rotation or configuration updates. Optionally restart applications after update.';
  }

  get inputSchema(): z.ZodSchema {
    return BatchUpdateEnvVarsSchema;
  }

  async execute(args: z.infer<typeof BatchUpdateEnvVarsSchema>): Promise<string> {
    const { application_uuids, env_vars, restart_after_update } = args;

    const varCount = Object.keys(env_vars).length;

    this.logger.info('Batch updating environment variables', {
      appCount: application_uuids.length,
      varCount,
      restart: restart_after_update,
      vars: Object.keys(env_vars),
      uuids: application_uuids
    });

    const results: BatchResult[] = [];
    let successful = 0;
    let failed = 0;

    // Execute all updates in parallel
    const promises = application_uuids.map(async (uuid) => {
      try {
        // Update environment variables
        await this.apiPost(`/applications/${uuid}/envs`, env_vars);

        this.logger.debug('Environment variables updated', { uuid, varCount });

        // Optionally restart application
        let restarted = false;
        if (restart_after_update) {
          try {
            await this.apiGet(`/applications/${uuid}/restart`);
            restarted = true;
            this.logger.debug('Application restarted after env update', { uuid });
          } catch (restartError) {
            this.logger.warn('Failed to restart application after env update', { uuid, restartError });
          }
        }

        return {
          uuid,
          status: 'success' as const,
          vars_updated: varCount,
          restarted
        };
      } catch (error) {
        this.logger.warn('Failed to update environment variables', { uuid, error });
        return {
          uuid,
          status: 'failed' as const,
          error: error instanceof Error ? formatError(error) : 'Unknown error'
        };
      }
    });

    const settled = await Promise.all(promises);
    results.push(...settled);

    // Count successes and failures
    successful = results.filter(r => r.status === 'success').length;
    failed = results.filter(r => r.status === 'failed').length;

    this.logger.info('Batch env update completed', {
      total: application_uuids.length,
      successful,
      failed,
      varsUpdated: varCount
    });

    const summary = {
      total: application_uuids.length,
      successful,
      failed,
      env_vars: env_vars,
      vars_count: varCount,
      results,
    };

    return this.formatResponse(summary);
  }
}
