/**
 * Get Team Members Tool
 * Retrieves all members of a specific team
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GetTeamMembersSchema = z.object({
  id: z.string().describe('Team ID'),
});

export class GetTeamMembersTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_team_members';
  }

  get description(): string {
    return 'Get all members of a specific team including their roles and permissions.';
  }

  get inputSchema(): z.ZodSchema {
    return GetTeamMembersSchema;
  }

  async execute(args: z.infer<typeof GetTeamMembersSchema>): Promise<string> {
    this.logger.info(`Fetching members for team: ${args.id}`);

    try {
      const members = await this.apiGet(`/teams/${args.id}/members`);

      this.logger.info(`Successfully fetched members for team: ${args.id}`);

      return this.formatResponse(members);
    } catch (error: any) {
      this.logger.error(`Failed to fetch team members for ${args.id}`, error);
      throw new Error(`Failed to get team members: ${error.message}`);
    }
  }
}
