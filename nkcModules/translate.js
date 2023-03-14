const languages = require('../languages');

function translate(languageName, type, value, args = []) {
  const language = languages[languageName];
  const file = language[type];
  let content = file[value] || value;
  return content.replace(/\{v([1-9]+)}/gi, (c, v) => {
    return args[Number(v) - 1] || 'unknown';
  });
}

function translateResponseType(languageName, value, args = []) {
  return translate(languageName, 'response', value, args);
}

function translateSensitiveSettingName(languageName, value, args = []) {
  return translate(languageName, 'sensitiveSettings', value, args);
}

function translateSensitiveCheckerStatus(languageName, value, args = []) {
  return translate(languageName, 'sensitiveCheckerStatus', value, args);
}

module.exports = {
  translate,
  translateResponseType,
  translateSensitiveSettingName,
  translateSensitiveCheckerStatus,
};
