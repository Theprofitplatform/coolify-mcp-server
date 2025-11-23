import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  resource_uuid: z.string().optional().describe('Filter by resource'),
});

const outputSchema = z.object({
  metrics: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      metric_type: z.string(),
      resource_uuid: z.string(),
      unit: z.string().optional(),
      current_value: z.number().optional(),
      last_updated: z.string().optional(),
    })
  ),
});

export class ListCustomMetricsTool extends BaseTool {
  name = 'list_custom_metrics';
  description = 'List all custom metrics. Shows current values and last update times.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    let endpoint = '/metrics/custom';
    
    if (input.resource_uuid) {
      endpoint += `?resource_uuid=${input.resource_uuid}`;
    }

    const response = await this.apiGet(endpoint);
    
    return this.formatResponse({
      metrics: Array.isArray(response.data) ? response.data : [],
    });
  }
}
