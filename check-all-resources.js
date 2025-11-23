import 'dotenv/config';

const COOLIFY_BASE_URL = process.env.COOLIFY_BASE_URL;
const COOLIFY_TOKEN = process.env.COOLIFY_TOKEN;

async function checkAllResources() {
  try {
    // Get servers
    const serversResp = await fetch(`${COOLIFY_BASE_URL}/api/v1/servers`, {
      headers: { 'Authorization': `Bearer ${COOLIFY_TOKEN}` }
    });
    const servers = await serversResp.json();

    console.log('\n🖥️  SERVER RESOURCE USAGE\n');
    console.log('═══════════════════════════════════════════════════\n');

    for (const server of servers) {
      const serverName = server.name || 'Unnamed Server';
      console.log(`\n📍 ${serverName}`);
      console.log(`   IP: ${server.ip}`);
      console.log(`   UUID: ${server.uuid}`);

      // Get resources for this server
      try {
        const resourceResp = await fetch(`${COOLIFY_BASE_URL}/api/v1/servers/${server.uuid}/resources`, {
          headers: { 'Authorization': `Bearer ${COOLIFY_TOKEN}` }
        });

        if (resourceResp.ok) {
          const resources = await resourceResp.json();
          console.log(`   CPU Usage: ${resources.cpu || 'N/A'}`);
          console.log(`   Memory: ${resources.memory || 'N/A'}`);
          console.log(`   Disk: ${resources.disk || 'N/A'}`);
        } else {
          console.log(`   ⚠️  Resources not available (status ${resourceResp.status})`);
        }
      } catch (err) {
        console.log(`   ⚠️  Could not fetch resources: ${err.message}`);
      }
      console.log('   ───────────────────────────────────────────────');
    }

    console.log('\n═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAllResources();
