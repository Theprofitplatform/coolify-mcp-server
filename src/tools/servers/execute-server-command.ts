/**
 * Execute Server Command Tool
 * Executes a command on a specific server via SSH
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

// Whitelist of safe commands that can be executed
const SAFE_COMMANDS = [
  'ls', 'pwd', 'whoami', 'date', 'uptime', 'hostname',
  'df', 'free', 'ps', 'top', 'htop',
  'docker ps', 'docker stats', 'docker images', 'docker version',
  'systemctl status', 'systemctl list-units',
  'nginx -t', 'nginx -v',
  'cat', 'head', 'tail', 'grep', 'find', 'which',
];

const ExecuteServerCommandSchema = z.object({
  uuid: z.string()
    .regex(/^[a-zA-Z0-9\-]+$/, 'Invalid UUID format')
    .describe('UUID of the server'),
  command: z.string()
    .min(1, 'Command cannot be empty')
    .max(500, 'Command too long (max 500 characters)')
    .describe('Command to execute on the server. WARNING: Only safe commands are allowed.'),
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
    return '⚠️ DANGER: Execute a command on a server via SSH. Commands run with server privileges and are STRICTLY VALIDATED for safety. Dangerous commands, shell metacharacters, and command injection attempts will be blocked.';
  }

  get inputSchema(): z.ZodSchema {
    return ExecuteServerCommandSchema;
  }

  async execute(args: z.infer<typeof ExecuteServerCommandSchema>): Promise<string> {
    this.logger.info(`Executing command on server: ${args.uuid}`);
    this.logger.warn(`⚠️ COMMAND EXECUTION requested for server: ${args.uuid} - Command: ${args.command}`);

    try {
      // SECURITY: Validate command for safety
      this.validateCommandSafety(args.command);

      const result = await this.apiPost(`/servers/${args.uuid}/execute`, {
        command: args.command,
        working_directory: args.working_directory,
      });

      this.logger.info(`✓ Successfully executed command on server: ${args.uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`✗ Failed to execute command on server ${args.uuid}`, error);
      throw new Error(`Failed to execute server command: ${error.message}`);
    }
  }

  /**
   * Validate command for safety to prevent command injection
   */
  private validateCommandSafety(command: string): void {
    // Check for dangerous shell metacharacters
    const dangerousChars = /[;&|`$(){}[\]<>]/;
    if (dangerousChars.test(command)) {
      throw new Error(
        '⛔ Security Error: Command contains dangerous shell metacharacters (;&|`$(){}[]<>). ' +
        'These characters are blocked to prevent command injection attacks.'
      );
    }

    // Check for path traversal attempts
    if (command.includes('..')) {
      throw new Error('⛔ Security Error: Path traversal detected (..)');
    }

    // Check for obviously dangerous commands
    const dangerousCommands = [
      'rm', 'rmdir', 'dd', 'mkfs', 'fdisk',
      'shutdown', 'reboot', 'halt', 'poweroff',
      'kill', 'killall', 'pkill',
      'chmod', 'chown', 'chgrp',
      'useradd', 'userdel', 'passwd',
      'curl', 'wget', 'nc', 'netcat', // Prevent data exfiltration
      'bash', 'sh', 'zsh', 'fish', 'ksh', // Prevent shell spawning
      'eval', 'exec', 'source',
    ];

    const cmdLower = command.toLowerCase().trim();
    const firstWord = cmdLower.split(/\s+/)[0];

    if (dangerousCommands.includes(firstWord)) {
      throw new Error(
        `⛔ Security Error: The command '${firstWord}' is blocked for safety. ` +
        'Only safe read-only commands are allowed (ls, ps, df, docker ps, etc.)'
      );
    }

    // Warn about potentially unsafe commands
    const warningCommands = ['cat', 'head', 'tail', 'grep', 'find'];
    if (warningCommands.includes(firstWord)) {
      this.logger.warn(`⚠️ Executing potentially sensitive command: ${firstWord}`);
    }

    this.logger.debug(`✓ Command safety validation passed: ${command}`);
  }
}
