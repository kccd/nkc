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
    var _this = this;

    _classCallCheck(this, _class);

    var hl = options.hl,
        nodes = options.nodes,
        id = options.id;
    var self = this;
    this.hl = hl;
    this.nodes = nodes;
    this.content = hl.getNodesContent(nodes);
    this.dom = [];
    this.id = id;
    this._id = "nkc-hl-id-".concat(id);
    this.nodes.forEach(function (node) {
      var offset = node.offset,
          length = node.length;
      var targetNotes = self.getNodes(_this.hl.root, offset, length);
      targetNotes.map(function (targetNode) {
        var span = document.createElement("span");
        self.dom.push(span);
        span.addEventListener("mouseover", function () {
          self.hl.emit(self.hl.eventNames.hover, self);
        });
        span.addEventListener("mouseout", function () {
          self.hl.emit(self.hl.eventNames.hoverOut, self);
        });
        span.addEventListener("click", function () {
          self.hl.emit(self.hl.eventNames.click, self);
        });
        span.setAttribute("class", "nkc-hl ".concat(self._id));
        span.appendChild(targetNode.cloneNode(false));
        targetNode.parentNode.replaceChild(span, targetNode);
      });
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
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = self.hl.excludedElementClass[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var c = _step.value;

                if (cl.contains(c)) {
                  continue loop;
                }
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
        excludedElementClass = _options$excludedElem === void 0 ? [] : _options$excludedElem;
    var self = this;
    self.root = document.getElementById(rootElementId);
    self.excludedElementClass = excludedElementClass;
    self.position = {
      x: 0,
      y: 0
    };
    self.range = {};
    self.sources = [];
    self.events = {};
    self.eventNames = {
      create: "create",
      hover: "hover",
      hoverOut: "hoverOut",
      select: "select"
    };
    window.addEventListener("mouseup", function (e) {
      self.position.x = e.clientX;
      self.position.y = e.clientY;
      var range = self.getRange();
      if (!range) return;
      if (range.startContainer === self.range.startContainer && range.endContainer === self.range.endContainer && range.startOffset === self.range.startOffset && range.endOffset === self.range.endOffset) return; // 限制选择文字的区域，只能是selecter内的文字

      if (!self.root.contains(range.startContainer) || !self.root.contains(range.endContainer)) return;
      self.range = range;
      self.emit(self.eventNames.select, {
        position: self.position,
        range: range
      });
    });
  }

  _createClass(_class2, [{
    key: "getParent",
    value: function getParent(self, d) {
      if (d === self.root) return;

      if (d.nodeType === 1) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = self.excludedElementClass[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var c = _step2.value;
            if (d.classList.contains(c)) throw new Error("划词区域已被忽略");
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

        if (this.excludedElementClass.length) {
          this.getParent(this, startContainer);
          this.getParent(this, endContainer);
        }

        if (startOffset === endOffset) return;
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
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = sources[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _source = _step3.value;
          _source.hl = this;
          new Source(_source);
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
          endOffset = range.endOffset;
      if (startOffset === endOffset) return;
      var selectedNodes = [],
          startNode,
          endNode;
      if (startContainer.nodeType !== 3 || startContainer.nodeType !== 3) return;

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
        endNode = endContainer;
        selectedNodes.push({
          node: startNode,
          offset: startOffset,
          length: startNode.textContent.length - startOffset
        });
        selectedNodes.push({
          node: endNode,
          offset: 0,
          length: endOffset
        });

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
      }

      var nodes = [];

      for (var _i = 0, _selectedNodes = selectedNodes; _i < _selectedNodes.length; _i++) {
        var obj = _selectedNodes[_i];
        var _node2 = obj.node,
            offset = obj.offset,
            length = obj.length;

        var content = _node2.textContent.slice(offset, offset + length);

        var offset_ = this.getOffset(_node2);
        nodes.push({
          content: content,
          offset: offset_ + offset,
          length: length
        });
      }

      return nodes;
    }
  }, {
    key: "getNodesContent",
    value: function getNodesContent(nodes) {
      var content = "";
      nodes.map(function (node) {
        content += node.content;
      });
      return content;
    }
  }, {
    key: "createSource",
    value: function createSource(id, nodes) {
      return new Source({
        hl: this,
        id: id,
        nodes: nodes
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
          if (s.id === id) return source;
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
        var children = curNode.childNodes;

        loop: for (var i = children.length - 1; i >= 0; i--) {
          var node = children[i];

          if (node.nodeType === 1) {
            var cl = node.classList;
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
              for (var _iterator6 = self.excludedElementClass[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                var c = _step6.value;

                if (cl.contains(c)) {
                  continue loop;
                }
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
      var selectedNodes = []; // const parent = this.getSameParentNode(startNode, endNode);

      var parent = this.root;

      if (parent) {
        var start = false,
            end = false;

        var getChildNode = function getChildNode(node) {
          if (!node.hasChildNodes()) return;
          var _iteratorNormalCompletion7 = true;
          var _didIteratorError7 = false;
          var _iteratorError7 = undefined;

          try {
            for (var _iterator7 = node.childNodes[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
              var n = _step7.value;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvTktDSGlnaGxpZ2h0ZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7O0FBU0EsTUFBTSxDQUFDLE1BQVA7QUFBQTtBQUFBO0FBQ0Usa0JBQVksT0FBWixFQUFxQjtBQUFBOztBQUFBOztBQUFBLFFBQ1osRUFEWSxHQUNLLE9BREwsQ0FDWixFQURZO0FBQUEsUUFDUixLQURRLEdBQ0ssT0FETCxDQUNSLEtBRFE7QUFBQSxRQUNELEVBREMsR0FDSyxPQURMLENBQ0QsRUFEQztBQUVuQixRQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsU0FBSyxFQUFMLEdBQVUsRUFBVjtBQUNBLFNBQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxTQUFLLE9BQUwsR0FBZSxFQUFFLENBQUMsZUFBSCxDQUFtQixLQUFuQixDQUFmO0FBQ0EsU0FBSyxHQUFMLEdBQVcsRUFBWDtBQUNBLFNBQUssRUFBTCxHQUFVLEVBQVY7QUFDQSxTQUFLLEdBQUwsdUJBQXdCLEVBQXhCO0FBQ0EsU0FBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixVQUFBLElBQUksRUFBSTtBQUFBLFVBQ2xCLE1BRGtCLEdBQ0EsSUFEQSxDQUNsQixNQURrQjtBQUFBLFVBQ1YsTUFEVSxHQUNBLElBREEsQ0FDVixNQURVO0FBRXpCLFVBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxRQUFMLENBQWMsS0FBSSxDQUFDLEVBQUwsQ0FBUSxJQUF0QixFQUE0QixNQUE1QixFQUFvQyxNQUFwQyxDQUFwQjtBQUNBLE1BQUEsV0FBVyxDQUFDLEdBQVosQ0FBZ0IsVUFBQSxVQUFVLEVBQUk7QUFDNUIsWUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsTUFBdkIsQ0FBYjtBQUNBLFFBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFULENBQWMsSUFBZDtBQUNBLFFBQUEsSUFBSSxDQUFDLGdCQUFMLENBQXNCLFdBQXRCLEVBQW1DLFlBQU07QUFDdkMsVUFBQSxJQUFJLENBQUMsRUFBTCxDQUFRLElBQVIsQ0FBYSxJQUFJLENBQUMsRUFBTCxDQUFRLFVBQVIsQ0FBbUIsS0FBaEMsRUFBdUMsSUFBdkM7QUFDRCxTQUZEO0FBR0EsUUFBQSxJQUFJLENBQUMsZ0JBQUwsQ0FBc0IsVUFBdEIsRUFBa0MsWUFBTTtBQUN0QyxVQUFBLElBQUksQ0FBQyxFQUFMLENBQVEsSUFBUixDQUFhLElBQUksQ0FBQyxFQUFMLENBQVEsVUFBUixDQUFtQixRQUFoQyxFQUEwQyxJQUExQztBQUNELFNBRkQ7QUFHQSxRQUFBLElBQUksQ0FBQyxnQkFBTCxDQUFzQixPQUF0QixFQUErQixZQUFNO0FBQ25DLFVBQUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxJQUFSLENBQWEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxVQUFSLENBQW1CLEtBQWhDLEVBQXVDLElBQXZDO0FBQ0QsU0FGRDtBQUdBLFFBQUEsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsT0FBbEIsbUJBQXFDLElBQUksQ0FBQyxHQUExQztBQUNBLFFBQUEsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsVUFBVSxDQUFDLFNBQVgsQ0FBcUIsS0FBckIsQ0FBakI7QUFDQSxRQUFBLFVBQVUsQ0FBQyxVQUFYLENBQXNCLFlBQXRCLENBQW1DLElBQW5DLEVBQXlDLFVBQXpDO0FBQ0QsT0FmRDtBQWdCRCxLQW5CRDtBQW9CQSxTQUFLLEVBQUwsQ0FBUSxPQUFSLENBQWdCLElBQWhCLENBQXFCLElBQXJCO0FBQ0EsU0FBSyxFQUFMLENBQVEsSUFBUixDQUFhLEtBQUssRUFBTCxDQUFRLFVBQVIsQ0FBbUIsTUFBaEMsRUFBd0MsSUFBeEM7QUFDRDs7QUFoQ0g7QUFBQTtBQUFBLDZCQWlDVyxLQWpDWCxFQWlDa0I7QUFBQSxVQUNQLEdBRE8sR0FDQSxJQURBLENBQ1AsR0FETztBQUVkLE1BQUEsR0FBRyxDQUFDLEdBQUosQ0FBUSxVQUFBLENBQUMsRUFBSTtBQUNYLFFBQUEsQ0FBQyxDQUFDLFNBQUYsQ0FBWSxHQUFaLENBQWdCLEtBQWhCO0FBQ0QsT0FGRDtBQUdEO0FBdENIO0FBQUE7QUFBQSxnQ0F1Q2MsS0F2Q2QsRUF1Q3FCO0FBQUEsVUFDVixHQURVLEdBQ0gsSUFERyxDQUNWLEdBRFU7QUFFakIsTUFBQSxHQUFHLENBQUMsR0FBSixDQUFRLFVBQUEsQ0FBQyxFQUFJO0FBQ1gsUUFBQSxDQUFDLENBQUMsU0FBRixDQUFZLE1BQVosQ0FBbUIsS0FBbkI7QUFDRCxPQUZEO0FBR0Q7QUE1Q0g7QUFBQTtBQUFBLDhCQTZDWTtBQUNSLFdBQUssR0FBTCxDQUFTLEdBQVQsQ0FBYSxVQUFBLENBQUMsRUFBSTtBQUNoQixRQUFBLENBQUMsQ0FBQyxTQUFGLEdBQWMsRUFBZDtBQUNELE9BRkQ7QUFHRDtBQWpESDtBQUFBO0FBQUEsaUNBa0RlO0FBQ1gsYUFBTyxLQUFLLE9BQVo7QUFDRDtBQXBESDtBQUFBO0FBQUEsNkJBcURXLE1BckRYLEVBcURtQixNQXJEbkIsRUFxRDJCLE1BckQzQixFQXFEbUM7QUFDL0IsVUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFELENBQWxCO0FBQ0EsVUFBSSxTQUFTLEdBQUcsQ0FBaEI7QUFDQSxVQUFJLElBQUksR0FBRyxJQUFYO0FBQ0EsVUFBSSxTQUFTLEdBQUcsTUFBaEI7QUFDQSxVQUFJLEtBQUssR0FBRyxFQUFaO0FBQ0EsVUFBSSxPQUFPLEdBQUcsS0FBZDtBQUNBLFVBQU0sSUFBSSxHQUFHLElBQWI7O0FBQ0EsYUFBTSxDQUFDLEVBQUUsSUFBSSxHQUFHLFNBQVMsQ0FBQyxHQUFWLEVBQVQsQ0FBUCxFQUFrQztBQUNoQyxZQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBdEI7O0FBQ0EsUUFBQSxJQUFJLEVBQ0YsS0FBSyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBVCxHQUFrQixDQUEvQixFQUFrQyxDQUFDLElBQUksQ0FBdkMsRUFBMEMsQ0FBQyxFQUEzQyxFQUErQztBQUM3QyxjQUFNLEtBQUksR0FBRyxRQUFRLENBQUMsQ0FBRCxDQUFyQjs7QUFDQSxjQUFHLEtBQUksQ0FBQyxRQUFMLEtBQWtCLENBQXJCLEVBQXdCO0FBQ3RCLGdCQUFNLEVBQUUsR0FBRyxLQUFJLENBQUMsU0FBaEI7QUFEc0I7QUFBQTtBQUFBOztBQUFBO0FBRXRCLG1DQUFlLElBQUksQ0FBQyxFQUFMLENBQVEsb0JBQXZCLDhIQUE2QztBQUFBLG9CQUFuQyxDQUFtQzs7QUFDM0Msb0JBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBWSxDQUFaLENBQUgsRUFBbUI7QUFDakIsMkJBQVMsSUFBVDtBQUNEO0FBQ0Y7QUFOcUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQU92Qjs7QUFDRCxVQUFBLFNBQVMsQ0FBQyxJQUFWLENBQWUsS0FBZjtBQUNEOztBQUNILFlBQUcsSUFBSSxDQUFDLFFBQUwsS0FBa0IsQ0FBbEIsSUFBdUIsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsTUFBM0MsRUFBbUQ7QUFDakQsVUFBQSxTQUFTLElBQUksSUFBSSxDQUFDLFdBQUwsQ0FBaUIsTUFBOUI7O0FBQ0EsY0FBRyxTQUFTLEdBQUcsTUFBZixFQUF1QjtBQUNyQixnQkFBRyxTQUFTLElBQUksQ0FBaEIsRUFBbUI7QUFDbkIsZ0JBQUksV0FBVyxTQUFmOztBQUNBLGdCQUFHLENBQUMsT0FBSixFQUFhO0FBQ1gsY0FBQSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsTUFBakIsSUFBMkIsU0FBUyxHQUFHLE1BQXZDLENBQWQ7QUFDRCxhQUZELE1BRU87QUFDTCxjQUFBLFdBQVcsR0FBRyxDQUFkO0FBQ0Q7O0FBQ0QsWUFBQSxPQUFPLEdBQUcsSUFBVjtBQUNBLGdCQUFJLFVBQVUsU0FBZDs7QUFDQSxnQkFBRyxTQUFTLElBQUksSUFBSSxDQUFDLFdBQUwsQ0FBaUIsTUFBakIsR0FBMEIsV0FBMUMsRUFBdUQ7QUFDckQsY0FBQSxVQUFVLEdBQUcsU0FBYjtBQUNBLGNBQUEsU0FBUyxHQUFHLENBQVo7QUFDRCxhQUhELE1BR087QUFDTCxjQUFBLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBTCxDQUFpQixNQUFqQixHQUEwQixXQUF2QztBQUNBLGNBQUEsU0FBUyxJQUFJLFVBQWI7QUFDRDs7QUFDRCxZQUFBLEtBQUssQ0FBQyxJQUFOLENBQVc7QUFDVCxjQUFBLElBQUksRUFBSixJQURTO0FBRVQsY0FBQSxXQUFXLEVBQVgsV0FGUztBQUdULGNBQUEsVUFBVSxFQUFWO0FBSFMsYUFBWDtBQUtEO0FBQ0Y7QUFDRjs7QUFDRCxNQUFBLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBTixDQUFVLFVBQUEsR0FBRyxFQUFJO0FBQUEsWUFDbEIsSUFEa0IsR0FDZSxHQURmLENBQ2xCLElBRGtCO0FBQUEsWUFDWixXQURZLEdBQ2UsR0FEZixDQUNaLFdBRFk7QUFBQSxZQUNDLFVBREQsR0FDZSxHQURmLENBQ0MsVUFERDs7QUFFdkIsWUFBRyxXQUFXLEdBQUcsQ0FBakIsRUFBb0I7QUFDbEIsVUFBQSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQUwsQ0FBZSxXQUFmLENBQVA7QUFDRDs7QUFDRCxZQUFHLElBQUksQ0FBQyxXQUFMLENBQWlCLE1BQWpCLEtBQTRCLFVBQS9CLEVBQTJDO0FBQ3pDLFVBQUEsSUFBSSxDQUFDLFNBQUwsQ0FBZSxVQUFmO0FBQ0Q7O0FBQ0QsZUFBTyxJQUFQO0FBQ0QsT0FUTyxDQUFSO0FBVUEsYUFBTyxLQUFQO0FBQ0Q7QUFsSEg7O0FBQUE7QUFBQTs7QUFxSEEsTUFBTSxDQUFDLGNBQVA7QUFBQTtBQUFBO0FBQ0UsbUJBQVksT0FBWixFQUFxQjtBQUFBOztBQUFBLFFBRWpCLGFBRmlCLEdBR2YsT0FIZSxDQUVqQixhQUZpQjtBQUFBLGdDQUdmLE9BSGUsQ0FFRixvQkFGRTtBQUFBLFFBRUYsb0JBRkUsc0NBRXFCLEVBRnJCO0FBSW5CLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxJQUFBLElBQUksQ0FBQyxJQUFMLEdBQVksUUFBUSxDQUFDLGNBQVQsQ0FBd0IsYUFBeEIsQ0FBWjtBQUNBLElBQUEsSUFBSSxDQUFDLG9CQUFMLEdBQTRCLG9CQUE1QjtBQUNBLElBQUEsSUFBSSxDQUFDLFFBQUwsR0FBZ0I7QUFDZCxNQUFBLENBQUMsRUFBRSxDQURXO0FBRWQsTUFBQSxDQUFDLEVBQUU7QUFGVyxLQUFoQjtBQUlBLElBQUEsSUFBSSxDQUFDLEtBQUwsR0FBYSxFQUFiO0FBQ0EsSUFBQSxJQUFJLENBQUMsT0FBTCxHQUFlLEVBQWY7QUFDQSxJQUFBLElBQUksQ0FBQyxNQUFMLEdBQWMsRUFBZDtBQUNBLElBQUEsSUFBSSxDQUFDLFVBQUwsR0FBa0I7QUFDaEIsTUFBQSxNQUFNLEVBQUUsUUFEUTtBQUVoQixNQUFBLEtBQUssRUFBRSxPQUZTO0FBR2hCLE1BQUEsUUFBUSxFQUFFLFVBSE07QUFJaEIsTUFBQSxNQUFNLEVBQUU7QUFKUSxLQUFsQjtBQU9BLElBQUEsTUFBTSxDQUFDLGdCQUFQLENBQXdCLFNBQXhCLEVBQW1DLFVBQVMsQ0FBVCxFQUFZO0FBQzdDLE1BQUEsSUFBSSxDQUFDLFFBQUwsQ0FBYyxDQUFkLEdBQWtCLENBQUMsQ0FBQyxPQUFwQjtBQUNBLE1BQUEsSUFBSSxDQUFDLFFBQUwsQ0FBYyxDQUFkLEdBQWtCLENBQUMsQ0FBQyxPQUFwQjtBQUNBLFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFMLEVBQWQ7QUFDQSxVQUFHLENBQUMsS0FBSixFQUFXO0FBQ1gsVUFDRSxLQUFLLENBQUMsY0FBTixLQUF5QixJQUFJLENBQUMsS0FBTCxDQUFXLGNBQXBDLElBQ0EsS0FBSyxDQUFDLFlBQU4sS0FBdUIsSUFBSSxDQUFDLEtBQUwsQ0FBVyxZQURsQyxJQUVBLEtBQUssQ0FBQyxXQUFOLEtBQXNCLElBQUksQ0FBQyxLQUFMLENBQVcsV0FGakMsSUFHQSxLQUFLLENBQUMsU0FBTixLQUFvQixJQUFJLENBQUMsS0FBTCxDQUFXLFNBSmpDLEVBS0UsT0FWMkMsQ0FXN0M7O0FBQ0EsVUFBRyxDQUFDLElBQUksQ0FBQyxJQUFMLENBQVUsUUFBVixDQUFtQixLQUFLLENBQUMsY0FBekIsQ0FBRCxJQUE2QyxDQUFDLElBQUksQ0FBQyxJQUFMLENBQVUsUUFBVixDQUFtQixLQUFLLENBQUMsWUFBekIsQ0FBakQsRUFBeUY7QUFDekYsTUFBQSxJQUFJLENBQUMsS0FBTCxHQUFhLEtBQWI7QUFDQSxNQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsTUFBMUIsRUFBa0M7QUFDaEMsUUFBQSxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBRGlCO0FBRWhDLFFBQUEsS0FBSyxFQUFMO0FBRmdDLE9BQWxDO0FBSUQsS0FsQkQ7QUFtQkQ7O0FBekNIO0FBQUE7QUFBQSw4QkEwQ1ksSUExQ1osRUEwQ2tCLENBMUNsQixFQTBDcUI7QUFDakIsVUFBRyxDQUFDLEtBQUssSUFBSSxDQUFDLElBQWQsRUFBb0I7O0FBQ3BCLFVBQUcsQ0FBQyxDQUFDLFFBQUYsS0FBZSxDQUFsQixFQUFxQjtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUNuQixnQ0FBZSxJQUFJLENBQUMsb0JBQXBCLG1JQUEwQztBQUFBLGdCQUFoQyxDQUFnQztBQUN4QyxnQkFBRyxDQUFDLENBQUMsU0FBRixDQUFZLFFBQVosQ0FBcUIsQ0FBckIsQ0FBSCxFQUE0QixNQUFNLElBQUksS0FBSixDQUFVLFVBQVYsQ0FBTjtBQUM3QjtBQUhrQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSXBCOztBQUNELFVBQUcsQ0FBQyxDQUFDLFVBQUwsRUFBaUIsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFmLEVBQXFCLENBQUMsQ0FBQyxVQUF2QjtBQUNsQjtBQWxESDtBQUFBO0FBQUEsK0JBbURhO0FBQ1QsVUFBRztBQUNELFlBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxZQUFQLEdBQXNCLFVBQXRCLENBQWlDLENBQWpDLENBQWQ7QUFEQyxZQUVNLFdBRk4sR0FFOEQsS0FGOUQsQ0FFTSxXQUZOO0FBQUEsWUFFbUIsU0FGbkIsR0FFOEQsS0FGOUQsQ0FFbUIsU0FGbkI7QUFBQSxZQUU4QixjQUY5QixHQUU4RCxLQUY5RCxDQUU4QixjQUY5QjtBQUFBLFlBRThDLFlBRjlDLEdBRThELEtBRjlELENBRThDLFlBRjlDOztBQUdELFlBQUcsS0FBSyxvQkFBTCxDQUEwQixNQUE3QixFQUFxQztBQUNuQyxlQUFLLFNBQUwsQ0FBZSxJQUFmLEVBQXFCLGNBQXJCO0FBQ0EsZUFBSyxTQUFMLENBQWUsSUFBZixFQUFxQixZQUFyQjtBQUNEOztBQUNELFlBQUcsV0FBVyxLQUFLLFNBQW5CLEVBQThCO0FBQzlCLGVBQU8sS0FBUDtBQUNELE9BVEQsQ0FTRSxPQUFNLEdBQU4sRUFBVztBQUNYLFFBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxHQUFaO0FBQ0Q7QUFDRjtBQWhFSDtBQUFBO0FBQUEsNEJBaUVVLE1BakVWLEVBaUVrQjtBQUNkLFVBQUcsT0FBTyxNQUFQLEtBQWtCLFFBQXJCLEVBQStCO0FBQzdCLFFBQUEsTUFBTSxHQUFHLEtBQUssYUFBTCxDQUFtQixNQUFuQixDQUFUO0FBQ0Q7O0FBQ0QsTUFBQSxNQUFNLENBQUMsT0FBUDtBQUNEO0FBdEVIO0FBQUE7QUFBQSxxQ0F1RStCO0FBQUEsVUFBZCxPQUFjLHVFQUFKLEVBQUk7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDM0IsOEJBQW9CLE9BQXBCLG1JQUE2QjtBQUFBLGNBQW5CLE9BQW1CO0FBQzNCLFVBQUEsT0FBTSxDQUFDLEVBQVAsR0FBWSxJQUFaO0FBQ0EsY0FBSSxNQUFKLENBQVcsT0FBWDtBQUNEO0FBSjBCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFLNUI7QUE1RUg7QUFBQTtBQUFBLDZCQTZFVyxLQTdFWCxFQTZFa0I7QUFBQSxVQUNQLGNBRE8sR0FDaUQsS0FEakQsQ0FDUCxjQURPO0FBQUEsVUFDUyxZQURULEdBQ2lELEtBRGpELENBQ1MsWUFEVDtBQUFBLFVBQ3VCLFdBRHZCLEdBQ2lELEtBRGpELENBQ3VCLFdBRHZCO0FBQUEsVUFDb0MsU0FEcEMsR0FDaUQsS0FEakQsQ0FDb0MsU0FEcEM7QUFFZCxVQUFHLFdBQVcsS0FBSyxTQUFuQixFQUE4QjtBQUM5QixVQUFJLGFBQWEsR0FBRyxFQUFwQjtBQUFBLFVBQXdCLFNBQXhCO0FBQUEsVUFBbUMsT0FBbkM7QUFDQSxVQUFHLGNBQWMsQ0FBQyxRQUFmLEtBQTRCLENBQTVCLElBQWlDLGNBQWMsQ0FBQyxRQUFmLEtBQTRCLENBQWhFLEVBQW1FOztBQUNuRSxVQUFHLGNBQWMsS0FBSyxZQUF0QixFQUFvQztBQUNsQztBQUNBLFFBQUEsU0FBUyxHQUFHLGNBQVo7QUFDQSxRQUFBLE9BQU8sR0FBRyxTQUFWO0FBQ0EsUUFBQSxhQUFhLENBQUMsSUFBZCxDQUFtQjtBQUNqQixVQUFBLElBQUksRUFBRSxTQURXO0FBRWpCLFVBQUEsTUFBTSxFQUFFLFdBRlM7QUFHakIsVUFBQSxNQUFNLEVBQUUsU0FBUyxHQUFHO0FBSEgsU0FBbkI7QUFLRCxPQVRELE1BU087QUFDTCxRQUFBLFNBQVMsR0FBRyxjQUFaO0FBQ0EsUUFBQSxPQUFPLEdBQUcsWUFBVjtBQUNBLFFBQUEsYUFBYSxDQUFDLElBQWQsQ0FBbUI7QUFDakIsVUFBQSxJQUFJLEVBQUUsU0FEVztBQUVqQixVQUFBLE1BQU0sRUFBRSxXQUZTO0FBR2pCLFVBQUEsTUFBTSxFQUFFLFNBQVMsQ0FBQyxXQUFWLENBQXNCLE1BQXRCLEdBQStCO0FBSHRCLFNBQW5CO0FBS0EsUUFBQSxhQUFhLENBQUMsSUFBZCxDQUFtQjtBQUNqQixVQUFBLElBQUksRUFBRSxPQURXO0FBRWpCLFVBQUEsTUFBTSxFQUFFLENBRlM7QUFHakIsVUFBQSxNQUFNLEVBQUU7QUFIUyxTQUFuQjs7QUFLQSxZQUFNLE1BQUssR0FBRyxLQUFLLFNBQUwsQ0FBZSxTQUFmLEVBQTBCLE9BQTFCLENBQWQ7O0FBYks7QUFBQTtBQUFBOztBQUFBO0FBY0wsZ0NBQWtCLE1BQWxCLG1JQUF5QjtBQUFBLGdCQUFmLElBQWU7QUFDdkIsWUFBQSxhQUFhLENBQUMsSUFBZCxDQUFtQjtBQUNqQixjQUFBLElBQUksRUFBSixJQURpQjtBQUVqQixjQUFBLE1BQU0sRUFBRSxDQUZTO0FBR2pCLGNBQUEsTUFBTSxFQUFFLElBQUksQ0FBQyxXQUFMLENBQWlCO0FBSFIsYUFBbkI7QUFLRDtBQXBCSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBcUJOOztBQUNELFVBQU0sS0FBSyxHQUFHLEVBQWQ7O0FBQ0Esd0NBQWlCLGFBQWpCLG9DQUFnQztBQUE1QixZQUFNLEdBQUcscUJBQVQ7QUFBNEIsWUFDdkIsTUFEdUIsR0FDQyxHQURELENBQ3ZCLElBRHVCO0FBQUEsWUFDakIsTUFEaUIsR0FDQyxHQURELENBQ2pCLE1BRGlCO0FBQUEsWUFDVCxNQURTLEdBQ0MsR0FERCxDQUNULE1BRFM7O0FBRTlCLFlBQU0sT0FBTyxHQUFHLE1BQUksQ0FBQyxXQUFMLENBQWlCLEtBQWpCLENBQXVCLE1BQXZCLEVBQStCLE1BQU0sR0FBRyxNQUF4QyxDQUFoQjs7QUFDQSxZQUFNLE9BQU8sR0FBRyxLQUFLLFNBQUwsQ0FBZSxNQUFmLENBQWhCO0FBQ0EsUUFBQSxLQUFLLENBQUMsSUFBTixDQUFXO0FBQ1QsVUFBQSxPQUFPLEVBQVAsT0FEUztBQUVULFVBQUEsTUFBTSxFQUFFLE9BQU8sR0FBRyxNQUZUO0FBR1QsVUFBQSxNQUFNLEVBQU47QUFIUyxTQUFYO0FBS0Q7O0FBQ0QsYUFBTyxLQUFQO0FBQ0Q7QUE3SEg7QUFBQTtBQUFBLG9DQThIa0IsS0E5SGxCLEVBOEh5QjtBQUNyQixVQUFJLE9BQU8sR0FBRyxFQUFkO0FBQ0EsTUFBQSxLQUFLLENBQUMsR0FBTixDQUFVLFVBQUEsSUFBSSxFQUFJO0FBQ2hCLFFBQUEsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFoQjtBQUNELE9BRkQ7QUFHQSxhQUFPLE9BQVA7QUFDRDtBQXBJSDtBQUFBO0FBQUEsaUNBcUllLEVBcklmLEVBcUltQixLQXJJbkIsRUFxSTBCO0FBQ3RCLGFBQU8sSUFBSSxNQUFKLENBQVc7QUFDaEIsUUFBQSxFQUFFLEVBQUUsSUFEWTtBQUVoQixRQUFBLEVBQUUsRUFBRixFQUZnQjtBQUdoQixRQUFBLEtBQUssRUFBTDtBQUhnQixPQUFYLENBQVA7QUFLRDtBQTNJSDtBQUFBO0FBQUEsa0NBNElnQixFQTVJaEIsRUE0SW9CO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ2hCLDhCQUFlLEtBQUssT0FBcEIsbUlBQTZCO0FBQUEsY0FBbkIsQ0FBbUI7QUFDM0IsY0FBRyxDQUFDLENBQUMsRUFBRixLQUFTLEVBQVosRUFBZ0IsT0FBTyxNQUFQO0FBQ2pCO0FBSGU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUlqQjtBQWhKSDtBQUFBO0FBQUEsNkJBaUpXLEVBakpYLEVBaUplLFNBakpmLEVBaUowQjtBQUN0QixVQUFJLE1BQUo7O0FBQ0EsVUFBRyxPQUFPLEVBQVAsS0FBYyxRQUFqQixFQUEyQjtBQUN6QixRQUFBLE1BQU0sR0FBRyxLQUFLLGFBQUwsQ0FBbUIsRUFBbkIsQ0FBVDtBQUNELE9BRkQsTUFFTztBQUNMLFFBQUEsTUFBTSxHQUFHLEVBQVQ7QUFDRDs7QUFDRCxNQUFBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLFNBQWhCO0FBQ0Q7QUF6Skg7QUFBQTtBQUFBLGdDQTBKYyxFQTFKZCxFQTBKa0IsU0ExSmxCLEVBMEo2QjtBQUN6QixVQUFJLE1BQUo7O0FBQ0EsVUFBRyxPQUFPLEVBQVAsS0FBYyxRQUFqQixFQUEyQjtBQUN6QixRQUFBLE1BQU0sR0FBRyxLQUFLLGFBQUwsQ0FBbUIsRUFBbkIsQ0FBVDtBQUNELE9BRkQsTUFFTztBQUNMLFFBQUEsTUFBTSxHQUFHLEVBQVQ7QUFDRDs7QUFDRCxNQUFBLE1BQU0sQ0FBQyxXQUFQLENBQW1CLFNBQW5CO0FBQ0Q7QUFsS0g7QUFBQTtBQUFBLDhCQW1LWSxJQW5LWixFQW1La0I7QUFDZCxVQUFNLFNBQVMsR0FBRyxDQUFDLEtBQUssSUFBTixDQUFsQjtBQUNBLFVBQUksT0FBTyxHQUFHLElBQWQ7QUFDQSxVQUFJLE1BQU0sR0FBRyxDQUFiO0FBQ0EsVUFBTSxJQUFJLEdBQUcsSUFBYjs7QUFDQSxhQUFPLENBQUMsRUFBRSxPQUFPLEdBQUcsU0FBUyxDQUFDLEdBQVYsRUFBWixDQUFSLEVBQXNDO0FBQ3BDLFlBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxVQUF6Qjs7QUFDQSxRQUFBLElBQUksRUFDRixLQUFLLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFULEdBQWtCLENBQS9CLEVBQWtDLENBQUMsSUFBSSxDQUF2QyxFQUEwQyxDQUFDLEVBQTNDLEVBQStDO0FBQzdDLGNBQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFELENBQXJCOztBQUNBLGNBQUcsSUFBSSxDQUFDLFFBQUwsS0FBa0IsQ0FBckIsRUFBd0I7QUFDdEIsZ0JBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFoQjtBQURzQjtBQUFBO0FBQUE7O0FBQUE7QUFFdEIsb0NBQWUsSUFBSSxDQUFDLG9CQUFwQixtSUFBMEM7QUFBQSxvQkFBaEMsQ0FBZ0M7O0FBQ3hDLG9CQUFHLEVBQUUsQ0FBQyxRQUFILENBQVksQ0FBWixDQUFILEVBQW1CO0FBQ2pCLDJCQUFTLElBQVQ7QUFDRDtBQUNGO0FBTnFCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFPdkI7O0FBQ0QsVUFBQSxTQUFTLENBQUMsSUFBVixDQUFlLElBQWY7QUFDRDs7QUFFSCxZQUFJLE9BQU8sQ0FBQyxRQUFSLEtBQXFCLENBQXJCLElBQTBCLE9BQU8sS0FBSyxJQUExQyxFQUFnRDtBQUM5QyxVQUFBLE1BQU0sSUFBSSxPQUFPLENBQUMsV0FBUixDQUFvQixNQUE5QjtBQUNELFNBRkQsTUFHSyxJQUFJLE9BQU8sQ0FBQyxRQUFSLEtBQXFCLENBQXpCLEVBQTRCO0FBQy9CO0FBQ0Q7QUFDRjs7QUFDRCxhQUFPLE1BQVA7QUFDRDtBQWhNSDtBQUFBO0FBQUEsOEJBaU1ZLFNBak1aLEVBaU11QixPQWpNdkIsRUFpTWdDO0FBQzVCLFVBQU0sYUFBYSxHQUFHLEVBQXRCLENBRDRCLENBRTVCOztBQUNBLFVBQU0sTUFBTSxHQUFHLEtBQUssSUFBcEI7O0FBQ0EsVUFBRyxNQUFILEVBQVc7QUFDVCxZQUFJLEtBQUssR0FBRyxLQUFaO0FBQUEsWUFBbUIsR0FBRyxHQUFHLEtBQXpCOztBQUNBLFlBQU0sWUFBWSxHQUFHLFNBQWYsWUFBZSxDQUFDLElBQUQsRUFBVTtBQUM3QixjQUFHLENBQUMsSUFBSSxDQUFDLGFBQUwsRUFBSixFQUEwQjtBQURHO0FBQUE7QUFBQTs7QUFBQTtBQUU3QixrQ0FBZSxJQUFJLENBQUMsVUFBcEIsbUlBQWdDO0FBQUEsa0JBQXRCLENBQXNCOztBQUM5QixrQkFBRyxHQUFHLElBQUksQ0FBQyxLQUFLLE9BQWhCLEVBQXlCO0FBQ3ZCLGdCQUFBLEdBQUcsR0FBRyxJQUFOO0FBQ0E7QUFDRCxlQUhELE1BR08sSUFBRyxLQUFLLElBQUksQ0FBQyxDQUFDLFFBQUYsS0FBZSxDQUEzQixFQUE4QjtBQUNuQyxnQkFBQSxhQUFhLENBQUMsSUFBZCxDQUFtQixDQUFuQjtBQUNELGVBRk0sTUFFQSxJQUFHLENBQUMsS0FBSyxTQUFULEVBQW9CO0FBQ3pCLGdCQUFBLEtBQUssR0FBRyxJQUFSO0FBQ0Q7O0FBQ0QsY0FBQSxZQUFZLENBQUMsQ0FBRCxDQUFaO0FBQ0Q7QUFaNEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQWE5QixTQWJEOztBQWNBLFFBQUEsWUFBWSxDQUFDLE1BQUQsQ0FBWjtBQUNEOztBQUNELGFBQU8sYUFBUDtBQUNEO0FBeE5IO0FBQUE7QUFBQSxzQ0F5Tm9CLFNBek5wQixFQXlOK0IsT0F6Ti9CLEVBeU53QztBQUNwQyxVQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsVUFBRyxDQUFDLE9BQUQsSUFBWSxTQUFTLEtBQUssT0FBN0IsRUFBc0MsT0FBTyxTQUFTLENBQUMsVUFBakI7QUFDdEMsVUFBTSxVQUFVLEdBQUcsRUFBbkI7QUFBQSxVQUF1QixRQUFRLEdBQUcsRUFBbEM7O0FBQ0EsVUFBTSxTQUFTLEdBQUcsU0FBWixTQUFZLENBQUMsSUFBRCxFQUFPLEtBQVAsRUFBaUI7QUFDakMsUUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLElBQVg7O0FBQ0EsWUFBRyxJQUFJLEtBQUssSUFBSSxDQUFDLElBQWQsSUFBc0IsSUFBSSxDQUFDLFVBQTlCLEVBQTBDO0FBQ3hDLFVBQUEsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFOLEVBQWtCLEtBQWxCLENBQVQ7QUFDRDtBQUNGLE9BTEQ7O0FBTUEsTUFBQSxTQUFTLENBQUMsU0FBRCxFQUFZLFVBQVosQ0FBVDtBQUNBLE1BQUEsU0FBUyxDQUFDLE9BQUQsRUFBVSxRQUFWLENBQVQ7QUFDQSxVQUFJLE1BQUo7O0FBQ0Esc0NBQWtCLFVBQWxCLG1DQUE4QjtBQUExQixZQUFNLElBQUksbUJBQVY7O0FBQ0YsWUFBRyxRQUFRLENBQUMsUUFBVCxDQUFrQixJQUFsQixDQUFILEVBQTRCO0FBQzFCLFVBQUEsTUFBTSxHQUFHLElBQVQ7QUFDQTtBQUNEO0FBQ0Y7O0FBQ0QsYUFBTyxNQUFQO0FBQ0Q7QUE3T0g7QUFBQTtBQUFBLHVCQThPSyxTQTlPTCxFQThPZ0IsUUE5T2hCLEVBOE8wQjtBQUN0QixVQUFHLENBQUMsS0FBSyxNQUFMLENBQVksU0FBWixDQUFKLEVBQTRCO0FBQzFCLGFBQUssTUFBTCxDQUFZLFNBQVosSUFBeUIsRUFBekI7QUFDRDs7QUFDRCxXQUFLLE1BQUwsQ0FBWSxTQUFaLEVBQXVCLElBQXZCLENBQTRCLFFBQTVCO0FBQ0EsYUFBTyxJQUFQO0FBQ0Q7QUFwUEg7QUFBQTtBQUFBLHlCQXFQTyxTQXJQUCxFQXFQa0IsSUFyUGxCLEVBcVB3QjtBQUNwQixPQUFDLEtBQUssTUFBTCxDQUFZLFNBQVosS0FBMEIsRUFBM0IsRUFBK0IsR0FBL0IsQ0FBbUMsVUFBQSxJQUFJLEVBQUk7QUFDekMsUUFBQSxJQUFJLENBQUMsSUFBRCxDQUFKO0FBQ0QsT0FGRDtBQUdEO0FBelBIOztBQUFBO0FBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKiBcclxuICBldmVudHM6XHJcbiAgICBzZWxlY3Q6IOWIkuivjVxyXG4gICAgY3JlYXRlOiDliJvlu7rlrp7kvotcclxuICAgIGhvdmVyOiDpvKDmoIfmgqzmta5cclxuICAgIGhvdmVyT3V0OiDpvKDmoIfnp7vlvIBcclxuXHJcblxyXG4qL1xyXG53aW5kb3cuU291cmNlID0gY2xhc3Mge1xyXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgIGNvbnN0IHtobCwgbm9kZXMsIGlkfSA9IG9wdGlvbnM7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHRoaXMuaGwgPSBobDtcclxuICAgIHRoaXMubm9kZXMgPSBub2RlcztcclxuICAgIHRoaXMuY29udGVudCA9IGhsLmdldE5vZGVzQ29udGVudChub2Rlcyk7XHJcbiAgICB0aGlzLmRvbSA9IFtdO1xyXG4gICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgdGhpcy5faWQgPSBgbmtjLWhsLWlkLSR7aWR9YDtcclxuICAgIHRoaXMubm9kZXMuZm9yRWFjaChub2RlID0+IHtcclxuICAgICAgY29uc3Qge29mZnNldCwgbGVuZ3RofSA9IG5vZGU7XHJcbiAgICAgIGNvbnN0IHRhcmdldE5vdGVzID0gc2VsZi5nZXROb2Rlcyh0aGlzLmhsLnJvb3QsIG9mZnNldCwgbGVuZ3RoKTtcclxuICAgICAgdGFyZ2V0Tm90ZXMubWFwKHRhcmdldE5vZGUgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgICAgICBzZWxmLmRvbS5wdXNoKHNwYW4pO1xyXG4gICAgICAgIHNwYW4uYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3ZlclwiLCAoKSA9PiB7XHJcbiAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmhvdmVyLCBzZWxmKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzcGFuLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW91dFwiLCAoKSA9PiB7XHJcbiAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmhvdmVyT3V0LCBzZWxmKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzcGFuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmNsaWNrLCBzZWxmKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzcGFuLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIGBua2MtaGwgJHtzZWxmLl9pZH1gKTtcclxuICAgICAgICBzcGFuLmFwcGVuZENoaWxkKHRhcmdldE5vZGUuY2xvbmVOb2RlKGZhbHNlKSk7XHJcbiAgICAgICAgdGFyZ2V0Tm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChzcGFuLCB0YXJnZXROb2RlKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICAgIHRoaXMuaGwuc291cmNlcy5wdXNoKHRoaXMpO1xyXG4gICAgdGhpcy5obC5lbWl0KHRoaXMuaGwuZXZlbnROYW1lcy5jcmVhdGUsIHRoaXMpO1xyXG4gIH1cclxuICBhZGRDbGFzcyhrbGFzcykge1xyXG4gICAgY29uc3Qge2RvbX0gPSB0aGlzO1xyXG4gICAgZG9tLm1hcChkID0+IHtcclxuICAgICAgZC5jbGFzc0xpc3QuYWRkKGtsYXNzKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICByZW1vdmVDbGFzcyhrbGFzcykge1xyXG4gICAgY29uc3Qge2RvbX0gPSB0aGlzO1xyXG4gICAgZG9tLm1hcChkID0+IHtcclxuICAgICAgZC5jbGFzc0xpc3QucmVtb3ZlKGtsYXNzKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBkZXN0cm95KCkge1xyXG4gICAgdGhpcy5kb20ubWFwKGQgPT4ge1xyXG4gICAgICBkLmNsYXNzTmFtZSA9IFwiXCI7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgZ2V0U291cmNlcygpIHtcclxuICAgIHJldHVybiB0aGlzLnNvdXJjZXM7XHJcbiAgfVxyXG4gIGdldE5vZGVzKHBhcmVudCwgb2Zmc2V0LCBsZW5ndGgpIHtcclxuICAgIGNvbnN0IG5vZGVTdGFjayA9IFtwYXJlbnRdO1xyXG4gICAgbGV0IGN1ck9mZnNldCA9IDA7XHJcbiAgICBsZXQgbm9kZSA9IG51bGw7XHJcbiAgICBsZXQgY3VyTGVuZ3RoID0gbGVuZ3RoO1xyXG4gICAgbGV0IG5vZGVzID0gW107XHJcbiAgICBsZXQgc3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICB3aGlsZSghIShub2RlID0gbm9kZVN0YWNrLnBvcCgpKSkge1xyXG4gICAgICBjb25zdCBjaGlsZHJlbiA9IG5vZGUuY2hpbGROb2RlcztcclxuICAgICAgbG9vcDpcclxuICAgICAgICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgIGNvbnN0IG5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgIGlmKG5vZGUubm9kZVR5cGUgPT09IDEpIHtcclxuICAgICAgICAgICAgY29uc3QgY2wgPSBub2RlLmNsYXNzTGlzdDtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IGMgb2Ygc2VsZi5obC5leGNsdWRlZEVsZW1lbnRDbGFzcykge1xyXG4gICAgICAgICAgICAgIGlmKGNsLmNvbnRhaW5zKGMpKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZSBsb29wO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbm9kZVN0YWNrLnB1c2gobm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICBpZihub2RlLm5vZGVUeXBlID09PSAzICYmIG5vZGUudGV4dENvbnRlbnQubGVuZ3RoKSB7XHJcbiAgICAgICAgY3VyT2Zmc2V0ICs9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoO1xyXG4gICAgICAgIGlmKGN1ck9mZnNldCA+IG9mZnNldCkge1xyXG4gICAgICAgICAgaWYoY3VyTGVuZ3RoIDw9IDApIGJyZWFrO1xyXG4gICAgICAgICAgbGV0IHN0YXJ0T2Zmc2V0O1xyXG4gICAgICAgICAgaWYoIXN0YXJ0ZWQpIHtcclxuICAgICAgICAgICAgc3RhcnRPZmZzZXQgPSBub2RlLnRleHRDb250ZW50Lmxlbmd0aCAtIChjdXJPZmZzZXQgLSBvZmZzZXQpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3RhcnRPZmZzZXQgPSAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc3RhcnRlZCA9IHRydWU7XHJcbiAgICAgICAgICBsZXQgbmVlZExlbmd0aDtcclxuICAgICAgICAgIGlmKGN1ckxlbmd0aCA8PSBub2RlLnRleHRDb250ZW50Lmxlbmd0aCAtIHN0YXJ0T2Zmc2V0KSB7XHJcbiAgICAgICAgICAgIG5lZWRMZW5ndGggPSBjdXJMZW5ndGg7XHJcbiAgICAgICAgICAgIGN1ckxlbmd0aCA9IDA7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBuZWVkTGVuZ3RoID0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSBzdGFydE9mZnNldDtcclxuICAgICAgICAgICAgY3VyTGVuZ3RoIC09IG5lZWRMZW5ndGg7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBub2Rlcy5wdXNoKHtcclxuICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgc3RhcnRPZmZzZXQsXHJcbiAgICAgICAgICAgIG5lZWRMZW5ndGhcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgbm9kZXMgPSBub2Rlcy5tYXAob2JqID0+IHtcclxuICAgICAgbGV0IHtub2RlLCBzdGFydE9mZnNldCwgbmVlZExlbmd0aH0gPSBvYmo7XHJcbiAgICAgIGlmKHN0YXJ0T2Zmc2V0ID4gMCkge1xyXG4gICAgICAgIG5vZGUgPSBub2RlLnNwbGl0VGV4dChzdGFydE9mZnNldCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYobm9kZS50ZXh0Q29udGVudC5sZW5ndGggIT09IG5lZWRMZW5ndGgpIHtcclxuICAgICAgICBub2RlLnNwbGl0VGV4dChuZWVkTGVuZ3RoKTsgIFxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBub2RlO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbm9kZXM7XHJcbiAgfVxyXG59O1xyXG5cclxud2luZG93Lk5LQ0hpZ2hsaWdodGVyID0gY2xhc3Mge1xyXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgIGNvbnN0IHtcclxuICAgICAgcm9vdEVsZW1lbnRJZCwgZXhjbHVkZWRFbGVtZW50Q2xhc3MgPSBbXVxyXG4gICAgfSA9IG9wdGlvbnM7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHNlbGYucm9vdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHJvb3RFbGVtZW50SWQpO1xyXG4gICAgc2VsZi5leGNsdWRlZEVsZW1lbnRDbGFzcyA9IGV4Y2x1ZGVkRWxlbWVudENsYXNzO1xyXG4gICAgc2VsZi5wb3NpdGlvbiA9IHtcclxuICAgICAgeDogMCxcclxuICAgICAgeTogMFxyXG4gICAgfTtcclxuICAgIHNlbGYucmFuZ2UgPSB7fTtcclxuICAgIHNlbGYuc291cmNlcyA9IFtdO1xyXG4gICAgc2VsZi5ldmVudHMgPSB7fTtcclxuICAgIHNlbGYuZXZlbnROYW1lcyA9IHtcclxuICAgICAgY3JlYXRlOiBcImNyZWF0ZVwiLFxyXG4gICAgICBob3ZlcjogXCJob3ZlclwiLFxyXG4gICAgICBob3Zlck91dDogXCJob3Zlck91dFwiLFxyXG4gICAgICBzZWxlY3Q6IFwic2VsZWN0XCJcclxuICAgIH07XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgc2VsZi5wb3NpdGlvbi54ID0gZS5jbGllbnRYO1xyXG4gICAgICBzZWxmLnBvc2l0aW9uLnkgPSBlLmNsaWVudFk7XHJcbiAgICAgIGNvbnN0IHJhbmdlID0gc2VsZi5nZXRSYW5nZSgpO1xyXG4gICAgICBpZighcmFuZ2UpIHJldHVybjtcclxuICAgICAgaWYoXHJcbiAgICAgICAgcmFuZ2Uuc3RhcnRDb250YWluZXIgPT09IHNlbGYucmFuZ2Uuc3RhcnRDb250YWluZXIgJiZcclxuICAgICAgICByYW5nZS5lbmRDb250YWluZXIgPT09IHNlbGYucmFuZ2UuZW5kQ29udGFpbmVyICYmXHJcbiAgICAgICAgcmFuZ2Uuc3RhcnRPZmZzZXQgPT09IHNlbGYucmFuZ2Uuc3RhcnRPZmZzZXQgJiZcclxuICAgICAgICByYW5nZS5lbmRPZmZzZXQgPT09IHNlbGYucmFuZ2UuZW5kT2Zmc2V0XHJcbiAgICAgICkgcmV0dXJuO1xyXG4gICAgICAvLyDpmZDliLbpgInmi6nmloflrZfnmoTljLrln5/vvIzlj6rog73mmK9zZWxlY3RlcuWGheeahOaWh+Wtl1xyXG4gICAgICBpZighc2VsZi5yb290LmNvbnRhaW5zKHJhbmdlLnN0YXJ0Q29udGFpbmVyKSB8fCAhc2VsZi5yb290LmNvbnRhaW5zKHJhbmdlLmVuZENvbnRhaW5lcikpIHJldHVybjtcclxuICAgICAgc2VsZi5yYW5nZSA9IHJhbmdlO1xyXG4gICAgICBzZWxmLmVtaXQoc2VsZi5ldmVudE5hbWVzLnNlbGVjdCwge1xyXG4gICAgICAgIHBvc2l0aW9uOiBzZWxmLnBvc2l0aW9uLFxyXG4gICAgICAgIHJhbmdlXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGdldFBhcmVudChzZWxmLCBkKSB7XHJcbiAgICBpZihkID09PSBzZWxmLnJvb3QpIHJldHVybjtcclxuICAgIGlmKGQubm9kZVR5cGUgPT09IDEpIHtcclxuICAgICAgZm9yKGNvbnN0IGMgb2Ygc2VsZi5leGNsdWRlZEVsZW1lbnRDbGFzcykge1xyXG4gICAgICAgIGlmKGQuY2xhc3NMaXN0LmNvbnRhaW5zKGMpKSB0aHJvdyBuZXcgRXJyb3IoXCLliJLor43ljLrln5/lt7Looqvlv73nlaVcIik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmKGQucGFyZW50Tm9kZSkgc2VsZi5nZXRQYXJlbnQoc2VsZiwgZC5wYXJlbnROb2RlKTtcclxuICB9XHJcbiAgZ2V0UmFuZ2UoKSB7XHJcbiAgICB0cnl7XHJcbiAgICAgIGNvbnN0IHJhbmdlID0gd2luZG93LmdldFNlbGVjdGlvbigpLmdldFJhbmdlQXQoMCk7XHJcbiAgICAgIGNvbnN0IHtzdGFydE9mZnNldCwgZW5kT2Zmc2V0LCBzdGFydENvbnRhaW5lciwgZW5kQ29udGFpbmVyfSA9IHJhbmdlO1xyXG4gICAgICBpZih0aGlzLmV4Y2x1ZGVkRWxlbWVudENsYXNzLmxlbmd0aCkge1xyXG4gICAgICAgIHRoaXMuZ2V0UGFyZW50KHRoaXMsIHN0YXJ0Q29udGFpbmVyKTtcclxuICAgICAgICB0aGlzLmdldFBhcmVudCh0aGlzLCBlbmRDb250YWluZXIpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKHN0YXJ0T2Zmc2V0ID09PSBlbmRPZmZzZXQpIHJldHVybjtcclxuICAgICAgcmV0dXJuIHJhbmdlO1xyXG4gICAgfSBjYXRjaChlcnIpIHtcclxuICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgIH1cclxuICB9XHJcbiAgZGVzdHJveShzb3VyY2UpIHtcclxuICAgIGlmKHR5cGVvZiBzb3VyY2UgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgc291cmNlID0gdGhpcy5nZXRTb3VyY2VCeUlEKHNvdXJjZSk7XHJcbiAgICB9XHJcbiAgICBzb3VyY2UuZGVzdHJveSgpO1xyXG4gIH1cclxuICByZXN0b3JlU291cmNlcyhzb3VyY2VzID0gW10pIHtcclxuICAgIGZvcihjb25zdCBzb3VyY2Ugb2Ygc291cmNlcykge1xyXG4gICAgICBzb3VyY2UuaGwgPSB0aGlzO1xyXG4gICAgICBuZXcgU291cmNlKHNvdXJjZSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGdldE5vZGVzKHJhbmdlKSB7XHJcbiAgICBjb25zdCB7c3RhcnRDb250YWluZXIsIGVuZENvbnRhaW5lciwgc3RhcnRPZmZzZXQsIGVuZE9mZnNldH0gPSByYW5nZTtcclxuICAgIGlmKHN0YXJ0T2Zmc2V0ID09PSBlbmRPZmZzZXQpIHJldHVybjtcclxuICAgIGxldCBzZWxlY3RlZE5vZGVzID0gW10sIHN0YXJ0Tm9kZSwgZW5kTm9kZTtcclxuICAgIGlmKHN0YXJ0Q29udGFpbmVyLm5vZGVUeXBlICE9PSAzIHx8IHN0YXJ0Q29udGFpbmVyLm5vZGVUeXBlICE9PSAzKSByZXR1cm47XHJcbiAgICBpZihzdGFydENvbnRhaW5lciA9PT0gZW5kQ29udGFpbmVyKSB7XHJcbiAgICAgIC8vIOebuOWQjOiKgueCuVxyXG4gICAgICBzdGFydE5vZGUgPSBzdGFydENvbnRhaW5lcjtcclxuICAgICAgZW5kTm9kZSA9IHN0YXJ0Tm9kZTtcclxuICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKHtcclxuICAgICAgICBub2RlOiBzdGFydE5vZGUsXHJcbiAgICAgICAgb2Zmc2V0OiBzdGFydE9mZnNldCxcclxuICAgICAgICBsZW5ndGg6IGVuZE9mZnNldCAtIHN0YXJ0T2Zmc2V0XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3RhcnROb2RlID0gc3RhcnRDb250YWluZXI7XHJcbiAgICAgIGVuZE5vZGUgPSBlbmRDb250YWluZXI7XHJcbiAgICAgIHNlbGVjdGVkTm9kZXMucHVzaCh7XHJcbiAgICAgICAgbm9kZTogc3RhcnROb2RlLFxyXG4gICAgICAgIG9mZnNldDogc3RhcnRPZmZzZXQsXHJcbiAgICAgICAgbGVuZ3RoOiBzdGFydE5vZGUudGV4dENvbnRlbnQubGVuZ3RoIC0gc3RhcnRPZmZzZXRcclxuICAgICAgfSk7XHJcbiAgICAgIHNlbGVjdGVkTm9kZXMucHVzaCh7XHJcbiAgICAgICAgbm9kZTogZW5kTm9kZSxcclxuICAgICAgICBvZmZzZXQ6IDAsXHJcbiAgICAgICAgbGVuZ3RoOiBlbmRPZmZzZXRcclxuICAgICAgfSk7XHJcbiAgICAgIGNvbnN0IG5vZGVzID0gdGhpcy5maW5kTm9kZXMoc3RhcnROb2RlLCBlbmROb2RlKTtcclxuICAgICAgZm9yKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcclxuICAgICAgICBzZWxlY3RlZE5vZGVzLnB1c2goe1xyXG4gICAgICAgICAgbm9kZSxcclxuICAgICAgICAgIG9mZnNldDogMCxcclxuICAgICAgICAgIGxlbmd0aDogbm9kZS50ZXh0Q29udGVudC5sZW5ndGhcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29uc3Qgbm9kZXMgPSBbXTtcclxuICAgIGZvcihjb25zdCBvYmogb2Ygc2VsZWN0ZWROb2Rlcykge1xyXG4gICAgICBjb25zdCB7bm9kZSwgb2Zmc2V0LCBsZW5ndGh9ID0gb2JqO1xyXG4gICAgICBjb25zdCBjb250ZW50ID0gbm9kZS50ZXh0Q29udGVudC5zbGljZShvZmZzZXQsIG9mZnNldCArIGxlbmd0aCk7XHJcbiAgICAgIGNvbnN0IG9mZnNldF8gPSB0aGlzLmdldE9mZnNldChub2RlKTtcclxuICAgICAgbm9kZXMucHVzaCh7XHJcbiAgICAgICAgY29udGVudCxcclxuICAgICAgICBvZmZzZXQ6IG9mZnNldF8gKyBvZmZzZXQsXHJcbiAgICAgICAgbGVuZ3RoXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5vZGVzO1xyXG4gIH1cclxuICBnZXROb2Rlc0NvbnRlbnQobm9kZXMpIHtcclxuICAgIGxldCBjb250ZW50ID0gXCJcIjtcclxuICAgIG5vZGVzLm1hcChub2RlID0+IHtcclxuICAgICAgY29udGVudCArPSBub2RlLmNvbnRlbnQ7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjb250ZW50O1xyXG4gIH1cclxuICBjcmVhdGVTb3VyY2UoaWQsIG5vZGVzKSB7XHJcbiAgICByZXR1cm4gbmV3IFNvdXJjZSh7XHJcbiAgICAgIGhsOiB0aGlzLFxyXG4gICAgICBpZCxcclxuICAgICAgbm9kZXMsXHJcbiAgICB9KTtcclxuICB9XHJcbiAgZ2V0U291cmNlQnlJRChpZCkge1xyXG4gICAgZm9yKGNvbnN0IHMgb2YgdGhpcy5zb3VyY2VzKSB7XHJcbiAgICAgIGlmKHMuaWQgPT09IGlkKSByZXR1cm4gc291cmNlO1xyXG4gICAgfVxyXG4gIH1cclxuICBhZGRDbGFzcyhpZCwgY2xhc3NOYW1lKSB7XHJcbiAgICBsZXQgc291cmNlO1xyXG4gICAgaWYodHlwZW9mIGlkID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgIHNvdXJjZSA9IHRoaXMuZ2V0U291cmNlQnlJRChpZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzb3VyY2UgPSBpZDtcclxuICAgIH1cclxuICAgIHNvdXJjZS5hZGRDbGFzcyhjbGFzc05hbWUpO1xyXG4gIH1cclxuICByZW1vdmVDbGFzcyhpZCwgY2xhc3NOYW1lKSB7XHJcbiAgICBsZXQgc291cmNlO1xyXG4gICAgaWYodHlwZW9mIGlkID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgIHNvdXJjZSA9IHRoaXMuZ2V0U291cmNlQnlJRChpZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzb3VyY2UgPSBpZDtcclxuICAgIH1cclxuICAgIHNvdXJjZS5yZW1vdmVDbGFzcyhjbGFzc05hbWUpO1xyXG4gIH1cclxuICBnZXRPZmZzZXQodGV4dCkge1xyXG4gICAgY29uc3Qgbm9kZVN0YWNrID0gW3RoaXMucm9vdF07XHJcbiAgICBsZXQgY3VyTm9kZSA9IG51bGw7XHJcbiAgICBsZXQgb2Zmc2V0ID0gMDtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgd2hpbGUgKCEhKGN1ck5vZGUgPSBub2RlU3RhY2sucG9wKCkpKSB7XHJcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gY3VyTm9kZS5jaGlsZE5vZGVzO1xyXG4gICAgICBsb29wOlxyXG4gICAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgY29uc3Qgbm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgaWYobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xyXG4gICAgICAgICAgICBjb25zdCBjbCA9IG5vZGUuY2xhc3NMaXN0O1xyXG4gICAgICAgICAgICBmb3IoY29uc3QgYyBvZiBzZWxmLmV4Y2x1ZGVkRWxlbWVudENsYXNzKSB7XHJcbiAgICAgICAgICAgICAgaWYoY2wuY29udGFpbnMoYykpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlIGxvb3A7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBub2RlU3RhY2sucHVzaChub2RlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICBpZiAoY3VyTm9kZS5ub2RlVHlwZSA9PT0gMyAmJiBjdXJOb2RlICE9PSB0ZXh0KSB7XHJcbiAgICAgICAgb2Zmc2V0ICs9IGN1ck5vZGUudGV4dENvbnRlbnQubGVuZ3RoO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGN1ck5vZGUubm9kZVR5cGUgPT09IDMpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9mZnNldDtcclxuICB9XHJcbiAgZmluZE5vZGVzKHN0YXJ0Tm9kZSwgZW5kTm9kZSkge1xyXG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlcyA9IFtdO1xyXG4gICAgLy8gY29uc3QgcGFyZW50ID0gdGhpcy5nZXRTYW1lUGFyZW50Tm9kZShzdGFydE5vZGUsIGVuZE5vZGUpO1xyXG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5yb290O1xyXG4gICAgaWYocGFyZW50KSB7XHJcbiAgICAgIGxldCBzdGFydCA9IGZhbHNlLCBlbmQgPSBmYWxzZTtcclxuICAgICAgY29uc3QgZ2V0Q2hpbGROb2RlID0gKG5vZGUpID0+IHtcclxuICAgICAgICBpZighbm9kZS5oYXNDaGlsZE5vZGVzKCkpIHJldHVybjtcclxuICAgICAgICBmb3IoY29uc3QgbiBvZiBub2RlLmNoaWxkTm9kZXMpIHtcclxuICAgICAgICAgIGlmKGVuZCB8fCBuID09PSBlbmROb2RlKSB7XHJcbiAgICAgICAgICAgIGVuZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH0gZWxzZSBpZihzdGFydCAmJiBuLm5vZGVUeXBlID09PSAzKSB7XHJcbiAgICAgICAgICAgIHNlbGVjdGVkTm9kZXMucHVzaChuKTtcclxuICAgICAgICAgIH0gZWxzZSBpZihuID09PSBzdGFydE5vZGUpIHtcclxuICAgICAgICAgICAgc3RhcnQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZ2V0Q2hpbGROb2RlKG4pO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgZ2V0Q2hpbGROb2RlKHBhcmVudCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc2VsZWN0ZWROb2RlcztcclxuICB9XHJcbiAgZ2V0U2FtZVBhcmVudE5vZGUoc3RhcnROb2RlLCBlbmROb2RlKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIGlmKCFlbmROb2RlIHx8IHN0YXJ0Tm9kZSA9PT0gZW5kTm9kZSkgcmV0dXJuIHN0YXJ0Tm9kZS5wYXJlbnROb2RlO1xyXG4gICAgY29uc3Qgc3RhcnROb2RlcyA9IFtdLCBlbmROb2RlcyA9IFtdO1xyXG4gICAgY29uc3QgZ2V0UGFyZW50ID0gKG5vZGUsIG5vZGVzKSA9PiB7XHJcbiAgICAgIG5vZGVzLnB1c2gobm9kZSk7XHJcbiAgICAgIGlmKG5vZGUgIT09IHNlbGYucm9vdCAmJiBub2RlLnBhcmVudE5vZGUpIHtcclxuICAgICAgICBnZXRQYXJlbnQobm9kZS5wYXJlbnROb2RlLCBub2Rlcyk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBnZXRQYXJlbnQoc3RhcnROb2RlLCBzdGFydE5vZGVzKTtcclxuICAgIGdldFBhcmVudChlbmROb2RlLCBlbmROb2Rlcyk7XHJcbiAgICBsZXQgcGFyZW50O1xyXG4gICAgZm9yKGNvbnN0IG5vZGUgb2Ygc3RhcnROb2Rlcykge1xyXG4gICAgICBpZihlbmROb2Rlcy5pbmNsdWRlcyhub2RlKSkge1xyXG4gICAgICAgIHBhcmVudCA9IG5vZGU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBwYXJlbnQ7XHJcbiAgfVxyXG4gIG9uKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcclxuICAgIGlmKCF0aGlzLmV2ZW50c1tldmVudE5hbWVdKSB7XHJcbiAgICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0gPSBbXTtcclxuICAgIH1cclxuICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0ucHVzaChjYWxsYmFjayk7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcbiAgZW1pdChldmVudE5hbWUsIGRhdGEpIHtcclxuICAgICh0aGlzLmV2ZW50c1tldmVudE5hbWVdIHx8IFtdKS5tYXAoZnVuYyA9PiB7XHJcbiAgICAgIGZ1bmMoZGF0YSk7XHJcbiAgICB9KTtcclxuICB9XHJcbn07Il19
