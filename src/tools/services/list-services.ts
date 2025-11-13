/**
 * List Services Tool
 * Retrieves all services across the Coolify instance
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { ListServicesSchema } from '../../schemas/service.schemas.js';

export class ListServicesTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'list_services';
  }

  get description(): string {
    return 'List all services across your Coolify instance. Services are containerized applications that run on your servers.';
  }

  get inputSchema(): z.ZodSchema {
    return ListServicesSchema;
  }

  async execute(_args: z.infer<typeof ListServicesSchema>): Promise<string> {
    this.logger.info('Fetching all services');

    const services = await this.apiGet('/services');

    if (!Array.isArray(services) || services.length === 0) {
      return 'No services found.';
    }

    this.logger.info(`Found ${services.length} service(s)`);

    return this.formatResponse(services);
  }
}
