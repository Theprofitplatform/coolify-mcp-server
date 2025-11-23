/**
 * Generate SSL Certificate Tool
 * Generates a Let's Encrypt SSL certificate
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GenerateSslCertificateSchema = z.object({
  domain: z.string().describe('Domain name for the certificate'),
  email: z.string().email().describe('Email address for Let\'s Encrypt notifications'),
  resource_uuid: z.string().optional().describe('UUID of the application/service to attach certificate to'),
});

export class GenerateSslCertificateTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'generate_ssl_certificate';
  }

  get description(): string {
    return 'Generate a new Let\'s Encrypt SSL/TLS certificate for a domain. Automatically validates domain ownership and provisions the certificate.';
  }

  get inputSchema(): z.ZodSchema {
    return GenerateSslCertificateSchema;
  }

  async execute(args: z.infer<typeof GenerateSslCertificateSchema>): Promise<string> {
    this.logger.info(`Generating SSL certificate for: ${args.domain}`);

    try {
      const result = await this.apiPost('/ssl-certificates/generate', args);

      this.logger.info(`Successfully generated SSL certificate for: ${args.domain}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to generate SSL certificate for ${args.domain}`, error);
      throw new Error(`Failed to generate SSL certificate: ${error.message}`);
    }
  }
}
