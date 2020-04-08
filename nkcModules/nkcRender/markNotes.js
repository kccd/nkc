const cheerio = require('cheerio');
const htmlFilter = require('./htmlFilter');




/**
 * 按顺序遍历文本节点,需传入handle
 * @param {Object} node - cheerio dom节点
 * @param {Function} handle - 处理器
 */
function eachTextNode(node, handle) {
  if(!handle) return;
  if(node.type === "text") {
    handle(node.data, node);
  }else if(node.type === "tag") {
    for(let child of node.children) {
      eachTextNode(child, handle)
    }
  }
}


/**
 * 按顺序遍历所有节点,需传入handle
 * @param {Object} node - cheerio dom节点
 * @param {Function} handle - 处理器
 */
function eachNode(node, handle) {
  if(!handle) return;
  handle(node);
  for(let child of node.children) {
    eachTextNode(child, handle)
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
const formulaReg = /((\$\$|\$).+?\2)|(\\\[.+\\\])|\\\(.+\\\)/;
// html标签模式
const htmlTagReg = /<[a-zA-Z\-]+(\s.*)*>/;

/**
 * 把html字符串中的数学公式表达式转换成临时标签
 * @param {string} html - html字符串
 */
function canvertFormulaExpression(html) {
  if(!html) return html;
  let source = html;
  let build = "";
  while(1) {
    let matchResult = source.match(formulaReg);
    if(matchResult === null) {
      build += source;
      break;
    }
    // 匹配到了一个公式
    let formula = matchResult[0];
    let start =  matchResult.index;
    let len = formula.length;
    // 测试公式是否跨HTML标签了
    if(htmlTagReg.test(formula)) {
      build += source.substring(0, start + len);
      source = source.substring(start + len);
      continue;
    }
    build += source.substring(0, start) + `<span this-is-formula data='${formula}'></span>`;
    source = source.substring(start + len);
  }
  return build;
}


/**
 * 把数学公式临时标签换回字符串
 * @param {string} html 
 */
function reduFormulaExpression(html) {
  const $ = cheerio.load(html, {decodeEntities: false});
  $("[this-is-formula]")
    .each((_, el) => {
      let formula = $(el).attr("data");      
      $(el).replaceWith(formula);
    })
  return $("body").html();
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
  console.log(notes);
  
  if(!notes.length) return html;
  // 处理数学公式
  html = canvertFormulaExpression(html);
  // 包含所有笔记位置信息的映射表,偏移量为键,值为笔记的开始或结束点组成的数组
  let map = {};
  notes.forEach(note => {
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
  let offsets = Object.keys(map); 
  const $ = cheerio.load(html, {decodeEntities: false});
  let body = $("body")[0];
  let prevLen = 0;
  // 遍历文本节点
  eachTextNode(body, (text, node) => {
    let len = text.length;
    // 当此前已遍历的总字数超过了某个偏移量,说明这个本文节点存在那个偏移量的点,即此处要插标签(但此时还不知到标签应当插到此文本节点的何处)
    let willMark = offsets.filter(offset => prevLen + len >= offset);
    // 如果这个文本节点上不需要插标签,那么就跳过此节点,并且把此文本节点的长度计入总字数
    if(!willMark.length) return prevLen += text.length;
    // 计算这些标签需要插入到此文本节点的哪些位置,并按这些位置分割文本为数组
    let textOffsets = willMark.map(offset => offset - prevLen);
    let textFragment = [];
    textOffsets.forEach((offset, index) => {
      let frag = text.substring(offset, textOffsets[index + 1]);
      textFragment.push(frag);
    })
    textFragment.unshift(text.substring(0, textOffsets[0]));
    // 重组这些文本,并借此在适当位置插入标签
    let newNodeData = textFragment[0];
    willMark.forEach((offset, index) => {
      let tags = map[offset];
      newNodeData += tags.map(tag => 
        `<em 
          note-tag 
          note-id='${tag.id}' 
          tag-type='${tag.type}'></em>`
      ).join("");
      newNodeData += textFragment[index + 1];
    })
    // 修改文本节内容
    node.data = newNodeData;
    // 计入总字数
    prevLen += text.length;
  })

  html = $(body).html();
  // 还原数学公式
  html = reduFormulaExpression(html);
  html = htmlFilter(html);
  return html;
}

exports.setMark = setMark;



/**
 * 把标记取出来
 * @param {string} html - html文本
 * @returns {Object} 处理完的html和更新的笔记数据
 * @desc 关于返回的notes:
 * [
 *    {
 *        id     对应库中的 _id 字段,
 *        offset 笔记选区起始位置怕偏移量,
 *        length 笔记选区长度,
 *        isLost 选区是否已经丢失
 *    }
 *    ...
 * ]
 */
function getMark(html) {
  const $ = cheerio.load(html, {decodeEntities: false});
  let body = $("body")[0];
  let prevLen = 0;
  let random = Math.floor(Math.random() * Math.pow(10, 10)) + "";
  let map = {};
  $("body [note-tag]").text(random)
  eachTextNode(body, (text, node) => {
    let parentNode = node.parent;
    if(text === random && hasAttr($(parentNode), "note-tag")) {
      let noteId = $(parentNode).attr("note-id");
      let tagType = $(parentNode).attr("tag-type");
      // console.log(`offset:${prevLen}, noteId:${noteId}, tagType:${tagType}`);
      if(!map[noteId]) map[noteId] = {};
      map[noteId][tagType] = prevLen;
      return;
    } 
    prevLen += text.length;
  })
  // 再删除一遍,以免意外入库
  $("body [note-tag]").remove();
  // console.log(map);
  // 格式化和处理不完整的标记
  let notes = [];
  for(let noteId in map) {
    let rec = map[noteId];
    let note = { id: noteId };
    if(!rec.hasOwnProperty("start") || !rec.hasOwnProperty("end")) {
      notes.push({ ...note, isLost: true});
    }else {
      let start = map[noteId].start;
      let end = map[noteId].end;
      notes.push({
        ...note,
        offset: start,
        length: end - start
      });
    }
  }
  
  return {
    html: htmlFilter($("body").html()),
    notes
  }
}

exports.getMark = getMark;