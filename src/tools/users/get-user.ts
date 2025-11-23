import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  user_id: z.string().describe('User ID'),
});

const outputSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string().optional(),
  is_active: z.boolean(),
  email_verified: z.boolean().optional(),
  two_factor_enabled: z.boolean().optional(),
  teams: z.array(
    z.object({
      team_id: z.string(),
      team_name: z.string(),
      role: z.string(),
    })
  ).optional(),
  permissions: z.array(z.string()).optional(),
  last_login_at: z.string().optional(),
  created_at: z.string(),
});

export class GetUserTool extends BaseTool {
  name = 'get_user';
  description = 'Get detailed information about a specific user including teams, roles, and permissions.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const response = await this.apiGet(`/users/${input.user_id}`);
    
    return this.formatResponse(response.data);
  }
}
