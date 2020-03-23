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
        var children = node.childNodes;

        loop: for (var i = children.length - 1; i >= 0; i--) {
          var _node = children[i];

          if (_node.nodeType === 1) {
            var cl = _node.classList;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = self.hl.excludedElementClass[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var c = _step3.value;

                if (cl.contains(c)) {
                  continue loop;
                }
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

            var elementTagName = _node.tagName.toLowerCase();

            if (self.hl.excludedElementTagName.includes(elementTagName)) {
              continue;
            }
          }

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
        excludedElementTagName = _options$excludedElem2 === void 0 ? [] : _options$excludedElem2;
    var self = this;
    self.root = document.getElementById(rootElementId);
    self.excludedElementClass = excludedElementClass;
    self.excludedElementTagName = excludedElementTagName;
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

      if (d.nodeType === 1) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = self.excludedElementClass[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var c = _step4.value;
            if (d.classList.contains(c)) throw new Error("划词越界");
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

        if (self.excludedElementTagName.includes(d.tagName.toLowerCase())) {
          throw new Error("划词越界");
        }
      }

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
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = sources[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var source = _step5.value;
          source.hl = this;
          new Source(source);
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

        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = _nodes[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var node = _step6.value;
            selectedNodes.push({
              node: node,
              offset: 0,
              length: node.textContent.length
            });
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
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = this.sources[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var s = _step7.value;
          if (s.id === id) return s;
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
        var children = curNode.childNodes;

        loop: for (var i = children.length - 1; i >= 0; i--) {
          var node = children[i];

          if (node.nodeType === 1) {
            var cl = node.classList;
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
              for (var _iterator8 = self.excludedElementClass[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                var c = _step8.value;

                if (cl.contains(c)) {
                  continue loop;
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

            var elementTagName = node.tagName.toLowerCase();

            if (self.excludedElementTagName.includes(elementTagName)) {
              continue;
            }
          }

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
          var _iteratorNormalCompletion9 = true;
          var _didIteratorError9 = false;
          var _iteratorError9 = undefined;

          try {
            for (var _iterator9 = node.childNodes[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
              var n = _step9.value;

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
            _didIteratorError9 = true;
            _iteratorError9 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion9 && _iterator9["return"] != null) {
                _iterator9["return"]();
              }
            } finally {
              if (_didIteratorError9) {
                throw _iteratorError9;
              }
            }
          }
        };

        getChildNode(parent);
      }

      return selectedNodes;
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
      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = this.sources[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          var s = _step10.value;

          if (s.id === id) {
            return s;
          }
        }
      } catch (err) {
        _didIteratorError10 = true;
        _iteratorError10 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion10 && _iterator10["return"] != null) {
            _iterator10["return"]();
          }
        } finally {
          if (_didIteratorError10) {
            throw _iteratorError10;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvTktDSGlnaGxpZ2h0ZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQTs7Ozs7OztBQU9BLE1BQU0sQ0FBQyxNQUFQO0FBQUE7QUFBQTtBQUNFLGtCQUFZLE9BQVosRUFBcUI7QUFBQTs7QUFBQSxRQUNkLEVBRGMsR0FDTyxPQURQLENBQ2QsRUFEYztBQUFBLFFBQ1YsSUFEVSxHQUNPLE9BRFAsQ0FDVixJQURVO0FBQUEsUUFDSixFQURJLEdBQ08sT0FEUCxDQUNKLEVBREk7QUFBQSxRQUNBLEdBREEsR0FDTyxPQURQLENBQ0EsR0FEQTtBQUVuQixJQUFBLEVBQUUsR0FBRyxFQUFFLElBQUcsR0FBVjtBQUNBLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxTQUFLLEVBQUwsR0FBVSxFQUFWO0FBQ0EsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFNBQUssT0FBTCxHQUFlLEVBQUUsQ0FBQyxlQUFILENBQW1CLElBQW5CLENBQWY7QUFDQSxTQUFLLEdBQUwsR0FBVyxFQUFYO0FBQ0EsU0FBSyxFQUFMLEdBQVUsRUFBVjtBQUNBLFNBQUssR0FBTCx1QkFBd0IsRUFBeEI7QUFUbUIscUJBVU0sS0FBSyxJQVZYO0FBQUEsUUFVWixNQVZZLGNBVVosTUFWWTtBQUFBLFFBVUosTUFWSSxjQVVKLE1BVkk7QUFXbkIsUUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxLQUFLLEVBQUwsQ0FBUSxJQUF0QixFQUE0QixNQUE1QixFQUFvQyxNQUFwQyxDQUFwQjtBQUNBLElBQUEsV0FBVyxDQUFDLEdBQVosQ0FBZ0IsVUFBQSxVQUFVLEVBQUk7QUFDNUIsVUFBRyxDQUFDLFVBQVUsQ0FBQyxXQUFYLENBQXVCLE1BQTNCLEVBQW1DO0FBQ25DLFVBQU0sVUFB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c291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qIFxyXG4gIGV2ZW50czpcclxuICAgIHNlbGVjdDog5YiS6K+NXHJcbiAgICBjcmVhdGU6IOWIm+W7uuWunuS+i1xyXG4gICAgaG92ZXI6IOm8oOagh+aCrOa1rlxyXG4gICAgaG92ZXJPdXQ6IOm8oOagh+enu+W8gFxyXG4qL1xyXG53aW5kb3cuU291cmNlID0gY2xhc3Mge1xyXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgIGxldCB7aGwsIG5vZGUsIGlkLCBfaWR9ID0gb3B0aW9ucztcclxuICAgIGlkID0gaWQgfHxfaWQ7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHRoaXMuaGwgPSBobDtcclxuICAgIHRoaXMubm9kZSA9IG5vZGU7XHJcbiAgICB0aGlzLmNvbnRlbnQgPSBobC5nZXROb2Rlc0NvbnRlbnQobm9kZSk7XHJcbiAgICB0aGlzLmRvbSA9IFtdO1xyXG4gICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgdGhpcy5faWQgPSBgbmtjLWhsLWlkLSR7aWR9YDtcclxuICAgIGNvbnN0IHtvZmZzZXQsIGxlbmd0aH0gPSB0aGlzLm5vZGU7XHJcbiAgICBjb25zdCB0YXJnZXROb3RlcyA9IHNlbGYuZ2V0Tm9kZXModGhpcy5obC5yb290LCBvZmZzZXQsIGxlbmd0aCk7XHJcbiAgICB0YXJnZXROb3Rlcy5tYXAodGFyZ2V0Tm9kZSA9PiB7XHJcbiAgICAgIGlmKCF0YXJnZXROb2RlLnRleHRDb250ZW50Lmxlbmd0aCkgcmV0dXJuO1xyXG4gICAgICBjb25zdCBwYXJlbnROb2RlID0gdGFyZ2V0Tm9kZS5wYXJlbnROb2RlO1xyXG4gICAgICBpZihwYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucyhcIm5rYy1obFwiKSkge1xyXG4gICAgICAgIC8vIOWtmOWcqOmrmOS6ruW1jOWll+eahOmXrumimFxyXG4gICAgICAgIC8vIOeQhuaDs+eKtuaAgeS4i++8jOaJgOaciemAieWMuuWkhOS6juW5s+e6p++8jOmHjeWQiOmDqOWIhuiiq+WIhumalO+8jOS7hea3u+WKoOWkmuS4qmNsYXNzXHJcbiAgICAgICAgbGV0IHBhcmVudHNJZCA9IHBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKFwiZGF0YS1ua2MtaGwtaWRcIik7XHJcbiAgICAgICAgaWYoIXBhcmVudHNJZCkgcmV0dXJuO1xyXG4gICAgICAgIHBhcmVudHNJZCA9IHBhcmVudHNJZC5zcGxpdChcIi1cIik7XHJcbiAgICAgICAgY29uc3Qgc291cmNlcyA9IFtdO1xyXG4gICAgICAgIGZvcihjb25zdCBwaWQgb2YgcGFyZW50c0lkKSB7XHJcbiAgICAgICAgICBzb3VyY2VzLnB1c2goc2VsZi5obC5nZXRTb3VyY2VCeUlEKE51bWJlcihwaWQpKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IoY29uc3Qgbm9kZSBvZiBwYXJlbnROb2RlLmNoaWxkTm9kZXMpIHtcclxuICAgICAgICAgIGlmKCFub2RlLnRleHRDb250ZW50Lmxlbmd0aCkgY29udGludWU7XHJcbiAgICAgICAgICBjb25zdCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICAgICAgICBzcGFuLmNsYXNzTmFtZSA9IGBua2MtaGxgO1xyXG4gICAgICAgICAgc3Bhbi5vbm1vdXNlb3ZlciA9IHBhcmVudE5vZGUub25tb3VzZW92ZXI7XHJcbiAgICAgICAgICBzcGFuLm9ubW91c2VvdXQgPSBwYXJlbnROb2RlLm9ubW91c2VvdXQ7XHJcbiAgICAgICAgICBzcGFuLm9uY2xpY2sgPSBwYXJlbnROb2RlLm9uY2xpY2s7XHJcbiAgICAgICAgICBzb3VyY2VzLm1hcChzID0+IHtcclxuICAgICAgICAgICAgcy5kb20ucHVzaChzcGFuKTtcclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIC8vIOaWsOmAieWMulxyXG4gICAgICAgICAgaWYobm9kZSA9PT0gdGFyZ2V0Tm9kZSkge1xyXG4gICAgICAgICAgICAvLyDlpoLmnpzmlrDpgInljLrlrozlhajopobnm5bkuIrlsYLpgInljLrvvIzliJnkv53nlZnkuIrlsYLpgInljLrnmoTkuovku7bvvIzlkKbliJnmt7vliqDmlrDpgInljLrnm7jlhbPkuovku7ZcclxuICAgICAgICAgICAgaWYocGFyZW50Tm9kZS5jaGlsZE5vZGVzLmxlbmd0aCAhPT0gMSB8fCB0YXJnZXROb3Rlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICBzcGFuLm9ubW91c2VvdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmhvdmVyLCBzZWxmKTtcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgIHNwYW4ub25tb3VzZW91dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5obC5lbWl0KHNlbGYuaGwuZXZlbnROYW1lcy5ob3Zlck91dCwgc2VsZik7XHJcbiAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICBzcGFuLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaGwuZW1pdChzZWxmLmhsLmV2ZW50TmFtZXMuY2xpY2ssIHNlbGYpO1xyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8g6KaG55uW5Yy65Z+f5re75YqgY2xhc3MgbmtjLWhsLWNvdmVyXHJcbiAgICAgICAgICAgIHNwYW4uY2xhc3NOYW1lICs9IGAgbmtjLWhsLWNvdmVyYDtcclxuICAgICAgICAgICAgc3Bhbi5zZXRBdHRyaWJ1dGUoYGRhdGEtbmtjLWhsLWlkYCwgcGFyZW50c0lkLmNvbmNhdChbc2VsZi5pZF0pLmpvaW4oXCItXCIpKTtcclxuICAgICAgICAgICAgc2VsZi5kb20ucHVzaChzcGFuKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNwYW4uc2V0QXR0cmlidXRlKGBkYXRhLW5rYy1obC1pZGAsIHBhcmVudHNJZC5qb2luKFwiLVwiKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBzcGFuLmFwcGVuZENoaWxkKG5vZGUuY2xvbmVOb2RlKGZhbHNlKSk7XHJcbiAgICAgICAgICBwYXJlbnROb2RlLnJlcGxhY2VDaGlsZChzcGFuLCBub2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc291cmNlcy5tYXAocyA9PiB7XHJcbiAgICAgICAgICBjb25zdCBwYXJlbnRJbmRleCA9IHMuZG9tLmluZGV4T2YocGFyZW50Tm9kZSk7XHJcbiAgICAgICAgICBpZihwYXJlbnRJbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgcy5kb20uc3BsaWNlKHBhcmVudEluZGV4LCAxKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyDmuIXpmaTkuIrlsYLpgInljLpkb23nmoTnm7jlhbPkuovku7blkoxjbGFzc1xyXG4gICAgICAgIC8vIHBhcmVudE5vZGUuY2xhc3NMaXN0LnJlbW92ZShgbmtjLWhsYCwgc291cmNlLl9pZCwgYG5rYy1obC1jb3ZlcmApO1xyXG4gICAgICAgIC8vIHBhcmVudE5vZGUuY2xhc3NOYW1lID0gXCJcIjtcclxuICAgICAgICBwYXJlbnROb2RlLm9ubW91c2VvdXQgPSBudWxsO1xyXG4gICAgICAgIHBhcmVudE5vZGUub25tb3VzZW92ZXIgPSBudWxsO1xyXG4gICAgICAgIHBhcmVudE5vZGUub25jbGljayA9IG51bGw7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8g5YWo5paw6YCJ5Yy6IOaXoOimhueblueahOaDheWGtVxyXG4gICAgICAgIGNvbnN0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuXHJcbiAgICAgICAgc3Bhbi5jbGFzc0xpc3QuYWRkKFwibmtjLWhsXCIpO1xyXG4gICAgICAgIHNwYW4uc2V0QXR0cmlidXRlKFwiZGF0YS1ua2MtaGwtaWRcIiwgc2VsZi5pZCk7XHJcblxyXG4gICAgICAgIHNwYW4ub25tb3VzZW92ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHNlbGYuaGwuZW1pdChzZWxmLmhsLmV2ZW50TmFtZXMuaG92ZXIsIHNlbGYpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgc3Bhbi5vbm1vdXNlb3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmhvdmVyT3V0LCBzZWxmKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHNwYW4ub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgc2VsZi5obC5lbWl0KHNlbGYuaGwuZXZlbnROYW1lcy5jbGljaywgc2VsZik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2VsZi5kb20ucHVzaChzcGFuKTtcclxuXHJcbiAgICAgICAgc3Bhbi5hcHBlbmRDaGlsZCh0YXJnZXROb2RlLmNsb25lTm9kZShmYWxzZSkpO1xyXG4gICAgICAgIHRhcmdldE5vZGUucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoc3BhbiwgdGFyZ2V0Tm9kZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgdGhpcy5obC5zb3VyY2VzLnB1c2godGhpcyk7XHJcbiAgICB0aGlzLmhsLmVtaXQodGhpcy5obC5ldmVudE5hbWVzLmNyZWF0ZSwgdGhpcyk7XHJcbiAgfVxyXG4gIGFkZENsYXNzKGtsYXNzKSB7XHJcbiAgICBjb25zdCB7ZG9tfSA9IHRoaXM7XHJcbiAgICBkb20ubWFwKGQgPT4ge1xyXG4gICAgICBkLmNsYXNzTGlzdC5hZGQoa2xhc3MpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHJlbW92ZUNsYXNzKGtsYXNzKSB7XHJcbiAgICBjb25zdCB7ZG9tfSA9IHRoaXM7XHJcbiAgICBkb20ubWFwKGQgPT4ge1xyXG4gICAgICBkLmNsYXNzTGlzdC5yZW1vdmUoa2xhc3MpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGRlc3Ryb3koKSB7XHJcbiAgICB0aGlzLmRvbS5tYXAoZCA9PiB7XHJcbiAgICAgIGQuY2xhc3NOYW1lID0gXCJcIjtcclxuICAgIH0pO1xyXG4gIH1cclxuICBnZXRTb3VyY2VzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuc291cmNlcztcclxuICB9XHJcbiAgZ2V0Tm9kZXMocGFyZW50LCBvZmZzZXQsIGxlbmd0aCkge1xyXG4gICAgY29uc3Qgbm9kZVN0YWNrID0gW3BhcmVudF07XHJcbiAgICBsZXQgY3VyT2Zmc2V0ID0gMDtcclxuICAgIGxldCBub2RlID0gbnVsbDtcclxuICAgIGxldCBjdXJMZW5ndGggPSBsZW5ndGg7XHJcbiAgICBsZXQgbm9kZXMgPSBbXTtcclxuICAgIGxldCBzdGFydGVkID0gZmFsc2U7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHdoaWxlKCEhKG5vZGUgPSBub2RlU3RhY2sucG9wKCkpKSB7XHJcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gbm9kZS5jaGlsZE5vZGVzO1xyXG4gICAgICBsb29wOlxyXG4gICAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgY29uc3Qgbm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgaWYobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xyXG4gICAgICAgICAgICBjb25zdCBjbCA9IG5vZGUuY2xhc3NMaXN0O1xyXG4gICAgICAgICAgICBmb3IoY29uc3QgYyBvZiBzZWxmLmhsLmV4Y2x1ZGVkRWxlbWVudENsYXNzKSB7XHJcbiAgICAgICAgICAgICAgaWYoY2wuY29udGFpbnMoYykpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlIGxvb3A7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRUYWdOYW1lID0gbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIGlmKHNlbGYuaGwuZXhjbHVkZWRFbGVtZW50VGFnTmFtZS5pbmNsdWRlcyhlbGVtZW50VGFnTmFtZSkpIHtcclxuICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbm9kZVN0YWNrLnB1c2gobm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICBpZihub2RlLm5vZGVUeXBlID09PSAzICYmIG5vZGUudGV4dENvbnRlbnQubGVuZ3RoKSB7XHJcbiAgICAgICAgY3VyT2Zmc2V0ICs9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoO1xyXG4gICAgICAgIGlmKGN1ck9mZnNldCA+IG9mZnNldCkge1xyXG4gICAgICAgICAgaWYoY3VyTGVuZ3RoIDw9IDApIGJyZWFrO1xyXG4gICAgICAgICAgbGV0IHN0YXJ0T2Zmc2V0O1xyXG4gICAgICAgICAgaWYoIXN0YXJ0ZWQpIHtcclxuICAgICAgICAgICAgc3RhcnRPZmZzZXQgPSBub2RlLnRleHRDb250ZW50Lmxlbmd0aCAtIChjdXJPZmZzZXQgLSBvZmZzZXQpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3RhcnRPZmZzZXQgPSAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc3RhcnRlZCA9IHRydWU7XHJcbiAgICAgICAgICBsZXQgbmVlZExlbmd0aDtcclxuICAgICAgICAgIGlmKGN1ckxlbmd0aCA8PSBub2RlLnRleHRDb250ZW50Lmxlbmd0aCAtIHN0YXJ0T2Zmc2V0KSB7XHJcbiAgICAgICAgICAgIG5lZWRMZW5ndGggPSBjdXJMZW5ndGg7XHJcbiAgICAgICAgICAgIGN1ckxlbmd0aCA9IDA7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBuZWVkTGVuZ3RoID0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSBzdGFydE9mZnNldDtcclxuICAgICAgICAgICAgY3VyTGVuZ3RoIC09IG5lZWRMZW5ndGg7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBub2Rlcy5wdXNoKHtcclxuICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgc3RhcnRPZmZzZXQsXHJcbiAgICAgICAgICAgIG5lZWRMZW5ndGhcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgbm9kZXMgPSBub2Rlcy5tYXAob2JqID0+IHtcclxuICAgICAgbGV0IHtub2RlLCBzdGFydE9mZnNldCwgbmVlZExlbmd0aH0gPSBvYmo7XHJcbiAgICAgIGlmKHN0YXJ0T2Zmc2V0ID4gMCkge1xyXG4gICAgICAgIG5vZGUgPSBub2RlLnNwbGl0VGV4dChzdGFydE9mZnNldCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYobm9kZS50ZXh0Q29udGVudC5sZW5ndGggIT09IG5lZWRMZW5ndGgpIHtcclxuICAgICAgICBub2RlLnNwbGl0VGV4dChuZWVkTGVuZ3RoKTsgIFxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBub2RlO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbm9kZXM7XHJcbiAgfVxyXG59O1xyXG5cclxud2luZG93Lk5LQ0hpZ2hsaWdodGVyID0gY2xhc3Mge1xyXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgIGNvbnN0IHtcclxuICAgICAgcm9vdEVsZW1lbnRJZCwgZXhjbHVkZWRFbGVtZW50Q2xhc3MgPSBbXSxcclxuICAgICAgZXhjbHVkZWRFbGVtZW50VGFnTmFtZSA9IFtdXHJcbiAgICB9ID0gb3B0aW9ucztcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgc2VsZi5yb290ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocm9vdEVsZW1lbnRJZCk7XHJcbiAgICBzZWxmLmV4Y2x1ZGVkRWxlbWVudENsYXNzID0gZXhjbHVkZWRFbGVtZW50Q2xhc3M7XHJcbiAgICBzZWxmLmV4Y2x1ZGVkRWxlbWVudFRhZ05hbWUgPSBleGNsdWRlZEVsZW1lbnRUYWdOYW1lO1xyXG5cclxuICAgIHNlbGYucmFuZ2UgPSB7fTtcclxuICAgIHNlbGYuc291cmNlcyA9IFtdO1xyXG4gICAgc2VsZi5ldmVudHMgPSB7fTtcclxuICAgIHNlbGYuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIHNlbGYuZXZlbnROYW1lcyA9IHtcclxuICAgICAgY3JlYXRlOiBcImNyZWF0ZVwiLFxyXG4gICAgICBob3ZlcjogXCJob3ZlclwiLFxyXG4gICAgICBob3Zlck91dDogXCJob3Zlck91dFwiLFxyXG4gICAgICBzZWxlY3Q6IFwic2VsZWN0XCJcclxuICAgIH07XHJcblxyXG4gICAgbGV0IGludGVydmFsO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKCkgPT4ge1xyXG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJzZWxlY3Rpb25jaGFuZ2VcIiwgKCkgPT4ge1xyXG4gICAgICBzZWxmLnJhbmdlID0ge307XHJcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xyXG5cclxuICAgICAgaW50ZXJ2YWwgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBzZWxmLmluaXRFdmVudCgpO1xyXG4gICAgICB9LCA1MDApO1xyXG4gICAgfSk7XHJcblxyXG5cclxuICB9XHJcbiAgaW5pdEV2ZW50KCkge1xyXG4gICAgdHJ5e1xyXG4gICAgICAvLyDlsY/olL3liJLor43kuovku7ZcclxuICAgICAgaWYodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xyXG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0UmFuZ2UoKTtcclxuICAgICAgaWYoIXJhbmdlIHx8IHJhbmdlLmNvbGxhcHNlZCkgcmV0dXJuO1xyXG4gICAgICBpZihcclxuICAgICAgICByYW5nZS5zdGFydENvbnRhaW5lciA9PT0gdGhpcy5yYW5nZS5zdGFydENvbnRhaW5lciAmJlxyXG4gICAgICAgIHJhbmdlLmVuZENvbnRhaW5lciA9PT0gdGhpcy5yYW5nZS5lbmRDb250YWluZXIgJiZcclxuICAgICAgICByYW5nZS5zdGFydE9mZnNldCA9PT0gdGhpcy5yYW5nZS5zdGFydE9mZnNldCAmJlxyXG4gICAgICAgIHJhbmdlLmVuZE9mZnNldCA9PT0gdGhpcy5yYW5nZS5lbmRPZmZzZXRcclxuICAgICAgKSByZXR1cm47XHJcbiAgICAgIC8vIOmZkOWItumAieaLqeaWh+Wtl+eahOWMuuWfn++8jOWPquiDveaYr3Jvb3TkuIvnmoTpgInljLpcclxuICAgICAgaWYoIXRoaXMuY29udGFpbnMocmFuZ2Uuc3RhcnRDb250YWluZXIpIHx8ICF0aGlzLmNvbnRhaW5zKHJhbmdlLmVuZENvbnRhaW5lcikpIHJldHVybjtcclxuICAgICAgdGhpcy5yYW5nZSA9IHJhbmdlO1xyXG4gICAgICB0aGlzLmVtaXQodGhpcy5ldmVudE5hbWVzLnNlbGVjdCwge1xyXG4gICAgICAgIHJhbmdlXHJcbiAgICAgIH0pO1xyXG4gICAgfSBjYXRjaChlcnIpIHtcclxuICAgICAgY29uc29sZS5sb2coZXJyLm1lc3NhZ2UgfHwgZXJyKTtcclxuICAgIH1cclxuICB9XHJcbiAgY29udGFpbnMobm9kZSkge1xyXG4gICAgd2hpbGUoKG5vZGUgPSBub2RlLnBhcmVudE5vZGUpKSB7XHJcbiAgICAgIGlmKG5vZGUgPT09IHRoaXMucm9vdCkgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIGdldFBhcmVudChzZWxmLCBkKSB7XHJcbiAgICBpZihkID09PSBzZWxmLnJvb3QpIHJldHVybjtcclxuICAgIGlmKGQubm9kZVR5cGUgPT09IDEpIHtcclxuICAgICAgZm9yKGNvbnN0IGMgb2Ygc2VsZi5leGNsdWRlZEVsZW1lbnRDbGFzcykge1xyXG4gICAgICAgIGlmKGQuY2xhc3NMaXN0LmNvbnRhaW5zKGMpKSB0aHJvdyBuZXcgRXJyb3IoXCLliJLor43otornlYxcIik7XHJcbiAgICAgIH1cclxuICAgICAgaWYoc2VsZi5leGNsdWRlZEVsZW1lbnRUYWdOYW1lLmluY2x1ZGVzKGQudGFnTmFtZS50b0xvd2VyQ2FzZSgpKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIuWIkuivjei2iueVjFwiKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYoZC5wYXJlbnROb2RlKSBzZWxmLmdldFBhcmVudChzZWxmLCBkLnBhcmVudE5vZGUpO1xyXG4gIH1cclxuICBnZXRSYW5nZSgpIHtcclxuICAgIHRyeXtcclxuICAgICAgY29uc3QgcmFuZ2UgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuZ2V0UmFuZ2VBdCgwKTtcclxuICAgICAgY29uc3Qge3N0YXJ0T2Zmc2V0LCBlbmRPZmZzZXQsIHN0YXJ0Q29udGFpbmVyLCBlbmRDb250YWluZXJ9ID0gcmFuZ2U7XHJcbiAgICAgIHRoaXMuZ2V0UGFyZW50KHRoaXMsIHN0YXJ0Q29udGFpbmVyKTtcclxuICAgICAgdGhpcy5nZXRQYXJlbnQodGhpcywgZW5kQ29udGFpbmVyKTtcclxuICAgICAgY29uc3Qgbm9kZXMgPSB0aGlzLmZpbmROb2RlcyhzdGFydENvbnRhaW5lciwgZW5kQ29udGFpbmVyKTtcclxuICAgICAgbm9kZXMubWFwKG5vZGUgPT4ge1xyXG4gICAgICAgIHRoaXMuZ2V0UGFyZW50KHRoaXMsIG5vZGUpO1xyXG4gICAgICB9KTtcclxuICAgICAgaWYoc3RhcnRPZmZzZXQgPT09IGVuZE9mZnNldCAmJiBzdGFydENvbnRhaW5lciA9PT0gZW5kQ29udGFpbmVyKSByZXR1cm47XHJcbiAgICAgIHJldHVybiByYW5nZTtcclxuICAgIH0gY2F0Y2goZXJyKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKGVyci5tZXNzYWdlIHx8IGVycik7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGRlc3Ryb3koc291cmNlKSB7XHJcbiAgICBpZih0eXBlb2Ygc291cmNlID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgIHNvdXJjZSA9IHRoaXMuZ2V0U291cmNlQnlJRChzb3VyY2UpO1xyXG4gICAgfVxyXG4gICAgc291cmNlLmRlc3Ryb3koKTtcclxuICB9XHJcbiAgcmVzdG9yZVNvdXJjZXMoc291cmNlcyA9IFtdKSB7XHJcbiAgICBmb3IoY29uc3Qgc291cmNlIG9mIHNvdXJjZXMpIHtcclxuICAgICAgc291cmNlLmhsID0gdGhpcztcclxuICAgICAgbmV3IFNvdXJjZShzb3VyY2UpO1xyXG4gICAgfVxyXG4gIH1cclxuICBnZXROb2RlcyhyYW5nZSkge1xyXG4gICAgY29uc3Qge3N0YXJ0Q29udGFpbmVyLCBlbmRDb250YWluZXIsIHN0YXJ0T2Zmc2V0LCBlbmRPZmZzZXR9ID0gcmFuZ2U7XHJcbiAgICAvLyBpZihzdGFydE9mZnNldCA9PT0gZW5kT2Zmc2V0KSByZXR1cm47XHJcbiAgICBsZXQgc2VsZWN0ZWROb2RlcyA9IFtdLCBzdGFydE5vZGUsIGVuZE5vZGU7XHJcbiAgICAvLyBpZihzdGFydENvbnRhaW5lci5ub2RlVHlwZSAhPT0gMyB8fCBzdGFydENvbnRhaW5lci5ub2RlVHlwZSAhPT0gMykgcmV0dXJuO1xyXG4gICAgaWYoc3RhcnRDb250YWluZXIgPT09IGVuZENvbnRhaW5lcikge1xyXG4gICAgICAvLyDnm7jlkIzoioLngrlcclxuICAgICAgc3RhcnROb2RlID0gc3RhcnRDb250YWluZXI7XHJcbiAgICAgIGVuZE5vZGUgPSBzdGFydE5vZGU7XHJcbiAgICAgIHNlbGVjdGVkTm9kZXMucHVzaCh7XHJcbiAgICAgICAgbm9kZTogc3RhcnROb2RlLFxyXG4gICAgICAgIG9mZnNldDogc3RhcnRPZmZzZXQsXHJcbiAgICAgICAgbGVuZ3RoOiBlbmRPZmZzZXQgLSBzdGFydE9mZnNldFxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHN0YXJ0Tm9kZSA9IHN0YXJ0Q29udGFpbmVyO1xyXG4gICAgICBlbmROb2RlID0gZW5kQ29udGFpbmVyO1xyXG4gICAgICAvLyDlvZPotbflp4voioLngrnkuI3kuLrmlofmnKzoioLngrnml7bvvIzml6DpnIDmj5LlhaXotbflp4voioLngrlcclxuICAgICAgLy8g5Zyo6I635Y+W5a2Q6IqC54K55pe25Lya5bCG5o+S5YWl6LW35aeL6IqC54K555qE5a2Q6IqC54K577yM5aaC5p6c6L+Z6YeM5LiN5YGa5Yik5pat77yM5Lya5Ye6546w6LW35aeL6IqC54K55YaF5a656YeN5aSN55qE6Zeu6aKY44CCXHJcbiAgICAgIGlmKHN0YXJ0Tm9kZS5ub2RlVHlwZSA9PT0gMykge1xyXG4gICAgICAgIHNlbGVjdGVkTm9kZXMucHVzaCh7XHJcbiAgICAgICAgICBub2RlOiBzdGFydE5vZGUsXHJcbiAgICAgICAgICBvZmZzZXQ6IHN0YXJ0T2Zmc2V0LFxyXG4gICAgICAgICAgbGVuZ3RoOiBzdGFydE5vZGUudGV4dENvbnRlbnQubGVuZ3RoIC0gc3RhcnRPZmZzZXRcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBub2RlcyA9IHRoaXMuZmluZE5vZGVzKHN0YXJ0Tm9kZSwgZW5kTm9kZSk7XHJcbiAgICAgIGZvcihjb25zdCBub2RlIG9mIG5vZGVzKSB7XHJcbiAgICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKHtcclxuICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICBvZmZzZXQ6IDAsXHJcbiAgICAgICAgICBsZW5ndGg6IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKHtcclxuICAgICAgICBub2RlOiBlbmROb2RlLFxyXG4gICAgICAgIG9mZnNldDogMCxcclxuICAgICAgICBsZW5ndGg6IGVuZE9mZnNldFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBub2RlcyA9IFtdO1xyXG4gICAgZm9yKGNvbnN0IG9iaiBvZiBzZWxlY3RlZE5vZGVzKSB7XHJcbiAgICAgIGNvbnN0IHtub2RlLCBvZmZzZXQsIGxlbmd0aH0gPSBvYmo7XHJcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBub2RlLnRleHRDb250ZW50LnNsaWNlKG9mZnNldCwgb2Zmc2V0ICsgbGVuZ3RoKTtcclxuICAgICAgY29uc3Qgb2Zmc2V0XyA9IHRoaXMuZ2V0T2Zmc2V0KG5vZGUpO1xyXG4gICAgICBub2Rlcy5wdXNoKHtcclxuICAgICAgICBjb250ZW50LFxyXG4gICAgICAgIG9mZnNldDogb2Zmc2V0XyArIG9mZnNldCxcclxuICAgICAgICBsZW5ndGhcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBpZighbm9kZXMubGVuZ3RoKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICBsZXQgY29udGVudCA9IFwiXCIsICBvZmZzZXQgPSAwLCBsZW5ndGggPSAwO1xyXG4gICAgZm9yKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgY29udGVudCArPSBub2RlLmNvbnRlbnQ7XHJcbiAgICAgIGxlbmd0aCArPSBub2RlLmxlbmd0aDtcclxuICAgICAgaWYoaSA9PT0gMCkgb2Zmc2V0ID0gbm9kZS5vZmZzZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29udGVudCxcclxuICAgICAgb2Zmc2V0LFxyXG4gICAgICBsZW5ndGhcclxuICAgIH1cclxuICB9XHJcbiAgZ2V0Tm9kZXNDb250ZW50KG5vZGUpIHtcclxuICAgIHJldHVybiBub2RlLmNvbnRlbnQ7XHJcbiAgfVxyXG4gIGNyZWF0ZVNvdXJjZShpZCwgbm9kZSkge1xyXG4gICAgcmV0dXJuIG5ldyBTb3VyY2Uoe1xyXG4gICAgICBobDogdGhpcyxcclxuICAgICAgaWQsXHJcbiAgICAgIG5vZGUsXHJcbiAgICB9KTtcclxuICB9XHJcbiAgZ2V0U291cmNlQnlJRChpZCkge1xyXG4gICAgZm9yKGNvbnN0IHMgb2YgdGhpcy5zb3VyY2VzKSB7XHJcbiAgICAgIGlmKHMuaWQgPT09IGlkKSByZXR1cm4gcztcclxuICAgIH1cclxuICB9XHJcbiAgYWRkQ2xhc3MoaWQsIGNsYXNzTmFtZSkge1xyXG4gICAgbGV0IHNvdXJjZTtcclxuICAgIGlmKHR5cGVvZiBpZCA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICBzb3VyY2UgPSB0aGlzLmdldFNvdXJjZUJ5SUQoaWQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc291cmNlID0gaWQ7XHJcbiAgICB9XHJcbiAgICBzb3VyY2UuYWRkQ2xhc3MoY2xhc3NOYW1lKTtcclxuICB9XHJcbiAgcmVtb3ZlQ2xhc3MoaWQsIGNsYXNzTmFtZSkge1xyXG4gICAgbGV0IHNvdXJjZTtcclxuICAgIGlmKHR5cGVvZiBpZCA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICBzb3VyY2UgPSB0aGlzLmdldFNvdXJjZUJ5SUQoaWQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc291cmNlID0gaWQ7XHJcbiAgICB9XHJcbiAgICBzb3VyY2UucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lKTtcclxuICB9XHJcbiAgZ2V0T2Zmc2V0KHRleHQpIHtcclxuICAgIGNvbnN0IG5vZGVTdGFjayA9IFt0aGlzLnJvb3RdO1xyXG4gICAgbGV0IGN1ck5vZGUgPSBudWxsO1xyXG4gICAgbGV0IG9mZnNldCA9IDA7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHdoaWxlICghIShjdXJOb2RlID0gbm9kZVN0YWNrLnBvcCgpKSkge1xyXG4gICAgICBjb25zdCBjaGlsZHJlbiA9IGN1ck5vZGUuY2hpbGROb2RlcztcclxuICAgICAgbG9vcDpcclxuICAgICAgICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgIGNvbnN0IG5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgIGlmKG5vZGUubm9kZVR5cGUgPT09IDEpIHtcclxuICAgICAgICAgICAgY29uc3QgY2wgPSBub2RlLmNsYXNzTGlzdDtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IGMgb2Ygc2VsZi5leGNsdWRlZEVsZW1lbnRDbGFzcykge1xyXG4gICAgICAgICAgICAgIGlmKGNsLmNvbnRhaW5zKGMpKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZSBsb29wO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50VGFnTmFtZSA9IG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICBpZihzZWxmLmV4Y2x1ZGVkRWxlbWVudFRhZ05hbWUuaW5jbHVkZXMoZWxlbWVudFRhZ05hbWUpKSB7XHJcbiAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG5vZGVTdGFjay5wdXNoKG5vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjdXJOb2RlLm5vZGVUeXBlID09PSAzICYmIGN1ck5vZGUgIT09IHRleHQpIHtcclxuICAgICAgICBvZmZzZXQgKz0gY3VyTm9kZS50ZXh0Q29udGVudC5sZW5ndGg7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoY3VyTm9kZS5ub2RlVHlwZSA9PT0gMykge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb2Zmc2V0O1xyXG4gIH1cclxuICBmaW5kTm9kZXMoc3RhcnROb2RlLCBlbmROb2RlKSB7XHJcbiAgICBjb25zdCBzZWxlY3RlZE5vZGVzID0gW107XHJcbiAgICAvLyBjb25zdCBwYXJlbnQgPSB0aGlzLnJvb3Q7XHJcbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLmdldFNhbWVQYXJlbnROb2RlKHN0YXJ0Tm9kZSwgZW5kTm9kZSk7XHJcbiAgICBpZihwYXJlbnQpIHtcclxuICAgICAgbGV0IHN0YXJ0ID0gZmFsc2UsIGVuZCA9IGZhbHNlO1xyXG4gICAgICBjb25zdCBnZXRDaGlsZE5vZGUgPSAobm9kZSkgPT4ge1xyXG4gICAgICAgIGlmKCFub2RlLmhhc0NoaWxkTm9kZXMoKSkgcmV0dXJuO1xyXG4gICAgICAgIGZvcihjb25zdCBuIG9mIG5vZGUuY2hpbGROb2Rlcykge1xyXG4gICAgICAgICAgaWYoZW5kIHx8IG4gPT09IGVuZE5vZGUpIHtcclxuICAgICAgICAgICAgZW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfSBlbHNlIGlmKHN0YXJ0ICYmIG4ubm9kZVR5cGUgPT09IDMpIHtcclxuICAgICAgICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKG4pO1xyXG4gICAgICAgICAgfSBlbHNlIGlmKG4gPT09IHN0YXJ0Tm9kZSkge1xyXG4gICAgICAgICAgICBzdGFydCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBnZXRDaGlsZE5vZGUobik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICBnZXRDaGlsZE5vZGUocGFyZW50KTtcclxuICAgIH1cclxuICAgIHJldHVybiBzZWxlY3RlZE5vZGVzO1xyXG4gIH1cclxuICBnZXRTYW1lUGFyZW50Tm9kZShzdGFydE5vZGUsIGVuZE5vZGUpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgaWYoIWVuZE5vZGUgfHwgc3RhcnROb2RlID09PSBlbmROb2RlKSByZXR1cm4gc3RhcnROb2RlLnBhcmVudE5vZGU7XHJcbiAgICBjb25zdCBzdGFydE5vZGVzID0gW10sIGVuZE5vZGVzID0gW107XHJcbiAgICBjb25zdCBnZXRQYXJlbnQgPSAobm9kZSwgbm9kZXMpID0+IHtcclxuICAgICAgbm9kZXMucHVzaChub2RlKTtcclxuICAgICAgaWYobm9kZSAhPT0gc2VsZi5yb290ICYmIG5vZGUucGFyZW50Tm9kZSkge1xyXG4gICAgICAgIGdldFBhcmVudChub2RlLnBhcmVudE5vZGUsIG5vZGVzKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGdldFBhcmVudChzdGFydE5vZGUsIHN0YXJ0Tm9kZXMpO1xyXG4gICAgZ2V0UGFyZW50KGVuZE5vZGUsIGVuZE5vZGVzKTtcclxuICAgIGxldCBwYXJlbnQ7XHJcbiAgICBmb3IoY29uc3Qgbm9kZSBvZiBzdGFydE5vZGVzKSB7XHJcbiAgICAgIGlmKGVuZE5vZGVzLmluY2x1ZGVzKG5vZGUpKSB7XHJcbiAgICAgICAgcGFyZW50ID0gbm9kZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhcmVudDtcclxuICB9XHJcbiAgZ2V0U291cmNlQnlJZChpZCkge1xyXG4gICAgZm9yKGNvbnN0IHMgb2YgdGhpcy5zb3VyY2VzKSB7XHJcbiAgICAgIGlmKHMuaWQgPT09IGlkKSB7XHJcbiAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgb2Zmc2V0KG5vZGUpIHtcclxuICAgIGxldCB0b3AgPSAwLCBsZWZ0ID0gMCwgX3Bvc2l0aW9uO1xyXG5cclxuICAgIGNvbnN0IGdldE9mZnNldCA9IChuLCBpbml0KSA9PiB7XHJcbiAgICAgIGlmKG4ubm9kZVR5cGUgIT09IDEpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgX3Bvc2l0aW9uID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUobilbJ3Bvc2l0aW9uJ107XHJcblxyXG4gICAgICBpZiAodHlwZW9mKGluaXQpID09PSAndW5kZWZpbmVkJyAmJiBfcG9zaXRpb24gPT09ICdzdGF0aWMnKSB7XHJcbiAgICAgICAgZ2V0T2Zmc2V0KG4ucGFyZW50Tm9kZSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0b3AgPSBuLm9mZnNldFRvcCArIHRvcCAtIG4uc2Nyb2xsVG9wO1xyXG4gICAgICBsZWZ0ID0gbi5vZmZzZXRMZWZ0ICsgbGVmdCAtIG4uc2Nyb2xsTGVmdDtcclxuXHJcbiAgICAgIGlmIChfcG9zaXRpb24gPT09ICdmaXhlZCcpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgZ2V0T2Zmc2V0KG4ucGFyZW50Tm9kZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGdldE9mZnNldChub2RlLCB0cnVlKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0b3AsIGxlZnRcclxuICAgIH07XHJcbiAgfVxyXG4gIGdldFN0YXJ0Tm9kZU9mZnNldChyYW5nZSkge1xyXG4gICAgLy8g5Zyo6YCJ5Yy66LW35aeL5aSE5o+S5YWlc3BhblxyXG4gICAgLy8g6I635Y+Wc3BhbueahOS9jee9ruS/oeaBr1xyXG4gICAgLy8g56e76Zmkc3BhblxyXG4gICAgbGV0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgIC8vIHNwYW4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgc3Bhbi5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIjtcclxuICAgIHNwYW4uc3R5bGUudmVydGljYWxBbGlnbiA9IFwidG9wXCI7XHJcbiAgICByYW5nZS5pbnNlcnROb2RlKHNwYW4pO1xyXG4gICAgY29uc3QgcGFyZW50Tm9kZSA9IHNwYW4ucGFyZW50Tm9kZTtcclxuICAgIHNwYW4uc3R5bGUud2lkdGggPSBcIjMwcHhcIjtcclxuICAgIGNvbnN0IG9mZnNldCA9IHRoaXMub2Zmc2V0KHNwYW4pO1xyXG4gICAgcGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzcGFuKTtcclxuICAgIHJldHVybiBvZmZzZXQ7XHJcbiAgfVxyXG4gIGxvY2soKSB7XHJcbiAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuICB9XHJcbiAgdW5sb2NrKCkge1xyXG4gICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gIH1cclxuICBvbihldmVudE5hbWUsIGNhbGxiYWNrKSB7XHJcbiAgICBpZighdGhpcy5ldmVudHNbZXZlbnROYW1lXSkge1xyXG4gICAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdID0gW107XHJcbiAgICB9XHJcbiAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdLnB1c2goY2FsbGJhY2spO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG4gIGVtaXQoZXZlbnROYW1lLCBkYXRhKSB7XHJcbiAgICAodGhpcy5ldmVudHNbZXZlbnROYW1lXSB8fCBbXSkubWFwKGZ1bmMgPT4ge1xyXG4gICAgICBmdW5jKGRhdGEpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59OyJdfQ==
