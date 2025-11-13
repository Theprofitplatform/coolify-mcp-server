#!/usr/bin/env node
/**
 * Check Browserless Service in Coolify
 */

import axios from 'axios';
import 'dotenv/config';

const BASE_URL = process.env.COOLIFY_BASE_URL;
const TOKEN = process.env.COOLIFY_TOKEN;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Accept': 'application/json'
  }
});

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                                                            ║');
console.log('║           🌐 Browserless Service Check 🌐                 ║');
console.log('║                                                            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function checkBrowserless() {
  try {
    // First, get all services to find browserless
    console.log('🔍 Step 1: Finding Browserless service...\n');
    const servicesRes = await api.get('/api/v1/services');
    const services = servicesRes.data;
    
    const browserless = services.find(s => 
      s.name && s.name.toLowerCase().includes('browserless')
    );

    if (!browserless) {
      console.log('❌ Browserless service not found!');
      process.exit(1);
    }

    console.log('✅ Found Browserless service!');
    console.log(`   Name: ${browserless.name}`);
    console.log(`   UUID: ${browserless.uuid}\n`);

    // Get detailed service information
    console.log('─'.repeat(60));
    console.log('\n📋 Step 2: Service Details\n');

    try {
      const detailRes = await api.get(`/api/v1/services/${browserless.uuid}`);
      const details = detailRes.data;

      console.log('Service Information:');
      console.log(`  • Name: ${details.name || 'N/A'}`);
      console.log(`  • UUID: ${details.uuid}`);
      console.log(`  • Description: ${details.description || 'None'}`);
      console.log(`  • Created: ${details.created_at || 'N/A'}`);
      console.log(`  • Updated: ${details.updated_at || 'N/A'}`);

      if (details.fqdn) {
        console.log(`\n🌐 Domain Configuration:`);
        console.log(`  • FQDN: ${details.fqdn}`);
        console.log(`  • URL: https://${details.fqdn}`);
      }

      if (details.docker_compose) {
        console.log(`\n🐳 Docker Configuration:`);
        console.log(`  • Has docker-compose: Yes`);
      }

      // Check for environment variables
      if (details.environment_variables) {
        console.log(`\n🔧 Environment Variables: ${details.environment_variables.length || 0} configured`);
      }

    } catch (err) {
      console.log('⚠️  Could not get detailed service info:', err.message);
    }

    // Try to get the project information
    console.log('\n─'.repeat(60));
    console.log('\n📦 Step 3: Project Information\n');

    try {
      const projectsRes = await api.get('/api/v1/projects');
      const projects = projectsRes.data;

      // Find project that contains this service
      for (const project of projects) {
        if (project.name && project.name.toLowerCase().includes('browserless')) {
          console.log('✅ Found Browserless project!');
          console.log(`  • Project Name: ${project.name}`);
          console.log(`  • Project UUID: ${project.uuid}`);
          console.log(`  • Description: ${project.description || 'None'}`);

          // Get project details
          try {
            const projDetailRes = await api.get(`/api/v1/projects/${project.uuid}`);
            const projDetails = projDetailRes.data;
            
            if (projDetails.environments) {
              console.log(`  • Environments: ${projDetails.environments.length || 0}`);
            }
          } catch (err) {
            // Ignore
          }
          break;
        }
      }
    } catch (err) {
      console.log('⚠️  Could not get project info:', err.message);
    }

    // Check server assignment
    console.log('\n─'.repeat(60));
    console.log('\n🖥️  Step 4: Server Assignment\n');

    if (browserless.destination) {
      console.log(`✅ Server assigned:`);
      console.log(`   Server UUID: ${browserless.destination.uuid || browserless.destination}`);
      
      // Get server details
      try {
        const serversRes = await api.get('/api/v1/servers');
        const servers = serversRes.data;
        const server = servers.find(s => 
          s.uuid === (browserless.destination.uuid || browserless.destination)
        );
        
        if (server) {
          console.log(`   Server Name: ${server.name}`);
          console.log(`   Server IP: ${server.ip}`);
        }
      } catch (err) {
        // Ignore
      }
    }

    // Display full service object for debugging
    console.log('\n─'.repeat(60));
    console.log('\n🔍 Step 5: Complete Service Data\n');
    console.log(JSON.stringify(browserless, null, 2));

    console.log('\n─'.repeat(60));
    console.log('\n✨ Browserless check complete!\n');

  } catch (error) {
    console.error('\n❌ Error checking Browserless:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

checkBrowserless();
