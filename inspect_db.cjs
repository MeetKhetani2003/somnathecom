const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection;
  const order = await db.collection('orders').findOne({ _id: new mongoose.Types.ObjectId('6a6b5c1d3c960167cda00804') });
  console.log(order);
  const coupon = await db.collection('coupons').findOne({ code: 'KHATA20' });
  console.log(coupon);
  process.exit(0);
});
