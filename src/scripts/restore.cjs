const mongoose = require('mongoose');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const match = envContent.match(/MONGODB_URI=(.*)/);
const uri = match[1].replace(/['"]/g, '').trim();

const recoveredProducts = [
  {
    "id": 110,
    "title": " Tenecil Full Night Suit Premium Collection ",
    "price": 570,
    "image": "/api/image/6a562cfaf17f066aa58c4de0",
    "category": "Premium Collection > Tencel > Full Suit",
    "mrp": 670,
    "rating": 4.5,
    "tag": "Bestseller",
    "description": "Recovered from past orders.",
    "stock": 50,
    "sizes": [
      { "size": "M", "stock": 10 },
      { "size": "L", "stock": 10 },
      { "size": "XL", "stock": 10 },
      { "size": "2XL", "stock": 10 },
      { "size": "3XL", "stock": 10 }
    ],
    "colors": [
      {
        "name": "Grey black",
        "images": ["/api/image/6a562cfaf17f066aa58c4de0"],
        "sizes": [{ "size": "M", "stock": 10 }, { "size": "L", "stock": 10 }, { "size": "XL", "stock": 10 }, { "size": "2XL", "stock": 10 }, { "size": "3XL", "stock": 10 }]
      },
      {
        "name": "Light pista green/ Teal Blue",
        "images": ["/api/image/6a562cfaf17f066aa58c4de0"],
        "sizes": [{ "size": "M", "stock": 10 }]
      }
    ],
    "images": ["/api/image/6a562cfaf17f066aa58c4de0"]
  },
  {
    "id": 105,
    "title": "Premium Full night suit",
    "price": 380,
    "image": "/api/image/6a549a49626e0f51e3d7d70b",
    "category": "Premium Collection > Full Suit",
    "mrp": 480,
    "rating": 4.5,
    "tag": "",
    "description": "Recovered from past orders.",
    "stock": 30,
    "sizes": [{ "size": "XL", "stock": 10 }],
    "colors": [
      { "name": "Blue", "images": ["/api/image/6a549a49626e0f51e3d7d70b"], "sizes": [{ "size": "XL", "stock": 10 }] },
      { "name": "Black", "images": ["/api/image/6a549a49626e0f51e3d7d70b"], "sizes": [{ "size": "XL", "stock": 10 }] },
      { "name": "Baby pink", "images": ["/api/image/6a549a49626e0f51e3d7d70b"], "sizes": [{ "size": "XL", "stock": 10 }] }
    ],
    "images": ["/api/image/6a549a49626e0f51e3d7d70b"]
  },
  {
    "id": 111,
    "title": "over size t-shart",
    "price": 220,
    "image": "/api/image/6a6ae10a56184874df936726",
    "category": "T-Shirts > Oversize",
    "mrp": 320,
    "rating": 4.5,
    "tag": "",
    "description": "Recovered from past orders.",
    "stock": 20,
    "sizes": [{ "size": "M", "stock": 10 }, { "size": "L", "stock": 10 }],
    "colors": [
      { "name": "Maroon", "images": ["/api/image/6a6ae10a56184874df936726"], "sizes": [{ "size": "M", "stock": 10 }, { "size": "L", "stock": 10 }] }
    ],
    "images": ["/api/image/6a6ae10a56184874df936726"]
  },
  {
    "id": 109,
    "title": "Gents Short Night Suit",
    "price": 440,
    "image": "/api/image/6a55e21cdccca9333098c208",
    "category": "Men's Collection > Night Suits",
    "mrp": 540,
    "rating": 4.5,
    "tag": "",
    "description": "Recovered from past orders.",
    "stock": 10,
    "sizes": [{ "size": "M", "stock": 10 }],
    "colors": [
      { "name": "Dark grey", "images": ["/api/image/6a55e21cdccca9333098c208"], "sizes": [{ "size": "M", "stock": 10 }] }
    ],
    "images": ["/api/image/6a55e21cdccca9333098c208"]
  },
  {
    "id": 108,
    "title": "Gents Capri Night Suit",
    "price": 470,
    "image": "/api/image/6a55dd8b532a6e2ceeedb6ab",
    "category": "Men's Collection > Night Suits",
    "mrp": 570,
    "rating": 4.5,
    "tag": "",
    "description": "Recovered from past orders.",
    "stock": 20,
    "sizes": [{ "size": "M", "stock": 10 }, { "size": "2XL", "stock": 10 }],
    "colors": [
      { "name": "Black", "images": ["/api/image/6a55dd8b532a6e2ceeedb6ab"], "sizes": [{ "size": "M", "stock": 10 }, { "size": "2XL", "stock": 10 }] },
      { "name": "Coffee", "images": ["/api/image/6a55dd8b532a6e2ceeedb6ab"], "sizes": [{ "size": "2XL", "stock": 10 }] }
    ],
    "images": ["/api/image/6a55dd8b532a6e2ceeedb6ab"]
  },
  {
    "id": 104,
    "title": " Ladies Short Night Suit set",
    "price": 920,
    "image": "/api/image/6a548b217ac281894ddb3c81",
    "category": "Ladies Collection > Night Suits",
    "mrp": 1020,
    "rating": 4.5,
    "tag": "",
    "description": "Recovered from past orders.",
    "stock": 10,
    "sizes": [{ "size": "XL", "stock": 10 }],
    "colors": [
      { "name": "Black", "images": ["/api/image/6a548b217ac281894ddb3c81"], "sizes": [{ "size": "XL", "stock": 10 }] }
    ],
    "images": ["/api/image/6a548b217ac281894ddb3c81"]
  }
];

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  
  // First, drop the mock products added by the script (IDs > 200)
  await db.collection('products').deleteMany({ id: { $gt: 200 } });
  
  // Insert the recovered products if they don't already exist
  for (const p of recoveredProducts) {
    p.sku = 'SOM-NX-' + p.id;
    await db.collection('products').updateOne({ id: p.id }, { $set: p }, { upsert: true });
  }
  
  console.log("Successfully inserted recovered products.");
  process.exit(0);
}
run();
