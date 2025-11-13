/**
 * Service Tool Validation Schemas
 * Zod schemas for service-related operations
 */

import { z } from 'zod';
import { commonSchemas } from '../utils/validators.js';

export const ListServicesSchema = z.object({});

export const CreateServiceSchema = z.object({
  name: commonSchemas.nonEmptyString,
  description: z.string().optional(),
  server_uuid: commonSchemas.uuid,
  project_uuid: commonSchemas.uuid,
  environment_name: commonSchemas.nonEmptyString,
  environment_uuid: commonSchemas.uuid.optional(),
  type: z.string().optional(),
  docker_compose_raw: z.string().optional(),
}).refine(
  (data) => (data.type && !data.docker_compose_raw) || (!data.type && data.docker_compose_raw),
  {
    message: "Either 'type' or 'docker_compose_raw' must be provided, but not both",
    path: ['type'],
  }
);

export const StartServiceSchema = z.object({
  uuid: commonSchemas.uuid,
});

export const StopServiceSchema = z.object({
  uuid: commonSchemas.uuid,
});

export const RestartServiceSchema = z.object({
  uuid: commonSchemas.uuid,
});
