const cheerio = require('cheerio');
const htmlFilter = require('./htmlFilter');




/**
 * 按顺序遍历节点,需传入handle
 * @param {Object} $ - cheerio 选择器
 * @param {Object} node - cheerio dom节点
 * @param {Function} handle - 处理器
 */
function eachNodeText(node, handle) {
  if(!handle) return;
  if(node.type === "text") {
    handle(node.data, node);
  }else if(node.type === "tag") {
    for(let child of node.children) {
      eachNodeText(child, handle)
    }
  }
}



/**
 * 把笔记位置标记在文章中
 * @param {string} html - html文本
 * @param {Object[]} notes - 笔记记录
 * @param {string} notes[]._id - 笔记id
 * @param {string} notes[].offset - 笔记关键字起始位置
 * @param {string} notes[].length - 笔记关键字长度
 */
function setMark(html, notes = []) {
  if(!notes.length) return;
  let map = {}
  notes.forEach(note => {
    map[note.node.offset] = {
      id: note._id,
      type: "start"
    };
    map[note.node.offset + note.node.length] = {
      id: note._id,
      type: "end"
    };
  });
  let offsets = Object.keys(map); 
  const $ = cheerio.load(html, {decodeEntities: false});
  let body = $("body")[0];
  // let offset = note.node.offset, length = note.node.length;
  // let start = offset, end = offset + length;
  let prevLen = 0;
  //   let startNode = {}, endNode = {};
  eachNodeText(body, (text, node) => {
    let len = text.length;
    let willMark = offsets.filter(offset => prevLen + len >= offset);
    if(!willMark.length) return prevLen += text.length;
    let textOffsets = willMark.map(offset => offset - prevLen);
    let textFragment = [];
    textOffsets.forEach((offset, index) => {
      let frag = text.substring(offset, textOffsets[index + 1]);
      textFragment.push(frag);
    })
    textFragment.unshift(text.substring(0, textOffsets[0]));
    console.log(textFragment.length);
    console.log(willMark.length);
    
    

    // if(!startNode.node && prevLen + len >= start) {
    //   startNode.node = node;
    //   startNode.offset = start - prevLen;
    // }
    // if(!endNode.node && prevLen + len >= end) {
    //   endNode.node = node;
    //   endNode.offset = end - prevLen;
    // }
    prevLen += text.length;
  })
  // console.log("总共:" + $body.text().length + "个字")
  // console.log("开始于 '"+  startNode.node.data + "'   的第" +startNode.offset + "个字");
  // console.log("结束于 '" + endNode.node.data + "'   的第" + endNode.offset + "个字");
  
  // let markStartSign = `<span note-id='123' mark-type='start' style='color:red;background-color: rgb(0, 0, 255);'>[S]</span>`;
  // let markEndSign = `<span note-id='123' mark-type='end' style='color:red;background-color: rgb(0, 0, 255);'>[E]</span>`;
  // if(startNode.node !== endNode.node) {
  //   let left = startNode.node.data.substring(0, startNode.offset);
  //   let right = startNode.node.data.substring(startNode.offset);
  //   startNode.node.data =  `${left}<span note-id='123' mark-type='start' style='color:red;background-color: rgb(0, 0, 255);'>[S]</span>${right}`;

  //   let left2 = endNode.node.data.substring(0, endNode.offset);
  //   let right2 = endNode.node.data.substring(endNode.offset);
  //   endNode.node.data = `${left2}<span note-id='123' mark-type='start' style='color:red;background-color: rgb(0, 0, 255);'>[E]</span>${right2}`;
  // }else {
  //   let text = startNode.node.data;
  //   let left = text.substring(0, startNode.offset);
  //   let middle = text.substring(startNode.offset, endNode.offset + 1);
  //   let right = text.substring(endNode.offset + 1);
  //   startNode.node.data = `${left}<span note-id='123' mark-type='start' style='color:red;background-color: rgb(0, 0, 255);'>[S]</span>${middle}<span note-id='123' mark-type='start' style='color:red;background-color: rgb(0, 0, 255);'>[E]</span>${right}`
  // }
  return htmlFilter($(body).html());
}

exports.setMark = setMark;



/**
 * 把标记取出来
 * @param {string} html - html文本
 * @returns {Object} 处理完的html和更新的笔记数据
 */
function getMark(html) {
  return {
    html: htmlFilter(html),
    notes
  }
}

exports.getMark = getMark;