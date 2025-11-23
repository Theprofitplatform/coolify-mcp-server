import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  database_uuids: z.array(z.string()).describe('Array of database UUIDs to backup'),
  destination: z.enum(['s3', 'local']).optional().describe('Backup destination (s3 or local)'),
});

const outputSchema = z.object({
  results: z.array(
    z.object({
      database_uuid: z.string(),
      backup_uuid: z.string().optional(),
      status: z.enum(['success', 'failed']),
      message: z.string().optional(),
      error: z.string().optional(),
    })
  ),
  summary: z.object({
    total: z.number(),
    succeeded: z.number(),
    failed: z.number(),
  }),
});

export class BatchBackupDatabasesTool extends BaseTool {
  name = 'batch_backup_databases';
  description = 'Backup multiple databases at once. This is much faster than backing up databases individually. Returns status for each backup operation.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const results = [];
    let succeeded = 0;
    let failed = 0;

    // Backup all databases in parallel
    const backupPromises = input.database_uuids.map(async (uuid) => {
      try {
        const params: Record<string, string> = {};
        
        if (input.destination) {
          params.destination = input.destination;
        }

        const response = await this.apiPost(`/databases/${uuid}/backup`, params);
        
        succeeded++;
        return {
          database_uuid: uuid,
          backup_uuid: response.data?.uuid || response.data?.backup_uuid,
          status: 'success' as const,
          message: response.data?.message || 'Backup started successfully',
        };
      } catch (error: any) {
        failed++;
        return {
          database_uuid: uuid,
          status: 'failed' as const,
          error: error.response?.data?.message || error.message || 'Unknown error',
        };
      }
    });

    const backupResults = await Promise.all(backupPromises);
    results.push(...backupResults);

    const response = {
      results,
      summary: {
        total: input.database_uuids.length,
        succeeded,
        failed,
      },
    };

    return this.formatResponse(response);
  }
}
