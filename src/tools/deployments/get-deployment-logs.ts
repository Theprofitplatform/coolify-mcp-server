/**
 * Get Deployment Logs Tool
 * Retrieves detailed logs for a specific deployment
 * 
 * Note: Coolify API doesn't expose deployment logs via REST endpoint.
 * This tool uses a workaround by executing database queries directly.
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { execSync } from 'child_process';

const GetDeploymentLogsSchema = z.object({
  deployment_uuid: z.string()
    .regex(/^[a-zA-Z0-9\-]+$/, 'Invalid UUID format - only alphanumeric and hyphens allowed')
    .describe('UUID of the deployment to get logs for'),
  filter_errors: z.boolean().optional().describe('If true, only return error/failed log entries'),
});

export class GetDeploymentLogsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'coolify_get_deployment_logs';
  }

  get description(): string {
    return 'Get detailed logs for a specific deployment. Essential for debugging failed deployments, monitoring build process, and troubleshooting deployment issues. Returns parsed JSON logs with timestamps, commands, and output.';
  }

  get inputSchema(): z.ZodSchema {
    return GetDeploymentLogsSchema;
  }

  async execute(args: z.infer<typeof GetDeploymentLogsSchema>): Promise<string> {
    this.logger.info(`Fetching logs for deployment: ${args.deployment_uuid}`);

    try {
      // SECURITY: Sanitize UUID to prevent SQL injection
      // While Zod validates format, we escape single quotes as additional defense
      const sanitizedUuid = args.deployment_uuid.replace(/'/g, "''");

      // Validate UUID format one more time before execution
      if (!/^[a-zA-Z0-9\-]+$/.test(sanitizedUuid)) {
        throw new Error('Invalid UUID format detected');
      }

      // Query database directly for deployment logs
      // Note: Using parameterized approach via psql -v would be safer but requires different setup
      const command = `docker exec coolify-db psql -U coolify -d coolify -t -c "SELECT logs FROM application_deployment_queues WHERE deployment_uuid = '${sanitizedUuid}';"`;

      const result = execSync(command, { 
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large logs
      });

      if (!result || result.trim() === '') {
        return JSON.stringify({
          error: 'Deployment not found',
          deployment_uuid: args.deployment_uuid,
          message: 'No deployment found with this UUID. Check if the UUID is correct.',
        }, null, 2);
      }

      // Parse JSON logs
      const logs = JSON.parse(result.trim());

      if (!Array.isArray(logs)) {
        return JSON.stringify({
          error: 'Invalid log format',
          raw: result.substring(0, 500),
        }, null, 2);
      }

      // Filter logs if requested
      let filteredLogs = logs;
      if (args.filter_errors) {
        filteredLogs = logs.filter((entry: any) => {
          const output = entry.output || '';
          const type = entry.type || '';
          return (
            type.toLowerCase().includes('error') ||
            type.toLowerCase().includes('stderr') ||
            output.toLowerCase().includes('error') ||
            output.toLowerCase().includes('failed') ||
            output.toLowerCase().includes('fatal')
          );
        });
      }

      // Format for readability
      const formatted = {
        deployment_uuid: args.deployment_uuid,
        total_entries: logs.length,
        filtered_entries: filteredLogs.length,
        filter_applied: args.filter_errors || false,
        logs: filteredLogs.map((entry: any) => ({
          timestamp: entry.timestamp,
          type: entry.type,
          output: entry.output,
          command: entry.command || null,
          hidden: entry.hidden || false,
        })),
      };

      this.logger.info(`Successfully fetched ${filteredLogs.length}/${logs.length} log entries for deployment: ${args.deployment_uuid}`);

      return JSON.stringify(formatted, null, 2);
    } catch (error: any) {
      this.logger.error(`Failed to fetch logs for deployment ${args.deployment_uuid}`, error);
      
      // Provide helpful error message
      return JSON.stringify({
        error: 'Failed to get deployment logs',
        deployment_uuid: args.deployment_uuid,
        message: error.message,
        hint: 'Make sure Docker is running and you have access to the coolify-db container',
        troubleshooting: 'Try: docker exec coolify-db psql -U coolify -d coolify -c "SELECT COUNT(*) FROM application_deployment_queues;"',
      }, null, 2);
    }
  }
}
