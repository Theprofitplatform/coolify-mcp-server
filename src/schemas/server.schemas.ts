/**
 * Server Tool Validation Schemas
 * Zod schemas for server-related operations
 */

import { z } from 'zod';
import { commonSchemas } from '../utils/validators.js';

export const ListServersSchema = z.object({});

export const GetServerResourcesSchema = z.object({
  server_uuid: commonSchemas.uuid,
});

export const ValidateServerSchema = z.object({
  server_uuid: commonSchemas.uuid,
});

export const GetServerDomainsSchema = z.object({
  server_uuid: commonSchemas.uuid,
});

export const CreateServerSchema = z.object({
  name: commonSchemas.nonEmptyString,
  description: z.string().optional(),
  ip: commonSchemas.ipv4,
  port: commonSchemas.port.default(22),
  user: commonSchemas.nonEmptyString,
  private_key_uuid: commonSchemas.uuid,
  is_build_server: z.boolean().default(false),
  instant_validate: z.boolean().default(false),
});
