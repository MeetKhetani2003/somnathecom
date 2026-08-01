const mongoose = require('mongoose');
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf-8');
const match = envContent.match(/MONGODB_URI=(.*)/);
const uri = match[1].replace(/['"]/g, '').trim();
async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const inqs = await db.collection('inquiries').find().toArray();
  console.log('Inquiries:', inqs.length);
  if (inqs.length > 0) console.log(JSON.stringify(inqs, null, 2));
  process.exit(0);
}
run();
