import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  status: z.enum(['open', 'resolved', 'acknowledged', 'all']).optional().default('all').describe('Filter by status'),
  severity: z.enum(['critical', 'warning', 'info', 'all']).optional().default('all').describe('Filter by severity'),
  since: z.string().optional().describe('Start date (ISO format)'),
  limit: z.number().optional().default(50).describe('Number of incidents to return'),
});

const outputSchema = z.object({
  incidents: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      severity: z.string(),
      status: z.string(),
      resource_type: z.string().optional(),
      resource_uuid: z.string().optional(),
      started_at: z.string(),
      resolved_at: z.string().optional(),
      duration_minutes: z.number().optional(),
      alert_rule_id: z.string().optional(),
      notifications_sent: z.number().optional(),
    })
  ),
  total_count: z.number(),
});

export class GetIncidentHistoryTool extends BaseTool {
  name = 'get_incident_history';
  description = 'Get incident history including alerts, outages, and other issues. Essential for postmortems and understanding system reliability.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const params = new URLSearchParams();
    
    if (input.status && input.status !== 'all') {
      params.append('status', input.status);
    }
    
    if (input.severity && input.severity !== 'all') {
      params.append('severity', input.severity);
    }
    
    if (input.since) {
      params.append('since', input.since);
    }
    
    params.append('limit', input.limit.toString());

    const response = await this.apiGet(`/incidents?${params.toString()}`);
    
    return this.formatResponse({
      incidents: Array.isArray(response.data) ? response.data : (response.data?.incidents || []),
      total_count: response.data?.total || (Array.isArray(response.data) ? response.data.length : 0),
    });
  }
}
