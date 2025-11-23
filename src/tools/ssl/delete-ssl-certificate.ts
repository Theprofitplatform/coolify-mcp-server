/**
 * Delete SSL Certificate Tool
 * Deletes an SSL certificate
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const DeleteSslCertificateSchema = z.object({
  uuid: z.string().describe('UUID of the certificate to delete'),
});

export class DeleteSslCertificateTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'delete_ssl_certificate';
  }

  get description(): string {
    return 'Delete an SSL/TLS certificate. CAUTION: This will remove the certificate and may cause SSL errors for the associated domain.';
  }

  get inputSchema(): z.ZodSchema {
    return DeleteSslCertificateSchema;
  }

  async execute(args: z.infer<typeof DeleteSslCertificateSchema>): Promise<string> {
    this.logger.info(`Deleting SSL certificate: ${args.uuid}`);
    this.logger.warn(`DELETE operation requested for SSL certificate: ${args.uuid}`);

    try {
      const result = await this.apiDelete(`/ssl-certificates/${args.uuid}`);

      this.logger.info(`Successfully deleted SSL certificate: ${args.uuid}`);

      return this.formatResponse({
        message: 'SSL certificate deleted successfully',
        uuid: args.uuid,
        ...result
      });
    } catch (error: any) {
      this.logger.error(`Failed to delete SSL certificate ${args.uuid}`, error);
      throw new Error(`Failed to delete SSL certificate: ${error.message}`);
    }
  }
}
