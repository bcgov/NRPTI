const { MongoClient } = require('mongodb');

async function main() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db('nrpti-dev');
  const user = process.env.MONGO_USER || 'nrpti-admin';
  const pwd = process.env.MONGO_PASSWORD || 'nrpti-admin';

  // Create the user using db.command
  await db.command({
    createUser: user,
    pwd: pwd,
    roles: ['readWrite']
  });

  // Create collections
  const collections = [
    "audit",
    "description_summary_subset",
    "location_subset",
    "migrations",
    "nrpti",
    "record_name_subset",
    "redacted_record_subset",
    "acts_regulations_mapping"
  ];

  for (const col of collections) {
    // Only create if it doesn't exist
    const existing = await db.listCollections({ name: col }).toArray();
    if (existing.length === 0) {
      await db.createCollection(col, { capped: false });
    }
  }

  await client.close();
  console.log('Mongo seeded successfully!');
}

main().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
