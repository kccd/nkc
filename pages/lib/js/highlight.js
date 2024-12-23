import highlightLanguages from '../../../nkcModules/highlightLanguages.json';
import hljs from 'highlight.js';
const highlightLanguagesObject = {};
for (const item of highlightLanguages) {
  highlightLanguagesObject[item.type] = item.name;
}

export function fixLanguage(lang) {
  const alias = {
    js: 'javascript',
  };
  lang = alias[lang] || lang;
  return hljs.getLanguage(lang) ? lang : 'other';
}

export { highlightLanguages, highlightLanguagesObject };
