/**
 * Project Tool Validation Schemas
 * Zod schemas for project-related operations
 */

import { z } from 'zod';
import { commonSchemas } from '../utils/validators.js';

export const ListProjectsSchema = z.object({});

export const GetProjectSchema = z.object({
  project_uuid: commonSchemas.uuid,
});

export const CreateProjectSchema = z.object({
  name: commonSchemas.nonEmptyString,
  description: z.string().optional(),
});
