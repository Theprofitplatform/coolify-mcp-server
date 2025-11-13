/**
 * Batch Start Services Tool
 * Start multiple services simultaneously
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { BatchStartServicesSchema } from '../../schemas/batch.schemas.js';
import { formatError } from '../../utils/errors.js';

interface BatchResult {
  uuid: string;
  status: 'success' | 'failed';
  name?: string;
  error?: string;
}

export class BatchStartServicesTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'batch_start_services';
  }

  get description(): string {
    return 'Start multiple services at once. Useful for environment startup or disaster recovery. Returns success/failure status for each service.';
  }

  get inputSchema(): z.ZodSchema {
    return BatchStartServicesSchema;
  }

  async execute(args: z.infer<typeof BatchStartServicesSchema>): Promise<string> {
    const { service_uuids } = args;

    this.logger.info('Batch starting services', {
      count: service_uuids.length,
      uuids: service_uuids
    });

    const results: BatchResult[] = [];
    let successful = 0;
    let failed = 0;

    // Execute all starts in parallel
    const promises = service_uuids.map(async (uuid) => {
      try {
        await this.apiGet(`/services/${uuid}/start`);
        this.logger.debug('Service started successfully', { uuid });
        return { uuid, status: 'success' as const };
      } catch (error) {
        this.logger.warn('Failed to start service', { uuid, error });
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

    this.logger.info('Batch start completed', {
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
