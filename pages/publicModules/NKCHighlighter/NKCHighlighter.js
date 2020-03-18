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

    var initEvent = function initEvent() {
      try {
        // 屏蔽划词事件
        if (self.disabled) return;
        var range = self.getRange();
        if (!range || range.collapsed) return;
        if (range.startContainer === self.range.startContainer && range.endContainer === self.range.endContainer && range.startOffset === self.range.startOffset && range.endOffset === self.range.endOffset) return; // 限制选择文字的区域，只能是root下的选区

        if (!self.root.contains(range.startContainer) || !self.root.contains(range.endContainer)) return;
        self.range = range;
        self.emit(self.eventNames.select, {
          range: range
        });
      } catch (err) {
        console.log(err.message || err);
      }
    };

    document.addEventListener("mouseup", initEvent);
  }

  _createClass(_class2, [{
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

        if (self.excludedElementClass.includes(d.tagName.toLowerCase())) {
          throw new Error("划词越界");
        }
      }

      if (d.parentNode) self.getParent(self, d.parentNode);
    }
  }, {
    key: "getRange",
    value: function getRange() {
      try {
        var range = window.getSelection().getRangeAt(0);
        var startOffset = range.startOffset,
            endOffset = range.endOffset,
            startContainer = range.startContainer,
            endContainer = range.endContainer;
        this.getParent(this, startContainer);
        this.getParent(this, endContainer);
        if (startOffset === endOffset && startContainer === endContainer) return;
        return range;
      } catch (err) {
        console.log(err);
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
          endOffset = range.endOffset;
      console.log(range); // if(startOffset === endOffset) return;

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
    key: "getStartNodeOffset",
    value: function getStartNodeOffset(range) {
      // 将文本节点从划词处分隔
      // 在分割处插入span并获取span的位置
      // 移除span并拼接分隔后的节点
      var startContainer = range.startContainer,
          startOffset = range.startOffset;
      var span = document.createElement("span");
      var endNode;

      if (startOffset === 0) {
        endNode = startContainer;
      } else {
        endNode = startContainer.splitText(startOffset);
      }

      endNode.parentNode.insertBefore(span, endNode);
      span = $(span);
      var offset = span.offset();
      span.remove(); // 未拼接分割后的节点，而是当点击添加按钮后重新获取range
      // endNode.parentNode.normalize();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvTktDSGlnaGxpZ2h0ZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQTs7Ozs7OztBQU9BLE1BQU0sQ0FBQyxNQUFQO0FBQUE7QUFBQTtBQUNFLGtCQUFZLE9BQVosRUFBcUI7QUFBQTs7QUFBQSxRQUNkLEVBRGMsR0FDTyxPQURQLENBQ2QsRUFEYztBQUFBLFFBQ1YsSUFEVSxHQUNPLE9BRFAsQ0FDVixJQURVO0FBQUEsUUFDSixFQURJLEdBQ08sT0FEUCxDQUNKLEVBREk7QUFBQSxRQUNBLEdBREEsR0FDTyxPQURQLENBQ0EsR0FEQTtBQUVuQixJQUFBLEVBQUUsR0FBRyxFQUFFLElBQUcsR0FBVjtBQUNBLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxTQUFLLEVBQUwsR0FBVSxFQUFWO0FBQ0EsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFNBQUssT0FBTCxHQUFlLEVBQUUsQ0FBQyxlQUFILENBQW1CLElBQW5CLENBQWY7QUFDQSxTQUFLLEdBQUwsR0FBVyxFQUFYO0FBQ0EsU0FBSyxFQUFMLEdBQVUsRUFBVjtBQUNBLFNBQUssR0FBTCx1QkFBd0IsRUFBeEI7QUFUbUIscUJBVU0sS0FBSyxJQVZYO0FBQUEsUUFVWixNQVZZLGNBVVosTUFWWTtBQUFBLFFBVUosTUFWSSxjQVVKLE1BVkk7QUFXbkIsUUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxLQUFLLEVBQUwsQ0FBUSxJQUF0QixFQUE0QixNQUE1QixFQUFvQyxNQUFwQyxDQUFwQjtBQUNBLElBQUEsV0FBVyxDQUFDLEdBQVosQ0FBZ0IsVUFBQSxVQUFVLEVBQUk7QUFDNUIsVUFBRyxDQUFDLFVBQVUsQ0FBQyxXQUFYLENBQXVCLE1BQTNCLEVBQW1DO0FBQ25DLFVBQU0sVUFB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R0FBRyxDQUFDLENBQUMsSUFBRCxDQUFSO0FBQ0EsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQUwsRUFBZjtBQUNBLE1BQUEsSUFBSSxDQUFDLE1BQUwsR0Fmd0IsQ0FnQnhCO0FBQ0E7O0FBQ0EsYUFBTyxNQUFQO0FBQ0Q7QUFqU0g7QUFBQTtBQUFBLDJCQWtTUztBQUNMLFdBQUssUUFBTCxHQUFnQixJQUFoQjtBQUNEO0FBcFNIO0FBQUE7QUFBQSw2QkFxU1c7QUFDUCxXQUFLLFFBQUwsR0FBZ0IsS0FBaEI7QUFDRDtBQXZTSDtBQUFBO0FBQUEsdUJBd1NLLFNBeFNMLEVBd1NnQixRQXhTaEIsRUF3UzBCO0FBQ3RCLFVBQUcsQ0FBQyxLQUFLLE1BQUwsQ0FBWSxTQUFaLENBQUosRUFBNEI7QUFDMUIsYUFBSyxNQUFMLENBQVksU0FBWixJQUF5QixFQUF6QjtBQUNEOztBQUNELFdBQUssTUFBTCxDQUFZLFNBQVosRUFBdUIsSUFBdkIsQ0FBNEIsUUFBNUI7QUFDQSxhQUFPLElBQVA7QUFDRDtBQTlTSDtBQUFBO0FBQUEseUJBK1NPLFNBL1NQLEVBK1NrQixJQS9TbEIsRUErU3dCO0FBQ3BCLE9BQUMsS0FBSyxNQUFMLENBQVksU0FBWixLQUEwQixFQUEzQixFQUErQixHQUEvQixDQUFtQyxVQUFBLElBQUksRUFBSTtBQUN6QyxRQUFBLElBQUksQ0FBQyxJQUFELENBQUo7QUFDRCxPQUZEO0FBR0Q7QUFuVEg7O0FBQUE7QUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qIFxyXG4gIGV2ZW50czpcclxuICAgIHNlbGVjdDog5YiS6K+NXHJcbiAgICBjcmVhdGU6IOWIm+W7uuWunuS+i1xyXG4gICAgaG92ZXI6IOm8oOagh+aCrOa1rlxyXG4gICAgaG92ZXJPdXQ6IOm8oOagh+enu+W8gFxyXG4qL1xyXG53aW5kb3cuU291cmNlID0gY2xhc3Mge1xyXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgIGxldCB7aGwsIG5vZGUsIGlkLCBfaWR9ID0gb3B0aW9ucztcclxuICAgIGlkID0gaWQgfHxfaWQ7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHRoaXMuaGwgPSBobDtcclxuICAgIHRoaXMubm9kZSA9IG5vZGU7XHJcbiAgICB0aGlzLmNvbnRlbnQgPSBobC5nZXROb2Rlc0NvbnRlbnQobm9kZSk7XHJcbiAgICB0aGlzLmRvbSA9IFtdO1xyXG4gICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgdGhpcy5faWQgPSBgbmtjLWhsLWlkLSR7aWR9YDtcclxuICAgIGNvbnN0IHtvZmZzZXQsIGxlbmd0aH0gPSB0aGlzLm5vZGU7XHJcbiAgICBjb25zdCB0YXJnZXROb3RlcyA9IHNlbGYuZ2V0Tm9kZXModGhpcy5obC5yb290LCBvZmZzZXQsIGxlbmd0aCk7XHJcbiAgICB0YXJnZXROb3Rlcy5tYXAodGFyZ2V0Tm9kZSA9PiB7XHJcbiAgICAgIGlmKCF0YXJnZXROb2RlLnRleHRDb250ZW50Lmxlbmd0aCkgcmV0dXJuO1xyXG4gICAgICBjb25zdCBwYXJlbnROb2RlID0gdGFyZ2V0Tm9kZS5wYXJlbnROb2RlO1xyXG4gICAgICBpZihwYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucyhcIm5rYy1obFwiKSkge1xyXG4gICAgICAgIC8vIOWtmOWcqOmrmOS6ruW1jOWll+eahOmXrumimFxyXG4gICAgICAgIC8vIOeQhuaDs+eKtuaAgeS4i++8jOaJgOaciemAieWMuuWkhOS6juW5s+e6p++8jOmHjeWQiOmDqOWIhuiiq+WIhumalO+8jOS7hea3u+WKoOWkmuS4qmNsYXNzXHJcbiAgICAgICAgbGV0IHBhcmVudHNJZCA9IHBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKFwiZGF0YS1ua2MtaGwtaWRcIik7XHJcbiAgICAgICAgcGFyZW50c0lkID0gcGFyZW50c0lkLnNwbGl0KFwiLVwiKTtcclxuICAgICAgICBjb25zdCBzb3VyY2VzID0gW107XHJcbiAgICAgICAgZm9yKGNvbnN0IHBpZCBvZiBwYXJlbnRzSWQpIHtcclxuICAgICAgICAgIHNvdXJjZXMucHVzaChzZWxmLmhsLmdldFNvdXJjZUJ5SUQoTnVtYmVyKHBpZCkpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvcihjb25zdCBub2RlIG9mIHBhcmVudE5vZGUuY2hpbGROb2Rlcykge1xyXG4gICAgICAgICAgaWYoIW5vZGUudGV4dENvbnRlbnQubGVuZ3RoKSBjb250aW51ZTtcclxuICAgICAgICAgIGNvbnN0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgICAgICAgIHNwYW4uY2xhc3NOYW1lID0gYG5rYy1obGA7XHJcbiAgICAgICAgICBzcGFuLm9ubW91c2VvdmVyID0gcGFyZW50Tm9kZS5vbm1vdXNlb3ZlcjtcclxuICAgICAgICAgIHNwYW4ub25tb3VzZW91dCA9IHBhcmVudE5vZGUub25tb3VzZW91dDtcclxuICAgICAgICAgIHNwYW4ub25jbGljayA9IHBhcmVudE5vZGUub25jbGljaztcclxuICAgICAgICAgIHNvdXJjZXMubWFwKHMgPT4ge1xyXG4gICAgICAgICAgICBzLmRvbS5wdXNoKHNwYW4pO1xyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgLy8g5paw6YCJ5Yy6XHJcbiAgICAgICAgICBpZihub2RlID09PSB0YXJnZXROb2RlKSB7XHJcbiAgICAgICAgICAgIC8vIOWmguaenOaWsOmAieWMuuWujOWFqOimhuebluS4iuWxgumAieWMuu+8jOWImeS/neeVmeS4iuWxgumAieWMuueahOS6i+S7tu+8jOWQpuWImea3u+WKoOaWsOmAieWMuuebuOWFs+S6i+S7tlxyXG4gICAgICAgICAgICBpZihwYXJlbnROb2RlLmNoaWxkTm9kZXMubGVuZ3RoICE9PSAxIHx8IHRhcmdldE5vdGVzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgIHNwYW4ub25tb3VzZW92ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaGwuZW1pdChzZWxmLmhsLmV2ZW50TmFtZXMuaG92ZXIsIHNlbGYpO1xyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgc3Bhbi5vbm1vdXNlb3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmhvdmVyT3V0LCBzZWxmKTtcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgIHNwYW4ub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5obC5lbWl0KHNlbGYuaGwuZXZlbnROYW1lcy5jbGljaywgc2VsZik7XHJcbiAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyDopobnm5bljLrln5/mt7vliqBjbGFzcyBua2MtaGwtY292ZXJcclxuICAgICAgICAgICAgc3Bhbi5jbGFzc05hbWUgKz0gYCBua2MtaGwtY292ZXJgO1xyXG4gICAgICAgICAgICBzcGFuLnNldEF0dHJpYnV0ZShgZGF0YS1ua2MtaGwtaWRgLCBwYXJlbnRzSWQuY29uY2F0KFtzZWxmLmlkXSkuam9pbihcIi1cIikpO1xyXG4gICAgICAgICAgICBzZWxmLmRvbS5wdXNoKHNwYW4pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3Bhbi5zZXRBdHRyaWJ1dGUoYGRhdGEtbmtjLWhsLWlkYCwgcGFyZW50c0lkLmpvaW4oXCItXCIpKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHNwYW4uYXBwZW5kQ2hpbGQobm9kZS5jbG9uZU5vZGUoZmFsc2UpKTtcclxuICAgICAgICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHNwYW4sIG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzb3VyY2VzLm1hcChzID0+IHtcclxuICAgICAgICAgIGNvbnN0IHBhcmVudEluZGV4ID0gcy5kb20uaW5kZXhPZihwYXJlbnROb2RlKTtcclxuICAgICAgICAgIGlmKHBhcmVudEluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgICBzLmRvbS5zcGxpY2UocGFyZW50SW5kZXgsIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIOa4hemZpOS4iuWxgumAieWMumRvbeeahOebuOWFs+S6i+S7tuWSjGNsYXNzXHJcbiAgICAgICAgLy8gcGFyZW50Tm9kZS5jbGFzc0xpc3QucmVtb3ZlKGBua2MtaGxgLCBzb3VyY2UuX2lkLCBgbmtjLWhsLWNvdmVyYCk7XHJcbiAgICAgICAgLy8gcGFyZW50Tm9kZS5jbGFzc05hbWUgPSBcIlwiO1xyXG4gICAgICAgIHBhcmVudE5vZGUub25tb3VzZW91dCA9IG51bGw7XHJcbiAgICAgICAgcGFyZW50Tm9kZS5vbm1vdXNlb3ZlciA9IG51bGw7XHJcbiAgICAgICAgcGFyZW50Tm9kZS5vbmNsaWNrID0gbnVsbDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyDlhajmlrDpgInljLog5peg6KaG55uW55qE5oOF5Ya1XHJcbiAgICAgICAgY29uc3Qgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG5cclxuICAgICAgICBzcGFuLmNsYXNzTGlzdC5hZGQoXCJua2MtaGxcIik7XHJcbiAgICAgICAgc3Bhbi5zZXRBdHRyaWJ1dGUoXCJkYXRhLW5rYy1obC1pZFwiLCBzZWxmLmlkKTtcclxuXHJcbiAgICAgICAgc3Bhbi5vbm1vdXNlb3ZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgc2VsZi5obC5lbWl0KHNlbGYuaGwuZXZlbnROYW1lcy5ob3Zlciwgc2VsZik7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBzcGFuLm9ubW91c2VvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHNlbGYuaGwuZW1pdChzZWxmLmhsLmV2ZW50TmFtZXMuaG92ZXJPdXQsIHNlbGYpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgc3Bhbi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmNsaWNrLCBzZWxmKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZWxmLmRvbS5wdXNoKHNwYW4pO1xyXG5cclxuICAgICAgICBzcGFuLmFwcGVuZENoaWxkKHRhcmdldE5vZGUuY2xvbmVOb2RlKGZhbHNlKSk7XHJcbiAgICAgICAgdGFyZ2V0Tm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChzcGFuLCB0YXJnZXROb2RlKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICB0aGlzLmhsLnNvdXJjZXMucHVzaCh0aGlzKTtcclxuICAgIHRoaXMuaGwuZW1pdCh0aGlzLmhsLmV2ZW50TmFtZXMuY3JlYXRlLCB0aGlzKTtcclxuICB9XHJcbiAgYWRkQ2xhc3Moa2xhc3MpIHtcclxuICAgIGNvbnN0IHtkb219ID0gdGhpcztcclxuICAgIGRvbS5tYXAoZCA9PiB7XHJcbiAgICAgIGQuY2xhc3NMaXN0LmFkZChrbGFzcyk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgcmVtb3ZlQ2xhc3Moa2xhc3MpIHtcclxuICAgIGNvbnN0IHtkb219ID0gdGhpcztcclxuICAgIGRvbS5tYXAoZCA9PiB7XHJcbiAgICAgIGQuY2xhc3NMaXN0LnJlbW92ZShrbGFzcyk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgZGVzdHJveSgpIHtcclxuICAgIHRoaXMuZG9tLm1hcChkID0+IHtcclxuICAgICAgZC5jbGFzc05hbWUgPSBcIlwiO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGdldFNvdXJjZXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zb3VyY2VzO1xyXG4gIH1cclxuICBnZXROb2RlcyhwYXJlbnQsIG9mZnNldCwgbGVuZ3RoKSB7XHJcbiAgICBjb25zdCBub2RlU3RhY2sgPSBbcGFyZW50XTtcclxuICAgIGxldCBjdXJPZmZzZXQgPSAwO1xyXG4gICAgbGV0IG5vZGUgPSBudWxsO1xyXG4gICAgbGV0IGN1ckxlbmd0aCA9IGxlbmd0aDtcclxuICAgIGxldCBub2RlcyA9IFtdO1xyXG4gICAgbGV0IHN0YXJ0ZWQgPSBmYWxzZTtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgd2hpbGUoISEobm9kZSA9IG5vZGVTdGFjay5wb3AoKSkpIHtcclxuICAgICAgY29uc3QgY2hpbGRyZW4gPSBub2RlLmNoaWxkTm9kZXM7XHJcbiAgICAgIGxvb3A6XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICBjb25zdCBub2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICBpZihub2RlLm5vZGVUeXBlID09PSAxKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNsID0gbm9kZS5jbGFzc0xpc3Q7XHJcbiAgICAgICAgICAgIGZvcihjb25zdCBjIG9mIHNlbGYuaGwuZXhjbHVkZWRFbGVtZW50Q2xhc3MpIHtcclxuICAgICAgICAgICAgICBpZihjbC5jb250YWlucyhjKSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWUgbG9vcDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudFRhZ05hbWUgPSBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgaWYoc2VsZi5obC5leGNsdWRlZEVsZW1lbnRUYWdOYW1lLmluY2x1ZGVzKGVsZW1lbnRUYWdOYW1lKSkge1xyXG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBub2RlU3RhY2sucHVzaChub2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgIGlmKG5vZGUubm9kZVR5cGUgPT09IDMgJiYgbm9kZS50ZXh0Q29udGVudC5sZW5ndGgpIHtcclxuICAgICAgICBjdXJPZmZzZXQgKz0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGg7XHJcbiAgICAgICAgaWYoY3VyT2Zmc2V0ID4gb2Zmc2V0KSB7XHJcbiAgICAgICAgICBpZihjdXJMZW5ndGggPD0gMCkgYnJlYWs7XHJcbiAgICAgICAgICBsZXQgc3RhcnRPZmZzZXQ7XHJcbiAgICAgICAgICBpZighc3RhcnRlZCkge1xyXG4gICAgICAgICAgICBzdGFydE9mZnNldCA9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoIC0gKGN1ck9mZnNldCAtIG9mZnNldCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdGFydE9mZnNldCA9IDA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBzdGFydGVkID0gdHJ1ZTtcclxuICAgICAgICAgIGxldCBuZWVkTGVuZ3RoO1xyXG4gICAgICAgICAgaWYoY3VyTGVuZ3RoIDw9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoIC0gc3RhcnRPZmZzZXQpIHtcclxuICAgICAgICAgICAgbmVlZExlbmd0aCA9IGN1ckxlbmd0aDtcclxuICAgICAgICAgICAgY3VyTGVuZ3RoID0gMDtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5lZWRMZW5ndGggPSBub2RlLnRleHRDb250ZW50Lmxlbmd0aCAtIHN0YXJ0T2Zmc2V0O1xyXG4gICAgICAgICAgICBjdXJMZW5ndGggLT0gbmVlZExlbmd0aDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG5vZGVzLnB1c2goe1xyXG4gICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICBzdGFydE9mZnNldCxcclxuICAgICAgICAgICAgbmVlZExlbmd0aFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBub2RlcyA9IG5vZGVzLm1hcChvYmogPT4ge1xyXG4gICAgICBsZXQge25vZGUsIHN0YXJ0T2Zmc2V0LCBuZWVkTGVuZ3RofSA9IG9iajtcclxuICAgICAgaWYoc3RhcnRPZmZzZXQgPiAwKSB7XHJcbiAgICAgICAgbm9kZSA9IG5vZGUuc3BsaXRUZXh0KHN0YXJ0T2Zmc2V0KTtcclxuICAgICAgfVxyXG4gICAgICBpZihub2RlLnRleHRDb250ZW50Lmxlbmd0aCAhPT0gbmVlZExlbmd0aCkge1xyXG4gICAgICAgIG5vZGUuc3BsaXRUZXh0KG5lZWRMZW5ndGgpOyAgXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBub2RlcztcclxuICB9XHJcbn07XHJcblxyXG53aW5kb3cuTktDSGlnaGxpZ2h0ZXIgPSBjbGFzcyB7XHJcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgY29uc3Qge1xyXG4gICAgICByb290RWxlbWVudElkLCBleGNsdWRlZEVsZW1lbnRDbGFzcyA9IFtdLFxyXG4gICAgICBleGNsdWRlZEVsZW1lbnRUYWdOYW1lID0gW11cclxuICAgIH0gPSBvcHRpb25zO1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLnJvb3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChyb290RWxlbWVudElkKTtcclxuICAgIHNlbGYuZXhjbHVkZWRFbGVtZW50Q2xhc3MgPSBleGNsdWRlZEVsZW1lbnRDbGFzcztcclxuICAgIHNlbGYuZXhjbHVkZWRFbGVtZW50VGFnTmFtZSA9IGV4Y2x1ZGVkRWxlbWVudFRhZ05hbWU7XHJcblxyXG4gICAgc2VsZi5yYW5nZSA9IHt9O1xyXG4gICAgc2VsZi5zb3VyY2VzID0gW107XHJcbiAgICBzZWxmLmV2ZW50cyA9IHt9O1xyXG4gICAgc2VsZi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgc2VsZi5ldmVudE5hbWVzID0ge1xyXG4gICAgICBjcmVhdGU6IFwiY3JlYXRlXCIsXHJcbiAgICAgIGhvdmVyOiBcImhvdmVyXCIsXHJcbiAgICAgIGhvdmVyT3V0OiBcImhvdmVyT3V0XCIsXHJcbiAgICAgIHNlbGVjdDogXCJzZWxlY3RcIlxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBpbml0RXZlbnQgPSAoKSA9PiB7XHJcbiAgICAgIHRyeXtcclxuICAgICAgICAvLyDlsY/olL3liJLor43kuovku7ZcclxuICAgICAgICBpZihzZWxmLmRpc2FibGVkKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgcmFuZ2UgPSBzZWxmLmdldFJhbmdlKCk7XHJcbiAgICAgICAgaWYoIXJhbmdlIHx8IHJhbmdlLmNvbGxhcHNlZCkgcmV0dXJuO1xyXG4gICAgICAgIGlmKFxyXG4gICAgICAgICAgcmFuZ2Uuc3RhcnRDb250YWluZXIgPT09IHNlbGYucmFuZ2Uuc3RhcnRDb250YWluZXIgJiZcclxuICAgICAgICAgIHJhbmdlLmVuZENvbnRhaW5lciA9PT0gc2VsZi5yYW5nZS5lbmRDb250YWluZXIgJiZcclxuICAgICAgICAgIHJhbmdlLnN0YXJ0T2Zmc2V0ID09PSBzZWxmLnJhbmdlLnN0YXJ0T2Zmc2V0ICYmXHJcbiAgICAgICAgICByYW5nZS5lbmRPZmZzZXQgPT09IHNlbGYucmFuZ2UuZW5kT2Zmc2V0XHJcbiAgICAgICAgKSByZXR1cm47XHJcbiAgICAgICAgLy8g6ZmQ5Yi26YCJ5oup5paH5a2X55qE5Yy65Z+f77yM5Y+q6IO95pivcm9vdOS4i+eahOmAieWMulxyXG4gICAgICAgIGlmKCFzZWxmLnJvb3QuY29udGFpbnMocmFuZ2Uuc3RhcnRDb250YWluZXIpIHx8ICFzZWxmLnJvb3QuY29udGFpbnMocmFuZ2UuZW5kQ29udGFpbmVyKSkgcmV0dXJuO1xyXG4gICAgICAgIHNlbGYucmFuZ2UgPSByYW5nZTtcclxuICAgICAgICBzZWxmLmVtaXQoc2VsZi5ldmVudE5hbWVzLnNlbGVjdCwge1xyXG4gICAgICAgICAgcmFuZ2VcclxuICAgICAgICB9KTtcclxuICAgICAgfSBjYXRjaChlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlcnIubWVzc2FnZSB8fCBlcnIpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgaW5pdEV2ZW50KTtcclxuICB9XHJcbiAgZ2V0UGFyZW50KHNlbGYsIGQpIHtcclxuICAgIGlmKGQgPT09IHNlbGYucm9vdCkgcmV0dXJuO1xyXG4gICAgaWYoZC5ub2RlVHlwZSA9PT0gMSkge1xyXG4gICAgICBmb3IoY29uc3QgYyBvZiBzZWxmLmV4Y2x1ZGVkRWxlbWVudENsYXNzKSB7XHJcbiAgICAgICAgaWYoZC5jbGFzc0xpc3QuY29udGFpbnMoYykpIHRocm93IG5ldyBFcnJvcihcIuWIkuivjei2iueVjFwiKTtcclxuICAgICAgfVxyXG4gICAgICBpZihzZWxmLmV4Y2x1ZGVkRWxlbWVudENsYXNzLmluY2x1ZGVzKGQudGFnTmFtZS50b0xvd2VyQ2FzZSgpKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIuWIkuivjei2iueVjFwiKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYoZC5wYXJlbnROb2RlKSBzZWxmLmdldFBhcmVudChzZWxmLCBkLnBhcmVudE5vZGUpO1xyXG4gIH1cclxuICBnZXRSYW5nZSgpIHtcclxuICAgIHRyeXtcclxuICAgICAgY29uc3QgcmFuZ2UgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuZ2V0UmFuZ2VBdCgwKTtcclxuICAgICAgY29uc3Qge3N0YXJ0T2Zmc2V0LCBlbmRPZmZzZXQsIHN0YXJ0Q29udGFpbmVyLCBlbmRDb250YWluZXJ9ID0gcmFuZ2U7XHJcbiAgICAgIHRoaXMuZ2V0UGFyZW50KHRoaXMsIHN0YXJ0Q29udGFpbmVyKTtcclxuICAgICAgdGhpcy5nZXRQYXJlbnQodGhpcywgZW5kQ29udGFpbmVyKTtcclxuICAgICAgaWYoc3RhcnRPZmZzZXQgPT09IGVuZE9mZnNldCAmJiBzdGFydENvbnRhaW5lciA9PT0gZW5kQ29udGFpbmVyKSByZXR1cm47XHJcbiAgICAgIHJldHVybiByYW5nZTtcclxuICAgIH0gY2F0Y2goZXJyKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGRlc3Ryb3koc291cmNlKSB7XHJcbiAgICBpZih0eXBlb2Ygc291cmNlID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgIHNvdXJjZSA9IHRoaXMuZ2V0U291cmNlQnlJRChzb3VyY2UpO1xyXG4gICAgfVxyXG4gICAgc291cmNlLmRlc3Ryb3koKTtcclxuICB9XHJcbiAgcmVzdG9yZVNvdXJjZXMoc291cmNlcyA9IFtdKSB7XHJcbiAgICBmb3IoY29uc3Qgc291cmNlIG9mIHNvdXJjZXMpIHtcclxuICAgICAgc291cmNlLmhsID0gdGhpcztcclxuICAgICAgbmV3IFNvdXJjZShzb3VyY2UpO1xyXG4gICAgfVxyXG4gIH1cclxuICBnZXROb2RlcyhyYW5nZSkge1xyXG4gICAgY29uc3Qge3N0YXJ0Q29udGFpbmVyLCBlbmRDb250YWluZXIsIHN0YXJ0T2Zmc2V0LCBlbmRPZmZzZXR9ID0gcmFuZ2U7XHJcbiAgICBjb25zb2xlLmxvZyhyYW5nZSlcclxuICAgIC8vIGlmKHN0YXJ0T2Zmc2V0ID09PSBlbmRPZmZzZXQpIHJldHVybjtcclxuICAgIGxldCBzZWxlY3RlZE5vZGVzID0gW10sIHN0YXJ0Tm9kZSwgZW5kTm9kZTtcclxuICAgIC8vIGlmKHN0YXJ0Q29udGFpbmVyLm5vZGVUeXBlICE9PSAzIHx8IHN0YXJ0Q29udGFpbmVyLm5vZGVUeXBlICE9PSAzKSByZXR1cm47XHJcbiAgICBpZihzdGFydENvbnRhaW5lciA9PT0gZW5kQ29udGFpbmVyKSB7XHJcbiAgICAgIC8vIOebuOWQjOiKgueCuVxyXG4gICAgICBzdGFydE5vZGUgPSBzdGFydENvbnRhaW5lcjtcclxuICAgICAgZW5kTm9kZSA9IHN0YXJ0Tm9kZTtcclxuICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKHtcclxuICAgICAgICBub2RlOiBzdGFydE5vZGUsXHJcbiAgICAgICAgb2Zmc2V0OiBzdGFydE9mZnNldCxcclxuICAgICAgICBsZW5ndGg6IGVuZE9mZnNldCAtIHN0YXJ0T2Zmc2V0XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3RhcnROb2RlID0gc3RhcnRDb250YWluZXI7XHJcbiAgICAgIGVuZE5vZGUgPSBlbmRDb250YWluZXI7XHJcbiAgICAgIC8vIOW9k+i1t+Wni+iKgueCueS4jeS4uuaWh+acrOiKgueCueaXtu+8jOaXoOmcgOaPkuWFpei1t+Wni+iKgueCuVxyXG4gICAgICAvLyDlnKjojrflj5blrZDoioLngrnml7bkvJrlsIbmj5LlhaXotbflp4voioLngrnnmoTlrZDoioLngrnvvIzlpoLmnpzov5nph4zkuI3lgZrliKTmlq3vvIzkvJrlh7rnjrDotbflp4voioLngrnlhoXlrrnph43lpI3nmoTpl67popjjgIJcclxuICAgICAgaWYoc3RhcnROb2RlLm5vZGVUeXBlID09PSAzKSB7XHJcbiAgICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKHtcclxuICAgICAgICAgIG5vZGU6IHN0YXJ0Tm9kZSxcclxuICAgICAgICAgIG9mZnNldDogc3RhcnRPZmZzZXQsXHJcbiAgICAgICAgICBsZW5ndGg6IHN0YXJ0Tm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSBzdGFydE9mZnNldFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IG5vZGVzID0gdGhpcy5maW5kTm9kZXMoc3RhcnROb2RlLCBlbmROb2RlKTtcclxuICAgICAgZm9yKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcclxuICAgICAgICBzZWxlY3RlZE5vZGVzLnB1c2goe1xyXG4gICAgICAgICAgbm9kZSxcclxuICAgICAgICAgIG9mZnNldDogMCxcclxuICAgICAgICAgIGxlbmd0aDogbm9kZS50ZXh0Q29udGVudC5sZW5ndGhcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICBzZWxlY3RlZE5vZGVzLnB1c2goe1xyXG4gICAgICAgIG5vZGU6IGVuZE5vZGUsXHJcbiAgICAgICAgb2Zmc2V0OiAwLFxyXG4gICAgICAgIGxlbmd0aDogZW5kT2Zmc2V0XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG5vZGVzID0gW107XHJcbiAgICBmb3IoY29uc3Qgb2JqIG9mIHNlbGVjdGVkTm9kZXMpIHtcclxuICAgICAgY29uc3Qge25vZGUsIG9mZnNldCwgbGVuZ3RofSA9IG9iajtcclxuICAgICAgY29uc3QgY29udGVudCA9IG5vZGUudGV4dENvbnRlbnQuc2xpY2Uob2Zmc2V0LCBvZmZzZXQgKyBsZW5ndGgpO1xyXG4gICAgICBjb25zdCBvZmZzZXRfID0gdGhpcy5nZXRPZmZzZXQobm9kZSk7XHJcbiAgICAgIG5vZGVzLnB1c2goe1xyXG4gICAgICAgIGNvbnRlbnQsXHJcbiAgICAgICAgb2Zmc2V0OiBvZmZzZXRfICsgb2Zmc2V0LFxyXG4gICAgICAgIGxlbmd0aFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIGlmKCFub2Rlcy5sZW5ndGgpIHJldHVybiBudWxsO1xyXG5cclxuICAgIGxldCBjb250ZW50ID0gXCJcIiwgIG9mZnNldCA9IDAsIGxlbmd0aCA9IDA7XHJcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xyXG4gICAgICBjb250ZW50ICs9IG5vZGUuY29udGVudDtcclxuICAgICAgbGVuZ3RoICs9IG5vZGUubGVuZ3RoO1xyXG4gICAgICBpZihpID09PSAwKSBvZmZzZXQgPSBub2RlLm9mZnNldDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb250ZW50LFxyXG4gICAgICBvZmZzZXQsXHJcbiAgICAgIGxlbmd0aFxyXG4gICAgfVxyXG4gIH1cclxuICBnZXROb2Rlc0NvbnRlbnQobm9kZSkge1xyXG4gICAgcmV0dXJuIG5vZGUuY29udGVudDtcclxuICB9XHJcbiAgY3JlYXRlU291cmNlKGlkLCBub2RlKSB7XHJcbiAgICByZXR1cm4gbmV3IFNvdXJjZSh7XHJcbiAgICAgIGhsOiB0aGlzLFxyXG4gICAgICBpZCxcclxuICAgICAgbm9kZSxcclxuICAgIH0pO1xyXG4gIH1cclxuICBnZXRTb3VyY2VCeUlEKGlkKSB7XHJcbiAgICBmb3IoY29uc3QgcyBvZiB0aGlzLnNvdXJjZXMpIHtcclxuICAgICAgaWYocy5pZCA9PT0gaWQpIHJldHVybiBzO1xyXG4gICAgfVxyXG4gIH1cclxuICBhZGRDbGFzcyhpZCwgY2xhc3NOYW1lKSB7XHJcbiAgICBsZXQgc291cmNlO1xyXG4gICAgaWYodHlwZW9mIGlkID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgIHNvdXJjZSA9IHRoaXMuZ2V0U291cmNlQnlJRChpZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzb3VyY2UgPSBpZDtcclxuICAgIH1cclxuICAgIHNvdXJjZS5hZGRDbGFzcyhjbGFzc05hbWUpO1xyXG4gIH1cclxuICByZW1vdmVDbGFzcyhpZCwgY2xhc3NOYW1lKSB7XHJcbiAgICBsZXQgc291cmNlO1xyXG4gICAgaWYodHlwZW9mIGlkID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgIHNvdXJjZSA9IHRoaXMuZ2V0U291cmNlQnlJRChpZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzb3VyY2UgPSBpZDtcclxuICAgIH1cclxuICAgIHNvdXJjZS5yZW1vdmVDbGFzcyhjbGFzc05hbWUpO1xyXG4gIH1cclxuICBnZXRPZmZzZXQodGV4dCkge1xyXG4gICAgY29uc3Qgbm9kZVN0YWNrID0gW3RoaXMucm9vdF07XHJcbiAgICBsZXQgY3VyTm9kZSA9IG51bGw7XHJcbiAgICBsZXQgb2Zmc2V0ID0gMDtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgd2hpbGUgKCEhKGN1ck5vZGUgPSBub2RlU3RhY2sucG9wKCkpKSB7XHJcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gY3VyTm9kZS5jaGlsZE5vZGVzO1xyXG4gICAgICBsb29wOlxyXG4gICAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgY29uc3Qgbm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgaWYobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xyXG4gICAgICAgICAgICBjb25zdCBjbCA9IG5vZGUuY2xhc3NMaXN0O1xyXG4gICAgICAgICAgICBmb3IoY29uc3QgYyBvZiBzZWxmLmV4Y2x1ZGVkRWxlbWVudENsYXNzKSB7XHJcbiAgICAgICAgICAgICAgaWYoY2wuY29udGFpbnMoYykpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlIGxvb3A7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRUYWdOYW1lID0gbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIGlmKHNlbGYuZXhjbHVkZWRFbGVtZW50VGFnTmFtZS5pbmNsdWRlcyhlbGVtZW50VGFnTmFtZSkpIHtcclxuICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbm9kZVN0YWNrLnB1c2gobm9kZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgaWYgKGN1ck5vZGUubm9kZVR5cGUgPT09IDMgJiYgY3VyTm9kZSAhPT0gdGV4dCkge1xyXG4gICAgICAgIG9mZnNldCArPSBjdXJOb2RlLnRleHRDb250ZW50Lmxlbmd0aDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChjdXJOb2RlLm5vZGVUeXBlID09PSAzKSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBvZmZzZXQ7XHJcbiAgfVxyXG4gIGZpbmROb2RlcyhzdGFydE5vZGUsIGVuZE5vZGUpIHtcclxuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSBbXTtcclxuICAgIC8vIGNvbnN0IHBhcmVudCA9IHRoaXMucm9vdDtcclxuICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuZ2V0U2FtZVBhcmVudE5vZGUoc3RhcnROb2RlLCBlbmROb2RlKTtcclxuICAgIGlmKHBhcmVudCkge1xyXG4gICAgICBsZXQgc3RhcnQgPSBmYWxzZSwgZW5kID0gZmFsc2U7XHJcbiAgICAgIGNvbnN0IGdldENoaWxkTm9kZSA9IChub2RlKSA9PiB7XHJcbiAgICAgICAgaWYoIW5vZGUuaGFzQ2hpbGROb2RlcygpKSByZXR1cm47XHJcbiAgICAgICAgZm9yKGNvbnN0IG4gb2Ygbm9kZS5jaGlsZE5vZGVzKSB7XHJcbiAgICAgICAgICBpZihlbmQgfHwgbiA9PT0gZW5kTm9kZSkge1xyXG4gICAgICAgICAgICBlbmQgPSB0cnVlO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9IGVsc2UgaWYoc3RhcnQgJiYgbi5ub2RlVHlwZSA9PT0gMykge1xyXG4gICAgICAgICAgICBzZWxlY3RlZE5vZGVzLnB1c2gobik7XHJcbiAgICAgICAgICB9IGVsc2UgaWYobiA9PT0gc3RhcnROb2RlKSB7XHJcbiAgICAgICAgICAgIHN0YXJ0ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGdldENoaWxkTm9kZShuKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIGdldENoaWxkTm9kZShwYXJlbnQpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNlbGVjdGVkTm9kZXM7XHJcbiAgfVxyXG4gIGdldFNhbWVQYXJlbnROb2RlKHN0YXJ0Tm9kZSwgZW5kTm9kZSkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBpZighZW5kTm9kZSB8fCBzdGFydE5vZGUgPT09IGVuZE5vZGUpIHJldHVybiBzdGFydE5vZGUucGFyZW50Tm9kZTtcclxuICAgIGNvbnN0IHN0YXJ0Tm9kZXMgPSBbXSwgZW5kTm9kZXMgPSBbXTtcclxuICAgIGNvbnN0IGdldFBhcmVudCA9IChub2RlLCBub2RlcykgPT4ge1xyXG4gICAgICBub2Rlcy5wdXNoKG5vZGUpO1xyXG4gICAgICBpZihub2RlICE9PSBzZWxmLnJvb3QgJiYgbm9kZS5wYXJlbnROb2RlKSB7XHJcbiAgICAgICAgZ2V0UGFyZW50KG5vZGUucGFyZW50Tm9kZSwgbm9kZXMpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgZ2V0UGFyZW50KHN0YXJ0Tm9kZSwgc3RhcnROb2Rlcyk7XHJcbiAgICBnZXRQYXJlbnQoZW5kTm9kZSwgZW5kTm9kZXMpO1xyXG4gICAgbGV0IHBhcmVudDtcclxuICAgIGZvcihjb25zdCBub2RlIG9mIHN0YXJ0Tm9kZXMpIHtcclxuICAgICAgaWYoZW5kTm9kZXMuaW5jbHVkZXMobm9kZSkpIHtcclxuICAgICAgICBwYXJlbnQgPSBub2RlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGFyZW50O1xyXG4gIH1cclxuICBnZXRTb3VyY2VCeUlkKGlkKSB7XHJcbiAgICBmb3IoY29uc3QgcyBvZiB0aGlzLnNvdXJjZXMpIHtcclxuICAgICAgaWYocy5pZCA9PT0gaWQpIHtcclxuICAgICAgICByZXR1cm4gcztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBnZXRTdGFydE5vZGVPZmZzZXQocmFuZ2UpIHtcclxuICAgIC8vIOWwhuaWh+acrOiKgueCueS7juWIkuivjeWkhOWIhumalFxyXG4gICAgLy8g5Zyo5YiG5Ymy5aSE5o+S5YWlc3BhbuW5tuiOt+WPlnNwYW7nmoTkvY3nva5cclxuICAgIC8vIOenu+mZpHNwYW7lubbmi7zmjqXliIbpmpTlkI7nmoToioLngrlcclxuICAgIGNvbnN0IHtzdGFydENvbnRhaW5lciwgc3RhcnRPZmZzZXR9ID0gcmFuZ2U7XHJcbiAgICBsZXQgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgbGV0IGVuZE5vZGU7XHJcbiAgICBpZihzdGFydE9mZnNldCA9PT0gMCkge1xyXG4gICAgICBlbmROb2RlID0gc3RhcnRDb250YWluZXI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBlbmROb2RlID0gc3RhcnRDb250YWluZXIuc3BsaXRUZXh0KHN0YXJ0T2Zmc2V0KTtcclxuICAgIH1cclxuICAgIGVuZE5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc3BhbiwgZW5kTm9kZSk7XHJcbiAgICBzcGFuID0gJChzcGFuKTtcclxuICAgIGNvbnN0IG9mZnNldCA9IHNwYW4ub2Zmc2V0KCk7XHJcbiAgICBzcGFuLnJlbW92ZSgpO1xyXG4gICAgLy8g5pyq5ou85o6l5YiG5Ymy5ZCO55qE6IqC54K577yM6ICM5piv5b2T54K55Ye75re75Yqg5oyJ6ZKu5ZCO6YeN5paw6I635Y+WcmFuZ2VcclxuICAgIC8vIGVuZE5vZGUucGFyZW50Tm9kZS5ub3JtYWxpemUoKTtcclxuICAgIHJldHVybiBvZmZzZXQ7XHJcbiAgfVxyXG4gIGxvY2soKSB7XHJcbiAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcclxuICB9XHJcbiAgdW5sb2NrKCkge1xyXG4gICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gIH1cclxuICBvbihldmVudE5hbWUsIGNhbGxiYWNrKSB7XHJcbiAgICBpZighdGhpcy5ldmVudHNbZXZlbnROYW1lXSkge1xyXG4gICAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdID0gW107XHJcbiAgICB9XHJcbiAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdLnB1c2goY2FsbGJhY2spO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG4gIGVtaXQoZXZlbnROYW1lLCBkYXRhKSB7XHJcbiAgICAodGhpcy5ldmVudHNbZXZlbnROYW1lXSB8fCBbXSkubWFwKGZ1bmMgPT4ge1xyXG4gICAgICBmdW5jKGRhdGEpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59OyJdfQ==
