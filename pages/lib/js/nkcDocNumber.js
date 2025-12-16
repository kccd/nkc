// 获取所有文本节点
import { getUrl } from './tools';

const BLOCK_TAGS = new Set([
  'ADDRESS',
  'ARTICLE',
  'ASIDE',
  'DIV',
  'DL',
  'FIELDSET',
  'FIGCAPTION',
  'FIGURE',
  'FOOTER',
  'FORM',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HEADER',
  'HR',
  'LI',
  'MAIN',
  'NAV',
  'OL',
  'P',
  'PRE',
  'SECTION',
  'TABLE',
  'TBODY',
  'TD',
  'TFOOT',
  'TH',
  'THEAD',
  'TR',
  'UL',
]);

function isBlockElement(node) {
  return (
    node && node.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.has(node.nodeName)
  );
}

function getTextSegments(element) {
  const segments = [];

  function traverse(node, currentBlock) {
    if (
      node.nodeName === 'A' ||
      node.nodeName === 'BLOCKQUOTE' ||
      node.nodeName === 'CODE' ||
      node.nodeName === 'PRE'
    ) {
      return;
    }

    if (node.nodeName === 'BR') {
      segments.push({ type: 'break' });
      return;
    }

    let nextBlock = currentBlock;
    if (isBlockElement(node)) {
      nextBlock = node;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent) {
        segments.push({
          type: 'text',
          node,
          text: node.textContent,
          blockKey: nextBlock,
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      node.childNodes.forEach((child) => traverse(child, nextBlock));
    }
  }

  traverse(element, element);
  return segments;
}

function buildTextIndex(segments) {
  let textString = '';
  let offset = 0;
  const nodeRanges = new Map();
  const textNodes = [];

  segments.forEach((seg, idx) => {
    if (seg.type === 'break') {
      textString += '\n';
      offset += 1;
      return;
    }

    const prev = idx > 0 ? segments[idx - 1] : null;
    const needBlockBreak =
      prev &&
      prev.type === 'text' &&
      prev.blockKey &&
      seg.blockKey &&
      prev.blockKey !== seg.blockKey;

    if (needBlockBreak) {
      textString += '\n';
      offset += 1;
    }

    const start = offset;
    textString += seg.text;
    offset += seg.text.length;
    nodeRanges.set(seg.node, { start, end: offset });
    textNodes.push(seg.node);
  });

  return { textString, nodeRanges, textNodes };
}

export function renderNKCDocNumber() {
  document
    .querySelectorAll('.render-content.math-jax')
    .forEach((renderContent) => {
      const checkerRegex = /#(([Dd]|t)?\d+)/;
      const segments = getTextSegments(renderContent);
      const { textString, nodeRanges, textNodes } = buildTextIndex(segments);
      if (!checkerRegex.test(textString)) {
        return;
      }
      let tempArray = [];

      let match;
      const regex = /#(([Dd]|t)?\d+)/g;
      while ((match = regex.exec(textString)) !== null) {
        const start = match.index; // 匹配字符的起始位置
        const end = start + match[0].length; // 匹配字符的结束位置
        const p1 = match[1];
        const link = /^[Dd](\d+)$/.test(p1)
          ? getUrl('documentNumber', p1.replace(/^[Dd]/, ''))
          : getUrl('threadNumber', p1);
        tempArray.push({
          start,
          end,
          href: link,
          text: match[0],
          index: `${link}${Math.floor(100000 + Math.random() * 900000)}`,
        });
      }

      textNodes.forEach((textNode) => {
        const range = nodeRanges.get(textNode);
        if (!range) {
          return;
        }
        const indexStart = range.start;
        const indexEnd = range.end;
        // 使用安全的节点替换，避免通过 innerHTML 注入
        const frag = document.createDocumentFragment();
        let lastIndex = 0; // 用于跟踪已替换文本的结束位置
        // console.log(index, lastIndex);

        tempArray.forEach((item) => {
          // 处理第一种情况：匹配项就在文本节点内
          if (item.start >= indexStart && indexEnd >= item.end) {
            const plain = textNode.textContent.slice(
              lastIndex,
              item.start - indexStart,
            );
            if (plain) {
              frag.appendChild(document.createTextNode(plain));
            }
            const a = document.createElement('a');
            a.setAttribute('href', item.href);
            a.setAttribute('target', '_blank');
            a.dataset.link = item.index;
            a.textContent = item.text;
            frag.appendChild(a);
            lastIndex = item.end - indexStart; // 更新已替换文本的结束位置
          }
          // 处理第二种情况：开始在文本内，结束不在文本内
          else if (
            indexStart <= item.start &&
            item.start < indexEnd &&
            indexEnd < item.end
          ) {
            const plain = textNode.textContent.slice(
              lastIndex,
              item.start - indexStart,
            );
            if (plain) {
              frag.appendChild(document.createTextNode(plain));
            }
            const textToLink = textNode.textContent.slice(
              item.start - indexStart,
              indexEnd - indexStart,
            );
            const a = document.createElement('a');
            a.setAttribute('href', item.href);
            a.setAttribute('target', '_blank');
            a.dataset.link = item.index;
            a.textContent = textToLink;
            frag.appendChild(a);
            lastIndex = indexEnd - indexStart; // 更新结束位置到文本末尾
          }
          // 处理第三种情况：整个文本节点需要被链接包裹
          else if (indexStart > item.start && indexEnd <= item.end) {
            const a = document.createElement('a');
            a.setAttribute('href', item.href);
            a.setAttribute('target', '_blank');
            a.dataset.link = item.index;
            a.textContent = textNode.textContent;
            // 直接替换为一个链接节点
            frag.appendChild(a);
            lastIndex = indexEnd - indexStart; // 更新到文本末尾
          }
          // 处理第四种情况：后半段在文本节点开始部分
          else if (
            indexStart > item.start &&
            indexEnd > item.end &&
            indexStart < item.end
          ) {
            const textToLink = textNode.textContent.slice(
              lastIndex,
              item.end - indexStart,
            );
            const a = document.createElement('a');
            a.setAttribute('href', item.href);
            a.setAttribute('target', '_blank');
            a.dataset.link = item.index;
            a.textContent = textToLink;
            frag.appendChild(a);
            lastIndex = item.end - indexStart;
          }
        });

        // 添加剩余的文本
        if (lastIndex < textNode.textContent.length) {
          const tail = textNode.textContent.slice(lastIndex);
          if (tail) {
            frag.appendChild(document.createTextNode(tail));
          }
        }

        // 创建新的 span 元素并替换原文本节点
        if (frag.childNodes.length > 0 && lastIndex > 0) {
          const spanElement = document.createElement('span');
          spanElement.appendChild(frag);
          textNode.parentNode.replaceChild(spanElement, textNode);
        }
      });
      const links = renderContent.querySelectorAll('a[data-link]');
      links.forEach((link) => {
        link.addEventListener('mouseenter', function () {
          const dataLink = this.getAttribute('data-link');
          links.forEach((l) => {
            if (l.getAttribute('data-link') === dataLink) {
              l.classList.add('hover'); // 添加悬停样式
            }
          });
        });

        link.addEventListener('mouseleave', function () {
          const dataLink = this.getAttribute('data-link');
          links.forEach((l) => {
            if (l.getAttribute('data-link') === dataLink) {
              l.classList.remove('hover'); // 移除悬停样式
            }
          });
        });
      });
    });
}

// 将html内容中满足以下情况的文字替换为链接：
// 1. #一位或多位数字：#12345，#D12345，#t12345
// 2. #D一位或多位数字：#D12345
// 注意：
// 1. 如果#和其他内容处于多个节点内，需要跨节点替换，也就是为#和后面的内容单独创建一个a标签链接，实现看起来是一个整体。
// 2. 注意避开a标签，blockquote，code，pre标签内的内容替换。
export function replaceDocNumberToLink(html) {
  if (typeof html !== 'string' || html.length === 0) {
    return html;
  }

  // 使用一个容器解析并承载 HTML 字符串
  const container = document.createElement('div');
  container.innerHTML = html;

  // 仅在存在匹配时再进行处理，避免不必要的遍历
  const checkerRegex = /#(([Dd]|t)?\d+)/;
  const segments = getTextSegments(container);
  const { textString, nodeRanges, textNodes } = buildTextIndex(segments);
  if (!checkerRegex.test(textString)) {
    return html;
  }

  const tempArray = [];
  const regex = /#(([Dd]|t)?\d+)/g;
  let match;
  while ((match = regex.exec(textString)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    const p1 = match[1];
    const link = /^[Dd](\d+)$/.test(p1)
      ? getUrl('documentNumber', p1.replace(/^[Dd]/, ''))
      : getUrl('threadNumber', p1);
    tempArray.push({
      start,
      end,
      href: link,
      text: match[0],
      index: `${link}${Math.floor(100000 + Math.random() * 900000)}`,
    });
  }

  textNodes.forEach((textNode) => {
    const range = nodeRanges.get(textNode);
    if (!range) {
      return;
    }
    const indexStart = range.start;
    const indexEnd = range.end;
    // 使用安全的节点替换，避免通过 innerHTML 注入
    const frag = document.createDocumentFragment();
    let lastIndex = 0;

    tempArray.forEach((item) => {
      if (item.start >= indexStart && indexEnd >= item.end) {
        const plain = textNode.textContent.slice(
          lastIndex,
          item.start - indexStart,
        );
        if (plain) {
          frag.appendChild(document.createTextNode(plain));
        }
        const a = document.createElement('a');
        a.setAttribute('href', item.href);
        a.setAttribute('target', '_blank');
        a.dataset.link = item.index;
        a.textContent = item.text;
        frag.appendChild(a);
        lastIndex = item.end - indexStart;
      } else if (
        indexStart <= item.start &&
        item.start < indexEnd &&
        indexEnd < item.end
      ) {
        const plain = textNode.textContent.slice(
          lastIndex,
          item.start - indexStart,
        );
        if (plain) {
          frag.appendChild(document.createTextNode(plain));
        }
        const textToLink = textNode.textContent.slice(
          item.start - indexStart,
          indexEnd - indexStart,
        );
        const a = document.createElement('a');
        a.setAttribute('href', item.href);
        a.setAttribute('target', '_blank');
        a.dataset.link = item.index;
        a.textContent = textToLink;
        frag.appendChild(a);
        lastIndex = indexEnd - indexStart;
      } else if (indexStart > item.start && indexEnd <= item.end) {
        const a = document.createElement('a');
        a.setAttribute('href', item.href);
        a.setAttribute('target', '_blank');
        a.dataset.link = item.index;
        a.textContent = textNode.textContent;
        frag.appendChild(a);
        lastIndex = indexEnd - indexStart;
      } else if (
        indexStart > item.start &&
        indexEnd > item.end &&
        indexStart < item.end
      ) {
        const textToLink = textNode.textContent.slice(
          lastIndex,
          item.end - indexStart,
        );
        const a = document.createElement('a');
        a.setAttribute('href', item.href);
        a.setAttribute('target', '_blank');
        a.dataset.link = item.index;
        a.textContent = textToLink;
        frag.appendChild(a);
        lastIndex = item.end - indexStart;
      }
    });

    if (lastIndex < textNode.textContent.length) {
      const tail = textNode.textContent.slice(lastIndex);
      if (tail) {
        frag.appendChild(document.createTextNode(tail));
      }
    }

    if (frag.childNodes.length > 0 && lastIndex > 0) {
      const spanElement = document.createElement('span');
      spanElement.appendChild(frag);
      textNode.parentNode.replaceChild(spanElement, textNode);
    }
  });

  return container.innerHTML;
}
