/*
 * 字符串转对象，对应pug渲染函数objToStr
 * @param {String} str 对象字符串
 * @return {Object}
 * @author pengxiguaa 2019-7-26
 * */
import { marked } from 'marked';
import createDOMPurify from 'dompurify';

export function strToObj(str) {
  return JSON.parse(decodeURIComponent(str));
}

export function objToStr(obj) {
  return encodeURIComponent(JSON.stringify(obj));
}

/*
 * 指定 DOM ID 获取放在 DOM 中的数据
 * @param {String} id
 * @return {Object}
 * */
export function getDataById(id) {
  const dom = document.getElementById(id);
  if (dom) {
    return strToObj(dom.innerHTML);
  } else {
    return {};
  }
}

/*
 * 解码 url 转移之后的 base64 内容
 * @param {String}
 * @return {String}
 * */
export function base64ToStr(base64) {
  return decodeURIComponent(window.atob(base64));
}

/*
 * 获取特定的 nkcsource Dom 内容
 * @param {String} type 类型 picture, sticker, video, audio, attachment, pre, xsf, twemoji, formula
 * @return {String}
 * */
export function resourceToHtml(type, rid, name) {
  var handles = {
    picture: function () {
      return (
        "<img data-tag='nkcsource' data-type='picture' data-id='" +
        rid +
        '\' src="/r/' +
        rid +
        '">'
      );
    },
    sticker: function () {
      return (
        "<img data-tag='nkcsource' data-type='sticker' data-id='" +
        rid +
        '\' src="/sticker/' +
        rid +
        '">'
      );
    },
    video: function () {
      return (
        '<p><br></p><p><video data-tag="nkcsource" data-type="video" data-id="' +
        rid +
        '" src="/r/' +
        rid +
        '" controls></video>' +
        decodeURI('%E2%80%8E') +
        '</p>'
      );
    },
    audio: function () {
      return (
        '<p><br></p><p><audio data-tag="nkcsource" data-type="audio" data-id="' +
        rid +
        '" src="/r/' +
        rid +
        '" controls></audio>' +
        decodeURI('%E2%80%8E') +
        '</p>'
      );
    },
    attachment: function () {
      return (
        '<p><a data-tag="nkcsource" data-type="attachment" data-id="' +
        rid +
        '" href="/r/' +
        rid +
        '" target="_blank" contenteditable="false">' +
        name +
        '</a>&#8203;</p>'
      );
    },
    pre: function () {},
    xsf: function () {
      return (
        '<p><br></p><section data-tag="nkcsource" data-type="xsf" data-id="' +
        rid +
        '" data-message="浏览这段内容需要' +
        rid +
        '学术分(双击修改)"><p>&#8203;<br></p></section>'
      );
    },
    twemoji: function () {
      var emojiChar = twemoji.convert.fromCodePoint(rid);
      return (
        "<img data-tag='nkcsource' data-type='twemoji' data-id='" +
        rid +
        "' data-char='" +
        emojiChar +
        '\' src="/twemoji/2/svg/' +
        rid +
        '.svg">'
      );
    },
    formula: function () {},
  };
  var hit = handles[type];
  return hit ? hit() : '';
}

/*
 * 将富文本内容中的 twemoji img 标签替换成 emoji 字符
 * @param {String} content
 * @return {String}
 * */
export function replaceTwemojiImageWithChar(content) {
  const parser = document.createElement('div');
  parser.innerHTML = content;
  $(parser)
    .find("[data-tag='nkcsource'][data-type='twemoji']")
    .each(function (index, imgElem) {
      $(imgElem).replaceWith(imgElem.dataset.char);
    });
  return parser.innerHTML;
}

/*
 * 将富文本内容中的 twemoji 字符 标签替换成 img 标签
 * @param {String} content
 * @return {String}
 * */
export function replaceTwemojiCharWithImage(content) {
  return twemoji.replace(content, function (char) {
    var id = twemoji.convert.toCodePoint(char);
    return (
      "<img data-tag='nkcsource' data-type='twemoji' data-id='" +
      id +
      "' data-char='" +
      char +
      '\' src="/twemoji/2/svg/' +
      id +
      '.svg">'
    );
  });
}

/*
 * 修改富文本中「学术分隐藏」 结构
 * */
export function replaceXSFInfo(content) {
  const parser = document.createElement('div');
  parser.innerHTML = content;
  $(parser)
    .find("[data-tag='nkcsource'][data-type='xsf']")
    .each(function (index, el) {
      var id = $(el).attr('data-id');
      $(el).attr('data-message', '浏览这段内容需要' + id + '学术分(双击修改)');
    });
  return parser.innerHTML;
}

/*
 * 将指定 dom 中的文本节点链接替换为 a 标签
 * @param {Dom}
 * */
export function replaceDomTextWithUrl(dom) {
  if (dom.tagName.toLowerCase() === 'a') {
    return;
  }
  for (let i = 0; i < dom.childNodes.length; i++) {
    const node = dom.childNodes[i];
    if (node.nodeType === 1) {
      replaceDomTextWithUrl(node);
    } else {
      replaceTextNodeTextWithUrl(node);
    }
  }
}

/*
 * 将文本节点中的文本链接替换为 a 标签
 * @param {TextNode}
 * */
export function replaceTextNodeTextWithUrl(textNode) {
  const urlReg =
    /(https?:\/\/)?([-0-9a-zA-Z]{1,256}\.)+([a-zA-Z]{2,6})\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/i;
  const parentNode = textNode.parentNode;

  const findAElement = function (node, tagName) {
    if (!node) {
      return false;
    } else if (node.tagName && node.tagName.toLocaleString() === tagName) {
      return true;
    } else {
      return findAElement(node.parentNode);
    }
  };

  const matchUrl = function (node) {
    const textContent = node.textContent;
    var result = textContent.match(urlReg);
    if (result === null) {
      return;
    }
    var url = result[0];
    var domText = url;
    var index = result.index;

    var targetNode = node.splitText(index);
    var nextNode;
    if (targetNode.length > url.length) {
      nextNode = targetNode.splitText(url.length);
    }
    var urlDom = document.createElement('a');
    if (!/^https?:\/\//gi.test(url)) {
      url = 'http://' + url;
    }
    urlDom.setAttribute('href', url);
    urlDom.setAttribute('data-text', domText);
    urlDom.innerText = domText;
    parentNode.replaceChild(urlDom, targetNode);
    if (nextNode) {
      matchUrl(nextNode);
    }
  };

  matchUrl(textNode);
}

/*
 * 清除富文本中的高亮笔记样式
 * @param {String} content
 * @return {String}
 * */
export function clearHighlightClass(content) {
  const container = $('<div></div>');
  container.html(content);
  const span = container.find('span.nkc-hl');
  span
    .css({
      'background-color': '',
      'border-bottom': '',
    })
    .removeClass('nkc-hl');
  replaceDomTextWithUrl(container[0]);
  return container.html();
}

export function markdownToHTML(markdownContent) {
  let html = marked(markdownContent);
  html = createDOMPurify.sanitize(html, {
    FORBID_TAGS: ['script', 'style', 'iframe'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror'],
  });
  return html;
}
