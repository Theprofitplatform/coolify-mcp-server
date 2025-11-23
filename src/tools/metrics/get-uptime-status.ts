import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  resource_uuid: z.string().describe('Resource UUID'),
  resource_type: z.enum(['application', 'service']).describe('Resource type'),
  days: z.number().optional().default(30).describe('Number of days of history'),
});

const outputSchema = z.object({
  resource_uuid: z.string(),
  current_status: z.enum(['up', 'down', 'degraded']),
  uptime_percent: z.number(),
  total_downtime_minutes: z.number(),
  incidents: z.array(
    z.object({
      start_time: z.string(),
      end_time: z.string().optional(),
      duration_minutes: z.number().optional(),
      reason: z.string().optional(),
    })
  ),
  availability_by_day: z.array(
    z.object({
      date: z.string(),
      uptime_percent: z.number(),
    })
  ).optional(),
});

export class GetUptimeStatusTool extends BaseTool {
  name = 'get_uptime_status';
  description = 'Get uptime monitoring status and history. Shows current status, uptime percentage, incidents, and daily availability.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const params = new URLSearchParams();
    params.append('days', input.days.toString());

    const endpoint = `/${input.resource_type}s/${input.resource_uuid}/uptime?${params.toString()}`;
    const response = await this.apiGet(endpoint);
    
    return this.formatResponse(response.data);
  }
}
