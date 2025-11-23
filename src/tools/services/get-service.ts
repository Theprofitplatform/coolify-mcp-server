/**
 * Get Service Tool
 * Retrieves detailed information about a specific service
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GetServiceSchema = z.object({
  uuid: z.string().describe('UUID of the service to retrieve'),
});

export class GetServiceTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_service';
  }

  get description(): string {
    return 'Get detailed information about a specific service including type, status, configuration, and containers.';
  }

  get inputSchema(): z.ZodSchema {
    return GetServiceSchema;
  }

  async execute(args: z.infer<typeof GetServiceSchema>): Promise<string> {
    this.logger.info(`Fetching service details for: ${args.uuid}`);

    try {
      const service = await this.apiGet(`/services/${args.uuid}`);

      if (!service) {
        return `Service not found: ${args.uuid}`;
      }

      this.logger.info(`Successfully fetched service: ${service.name || args.uuid}`);

      return this.formatResponse(service);
    } catch (error: any) {
      this.logger.error(`Failed to fetch service ${args.uuid}`, error);
      throw new Error(`Failed to get service: ${error.message}`);
    }
  }
}
