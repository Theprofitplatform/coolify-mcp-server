/**
 * Remove Team Member Tool
 * Removes a member from a team
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const RemoveTeamMemberSchema = z.object({
  id: z.string().describe('Team ID'),
  user_id: z.string().describe('User ID to remove from team'),
});

export class RemoveTeamMemberTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'remove_team_member';
  }

  get description(): string {
    return 'Remove a member from a team. The user will lose access to all team resources.';
  }

  get inputSchema(): z.ZodSchema {
    return RemoveTeamMemberSchema;
  }

  async execute(args: z.infer<typeof RemoveTeamMemberSchema>): Promise<string> {
    this.logger.info(`Removing member ${args.user_id} from team: ${args.id}`);
    this.logger.warn(`REMOVE operation requested for team member: ${args.user_id}`);

    try {
      const result = await this.apiDelete(`/teams/${args.id}/members/${args.user_id}`);

      this.logger.info(`Successfully removed member ${args.user_id} from team: ${args.id}`);

      return this.formatResponse({
        message: 'Team member removed successfully',
        team_id: args.id,
        user_id: args.user_id,
        ...result
      });
    } catch (error: any) {
      this.logger.error(`Failed to remove member from team ${args.id}`, error);
      throw new Error(`Failed to remove team member: ${error.message}`);
    }
  }
}
