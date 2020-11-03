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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL05LQ0hpZ2hsaWdodGVyL05LQ0hpZ2hsaWdodGVyLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7O0FDQUE7Ozs7Ozs7QUFPQSxNQUFNLENBQUMsTUFBUDtBQUNFLGtCQUFZLE9BQVosRUFBcUI7QUFBQTs7QUFBQSxRQUNkLEVBRGMsR0FDZ0IsT0FEaEIsQ0FDZCxFQURjO0FBQUEsUUFDVixJQURVLEdBQ2dCLE9BRGhCLENBQ1YsSUFEVTtBQUFBLFFBQ0osRUFESSxHQUNnQixPQURoQixDQUNKLEVBREk7QUFBQSxRQUNBLEdBREEsR0FDZ0IsT0FEaEIsQ0FDQSxHQURBO0FBQUEsUUFDSyxPQURMLEdBQ2dCLE9BRGhCLENBQ0ssT0FETDtBQUVuQixJQUFBLEVBQUUsR0FBRyxFQUFFLElBQUcsR0FBVjtBQUNBLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxTQUFLLEVBQUwsR0FBVSxFQUFWO0FBQ0EsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFNBQUssT0FBTCxHQUFlLEVBQUUsQ0FBQyxlQUFILENBQW1CLElBQW5CLENBQWY7QUFDQSxTQUFLLEdBQUwsR0FBVyxFQUFYO0FBQ0EsU0FBSyxFQUFMLEdBQVUsRUFBVjtBQUNBLFNBQUssR0FBTCx1QkFBd0IsRUFBeEI7QUFUbUIscUJBVU0sS0FBSyxJQVZYO0FBQUEsUUFVWixNQVZZLGNBVVosTUFWWTtBQUFBLFFBVUosTUFWSSxjQVVKLE1BVkk7QUFXbkIsUUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxLQUFLLEVBQUwsQ0FBUSxJQUF0QixFQUE0QixNQUE1QixFQUFvQyxNQUFwQyxDQUFsQjs7QUFDQSxRQUFHLE1BQU0sS0FBSyxDQUFYLElBQWdCLENBQUMsV0FBVyxDQUFDLE1BQWhDLEVBQXdDO0FBQ3RDO0FBQ0E7QUFDQTtBQUhzQyxVQUkvQixJ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R0Q7QUExV0g7O0FBQUE7QUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qIFxyXG4gIGV2ZW50czpcclxuICAgIHNlbGVjdDog5YiS6K+NXHJcbiAgICBjcmVhdGU6IOWIm+W7uuWunuS+i1xyXG4gICAgaG92ZXI6IOm8oOagh+aCrOa1rlxyXG4gICAgaG92ZXJPdXQ6IOm8oOagh+enu+W8gFxyXG4qL1xyXG53aW5kb3cuU291cmNlID0gY2xhc3Mge1xyXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgIGxldCB7aGwsIG5vZGUsIGlkLCBfaWQsIGNvbnRlbnR9ID0gb3B0aW9ucztcclxuICAgIGlkID0gaWQgfHxfaWQ7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHRoaXMuaGwgPSBobDtcclxuICAgIHRoaXMubm9kZSA9IG5vZGU7XHJcbiAgICB0aGlzLmNvbnRlbnQgPSBobC5nZXROb2Rlc0NvbnRlbnQobm9kZSk7XHJcbiAgICB0aGlzLmRvbSA9IFtdO1xyXG4gICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgdGhpcy5faWQgPSBgbmtjLWhsLWlkLSR7aWR9YDtcclxuICAgIGNvbnN0IHtvZmZzZXQsIGxlbmd0aH0gPSB0aGlzLm5vZGU7XHJcbiAgICBsZXQgdGFyZ2V0Tm90ZXMgPSBzZWxmLmdldE5vZGVzKHRoaXMuaGwucm9vdCwgb2Zmc2V0LCBsZW5ndGgpO1xyXG4gICAgaWYobGVuZ3RoID09PSAwIHx8ICF0YXJnZXROb3Rlcy5sZW5ndGgpIHtcclxuICAgICAgLy8g5aaC5p6cbGVuZ3Ro5Li6MO+8jOmCo+S5iOatpOmAieWMuuWumuS9jeS4ouWksVxyXG4gICAgICAvLyDlnKhobC5yb2905ZCM57qn5ZCO5o+S5YWl5LiA5LiqZGl2XHJcbiAgICAgIC8vIOWwhuS4ouWksemAieWMuueahOeslOiusOijheWcqOatpGRpdumHjO+8jOW5tua3u+WKoOeCueWHu+S6i+S7tlxyXG4gICAgICBjb25zdCB7cm9vdH0gPSBobDtcclxuICAgICAgbGV0IHtuZXh0U2libGluZywgcGFyZW50Tm9kZX0gPSByb290O1xyXG4gICAgICBsZXQgbmtjRnJlZU5vdGVzO1xyXG4gICAgICBpZihuZXh0U2libGluZyA9PT0gbnVsbCkge1xyXG4gICAgICAgIG5rY0ZyZWVOb3RlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgbmtjRnJlZU5vdGVzLmNsYXNzTGlzdC5hZGQoXCJua2MtZnJlZS1ub3Rlc1wiKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBua2NGcmVlTm90ZXMgPSBuZXh0U2libGluZztcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBub3RlTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgICBub3RlTm9kZS5pbm5lclRleHQgPSBjb250ZW50O1xyXG5cclxuICAgICAgbmtjRnJlZU5vdGVzLmFwcGVuZENoaWxkKG5vdGVOb2RlKTtcclxuICAgICAgaWYoIW5leHRTaWJsaW5nKSB7XHJcbiAgICAgICAgcGFyZW50Tm9kZS5hcHBlbmRDaGlsZChua2NGcmVlTm90ZXMpO1xyXG4gICAgICB9XHJcbiAgICAgIHRhcmdldE5vdGVzID0gW25vdGVOb2RlXTtcclxuICAgIH1cclxuICAgIC8vIGNvbnN0IHRhcmdldE5vdGVzID0gc2VsZi5nZXROb2Rlcyh0aGlzLmhsLnJvb3QsIG9mZnNldCwgbGVuZ3RoKTtcclxuICAgIHRhcmdldE5vdGVzLm1hcCh0YXJnZXROb2RlID0+IHtcclxuICAgICAgaWYoIXRhcmdldE5vZGUudGV4dENvbnRlbnQubGVuZ3RoKSByZXR1cm47XHJcbiAgICAgIGNvbnN0IHBhcmVudE5vZGUgPSB0YXJnZXROb2RlLnBhcmVudE5vZGU7XHJcbiAgICAgIGlmKHBhcmVudE5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKFwibmtjLWhsXCIpKSB7XHJcbiAgICAgICAgLy8g5a2Y5Zyo6auY5Lqu5bWM5aWX55qE6Zeu6aKYXHJcbiAgICAgICAgLy8g55CG5oOz54q25oCB5LiL77yM5omA5pyJ6YCJ5Yy65aSE5LqO5bmz57qn77yM6YeN5ZCI6YOo5YiG6KKr5YiG6ZqU77yM5LuF5re75Yqg5aSa5LiqY2xhc3NcclxuICAgICAgICBsZXQgcGFyZW50c0lkID0gcGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoXCJkYXRhLW5rYy1obC1pZFwiKTtcclxuICAgICAgICBpZighcGFyZW50c0lkKSByZXR1cm47XHJcbiAgICAgICAgcGFyZW50c0lkID0gcGFyZW50c0lkLnNwbGl0KFwiLVwiKTtcclxuICAgICAgICBjb25zdCBzb3VyY2VzID0gW107XHJcbiAgICAgICAgZm9yKGNvbnN0IHBpZCBvZiBwYXJlbnRzSWQpIHtcclxuICAgICAgICAgIHNvdXJjZXMucHVzaChzZWxmLmhsLmdldFNvdXJjZUJ5SUQoTnVtYmVyKHBpZCkpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvcihjb25zdCBub2RlIG9mIHBhcmVudE5vZGUuY2hpbGROb2Rlcykge1xyXG4gICAgICAgICAgaWYoIW5vZGUudGV4dENvbnRlbnQubGVuZ3RoKSBjb250aW51ZTtcclxuICAgICAgICAgIGNvbnN0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgICAgICAgIHNwYW4uY2xhc3NOYW1lID0gYG5rYy1obGA7XHJcbiAgICAgICAgICBzcGFuLm9ubW91c2VvdmVyID0gcGFyZW50Tm9kZS5vbm1vdXNlb3ZlcjtcclxuICAgICAgICAgIHNwYW4ub25tb3VzZW91dCA9IHBhcmVudE5vZGUub25tb3VzZW91dDtcclxuICAgICAgICAgIHNwYW4ub25jbGljayA9IHBhcmVudE5vZGUub25jbGljaztcclxuICAgICAgICAgIHNvdXJjZXMubWFwKHMgPT4ge1xyXG4gICAgICAgICAgICBzLmRvbS5wdXNoKHNwYW4pO1xyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgLy8g5paw6YCJ5Yy6XHJcbiAgICAgICAgICBpZihub2RlID09PSB0YXJnZXROb2RlKSB7XHJcbiAgICAgICAgICAgIC8vIOWmguaenOaWsOmAieWMuuWujOWFqOimhuebluS4iuWxgumAieWMuu+8jOWImeS/neeVmeS4iuWxgumAieWMuueahOS6i+S7tu+8jOWQpuWImea3u+WKoOaWsOmAieWMuuebuOWFs+S6i+S7tlxyXG4gICAgICAgICAgICBpZihwYXJlbnROb2RlLmNoaWxkTm9kZXMubGVuZ3RoICE9PSAxIHx8IHRhcmdldE5vdGVzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgIHNwYW4ub25tb3VzZW92ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaGwuZW1pdChzZWxmLmhsLmV2ZW50TmFtZXMuaG92ZXIsIHNlbGYpO1xyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgc3Bhbi5vbm1vdXNlb3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmhvdmVyT3V0LCBzZWxmKTtcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgIHNwYW4ub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5obC5lbWl0KHNlbGYuaGwuZXZlbnROYW1lcy5jbGljaywgc2VsZik7XHJcbiAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyDopobnm5bljLrln5/mt7vliqBjbGFzcyBua2MtaGwtY292ZXJcclxuICAgICAgICAgICAgc3Bhbi5jbGFzc05hbWUgKz0gYCBua2MtaGwtY292ZXJgO1xyXG4gICAgICAgICAgICBzcGFuLnNldEF0dHJpYnV0ZShgZGF0YS1ua2MtaGwtaWRgLCBwYXJlbnRzSWQuY29uY2F0KFtzZWxmLmlkXSkuam9pbihcIi1cIikpO1xyXG4gICAgICAgICAgICBzZWxmLmRvbS5wdXNoKHNwYW4pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3Bhbi5zZXRBdHRyaWJ1dGUoYGRhdGEtbmtjLWhsLWlkYCwgcGFyZW50c0lkLmpvaW4oXCItXCIpKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHNwYW4uYXBwZW5kQ2hpbGQobm9kZS5jbG9uZU5vZGUoZmFsc2UpKTtcclxuICAgICAgICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHNwYW4sIG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzb3VyY2VzLm1hcChzID0+IHtcclxuICAgICAgICAgIGNvbnN0IHBhcmVudEluZGV4ID0gcy5kb20uaW5kZXhPZihwYXJlbnROb2RlKTtcclxuICAgICAgICAgIGlmKHBhcmVudEluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgICBzLmRvbS5zcGxpY2UocGFyZW50SW5kZXgsIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIOa4hemZpOS4iuWxgumAieWMumRvbeeahOebuOWFs+S6i+S7tuWSjGNsYXNzXHJcbiAgICAgICAgLy8gcGFyZW50Tm9kZS5jbGFzc0xpc3QucmVtb3ZlKGBua2MtaGxgLCBzb3VyY2UuX2lkLCBgbmtjLWhsLWNvdmVyYCk7XHJcbiAgICAgICAgLy8gcGFyZW50Tm9kZS5jbGFzc05hbWUgPSBcIlwiO1xyXG4gICAgICAgIHBhcmVudE5vZGUub25tb3VzZW91dCA9IG51bGw7XHJcbiAgICAgICAgcGFyZW50Tm9kZS5vbm1vdXNlb3ZlciA9IG51bGw7XHJcbiAgICAgICAgcGFyZW50Tm9kZS5vbmNsaWNrID0gbnVsbDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyDlhajmlrDpgInljLog5peg6KaG55uW55qE5oOF5Ya1XHJcbiAgICAgICAgY29uc3Qgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG5cclxuICAgICAgICBzcGFuLmNsYXNzTGlzdC5hZGQoXCJua2MtaGxcIik7XHJcbiAgICAgICAgc3Bhbi5zZXRBdHRyaWJ1dGUoXCJkYXRhLW5rYy1obC1pZFwiLCBzZWxmLmlkKTtcclxuXHJcbiAgICAgICAgc3Bhbi5vbm1vdXNlb3ZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgc2VsZi5obC5lbWl0KHNlbGYuaGwuZXZlbnROYW1lcy5ob3Zlciwgc2VsZik7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBzcGFuLm9ubW91c2VvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHNlbGYuaGwuZW1pdChzZWxmLmhsLmV2ZW50TmFtZXMuaG92ZXJPdXQsIHNlbGYpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgc3Bhbi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmNsaWNrLCBzZWxmKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZWxmLmRvbS5wdXNoKHNwYW4pO1xyXG4gICAgICAgIHNwYW4uYXBwZW5kQ2hpbGQodGFyZ2V0Tm9kZS5jbG9uZU5vZGUodHJ1ZSkpO1xyXG4gICAgICAgIHRhcmdldE5vZGUucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoc3BhbiwgdGFyZ2V0Tm9kZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgdGhpcy5obC5zb3VyY2VzLnB1c2godGhpcyk7XHJcbiAgICB0aGlzLmhsLmVtaXQodGhpcy5obC5ldmVudE5hbWVzLmNyZWF0ZSwgdGhpcyk7XHJcbiAgfVxyXG4gIGFkZENsYXNzKGtsYXNzKSB7XHJcbiAgICBjb25zdCB7ZG9tfSA9IHRoaXM7XHJcbiAgICBkb20ubWFwKGQgPT4ge1xyXG4gICAgICBkLmNsYXNzTGlzdC5hZGQoa2xhc3MpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHJlbW92ZUNsYXNzKGtsYXNzKSB7XHJcbiAgICBjb25zdCB7ZG9tfSA9IHRoaXM7XHJcbiAgICBkb20ubWFwKGQgPT4ge1xyXG4gICAgICBkLmNsYXNzTGlzdC5yZW1vdmUoa2xhc3MpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGRlc3Ryb3koKSB7XHJcbiAgICB0aGlzLmRvbS5tYXAoZCA9PiB7XHJcbiAgICAgIGQuY2xhc3NOYW1lID0gXCJcIjtcclxuICAgIH0pO1xyXG4gIH1cclxuICBnZXRTb3VyY2VzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuc291cmNlcztcclxuICB9XHJcbiAgZ2V0Tm9kZXMocGFyZW50LCBvZmZzZXQsIGxlbmd0aCkge1xyXG4gICAgY29uc3Qgbm9kZVN0YWNrID0gW3BhcmVudF07XHJcbiAgICBsZXQgY3VyT2Zmc2V0ID0gMDtcclxuICAgIGxldCBub2RlID0gbnVsbDtcclxuICAgIGxldCBjdXJMZW5ndGggPSBsZW5ndGg7XHJcbiAgICBsZXQgbm9kZXMgPSBbXTtcclxuICAgIGxldCBzdGFydGVkID0gZmFsc2U7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHdoaWxlKCEhKG5vZGUgPSBub2RlU3RhY2sucG9wKCkpKSB7XHJcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gbm9kZS5jaGlsZE5vZGVzO1xyXG4gICAgICAvLyBsb29wOlxyXG4gICAgICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICBjb25zdCBub2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgaWYoc2VsZi5obC5pc0Nsb3duKG5vZGUpKSBjb250aW51ZTtcclxuICAgICAgICAvKmlmKG5vZGUubm9kZVR5cGUgPT09IDEpIHtcclxuICAgICAgICAgIGNvbnN0IGNsID0gbm9kZS5jbGFzc0xpc3Q7XHJcbiAgICAgICAgICBmb3IoY29uc3QgYyBvZiBzZWxmLmhsLmV4Y2x1ZGVkRWxlbWVudENsYXNzKSB7XHJcbiAgICAgICAgICAgIGlmKGNsLmNvbnRhaW5zKGMpKSB7XHJcbiAgICAgICAgICAgICAgY29udGludWUgbG9vcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29uc3QgZWxlbWVudFRhZ05hbWUgPSBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgIGlmKHNlbGYuaGwuZXhjbHVkZWRFbGVtZW50VGFnTmFtZS5pbmNsdWRlcyhlbGVtZW50VGFnTmFtZSkpIHtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSovXHJcbiAgICAgICAgbm9kZVN0YWNrLnB1c2gobm9kZSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYobm9kZS5ub2RlVHlwZSA9PT0gMyAmJiBub2RlLnRleHRDb250ZW50Lmxlbmd0aCkge1xyXG4gICAgICAgIGN1ck9mZnNldCArPSBub2RlLnRleHRDb250ZW50Lmxlbmd0aDtcclxuICAgICAgICBpZihjdXJPZmZzZXQgPiBvZmZzZXQpIHtcclxuICAgICAgICAgIGlmKGN1ckxlbmd0aCA8PSAwKSBicmVhaztcclxuICAgICAgICAgIGxldCBzdGFydE9mZnNldDtcclxuICAgICAgICAgIGlmKCFzdGFydGVkKSB7XHJcbiAgICAgICAgICAgIHN0YXJ0T2Zmc2V0ID0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSAoY3VyT2Zmc2V0IC0gb2Zmc2V0KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN0YXJ0T2Zmc2V0ID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgbGV0IG5lZWRMZW5ndGg7XHJcbiAgICAgICAgICBpZihjdXJMZW5ndGggPD0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSBzdGFydE9mZnNldCkge1xyXG4gICAgICAgICAgICBuZWVkTGVuZ3RoID0gY3VyTGVuZ3RoO1xyXG4gICAgICAgICAgICBjdXJMZW5ndGggPSAwO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbmVlZExlbmd0aCA9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoIC0gc3RhcnRPZmZzZXQ7XHJcbiAgICAgICAgICAgIGN1ckxlbmd0aCAtPSBuZWVkTGVuZ3RoO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbm9kZXMucHVzaCh7XHJcbiAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgIHN0YXJ0T2Zmc2V0LFxyXG4gICAgICAgICAgICBuZWVkTGVuZ3RoXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIG5vZGVzID0gbm9kZXMubWFwKG9iaiA9PiB7XHJcbiAgICAgIGxldCB7bm9kZSwgc3RhcnRPZmZzZXQsIG5lZWRMZW5ndGh9ID0gb2JqO1xyXG4gICAgICBpZihzdGFydE9mZnNldCA+IDApIHtcclxuICAgICAgICBub2RlID0gbm9kZS5zcGxpdFRleHQoc3RhcnRPZmZzZXQpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKG5vZGUudGV4dENvbnRlbnQubGVuZ3RoICE9PSBuZWVkTGVuZ3RoKSB7XHJcbiAgICAgICAgbm9kZS5zcGxpdFRleHQobmVlZExlbmd0aCk7ICBcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbm9kZTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5vZGVzO1xyXG4gIH1cclxufTtcclxuXHJcbndpbmRvdy5OS0NIaWdobGlnaHRlciA9IGNsYXNzIHtcclxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICBjb25zdCB7XHJcbiAgICAgIHJvb3RFbGVtZW50SWQsIGV4Y2x1ZGVkRWxlbWVudENsYXNzID0gW10sXHJcbiAgICAgIGV4Y2x1ZGVkRWxlbWVudFRhZ05hbWUgPSBbXSxcclxuXHJcbiAgICAgIGNsb3duQ2xhc3MgPSBbXSwgY2xvd25BdHRyID0gW10sIGNsb3duVGFnTmFtZSA9IFtdXHJcbiAgICB9ID0gb3B0aW9ucztcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgc2VsZi5yb290ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocm9vdEVsZW1lbnRJZCk7XHJcbiAgICBzZWxmLmV4Y2x1ZGVkRWxlbWVudENsYXNzID0gZXhjbHVkZWRFbGVtZW50Q2xhc3M7XHJcbiAgICBzZWxmLmV4Y2x1ZGVkRWxlbWVudFRhZ05hbWUgPSBleGNsdWRlZEVsZW1lbnRUYWdOYW1lO1xyXG5cclxuICAgIHNlbGYuY2xvd25DbGFzcyA9IGNsb3duQ2xhc3M7XHJcbiAgICBzZWxmLmNsb3duQXR0ciA9IGNsb3duQXR0cjtcclxuICAgIHNlbGYuY2xvd25UYWdOYW1lID0gY2xvd25UYWdOYW1lO1xyXG5cclxuXHJcbiAgICBzZWxmLnJhbmdlID0ge307XHJcbiAgICBzZWxmLnNvdXJjZXMgPSBbXTtcclxuICAgIHNlbGYuZXZlbnRzID0ge307XHJcbiAgICBzZWxmLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICBzZWxmLmV2ZW50TmFtZXMgPSB7XHJcbiAgICAgIGNyZWF0ZTogXCJjcmVhdGVcIixcclxuICAgICAgaG92ZXI6IFwiaG92ZXJcIixcclxuICAgICAgaG92ZXJPdXQ6IFwiaG92ZXJPdXRcIixcclxuICAgICAgc2VsZWN0OiBcInNlbGVjdFwiXHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBpbnRlcnZhbDtcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsICgpID0+IHtcclxuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwic2VsZWN0aW9uY2hhbmdlXCIsICgpID0+IHtcclxuICAgICAgc2VsZi5yYW5nZSA9IHt9O1xyXG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcclxuXHJcbiAgICAgIGludGVydmFsID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgc2VsZi5pbml0RXZlbnQoKTtcclxuICAgICAgfSwgNTAwKTtcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgfVxyXG4gIGluaXRFdmVudCgpIHtcclxuICAgIHRyeXtcclxuICAgICAgLy8g5bGP6JS95YiS6K+N5LqL5Lu2XHJcbiAgICAgIGlmKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcclxuICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldFJhbmdlKCk7XHJcbiAgICAgIGlmKCFyYW5nZSB8fCByYW5nZS5jb2xsYXBzZWQpIHJldHVybjtcclxuICAgICAgaWYoXHJcbiAgICAgICAgcmFuZ2Uuc3RhcnRDb250YWluZXIgPT09IHRoaXMucmFuZ2Uuc3RhcnRDb250YWluZXIgJiZcclxuICAgICAgICByYW5nZS5lbmRDb250YWluZXIgPT09IHRoaXMucmFuZ2UuZW5kQ29udGFpbmVyICYmXHJcbiAgICAgICAgcmFuZ2Uuc3RhcnRPZmZzZXQgPT09IHRoaXMucmFuZ2Uuc3RhcnRPZmZzZXQgJiZcclxuICAgICAgICByYW5nZS5lbmRPZmZzZXQgPT09IHRoaXMucmFuZ2UuZW5kT2Zmc2V0XHJcbiAgICAgICkgcmV0dXJuO1xyXG4gICAgICAvLyDpmZDliLbpgInmi6nmloflrZfnmoTljLrln5/vvIzlj6rog73mmK9yb2905LiL55qE6YCJ5Yy6XHJcbiAgICAgIGlmKCF0aGlzLmNvbnRhaW5zKHJhbmdlLnN0YXJ0Q29udGFpbmVyKSB8fCAhdGhpcy5jb250YWlucyhyYW5nZS5lbmRDb250YWluZXIpKSByZXR1cm47XHJcbiAgICAgIHRoaXMucmFuZ2UgPSByYW5nZTtcclxuICAgICAgdGhpcy5lbWl0KHRoaXMuZXZlbnROYW1lcy5zZWxlY3QsIHtcclxuICAgICAgICByYW5nZVxyXG4gICAgICB9KTtcclxuICAgIH0gY2F0Y2goZXJyKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKGVyci5tZXNzYWdlIHx8IGVycik7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGNvbnRhaW5zKG5vZGUpIHtcclxuICAgIHdoaWxlKChub2RlID0gbm9kZS5wYXJlbnROb2RlKSkge1xyXG4gICAgICBpZihub2RlID09PSB0aGlzLnJvb3QpIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBnZXRQYXJlbnQoc2VsZiwgZCkge1xyXG4gICAgaWYoZCA9PT0gc2VsZi5yb290KSByZXR1cm47XHJcbiAgICBpZih0aGlzLmlzQ2xvd24oZCkpIHRocm93IG5ldyAgRXJyb3IoXCLliJLor43otornlYxcIik7XHJcbiAgICBpZihkLnBhcmVudE5vZGUpIHNlbGYuZ2V0UGFyZW50KHNlbGYsIGQucGFyZW50Tm9kZSk7XHJcbiAgfVxyXG4gIGdldFJhbmdlKCkge1xyXG4gICAgdHJ5e1xyXG4gICAgICBjb25zdCByYW5nZSA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5nZXRSYW5nZUF0KDApO1xyXG4gICAgICBjb25zdCB7c3RhcnRPZmZzZXQsIGVuZE9mZnNldCwgc3RhcnRDb250YWluZXIsIGVuZENvbnRhaW5lcn0gPSByYW5nZTtcclxuICAgICAgdGhpcy5nZXRQYXJlbnQodGhpcywgc3RhcnRDb250YWluZXIpO1xyXG4gICAgICB0aGlzLmdldFBhcmVudCh0aGlzLCBlbmRDb250YWluZXIpO1xyXG4gICAgICBjb25zdCBub2RlcyA9IHRoaXMuZmluZE5vZGVzKHN0YXJ0Q29udGFpbmVyLCBlbmRDb250YWluZXIpO1xyXG4gICAgICBub2Rlcy5tYXAobm9kZSA9PiB7XHJcbiAgICAgICAgdGhpcy5nZXRQYXJlbnQodGhpcywgbm9kZSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBpZihzdGFydE9mZnNldCA9PT0gZW5kT2Zmc2V0ICYmIHN0YXJ0Q29udGFpbmVyID09PSBlbmRDb250YWluZXIpIHJldHVybjtcclxuICAgICAgcmV0dXJuIHJhbmdlO1xyXG4gICAgfSBjYXRjaChlcnIpIHtcclxuICAgICAgY29uc29sZS5sb2coZXJyLm1lc3NhZ2UgfHwgZXJyKTtcclxuICAgIH1cclxuICB9XHJcbiAgZGVzdHJveShzb3VyY2UpIHtcclxuICAgIGlmKHR5cGVvZiBzb3VyY2UgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgc291cmNlID0gdGhpcy5nZXRTb3VyY2VCeUlEKHNvdXJjZSk7XHJcbiAgICB9XHJcbiAgICBzb3VyY2UuZGVzdHJveSgpO1xyXG4gIH1cclxuICByZXN0b3JlU291cmNlcyhzb3VyY2VzID0gW10pIHtcclxuICAgIGZvcihjb25zdCBzb3VyY2Ugb2Ygc291cmNlcykge1xyXG4gICAgICBzb3VyY2UuaGwgPSB0aGlzO1xyXG4gICAgICBuZXcgU291cmNlKHNvdXJjZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGdldE5vZGVzKHJhbmdlKSB7XHJcbiAgICBjb25zdCB7c3RhcnRDb250YWluZXIsIGVuZENvbnRhaW5lciwgc3RhcnRPZmZzZXQsIGVuZE9mZnNldH0gPSByYW5nZTtcclxuICAgIC8vIGlmKHN0YXJ0T2Zmc2V0ID09PSBlbmRPZmZzZXQpIHJldHVybjtcclxuICAgIGxldCBzZWxlY3RlZE5vZGVzID0gW10sIHN0YXJ0Tm9kZSwgZW5kTm9kZTtcclxuICAgIC8vIGlmKHN0YXJ0Q29udGFpbmVyLm5vZGVUeXBlICE9PSAzIHx8IHN0YXJ0Q29udGFpbmVyLm5vZGVUeXBlICE9PSAzKSByZXR1cm47XHJcbiAgICBpZihzdGFydENvbnRhaW5lciA9PT0gZW5kQ29udGFpbmVyKSB7XHJcbiAgICAgIC8vIOebuOWQjOiKgueCuVxyXG4gICAgICBzdGFydE5vZGUgPSBzdGFydENvbnRhaW5lcjtcclxuICAgICAgZW5kTm9kZSA9IHN0YXJ0Tm9kZTtcclxuICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKHtcclxuICAgICAgICBub2RlOiBzdGFydE5vZGUsXHJcbiAgICAgICAgb2Zmc2V0OiBzdGFydE9mZnNldCxcclxuICAgICAgICBsZW5ndGg6IGVuZE9mZnNldCAtIHN0YXJ0T2Zmc2V0XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3RhcnROb2RlID0gc3RhcnRDb250YWluZXI7XHJcbiAgICAgIGVuZE5vZGUgPSBlbmRDb250YWluZXI7XHJcbiAgICAgIC8vIOW9k+i1t+Wni+iKgueCueS4jeS4uuaWh+acrOiKgueCueaXtu+8jOaXoOmcgOaPkuWFpei1t+Wni+iKgueCuVxyXG4gICAgICAvLyDlnKjojrflj5blrZDoioLngrnml7bkvJrlsIbmj5LlhaXotbflp4voioLngrnnmoTlrZDoioLngrnvvIzlpoLmnpzov5nph4zkuI3lgZrliKTmlq3vvIzkvJrlh7rnjrDotbflp4voioLngrnlhoXlrrnph43lpI3nmoTpl67popjjgIJcclxuICAgICAgaWYoc3RhcnROb2RlLm5vZGVUeXBlID09PSAzKSB7XHJcbiAgICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKHtcclxuICAgICAgICAgIG5vZGU6IHN0YXJ0Tm9kZSxcclxuICAgICAgICAgIG9mZnNldDogc3RhcnRPZmZzZXQsXHJcbiAgICAgICAgICBsZW5ndGg6IHN0YXJ0Tm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSBzdGFydE9mZnNldFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IG5vZGVzID0gdGhpcy5maW5kTm9kZXMoc3RhcnROb2RlLCBlbmROb2RlKTtcclxuICAgICAgZm9yKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcclxuICAgICAgICBzZWxlY3RlZE5vZGVzLnB1c2goe1xyXG4gICAgICAgICAgbm9kZSxcclxuICAgICAgICAgIG9mZnNldDogMCxcclxuICAgICAgICAgIGxlbmd0aDogbm9kZS50ZXh0Q29udGVudC5sZW5ndGhcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICBzZWxlY3RlZE5vZGVzLnB1c2goe1xyXG4gICAgICAgIG5vZGU6IGVuZE5vZGUsXHJcbiAgICAgICAgb2Zmc2V0OiAwLFxyXG4gICAgICAgIGxlbmd0aDogZW5kT2Zmc2V0XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG5vZGVzID0gW107XHJcbiAgICBmb3IoY29uc3Qgb2JqIG9mIHNlbGVjdGVkTm9kZXMpIHtcclxuICAgICAgY29uc3Qge25vZGUsIG9mZnNldCwgbGVuZ3RofSA9IG9iajtcclxuICAgICAgY29uc3QgY29udGVudCA9IG5vZGUudGV4dENvbnRlbnQuc2xpY2Uob2Zmc2V0LCBvZmZzZXQgKyBsZW5ndGgpO1xyXG4gICAgICBjb25zdCBvZmZzZXRfID0gdGhpcy5nZXRPZmZzZXQobm9kZSk7XHJcbiAgICAgIG5vZGVzLnB1c2goe1xyXG4gICAgICAgIGNvbnRlbnQsXHJcbiAgICAgICAgb2Zmc2V0OiBvZmZzZXRfICsgb2Zmc2V0LFxyXG4gICAgICAgIGxlbmd0aFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIGlmKCFub2Rlcy5sZW5ndGgpIHJldHVybiBudWxsO1xyXG5cclxuICAgIGxldCBjb250ZW50ID0gXCJcIiwgIG9mZnNldCA9IDAsIGxlbmd0aCA9IDA7XHJcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xyXG4gICAgICBjb250ZW50ICs9IG5vZGUuY29udGVudDtcclxuICAgICAgbGVuZ3RoICs9IG5vZGUubGVuZ3RoO1xyXG4gICAgICBpZihpID09PSAwKSBvZmZzZXQgPSBub2RlLm9mZnNldDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb250ZW50LFxyXG4gICAgICBvZmZzZXQsXHJcbiAgICAgIGxlbmd0aFxyXG4gICAgfVxyXG4gIH1cclxuICBnZXROb2Rlc0NvbnRlbnQobm9kZSkge1xyXG4gICAgcmV0dXJuIG5vZGUuY29udGVudDtcclxuICB9XHJcbiAgY3JlYXRlU291cmNlKGlkLCBub2RlKSB7XHJcbiAgICByZXR1cm4gbmV3IFNvdXJjZSh7XHJcbiAgICAgIGhsOiB0aGlzLFxyXG4gICAgICBpZCxcclxuICAgICAgbm9kZSxcclxuICAgIH0pO1xyXG4gIH1cclxuICBnZXRTb3VyY2VCeUlEKGlkKSB7XHJcbiAgICBmb3IoY29uc3QgcyBvZiB0aGlzLnNvdXJjZXMpIHtcclxuICAgICAgaWYocy5pZCA9PT0gaWQpIHJldHVybiBzO1xyXG4gICAgfVxyXG4gIH1cclxuICBhZGRDbGFzcyhpZCwgY2xhc3NOYW1lKSB7XHJcbiAgICBsZXQgc291cmNlO1xyXG4gICAgaWYodHlwZW9mIGlkID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgIHNvdXJjZSA9IHRoaXMuZ2V0U291cmNlQnlJRChpZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzb3VyY2UgPSBpZDtcclxuICAgIH1cclxuICAgIHNvdXJjZS5hZGRDbGFzcyhjbGFzc05hbWUpO1xyXG4gIH1cclxuICByZW1vdmVDbGFzcyhpZCwgY2xhc3NOYW1lKSB7XHJcbiAgICBsZXQgc291cmNlO1xyXG4gICAgaWYodHlwZW9mIGlkID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgIHNvdXJjZSA9IHRoaXMuZ2V0U291cmNlQnlJRChpZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzb3VyY2UgPSBpZDtcclxuICAgIH1cclxuICAgIHNvdXJjZS5yZW1vdmVDbGFzcyhjbGFzc05hbWUpO1xyXG4gIH1cclxuICBnZXRPZmZzZXQodGV4dCkge1xyXG4gICAgY29uc3Qgbm9kZVN0YWNrID0gW3RoaXMucm9vdF07XHJcbiAgICBsZXQgY3VyTm9kZSA9IG51bGw7XHJcbiAgICBsZXQgb2Zmc2V0ID0gMDtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgd2hpbGUgKCEhKGN1ck5vZGUgPSBub2RlU3RhY2sucG9wKCkpKSB7XHJcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gY3VyTm9kZS5jaGlsZE5vZGVzO1xyXG4gICAgICAvLyBsb29wOlxyXG4gICAgICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICBjb25zdCBub2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgaWYoc2VsZi5pc0Nsb3duKG5vZGUpKSBjb250aW51ZTtcclxuICAgICAgICBub2RlU3RhY2sucHVzaChub2RlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGN1ck5vZGUubm9kZVR5cGUgPT09IDMgJiYgY3VyTm9kZSAhPT0gdGV4dCkge1xyXG4gICAgICAgIG9mZnNldCArPSBjdXJOb2RlLnRleHRDb250ZW50Lmxlbmd0aDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChjdXJOb2RlLm5vZGVUeXBlID09PSAzKSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBvZmZzZXQ7XHJcbiAgfVxyXG4gIGZpbmROb2RlcyhzdGFydE5vZGUsIGVuZE5vZGUpIHtcclxuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSBbXTtcclxuICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuZ2V0U2FtZVBhcmVudE5vZGUoc3RhcnROb2RlLCBlbmROb2RlKTtcclxuICAgIGlmKHBhcmVudCkge1xyXG4gICAgICBsZXQgc3RhcnQgPSBmYWxzZSwgZW5kID0gZmFsc2U7XHJcbiAgICAgIGNvbnN0IGdldENoaWxkTm9kZSA9IChub2RlKSA9PiB7XHJcbiAgICAgICAgaWYoIW5vZGUuaGFzQ2hpbGROb2RlcygpKSByZXR1cm47XHJcbiAgICAgICAgZm9yKGNvbnN0IG4gb2Ygbm9kZS5jaGlsZE5vZGVzKSB7XHJcbiAgICAgICAgICBpZihlbmQgfHwgbiA9PT0gZW5kTm9kZSkge1xyXG4gICAgICAgICAgICBlbmQgPSB0cnVlO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9IGVsc2UgaWYoc3RhcnQgJiYgbi5ub2RlVHlwZSA9PT0gMykge1xyXG4gICAgICAgICAgICBzZWxlY3RlZE5vZGVzLnB1c2gobik7XHJcbiAgICAgICAgICB9IGVsc2UgaWYobiA9PT0gc3RhcnROb2RlKSB7XHJcbiAgICAgICAgICAgIHN0YXJ0ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGdldENoaWxkTm9kZShuKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIGdldENoaWxkTm9kZShwYXJlbnQpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNlbGVjdGVkTm9kZXM7XHJcbiAgfVxyXG4gIGlzQ2xvd24obm9kZSkge1xyXG4gICAgLy8g5Yik5patbm9kZeaYr+WQpumcgOimgeaOkumZpFxyXG4gICAgaWYobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xyXG4gICAgICBjb25zdCBjbCA9IG5vZGUuY2xhc3NMaXN0O1xyXG4gICAgICBmb3IoY29uc3QgYyBvZiB0aGlzLmNsb3duQ2xhc3MpIHtcclxuICAgICAgICBpZihjbC5jb250YWlucyhjKSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGVsZW1lbnRUYWdOYW1lID0gbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgIGlmKHRoaXMuY2xvd25UYWdOYW1lLmluY2x1ZGVzKGVsZW1lbnRUYWdOYW1lKSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGZvcihjb25zdCBrZXkgaW4gdGhpcy5jbG93bkF0dHIpIHtcclxuICAgICAgICBpZighdGhpcy5jbG93bkF0dHIuaGFzT3duUHJvcGVydHkoa2V5KSkgY29udGludWU7XHJcbiAgICAgICAgaWYobm9kZS5nZXRBdHRyaWJ1dGUoa2V5KSA9PT0gdGhpcy5jbG93bkF0dHJba2V5XSkgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgZ2V0U2FtZVBhcmVudE5vZGUoc3RhcnROb2RlLCBlbmROb2RlKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIGlmKCFlbmROb2RlIHx8IHN0YXJ0Tm9kZSA9PT0gZW5kTm9kZSkgcmV0dXJuIHN0YXJ0Tm9kZS5wYXJlbnROb2RlO1xyXG4gICAgY29uc3Qgc3RhcnROb2RlcyA9IFtdLCBlbmROb2RlcyA9IFtdO1xyXG4gICAgY29uc3QgZ2V0UGFyZW50ID0gKG5vZGUsIG5vZGVzKSA9PiB7XHJcbiAgICAgIG5vZGVzLnB1c2gobm9kZSk7XHJcbiAgICAgIGlmKG5vZGUgIT09IHNlbGYucm9vdCAmJiBub2RlLnBhcmVudE5vZGUpIHtcclxuICAgICAgICBnZXRQYXJlbnQobm9kZS5wYXJlbnROb2RlLCBub2Rlcyk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBnZXRQYXJlbnQoc3RhcnROb2RlLCBzdGFydE5vZGVzKTtcclxuICAgIGdldFBhcmVudChlbmROb2RlLCBlbmROb2Rlcyk7XHJcbiAgICBsZXQgcGFyZW50O1xyXG4gICAgZm9yKGNvbnN0IG5vZGUgb2Ygc3RhcnROb2Rlcykge1xyXG4gICAgICBpZihlbmROb2Rlcy5pbmNsdWRlcyhub2RlKSkge1xyXG4gICAgICAgIHBhcmVudCA9IG5vZGU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBwYXJlbnQ7XHJcbiAgfVxyXG4gIGdldFNvdXJjZUJ5SWQoaWQpIHtcclxuICAgIGZvcihjb25zdCBzIG9mIHRoaXMuc291cmNlcykge1xyXG4gICAgICBpZihzLmlkID09PSBpZCkge1xyXG4gICAgICAgIHJldHVybiBzO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIG9mZnNldChub2RlKSB7XHJcbiAgICBsZXQgdG9wID0gMCwgbGVmdCA9IDAsIF9wb3NpdGlvbjtcclxuXHJcbiAgICBjb25zdCBnZXRPZmZzZXQgPSAobiwgaW5pdCkgPT4ge1xyXG4gICAgICBpZihuLm5vZGVUeXBlICE9PSAxKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIF9wb3NpdGlvbiA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG4pWydwb3NpdGlvbiddO1xyXG5cclxuICAgICAgaWYgKHR5cGVvZihpbml0KSA9PT0gJ3VuZGVmaW5lZCcgJiYgX3Bvc2l0aW9uID09PSAnc3RhdGljJykge1xyXG4gICAgICAgIGdldE9mZnNldChuLnBhcmVudE5vZGUpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgdG9wID0gbi5vZmZzZXRUb3AgKyB0b3AgLSBuLnNjcm9sbFRvcDtcclxuICAgICAgbGVmdCA9IG4ub2Zmc2V0TGVmdCArIGxlZnQgLSBuLnNjcm9sbExlZnQ7XHJcblxyXG4gICAgICBpZiAoX3Bvc2l0aW9uID09PSAnZml4ZWQnKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGdldE9mZnNldChuLnBhcmVudE5vZGUpO1xyXG4gICAgfTtcclxuXHJcbiAgICBnZXRPZmZzZXQobm9kZSwgdHJ1ZSk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdG9wLCBsZWZ0XHJcbiAgICB9O1xyXG4gIH1cclxuICBnZXRTdGFydE5vZGVPZmZzZXQocmFuZ2UpIHtcclxuICAgIC8vIOWcqOmAieWMuui1t+Wni+WkhOaPkuWFpXNwYW5cclxuICAgIC8vIOiOt+WPlnNwYW7nmoTkvY3nva7kv6Hmga9cclxuICAgIC8vIOenu+mZpHNwYW5cclxuICAgIGxldCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICAvLyBzcGFuLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgIHNwYW4uc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lLWJsb2NrXCI7XHJcbiAgICBzcGFuLnN0eWxlLnZlcnRpY2FsQWxpZ24gPSBcInRvcFwiO1xyXG4gICAgcmFuZ2UuaW5zZXJ0Tm9kZShzcGFuKTtcclxuICAgIGNvbnN0IHBhcmVudE5vZGUgPSBzcGFuLnBhcmVudE5vZGU7XHJcbiAgICBzcGFuLnN0eWxlLndpZHRoID0gXCIzMHB4XCI7XHJcbiAgICBjb25zdCBvZmZzZXQgPSB0aGlzLm9mZnNldChzcGFuKTtcclxuICAgIHBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3Bhbik7XHJcbiAgICByZXR1cm4gb2Zmc2V0O1xyXG4gIH1cclxuICBsb2NrKCkge1xyXG4gICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgfVxyXG4gIHVubG9jaygpIHtcclxuICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcclxuICB9XHJcbiAgb24oZXZlbnROYW1lLCBjYWxsYmFjaykge1xyXG4gICAgaWYoIXRoaXMuZXZlbnRzW2V2ZW50TmFtZV0pIHtcclxuICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXSA9IFtdO1xyXG4gICAgfVxyXG4gICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXS5wdXNoKGNhbGxiYWNrKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuICBlbWl0KGV2ZW50TmFtZSwgZGF0YSkge1xyXG4gICAgKHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0gfHwgW10pLm1hcChmdW5jID0+IHtcclxuICAgICAgZnVuYyhkYXRhKTtcclxuICAgIH0pO1xyXG4gIH1cclxufTtcclxuIl19
