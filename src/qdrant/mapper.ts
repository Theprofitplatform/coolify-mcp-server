/**
 * Coolify Infrastructure Mapper
 *
 * Scans Coolify infrastructure and maps all relationships into Qdrant
 * for semantic search and discovery.
 */

import axios from 'axios';
import {
  qdrantClient,
  Collections,
  generateEmbedding,
  initializeCollections,
} from './client.js';

// Coolify API configuration
const COOLIFY_BASE_URL = process.env.COOLIFY_BASE_URL || 'https://coolify.theprofitplatform.com.au';
const COOLIFY_TOKEN = process.env.COOLIFY_TOKEN || '';

const api = axios.create({
  baseURL: COOLIFY_BASE_URL,
  headers: {
    Authorization: `Bearer ${COOLIFY_TOKEN}`,
    Accept: 'application/json',
  },
});

/**
 * Infrastructure node types
 */
export type NodeType =
  | 'server'
  | 'project'
  | 'service'
  | 'application'
  | 'environment'
  | 'deployment'
  | 'domain'
  | 'database';

/**
 * Infrastructure node representation
 */
export interface InfrastructureNode {
  id: string;
  type: NodeType;
  name: string;
  description: string;
  metadata: Record<string, any>;
  relationships: Array<{
    targetId: string;
    targetType: NodeType;
    relationType: string;
    description: string;
  }>;
}

/**
 * Map all Coolify infrastructure
 */
export async function mapInfrastructure(): Promise<{
  nodes: InfrastructureNode[];
  indexed: number;
  errors: string[];
}> {
  console.log('🗺️  Starting Coolify infrastructure mapping...\n');

  // Initialize collections
  await initializeCollections();

  const nodes: InfrastructureNode[] = [];
  const errors: string[] = [];

  try {
    // 1. Map Servers
    console.log('📡 Mapping servers...');
    const servers = await mapServers();
    nodes.push(...servers);
    console.log(`  ✅ Mapped ${servers.length} servers\n`);

    // 2. Map Projects
    console.log('📦 Mapping projects...');
    const projects = await mapProjects();
    nodes.push(...projects);
    console.log(`  ✅ Mapped ${projects.length} projects\n`);

    // 3. Map Services
    console.log('🔧 Mapping services...');
    const services = await mapServices();
    nodes.push(...services);
    console.log(`  ✅ Mapped ${services.length} services\n`);

    // 4. Map Applications
    console.log('📱 Mapping applications...');
    const applications = await mapApplications();
    nodes.push(...applications);
    console.log(`  ✅ Mapped ${applications.length} applications\n`);

    // 5. Index all nodes in Qdrant
    console.log('💾 Indexing nodes in Qdrant...');
    const indexed = await indexNodes(nodes);
    console.log(`  ✅ Indexed ${indexed} nodes\n`);

    return { nodes, indexed, errors };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    errors.push(errorMsg);
    console.error('❌ Error mapping infrastructure:', errorMsg);
    return { nodes, indexed: 0, errors };
  }
}

/**
 * Map all servers
 */
async function mapServers(): Promise<InfrastructureNode[]> {
  try {
    const response = await api.get('/api/v1/servers');
    const servers = response.data;

    return servers.map((server: any) => ({
      id: `server:${server.uuid}`,
      type: 'server' as NodeType,
      name: server.name || 'Unnamed Server',
      description: `Server ${server.name} at ${server.ip}. ${server.description || ''}`,
      metadata: {
        uuid: server.uuid,
        ip: server.ip,
        port: server.port,
        user: server.user,
        description: server.description,
        os: server.os,
        swarmNode: server.swarmNode,
        created_at: server.created_at,
      },
      relationships: [],
    }));
  } catch (error) {
    console.error('  ⚠️  Error mapping servers:', error);
    return [];
  }
}

/**
 * Map all projects with environments
 */
async function mapProjects(): Promise<InfrastructureNode[]> {
  try {
    const response = await api.get('/api/v1/projects');
    const projects = response.data;

    const nodes: InfrastructureNode[] = [];

    for (const project of projects) {
      // Get detailed project info
      const detailRes = await api.get(`/api/v1/projects/${project.uuid}`);
      const details = detailRes.data;

      const projectNode: InfrastructureNode = {
        id: `project:${project.uuid}`,
        type: 'project' as NodeType,
        name: project.name || 'Unnamed Project',
        description: `Project ${project.name}. ${project.description || ''}`,
        metadata: {
          uuid: project.uuid,
          description: project.description,
          created_at: project.created_at,
          environmentCount: details.environments?.length || 0,
        },
        relationships: [],
      };

      // Add environment relationships
      if (details.environments) {
        for (const env of details.environments) {
          projectNode.relationships.push({
            targetId: `environment:${env.id}`,
            targetType: 'environment',
            relationType: 'has_environment',
            description: `Project has environment ${env.name}`,
          });

          // Create environment node
          const envNode: InfrastructureNode = {
            id: `environment:${env.id}`,
            type: 'environment' as NodeType,
            name: env.name || 'production',
            description: `Environment ${env.name} in project ${project.name}`,
            metadata: {
              id: env.id,
              project_uuid: project.uuid,
              project_name: project.name,
            },
            relationships: [
              {
                targetId: `project:${project.uuid}`,
                targetType: 'project',
                relationType: 'belongs_to_project',
                description: `Environment belongs to project ${project.name}`,
              },
            ],
          };
          nodes.push(envNode);
        }
      }

      nodes.push(projectNode);
    }

    return nodes;
  } catch (error) {
    console.error('  ⚠️  Error mapping projects:', error);
    return [];
  }
}

/**
 * Map all services
 */
async function mapServices(): Promise<InfrastructureNode[]> {
  try {
    const response = await api.get('/api/v1/services');
    const services = response.data;

    const nodes: InfrastructureNode[] = [];

    for (const service of services) {
      const serviceNode: InfrastructureNode = {
        id: `service:${service.uuid}`,
        type: 'service' as NodeType,
        name: service.name || 'Unnamed Service',
        description: `Service ${service.name}. ${service.description || ''}`,
        metadata: {
          uuid: service.uuid,
          description: service.description,
          created_at: service.created_at,
          updated_at: service.updated_at,
        },
        relationships: [],
      };

      // Add server relationship
      if (service.destination) {
        const serverUuid =
          typeof service.destination === 'string'
            ? service.destination
            : service.destination.uuid;
        if (serverUuid) {
          serviceNode.relationships.push({
            targetId: `server:${serverUuid}`,
            targetType: 'server',
            relationType: 'deployed_on',
            description: `Service deployed on server ${serverUuid}`,
          });
        }
      }

      // Add project relationship
      if (service.project) {
        serviceNode.relationships.push({
          targetId: `project:${service.project.uuid}`,
          targetType: 'project',
          relationType: 'belongs_to_project',
          description: `Service belongs to project ${service.project.name}`,
        });
      }

      // Add domain relationships (from applications within service)
      if (service.applications) {
        for (const app of service.applications) {
          if (app.fqdn) {
            serviceNode.relationships.push({
              targetId: `domain:${app.fqdn}`,
              targetType: 'domain',
              relationType: 'has_domain',
              description: `Service accessible at ${app.fqdn}`,
            });

            // Create domain node
            const domainNode: InfrastructureNode = {
              id: `domain:${app.fqdn}`,
              type: 'domain' as NodeType,
              name: app.fqdn,
              description: `Domain ${app.fqdn} for service ${service.name}`,
              metadata: {
                fqdn: app.fqdn,
                service_uuid: service.uuid,
                service_name: service.name,
              },
              relationships: [
                {
                  targetId: `service:${service.uuid}`,
                  targetType: 'service',
                  relationType: 'points_to_service',
                  description: `Domain points to service ${service.name}`,
                },
              ],
            };
            nodes.push(domainNode);
          }
        }
      }

      nodes.push(serviceNode);
    }

    return nodes;
  } catch (error) {
    console.error('  ⚠️  Error mapping services:', error);
    return [];
  }
}

/**
 * Map all applications
 */
async function mapApplications(): Promise<InfrastructureNode[]> {
  try {
    const response = await api.get('/api/v1/applications');
    const applications = response.data;

    const nodes: InfrastructureNode[] = [];

    for (const app of applications) {
      const appNode: InfrastructureNode = {
        id: `application:${app.uuid}`,
        type: 'application' as NodeType,
        name: app.name || 'Unnamed Application',
        description: `Application ${app.name}. ${app.description || ''}`,
        metadata: {
          uuid: app.uuid,
          description: app.description,
          repository: app.git_repository,
          branch: app.git_branch,
          fqdn: app.fqdn,
          created_at: app.created_at,
        },
        relationships: [],
      };

      // Add server relationship
      if (app.destination) {
        appNode.relationships.push({
          targetId: `server:${app.destination.uuid}`,
          targetType: 'server',
          relationType: 'deployed_on',
          description: `Application deployed on server`,
        });
      }

      // Add project relationship
      if (app.project) {
        appNode.relationships.push({
          targetId: `project:${app.project.uuid}`,
          targetType: 'project',
          relationType: 'belongs_to_project',
          description: `Application belongs to project ${app.project.name}`,
        });
      }

      // Add domain relationship
      if (app.fqdn) {
        appNode.relationships.push({
          targetId: `domain:${app.fqdn}`,
          targetType: 'domain',
          relationType: 'has_domain',
          description: `Application accessible at ${app.fqdn}`,
        });
      }

      nodes.push(appNode);
    }

    return nodes;
  } catch (error) {
    console.error('  ⚠️  Error mapping applications:', error);
    return [];
  }
}

/**
 * Index nodes in Qdrant
 */
async function indexNodes(nodes: InfrastructureNode[]): Promise<number> {
  let indexed = 0;

  for (const node of nodes) {
    try {
      // Generate searchable text
      const searchText = `
        ${node.type}: ${node.name}
        ${node.description}
        Relationships: ${node.relationships.map(r => r.description).join('; ')}
        Metadata: ${JSON.stringify(node.metadata)}
      `.trim();

      // Generate embedding
      const embedding = await generateEmbedding(searchText);

      // Store in Qdrant
      await qdrantClient.upsert(Collections.INFRASTRUCTURE, {
        wait: true,
        points: [
          {
            id: node.id,
            vector: embedding,
            payload: {
              id: node.id,
              type: node.type,
              name: node.name,
              description: node.description,
              metadata: node.metadata,
              relationships: node.relationships,
              searchText,
            },
          },
        ],
      });

      indexed++;
    } catch (error) {
      console.error(`  ⚠️  Error indexing node ${node.id}:`, error);
    }
  }

  return indexed;
}

/**
 * Clear all infrastructure data
 */
export async function clearInfrastructure(): Promise<void> {
  console.log('🗑️  Clearing infrastructure data...');
  try {
    await qdrantClient.delete(Collections.INFRASTRUCTURE, {
      wait: true,
      filter: {},
    });
    console.log('✅ Infrastructure data cleared');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}
