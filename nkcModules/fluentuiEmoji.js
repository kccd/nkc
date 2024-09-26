const fluentuiEmoji = require('./fluentuiEmoji.json');

const fluentuiEmojiUnicode = [];

for (const group of fluentuiEmoji) {
  for (const emoji of group.emoji) {
    fluentuiEmojiUnicode.push(emoji.unicode);
  }
}

module.exports = {
  fluentuiEmojiUnicode,
  fluentuiEmoji,
};
