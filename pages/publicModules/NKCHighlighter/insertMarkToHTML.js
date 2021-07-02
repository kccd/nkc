let html = document.getElementById("html");

html = html.innerHTML;

const notes = [
  {
    _id: 1,
    node: {
      offset: 2,
      length: 3
    }
  },
  {
    _id: 2,
    node: {
      offset: 5,
      length: 12
    }
  },
  {
    _id: 3,
    node: {
      offset: 7,
      length: 9
    }
  }
];


function insertMarkToHTML(html, notes) {
  const root = document.createElement("div");
  root.innerHTML = html;
}

function getNotes(parent, offset, length) {
  const nodeStack = [parent];
  let curOffset = 0;
  let node = null;
  let curLength = length;
  let nodes = [];
  let started = false;
  const self = this;
  while(!!(node = nodeStack.pop())) {
    const children = node.childNodes;
    loop:
      for (let i = children.length - 1; i >= 0; i--) {
        const node = children[i];
        if(node.nodeType === 1) {
          const cl = node.classList;
          for(const c of self.hl.excludedElementClass) {
            if(cl.contains(c)) {
              continue loop;
            }
          }
          const elementTagName = node.tagName.toLowerCase();
          if(self.hl.excludedElementTagName.includes(elementTagName)) {
            continue;
          }
        }
        nodeStack.push(node);
      }
    if(node.nodeType === 3 && node.textContent.length) {
      curOffset += node.textContent.length;
      if(curOffset > offset) {
        if(curLength <= 0) break;
        let startOffset;
        if(!started) {
          startOffset = node.textContent.length - (curOffset - offset);
        } else {
          startOffset = 0;
        }
        started = true;
        let needLength;
        if(curLength <= node.textContent.length - startOffset) {
          needLength = curLength;
          curLength = 0;
        } else {
          needLength = node.textContent.length - startOffset;
          curLength -= needLength;
        }
        nodes.push({
          node,
          startOffset,
          needLength
        });
      }
    }
  }
  nodes = nodes.map(obj => {
    let {node, startOffset, needLength} = obj;
    if(startOffset > 0) {
      node = node.splitText(startOffset);
    }
    if(node.textContent.length !== needLength) {
      node.splitText(needLength);
    }
    return node;
  });
  return nodes;
}

insertMarkToHTML(html, notes);

Object.assign(window, {
  notes,
  insertMarkToHTML,
  getNotes,
});