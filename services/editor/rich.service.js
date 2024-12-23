const {
  getRichJsonContentLength,
  getLength,
} = require('../../nkcModules/checkData');
const cheerio = require('cheerio');
class EditorRichService {
  getRichContentByteSize(l, c) {
    if (l === 'json') {
      return getRichJsonContentLength(c);
    } else {
      return getLength(cheerio.load(c).text());
    }
  }

  getRichContentWordsSize(l, c) {
    if (l === 'json') {
      return Math.ceil(getRichJsonContentLength(c) / 2);
    } else {
      return cheerio.load(c).text();
    }
  }
}

module.exports = {
  editorRichService: new EditorRichService(),
};
