import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  name: z.string().describe('Alert rule name'),
  resource_uuid: z.string().optional().describe('Specific resource to monitor'),
  resource_type: z.enum(['application', 'database', 'service', 'server', 'all']).optional().default('all').describe('Resource type to monitor'),
  condition: z.enum(['cpu_high', 'memory_high', 'disk_high', 'deployment_failed', 'service_down', 'custom']).describe('Alert condition'),
  threshold: z.number().optional().describe('Threshold value (e.g., 90 for 90% CPU)'),
  duration_minutes: z.number().optional().default(5).describe('Condition must persist for this duration'),
  notification_channels: z.array(z.string()).describe('Notification channel UUIDs to alert'),
  enabled: z.boolean().optional().default(true).describe('Enable this alert rule'),
});

const outputSchema = z.object({
  id: z.string(),
  name: z.string(),
  condition: z.string(),
  enabled: z.boolean(),
  message: z.string(),
});

export class CreateAlertRuleTool extends BaseTool {
  name = 'create_alert_rule';
  description = 'Create a custom alert rule for proactive monitoring. Triggers notifications when conditions are met (high CPU, deployment failures, etc.).';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const payload = {
      name: input.name,
      condition: input.condition,
      resource_type: input.resource_type,
      duration_minutes: input.duration_minutes,
      notification_channels: input.notification_channels,
      enabled: input.enabled,
      ...(input.resource_uuid && { resource_uuid: input.resource_uuid }),
      ...(input.threshold !== undefined && { threshold: input.threshold }),
    };

    const response = await this.apiPost('/alerts/rules', payload);
    
    return this.formatResponse(response.data);
  }
}
