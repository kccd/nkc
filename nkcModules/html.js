const cheerio = require('cheerio');
const { domainWhitelistReg } = require('./regExp');
const { getUrl } = require('./tools');

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
function renderAtUsers(html = '', atUsers = []) {
  // 创建用户名到 UID 的映射
  const usersObj = {};
  const names = [];
  for (const { username, uid } of atUsers) {
    usersObj[username] = uid;
    const usernameLC = username.toLowerCase();
    usersObj[usernameLC] = uid;
    names.push(username, usernameLC);
  }

  // 解析 HTML
  const $ = cheerio.load(html, null, false);

  $('*').each((_, element) => {
    // 跳过 <a> 标签本身
    if ($(element).is('a')) {
      return;
    }
    $(element)
      .contents()
      .each((_, node) => {
        // 只处理纯文本节点，确保不会修改 <a> 标签内部的文本
        if (node.type === 'text') {
          const text = node.data;

          const replacedText = text.replace(
            new RegExp(`@(${names.join('|')})`, 'ig'),
            (match, username) => {
              const uid = usersObj[username];
              if (uid) {
                return `<a href="${getUrl(
                  'userHome',
                  uid,
                )}" target="_blank">@${username}</a>`;
              }
              return match; // 如果找不到用户，则不替换
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
module.exports = {
  getHTMLText,
  replaceLinksWithATags,
  replaceHTMLExternalLink,
  renderAtUsers,
};
