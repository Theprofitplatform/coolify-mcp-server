import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  domain: z.string().describe('Domain name'),
  resource_uuid: z.string().optional().describe('Resource UUID for context-specific records'),
});

const outputSchema = z.object({
  domain: z.string(),
  required_records: z.array(
    z.object({
      type: z.string().describe('DNS record type (A, AAAA, CNAME, TXT)'),
      name: z.string().describe('Record name'),
      value: z.string().describe('Record value'),
      ttl: z.number().optional().describe('Time to live'),
      priority: z.number().optional().describe('Priority (for MX records)'),
      description: z.string().optional().describe('What this record is for'),
    })
  ),
  current_records: z.array(
    z.object({
      type: z.string(),
      name: z.string(),
      value: z.string(),
      is_correct: z.boolean().optional(),
    })
  ).optional(),
  instructions: z.string().optional(),
});

export class GetDomainDnsRecordsTool extends BaseTool {
  name = 'get_domain_dns_records';
  description = 'Get required DNS records for a domain to work with Coolify. Returns A/AAAA records for the server IP and any additional records needed for SSL verification.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    let endpoint = `/domains/${input.domain}/dns-records`;
    
    if (input.resource_uuid) {
      endpoint += `?resource_uuid=${input.resource_uuid}`;
    }

    const response = await this.apiGet(endpoint);
    
    return this.formatResponse(response.data);
  }
}
