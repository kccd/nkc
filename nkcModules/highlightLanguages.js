const highlightLanguages = require('./highlightLanguages.json');
const highlightLanguagesObject = {};
for (const item of highlightLanguages) {
  highlightLanguagesObject[item.type] = item.name;
}
module.exports = { highlightLanguages, highlightLanguagesObject };
