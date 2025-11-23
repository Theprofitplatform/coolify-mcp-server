import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  enabled_only: z.boolean().optional().describe('Show only enabled rules'),
});

const outputSchema = z.object({
  alert_rules: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      condition: z.string(),
      resource_type: z.string().optional(),
      threshold: z.number().optional(),
      enabled: z.boolean(),
      triggered_count: z.number().optional(),
      last_triggered_at: z.string().optional(),
    })
  ),
});

export class ListAlertRulesTool extends BaseTool {
  name = 'list_alert_rules';
  description = 'List all alert rules. Shows conditions, thresholds, and trigger history.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    let endpoint = '/alerts/rules';
    
    if (input.enabled_only) {
      endpoint += '?enabled=true';
    }

    const response = await this.apiGet(endpoint);
    
    return this.formatResponse({
      alert_rules: Array.isArray(response.data) ? response.data : [],
    });
  }
}
