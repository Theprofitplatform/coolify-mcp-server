import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  schedule_id: z.string().optional().describe('Specific schedule ID'),
  database_uuid: z.string().optional().describe('Update all schedules for this database'),
  retention_days: z.number().describe('New retention period in days'),
  apply_to_existing: z.boolean().optional().default(false).describe('Apply to existing backups'),
});

const outputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  schedules_updated: z.number(),
  backups_affected: z.number().optional(),
});

export class UpdateBackupRetentionTool extends BaseTool {
  name = 'update_backup_retention';
  description = 'Update backup retention policy. Can update single schedule or all schedules for a database. Optionally apply to existing backups.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const payload = {
      retention_days: input.retention_days,
      apply_to_existing: input.apply_to_existing,
      ...(input.schedule_id && { schedule_id: input.schedule_id }),
      ...(input.database_uuid && { database_uuid: input.database_uuid }),
    };

    const response = await this.apiPatch('/backups/retention', payload);
    
    return this.formatResponse({
      success: true,
      message: response.data?.message || 'Backup retention updated successfully',
      schedules_updated: response.data?.schedules_updated || 1,
      backups_affected: response.data?.backups_affected,
    });
  }
}
