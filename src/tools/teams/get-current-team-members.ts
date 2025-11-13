/**
 * Get Current Team Members Tool
 * Retrieves members of the currently authenticated team
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { GetCurrentTeamMembersSchema } from '../../schemas/team.schemas.js';

export class GetCurrentTeamMembersTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_current_team_members';
  }

  get description(): string {
    return 'Get members of the currently authenticated team.';
  }

  get inputSchema(): z.ZodSchema {
    return GetCurrentTeamMembersSchema;
  }

  async execute(_args: z.infer<typeof GetCurrentTeamMembersSchema>): Promise<string> {
    this.logger.info('Fetching current team members');

    const members = await this.apiGet('/teams/current/members');

    if (!Array.isArray(members) || members.length === 0) {
      return 'No team members found.';
    }

    this.logger.info(`Found ${members.length} team member(s)`);

    return this.formatResponse(members);
  }
}
