/**
 * Batch Restart Applications Tool
 * Restart multiple applications simultaneously
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { BatchRestartApplicationsSchema } from '../../schemas/batch.schemas.js';
import { formatError } from '../../utils/errors.js';

interface BatchResult {
  uuid: string;
  status: 'success' | 'failed';
  name?: string;
  error?: string;
}

export class BatchRestartApplicationsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'batch_restart_applications';
  }

  get description(): string {
    return 'Restart multiple applications at once. Useful for deploying updates across multiple applications simultaneously. Returns success/failure status for each application.';
  }

  get inputSchema(): z.ZodSchema {
    return BatchRestartApplicationsSchema;
  }

  async execute(args: z.infer<typeof BatchRestartApplicationsSchema>): Promise<string> {
    const { application_uuids, parallel } = args;

    this.logger.info('Batch restarting applications', {
      count: application_uuids.length,
      parallel,
      uuids: application_uuids
    });

    const results: BatchResult[] = [];
    let successful = 0;
    let failed = 0;

    if (parallel) {
      // Execute all restarts in parallel
      const promises = application_uuids.map(async (uuid) => {
        try {
          await this.apiGet(`/applications/${uuid}/restart`);
          this.logger.debug('Application restarted successfully', { uuid });
          return { uuid, status: 'success' as const };
        } catch (error) {
          this.logger.warn('Failed to restart application', { uuid, error });
          return {
            uuid,
            status: 'failed' as const,
            error: error instanceof Error ? formatError(error) : 'Unknown error'
          };
        }
      });

      const settled = await Promise.all(promises);
      results.push(...settled);
    } else {
      // Execute sequentially
      for (const uuid of application_uuids) {
        try {
          await this.apiGet(`/applications/${uuid}/restart`);
          this.logger.debug('Application restarted successfully', { uuid });
          results.push({ uuid, status: 'success' });
        } catch (error) {
          this.logger.warn('Failed to restart application', { uuid, error });
          results.push({
            uuid,
            status: 'failed',
            error: error instanceof Error ? formatError(error) : 'Unknown error'
          });
        }
      }
    }

    // Count successes and failures
    successful = results.filter(r => r.status === 'success').length;
    failed = results.filter(r => r.status === 'failed').length;

    this.logger.info('Batch restart completed', {
      total: application_uuids.length,
      successful,
      failed
    });

    const summary = {
      total: application_uuids.length,
      successful,
      failed,
      results,
    };

    return this.formatResponse(summary);
  }
}
