/**
 * Team Tool Validation Schemas
 * Zod schemas for team-related operations
 */

import { z } from 'zod';
import { commonSchemas } from '../utils/validators.js';

export const ListTeamsSchema = z.object({});

export const GetTeamSchema = z.object({
  team_id: commonSchemas.nonEmptyString,
});

export const GetCurrentTeamSchema = z.object({});

export const GetCurrentTeamMembersSchema = z.object({});
