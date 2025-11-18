const fluentuiEmoji = require('./fluentuiEmoji.json');
const emojiRegex = require('emoji-regex');
const regex = (emojiRegex.default || emojiRegex)();
const fluentuiEmojiUnicode = [];
const fluentuiEmoji_unicode_emoji = {};
const fluentuiEmoji_char_emoji = {};
const fluentuiEmojiObject = [];
for (const group of fluentuiEmoji) {
  const name = group.name;
  const emojiArr = [];
  for (const emoji of group.emoji) {
    const [unicode, glyph] = emoji.split(',');
    fluentuiEmojiUnicode.push(unicode);
    fluentuiEmoji_unicode_emoji[unicode] = {
      unicode,
      glyph,
    };
    fluentuiEmoji_char_emoji[glyph] = {
      unicode,
      glyph,
    };
    emojiArr.push({
      unicode,
      glyph,
    });
  }
  fluentuiEmojiObject.push({
    name,
    emoji: emojiArr,
  });
}

function replaceEmojiWithImgTags(htmlString = '') {
  const { getUrl } = require('./tools');
  return htmlString.replace(regex, (char) => {
    const emoji = fluentuiEmoji_char_emoji[char];
    if (!emoji) {
      return char;
    }
    const emojiUrl = getUrl('emoji', emoji.unicode);
    return `<img src="${emojiUrl}" class="emoji" data-tag="nkcsource" data-type="twemoji" alt="${char}">`;
  });
}

function getEmojiCharByUnicode(unicode) {
  const emoji = fluentuiEmoji_unicode_emoji[unicode];
  if (!emoji) {
    return '?';
  }
  return emoji.glyph;
}

const fluentEmojiRegex = buildEmojiRegex();

function buildEmojiRegex() {
  const glyphs = Object.keys(fluentuiEmoji_char_emoji);
  const escapedGlyphs = glyphs.map((g) =>
    g.replace(/([.*+?^${}()|[\]\\])/g, '\\$1'),
  );
  // 使用分组一次性加锚点，避免为每个分支重复 ^$
  const emojiPattern = `^(?:${escapedGlyphs.join('|')})$`;
  return new RegExp(emojiPattern);
}

// 检查 emoji 是否存在
function checkEmojiChartInJson(emoji) {
  // 使用正则表达式判断
  const test = fluentEmojiRegex.test(emoji);
  return test;
}

module.exports = {
  fluentuiEmojiUnicode,
  fluentuiEmoji,
  fluentuiEmojiObject,
  replaceEmojiWithImgTags,
  getEmojiCharByUnicode,
  checkEmojiChartInJson,
};
