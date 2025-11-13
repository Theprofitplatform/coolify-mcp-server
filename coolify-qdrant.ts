#!/usr/bin/env node
/**
 * Coolify-Qdrant CLI Tool
 *
 * Command-line interface for managing Coolify infrastructure knowledge graph
 *
 * Usage:
 *   npm run qdrant map                    # Map all infrastructure
 *   npm run qdrant search "query"         # Search infrastructure
 *   npm run qdrant links resource-id      # Find what's linked
 *   npm run qdrant domains                # List all domains
 *   npm run qdrant server server-id       # Find what's on a server
 *   npm run qdrant project project-id     # Find project hierarchy
 *   npm run qdrant stats                  # Get statistics
 *   npm run qdrant clear                  # Clear all data
 */

import 'dotenv/config';
import { healthCheck } from './src/qdrant/client.js';
import { mapInfrastructure, clearInfrastructure } from './src/qdrant/mapper.js';
import {
  search,
  findLinkedTo,
  findAllDomains,
  findOnServer,
  findProjectHierarchy,
  getStats,
  findByType,
} from './src/qdrant/query.js';

const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║        🗺️  Coolify Infrastructure Knowledge Graph 🗺️       ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Health check first
  const health = await healthCheck();
  if (!health.connected) {
    console.error('❌ Cannot connect to Qdrant!');
    console.error('   Error:', health.error);
    console.error('\n💡 Make sure Qdrant is running and QDRANT_API_KEY is set\n');
    process.exit(1);
  }

  console.log(`✅ Connected to Qdrant (${health.collections} collections)\n`);
  console.log('─'.repeat(60) + '\n');

  switch (command) {
    case 'map':
      await handleMap();
      break;

    case 'search':
      await handleSearch(args);
      break;

    case 'links':
      await handleLinks(args);
      break;

    case 'domains':
      await handleDomains();
      break;

    case 'server':
      await handleServer(args);
      break;

    case 'project':
      await handleProject(args);
      break;

    case 'stats':
      await handleStats();
      break;

    case 'clear':
      await handleClear();
      break;

    case 'types':
      await handleTypes(args);
      break;

    default:
      printUsage();
      break;
  }
}

async function handleMap() {
  console.log('📍 Command: MAP INFRASTRUCTURE\n');
  const result = await mapInfrastructure();

  console.log('─'.repeat(60));
  console.log('\n📊 MAPPING COMPLETE\n');
  console.log(`  Nodes discovered: ${result.nodes.length}`);
  console.log(`  Nodes indexed:    ${result.indexed}`);
  console.log(`  Errors:           ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.log('\n⚠️  Errors:');
    result.errors.forEach(err => console.log(`  - ${err}`));
  }

  console.log('\n✅ Infrastructure mapping complete!\n');
}

async function handleSearch(args: string[]) {
  const query = args.join(' ');
  if (!query) {
    console.error('❌ Please provide a search query\n');
    console.log('Usage: npm run qdrant search "your query here"\n');
    return;
  }

  console.log('📍 Command: SEARCH\n');
  const results = await search(query, { limit: 10 });

  console.log('─'.repeat(60));
  console.log('\n📋 SEARCH RESULTS\n');

  if (results.length === 0) {
    console.log('  No results found\n');
    return;
  }

  results.forEach((result, i) => {
    console.log(`${i + 1}. [${result.type}] ${result.name} (score: ${result.score.toFixed(3)})`);
    console.log(`   ID: ${result.id}`);
    console.log(`   ${result.description.substring(0, 100)}...`);
    if (result.relationships.length > 0) {
      console.log(`   Links: ${result.relationships.length} relationships`);
    }
    console.log();
  });
}

async function handleLinks(args: string[]) {
  const resourceId = args[0];
  if (!resourceId) {
    console.error('❌ Please provide a resource ID\n');
    console.log('Usage: npm run qdrant links <resource-id>\n');
    return;
  }

  console.log('📍 Command: FIND LINKS\n');
  const result = await findLinkedTo(resourceId);

  console.log('─'.repeat(60));
  console.log('\n🔗 RELATIONSHIPS\n');

  if (!result.resource) {
    console.log('  Resource not found\n');
    return;
  }

  console.log('Resource:');
  console.log(`  [${result.resource.type}] ${result.resource.name}`);
  console.log(`  ${result.resource.description}\n`);

  console.log(`Outgoing Links (${result.outgoing.length}):`);
  result.outgoing.forEach(link => {
    console.log(`  → [${link.type}] ${link.name}`);
  });
  console.log();

  console.log(`Incoming Links (${result.incoming.length}):`);
  result.incoming.forEach(link => {
    console.log(`  ← [${link.type}] ${link.name}`);
  });
  console.log();
}

async function handleDomains() {
  console.log('📍 Command: LIST DOMAINS\n');
  const domains = await findAllDomains();

  console.log('─'.repeat(60));
  console.log('\n🌐 DOMAINS\n');

  if (domains.length === 0) {
    console.log('  No domains found\n');
    return;
  }

  domains.forEach(d => {
    console.log(`  ${d.domain}`);
    if (d.service) console.log(`    → Service: ${d.service}`);
    if (d.application) console.log(`    → Application: ${d.application}`);
  });
  console.log();
}

async function handleServer(args: string[]) {
  const serverId = args[0];
  if (!serverId) {
    console.error('❌ Please provide a server ID\n');
    console.log('Usage: npm run qdrant server <server-id>\n');
    return;
  }

  console.log('📍 Command: SERVER RESOURCES\n');
  const result = await findOnServer(serverId);

  console.log('─'.repeat(60));
  console.log('\n🖥️  SERVER RESOURCES\n');

  if (!result.server) {
    console.log('  Server not found\n');
    return;
  }

  console.log('Server:');
  console.log(`  ${result.server.name} (${result.server.metadata.ip})`);
  console.log();

  console.log(`Services (${result.services.length}):`);
  result.services.forEach(s => console.log(`  - ${s.name}`));
  console.log();

  console.log(`Applications (${result.applications.length}):`);
  result.applications.forEach(a => console.log(`  - ${a.name}`));
  console.log();
}

async function handleProject(args: string[]) {
  const projectId = args[0];
  if (!projectId) {
    console.error('❌ Please provide a project ID\n');
    console.log('Usage: npm run qdrant project <project-id>\n');
    return;
  }

  console.log('📍 Command: PROJECT HIERARCHY\n');
  const result = await findProjectHierarchy(projectId);

  console.log('─'.repeat(60));
  console.log('\n📦 PROJECT HIERARCHY\n');

  if (!result.project) {
    console.log('  Project not found\n');
    return;
  }

  console.log('Project:');
  console.log(`  ${result.project.name}`);
  console.log();

  console.log(`Environments (${result.environments.length}):`);
  result.environments.forEach(e => console.log(`  - ${e.name}`));
  console.log();

  console.log(`Services (${result.services.length}):`);
  result.services.forEach(s => console.log(`  - ${s.name}`));
  console.log();

  console.log(`Applications (${result.applications.length}):`);
  result.applications.forEach(a => console.log(`  - ${a.name}`));
  console.log();
}

async function handleStats() {
  console.log('📍 Command: STATISTICS\n');
  const stats = await getStats();

  console.log('─'.repeat(60));
  console.log('\n📊 INFRASTRUCTURE STATISTICS\n');
  console.log(`  Total resources: ${stats.total}\n`);
  console.log('  By type:');
  Object.entries(stats.byType).forEach(([type, count]) => {
    console.log(`    ${type.padEnd(15)} ${count}`);
  });
  console.log();
}

async function handleTypes(args: string[]) {
  const type = args[0] as any;
  if (!type) {
    console.error('❌ Please provide a resource type\n');
    console.log('Usage: npm run qdrant types <type>\n');
    console.log('Types: server, project, service, application, environment, domain\n');
    return;
  }

  console.log(`📍 Command: LIST ${type.toUpperCase()}S\n`);
  const results = await findByType(type);

  console.log('─'.repeat(60));
  console.log(`\n📋 ${type.toUpperCase()}S (${results.length})\n`);

  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.name}`);
    console.log(`   ID: ${r.id}`);
    console.log(`   ${r.description.substring(0, 80)}...`);
    console.log();
  });
}

async function handleClear() {
  console.log('📍 Command: CLEAR DATA\n');
  console.log('⚠️  This will delete all indexed infrastructure data!');
  console.log('   Press Ctrl+C to cancel or wait 3 seconds to continue...\n');

  await new Promise(resolve => setTimeout(resolve, 3000));

  await clearInfrastructure();
  console.log('✅ All data cleared\n');
}

function printUsage() {
  console.log('USAGE:\n');
  console.log('  npm run qdrant map                    # Map all infrastructure');
  console.log('  npm run qdrant search "query"         # Search infrastructure');
  console.log('  npm run qdrant links <resource-id>    # Find what\'s linked');
  console.log('  npm run qdrant types <type>           # List resources by type');
  console.log('  npm run qdrant domains                # List all domains');
  console.log('  npm run qdrant server <server-id>     # Find what\'s on a server');
  console.log('  npm run qdrant project <project-id>   # Find project hierarchy');
  console.log('  npm run qdrant stats                  # Get statistics');
  console.log('  npm run qdrant clear                  # Clear all data');
  console.log();
  console.log('EXAMPLES:\n');
  console.log('  npm run qdrant map');
  console.log('  npm run qdrant search "browserless service"');
  console.log('  npm run qdrant links service:u8oc8kccs8kkgwwgwcss844o');
  console.log('  npm run qdrant types service');
  console.log('  npm run qdrant domains');
  console.log('  npm run qdrant server server:acwcck0c0wg8owgsko880cg0');
  console.log();
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
