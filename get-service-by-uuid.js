import 'dotenv/config';

const COOLIFY_BASE_URL = process.env.COOLIFY_BASE_URL;
const COOLIFY_TOKEN = process.env.COOLIFY_TOKEN;
const SERVICE_UUID = process.argv[2];

if (!SERVICE_UUID) {
  console.error('❌ Error: Please provide service UUID as argument');
  process.exit(1);
}

async function getServiceDetails() {
  try {
    const response = await fetch(`${COOLIFY_BASE_URL}/api/v1/services/${SERVICE_UUID}`, {
      headers: {
        'Authorization': `Bearer ${COOLIFY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const service = await response.json();

    console.log('\n📦 Service Details:\n');
    console.log(`Name: ${service.name}`);
    console.log(`UUID: ${service.uuid}\n`);

    if (service.applications && service.applications.length > 0) {
      console.log(`Applications (${service.applications.length}):`);
      service.applications.forEach((app, idx) => {
        console.log(`\n  ${idx + 1}. ${app.name}`);
        console.log(`     Status: ${app.status}`);
        console.log(`     Image: ${app.image || 'N/A'}`);
        console.log(`     Container ID: Check docker ps for name containing "${app.name}"`);
      });
    }

    if (service.databases && service.databases.length > 0) {
      console.log(`\nDatabases (${service.databases.length}):`);
      service.databases.forEach((db, idx) => {
        console.log(`\n  ${idx + 1}. ${db.name}`);
        console.log(`     Status: ${db.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getServiceDetails();
