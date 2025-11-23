import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  resource_uuid: z.string().describe('Resource UUID (application, service, or database)'),
  resource_type: z.enum(['application', 'service', 'database']).describe('Resource type'),
});

const outputSchema = z.object({
  resource_uuid: z.string(),
  resource_type: z.string(),
  limits: z.object({
    cpu_limit: z.string().optional().describe('CPU limit (e.g., "1.5" for 1.5 cores)'),
    memory_limit: z.string().optional().describe('Memory limit (e.g., "512M", "2G")'),
    memory_reservation: z.string().optional().describe('Memory reservation/request'),
    pids_limit: z.number().optional().describe('Process limit'),
  }),
  current_usage: z.object({
    cpu_percent: z.number().optional(),
    memory_bytes: z.number().optional(),
    memory_percent: z.number().optional(),
  }).optional(),
});

export class GetResourceLimitsTool extends BaseTool {
  name = 'get_resource_limits';
  description = 'Get CPU and memory limits for a resource. Returns configured limits and current usage if available.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const endpoint = `/${input.resource_type}s/${input.resource_uuid}/limits`;
    const response = await this.apiGet(endpoint);
    
    return this.formatResponse(response.data);
  }
}
