const fluentuiEmoji = require('./fluentuiEmoji.json');
const emojiRegex = require('emoji-regex');
const regex = (emojiRegex.default || emojiRegex)();
const fluentuiEmojiUnicode = [];
const fluentuiEmoji_unicode_emoji = {};
const fluentuiEmoji_char_emoji = {};

for (const group of fluentuiEmoji) {
  for (const emoji of group.emoji) {
    fluentuiEmojiUnicode.push(emoji.unicode);
    fluentuiEmoji_unicode_emoji[emoji.unicode] = emoji;
    fluentuiEmoji_char_emoji[emoji.glyph] = emoji;
  }
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

module.exports = {
  fluentuiEmojiUnicode,
  fluentuiEmoji,
  replaceEmojiWithImgTags,
  getEmojiCharByUnicode,
};
