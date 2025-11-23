import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  resource_uuid: z.string().describe('Resource UUID (application or service)'),
  resource_type: z.enum(['application', 'service']).describe('Resource type'),
  wildcard_domain: z.string().describe('Wildcard domain (e.g., *.example.com)'),
  generate_ssl: z.boolean().optional().default(true).describe('Generate wildcard SSL certificate'),
});

const outputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  wildcard_domain: z.string(),
  ssl_certificate_id: z.string().optional(),
  dns_records: z.array(
    z.object({
      type: z.string(),
      name: z.string(),
      value: z.string(),
      ttl: z.number().optional(),
    })
  ).optional(),
});

export class AddWildcardDomainTool extends BaseTool {
  name = 'add_wildcard_domain';
  description = 'Add a wildcard domain (e.g., *.example.com) to a resource. Automatically generates wildcard SSL certificate if requested. Returns required DNS records.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const payload = {
      wildcard_domain: input.wildcard_domain,
      generate_ssl: input.generate_ssl,
    };

    const endpoint = `/${input.resource_type}s/${input.resource_uuid}/domains/wildcard`;
    const response = await this.apiPost(endpoint, payload);
    
    return this.formatResponse({
      success: true,
      message: response.data?.message || 'Wildcard domain added successfully',
      wildcard_domain: input.wildcard_domain,
      ssl_certificate_id: response.data?.ssl_certificate_id,
      dns_records: response.data?.dns_records,
    });
  }
}
