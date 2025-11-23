import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  name: z.string().describe('Metric name'),
  resource_uuid: z.string().describe('Resource to monitor'),
  resource_type: z.enum(['application', 'database', 'service']).describe('Resource type'),
  metric_type: z.enum(['gauge', 'counter', 'histogram']).describe('Metric type'),
  query: z.string().optional().describe('Custom query/expression for metric'),
  unit: z.string().optional().describe('Metric unit (e.g., "requests/sec", "ms")'),
  description: z.string().optional().describe('Metric description'),
});

const outputSchema = z.object({
  id: z.string(),
  name: z.string(),
  metric_type: z.string(),
  message: z.string(),
});

export class CreateCustomMetricTool extends BaseTool {
  name = 'create_custom_metric';
  description = 'Create a custom metric for advanced monitoring. Track application-specific metrics beyond standard CPU/memory.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const payload = {
      name: input.name,
      resource_uuid: input.resource_uuid,
      resource_type: input.resource_type,
      metric_type: input.metric_type,
      ...(input.query && { query: input.query }),
      ...(input.unit && { unit: input.unit }),
      ...(input.description && { description: input.description }),
    };

    const response = await this.apiPost('/metrics/custom', payload);
    
    return this.formatResponse(response.data);
  }
}
