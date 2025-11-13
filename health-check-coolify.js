#!/usr/bin/env node
/**
 * Coolify Comprehensive Health Check
 * Uses MCP tools to verify Coolify setup
 */

import axios from 'axios';
import 'dotenv/config';

const BASE_URL = process.env.COOLIFY_BASE_URL;
const TOKEN = process.env.COOLIFY_TOKEN;

if (!BASE_URL || !TOKEN) {
  console.error('❌ Missing environment variables!');
  console.error('   Please configure COOLIFY_BASE_URL and COOLIFY_TOKEN in .env');
  process.exit(1);
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Accept': 'application/json'
  }
});

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                                                            ║');
console.log('║        🏥 Coolify Comprehensive Health Check 🏥           ║');
console.log('║                                                            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const issues = [];

// Helper function
function checkResult(name, passed, details = '') {
  totalChecks++;
  if (passed) {
    passedChecks++;
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
  } else {
    failedChecks++;
    console.log(`❌ ${name}`);
    if (details) {
      console.log(`   ${details}`);
      issues.push(`${name}: ${details}`);
    }
  }
}

async function runHealthCheck() {
  console.log('📍 Coolify Instance:', BASE_URL);
  console.log('🔑 API Token:', TOKEN.substring(0, 20) + '...\n');
  console.log('─'.repeat(60));
  console.log('\n🔍 1. SYSTEM HEALTH\n');

  // 1. Check version
  try {
    const res = await api.get('/api/v1/version');
    checkResult('Coolify Version', true, `v${res.data}`);
  } catch (error) {
    checkResult('Coolify Version', false, error.message);
  }

  // 2. Check health endpoint
  try {
    const res = await api.get('/api/v1/health');
    checkResult('Health Endpoint', res.status === 200, 'System operational');
  } catch (error) {
    checkResult('Health Endpoint', false, error.message);
  }

  console.log('\n─'.repeat(60));
  console.log('\n🖥️  2. SERVERS\n');

  // 3. List servers
  try {
    const res = await api.get('/api/v1/servers');
    const servers = res.data;
    checkResult('Servers List', servers && servers.length > 0, `Found ${servers.length} server(s)`);

    if (servers && servers.length > 0) {
      console.log('\n   📋 Server Details:');
      for (const server of servers) {
        console.log(`   • ${server.name || 'Unnamed'}`);
        console.log(`     - ID: ${server.uuid}`);
        console.log(`     - IP: ${server.ip || 'N/A'}`);
        console.log(`     - Status: ${server.validation_logs || 'Unknown'}`);

        // Try to get server resources
        try {
          const resourceRes = await api.get(`/api/v1/servers/${server.uuid}/resources`);
          if (resourceRes.data) {
            console.log(`     - Resources: Available ✅`);
          }
        } catch (err) {
          console.log(`     - Resources: Not available ⚠️`);
        }
      }
    }
  } catch (error) {
    checkResult('Servers List', false, error.message);
  }

  console.log('\n─'.repeat(60));
  console.log('\n📦 3. PROJECTS\n');

  // 4. List projects
  try {
    const res = await api.get('/api/v1/projects');
    const projects = res.data;
    checkResult('Projects', projects && projects.length >= 0, `Found ${projects.length} project(s)`);

    if (projects && projects.length > 0) {
      console.log('\n   📋 Project Details:');
      for (const project of projects.slice(0, 5)) { // Show first 5
        console.log(`   • ${project.name}`);
        console.log(`     - UUID: ${project.uuid}`);
        console.log(`     - Description: ${project.description || 'None'}`);
      }
      if (projects.length > 5) {
        console.log(`   ... and ${projects.length - 5} more`);
      }
    }
  } catch (error) {
    checkResult('Projects', false, error.message);
  }

  console.log('\n─'.repeat(60));
  console.log('\n👥 4. TEAMS\n');

  // 5. Check teams
  try {
    const res = await api.get('/api/v1/teams');
    const teams = res.data;
    checkResult('Teams', teams && teams.length > 0, `Found ${teams.length} team(s)`);

    // Get current team
    try {
      const currentTeamRes = await api.get('/api/v1/teams/current');
      const currentTeam = currentTeamRes.data;
      console.log(`\n   📋 Current Team: ${currentTeam.name}`);
      console.log(`      - ID: ${currentTeam.id}`);

      // Get team members
      try {
        const membersRes = await api.get('/api/v1/teams/current/members');
        const members = membersRes.data;
        checkResult('Team Members', members && members.length > 0, `${members.length} member(s)`);
      } catch (err) {
        checkResult('Team Members', false, err.message);
      }
    } catch (err) {
      checkResult('Current Team', false, err.message);
    }
  } catch (error) {
    checkResult('Teams', false, error.message);
  }

  console.log('\n─'.repeat(60));
  console.log('\n🌍 5. ENVIRONMENTS\n');

  // 6. List environments
  try {
    const res = await api.get('/api/v1/environments');
    const environments = res.data;
    checkResult('Environments', environments && environments.length >= 0, `Found ${environments.length} environment(s)`);

    if (environments && environments.length > 0) {
      console.log('\n   📋 Environment Details:');
      for (const env of environments.slice(0, 5)) {
        console.log(`   • ${env.name}`);
        console.log(`     - Project: ${env.project?.name || 'Unknown'}`);
      }
    }
  } catch (error) {
    checkResult('Environments', false, error.message);
  }

  console.log('\n─'.repeat(60));
  console.log('\n🚀 6. APPLICATIONS\n');

  // 7. List applications
  try {
    const res = await api.get('/api/v1/applications');
    const applications = res.data;
    checkResult('Applications', applications && applications.length >= 0, `Found ${applications.length} application(s)`);

    if (applications && applications.length > 0) {
      console.log('\n   📋 Application Details:');
      const statusCounts = { running: 0, stopped: 0, other: 0 };

      for (const app of applications.slice(0, 10)) { // Show first 10
        const status = app.status || 'unknown';
        if (status.includes('running')) statusCounts.running++;
        else if (status.includes('stopped')) statusCounts.stopped++;
        else statusCounts.other++;

        console.log(`   • ${app.name || 'Unnamed'}`);
        console.log(`     - UUID: ${app.uuid}`);
        console.log(`     - Status: ${status}`);
        console.log(`     - FQDN: ${app.fqdn || 'Not set'}`);
      }

      if (applications.length > 10) {
        console.log(`   ... and ${applications.length - 10} more`);
      }

      console.log(`\n   📊 Status Summary:`);
      console.log(`      - Running: ${statusCounts.running}`);
      console.log(`      - Stopped: ${statusCounts.stopped}`);
      console.log(`      - Other: ${statusCounts.other}`);
    }
  } catch (error) {
    checkResult('Applications', false, error.message);
  }

  console.log('\n─'.repeat(60));
  console.log('\n⚙️  7. SERVICES\n');

  // 8. List services
  try {
    const res = await api.get('/api/v1/services');
    const services = res.data;
    checkResult('Services', services && services.length >= 0, `Found ${services.length} service(s)`);

    if (services && services.length > 0) {
      console.log('\n   📋 Service Details:');
      for (const service of services.slice(0, 10)) {
        console.log(`   • ${service.name || 'Unnamed'}`);
        console.log(`     - UUID: ${service.uuid}`);
        console.log(`     - Type: ${service.type || 'Unknown'}`);
      }
      if (services.length > 10) {
        console.log(`   ... and ${services.length - 10} more`);
      }
    }
  } catch (error) {
    checkResult('Services', false, error.message);
  }

  console.log('\n─'.repeat(60));
  console.log('\n🔑 8. PRIVATE KEYS\n');

  // 9. List private keys
  try {
    const res = await api.get('/api/v1/security/keys');
    const keys = res.data;
    checkResult('Private Keys', keys && keys.length >= 0, `Found ${keys.length} SSH key(s)`);

    if (keys && keys.length > 0) {
      console.log('\n   📋 SSH Keys:');
      for (const key of keys) {
        console.log(`   • ${key.name || 'Unnamed'}`);
        console.log(`     - ID: ${key.id}`);
      }
    }
  } catch (error) {
    checkResult('Private Keys', false, error.message);
  }

  console.log('\n─'.repeat(60));
  console.log('\n📊 9. DEPLOYMENTS\n');

  // 10. Recent deployments
  try {
    const res = await api.get('/api/v1/deployments');
    const deployments = res.data;
    checkResult('Deployments History', deployments && deployments.length >= 0, `Found ${deployments.length} deployment(s)`);

    if (deployments && deployments.length > 0) {
      console.log('\n   📋 Recent Deployments (last 5):');
      for (const deployment of deployments.slice(0, 5)) {
        console.log(`   • ${deployment.application?.name || 'Unknown'}`);
        console.log(`     - Status: ${deployment.status || 'Unknown'}`);
        console.log(`     - Started: ${deployment.created_at || 'Unknown'}`);
      }
    }
  } catch (error) {
    checkResult('Deployments History', false, error.message);
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('\n📈 HEALTH CHECK SUMMARY\n');

  const successRate = ((passedChecks / totalChecks) * 100).toFixed(1);

  console.log(`Total Checks:    ${totalChecks}`);
  console.log(`✅ Passed:        ${passedChecks} (${successRate}%)`);
  console.log(`❌ Failed:        ${failedChecks}`);
  console.log('');

  if (successRate >= 90) {
    console.log('🎉 Overall Status: EXCELLENT - All systems operational!');
  } else if (successRate >= 70) {
    console.log('⚠️  Overall Status: GOOD - Minor issues detected');
  } else if (successRate >= 50) {
    console.log('⚠️  Overall Status: FAIR - Several issues need attention');
  } else {
    console.log('🚨 Overall Status: POOR - Critical issues detected!');
  }

  if (issues.length > 0) {
    console.log('\n⚠️  Issues Found:\n');
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }

  console.log('\n' + '═'.repeat(60));
  console.log('\n✨ Health check complete!\n');

  // Exit code based on success rate
  process.exit(successRate >= 70 ? 0 : 1);
}

// Run the health check
runHealthCheck().catch(error => {
  console.error('\n❌ Health check failed:', error.message);
  process.exit(1);
});
