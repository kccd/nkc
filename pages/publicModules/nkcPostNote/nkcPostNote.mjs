class Source{
  constructor(options) {
    const {postNote, nodes, notes} = options;
    const self = this;
    this.postNote = postNote;
    this.notes = notes;
    this.nodes = nodes;
    this.id = `post-node-id-${Date.now()}`;
    this.doms = [];
    this.nodes.forEach(node => {
      const {tagName, index, offset, length} = node;
      const parent = self.postNote.rootDom.find(tagName)[index];
      const targetNode = self.postNote.getNodeByOffset(parent, offset, length);
      const span = document.createElement("span");
      self.doms.push(span);
      span.addEventListener("mouseenter", () => {
        self.onHover();
      });
      span.addEventListener("mouseleave", () => {
        self.onHoverOut();
      });
      span.addEventListener("click", () => {
        postNote.selectNote(self);
      })
      span.setAttribute("class", `post-node ${self.id}`);
      span.appendChild(targetNode.cloneNode(false));
      targetNode.parentNode.replaceChild(span, targetNode);
    });
    self.addhighlightClass();
  }
  addClass(klass) {
    this.doms.map(d => {
      $(d).addClass(klass);
    });
  }
  removeClass(klass) {
    this.doms.map(d => {
      $(d).removeClass(klass);
    });
  }
  addhighlightClass() {
    this.addClass("post-node-mark");
  }
  onHover() {
    this.addClass("post-node-hover");
  }
  onHoverOut() {
    this.removeClass("post-node-hover");
  }
};


NKC.modules.PostNote = class {
  constructor(options) {
    const {selecter, onClick} = options;
    const self = this;

    self.button = $("#modulePostNoteButton");
    self.position = {
      x: 0,
      y: 0
    };
    self.range = "";
    self.sources = [];

    if(onClick) self.onClick = onClick;
    self.rootDom = $(selecter);
    if(!window.CommonModal) {
      if(!NKC.modules.CommonModal) {
        return sweetError("未引入表单模块");
      } else {
        window.CommonModal = new NKC.modules.CommonModal();
      }
    }
    window.addEventListener("mousedown", function(e) {
      self.position.x = e.clientX;
      self.position.y = e.clientY;
    });
    window.addEventListener("mouseup", function() {
      self.removeButton();
      const range = self.getRange();
      if(!range) return;      
      if(range.startContainer === self.range.startContainer &&
        range.endContainer === self.range.endContainer &&
        range.startOffset === self.range.startOffset &&
        range.endOffset === self.range.endOffset
      ) {
        return;
      }
      // 限制选择文字的区域，只能是selecter内的文字
      if(!self.rootDom[0].contains(range.startContainer) || !self.rootDom[0].contains(range.endContainer)) return;
      self.range = range;
      self.showButton();
    });
    self.button[0].addEventListener("mouseup", function() {
      self.removeButton();
      window.CommonModal.open(data => {
        if(!data[0].value) return sweetError("批注内容不能为空");
        const source = self.createSourceByRange(self.range, data[0].value)
        console.log(source);
        self.addSource(source);
        self.removeButton();
        window.CommonModal.close();
      }, {
        title: "添加批注",
        data: [
          {
            dom: "textarea",
            value: ""
          }
        ]
      });
    })
  }
  showButton() {
    this.button.css({
      top: this.position.y,
      left: this.position.x,
      display: "block"
    });
  }
  removeButton() {
    this.button.css("display", "none");
  }
  getParentNode(startNode, endNode) {
    if(!endNode || startNode === endNode) return startNode.parentNode;
    const startNodes = [], endNodes = [];
    const getParent = (node, nodes) => {
      nodes.push(node);
      if(node.parentNode) {
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
  findNodes(startNode, endNode) {
    const selectedNodes = [];
    const parent = this.getParentNode(startNode, endNode);
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
  getStartNode(range) {
    const {startContainer, endContainer, startOffset, endOffset} = range;
    let startNode;
    if(startContainer === endContainer) { 
      // 相同节点
      startNode = startContainer.splitText(startOffset);
      startNode.splitText(endOffset - startOffset);
    } else {
      startNode = startContainer.splitText(startOffset);
    }
    return startNode;
  }
  removeSource(source) {
    source.doms(dom => {
      // dom
    });
  }
  createSourceByRange(range, note) {
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
    const parent = this.getParentNode(startNode, endNode);
    const {tagName} = parent;
    const index = this.rootDom.find(tagName).index($(parent));
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
      postNote: this,
      notes: [
        {
          uid: NKC.configs.uid,
          c: note
        }
      ],
      nodes,
    });

  }
  addSource(source) {
    this.sources.push(source);
    console.log(source)
  }
  getRange() {
    const range = window.getSelection().getRangeAt(0);
    const {startOffset, endOffset} = range;
    if(startOffset === endOffset) return;
    return range;
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
  getNodeByOffset(parent, offset, length) {
    const nodeStack = [parent];
    let curNode = null;
    let curOffset = 0;
    let startOffset = 0;
    while (curNode = nodeStack.pop()) {
      const children = curNode.childNodes;
      for (let i = children.length - 1; i >= 0; i--) {
        nodeStack.push(children[i]);
      }
      if (curNode.nodeType === 3) {
        startOffset = offset - curOffset;
        curOffset += curNode.textContent.length;
        if (curOffset > offset) {
            break;
        }
      }
    }
    if (!curNode) {
      curNode = parent;
    }
    let node = curNode.splitText(startOffset);
    node.splitText(length);
    return node;
  }
  selectNote(id) {
    console.log(id);
  }
}

