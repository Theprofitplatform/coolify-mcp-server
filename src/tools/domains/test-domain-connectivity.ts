import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  domain: z.string().describe('Domain to test'),
  port: z.number().optional().describe('Port to test (default: 443 for HTTPS, 80 for HTTP)'),
  protocol: z.enum(['http', 'https', 'tcp']).optional().default('https').describe('Protocol to test'),
  timeout_seconds: z.number().optional().default(10).describe('Timeout in seconds'),
});

const outputSchema = z.object({
  domain: z.string(),
  is_reachable: z.boolean(),
  protocol: z.string(),
  port: z.number(),
  status_code: z.number().optional().describe('HTTP status code if applicable'),
  response_time_ms: z.number().optional(),
  ip_address: z.string().optional(),
  ssl_info: z.object({
    is_valid: z.boolean(),
    issuer: z.string().optional(),
    expires_at: z.string().optional(),
    days_until_expiry: z.number().optional(),
  }).optional(),
  error: z.string().optional(),
  message: z.string(),
});

export class TestDomainConnectivityTool extends BaseTool {
  name = 'test_domain_connectivity';
  description = 'Test domain connectivity and reachability. Checks if domain resolves, is reachable on specified port, and validates SSL if using HTTPS. Useful for debugging domain issues.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const payload = {
      domain: input.domain,
      protocol: input.protocol,
      timeout_seconds: input.timeout_seconds,
    };

    if (input.port) {
      (payload as any).port = input.port;
    }

    const response = await this.apiPost('/domains/test-connectivity', payload);
    
    return this.formatResponse(response.data);
  }
}
