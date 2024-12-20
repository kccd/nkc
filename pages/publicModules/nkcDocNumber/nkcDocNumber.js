// 获取所有文本节点
function getAllTextNodes(element) {
  const textNodes = [];

  function traverse(node) {
    if (
      node.nodeName === 'A' ||
      node.nodeName === 'BLOCKQUOTE' ||
      node.nodeName === 'CODE' ||
      node.nodeName === 'PRE'
    ) {
      return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      node.childNodes.forEach(traverse);
    }
  }

  traverse(element);
  return textNodes;
}
document
  .querySelectorAll('.render-content.math-jax')
  .forEach((renderContent) => {
    const textNodes = getAllTextNodes(renderContent); // 获取所有文本节点
    let tempArray = [];
    const regex = /#((D|t)?\d+)/g;

    // 拼接所有文本节点的内容
    const textString = textNodes.map((node) => node.textContent).join('');
    // console.log('=================textString===================');
    // console.log(textNodes, textString);
    // console.log('====================================');
    let match;
    while ((match = regex.exec(textString)) !== null) {
      const start = match.index; // 匹配字符的起始位置
      const end = start + match[0].length; // 匹配字符的结束位置
      const p1 = match[1];
      const link = /^D(\d+)$/.test(p1)
        ? `/document/d/${p1.replace(/^D/, '')}`
        : `/p/${p1}?redirect=true`;

      tempArray.push({
        start,
        end,
        href: link,
        text: match[0],
        index: `${link}${Math.floor(100000 + Math.random() * 900000)}`,
      });
    }

    // console.log(tempArray);
    let $index = 0;

    textNodes.forEach((textNode, index) => {
      const indexStart = $index;
      const indexEnd = indexStart + textNode.textContent.length;
      let replacedText = '';
      let lastIndex = 0; // 用于跟踪已替换文本的结束位置
      // console.log(index, lastIndex);

      tempArray.forEach((item) => {
        // 处理第一种情况：匹配项就在文本节点内
        if (item.start >= indexStart && indexEnd >= item.end) {
          replacedText += textNode.textContent.slice(
            lastIndex,
            item.start - $index,
          );
          replacedText += `<a href="${item.href}" target="_blank" data-link=${item.index}>${item.text}</a>`;
          lastIndex = item.end - $index; // 更新已替换文本的结束位置
          // console.log('=================222===================');
          // console.log(replacedText);
          // console.log('====================================');
        }
        // 处理第二种情况：开始在文本内，结束不在文本内
        else if (
          indexStart <= item.start &&
          item.start < indexEnd &&
          indexEnd < item.end
        ) {
          replacedText += textNode.textContent.slice(
            lastIndex,
            item.start - $index,
          );
          const textToLink = textNode.textContent.slice(
            item.start - $index,
            indexEnd - $index,
          );
          replacedText += `<a href="${item.href}" target="_blank" data-link=${item.index}>${textToLink}</a>`;
          lastIndex = indexEnd - $index; // 更新结束位置到文本末尾
          // console.log('=================333===================');
          // console.log(replacedText);
          // console.log('====================================');
        }
        // 处理第三种情况：整个文本节点需要被链接包裹
        else if (indexStart > item.start && indexEnd <= item.end) {
          replacedText = `<a href="${item.href}" target="_blank" data-link=${item.index}>${textNode.textContent}</a>`;
          lastIndex = indexEnd - $index; // 更新到文本末尾
        }
        // 处理第四种情况：后半段在文本节点开始部分
        else if (
          indexStart > item.start &&
          indexEnd > item.end &&
          indexStart < item.end
        ) {
          const textToLink = textNode.textContent.slice(
            lastIndex,
            item.end - $index,
          );
          replacedText += `<a href="${item.href}" target="_blank" data-link=${item.index}>${textToLink}</a>`;
          lastIndex = item.end - $index;
          // replacedText += textNode.textContent.slice(
          //   lastIndex,
          //   item.end - $index,
          // );
          // console.log('=================111===================');
          // console.log(replacedText);
          // console.log('====================================');
        }
      });

      // 添加剩余的文本
      if (lastIndex < textNode.textContent.length) {
        replacedText += textNode.textContent.slice(lastIndex);
      }

      // 创建新的 span 元素并替换原文本节点
      if (replacedText) {
        const spanElement = document.createElement('span');
        spanElement.innerHTML = replacedText;
        textNode.parentNode.replaceChild(spanElement, textNode);
      }

      // 更新当前索引
      $index = indexEnd;
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
