/* 
  events:
    select: 划词
    create: 创建实例
    hover: 鼠标悬浮
    hoverOut: 鼠标移开
*/
window.Source = class {
  constructor(options) {
    let {hl, node, id, _id} = options;
    id = id ||_id;
    const self = this;
    this.hl = hl;
    this.node = node;
    this.content = hl.getNodesContent(node);
    this.dom = [];
    this.id = id;
    this._id = `nkc-hl-id-${id}`;
    const {offset, length} = this.node;
    const targetNotes = self.getNodes(this.hl.root, offset, length);
    targetNotes.map(targetNode => {
      if(!targetNode.textContent.length) return;
      const parentNode = targetNode.parentNode;
      if(parentNode.classList.contains("nkc-hl")) {
        // 存在高亮嵌套的问题
        // 理想状态下，所有选区处于平级，重合部分被分隔，仅添加多个class
        let parentsId = parentNode.getAttribute("data-nkc-hl-id");
        if(!parentsId) return;
        parentsId = parentsId.split("-");
        const sources = [];
        for(const pid of parentsId) {
          sources.push(self.hl.getSourceByID(Number(pid)));
        }

        for(const node of parentNode.childNodes) {
          if(!node.textContent.length) continue;
          const span = document.createElement("span");
          span.className = `nkc-hl`;
          span.onmouseover = parentNode.onmouseover;
          span.onmouseout = parentNode.onmouseout;
          span.onclick = parentNode.onclick;
          sources.map(s => {
            s.dom.push(span);
          });

          // 新选区
          if(node === targetNode) {
            // 如果新选区完全覆盖上层选区，则保留上层选区的事件，否则添加新选区相关事件
            if(parentNode.childNodes.length !== 1 || targetNotes.length === 1) {
              span.onmouseover = function() {
                self.hl.emit(self.hl.eventNames.hover, self);
              };
              span.onmouseout = function() {
                self.hl.emit(self.hl.eventNames.hoverOut, self);
              };
              span.onclick = function() {
                self.hl.emit(self.hl.eventNames.click, self);
              };
            }
            // 覆盖区域添加class nkc-hl-cover
            span.className += ` nkc-hl-cover`;
            span.setAttribute(`data-nkc-hl-id`, parentsId.concat([self.id]).join("-"));
            self.dom.push(span);
          } else {
            span.setAttribute(`data-nkc-hl-id`, parentsId.join("-"));
          }
          span.appendChild(node.cloneNode(false));
          parentNode.replaceChild(span, node);
        }
        sources.map(s => {
          const parentIndex = s.dom.indexOf(parentNode);
          if(parentIndex !== -1) {
            s.dom.splice(parentIndex, 1);
          }
        });
        // 清除上层选区dom的相关事件和class
        // parentNode.classList.remove(`nkc-hl`, source._id, `nkc-hl-cover`);
        // parentNode.className = "";
        parentNode.onmouseout = null;
        parentNode.onmouseover = null;
        parentNode.onclick = null;
      } else {
        // 全新选区 无覆盖的情况
        const span = document.createElement("span");

        span.classList.add("nkc-hl");
        span.setAttribute("data-nkc-hl-id", self.id);

        span.onmouseover = function() {
          self.hl.emit(self.hl.eventNames.hover, self);
        };
        span.onmouseout = function() {
          self.hl.emit(self.hl.eventNames.hoverOut, self);
        };
        span.onclick = function() {
          self.hl.emit(self.hl.eventNames.click, self);
        };

        self.dom.push(span);

        span.appendChild(targetNode.cloneNode(false));
        targetNode.parentNode.replaceChild(span, targetNode);
      }
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
      // loop:
      for (let i = children.length - 1; i >= 0; i--) {
        const node = children[i];
        if(self.hl.isClown(node)) continue;
        /*if(node.nodeType === 1) {
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
        }*/
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
      rootElementId, excludedElementClass = [],
      excludedElementTagName = [],

      clownClass = [], clownAttr = [], clownTagName = []
    } = options;
    const self = this;
    self.root = document.getElementById(rootElementId);
    self.excludedElementClass = excludedElementClass;
    self.excludedElementTagName = excludedElementTagName;

    self.clownClass = clownClass;
    self.clownAttr = clownAttr;
    self.clownTagName = clownTagName;


    self.range = {};
    self.sources = [];
    self.events = {};
    self.disabled = false;
    self.eventNames = {
      create: "create",
      hover: "hover",
      hoverOut: "hoverOut",
      select: "select"
    };

    let interval;

    document.addEventListener("mousedown", () => {
      clearInterval(interval);
    });

    document.addEventListener("selectionchange", () => {
      self.range = {};
      clearInterval(interval);

      interval = setTimeout(() => {
        self.initEvent();
      }, 500);
    });


  }
  initEvent() {
    try{
      // 屏蔽划词事件
      if(this.disabled) return;
      const range = this.getRange();
      if(!range || range.collapsed) return;
      if(
        range.startContainer === this.range.startContainer &&
        range.endContainer === this.range.endContainer &&
        range.startOffset === this.range.startOffset &&
        range.endOffset === this.range.endOffset
      ) return;
      // 限制选择文字的区域，只能是root下的选区
      if(!this.contains(range.startContainer) || !this.contains(range.endContainer)) return;
      this.range = range;
      this.emit(this.eventNames.select, {
        range
      });
    } catch(err) {
      console.log(err.message || err);
    }
  }
  contains(node) {
    while((node = node.parentNode)) {
      if(node === this.root) return true;
    }
    return false;
  }
  getParent(self, d) {
    if(d === self.root) return;
    if(this.isClown(d)) throw new  Error("划词越界");
    /*if(d.nodeType === 1) {
      for(const c of self.excludedElementClass) {
        if(d.classList.contains(c)) throw new Error("划词越界");
      }
      if(self.excludedElementTagName.includes(d.tagName.toLowerCase())) {
        throw new Error("划词越界");
      }
    }*/
    if(d.parentNode) self.getParent(self, d.parentNode);
  }
  getRange() {
    try{
      const range = window.getSelection().getRangeAt(0);
      const {startOffset, endOffset, startContainer, endContainer} = range;
      this.getParent(this, startContainer);
      this.getParent(this, endContainer);
      const nodes = this.findNodes(startContainer, endContainer);
      nodes.map(node => {
        this.getParent(this, node);
      });
      if(startOffset === endOffset && startContainer === endContainer) return;
      return range;
    } catch(err) {
      console.log(err.message || err);
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
    // if(startOffset === endOffset) return;
    let selectedNodes = [], startNode, endNode;
    // if(startContainer.nodeType !== 3 || startContainer.nodeType !== 3) return;
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
      // 当起始节点不为文本节点时，无需插入起始节点
      // 在获取子节点时会将插入起始节点的子节点，如果这里不做判断，会出现起始节点内容重复的问题。
      if(startNode.nodeType === 3) {
        selectedNodes.push({
          node: startNode,
          offset: startOffset,
          length: startNode.textContent.length - startOffset
        });
      }
      const nodes = this.findNodes(startNode, endNode);
      for(const node of nodes) {
        selectedNodes.push({
          node,
          offset: 0,
          length: node.textContent.length
        });
      }
      selectedNodes.push({
        node: endNode,
        offset: 0,
        length: endOffset
      });
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
    if(!nodes.length) return null;

    let content = "",  offset = 0, length = 0;
    for(let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      content += node.content;
      length += node.length;
      if(i === 0) offset = node.offset;
    }

    return {
      content,
      offset,
      length
    }
  }
  getNodesContent(node) {
    return node.content;
  }
  createSource(id, node) {
    return new Source({
      hl: this,
      id,
      node,
    });
  }
  getSourceByID(id) {
    for(const s of this.sources) {
      if(s.id === id) return s;
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
      // loop:
      for (let i = children.length - 1; i >= 0; i--) {
        const node = children[i];
        /*if(node.nodeType === 1) {
          const cl = node.classList;
          for(const c of self.excludedElementClass) {
            if(cl.contains(c)) {
              continue loop;
            }
          }
          const elementTagName = node.tagName.toLowerCase();
          if(self.excludedElementTagName.includes(elementTagName)) {
            continue;
          }
        }*/
        if(self.isClown(node)) continue;
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
    // const parent = this.root;
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
  isClown(node) {
    // 判断node是否需要排除
    if(node.nodeType === 1) {
      const cl = node.classList;
      for(const c of this.clownClass) {
        if(cl.contains(c)) {
          return true;
        }
      }
      const elementTagName = node.tagName.toLowerCase();
      if(this.clownTagName.includes(elementTagName)) {
        return true;
      }
      for(const key in this.clownAttr) {
        if(!this.clownAttr.hasOwnProperty(key)) continue;
        if(node.getAttribute(key) === this.clownAttr[key]) return true;
      }
    }
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
  getSourceById(id) {
    for(const s of this.sources) {
      if(s.id === id) {
        return s;
      }
    }
  }
  offset(node) {
    let top = 0, left = 0, _position;

    const getOffset = (n, init) => {
      if(n.nodeType !== 1) {
        return;
      }
      _position = window.getComputedStyle(n)['position'];

      if (typeof(init) === 'undefined' && _position === 'static') {
        getOffset(n.parentNode);
        return;
      }

      top = n.offsetTop + top - n.scrollTop;
      left = n.offsetLeft + left - n.scrollLeft;

      if (_position === 'fixed') {
        return;
      }
      getOffset(n.parentNode);
    };

    getOffset(node, true);

    return {
      top, left
    };
  }
  getStartNodeOffset(range) {
    // 在选区起始处插入span
    // 获取span的位置信息
    // 移除span
    let span = document.createElement("span");
    // span.style.display = "none";
    span.style.display = "inline-block";
    span.style.verticalAlign = "top";
    range.insertNode(span);
    const parentNode = span.parentNode;
    span.style.width = "30px";
    const offset = this.offset(span);
    parentNode.removeChild(span);
    return offset;
  }
  lock() {
    this.disabled = true;
  }
  unlock() {
    this.disabled = false;
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