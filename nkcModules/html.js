const cheerio = require('cheerio');
const { domainWhitelistReg } = require('./regExp');

function getHTMLText(html = '') {
  const $ = cheerio.load(html);
  return $('body').text();
}

function replaceLinksWithATags(html = '') {
  const $ = cheerio.load(html, null, false);

  $('*').each((_, element) => {
    $(element)
      .contents()
      .each((_, node) => {
        if (node.type === 'text') {
          const text = node.data;
          const replacedText = text.replace(
            /(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g,
            (url) => {
              return `<a href="${url}" target="_blank">${url}</a>`;
            },
          );

          if (replacedText !== text) {
            $(node).replaceWith(replacedText);
          }
        }
      });
  });

  return $.html();
}

function replaceHTMLExternalLink(html = '') {
  const $ = cheerio.load(html, null, false);
  const aElements = $('a');
  for (let i = 0; i < aElements.length; i++) {
    const aElement = aElements.eq(i);
    const href = aElement.attr('href');
    // 外链在新标签页打开
    if (href && !domainWhitelistReg.test(href)) {
      aElement.attr('target', '_blank');
      // 通过提示页代理外链的访问
      const url = encodeURIComponent(Buffer.from(href).toString('base64'));
      aElement.attr('href', '/l?t=' + url);
    }
  }
  return $.html();
}
module.exports = {
  getHTMLText,
  replaceLinksWithATags,
  replaceHTMLExternalLink,
};
