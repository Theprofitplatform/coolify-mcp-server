/**
 * Batch Stop Services Tool
 * Stop multiple services simultaneously
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { BatchStopServicesSchema } from '../../schemas/batch.schemas.js';
import { formatError } from '../../utils/errors.js';

interface BatchResult {
  uuid: string;
  status: 'success' | 'failed';
  name?: string;
  error?: string;
}

export class BatchStopServicesTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'batch_stop_services';
  }

  get description(): string {
    return 'Stop multiple services at once. Useful for maintenance mode or cost reduction. Returns success/failure status for each service.';
  }

  get inputSchema(): z.ZodSchema {
    return BatchStopServicesSchema;
  }

  async execute(args: z.infer<typeof BatchStopServicesSchema>): Promise<string> {
    const { service_uuids, force } = args;

    this.logger.info('Batch stopping services', {
      count: service_uuids.length,
      force,
      uuids: service_uuids
    });

    const results: BatchResult[] = [];
    let successful = 0;
    let failed = 0;

    // Execute all stops in parallel
    const promises = service_uuids.map(async (uuid) => {
      try {
        const endpoint = force
          ? `/services/${uuid}/stop?force=true`
          : `/services/${uuid}/stop`;

        await this.apiGet(endpoint);
        this.logger.debug('Service stopped successfully', { uuid });
        return { uuid, status: 'success' as const };
      } catch (error) {
        this.logger.warn('Failed to stop service', { uuid, error });
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
      total: service_uuids.length,
      successful,
      failed
    });

    const summary = {
      total: service_uuids.length,
      successful,
      failed,
      results,
    };

    return this.formatResponse(summary);
  }
}
