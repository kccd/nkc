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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvTktDSGlnaGxpZ2h0ZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQTs7Ozs7OztBQU9BLE1BQU0sQ0FBQyxNQUFQO0FBQUE7QUFBQTtBQUNFLGtCQUFZLE9BQVosRUFBcUI7QUFBQTs7QUFBQSxRQUNkLEVBRGMsR0FDTyxPQURQLENBQ2QsRUFEYztBQUFBLFFBQ1YsSUFEVSxHQUNPLE9BRFAsQ0FDVixJQURVO0FBQUEsUUFDSixFQURJLEdBQ08sT0FEUCxDQUNKLEVBREk7QUFBQSxRQUNBLEdBREEsR0FDTyxPQURQLENBQ0EsR0FEQTtBQUVuQixJQUFBLEVBQUUsR0FBRyxFQUFFLElBQUcsR0FBVjtBQUNBLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxTQUFLLEVBQUwsR0FBVSxFQUFWO0FBQ0EsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFNBQUssT0FBTCxHQUFlLEVBQUUsQ0FBQyxlQUFILENBQW1CLElBQW5CLENBQWY7QUFDQSxTQUFLLEdBQUwsR0FBVyxFQUFYO0FBQ0EsU0FBSyxFQUFMLEdBQVUsRUFBVjtBQUNBLFNBQUssR0FBTCx1QkFBd0IsRUFBeEI7QUFUbUIscUJBVU0sS0FBSyxJQVZYO0FBQUEsUUFVWixNQVZZLGNBVVosTUFWWTtBQUFBLFFBVUosTUFWSSxjQVVKLE1BVkk7QUFXbkIsUUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxLQUFLLEVBQUwsQ0FBUSxJQUF0QixFQUE0QixNQUE1QixFQUFvQyxNQUFwQyxDQUFwQjtBQUNBLElBQUEsV0FBVyxDQUFDLEdBQVosQ0FBZ0IsVUFBQSxVQUFVLEVBQUk7QUFDNUIsVUFBRyxDQUFDLFVBQVUsQ0FBQyxXQUFYLENBQXVCLE1BQTNCLEVBQW1DO0FBQ25DLFVBQU0sVUFB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VUFBTixDQUFpQixJQUFqQjtBQUNBLFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUF4QjtBQUNBLE1BQUEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFYLEdBQW1CLE1BQW5CO0FBQ0EsVUFBTSxNQUFNLEdBQUcsS0FBSyxNQUFMLENBQVksSUFBWixDQUFmO0FBQ0EsTUFBQSxVQUFVLENBQUMsV0FBWCxDQUF1QixJQUF2QjtBQUNBLGFBQU8sTUFBUDtBQUNEO0FBN1dIO0FBQUE7QUFBQSwyQkE4V1M7QUFDTCxXQUFLLFFBQUwsR0FBZ0IsSUFBaEI7QUFDRDtBQWhYSDtBQUFBO0FBQUEsNkJBaVhXO0FBQ1AsV0FBSyxRQUFMLEdBQWdCLEtBQWhCO0FBQ0Q7QUFuWEg7QUFBQTtBQUFBLHVCQW9YSyxTQXBYTCxFQW9YZ0IsUUFwWGhCLEVBb1gwQjtBQUN0QixVQUFHLENBQUMsS0FBSyxNQUFMLENBQVksU0FBWixDQUFKLEVBQTRCO0FBQzFCLGFBQUssTUFBTCxDQUFZLFNBQVosSUFBeUIsRUFBekI7QUFDRDs7QUFDRCxXQUFLLE1BQUwsQ0FBWSxTQUFaLEVBQXVCLElBQXZCLENBQTRCLFFBQTVCO0FBQ0EsYUFBTyxJQUFQO0FBQ0Q7QUExWEg7QUFBQTtBQUFBLHlCQTJYTyxTQTNYUCxFQTJYa0IsSUEzWGxCLEVBMlh3QjtBQUNwQixPQUFDLEtBQUssTUFBTCxDQUFZLFNBQVosS0FBMEIsRUFBM0IsRUFBK0IsR0FBL0IsQ0FBbUMsVUFBQSxJQUFJLEVBQUk7QUFDekMsUUFBQSxJQUFJLENBQUMsSUFBRCxDQUFKO0FBQ0QsT0FGRDtBQUdEO0FBL1hIOztBQUFBO0FBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKiBcclxuICBldmVudHM6XHJcbiAgICBzZWxlY3Q6IOWIkuivjVxyXG4gICAgY3JlYXRlOiDliJvlu7rlrp7kvotcclxuICAgIGhvdmVyOiDpvKDmoIfmgqzmta5cclxuICAgIGhvdmVyT3V0OiDpvKDmoIfnp7vlvIBcclxuKi9cclxud2luZG93LlNvdXJjZSA9IGNsYXNzIHtcclxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICBsZXQge2hsLCBub2RlLCBpZCwgX2lkfSA9IG9wdGlvbnM7XHJcbiAgICBpZCA9IGlkIHx8X2lkO1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICB0aGlzLmhsID0gaGw7XHJcbiAgICB0aGlzLm5vZGUgPSBub2RlO1xyXG4gICAgdGhpcy5jb250ZW50ID0gaGwuZ2V0Tm9kZXNDb250ZW50KG5vZGUpO1xyXG4gICAgdGhpcy5kb20gPSBbXTtcclxuICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIHRoaXMuX2lkID0gYG5rYy1obC1pZC0ke2lkfWA7XHJcbiAgICBjb25zdCB7b2Zmc2V0LCBsZW5ndGh9ID0gdGhpcy5ub2RlO1xyXG4gICAgY29uc3QgdGFyZ2V0Tm90ZXMgPSBzZWxmLmdldE5vZGVzKHRoaXMuaGwucm9vdCwgb2Zmc2V0LCBsZW5ndGgpO1xyXG4gICAgdGFyZ2V0Tm90ZXMubWFwKHRhcmdldE5vZGUgPT4ge1xyXG4gICAgICBpZighdGFyZ2V0Tm9kZS50ZXh0Q29udGVudC5sZW5ndGgpIHJldHVybjtcclxuICAgICAgY29uc3QgcGFyZW50Tm9kZSA9IHRhcmdldE5vZGUucGFyZW50Tm9kZTtcclxuICAgICAgaWYocGFyZW50Tm9kZS5jbGFzc0xpc3QuY29udGFpbnMoXCJua2MtaGxcIikpIHtcclxuICAgICAgICAvLyDlrZjlnKjpq5jkuq7ltYzlpZfnmoTpl67pophcclxuICAgICAgICAvLyDnkIbmg7PnirbmgIHkuIvvvIzmiYDmnInpgInljLrlpITkuo7lubPnuqfvvIzph43lkIjpg6jliIbooqvliIbpmpTvvIzku4Xmt7vliqDlpJrkuKpjbGFzc1xyXG4gICAgICAgIGxldCBwYXJlbnRzSWQgPSBwYXJlbnROb2RlLmdldEF0dHJpYnV0ZShcImRhdGEtbmtjLWhsLWlkXCIpO1xyXG4gICAgICAgIGlmKCFwYXJlbnRzSWQpIHJldHVybjtcclxuICAgICAgICBwYXJlbnRzSWQgPSBwYXJlbnRzSWQuc3BsaXQoXCItXCIpO1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZXMgPSBbXTtcclxuICAgICAgICBmb3IoY29uc3QgcGlkIG9mIHBhcmVudHNJZCkge1xyXG4gICAgICAgICAgc291cmNlcy5wdXNoKHNlbGYuaGwuZ2V0U291cmNlQnlJRChOdW1iZXIocGlkKSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yKGNvbnN0IG5vZGUgb2YgcGFyZW50Tm9kZS5jaGlsZE5vZGVzKSB7XHJcbiAgICAgICAgICBpZighbm9kZS50ZXh0Q29udGVudC5sZW5ndGgpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgY29uc3Qgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgICAgICAgc3Bhbi5jbGFzc05hbWUgPSBgbmtjLWhsYDtcclxuICAgICAgICAgIHNwYW4ub25tb3VzZW92ZXIgPSBwYXJlbnROb2RlLm9ubW91c2VvdmVyO1xyXG4gICAgICAgICAgc3Bhbi5vbm1vdXNlb3V0ID0gcGFyZW50Tm9kZS5vbm1vdXNlb3V0O1xyXG4gICAgICAgICAgc3Bhbi5vbmNsaWNrID0gcGFyZW50Tm9kZS5vbmNsaWNrO1xyXG4gICAgICAgICAgc291cmNlcy5tYXAocyA9PiB7XHJcbiAgICAgICAgICAgIHMuZG9tLnB1c2goc3Bhbik7XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAvLyDmlrDpgInljLpcclxuICAgICAgICAgIGlmKG5vZGUgPT09IHRhcmdldE5vZGUpIHtcclxuICAgICAgICAgICAgLy8g5aaC5p6c5paw6YCJ5Yy65a6M5YWo6KaG55uW5LiK5bGC6YCJ5Yy677yM5YiZ5L+d55WZ5LiK5bGC6YCJ5Yy655qE5LqL5Lu277yM5ZCm5YiZ5re75Yqg5paw6YCJ5Yy655u45YWz5LqL5Lu2XHJcbiAgICAgICAgICAgIGlmKHBhcmVudE5vZGUuY2hpbGROb2Rlcy5sZW5ndGggIT09IDEgfHwgdGFyZ2V0Tm90ZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgc3Bhbi5vbm1vdXNlb3ZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5obC5lbWl0KHNlbGYuaGwuZXZlbnROYW1lcy5ob3Zlciwgc2VsZik7XHJcbiAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICBzcGFuLm9ubW91c2VvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaGwuZW1pdChzZWxmLmhsLmV2ZW50TmFtZXMuaG92ZXJPdXQsIHNlbGYpO1xyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgc3Bhbi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmNsaWNrLCBzZWxmKTtcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIOimhuebluWMuuWfn+a3u+WKoGNsYXNzIG5rYy1obC1jb3ZlclxyXG4gICAgICAgICAgICBzcGFuLmNsYXNzTmFtZSArPSBgIG5rYy1obC1jb3ZlcmA7XHJcbiAgICAgICAgICAgIHNwYW4uc2V0QXR0cmlidXRlKGBkYXRhLW5rYy1obC1pZGAsIHBhcmVudHNJZC5jb25jYXQoW3NlbGYuaWRdKS5qb2luKFwiLVwiKSk7XHJcbiAgICAgICAgICAgIHNlbGYuZG9tLnB1c2goc3Bhbik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzcGFuLnNldEF0dHJpYnV0ZShgZGF0YS1ua2MtaGwtaWRgLCBwYXJlbnRzSWQuam9pbihcIi1cIikpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc3Bhbi5hcHBlbmRDaGlsZChub2RlLmNsb25lTm9kZShmYWxzZSkpO1xyXG4gICAgICAgICAgcGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoc3Bhbiwgbm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNvdXJjZXMubWFwKHMgPT4ge1xyXG4gICAgICAgICAgY29uc3QgcGFyZW50SW5kZXggPSBzLmRvbS5pbmRleE9mKHBhcmVudE5vZGUpO1xyXG4gICAgICAgICAgaWYocGFyZW50SW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHMuZG9tLnNwbGljZShwYXJlbnRJbmRleCwgMSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8g5riF6Zmk5LiK5bGC6YCJ5Yy6ZG9t55qE55u45YWz5LqL5Lu25ZKMY2xhc3NcclxuICAgICAgICAvLyBwYXJlbnROb2RlLmNsYXNzTGlzdC5yZW1vdmUoYG5rYy1obGAsIHNvdXJjZS5faWQsIGBua2MtaGwtY292ZXJgKTtcclxuICAgICAgICAvLyBwYXJlbnROb2RlLmNsYXNzTmFtZSA9IFwiXCI7XHJcbiAgICAgICAgcGFyZW50Tm9kZS5vbm1vdXNlb3V0ID0gbnVsbDtcclxuICAgICAgICBwYXJlbnROb2RlLm9ubW91c2VvdmVyID0gbnVsbDtcclxuICAgICAgICBwYXJlbnROb2RlLm9uY2xpY2sgPSBudWxsO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIOWFqOaWsOmAieWMuiDml6Dopobnm5bnmoTmg4XlhrVcclxuICAgICAgICBjb25zdCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcblxyXG4gICAgICAgIHNwYW4uY2xhc3NMaXN0LmFkZChcIm5rYy1obFwiKTtcclxuICAgICAgICBzcGFuLnNldEF0dHJpYnV0ZShcImRhdGEtbmtjLWhsLWlkXCIsIHNlbGYuaWQpO1xyXG5cclxuICAgICAgICBzcGFuLm9ubW91c2VvdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmhvdmVyLCBzZWxmKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHNwYW4ub25tb3VzZW91dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgc2VsZi5obC5lbWl0KHNlbGYuaGwuZXZlbnROYW1lcy5ob3Zlck91dCwgc2VsZik7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBzcGFuLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHNlbGYuaGwuZW1pdChzZWxmLmhsLmV2ZW50TmFtZXMuY2xpY2ssIHNlbGYpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHNlbGYuZG9tLnB1c2goc3Bhbik7XHJcblxyXG4gICAgICAgIHNwYW4uYXBwZW5kQ2hpbGQodGFyZ2V0Tm9kZS5jbG9uZU5vZGUoZmFsc2UpKTtcclxuICAgICAgICB0YXJnZXROb2RlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHNwYW4sIHRhcmdldE5vZGUpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHRoaXMuaGwuc291cmNlcy5wdXNoKHRoaXMpO1xyXG4gICAgdGhpcy5obC5lbWl0KHRoaXMuaGwuZXZlbnROYW1lcy5jcmVhdGUsIHRoaXMpO1xyXG4gIH1cclxuICBhZGRDbGFzcyhrbGFzcykge1xyXG4gICAgY29uc3Qge2RvbX0gPSB0aGlzO1xyXG4gICAgZG9tLm1hcChkID0+IHtcclxuICAgICAgZC5jbGFzc0xpc3QuYWRkKGtsYXNzKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICByZW1vdmVDbGFzcyhrbGFzcykge1xyXG4gICAgY29uc3Qge2RvbX0gPSB0aGlzO1xyXG4gICAgZG9tLm1hcChkID0+IHtcclxuICAgICAgZC5jbGFzc0xpc3QucmVtb3ZlKGtsYXNzKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBkZXN0cm95KCkge1xyXG4gICAgdGhpcy5kb20ubWFwKGQgPT4ge1xyXG4gICAgICBkLmNsYXNzTmFtZSA9IFwiXCI7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgZ2V0U291cmNlcygpIHtcclxuICAgIHJldHVybiB0aGlzLnNvdXJjZXM7XHJcbiAgfVxyXG4gIGdldE5vZGVzKHBhcmVudCwgb2Zmc2V0LCBsZW5ndGgpIHtcclxuICAgIGNvbnN0IG5vZGVTdGFjayA9IFtwYXJlbnRdO1xyXG4gICAgbGV0IGN1ck9mZnNldCA9IDA7XHJcbiAgICBsZXQgbm9kZSA9IG51bGw7XHJcbiAgICBsZXQgY3VyTGVuZ3RoID0gbGVuZ3RoO1xyXG4gICAgbGV0IG5vZGVzID0gW107XHJcbiAgICBsZXQgc3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICB3aGlsZSghIShub2RlID0gbm9kZVN0YWNrLnBvcCgpKSkge1xyXG4gICAgICBjb25zdCBjaGlsZHJlbiA9IG5vZGUuY2hpbGROb2RlcztcclxuICAgICAgLy8gbG9vcDpcclxuICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgIGlmKHNlbGYuaGwuaXNDbG93bihub2RlKSkgY29udGludWU7XHJcbiAgICAgICAgLyppZihub2RlLm5vZGVUeXBlID09PSAxKSB7XHJcbiAgICAgICAgICBjb25zdCBjbCA9IG5vZGUuY2xhc3NMaXN0O1xyXG4gICAgICAgICAgZm9yKGNvbnN0IGMgb2Ygc2VsZi5obC5leGNsdWRlZEVsZW1lbnRDbGFzcykge1xyXG4gICAgICAgICAgICBpZihjbC5jb250YWlucyhjKSkge1xyXG4gICAgICAgICAgICAgIGNvbnRpbnVlIGxvb3A7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnN0IGVsZW1lbnRUYWdOYW1lID0gbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICBpZihzZWxmLmhsLmV4Y2x1ZGVkRWxlbWVudFRhZ05hbWUuaW5jbHVkZXMoZWxlbWVudFRhZ05hbWUpKSB7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0qL1xyXG4gICAgICAgIG5vZGVTdGFjay5wdXNoKG5vZGUpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKG5vZGUubm9kZVR5cGUgPT09IDMgJiYgbm9kZS50ZXh0Q29udGVudC5sZW5ndGgpIHtcclxuICAgICAgICBjdXJPZmZzZXQgKz0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGg7XHJcbiAgICAgICAgaWYoY3VyT2Zmc2V0ID4gb2Zmc2V0KSB7XHJcbiAgICAgICAgICBpZihjdXJMZW5ndGggPD0gMCkgYnJlYWs7XHJcbiAgICAgICAgICBsZXQgc3RhcnRPZmZzZXQ7XHJcbiAgICAgICAgICBpZighc3RhcnRlZCkge1xyXG4gICAgICAgICAgICBzdGFydE9mZnNldCA9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoIC0gKGN1ck9mZnNldCAtIG9mZnNldCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdGFydE9mZnNldCA9IDA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBzdGFydGVkID0gdHJ1ZTtcclxuICAgICAgICAgIGxldCBuZWVkTGVuZ3RoO1xyXG4gICAgICAgICAgaWYoY3VyTGVuZ3RoIDw9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoIC0gc3RhcnRPZmZzZXQpIHtcclxuICAgICAgICAgICAgbmVlZExlbmd0aCA9IGN1ckxlbmd0aDtcclxuICAgICAgICAgICAgY3VyTGVuZ3RoID0gMDtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5lZWRMZW5ndGggPSBub2RlLnRleHRDb250ZW50Lmxlbmd0aCAtIHN0YXJ0T2Zmc2V0O1xyXG4gICAgICAgICAgICBjdXJMZW5ndGggLT0gbmVlZExlbmd0aDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG5vZGVzLnB1c2goe1xyXG4gICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICBzdGFydE9mZnNldCxcclxuICAgICAgICAgICAgbmVlZExlbmd0aFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBub2RlcyA9IG5vZGVzLm1hcChvYmogPT4ge1xyXG4gICAgICBsZXQge25vZGUsIHN0YXJ0T2Zmc2V0LCBuZWVkTGVuZ3RofSA9IG9iajtcclxuICAgICAgaWYoc3RhcnRPZmZzZXQgPiAwKSB7XHJcbiAgICAgICAgbm9kZSA9IG5vZGUuc3BsaXRUZXh0KHN0YXJ0T2Zmc2V0KTtcclxuICAgICAgfVxyXG4gICAgICBpZihub2RlLnRleHRDb250ZW50Lmxlbmd0aCAhPT0gbmVlZExlbmd0aCkge1xyXG4gICAgICAgIG5vZGUuc3BsaXRUZXh0KG5lZWRMZW5ndGgpOyAgXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBub2RlcztcclxuICB9XHJcbn07XHJcblxyXG53aW5kb3cuTktDSGlnaGxpZ2h0ZXIgPSBjbGFzcyB7XHJcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgY29uc3Qge1xyXG4gICAgICByb290RWxlbWVudElkLCBleGNsdWRlZEVsZW1lbnRDbGFzcyA9IFtdLFxyXG4gICAgICBleGNsdWRlZEVsZW1lbnRUYWdOYW1lID0gW10sXHJcblxyXG4gICAgICBjbG93bkNsYXNzID0gW10sIGNsb3duQXR0ciA9IFtdLCBjbG93blRhZ05hbWUgPSBbXVxyXG4gICAgfSA9IG9wdGlvbnM7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHNlbGYucm9vdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHJvb3RFbGVtZW50SWQpO1xyXG4gICAgc2VsZi5leGNsdWRlZEVsZW1lbnRDbGFzcyA9IGV4Y2x1ZGVkRWxlbWVudENsYXNzO1xyXG4gICAgc2VsZi5leGNsdWRlZEVsZW1lbnRUYWdOYW1lID0gZXhjbHVkZWRFbGVtZW50VGFnTmFtZTtcclxuXHJcbiAgICBzZWxmLmNsb3duQ2xhc3MgPSBjbG93bkNsYXNzO1xyXG4gICAgc2VsZi5jbG93bkF0dHIgPSBjbG93bkF0dHI7XHJcbiAgICBzZWxmLmNsb3duVGFnTmFtZSA9IGNsb3duVGFnTmFtZTtcclxuXHJcblxyXG4gICAgc2VsZi5yYW5nZSA9IHt9O1xyXG4gICAgc2VsZi5zb3VyY2VzID0gW107XHJcbiAgICBzZWxmLmV2ZW50cyA9IHt9O1xyXG4gICAgc2VsZi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgc2VsZi5ldmVudE5hbWVzID0ge1xyXG4gICAgICBjcmVhdGU6IFwiY3JlYXRlXCIsXHJcbiAgICAgIGhvdmVyOiBcImhvdmVyXCIsXHJcbiAgICAgIGhvdmVyT3V0OiBcImhvdmVyT3V0XCIsXHJcbiAgICAgIHNlbGVjdDogXCJzZWxlY3RcIlxyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgaW50ZXJ2YWw7XHJcblxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoKSA9PiB7XHJcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInNlbGVjdGlvbmNoYW5nZVwiLCAoKSA9PiB7XHJcbiAgICAgIHNlbGYucmFuZ2UgPSB7fTtcclxuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XHJcblxyXG4gICAgICBpbnRlcnZhbCA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHNlbGYuaW5pdEV2ZW50KCk7XHJcbiAgICAgIH0sIDUwMCk7XHJcbiAgICB9KTtcclxuXHJcblxyXG4gIH1cclxuICBpbml0RXZlbnQoKSB7XHJcbiAgICB0cnl7XHJcbiAgICAgIC8vIOWxj+iUveWIkuivjeS6i+S7tlxyXG4gICAgICBpZih0aGlzLmRpc2FibGVkKSByZXR1cm47XHJcbiAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5nZXRSYW5nZSgpO1xyXG4gICAgICBpZighcmFuZ2UgfHwgcmFuZ2UuY29sbGFwc2VkKSByZXR1cm47XHJcbiAgICAgIGlmKFxyXG4gICAgICAgIHJhbmdlLnN0YXJ0Q29udGFpbmVyID09PSB0aGlzLnJhbmdlLnN0YXJ0Q29udGFpbmVyICYmXHJcbiAgICAgICAgcmFuZ2UuZW5kQ29udGFpbmVyID09PSB0aGlzLnJhbmdlLmVuZENvbnRhaW5lciAmJlxyXG4gICAgICAgIHJhbmdlLnN0YXJ0T2Zmc2V0ID09PSB0aGlzLnJhbmdlLnN0YXJ0T2Zmc2V0ICYmXHJcbiAgICAgICAgcmFuZ2UuZW5kT2Zmc2V0ID09PSB0aGlzLnJhbmdlLmVuZE9mZnNldFxyXG4gICAgICApIHJldHVybjtcclxuICAgICAgLy8g6ZmQ5Yi26YCJ5oup5paH5a2X55qE5Yy65Z+f77yM5Y+q6IO95pivcm9vdOS4i+eahOmAieWMulxyXG4gICAgICBpZighdGhpcy5jb250YWlucyhyYW5nZS5zdGFydENvbnRhaW5lcikgfHwgIXRoaXMuY29udGFpbnMocmFuZ2UuZW5kQ29udGFpbmVyKSkgcmV0dXJuO1xyXG4gICAgICB0aGlzLnJhbmdlID0gcmFuZ2U7XHJcbiAgICAgIHRoaXMuZW1pdCh0aGlzLmV2ZW50TmFtZXMuc2VsZWN0LCB7XHJcbiAgICAgICAgcmFuZ2VcclxuICAgICAgfSk7XHJcbiAgICB9IGNhdGNoKGVycikge1xyXG4gICAgICBjb25zb2xlLmxvZyhlcnIubWVzc2FnZSB8fCBlcnIpO1xyXG4gICAgfVxyXG4gIH1cclxuICBjb250YWlucyhub2RlKSB7XHJcbiAgICB3aGlsZSgobm9kZSA9IG5vZGUucGFyZW50Tm9kZSkpIHtcclxuICAgICAgaWYobm9kZSA9PT0gdGhpcy5yb290KSByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgZ2V0UGFyZW50KHNlbGYsIGQpIHtcclxuICAgIGlmKGQgPT09IHNlbGYucm9vdCkgcmV0dXJuO1xyXG4gICAgaWYodGhpcy5pc0Nsb3duKGQpKSB0aHJvdyBuZXcgIEVycm9yKFwi5YiS6K+N6LaK55WMXCIpO1xyXG4gICAgLyppZihkLm5vZGVUeXBlID09PSAxKSB7XHJcbiAgICAgIGZvcihjb25zdCBjIG9mIHNlbGYuZXhjbHVkZWRFbGVtZW50Q2xhc3MpIHtcclxuICAgICAgICBpZihkLmNsYXNzTGlzdC5jb250YWlucyhjKSkgdGhyb3cgbmV3IEVycm9yKFwi5YiS6K+N6LaK55WMXCIpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKHNlbGYuZXhjbHVkZWRFbGVtZW50VGFnTmFtZS5pbmNsdWRlcyhkLnRhZ05hbWUudG9Mb3dlckNhc2UoKSkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCLliJLor43otornlYxcIik7XHJcbiAgICAgIH1cclxuICAgIH0qL1xyXG4gICAgaWYoZC5wYXJlbnROb2RlKSBzZWxmLmdldFBhcmVudChzZWxmLCBkLnBhcmVudE5vZGUpO1xyXG4gIH1cclxuICBnZXRSYW5nZSgpIHtcclxuICAgIHRyeXtcclxuICAgICAgY29uc3QgcmFuZ2UgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuZ2V0UmFuZ2VBdCgwKTtcclxuICAgICAgY29uc3Qge3N0YXJ0T2Zmc2V0LCBlbmRPZmZzZXQsIHN0YXJ0Q29udGFpbmVyLCBlbmRDb250YWluZXJ9ID0gcmFuZ2U7XHJcbiAgICAgIHRoaXMuZ2V0UGFyZW50KHRoaXMsIHN0YXJ0Q29udGFpbmVyKTtcclxuICAgICAgdGhpcy5nZXRQYXJlbnQodGhpcywgZW5kQ29udGFpbmVyKTtcclxuICAgICAgY29uc3Qgbm9kZXMgPSB0aGlzLmZpbmROb2RlcyhzdGFydENvbnRhaW5lciwgZW5kQ29udGFpbmVyKTtcclxuICAgICAgbm9kZXMubWFwKG5vZGUgPT4ge1xyXG4gICAgICAgIHRoaXMuZ2V0UGFyZW50KHRoaXMsIG5vZGUpO1xyXG4gICAgICB9KTtcclxuICAgICAgaWYoc3RhcnRPZmZzZXQgPT09IGVuZE9mZnNldCAmJiBzdGFydENvbnRhaW5lciA9PT0gZW5kQ29udGFpbmVyKSByZXR1cm47XHJcbiAgICAgIHJldHVybiByYW5nZTtcclxuICAgIH0gY2F0Y2goZXJyKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKGVyci5tZXNzYWdlIHx8IGVycik7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGRlc3Ryb3koc291cmNlKSB7XHJcbiAgICBpZih0eXBlb2Ygc291cmNlID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgIHNvdXJjZSA9IHRoaXMuZ2V0U291cmNlQnlJRChzb3VyY2UpO1xyXG4gICAgfVxyXG4gICAgc291cmNlLmRlc3Ryb3koKTtcclxuICB9XHJcbiAgcmVzdG9yZVNvdXJjZXMoc291cmNlcyA9IFtdKSB7XHJcbiAgICBmb3IoY29uc3Qgc291cmNlIG9mIHNvdXJjZXMpIHtcclxuICAgICAgc291cmNlLmhsID0gdGhpcztcclxuICAgICAgbmV3IFNvdXJjZShzb3VyY2UpO1xyXG4gICAgfVxyXG4gIH1cclxuICBnZXROb2RlcyhyYW5nZSkge1xyXG4gICAgY29uc3Qge3N0YXJ0Q29udGFpbmVyLCBlbmRDb250YWluZXIsIHN0YXJ0T2Zmc2V0LCBlbmRPZmZzZXR9ID0gcmFuZ2U7XHJcbiAgICAvLyBpZihzdGFydE9mZnNldCA9PT0gZW5kT2Zmc2V0KSByZXR1cm47XHJcbiAgICBsZXQgc2VsZWN0ZWROb2RlcyA9IFtdLCBzdGFydE5vZGUsIGVuZE5vZGU7XHJcbiAgICAvLyBpZihzdGFydENvbnRhaW5lci5ub2RlVHlwZSAhPT0gMyB8fCBzdGFydENvbnRhaW5lci5ub2RlVHlwZSAhPT0gMykgcmV0dXJuO1xyXG4gICAgaWYoc3RhcnRDb250YWluZXIgPT09IGVuZENvbnRhaW5lcikge1xyXG4gICAgICAvLyDnm7jlkIzoioLngrlcclxuICAgICAgc3RhcnROb2RlID0gc3RhcnRDb250YWluZXI7XHJcbiAgICAgIGVuZE5vZGUgPSBzdGFydE5vZGU7XHJcbiAgICAgIHNlbGVjdGVkTm9kZXMucHVzaCh7XHJcbiAgICAgICAgbm9kZTogc3RhcnROb2RlLFxyXG4gICAgICAgIG9mZnNldDogc3RhcnRPZmZzZXQsXHJcbiAgICAgICAgbGVuZ3RoOiBlbmRPZmZzZXQgLSBzdGFydE9mZnNldFxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHN0YXJ0Tm9kZSA9IHN0YXJ0Q29udGFpbmVyO1xyXG4gICAgICBlbmROb2RlID0gZW5kQ29udGFpbmVyO1xyXG4gICAgICAvLyDlvZPotbflp4voioLngrnkuI3kuLrmlofmnKzoioLngrnml7bvvIzml6DpnIDmj5LlhaXotbflp4voioLngrlcclxuICAgICAgLy8g5Zyo6I635Y+W5a2Q6IqC54K55pe25Lya5bCG5o+S5YWl6LW35aeL6IqC54K555qE5a2Q6IqC54K577yM5aaC5p6c6L+Z6YeM5LiN5YGa5Yik5pat77yM5Lya5Ye6546w6LW35aeL6IqC54K55YaF5a656YeN5aSN55qE6Zeu6aKY44CCXHJcbiAgICAgIGlmKHN0YXJ0Tm9kZS5ub2RlVHlwZSA9PT0gMykge1xyXG4gICAgICAgIHNlbGVjdGVkTm9kZXMucHVzaCh7XHJcbiAgICAgICAgICBub2RlOiBzdGFydE5vZGUsXHJcbiAgICAgICAgICBvZmZzZXQ6IHN0YXJ0T2Zmc2V0LFxyXG4gICAgICAgICAgbGVuZ3RoOiBzdGFydE5vZGUudGV4dENvbnRlbnQubGVuZ3RoIC0gc3RhcnRPZmZzZXRcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBub2RlcyA9IHRoaXMuZmluZE5vZGVzKHN0YXJ0Tm9kZSwgZW5kTm9kZSk7XHJcbiAgICAgIGZvcihjb25zdCBub2RlIG9mIG5vZGVzKSB7XHJcbiAgICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKHtcclxuICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICBvZmZzZXQ6IDAsXHJcbiAgICAgICAgICBsZW5ndGg6IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKHtcclxuICAgICAgICBub2RlOiBlbmROb2RlLFxyXG4gICAgICAgIG9mZnNldDogMCxcclxuICAgICAgICBsZW5ndGg6IGVuZE9mZnNldFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBub2RlcyA9IFtdO1xyXG4gICAgZm9yKGNvbnN0IG9iaiBvZiBzZWxlY3RlZE5vZGVzKSB7XHJcbiAgICAgIGNvbnN0IHtub2RlLCBvZmZzZXQsIGxlbmd0aH0gPSBvYmo7XHJcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBub2RlLnRleHRDb250ZW50LnNsaWNlKG9mZnNldCwgb2Zmc2V0ICsgbGVuZ3RoKTtcclxuICAgICAgY29uc3Qgb2Zmc2V0XyA9IHRoaXMuZ2V0T2Zmc2V0KG5vZGUpO1xyXG4gICAgICBub2Rlcy5wdXNoKHtcclxuICAgICAgICBjb250ZW50LFxyXG4gICAgICAgIG9mZnNldDogb2Zmc2V0XyArIG9mZnNldCxcclxuICAgICAgICBsZW5ndGhcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBpZighbm9kZXMubGVuZ3RoKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICBsZXQgY29udGVudCA9IFwiXCIsICBvZmZzZXQgPSAwLCBsZW5ndGggPSAwO1xyXG4gICAgZm9yKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgY29udGVudCArPSBub2RlLmNvbnRlbnQ7XHJcbiAgICAgIGxlbmd0aCArPSBub2RlLmxlbmd0aDtcclxuICAgICAgaWYoaSA9PT0gMCkgb2Zmc2V0ID0gbm9kZS5vZmZzZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29udGVudCxcclxuICAgICAgb2Zmc2V0LFxyXG4gICAgICBsZW5ndGhcclxuICAgIH1cclxuICB9XHJcbiAgZ2V0Tm9kZXNDb250ZW50KG5vZGUpIHtcclxuICAgIHJldHVybiBub2RlLmNvbnRlbnQ7XHJcbiAgfVxyXG4gIGNyZWF0ZVNvdXJjZShpZCwgbm9kZSkge1xyXG4gICAgcmV0dXJuIG5ldyBTb3VyY2Uoe1xyXG4gICAgICBobDogdGhpcyxcclxuICAgICAgaWQsXHJcbiAgICAgIG5vZGUsXHJcbiAgICB9KTtcclxuICB9XHJcbiAgZ2V0U291cmNlQnlJRChpZCkge1xyXG4gICAgZm9yKGNvbnN0IHMgb2YgdGhpcy5zb3VyY2VzKSB7XHJcbiAgICAgIGlmKHMuaWQgPT09IGlkKSByZXR1cm4gcztcclxuICAgIH1cclxuICB9XHJcbiAgYWRkQ2xhc3MoaWQsIGNsYXNzTmFtZSkge1xyXG4gICAgbGV0IHNvdXJjZTtcclxuICAgIGlmKHR5cGVvZiBpZCA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICBzb3VyY2UgPSB0aGlzLmdldFNvdXJjZUJ5SUQoaWQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc291cmNlID0gaWQ7XHJcbiAgICB9XHJcbiAgICBzb3VyY2UuYWRkQ2xhc3MoY2xhc3NOYW1lKTtcclxuICB9XHJcbiAgcmVtb3ZlQ2xhc3MoaWQsIGNsYXNzTmFtZSkge1xyXG4gICAgbGV0IHNvdXJjZTtcclxuICAgIGlmKHR5cGVvZiBpZCA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICBzb3VyY2UgPSB0aGlzLmdldFNvdXJjZUJ5SUQoaWQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc291cmNlID0gaWQ7XHJcbiAgICB9XHJcbiAgICBzb3VyY2UucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lKTtcclxuICB9XHJcbiAgZ2V0T2Zmc2V0KHRleHQpIHtcclxuICAgIGNvbnN0IG5vZGVTdGFjayA9IFt0aGlzLnJvb3RdO1xyXG4gICAgbGV0IGN1ck5vZGUgPSBudWxsO1xyXG4gICAgbGV0IG9mZnNldCA9IDA7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHdoaWxlICghIShjdXJOb2RlID0gbm9kZVN0YWNrLnBvcCgpKSkge1xyXG4gICAgICBjb25zdCBjaGlsZHJlbiA9IGN1ck5vZGUuY2hpbGROb2RlcztcclxuICAgICAgLy8gbG9vcDpcclxuICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgIC8qaWYobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xyXG4gICAgICAgICAgY29uc3QgY2wgPSBub2RlLmNsYXNzTGlzdDtcclxuICAgICAgICAgIGZvcihjb25zdCBjIG9mIHNlbGYuZXhjbHVkZWRFbGVtZW50Q2xhc3MpIHtcclxuICAgICAgICAgICAgaWYoY2wuY29udGFpbnMoYykpIHtcclxuICAgICAgICAgICAgICBjb250aW51ZSBsb29wO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCBlbGVtZW50VGFnTmFtZSA9IG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgaWYoc2VsZi5leGNsdWRlZEVsZW1lbnRUYWdOYW1lLmluY2x1ZGVzKGVsZW1lbnRUYWdOYW1lKSkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9Ki9cclxuICAgICAgICBpZihzZWxmLmlzQ2xvd24obm9kZSkpIGNvbnRpbnVlO1xyXG4gICAgICAgIG5vZGVTdGFjay5wdXNoKG5vZGUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoY3VyTm9kZS5ub2RlVHlwZSA9PT0gMyAmJiBjdXJOb2RlICE9PSB0ZXh0KSB7XHJcbiAgICAgICAgb2Zmc2V0ICs9IGN1ck5vZGUudGV4dENvbnRlbnQubGVuZ3RoO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGN1ck5vZGUubm9kZVR5cGUgPT09IDMpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9mZnNldDtcclxuICB9XHJcbiAgZmluZE5vZGVzKHN0YXJ0Tm9kZSwgZW5kTm9kZSkge1xyXG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlcyA9IFtdO1xyXG4gICAgLy8gY29uc3QgcGFyZW50ID0gdGhpcy5yb290O1xyXG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5nZXRTYW1lUGFyZW50Tm9kZShzdGFydE5vZGUsIGVuZE5vZGUpO1xyXG4gICAgaWYocGFyZW50KSB7XHJcbiAgICAgIGxldCBzdGFydCA9IGZhbHNlLCBlbmQgPSBmYWxzZTtcclxuICAgICAgY29uc3QgZ2V0Q2hpbGROb2RlID0gKG5vZGUpID0+IHtcclxuICAgICAgICBpZighbm9kZS5oYXNDaGlsZE5vZGVzKCkpIHJldHVybjtcclxuICAgICAgICBmb3IoY29uc3QgbiBvZiBub2RlLmNoaWxkTm9kZXMpIHtcclxuICAgICAgICAgIGlmKGVuZCB8fCBuID09PSBlbmROb2RlKSB7XHJcbiAgICAgICAgICAgIGVuZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH0gZWxzZSBpZihzdGFydCAmJiBuLm5vZGVUeXBlID09PSAzKSB7XHJcbiAgICAgICAgICAgIHNlbGVjdGVkTm9kZXMucHVzaChuKTtcclxuICAgICAgICAgIH0gZWxzZSBpZihuID09PSBzdGFydE5vZGUpIHtcclxuICAgICAgICAgICAgc3RhcnQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZ2V0Q2hpbGROb2RlKG4pO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgZ2V0Q2hpbGROb2RlKHBhcmVudCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc2VsZWN0ZWROb2RlcztcclxuICB9XHJcbiAgaXNDbG93bihub2RlKSB7XHJcbiAgICAvLyDliKTmlq1ub2Rl5piv5ZCm6ZyA6KaB5o6S6ZmkXHJcbiAgICBpZihub2RlLm5vZGVUeXBlID09PSAxKSB7XHJcbiAgICAgIGNvbnN0IGNsID0gbm9kZS5jbGFzc0xpc3Q7XHJcbiAgICAgIGZvcihjb25zdCBjIG9mIHRoaXMuY2xvd25DbGFzcykge1xyXG4gICAgICAgIGlmKGNsLmNvbnRhaW5zKGMpKSB7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgZWxlbWVudFRhZ05hbWUgPSBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcclxuICAgICAgaWYodGhpcy5jbG93blRhZ05hbWUuaW5jbHVkZXMoZWxlbWVudFRhZ05hbWUpKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgZm9yKGNvbnN0IGtleSBpbiB0aGlzLmNsb3duQXR0cikge1xyXG4gICAgICAgIGlmKCF0aGlzLmNsb3duQXR0ci5oYXNPd25Qcm9wZXJ0eShrZXkpKSBjb250aW51ZTtcclxuICAgICAgICBpZihub2RlLmdldEF0dHJpYnV0ZShrZXkpID09PSB0aGlzLmNsb3duQXR0cltrZXldKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBnZXRTYW1lUGFyZW50Tm9kZShzdGFydE5vZGUsIGVuZE5vZGUpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgaWYoIWVuZE5vZGUgfHwgc3RhcnROb2RlID09PSBlbmROb2RlKSByZXR1cm4gc3RhcnROb2RlLnBhcmVudE5vZGU7XHJcbiAgICBjb25zdCBzdGFydE5vZGVzID0gW10sIGVuZE5vZGVzID0gW107XHJcbiAgICBjb25zdCBnZXRQYXJlbnQgPSAobm9kZSwgbm9kZXMpID0+IHtcclxuICAgICAgbm9kZXMucHVzaChub2RlKTtcclxuICAgICAgaWYobm9kZSAhPT0gc2VsZi5yb290ICYmIG5vZGUucGFyZW50Tm9kZSkge1xyXG4gICAgICAgIGdldFBhcmVudChub2RlLnBhcmVudE5vZGUsIG5vZGVzKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGdldFBhcmVudChzdGFydE5vZGUsIHN0YXJ0Tm9kZXMpO1xyXG4gICAgZ2V0UGFyZW50KGVuZE5vZGUsIGVuZE5vZGVzKTtcclxuICAgIGxldCBwYXJlbnQ7XHJcbiAgICBmb3IoY29uc3Qgbm9kZSBvZiBzdGFydE5vZGVzKSB7XHJcbiAgICAgIGlmKGVuZE5vZGVzLmluY2x1ZGVzKG5vZGUpKSB7XHJcbiAgICAgICAgcGFyZW50ID0gbm9kZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhcmVudDtcclxuICB9XHJcbiAgZ2V0U291cmNlQnlJZChpZCkge1xyXG4gICAgZm9yKGNvbnN0IHMgb2YgdGhpcy5zb3VyY2VzKSB7XHJcbiAgICAgIGlmKHMuaWQgPT09IGlkKSB7XHJcbiAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgb2Zmc2V0KG5vZGUpIHtcclxuICAgIGxldCB0b3AgPSAwLCBsZWZ0ID0gMCwgX3Bvc2l0aW9uO1xyXG5cclxuICAgIGNvbnN0IGdldE9mZnNldCA9IChuLCBpbml0KSA9PiB7XHJcbiAgICAgIGlmKG4ubm9kZVR5cGUgIT09IDEpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgX3Bvc2l0aW9uID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUobilbJ3Bvc2l0aW9uJ107XHJcblxyXG4gICAgICBpZiAodHlwZW9mKGluaXQpID09PSAndW5kZWZpbmVkJyAmJiBfcG9zaXRpb24gPT09ICdzdGF0aWMnKSB7XHJcbiAgICAgICAgZ2V0T2Zmc2V0KG4ucGFyZW50Tm9kZSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0b3AgPSBuLm9mZnNldFRvcCArIHRvcCAtIG4uc2Nyb2xsVG9wO1xyXG4gICAgICBsZWZ0ID0gbi5vZmZzZXRMZWZ0ICsgbGVmdCAtIG4uc2Nyb2xsTGVmdDtcclxuXHJcbiAgICAgIGlmIChfcG9zaXRpb24gPT09ICdmaXhlZCcpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgZ2V0T2Zmc2V0KG4ucGFyZW50Tm9kZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGdldE9mZnNldChub2RlLCB0cnVlKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0b3AsIGxlZnRcclxuICAgIH07XHJcbiAgfVxyXG4gIGdldFN0YXJ0Tm9kZU9mZnNldChyYW5nZSkge1xyXG4gICAgLy8g5Zyo6YCJ5Yy66LW35aeL5aSE5o+S5YWlc3BhblxyXG4gICAgLy8g6I635Y+Wc3BhbueahOS9jee9ruS/oeaBr1xyXG4gICAgLy8g56e76Zmkc3BhblxyXG4gICAgbGV0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgIC8vIHNwYW4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgc3Bhbi5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIjtcclxuICAgIHNwYW4uc3R5bGUudmVydGljYWxBbGlnbiA9IFwidG9wXCI7XHJcbiAgICByYW5nZS5pbnNlcnROb2RlKHNwYW4pO1xyXG4gICAgY29uc3QgcGFyZW50Tm9kZSA9IHNwYW4ucGFyZW50Tm9kZTtcclxuICAgIHNwYW4uc3R5bGUud2lkdGggPSBcIjMwcHhcIjtcclxuICAgIGNvbnN0IG9mZnNldCA9IHRoaXMub2Zmc2V0KHNwYW4pO1xyXG4gICAgcGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzcGFuKTtcclxuICAgIHJldHVybiBvZmZzZXQ7XHJcbiAgfVxyXG4gIGxvY2soKSB7XHJcbiAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuICB9XHJcbiAgdW5sb2NrKCkge1xyXG4gICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gIH1cclxuICBvbihldmVudE5hbWUsIGNhbGxiYWNrKSB7XHJcbiAgICBpZighdGhpcy5ldmVudHNbZXZlbnROYW1lXSkge1xyXG4gICAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdID0gW107XHJcbiAgICB9XHJcbiAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdLnB1c2goY2FsbGJhY2spO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG4gIGVtaXQoZXZlbnROYW1lLCBkYXRhKSB7XHJcbiAgICAodGhpcy5ldmVudHNbZXZlbnROYW1lXSB8fCBbXSkubWFwKGZ1bmMgPT4ge1xyXG4gICAgICBmdW5jKGRhdGEpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59OyJdfQ==
