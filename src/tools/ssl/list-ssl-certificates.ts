/**
 * List SSL Certificates Tool
 * Retrieves all SSL/TLS certificates
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const ListSslCertificatesSchema = z.object({});

export class ListSslCertificatesTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'list_ssl_certificates';
  }

  get description(): string {
    return 'List all SSL/TLS certificates including Let\'s Encrypt certificates, expiration dates, and associated domains.';
  }

  get inputSchema(): z.ZodSchema {
    return ListSslCertificatesSchema;
  }

  async execute(args: z.infer<typeof ListSslCertificatesSchema>): Promise<string> {
    this.logger.info('Fetching SSL certificates');

    try {
      const certificates = await this.apiGet('/ssl-certificates');

      this.logger.info('Successfully fetched SSL certificates');

      return this.formatResponse(certificates);
    } catch (error: any) {
      this.logger.error('Failed to fetch SSL certificates', error);
      throw new Error(`Failed to list SSL certificates: ${error.message}`);
    }
  }
}
