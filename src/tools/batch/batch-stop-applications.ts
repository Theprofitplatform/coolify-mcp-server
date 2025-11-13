/**
 * Batch Stop Applications Tool
 * Stop multiple applications simultaneously
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { BatchStopApplicationsSchema } from '../../schemas/batch.schemas.js';
import { formatError } from '../../utils/errors.js';

interface BatchResult {
  uuid: string;
  status: 'success' | 'failed';
  name?: string;
  error?: string;
}

export class BatchStopApplicationsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'batch_stop_applications';
  }

  get description(): string {
    return 'Stop multiple applications at once. Useful for maintenance mode or cost reduction. Returns success/failure status for each application.';
  }

  get inputSchema(): z.ZodSchema {
    return BatchStopApplicationsSchema;
  }

  async execute(args: z.infer<typeof BatchStopApplicationsSchema>): Promise<string> {
    const { application_uuids, force } = args;

    this.logger.info('Batch stopping applications', {
      count: application_uuids.length,
      force,
      uuids: application_uuids
    });

    const results: BatchResult[] = [];
    let successful = 0;
    let failed = 0;

    // Execute all stops in parallel
    const promises = application_uuids.map(async (uuid) => {
      try {
        const endpoint = force
          ? `/applications/${uuid}/stop?force=true`
          : `/applications/${uuid}/stop`;

        await this.apiGet(endpoint);
        this.logger.debug('Application stopped successfully', { uuid });
        return { uuid, status: 'success' as const };
      } catch (error) {
        this.logger.warn('Failed to stop application', { uuid, error });
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

    this.logger.info('Batch stop completed', {
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
