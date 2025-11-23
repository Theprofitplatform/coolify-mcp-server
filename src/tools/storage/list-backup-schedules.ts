import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  database_uuid: z.string().optional().describe('Filter by database'),
});

const outputSchema = z.object({
  schedules: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      database_uuid: z.string(),
      database_name: z.string().optional(),
      frequency: z.string(),
      retention_days: z.number(),
      enabled: z.boolean(),
      last_run: z.string().optional(),
      next_run: z.string().optional(),
      backup_count: z.number().optional(),
    })
  ),
});

export class ListBackupSchedulesTool extends BaseTool {
  name = 'list_backup_schedules';
  description = 'List all backup schedules. Shows frequency, next run time, and backup counts.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    let endpoint = '/backups/schedules';
    
    if (input.database_uuid) {
      endpoint += `?database_uuid=${input.database_uuid}`;
    }

    const response = await this.apiGet(endpoint);
    
    return this.formatResponse({
      schedules: Array.isArray(response.data) ? response.data : [],
    });
  }
}
