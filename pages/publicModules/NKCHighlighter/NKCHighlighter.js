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

    if (!_id) {
      this._id = "nkc-hl-l-id-".concat(Date.now());
    } else {
      this._id = "nkc-hl-id-".concat(_id);
    }

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
        span.addEventListener("mouseover", function () {
          self.hl.emit(self.hl.eventNames.hover, self);
        });
        span.addEventListener("mouseout", function () {
          console.log("离开");
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
    this.hl.emit(this.hl.eventNames[_id ? "restore" : "create"], this);
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
    key: "destroy",
    value: function destroy() {
      this.doms.map(function (dom) {
        dom.className = "";
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

      while (node = nodeStack.pop()) {
        var children = node.childNodes;

        for (var i = children.length - 1; i >= 0; i--) {
          nodeStack.push(children[i]);
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
      select: "select",
      restore: "restore"
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

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = _nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var node = _step2.value;
            selectedNodes.push({
              node: node,
              offset: 0,
              length: node.textContent.length
            });
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
        var obj = _selectedNodes[_i];
        var _node = obj.node,
            offset = obj.offset,
            length = obj.length;
        var offset_ = this.getOffset(parent, _node);
        nodes.push({
          tagName: tagName,
          index: index,
          offset: offset_ + offset,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvTktDSGlnaGxpZ2h0ZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQTs7Ozs7OztBQU9BLE1BQU0sQ0FBQyxNQUFQO0FBQUE7QUFBQTtBQUNFLGtCQUFZLE9BQVosRUFBcUI7QUFBQTs7QUFBQSxRQUNaLEVBRFksR0FDYSxPQURiLENBQ1osRUFEWTtBQUFBLFFBQ1IsS0FEUSxHQUNhLE9BRGIsQ0FDUixLQURRO0FBQUEsUUFDRCxLQURDLEdBQ2EsT0FEYixDQUNELEtBREM7QUFBQSxRQUNNLEdBRE4sR0FDYSxPQURiLENBQ00sR0FETjtBQUVuQixRQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsU0FBSyxFQUFMLEdBQVUsRUFBVjtBQUNBLFNBQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxTQUFLLEtBQUwsR0FBYSxLQUFiO0FBQ0EsU0FBSyxJQUFMLEdBQVksRUFBWjs7QUFDQSxRQUFHLENBQUMsR0FBSixFQUFTO0FBQ1AsV0FBSyxHQUFMLHlCQUEwQixJQUFJLENBQUMsR0FBTCxFQUExQjtBQUNELEtBRkQsTUFFTztBQUNMLFdBQUssR0FBTCx1QkFBd0IsR0FBeEI7QUFDRDs7QUFDRCxTQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW1CLFVBQUEsSUFBSSxFQUFJO0FBQUEsVUFDbEIsT0FEa0IsR0FDZ0IsSUFEaEIsQ0FDbEIsT0FEa0I7QUFBQSxVQUNULEtBRFMsR0FDZ0IsSUFEaEIsQ0FDVCxLQURTO0FBQUEsVUFDRixNQURFLEdBQ2dCLElBRGhCLENBQ0YsTUFERTtBQUFBLFVBQ00sTUFETixHQUNnQixJQURoQixDQUNNLE1BRE47QUFFekIsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUwsQ0FBUSxJQUFSLENBQWEsb0JBQWIsQ0FBa0MsT0FBbEMsQ0FB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VUFBQSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQU4sRUFBa0IsS0FBbEIsQ0FBVDtBQUNEO0FBQ0YsT0FMRDs7QUFNQSxNQUFBLFNBQVMsQ0FBQyxTQUFELEVBQVksVUFBWixDQUFUO0FBQ0EsTUFBQSxTQUFTLENBQUMsT0FBRCxFQUFVLFFBQVYsQ0FBVDtBQUNBLFVBQUksTUFBSjs7QUFDQSxzQ0FBa0IsVUFBbEIsbUNBQThCO0FBQTFCLFlBQU0sSUFBSSxtQkFBVjs7QUFDRixZQUFHLFFBQVEsQ0FBQyxRQUFULENBQWtCLElBQWxCLENBQUgsRUFBNEI7QUFDMUIsVUFBQSxNQUFNLEdBQUcsSUFBVDtBQUNBO0FBQ0Q7QUFDRjs7QUFDRCxhQUFPLE1BQVA7QUFDRDtBQWpOSDtBQUFBO0FBQUEsdUJBa05LLFNBbE5MLEVBa05nQixRQWxOaEIsRUFrTjBCO0FBQ3RCLFVBQUcsQ0FBQyxLQUFLLE1BQUwsQ0FBWSxTQUFaLENBQUosRUFBNEI7QUFDMUIsYUFBSyxNQUFMLENBQVksU0FBWixJQUF5QixFQUF6QjtBQUNEOztBQUNELFdBQUssTUFBTCxDQUFZLFNBQVosRUFBdUIsSUFBdkIsQ0FBNEIsUUFBNUI7QUFDQSxhQUFPLElBQVA7QUFDRDtBQXhOSDtBQUFBO0FBQUEseUJBeU5PLFNBek5QLEVBeU5rQixJQXpObEIsRUF5TndCO0FBQ3BCLE9BQUMsS0FBSyxNQUFMLENBQVksU0FBWixLQUEwQixFQUEzQixFQUErQixHQUEvQixDQUFtQyxVQUFBLElBQUksRUFBSTtBQUN6QyxRQUFBLElBQUksQ0FBQyxJQUFELENBQUo7QUFDRCxPQUZEO0FBR0Q7QUE3Tkg7O0FBQUE7QUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qIFxyXG4gIGV2ZW50czpcclxuICAgIHNlbGVjdGVkOiDliJLor41cclxuXHJcblxyXG5cclxuKi9cclxud2luZG93LlNvdXJjZSA9IGNsYXNzIHtcclxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICBjb25zdCB7aGwsIG5vZGVzLCBub3RlcywgX2lkfSA9IG9wdGlvbnM7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHRoaXMuaGwgPSBobDtcclxuICAgIHRoaXMubm90ZXMgPSBub3RlcztcclxuICAgIHRoaXMubm9kZXMgPSBub2RlcztcclxuICAgIHRoaXMuZG9tcyA9IFtdO1xyXG4gICAgaWYoIV9pZCkge1xyXG4gICAgICB0aGlzLl9pZCA9IGBua2MtaGwtbC1pZC0ke0RhdGUubm93KCl9YDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuX2lkID0gYG5rYy1obC1pZC0ke19pZH1gO1xyXG4gICAgfVxyXG4gICAgdGhpcy5ub2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xyXG4gICAgICBjb25zdCB7dGFnTmFtZSwgaW5kZXgsIG9mZnNldCwgbGVuZ3RofSA9IG5vZGU7XHJcbiAgICAgIGNvbnN0IGRvbXMgPSBzZWxmLmhsLnJvb3QuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGFnTmFtZSk7XHJcbiAgICAgIGNvbnN0IHBhcmVudCA9IGRvbXNbaW5kZXhdO1xyXG4gICAgICBjb25zdCB0YXJnZXROb3RlcyA9IHNlbGYuZ2V0Tm9kZXMocGFyZW50LCBvZmZzZXQsIGxlbmd0aCk7IFxyXG4gICAgICB0YXJnZXROb3Rlcy5tYXAodGFyZ2V0Tm9kZSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgICAgIHNlbGYuZG9tcy5wdXNoKHNwYW4pO1xyXG4gICAgICAgIHNwYW4uYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3ZlclwiLCAoKSA9PiB7XHJcbiAgICAgICAgICBzZWxmLmhsLmVtaXQoc2VsZi5obC5ldmVudE5hbWVzLmhvdmVyLCBzZWxmKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzcGFuLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW91dFwiLCAoKSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIuemu+W8gFwiKVxyXG4gICAgICAgICAgc2VsZi5obC5lbWl0KHNlbGYuaGwuZXZlbnROYW1lcy5ob3Zlck91dCwgc2VsZik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc3Bhbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgc2VsZi5obC5lbWl0KHNlbGYuaGwuZXZlbnROYW1lcy5jbGljaywgc2VsZik7XHJcbiAgICAgICAgfSlcclxuICAgICAgICBzcGFuLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIGBua2MtaGwgJHtzZWxmLl9pZH1gKTtcclxuICAgICAgICBzcGFuLmFwcGVuZENoaWxkKHRhcmdldE5vZGUuY2xvbmVOb2RlKGZhbHNlKSk7XHJcbiAgICAgICAgdGFyZ2V0Tm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChzcGFuLCB0YXJnZXROb2RlKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICAgIHRoaXMuaGwuc291cmNlcy5wdXNoKHRoaXMpO1xyXG4gICAgdGhpcy5obC5lbWl0KHRoaXMuaGwuZXZlbnROYW1lc1tfaWQ/XCJyZXN0b3JlXCI6XCJjcmVhdGVcIl0sIHRoaXMpO1xyXG4gIH1cclxuICBhZGRDbGFzcyhrbGFzcykge1xyXG4gICAgY29uc3Qge2RvbXN9ID0gdGhpcztcclxuICAgIGRvbXMubWFwKGRvbSA9PiB7XHJcbiAgICAgIGRvbS5jbGFzc0xpc3QuYWRkKGtsYXNzKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICByZW1vdmVDbGFzcyhrbGFzcykge1xyXG4gICAgY29uc3Qge2RvbXN9ID0gdGhpcztcclxuICAgIGRvbXMubWFwKGRvbSA9PiB7XHJcbiAgICAgIGRvbS5jbGFzc0xpc3QucmVtb3ZlKGtsYXNzKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBkZXN0cm95KCkge1xyXG4gICAgdGhpcy5kb21zLm1hcChkb20gPT4ge1xyXG4gICAgICBkb20uY2xhc3NOYW1lID0gXCJcIjtcclxuICAgIH0pO1xyXG4gIH1cclxuICBnZXRTb3VyY2VzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuc291cmNlcztcclxuICB9XHJcbiAgZ2V0Tm9kZXMocGFyZW50LCBvZmZzZXQsIGxlbmd0aCkge1xyXG4gICAgY29uc3Qgbm9kZVN0YWNrID0gW3BhcmVudF07XHJcbiAgICBsZXQgY3VyT2Zmc2V0ID0gMDtcclxuICAgIGxldCBub2RlID0gbnVsbDtcclxuICAgIGxldCBjdXJMZW5ndGggPSBsZW5ndGg7XHJcbiAgICBsZXQgbm9kZXMgPSBbXTtcclxuICAgIGxldCBzdGFydGVkID0gZmFsc2U7XHJcbiAgICB3aGlsZShub2RlID0gbm9kZVN0YWNrLnBvcCgpKSB7XHJcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gbm9kZS5jaGlsZE5vZGVzO1xyXG4gICAgICBmb3IobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIG5vZGVTdGFjay5wdXNoKGNoaWxkcmVuW2ldKTtcclxuICAgICAgfVxyXG4gICAgICBpZihub2RlLm5vZGVUeXBlID09PSAzICYmIG5vZGUudGV4dENvbnRlbnQubGVuZ3RoKSB7XHJcbiAgICAgICAgY3VyT2Zmc2V0ICs9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoO1xyXG4gICAgICAgIGlmKGN1ck9mZnNldCA+IG9mZnNldCkge1xyXG4gICAgICAgICAgaWYoY3VyTGVuZ3RoIDw9IDApIGJyZWFrO1xyXG4gICAgICAgICAgbGV0IHN0YXJ0T2Zmc2V0O1xyXG4gICAgICAgICAgaWYoIXN0YXJ0ZWQpIHtcclxuICAgICAgICAgICAgc3RhcnRPZmZzZXQgPSBub2RlLnRleHRDb250ZW50Lmxlbmd0aCAtIChjdXJPZmZzZXQgLSBvZmZzZXQpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3RhcnRPZmZzZXQgPSAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc3RhcnRlZCA9IHRydWU7XHJcbiAgICAgICAgICBsZXQgbmVlZExlbmd0aDtcclxuICAgICAgICAgIGlmKGN1ckxlbmd0aCA8PSBub2RlLnRleHRDb250ZW50Lmxlbmd0aCAtIHN0YXJ0T2Zmc2V0KSB7XHJcbiAgICAgICAgICAgIG5lZWRMZW5ndGggPSBjdXJMZW5ndGg7XHJcbiAgICAgICAgICAgIGN1ckxlbmd0aCA9IDA7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBuZWVkTGVuZ3RoID0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSBzdGFydE9mZnNldDtcclxuICAgICAgICAgICAgY3VyTGVuZ3RoIC09IG5lZWRMZW5ndGg7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBub2Rlcy5wdXNoKHtcclxuICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgc3RhcnRPZmZzZXQsXHJcbiAgICAgICAgICAgIG5lZWRMZW5ndGhcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgbm9kZXMgPSBub2Rlcy5tYXAob2JqID0+IHtcclxuICAgICAgbGV0IHtub2RlLCBzdGFydE9mZnNldCwgbmVlZExlbmd0aH0gPSBvYmo7XHJcbiAgICAgIGlmKHN0YXJ0T2Zmc2V0ID4gMCkge1xyXG4gICAgICAgIG5vZGUgPSBub2RlLnNwbGl0VGV4dChzdGFydE9mZnNldCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYobm9kZS50ZXh0Q29udGVudC5sZW5ndGggIT09IG5lZWRMZW5ndGgpIHtcclxuICAgICAgICBub2RlLnNwbGl0VGV4dChuZWVkTGVuZ3RoKTsgIFxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBub2RlO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbm9kZXM7XHJcbiAgfVxyXG59XHJcblxyXG53aW5kb3cuTktDSGlnaGxpZ2h0ZXIgPSBjbGFzcyB7XHJcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgY29uc3Qge1xyXG4gICAgICByb290RWxlbWVudElkLFxyXG4gICAgfSA9IG9wdGlvbnM7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHNlbGYucm9vdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHJvb3RFbGVtZW50SWQpO1xyXG4gICAgc2VsZi5wb3NpdGlvbiA9IHtcclxuICAgICAgeDogMCxcclxuICAgICAgeTogMFxyXG4gICAgfTtcclxuICAgIHNlbGYucmFuZ2UgPSB7fTtcclxuICAgIHNlbGYuc291cmNlcyA9IFtdO1xyXG4gICAgc2VsZi5ldmVudHMgPSB7fTtcclxuICAgIHNlbGYuZXZlbnROYW1lcyA9IHtcclxuICAgICAgY3JlYXRlOiBcImNyZWF0ZVwiLFxyXG4gICAgICBob3ZlcjogXCJob3ZlclwiLFxyXG4gICAgICBob3Zlck91dDogXCJob3Zlck91dFwiLFxyXG4gICAgICBzZWxlY3Q6IFwic2VsZWN0XCIsXHJcbiAgICAgIHJlc3RvcmU6IFwicmVzdG9yZVwiXHJcbiAgICB9XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgc2VsZi5wb3NpdGlvbi54ID0gZS5jbGllbnRYO1xyXG4gICAgICBzZWxmLnBvc2l0aW9uLnkgPSBlLmNsaWVudFk7XHJcbiAgICAgIGNvbnN0IHJhbmdlID0gc2VsZi5nZXRSYW5nZSgpO1xyXG4gICAgICBpZighcmFuZ2UpIHJldHVybjtcclxuICAgICAgaWYoXHJcbiAgICAgICAgcmFuZ2Uuc3RhcnRDb250YWluZXIgPT09IHNlbGYucmFuZ2Uuc3RhcnRDb250YWluZXIgJiZcclxuICAgICAgICByYW5nZS5lbmRDb250YWluZXIgPT09IHNlbGYucmFuZ2UuZW5kQ29udGFpbmVyICYmXHJcbiAgICAgICAgcmFuZ2Uuc3RhcnRPZmZzZXQgPT09IHNlbGYucmFuZ2Uuc3RhcnRPZmZzZXQgJiZcclxuICAgICAgICByYW5nZS5lbmRPZmZzZXQgPT09IHNlbGYucmFuZ2UuZW5kT2Zmc2V0XHJcbiAgICAgICkgcmV0dXJuO1xyXG4gICAgICAvLyDpmZDliLbpgInmi6nmloflrZfnmoTljLrln5/vvIzlj6rog73mmK9zZWxlY3RlcuWGheeahOaWh+Wtl1xyXG4gICAgICBpZighc2VsZi5yb290LmNvbnRhaW5zKHJhbmdlLnN0YXJ0Q29udGFpbmVyKSB8fCAhc2VsZi5yb290LmNvbnRhaW5zKHJhbmdlLmVuZENvbnRhaW5lcikpIHJldHVybjtcclxuICAgICAgc2VsZi5yYW5nZSA9IHJhbmdlO1xyXG4gICAgICBzZWxmLmVtaXQoc2VsZi5ldmVudE5hbWVzLnNlbGVjdCwge1xyXG4gICAgICAgIHBvc2l0aW9uOiBzZWxmLnBvc2l0aW9uLFxyXG4gICAgICAgIHJhbmdlXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGdldFJhbmdlKCkge1xyXG4gICAgY29uc3QgcmFuZ2UgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuZ2V0UmFuZ2VBdCgwKTtcclxuICAgIGNvbnN0IHtzdGFydE9mZnNldCwgZW5kT2Zmc2V0fSA9IHJhbmdlO1xyXG4gICAgaWYoc3RhcnRPZmZzZXQgPT09IGVuZE9mZnNldCkgcmV0dXJuO1xyXG4gICAgcmV0dXJuIHJhbmdlO1xyXG4gIH1cclxuICBkZXN0cm95KHNvdXJjZSkge1xyXG4gICAgaWYodHlwZW9mIHNvdXJjZSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICBzb3VyY2UgPSB0aGlzLmdldFNvdXJjZUJ5SUQoc291cmNlKTtcclxuICAgIH1cclxuICAgIHNvdXJjZS5kZXN0cm95KCk7XHJcbiAgfVxyXG4gIHJlc3RvcmVTb3VyY2VzKHNvdXJjZXMgPSBbXSkge1xyXG4gICAgZm9yKGNvbnN0IHNvdXJjZSBvZiBzb3VyY2VzKSB7XHJcbiAgICAgIHNvdXJjZS5obCA9IHRoaXM7XHJcbiAgICAgIG5ldyBTb3VyY2Uoc291cmNlKTsgIFxyXG4gICAgfVxyXG4gIH1cclxuICBjcmVhdGVTb3VyY2UocmFuZ2UsIG5vdGVzKSB7XHJcbiAgICBjb25zdCB7c3RhcnRDb250YWluZXIsIGVuZENvbnRhaW5lciwgc3RhcnRPZmZzZXQsIGVuZE9mZnNldH0gPSByYW5nZTtcclxuICAgIGlmKHN0YXJ0T2Zmc2V0ID09PSBlbmRPZmZzZXQpIHJldHVybjtcclxuICAgIGxldCBzZWxlY3RlZE5vZGVzID0gW10sIHN0YXJ0Tm9kZSwgZW5kTm9kZTtcclxuICAgIGlmKHN0YXJ0Q29udGFpbmVyLm5vZGVUeXBlICE9PSAzIHx8IHN0YXJ0Q29udGFpbmVyLm5vZGVUeXBlICE9PSAzKSByZXR1cm47XHJcbiAgICBpZihzdGFydENvbnRhaW5lciA9PT0gZW5kQ29udGFpbmVyKSB7IFxyXG4gICAgICAvLyDnm7jlkIzoioLngrlcclxuICAgICAgc3RhcnROb2RlID0gc3RhcnRDb250YWluZXI7XHJcbiAgICAgIGVuZE5vZGUgPSBzdGFydE5vZGU7XHJcbiAgICAgIHNlbGVjdGVkTm9kZXMucHVzaCh7XHJcbiAgICAgICAgbm9kZTogc3RhcnROb2RlLFxyXG4gICAgICAgIG9mZnNldDogc3RhcnRPZmZzZXQsXHJcbiAgICAgICAgbGVuZ3RoOiBlbmRPZmZzZXQgLSBzdGFydE9mZnNldFxyXG4gICAgICB9KTsgXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzdGFydE5vZGUgPSBzdGFydENvbnRhaW5lcjtcclxuICAgICAgZW5kTm9kZSA9IGVuZENvbnRhaW5lcjtcclxuICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKHtcclxuICAgICAgICBub2RlOiBzdGFydE5vZGUsXHJcbiAgICAgICAgb2Zmc2V0OiBzdGFydE9mZnNldCxcclxuICAgICAgICBsZW5ndGg6IHN0YXJ0Tm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSBzdGFydE9mZnNldFxyXG4gICAgICB9KTtcclxuICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKHtcclxuICAgICAgICBub2RlOiBlbmROb2RlLFxyXG4gICAgICAgIG9mZnNldDogMCxcclxuICAgICAgICBsZW5ndGg6IGVuZE9mZnNldFxyXG4gICAgICB9KTtcclxuICAgICAgY29uc3Qgbm9kZXMgPSB0aGlzLmZpbmROb2RlcyhzdGFydE5vZGUsIGVuZE5vZGUpO1xyXG4gICAgICBmb3IoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xyXG4gICAgICAgIHNlbGVjdGVkTm9kZXMucHVzaCh7XHJcbiAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgb2Zmc2V0OiAwLFxyXG4gICAgICAgICAgbGVuZ3RoOiBub2RlLnRleHRDb250ZW50Lmxlbmd0aFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLmdldFNhbWVQYXJlbnROb2RlKHN0YXJ0Tm9kZSwgZW5kTm9kZSk7XHJcbiAgICBjb25zdCB7dGFnTmFtZX0gPSBwYXJlbnQ7XHJcbiAgICBjb25zdCBkb21zID0gdGhpcy5yb290LmdldEVsZW1lbnRzQnlUYWdOYW1lKHRhZ05hbWUpO1xyXG4gICAgbGV0IGluZGV4ID0gLTE7XHJcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgZG9tcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZihkb21zW2ldID09PSBwYXJlbnQpIHtcclxuICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmKGluZGV4ID09PSAtMSkgdGhyb3cgXCLojrflj5bniLblhYPntKDntKLlvJXlh7rplJlcIjtcclxuICAgIGNvbnN0IG5vZGVzID0gW107XHJcbiAgICBmb3IoY29uc3Qgb2JqIG9mIHNlbGVjdGVkTm9kZXMpIHtcclxuICAgICAgY29uc3Qge25vZGUsIG9mZnNldCwgbGVuZ3RofSA9IG9iajtcclxuICAgICAgY29uc3Qgb2Zmc2V0XyA9IHRoaXMuZ2V0T2Zmc2V0KHBhcmVudCwgbm9kZSk7XHJcbiAgICAgIG5vZGVzLnB1c2goe1xyXG4gICAgICAgIHRhZ05hbWUsXHJcbiAgICAgICAgaW5kZXgsXHJcbiAgICAgICAgb2Zmc2V0OiBvZmZzZXRfICsgb2Zmc2V0LFxyXG4gICAgICAgIGxlbmd0aFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgU291cmNlKHtcclxuICAgICAgaGw6IHRoaXMsXHJcbiAgICAgIG5vdGVzLFxyXG4gICAgICBub2RlcyxcclxuICAgIH0pO1xyXG4gIH1cclxuICBnZXRTb3VyY2VCeUlEKGlkKSB7XHJcbiAgICBmb3IoY29uc3QgcyBvZiB0aGlzLnNvdXJjZXMpIHtcclxuICAgICAgaWYocy5pZCA9PT0gaWQpIHJldHVybiBzb3VyY2U7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGFkZENsYXNzKGlkLCBjbGFzc05hbWUpIHtcclxuICAgIGxldCBzb3VyY2U7XHJcbiAgICBpZih0eXBlb2YgaWQgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgc291cmNlID0gdGhpcy5nZXRTb3VyY2VCeUlEKGlkKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNvdXJjZSA9IGlkO1xyXG4gICAgfVxyXG4gICAgc291cmNlLmFkZENsYXNzKGNsYXNzTmFtZSk7XHJcbiAgfVxyXG4gIHJlbW92ZUNsYXNzKGlkLCBjbGFzc05hbWUpIHtcclxuICAgIGxldCBzb3VyY2U7XHJcbiAgICBpZih0eXBlb2YgaWQgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgc291cmNlID0gdGhpcy5nZXRTb3VyY2VCeUlEKGlkKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNvdXJjZSA9IGlkO1xyXG4gICAgfVxyXG4gICAgc291cmNlLnJlbW92ZUNsYXNzKGNsYXNzTmFtZSk7XHJcbiAgfVxyXG4gIGdldE9mZnNldChyb290LCB0ZXh0KSB7XHJcbiAgICBjb25zdCBub2RlU3RhY2sgPSBbcm9vdF07XHJcbiAgICBsZXQgY3VyTm9kZSA9IG51bGw7XHJcbiAgICBsZXQgb2Zmc2V0ID0gMDtcclxuICAgIHdoaWxlIChjdXJOb2RlID0gbm9kZVN0YWNrLnBvcCgpKSB7XHJcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gY3VyTm9kZS5jaGlsZE5vZGVzO1xyXG4gICAgICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICBub2RlU3RhY2sucHVzaChjaGlsZHJlbltpXSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjdXJOb2RlLm5vZGVUeXBlID09PSAzICYmIGN1ck5vZGUgIT09IHRleHQpIHtcclxuICAgICAgICBvZmZzZXQgKz0gY3VyTm9kZS50ZXh0Q29udGVudC5sZW5ndGg7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoY3VyTm9kZS5ub2RlVHlwZSA9PT0gMykge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb2Zmc2V0O1xyXG4gIH1cclxuICBmaW5kTm9kZXMoc3RhcnROb2RlLCBlbmROb2RlKSB7XHJcbiAgICBjb25zdCBzZWxlY3RlZE5vZGVzID0gW107XHJcbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLmdldFNhbWVQYXJlbnROb2RlKHN0YXJ0Tm9kZSwgZW5kTm9kZSk7XHJcbiAgICBpZihwYXJlbnQpIHtcclxuICAgICAgbGV0IHN0YXJ0ID0gZmFsc2UsIGVuZCA9IGZhbHNlO1xyXG4gICAgICBjb25zdCBnZXRDaGlsZE5vZGUgPSAobm9kZSkgPT4ge1xyXG4gICAgICAgIGlmKCFub2RlLmhhc0NoaWxkTm9kZXMoKSkgcmV0dXJuO1xyXG4gICAgICAgIGZvcihjb25zdCBuIG9mIG5vZGUuY2hpbGROb2Rlcykge1xyXG4gICAgICAgICAgaWYoZW5kIHx8IG4gPT09IGVuZE5vZGUpIHtcclxuICAgICAgICAgICAgZW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfSBlbHNlIGlmKHN0YXJ0ICYmIG4ubm9kZVR5cGUgPT09IDMpIHtcclxuICAgICAgICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKG4pO1xyXG4gICAgICAgICAgfSBlbHNlIGlmKG4gPT09IHN0YXJ0Tm9kZSkge1xyXG4gICAgICAgICAgICBzdGFydCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBnZXRDaGlsZE5vZGUobik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICBnZXRDaGlsZE5vZGUocGFyZW50KTtcclxuICAgIH1cclxuICAgIHJldHVybiBzZWxlY3RlZE5vZGVzO1xyXG4gIH1cclxuICBnZXRTYW1lUGFyZW50Tm9kZShzdGFydE5vZGUsIGVuZE5vZGUpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgaWYoIWVuZE5vZGUgfHwgc3RhcnROb2RlID09PSBlbmROb2RlKSByZXR1cm4gc3RhcnROb2RlLnBhcmVudE5vZGU7XHJcbiAgICBjb25zdCBzdGFydE5vZGVzID0gW10sIGVuZE5vZGVzID0gW107XHJcbiAgICBjb25zdCBnZXRQYXJlbnQgPSAobm9kZSwgbm9kZXMpID0+IHtcclxuICAgICAgbm9kZXMucHVzaChub2RlKTtcclxuICAgICAgaWYobm9kZSAhPT0gc2VsZi5yb290ICYmIG5vZGUucGFyZW50Tm9kZSkge1xyXG4gICAgICAgIGdldFBhcmVudChub2RlLnBhcmVudE5vZGUsIG5vZGVzKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGdldFBhcmVudChzdGFydE5vZGUsIHN0YXJ0Tm9kZXMpO1xyXG4gICAgZ2V0UGFyZW50KGVuZE5vZGUsIGVuZE5vZGVzKTtcclxuICAgIGxldCBwYXJlbnQ7XHJcbiAgICBmb3IoY29uc3Qgbm9kZSBvZiBzdGFydE5vZGVzKSB7XHJcbiAgICAgIGlmKGVuZE5vZGVzLmluY2x1ZGVzKG5vZGUpKSB7XHJcbiAgICAgICAgcGFyZW50ID0gbm9kZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhcmVudDtcclxuICB9XHJcbiAgb24oZXZlbnROYW1lLCBjYWxsYmFjaykge1xyXG4gICAgaWYoIXRoaXMuZXZlbnRzW2V2ZW50TmFtZV0pIHtcclxuICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXSA9IFtdO1xyXG4gICAgfVxyXG4gICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXS5wdXNoKGNhbGxiYWNrKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuICBlbWl0KGV2ZW50TmFtZSwgZGF0YSkge1xyXG4gICAgKHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0gfHwgW10pLm1hcChmdW5jID0+IHtcclxuICAgICAgZnVuYyhkYXRhKTtcclxuICAgIH0pO1xyXG4gIH1cclxufTsiXX0=
