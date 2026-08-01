const mongoose = require('mongoose');
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf-8');
const match = envContent.match(/MONGODB_URI=(.*)/);
const uri = match[1].replace(/['"]/g, '').trim();

async function run() {
  await mongoose.connect(uri);
  const adminDb = mongoose.connection.db.admin();
  try {
    const listDbs = await adminDb.listDatabases();
    console.log("Databases:");
    for (const db of listDbs.databases) {
      console.log(`- ${db.name}`);
      const dbInstance = mongoose.connection.client.db(db.name);
      const cols = await dbInstance.listCollections().toArray();
      const hasProducts = cols.find(c => c.name === 'products');
      if (hasProducts) {
        const prodCount = await dbInstance.collection('products').countDocuments();
        console.log(`  -> 'products' collection has ${prodCount} documents`);
      }
    }
  } catch (e) {
    console.log("Cannot list databases due to permissions (M0 cluster).");
    console.log(e.message);
  }
  process.exit(0);
}
run();
