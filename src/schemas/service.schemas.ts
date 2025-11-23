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

// Get Service Environment Variables Schema
export const GetServiceEnvVarsSchema = z.object({
  uuid: commonSchemas.uuid,
});

// Set Service Environment Variable Schema
export const SetServiceEnvVarSchema = z.object({
  uuid: commonSchemas.uuid,
  key: z.string().describe('Environment variable key/name'),
  value: z.string().describe('Environment variable value'),
});

// Update Service Environment Variables Schema
export const UpdateServiceEnvVarsSchema = z.object({
  uuid: commonSchemas.uuid,
  env_vars: z.record(z.string(), z.string()).describe('Object with key-value pairs of environment variables'),
  restart_after_update: z.boolean().optional().describe('Automatically restart service after update'),
});
