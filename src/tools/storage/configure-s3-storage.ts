import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  name: z.string().describe('Storage configuration name'),
  provider: z.enum(['aws', 'digitalocean', 'cloudflare', 'wasabi', 'backblaze', 'minio', 'custom']).describe('S3 provider'),
  endpoint: z.string().optional().describe('S3 endpoint URL (required for custom providers)'),
  region: z.string().describe('S3 region'),
  bucket: z.string().describe('Bucket name'),
  access_key: z.string().describe('Access key ID'),
  secret_key: z.string().describe('Secret access key'),
  use_for_backups: z.boolean().optional().default(true).describe('Use this storage for database backups'),
  use_for_volumes: z.boolean().optional().default(false).describe('Use this storage for volumes'),
});

const outputSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  bucket: z.string(),
  message: z.string(),
});

export class ConfigureS3StorageTool extends BaseTool {
  name = 'configure_s3_storage';
  description = 'Configure S3-compatible storage backend for backups and volumes. Supports AWS, DigitalOcean Spaces, Cloudflare R2, Wasabi, Backblaze B2, MinIO, and custom S3 endpoints.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const payload = {
      name: input.name,
      provider: input.provider,
      region: input.region,
      bucket: input.bucket,
      access_key: input.access_key,
      secret_key: input.secret_key,
      use_for_backups: input.use_for_backups,
      use_for_volumes: input.use_for_volumes,
      ...(input.endpoint && { endpoint: input.endpoint }),
    };

    const response = await this.apiPost('/storage/s3', payload);
    
    return this.formatResponse(response.data);
  }
}
