// seed-mongo.js
const { MongoClient } = require('mongodb');

async function main() {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db('nrpti-dev');
    const user = process.env.MONGO_USER || 'nrpti-admin';
    const pwd = process.env.MONGO_PASSWORD || 'nrpti-admin';

    await db.addUser(user, pwd, { roles: ['readWrite'] });
    await db.createCollection("audit", {capped: false});
    await db.createCollection("description_summary_subset", {capped: false});
    await db.createCollection("location_subset", {capped: false});
    await db.createCollection("migrations", {capped: false});
    await db.createCollection("nrpti", {capped: false});
    await db.createCollection("record_name_subset", {capped: false});
    await db.createCollection("redacted_record_subset", {capped: false});
    await db.createCollection("acts_regulations_mapping", {capped: false});

    await client.close();
    console.log('Mongo seeded');
}

main().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
