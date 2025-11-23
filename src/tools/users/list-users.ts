import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  team_id: z.string().optional().describe('Filter by team ID'),
});

const outputSchema = z.object({
  users: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      role: z.string().optional(),
      is_active: z.boolean().optional(),
      last_login_at: z.string().optional(),
      created_at: z.string(),
    })
  ),
});

export class ListUsersTool extends BaseTool {
  name = 'list_users';
  description = 'List all users in Coolify instance. Can filter by team. Shows user details, roles, and activity.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    let endpoint = '/users';
    
    if (input.team_id) {
      endpoint += `?team_id=${input.team_id}`;
    }

    const response = await this.apiGet(endpoint);
    
    return this.formatResponse({
      users: Array.isArray(response.data) ? response.data : [],
    });
  }
}
