/**
 * Qdrant Query Interface
 *
 * Provides semantic search and relationship discovery for Coolify infrastructure
 */

import { qdrantClient, Collections, generateEmbedding } from './client.js';
import type { InfrastructureNode, NodeType } from './mapper.js';

/**
 * Search result
 */
export interface SearchResult {
  id: string;
  type: NodeType;
  name: string;
  description: string;
  score: number;
  metadata: Record<string, any>;
  relationships: Array<{
    targetId: string;
    targetType: NodeType;
    relationType: string;
    description: string;
  }>;
}

/**
 * Semantic search for infrastructure
 */
export async function search(
  query: string,
  options: {
    limit?: number;
    type?: NodeType;
    minScore?: number;
  } = {}
): Promise<SearchResult[]> {
  const { limit = 10, type, minScore = 0.5 } = options;

  console.log(`🔍 Searching for: "${query}"`);
  if (type) console.log(`   Type filter: ${type}`);
  console.log(`   Limit: ${limit}, Min score: ${minScore}\n`);

  try {
    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);

    // Build filter
    const filter: any = {};
    if (type) {
      filter.must = [{ key: 'type', match: { value: type } }];
    }

    // Search Qdrant
    const searchResults = await qdrantClient.search(Collections.INFRASTRUCTURE, {
      vector: queryEmbedding,
      limit,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      with_payload: true,
    });

    // Format results
    const results: SearchResult[] = searchResults
      .filter(result => result.score >= minScore)
      .map(result => ({
        id: result.payload!.id as string,
        type: result.payload!.type as NodeType,
        name: result.payload!.name as string,
        description: result.payload!.description as string,
        score: result.score,
        metadata: result.payload!.metadata as Record<string, any>,
        relationships: result.payload!.relationships as any[],
      }));

    console.log(`✅ Found ${results.length} results\n`);
    return results;
  } catch (error) {
    console.error('❌ Search error:', error);
    return [];
  }
}

/**
 * Find what's linked to a specific resource
 */
export async function findLinkedTo(
  resourceId: string,
  options: {
    depth?: number;
    relationTypes?: string[];
  } = {}
): Promise<{
  resource: SearchResult | null;
  incoming: SearchResult[];
  outgoing: SearchResult[];
}> {
  const { depth = 1, relationTypes } = options;

  console.log(`🔗 Finding links for: ${resourceId}`);
  console.log(`   Depth: ${depth}`);
  if (relationTypes) console.log(`   Relation types: ${relationTypes.join(', ')}`);
  console.log();

  try {
    // Get the resource
    const resourceResult = await qdrantClient.retrieve(Collections.INFRASTRUCTURE, {
      ids: [resourceId],
      with_payload: true,
    });

    if (resourceResult.length === 0) {
      console.log('❌ Resource not found\n');
      return { resource: null, incoming: [], outgoing: [] };
    }

    const resource = formatResult(resourceResult[0]);

    // Find outgoing relationships (what this resource links to)
    const outgoing: SearchResult[] = [];
    for (const rel of resource.relationships) {
      if (relationTypes && !relationTypes.includes(rel.relationType)) continue;

      const targetResult = await qdrantClient.retrieve(Collections.INFRASTRUCTURE, {
        ids: [rel.targetId],
        with_payload: true,
      });

      if (targetResult.length > 0) {
        outgoing.push(formatResult(targetResult[0]));
      }
    }

    // Find incoming relationships (what links to this resource)
    const incoming: SearchResult[] = [];
    const scrollResult = await qdrantClient.scroll(Collections.INFRASTRUCTURE, {
      limit: 1000,
      with_payload: true,
    });

    for (const point of scrollResult.points) {
      const relationships = (point.payload?.relationships as any[]) || [];
      const hasIncomingLink = relationships.some(rel => {
        if (relationTypes && !relationTypes.includes(rel.relationType)) return false;
        return rel.targetId === resourceId;
      });

      if (hasIncomingLink) {
        incoming.push(formatResult(point));
      }
    }

    console.log(`✅ Found ${outgoing.length} outgoing and ${incoming.length} incoming links\n`);
    return { resource, incoming, outgoing };
  } catch (error) {
    console.error('❌ Error finding links:', error);
    return { resource: null, incoming: [], outgoing: [] };
  }
}

/**
 * Find all resources of a specific type
 */
export async function findByType(type: NodeType): Promise<SearchResult[]> {
  console.log(`📋 Finding all resources of type: ${type}\n`);

  try {
    const scrollResult = await qdrantClient.scroll(Collections.INFRASTRUCTURE, {
      limit: 1000,
      with_payload: true,
      filter: {
        must: [{ key: 'type', match: { value: type } }],
      },
    });

    const results = scrollResult.points.map(formatResult);
    console.log(`✅ Found ${results.length} ${type} resources\n`);
    return results;
  } catch (error) {
    console.error('❌ Error finding by type:', error);
    return [];
  }
}

/**
 * Find all domains and their services
 */
export async function findAllDomains(): Promise<
  Array<{
    domain: string;
    service: string | null;
    application: string | null;
  }>
> {
  console.log('🌐 Finding all domains...\n');

  try {
    const domains = await findByType('domain');
    const result = domains.map(domain => ({
      domain: domain.name,
      service:
        domain.relationships.find(r => r.targetType === 'service')?.targetId || null,
      application:
        domain.relationships.find(r => r.targetType === 'application')?.targetId ||
        null,
    }));

    console.log(`✅ Found ${result.length} domains\n`);
    return result;
  } catch (error) {
    console.error('❌ Error finding domains:', error);
    return [];
  }
}

/**
 * Find what's running on a server
 */
export async function findOnServer(serverId: string): Promise<{
  server: SearchResult | null;
  services: SearchResult[];
  applications: SearchResult[];
}> {
  console.log(`🖥️  Finding resources on server: ${serverId}\n`);

  const links = await findLinkedTo(serverId, {
    relationTypes: ['deployed_on'],
  });

  const services = links.incoming.filter(r => r.type === 'service');
  const applications = links.incoming.filter(r => r.type === 'application');

  console.log(`✅ Found ${services.length} services and ${applications.length} applications\n`);

  return {
    server: links.resource,
    services,
    applications,
  };
}

/**
 * Find project hierarchy
 */
export async function findProjectHierarchy(projectId: string): Promise<{
  project: SearchResult | null;
  environments: SearchResult[];
  services: SearchResult[];
  applications: SearchResult[];
}> {
  console.log(`📦 Finding project hierarchy: ${projectId}\n`);

  const links = await findLinkedTo(projectId);

  const environments = links.outgoing.filter(r => r.type === 'environment');
  const services = links.incoming.filter(r => r.type === 'service');
  const applications = links.incoming.filter(r => r.type === 'application');

  console.log(
    `✅ Found ${environments.length} environments, ${services.length} services, ${applications.length} applications\n`
  );

  return {
    project: links.resource,
    environments,
    services,
    applications,
  };
}

/**
 * Get infrastructure statistics
 */
export async function getStats(): Promise<{
  total: number;
  byType: Record<NodeType, number>;
}> {
  console.log('📊 Getting infrastructure statistics...\n');

  try {
    const scrollResult = await qdrantClient.scroll(Collections.INFRASTRUCTURE, {
      limit: 10000,
      with_payload: true,
    });

    const byType: Record<string, number> = {};
    for (const point of scrollResult.points) {
      const type = point.payload?.type as string;
      byType[type] = (byType[type] || 0) + 1;
    }

    const stats = {
      total: scrollResult.points.length,
      byType: byType as Record<NodeType, number>,
    };

    console.log('✅ Statistics:');
    console.log(`   Total: ${stats.total}`);
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    console.log();

    return stats;
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    return { total: 0, byType: {} as Record<NodeType, number> };
  }
}

/**
 * Format a Qdrant point into a SearchResult
 */
function formatResult(point: any): SearchResult {
  return {
    id: point.payload?.id || point.id,
    type: point.payload?.type,
    name: point.payload?.name,
    description: point.payload?.description,
    score: point.score || 1,
    metadata: point.payload?.metadata || {},
    relationships: point.payload?.relationships || [],
  };
}
