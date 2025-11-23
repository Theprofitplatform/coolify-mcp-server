import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  domain: z.string().describe('Domain to verify'),
  resource_uuid: z.string().optional().describe('Resource UUID (application/service)'),
  check_dns: z.boolean().optional().default(true).describe('Check DNS records'),
  check_ssl: z.boolean().optional().default(true).describe('Check SSL certificate'),
});

const outputSchema = z.object({
  domain: z.string(),
  is_verified: z.boolean(),
  dns_status: z.object({
    is_configured: z.boolean(),
    records: z.array(
      z.object({
        type: z.string(),
        name: z.string(),
        value: z.string(),
        status: z.enum(['ok', 'missing', 'incorrect']),
      })
    ).optional(),
  }).optional(),
  ssl_status: z.object({
    is_valid: z.boolean(),
    issuer: z.string().optional(),
    expires_at: z.string().optional(),
    days_until_expiry: z.number().optional(),
  }).optional(),
  http_status: z.object({
    is_reachable: z.boolean(),
    status_code: z.number().optional(),
    response_time_ms: z.number().optional(),
  }).optional(),
  issues: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
});

export class VerifyDomainTool extends BaseTool {
  name = 'verify_domain';
  description = 'Verify domain configuration including DNS records, SSL certificate status, and HTTP connectivity. Returns detailed verification results and recommendations.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const payload: any = {
      domain: input.domain,
      check_dns: input.check_dns,
      check_ssl: input.check_ssl,
    };

    if (input.resource_uuid) {
      payload.resource_uuid = input.resource_uuid;
    }

    const response = await this.apiPost('/domains/verify', payload);
    
    return this.formatResponse(response.data);
  }
}
