const mongoose = require('mongoose');
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf-8');
const match = envContent.match(/MONGODB_URI=(.*)/);
const uri = match[1].replace(/['"]/g, '').trim();

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  
  const files = await db.collection('images.files').find().toArray();
  console.log('GridFS Files:', files.map(f => ({ id: f._id, name: f.filename, date: f.uploadDate })));
  process.exit(0);
}
run();
