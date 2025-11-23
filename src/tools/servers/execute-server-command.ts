/**
 * Execute Server Command Tool
 * Executes a command on a specific server via SSH
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const ExecuteServerCommandSchema = z.object({
  uuid: z.string().describe('UUID of the server'),
  command: z.string().describe('Command to execute on the server'),
  working_directory: z.string().optional().describe('Working directory for command execution'),
});

export class ExecuteServerCommandTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'execute_server_command';
  }

  get description(): string {
    return 'Execute a command on a server via SSH. CAUTION: Use with care as commands run with server privileges.';
  }

  get inputSchema(): z.ZodSchema {
    return ExecuteServerCommandSchema;
  }

  async execute(args: z.infer<typeof ExecuteServerCommandSchema>): Promise<string> {
    this.logger.info(`Executing command on server: ${args.uuid}`);
    this.logger.warn(`COMMAND EXECUTION requested for server: ${args.uuid} - Command: ${args.command}`);

    try {
      const result = await this.apiPost(`/servers/${args.uuid}/execute`, {
        command: args.command,
        working_directory: args.working_directory,
      });

      this.logger.info(`Successfully executed command on server: ${args.uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to execute command on server ${args.uuid}`, error);
      throw new Error(`Failed to execute server command: ${error.message}`);
    }
  }
}
