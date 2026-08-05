const fs = require('fs');
const path = require('path');

const brainDir = '/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f';
const coverFile = path.join(__dirname, '../public/products/pure-glass-water-bottle.jpg');

let deskPath = '';
let macroPath = '';
let kitchenPath = '';

const brainFiles = fs.readdirSync(brainDir);
brainFiles.forEach((f) => {
  if (f.startsWith('bottle_lifestyle_desk')) deskPath = path.join(brainDir, f);
  if (f.startsWith('bottle_macro_cap')) macroPath = path.join(brainDir, f);
  if (f.startsWith('bottle_kitchen_counter')) kitchenPath = path.join(brainDir, f);
});

function toBase64(fileP) {
  if (fs.existsSync(fileP)) {
    const buf = fs.readFileSync(fileP);
    return `data:image/jpeg;base64,${buf.toString('base64')}`;
  }
  return '';
}

const coverB64 = toBase64(coverFile);
const deskB64 = toBase64(deskPath);
const macroB64 = toBase64(macroPath);
const kitchenB64 = toBase64(kitchenPath);

const content = `export const BOTTLE_IMAGES_BASE64 = {
  cover: "${coverB64}",
  desk: "${deskB64}",
  macro: "${macroB64}",
  kitchen: "${kitchenB64}"
};
`;

fs.writeFileSync(path.join(__dirname, '../src/lib/bottle-images-base64.ts'), content);
console.log('Successfully created src/lib/bottle-images-base64.ts with embedded base64 data!');
