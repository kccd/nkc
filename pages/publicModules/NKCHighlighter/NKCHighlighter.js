(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* 
  events:
    select: 划词
    create: 创建实例
    hover: 鼠标悬浮
    hoverOut: 鼠标移开
*/
window.Source =
/*#__PURE__*/
function () {
  function _class(options) {
    _classCallCheck(this, _class);

    var hl = options.hl,
        node = options.node,
        id = options.id,
        _id = options._id,
        content = options.content;
    id = id || _id;
    var self = this;
    this.hl = hl;
    this.node = node;
    this.content = hl.getNodesContent(node);
    this.dom = [];
    this.id = id;
    this._id = "nkc-hl-id-".concat(id);
    var _this$node = this.node,
        offset = _this$node.offset,
        length = _this$node.length;
    var targetNotes;

    if (length === 0) {
      // 如果length为0，那么此选区定位丢失
      // 在hl.root同级后插入一个div
      // 将丢失选区的笔记装在此div里，并添加点击事件
      var root = hl.root;
      var nextSibling = root.nextSibling,
          parentNode = root.parentNode;
      var nkcFreeNotes;

      if (nextSibling === null) {
        nkcFreeNotes = document.createElement("div");
        nkcFreeNotes.classList.add("nkc-free-notes");
      } else {
        nkcFreeNotes = nextSibling;
      }

      var noteNode = document.createElement("span");
      noteNode.innerText = content;
      nkcFreeNotes.appendChild(noteNode);

      if (!nextSibling) {
        parentNode.appendChild(nkcFreeNotes);
      }

      targetNotes = [noteNode];
    } else {
      targetNotes = self.getNodes(this.hl.root, offset, length);
    } // const targetNotes = self.getNodes(this.hl.root, offset, length);


    targetNotes.map(function (targetNode) {
      if (!targetNode.textContent.length) return;
      var parentNode = targetNode.parentNode;

      if (parentNode.classList.contains("nkc-hl")) {
        // 存在高亮嵌套的问题
        // 理想状态下，所有选区处于平级，重合部分被分隔，仅添加多个class
        var parentsId = parentNode.getAttribute("data-nkc-hl-id");
        if (!parentsId) return;
        parentsId = parentsId.split("-");
        var sources = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = parentsId[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var pid = _step.value;
            sources.push(self.hl.getSourceByID(Number(pid)));
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          var _loop = function _loop() {
            var node = _step2.value;
            if (!node.textContent.length) return "continue";
            var span = document.createElement("span");
            span.className = "nkc-hl";
            span.onmouseover = parentNode.onmouseover;
            span.onmouseout = parentNode.onmouseout;
            span.onclick = parentNode.onclick;
            sources.map(function (s) {
              s.dom.push(span);
            }); // 新选区

            if (node === targetNode) {
              // 如果新选区完全覆盖上层选区，则保留上层选区的事件，否则添加新选区相关事件
              if (parentNode.childNodes.length !== 1 || targetNotes.length === 1) {
                span.onmouseover = function () {
                  self.hl.emit(self.hl.eventNames.hover, self);
                };

                span.onmouseout = function () {
                  self.hl.emit(self.hl.eventNames.hoverOut, self);
                };

                span.onclick = function () {
                  self.hl.emit(self.hl.eventNames.click, self);
                };
              } // 覆盖区域添加class nkc-hl-cover


              span.className += " nkc-hl-cover";
              span.setAttribute("data-nkc-hl-id", parentsId.concat([self.id]).join("-"));
              self.dom.push(span);
            } else {
              span.setAttribute("data-nkc-hl-id", parentsId.join("-"));
            }

            span.appendChild(node.cloneNode(false));
            parentNode.replaceChild(span, node);
          };

          for (var _iterator2 = parentNode.childNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _ret = _loop();

            if (_ret === "continue") continue;
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        sources.map(function (s) {
          var parentIndex = s.dom.indexOf(parentNode);

          if (parentIndex !== -1) {
            s.dom.splice(parentIndex, 1);
          }
        }); // 清除上层选区dom的相关事件和class
        // parentNode.classList.remove(`nkc-hl`, source._id, `nkc-hl-cover`);
        // parentNode.className = "";

        parentNode.onmouseout = null;
        parentNode.onmouseover = null;
        parentNode.onclick = null;
      } else {
        // 全新选区 无覆盖的情况
        var span = document.createElement("span");
        span.classList.add("nkc-hl");
        span.setAttribute("data-nkc-hl-id", self.id);

        span.onmouseover = function () {
          self.hl.emit(self.hl.eventNames.hover, self);
        };

        span.onmouseout = function () {
          self.hl.emit(self.hl.eventNames.hoverOut, self);
        };

        span.onclick = function () {
          self.hl.emit(self.hl.eventNames.click, self);
        };

        self.dom.push(span);
        span.appendChild(targetNode.cloneNode(true));
        targetNode.parentNode.replaceChild(span, targetNode);
      }
    });
    this.hl.sources.push(this);
    this.hl.emit(this.hl.eventNames.create, this);
  }

  _createClass(_class, [{
    key: "addClass",
    value: function addClass(klass) {
      var dom = this.dom;
      dom.map(function (d) {
        d.classList.add(klass);
      });
    }
  }, {
    key: "removeClass",
    value: function removeClass(klass) {
      var dom = this.dom;
      dom.map(function (d) {
        d.classList.remove(klass);
      });
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.dom.map(function (d) {
        d.className = "";
      });
    }
  }, {
    key: "getSources",
    value: function getSources() {
      return this.sources;
    }
  }, {
    key: "getNodes",
    value: function getNodes(parent, offset, length) {
      var nodeStack = [parent];
      var curOffset = 0;
      var node = null;
      var curLength = length;
      var nodes = [];
      var started = false;
      var self = this;

      while (!!(node = nodeStack.pop())) {
        var children = node.childNodes; // loop:

        for (var i = children.length - 1; i >= 0; i--) {
          var _node = children[i];
          if (self.hl.isClown(_node)) continue;
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

          nodeStack.push(_node);
        }

        if (node.nodeType === 3 && node.textContent.length) {
          curOffset += node.textContent.length;

          if (curOffset > offset) {
            if (curLength <= 0) break;
            var startOffset = void 0;

            if (!started) {
              startOffset = node.textContent.length - (curOffset - offset);
            } else {
              startOffset = 0;
            }

            started = true;
            var needLength = void 0;

            if (curLength <= node.textContent.length - startOffset) {
              needLength = curLength;
              curLength = 0;
            } else {
              needLength = node.textContent.length - startOffset;
              curLength -= needLength;
            }

            nodes.push({
              node: node,
              startOffset: startOffset,
              needLength: needLength
            });
          }
        }
      }

      nodes = nodes.map(function (obj) {
        var node = obj.node,
            startOffset = obj.startOffset,
            needLength = obj.needLength;

        if (startOffset > 0) {
          node = node.splitText(startOffset);
        }

        if (node.textContent.length !== needLength) {
          node.splitText(needLength);
        }

        return node;
      });
      return nodes;
    }
  }]);

  return _class;
}();

window.NKCHighlighter =
/*#__PURE__*/
function () {
  function _class2(options) {
    _classCallCheck(this, _class2);

    var rootElementId = options.rootElementId,
        _options$excludedElem = options.excludedElementClass,
        excludedElementClass = _options$excludedElem === void 0 ? [] : _options$excludedElem,
        _options$excludedElem2 = options.excludedElementTagName,
        excludedElementTagName = _options$excludedElem2 === void 0 ? [] : _options$excludedElem2,
        _options$clownClass = options.clownClass,
        clownClass = _options$clownClass === void 0 ? [] : _options$clownClass,
        _options$clownAttr = options.clownAttr,
        clownAttr = _options$clownAttr === void 0 ? [] : _options$clownAttr,
        _options$clownTagName = options.clownTagName,
        clownTagName = _options$clownTagName === void 0 ? [] : _options$clownTagName;
    var self = this;
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
    var interval;
    document.addEventListener("mousedown", function () {
      clearInterval(interval);
    });
    document.addEventListener("selectionchange", function () {
      self.range = {};
      clearInterval(interval);
      interval = setTimeout(function () {
        self.initEvent();
      }, 500);
    });
  }

  _createClass(_class2, [{
    key: "initEvent",
    value: function initEvent() {
      try {
        // 屏蔽划词事件
        if (this.disabled) return;
        var range = this.getRange();
        if (!range || range.collapsed) return;
        if (range.startContainer === this.range.startContainer && range.endContainer === this.range.endContainer && range.startOffset === this.range.startOffset && range.endOffset === this.range.endOffset) return; // 限制选择文字的区域，只能是root下的选区

        if (!this.contains(range.startContainer) || !this.contains(range.endContainer)) return;
        this.range = range;
        this.emit(this.eventNames.select, {
          range: range
        });
      } catch (err) {
        console.log(err.message || err);
      }
    }
  }, {
    key: "contains",
    value: function contains(node) {
      while (node = node.parentNode) {
        if (node === this.root) return true;
      }

      return false;
    }
  }, {
    key: "getParent",
    value: function getParent(self, d) {
      if (d === self.root) return;
      if (this.isClown(d)) throw new Error("划词越界");
      if (d.parentNode) self.getParent(self, d.parentNode);
    }
  }, {
    key: "getRange",
    value: function getRange() {
      var _this = this;

      try {
        var range = window.getSelection().getRangeAt(0);
        var startOffset = range.startOffset,
            endOffset = range.endOffset,
            startContainer = range.startContainer,
            endContainer = range.endContainer;
        this.getParent(this, startContainer);
        this.getParent(this, endContainer);
        var nodes = this.findNodes(startContainer, endContainer);
        nodes.map(function (node) {
          _this.getParent(_this, node);
        });
        if (startOffset === endOffset && startContainer === endContainer) return;
        return range;
      } catch (err) {
        console.log(err.message || err);
      }
    }
  }, {
    key: "destroy",
    value: function destroy(source) {
      if (typeof source === "string") {
        source = this.getSourceByID(source);
      }

      source.destroy();
    }
  }, {
    key: "restoreSources",
    value: function restoreSources() {
      var sources = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = sources[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var source = _step3.value;
          source.hl = this;
          new Source(source);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
            _iterator3["return"]();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  }, {
    key: "getNodes",
    value: function getNodes(range) {
      var startContainer = range.startContainer,
          endContainer = range.endContainer,
          startOffset = range.startOffset,
          endOffset = range.endOffset; // if(startOffset === endOffset) return;

      var selectedNodes = [],
          startNode,
          endNode; // if(startContainer.nodeType !== 3 || startContainer.nodeType !== 3) return;

      if (startContainer === endContainer) {
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
        endNode = endContainer; // 当起始节点不为文本节点时，无需插入起始节点
        // 在获取子节点时会将插入起始节点的子节点，如果这里不做判断，会出现起始节点内容重复的问题。

        if (startNode.nodeType === 3) {
          selectedNodes.push({
            node: startNode,
            offset: startOffset,
            length: startNode.textContent.length - startOffset
          });
        }

        var _nodes = this.findNodes(startNode, endNode);

        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = _nodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var node = _step4.value;
            selectedNodes.push({
              node: node,
              offset: 0,
              length: node.textContent.length
            });
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
              _iterator4["return"]();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }

        selectedNodes.push({
          node: endNode,
          offset: 0,
          length: endOffset
        });
      }

      var nodes = [];

      for (var _i = 0, _selectedNodes = selectedNodes; _i < _selectedNodes.length; _i++) {
        var obj = _selectedNodes[_i];
        var _node3 = obj.node,
            _offset = obj.offset,
            _length = obj.length;

        var _content = _node3.textContent.slice(_offset, _offset + _length);

        var offset_ = this.getOffset(_node3);
        nodes.push({
          content: _content,
          offset: offset_ + _offset,
          length: _length
        });
      }

      if (!nodes.length) return null;
      var content = "",
          offset = 0,
          length = 0;

      for (var i = 0; i < nodes.length; i++) {
        var _node2 = nodes[i];
        content += _node2.content;
        length += _node2.length;
        if (i === 0) offset = _node2.offset;
      }

      return {
        content: content,
        offset: offset,
        length: length
      };
    }
  }, {
    key: "getNodesContent",
    value: function getNodesContent(node) {
      return node.content;
    }
  }, {
    key: "createSource",
    value: function createSource(id, node) {
      return new Source({
        hl: this,
        id: id,
        node: node
      });
    }
  }, {
    key: "getSourceByID",
    value: function getSourceByID(id) {
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = this.sources[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var s = _step5.value;
          if (s.id === id) return s;
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
            _iterator5["return"]();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    }
  }, {
    key: "addClass",
    value: function addClass(id, className) {
      var source;

      if (typeof id === "string") {
        source = this.getSourceByID(id);
      } else {
        source = id;
      }

      source.addClass(className);
    }
  }, {
    key: "removeClass",
    value: function removeClass(id, className) {
      var source;

      if (typeof id === "string") {
        source = this.getSourceByID(id);
      } else {
        source = id;
      }

      source.removeClass(className);
    }
  }, {
    key: "getOffset",
    value: function getOffset(text) {
      var nodeStack = [this.root];
      var curNode = null;
      var offset = 0;
      var self = this;

      while (!!(curNode = nodeStack.pop())) {
        var children = curNode.childNodes; // loop:

        for (var i = children.length - 1; i >= 0; i--) {
          var node = children[i];
          if (self.isClown(node)) continue;
          nodeStack.push(node);
        }

        if (curNode.nodeType === 3 && curNode !== text) {
          offset += curNode.textContent.length;
        } else if (curNode.nodeType === 3) {
          break;
        }
      }

      return offset;
    }
  }, {
    key: "findNodes",
    value: function findNodes(startNode, endNode) {
      var selectedNodes = [];
      var parent = this.getSameParentNode(startNode, endNode);

      if (parent) {
        var start = false,
            end = false;

        var getChildNode = function getChildNode(node) {
          if (!node.hasChildNodes()) return;
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = node.childNodes[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var n = _step6.value;

              if (end || n === endNode) {
                end = true;
                return;
              } else if (start && n.nodeType === 3) {
                selectedNodes.push(n);
              } else if (n === startNode) {
                start = true;
              }

              getChildNode(n);
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
                _iterator6["return"]();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }
        };

        getChildNode(parent);
      }

      return selectedNodes;
    }
  }, {
    key: "isClown",
    value: function isClown(node) {
      // 判断node是否需要排除
      if (node.nodeType === 1) {
        var cl = node.classList;
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = this.clownClass[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var c = _step7.value;

            if (cl.contains(c)) {
              return true;
            }
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
              _iterator7["return"]();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }

        var elementTagName = node.tagName.toLowerCase();

        if (this.clownTagName.includes(elementTagName)) {
          return true;
        }

        for (var key in this.clownAttr) {
          if (!this.clownAttr.hasOwnProperty(key)) continue;
          if (node.getAttribute(key) === this.clownAttr[key]) return true;
        }
      }
    }
  }, {
    key: "getSameParentNode",
    value: function getSameParentNode(startNode, endNode) {
      var self = this;
      if (!endNode || startNode === endNode) return startNode.parentNode;
      var startNodes = [],
          endNodes = [];

      var getParent = function getParent(node, nodes) {
        nodes.push(node);

        if (node !== self.root && node.parentNode) {
          getParent(node.parentNode, nodes);
        }
      };

      getParent(startNode, startNodes);
      getParent(endNode, endNodes);
      var parent;

      for (var _i2 = 0, _startNodes = startNodes; _i2 < _startNodes.length; _i2++) {
        var node = _startNodes[_i2];

        if (endNodes.includes(node)) {
          parent = node;
          break;
        }
      }

      return parent;
    }
  }, {
    key: "getSourceById",
    value: function getSourceById(id) {
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = this.sources[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var s = _step8.value;

          if (s.id === id) {
            return s;
          }
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
            _iterator8["return"]();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }
    }
  }, {
    key: "offset",
    value: function offset(node) {
      var top = 0,
          left = 0,
          _position;

      var getOffset = function getOffset(n, init) {
        if (n.nodeType !== 1) {
          return;
        }

        _position = window.getComputedStyle(n)['position'];

        if (typeof init === 'undefined' && _position === 'static') {
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
        top: top,
        left: left
      };
    }
  }, {
    key: "getStartNodeOffset",
    value: function getStartNodeOffset(range) {
      // 在选区起始处插入span
      // 获取span的位置信息
      // 移除span
      var span = document.createElement("span"); // span.style.display = "none";

      span.style.display = "inline-block";
      span.style.verticalAlign = "top";
      range.insertNode(span);
      var parentNode = span.parentNode;
      span.style.width = "30px";
      var offset = this.offset(span);
      parentNode.removeChild(span);
      return offset;
    }
  }, {
    key: "lock",
    value: function lock() {
      this.disabled = true;
    }
  }, {
    key: "unlock",
    value: function unlock() {
      this.disabled = false;
    }
  }, {
    key: "on",
    value: function on(eventName, callback) {
      if (!this.events[eventName]) {
        this.events[eventName] = [];
      }

      this.events[eventName].push(callback);
      return this;
    }
  }, {
    key: "emit",
    value: function emit(eventName, data) {
      (this.events[eventName] || []).map(function (func) {
        func(data);
      });
    }
  }]);

  return _class2;
}();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvTktDSGlnaGxpZ2h0ZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQTs7Ozs7OztBQU9BLE1BQU0sQ0FBQyxNQUFQO0FBQUE7QUFBQTtBQUNFLGtCQUFZLE9BQVosRUFBcUI7QUFBQTs7QUFBQSxRQUNkLEVBRGMsR0FDZ0IsT0FEaEIsQ0FDZCxFQURjO0FBQUEsUUFDVixJQURVLEdBQ2dCLE9BRGhCLENBQ1YsSUFEVTtBQUFBLFFBQ0osRUFESSxHQUNnQixPQURoQixDQUNKLEVBREk7QUFBQSxRQUNBLEdBREEsR0FDZ0IsT0FEaEIsQ0FDQSxHQURBO0FBQUEsUUFDSyxPQURMLEdBQ2dCLE9BRGhCLENBQ0ssT0FETDtBQUVuQixJQUFBLEVBQUUsR0FBRyxFQUFFLElBQUcsR0FBVjtBQUNBLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxTQUFLLEVBQUwsR0FBVSxFQUFWO0FBQ0EsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFNBQUssT0FBTCxHQUFlLEVBQUUsQ0FBQyxlQUFILENBQW1CLElBQW5CLENBQWY7QUFDQSxTQUFLLEdBQUwsR0FBVyxFQUFYO0FBQ0EsU0FBSyxFQUFMLEdBQVUsRUFBVjtBQUNBLFNBQUssR0FBTCx1QkFBd0IsRUFBeEI7QUFUbUIscUJBVU0sS0FBSyxJQVZYO0FBQUEsUUFVWixNQVZZLGNBVVosTUFWWTtBQUFBLFFBVUosTUFWSSxjQVVKLE1BVkk7QUFXbkIsUUFBSSxXQUFKOztBQUNBLFFBQUcsTUFBTSxLQUFLLENBQWQsRUFBaUI7QUFDZjtBQUNBO0FBQ0E7QUFIZSxVQUlSLElBSlEsR0FJQSxFQUpBLENBSVIsSUFKUTtBQUFBLFVBS1YsV0FMVSxHQUtpQixJQUxqQixDQUtWLFdBTFU7QUFBQSxVQUtHLFVBTEgsR0FLaUIs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SDtBQUFBO0FBQUEsNkJBNFZXO0FBQ1AsV0FBSyxRQUFMLEdBQWdCLEtBQWhCO0FBQ0Q7QUE5Vkg7QUFBQTtBQUFBLHVCQStWSyxTQS9WTCxFQStWZ0IsUUEvVmhCLEVBK1YwQjtBQUN0QixVQUFHLENBQUMsS0FBSyxNQUFMLENBQVksU0FBWixDQUFKLEVBQTRCO0FBQzFCLGFBQUssTUFBTCxDQUFZLFNBQVosSUFBeUIsRUFBekI7QUFDRDs7QUFDRCxXQUFLLE1BQUwsQ0FBWSxTQUFaLEVBQXVCLElBQXZCLENBQTRCLFFBQTVCO0FBQ0EsYUFBTyxJQUFQO0FBQ0Q7QUFyV0g7QUFBQTtBQUFBLHlCQXNXTyxTQXRXUCxFQXNXa0IsSUF0V2xCLEVBc1d3QjtBQUNwQixPQUFDLEtBQUssTUFBTCxDQUFZLFNBQVosS0FBMEIsRUFBM0IsRUFBK0IsR0FBL0IsQ0FBbUMsVUFBQSxJQUFJLEVBQUk7QUFDekMsUUFBQSxJQUFJLENBQUMsSUFBRCxDQUFKO0FBQ0QsT0FGRDtBQUdEO0FBMVdIOztBQUFBO0FBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKiBcbiAgZXZlbnRzOlxuICAgIHNlbGVjdDog5YiS6K+NXG4gICAgY3JlYXRlOiDliJvlu7rlrp7kvotcbiAgICBob3Zlcjog6byg5qCH5oKs5rWuXG4gICAgaG92ZXJPdXQ6IOm8oOagh+enu+W8gFxuKi9cbndpbmRvdy5Tb3VyY2UgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBsZXQge2hsLCBub2RlLCBpZCwgX2lkLCBjb250ZW50fSA9IG9wdGlvbnM7XG4gICAgaWQgPSBpZCB8fF9pZDtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICB0aGlzLmhsID0gaGw7XG4gICAgdGhpcy5ub2RlID0gbm9kZTtcbiAgICB0aGlzLmNvbnRlbnQgPSBobC5nZXROb2Rlc0NvbnRlbnQobm9kZSk7XG4gICAgdGhpcy5kb20gPSBbXTtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5faWQgPSBgbmtjLWhsLWlkLSR7aWR9YDtcbiAgICBjb25zdCB7b2Zmc2V0LCBsZW5ndGh9ID0gdGhpcy5ub2RlO1xuICAgIGxldCB0YXJnZXROb3RlcztcbiAgICBpZihsZW5ndGggPT09IDApIHtcbiAgICAgIC8vIOWmguaenGxlbmd0aOS4ujDvvIzpgqPkuYjmraTpgInljLrlrprkvY3kuKLlpLFcbiAgICAgIC8vIOWcqGhsLnJvb3TlkIznuqflkI7mj5LlhaXkuIDkuKpkaXZcbiAgICAgIC8vIOWwhuS4ouWksemAieWMuueahOeslOiusOijheWcqOatpGRpdumHjO+8jOW5tua3u+WKoOeCueWHu+S6i+S7tlxuICAgICAgY29uc3Qge3Jvb3R9ID0gaGw7XG4gICAgICBsZXQge25leHRTaWJsaW5nLCBwYXJlbnROb2RlfSA9IHJvb3Q7XG4gICAgICBsZXQgbmtjRnJlZU5vdGVzO1xuICAgICAgaWYobmV4dFNpYmxpbmcgPT09IG51bGwpIHtcbiAgICAgICAgbmtjRnJlZU5vdGVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgbmtjRnJlZU5vdGVzLmNsYXNzTGlzdC5hZGQoXCJua2MtZnJlZS1ub3Rlc1wiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5rY0ZyZWVOb3RlcyA9IG5leHRTaWJsaW5nO1xuICAgICAgfVxuICAgICAgY29uc3Qgbm90ZU5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICAgIG5vdGVOb2RlLmlubmVyVGV4dCA9IGNvbnRlbnQ7XG5cbiAgICAgIG5rY0ZyZWVOb3Rlcy5hcHBlbmRDaGlsZChub3RlTm9kZSk7XG4gICAgICBpZighbmV4dFNpYmxpbmcpIHtcbiAgICAgICAgcGFyZW50Tm9kZS5hcHBlbmRDaGlsZChua2NGcmVlTm90ZXMpO1xuICAgICAgfVxuICAgICAgdGFyZ2V0Tm90ZXMgPSBbbm90ZU5vZGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICB0YXJnZXROb3RlcyA9IHNlbGYuZ2V0Tm9kZXModGhpcy5obC5yb290LCBvZmZzZXQsIGxlbmd0aCk7XG4gICAgfVxuICAgIC8vIGNvbnN0IHRhcmdldE5vdGVzID0gc2VsZi5nZXROb2Rlcyh0aGlzLmhsLnJvb3QsIG9mZnNldCwgbGVuZ3RoKTtcbiAgICB0YXJnZXROb3Rlcy5tYXAodGFyZ2V0Tm9kZSA9PiB7XG4gICAgICBpZighdGFyZ2V0Tm9kZS50ZXh0Q29udGVudC5sZW5ndGgpIHJldHVybjtcbiAgICAgIGNvbnN0IHBhcmVudE5vZGUgPSB0YXJnZXROb2RlLnBhcmVudE5vZGU7XG4gICAgICBpZihwYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucyhcIm5rYy1obFwiKSkge1xuICAgICAgICAvLyDlrZjlnKjpq5jkuq7ltYzlpZfnmoTpl67pophcbiAgICAgICAgLy8g55CG5oOz54q25oCB5LiL77yM5omA5pyJ6YCJ5Yy65aSE5LqO5bmz57qn77yM6YeN5ZCI6YOo5YiG6KKr5YiG6ZqU77yM5LuF5re75Yqg5aSa5LiqY2xhc3NcbiAgICAgICAgbGV0IHBhcmVudHNJZCA9IHBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKFwiZGF0YS1ua2MtaGwtaWRcIik7XG4gICAgICAgIGlmKCFwYXJlbnRzSWQpIHJldHVybjtcbiAgICAgICAgcGFyZW50c0lkID0gcGFyZW50c0lkLnNwbGl0KFwiLVwiKTtcbiAgICAgICAgY29uc3Qgc291cmNlcyA9IFtdO1xuICAgICAgICBmb3IoY29uc3QgcGlkIG9mIHBhcmVudHNJZCkge1xuICAgICAgICAgIHNvdXJjZXMucHVzaChzZWxmLmhsLmdldFNvdXJjZUJ5SUQoTnVtYmVyKHBpZCkpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcihjb25zdCBub2RlIG9mIHBhcmVudE5vZGUuY2hpbGROb2Rlcykge1xuICAgICAgICAgIGlmKCFub2RlLnRleHRDb250ZW50Lmxlbmd0aCkgY29udGludWU7XG4gICAgICAgICAgY29uc3Qgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgICAgICAgIHNwYW4uY2xhc3NOYW1lID0gYG5rYy1obGA7XG4gICAgICAgICAgc3Bhbi5vbm1vdXNlb3ZlciA9IHBhcmVudE5vZGUub25tb3VzZW92ZXI7XG4gICAgICAgICAgc3Bhbi5vbm1vdXNlb3V0ID0gcGFyZW50Tm9kZS5vbm1vdXNlb3V0O1xuICAgICAgICAgIHNwYW4ub25jbGljayA9IHBhcmVudE5vZGUub25jbGljaztcbiAgICAgICAgICBzb3VyY2VzLm1hcChzID0+IHtcbiAgICAgICAgICAgIHMuZG9tLnB1c2goc3Bhbik7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyDmlrDpgInljLpcbiAgICAgICAgICBpZihub2RlID09PSB0YXJnZXROb2RlKSB7XG4gICAgICAgICAgICAvLyDlpoLmnpzmlrDpgInljLrlrozlhajopobnm5bkuIrlsYLpgInljLrvvIzliJnkv53nlZnkuIrlsYLpgInljLrnmoTkuovku7bvvIzlkKbliJnmt7vliqDmlrDpgInljLrnm7jlhbPkuovku7ZcbiAgICAgICAgICAgIGlmKHBhcmVudE5vZGUuY2hpbGROb2Rlcy5sZW5ndGggIT09IDEgfHwgdGFyZ2V0Tm90ZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgIHNwYW4ub25tb3VzZW92ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmhvdmVyLCBzZWxmKTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgc3Bhbi5vbm1vdXNlb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5obC5lbWl0KHNlbGYuaGwuZXZlbnROYW1lcy5ob3Zlck91dCwgc2VsZik7XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHNwYW4ub25jbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuaGwuZW1pdChzZWxmLmhsLmV2ZW50TmFtZXMuY2xpY2ssIHNlbGYpO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8g6KaG55uW5Yy65Z+f5re75YqgY2xhc3MgbmtjLWhsLWNvdmVyXG4gICAgICAgICAgICBzcGFuLmNsYXNzTmFtZSArPSBgIG5rYy1obC1jb3ZlcmA7XG4gICAgICAgICAgICBzcGFuLnNldEF0dHJpYnV0ZShgZGF0YS1ua2MtaGwtaWRgLCBwYXJlbnRzSWQuY29uY2F0KFtzZWxmLmlkXSkuam9pbihcIi1cIikpO1xuICAgICAgICAgICAgc2VsZi5kb20ucHVzaChzcGFuKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3Bhbi5zZXRBdHRyaWJ1dGUoYGRhdGEtbmtjLWhsLWlkYCwgcGFyZW50c0lkLmpvaW4oXCItXCIpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc3Bhbi5hcHBlbmRDaGlsZChub2RlLmNsb25lTm9kZShmYWxzZSkpO1xuICAgICAgICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHNwYW4sIG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIHNvdXJjZXMubWFwKHMgPT4ge1xuICAgICAgICAgIGNvbnN0IHBhcmVudEluZGV4ID0gcy5kb20uaW5kZXhPZihwYXJlbnROb2RlKTtcbiAgICAgICAgICBpZihwYXJlbnRJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgIHMuZG9tLnNwbGljZShwYXJlbnRJbmRleCwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8g5riF6Zmk5LiK5bGC6YCJ5Yy6ZG9t55qE55u45YWz5LqL5Lu25ZKMY2xhc3NcbiAgICAgICAgLy8gcGFyZW50Tm9kZS5jbGFzc0xpc3QucmVtb3ZlKGBua2MtaGxgLCBzb3VyY2UuX2lkLCBgbmtjLWhsLWNvdmVyYCk7XG4gICAgICAgIC8vIHBhcmVudE5vZGUuY2xhc3NOYW1lID0gXCJcIjtcbiAgICAgICAgcGFyZW50Tm9kZS5vbm1vdXNlb3V0ID0gbnVsbDtcbiAgICAgICAgcGFyZW50Tm9kZS5vbm1vdXNlb3ZlciA9IG51bGw7XG4gICAgICAgIHBhcmVudE5vZGUub25jbGljayA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyDlhajmlrDpgInljLog5peg6KaG55uW55qE5oOF5Ya1XG4gICAgICAgIGNvbnN0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcblxuICAgICAgICBzcGFuLmNsYXNzTGlzdC5hZGQoXCJua2MtaGxcIik7XG4gICAgICAgIHNwYW4uc2V0QXR0cmlidXRlKFwiZGF0YS1ua2MtaGwtaWRcIiwgc2VsZi5pZCk7XG5cbiAgICAgICAgc3Bhbi5vbm1vdXNlb3ZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYuaGwuZW1pdChzZWxmLmhsLmV2ZW50TmFtZXMuaG92ZXIsIHNlbGYpO1xuICAgICAgICB9O1xuICAgICAgICBzcGFuLm9ubW91c2VvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmhvdmVyT3V0LCBzZWxmKTtcbiAgICAgICAgfTtcbiAgICAgICAgc3Bhbi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2VsZi5obC5lbWl0KHNlbGYuaGwuZXZlbnROYW1lcy5jbGljaywgc2VsZik7XG4gICAgICAgIH07XG5cbiAgICAgICAgc2VsZi5kb20ucHVzaChzcGFuKTtcbiAgICAgICAgc3Bhbi5hcHBlbmRDaGlsZCh0YXJnZXROb2RlLmNsb25lTm9kZSh0cnVlKSk7XG4gICAgICAgIHRhcmdldE5vZGUucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoc3BhbiwgdGFyZ2V0Tm9kZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5obC5zb3VyY2VzLnB1c2godGhpcyk7XG4gICAgdGhpcy5obC5lbWl0KHRoaXMuaGwuZXZlbnROYW1lcy5jcmVhdGUsIHRoaXMpO1xuICB9XG4gIGFkZENsYXNzKGtsYXNzKSB7XG4gICAgY29uc3Qge2RvbX0gPSB0aGlzO1xuICAgIGRvbS5tYXAoZCA9PiB7XG4gICAgICBkLmNsYXNzTGlzdC5hZGQoa2xhc3MpO1xuICAgIH0pO1xuICB9XG4gIHJlbW92ZUNsYXNzKGtsYXNzKSB7XG4gICAgY29uc3Qge2RvbX0gPSB0aGlzO1xuICAgIGRvbS5tYXAoZCA9PiB7XG4gICAgICBkLmNsYXNzTGlzdC5yZW1vdmUoa2xhc3MpO1xuICAgIH0pO1xuICB9XG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5kb20ubWFwKGQgPT4ge1xuICAgICAgZC5jbGFzc05hbWUgPSBcIlwiO1xuICAgIH0pO1xuICB9XG4gIGdldFNvdXJjZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuc291cmNlcztcbiAgfVxuICBnZXROb2RlcyhwYXJlbnQsIG9mZnNldCwgbGVuZ3RoKSB7XG4gICAgY29uc3Qgbm9kZVN0YWNrID0gW3BhcmVudF07XG4gICAgbGV0IGN1ck9mZnNldCA9IDA7XG4gICAgbGV0IG5vZGUgPSBudWxsO1xuICAgIGxldCBjdXJMZW5ndGggPSBsZW5ndGg7XG4gICAgbGV0IG5vZGVzID0gW107XG4gICAgbGV0IHN0YXJ0ZWQgPSBmYWxzZTtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICB3aGlsZSghIShub2RlID0gbm9kZVN0YWNrLnBvcCgpKSkge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSBub2RlLmNoaWxkTm9kZXM7XG4gICAgICAvLyBsb29wOlxuICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgaWYoc2VsZi5obC5pc0Nsb3duKG5vZGUpKSBjb250aW51ZTtcbiAgICAgICAgLyppZihub2RlLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgY29uc3QgY2wgPSBub2RlLmNsYXNzTGlzdDtcbiAgICAgICAgICBmb3IoY29uc3QgYyBvZiBzZWxmLmhsLmV4Y2x1ZGVkRWxlbWVudENsYXNzKSB7XG4gICAgICAgICAgICBpZihjbC5jb250YWlucyhjKSkge1xuICAgICAgICAgICAgICBjb250aW51ZSBsb29wO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBlbGVtZW50VGFnTmFtZSA9IG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGlmKHNlbGYuaGwuZXhjbHVkZWRFbGVtZW50VGFnTmFtZS5pbmNsdWRlcyhlbGVtZW50VGFnTmFtZSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSovXG4gICAgICAgIG5vZGVTdGFjay5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgICAgaWYobm9kZS5ub2RlVHlwZSA9PT0gMyAmJiBub2RlLnRleHRDb250ZW50Lmxlbmd0aCkge1xuICAgICAgICBjdXJPZmZzZXQgKz0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGg7XG4gICAgICAgIGlmKGN1ck9mZnNldCA+IG9mZnNldCkge1xuICAgICAgICAgIGlmKGN1ckxlbmd0aCA8PSAwKSBicmVhaztcbiAgICAgICAgICBsZXQgc3RhcnRPZmZzZXQ7XG4gICAgICAgICAgaWYoIXN0YXJ0ZWQpIHtcbiAgICAgICAgICAgIHN0YXJ0T2Zmc2V0ID0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSAoY3VyT2Zmc2V0IC0gb2Zmc2V0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhcnRPZmZzZXQgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICBsZXQgbmVlZExlbmd0aDtcbiAgICAgICAgICBpZihjdXJMZW5ndGggPD0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSBzdGFydE9mZnNldCkge1xuICAgICAgICAgICAgbmVlZExlbmd0aCA9IGN1ckxlbmd0aDtcbiAgICAgICAgICAgIGN1ckxlbmd0aCA9IDA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5lZWRMZW5ndGggPSBub2RlLnRleHRDb250ZW50Lmxlbmd0aCAtIHN0YXJ0T2Zmc2V0O1xuICAgICAgICAgICAgY3VyTGVuZ3RoIC09IG5lZWRMZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIG5vZGVzLnB1c2goe1xuICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgIHN0YXJ0T2Zmc2V0LFxuICAgICAgICAgICAgbmVlZExlbmd0aFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIG5vZGVzID0gbm9kZXMubWFwKG9iaiA9PiB7XG4gICAgICBsZXQge25vZGUsIHN0YXJ0T2Zmc2V0LCBuZWVkTGVuZ3RofSA9IG9iajtcbiAgICAgIGlmKHN0YXJ0T2Zmc2V0ID4gMCkge1xuICAgICAgICBub2RlID0gbm9kZS5zcGxpdFRleHQoc3RhcnRPZmZzZXQpO1xuICAgICAgfVxuICAgICAgaWYobm9kZS50ZXh0Q29udGVudC5sZW5ndGggIT09IG5lZWRMZW5ndGgpIHtcbiAgICAgICAgbm9kZS5zcGxpdFRleHQobmVlZExlbmd0aCk7ICBcbiAgICAgIH1cbiAgICAgIHJldHVybiBub2RlO1xuICAgIH0pO1xuICAgIHJldHVybiBub2RlcztcbiAgfVxufTtcblxud2luZG93Lk5LQ0hpZ2hsaWdodGVyID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgY29uc3Qge1xuICAgICAgcm9vdEVsZW1lbnRJZCwgZXhjbHVkZWRFbGVtZW50Q2xhc3MgPSBbXSxcbiAgICAgIGV4Y2x1ZGVkRWxlbWVudFRhZ05hbWUgPSBbXSxcblxuICAgICAgY2xvd25DbGFzcyA9IFtdLCBjbG93bkF0dHIgPSBbXSwgY2xvd25UYWdOYW1lID0gW11cbiAgICB9ID0gb3B0aW9ucztcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBzZWxmLnJvb3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChyb290RWxlbWVudElkKTtcbiAgICBzZWxmLmV4Y2x1ZGVkRWxlbWVudENsYXNzID0gZXhjbHVkZWRFbGVtZW50Q2xhc3M7XG4gICAgc2VsZi5leGNsdWRlZEVsZW1lbnRUYWdOYW1lID0gZXhjbHVkZWRFbGVtZW50VGFnTmFtZTtcblxuICAgIHNlbGYuY2xvd25DbGFzcyA9IGNsb3duQ2xhc3M7XG4gICAgc2VsZi5jbG93bkF0dHIgPSBjbG93bkF0dHI7XG4gICAgc2VsZi5jbG93blRhZ05hbWUgPSBjbG93blRhZ05hbWU7XG5cblxuICAgIHNlbGYucmFuZ2UgPSB7fTtcbiAgICBzZWxmLnNvdXJjZXMgPSBbXTtcbiAgICBzZWxmLmV2ZW50cyA9IHt9O1xuICAgIHNlbGYuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICBzZWxmLmV2ZW50TmFtZXMgPSB7XG4gICAgICBjcmVhdGU6IFwiY3JlYXRlXCIsXG4gICAgICBob3ZlcjogXCJob3ZlclwiLFxuICAgICAgaG92ZXJPdXQ6IFwiaG92ZXJPdXRcIixcbiAgICAgIHNlbGVjdDogXCJzZWxlY3RcIlxuICAgIH07XG5cbiAgICBsZXQgaW50ZXJ2YWw7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsICgpID0+IHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInNlbGVjdGlvbmNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICBzZWxmLnJhbmdlID0ge307XG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcblxuICAgICAgaW50ZXJ2YWwgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgc2VsZi5pbml0RXZlbnQoKTtcbiAgICAgIH0sIDUwMCk7XG4gICAgfSk7XG5cblxuICB9XG4gIGluaXRFdmVudCgpIHtcbiAgICB0cnl7XG4gICAgICAvLyDlsY/olL3liJLor43kuovku7ZcbiAgICAgIGlmKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5nZXRSYW5nZSgpO1xuICAgICAgaWYoIXJhbmdlIHx8IHJhbmdlLmNvbGxhcHNlZCkgcmV0dXJuO1xuICAgICAgaWYoXG4gICAgICAgIHJhbmdlLnN0YXJ0Q29udGFpbmVyID09PSB0aGlzLnJhbmdlLnN0YXJ0Q29udGFpbmVyICYmXG4gICAgICAgIHJhbmdlLmVuZENvbnRhaW5lciA9PT0gdGhpcy5yYW5nZS5lbmRDb250YWluZXIgJiZcbiAgICAgICAgcmFuZ2Uuc3RhcnRPZmZzZXQgPT09IHRoaXMucmFuZ2Uuc3RhcnRPZmZzZXQgJiZcbiAgICAgICAgcmFuZ2UuZW5kT2Zmc2V0ID09PSB0aGlzLnJhbmdlLmVuZE9mZnNldFxuICAgICAgKSByZXR1cm47XG4gICAgICAvLyDpmZDliLbpgInmi6nmloflrZfnmoTljLrln5/vvIzlj6rog73mmK9yb2905LiL55qE6YCJ5Yy6XG4gICAgICBpZighdGhpcy5jb250YWlucyhyYW5nZS5zdGFydENvbnRhaW5lcikgfHwgIXRoaXMuY29udGFpbnMocmFuZ2UuZW5kQ29udGFpbmVyKSkgcmV0dXJuO1xuICAgICAgdGhpcy5yYW5nZSA9IHJhbmdlO1xuICAgICAgdGhpcy5lbWl0KHRoaXMuZXZlbnROYW1lcy5zZWxlY3QsIHtcbiAgICAgICAgcmFuZ2VcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2goZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIubWVzc2FnZSB8fCBlcnIpO1xuICAgIH1cbiAgfVxuICBjb250YWlucyhub2RlKSB7XG4gICAgd2hpbGUoKG5vZGUgPSBub2RlLnBhcmVudE5vZGUpKSB7XG4gICAgICBpZihub2RlID09PSB0aGlzLnJvb3QpIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZ2V0UGFyZW50KHNlbGYsIGQpIHtcbiAgICBpZihkID09PSBzZWxmLnJvb3QpIHJldHVybjtcbiAgICBpZih0aGlzLmlzQ2xvd24oZCkpIHRocm93IG5ldyAgRXJyb3IoXCLliJLor43otornlYxcIik7XG4gICAgaWYoZC5wYXJlbnROb2RlKSBzZWxmLmdldFBhcmVudChzZWxmLCBkLnBhcmVudE5vZGUpO1xuICB9XG4gIGdldFJhbmdlKCkge1xuICAgIHRyeXtcbiAgICAgIGNvbnN0IHJhbmdlID0gd2luZG93LmdldFNlbGVjdGlvbigpLmdldFJhbmdlQXQoMCk7XG4gICAgICBjb25zdCB7c3RhcnRPZmZzZXQsIGVuZE9mZnNldCwgc3RhcnRDb250YWluZXIsIGVuZENvbnRhaW5lcn0gPSByYW5nZTtcbiAgICAgIHRoaXMuZ2V0UGFyZW50KHRoaXMsIHN0YXJ0Q29udGFpbmVyKTtcbiAgICAgIHRoaXMuZ2V0UGFyZW50KHRoaXMsIGVuZENvbnRhaW5lcik7XG4gICAgICBjb25zdCBub2RlcyA9IHRoaXMuZmluZE5vZGVzKHN0YXJ0Q29udGFpbmVyLCBlbmRDb250YWluZXIpO1xuICAgICAgbm9kZXMubWFwKG5vZGUgPT4ge1xuICAgICAgICB0aGlzLmdldFBhcmVudCh0aGlzLCBub2RlKTtcbiAgICAgIH0pO1xuICAgICAgaWYoc3RhcnRPZmZzZXQgPT09IGVuZE9mZnNldCAmJiBzdGFydENvbnRhaW5lciA9PT0gZW5kQ29udGFpbmVyKSByZXR1cm47XG4gICAgICByZXR1cm4gcmFuZ2U7XG4gICAgfSBjYXRjaChlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVyci5tZXNzYWdlIHx8IGVycik7XG4gICAgfVxuICB9XG4gIGRlc3Ryb3koc291cmNlKSB7XG4gICAgaWYodHlwZW9mIHNvdXJjZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgc291cmNlID0gdGhpcy5nZXRTb3VyY2VCeUlEKHNvdXJjZSk7XG4gICAgfVxuICAgIHNvdXJjZS5kZXN0cm95KCk7XG4gIH1cbiAgcmVzdG9yZVNvdXJjZXMoc291cmNlcyA9IFtdKSB7XG4gICAgZm9yKGNvbnN0IHNvdXJjZSBvZiBzb3VyY2VzKSB7XG4gICAgICBzb3VyY2UuaGwgPSB0aGlzO1xuICAgICAgbmV3IFNvdXJjZShzb3VyY2UpO1xuICAgIH1cbiAgfVxuICBnZXROb2RlcyhyYW5nZSkge1xuICAgIGNvbnN0IHtzdGFydENvbnRhaW5lciwgZW5kQ29udGFpbmVyLCBzdGFydE9mZnNldCwgZW5kT2Zmc2V0fSA9IHJhbmdlO1xuICAgIC8vIGlmKHN0YXJ0T2Zmc2V0ID09PSBlbmRPZmZzZXQpIHJldHVybjtcbiAgICBsZXQgc2VsZWN0ZWROb2RlcyA9IFtdLCBzdGFydE5vZGUsIGVuZE5vZGU7XG4gICAgLy8gaWYoc3RhcnRDb250YWluZXIubm9kZVR5cGUgIT09IDMgfHwgc3RhcnRDb250YWluZXIubm9kZVR5cGUgIT09IDMpIHJldHVybjtcbiAgICBpZihzdGFydENvbnRhaW5lciA9PT0gZW5kQ29udGFpbmVyKSB7XG4gICAgICAvLyDnm7jlkIzoioLngrlcbiAgICAgIHN0YXJ0Tm9kZSA9IHN0YXJ0Q29udGFpbmVyO1xuICAgICAgZW5kTm9kZSA9IHN0YXJ0Tm9kZTtcbiAgICAgIHNlbGVjdGVkTm9kZXMucHVzaCh7XG4gICAgICAgIG5vZGU6IHN0YXJ0Tm9kZSxcbiAgICAgICAgb2Zmc2V0OiBzdGFydE9mZnNldCxcbiAgICAgICAgbGVuZ3RoOiBlbmRPZmZzZXQgLSBzdGFydE9mZnNldFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXJ0Tm9kZSA9IHN0YXJ0Q29udGFpbmVyO1xuICAgICAgZW5kTm9kZSA9IGVuZENvbnRhaW5lcjtcbiAgICAgIC8vIOW9k+i1t+Wni+iKgueCueS4jeS4uuaWh+acrOiKgueCueaXtu+8jOaXoOmcgOaPkuWFpei1t+Wni+iKgueCuVxuICAgICAgLy8g5Zyo6I635Y+W5a2Q6IqC54K55pe25Lya5bCG5o+S5YWl6LW35aeL6IqC54K555qE5a2Q6IqC54K577yM5aaC5p6c6L+Z6YeM5LiN5YGa5Yik5pat77yM5Lya5Ye6546w6LW35aeL6IqC54K55YaF5a656YeN5aSN55qE6Zeu6aKY44CCXG4gICAgICBpZihzdGFydE5vZGUubm9kZVR5cGUgPT09IDMpIHtcbiAgICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKHtcbiAgICAgICAgICBub2RlOiBzdGFydE5vZGUsXG4gICAgICAgICAgb2Zmc2V0OiBzdGFydE9mZnNldCxcbiAgICAgICAgICBsZW5ndGg6IHN0YXJ0Tm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSBzdGFydE9mZnNldFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG5vZGVzID0gdGhpcy5maW5kTm9kZXMoc3RhcnROb2RlLCBlbmROb2RlKTtcbiAgICAgIGZvcihjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgICAgIHNlbGVjdGVkTm9kZXMucHVzaCh7XG4gICAgICAgICAgbm9kZSxcbiAgICAgICAgICBvZmZzZXQ6IDAsXG4gICAgICAgICAgbGVuZ3RoOiBub2RlLnRleHRDb250ZW50Lmxlbmd0aFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHNlbGVjdGVkTm9kZXMucHVzaCh7XG4gICAgICAgIG5vZGU6IGVuZE5vZGUsXG4gICAgICAgIG9mZnNldDogMCxcbiAgICAgICAgbGVuZ3RoOiBlbmRPZmZzZXRcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IG5vZGVzID0gW107XG4gICAgZm9yKGNvbnN0IG9iaiBvZiBzZWxlY3RlZE5vZGVzKSB7XG4gICAgICBjb25zdCB7bm9kZSwgb2Zmc2V0LCBsZW5ndGh9ID0gb2JqO1xuICAgICAgY29uc3QgY29udGVudCA9IG5vZGUudGV4dENvbnRlbnQuc2xpY2Uob2Zmc2V0LCBvZmZzZXQgKyBsZW5ndGgpO1xuICAgICAgY29uc3Qgb2Zmc2V0XyA9IHRoaXMuZ2V0T2Zmc2V0KG5vZGUpO1xuICAgICAgbm9kZXMucHVzaCh7XG4gICAgICAgIGNvbnRlbnQsXG4gICAgICAgIG9mZnNldDogb2Zmc2V0XyArIG9mZnNldCxcbiAgICAgICAgbGVuZ3RoXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYoIW5vZGVzLmxlbmd0aCkgcmV0dXJuIG51bGw7XG5cbiAgICBsZXQgY29udGVudCA9IFwiXCIsICBvZmZzZXQgPSAwLCBsZW5ndGggPSAwO1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgY29udGVudCArPSBub2RlLmNvbnRlbnQ7XG4gICAgICBsZW5ndGggKz0gbm9kZS5sZW5ndGg7XG4gICAgICBpZihpID09PSAwKSBvZmZzZXQgPSBub2RlLm9mZnNldDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29udGVudCxcbiAgICAgIG9mZnNldCxcbiAgICAgIGxlbmd0aFxuICAgIH1cbiAgfVxuICBnZXROb2Rlc0NvbnRlbnQobm9kZSkge1xuICAgIHJldHVybiBub2RlLmNvbnRlbnQ7XG4gIH1cbiAgY3JlYXRlU291cmNlKGlkLCBub2RlKSB7XG4gICAgcmV0dXJuIG5ldyBTb3VyY2Uoe1xuICAgICAgaGw6IHRoaXMsXG4gICAgICBpZCxcbiAgICAgIG5vZGUsXG4gICAgfSk7XG4gIH1cbiAgZ2V0U291cmNlQnlJRChpZCkge1xuICAgIGZvcihjb25zdCBzIG9mIHRoaXMuc291cmNlcykge1xuICAgICAgaWYocy5pZCA9PT0gaWQpIHJldHVybiBzO1xuICAgIH1cbiAgfVxuICBhZGRDbGFzcyhpZCwgY2xhc3NOYW1lKSB7XG4gICAgbGV0IHNvdXJjZTtcbiAgICBpZih0eXBlb2YgaWQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHNvdXJjZSA9IHRoaXMuZ2V0U291cmNlQnlJRChpZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNvdXJjZSA9IGlkO1xuICAgIH1cbiAgICBzb3VyY2UuYWRkQ2xhc3MoY2xhc3NOYW1lKTtcbiAgfVxuICByZW1vdmVDbGFzcyhpZCwgY2xhc3NOYW1lKSB7XG4gICAgbGV0IHNvdXJjZTtcbiAgICBpZih0eXBlb2YgaWQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHNvdXJjZSA9IHRoaXMuZ2V0U291cmNlQnlJRChpZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNvdXJjZSA9IGlkO1xuICAgIH1cbiAgICBzb3VyY2UucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lKTtcbiAgfVxuICBnZXRPZmZzZXQodGV4dCkge1xuICAgIGNvbnN0IG5vZGVTdGFjayA9IFt0aGlzLnJvb3RdO1xuICAgIGxldCBjdXJOb2RlID0gbnVsbDtcbiAgICBsZXQgb2Zmc2V0ID0gMDtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICB3aGlsZSAoISEoY3VyTm9kZSA9IG5vZGVTdGFjay5wb3AoKSkpIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gY3VyTm9kZS5jaGlsZE5vZGVzO1xuICAgICAgLy8gbG9vcDpcbiAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBjb25zdCBub2RlID0gY2hpbGRyZW5baV07XG4gICAgICAgIGlmKHNlbGYuaXNDbG93bihub2RlKSkgY29udGludWU7XG4gICAgICAgIG5vZGVTdGFjay5wdXNoKG5vZGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAoY3VyTm9kZS5ub2RlVHlwZSA9PT0gMyAmJiBjdXJOb2RlICE9PSB0ZXh0KSB7XG4gICAgICAgIG9mZnNldCArPSBjdXJOb2RlLnRleHRDb250ZW50Lmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGN1ck5vZGUubm9kZVR5cGUgPT09IDMpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvZmZzZXQ7XG4gIH1cbiAgZmluZE5vZGVzKHN0YXJ0Tm9kZSwgZW5kTm9kZSkge1xuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSBbXTtcbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLmdldFNhbWVQYXJlbnROb2RlKHN0YXJ0Tm9kZSwgZW5kTm9kZSk7XG4gICAgaWYocGFyZW50KSB7XG4gICAgICBsZXQgc3RhcnQgPSBmYWxzZSwgZW5kID0gZmFsc2U7XG4gICAgICBjb25zdCBnZXRDaGlsZE5vZGUgPSAobm9kZSkgPT4ge1xuICAgICAgICBpZighbm9kZS5oYXNDaGlsZE5vZGVzKCkpIHJldHVybjtcbiAgICAgICAgZm9yKGNvbnN0IG4gb2Ygbm9kZS5jaGlsZE5vZGVzKSB7XG4gICAgICAgICAgaWYoZW5kIHx8IG4gPT09IGVuZE5vZGUpIHtcbiAgICAgICAgICAgIGVuZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfSBlbHNlIGlmKHN0YXJ0ICYmIG4ubm9kZVR5cGUgPT09IDMpIHtcbiAgICAgICAgICAgIHNlbGVjdGVkTm9kZXMucHVzaChuKTtcbiAgICAgICAgICB9IGVsc2UgaWYobiA9PT0gc3RhcnROb2RlKSB7XG4gICAgICAgICAgICBzdGFydCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGdldENoaWxkTm9kZShuKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGdldENoaWxkTm9kZShwYXJlbnQpO1xuICAgIH1cbiAgICByZXR1cm4gc2VsZWN0ZWROb2RlcztcbiAgfVxuICBpc0Nsb3duKG5vZGUpIHtcbiAgICAvLyDliKTmlq1ub2Rl5piv5ZCm6ZyA6KaB5o6S6ZmkXG4gICAgaWYobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgY29uc3QgY2wgPSBub2RlLmNsYXNzTGlzdDtcbiAgICAgIGZvcihjb25zdCBjIG9mIHRoaXMuY2xvd25DbGFzcykge1xuICAgICAgICBpZihjbC5jb250YWlucyhjKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBlbGVtZW50VGFnTmFtZSA9IG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYodGhpcy5jbG93blRhZ05hbWUuaW5jbHVkZXMoZWxlbWVudFRhZ05hbWUpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgZm9yKGNvbnN0IGtleSBpbiB0aGlzLmNsb3duQXR0cikge1xuICAgICAgICBpZighdGhpcy5jbG93bkF0dHIuaGFzT3duUHJvcGVydHkoa2V5KSkgY29udGludWU7XG4gICAgICAgIGlmKG5vZGUuZ2V0QXR0cmlidXRlKGtleSkgPT09IHRoaXMuY2xvd25BdHRyW2tleV0pIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXRTYW1lUGFyZW50Tm9kZShzdGFydE5vZGUsIGVuZE5vZGUpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBpZighZW5kTm9kZSB8fCBzdGFydE5vZGUgPT09IGVuZE5vZGUpIHJldHVybiBzdGFydE5vZGUucGFyZW50Tm9kZTtcbiAgICBjb25zdCBzdGFydE5vZGVzID0gW10sIGVuZE5vZGVzID0gW107XG4gICAgY29uc3QgZ2V0UGFyZW50ID0gKG5vZGUsIG5vZGVzKSA9PiB7XG4gICAgICBub2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgaWYobm9kZSAhPT0gc2VsZi5yb290ICYmIG5vZGUucGFyZW50Tm9kZSkge1xuICAgICAgICBnZXRQYXJlbnQobm9kZS5wYXJlbnROb2RlLCBub2Rlcyk7XG4gICAgICB9XG4gICAgfTtcbiAgICBnZXRQYXJlbnQoc3RhcnROb2RlLCBzdGFydE5vZGVzKTtcbiAgICBnZXRQYXJlbnQoZW5kTm9kZSwgZW5kTm9kZXMpO1xuICAgIGxldCBwYXJlbnQ7XG4gICAgZm9yKGNvbnN0IG5vZGUgb2Ygc3RhcnROb2Rlcykge1xuICAgICAgaWYoZW5kTm9kZXMuaW5jbHVkZXMobm9kZSkpIHtcbiAgICAgICAgcGFyZW50ID0gbm9kZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwYXJlbnQ7XG4gIH1cbiAgZ2V0U291cmNlQnlJZChpZCkge1xuICAgIGZvcihjb25zdCBzIG9mIHRoaXMuc291cmNlcykge1xuICAgICAgaWYocy5pZCA9PT0gaWQpIHtcbiAgICAgICAgcmV0dXJuIHM7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIG9mZnNldChub2RlKSB7XG4gICAgbGV0IHRvcCA9IDAsIGxlZnQgPSAwLCBfcG9zaXRpb247XG5cbiAgICBjb25zdCBnZXRPZmZzZXQgPSAobiwgaW5pdCkgPT4ge1xuICAgICAgaWYobi5ub2RlVHlwZSAhPT0gMSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBfcG9zaXRpb24gPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShuKVsncG9zaXRpb24nXTtcblxuICAgICAgaWYgKHR5cGVvZihpbml0KSA9PT0gJ3VuZGVmaW5lZCcgJiYgX3Bvc2l0aW9uID09PSAnc3RhdGljJykge1xuICAgICAgICBnZXRPZmZzZXQobi5wYXJlbnROb2RlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0b3AgPSBuLm9mZnNldFRvcCArIHRvcCAtIG4uc2Nyb2xsVG9wO1xuICAgICAgbGVmdCA9IG4ub2Zmc2V0TGVmdCArIGxlZnQgLSBuLnNjcm9sbExlZnQ7XG5cbiAgICAgIGlmIChfcG9zaXRpb24gPT09ICdmaXhlZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZ2V0T2Zmc2V0KG4ucGFyZW50Tm9kZSk7XG4gICAgfTtcblxuICAgIGdldE9mZnNldChub2RlLCB0cnVlKTtcblxuICAgIHJldHVybiB7XG4gICAgICB0b3AsIGxlZnRcbiAgICB9O1xuICB9XG4gIGdldFN0YXJ0Tm9kZU9mZnNldChyYW5nZSkge1xuICAgIC8vIOWcqOmAieWMuui1t+Wni+WkhOaPkuWFpXNwYW5cbiAgICAvLyDojrflj5ZzcGFu55qE5L2N572u5L+h5oGvXG4gICAgLy8g56e76Zmkc3BhblxuICAgIGxldCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgLy8gc3Bhbi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgc3Bhbi5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIjtcbiAgICBzcGFuLnN0eWxlLnZlcnRpY2FsQWxpZ24gPSBcInRvcFwiO1xuICAgIHJhbmdlLmluc2VydE5vZGUoc3Bhbik7XG4gICAgY29uc3QgcGFyZW50Tm9kZSA9IHNwYW4ucGFyZW50Tm9kZTtcbiAgICBzcGFuLnN0eWxlLndpZHRoID0gXCIzMHB4XCI7XG4gICAgY29uc3Qgb2Zmc2V0ID0gdGhpcy5vZmZzZXQoc3Bhbik7XG4gICAgcGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzcGFuKTtcbiAgICByZXR1cm4gb2Zmc2V0O1xuICB9XG4gIGxvY2soKSB7XG4gICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XG4gIH1cbiAgdW5sb2NrKCkge1xuICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcbiAgfVxuICBvbihldmVudE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgaWYoIXRoaXMuZXZlbnRzW2V2ZW50TmFtZV0pIHtcbiAgICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0gPSBbXTtcbiAgICB9XG4gICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXS5wdXNoKGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBlbWl0KGV2ZW50TmFtZSwgZGF0YSkge1xuICAgICh0aGlzLmV2ZW50c1tldmVudE5hbWVdIHx8IFtdKS5tYXAoZnVuYyA9PiB7XG4gICAgICBmdW5jKGRhdGEpO1xuICAgIH0pO1xuICB9XG59OyJdfQ==
