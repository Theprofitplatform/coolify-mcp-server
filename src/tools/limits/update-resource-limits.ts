import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  resource_uuid: z.string().describe('Resource UUID (application, service, or database)'),
  resource_type: z.enum(['application', 'service', 'database']).describe('Resource type'),
  cpu_limit: z.string().optional().describe('CPU limit (e.g., "0.5", "1", "2.5")'),
  memory_limit: z.string().optional().describe('Memory limit (e.g., "256M", "512M", "1G", "2G")'),
  memory_reservation: z.string().optional().describe('Memory reservation (soft limit)'),
  pids_limit: z.number().optional().describe('Max number of processes'),
  restart_after_update: z.boolean().optional().default(false).describe('Restart resource to apply limits'),
});

const outputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  resource_uuid: z.string(),
  updated_limits: z.object({
    cpu_limit: z.string().optional(),
    memory_limit: z.string().optional(),
    memory_reservation: z.string().optional(),
    pids_limit: z.number().optional(),
  }),
  restart_required: z.boolean().optional(),
});

export class UpdateResourceLimitsTool extends BaseTool {
  name = 'update_resource_limits';
  description = 'Set CPU and memory limits for a resource. Helps prevent resource exhaustion and ensures fair resource allocation. Restart may be required to apply changes.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const payload: any = {};

    if (input.cpu_limit) {
      payload.cpu_limit = input.cpu_limit;
    }

    if (input.memory_limit) {
      payload.memory_limit = input.memory_limit;
    }

    if (input.memory_reservation) {
      payload.memory_reservation = input.memory_reservation;
    }

    if (input.pids_limit) {
      payload.pids_limit = input.pids_limit;
    }

    if (input.restart_after_update) {
      payload.restart_after_update = input.restart_after_update;
    }

    const endpoint = `/${input.resource_type}s/${input.resource_uuid}/limits`;
    const response = await this.apiPatch(endpoint, payload);
    
    return this.formatResponse({
      success: true,
      message: response.data?.message || 'Resource limits updated successfully',
      resource_uuid: input.resource_uuid,
      updated_limits: {
        cpu_limit: input.cpu_limit,
        memory_limit: input.memory_limit,
        memory_reservation: input.memory_reservation,
        pids_limit: input.pids_limit,
      },
      restart_required: response.data?.restart_required,
    });
  }
}
