import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  resource_uuid: z.string().describe('Resource UUID'),
  resource_type: z.enum(['application', 'service', 'database']).describe('Resource type'),
  storage_quota_gb: z.number().optional().describe('Storage quota in GB'),
  bandwidth_limit_mbps: z.number().optional().describe('Bandwidth limit in Mbps'),
  backup_retention_days: z.number().optional().describe('Backup retention period'),
  max_deployments_per_day: z.number().optional().describe('Max deployments per day'),
});

const outputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  resource_uuid: z.string(),
  quotas: z.object({
    storage_quota_gb: z.number().optional(),
    bandwidth_limit_mbps: z.number().optional(),
    backup_retention_days: z.number().optional(),
    max_deployments_per_day: z.number().optional(),
  }),
});

export class SetResourceQuotasTool extends BaseTool {
  name = 'set_resource_quotas';
  description = 'Set storage, bandwidth, and other quotas for a resource. Helps control costs and prevent resource abuse. Useful for multi-tenant environments.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const payload: any = {};

    if (input.storage_quota_gb !== undefined) {
      payload.storage_quota_gb = input.storage_quota_gb;
    }

    if (input.bandwidth_limit_mbps !== undefined) {
      payload.bandwidth_limit_mbps = input.bandwidth_limit_mbps;
    }

    if (input.backup_retention_days !== undefined) {
      payload.backup_retention_days = input.backup_retention_days;
    }

    if (input.max_deployments_per_day !== undefined) {
      payload.max_deployments_per_day = input.max_deployments_per_day;
    }

    const endpoint = `/${input.resource_type}s/${input.resource_uuid}/quotas`;
    const response = await this.apiPatch(endpoint, payload);
    
    return this.formatResponse({
      success: true,
      message: response.data?.message || 'Resource quotas set successfully',
      resource_uuid: input.resource_uuid,
      quotas: {
        storage_quota_gb: input.storage_quota_gb,
        bandwidth_limit_mbps: input.bandwidth_limit_mbps,
        backup_retention_days: input.backup_retention_days,
        max_deployments_per_day: input.max_deployments_per_day,
      },
    });
  }
}
