/* 
  events:
    selected: 划词



*/
window.Source = class {
  constructor(options) {
    const {hl, nodes, notes, _id} = options;
    const self = this;
    this.hl = hl;
    this.notes = notes;
    this.nodes = nodes;
    this.doms = [];
    let noteId = _id;
    if(!noteId) noteId = Date.now();
    this._id = `post-node-id-${noteId}`;
    this.nodes.forEach(node => {
      const {tagName, index, offset, length} = node;
      const doms = self.hl.root.getElementsByTagName(tagName);
      const parent = doms[index];
      const targetNotes = self.getNodes(parent, offset, length); 
      targetNotes.map(targetNode => {
        const span = document.createElement("span");
        self.doms.push(span);
        span.addEventListener("mouseenter", () => {
          self.hl.emit(self.hl.eventNames.hover, self);
        });
        span.addEventListener("mouseleave", () => {
          self.hl.emit(self.hl.eventNames.hoverOut, self);
        });
        span.addEventListener("click", () => {
          self.hl.emit(self.hl.eventNames.click, self);
        })
        span.setAttribute("class", `post-node ${self._id}`);
        span.appendChild(targetNode.cloneNode(false));
        targetNode.parentNode.replaceChild(span, targetNode);
      });
    });
    this.hl.sources.push(this);
    this.hl.emit(this.hl.eventNames.create, this);
  }
  addClass(klass) {
    const {doms} = this;
    doms.map(dom => {
      dom.classList.add(klass);
    });
  }
  removeClass(klass) {
    const {doms} = this;
    doms.map(dom => {
      dom.classList.remove(klass);
    });
  }
  getSources() {
    return this.sources;
  }
  getNodes(parent, offset, length) {
    const nodeStack = [parent];
    let curOffset = 0;
    let node = null;
    let curLength = length;
    let nodes = [];
    while(node = nodeStack.pop()) {
      const children = node.childNodes;
      for(let i = 0; i < children.length; i++) {
        nodeStack.push(children[i]);
      }
      if(node.nodeType === 3) {
        curOffset += node.textContent.length;
        console.log(1, node)
        console.log(11, node)
        console.log(Date.now(), node)
        if(curOffset > offset) {
          console.log(Date.now(), node)
          console.log(2, node)
          if(curLength <= 0) break;
          console.log(3, node)
          const startOffset = curOffset - offset;
          console.log(4, node)
          let nodeLength;
          console.log(5, node)
          if(curLength <= node.textContent.length) {
            nodeLength = curLength;
          } else {
            nodeLength = node.textContent.length - startOffset;
            curLength -= nodeLength;
          }
          const node = node.splitText(startOffset);
          node.splitText(nodeLength);
          nodes.push(node);
        }
      }
    }
    return nodes;
  }
  getNode_(parent, offset, length) {
    const nodeStack = [parent];
    let curNode = null;
    let curOffset = 0;
    let startOffset = 0;
    let curLength = 0;
    let start, end;
    while (curNode = nodeStack.pop()) {
      const children = curNode.childNodes;
      for (let i = children.length - 1; i >= 0; i--) {
        nodeStack.push(children[i]);
      }
      if (curNode.nodeType === 3) {
        startOffset = offset - curOffset;
        curOffset += curNode.textContent.length;
        if (curOffset > offset) {
          curLength += curNode.length - startOffset;
          let endOffset;
          if(length + startOffset > curNode.length) {
            endOffset = curNode.length;
          } else {
            endOffset = startOffset + length;
          }
          start = {
            node: curNode,
            startOffset,
            endOffset
          }
        }
      }
    }
    /* if (!curNode) {
      curNode = parent;
    } */
    console.log(curNode, startOffset);
    const node = curNode.splitText(startOffset);
    node.splitText(length);
    return node;
  }
}

window.NKCHighlighter = class {
  constructor(options) {
    const {
      rootElementId,
    } = options;
    const self = this;
    self.root = document.getElementById(rootElementId);
    self.position = {
      x: 0,
      y: 0
    };
    self.range = {};
    self.sources = [];
    self.events = {};
    self.eventNames = {
      create: "create",
      hover: "hover",
      hoverOut: "hoverOut",
      select: "select"
    }

    window.addEventListener("mouseup", function(e) {
      self.position.x = e.clientX;
      self.position.y = e.clientY;
      const range = self.getRange();
      if(!range) return;
      if(
        range.startContainer === self.range.startContainer &&
        range.endContainer === self.range.endContainer &&
        range.startOffset === self.range.startOffset &&
        range.endOffset === self.range.endOffset
      ) return;
      // 限制选择文字的区域，只能是selecter内的文字
      if(!self.root.contains(range.startContainer) || !self.root.contains(range.endContainer)) return;
      self.range = range;
      self.emit(self.eventNames.select, {
        position: self.position,
        range
      });
    });
  }
  getRange() {
    const range = window.getSelection().getRangeAt(0);
    const {startOffset, endOffset} = range;
    if(startOffset === endOffset) return;
    return range;
  }
  restoreSources(sources) {
    for(const source of sources) {
      source.hl = this;
      new Source(source);  
    }
  }
  createSource(range, notes) {
    const {startContainer, endContainer, startOffset, endOffset} = range;
    if(startOffset === endOffset) return;
    let selectedNodes = [], startNode, endNode;
    if(startContainer.nodeType !== 3 || startContainer.nodeType !== 3) return;
    if(startContainer === endContainer) { 
      // 相同节点
      startNode = startContainer.splitText(startOffset);
      startNode.splitText(endOffset - startOffset);
      selectedNodes.push(startNode);
    } else {
      startNode = startContainer.splitText(startOffset);
      selectedNodes.push(startNode);
      endContainer.splitText(endOffset);
      endNode = endContainer;
      selectedNodes.push(endNode);
      const nodes = this.findNodes(startNode, endNode);
      for(const node of nodes) {
        selectedNodes.push(node);
      }
    }
    const parent = this.getSameParentNode(startNode, endNode);
    const {tagName} = parent;
    const doms = this.root.getElementsByTagName(tagName);
    let index = -1;
    for(let i = 0; i < doms.length; i++) {
      if(doms[i] === parent) {
        index = i;
        break;
      }
    }
    if(index === -1) throw "获取父元素索引出错";
    const nodes = [];
    for(const node of selectedNodes) {
      const offset = this.getOffset(parent, node);
      const length = node.textContent.length;
      nodes.push({
        tagName,
        index,
        offset,
        length
      });
    }
    return new Source({
      hl: this,
      notes,
      nodes,
    });
  }
  getSourceByID(id) {
    for(const s of this.sources) {
      if(s.id === id) return source;
    }
  }
  addClass(id, className) {
    let source;
    if(typeof id === "string") {
      source = this.getSourceByID(id);
    } else {
      source = id;
    }
    source.addClass(className);
  }
  removeClass(id, className) {
    let source;
    if(typeof id === "string") {
      source = this.getSourceByID(id);
    } else {
      source = id;
    }
    source.removeClass(className);
  }
  getOffset(root, text) {
    const nodeStack = [root];
    let curNode = null;
    let offset = 0;
    while (curNode = nodeStack.pop()) {
      const children = curNode.childNodes;
      for (let i = children.length - 1; i >= 0; i--) {
        nodeStack.push(children[i]);
      }

      if (curNode.nodeType === 3 && curNode !== text) {
        offset += curNode.textContent.length;
      }
      else if (curNode.nodeType === 3) {
        break;
      }
    }
    return offset;
  }
  findNodes(startNode, endNode) {
    const selectedNodes = [];
    const parent = this.getSameParentNode(startNode, endNode);
    if(parent) {
      let start = false, end = false;
      const getChildNode = (node) => {
        if(!node.hasChildNodes()) return;
        for(const n of node.childNodes) {
          if(end || n === endNode) {
            end = true;
            return;
          } else if(start && n.nodeType === 3) {
            selectedNodes.push(n);
          } else if(n === startNode) {
            start = true;
          }
          getChildNode(n);
        }
      };
      getChildNode(parent);
    }
    return selectedNodes;
  }
  getSameParentNode(startNode, endNode) {
    const self = this;
    if(!endNode || startNode === endNode) return startNode.parentNode;
    const startNodes = [], endNodes = [];
    const getParent = (node, nodes) => {
      nodes.push(node);
      if(node !== self.root && node.parentNode) {
        getParent(node.parentNode, nodes);
      }
    };
    getParent(startNode, startNodes);
    getParent(endNode, endNodes);
    let parent;
    for(const node of startNodes) {
      if(endNodes.includes(node)) {
        parent = node;
        break;
      }
    }
    return parent;
  }
  on(eventName, callback) {
    if(!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
    return this;
  }
  emit(eventName, data) {
    (this.events[eventName] || []).map(func => {
      func(data);
    });
  }
};