const fs = require('fs');
const files = [
  'src/app/admin/users/[id]/page.tsx',
  'src/app/admin/page.tsx',
  'src/app/admin/products/create/page.tsx',
  'src/app/admin/products/[id]/edit/page.tsx',
  'src/app/admin/orders/create/page.tsx'
];

for (let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('alert(')) {
    // Add import if not present
    if (!content.includes('fireToast')) {
      if (content.includes('"use client";')) {
        content = content.replace('"use client";\n', '"use client";\nimport { fireToast } from "@/context/ToastContext";\n');
      } else {
        content = 'import { fireToast } from "@/context/ToastContext";\n' + content;
      }
    }
    
    // Replace alert( with fireToast(
    content = content.replace(/alert\(/g, 'fireToast(');
    
    fs.writeFileSync(file, content);
    console.log('Fixed ' + file);
  }
}
