/**
 * Qdrant Client for Coolify Infrastructure Tracking
 *
 * This module provides vector-based infrastructure relationship tracking
 * using Qdrant vector database for semantic search and discovery.
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';

// Qdrant configuration from environment
const QDRANT_HOST = process.env.QDRANT_HOST || 'qdrant-j4kss8084c008sskcko8oks0';
const QDRANT_PORT = parseInt(process.env.QDRANT_PORT || '6333');
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '***REMOVED***';

// OpenAI configuration for embeddings
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

/**
 * Qdrant client instance
 * Note: We use Docker network access by default since Qdrant runs in a container
 * For Cloudflare Tunnel access, use port 443 with https: true
 */
export const qdrantClient = new QdrantClient({
  host: QDRANT_HOST,
  port: QDRANT_PORT,
  https: QDRANT_PORT === 443,
  apiKey: QDRANT_API_KEY,
});

/**
 * OpenAI client for generating embeddings
 */
export const openaiClient = OPENAI_API_KEY
  ? new OpenAI({ apiKey: OPENAI_API_KEY })
  : null;

/**
 * Collection names for different resource types
 */
export const Collections = {
  INFRASTRUCTURE: 'coolify_infrastructure',
  SERVICES: 'coolify_services',
  APPLICATIONS: 'coolify_applications',
  SERVERS: 'coolify_servers',
  RELATIONSHIPS: 'coolify_relationships',
} as const;

/**
 * Vector dimensions for embeddings
 */
export const VECTOR_SIZE = 1536; // OpenAI text-embedding-ada-002 dimension

/**
 * Initialize all Qdrant collections
 */
export async function initializeCollections(): Promise<void> {
  console.log('🔍 Initializing Qdrant collections...');

  for (const [name, collectionName] of Object.entries(Collections)) {
    try {
      // Check if collection exists
      const collections = await qdrantClient.getCollections();
      const exists = collections.collections.some(c => c.name === collectionName);

      if (!exists) {
        console.log(`  Creating collection: ${collectionName}...`);
        await qdrantClient.createCollection(collectionName, {
          vectors: {
            size: VECTOR_SIZE,
            distance: 'Cosine',
          },
          optimizers_config: {
            indexing_threshold: 10000,
          },
        });
        console.log(`  ✅ Created ${collectionName}`);
      } else {
        console.log(`  ✅ Collection ${collectionName} already exists`);
      }
    } catch (error) {
      console.error(`  ❌ Error with collection ${collectionName}:`, error);
      throw error;
    }
  }

  console.log('✅ All collections initialized!');
}

/**
 * Generate embedding for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!openaiClient) {
    // Return a simple hash-based embedding if OpenAI is not configured
    return generateSimpleEmbedding(text);
  }

  try {
    const response = await openaiClient.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating OpenAI embedding:', error);
    // Fallback to simple embedding
    return generateSimpleEmbedding(text);
  }
}

/**
 * Generate a simple deterministic embedding without OpenAI
 * This is a fallback for when OpenAI is not configured
 */
function generateSimpleEmbedding(text: string): number[] {
  const embedding = new Array(VECTOR_SIZE).fill(0);

  // Simple character-based hash distribution
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const index = (charCode * i) % VECTOR_SIZE;
    embedding[index] += Math.sin(charCode + i) * 0.1;
  }

  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / (magnitude || 1));
}

/**
 * Health check for Qdrant connection
 */
export async function healthCheck(): Promise<{
  connected: boolean;
  collections: number;
  error?: string;
}> {
  try {
    const collections = await qdrantClient.getCollections();
    return {
      connected: true,
      collections: collections.collections.length,
    };
  } catch (error) {
    return {
      connected: false,
      collections: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get collection statistics
 */
export async function getCollectionStats(collectionName: string) {
  try {
    const info = await qdrantClient.getCollection(collectionName);
    return {
      name: collectionName,
      pointsCount: info.points_count,
      vectorsCount: info.vectors_count,
      status: info.status,
    };
  } catch (error) {
    return {
      name: collectionName,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
