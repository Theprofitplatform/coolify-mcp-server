import 'dotenv/config';

const COOLIFY_BASE_URL = process.env.COOLIFY_BASE_URL;
const COOLIFY_TOKEN = process.env.COOLIFY_TOKEN;

// Unhealthy service UUIDs from health check
const UNHEALTHY_SERVICES = {
  'repair-redis': 'zw4gg88ckog0cs88go8wc4sc',
  'tpp-automation': 'eo444kos48oss40ksck0w8ow',
  'service-igkso404kokc4co0kk8os0ss (GitHub Runners)': 'vs4o4ogkcgwgwo8kgksg4koo',
  'service-agkcg888sw84ookgcg40gok4': 'hw44c4sw8c8o84cgow4s8gog'
};

async function checkUnhealthyServices() {
  console.log('\n⚠️  UNHEALTHY SERVICES INVESTIGATION\n');
  console.log('═══════════════════════════════════════════════════\n');

  for (const [name, uuid] of Object.entries(UNHEALTHY_SERVICES)) {
    console.log(`\n📦 ${name}`);
    console.log(`   UUID: ${uuid}`);

    try {
      const response = await fetch(`${COOLIFY_BASE_URL}/api/v1/services/${uuid}`, {
        headers: {
          'Authorization': `Bearer ${COOLIFY_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.log(`   ❌ API Error: ${response.status} ${response.statusText}`);
        continue;
      }

      const service = await response.json();

      console.log(`   Name: ${service.name}`);
      console.log(`   Type: ${service.type || 'N/A'}`);

      if (service.applications && service.applications.length > 0) {
        console.log(`   Applications: ${service.applications.length}`);

        service.applications.forEach((app, idx) => {
          console.log(`   \n   App ${idx + 1}: ${app.name}`);
          console.log(`      Status: ${app.status}`);
          console.log(`      Image: ${app.image || 'N/A'}`);
          console.log(`      FQDN: ${app.fqdn || 'N/A'}`);
          console.log(`      Last Online: ${app.last_online_at || 'N/A'}`);
        });
      }

      if (service.databases && service.databases.length > 0) {
        console.log(`   Databases: ${service.databases.length}`);

        service.databases.forEach((db, idx) => {
          console.log(`   \n   DB ${idx + 1}: ${db.name}`);
          console.log(`      Status: ${db.status}`);
          console.log(`      Type: ${db.type || 'N/A'}`);
        });
      }

      console.log('   ───────────────────────────────────────────────');

    } catch (error) {
      console.log(`   ❌ Error fetching details: ${error.message}`);
      console.log('   ───────────────────────────────────────────────');
    }
  }

  console.log('\n═══════════════════════════════════════════════════\n');
}

checkUnhealthyServices();
