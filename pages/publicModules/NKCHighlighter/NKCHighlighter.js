(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* 
  events:
    selected: 划词



*/
window.Source =
/*#__PURE__*/
function () {
  function _class(options) {
    _classCallCheck(this, _class);

    var hl = options.hl,
        nodes = options.nodes,
        notes = options.notes,
        _id = options._id;
    var self = this;
    this.hl = hl;
    this.notes = notes;
    this.nodes = nodes;
    this.doms = [];
    var noteId = _id;
    if (!noteId) noteId = Date.now();
    this._id = "post-node-id-".concat(noteId);
    this.nodes.forEach(function (node) {
      var tagName = node.tagName,
          index = node.index,
          offset = node.offset,
          length = node.length;
      var doms = self.hl.root.getElementsByTagName(tagName);
      var parent = doms[index];
      var targetNotes = self.getNodes(parent, offset, length);
      targetNotes.map(function (targetNode) {
        var span = document.createElement("span");
        self.doms.push(span);
        span.addEventListener("mouseenter", function () {
          self.hl.emit(self.hl.eventNames.hover, self);
        });
        span.addEventListener("mouseleave", function () {
          self.hl.emit(self.hl.eventNames.hoverOut, self);
        });
        span.addEventListener("click", function () {
          self.hl.emit(self.hl.eventNames.click, self);
        });
        span.setAttribute("class", "post-node ".concat(self._id));
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
      var doms = this.doms;
      doms.map(function (dom) {
        dom.classList.add(klass);
      });
    }
  }, {
    key: "removeClass",
    value: function removeClass(klass) {
      var doms = this.doms;
      doms.map(function (dom) {
        dom.classList.remove(klass);
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

      while (node = nodeStack.pop()) {
        var children = node.childNodes;

        for (var i = 0; i < children.length; i++) {
          nodeStack.push(children[i]);
        }

        if (node.nodeType === 3) {
          curOffset += node.textContent.length;
          console.log(1, node);
          console.log(11, node);
          console.log(Date.now(), node);

          if (curOffset > offset) {
            console.log(Date.now(), _node);
            console.log(2, _node);
            if (curLength <= 0) break;
            console.log(3, _node);
            var startOffset = curOffset - offset;
            console.log(4, _node);
            var nodeLength = void 0;
            console.log(5, _node);

            if (curLength <= _node.textContent.length) {
              nodeLength = curLength;
            } else {
              nodeLength = _node.textContent.length - startOffset;
              curLength -= nodeLength;
            }

            var _node = _node.splitText(startOffset);

            _node.splitText(nodeLength);

            nodes.push(_node);
          }
        }
      }

      return nodes;
    }
  }, {
    key: "getNode_",
    value: function getNode_(parent, offset, length) {
      var nodeStack = [parent];
      var curNode = null;
      var curOffset = 0;
      var startOffset = 0;
      var curLength = 0;
      var start, end;

      while (curNode = nodeStack.pop()) {
        var children = curNode.childNodes;

        for (var i = children.length - 1; i >= 0; i--) {
          nodeStack.push(children[i]);
        }

        if (curNode.nodeType === 3) {
          startOffset = offset - curOffset;
          curOffset += curNode.textContent.length;

          if (curOffset > offset) {
            curLength += curNode.length - startOffset;
            var endOffset = void 0;

            if (length + startOffset > curNode.length) {
              endOffset = curNode.length;
            } else {
              endOffset = startOffset + length;
            }

            start = {
              node: curNode,
              startOffset: startOffset,
              endOffset: endOffset
            };
          }
        }
      }
      /* if (!curNode) {
        curNode = parent;
      } */


      console.log(curNode, startOffset);
      var node = curNode.splitText(startOffset);
      node.splitText(length);
      return node;
    }
  }]);

  return _class;
}();

window.NKCHighlighter =
/*#__PURE__*/
function () {
  function _class2(options) {
    _classCallCheck(this, _class2);

    var rootElementId = options.rootElementId;
    var self = this;
    self.root = document.getElementById(rootElementId);
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
    key: "getRange",
    value: function getRange() {
      var range = window.getSelection().getRangeAt(0);
      var startOffset = range.startOffset,
          endOffset = range.endOffset;
      if (startOffset === endOffset) return;
      return range;
    }
  }, {
    key: "restoreSources",
    value: function restoreSources(sources) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = sources[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _source = _step.value;
          _source.hl = this;
          new Source(_source);
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
  }, {
    key: "createSource",
    value: function createSource(range, notes) {
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
        startNode = startContainer.splitText(startOffset);
        startNode.splitText(endOffset - startOffset);
        selectedNodes.push(startNode);
      } else {
        startNode = startContainer.splitText(startOffset);
        selectedNodes.push(startNode);
        endContainer.splitText(endOffset);
        endNode = endContainer;
        selectedNodes.push(endNode);

        var _nodes = this.findNodes(startNode, endNode);

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = _nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var node = _step2.value;
            selectedNodes.push(node);
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

      var parent = this.getSameParentNode(startNode, endNode);
      var tagName = parent.tagName;
      var doms = this.root.getElementsByTagName(tagName);
      var index = -1;

      for (var i = 0; i < doms.length; i++) {
        if (doms[i] === parent) {
          index = i;
          break;
        }
      }

      if (index === -1) throw "获取父元素索引出错";
      var nodes = [];

      for (var _i = 0, _selectedNodes = selectedNodes; _i < _selectedNodes.length; _i++) {
        var _node2 = _selectedNodes[_i];
        var offset = this.getOffset(parent, _node2);
        var length = _node2.textContent.length;
        nodes.push({
          tagName: tagName,
          index: index,
          offset: offset,
          length: length
        });
      }

      return new Source({
        hl: this,
        notes: notes,
        nodes: nodes
      });
    }
  }, {
    key: "getSourceByID",
    value: function getSourceByID(id) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.sources[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var s = _step3.value;
          if (s.id === id) return source;
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
    value: function getOffset(root, text) {
      var nodeStack = [root];
      var curNode = null;
      var offset = 0;

      while (curNode = nodeStack.pop()) {
        var children = curNode.childNodes;

        for (var i = children.length - 1; i >= 0; i--) {
          nodeStack.push(children[i]);
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
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = node.childNodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var n = _step4.value;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvTktDSGlnaGxpZ2h0ZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQTs7Ozs7OztBQU9BLE1BQU0sQ0FBQyxNQUFQO0FBQUE7QUFBQTtBQUNFLGtCQUFZLE9BQVosRUFBcUI7QUFBQTs7QUFBQSxRQUNaLEVBRFksR0FDYSxPQURiLENBQ1osRUFEWTtBQUFBLFFBQ1IsS0FEUSxHQUNhLE9BRGIsQ0FDUixLQURRO0FBQUEsUUFDRCxLQURDLEdBQ2EsT0FEYixDQUNELEtBREM7QUFBQSxRQUNNLEdBRE4sR0FDYSxPQURiLENBQ00sR0FETjtBQUVuQixRQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsU0FBSyxFQUFMLEdBQVUsRUFBVjtBQUNBLFNBQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxTQUFLLEtBQUwsR0FBYSxLQUFiO0FBQ0EsU0FBSyxJQUFMLEdBQVksRUFBWjtBQUNBLFFBQUksTUFBTSxHQUFHLEdBQWI7QUFDQSxRQUFHLENBQUMsTUFBSixFQUFZLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBTCxFQUFUO0FBQ1osU0FBSyxHQUFMLDBCQUEyQixNQUEzQjtBQUNBLFNBQUssS0FBTCxDQUFXLE9BQVgsQ0FBbUIsVUFBQSxJQUFJLEVBQUk7QUFBQSxVQUNsQixPQURrQixHQUNnQixJQURoQixDQUNsQixPQURrQjtBQUFBLFVBQ1QsS0FEUyxHQUNnQixJQURoQixDQUNULEtBRFM7QUFBQSxVQUNGLE1BREUsR0FDZ0IsSUFEaEIsQ0FDRixNQURFO0FBQUEsVUFDTSxNQUROLEdBQ2dCLElBRGhCLENBQ00sTUFETjtBQUV6QixVQUFNLElBQUksR0FBRyxJQUFJLENBQUMsRUFBTCxDQUFRLElBQVIsQ0FBYSxvQkFBYixDQUFrQyxPQUFsQyxDQUFiO0FBQ0EsVUFB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ZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyogXHJcbiAgZXZlbnRzOlxyXG4gICAgc2VsZWN0ZWQ6IOWIkuivjVxyXG5cclxuXHJcblxyXG4qL1xyXG53aW5kb3cuU291cmNlID0gY2xhc3Mge1xyXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgIGNvbnN0IHtobCwgbm9kZXMsIG5vdGVzLCBfaWR9ID0gb3B0aW9ucztcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgdGhpcy5obCA9IGhsO1xyXG4gICAgdGhpcy5ub3RlcyA9IG5vdGVzO1xyXG4gICAgdGhpcy5ub2RlcyA9IG5vZGVzO1xyXG4gICAgdGhpcy5kb21zID0gW107XHJcbiAgICBsZXQgbm90ZUlkID0gX2lkO1xyXG4gICAgaWYoIW5vdGVJZCkgbm90ZUlkID0gRGF0ZS5ub3coKTtcclxuICAgIHRoaXMuX2lkID0gYHBvc3Qtbm9kZS1pZC0ke25vdGVJZH1gO1xyXG4gICAgdGhpcy5ub2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xyXG4gICAgICBjb25zdCB7dGFnTmFtZSwgaW5kZXgsIG9mZnNldCwgbGVuZ3RofSA9IG5vZGU7XHJcbiAgICAgIGNvbnN0IGRvbXMgPSBzZWxmLmhsLnJvb3QuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGFnTmFtZSk7XHJcbiAgICAgIGNvbnN0IHBhcmVudCA9IGRvbXNbaW5kZXhdO1xyXG4gICAgICBjb25zdCB0YXJnZXROb3RlcyA9IHNlbGYuZ2V0Tm9kZXMocGFyZW50LCBvZmZzZXQsIGxlbmd0aCk7IFxyXG4gICAgICB0YXJnZXROb3Rlcy5tYXAodGFyZ2V0Tm9kZSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgICAgIHNlbGYuZG9tcy5wdXNoKHNwYW4pO1xyXG4gICAgICAgIHNwYW4uYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgc2VsZi5obC5lbWl0KHNlbGYuaGwuZXZlbnROYW1lcy5ob3Zlciwgc2VsZik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc3Bhbi5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKSA9PiB7XHJcbiAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmhvdmVyT3V0LCBzZWxmKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzcGFuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmNsaWNrLCBzZWxmKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIHNwYW4uc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgYHBvc3Qtbm9kZSAke3NlbGYuX2lkfWApO1xyXG4gICAgICAgIHNwYW4uYXBwZW5kQ2hpbGQodGFyZ2V0Tm9kZS5jbG9uZU5vZGUoZmFsc2UpKTtcclxuICAgICAgICB0YXJnZXROb2RlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHNwYW4sIHRhcmdldE5vZGUpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gICAgdGhpcy5obC5zb3VyY2VzLnB1c2godGhpcyk7XHJcbiAgICB0aGlzLmhsLmVtaXQodGhpcy5obC5ldmVudE5hbWVzLmNyZWF0ZSwgdGhpcyk7XHJcbiAgfVxyXG4gIGFkZENsYXNzKGtsYXNzKSB7XHJcbiAgICBjb25zdCB7ZG9tc30gPSB0aGlzO1xyXG4gICAgZG9tcy5tYXAoZG9tID0+IHtcclxuICAgICAgZG9tLmNsYXNzTGlzdC5hZGQoa2xhc3MpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHJlbW92ZUNsYXNzKGtsYXNzKSB7XHJcbiAgICBjb25zdCB7ZG9tc30gPSB0aGlzO1xyXG4gICAgZG9tcy5tYXAoZG9tID0+IHtcclxuICAgICAgZG9tLmNsYXNzTGlzdC5yZW1vdmUoa2xhc3MpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGdldFNvdXJjZXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zb3VyY2VzO1xyXG4gIH1cclxuICBnZXROb2RlcyhwYXJlbnQsIG9mZnNldCwgbGVuZ3RoKSB7XHJcbiAgICBjb25zdCBub2RlU3RhY2sgPSBbcGFyZW50XTtcclxuICAgIGxldCBjdXJPZmZzZXQgPSAwO1xyXG4gICAgbGV0IG5vZGUgPSBudWxsO1xyXG4gICAgbGV0IGN1ckxlbmd0aCA9IGxlbmd0aDtcclxuICAgIGxldCBub2RlcyA9IFtdO1xyXG4gICAgd2hpbGUobm9kZSA9IG5vZGVTdGFjay5wb3AoKSkge1xyXG4gICAgICBjb25zdCBjaGlsZHJlbiA9IG5vZGUuY2hpbGROb2RlcztcclxuICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbm9kZVN0YWNrLnB1c2goY2hpbGRyZW5baV0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKG5vZGUubm9kZVR5cGUgPT09IDMpIHtcclxuICAgICAgICBjdXJPZmZzZXQgKz0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGg7XHJcbiAgICAgICAgY29uc29sZS5sb2coMSwgbm9kZSlcclxuICAgICAgICBjb25zb2xlLmxvZygxMSwgbm9kZSlcclxuICAgICAgICBjb25zb2xlLmxvZyhEYXRlLm5vdygpLCBub2RlKVxyXG4gICAgICAgIGlmKGN1ck9mZnNldCA+IG9mZnNldCkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coRGF0ZS5ub3coKSwgbm9kZSlcclxuICAgICAgICAgIGNvbnNvbGUubG9nKDIsIG5vZGUpXHJcbiAgICAgICAgICBpZihjdXJMZW5ndGggPD0gMCkgYnJlYWs7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygzLCBub2RlKVxyXG4gICAgICAgICAgY29uc3Qgc3RhcnRPZmZzZXQgPSBjdXJPZmZzZXQgLSBvZmZzZXQ7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyg0LCBub2RlKVxyXG4gICAgICAgICAgbGV0IG5vZGVMZW5ndGg7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyg1LCBub2RlKVxyXG4gICAgICAgICAgaWYoY3VyTGVuZ3RoIDw9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIG5vZGVMZW5ndGggPSBjdXJMZW5ndGg7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBub2RlTGVuZ3RoID0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSBzdGFydE9mZnNldDtcclxuICAgICAgICAgICAgY3VyTGVuZ3RoIC09IG5vZGVMZW5ndGg7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCBub2RlID0gbm9kZS5zcGxpdFRleHQoc3RhcnRPZmZzZXQpO1xyXG4gICAgICAgICAgbm9kZS5zcGxpdFRleHQobm9kZUxlbmd0aCk7XHJcbiAgICAgICAgICBub2Rlcy5wdXNoKG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5vZGVzO1xyXG4gIH1cclxuICBnZXROb2RlXyhwYXJlbnQsIG9mZnNldCwgbGVuZ3RoKSB7XHJcbiAgICBjb25zdCBub2RlU3RhY2sgPSBbcGFyZW50XTtcclxuICAgIGxldCBjdXJOb2RlID0gbnVsbDtcclxuICAgIGxldCBjdXJPZmZzZXQgPSAwO1xyXG4gICAgbGV0IHN0YXJ0T2Zmc2V0ID0gMDtcclxuICAgIGxldCBjdXJMZW5ndGggPSAwO1xyXG4gICAgbGV0IHN0YXJ0LCBlbmQ7XHJcbiAgICB3aGlsZSAoY3VyTm9kZSA9IG5vZGVTdGFjay5wb3AoKSkge1xyXG4gICAgICBjb25zdCBjaGlsZHJlbiA9IGN1ck5vZGUuY2hpbGROb2RlcztcclxuICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgbm9kZVN0YWNrLnB1c2goY2hpbGRyZW5baV0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChjdXJOb2RlLm5vZGVUeXBlID09PSAzKSB7XHJcbiAgICAgICAgc3RhcnRPZmZzZXQgPSBvZmZzZXQgLSBjdXJPZmZzZXQ7XHJcbiAgICAgICAgY3VyT2Zmc2V0ICs9IGN1ck5vZGUudGV4dENvbnRlbnQubGVuZ3RoO1xyXG4gICAgICAgIGlmIChjdXJPZmZzZXQgPiBvZmZzZXQpIHtcclxuICAgICAgICAgIGN1ckxlbmd0aCArPSBjdXJOb2RlLmxlbmd0aCAtIHN0YXJ0T2Zmc2V0O1xyXG4gICAgICAgICAgbGV0IGVuZE9mZnNldDtcclxuICAgICAgICAgIGlmKGxlbmd0aCArIHN0YXJ0T2Zmc2V0ID4gY3VyTm9kZS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgZW5kT2Zmc2V0ID0gY3VyTm9kZS5sZW5ndGg7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlbmRPZmZzZXQgPSBzdGFydE9mZnNldCArIGxlbmd0aDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHN0YXJ0ID0ge1xyXG4gICAgICAgICAgICBub2RlOiBjdXJOb2RlLFxyXG4gICAgICAgICAgICBzdGFydE9mZnNldCxcclxuICAgICAgICAgICAgZW5kT2Zmc2V0XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvKiBpZiAoIWN1ck5vZGUpIHtcclxuICAgICAgY3VyTm9kZSA9IHBhcmVudDtcclxuICAgIH0gKi9cclxuICAgIGNvbnNvbGUubG9nKGN1ck5vZGUsIHN0YXJ0T2Zmc2V0KTtcclxuICAgIGNvbnN0IG5vZGUgPSBjdXJOb2RlLnNwbGl0VGV4dChzdGFydE9mZnNldCk7XHJcbiAgICBub2RlLnNwbGl0VGV4dChsZW5ndGgpO1xyXG4gICAgcmV0dXJuIG5vZGU7XHJcbiAgfVxyXG59XHJcblxyXG53aW5kb3cuTktDSGlnaGxpZ2h0ZXIgPSBjbGFzcyB7XHJcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgY29uc3Qge1xyXG4gICAgICByb290RWxlbWVudElkLFxyXG4gICAgfSA9IG9wdGlvbnM7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHNlbGYucm9vdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHJvb3RFbGVtZW50SWQpO1xyXG4gICAgc2VsZi5wb3NpdGlvbiA9IHtcclxuICAgICAgeDogMCxcclxuICAgICAgeTogMFxyXG4gICAgfTtcclxuICAgIHNlbGYucmFuZ2UgPSB7fTtcclxuICAgIHNlbGYuc291cmNlcyA9IFtdO1xyXG4gICAgc2VsZi5ldmVudHMgPSB7fTtcclxuICAgIHNlbGYuZXZlbnROYW1lcyA9IHtcclxuICAgICAgY3JlYXRlOiBcImNyZWF0ZVwiLFxyXG4gICAgICBob3ZlcjogXCJob3ZlclwiLFxyXG4gICAgICBob3Zlck91dDogXCJob3Zlck91dFwiLFxyXG4gICAgICBzZWxlY3Q6IFwic2VsZWN0XCJcclxuICAgIH1cclxuXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgICBzZWxmLnBvc2l0aW9uLnggPSBlLmNsaWVudFg7XHJcbiAgICAgIHNlbGYucG9zaXRpb24ueSA9IGUuY2xpZW50WTtcclxuICAgICAgY29uc3QgcmFuZ2UgPSBzZWxmLmdldFJhbmdlKCk7XHJcbiAgICAgIGlmKCFyYW5nZSkgcmV0dXJuO1xyXG4gICAgICBpZihcclxuICAgICAgICByYW5nZS5zdGFydENvbnRhaW5lciA9PT0gc2VsZi5yYW5nZS5zdGFydENvbnRhaW5lciAmJlxyXG4gICAgICAgIHJhbmdlLmVuZENvbnRhaW5lciA9PT0gc2VsZi5yYW5nZS5lbmRDb250YWluZXIgJiZcclxuICAgICAgICByYW5nZS5zdGFydE9mZnNldCA9PT0gc2VsZi5yYW5nZS5zdGFydE9mZnNldCAmJlxyXG4gICAgICAgIHJhbmdlLmVuZE9mZnNldCA9PT0gc2VsZi5yYW5nZS5lbmRPZmZzZXRcclxuICAgICAgKSByZXR1cm47XHJcbiAgICAgIC8vIOmZkOWItumAieaLqeaWh+Wtl+eahOWMuuWfn++8jOWPquiDveaYr3NlbGVjdGVy5YaF55qE5paH5a2XXHJcbiAgICAgIGlmKCFzZWxmLnJvb3QuY29udGFpbnMocmFuZ2Uuc3RhcnRDb250YWluZXIpIHx8ICFzZWxmLnJvb3QuY29udGFpbnMocmFuZ2UuZW5kQ29udGFpbmVyKSkgcmV0dXJuO1xyXG4gICAgICBzZWxmLnJhbmdlID0gcmFuZ2U7XHJcbiAgICAgIHNlbGYuZW1pdChzZWxmLmV2ZW50TmFtZXMuc2VsZWN0LCB7XHJcbiAgICAgICAgcG9zaXRpb246IHNlbGYucG9zaXRpb24sXHJcbiAgICAgICAgcmFuZ2VcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgZ2V0UmFuZ2UoKSB7XHJcbiAgICBjb25zdCByYW5nZSA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5nZXRSYW5nZUF0KDApO1xyXG4gICAgY29uc3Qge3N0YXJ0T2Zmc2V0LCBlbmRPZmZzZXR9ID0gcmFuZ2U7XHJcbiAgICBpZihzdGFydE9mZnNldCA9PT0gZW5kT2Zmc2V0KSByZXR1cm47XHJcbiAgICByZXR1cm4gcmFuZ2U7XHJcbiAgfVxyXG4gIHJlc3RvcmVTb3VyY2VzKHNvdXJjZXMpIHtcclxuICAgIGZvcihjb25zdCBzb3VyY2Ugb2Ygc291cmNlcykge1xyXG4gICAgICBzb3VyY2UuaGwgPSB0aGlzO1xyXG4gICAgICBuZXcgU291cmNlKHNvdXJjZSk7ICBcclxuICAgIH1cclxuICB9XHJcbiAgY3JlYXRlU291cmNlKHJhbmdlLCBub3Rlcykge1xyXG4gICAgY29uc3Qge3N0YXJ0Q29udGFpbmVyLCBlbmRDb250YWluZXIsIHN0YXJ0T2Zmc2V0LCBlbmRPZmZzZXR9ID0gcmFuZ2U7XHJcbiAgICBpZihzdGFydE9mZnNldCA9PT0gZW5kT2Zmc2V0KSByZXR1cm47XHJcbiAgICBsZXQgc2VsZWN0ZWROb2RlcyA9IFtdLCBzdGFydE5vZGUsIGVuZE5vZGU7XHJcbiAgICBpZihzdGFydENvbnRhaW5lci5ub2RlVHlwZSAhPT0gMyB8fCBzdGFydENvbnRhaW5lci5ub2RlVHlwZSAhPT0gMykgcmV0dXJuO1xyXG4gICAgaWYoc3RhcnRDb250YWluZXIgPT09IGVuZENvbnRhaW5lcikgeyBcclxuICAgICAgLy8g55u45ZCM6IqC54K5XHJcbiAgICAgIHN0YXJ0Tm9kZSA9IHN0YXJ0Q29udGFpbmVyLnNwbGl0VGV4dChzdGFydE9mZnNldCk7XHJcbiAgICAgIHN0YXJ0Tm9kZS5zcGxpdFRleHQoZW5kT2Zmc2V0IC0gc3RhcnRPZmZzZXQpO1xyXG4gICAgICBzZWxlY3RlZE5vZGVzLnB1c2goc3RhcnROb2RlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHN0YXJ0Tm9kZSA9IHN0YXJ0Q29udGFpbmVyLnNwbGl0VGV4dChzdGFydE9mZnNldCk7XHJcbiAgICAgIHNlbGVjdGVkTm9kZXMucHVzaChzdGFydE5vZGUpO1xyXG4gICAgICBlbmRDb250YWluZXIuc3BsaXRUZXh0KGVuZE9mZnNldCk7XHJcbiAgICAgIGVuZE5vZGUgPSBlbmRDb250YWluZXI7XHJcbiAgICAgIHNlbGVjdGVkTm9kZXMucHVzaChlbmROb2RlKTtcclxuICAgICAgY29uc3Qgbm9kZXMgPSB0aGlzLmZpbmROb2RlcyhzdGFydE5vZGUsIGVuZE5vZGUpO1xyXG4gICAgICBmb3IoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xyXG4gICAgICAgIHNlbGVjdGVkTm9kZXMucHVzaChub2RlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5nZXRTYW1lUGFyZW50Tm9kZShzdGFydE5vZGUsIGVuZE5vZGUpO1xyXG4gICAgY29uc3Qge3RhZ05hbWV9ID0gcGFyZW50O1xyXG4gICAgY29uc3QgZG9tcyA9IHRoaXMucm9vdC5nZXRFbGVtZW50c0J5VGFnTmFtZSh0YWdOYW1lKTtcclxuICAgIGxldCBpbmRleCA9IC0xO1xyXG4gICAgZm9yKGxldCBpID0gMDsgaSA8IGRvbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYoZG9tc1tpXSA9PT0gcGFyZW50KSB7XHJcbiAgICAgICAgaW5kZXggPSBpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZihpbmRleCA9PT0gLTEpIHRocm93IFwi6I635Y+W54i25YWD57Sg57Si5byV5Ye66ZSZXCI7XHJcbiAgICBjb25zdCBub2RlcyA9IFtdO1xyXG4gICAgZm9yKGNvbnN0IG5vZGUgb2Ygc2VsZWN0ZWROb2Rlcykge1xyXG4gICAgICBjb25zdCBvZmZzZXQgPSB0aGlzLmdldE9mZnNldChwYXJlbnQsIG5vZGUpO1xyXG4gICAgICBjb25zdCBsZW5ndGggPSBub2RlLnRleHRDb250ZW50Lmxlbmd0aDtcclxuICAgICAgbm9kZXMucHVzaCh7XHJcbiAgICAgICAgdGFnTmFtZSxcclxuICAgICAgICBpbmRleCxcclxuICAgICAgICBvZmZzZXQsXHJcbiAgICAgICAgbGVuZ3RoXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBTb3VyY2Uoe1xyXG4gICAgICBobDogdGhpcyxcclxuICAgICAgbm90ZXMsXHJcbiAgICAgIG5vZGVzLFxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGdldFNvdXJjZUJ5SUQoaWQpIHtcclxuICAgIGZvcihjb25zdCBzIG9mIHRoaXMuc291cmNlcykge1xyXG4gICAgICBpZihzLmlkID09PSBpZCkgcmV0dXJuIHNvdXJjZTtcclxuICAgIH1cclxuICB9XHJcbiAgYWRkQ2xhc3MoaWQsIGNsYXNzTmFtZSkge1xyXG4gICAgbGV0IHNvdXJjZTtcclxuICAgIGlmKHR5cGVvZiBpZCA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICBzb3VyY2UgPSB0aGlzLmdldFNvdXJjZUJ5SUQoaWQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc291cmNlID0gaWQ7XHJcbiAgICB9XHJcbiAgICBzb3VyY2UuYWRkQ2xhc3MoY2xhc3NOYW1lKTtcclxuICB9XHJcbiAgcmVtb3ZlQ2xhc3MoaWQsIGNsYXNzTmFtZSkge1xyXG4gICAgbGV0IHNvdXJjZTtcclxuICAgIGlmKHR5cGVvZiBpZCA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICBzb3VyY2UgPSB0aGlzLmdldFNvdXJjZUJ5SUQoaWQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc291cmNlID0gaWQ7XHJcbiAgICB9XHJcbiAgICBzb3VyY2UucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lKTtcclxuICB9XHJcbiAgZ2V0T2Zmc2V0KHJvb3QsIHRleHQpIHtcclxuICAgIGNvbnN0IG5vZGVTdGFjayA9IFtyb290XTtcclxuICAgIGxldCBjdXJOb2RlID0gbnVsbDtcclxuICAgIGxldCBvZmZzZXQgPSAwO1xyXG4gICAgd2hpbGUgKGN1ck5vZGUgPSBub2RlU3RhY2sucG9wKCkpIHtcclxuICAgICAgY29uc3QgY2hpbGRyZW4gPSBjdXJOb2RlLmNoaWxkTm9kZXM7XHJcbiAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIG5vZGVTdGFjay5wdXNoKGNoaWxkcmVuW2ldKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGN1ck5vZGUubm9kZVR5cGUgPT09IDMgJiYgY3VyTm9kZSAhPT0gdGV4dCkge1xyXG4gICAgICAgIG9mZnNldCArPSBjdXJOb2RlLnRleHRDb250ZW50Lmxlbmd0aDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChjdXJOb2RlLm5vZGVUeXBlID09PSAzKSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBvZmZzZXQ7XHJcbiAgfVxyXG4gIGZpbmROb2RlcyhzdGFydE5vZGUsIGVuZE5vZGUpIHtcclxuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSBbXTtcclxuICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuZ2V0U2FtZVBhcmVudE5vZGUoc3RhcnROb2RlLCBlbmROb2RlKTtcclxuICAgIGlmKHBhcmVudCkge1xyXG4gICAgICBsZXQgc3RhcnQgPSBmYWxzZSwgZW5kID0gZmFsc2U7XHJcbiAgICAgIGNvbnN0IGdldENoaWxkTm9kZSA9IChub2RlKSA9PiB7XHJcbiAgICAgICAgaWYoIW5vZGUuaGFzQ2hpbGROb2RlcygpKSByZXR1cm47XHJcbiAgICAgICAgZm9yKGNvbnN0IG4gb2Ygbm9kZS5jaGlsZE5vZGVzKSB7XHJcbiAgICAgICAgICBpZihlbmQgfHwgbiA9PT0gZW5kTm9kZSkge1xyXG4gICAgICAgICAgICBlbmQgPSB0cnVlO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9IGVsc2UgaWYoc3RhcnQgJiYgbi5ub2RlVHlwZSA9PT0gMykge1xyXG4gICAgICAgICAgICBzZWxlY3RlZE5vZGVzLnB1c2gobik7XHJcbiAgICAgICAgICB9IGVsc2UgaWYobiA9PT0gc3RhcnROb2RlKSB7XHJcbiAgICAgICAgICAgIHN0YXJ0ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGdldENoaWxkTm9kZShuKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIGdldENoaWxkTm9kZShwYXJlbnQpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNlbGVjdGVkTm9kZXM7XHJcbiAgfVxyXG4gIGdldFNhbWVQYXJlbnROb2RlKHN0YXJ0Tm9kZSwgZW5kTm9kZSkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBpZighZW5kTm9kZSB8fCBzdGFydE5vZGUgPT09IGVuZE5vZGUpIHJldHVybiBzdGFydE5vZGUucGFyZW50Tm9kZTtcclxuICAgIGNvbnN0IHN0YXJ0Tm9kZXMgPSBbXSwgZW5kTm9kZXMgPSBbXTtcclxuICAgIGNvbnN0IGdldFBhcmVudCA9IChub2RlLCBub2RlcykgPT4ge1xyXG4gICAgICBub2Rlcy5wdXNoKG5vZGUpO1xyXG4gICAgICBpZihub2RlICE9PSBzZWxmLnJvb3QgJiYgbm9kZS5wYXJlbnROb2RlKSB7XHJcbiAgICAgICAgZ2V0UGFyZW50KG5vZGUucGFyZW50Tm9kZSwgbm9kZXMpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgZ2V0UGFyZW50KHN0YXJ0Tm9kZSwgc3RhcnROb2Rlcyk7XHJcbiAgICBnZXRQYXJlbnQoZW5kTm9kZSwgZW5kTm9kZXMpO1xyXG4gICAgbGV0IHBhcmVudDtcclxuICAgIGZvcihjb25zdCBub2RlIG9mIHN0YXJ0Tm9kZXMpIHtcclxuICAgICAgaWYoZW5kTm9kZXMuaW5jbHVkZXMobm9kZSkpIHtcclxuICAgICAgICBwYXJlbnQgPSBub2RlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGFyZW50O1xyXG4gIH1cclxuICBvbihldmVudE5hbWUsIGNhbGxiYWNrKSB7XHJcbiAgICBpZighdGhpcy5ldmVudHNbZXZlbnROYW1lXSkge1xyXG4gICAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdID0gW107XHJcbiAgICB9XHJcbiAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdLnB1c2goY2FsbGJhY2spO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG4gIGVtaXQoZXZlbnROYW1lLCBkYXRhKSB7XHJcbiAgICAodGhpcy5ldmVudHNbZXZlbnROYW1lXSB8fCBbXSkubWFwKGZ1bmMgPT4ge1xyXG4gICAgICBmdW5jKGRhdGEpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59OyJdfQ==
