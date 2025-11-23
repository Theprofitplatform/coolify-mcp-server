/**
 * Update Application Domains Tool
 * Updates domain configuration for an application
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const UpdateApplicationDomainsSchema = z.object({
  uuid: z.string().describe('UUID of the application'),
  domains: z.array(z.string()).describe('Array of domain names'),
});

export class UpdateApplicationDomainsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'update_application_domains';
  }

  get description(): string {
    return 'Update domain configuration for an application. Add custom domains, configure SSL/TLS, and manage routing.';
  }

  get inputSchema(): z.ZodSchema {
    return UpdateApplicationDomainsSchema;
  }

  async execute(args: z.infer<typeof UpdateApplicationDomainsSchema>): Promise<string> {
    this.logger.info(`Updating domains for application: ${args.uuid}`);

    try {
      const result = await this.apiPatch(`/applications/${args.uuid}/domains`, {
        domains: args.domains,
      });

      this.logger.info(`Successfully updated domains for application: ${args.uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to update domains for application ${args.uuid}`, error);
      throw new Error(`Failed to update application domains: ${error.message}`);
    }
  }
}
