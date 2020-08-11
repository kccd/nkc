const fs = require('fs');
const path = require('path');
const dir = fs.readdirSync(path.resolve(__dirname, `../public/twemoji/2/svg`));
const twemoji = [];

for(let t of dir) {
  t = t.replace('.svg', '');
  twemoji.push(t);
}
module.exports = {
  twemoji
};
