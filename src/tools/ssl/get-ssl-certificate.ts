/**
 * Get SSL Certificate Tool
 * Retrieves details of a specific SSL certificate
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GetSslCertificateSchema = z.object({
  uuid: z.string().optional().describe('UUID of the certificate'),
  domain: z.string().optional().describe('Domain name of the certificate'),
});

export class GetSslCertificateTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_ssl_certificate';
  }

  get description(): string {
    return 'Get details of a specific SSL/TLS certificate including expiration, issuer, and status.';
  }

  get inputSchema(): z.ZodSchema {
    return GetSslCertificateSchema;
  }

  async execute(args: z.infer<typeof GetSslCertificateSchema>): Promise<string> {
    this.logger.info(`Fetching SSL certificate: ${args.uuid || args.domain}`);

    try {
      const identifier = args.uuid || args.domain;
      if (!identifier) {
        throw new Error('Either uuid or domain must be provided');
      }

      const certificate = await this.apiGet(`/ssl-certificates/${identifier}`);

      this.logger.info(`Successfully fetched SSL certificate: ${identifier}`);

      return this.formatResponse(certificate);
    } catch (error: any) {
      this.logger.error('Failed to fetch SSL certificate', error);
      throw new Error(`Failed to get SSL certificate: ${error.message}`);
    }
  }
}
