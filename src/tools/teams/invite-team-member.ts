/**
 * Invite Team Member Tool
 * Invites a new member to a team
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const InviteTeamMemberSchema = z.object({
  id: z.string().describe('Team ID'),
  email: z.string().email().describe('Email address of the user to invite'),
  role: z.enum(['owner', 'admin', 'member', 'viewer']).optional().describe('Role for the new member'),
});

export class InviteTeamMemberTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'invite_team_member';
  }

  get description(): string {
    return 'Invite a new member to a team via email. The user will receive an invitation email with instructions.';
  }

  get inputSchema(): z.ZodSchema {
    return InviteTeamMemberSchema;
  }

  async execute(args: z.infer<typeof InviteTeamMemberSchema>): Promise<string> {
    this.logger.info(`Inviting member to team ${args.id}: ${args.email}`);

    try {
      const result = await this.apiPost(`/teams/${args.id}/members/invite`, {
        email: args.email,
        role: args.role || 'member',
      });

      this.logger.info(`Successfully invited ${args.email} to team: ${args.id}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to invite member to team ${args.id}`, error);
      throw new Error(`Failed to invite team member: ${error.message}`);
    }
  }
}
