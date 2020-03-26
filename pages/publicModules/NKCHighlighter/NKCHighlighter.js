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
window.Source = /*#__PURE__*/function () {
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

window.NKCHighlighter = /*#__PURE__*/function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvTktDSGlnaGxpZ2h0ZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQTs7Ozs7OztBQU9BLE1BQU0sQ0FBQyxNQUFQO0FBQ0Usa0JBQVksT0FBWixFQUFxQjtBQUFBOztBQUFBLFFBQ2QsRUFEYyxHQUNPLE9BRFAsQ0FDZCxFQURjO0FBQUEsUUFDVixJQURVLEdBQ08sT0FEUCxDQUNWLElBRFU7QUFBQSxRQUNKLEVBREksR0FDTyxPQURQLENBQ0osRUFESTtBQUFBLFFBQ0EsR0FEQSxHQUNPLE9BRFAsQ0FDQSxHQURBO0FBRW5CLElBQUEsRUFBRSxHQUFHLEVBQUUsSUFBRyxHQUFWO0FBQ0EsUUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLFNBQUssRUFBTCxHQUFVLEVBQVY7QUFDQSxTQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsU0FBSyxPQUFMLEdBQWUsRUFBRSxDQUFDLGVBQUgsQ0FBbUIsSUFBbkIsQ0FBZjtBQUNBLFNBQUssR0FBTCxHQUFXLEVBQVg7QUFDQSxTQUFLLEVBQUwsR0FBVSxFQUFWO0FBQ0EsU0FBSyxHQUFMLHVCQUF3QixFQUF4QjtBQVRtQixxQkFVTSxLQUFLLElBVlg7QUFBQSxRQVVaLE1BVlksY0FVWixNQVZZO0FBQUEsUUFVSixNQVZJLGNBVUosTUFWSTtBQVduQixRQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsUUFBTCxDQUFjLEtBQUssRUFBTCxDQUFRLElBQXRCLEVBQTRCLE1BQTVCLEVBQW9DLE1BQXBDLENBQXBCO0FBQ0EsSUFBQSxXQUFXLENBQUMsR0FBWixDQUFnQixVQUFBLFVBQVUsRUFBSTtBQUM1QixVQUFHLENBQUMsVUFBVSxDQUFDLFdBQVgsQ0FBdUIsTUFBM0IsRUFBbUM7QUFDbkMsVUFBTSxVQUFVLEdBQUcsVUFB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dW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKiBcclxuICBldmVudHM6XHJcbiAgICBzZWxlY3Q6IOWIkuivjVxyXG4gICAgY3JlYXRlOiDliJvlu7rlrp7kvotcclxuICAgIGhvdmVyOiDpvKDmoIfmgqzmta5cclxuICAgIGhvdmVyT3V0OiDpvKDmoIfnp7vlvIBcclxuKi9cclxud2luZG93LlNvdXJjZSA9IGNsYXNzIHtcclxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICBsZXQge2hsLCBub2RlLCBpZCwgX2lkfSA9IG9wdGlvbnM7XHJcbiAgICBpZCA9IGlkIHx8X2lkO1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICB0aGlzLmhsID0gaGw7XHJcbiAgICB0aGlzLm5vZGUgPSBub2RlO1xyXG4gICAgdGhpcy5jb250ZW50ID0gaGwuZ2V0Tm9kZXNDb250ZW50KG5vZGUpO1xyXG4gICAgdGhpcy5kb20gPSBbXTtcclxuICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIHRoaXMuX2lkID0gYG5rYy1obC1pZC0ke2lkfWA7XHJcbiAgICBjb25zdCB7b2Zmc2V0LCBsZW5ndGh9ID0gdGhpcy5ub2RlO1xyXG4gICAgY29uc3QgdGFyZ2V0Tm90ZXMgPSBzZWxmLmdldE5vZGVzKHRoaXMuaGwucm9vdCwgb2Zmc2V0LCBsZW5ndGgpO1xyXG4gICAgdGFyZ2V0Tm90ZXMubWFwKHRhcmdldE5vZGUgPT4ge1xyXG4gICAgICBpZighdGFyZ2V0Tm9kZS50ZXh0Q29udGVudC5sZW5ndGgpIHJldHVybjtcclxuICAgICAgY29uc3QgcGFyZW50Tm9kZSA9IHRhcmdldE5vZGUucGFyZW50Tm9kZTtcclxuICAgICAgaWYocGFyZW50Tm9kZS5jbGFzc0xpc3QuY29udGFpbnMoXCJua2MtaGxcIikpIHtcclxuICAgICAgICAvLyDlrZjlnKjpq5jkuq7ltYzlpZfnmoTpl67pophcclxuICAgICAgICAvLyDnkIbmg7PnirbmgIHkuIvvvIzmiYDmnInpgInljLrlpITkuo7lubPnuqfvvIzph43lkIjpg6jliIbooqvliIbpmpTvvIzku4Xmt7vliqDlpJrkuKpjbGFzc1xyXG4gICAgICAgIGxldCBwYXJlbnRzSWQgPSBwYXJlbnROb2RlLmdldEF0dHJpYnV0ZShcImRhdGEtbmtjLWhsLWlkXCIpO1xyXG4gICAgICAgIGlmKCFwYXJlbnRzSWQpIHJldHVybjtcclxuICAgICAgICBwYXJlbnRzSWQgPSBwYXJlbnRzSWQuc3BsaXQoXCItXCIpO1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZXMgPSBbXTtcclxuICAgICAgICBmb3IoY29uc3QgcGlkIG9mIHBhcmVudHNJZCkge1xyXG4gICAgICAgICAgc291cmNlcy5wdXNoKHNlbGYuaGwuZ2V0U291cmNlQnlJRChOdW1iZXIocGlkKSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yKGNvbnN0IG5vZGUgb2YgcGFyZW50Tm9kZS5jaGlsZE5vZGVzKSB7XHJcbiAgICAgICAgICBpZighbm9kZS50ZXh0Q29udGVudC5sZW5ndGgpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgY29uc3Qgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgICAgICAgc3Bhbi5jbGFzc05hbWUgPSBgbmtjLWhsYDtcclxuICAgICAgICAgIHNwYW4ub25tb3VzZW92ZXIgPSBwYXJlbnROb2RlLm9ubW91c2VvdmVyO1xyXG4gICAgICAgICAgc3Bhbi5vbm1vdXNlb3V0ID0gcGFyZW50Tm9kZS5vbm1vdXNlb3V0O1xyXG4gICAgICAgICAgc3Bhbi5vbmNsaWNrID0gcGFyZW50Tm9kZS5vbmNsaWNrO1xyXG4gICAgICAgICAgc291cmNlcy5tYXAocyA9PiB7XHJcbiAgICAgICAgICAgIHMuZG9tLnB1c2goc3Bhbik7XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAvLyDmlrDpgInljLpcclxuICAgICAgICAgIGlmKG5vZGUgPT09IHRhcmdldE5vZGUpIHtcclxuICAgICAgICAgICAgLy8g5aaC5p6c5paw6YCJ5Yy65a6M5YWo6KaG55uW5LiK5bGC6YCJ5Yy677yM5YiZ5L+d55WZ5LiK5bGC6YCJ5Yy655qE5LqL5Lu277yM5ZCm5YiZ5re75Yqg5paw6YCJ5Yy655u45YWz5LqL5Lu2XHJcbiAgICAgICAgICAgIGlmKHBhcmVudE5vZGUuY2hpbGROb2Rlcy5sZW5ndGggIT09IDEgfHwgdGFyZ2V0Tm90ZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgc3Bhbi5vbm1vdXNlb3ZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5obC5lbWl0KHNlbGYuaGwuZXZlbnROYW1lcy5ob3Zlciwgc2VsZik7XHJcbiAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICBzcGFuLm9ubW91c2VvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaGwuZW1pdChzZWxmLmhsLmV2ZW50TmFtZXMuaG92ZXJPdXQsIHNlbGYpO1xyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgc3Bhbi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmNsaWNrLCBzZWxmKTtcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIOimhuebluWMuuWfn+a3u+WKoGNsYXNzIG5rYy1obC1jb3ZlclxyXG4gICAgICAgICAgICBzcGFuLmNsYXNzTmFtZSArPSBgIG5rYy1obC1jb3ZlcmA7XHJcbiAgICAgICAgICAgIHNwYW4uc2V0QXR0cmlidXRlKGBkYXRhLW5rYy1obC1pZGAsIHBhcmVudHNJZC5jb25jYXQoW3NlbGYuaWRdKS5qb2luKFwiLVwiKSk7XHJcbiAgICAgICAgICAgIHNlbGYuZG9tLnB1c2goc3Bhbik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzcGFuLnNldEF0dHJpYnV0ZShgZGF0YS1ua2MtaGwtaWRgLCBwYXJlbnRzSWQuam9pbihcIi1cIikpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc3Bhbi5hcHBlbmRDaGlsZChub2RlLmNsb25lTm9kZShmYWxzZSkpO1xyXG4gICAgICAgICAgcGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoc3Bhbiwgbm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNvdXJjZXMubWFwKHMgPT4ge1xyXG4gICAgICAgICAgY29uc3QgcGFyZW50SW5kZXggPSBzLmRvbS5pbmRleE9mKHBhcmVudE5vZGUpO1xyXG4gICAgICAgICAgaWYocGFyZW50SW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHMuZG9tLnNwbGljZShwYXJlbnRJbmRleCwgMSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8g5riF6Zmk5LiK5bGC6YCJ5Yy6ZG9t55qE55u45YWz5LqL5Lu25ZKMY2xhc3NcclxuICAgICAgICAvLyBwYXJlbnROb2RlLmNsYXNzTGlzdC5yZW1vdmUoYG5rYy1obGAsIHNvdXJjZS5faWQsIGBua2MtaGwtY292ZXJgKTtcclxuICAgICAgICAvLyBwYXJlbnROb2RlLmNsYXNzTmFtZSA9IFwiXCI7XHJcbiAgICAgICAgcGFyZW50Tm9kZS5vbm1vdXNlb3V0ID0gbnVsbDtcclxuICAgICAgICBwYXJlbnROb2RlLm9ubW91c2VvdmVyID0gbnVsbDtcclxuICAgICAgICBwYXJlbnROb2RlLm9uY2xpY2sgPSBudWxsO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIOWFqOaWsOmAieWMuiDml6Dopobnm5bnmoTmg4XlhrVcclxuICAgICAgICBjb25zdCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcblxyXG4gICAgICAgIHNwYW4uY2xhc3NMaXN0LmFkZChcIm5rYy1obFwiKTtcclxuICAgICAgICBzcGFuLnNldEF0dHJpYnV0ZShcImRhdGEtbmtjLWhsLWlkXCIsIHNlbGYuaWQpO1xyXG5cclxuICAgICAgICBzcGFuLm9ubW91c2VvdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmhvdmVyLCBzZWxmKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHNwYW4ub25tb3VzZW91dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgc2VsZi5obC5lbWl0KHNlbGYuaGwuZXZlbnROYW1lcy5ob3Zlck91dCwgc2VsZik7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBzcGFuLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHNlbGYuaGwuZW1pdChzZWxmLmhsLmV2ZW50TmFtZXMuY2xpY2ssIHNlbGYpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHNlbGYuZG9tLnB1c2goc3Bhbik7XHJcblxyXG4gICAgICAgIHNwYW4uYXBwZW5kQ2hpbGQodGFyZ2V0Tm9kZS5jbG9uZU5vZGUoZmFsc2UpKTtcclxuICAgICAgICB0YXJnZXROb2RlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHNwYW4sIHRhcmdldE5vZGUpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHRoaXMuaGwuc291cmNlcy5wdXNoKHRoaXMpO1xyXG4gICAgdGhpcy5obC5lbWl0KHRoaXMuaGwuZXZlbnROYW1lcy5jcmVhdGUsIHRoaXMpO1xyXG4gIH1cclxuICBhZGRDbGFzcyhrbGFzcykge1xyXG4gICAgY29uc3Qge2RvbX0gPSB0aGlzO1xyXG4gICAgZG9tLm1hcChkID0+IHtcclxuICAgICAgZC5jbGFzc0xpc3QuYWRkKGtsYXNzKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICByZW1vdmVDbGFzcyhrbGFzcykge1xyXG4gICAgY29uc3Qge2RvbX0gPSB0aGlzO1xyXG4gICAgZG9tLm1hcChkID0+IHtcclxuICAgICAgZC5jbGFzc0xpc3QucmVtb3ZlKGtsYXNzKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBkZXN0cm95KCkge1xyXG4gICAgdGhpcy5kb20ubWFwKGQgPT4ge1xyXG4gICAgICBkLmNsYXNzTmFtZSA9IFwiXCI7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgZ2V0U291cmNlcygpIHtcclxuICAgIHJldHVybiB0aGlzLnNvdXJjZXM7XHJcbiAgfVxyXG4gIGdldE5vZGVzKHBhcmVudCwgb2Zmc2V0LCBsZW5ndGgpIHtcclxuICAgIGNvbnN0IG5vZGVTdGFjayA9IFtwYXJlbnRdO1xyXG4gICAgbGV0IGN1ck9mZnNldCA9IDA7XHJcbiAgICBsZXQgbm9kZSA9IG51bGw7XHJcbiAgICBsZXQgY3VyTGVuZ3RoID0gbGVuZ3RoO1xyXG4gICAgbGV0IG5vZGVzID0gW107XHJcbiAgICBsZXQgc3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICB3aGlsZSghIShub2RlID0gbm9kZVN0YWNrLnBvcCgpKSkge1xyXG4gICAgICBjb25zdCBjaGlsZHJlbiA9IG5vZGUuY2hpbGROb2RlcztcclxuICAgICAgbG9vcDpcclxuICAgICAgICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgIGNvbnN0IG5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgIGlmKG5vZGUubm9kZVR5cGUgPT09IDEpIHtcclxuICAgICAgICAgICAgY29uc3QgY2wgPSBub2RlLmNsYXNzTGlzdDtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IGMgb2Ygc2VsZi5obC5leGNsdWRlZEVsZW1lbnRDbGFzcykge1xyXG4gICAgICAgICAgICAgIGlmKGNsLmNvbnRhaW5zKGMpKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZSBsb29wO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50VGFnTmFtZSA9IG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICBpZihzZWxmLmhsLmV4Y2x1ZGVkRWxlbWVudFRhZ05hbWUuaW5jbHVkZXMoZWxlbWVudFRhZ05hbWUpKSB7XHJcbiAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG5vZGVTdGFjay5wdXNoKG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgaWYobm9kZS5ub2RlVHlwZSA9PT0gMyAmJiBub2RlLnRleHRDb250ZW50Lmxlbmd0aCkge1xyXG4gICAgICAgIGN1ck9mZnNldCArPSBub2RlLnRleHRDb250ZW50Lmxlbmd0aDtcclxuICAgICAgICBpZihjdXJPZmZzZXQgPiBvZmZzZXQpIHtcclxuICAgICAgICAgIGlmKGN1ckxlbmd0aCA8PSAwKSBicmVhaztcclxuICAgICAgICAgIGxldCBzdGFydE9mZnNldDtcclxuICAgICAgICAgIGlmKCFzdGFydGVkKSB7XHJcbiAgICAgICAgICAgIHN0YXJ0T2Zmc2V0ID0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSAoY3VyT2Zmc2V0IC0gb2Zmc2V0KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN0YXJ0T2Zmc2V0ID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgbGV0IG5lZWRMZW5ndGg7XHJcbiAgICAgICAgICBpZihjdXJMZW5ndGggPD0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSBzdGFydE9mZnNldCkge1xyXG4gICAgICAgICAgICBuZWVkTGVuZ3RoID0gY3VyTGVuZ3RoO1xyXG4gICAgICAgICAgICBjdXJMZW5ndGggPSAwO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbmVlZExlbmd0aCA9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoIC0gc3RhcnRPZmZzZXQ7XHJcbiAgICAgICAgICAgIGN1ckxlbmd0aCAtPSBuZWVkTGVuZ3RoO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbm9kZXMucHVzaCh7XHJcbiAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgIHN0YXJ0T2Zmc2V0LFxyXG4gICAgICAgICAgICBuZWVkTGVuZ3RoXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIG5vZGVzID0gbm9kZXMubWFwKG9iaiA9PiB7XHJcbiAgICAgIGxldCB7bm9kZSwgc3RhcnRPZmZzZXQsIG5lZWRMZW5ndGh9ID0gb2JqO1xyXG4gICAgICBpZihzdGFydE9mZnNldCA+IDApIHtcclxuICAgICAgICBub2RlID0gbm9kZS5zcGxpdFRleHQoc3RhcnRPZmZzZXQpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKG5vZGUudGV4dENvbnRlbnQubGVuZ3RoICE9PSBuZWVkTGVuZ3RoKSB7XHJcbiAgICAgICAgbm9kZS5zcGxpdFRleHQobmVlZExlbmd0aCk7ICBcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbm9kZTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5vZGVzO1xyXG4gIH1cclxufTtcclxuXHJcbndpbmRvdy5OS0NIaWdobGlnaHRlciA9IGNsYXNzIHtcclxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICBjb25zdCB7XHJcbiAgICAgIHJvb3RFbGVtZW50SWQsIGV4Y2x1ZGVkRWxlbWVudENsYXNzID0gW10sXHJcbiAgICAgIGV4Y2x1ZGVkRWxlbWVudFRhZ05hbWUgPSBbXVxyXG4gICAgfSA9IG9wdGlvbnM7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHNlbGYucm9vdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHJvb3RFbGVtZW50SWQpO1xyXG4gICAgc2VsZi5leGNsdWRlZEVsZW1lbnRDbGFzcyA9IGV4Y2x1ZGVkRWxlbWVudENsYXNzO1xyXG4gICAgc2VsZi5leGNsdWRlZEVsZW1lbnRUYWdOYW1lID0gZXhjbHVkZWRFbGVtZW50VGFnTmFtZTtcclxuXHJcbiAgICBzZWxmLnJhbmdlID0ge307XHJcbiAgICBzZWxmLnNvdXJjZXMgPSBbXTtcclxuICAgIHNlbGYuZXZlbnRzID0ge307XHJcbiAgICBzZWxmLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICBzZWxmLmV2ZW50TmFtZXMgPSB7XHJcbiAgICAgIGNyZWF0ZTogXCJjcmVhdGVcIixcclxuICAgICAgaG92ZXI6IFwiaG92ZXJcIixcclxuICAgICAgaG92ZXJPdXQ6IFwiaG92ZXJPdXRcIixcclxuICAgICAgc2VsZWN0OiBcInNlbGVjdFwiXHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBpbnRlcnZhbDtcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsICgpID0+IHtcclxuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwic2VsZWN0aW9uY2hhbmdlXCIsICgpID0+IHtcclxuICAgICAgc2VsZi5yYW5nZSA9IHt9O1xyXG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcclxuXHJcbiAgICAgIGludGVydmFsID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgc2VsZi5pbml0RXZlbnQoKTtcclxuICAgICAgfSwgNTAwKTtcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgfVxyXG4gIGluaXRFdmVudCgpIHtcclxuICAgIHRyeXtcclxuICAgICAgLy8g5bGP6JS95YiS6K+N5LqL5Lu2XHJcbiAgICAgIGlmKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcclxuICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldFJhbmdlKCk7XHJcbiAgICAgIGlmKCFyYW5nZSB8fCByYW5nZS5jb2xsYXBzZWQpIHJldHVybjtcclxuICAgICAgaWYoXHJcbiAgICAgICAgcmFuZ2Uuc3RhcnRDb250YWluZXIgPT09IHRoaXMucmFuZ2Uuc3RhcnRDb250YWluZXIgJiZcclxuICAgICAgICByYW5nZS5lbmRDb250YWluZXIgPT09IHRoaXMucmFuZ2UuZW5kQ29udGFpbmVyICYmXHJcbiAgICAgICAgcmFuZ2Uuc3RhcnRPZmZzZXQgPT09IHRoaXMucmFuZ2Uuc3RhcnRPZmZzZXQgJiZcclxuICAgICAgICByYW5nZS5lbmRPZmZzZXQgPT09IHRoaXMucmFuZ2UuZW5kT2Zmc2V0XHJcbiAgICAgICkgcmV0dXJuO1xyXG4gICAgICAvLyDpmZDliLbpgInmi6nmloflrZfnmoTljLrln5/vvIzlj6rog73mmK9yb2905LiL55qE6YCJ5Yy6XHJcbiAgICAgIGlmKCF0aGlzLmNvbnRhaW5zKHJhbmdlLnN0YXJ0Q29udGFpbmVyKSB8fCAhdGhpcy5jb250YWlucyhyYW5nZS5lbmRDb250YWluZXIpKSByZXR1cm47XHJcbiAgICAgIHRoaXMucmFuZ2UgPSByYW5nZTtcclxuICAgICAgdGhpcy5lbWl0KHRoaXMuZXZlbnROYW1lcy5zZWxlY3QsIHtcclxuICAgICAgICByYW5nZVxyXG4gICAgICB9KTtcclxuICAgIH0gY2F0Y2goZXJyKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKGVyci5tZXNzYWdlIHx8IGVycik7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGNvbnRhaW5zKG5vZGUpIHtcclxuICAgIHdoaWxlKChub2RlID0gbm9kZS5wYXJlbnROb2RlKSkge1xyXG4gICAgICBpZihub2RlID09PSB0aGlzLnJvb3QpIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBnZXRQYXJlbnQoc2VsZiwgZCkge1xyXG4gICAgaWYoZCA9PT0gc2VsZi5yb290KSByZXR1cm47XHJcbiAgICBpZihkLm5vZGVUeXBlID09PSAxKSB7XHJcbiAgICAgIGZvcihjb25zdCBjIG9mIHNlbGYuZXhjbHVkZWRFbGVtZW50Q2xhc3MpIHtcclxuICAgICAgICBpZihkLmNsYXNzTGlzdC5jb250YWlucyhjKSkgdGhyb3cgbmV3IEVycm9yKFwi5YiS6K+N6LaK55WMXCIpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKHNlbGYuZXhjbHVkZWRFbGVtZW50VGFnTmFtZS5pbmNsdWRlcyhkLnRhZ05hbWUudG9Mb3dlckNhc2UoKSkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCLliJLor43otornlYxcIik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmKGQucGFyZW50Tm9kZSkgc2VsZi5nZXRQYXJlbnQoc2VsZiwgZC5wYXJlbnROb2RlKTtcclxuICB9XHJcbiAgZ2V0UmFuZ2UoKSB7XHJcbiAgICB0cnl7XHJcbiAgICAgIGNvbnN0IHJhbmdlID0gd2luZG93LmdldFNlbGVjdGlvbigpLmdldFJhbmdlQXQoMCk7XHJcbiAgICAgIGNvbnN0IHtzdGFydE9mZnNldCwgZW5kT2Zmc2V0LCBzdGFydENvbnRhaW5lciwgZW5kQ29udGFpbmVyfSA9IHJhbmdlO1xyXG4gICAgICB0aGlzLmdldFBhcmVudCh0aGlzLCBzdGFydENvbnRhaW5lcik7XHJcbiAgICAgIHRoaXMuZ2V0UGFyZW50KHRoaXMsIGVuZENvbnRhaW5lcik7XHJcbiAgICAgIGNvbnN0IG5vZGVzID0gdGhpcy5maW5kTm9kZXMoc3RhcnRDb250YWluZXIsIGVuZENvbnRhaW5lcik7XHJcbiAgICAgIG5vZGVzLm1hcChub2RlID0+IHtcclxuICAgICAgICB0aGlzLmdldFBhcmVudCh0aGlzLCBub2RlKTtcclxuICAgICAgfSk7XHJcbiAgICAgIGlmKHN0YXJ0T2Zmc2V0ID09PSBlbmRPZmZzZXQgJiYgc3RhcnRDb250YWluZXIgPT09IGVuZENvbnRhaW5lcikgcmV0dXJuO1xyXG4gICAgICByZXR1cm4gcmFuZ2U7XHJcbiAgICB9IGNhdGNoKGVycikge1xyXG4gICAgICBjb25zb2xlLmxvZyhlcnIubWVzc2FnZSB8fCBlcnIpO1xyXG4gICAgfVxyXG4gIH1cclxuICBkZXN0cm95KHNvdXJjZSkge1xyXG4gICAgaWYodHlwZW9mIHNvdXJjZSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICBzb3VyY2UgPSB0aGlzLmdldFNvdXJjZUJ5SUQoc291cmNlKTtcclxuICAgIH1cclxuICAgIHNvdXJjZS5kZXN0cm95KCk7XHJcbiAgfVxyXG4gIHJlc3RvcmVTb3VyY2VzKHNvdXJjZXMgPSBbXSkge1xyXG4gICAgZm9yKGNvbnN0IHNvdXJjZSBvZiBzb3VyY2VzKSB7XHJcbiAgICAgIHNvdXJjZS5obCA9IHRoaXM7XHJcbiAgICAgIG5ldyBTb3VyY2Uoc291cmNlKTtcclxuICAgIH1cclxuICB9XHJcbiAgZ2V0Tm9kZXMocmFuZ2UpIHtcclxuICAgIGNvbnN0IHtzdGFydENvbnRhaW5lciwgZW5kQ29udGFpbmVyLCBzdGFydE9mZnNldCwgZW5kT2Zmc2V0fSA9IHJhbmdlO1xyXG4gICAgLy8gaWYoc3RhcnRPZmZzZXQgPT09IGVuZE9mZnNldCkgcmV0dXJuO1xyXG4gICAgbGV0IHNlbGVjdGVkTm9kZXMgPSBbXSwgc3RhcnROb2RlLCBlbmROb2RlO1xyXG4gICAgLy8gaWYoc3RhcnRDb250YWluZXIubm9kZVR5cGUgIT09IDMgfHwgc3RhcnRDb250YWluZXIubm9kZVR5cGUgIT09IDMpIHJldHVybjtcclxuICAgIGlmKHN0YXJ0Q29udGFpbmVyID09PSBlbmRDb250YWluZXIpIHtcclxuICAgICAgLy8g55u45ZCM6IqC54K5XHJcbiAgICAgIHN0YXJ0Tm9kZSA9IHN0YXJ0Q29udGFpbmVyO1xyXG4gICAgICBlbmROb2RlID0gc3RhcnROb2RlO1xyXG4gICAgICBzZWxlY3RlZE5vZGVzLnB1c2goe1xyXG4gICAgICAgIG5vZGU6IHN0YXJ0Tm9kZSxcclxuICAgICAgICBvZmZzZXQ6IHN0YXJ0T2Zmc2V0LFxyXG4gICAgICAgIGxlbmd0aDogZW5kT2Zmc2V0IC0gc3RhcnRPZmZzZXRcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzdGFydE5vZGUgPSBzdGFydENvbnRhaW5lcjtcclxuICAgICAgZW5kTm9kZSA9IGVuZENvbnRhaW5lcjtcclxuICAgICAgLy8g5b2T6LW35aeL6IqC54K55LiN5Li65paH5pys6IqC54K55pe277yM5peg6ZyA5o+S5YWl6LW35aeL6IqC54K5XHJcbiAgICAgIC8vIOWcqOiOt+WPluWtkOiKgueCueaXtuS8muWwhuaPkuWFpei1t+Wni+iKgueCueeahOWtkOiKgueCue+8jOWmguaenOi/memHjOS4jeWBmuWIpOaWre+8jOS8muWHuueOsOi1t+Wni+iKgueCueWGheWuuemHjeWkjeeahOmXrumimOOAglxyXG4gICAgICBpZihzdGFydE5vZGUubm9kZVR5cGUgPT09IDMpIHtcclxuICAgICAgICBzZWxlY3RlZE5vZGVzLnB1c2goe1xyXG4gICAgICAgICAgbm9kZTogc3RhcnROb2RlLFxyXG4gICAgICAgICAgb2Zmc2V0OiBzdGFydE9mZnNldCxcclxuICAgICAgICAgIGxlbmd0aDogc3RhcnROb2RlLnRleHRDb250ZW50Lmxlbmd0aCAtIHN0YXJ0T2Zmc2V0XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3Qgbm9kZXMgPSB0aGlzLmZpbmROb2RlcyhzdGFydE5vZGUsIGVuZE5vZGUpO1xyXG4gICAgICBmb3IoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xyXG4gICAgICAgIHNlbGVjdGVkTm9kZXMucHVzaCh7XHJcbiAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgb2Zmc2V0OiAwLFxyXG4gICAgICAgICAgbGVuZ3RoOiBub2RlLnRleHRDb250ZW50Lmxlbmd0aFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIHNlbGVjdGVkTm9kZXMucHVzaCh7XHJcbiAgICAgICAgbm9kZTogZW5kTm9kZSxcclxuICAgICAgICBvZmZzZXQ6IDAsXHJcbiAgICAgICAgbGVuZ3RoOiBlbmRPZmZzZXRcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgbm9kZXMgPSBbXTtcclxuICAgIGZvcihjb25zdCBvYmogb2Ygc2VsZWN0ZWROb2Rlcykge1xyXG4gICAgICBjb25zdCB7bm9kZSwgb2Zmc2V0LCBsZW5ndGh9ID0gb2JqO1xyXG4gICAgICBjb25zdCBjb250ZW50ID0gbm9kZS50ZXh0Q29udGVudC5zbGljZShvZmZzZXQsIG9mZnNldCArIGxlbmd0aCk7XHJcbiAgICAgIGNvbnN0IG9mZnNldF8gPSB0aGlzLmdldE9mZnNldChub2RlKTtcclxuICAgICAgbm9kZXMucHVzaCh7XHJcbiAgICAgICAgY29udGVudCxcclxuICAgICAgICBvZmZzZXQ6IG9mZnNldF8gKyBvZmZzZXQsXHJcbiAgICAgICAgbGVuZ3RoXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgaWYoIW5vZGVzLmxlbmd0aCkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgbGV0IGNvbnRlbnQgPSBcIlwiLCAgb2Zmc2V0ID0gMCwgbGVuZ3RoID0gMDtcclxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgIGNvbnRlbnQgKz0gbm9kZS5jb250ZW50O1xyXG4gICAgICBsZW5ndGggKz0gbm9kZS5sZW5ndGg7XHJcbiAgICAgIGlmKGkgPT09IDApIG9mZnNldCA9IG5vZGUub2Zmc2V0O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbnRlbnQsXHJcbiAgICAgIG9mZnNldCxcclxuICAgICAgbGVuZ3RoXHJcbiAgICB9XHJcbiAgfVxyXG4gIGdldE5vZGVzQ29udGVudChub2RlKSB7XHJcbiAgICByZXR1cm4gbm9kZS5jb250ZW50O1xyXG4gIH1cclxuICBjcmVhdGVTb3VyY2UoaWQsIG5vZGUpIHtcclxuICAgIHJldHVybiBuZXcgU291cmNlKHtcclxuICAgICAgaGw6IHRoaXMsXHJcbiAgICAgIGlkLFxyXG4gICAgICBub2RlLFxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGdldFNvdXJjZUJ5SUQoaWQpIHtcclxuICAgIGZvcihjb25zdCBzIG9mIHRoaXMuc291cmNlcykge1xyXG4gICAgICBpZihzLmlkID09PSBpZCkgcmV0dXJuIHM7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGFkZENsYXNzKGlkLCBjbGFzc05hbWUpIHtcclxuICAgIGxldCBzb3VyY2U7XHJcbiAgICBpZih0eXBlb2YgaWQgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgc291cmNlID0gdGhpcy5nZXRTb3VyY2VCeUlEKGlkKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNvdXJjZSA9IGlkO1xyXG4gICAgfVxyXG4gICAgc291cmNlLmFkZENsYXNzKGNsYXNzTmFtZSk7XHJcbiAgfVxyXG4gIHJlbW92ZUNsYXNzKGlkLCBjbGFzc05hbWUpIHtcclxuICAgIGxldCBzb3VyY2U7XHJcbiAgICBpZih0eXBlb2YgaWQgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgc291cmNlID0gdGhpcy5nZXRTb3VyY2VCeUlEKGlkKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNvdXJjZSA9IGlkO1xyXG4gICAgfVxyXG4gICAgc291cmNlLnJlbW92ZUNsYXNzKGNsYXNzTmFtZSk7XHJcbiAgfVxyXG4gIGdldE9mZnNldCh0ZXh0KSB7XHJcbiAgICBjb25zdCBub2RlU3RhY2sgPSBbdGhpcy5yb290XTtcclxuICAgIGxldCBjdXJOb2RlID0gbnVsbDtcclxuICAgIGxldCBvZmZzZXQgPSAwO1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICB3aGlsZSAoISEoY3VyTm9kZSA9IG5vZGVTdGFjay5wb3AoKSkpIHtcclxuICAgICAgY29uc3QgY2hpbGRyZW4gPSBjdXJOb2RlLmNoaWxkTm9kZXM7XHJcbiAgICAgIGxvb3A6XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICBjb25zdCBub2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICBpZihub2RlLm5vZGVUeXBlID09PSAxKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNsID0gbm9kZS5jbGFzc0xpc3Q7XHJcbiAgICAgICAgICAgIGZvcihjb25zdCBjIG9mIHNlbGYuZXhjbHVkZWRFbGVtZW50Q2xhc3MpIHtcclxuICAgICAgICAgICAgICBpZihjbC5jb250YWlucyhjKSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWUgbG9vcDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudFRhZ05hbWUgPSBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgaWYoc2VsZi5leGNsdWRlZEVsZW1lbnRUYWdOYW1lLmluY2x1ZGVzKGVsZW1lbnRUYWdOYW1lKSkge1xyXG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBub2RlU3RhY2sucHVzaChub2RlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICBpZiAoY3VyTm9kZS5ub2RlVHlwZSA9PT0gMyAmJiBjdXJOb2RlICE9PSB0ZXh0KSB7XHJcbiAgICAgICAgb2Zmc2V0ICs9IGN1ck5vZGUudGV4dENvbnRlbnQubGVuZ3RoO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGN1ck5vZGUubm9kZVR5cGUgPT09IDMpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9mZnNldDtcclxuICB9XHJcbiAgZmluZE5vZGVzKHN0YXJ0Tm9kZSwgZW5kTm9kZSkge1xyXG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlcyA9IFtdO1xyXG4gICAgLy8gY29uc3QgcGFyZW50ID0gdGhpcy5yb290O1xyXG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5nZXRTYW1lUGFyZW50Tm9kZShzdGFydE5vZGUsIGVuZE5vZGUpO1xyXG4gICAgaWYocGFyZW50KSB7XHJcbiAgICAgIGxldCBzdGFydCA9IGZhbHNlLCBlbmQgPSBmYWxzZTtcclxuICAgICAgY29uc3QgZ2V0Q2hpbGROb2RlID0gKG5vZGUpID0+IHtcclxuICAgICAgICBpZighbm9kZS5oYXNDaGlsZE5vZGVzKCkpIHJldHVybjtcclxuICAgICAgICBmb3IoY29uc3QgbiBvZiBub2RlLmNoaWxkTm9kZXMpIHtcclxuICAgICAgICAgIGlmKGVuZCB8fCBuID09PSBlbmROb2RlKSB7XHJcbiAgICAgICAgICAgIGVuZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH0gZWxzZSBpZihzdGFydCAmJiBuLm5vZGVUeXBlID09PSAzKSB7XHJcbiAgICAgICAgICAgIHNlbGVjdGVkTm9kZXMucHVzaChuKTtcclxuICAgICAgICAgIH0gZWxzZSBpZihuID09PSBzdGFydE5vZGUpIHtcclxuICAgICAgICAgICAgc3RhcnQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZ2V0Q2hpbGROb2RlKG4pO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgZ2V0Q2hpbGROb2RlKHBhcmVudCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc2VsZWN0ZWROb2RlcztcclxuICB9XHJcbiAgZ2V0U2FtZVBhcmVudE5vZGUoc3RhcnROb2RlLCBlbmROb2RlKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIGlmKCFlbmROb2RlIHx8IHN0YXJ0Tm9kZSA9PT0gZW5kTm9kZSkgcmV0dXJuIHN0YXJ0Tm9kZS5wYXJlbnROb2RlO1xyXG4gICAgY29uc3Qgc3RhcnROb2RlcyA9IFtdLCBlbmROb2RlcyA9IFtdO1xyXG4gICAgY29uc3QgZ2V0UGFyZW50ID0gKG5vZGUsIG5vZGVzKSA9PiB7XHJcbiAgICAgIG5vZGVzLnB1c2gobm9kZSk7XHJcbiAgICAgIGlmKG5vZGUgIT09IHNlbGYucm9vdCAmJiBub2RlLnBhcmVudE5vZGUpIHtcclxuICAgICAgICBnZXRQYXJlbnQobm9kZS5wYXJlbnROb2RlLCBub2Rlcyk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBnZXRQYXJlbnQoc3RhcnROb2RlLCBzdGFydE5vZGVzKTtcclxuICAgIGdldFBhcmVudChlbmROb2RlLCBlbmROb2Rlcyk7XHJcbiAgICBsZXQgcGFyZW50O1xyXG4gICAgZm9yKGNvbnN0IG5vZGUgb2Ygc3RhcnROb2Rlcykge1xyXG4gICAgICBpZihlbmROb2Rlcy5pbmNsdWRlcyhub2RlKSkge1xyXG4gICAgICAgIHBhcmVudCA9IG5vZGU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBwYXJlbnQ7XHJcbiAgfVxyXG4gIGdldFNvdXJjZUJ5SWQoaWQpIHtcclxuICAgIGZvcihjb25zdCBzIG9mIHRoaXMuc291cmNlcykge1xyXG4gICAgICBpZihzLmlkID09PSBpZCkge1xyXG4gICAgICAgIHJldHVybiBzO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIG9mZnNldChub2RlKSB7XHJcbiAgICBsZXQgdG9wID0gMCwgbGVmdCA9IDAsIF9wb3NpdGlvbjtcclxuXHJcbiAgICBjb25zdCBnZXRPZmZzZXQgPSAobiwgaW5pdCkgPT4ge1xyXG4gICAgICBpZihuLm5vZGVUeXBlICE9PSAxKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIF9wb3NpdGlvbiA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG4pWydwb3NpdGlvbiddO1xyXG5cclxuICAgICAgaWYgKHR5cGVvZihpbml0KSA9PT0gJ3VuZGVmaW5lZCcgJiYgX3Bvc2l0aW9uID09PSAnc3RhdGljJykge1xyXG4gICAgICAgIGdldE9mZnNldChuLnBhcmVudE5vZGUpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgdG9wID0gbi5vZmZzZXRUb3AgKyB0b3AgLSBuLnNjcm9sbFRvcDtcclxuICAgICAgbGVmdCA9IG4ub2Zmc2V0TGVmdCArIGxlZnQgLSBuLnNjcm9sbExlZnQ7XHJcblxyXG4gICAgICBpZiAoX3Bvc2l0aW9uID09PSAnZml4ZWQnKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGdldE9mZnNldChuLnBhcmVudE5vZGUpO1xyXG4gICAgfTtcclxuXHJcbiAgICBnZXRPZmZzZXQobm9kZSwgdHJ1ZSk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdG9wLCBsZWZ0XHJcbiAgICB9O1xyXG4gIH1cclxuICBnZXRTdGFydE5vZGVPZmZzZXQocmFuZ2UpIHtcclxuICAgIC8vIOWcqOmAieWMuui1t+Wni+WkhOaPkuWFpXNwYW5cclxuICAgIC8vIOiOt+WPlnNwYW7nmoTkvY3nva7kv6Hmga9cclxuICAgIC8vIOenu+mZpHNwYW5cclxuICAgIGxldCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICAvLyBzcGFuLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgIHNwYW4uc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lLWJsb2NrXCI7XHJcbiAgICBzcGFuLnN0eWxlLnZlcnRpY2FsQWxpZ24gPSBcInRvcFwiO1xyXG4gICAgcmFuZ2UuaW5zZXJ0Tm9kZShzcGFuKTtcclxuICAgIGNvbnN0IHBhcmVudE5vZGUgPSBzcGFuLnBhcmVudE5vZGU7XHJcbiAgICBzcGFuLnN0eWxlLndpZHRoID0gXCIzMHB4XCI7XHJcbiAgICBjb25zdCBvZmZzZXQgPSB0aGlzLm9mZnNldChzcGFuKTtcclxuICAgIHBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3Bhbik7XHJcbiAgICByZXR1cm4gb2Zmc2V0O1xyXG4gIH1cclxuICBsb2NrKCkge1xyXG4gICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgfVxyXG4gIHVubG9jaygpIHtcclxuICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuICB9XHJcbiAgb24oZXZlbnROYW1lLCBjYWxsYmFjaykge1xyXG4gICAgaWYoIXRoaXMuZXZlbnRzW2V2ZW50TmFtZV0pIHtcclxuICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXSA9IFtdO1xyXG4gICAgfVxyXG4gICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXS5wdXNoKGNhbGxiYWNrKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuICBlbWl0KGV2ZW50TmFtZSwgZGF0YSkge1xyXG4gICAgKHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0gfHwgW10pLm1hcChmdW5jID0+IHtcclxuICAgICAgZnVuYyhkYXRhKTtcclxuICAgIH0pO1xyXG4gIH1cclxufTsiXX0=
