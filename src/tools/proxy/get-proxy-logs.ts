import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  server_uuid: z.string().describe('Server UUID'),
  lines: z.number().optional().default(100).describe('Number of log lines to retrieve'),
  since: z.string().optional().describe('Show logs since timestamp (e.g., "2023-01-01T00:00:00Z")'),
  type: z.enum(['access', 'error', 'all']).optional().default('all').describe('Type of logs to retrieve'),
});

const outputSchema = z.object({
  logs: z.string(),
  lines_returned: z.number(),
});

export class GetProxyLogsTool extends BaseTool {
  name = 'get_proxy_logs';
  description = 'Get proxy logs (access logs, error logs, or both). Useful for debugging routing issues and monitoring traffic.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const params = new URLSearchParams();
    
    if (input.lines) {
      params.append('lines', input.lines.toString());
    }
    
    if (input.since) {
      params.append('since', input.since);
    }
    
    if (input.type) {
      params.append('type', input.type);
    }

    const response = await this.apiGet(`/servers/${input.server_uuid}/proxy/logs?${params.toString()}`);
    
    return this.formatResponse({
      logs: response.data?.logs || response.data || '',
      lines_returned: (response.data?.logs || response.data || '').split('\n').length,
    });
  }
}
