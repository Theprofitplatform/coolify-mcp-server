import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  resource_uuid: z.string().describe('Resource UUID'),
  resource_type: z.enum(['application', 'service', 'database']).describe('Resource type'),
  hours: z.number().optional().default(24).describe('Number of hours of history (default: 24)'),
  interval_minutes: z.number().optional().default(5).describe('Data point interval in minutes'),
});

const outputSchema = z.object({
  resource_uuid: z.string(),
  period: z.object({
    start: z.string(),
    end: z.string(),
    hours: z.number(),
  }),
  data_points: z.array(
    z.object({
      timestamp: z.string(),
      cpu_percent: z.number().optional(),
      memory_bytes: z.number().optional(),
      memory_percent: z.number().optional(),
      network_rx_bytes: z.number().optional(),
      network_tx_bytes: z.number().optional(),
      block_read_bytes: z.number().optional(),
      block_write_bytes: z.number().optional(),
    })
  ),
  summary: z.object({
    avg_cpu_percent: z.number().optional(),
    max_cpu_percent: z.number().optional(),
    avg_memory_bytes: z.number().optional(),
    max_memory_bytes: z.number().optional(),
    peak_memory_timestamp: z.string().optional(),
  }).optional(),
});

export class GetResourceUsageHistoryTool extends BaseTool {
  name = 'get_resource_usage_history';
  description = 'Get historical resource usage metrics (CPU, memory, network, disk I/O). Useful for capacity planning, performance analysis, and identifying resource-hungry applications.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const params = new URLSearchParams();
    params.append('hours', input.hours.toString());
    params.append('interval', input.interval_minutes.toString());

    const endpoint = `/${input.resource_type}s/${input.resource_uuid}/usage/history?${params.toString()}`;
    const response = await this.apiGet(endpoint);
    
    return this.formatResponse(response.data);
  }
}
