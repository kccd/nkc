/* 
  events:
    select: 划词
    create: 创建实例
    hover: 鼠标悬浮
    hoverOut: 鼠标移开


*/
window.Source = class {
  constructor(options) {
    const {hl, nodes, id} = options;
    const self = this;
    this.hl = hl;
    this.nodes = nodes;
    this.content = hl.getNodesContent(nodes);
    this.dom = [];
    this.id = id;
    this._id = `nkc-hl-id-${id}`;
    this.nodes.forEach(node => {
      const {offset, length} = node;
      const targetNotes = self.getNodes(this.hl.root, offset, length);
      targetNotes.map(targetNode => {
        const span = document.createElement("span");
        self.dom.push(span);
        span.addEventListener("mouseover", () => {
          self.hl.emit(self.hl.eventNames.hover, self);
        });
        span.addEventListener("mouseout", () => {
          self.hl.emit(self.hl.eventNames.hoverOut, self);
        });
        span.addEventListener("click", () => {
          self.hl.emit(self.hl.eventNames.click, self);
        });
        span.setAttribute("class", `nkc-hl ${self._id}`);
        span.appendChild(targetNode.cloneNode(false));
        targetNode.parentNode.replaceChild(span, targetNode);
      });
    });
    this.hl.sources.push(this);
    this.hl.emit(this.hl.eventNames.create, this);
  }
  addClass(klass) {
    const {dom} = this;
    dom.map(d => {
      d.classList.add(klass);
    });
  }
  removeClass(klass) {
    const {dom} = this;
    dom.map(d => {
      d.classList.remove(klass);
    });
  }
  destroy() {
    this.dom.map(d => {
      d.className = "";
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
};

window.NKCHighlighter = class {
  constructor(options) {
    const {
      rootElementId, excludedElementClass = []
    } = options;
    const self = this;
    self.root = document.getElementById(rootElementId);
    self.excludedElementClass = excludedElementClass;
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
    };

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
  getParent(self, d) {
    if(d === self.root) return;
    if(d.nodeType === 1) {
      for(const c of self.excludedElementClass) {
        if(d.classList.contains(c)) throw new Error("划词区域已被忽略");
      }
    }
    if(d.parentNode) self.getParent(self, d.parentNode);
  }
  getRange() {
    try{
      const range = window.getSelection().getRangeAt(0);
      const {startOffset, endOffset, startContainer, endContainer} = range;
      if(this.excludedElementClass.length) {
        this.getParent(this, startContainer);
        this.getParent(this, endContainer);
      }
      if(startOffset === endOffset) return;
      return range;
    } catch(err) {
      console.log(err);
    }
  }
  destroy(source) {
    if(typeof source === "string") {
      source = this.getSourceByID(source);
    }
    source.destroy();
  }
  restoreSources(sources = []) {
    for(const source of sources) {
      source.hl = this;
      new Source(source);
    }
  }
  getNodes(range) {
    const {startContainer, endContainer, startOffset, endOffset} = range;
    if(startOffset === endOffset) return;
    let selectedNodes = [], startNode, endNode;
    if(startContainer.nodeType !== 3 || startContainer.nodeType !== 3) return;
    if(startContainer === endContainer) {
      // 相同节点
      startNode = startContainer;
      endNode = startNode;
      selectedNodes.push({
        node: startNode,
        offset: startOffset,
        length: endOffset - startOffset
      });
    } else {
      startNode = startContainer;
      endNode = endContainer;
      selectedNodes.push({
        node: startNode,
        offset: startOffset,
        length: startNode.textContent.length - startOffset
      });
      selectedNodes.push({
        node: endNode,
        offset: 0,
        length: endOffset
      });
      const nodes = this.findNodes(startNode, endNode);
      for(const node of nodes) {
        selectedNodes.push({
          node,
          offset: 0,
          length: node.textContent.length
        });
      }
    }
    const nodes = [];
    for(const obj of selectedNodes) {
      const {node, offset, length} = obj;
      const content = node.textContent.slice(offset, offset + length);
      const offset_ = this.getOffset(node);
      nodes.push({
        content,
        offset: offset_ + offset,
        length
      });
    }
    return nodes;
  }
  getNodesContent(nodes) {
    let content = "";
    nodes.map(node => {
      content += node.content;
    });
    return content;
  }
  createSource(id, nodes) {
    return new Source({
      hl: this,
      id,
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
  getOffset(text) {
    const nodeStack = [this.root];
    let curNode = null;
    let offset = 0;
    const self = this;
    while (!!(curNode = nodeStack.pop())) {
      const children = curNode.childNodes;
      loop:
        for (let i = children.length - 1; i >= 0; i--) {
          const node = children[i];
          if(node.nodeType === 1) {
            const cl = node.classList;
            for(const c of self.excludedElementClass) {
              if(cl.contains(c)) {
                continue loop;
              }
            }
          }
          nodeStack.push(node);
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
    // const parent = this.getSameParentNode(startNode, endNode);
    const parent = this.root;
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