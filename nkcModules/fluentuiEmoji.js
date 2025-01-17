const fluentuiEmoji = require('./fluentuiEmoji.json');
const emojiRegex = require('emoji-regex');
const regex = (emojiRegex.default || emojiRegex)();
const fluentuiEmojiUnicode = [];
const fluentuiEmoji_unicode_emoji = {};
const fluentuiEmoji_char_emoji = {};

const fluentEmojiRegex = buildEmojiRegex(fluentuiEmoji);
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

function buildEmojiRegex() {
    const glyphs = fluentuiEmoji.flatMap((set) => set.emoji.map((e) => e.glyph));

    const escapedGlyphs = glyphs.map((g) =>
        g.replace(/([.*+?^${}()|[\]\\])/g, '\\$1'),
    );
    const emojiPattern = escapedGlyphs.map((g) => `^${g}$`).join('|');
    return new RegExp(`${emojiPattern}`);
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
    replaceEmojiWithImgTags,
    getEmojiCharByUnicode,
    checkEmojiChartInJson,
};