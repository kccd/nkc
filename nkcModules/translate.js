const languages = require('../languages');
module.exports = (languageName, type, value) => {
  const language = languages[languageName];
  return language[type][value] || value;
}