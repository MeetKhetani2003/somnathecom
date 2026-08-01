const mongoose = require('mongoose');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const match = envContent.match(/MONGODB_URI=(.*)/);
const uri = match[1].replace(/['"]/g, '').trim();

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  
  const cols = await db.listCollections().toArray();
  console.log('Collections:', cols.map(c => c.name));
  
  try {
    const orders = await db.collection('orders').find().toArray();
    console.log('Orders Count:', orders.length);
    if (orders.length > 0) {
      console.log('Orders:', JSON.stringify(orders.slice(0, 5), null, 2));
    }
  } catch(e) {
    console.log('No orders collection');
  }
  
  try {
    const files = await db.collection('fs.files').find().toArray();
    console.log('Files Count:', files.length);
    console.log('Files:', JSON.stringify(files.map(f => ({ id: f._id, filename: f.filename, uploadDate: f.uploadDate })), null, 2));
  } catch(e) {
    console.log('No files collection');
  }
  
  process.exit(0);
}
run();
