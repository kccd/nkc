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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvTktDSGlnaGxpZ2h0ZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQTs7Ozs7OztBQU9BLE1BQU0sQ0FBQyxNQUFQO0FBQUE7QUFBQTtBQUNFLGtCQUFZLE9BQVosRUFBcUI7QUFBQTs7QUFBQSxRQUNkLEVBRGMsR0FDTyxPQURQLENBQ2QsRUFEYztBQUFBLFFBQ1YsSUFEVSxHQUNPLE9BRFAsQ0FDVixJQURVO0FBQUEsUUFDSixFQURJLEdBQ08sT0FEUCxDQUNKLEVBREk7QUFBQSxRQUNBLEdBREEsR0FDTyxPQURQLENBQ0EsR0FEQTtBQUVuQixJQUFBLEVBQUUsR0FBRyxFQUFFLElBQUcsR0FBVjtBQUNBLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxTQUFLLEVBQUwsR0FBVSxFQUFWO0FBQ0EsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFNBQUssT0FBTCxHQUFlLEVBQUUsQ0FBQyxlQUFILENBQW1CLElBQW5CLENBQWY7QUFDQSxTQUFLLEdBQUwsR0FBVyxFQUFYO0FBQ0EsU0FBSyxFQUFMLEdBQVUsRUFBVjtBQUNBLFNBQUssR0FBTCx1QkFBd0IsRUFBeEI7QUFUbUIscUJBVU0sS0FBSyxJQVZYO0FBQUEsUUFVWixNQVZZLGNBVVosTUFWWTtBQUFBLFFBVUosTUFWSSxjQVVKLE1BVkk7QUFXbkIsUUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxLQUFLLEVBQUwsQ0FBUSxJQUF0QixFQUE0QixNQUE1QixFQUFvQyxNQUFwQyxDQUFwQjtBQUNBLElBQUEsV0FBVyxDQUFDLEdBQVosQ0FBZ0IsVUFBQSxVQUFVLEVBQUk7QUFDNUIsVUFBRyxDQUFDLFVBQVUsQ0FBQyxXQUFYLENBQXVCLE1BQTNCLEVBQW1DO0FBQ25DLFVBQU0sVUFB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VUFBTixDQUFpQixJQUFqQjtBQUNBLFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUF4QjtBQUNBLE1BQUEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFYLEdBQW1CLE1BQW5CO0FBQ0EsVUFBTSxNQUFNLEdBQUcsS0FBSyxNQUFMLENBQVksSUFBWixDQUFmO0FBQ0EsTUFBQSxVQUFVLENBQUMsV0FBWCxDQUF1QixJQUF2QjtBQUNBLGFBQU8sTUFBUDtBQUNEO0FBN1dIO0FBQUE7QUFBQSwyQkE4V1M7QUFDTCxXQUFLLFFBQUwsR0FBZ0IsSUFBaEI7QUFDRDtBQWhYSDtBQUFBO0FBQUEsNkJBaVhXO0FBQ1AsV0FBSyxRQUFMLEdBQWdCLEtBQWhCO0FBQ0Q7QUFuWEg7QUFBQTtBQUFBLHVCQW9YSyxTQXBYTCxFQW9YZ0IsUUFwWGhCLEVBb1gwQjtBQUN0QixVQUFHLENBQUMsS0FBSyxNQUFMLENBQVksU0FBWixDQUFKLEVBQTRCO0FBQzFCLGFBQUssTUFBTCxDQUFZLFNBQVosSUFBeUIsRUFBekI7QUFDRDs7QUFDRCxXQUFLLE1BQUwsQ0FBWSxTQUFaLEVBQXVCLElBQXZCLENBQTRCLFFBQTVCO0FBQ0EsYUFBTyxJQUFQO0FBQ0Q7QUExWEg7QUFBQTtBQUFBLHlCQTJYTyxTQTNYUCxFQTJYa0IsSUEzWGxCLEVBMlh3QjtBQUNwQixPQUFDLEtBQUssTUFBTCxDQUFZLFNBQVosS0FBMEIsRUFBM0IsRUFBK0IsR0FBL0IsQ0FBbUMsVUFBQSxJQUFJLEVBQUk7QUFDekMsUUFBQSxJQUFJLENBQUMsSUFBRCxDQUFKO0FBQ0QsT0FGRDtBQUdEO0FBL1hIOztBQUFBO0FBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKiBcbiAgZXZlbnRzOlxuICAgIHNlbGVjdDog5YiS6K+NXG4gICAgY3JlYXRlOiDliJvlu7rlrp7kvotcbiAgICBob3Zlcjog6byg5qCH5oKs5rWuXG4gICAgaG92ZXJPdXQ6IOm8oOagh+enu+W8gFxuKi9cbndpbmRvdy5Tb3VyY2UgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBsZXQge2hsLCBub2RlLCBpZCwgX2lkfSA9IG9wdGlvbnM7XG4gICAgaWQgPSBpZCB8fF9pZDtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICB0aGlzLmhsID0gaGw7XG4gICAgdGhpcy5ub2RlID0gbm9kZTtcbiAgICB0aGlzLmNvbnRlbnQgPSBobC5nZXROb2Rlc0NvbnRlbnQobm9kZSk7XG4gICAgdGhpcy5kb20gPSBbXTtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5faWQgPSBgbmtjLWhsLWlkLSR7aWR9YDtcbiAgICBjb25zdCB7b2Zmc2V0LCBsZW5ndGh9ID0gdGhpcy5ub2RlO1xuICAgIGNvbnN0IHRhcmdldE5vdGVzID0gc2VsZi5nZXROb2Rlcyh0aGlzLmhsLnJvb3QsIG9mZnNldCwgbGVuZ3RoKTtcbiAgICB0YXJnZXROb3Rlcy5tYXAodGFyZ2V0Tm9kZSA9PiB7XG4gICAgICBpZighdGFyZ2V0Tm9kZS50ZXh0Q29udGVudC5sZW5ndGgpIHJldHVybjtcbiAgICAgIGNvbnN0IHBhcmVudE5vZGUgPSB0YXJnZXROb2RlLnBhcmVudE5vZGU7XG4gICAgICBpZihwYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucyhcIm5rYy1obFwiKSkge1xuICAgICAgICAvLyDlrZjlnKjpq5jkuq7ltYzlpZfnmoTpl67pophcbiAgICAgICAgLy8g55CG5oOz54q25oCB5LiL77yM5omA5pyJ6YCJ5Yy65aSE5LqO5bmz57qn77yM6YeN5ZCI6YOo5YiG6KKr5YiG6ZqU77yM5LuF5re75Yqg5aSa5LiqY2xhc3NcbiAgICAgICAgbGV0IHBhcmVudHNJZCA9IHBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKFwiZGF0YS1ua2MtaGwtaWRcIik7XG4gICAgICAgIGlmKCFwYXJlbnRzSWQpIHJldHVybjtcbiAgICAgICAgcGFyZW50c0lkID0gcGFyZW50c0lkLnNwbGl0KFwiLVwiKTtcbiAgICAgICAgY29uc3Qgc291cmNlcyA9IFtdO1xuICAgICAgICBmb3IoY29uc3QgcGlkIG9mIHBhcmVudHNJZCkge1xuICAgICAgICAgIHNvdXJjZXMucHVzaChzZWxmLmhsLmdldFNvdXJjZUJ5SUQoTnVtYmVyKHBpZCkpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcihjb25zdCBub2RlIG9mIHBhcmVudE5vZGUuY2hpbGROb2Rlcykge1xuICAgICAgICAgIGlmKCFub2RlLnRleHRDb250ZW50Lmxlbmd0aCkgY29udGludWU7XG4gICAgICAgICAgY29uc3Qgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgICAgICAgIHNwYW4uY2xhc3NOYW1lID0gYG5rYy1obGA7XG4gICAgICAgICAgc3Bhbi5vbm1vdXNlb3ZlciA9IHBhcmVudE5vZGUub25tb3VzZW92ZXI7XG4gICAgICAgICAgc3Bhbi5vbm1vdXNlb3V0ID0gcGFyZW50Tm9kZS5vbm1vdXNlb3V0O1xuICAgICAgICAgIHNwYW4ub25jbGljayA9IHBhcmVudE5vZGUub25jbGljaztcbiAgICAgICAgICBzb3VyY2VzLm1hcChzID0+IHtcbiAgICAgICAgICAgIHMuZG9tLnB1c2goc3Bhbik7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyDmlrDpgInljLpcbiAgICAgICAgICBpZihub2RlID09PSB0YXJnZXROb2RlKSB7XG4gICAgICAgICAgICAvLyDlpoLmnpzmlrDpgInljLrlrozlhajopobnm5bkuIrlsYLpgInljLrvvIzliJnkv53nlZnkuIrlsYLpgInljLrnmoTkuovku7bvvIzlkKbliJnmt7vliqDmlrDpgInljLrnm7jlhbPkuovku7ZcbiAgICAgICAgICAgIGlmKHBhcmVudE5vZGUuY2hpbGROb2Rlcy5sZW5ndGggIT09IDEgfHwgdGFyZ2V0Tm90ZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgIHNwYW4ub25tb3VzZW92ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmhvdmVyLCBzZWxmKTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgc3Bhbi5vbm1vdXNlb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5obC5lbWl0KHNlbGYuaGwuZXZlbnROYW1lcy5ob3Zlck91dCwgc2VsZik7XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHNwYW4ub25jbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuaGwuZW1pdChzZWxmLmhsLmV2ZW50TmFtZXMuY2xpY2ssIHNlbGYpO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8g6KaG55uW5Yy65Z+f5re75YqgY2xhc3MgbmtjLWhsLWNvdmVyXG4gICAgICAgICAgICBzcGFuLmNsYXNzTmFtZSArPSBgIG5rYy1obC1jb3ZlcmA7XG4gICAgICAgICAgICBzcGFuLnNldEF0dHJpYnV0ZShgZGF0YS1ua2MtaGwtaWRgLCBwYXJlbnRzSWQuY29uY2F0KFtzZWxmLmlkXSkuam9pbihcIi1cIikpO1xuICAgICAgICAgICAgc2VsZi5kb20ucHVzaChzcGFuKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3Bhbi5zZXRBdHRyaWJ1dGUoYGRhdGEtbmtjLWhsLWlkYCwgcGFyZW50c0lkLmpvaW4oXCItXCIpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc3Bhbi5hcHBlbmRDaGlsZChub2RlLmNsb25lTm9kZShmYWxzZSkpO1xuICAgICAgICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHNwYW4sIG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIHNvdXJjZXMubWFwKHMgPT4ge1xuICAgICAgICAgIGNvbnN0IHBhcmVudEluZGV4ID0gcy5kb20uaW5kZXhPZihwYXJlbnROb2RlKTtcbiAgICAgICAgICBpZihwYXJlbnRJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgIHMuZG9tLnNwbGljZShwYXJlbnRJbmRleCwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8g5riF6Zmk5LiK5bGC6YCJ5Yy6ZG9t55qE55u45YWz5LqL5Lu25ZKMY2xhc3NcbiAgICAgICAgLy8gcGFyZW50Tm9kZS5jbGFzc0xpc3QucmVtb3ZlKGBua2MtaGxgLCBzb3VyY2UuX2lkLCBgbmtjLWhsLWNvdmVyYCk7XG4gICAgICAgIC8vIHBhcmVudE5vZGUuY2xhc3NOYW1lID0gXCJcIjtcbiAgICAgICAgcGFyZW50Tm9kZS5vbm1vdXNlb3V0ID0gbnVsbDtcbiAgICAgICAgcGFyZW50Tm9kZS5vbm1vdXNlb3ZlciA9IG51bGw7XG4gICAgICAgIHBhcmVudE5vZGUub25jbGljayA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyDlhajmlrDpgInljLog5peg6KaG55uW55qE5oOF5Ya1XG4gICAgICAgIGNvbnN0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcblxuICAgICAgICBzcGFuLmNsYXNzTGlzdC5hZGQoXCJua2MtaGxcIik7XG4gICAgICAgIHNwYW4uc2V0QXR0cmlidXRlKFwiZGF0YS1ua2MtaGwtaWRcIiwgc2VsZi5pZCk7XG5cbiAgICAgICAgc3Bhbi5vbm1vdXNlb3ZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYuaGwuZW1pdChzZWxmLmhsLmV2ZW50TmFtZXMuaG92ZXIsIHNlbGYpO1xuICAgICAgICB9O1xuICAgICAgICBzcGFuLm9ubW91c2VvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmhvdmVyT3V0LCBzZWxmKTtcbiAgICAgICAgfTtcbiAgICAgICAgc3Bhbi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2VsZi5obC5lbWl0KHNlbGYuaGwuZXZlbnROYW1lcy5jbGljaywgc2VsZik7XG4gICAgICAgIH07XG5cbiAgICAgICAgc2VsZi5kb20ucHVzaChzcGFuKTtcblxuICAgICAgICBzcGFuLmFwcGVuZENoaWxkKHRhcmdldE5vZGUuY2xvbmVOb2RlKGZhbHNlKSk7XG4gICAgICAgIHRhcmdldE5vZGUucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoc3BhbiwgdGFyZ2V0Tm9kZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5obC5zb3VyY2VzLnB1c2godGhpcyk7XG4gICAgdGhpcy5obC5lbWl0KHRoaXMuaGwuZXZlbnROYW1lcy5jcmVhdGUsIHRoaXMpO1xuICB9XG4gIGFkZENsYXNzKGtsYXNzKSB7XG4gICAgY29uc3Qge2RvbX0gPSB0aGlzO1xuICAgIGRvbS5tYXAoZCA9PiB7XG4gICAgICBkLmNsYXNzTGlzdC5hZGQoa2xhc3MpO1xuICAgIH0pO1xuICB9XG4gIHJlbW92ZUNsYXNzKGtsYXNzKSB7XG4gICAgY29uc3Qge2RvbX0gPSB0aGlzO1xuICAgIGRvbS5tYXAoZCA9PiB7XG4gICAgICBkLmNsYXNzTGlzdC5yZW1vdmUoa2xhc3MpO1xuICAgIH0pO1xuICB9XG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5kb20ubWFwKGQgPT4ge1xuICAgICAgZC5jbGFzc05hbWUgPSBcIlwiO1xuICAgIH0pO1xuICB9XG4gIGdldFNvdXJjZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuc291cmNlcztcbiAgfVxuICBnZXROb2RlcyhwYXJlbnQsIG9mZnNldCwgbGVuZ3RoKSB7XG4gICAgY29uc3Qgbm9kZVN0YWNrID0gW3BhcmVudF07XG4gICAgbGV0IGN1ck9mZnNldCA9IDA7XG4gICAgbGV0IG5vZGUgPSBudWxsO1xuICAgIGxldCBjdXJMZW5ndGggPSBsZW5ndGg7XG4gICAgbGV0IG5vZGVzID0gW107XG4gICAgbGV0IHN0YXJ0ZWQgPSBmYWxzZTtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICB3aGlsZSghIShub2RlID0gbm9kZVN0YWNrLnBvcCgpKSkge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSBub2RlLmNoaWxkTm9kZXM7XG4gICAgICAvLyBsb29wOlxuICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgaWYoc2VsZi5obC5pc0Nsb3duKG5vZGUpKSBjb250aW51ZTtcbiAgICAgICAgLyppZihub2RlLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgY29uc3QgY2wgPSBub2RlLmNsYXNzTGlzdDtcbiAgICAgICAgICBmb3IoY29uc3QgYyBvZiBzZWxmLmhsLmV4Y2x1ZGVkRWxlbWVudENsYXNzKSB7XG4gICAgICAgICAgICBpZihjbC5jb250YWlucyhjKSkge1xuICAgICAgICAgICAgICBjb250aW51ZSBsb29wO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBlbGVtZW50VGFnTmFtZSA9IG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGlmKHNlbGYuaGwuZXhjbHVkZWRFbGVtZW50VGFnTmFtZS5pbmNsdWRlcyhlbGVtZW50VGFnTmFtZSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSovXG4gICAgICAgIG5vZGVTdGFjay5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgICAgaWYobm9kZS5ub2RlVHlwZSA9PT0gMyAmJiBub2RlLnRleHRDb250ZW50Lmxlbmd0aCkge1xuICAgICAgICBjdXJPZmZzZXQgKz0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGg7XG4gICAgICAgIGlmKGN1ck9mZnNldCA+IG9mZnNldCkge1xuICAgICAgICAgIGlmKGN1ckxlbmd0aCA8PSAwKSBicmVhaztcbiAgICAgICAgICBsZXQgc3RhcnRPZmZzZXQ7XG4gICAgICAgICAgaWYoIXN0YXJ0ZWQpIHtcbiAgICAgICAgICAgIHN0YXJ0T2Zmc2V0ID0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSAoY3VyT2Zmc2V0IC0gb2Zmc2V0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhcnRPZmZzZXQgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICBsZXQgbmVlZExlbmd0aDtcbiAgICAgICAgICBpZihjdXJMZW5ndGggPD0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSBzdGFydE9mZnNldCkge1xuICAgICAgICAgICAgbmVlZExlbmd0aCA9IGN1ckxlbmd0aDtcbiAgICAgICAgICAgIGN1ckxlbmd0aCA9IDA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5lZWRMZW5ndGggPSBub2RlLnRleHRDb250ZW50Lmxlbmd0aCAtIHN0YXJ0T2Zmc2V0O1xuICAgICAgICAgICAgY3VyTGVuZ3RoIC09IG5lZWRMZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIG5vZGVzLnB1c2goe1xuICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgIHN0YXJ0T2Zmc2V0LFxuICAgICAgICAgICAgbmVlZExlbmd0aFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIG5vZGVzID0gbm9kZXMubWFwKG9iaiA9PiB7XG4gICAgICBsZXQge25vZGUsIHN0YXJ0T2Zmc2V0LCBuZWVkTGVuZ3RofSA9IG9iajtcbiAgICAgIGlmKHN0YXJ0T2Zmc2V0ID4gMCkge1xuICAgICAgICBub2RlID0gbm9kZS5zcGxpdFRleHQoc3RhcnRPZmZzZXQpO1xuICAgICAgfVxuICAgICAgaWYobm9kZS50ZXh0Q29udGVudC5sZW5ndGggIT09IG5lZWRMZW5ndGgpIHtcbiAgICAgICAgbm9kZS5zcGxpdFRleHQobmVlZExlbmd0aCk7ICBcbiAgICAgIH1cbiAgICAgIHJldHVybiBub2RlO1xuICAgIH0pO1xuICAgIHJldHVybiBub2RlcztcbiAgfVxufTtcblxud2luZG93Lk5LQ0hpZ2hsaWdodGVyID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgY29uc3Qge1xuICAgICAgcm9vdEVsZW1lbnRJZCwgZXhjbHVkZWRFbGVtZW50Q2xhc3MgPSBbXSxcbiAgICAgIGV4Y2x1ZGVkRWxlbWVudFRhZ05hbWUgPSBbXSxcblxuICAgICAgY2xvd25DbGFzcyA9IFtdLCBjbG93bkF0dHIgPSBbXSwgY2xvd25UYWdOYW1lID0gW11cbiAgICB9ID0gb3B0aW9ucztcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBzZWxmLnJvb3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChyb290RWxlbWVudElkKTtcbiAgICBzZWxmLmV4Y2x1ZGVkRWxlbWVudENsYXNzID0gZXhjbHVkZWRFbGVtZW50Q2xhc3M7XG4gICAgc2VsZi5leGNsdWRlZEVsZW1lbnRUYWdOYW1lID0gZXhjbHVkZWRFbGVtZW50VGFnTmFtZTtcblxuICAgIHNlbGYuY2xvd25DbGFzcyA9IGNsb3duQ2xhc3M7XG4gICAgc2VsZi5jbG93bkF0dHIgPSBjbG93bkF0dHI7XG4gICAgc2VsZi5jbG93blRhZ05hbWUgPSBjbG93blRhZ05hbWU7XG5cblxuICAgIHNlbGYucmFuZ2UgPSB7fTtcbiAgICBzZWxmLnNvdXJjZXMgPSBbXTtcbiAgICBzZWxmLmV2ZW50cyA9IHt9O1xuICAgIHNlbGYuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICBzZWxmLmV2ZW50TmFtZXMgPSB7XG4gICAgICBjcmVhdGU6IFwiY3JlYXRlXCIsXG4gICAgICBob3ZlcjogXCJob3ZlclwiLFxuICAgICAgaG92ZXJPdXQ6IFwiaG92ZXJPdXRcIixcbiAgICAgIHNlbGVjdDogXCJzZWxlY3RcIlxuICAgIH07XG5cbiAgICBsZXQgaW50ZXJ2YWw7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsICgpID0+IHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInNlbGVjdGlvbmNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICBzZWxmLnJhbmdlID0ge307XG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcblxuICAgICAgaW50ZXJ2YWwgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgc2VsZi5pbml0RXZlbnQoKTtcbiAgICAgIH0sIDUwMCk7XG4gICAgfSk7XG5cblxuICB9XG4gIGluaXRFdmVudCgpIHtcbiAgICB0cnl7XG4gICAgICAvLyDlsY/olL3liJLor43kuovku7ZcbiAgICAgIGlmKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5nZXRSYW5nZSgpO1xuICAgICAgaWYoIXJhbmdlIHx8IHJhbmdlLmNvbGxhcHNlZCkgcmV0dXJuO1xuICAgICAgaWYoXG4gICAgICAgIHJhbmdlLnN0YXJ0Q29udGFpbmVyID09PSB0aGlzLnJhbmdlLnN0YXJ0Q29udGFpbmVyICYmXG4gICAgICAgIHJhbmdlLmVuZENvbnRhaW5lciA9PT0gdGhpcy5yYW5nZS5lbmRDb250YWluZXIgJiZcbiAgICAgICAgcmFuZ2Uuc3RhcnRPZmZzZXQgPT09IHRoaXMucmFuZ2Uuc3RhcnRPZmZzZXQgJiZcbiAgICAgICAgcmFuZ2UuZW5kT2Zmc2V0ID09PSB0aGlzLnJhbmdlLmVuZE9mZnNldFxuICAgICAgKSByZXR1cm47XG4gICAgICAvLyDpmZDliLbpgInmi6nmloflrZfnmoTljLrln5/vvIzlj6rog73mmK9yb2905LiL55qE6YCJ5Yy6XG4gICAgICBpZighdGhpcy5jb250YWlucyhyYW5nZS5zdGFydENvbnRhaW5lcikgfHwgIXRoaXMuY29udGFpbnMocmFuZ2UuZW5kQ29udGFpbmVyKSkgcmV0dXJuO1xuICAgICAgdGhpcy5yYW5nZSA9IHJhbmdlO1xuICAgICAgdGhpcy5lbWl0KHRoaXMuZXZlbnROYW1lcy5zZWxlY3QsIHtcbiAgICAgICAgcmFuZ2VcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2goZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIubWVzc2FnZSB8fCBlcnIpO1xuICAgIH1cbiAgfVxuICBjb250YWlucyhub2RlKSB7XG4gICAgd2hpbGUoKG5vZGUgPSBub2RlLnBhcmVudE5vZGUpKSB7XG4gICAgICBpZihub2RlID09PSB0aGlzLnJvb3QpIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZ2V0UGFyZW50KHNlbGYsIGQpIHtcbiAgICBpZihkID09PSBzZWxmLnJvb3QpIHJldHVybjtcbiAgICBpZih0aGlzLmlzQ2xvd24oZCkpIHRocm93IG5ldyAgRXJyb3IoXCLliJLor43otornlYxcIik7XG4gICAgLyppZihkLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICBmb3IoY29uc3QgYyBvZiBzZWxmLmV4Y2x1ZGVkRWxlbWVudENsYXNzKSB7XG4gICAgICAgIGlmKGQuY2xhc3NMaXN0LmNvbnRhaW5zKGMpKSB0aHJvdyBuZXcgRXJyb3IoXCLliJLor43otornlYxcIik7XG4gICAgICB9XG4gICAgICBpZihzZWxmLmV4Y2x1ZGVkRWxlbWVudFRhZ05hbWUuaW5jbHVkZXMoZC50YWdOYW1lLnRvTG93ZXJDYXNlKCkpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIuWIkuivjei2iueVjFwiKTtcbiAgICAgIH1cbiAgICB9Ki9cbiAgICBpZihkLnBhcmVudE5vZGUpIHNlbGYuZ2V0UGFyZW50KHNlbGYsIGQucGFyZW50Tm9kZSk7XG4gIH1cbiAgZ2V0UmFuZ2UoKSB7XG4gICAgdHJ5e1xuICAgICAgY29uc3QgcmFuZ2UgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuZ2V0UmFuZ2VBdCgwKTtcbiAgICAgIGNvbnN0IHtzdGFydE9mZnNldCwgZW5kT2Zmc2V0LCBzdGFydENvbnRhaW5lciwgZW5kQ29udGFpbmVyfSA9IHJhbmdlO1xuICAgICAgdGhpcy5nZXRQYXJlbnQodGhpcywgc3RhcnRDb250YWluZXIpO1xuICAgICAgdGhpcy5nZXRQYXJlbnQodGhpcywgZW5kQ29udGFpbmVyKTtcbiAgICAgIGNvbnN0IG5vZGVzID0gdGhpcy5maW5kTm9kZXMoc3RhcnRDb250YWluZXIsIGVuZENvbnRhaW5lcik7XG4gICAgICBub2Rlcy5tYXAobm9kZSA9PiB7XG4gICAgICAgIHRoaXMuZ2V0UGFyZW50KHRoaXMsIG5vZGUpO1xuICAgICAgfSk7XG4gICAgICBpZihzdGFydE9mZnNldCA9PT0gZW5kT2Zmc2V0ICYmIHN0YXJ0Q29udGFpbmVyID09PSBlbmRDb250YWluZXIpIHJldHVybjtcbiAgICAgIHJldHVybiByYW5nZTtcbiAgICB9IGNhdGNoKGVycikge1xuICAgICAgY29uc29sZS5sb2coZXJyLm1lc3NhZ2UgfHwgZXJyKTtcbiAgICB9XG4gIH1cbiAgZGVzdHJveShzb3VyY2UpIHtcbiAgICBpZih0eXBlb2Ygc291cmNlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBzb3VyY2UgPSB0aGlzLmdldFNvdXJjZUJ5SUQoc291cmNlKTtcbiAgICB9XG4gICAgc291cmNlLmRlc3Ryb3koKTtcbiAgfVxuICByZXN0b3JlU291cmNlcyhzb3VyY2VzID0gW10pIHtcbiAgICBmb3IoY29uc3Qgc291cmNlIG9mIHNvdXJjZXMpIHtcbiAgICAgIHNvdXJjZS5obCA9IHRoaXM7XG4gICAgICBuZXcgU291cmNlKHNvdXJjZSk7XG4gICAgfVxuICB9XG4gIGdldE5vZGVzKHJhbmdlKSB7XG4gICAgY29uc3Qge3N0YXJ0Q29udGFpbmVyLCBlbmRDb250YWluZXIsIHN0YXJ0T2Zmc2V0LCBlbmRPZmZzZXR9ID0gcmFuZ2U7XG4gICAgLy8gaWYoc3RhcnRPZmZzZXQgPT09IGVuZE9mZnNldCkgcmV0dXJuO1xuICAgIGxldCBzZWxlY3RlZE5vZGVzID0gW10sIHN0YXJ0Tm9kZSwgZW5kTm9kZTtcbiAgICAvLyBpZihzdGFydENvbnRhaW5lci5ub2RlVHlwZSAhPT0gMyB8fCBzdGFydENvbnRhaW5lci5ub2RlVHlwZSAhPT0gMykgcmV0dXJuO1xuICAgIGlmKHN0YXJ0Q29udGFpbmVyID09PSBlbmRDb250YWluZXIpIHtcbiAgICAgIC8vIOebuOWQjOiKgueCuVxuICAgICAgc3RhcnROb2RlID0gc3RhcnRDb250YWluZXI7XG4gICAgICBlbmROb2RlID0gc3RhcnROb2RlO1xuICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKHtcbiAgICAgICAgbm9kZTogc3RhcnROb2RlLFxuICAgICAgICBvZmZzZXQ6IHN0YXJ0T2Zmc2V0LFxuICAgICAgICBsZW5ndGg6IGVuZE9mZnNldCAtIHN0YXJ0T2Zmc2V0XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhcnROb2RlID0gc3RhcnRDb250YWluZXI7XG4gICAgICBlbmROb2RlID0gZW5kQ29udGFpbmVyO1xuICAgICAgLy8g5b2T6LW35aeL6IqC54K55LiN5Li65paH5pys6IqC54K55pe277yM5peg6ZyA5o+S5YWl6LW35aeL6IqC54K5XG4gICAgICAvLyDlnKjojrflj5blrZDoioLngrnml7bkvJrlsIbmj5LlhaXotbflp4voioLngrnnmoTlrZDoioLngrnvvIzlpoLmnpzov5nph4zkuI3lgZrliKTmlq3vvIzkvJrlh7rnjrDotbflp4voioLngrnlhoXlrrnph43lpI3nmoTpl67popjjgIJcbiAgICAgIGlmKHN0YXJ0Tm9kZS5ub2RlVHlwZSA9PT0gMykge1xuICAgICAgICBzZWxlY3RlZE5vZGVzLnB1c2goe1xuICAgICAgICAgIG5vZGU6IHN0YXJ0Tm9kZSxcbiAgICAgICAgICBvZmZzZXQ6IHN0YXJ0T2Zmc2V0LFxuICAgICAgICAgIGxlbmd0aDogc3RhcnROb2RlLnRleHRDb250ZW50Lmxlbmd0aCAtIHN0YXJ0T2Zmc2V0XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgY29uc3Qgbm9kZXMgPSB0aGlzLmZpbmROb2RlcyhzdGFydE5vZGUsIGVuZE5vZGUpO1xuICAgICAgZm9yKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKHtcbiAgICAgICAgICBub2RlLFxuICAgICAgICAgIG9mZnNldDogMCxcbiAgICAgICAgICBsZW5ndGg6IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKHtcbiAgICAgICAgbm9kZTogZW5kTm9kZSxcbiAgICAgICAgb2Zmc2V0OiAwLFxuICAgICAgICBsZW5ndGg6IGVuZE9mZnNldFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZXMgPSBbXTtcbiAgICBmb3IoY29uc3Qgb2JqIG9mIHNlbGVjdGVkTm9kZXMpIHtcbiAgICAgIGNvbnN0IHtub2RlLCBvZmZzZXQsIGxlbmd0aH0gPSBvYmo7XG4gICAgICBjb25zdCBjb250ZW50ID0gbm9kZS50ZXh0Q29udGVudC5zbGljZShvZmZzZXQsIG9mZnNldCArIGxlbmd0aCk7XG4gICAgICBjb25zdCBvZmZzZXRfID0gdGhpcy5nZXRPZmZzZXQobm9kZSk7XG4gICAgICBub2Rlcy5wdXNoKHtcbiAgICAgICAgY29udGVudCxcbiAgICAgICAgb2Zmc2V0OiBvZmZzZXRfICsgb2Zmc2V0LFxuICAgICAgICBsZW5ndGhcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZighbm9kZXMubGVuZ3RoKSByZXR1cm4gbnVsbDtcblxuICAgIGxldCBjb250ZW50ID0gXCJcIiwgIG9mZnNldCA9IDAsIGxlbmd0aCA9IDA7XG4gICAgZm9yKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XG4gICAgICBjb250ZW50ICs9IG5vZGUuY29udGVudDtcbiAgICAgIGxlbmd0aCArPSBub2RlLmxlbmd0aDtcbiAgICAgIGlmKGkgPT09IDApIG9mZnNldCA9IG5vZGUub2Zmc2V0O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBjb250ZW50LFxuICAgICAgb2Zmc2V0LFxuICAgICAgbGVuZ3RoXG4gICAgfVxuICB9XG4gIGdldE5vZGVzQ29udGVudChub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUuY29udGVudDtcbiAgfVxuICBjcmVhdGVTb3VyY2UoaWQsIG5vZGUpIHtcbiAgICByZXR1cm4gbmV3IFNvdXJjZSh7XG4gICAgICBobDogdGhpcyxcbiAgICAgIGlkLFxuICAgICAgbm9kZSxcbiAgICB9KTtcbiAgfVxuICBnZXRTb3VyY2VCeUlEKGlkKSB7XG4gICAgZm9yKGNvbnN0IHMgb2YgdGhpcy5zb3VyY2VzKSB7XG4gICAgICBpZihzLmlkID09PSBpZCkgcmV0dXJuIHM7XG4gICAgfVxuICB9XG4gIGFkZENsYXNzKGlkLCBjbGFzc05hbWUpIHtcbiAgICBsZXQgc291cmNlO1xuICAgIGlmKHR5cGVvZiBpZCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgc291cmNlID0gdGhpcy5nZXRTb3VyY2VCeUlEKGlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc291cmNlID0gaWQ7XG4gICAgfVxuICAgIHNvdXJjZS5hZGRDbGFzcyhjbGFzc05hbWUpO1xuICB9XG4gIHJlbW92ZUNsYXNzKGlkLCBjbGFzc05hbWUpIHtcbiAgICBsZXQgc291cmNlO1xuICAgIGlmKHR5cGVvZiBpZCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgc291cmNlID0gdGhpcy5nZXRTb3VyY2VCeUlEKGlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc291cmNlID0gaWQ7XG4gICAgfVxuICAgIHNvdXJjZS5yZW1vdmVDbGFzcyhjbGFzc05hbWUpO1xuICB9XG4gIGdldE9mZnNldCh0ZXh0KSB7XG4gICAgY29uc3Qgbm9kZVN0YWNrID0gW3RoaXMucm9vdF07XG4gICAgbGV0IGN1ck5vZGUgPSBudWxsO1xuICAgIGxldCBvZmZzZXQgPSAwO1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHdoaWxlICghIShjdXJOb2RlID0gbm9kZVN0YWNrLnBvcCgpKSkge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSBjdXJOb2RlLmNoaWxkTm9kZXM7XG4gICAgICAvLyBsb29wOlxuICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgLyppZihub2RlLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgY29uc3QgY2wgPSBub2RlLmNsYXNzTGlzdDtcbiAgICAgICAgICBmb3IoY29uc3QgYyBvZiBzZWxmLmV4Y2x1ZGVkRWxlbWVudENsYXNzKSB7XG4gICAgICAgICAgICBpZihjbC5jb250YWlucyhjKSkge1xuICAgICAgICAgICAgICBjb250aW51ZSBsb29wO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBlbGVtZW50VGFnTmFtZSA9IG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGlmKHNlbGYuZXhjbHVkZWRFbGVtZW50VGFnTmFtZS5pbmNsdWRlcyhlbGVtZW50VGFnTmFtZSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSovXG4gICAgICAgIGlmKHNlbGYuaXNDbG93bihub2RlKSkgY29udGludWU7XG4gICAgICAgIG5vZGVTdGFjay5wdXNoKG5vZGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAoY3VyTm9kZS5ub2RlVHlwZSA9PT0gMyAmJiBjdXJOb2RlICE9PSB0ZXh0KSB7XG4gICAgICAgIG9mZnNldCArPSBjdXJOb2RlLnRleHRDb250ZW50Lmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGN1ck5vZGUubm9kZVR5cGUgPT09IDMpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvZmZzZXQ7XG4gIH1cbiAgZmluZE5vZGVzKHN0YXJ0Tm9kZSwgZW5kTm9kZSkge1xuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSBbXTtcbiAgICAvLyBjb25zdCBwYXJlbnQgPSB0aGlzLnJvb3Q7XG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5nZXRTYW1lUGFyZW50Tm9kZShzdGFydE5vZGUsIGVuZE5vZGUpO1xuICAgIGlmKHBhcmVudCkge1xuICAgICAgbGV0IHN0YXJ0ID0gZmFsc2UsIGVuZCA9IGZhbHNlO1xuICAgICAgY29uc3QgZ2V0Q2hpbGROb2RlID0gKG5vZGUpID0+IHtcbiAgICAgICAgaWYoIW5vZGUuaGFzQ2hpbGROb2RlcygpKSByZXR1cm47XG4gICAgICAgIGZvcihjb25zdCBuIG9mIG5vZGUuY2hpbGROb2Rlcykge1xuICAgICAgICAgIGlmKGVuZCB8fCBuID09PSBlbmROb2RlKSB7XG4gICAgICAgICAgICBlbmQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH0gZWxzZSBpZihzdGFydCAmJiBuLm5vZGVUeXBlID09PSAzKSB7XG4gICAgICAgICAgICBzZWxlY3RlZE5vZGVzLnB1c2gobik7XG4gICAgICAgICAgfSBlbHNlIGlmKG4gPT09IHN0YXJ0Tm9kZSkge1xuICAgICAgICAgICAgc3RhcnQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBnZXRDaGlsZE5vZGUobik7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBnZXRDaGlsZE5vZGUocGFyZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHNlbGVjdGVkTm9kZXM7XG4gIH1cbiAgaXNDbG93bihub2RlKSB7XG4gICAgLy8g5Yik5patbm9kZeaYr+WQpumcgOimgeaOkumZpFxuICAgIGlmKG5vZGUubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgIGNvbnN0IGNsID0gbm9kZS5jbGFzc0xpc3Q7XG4gICAgICBmb3IoY29uc3QgYyBvZiB0aGlzLmNsb3duQ2xhc3MpIHtcbiAgICAgICAgaWYoY2wuY29udGFpbnMoYykpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgZWxlbWVudFRhZ05hbWUgPSBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmKHRoaXMuY2xvd25UYWdOYW1lLmluY2x1ZGVzKGVsZW1lbnRUYWdOYW1lKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGZvcihjb25zdCBrZXkgaW4gdGhpcy5jbG93bkF0dHIpIHtcbiAgICAgICAgaWYoIXRoaXMuY2xvd25BdHRyLmhhc093blByb3BlcnR5KGtleSkpIGNvbnRpbnVlO1xuICAgICAgICBpZihub2RlLmdldEF0dHJpYnV0ZShrZXkpID09PSB0aGlzLmNsb3duQXR0cltrZXldKSByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZ2V0U2FtZVBhcmVudE5vZGUoc3RhcnROb2RlLCBlbmROb2RlKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgaWYoIWVuZE5vZGUgfHwgc3RhcnROb2RlID09PSBlbmROb2RlKSByZXR1cm4gc3RhcnROb2RlLnBhcmVudE5vZGU7XG4gICAgY29uc3Qgc3RhcnROb2RlcyA9IFtdLCBlbmROb2RlcyA9IFtdO1xuICAgIGNvbnN0IGdldFBhcmVudCA9IChub2RlLCBub2RlcykgPT4ge1xuICAgICAgbm9kZXMucHVzaChub2RlKTtcbiAgICAgIGlmKG5vZGUgIT09IHNlbGYucm9vdCAmJiBub2RlLnBhcmVudE5vZGUpIHtcbiAgICAgICAgZ2V0UGFyZW50KG5vZGUucGFyZW50Tm9kZSwgbm9kZXMpO1xuICAgICAgfVxuICAgIH07XG4gICAgZ2V0UGFyZW50KHN0YXJ0Tm9kZSwgc3RhcnROb2Rlcyk7XG4gICAgZ2V0UGFyZW50KGVuZE5vZGUsIGVuZE5vZGVzKTtcbiAgICBsZXQgcGFyZW50O1xuICAgIGZvcihjb25zdCBub2RlIG9mIHN0YXJ0Tm9kZXMpIHtcbiAgICAgIGlmKGVuZE5vZGVzLmluY2x1ZGVzKG5vZGUpKSB7XG4gICAgICAgIHBhcmVudCA9IG5vZGU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGFyZW50O1xuICB9XG4gIGdldFNvdXJjZUJ5SWQoaWQpIHtcbiAgICBmb3IoY29uc3QgcyBvZiB0aGlzLnNvdXJjZXMpIHtcbiAgICAgIGlmKHMuaWQgPT09IGlkKSB7XG4gICAgICAgIHJldHVybiBzO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBvZmZzZXQobm9kZSkge1xuICAgIGxldCB0b3AgPSAwLCBsZWZ0ID0gMCwgX3Bvc2l0aW9uO1xuXG4gICAgY29uc3QgZ2V0T2Zmc2V0ID0gKG4sIGluaXQpID0+IHtcbiAgICAgIGlmKG4ubm9kZVR5cGUgIT09IDEpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgX3Bvc2l0aW9uID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUobilbJ3Bvc2l0aW9uJ107XG5cbiAgICAgIGlmICh0eXBlb2YoaW5pdCkgPT09ICd1bmRlZmluZWQnICYmIF9wb3NpdGlvbiA9PT0gJ3N0YXRpYycpIHtcbiAgICAgICAgZ2V0T2Zmc2V0KG4ucGFyZW50Tm9kZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdG9wID0gbi5vZmZzZXRUb3AgKyB0b3AgLSBuLnNjcm9sbFRvcDtcbiAgICAgIGxlZnQgPSBuLm9mZnNldExlZnQgKyBsZWZ0IC0gbi5zY3JvbGxMZWZ0O1xuXG4gICAgICBpZiAoX3Bvc2l0aW9uID09PSAnZml4ZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGdldE9mZnNldChuLnBhcmVudE5vZGUpO1xuICAgIH07XG5cbiAgICBnZXRPZmZzZXQobm9kZSwgdHJ1ZSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdG9wLCBsZWZ0XG4gICAgfTtcbiAgfVxuICBnZXRTdGFydE5vZGVPZmZzZXQocmFuZ2UpIHtcbiAgICAvLyDlnKjpgInljLrotbflp4vlpITmj5LlhaVzcGFuXG4gICAgLy8g6I635Y+Wc3BhbueahOS9jee9ruS/oeaBr1xuICAgIC8vIOenu+mZpHNwYW5cbiAgICBsZXQgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgIC8vIHNwYW4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIHNwYW4uc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lLWJsb2NrXCI7XG4gICAgc3Bhbi5zdHlsZS52ZXJ0aWNhbEFsaWduID0gXCJ0b3BcIjtcbiAgICByYW5nZS5pbnNlcnROb2RlKHNwYW4pO1xuICAgIGNvbnN0IHBhcmVudE5vZGUgPSBzcGFuLnBhcmVudE5vZGU7XG4gICAgc3Bhbi5zdHlsZS53aWR0aCA9IFwiMzBweFwiO1xuICAgIGNvbnN0IG9mZnNldCA9IHRoaXMub2Zmc2V0KHNwYW4pO1xuICAgIHBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3Bhbik7XG4gICAgcmV0dXJuIG9mZnNldDtcbiAgfVxuICBsb2NrKCkge1xuICAgIHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xuICB9XG4gIHVubG9jaygpIHtcbiAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XG4gIH1cbiAgb24oZXZlbnROYW1lLCBjYWxsYmFjaykge1xuICAgIGlmKCF0aGlzLmV2ZW50c1tldmVudE5hbWVdKSB7XG4gICAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdID0gW107XG4gICAgfVxuICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0ucHVzaChjYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgZW1pdChldmVudE5hbWUsIGRhdGEpIHtcbiAgICAodGhpcy5ldmVudHNbZXZlbnROYW1lXSB8fCBbXSkubWFwKGZ1bmMgPT4ge1xuICAgICAgZnVuYyhkYXRhKTtcbiAgICB9KTtcbiAgfVxufTsiXX0=
