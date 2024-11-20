const cheerio = require('cheerio');
const htmlFilter = require('./htmlFilter');
const twemoji = require("twemoji");
const emojiRegex = require('emoji-regex');

const dataStoreIndexKey = 'data-store-index';
const dataStoreElement = 'data-store-element';

class HtmlStore {
  index = 0;
  content = {};

  saveData(data) {
    const newIndex = this.index + 1;
    this.index = newIndex;
    this.content[newIndex] = data;
    return newIndex;
  }

  getData(index) {
    return this.content[index];
  }
}

function hideJQElementHtml(JQElement, htmlStore) {
  const html = JQElement.html();
  const index = htmlStore.saveData(html);
  JQElement.attr(dataStoreIndexKey, index);
  JQElement.attr(dataStoreElement, 'true');
  JQElement.html('');
}

function showJQElementHtml(JQElement, htmlStore) {
  const storeIndex = JQElement.attr(dataStoreIndexKey);
  const html = htmlStore.getData(storeIndex);
  JQElement.html(html);
  JQElement.removeAttr(dataStoreElement);
  JQElement.removeAttr(dataStoreIndexKey);
}

function hideNKCSourceHtml(html, htmlStore) {
  const $ = cheerio.load(html);
  const elements = $(`[data-tag="nkcsource"]`);
  for(let i = 0; i < elements.length; i++) {
    const element = elements.eq(i);
    hideJQElementHtml(element, htmlStore);
  }
  return $('body').html();
}

function showHiddenHtml(html, htmlStore) {
  const $ = cheerio.load(html);
  const elements = $(`[${dataStoreElement}="true"]`);
  for(let i = 0; i < elements.length; i++) {
    const element = elements.eq(i);
    showJQElementHtml(element, htmlStore);
  }
  return $('body').html();
}

/**
 * 按顺序遍历文本节点,需传入handle
 * @param {Object} node - cheerio dom节点
 * @param {Function} handle - 处理器
 * @param {Boolean} escape - 是否对nkcsource下的文本节点转义
 */
function eachTextNode(node, handle, escape) {
  if(!handle) return;
  if(node.type === "text") {
    handle(node.data, node);
  }else if(node.type === "tag") {
    for(let child of node.children) {
      // 跳过并转义nkcsource
      if(child.attribs && child.attribs["data-tag"] === "nkcsource") {
        if(escape)
          // escapeEachTextNode(child);
        continue;
      }
      // 遍历子节点
      eachTextNode(child, handle)
    }
  }
}


/**
 * 节点上是否有某个属性
 * @param {Object} $node - cheerio 被选择器包裹的dom节点
 * @param {string} attrName  - 属性名
 */
function hasAttr($node, attrName) {
  return typeof $node.attr(attrName) !== "undefined";
}


// 数学公式模式
const formulaReg = /((\$\$|\$).+?\2)|(\\\[.+\\\])|\\\(.+\\\)/g;
// html标签模式
const htmlTagReg = /<[a-zA-Z\-]+(\s.*)*>/;


/**
 * 把html字符串中的数学公式表达式转换成临时标签
 * @param {string} html - html字符串
 */
function canvertFormulaExpression(html) {
  if(!html) return html;
  return html.replace(formulaReg, formula => {
    if(htmlTagReg.test(formula)) return formula;
    return `<span this-is-formula data='${formula}'></span>`;
  });
}

/**
 * 把数学公式临时标签换回字符串
 * @param {string} html
 */
function reduFormulaExpression(bodyNode) {
  const $ = cheerio.load(bodyNode);
  $("[this-is-formula]")
    .each((_, el) => {
      let formula = $(el).attr("data");
      $(el).replaceWith(formula);
    });
}



/**
 * 把html字符串中的emoji转换成临时标签
 * @param {string} html - html字符串
 */
function canvertEmojis(html) {
  return twemoji.parse(html, {
    folder: '/',
    attributes: () => {
      return {
        "this-is-emoji": ""
      }
    },
    base: '/twemoji',
    ext: '.svg'
  });
}

/**
 * 把emoji临时标签换回字符串
 * @param {string} html
 */
function reduEmojis(bodyNode) {
  const $ = cheerio.load(bodyNode);
  $("[this-is-emoji]")
    .each((_, el) => {
      let emoji = $(el).attr("alt");
      $(el).replaceWith(emoji);
    })
}



/**
 * 此偏移量是否已经丢失
 * @param {number} offset - 偏移量
 * @description 丢失: 不为0且为假; 存在: 为一个数字;
 */
function isLost(offset) {
  if(typeof offset === "number") return false;
  if(!offset) return true;
  return true;
}

/**
 * 创建一个笔记,包括一些对丢失的偏移量的处理
 */
function createNote(note) {
  const { noteId, start, end, content, isLost } = note;
  const len = content ? content.length : 0, fill = 2;
  // 标记没有丢失，完整闭合(这里面包含了content(划词内容)为空字符的情况)
  if(!isLost) {
    return {
      _id: noteId,
      offset: start,
      length: len,
      content
    }
  }
  // start丢失
  if(start === undefined) {
    return {
      _id: noteId,
      offset: end - fill >= 0 ? end - fill : 0,
      length: fill,
      content: ""
    }
  }
  // end丢失
  if(end === undefined) {
    const noteLength = start + fill < len ? start + fill : len - 1;
    return {
      _id: noteId,
      offset: start,
      length: noteLength,
      content: content.substr(start, noteLength)
    }
  }
}




/**
 * 把笔记的开始和结束位置标记在文章中
 * @param {string} html - html文本
 * @param {Object[]} notes - 笔记记录
 * @param {string} notes[]._id - 笔记id
 * @param {string} notes[].offset - 笔记关键字起始位置
 * @param {string} notes[].length - 笔记关键字长度
 */
function setMark(html, notes = []) {
  // console.log("income html: " + html);
  if(!notes.length) return html;

  // 部分元素（例如 nkcsource）不参与划词笔记位置计算，
  // 所以需要提前去掉这些元素的HTML内容，存入缓存，
  // 待划词笔记位置计算完成后再复原

  const htmlStore = new HtmlStore();

  // 隐藏nkcSource中的html
  html = hideNKCSourceHtml(html, htmlStore);

  // 处理数学公式
  html = canvertFormulaExpression(html);
  // 处理emoji
  html = canvertEmojis(html);
  // 包含所有笔记位置信息的映射表,偏移量为键,值为笔记的开始或结束点组成的数组
  let map = {};
  notes.forEach(note => {
    if(note.node.length === 0) return;
    let startOffset = note.node.offset;
    let endOffset = note.node.offset + note.node.length;
    if(map[startOffset]) {
      map[startOffset].push({ id: note._id, type: "start" })
    }else {
      map[startOffset] = [{ id: note._id, type: "start" }];
    }
    if(map[endOffset]) {
      map[endOffset].push({ id: note._id, type: "end" })
    }else {
      map[endOffset] = [{ id: note._id, type: "end" }];
    }
  });

  // 稍后需要替换的节点和新节点内容
  const replaceMap = new Map();
  // 用于文本处理过程中临时替换 < 和 > 的标识符
  const signIndex = Math.floor(Math.random() * 100000);
  let offsets = Object.keys(map);
  const $ = cheerio.load(html);
  let body = $("body")[0];
  let prevLen = 0;
  // 遍历文本节点
  eachTextNode(body, (text, node) => {
    let len = text.length;
    // 当此前已遍历的总字数超过了某个偏移量,说明这个本文节点存在那个偏移量的点,即此处要插标签(但此时还不知到标签应当插到此文本节点的何处)
    let willMark = offsets.filter(offset => prevLen + len >= offset);
    offsets = offsets.filter(offset => !willMark.includes(offset));
    // 计算这些标签需要插入到此文本节点的哪些位置,并按这些位置分割文本为数组
    let textOffsets = willMark.map(offset => offset - prevLen);
    let textFragment = [];
    textOffsets.forEach((offset, index) => {
      let frag = text.substring(offset, textOffsets[index + 1]);
      textFragment.push(frag);
    })
    textFragment.unshift(text.substring(0, textOffsets[0]));
    textFragment = textFragment.map(text => text.replace(/&/g, `--[${signIndex}]`).replace(/</g, `--[${signIndex}`).replace(/>/g, `--${signIndex}]`));
    // 重组这些文本,并借此在适当位置插入标签
    let newNodeData = textFragment[0];
    willMark.forEach((offset, index) => {
      let tags = map[offset];
      newNodeData += tags.map(tag =>
        `<em note-tag note-id='${tag.id}' tag-type='${tag.type}'></em>`
      ).join("");
      newNodeData += textFragment[index + 1];
    })
    // 先记录下需要替换的节点和新内容，等退出循环之后再集中替换，此时替换会让迭代变得不安全
    replaceMap.set(node, newNodeData);
    // $(node).replaceWith(newNodeData);
    // 修改文本节内容
    // node.data = newNodeData;
    // 计入总字数
    prevLen += text.length;
  }, true)
  // 替换节点
  replaceMap.forEach((html, node) => $(node).replaceWith(html));

  // 还原数学公式
  reduFormulaExpression(body);
  // 还原emoji
  reduEmojis(body);
  html = $(body).html();
  // 还原 < 、 > 以及 &
  html = html
    .replace(new RegExp(`\\-\\-\\[${signIndex}\\]`, "g"), "&amp;")
    .replace(new RegExp(`\\-\\-\\[${signIndex}`, "g"), "&lt;")
    .replace(new RegExp(`\\-\\-${signIndex}\\]`, "g"), "&gt;")

  html = showHiddenHtml(html, htmlStore);

  html = htmlFilter(html);
  return html;
}

exports.setMark = setMark;



function getJsonTextLength(nodes = []) {
  let length = 0;
  nodes.forEach((node) => {
    if (node.type === 'text') {
      length += node.text.length;
    } else if (node.content) {
      length += getJsonTextLength(node.content);
    }
  });
  return length;
}
function setMarkByJson(jsonString, notes = []) {
  console.log('================处理前====================');
  console.log(
    11,
    JSON.stringify(JSON.parse(jsonString).content, undefined, 2),
    notes,
  );
  console.log('====================================');
  let currentStart = 0;
  let wrapped = false; // 标记是否已处理目标节点
  // 递归处理节点
  const wrapNodes = (nodes, { targetStart, targetEnd, noteId }) => {
    return nodes.flatMap((node) => {
      if (wrapped) {
        return node;
      }
      // 处理文本节点
      if (node.type === 'text') {
        const textLength = node.text.length;
        const currentTextEnd = currentStart + textLength;
        const wrappedNodes = [];
        if (currentStart <= targetStart && targetStart < currentTextEnd) {
          // 文字最后的累计数大于目标开始索引==》标识开始
          if (currentStart === targetStart) {
            wrappedNodes.push({
              type: 'nkc-note-tag',
              attrs: {
                id: noteId,
                start: true,
              },
            });
            wrappedNodes.push(node);
          } else if (currentStart < targetStart) {
            // 添加前面的文本部分（如果有）
            wrappedNodes.push({
              ...node,
              text: node.text.slice(0, targetStart - currentStart),
            });
            wrappedNodes.push({
              type: 'nkc-note-tag',
              attrs: {
                id: noteId,
                start: true,
              },
            });
            wrappedNodes.push({
              ...node,
              text: node.text.slice(targetStart - currentStart, textLength),
            });
          }
          // node = wrappedNodes;
        }
        if (currentStart < targetEnd && targetEnd <= currentTextEnd) {
          // 文字最后的累计数大于目标最后索引==》标识结束
          // const wrappedNodes = [];
          if (wrappedNodes.length !== 0) {
            // 目标文字在一个文字节点内
            if (wrappedNodes.length === 2) {
              const tempNodes = [];
              if (targetEnd === currentTextEnd) {
                tempNodes.push(node);
                tempNodes.push({
                  type: 'nkc-note-tag',
                  attrs: {
                    id: noteId,
                    end: true,
                  },
                });
              } else if (targetEnd < currentTextEnd) {
                tempNodes.push({
                  ...node,
                  text: node.text.slice(0, targetEnd - currentStart),
                });
                tempNodes.push({
                  type: 'nkc-note-tag',
                  attrs: {
                    id: noteId,
                    end: true,
                  },
                });
                tempNodes.push({
                  ...node,
                  text: node.text.slice(targetEnd - currentStart, textLength),
                });
              }
              wrappedNodes.pop();
              wrappedNodes.push(...tempNodes);
            } else if (wrappedNodes.length === 3) {
              const tempNode = wrappedNodes.pop();
              const TempTextLength = tempNode.text.length;
              const tempCurrentStart =
                currentStart + textLength - TempTextLength;
              const tempCurrentTextEnd = tempCurrentStart + TempTextLength;
              const tempNodes = [];
              if (targetEnd === tempCurrentTextEnd) {
                tempNodes.push(tempNode);
                tempNodes.push({
                  type: 'nkc-note-tag',
                  attrs: {
                    id: noteId,
                    end: true,
                  },
                });
              } else if (targetEnd < tempCurrentTextEnd) {
                tempNodes.push({
                  ...tempNode,
                  text: tempNode.text.slice(0, targetEnd - tempCurrentStart),
                });
                tempNodes.push({
                  type: 'nkc-note-tag',
                  attrs: {
                    id: noteId,
                    end: true,
                  },
                });
                tempNodes.push({
                  ...tempNode,
                  text: tempNode.text.slice(
                    targetEnd - tempCurrentStart,
                    TempTextLength,
                  ),
                });
              }
              wrappedNodes.push(...tempNodes);
            }
          } else {
            if (targetEnd === currentTextEnd) {
              wrappedNodes.push(node);
              wrappedNodes.push({
                type: 'nkc-note-tag',
                attrs: {
                  id: noteId,
                  end: true,
                },
              });
            } else if (targetEnd < currentTextEnd) {
              wrappedNodes.push({
                ...node,
                text: node.text.slice(0, targetEnd - currentStart),
              });
              wrappedNodes.push({
                type: 'nkc-note-tag',
                attrs: {
                  id: noteId,
                  end: true,
                },
              });
              wrappedNodes.push({
                ...node,
                text: node.text.slice(targetEnd - currentStart, textLength),
              });
            }
          }
          // node = wrappedNodes;
          wrapped = true;
        }
        currentStart += textLength;
        if (wrappedNodes.length > 0) {
          return wrappedNodes;
        }
      } else {
        // 对于非文本节点，递归处理其内容
        if (node.content) {
          const originalContent = node.content;
          node.content = wrapNodes(originalContent, {
            targetStart,
            targetEnd,
            noteId,
          });
        }
      }
      return node; // 返回未修改的节点
    });
  };
  // 处理文档节点
  const jsonObj = JSON.parse(jsonString);
  let content = jsonObj.content;
  for (const note of notes) {
    const targetStart = note.node.offset;
    const targetEnd = targetStart + note.node.length;
    const noteId = note._id;
    currentStart = 0;
    wrapped = false;
    content = wrapNodes(content, { targetStart, targetEnd, noteId });
  }
  console.log('==================处理后==================');
  console.log(22, JSON.stringify(content, undefined, 2));
  console.log('====================================');
  jsonObj.content = content;
  return JSON.stringify(jsonObj);
}

function getNodesText(nodes = []) {
  let text = '';
  for (const node of nodes) {
    if (node.type === 'text') {
      text += node.text;
    } else if (node.content && node.content.length > 0) {
      text += getNodesText(node.content);
    }
  }
  return text;
}
// 获取标记位置的方法并还原内容
function getMarkByJson(jsonString) {
  testEmojis();
  console.log('================处理前====================');
  console.log(11, JSON.stringify(JSON.parse(jsonString).content, undefined, 2));
  console.log('====================================');
  const jsonObj = JSON.parse(jsonString);
  const idsMap = new Map(); // 存储每个 ID 的开始和结束位置
  let currentStart = 0; // 当前文本的起始位置
  // 递归遍历节点
  const traverseNodes = (nodes) => {
    nodes.forEach((node) => {
      if (node.type === 'text') {
        const textLength = node.text.length;
        currentStart += textLength; // 更新当前起始位置
      } else if (node.type === 'nkc-note-tag') {
        const { id, start, end } = node.attrs;

        if (start) {
          // 记录开始标记
          idsMap.set(id, { start: currentStart, end: null });
        } else if (end) {
          // 记录结束标记
          if (idsMap.has(id)) {
            idsMap.get(id).end = currentStart; // 设置结束位置
          } else {
            // 如果没有开始位置，记录结束位置
            idsMap.set(id, { start: null, end: currentStart });
          }
        }
      } else if (node.content) {
        traverseNodes(node.content); // 递归处理子节点
      }
    });
  };
  traverseNodes(jsonObj.content); // 开始遍历文档内容
  // 过滤出有效的 ID
  const marks = [];
  for (const [id, positions] of idsMap.entries()) {
    if (positions.start !== null && positions.end !== null) {
      marks.push({
        _id: id,
        offset: positions.start,
        length: positions.end - positions.start
      });
    }
  }
  jsonObj.content = removeNoteTags(jsonObj.content);
  console.log('==================处理后==================');
  console.log(22, JSON.stringify(jsonObj.content, undefined, 2), marks);
  console.log('====================================');
  return {
    marks,
    jsonString: JSON.stringify(jsonObj), // 返回还原后的 JSON
  };
}

// 删除所有 nkc-note-tag 节点
function removeNoteTags(nodes) {
  return nodes
    .filter((node) => node.type !== 'nkc-note-tag')
    .map((node) => {
      if (node.content) {
        node.content = removeNoteTags(node.content); // 递归处理子节点
      }
      return node;
    });
}
function testEmojis() {
  const calculateTextLength = (text) => {
    let emojiCount = 0;
    let charCount = 0;

    // 使用正则表达式查找 emoji
    const matches = text.matchAll(emojiRegex());

    for (const match of matches) {
      emojiCount += match[0].length;
    }

    // 计算总字符长度减去 emoji 的长度
    charCount = text.length - emojiCount;

    return {
      totalLength: text.length,
      emojiCount: emojiCount,
      charCount: charCount,
    };
  };

  // 使用示例
  const text = '🎨🎨🎨fs';
  const result = calculateTextLength(text);
  console.log(
    `总长度: ${result.totalLength}, Emoji长度: ${result.emojiCount}, 字符长度: ${result.charCount}`,
  );
}
exports.setMarkByJson = setMarkByJson;
exports.getMarkByJson = getMarkByJson;

/**
 * 把标记取出来
 * @param {string} html - html文本
 * @returns {Object} 处理完的html和更新的笔记数据
 * @desc 关于返回的notes:
 * [
 *    {
 *        _id     对应库中的 _id 字段,
 *        offset 笔记选区起始位置怕偏移量,
 *        length 笔记选区长度(已经丢失的笔记为0)
 *    }
 *    ...
 * ]
 */

function getMark(html) {
  // 部分元素（例如 nkcsource）不参与划词笔记位置计算，
  // 所以需要提前去掉这些元素的HTML内容，存入缓存，
  // 待划词笔记位置计算完成后再复原

  const htmlStore = new HtmlStore();

  // 隐藏nkcSource中的html
  html = hideNKCSourceHtml(html, htmlStore);
  // 处理数学公式
  html = canvertFormulaExpression(html);
  // 处理emoji
  html = canvertEmojis(html);
  const $ = cheerio.load(html);
  let body = $("body")[0];
  let prevLen = 0;
  // 向用于标记笔记位置的 em 节点下插入一个随机文本，使得 eachTextNode 函数可以找到笔记的em节点
  let random = Math.floor(Math.random() * Math.pow(10, 10)) + "";
  $("body [note-tag]").text(random);
  let notes = [];
  let recording = [];   // 记录正在录制内容的noteId
  eachTextNode(body, (text, node) => {
    const parentNode = node.parent;
    if(hasAttr($(parentNode), "note-tag") && text === random) {
      let noteId = $(parentNode).attr("note-id");
      let tagType = $(parentNode).attr("tag-type");
      if(tagType === "start") {
        recording.push({
          noteId,
          content: "",
          start: prevLen
        });
      }
      if(tagType === "end") {
        const index = recording.findIndex(record => record.noteId === noteId);
        if(index >= 0) {
          // 到这里标志着一个笔记被完整闭合，移动到notes数组做记录
          const note = recording.splice(index, 1)[0];
          note.end = prevLen;
          notes.push(note);
        } else {
          // 这里是只找到了结束节点，没找到开始节点或者结束节点先于开始节点被找到的两种情况，直接算做丢失
          notes.push({
            noteId,
            end: prevLen,
            isLost: true
          });
        }
      }
      // 笔记的em节点下的字符是临时插入的随机数，不能计入总字数，所以直接去下一个文本节点
      return;
    }
    recording.forEach(record => record.content += text);
    prevLen += text.length;
  }, true)
  // 循环结束之后 recording 数组还不为空的话，说明这些笔记的 end 标志已经丢失了
  notes.push(...recording.map(record => ({ ...record, isLost: true })));
  // 再删除一遍,以免意外入库
  $("body [note-tag]").remove();
  // 还原数学公式
  reduFormulaExpression(body);
  // 还原emoji
  reduEmojis(body);

  html = $(body).html();

  // 显示nkcSource中的html
  html = showHiddenHtml(html, htmlStore);

  html = htmlFilter(html);
  return {
    html: html,
    notes: notes.map(note => createNote(note))
  }
}

exports.getMark = getMark;
