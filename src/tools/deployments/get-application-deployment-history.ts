/**
 * Get Application Deployment History Tool
 * Retrieves recent deployment attempts for an application
 * 
 * Note: Uses database queries since Coolify API doesn't expose this endpoint.
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { execSync } from 'child_process';

const GetApplicationDeploymentHistorySchema = z.object({
  application_uuid: z.string()
    .regex(/^[a-zA-Z0-9\-]+$/, 'Invalid UUID format - only alphanumeric and hyphens allowed')
    .describe('UUID of the application'),
  limit: z.number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .default(10)
    .describe('Number of recent deployments to retrieve (default: 10, max: 50)'),
});

export class GetApplicationDeploymentHistoryTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'coolify_get_application_deployment_history';
  }

  get description(): string {
    return 'Get recent deployment history for an application including status, timestamps, and deployment UUIDs. Essential for tracking deployment attempts and debugging patterns.';
  }

  get inputSchema(): z.ZodSchema {
    return GetApplicationDeploymentHistorySchema;
  }

  async execute(args: z.infer<typeof GetApplicationDeploymentHistorySchema>): Promise<string> {
    this.logger.info(`Fetching deployment history for application: ${args.application_uuid}`);

    try {
      // SECURITY: Sanitize all inputs to prevent SQL injection
      const sanitizedUuid = args.application_uuid.replace(/'/g, "''");
      const limit = Math.min(args.limit || 10, 50); // Already validated by Zod but double-check

      // Validate inputs before execution
      if (!/^[a-zA-Z0-9\-]+$/.test(sanitizedUuid)) {
        throw new Error('Invalid UUID format detected');
      }
      if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
        throw new Error('Invalid limit value');
      }

      // First check if application exists
      const appCheckCommand = `docker exec coolify-db psql -U coolify -d coolify -t -c "SELECT id FROM applications WHERE uuid = '${sanitizedUuid}';"`;
      const appId = execSync(appCheckCommand, { encoding: 'utf-8' }).trim();

      if (!appId) {
        return JSON.stringify({
          error: 'Application not found',
          application_uuid: args.application_uuid,
          message: 'No application found with this UUID',
        }, null, 2);
      }

      // SECURITY: Sanitize appId as well (defensive programming)
      const sanitizedAppId = appId.replace(/'/g, "''");

      // Query deployment history using both UUID and ID
      // Note: application_id in deployment queue is VARCHAR and stores UUIDs, not integer IDs
      const command = `docker exec coolify-db psql -U coolify -d coolify -t -A -F'|' -c "SELECT deployment_uuid, status, created_at, updated_at, finished_at, application_id FROM application_deployment_queues WHERE application_id = '${sanitizedUuid}' OR application_id = '${sanitizedAppId}' ORDER BY created_at DESC LIMIT ${limit};"`;

      const result = execSync(command, { encoding: 'utf-8' });

      if (!result || result.trim() === '') {
        return JSON.stringify({
          application_uuid: args.application_uuid,
          application_id: appId,
          deployments: [],
          message: 'No deployments found for this application',
        }, null, 2);
      }

      // Parse results
      const lines = result.trim().split('\n');
      const deployments = lines.map((line: string) => {
        const [deployment_uuid, status, created_at, updated_at, finished_at, application_id] = line.split('|');
        
        // Calculate duration if finished
        let duration = null;
        if (created_at && finished_at) {
          const start = new Date(created_at);
          const end = new Date(finished_at);
          duration = Math.round((end.getTime() - start.getTime()) / 1000); // seconds
        }

        return {
          deployment_uuid,
          status,
          created_at,
          updated_at,
          finished_at: finished_at || null,
          duration_seconds: duration,
        };
      });

      // Calculate statistics
      const stats = {
        total: deployments.length,
        finished: deployments.filter((d: any) => d.status === 'finished').length,
        failed: deployments.filter((d: any) => d.status === 'failed').length,
        in_progress: deployments.filter((d: any) => d.status === 'in_progress').length,
        queued: deployments.filter((d: any) => d.status === 'queued').length,
      };

      const response = {
        application_uuid: args.application_uuid,
        application_id: appId,
        stats,
        deployments,
        tip: 'Use coolify_get_deployment_logs with a deployment_uuid to see detailed logs',
      };

      this.logger.info(`Successfully fetched ${deployments.length} deployment records for application: ${args.application_uuid}`);

      return JSON.stringify(response, null, 2);
    } catch (error: any) {
      this.logger.error(`Failed to fetch deployment history for application ${args.application_uuid}`, error);
      
      return JSON.stringify({
        error: 'Failed to get deployment history',
        application_uuid: args.application_uuid,
        message: error.message,
        hint: 'Make sure Docker is running and you have access to the coolify-db container',
      }, null, 2);
    }
  }
}
