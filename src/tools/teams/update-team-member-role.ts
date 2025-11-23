/**
 * Update Team Member Role Tool
 * Updates the role/permissions of a team member
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const UpdateTeamMemberRoleSchema = z.object({
  id: z.string().describe('Team ID'),
  user_id: z.string().describe('User ID'),
  role: z.enum(['owner', 'admin', 'member', 'viewer']).describe('New role for the member'),
});

export class UpdateTeamMemberRoleTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'update_team_member_role';
  }

  get description(): string {
    return 'Update the role and permissions of a team member. Roles: owner (full access), admin (manage resources), member (use resources), viewer (read-only).';
  }

  get inputSchema(): z.ZodSchema {
    return UpdateTeamMemberRoleSchema;
  }

  async execute(args: z.infer<typeof UpdateTeamMemberRoleSchema>): Promise<string> {
    this.logger.info(`Updating role for member ${args.user_id} in team ${args.id} to: ${args.role}`);

    try {
      const result = await this.apiPatch(`/teams/${args.id}/members/${args.user_id}`, {
        role: args.role,
      });

      this.logger.info(`Successfully updated role for member ${args.user_id} to: ${args.role}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to update member role in team ${args.id}`, error);
      throw new Error(`Failed to update team member role: ${error.message}`);
    }
  }
}
