import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  domains: z.array(
    z.object({
      domain: z.string().describe('Domain name to generate SSL certificate for'),
      email: z.string().email().describe('Email address for Let\'s Encrypt notifications'),
    })
  ).describe('Array of domains to generate SSL certificates for'),
});

const outputSchema = z.object({
  results: z.array(
    z.object({
      domain: z.string(),
      certificate_uuid: z.string().optional(),
      status: z.enum(['success', 'failed']),
      message: z.string().optional(),
      error: z.string().optional(),
      expires_at: z.string().optional(),
    })
  ),
  summary: z.object({
    total: z.number(),
    succeeded: z.number(),
    failed: z.number(),
  }),
});

export class BatchCreateSslCertificatesTool extends BaseTool {
  name = 'batch_create_ssl_certificates';
  description = 'Generate SSL certificates for multiple domains at once using Let\'s Encrypt. This is much faster than generating certificates individually. Returns status for each certificate generation.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const results = [];
    let succeeded = 0;
    let failed = 0;

    // Generate all certificates in parallel
    const certPromises = input.domains.map(async ({ domain, email }) => {
      try {
        const response = await this.apiPost('/ssl-certificates', {
          domain,
          email,
        });
        
        succeeded++;
        return {
          domain,
          certificate_uuid: response.data?.uuid,
          status: 'success' as const,
          message: response.data?.message || 'SSL certificate generated successfully',
          expires_at: response.data?.expires_at,
        };
      } catch (error: any) {
        failed++;
        return {
          domain,
          status: 'failed' as const,
          error: error.response?.data?.message || error.message || 'Unknown error',
        };
      }
    });

    const certResults = await Promise.all(certPromises);
    results.push(...certResults);

    const response = {
      results,
      summary: {
        total: input.domains.length,
        succeeded,
        failed,
      },
    };

    return this.formatResponse(response);
  }
}
