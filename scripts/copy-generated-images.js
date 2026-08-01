const fs = require('fs');
const path = require('path');

const brainDir = '/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f';
const targetDir = path.join(__dirname, '../public/products');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const files = fs.readdirSync(brainDir);
files.forEach((file) => {
  if (file.startsWith('bottle_lifestyle_desk')) {
    fs.copyFileSync(path.join(brainDir, file), path.join(targetDir, 'pure-glass-bottle-desk.jpg'));
    console.log('Copied desk lifestyle image');
  } else if (file.startsWith('bottle_macro_cap')) {
    fs.copyFileSync(path.join(brainDir, file), path.join(targetDir, 'pure-glass-bottle-macro.jpg'));
    console.log('Copied macro cap image');
  } else if (file.startsWith('bottle_kitchen_counter')) {
    fs.copyFileSync(path.join(brainDir, file), path.join(targetDir, 'pure-glass-bottle-kitchen.jpg'));
    console.log('Copied kitchen counter image');
  }
});

console.log('All generated images copied successfully!');
