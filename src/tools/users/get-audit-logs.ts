import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  user_id: z.string().optional().describe('Filter by user ID'),
  resource_type: z.enum(['application', 'database', 'service', 'server', 'team', 'user', 'all']).optional().default('all').describe('Filter by resource type'),
  action: z.string().optional().describe('Filter by action (create, update, delete, deploy, etc.)'),
  since: z.string().optional().describe('Start date (ISO format)'),
  limit: z.number().optional().default(100).describe('Number of entries to return'),
});

const outputSchema = z.object({
  audit_logs: z.array(
    z.object({
      id: z.string(),
      user_id: z.string(),
      user_email: z.string().optional(),
      action: z.string(),
      resource_type: z.string(),
      resource_id: z.string().optional(),
      resource_name: z.string().optional(),
      details: z.any().optional(),
      ip_address: z.string().optional(),
      user_agent: z.string().optional(),
      timestamp: z.string(),
    })
  ),
  total_count: z.number(),
});

export class GetAuditLogsTool extends BaseTool {
  name = 'get_audit_logs';
  description = 'Get audit logs showing user actions and system changes. Essential for security compliance, troubleshooting, and understanding who did what and when.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const params = new URLSearchParams();
    
    if (input.user_id) {
      params.append('user_id', input.user_id);
    }
    
    if (input.resource_type && input.resource_type !== 'all') {
      params.append('resource_type', input.resource_type);
    }
    
    if (input.action) {
      params.append('action', input.action);
    }
    
    if (input.since) {
      params.append('since', input.since);
    }
    
    params.append('limit', input.limit.toString());

    const response = await this.apiGet(`/audit-logs?${params.toString()}`);
    
    return this.formatResponse({
      audit_logs: Array.isArray(response.data) ? response.data : (response.data?.logs || []),
      total_count: response.data?.total || (Array.isArray(response.data) ? response.data.length : 0),
    });
  }
}
