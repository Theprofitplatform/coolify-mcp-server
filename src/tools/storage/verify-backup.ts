import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  backup_id: z.string().describe('Backup ID to verify'),
  database_uuid: z.string().describe('Database UUID'),
  perform_restore_test: z.boolean().optional().default(false).describe('Test backup by attempting restore to temporary database'),
});

const outputSchema = z.object({
  backup_id: z.string(),
  is_valid: z.boolean(),
  size_bytes: z.number().optional(),
  checksum: z.string().optional(),
  checksum_verified: z.boolean().optional(),
  restore_test_passed: z.boolean().optional(),
  issues: z.array(z.string()).optional(),
  message: z.string(),
});

export class VerifyBackupTool extends BaseTool {
  name = 'verify_backup';
  description = 'Verify backup integrity and restorability. Can perform checksum validation and optional restore test. Essential for disaster recovery confidence.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const payload = {
      perform_restore_test: input.perform_restore_test,
    };

    const response = await this.apiPost(`/databases/${input.database_uuid}/backups/${input.backup_id}/verify`, payload);
    
    return this.formatResponse(response.data);
  }
}
