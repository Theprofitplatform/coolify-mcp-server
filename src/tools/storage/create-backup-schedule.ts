import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  name: z.string().describe('Schedule name'),
  database_uuid: z.string().describe('Database UUID'),
  frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly']).describe('Backup frequency'),
  time: z.string().optional().describe('Time to run (HH:MM format, for daily/weekly/monthly)'),
  day_of_week: z.number().optional().describe('Day of week (0-6, Sunday=0) for weekly backups'),
  day_of_month: z.number().optional().describe('Day of month (1-31) for monthly backups'),
  retention_days: z.number().optional().default(30).describe('Days to keep backups'),
  enabled: z.boolean().optional().default(true).describe('Enable this schedule'),
});

const outputSchema = z.object({
  id: z.string(),
  name: z.string(),
  frequency: z.string(),
  next_run: z.string().optional(),
  message: z.string(),
});

export class CreateBackupScheduleTool extends BaseTool {
  name = 'create_backup_schedule';
  description = 'Create automated backup schedule for a database. Supports hourly, daily, weekly, and monthly backups with configurable retention.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const payload = {
      name: input.name,
      database_uuid: input.database_uuid,
      frequency: input.frequency,
      retention_days: input.retention_days,
      enabled: input.enabled,
      ...(input.time && { time: input.time }),
      ...(input.day_of_week !== undefined && { day_of_week: input.day_of_week }),
      ...(input.day_of_month !== undefined && { day_of_month: input.day_of_month }),
    };

    const response = await this.apiPost('/backups/schedules', payload);
    
    return this.formatResponse(response.data);
  }
}
