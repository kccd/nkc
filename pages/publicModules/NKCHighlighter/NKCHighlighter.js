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
        _id = options._id;
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
    var targetNotes = self.getNodes(this.hl.root, offset, length);
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
        span.appendChild(targetNode.cloneNode(false));
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
      /*if(d.nodeType === 1) {
        for(const c of self.excludedElementClass) {
          if(d.classList.contains(c)) throw new Error("划词越界");
        }
        if(self.excludedElementTagName.includes(d.tagName.toLowerCase())) {
          throw new Error("划词越界");
        }
      }*/

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
      var selectedNodes = []; // const parent = this.root;

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
          console.log(node.getAttribute(key), this.clownAttr[key]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvTktDSGlnaGxpZ2h0ZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQTs7Ozs7OztBQU9BLE1BQU0sQ0FBQyxNQUFQO0FBQUE7QUFBQTtBQUNFLGtCQUFZLE9BQVosRUFBcUI7QUFBQTs7QUFBQSxRQUNkLEVBRGMsR0FDTyxPQURQLENBQ2QsRUFEYztBQUFBLFFBQ1YsSUFEVSxHQUNPLE9BRFAsQ0FDVixJQURVO0FBQUEsUUFDSixFQURJLEdBQ08sT0FEUCxDQUNKLEVBREk7QUFBQSxRQUNBLEdBREEsR0FDTyxPQURQLENBQ0EsR0FEQTtBQUVuQixJQUFBLEVBQUUsR0FBRyxFQUFFLElBQUcsR0FBVjtBQUNBLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxTQUFLLEVBQUwsR0FBVSxFQUFWO0FBQ0EsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFNBQUssT0FBTCxHQUFlLEVBQUUsQ0FBQyxlQUFILENBQW1CLElBQW5CLENBQWY7QUFDQSxTQUFLLEdBQUwsR0FBVyxFQUFYO0FBQ0EsU0FBSyxFQUFMLEdBQVUsRUFBVjtBQUNBLFNBQUssR0FBTCx1QkFBd0IsRUFBeEI7QUFUbUIscUJBVU0sS0FBSyxJQVZYO0FBQUEsUUFVWixNQVZZLGNBVVosTUFWWTtBQUFBLFFBVUosTUFWSSxjQVVKLE1BVkk7QUFXbkIsUUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxLQUFLLEVBQUwsQ0FBUSxJQUF0QixFQUE0QixNQUE1QixFQUFvQyxNQUFwQyxDQUFwQjtBQUNBLElBQUEsV0FBVyxDQUFDLEdBQVosQ0FBZ0IsVUFBQSxVQUFVLEVBQUk7QUFDNUIsVUFBRyxDQUFDLFVBQVUsQ0FBQyxXQUFYLENBQXVCLE1BQTNCLEVBQW1DO0FBQ25DLFVBQU0sVUFB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S0FBTCxDQUFXLE9BQVgsR0FBcUIsY0FBckI7QUFDQSxNQUFBLElBQUksQ0FBQyxLQUFMLENBQVcsYUFBWCxHQUEyQixLQUEzQjtBQUNBLE1BQUEsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsSUFBakI7QUFDQSxVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBeEI7QUFDQSxNQUFBLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBWCxHQUFtQixNQUFuQjtBQUNBLFVBQU0sTUFBTSxHQUFHLEtBQUssTUFBTCxDQUFZLElBQVosQ0FBZjtBQUNBLE1BQUEsVUFBVSxDQUFDLFdBQVgsQ0FBdUIsSUFBdkI7QUFDQSxhQUFPLE1BQVA7QUFDRDtBQTlXSDtBQUFBO0FBQUEsMkJBK1dTO0FBQ0wsV0FBSyxRQUFMLEdBQWdCLElBQWhCO0FBQ0Q7QUFqWEg7QUFBQTtBQUFBLDZCQWtYVztBQUNQLFdBQUssUUFBTCxHQUFnQixLQUFoQjtBQUNEO0FBcFhIO0FBQUE7QUFBQSx1QkFxWEssU0FyWEwsRUFxWGdCLFFBclhoQixFQXFYMEI7QUFDdEIsVUFBRyxDQUFDLEtBQUssTUFBTCxDQUFZLFNBQVosQ0FBSixFQUE0QjtBQUMxQixhQUFLLE1BQUwsQ0FBWSxTQUFaLElBQXlCLEVBQXpCO0FBQ0Q7O0FBQ0QsV0FBSyxNQUFMLENBQVksU0FBWixFQUF1QixJQUF2QixDQUE0QixRQUE1QjtBQUNBLGFBQU8sSUFBUDtBQUNEO0FBM1hIO0FBQUE7QUFBQSx5QkE0WE8sU0E1WFAsRUE0WGtCLElBNVhsQixFQTRYd0I7QUFDcEIsT0FBQyxLQUFLLE1BQUwsQ0FBWSxTQUFaLEtBQTBCLEVBQTNCLEVBQStCLEdBQS9CLENBQW1DLFVBQUEsSUFBSSxFQUFJO0FBQ3pDLFFBQUEsSUFBSSxDQUFDLElBQUQsQ0FBSjtBQUNELE9BRkQ7QUFHRDtBQWhZSDs7QUFBQTtBQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyogXHJcbiAgZXZlbnRzOlxyXG4gICAgc2VsZWN0OiDliJLor41cclxuICAgIGNyZWF0ZTog5Yib5bu65a6e5L6LXHJcbiAgICBob3Zlcjog6byg5qCH5oKs5rWuXHJcbiAgICBob3Zlck91dDog6byg5qCH56e75byAXHJcbiovXHJcbndpbmRvdy5Tb3VyY2UgPSBjbGFzcyB7XHJcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgbGV0IHtobCwgbm9kZSwgaWQsIF9pZH0gPSBvcHRpb25zO1xyXG4gICAgaWQgPSBpZCB8fF9pZDtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgdGhpcy5obCA9IGhsO1xyXG4gICAgdGhpcy5ub2RlID0gbm9kZTtcclxuICAgIHRoaXMuY29udGVudCA9IGhsLmdldE5vZGVzQ29udGVudChub2RlKTtcclxuICAgIHRoaXMuZG9tID0gW107XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB0aGlzLl9pZCA9IGBua2MtaGwtaWQtJHtpZH1gO1xyXG4gICAgY29uc3Qge29mZnNldCwgbGVuZ3RofSA9IHRoaXMubm9kZTtcclxuICAgIGNvbnN0IHRhcmdldE5vdGVzID0gc2VsZi5nZXROb2Rlcyh0aGlzLmhsLnJvb3QsIG9mZnNldCwgbGVuZ3RoKTtcclxuICAgIHRhcmdldE5vdGVzLm1hcCh0YXJnZXROb2RlID0+IHtcclxuICAgICAgaWYoIXRhcmdldE5vZGUudGV4dENvbnRlbnQubGVuZ3RoKSByZXR1cm47XHJcbiAgICAgIGNvbnN0IHBhcmVudE5vZGUgPSB0YXJnZXROb2RlLnBhcmVudE5vZGU7XHJcbiAgICAgIGlmKHBhcmVudE5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKFwibmtjLWhsXCIpKSB7XHJcbiAgICAgICAgLy8g5a2Y5Zyo6auY5Lqu5bWM5aWX55qE6Zeu6aKYXHJcbiAgICAgICAgLy8g55CG5oOz54q25oCB5LiL77yM5omA5pyJ6YCJ5Yy65aSE5LqO5bmz57qn77yM6YeN5ZCI6YOo5YiG6KKr5YiG6ZqU77yM5LuF5re75Yqg5aSa5LiqY2xhc3NcclxuICAgICAgICBsZXQgcGFyZW50c0lkID0gcGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoXCJkYXRhLW5rYy1obC1pZFwiKTtcclxuICAgICAgICBpZighcGFyZW50c0lkKSByZXR1cm47XHJcbiAgICAgICAgcGFyZW50c0lkID0gcGFyZW50c0lkLnNwbGl0KFwiLVwiKTtcclxuICAgICAgICBjb25zdCBzb3VyY2VzID0gW107XHJcbiAgICAgICAgZm9yKGNvbnN0IHBpZCBvZiBwYXJlbnRzSWQpIHtcclxuICAgICAgICAgIHNvdXJjZXMucHVzaChzZWxmLmhsLmdldFNvdXJjZUJ5SUQoTnVtYmVyKHBpZCkpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvcihjb25zdCBub2RlIG9mIHBhcmVudE5vZGUuY2hpbGROb2Rlcykge1xyXG4gICAgICAgICAgaWYoIW5vZGUudGV4dENvbnRlbnQubGVuZ3RoKSBjb250aW51ZTtcclxuICAgICAgICAgIGNvbnN0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgICAgICAgIHNwYW4uY2xhc3NOYW1lID0gYG5rYy1obGA7XHJcbiAgICAgICAgICBzcGFuLm9ubW91c2VvdmVyID0gcGFyZW50Tm9kZS5vbm1vdXNlb3ZlcjtcclxuICAgICAgICAgIHNwYW4ub25tb3VzZW91dCA9IHBhcmVudE5vZGUub25tb3VzZW91dDtcclxuICAgICAgICAgIHNwYW4ub25jbGljayA9IHBhcmVudE5vZGUub25jbGljaztcclxuICAgICAgICAgIHNvdXJjZXMubWFwKHMgPT4ge1xyXG4gICAgICAgICAgICBzLmRvbS5wdXNoKHNwYW4pO1xyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgLy8g5paw6YCJ5Yy6XHJcbiAgICAgICAgICBpZihub2RlID09PSB0YXJnZXROb2RlKSB7XHJcbiAgICAgICAgICAgIC8vIOWmguaenOaWsOmAieWMuuWujOWFqOimhuebluS4iuWxgumAieWMuu+8jOWImeS/neeVmeS4iuWxgumAieWMuueahOS6i+S7tu+8jOWQpuWImea3u+WKoOaWsOmAieWMuuebuOWFs+S6i+S7tlxyXG4gICAgICAgICAgICBpZihwYXJlbnROb2RlLmNoaWxkTm9kZXMubGVuZ3RoICE9PSAxIHx8IHRhcmdldE5vdGVzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgIHNwYW4ub25tb3VzZW92ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaGwuZW1pdChzZWxmLmhsLmV2ZW50TmFtZXMuaG92ZXIsIHNlbGYpO1xyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgc3Bhbi5vbm1vdXNlb3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmhvdmVyT3V0LCBzZWxmKTtcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgIHNwYW4ub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5obC5lbWl0KHNlbGYuaGwuZXZlbnROYW1lcy5jbGljaywgc2VsZik7XHJcbiAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyDopobnm5bljLrln5/mt7vliqBjbGFzcyBua2MtaGwtY292ZXJcclxuICAgICAgICAgICAgc3Bhbi5jbGFzc05hbWUgKz0gYCBua2MtaGwtY292ZXJgO1xyXG4gICAgICAgICAgICBzcGFuLnNldEF0dHJpYnV0ZShgZGF0YS1ua2MtaGwtaWRgLCBwYXJlbnRzSWQuY29uY2F0KFtzZWxmLmlkXSkuam9pbihcIi1cIikpO1xyXG4gICAgICAgICAgICBzZWxmLmRvbS5wdXNoKHNwYW4pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3Bhbi5zZXRBdHRyaWJ1dGUoYGRhdGEtbmtjLWhsLWlkYCwgcGFyZW50c0lkLmpvaW4oXCItXCIpKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHNwYW4uYXBwZW5kQ2hpbGQobm9kZS5jbG9uZU5vZGUoZmFsc2UpKTtcclxuICAgICAgICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHNwYW4sIG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzb3VyY2VzLm1hcChzID0+IHtcclxuICAgICAgICAgIGNvbnN0IHBhcmVudEluZGV4ID0gcy5kb20uaW5kZXhPZihwYXJlbnROb2RlKTtcclxuICAgICAgICAgIGlmKHBhcmVudEluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgICBzLmRvbS5zcGxpY2UocGFyZW50SW5kZXgsIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIOa4hemZpOS4iuWxgumAieWMumRvbeeahOebuOWFs+S6i+S7tuWSjGNsYXNzXHJcbiAgICAgICAgLy8gcGFyZW50Tm9kZS5jbGFzc0xpc3QucmVtb3ZlKGBua2MtaGxgLCBzb3VyY2UuX2lkLCBgbmtjLWhsLWNvdmVyYCk7XHJcbiAgICAgICAgLy8gcGFyZW50Tm9kZS5jbGFzc05hbWUgPSBcIlwiO1xyXG4gICAgICAgIHBhcmVudE5vZGUub25tb3VzZW91dCA9IG51bGw7XHJcbiAgICAgICAgcGFyZW50Tm9kZS5vbm1vdXNlb3ZlciA9IG51bGw7XHJcbiAgICAgICAgcGFyZW50Tm9kZS5vbmNsaWNrID0gbnVsbDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyDlhajmlrDpgInljLog5peg6KaG55uW55qE5oOF5Ya1XHJcbiAgICAgICAgY29uc3Qgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG5cclxuICAgICAgICBzcGFuLmNsYXNzTGlzdC5hZGQoXCJua2MtaGxcIik7XHJcbiAgICAgICAgc3Bhbi5zZXRBdHRyaWJ1dGUoXCJkYXRhLW5rYy1obC1pZFwiLCBzZWxmLmlkKTtcclxuXHJcbiAgICAgICAgc3Bhbi5vbm1vdXNlb3ZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgc2VsZi5obC5lbWl0KHNlbGYuaGwuZXZlbnROYW1lcy5ob3Zlciwgc2VsZik7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBzcGFuLm9ubW91c2VvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHNlbGYuaGwuZW1pdChzZWxmLmhsLmV2ZW50TmFtZXMuaG92ZXJPdXQsIHNlbGYpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgc3Bhbi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmNsaWNrLCBzZWxmKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZWxmLmRvbS5wdXNoKHNwYW4pO1xyXG5cclxuICAgICAgICBzcGFuLmFwcGVuZENoaWxkKHRhcmdldE5vZGUuY2xvbmVOb2RlKGZhbHNlKSk7XHJcbiAgICAgICAgdGFyZ2V0Tm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChzcGFuLCB0YXJnZXROb2RlKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICB0aGlzLmhsLnNvdXJjZXMucHVzaCh0aGlzKTtcclxuICAgIHRoaXMuaGwuZW1pdCh0aGlzLmhsLmV2ZW50TmFtZXMuY3JlYXRlLCB0aGlzKTtcclxuICB9XHJcbiAgYWRkQ2xhc3Moa2xhc3MpIHtcclxuICAgIGNvbnN0IHtkb219ID0gdGhpcztcclxuICAgIGRvbS5tYXAoZCA9PiB7XHJcbiAgICAgIGQuY2xhc3NMaXN0LmFkZChrbGFzcyk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgcmVtb3ZlQ2xhc3Moa2xhc3MpIHtcclxuICAgIGNvbnN0IHtkb219ID0gdGhpcztcclxuICAgIGRvbS5tYXAoZCA9PiB7XHJcbiAgICAgIGQuY2xhc3NMaXN0LnJlbW92ZShrbGFzcyk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgZGVzdHJveSgpIHtcclxuICAgIHRoaXMuZG9tLm1hcChkID0+IHtcclxuICAgICAgZC5jbGFzc05hbWUgPSBcIlwiO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGdldFNvdXJjZXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zb3VyY2VzO1xyXG4gIH1cclxuICBnZXROb2RlcyhwYXJlbnQsIG9mZnNldCwgbGVuZ3RoKSB7XHJcbiAgICBjb25zdCBub2RlU3RhY2sgPSBbcGFyZW50XTtcclxuICAgIGxldCBjdXJPZmZzZXQgPSAwO1xyXG4gICAgbGV0IG5vZGUgPSBudWxsO1xyXG4gICAgbGV0IGN1ckxlbmd0aCA9IGxlbmd0aDtcclxuICAgIGxldCBub2RlcyA9IFtdO1xyXG4gICAgbGV0IHN0YXJ0ZWQgPSBmYWxzZTtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgd2hpbGUoISEobm9kZSA9IG5vZGVTdGFjay5wb3AoKSkpIHtcclxuICAgICAgY29uc3QgY2hpbGRyZW4gPSBub2RlLmNoaWxkTm9kZXM7XHJcbiAgICAgIC8vIGxvb3A6XHJcbiAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICBpZihzZWxmLmhsLmlzQ2xvd24obm9kZSkpIGNvbnRpbnVlO1xyXG4gICAgICAgIC8qaWYobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xyXG4gICAgICAgICAgY29uc3QgY2wgPSBub2RlLmNsYXNzTGlzdDtcclxuICAgICAgICAgIGZvcihjb25zdCBjIG9mIHNlbGYuaGwuZXhjbHVkZWRFbGVtZW50Q2xhc3MpIHtcclxuICAgICAgICAgICAgaWYoY2wuY29udGFpbnMoYykpIHtcclxuICAgICAgICAgICAgICBjb250aW51ZSBsb29wO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCBlbGVtZW50VGFnTmFtZSA9IG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgaWYoc2VsZi5obC5leGNsdWRlZEVsZW1lbnRUYWdOYW1lLmluY2x1ZGVzKGVsZW1lbnRUYWdOYW1lKSkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9Ki9cclxuICAgICAgICBub2RlU3RhY2sucHVzaChub2RlKTtcclxuICAgICAgfVxyXG4gICAgICBpZihub2RlLm5vZGVUeXBlID09PSAzICYmIG5vZGUudGV4dENvbnRlbnQubGVuZ3RoKSB7XHJcbiAgICAgICAgY3VyT2Zmc2V0ICs9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoO1xyXG4gICAgICAgIGlmKGN1ck9mZnNldCA+IG9mZnNldCkge1xyXG4gICAgICAgICAgaWYoY3VyTGVuZ3RoIDw9IDApIGJyZWFrO1xyXG4gICAgICAgICAgbGV0IHN0YXJ0T2Zmc2V0O1xyXG4gICAgICAgICAgaWYoIXN0YXJ0ZWQpIHtcclxuICAgICAgICAgICAgc3RhcnRPZmZzZXQgPSBub2RlLnRleHRDb250ZW50Lmxlbmd0aCAtIChjdXJPZmZzZXQgLSBvZmZzZXQpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3RhcnRPZmZzZXQgPSAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc3RhcnRlZCA9IHRydWU7XHJcbiAgICAgICAgICBsZXQgbmVlZExlbmd0aDtcclxuICAgICAgICAgIGlmKGN1ckxlbmd0aCA8PSBub2RlLnRleHRDb250ZW50Lmxlbmd0aCAtIHN0YXJ0T2Zmc2V0KSB7XHJcbiAgICAgICAgICAgIG5lZWRMZW5ndGggPSBjdXJMZW5ndGg7XHJcbiAgICAgICAgICAgIGN1ckxlbmd0aCA9IDA7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBuZWVkTGVuZ3RoID0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSBzdGFydE9mZnNldDtcclxuICAgICAgICAgICAgY3VyTGVuZ3RoIC09IG5lZWRMZW5ndGg7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBub2Rlcy5wdXNoKHtcclxuICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgc3RhcnRPZmZzZXQsXHJcbiAgICAgICAgICAgIG5lZWRMZW5ndGhcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgbm9kZXMgPSBub2Rlcy5tYXAob2JqID0+IHtcclxuICAgICAgbGV0IHtub2RlLCBzdGFydE9mZnNldCwgbmVlZExlbmd0aH0gPSBvYmo7XHJcbiAgICAgIGlmKHN0YXJ0T2Zmc2V0ID4gMCkge1xyXG4gICAgICAgIG5vZGUgPSBub2RlLnNwbGl0VGV4dChzdGFydE9mZnNldCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYobm9kZS50ZXh0Q29udGVudC5sZW5ndGggIT09IG5lZWRMZW5ndGgpIHtcclxuICAgICAgICBub2RlLnNwbGl0VGV4dChuZWVkTGVuZ3RoKTsgIFxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBub2RlO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbm9kZXM7XHJcbiAgfVxyXG59O1xyXG5cclxud2luZG93Lk5LQ0hpZ2hsaWdodGVyID0gY2xhc3Mge1xyXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgIGNvbnN0IHtcclxuICAgICAgcm9vdEVsZW1lbnRJZCwgZXhjbHVkZWRFbGVtZW50Q2xhc3MgPSBbXSxcclxuICAgICAgZXhjbHVkZWRFbGVtZW50VGFnTmFtZSA9IFtdLFxyXG5cclxuICAgICAgY2xvd25DbGFzcyA9IFtdLCBjbG93bkF0dHIgPSBbXSwgY2xvd25UYWdOYW1lID0gW11cclxuICAgIH0gPSBvcHRpb25zO1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLnJvb3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChyb290RWxlbWVudElkKTtcclxuICAgIHNlbGYuZXhjbHVkZWRFbGVtZW50Q2xhc3MgPSBleGNsdWRlZEVsZW1lbnRDbGFzcztcclxuICAgIHNlbGYuZXhjbHVkZWRFbGVtZW50VGFnTmFtZSA9IGV4Y2x1ZGVkRWxlbWVudFRhZ05hbWU7XHJcblxyXG4gICAgc2VsZi5jbG93bkNsYXNzID0gY2xvd25DbGFzcztcclxuICAgIHNlbGYuY2xvd25BdHRyID0gY2xvd25BdHRyO1xyXG4gICAgc2VsZi5jbG93blRhZ05hbWUgPSBjbG93blRhZ05hbWU7XHJcblxyXG5cclxuICAgIHNlbGYucmFuZ2UgPSB7fTtcclxuICAgIHNlbGYuc291cmNlcyA9IFtdO1xyXG4gICAgc2VsZi5ldmVudHMgPSB7fTtcclxuICAgIHNlbGYuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIHNlbGYuZXZlbnROYW1lcyA9IHtcclxuICAgICAgY3JlYXRlOiBcImNyZWF0ZVwiLFxyXG4gICAgICBob3ZlcjogXCJob3ZlclwiLFxyXG4gICAgICBob3Zlck91dDogXCJob3Zlck91dFwiLFxyXG4gICAgICBzZWxlY3Q6IFwic2VsZWN0XCJcclxuICAgIH07XHJcblxyXG4gICAgbGV0IGludGVydmFsO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKCkgPT4ge1xyXG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJzZWxlY3Rpb25jaGFuZ2VcIiwgKCkgPT4ge1xyXG4gICAgICBzZWxmLnJhbmdlID0ge307XHJcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xyXG5cclxuICAgICAgaW50ZXJ2YWwgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBzZWxmLmluaXRFdmVudCgpO1xyXG4gICAgICB9LCA1MDApO1xyXG4gICAgfSk7XHJcblxyXG5cclxuICB9XHJcbiAgaW5pdEV2ZW50KCkge1xyXG4gICAgdHJ5e1xyXG4gICAgICAvLyDlsY/olL3liJLor43kuovku7ZcclxuICAgICAgaWYodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xyXG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0UmFuZ2UoKTtcclxuICAgICAgaWYoIXJhbmdlIHx8IHJhbmdlLmNvbGxhcHNlZCkgcmV0dXJuO1xyXG4gICAgICBpZihcclxuICAgICAgICByYW5nZS5zdGFydENvbnRhaW5lciA9PT0gdGhpcy5yYW5nZS5zdGFydENvbnRhaW5lciAmJlxyXG4gICAgICAgIHJhbmdlLmVuZENvbnRhaW5lciA9PT0gdGhpcy5yYW5nZS5lbmRDb250YWluZXIgJiZcclxuICAgICAgICByYW5nZS5zdGFydE9mZnNldCA9PT0gdGhpcy5yYW5nZS5zdGFydE9mZnNldCAmJlxyXG4gICAgICAgIHJhbmdlLmVuZE9mZnNldCA9PT0gdGhpcy5yYW5nZS5lbmRPZmZzZXRcclxuICAgICAgKSByZXR1cm47XHJcbiAgICAgIC8vIOmZkOWItumAieaLqeaWh+Wtl+eahOWMuuWfn++8jOWPquiDveaYr3Jvb3TkuIvnmoTpgInljLpcclxuICAgICAgaWYoIXRoaXMuY29udGFpbnMocmFuZ2Uuc3RhcnRDb250YWluZXIpIHx8ICF0aGlzLmNvbnRhaW5zKHJhbmdlLmVuZENvbnRhaW5lcikpIHJldHVybjtcclxuICAgICAgdGhpcy5yYW5nZSA9IHJhbmdlO1xyXG4gICAgICB0aGlzLmVtaXQodGhpcy5ldmVudE5hbWVzLnNlbGVjdCwge1xyXG4gICAgICAgIHJhbmdlXHJcbiAgICAgIH0pO1xyXG4gICAgfSBjYXRjaChlcnIpIHtcclxuICAgICAgY29uc29sZS5sb2coZXJyLm1lc3NhZ2UgfHwgZXJyKTtcclxuICAgIH1cclxuICB9XHJcbiAgY29udGFpbnMobm9kZSkge1xyXG4gICAgd2hpbGUoKG5vZGUgPSBub2RlLnBhcmVudE5vZGUpKSB7XHJcbiAgICAgIGlmKG5vZGUgPT09IHRoaXMucm9vdCkgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIGdldFBhcmVudChzZWxmLCBkKSB7XHJcbiAgICBpZihkID09PSBzZWxmLnJvb3QpIHJldHVybjtcclxuICAgIGlmKHRoaXMuaXNDbG93bihkKSkgdGhyb3cgbmV3ICBFcnJvcihcIuWIkuivjei2iueVjFwiKTtcclxuICAgIC8qaWYoZC5ub2RlVHlwZSA9PT0gMSkge1xyXG4gICAgICBmb3IoY29uc3QgYyBvZiBzZWxmLmV4Y2x1ZGVkRWxlbWVudENsYXNzKSB7XHJcbiAgICAgICAgaWYoZC5jbGFzc0xpc3QuY29udGFpbnMoYykpIHRocm93IG5ldyBFcnJvcihcIuWIkuivjei2iueVjFwiKTtcclxuICAgICAgfVxyXG4gICAgICBpZihzZWxmLmV4Y2x1ZGVkRWxlbWVudFRhZ05hbWUuaW5jbHVkZXMoZC50YWdOYW1lLnRvTG93ZXJDYXNlKCkpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwi5YiS6K+N6LaK55WMXCIpO1xyXG4gICAgICB9XHJcbiAgICB9Ki9cclxuICAgIGlmKGQucGFyZW50Tm9kZSkgc2VsZi5nZXRQYXJlbnQoc2VsZiwgZC5wYXJlbnROb2RlKTtcclxuICB9XHJcbiAgZ2V0UmFuZ2UoKSB7XHJcbiAgICB0cnl7XHJcbiAgICAgIGNvbnN0IHJhbmdlID0gd2luZG93LmdldFNlbGVjdGlvbigpLmdldFJhbmdlQXQoMCk7XHJcbiAgICAgIGNvbnN0IHtzdGFydE9mZnNldCwgZW5kT2Zmc2V0LCBzdGFydENvbnRhaW5lciwgZW5kQ29udGFpbmVyfSA9IHJhbmdlO1xyXG4gICAgICB0aGlzLmdldFBhcmVudCh0aGlzLCBzdGFydENvbnRhaW5lcik7XHJcbiAgICAgIHRoaXMuZ2V0UGFyZW50KHRoaXMsIGVuZENvbnRhaW5lcik7XHJcbiAgICAgIGNvbnN0IG5vZGVzID0gdGhpcy5maW5kTm9kZXMoc3RhcnRDb250YWluZXIsIGVuZENvbnRhaW5lcik7XHJcbiAgICAgIG5vZGVzLm1hcChub2RlID0+IHtcclxuICAgICAgICB0aGlzLmdldFBhcmVudCh0aGlzLCBub2RlKTtcclxuICAgICAgfSk7XHJcbiAgICAgIGlmKHN0YXJ0T2Zmc2V0ID09PSBlbmRPZmZzZXQgJiYgc3RhcnRDb250YWluZXIgPT09IGVuZENvbnRhaW5lcikgcmV0dXJuO1xyXG4gICAgICByZXR1cm4gcmFuZ2U7XHJcbiAgICB9IGNhdGNoKGVycikge1xyXG4gICAgICBjb25zb2xlLmxvZyhlcnIubWVzc2FnZSB8fCBlcnIpO1xyXG4gICAgfVxyXG4gIH1cclxuICBkZXN0cm95KHNvdXJjZSkge1xyXG4gICAgaWYodHlwZW9mIHNvdXJjZSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICBzb3VyY2UgPSB0aGlzLmdldFNvdXJjZUJ5SUQoc291cmNlKTtcclxuICAgIH1cclxuICAgIHNvdXJjZS5kZXN0cm95KCk7XHJcbiAgfVxyXG4gIHJlc3RvcmVTb3VyY2VzKHNvdXJjZXMgPSBbXSkge1xyXG4gICAgZm9yKGNvbnN0IHNvdXJjZSBvZiBzb3VyY2VzKSB7XHJcbiAgICAgIHNvdXJjZS5obCA9IHRoaXM7XHJcbiAgICAgIG5ldyBTb3VyY2Uoc291cmNlKTtcclxuICAgIH1cclxuICB9XHJcbiAgZ2V0Tm9kZXMocmFuZ2UpIHtcclxuICAgIGNvbnN0IHtzdGFydENvbnRhaW5lciwgZW5kQ29udGFpbmVyLCBzdGFydE9mZnNldCwgZW5kT2Zmc2V0fSA9IHJhbmdlO1xyXG4gICAgLy8gaWYoc3RhcnRPZmZzZXQgPT09IGVuZE9mZnNldCkgcmV0dXJuO1xyXG4gICAgbGV0IHNlbGVjdGVkTm9kZXMgPSBbXSwgc3RhcnROb2RlLCBlbmROb2RlO1xyXG4gICAgLy8gaWYoc3RhcnRDb250YWluZXIubm9kZVR5cGUgIT09IDMgfHwgc3RhcnRDb250YWluZXIubm9kZVR5cGUgIT09IDMpIHJldHVybjtcclxuICAgIGlmKHN0YXJ0Q29udGFpbmVyID09PSBlbmRDb250YWluZXIpIHtcclxuICAgICAgLy8g55u45ZCM6IqC54K5XHJcbiAgICAgIHN0YXJ0Tm9kZSA9IHN0YXJ0Q29udGFpbmVyO1xyXG4gICAgICBlbmROb2RlID0gc3RhcnROb2RlO1xyXG4gICAgICBzZWxlY3RlZE5vZGVzLnB1c2goe1xyXG4gICAgICAgIG5vZGU6IHN0YXJ0Tm9kZSxcclxuICAgICAgICBvZmZzZXQ6IHN0YXJ0T2Zmc2V0LFxyXG4gICAgICAgIGxlbmd0aDogZW5kT2Zmc2V0IC0gc3RhcnRPZmZzZXRcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzdGFydE5vZGUgPSBzdGFydENvbnRhaW5lcjtcclxuICAgICAgZW5kTm9kZSA9IGVuZENvbnRhaW5lcjtcclxuICAgICAgLy8g5b2T6LW35aeL6IqC54K55LiN5Li65paH5pys6IqC54K55pe277yM5peg6ZyA5o+S5YWl6LW35aeL6IqC54K5XHJcbiAgICAgIC8vIOWcqOiOt+WPluWtkOiKgueCueaXtuS8muWwhuaPkuWFpei1t+Wni+iKgueCueeahOWtkOiKgueCue+8jOWmguaenOi/memHjOS4jeWBmuWIpOaWre+8jOS8muWHuueOsOi1t+Wni+iKgueCueWGheWuuemHjeWkjeeahOmXrumimOOAglxyXG4gICAgICBpZihzdGFydE5vZGUubm9kZVR5cGUgPT09IDMpIHtcclxuICAgICAgICBzZWxlY3RlZE5vZGVzLnB1c2goe1xyXG4gICAgICAgICAgbm9kZTogc3RhcnROb2RlLFxyXG4gICAgICAgICAgb2Zmc2V0OiBzdGFydE9mZnNldCxcclxuICAgICAgICAgIGxlbmd0aDogc3RhcnROb2RlLnRleHRDb250ZW50Lmxlbmd0aCAtIHN0YXJ0T2Zmc2V0XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3Qgbm9kZXMgPSB0aGlzLmZpbmROb2RlcyhzdGFydE5vZGUsIGVuZE5vZGUpO1xyXG4gICAgICBmb3IoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xyXG4gICAgICAgIHNlbGVjdGVkTm9kZXMucHVzaCh7XHJcbiAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgb2Zmc2V0OiAwLFxyXG4gICAgICAgICAgbGVuZ3RoOiBub2RlLnRleHRDb250ZW50Lmxlbmd0aFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIHNlbGVjdGVkTm9kZXMucHVzaCh7XHJcbiAgICAgICAgbm9kZTogZW5kTm9kZSxcclxuICAgICAgICBvZmZzZXQ6IDAsXHJcbiAgICAgICAgbGVuZ3RoOiBlbmRPZmZzZXRcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgbm9kZXMgPSBbXTtcclxuICAgIGZvcihjb25zdCBvYmogb2Ygc2VsZWN0ZWROb2Rlcykge1xyXG4gICAgICBjb25zdCB7bm9kZSwgb2Zmc2V0LCBsZW5ndGh9ID0gb2JqO1xyXG4gICAgICBjb25zdCBjb250ZW50ID0gbm9kZS50ZXh0Q29udGVudC5zbGljZShvZmZzZXQsIG9mZnNldCArIGxlbmd0aCk7XHJcbiAgICAgIGNvbnN0IG9mZnNldF8gPSB0aGlzLmdldE9mZnNldChub2RlKTtcclxuICAgICAgbm9kZXMucHVzaCh7XHJcbiAgICAgICAgY29udGVudCxcclxuICAgICAgICBvZmZzZXQ6IG9mZnNldF8gKyBvZmZzZXQsXHJcbiAgICAgICAgbGVuZ3RoXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgaWYoIW5vZGVzLmxlbmd0aCkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgbGV0IGNvbnRlbnQgPSBcIlwiLCAgb2Zmc2V0ID0gMCwgbGVuZ3RoID0gMDtcclxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgIGNvbnRlbnQgKz0gbm9kZS5jb250ZW50O1xyXG4gICAgICBsZW5ndGggKz0gbm9kZS5sZW5ndGg7XHJcbiAgICAgIGlmKGkgPT09IDApIG9mZnNldCA9IG5vZGUub2Zmc2V0O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbnRlbnQsXHJcbiAgICAgIG9mZnNldCxcclxuICAgICAgbGVuZ3RoXHJcbiAgICB9XHJcbiAgfVxyXG4gIGdldE5vZGVzQ29udGVudChub2RlKSB7XHJcbiAgICByZXR1cm4gbm9kZS5jb250ZW50O1xyXG4gIH1cclxuICBjcmVhdGVTb3VyY2UoaWQsIG5vZGUpIHtcclxuICAgIHJldHVybiBuZXcgU291cmNlKHtcclxuICAgICAgaGw6IHRoaXMsXHJcbiAgICAgIGlkLFxyXG4gICAgICBub2RlLFxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGdldFNvdXJjZUJ5SUQoaWQpIHtcclxuICAgIGZvcihjb25zdCBzIG9mIHRoaXMuc291cmNlcykge1xyXG4gICAgICBpZihzLmlkID09PSBpZCkgcmV0dXJuIHM7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGFkZENsYXNzKGlkLCBjbGFzc05hbWUpIHtcclxuICAgIGxldCBzb3VyY2U7XHJcbiAgICBpZih0eXBlb2YgaWQgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgc291cmNlID0gdGhpcy5nZXRTb3VyY2VCeUlEKGlkKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNvdXJjZSA9IGlkO1xyXG4gICAgfVxyXG4gICAgc291cmNlLmFkZENsYXNzKGNsYXNzTmFtZSk7XHJcbiAgfVxyXG4gIHJlbW92ZUNsYXNzKGlkLCBjbGFzc05hbWUpIHtcclxuICAgIGxldCBzb3VyY2U7XHJcbiAgICBpZih0eXBlb2YgaWQgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgc291cmNlID0gdGhpcy5nZXRTb3VyY2VCeUlEKGlkKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNvdXJjZSA9IGlkO1xyXG4gICAgfVxyXG4gICAgc291cmNlLnJlbW92ZUNsYXNzKGNsYXNzTmFtZSk7XHJcbiAgfVxyXG4gIGdldE9mZnNldCh0ZXh0KSB7XHJcbiAgICBjb25zdCBub2RlU3RhY2sgPSBbdGhpcy5yb290XTtcclxuICAgIGxldCBjdXJOb2RlID0gbnVsbDtcclxuICAgIGxldCBvZmZzZXQgPSAwO1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICB3aGlsZSAoISEoY3VyTm9kZSA9IG5vZGVTdGFjay5wb3AoKSkpIHtcclxuICAgICAgY29uc3QgY2hpbGRyZW4gPSBjdXJOb2RlLmNoaWxkTm9kZXM7XHJcbiAgICAgIC8vIGxvb3A6XHJcbiAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAvKmlmKG5vZGUubm9kZVR5cGUgPT09IDEpIHtcclxuICAgICAgICAgIGNvbnN0IGNsID0gbm9kZS5jbGFzc0xpc3Q7XHJcbiAgICAgICAgICBmb3IoY29uc3QgYyBvZiBzZWxmLmV4Y2x1ZGVkRWxlbWVudENsYXNzKSB7XHJcbiAgICAgICAgICAgIGlmKGNsLmNvbnRhaW5zKGMpKSB7XHJcbiAgICAgICAgICAgICAgY29udGludWUgbG9vcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29uc3QgZWxlbWVudFRhZ05hbWUgPSBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgIGlmKHNlbGYuZXhjbHVkZWRFbGVtZW50VGFnTmFtZS5pbmNsdWRlcyhlbGVtZW50VGFnTmFtZSkpIHtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSovXHJcbiAgICAgICAgaWYoc2VsZi5pc0Nsb3duKG5vZGUpKSBjb250aW51ZTtcclxuICAgICAgICBub2RlU3RhY2sucHVzaChub2RlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGN1ck5vZGUubm9kZVR5cGUgPT09IDMgJiYgY3VyTm9kZSAhPT0gdGV4dCkge1xyXG4gICAgICAgIG9mZnNldCArPSBjdXJOb2RlLnRleHRDb250ZW50Lmxlbmd0aDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChjdXJOb2RlLm5vZGVUeXBlID09PSAzKSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBvZmZzZXQ7XHJcbiAgfVxyXG4gIGZpbmROb2RlcyhzdGFydE5vZGUsIGVuZE5vZGUpIHtcclxuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSBbXTtcclxuICAgIC8vIGNvbnN0IHBhcmVudCA9IHRoaXMucm9vdDtcclxuICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuZ2V0U2FtZVBhcmVudE5vZGUoc3RhcnROb2RlLCBlbmROb2RlKTtcclxuICAgIGlmKHBhcmVudCkge1xyXG4gICAgICBsZXQgc3RhcnQgPSBmYWxzZSwgZW5kID0gZmFsc2U7XHJcbiAgICAgIGNvbnN0IGdldENoaWxkTm9kZSA9IChub2RlKSA9PiB7XHJcbiAgICAgICAgaWYoIW5vZGUuaGFzQ2hpbGROb2RlcygpKSByZXR1cm47XHJcbiAgICAgICAgZm9yKGNvbnN0IG4gb2Ygbm9kZS5jaGlsZE5vZGVzKSB7XHJcbiAgICAgICAgICBpZihlbmQgfHwgbiA9PT0gZW5kTm9kZSkge1xyXG4gICAgICAgICAgICBlbmQgPSB0cnVlO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9IGVsc2UgaWYoc3RhcnQgJiYgbi5ub2RlVHlwZSA9PT0gMykge1xyXG4gICAgICAgICAgICBzZWxlY3RlZE5vZGVzLnB1c2gobik7XHJcbiAgICAgICAgICB9IGVsc2UgaWYobiA9PT0gc3RhcnROb2RlKSB7XHJcbiAgICAgICAgICAgIHN0YXJ0ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGdldENoaWxkTm9kZShuKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIGdldENoaWxkTm9kZShwYXJlbnQpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNlbGVjdGVkTm9kZXM7XHJcbiAgfVxyXG4gIGlzQ2xvd24obm9kZSkge1xyXG4gICAgLy8g5Yik5patbm9kZeaYr+WQpumcgOimgeaOkumZpFxyXG4gICAgaWYobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xyXG4gICAgICBjb25zdCBjbCA9IG5vZGUuY2xhc3NMaXN0O1xyXG4gICAgICBmb3IoY29uc3QgYyBvZiB0aGlzLmNsb3duQ2xhc3MpIHtcclxuICAgICAgICBpZihjbC5jb250YWlucyhjKSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGVsZW1lbnRUYWdOYW1lID0gbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgIGlmKHRoaXMuY2xvd25UYWdOYW1lLmluY2x1ZGVzKGVsZW1lbnRUYWdOYW1lKSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGZvcihjb25zdCBrZXkgaW4gdGhpcy5jbG93bkF0dHIpIHtcclxuICAgICAgICBpZighdGhpcy5jbG93bkF0dHIuaGFzT3duUHJvcGVydHkoa2V5KSkgY29udGludWU7XHJcbiAgICAgICAgY29uc29sZS5sb2cobm9kZS5nZXRBdHRyaWJ1dGUoa2V5KSwgdGhpcy5jbG93bkF0dHJba2V5XSk7XHJcbiAgICAgICAgaWYobm9kZS5nZXRBdHRyaWJ1dGUoa2V5KSA9PT0gdGhpcy5jbG93bkF0dHJba2V5XSkgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgZ2V0U2FtZVBhcmVudE5vZGUoc3RhcnROb2RlLCBlbmROb2RlKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIGlmKCFlbmROb2RlIHx8IHN0YXJ0Tm9kZSA9PT0gZW5kTm9kZSkgcmV0dXJuIHN0YXJ0Tm9kZS5wYXJlbnROb2RlO1xyXG4gICAgY29uc3Qgc3RhcnROb2RlcyA9IFtdLCBlbmROb2RlcyA9IFtdO1xyXG4gICAgY29uc3QgZ2V0UGFyZW50ID0gKG5vZGUsIG5vZGVzKSA9PiB7XHJcbiAgICAgIG5vZGVzLnB1c2gobm9kZSk7XHJcbiAgICAgIGlmKG5vZGUgIT09IHNlbGYucm9vdCAmJiBub2RlLnBhcmVudE5vZGUpIHtcclxuICAgICAgICBnZXRQYXJlbnQobm9kZS5wYXJlbnROb2RlLCBub2Rlcyk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBnZXRQYXJlbnQoc3RhcnROb2RlLCBzdGFydE5vZGVzKTtcclxuICAgIGdldFBhcmVudChlbmROb2RlLCBlbmROb2Rlcyk7XHJcbiAgICBsZXQgcGFyZW50O1xyXG4gICAgZm9yKGNvbnN0IG5vZGUgb2Ygc3RhcnROb2Rlcykge1xyXG4gICAgICBpZihlbmROb2Rlcy5pbmNsdWRlcyhub2RlKSkge1xyXG4gICAgICAgIHBhcmVudCA9IG5vZGU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBwYXJlbnQ7XHJcbiAgfVxyXG4gIGdldFNvdXJjZUJ5SWQoaWQpIHtcclxuICAgIGZvcihjb25zdCBzIG9mIHRoaXMuc291cmNlcykge1xyXG4gICAgICBpZihzLmlkID09PSBpZCkge1xyXG4gICAgICAgIHJldHVybiBzO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIG9mZnNldChub2RlKSB7XHJcbiAgICBsZXQgdG9wID0gMCwgbGVmdCA9IDAsIF9wb3NpdGlvbjtcclxuXHJcbiAgICBjb25zdCBnZXRPZmZzZXQgPSAobiwgaW5pdCkgPT4ge1xyXG4gICAgICBpZihuLm5vZGVUeXBlICE9PSAxKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIF9wb3NpdGlvbiA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG4pWydwb3NpdGlvbiddO1xyXG5cclxuICAgICAgaWYgKHR5cGVvZihpbml0KSA9PT0gJ3VuZGVmaW5lZCcgJiYgX3Bvc2l0aW9uID09PSAnc3RhdGljJykge1xyXG4gICAgICAgIGdldE9mZnNldChuLnBhcmVudE5vZGUpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgdG9wID0gbi5vZmZzZXRUb3AgKyB0b3AgLSBuLnNjcm9sbFRvcDtcclxuICAgICAgbGVmdCA9IG4ub2Zmc2V0TGVmdCArIGxlZnQgLSBuLnNjcm9sbExlZnQ7XHJcblxyXG4gICAgICBpZiAoX3Bvc2l0aW9uID09PSAnZml4ZWQnKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGdldE9mZnNldChuLnBhcmVudE5vZGUpO1xyXG4gICAgfTtcclxuXHJcbiAgICBnZXRPZmZzZXQobm9kZSwgdHJ1ZSk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdG9wLCBsZWZ0XHJcbiAgICB9O1xyXG4gIH1cclxuICBnZXRTdGFydE5vZGVPZmZzZXQocmFuZ2UpIHtcclxuICAgIC8vIOWcqOmAieWMuui1t+Wni+WkhOaPkuWFpXNwYW5cclxuICAgIC8vIOiOt+WPlnNwYW7nmoTkvY3nva7kv6Hmga9cclxuICAgIC8vIOenu+mZpHNwYW5cclxuICAgIGxldCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICAvLyBzcGFuLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgIHNwYW4uc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lLWJsb2NrXCI7XHJcbiAgICBzcGFuLnN0eWxlLnZlcnRpY2FsQWxpZ24gPSBcInRvcFwiO1xyXG4gICAgcmFuZ2UuaW5zZXJ0Tm9kZShzcGFuKTtcclxuICAgIGNvbnN0IHBhcmVudE5vZGUgPSBzcGFuLnBhcmVudE5vZGU7XHJcbiAgICBzcGFuLnN0eWxlLndpZHRoID0gXCIzMHB4XCI7XHJcbiAgICBjb25zdCBvZmZzZXQgPSB0aGlzLm9mZnNldChzcGFuKTtcclxuICAgIHBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3Bhbik7XHJcbiAgICByZXR1cm4gb2Zmc2V0O1xyXG4gIH1cclxuICBsb2NrKCkge1xyXG4gICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgfVxyXG4gIHVubG9jaygpIHtcclxuICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuICB9XHJcbiAgb24oZXZlbnROYW1lLCBjYWxsYmFjaykge1xyXG4gICAgaWYoIXRoaXMuZXZlbnRzW2V2ZW50TmFtZV0pIHtcclxuICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXSA9IFtdO1xyXG4gICAgfVxyXG4gICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXS5wdXNoKGNhbGxiYWNrKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuICBlbWl0KGV2ZW50TmFtZSwgZGF0YSkge1xyXG4gICAgKHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0gfHwgW10pLm1hcChmdW5jID0+IHtcclxuICAgICAgZnVuYyhkYXRhKTtcclxuICAgIH0pO1xyXG4gIH1cclxufTsiXX0=
