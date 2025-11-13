/**
 * Private Key Tool Validation Schemas
 * Zod schemas for private key-related operations
 */

import { z } from 'zod';
import { commonSchemas } from '../utils/validators.js';

export const ListPrivateKeysSchema = z.object({});

export const CreatePrivateKeySchema = z.object({
  name: commonSchemas.nonEmptyString,
  description: z.string().optional(),
  private_key: commonSchemas.nonEmptyString,
});
