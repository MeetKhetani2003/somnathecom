const mongoose = require('mongoose');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const match = envContent.match(/MONGODB_URI=(.*)/);
const uri = match[1].replace(/['"]/g, '').trim();

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  
  const orders = await db.collection('orders').find().toArray();
  const productMap = new Map();
  
  for (const order of orders) {
    if (order.items && order.items.length) {
      for (const item of order.items) {
        if (!productMap.has(item.productId)) {
          productMap.set(item.productId, {
            id: item.productId,
            title: item.title,
            price: item.price,
            image: item.image,
            category: "Recovered",
            mrp: item.price + 100, // Guessing MRP
            rating: 4.5,
            tag: "",
            description: "",
            stock: 10,
            sizes: [],
            colors: [],
            images: [item.image]
          });
        }
        const p = productMap.get(item.productId);
        
        // Collect sizes and colors
        if (item.size) {
           const sizeExists = p.sizes.find(s => s.size === item.size);
           if (!sizeExists) p.sizes.push({ size: item.size, stock: 10 });
        }
        
        if (item.color) {
           const colorExists = p.colors.find(c => c.name === item.color);
           if (!colorExists) p.colors.push({ name: item.color, images: [item.image], sizes: item.size ? [{ size: item.size, stock: 10 }] : [] });
           else if (item.size) {
             const cSizeExists = colorExists.sizes.find(s => s.size === item.size);
             if (!cSizeExists) colorExists.sizes.push({ size: item.size, stock: 10 });
           }
        }
      }
    }
  }
  
  const recoveredProducts = Array.from(productMap.values());
  console.log("Recoverable Products Found:", recoveredProducts.length);
  console.log(JSON.stringify(recoveredProducts, null, 2));
  
  process.exit(0);
}
run();
