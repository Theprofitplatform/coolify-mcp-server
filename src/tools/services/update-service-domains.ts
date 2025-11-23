/**
 * Update Service Domains Tool
 * Updates domain configuration for a service
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const UpdateServiceDomainsSchema = z.object({
  uuid: z.string().describe('UUID of the service'),
  domains: z.array(z.string()).describe('Array of domain names'),
});

export class UpdateServiceDomainsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'update_service_domains';
  }

  get description(): string {
    return 'Update domain configuration for a service. Add custom domains, configure SSL/TLS, and manage routing.';
  }

  get inputSchema(): z.ZodSchema {
    return UpdateServiceDomainsSchema;
  }

  async execute(args: z.infer<typeof UpdateServiceDomainsSchema>): Promise<string> {
    this.logger.info(`Updating domains for service: ${args.uuid}`);

    try {
      const result = await this.apiPatch(`/services/${args.uuid}/domains`, {
        domains: args.domains,
      });

      this.logger.info(`Successfully updated domains for service: ${args.uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to update domains for service ${args.uuid}`, error);
      throw new Error(`Failed to update service domains: ${error.message}`);
    }
  }
}
