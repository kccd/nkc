(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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
    var targetNotes = self.getNodes(this.hl.root, offset, length);

    if (length === 0 || !targetNotes.length) {
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

        var _iterator = _createForOfIteratorHelper(parentsId),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var pid = _step.value;
            sources.push(self.hl.getSourceByID(Number(pid)));
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        var _iterator2 = _createForOfIteratorHelper(parentNode.childNodes),
            _step2;

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

          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var _ret = _loop();

            if (_ret === "continue") continue;
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
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

window.NKCHighlighter = /*#__PURE__*/function () {
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

      var _iterator3 = _createForOfIteratorHelper(sources),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var source = _step3.value;
          source.hl = this;
          new Source(source);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
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

        var _iterator4 = _createForOfIteratorHelper(_nodes),
            _step4;

        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var node = _step4.value;
            selectedNodes.push({
              node: node,
              offset: 0,
              length: node.textContent.length
            });
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
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
        var _node2 = obj.node,
            _offset = obj.offset,
            _length = obj.length;

        var _content = _node2.textContent.slice(_offset, _offset + _length);

        var offset_ = this.getOffset(_node2);
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
        var _node3 = nodes[i];
        content += _node3.content;
        length += _node3.length;
        if (i === 0) offset = _node3.offset;
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
      var _iterator5 = _createForOfIteratorHelper(this.sources),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var s = _step5.value;
          if (s.id === id) return s;
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
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

          var _iterator6 = _createForOfIteratorHelper(node.childNodes),
              _step6;

          try {
            for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
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
            _iterator6.e(err);
          } finally {
            _iterator6.f();
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

        var _iterator7 = _createForOfIteratorHelper(this.clownClass),
            _step7;

        try {
          for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
            var c = _step7.value;

            if (cl.contains(c)) {
              return true;
            }
          }
        } catch (err) {
          _iterator7.e(err);
        } finally {
          _iterator7.f();
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
      var _iterator8 = _createForOfIteratorHelper(this.sources),
          _step8;

      try {
        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
          var s = _step8.value;

          if (s.id === id) {
            return s;
          }
        }
      } catch (err) {
        _iterator8.e(err);
      } finally {
        _iterator8.f();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvTktDSGlnaGxpZ2h0ZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7QUNBQTs7Ozs7OztBQU9BLE1BQU0sQ0FBQyxNQUFQO0FBQ0Usa0JBQVksT0FBWixFQUFxQjtBQUFBOztBQUFBLFFBQ2QsRUFEYyxHQUNnQixPQURoQixDQUNkLEVBRGM7QUFBQSxRQUNWLElBRFUsR0FDZ0IsT0FEaEIsQ0FDVixJQURVO0FBQUEsUUFDSixFQURJLEdBQ2dCLE9BRGhCLENBQ0osRUFESTtBQUFBLFFBQ0EsR0FEQSxHQUNnQixPQURoQixDQUNBLEdBREE7QUFBQSxRQUNLLE9BREwsR0FDZ0IsT0FEaEIsQ0FDSyxPQURMO0FBRW5CLElBQUEsRUFBRSxHQUFHLEVBQUUsSUFBRyxHQUFWO0FBQ0EsUUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLFNBQUssRUFBTCxHQUFVLEVBQVY7QUFDQSxTQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsU0FBSyxPQUFMLEdBQWUsRUFBRSxDQUFDLGVBQUgsQ0FBbUIsSUFBbkIsQ0FBZjtBQUNBLFNBQUssR0FBTCxHQUFXLEVBQVg7QUFDQSxTQUFLLEVBQUwsR0FBVSxFQUFWO0FBQ0EsU0FBSyxHQUFMLHVCQUF3QixFQUF4QjtBQVRtQixxQkFVTSxLQUFLLElBVlg7QUFBQSxRQVVaLE1BVlksY0FVWixNQVZZO0FBQUEsUUFVSixNQVZJLGNBVUosTUFWSTtBQVduQixRQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsUUFBTCxDQUFjLEtBQUssRUFBTCxDQUFRLElBQXRCLEVBQTRCLE1BQTVCLEVBQW9DLE1BQXBDLENBQWxCOztBQUNBLFFBQUcsTUFBTSxLQUFLLENBQVgsSUFBZ0IsQ0FBQyxXQUFXLENBQUMsTUFBaEMsRUFBd0M7QUFDdEM7QUFD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QUQsQ0FBSjtBQUNELE9BRkQ7QUFHRDtBQTFXSDs7QUFBQTtBQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyogXHJcbiAgZXZlbnRzOlxyXG4gICAgc2VsZWN0OiDliJLor41cclxuICAgIGNyZWF0ZTog5Yib5bu65a6e5L6LXHJcbiAgICBob3Zlcjog6byg5qCH5oKs5rWuXHJcbiAgICBob3Zlck91dDog6byg5qCH56e75byAXHJcbiovXHJcbndpbmRvdy5Tb3VyY2UgPSBjbGFzcyB7XHJcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgbGV0IHtobCwgbm9kZSwgaWQsIF9pZCwgY29udGVudH0gPSBvcHRpb25zO1xyXG4gICAgaWQgPSBpZCB8fF9pZDtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgdGhpcy5obCA9IGhsO1xyXG4gICAgdGhpcy5ub2RlID0gbm9kZTtcclxuICAgIHRoaXMuY29udGVudCA9IGhsLmdldE5vZGVzQ29udGVudChub2RlKTtcclxuICAgIHRoaXMuZG9tID0gW107XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB0aGlzLl9pZCA9IGBua2MtaGwtaWQtJHtpZH1gO1xyXG4gICAgY29uc3Qge29mZnNldCwgbGVuZ3RofSA9IHRoaXMubm9kZTtcclxuICAgIGxldCB0YXJnZXROb3RlcyA9IHNlbGYuZ2V0Tm9kZXModGhpcy5obC5yb290LCBvZmZzZXQsIGxlbmd0aCk7XHJcbiAgICBpZihsZW5ndGggPT09IDAgfHwgIXRhcmdldE5vdGVzLmxlbmd0aCkge1xyXG4gICAgICAvLyDlpoLmnpxsZW5ndGjkuLow77yM6YKj5LmI5q2k6YCJ5Yy65a6a5L2N5Lii5aSxXHJcbiAgICAgIC8vIOWcqGhsLnJvb3TlkIznuqflkI7mj5LlhaXkuIDkuKpkaXZcclxuICAgICAgLy8g5bCG5Lii5aSx6YCJ5Yy655qE56yU6K6w6KOF5Zyo5q2kZGl26YeM77yM5bm25re75Yqg54K55Ye75LqL5Lu2XHJcbiAgICAgIGNvbnN0IHtyb290fSA9IGhsO1xyXG4gICAgICBsZXQge25leHRTaWJsaW5nLCBwYXJlbnROb2RlfSA9IHJvb3Q7XHJcbiAgICAgIGxldCBua2NGcmVlTm90ZXM7XHJcbiAgICAgIGlmKG5leHRTaWJsaW5nID09PSBudWxsKSB7XHJcbiAgICAgICAgbmtjRnJlZU5vdGVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBua2NGcmVlTm90ZXMuY2xhc3NMaXN0LmFkZChcIm5rYy1mcmVlLW5vdGVzXCIpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG5rY0ZyZWVOb3RlcyA9IG5leHRTaWJsaW5nO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IG5vdGVOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICAgIG5vdGVOb2RlLmlubmVyVGV4dCA9IGNvbnRlbnQ7XHJcblxyXG4gICAgICBua2NGcmVlTm90ZXMuYXBwZW5kQ2hpbGQobm90ZU5vZGUpO1xyXG4gICAgICBpZighbmV4dFNpYmxpbmcpIHtcclxuICAgICAgICBwYXJlbnROb2RlLmFwcGVuZENoaWxkKG5rY0ZyZWVOb3Rlcyk7XHJcbiAgICAgIH1cclxuICAgICAgdGFyZ2V0Tm90ZXMgPSBbbm90ZU5vZGVdO1xyXG4gICAgfVxyXG4gICAgLy8gY29uc3QgdGFyZ2V0Tm90ZXMgPSBzZWxmLmdldE5vZGVzKHRoaXMuaGwucm9vdCwgb2Zmc2V0LCBsZW5ndGgpO1xyXG4gICAgdGFyZ2V0Tm90ZXMubWFwKHRhcmdldE5vZGUgPT4ge1xyXG4gICAgICBpZighdGFyZ2V0Tm9kZS50ZXh0Q29udGVudC5sZW5ndGgpIHJldHVybjtcclxuICAgICAgY29uc3QgcGFyZW50Tm9kZSA9IHRhcmdldE5vZGUucGFyZW50Tm9kZTtcclxuICAgICAgaWYocGFyZW50Tm9kZS5jbGFzc0xpc3QuY29udGFpbnMoXCJua2MtaGxcIikpIHtcclxuICAgICAgICAvLyDlrZjlnKjpq5jkuq7ltYzlpZfnmoTpl67pophcclxuICAgICAgICAvLyDnkIbmg7PnirbmgIHkuIvvvIzmiYDmnInpgInljLrlpITkuo7lubPnuqfvvIzph43lkIjpg6jliIbooqvliIbpmpTvvIzku4Xmt7vliqDlpJrkuKpjbGFzc1xyXG4gICAgICAgIGxldCBwYXJlbnRzSWQgPSBwYXJlbnROb2RlLmdldEF0dHJpYnV0ZShcImRhdGEtbmtjLWhsLWlkXCIpO1xyXG4gICAgICAgIGlmKCFwYXJlbnRzSWQpIHJldHVybjtcclxuICAgICAgICBwYXJlbnRzSWQgPSBwYXJlbnRzSWQuc3BsaXQoXCItXCIpO1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZXMgPSBbXTtcclxuICAgICAgICBmb3IoY29uc3QgcGlkIG9mIHBhcmVudHNJZCkge1xyXG4gICAgICAgICAgc291cmNlcy5wdXNoKHNlbGYuaGwuZ2V0U291cmNlQnlJRChOdW1iZXIocGlkKSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yKGNvbnN0IG5vZGUgb2YgcGFyZW50Tm9kZS5jaGlsZE5vZGVzKSB7XHJcbiAgICAgICAgICBpZighbm9kZS50ZXh0Q29udGVudC5sZW5ndGgpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgY29uc3Qgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgICAgICAgc3Bhbi5jbGFzc05hbWUgPSBgbmtjLWhsYDtcclxuICAgICAgICAgIHNwYW4ub25tb3VzZW92ZXIgPSBwYXJlbnROb2RlLm9ubW91c2VvdmVyO1xyXG4gICAgICAgICAgc3Bhbi5vbm1vdXNlb3V0ID0gcGFyZW50Tm9kZS5vbm1vdXNlb3V0O1xyXG4gICAgICAgICAgc3Bhbi5vbmNsaWNrID0gcGFyZW50Tm9kZS5vbmNsaWNrO1xyXG4gICAgICAgICAgc291cmNlcy5tYXAocyA9PiB7XHJcbiAgICAgICAgICAgIHMuZG9tLnB1c2goc3Bhbik7XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAvLyDmlrDpgInljLpcclxuICAgICAgICAgIGlmKG5vZGUgPT09IHRhcmdldE5vZGUpIHtcclxuICAgICAgICAgICAgLy8g5aaC5p6c5paw6YCJ5Yy65a6M5YWo6KaG55uW5LiK5bGC6YCJ5Yy677yM5YiZ5L+d55WZ5LiK5bGC6YCJ5Yy655qE5LqL5Lu277yM5ZCm5YiZ5re75Yqg5paw6YCJ5Yy655u45YWz5LqL5Lu2XHJcbiAgICAgICAgICAgIGlmKHBhcmVudE5vZGUuY2hpbGROb2Rlcy5sZW5ndGggIT09IDEgfHwgdGFyZ2V0Tm90ZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgc3Bhbi5vbm1vdXNlb3ZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5obC5lbWl0KHNlbGYuaGwuZXZlbnROYW1lcy5ob3Zlciwgc2VsZik7XHJcbiAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICBzcGFuLm9ubW91c2VvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaGwuZW1pdChzZWxmLmhsLmV2ZW50TmFtZXMuaG92ZXJPdXQsIHNlbGYpO1xyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgc3Bhbi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmNsaWNrLCBzZWxmKTtcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIOimhuebluWMuuWfn+a3u+WKoGNsYXNzIG5rYy1obC1jb3ZlclxyXG4gICAgICAgICAgICBzcGFuLmNsYXNzTmFtZSArPSBgIG5rYy1obC1jb3ZlcmA7XHJcbiAgICAgICAgICAgIHNwYW4uc2V0QXR0cmlidXRlKGBkYXRhLW5rYy1obC1pZGAsIHBhcmVudHNJZC5jb25jYXQoW3NlbGYuaWRdKS5qb2luKFwiLVwiKSk7XHJcbiAgICAgICAgICAgIHNlbGYuZG9tLnB1c2goc3Bhbik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzcGFuLnNldEF0dHJpYnV0ZShgZGF0YS1ua2MtaGwtaWRgLCBwYXJlbnRzSWQuam9pbihcIi1cIikpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc3Bhbi5hcHBlbmRDaGlsZChub2RlLmNsb25lTm9kZShmYWxzZSkpO1xyXG4gICAgICAgICAgcGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoc3Bhbiwgbm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNvdXJjZXMubWFwKHMgPT4ge1xyXG4gICAgICAgICAgY29uc3QgcGFyZW50SW5kZXggPSBzLmRvbS5pbmRleE9mKHBhcmVudE5vZGUpO1xyXG4gICAgICAgICAgaWYocGFyZW50SW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHMuZG9tLnNwbGljZShwYXJlbnRJbmRleCwgMSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8g5riF6Zmk5LiK5bGC6YCJ5Yy6ZG9t55qE55u45YWz5LqL5Lu25ZKMY2xhc3NcclxuICAgICAgICAvLyBwYXJlbnROb2RlLmNsYXNzTGlzdC5yZW1vdmUoYG5rYy1obGAsIHNvdXJjZS5faWQsIGBua2MtaGwtY292ZXJgKTtcclxuICAgICAgICAvLyBwYXJlbnROb2RlLmNsYXNzTmFtZSA9IFwiXCI7XHJcbiAgICAgICAgcGFyZW50Tm9kZS5vbm1vdXNlb3V0ID0gbnVsbDtcclxuICAgICAgICBwYXJlbnROb2RlLm9ubW91c2VvdmVyID0gbnVsbDtcclxuICAgICAgICBwYXJlbnROb2RlLm9uY2xpY2sgPSBudWxsO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIOWFqOaWsOmAieWMuiDml6Dopobnm5bnmoTmg4XlhrVcclxuICAgICAgICBjb25zdCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcblxyXG4gICAgICAgIHNwYW4uY2xhc3NMaXN0LmFkZChcIm5rYy1obFwiKTtcclxuICAgICAgICBzcGFuLnNldEF0dHJpYnV0ZShcImRhdGEtbmtjLWhsLWlkXCIsIHNlbGYuaWQpO1xyXG5cclxuICAgICAgICBzcGFuLm9ubW91c2VvdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmhvdmVyLCBzZWxmKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHNwYW4ub25tb3VzZW91dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgc2VsZi5obC5lbWl0KHNlbGYuaGwuZXZlbnROYW1lcy5ob3Zlck91dCwgc2VsZik7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBzcGFuLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHNlbGYuaGwuZW1pdChzZWxmLmhsLmV2ZW50TmFtZXMuY2xpY2ssIHNlbGYpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHNlbGYuZG9tLnB1c2goc3Bhbik7XHJcbiAgICAgICAgc3Bhbi5hcHBlbmRDaGlsZCh0YXJnZXROb2RlLmNsb25lTm9kZSh0cnVlKSk7XHJcbiAgICAgICAgdGFyZ2V0Tm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChzcGFuLCB0YXJnZXROb2RlKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICB0aGlzLmhsLnNvdXJjZXMucHVzaCh0aGlzKTtcclxuICAgIHRoaXMuaGwuZW1pdCh0aGlzLmhsLmV2ZW50TmFtZXMuY3JlYXRlLCB0aGlzKTtcclxuICB9XHJcbiAgYWRkQ2xhc3Moa2xhc3MpIHtcclxuICAgIGNvbnN0IHtkb219ID0gdGhpcztcclxuICAgIGRvbS5tYXAoZCA9PiB7XHJcbiAgICAgIGQuY2xhc3NMaXN0LmFkZChrbGFzcyk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgcmVtb3ZlQ2xhc3Moa2xhc3MpIHtcclxuICAgIGNvbnN0IHtkb219ID0gdGhpcztcclxuICAgIGRvbS5tYXAoZCA9PiB7XHJcbiAgICAgIGQuY2xhc3NMaXN0LnJlbW92ZShrbGFzcyk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgZGVzdHJveSgpIHtcclxuICAgIHRoaXMuZG9tLm1hcChkID0+IHtcclxuICAgICAgZC5jbGFzc05hbWUgPSBcIlwiO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGdldFNvdXJjZXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zb3VyY2VzO1xyXG4gIH1cclxuICBnZXROb2RlcyhwYXJlbnQsIG9mZnNldCwgbGVuZ3RoKSB7XHJcbiAgICBjb25zdCBub2RlU3RhY2sgPSBbcGFyZW50XTtcclxuICAgIGxldCBjdXJPZmZzZXQgPSAwO1xyXG4gICAgbGV0IG5vZGUgPSBudWxsO1xyXG4gICAgbGV0IGN1ckxlbmd0aCA9IGxlbmd0aDtcclxuICAgIGxldCBub2RlcyA9IFtdO1xyXG4gICAgbGV0IHN0YXJ0ZWQgPSBmYWxzZTtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgd2hpbGUoISEobm9kZSA9IG5vZGVTdGFjay5wb3AoKSkpIHtcclxuICAgICAgY29uc3QgY2hpbGRyZW4gPSBub2RlLmNoaWxkTm9kZXM7XHJcbiAgICAgIC8vIGxvb3A6XHJcbiAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICBpZihzZWxmLmhsLmlzQ2xvd24obm9kZSkpIGNvbnRpbnVlO1xyXG4gICAgICAgIC8qaWYobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xyXG4gICAgICAgICAgY29uc3QgY2wgPSBub2RlLmNsYXNzTGlzdDtcclxuICAgICAgICAgIGZvcihjb25zdCBjIG9mIHNlbGYuaGwuZXhjbHVkZWRFbGVtZW50Q2xhc3MpIHtcclxuICAgICAgICAgICAgaWYoY2wuY29udGFpbnMoYykpIHtcclxuICAgICAgICAgICAgICBjb250aW51ZSBsb29wO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCBlbGVtZW50VGFnTmFtZSA9IG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgaWYoc2VsZi5obC5leGNsdWRlZEVsZW1lbnRUYWdOYW1lLmluY2x1ZGVzKGVsZW1lbnRUYWdOYW1lKSkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9Ki9cclxuICAgICAgICBub2RlU3RhY2sucHVzaChub2RlKTtcclxuICAgICAgfVxyXG4gICAgICBpZihub2RlLm5vZGVUeXBlID09PSAzICYmIG5vZGUudGV4dENvbnRlbnQubGVuZ3RoKSB7XHJcbiAgICAgICAgY3VyT2Zmc2V0ICs9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoO1xyXG4gICAgICAgIGlmKGN1ck9mZnNldCA+IG9mZnNldCkge1xyXG4gICAgICAgICAgaWYoY3VyTGVuZ3RoIDw9IDApIGJyZWFrO1xyXG4gICAgICAgICAgbGV0IHN0YXJ0T2Zmc2V0O1xyXG4gICAgICAgICAgaWYoIXN0YXJ0ZWQpIHtcclxuICAgICAgICAgICAgc3RhcnRPZmZzZXQgPSBub2RlLnRleHRDb250ZW50Lmxlbmd0aCAtIChjdXJPZmZzZXQgLSBvZmZzZXQpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3RhcnRPZmZzZXQgPSAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc3RhcnRlZCA9IHRydWU7XHJcbiAgICAgICAgICBsZXQgbmVlZExlbmd0aDtcclxuICAgICAgICAgIGlmKGN1ckxlbmd0aCA8PSBub2RlLnRleHRDb250ZW50Lmxlbmd0aCAtIHN0YXJ0T2Zmc2V0KSB7XHJcbiAgICAgICAgICAgIG5lZWRMZW5ndGggPSBjdXJMZW5ndGg7XHJcbiAgICAgICAgICAgIGN1ckxlbmd0aCA9IDA7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBuZWVkTGVuZ3RoID0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSBzdGFydE9mZnNldDtcclxuICAgICAgICAgICAgY3VyTGVuZ3RoIC09IG5lZWRMZW5ndGg7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBub2Rlcy5wdXNoKHtcclxuICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgc3RhcnRPZmZzZXQsXHJcbiAgICAgICAgICAgIG5lZWRMZW5ndGhcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgbm9kZXMgPSBub2Rlcy5tYXAob2JqID0+IHtcclxuICAgICAgbGV0IHtub2RlLCBzdGFydE9mZnNldCwgbmVlZExlbmd0aH0gPSBvYmo7XHJcbiAgICAgIGlmKHN0YXJ0T2Zmc2V0ID4gMCkge1xyXG4gICAgICAgIG5vZGUgPSBub2RlLnNwbGl0VGV4dChzdGFydE9mZnNldCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYobm9kZS50ZXh0Q29udGVudC5sZW5ndGggIT09IG5lZWRMZW5ndGgpIHtcclxuICAgICAgICBub2RlLnNwbGl0VGV4dChuZWVkTGVuZ3RoKTsgIFxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBub2RlO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbm9kZXM7XHJcbiAgfVxyXG59O1xyXG5cclxud2luZG93Lk5LQ0hpZ2hsaWdodGVyID0gY2xhc3Mge1xyXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgIGNvbnN0IHtcclxuICAgICAgcm9vdEVsZW1lbnRJZCwgZXhjbHVkZWRFbGVtZW50Q2xhc3MgPSBbXSxcclxuICAgICAgZXhjbHVkZWRFbGVtZW50VGFnTmFtZSA9IFtdLFxyXG5cclxuICAgICAgY2xvd25DbGFzcyA9IFtdLCBjbG93bkF0dHIgPSBbXSwgY2xvd25UYWdOYW1lID0gW11cclxuICAgIH0gPSBvcHRpb25zO1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLnJvb3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChyb290RWxlbWVudElkKTtcclxuICAgIHNlbGYuZXhjbHVkZWRFbGVtZW50Q2xhc3MgPSBleGNsdWRlZEVsZW1lbnRDbGFzcztcclxuICAgIHNlbGYuZXhjbHVkZWRFbGVtZW50VGFnTmFtZSA9IGV4Y2x1ZGVkRWxlbWVudFRhZ05hbWU7XHJcblxyXG4gICAgc2VsZi5jbG93bkNsYXNzID0gY2xvd25DbGFzcztcclxuICAgIHNlbGYuY2xvd25BdHRyID0gY2xvd25BdHRyO1xyXG4gICAgc2VsZi5jbG93blRhZ05hbWUgPSBjbG93blRhZ05hbWU7XHJcblxyXG5cclxuICAgIHNlbGYucmFuZ2UgPSB7fTtcclxuICAgIHNlbGYuc291cmNlcyA9IFtdO1xyXG4gICAgc2VsZi5ldmVudHMgPSB7fTtcclxuICAgIHNlbGYuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIHNlbGYuZXZlbnROYW1lcyA9IHtcclxuICAgICAgY3JlYXRlOiBcImNyZWF0ZVwiLFxyXG4gICAgICBob3ZlcjogXCJob3ZlclwiLFxyXG4gICAgICBob3Zlck91dDogXCJob3Zlck91dFwiLFxyXG4gICAgICBzZWxlY3Q6IFwic2VsZWN0XCJcclxuICAgIH07XHJcblxyXG4gICAgbGV0IGludGVydmFsO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKCkgPT4ge1xyXG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJzZWxlY3Rpb25jaGFuZ2VcIiwgKCkgPT4ge1xyXG4gICAgICBzZWxmLnJhbmdlID0ge307XHJcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xyXG5cclxuICAgICAgaW50ZXJ2YWwgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBzZWxmLmluaXRFdmVudCgpO1xyXG4gICAgICB9LCA1MDApO1xyXG4gICAgfSk7XHJcblxyXG5cclxuICB9XHJcbiAgaW5pdEV2ZW50KCkge1xyXG4gICAgdHJ5e1xyXG4gICAgICAvLyDlsY/olL3liJLor43kuovku7ZcclxuICAgICAgaWYodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xyXG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0UmFuZ2UoKTtcclxuICAgICAgaWYoIXJhbmdlIHx8IHJhbmdlLmNvbGxhcHNlZCkgcmV0dXJuO1xyXG4gICAgICBpZihcclxuICAgICAgICByYW5nZS5zdGFydENvbnRhaW5lciA9PT0gdGhpcy5yYW5nZS5zdGFydENvbnRhaW5lciAmJlxyXG4gICAgICAgIHJhbmdlLmVuZENvbnRhaW5lciA9PT0gdGhpcy5yYW5nZS5lbmRDb250YWluZXIgJiZcclxuICAgICAgICByYW5nZS5zdGFydE9mZnNldCA9PT0gdGhpcy5yYW5nZS5zdGFydE9mZnNldCAmJlxyXG4gICAgICAgIHJhbmdlLmVuZE9mZnNldCA9PT0gdGhpcy5yYW5nZS5lbmRPZmZzZXRcclxuICAgICAgKSByZXR1cm47XHJcbiAgICAgIC8vIOmZkOWItumAieaLqeaWh+Wtl+eahOWMuuWfn++8jOWPquiDveaYr3Jvb3TkuIvnmoTpgInljLpcclxuICAgICAgaWYoIXRoaXMuY29udGFpbnMocmFuZ2Uuc3RhcnRDb250YWluZXIpIHx8ICF0aGlzLmNvbnRhaW5zKHJhbmdlLmVuZENvbnRhaW5lcikpIHJldHVybjtcclxuICAgICAgdGhpcy5yYW5nZSA9IHJhbmdlO1xyXG4gICAgICB0aGlzLmVtaXQodGhpcy5ldmVudE5hbWVzLnNlbGVjdCwge1xyXG4gICAgICAgIHJhbmdlXHJcbiAgICAgIH0pO1xyXG4gICAgfSBjYXRjaChlcnIpIHtcclxuICAgICAgY29uc29sZS5sb2coZXJyLm1lc3NhZ2UgfHwgZXJyKTtcclxuICAgIH1cclxuICB9XHJcbiAgY29udGFpbnMobm9kZSkge1xyXG4gICAgd2hpbGUoKG5vZGUgPSBub2RlLnBhcmVudE5vZGUpKSB7XHJcbiAgICAgIGlmKG5vZGUgPT09IHRoaXMucm9vdCkgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIGdldFBhcmVudChzZWxmLCBkKSB7XHJcbiAgICBpZihkID09PSBzZWxmLnJvb3QpIHJldHVybjtcclxuICAgIGlmKHRoaXMuaXNDbG93bihkKSkgdGhyb3cgbmV3ICBFcnJvcihcIuWIkuivjei2iueVjFwiKTtcclxuICAgIGlmKGQucGFyZW50Tm9kZSkgc2VsZi5nZXRQYXJlbnQoc2VsZiwgZC5wYXJlbnROb2RlKTtcclxuICB9XHJcbiAgZ2V0UmFuZ2UoKSB7XHJcbiAgICB0cnl7XHJcbiAgICAgIGNvbnN0IHJhbmdlID0gd2luZG93LmdldFNlbGVjdGlvbigpLmdldFJhbmdlQXQoMCk7XHJcbiAgICAgIGNvbnN0IHtzdGFydE9mZnNldCwgZW5kT2Zmc2V0LCBzdGFydENvbnRhaW5lciwgZW5kQ29udGFpbmVyfSA9IHJhbmdlO1xyXG4gICAgICB0aGlzLmdldFBhcmVudCh0aGlzLCBzdGFydENvbnRhaW5lcik7XHJcbiAgICAgIHRoaXMuZ2V0UGFyZW50KHRoaXMsIGVuZENvbnRhaW5lcik7XHJcbiAgICAgIGNvbnN0IG5vZGVzID0gdGhpcy5maW5kTm9kZXMoc3RhcnRDb250YWluZXIsIGVuZENvbnRhaW5lcik7XHJcbiAgICAgIG5vZGVzLm1hcChub2RlID0+IHtcclxuICAgICAgICB0aGlzLmdldFBhcmVudCh0aGlzLCBub2RlKTtcclxuICAgICAgfSk7XHJcbiAgICAgIGlmKHN0YXJ0T2Zmc2V0ID09PSBlbmRPZmZzZXQgJiYgc3RhcnRDb250YWluZXIgPT09IGVuZENvbnRhaW5lcikgcmV0dXJuO1xyXG4gICAgICByZXR1cm4gcmFuZ2U7XHJcbiAgICB9IGNhdGNoKGVycikge1xyXG4gICAgICBjb25zb2xlLmxvZyhlcnIubWVzc2FnZSB8fCBlcnIpO1xyXG4gICAgfVxyXG4gIH1cclxuICBkZXN0cm95KHNvdXJjZSkge1xyXG4gICAgaWYodHlwZW9mIHNvdXJjZSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICBzb3VyY2UgPSB0aGlzLmdldFNvdXJjZUJ5SUQoc291cmNlKTtcclxuICAgIH1cclxuICAgIHNvdXJjZS5kZXN0cm95KCk7XHJcbiAgfVxyXG4gIHJlc3RvcmVTb3VyY2VzKHNvdXJjZXMgPSBbXSkge1xyXG4gICAgZm9yKGNvbnN0IHNvdXJjZSBvZiBzb3VyY2VzKSB7XHJcbiAgICAgIHNvdXJjZS5obCA9IHRoaXM7XHJcbiAgICAgIG5ldyBTb3VyY2Uoc291cmNlKTtcclxuICAgIH1cclxuICB9XHJcbiAgZ2V0Tm9kZXMocmFuZ2UpIHtcclxuICAgIGNvbnN0IHtzdGFydENvbnRhaW5lciwgZW5kQ29udGFpbmVyLCBzdGFydE9mZnNldCwgZW5kT2Zmc2V0fSA9IHJhbmdlO1xyXG4gICAgLy8gaWYoc3RhcnRPZmZzZXQgPT09IGVuZE9mZnNldCkgcmV0dXJuO1xyXG4gICAgbGV0IHNlbGVjdGVkTm9kZXMgPSBbXSwgc3RhcnROb2RlLCBlbmROb2RlO1xyXG4gICAgLy8gaWYoc3RhcnRDb250YWluZXIubm9kZVR5cGUgIT09IDMgfHwgc3RhcnRDb250YWluZXIubm9kZVR5cGUgIT09IDMpIHJldHVybjtcclxuICAgIGlmKHN0YXJ0Q29udGFpbmVyID09PSBlbmRDb250YWluZXIpIHtcclxuICAgICAgLy8g55u45ZCM6IqC54K5XHJcbiAgICAgIHN0YXJ0Tm9kZSA9IHN0YXJ0Q29udGFpbmVyO1xyXG4gICAgICBlbmROb2RlID0gc3RhcnROb2RlO1xyXG4gICAgICBzZWxlY3RlZE5vZGVzLnB1c2goe1xyXG4gICAgICAgIG5vZGU6IHN0YXJ0Tm9kZSxcclxuICAgICAgICBvZmZzZXQ6IHN0YXJ0T2Zmc2V0LFxyXG4gICAgICAgIGxlbmd0aDogZW5kT2Zmc2V0IC0gc3RhcnRPZmZzZXRcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzdGFydE5vZGUgPSBzdGFydENvbnRhaW5lcjtcclxuICAgICAgZW5kTm9kZSA9IGVuZENvbnRhaW5lcjtcclxuICAgICAgLy8g5b2T6LW35aeL6IqC54K55LiN5Li65paH5pys6IqC54K55pe277yM5peg6ZyA5o+S5YWl6LW35aeL6IqC54K5XHJcbiAgICAgIC8vIOWcqOiOt+WPluWtkOiKgueCueaXtuS8muWwhuaPkuWFpei1t+Wni+iKgueCueeahOWtkOiKgueCue+8jOWmguaenOi/memHjOS4jeWBmuWIpOaWre+8jOS8muWHuueOsOi1t+Wni+iKgueCueWGheWuuemHjeWkjeeahOmXrumimOOAglxyXG4gICAgICBpZihzdGFydE5vZGUubm9kZVR5cGUgPT09IDMpIHtcclxuICAgICAgICBzZWxlY3RlZE5vZGVzLnB1c2goe1xyXG4gICAgICAgICAgbm9kZTogc3RhcnROb2RlLFxyXG4gICAgICAgICAgb2Zmc2V0OiBzdGFydE9mZnNldCxcclxuICAgICAgICAgIGxlbmd0aDogc3RhcnROb2RlLnRleHRDb250ZW50Lmxlbmd0aCAtIHN0YXJ0T2Zmc2V0XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3Qgbm9kZXMgPSB0aGlzLmZpbmROb2RlcyhzdGFydE5vZGUsIGVuZE5vZGUpO1xyXG4gICAgICBmb3IoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xyXG4gICAgICAgIHNlbGVjdGVkTm9kZXMucHVzaCh7XHJcbiAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgb2Zmc2V0OiAwLFxyXG4gICAgICAgICAgbGVuZ3RoOiBub2RlLnRleHRDb250ZW50Lmxlbmd0aFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIHNlbGVjdGVkTm9kZXMucHVzaCh7XHJcbiAgICAgICAgbm9kZTogZW5kTm9kZSxcclxuICAgICAgICBvZmZzZXQ6IDAsXHJcbiAgICAgICAgbGVuZ3RoOiBlbmRPZmZzZXRcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgbm9kZXMgPSBbXTtcclxuICAgIGZvcihjb25zdCBvYmogb2Ygc2VsZWN0ZWROb2Rlcykge1xyXG4gICAgICBjb25zdCB7bm9kZSwgb2Zmc2V0LCBsZW5ndGh9ID0gb2JqO1xyXG4gICAgICBjb25zdCBjb250ZW50ID0gbm9kZS50ZXh0Q29udGVudC5zbGljZShvZmZzZXQsIG9mZnNldCArIGxlbmd0aCk7XHJcbiAgICAgIGNvbnN0IG9mZnNldF8gPSB0aGlzLmdldE9mZnNldChub2RlKTtcclxuICAgICAgbm9kZXMucHVzaCh7XHJcbiAgICAgICAgY29udGVudCxcclxuICAgICAgICBvZmZzZXQ6IG9mZnNldF8gKyBvZmZzZXQsXHJcbiAgICAgICAgbGVuZ3RoXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgaWYoIW5vZGVzLmxlbmd0aCkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgbGV0IGNvbnRlbnQgPSBcIlwiLCAgb2Zmc2V0ID0gMCwgbGVuZ3RoID0gMDtcclxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgIGNvbnRlbnQgKz0gbm9kZS5jb250ZW50O1xyXG4gICAgICBsZW5ndGggKz0gbm9kZS5sZW5ndGg7XHJcbiAgICAgIGlmKGkgPT09IDApIG9mZnNldCA9IG5vZGUub2Zmc2V0O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbnRlbnQsXHJcbiAgICAgIG9mZnNldCxcclxuICAgICAgbGVuZ3RoXHJcbiAgICB9XHJcbiAgfVxyXG4gIGdldE5vZGVzQ29udGVudChub2RlKSB7XHJcbiAgICByZXR1cm4gbm9kZS5jb250ZW50O1xyXG4gIH1cclxuICBjcmVhdGVTb3VyY2UoaWQsIG5vZGUpIHtcclxuICAgIHJldHVybiBuZXcgU291cmNlKHtcclxuICAgICAgaGw6IHRoaXMsXHJcbiAgICAgIGlkLFxyXG4gICAgICBub2RlLFxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGdldFNvdXJjZUJ5SUQoaWQpIHtcclxuICAgIGZvcihjb25zdCBzIG9mIHRoaXMuc291cmNlcykge1xyXG4gICAgICBpZihzLmlkID09PSBpZCkgcmV0dXJuIHM7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGFkZENsYXNzKGlkLCBjbGFzc05hbWUpIHtcclxuICAgIGxldCBzb3VyY2U7XHJcbiAgICBpZih0eXBlb2YgaWQgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgc291cmNlID0gdGhpcy5nZXRTb3VyY2VCeUlEKGlkKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNvdXJjZSA9IGlkO1xyXG4gICAgfVxyXG4gICAgc291cmNlLmFkZENsYXNzKGNsYXNzTmFtZSk7XHJcbiAgfVxyXG4gIHJlbW92ZUNsYXNzKGlkLCBjbGFzc05hbWUpIHtcclxuICAgIGxldCBzb3VyY2U7XHJcbiAgICBpZih0eXBlb2YgaWQgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgc291cmNlID0gdGhpcy5nZXRTb3VyY2VCeUlEKGlkKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNvdXJjZSA9IGlkO1xyXG4gICAgfVxyXG4gICAgc291cmNlLnJlbW92ZUNsYXNzKGNsYXNzTmFtZSk7XHJcbiAgfVxyXG4gIGdldE9mZnNldCh0ZXh0KSB7XHJcbiAgICBjb25zdCBub2RlU3RhY2sgPSBbdGhpcy5yb290XTtcclxuICAgIGxldCBjdXJOb2RlID0gbnVsbDtcclxuICAgIGxldCBvZmZzZXQgPSAwO1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICB3aGlsZSAoISEoY3VyTm9kZSA9IG5vZGVTdGFjay5wb3AoKSkpIHtcclxuICAgICAgY29uc3QgY2hpbGRyZW4gPSBjdXJOb2RlLmNoaWxkTm9kZXM7XHJcbiAgICAgIC8vIGxvb3A6XHJcbiAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICBpZihzZWxmLmlzQ2xvd24obm9kZSkpIGNvbnRpbnVlO1xyXG4gICAgICAgIG5vZGVTdGFjay5wdXNoKG5vZGUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoY3VyTm9kZS5ub2RlVHlwZSA9PT0gMyAmJiBjdXJOb2RlICE9PSB0ZXh0KSB7XHJcbiAgICAgICAgb2Zmc2V0ICs9IGN1ck5vZGUudGV4dENvbnRlbnQubGVuZ3RoO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGN1ck5vZGUubm9kZVR5cGUgPT09IDMpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9mZnNldDtcclxuICB9XHJcbiAgZmluZE5vZGVzKHN0YXJ0Tm9kZSwgZW5kTm9kZSkge1xyXG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlcyA9IFtdO1xyXG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5nZXRTYW1lUGFyZW50Tm9kZShzdGFydE5vZGUsIGVuZE5vZGUpO1xyXG4gICAgaWYocGFyZW50KSB7XHJcbiAgICAgIGxldCBzdGFydCA9IGZhbHNlLCBlbmQgPSBmYWxzZTtcclxuICAgICAgY29uc3QgZ2V0Q2hpbGROb2RlID0gKG5vZGUpID0+IHtcclxuICAgICAgICBpZighbm9kZS5oYXNDaGlsZE5vZGVzKCkpIHJldHVybjtcclxuICAgICAgICBmb3IoY29uc3QgbiBvZiBub2RlLmNoaWxkTm9kZXMpIHtcclxuICAgICAgICAgIGlmKGVuZCB8fCBuID09PSBlbmROb2RlKSB7XHJcbiAgICAgICAgICAgIGVuZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH0gZWxzZSBpZihzdGFydCAmJiBuLm5vZGVUeXBlID09PSAzKSB7XHJcbiAgICAgICAgICAgIHNlbGVjdGVkTm9kZXMucHVzaChuKTtcclxuICAgICAgICAgIH0gZWxzZSBpZihuID09PSBzdGFydE5vZGUpIHtcclxuICAgICAgICAgICAgc3RhcnQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZ2V0Q2hpbGROb2RlKG4pO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgZ2V0Q2hpbGROb2RlKHBhcmVudCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc2VsZWN0ZWROb2RlcztcclxuICB9XHJcbiAgaXNDbG93bihub2RlKSB7XHJcbiAgICAvLyDliKTmlq1ub2Rl5piv5ZCm6ZyA6KaB5o6S6ZmkXHJcbiAgICBpZihub2RlLm5vZGVUeXBlID09PSAxKSB7XHJcbiAgICAgIGNvbnN0IGNsID0gbm9kZS5jbGFzc0xpc3Q7XHJcbiAgICAgIGZvcihjb25zdCBjIG9mIHRoaXMuY2xvd25DbGFzcykge1xyXG4gICAgICAgIGlmKGNsLmNvbnRhaW5zKGMpKSB7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgZWxlbWVudFRhZ05hbWUgPSBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcclxuICAgICAgaWYodGhpcy5jbG93blRhZ05hbWUuaW5jbHVkZXMoZWxlbWVudFRhZ05hbWUpKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgZm9yKGNvbnN0IGtleSBpbiB0aGlzLmNsb3duQXR0cikge1xyXG4gICAgICAgIGlmKCF0aGlzLmNsb3duQXR0ci5oYXNPd25Qcm9wZXJ0eShrZXkpKSBjb250aW51ZTtcclxuICAgICAgICBpZihub2RlLmdldEF0dHJpYnV0ZShrZXkpID09PSB0aGlzLmNsb3duQXR0cltrZXldKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBnZXRTYW1lUGFyZW50Tm9kZShzdGFydE5vZGUsIGVuZE5vZGUpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgaWYoIWVuZE5vZGUgfHwgc3RhcnROb2RlID09PSBlbmROb2RlKSByZXR1cm4gc3RhcnROb2RlLnBhcmVudE5vZGU7XHJcbiAgICBjb25zdCBzdGFydE5vZGVzID0gW10sIGVuZE5vZGVzID0gW107XHJcbiAgICBjb25zdCBnZXRQYXJlbnQgPSAobm9kZSwgbm9kZXMpID0+IHtcclxuICAgICAgbm9kZXMucHVzaChub2RlKTtcclxuICAgICAgaWYobm9kZSAhPT0gc2VsZi5yb290ICYmIG5vZGUucGFyZW50Tm9kZSkge1xyXG4gICAgICAgIGdldFBhcmVudChub2RlLnBhcmVudE5vZGUsIG5vZGVzKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGdldFBhcmVudChzdGFydE5vZGUsIHN0YXJ0Tm9kZXMpO1xyXG4gICAgZ2V0UGFyZW50KGVuZE5vZGUsIGVuZE5vZGVzKTtcclxuICAgIGxldCBwYXJlbnQ7XHJcbiAgICBmb3IoY29uc3Qgbm9kZSBvZiBzdGFydE5vZGVzKSB7XHJcbiAgICAgIGlmKGVuZE5vZGVzLmluY2x1ZGVzKG5vZGUpKSB7XHJcbiAgICAgICAgcGFyZW50ID0gbm9kZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhcmVudDtcclxuICB9XHJcbiAgZ2V0U291cmNlQnlJZChpZCkge1xyXG4gICAgZm9yKGNvbnN0IHMgb2YgdGhpcy5zb3VyY2VzKSB7XHJcbiAgICAgIGlmKHMuaWQgPT09IGlkKSB7XHJcbiAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgb2Zmc2V0KG5vZGUpIHtcclxuICAgIGxldCB0b3AgPSAwLCBsZWZ0ID0gMCwgX3Bvc2l0aW9uO1xyXG5cclxuICAgIGNvbnN0IGdldE9mZnNldCA9IChuLCBpbml0KSA9PiB7XHJcbiAgICAgIGlmKG4ubm9kZVR5cGUgIT09IDEpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgX3Bvc2l0aW9uID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUobilbJ3Bvc2l0aW9uJ107XHJcblxyXG4gICAgICBpZiAodHlwZW9mKGluaXQpID09PSAndW5kZWZpbmVkJyAmJiBfcG9zaXRpb24gPT09ICdzdGF0aWMnKSB7XHJcbiAgICAgICAgZ2V0T2Zmc2V0KG4ucGFyZW50Tm9kZSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0b3AgPSBuLm9mZnNldFRvcCArIHRvcCAtIG4uc2Nyb2xsVG9wO1xyXG4gICAgICBsZWZ0ID0gbi5vZmZzZXRMZWZ0ICsgbGVmdCAtIG4uc2Nyb2xsTGVmdDtcclxuXHJcbiAgICAgIGlmIChfcG9zaXRpb24gPT09ICdmaXhlZCcpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgZ2V0T2Zmc2V0KG4ucGFyZW50Tm9kZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGdldE9mZnNldChub2RlLCB0cnVlKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0b3AsIGxlZnRcclxuICAgIH07XHJcbiAgfVxyXG4gIGdldFN0YXJ0Tm9kZU9mZnNldChyYW5nZSkge1xyXG4gICAgLy8g5Zyo6YCJ5Yy66LW35aeL5aSE5o+S5YWlc3BhblxyXG4gICAgLy8g6I635Y+Wc3BhbueahOS9jee9ruS/oeaBr1xyXG4gICAgLy8g56e76Zmkc3BhblxyXG4gICAgbGV0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgIC8vIHNwYW4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgc3Bhbi5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIjtcclxuICAgIHNwYW4uc3R5bGUudmVydGljYWxBbGlnbiA9IFwidG9wXCI7XHJcbiAgICByYW5nZS5pbnNlcnROb2RlKHNwYW4pO1xyXG4gICAgY29uc3QgcGFyZW50Tm9kZSA9IHNwYW4ucGFyZW50Tm9kZTtcclxuICAgIHNwYW4uc3R5bGUud2lkdGggPSBcIjMwcHhcIjtcclxuICAgIGNvbnN0IG9mZnNldCA9IHRoaXMub2Zmc2V0KHNwYW4pO1xyXG4gICAgcGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzcGFuKTtcclxuICAgIHJldHVybiBvZmZzZXQ7XHJcbiAgfVxyXG4gIGxvY2soKSB7XHJcbiAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuICB9XHJcbiAgdW5sb2NrKCkge1xyXG4gICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gIH1cclxuICBvbihldmVudE5hbWUsIGNhbGxiYWNrKSB7XHJcbiAgICBpZighdGhpcy5ldmVudHNbZXZlbnROYW1lXSkge1xyXG4gICAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdID0gW107XHJcbiAgICB9XHJcbiAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdLnB1c2goY2FsbGJhY2spO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG4gIGVtaXQoZXZlbnROYW1lLCBkYXRhKSB7XHJcbiAgICAodGhpcy5ldmVudHNbZXZlbnROYW1lXSB8fCBbXSkubWFwKGZ1bmMgPT4ge1xyXG4gICAgICBmdW5jKGRhdGEpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59O1xyXG4iXX0=
