/* eslint-disable linebreak-style */
import highlightLanguages from '../../../nkcModules/highlightLanguages.json';
import hljs from 'highlight.js/lib/core';
// 按需引入并注册需要的语言，避免将所有 languages 打包进来
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import sql from 'highlight.js/lib/languages/sql';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import markdown from 'highlight.js/lib/languages/markdown';
import yaml from 'highlight.js/lib/languages/yaml';
import perl from 'highlight.js/lib/languages/perl';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import rust from 'highlight.js/lib/languages/rust';
import dart from 'highlight.js/lib/languages/dart';
import scala from 'highlight.js/lib/languages/scala';
import r from 'highlight.js/lib/languages/r';
import lua from 'highlight.js/lib/languages/lua';
import plaintext from 'highlight.js/lib/languages/plaintext';
import shell from 'highlight.js/lib/languages/shell';
// 注册白名单语言
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('php', php);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('go', go);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', shell);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('perl', perl);
hljs.registerLanguage('swift', swift);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('dart', dart);
hljs.registerLanguage('scala', scala);
hljs.registerLanguage('r', r);
hljs.registerLanguage('lua', lua);
hljs.registerLanguage('text', plaintext);

const highlightLanguagesObject = {};
for (const item of highlightLanguages) {
  highlightLanguagesObject[item.type] = item.name;
}

export function fixLanguage(lang) {
  const alias = {
    js: 'javascript',
    ts: 'typescript',
    sh: 'bash',
    md: 'markdown',
    yml: 'yaml',
    'c#': 'csharp',
  };
  lang = alias[lang] || lang;
  return hljs.getLanguage(lang) ? lang : 'other';
}

// 导出已配置的 hljs，便于其他模块直接复用精简后的体积
export { hljs };
export default hljs;
export { highlightLanguages, highlightLanguagesObject };
