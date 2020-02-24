(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Source =
/*#__PURE__*/
function () {
  function Source(options) {
    _classCallCheck(this, Source);

    var postNote = options.postNote,
        nodes = options.nodes,
        notes = options.notes;
    var self = this;
    this.postNote = postNote;
    this.notes = notes;
    this.nodes = nodes;
    this.id = "post-node-id-".concat(Date.now());
    this.doms = [];
    this.nodes.forEach(function (node) {
      var tagName = node.tagName,
          index = node.index,
          offset = node.offset,
          length = node.length;
      var parent = self.postNote.rootDom.find(tagName)[index];
      var targetNode = self.postNote.getNodeByOffset(parent, offset, length);
      var span = document.createElement("span");
      self.doms.push(span);
      span.addEventListener("mouseenter", function () {
        self.onHover();
      });
      span.addEventListener("mouseleave", function () {
        self.onHoverOut();
      });
      span.addEventListener("click", function () {
        postNote.selectNote(self);
      });
      span.setAttribute("class", "post-node ".concat(self.id));
      span.appendChild(targetNode.cloneNode(false));
      targetNode.parentNode.replaceChild(span, targetNode);
    });
    self.addhighlightClass();
  }

  _createClass(Source, [{
    key: "addClass",
    value: function addClass(klass) {
      this.doms.map(function (d) {
        $(d).addClass(klass);
      });
    }
  }, {
    key: "removeClass",
    value: function removeClass(klass) {
      this.doms.map(function (d) {
        $(d).removeClass(klass);
      });
    }
  }, {
    key: "addhighlightClass",
    value: function addhighlightClass() {
      this.addClass("post-node-mark");
    }
  }, {
    key: "onHover",
    value: function onHover() {
      this.addClass("post-node-hover");
    }
  }, {
    key: "onHoverOut",
    value: function onHoverOut() {
      this.removeClass("post-node-hover");
    }
  }]);

  return Source;
}();

;

NKC.modules.PostNote =
/*#__PURE__*/
function () {
  function _class(options) {
    _classCallCheck(this, _class);

    var selecter = options.selecter,
        onClick = options.onClick;
    var self = this;
    self.button = $("#modulePostNoteButton");
    self.position = {
      x: 0,
      y: 0
    };
    self.range = "";
    self.sources = [];
    if (onClick) self.onClick = onClick;
    self.rootDom = $(selecter);

    if (!window.CommonModal) {
      if (!NKC.modules.CommonModal) {
        return sweetError("未引入表单模块");
      } else {
        window.CommonModal = new NKC.modules.CommonModal();
      }
    }

    window.addEventListener("mousedown", function (e) {
      self.position.x = e.clientX;
      self.position.y = e.clientY;
    });
    window.addEventListener("mouseup", function () {
      self.removeButton();
      var range = self.getRange();
      if (!range) return;

      if (range.startContainer === self.range.startContainer && range.endContainer === self.range.endContainer && range.startOffset === self.range.startOffset && range.endOffset === self.range.endOffset) {
        return;
      } // 限制选择文字的区域，只能是selecter内的文字


      if (!self.rootDom[0].contains(range.startContainer) || !self.rootDom[0].contains(range.endContainer)) return;
      self.range = range;
      self.showButton();
    });
    self.button[0].addEventListener("mouseup", function () {
      self.removeButton();
      window.CommonModal.open(function (data) {
        if (!data[0].value) return sweetError("批注内容不能为空");
        var source = self.createSourceByRange(self.range, data[0].value);
        console.log(source);
        self.addSource(source);
        self.removeButton();
        window.CommonModal.close();
      }, {
        title: "添加批注",
        data: [{
          dom: "textarea",
          value: ""
        }]
      });
    });
  }

  _createClass(_class, [{
    key: "showButton",
    value: function showButton() {
      this.button.css({
        top: this.position.y,
        left: this.position.x,
        display: "block"
      });
    }
  }, {
    key: "removeButton",
    value: function removeButton() {
      this.button.css("display", "none");
    }
  }, {
    key: "getParentNode",
    value: function getParentNode(startNode, endNode) {
      if (!endNode || startNode === endNode) return startNode.parentNode;
      var startNodes = [],
          endNodes = [];

      var getParent = function getParent(node, nodes) {
        nodes.push(node);

        if (node.parentNode) {
          getParent(node.parentNode, nodes);
        }
      };

      getParent(startNode, startNodes);
      getParent(endNode, endNodes);
      var parent;

      for (var _i = 0, _startNodes = startNodes; _i < _startNodes.length; _i++) {
        var node = _startNodes[_i];

        if (endNodes.includes(node)) {
          parent = node;
          break;
        }
      }

      return parent;
    }
  }, {
    key: "findNodes",
    value: function findNodes(startNode, endNode) {
      var selectedNodes = [];
      var parent = this.getParentNode(startNode, endNode);

      if (parent) {
        var start = false,
            end = false;

        var getChildNode = function getChildNode(node) {
          if (!node.hasChildNodes()) return;
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = node.childNodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var n = _step.value;

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
        };

        getChildNode(parent);
      }

      return selectedNodes;
    }
  }, {
    key: "getStartNode",
    value: function getStartNode(range) {
      var startContainer = range.startContainer,
          endContainer = range.endContainer,
          startOffset = range.startOffset,
          endOffset = range.endOffset;
      var startNode;

      if (startContainer === endContainer) {
        // 相同节点
        startNode = startContainer.splitText(startOffset);
        startNode.splitText(endOffset - startOffset);
      } else {
        startNode = startContainer.splitText(startOffset);
      }

      return startNode;
    }
  }, {
    key: "removeSource",
    value: function removeSource(source) {
      source.doms(function (dom) {// dom
      });
    }
  }, {
    key: "createSourceByRange",
    value: function createSourceByRange(range, note) {
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

      var parent = this.getParentNode(startNode, endNode);
      var tagName = parent.tagName;
      var index = this.rootDom.find(tagName).index($(parent));
      var nodes = [];

      for (var _i2 = 0, _selectedNodes = selectedNodes; _i2 < _selectedNodes.length; _i2++) {
        var _node = _selectedNodes[_i2];
        var offset = this.getOffset(parent, _node);
        var length = _node.textContent.length;
        nodes.push({
          tagName: tagName,
          index: index,
          offset: offset,
          length: length
        });
      }

      return new Source({
        postNote: this,
        notes: [{
          uid: NKC.configs.uid,
          c: note
        }],
        nodes: nodes
      });
    }
  }, {
    key: "addSource",
    value: function addSource(source) {
      this.sources.push(source);
      console.log(source);
    }
  }, {
    key: "getRange",
    value: function getRange() {
      var range = window.getSelection().getRangeAt(0);
      var startOffset = range.startOffset,
          endOffset = range.endOffset;
      if (startOffset === endOffset) return;
      return range;
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
    key: "getNodeByOffset",
    value: function getNodeByOffset(parent, offset, length) {
      var nodeStack = [parent];
      var curNode = null;
      var curOffset = 0;
      var startOffset = 0;

      while (curNode = nodeStack.pop()) {
        var children = curNode.childNodes;

        for (var i = children.length - 1; i >= 0; i--) {
          nodeStack.push(children[i]);
        }

        if (curNode.nodeType === 3) {
          startOffset = offset - curOffset;
          curOffset += curNode.textContent.length;

          if (curOffset > offset) {
            break;
          }
        }
      }

      if (!curNode) {
        curNode = parent;
      }

      var node = curNode.splitText(startOffset);
      node.splitText(length);
      return node;
    }
  }, {
    key: "selectNote",
    value: function selectNote(id) {
      console.log(id);
    }
  }]);

  return _class;
}();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvbmtjUG9zdE5vdGUvbmtjUG9zdE5vdGUubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7SUNBTSxNOzs7QUFDSixrQkFBWSxPQUFaLEVBQXFCO0FBQUE7O0FBQUEsUUFDWixRQURZLEdBQ2MsT0FEZCxDQUNaLFFBRFk7QUFBQSxRQUNGLEtBREUsR0FDYyxPQURkLENBQ0YsS0FERTtBQUFBLFFBQ0ssS0FETCxHQUNjLE9BRGQsQ0FDSyxLQURMO0FBRW5CLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxTQUFLLFFBQUwsR0FBZ0IsUUFBaEI7QUFDQSxTQUFLLEtBQUwsR0FBYSxLQUFiO0FBQ0EsU0FBSyxLQUFMLEdBQWEsS0FBYjtBQUNBLFNBQUssRUFBTCwwQkFBMEIsSUFBSSxDQUFDLEdBQUwsRUFBMUI7QUFDQSxTQUFLLElBQUwsR0FBWSxFQUFaO0FBQ0EsU0FBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixVQUFBLElBQUksRUFBSTtBQUFBLFVBQ2xCLE9BRGtCLEdBQ2dCLElBRGhCLENBQ2xCLE9BRGtCO0FBQUEsVUFDVCxLQURTLEdBQ2dCLElBRGhCLENBQ1QsS0FEUztBQUFBLFVBQ0YsTUFERSxHQUNnQixJQURoQixDQUNGLE1BREU7QUFBQSxVQUNNLE1BRE4sR0FDZ0IsSUFEaEIsQ0FDTSxNQUROO0FBRXpCLFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFMLENBQWMsT0FBZCxDQUFzQixJQUF0QixDQUEyQixPQUEzQixFQUFvQyxLQUFwQyxDQUFmO0FBQ0EsVUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxlQUFkLENBQThCLE1BQTlCLEVBQXNDLE1BQXRDLEVBQThDLE1BQTlDLENBQW5CO0FBQ0EsVUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsTUFB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WUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQXpCOztBQUNBLGFBQUssSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQVQsR0FBa0IsQ0FBL0IsRUFBa0MsQ0FBQyxJQUFJLENBQXZDLEVBQTBDLENBQUMsRUFBM0MsRUFBK0M7QUFDN0MsVUFBQSxTQUFTLENBQUMsSUFBVixDQUFlLFFBQVEsQ0FBQyxDQUFELENBQXZCO0FBQ0Q7O0FBQ0QsWUFBSSxPQUFPLENBQUMsUUFBUixLQUFxQixDQUF6QixFQUE0QjtBQUMxQixVQUFBLFdBQVcsR0FBRyxNQUFNLEdBQUcsU0FBdkI7QUFDQSxVQUFBLFNBQVMsSUFBSSxPQUFPLENBQUMsV0FBUixDQUFvQixNQUFqQzs7QUFDQSxjQUFJLFNBQVMsR0FBRyxNQUFoQixFQUF3QjtBQUNwQjtBQUNIO0FBQ0Y7QUFDRjs7QUFDRCxVQUFJLENBQUMsT0FBTCxFQUFjO0FBQ1osUUFBQSxPQUFPLEdBQUcsTUFBVjtBQUNEOztBQUNELFVBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFSLENBQWtCLFdBQWxCLENBQVg7QUFDQSxNQUFBLElBQUksQ0FBQyxTQUFMLENBQWUsTUFBZjtBQUNBLGFBQU8sSUFBUDtBQUNEO0FBeE9IO0FBQUE7QUFBQSwrQkF5T2EsRUF6T2IsRUF5T2lCO0FBQ2IsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLEVBQVo7QUFDRDtBQTNPSDs7QUFBQTtBQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2xhc3MgU291cmNle1xyXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgIGNvbnN0IHtwb3N0Tm90ZSwgbm9kZXMsIG5vdGVzfSA9IG9wdGlvbnM7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHRoaXMucG9zdE5vdGUgPSBwb3N0Tm90ZTtcclxuICAgIHRoaXMubm90ZXMgPSBub3RlcztcclxuICAgIHRoaXMubm9kZXMgPSBub2RlcztcclxuICAgIHRoaXMuaWQgPSBgcG9zdC1ub2RlLWlkLSR7RGF0ZS5ub3coKX1gO1xyXG4gICAgdGhpcy5kb21zID0gW107XHJcbiAgICB0aGlzLm5vZGVzLmZvckVhY2gobm9kZSA9PiB7XHJcbiAgICAgIGNvbnN0IHt0YWdOYW1lLCBpbmRleCwgb2Zmc2V0LCBsZW5ndGh9ID0gbm9kZTtcclxuICAgICAgY29uc3QgcGFyZW50ID0gc2VsZi5wb3N0Tm90ZS5yb290RG9tLmZpbmQodGFnTmFtZSlbaW5kZXhdO1xyXG4gICAgICBjb25zdCB0YXJnZXROb2RlID0gc2VsZi5wb3N0Tm90ZS5nZXROb2RlQnlPZmZzZXQocGFyZW50LCBvZmZzZXQsIGxlbmd0aCk7XHJcbiAgICAgIGNvbnN0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgICAgc2VsZi5kb21zLnB1c2goc3Bhbik7XHJcbiAgICAgIHNwYW4uYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCkgPT4ge1xyXG4gICAgICAgIHNlbGYub25Ib3ZlcigpO1xyXG4gICAgICB9KTtcclxuICAgICAgc3Bhbi5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKSA9PiB7XHJcbiAgICAgICAgc2VsZi5vbkhvdmVyT3V0KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBzcGFuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgcG9zdE5vdGUuc2VsZWN0Tm90ZShzZWxmKTtcclxuICAgICAgfSlcclxuICAgICAgc3Bhbi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBgcG9zdC1ub2RlICR7c2VsZi5pZH1gKTtcclxuICAgICAgc3Bhbi5hcHBlbmRDaGlsZCh0YXJnZXROb2RlLmNsb25lTm9kZShmYWxzZSkpO1xyXG4gICAgICB0YXJnZXROb2RlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHNwYW4sIHRhcmdldE5vZGUpO1xyXG4gICAgfSk7XHJcbiAgICBzZWxmLmFkZGhpZ2hsaWdodENsYXNzKCk7XHJcbiAgfVxyXG4gIGFkZENsYXNzKGtsYXNzKSB7XHJcbiAgICB0aGlzLmRvbXMubWFwKGQgPT4ge1xyXG4gICAgICAkKGQpLmFkZENsYXNzKGtsYXNzKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICByZW1vdmVDbGFzcyhrbGFzcykge1xyXG4gICAgdGhpcy5kb21zLm1hcChkID0+IHtcclxuICAgICAgJChkKS5yZW1vdmVDbGFzcyhrbGFzcyk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgYWRkaGlnaGxpZ2h0Q2xhc3MoKSB7XHJcbiAgICB0aGlzLmFkZENsYXNzKFwicG9zdC1ub2RlLW1hcmtcIik7XHJcbiAgfVxyXG4gIG9uSG92ZXIoKSB7XHJcbiAgICB0aGlzLmFkZENsYXNzKFwicG9zdC1ub2RlLWhvdmVyXCIpO1xyXG4gIH1cclxuICBvbkhvdmVyT3V0KCkge1xyXG4gICAgdGhpcy5yZW1vdmVDbGFzcyhcInBvc3Qtbm9kZS1ob3ZlclwiKTtcclxuICB9XHJcbn07XHJcblxyXG5cclxuTktDLm1vZHVsZXMuUG9zdE5vdGUgPSBjbGFzcyB7XHJcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgY29uc3Qge3NlbGVjdGVyLCBvbkNsaWNrfSA9IG9wdGlvbnM7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuXHJcbiAgICBzZWxmLmJ1dHRvbiA9ICQoXCIjbW9kdWxlUG9zdE5vdGVCdXR0b25cIik7XHJcbiAgICBzZWxmLnBvc2l0aW9uID0ge1xyXG4gICAgICB4OiAwLFxyXG4gICAgICB5OiAwXHJcbiAgICB9O1xyXG4gICAgc2VsZi5yYW5nZSA9IFwiXCI7XHJcbiAgICBzZWxmLnNvdXJjZXMgPSBbXTtcclxuXHJcbiAgICBpZihvbkNsaWNrKSBzZWxmLm9uQ2xpY2sgPSBvbkNsaWNrO1xyXG4gICAgc2VsZi5yb290RG9tID0gJChzZWxlY3Rlcik7XHJcbiAgICBpZighd2luZG93LkNvbW1vbk1vZGFsKSB7XHJcbiAgICAgIGlmKCFOS0MubW9kdWxlcy5Db21tb25Nb2RhbCkge1xyXG4gICAgICAgIHJldHVybiBzd2VldEVycm9yKFwi5pyq5byV5YWl6KGo5Y2V5qih5Z2XXCIpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHdpbmRvdy5Db21tb25Nb2RhbCA9IG5ldyBOS0MubW9kdWxlcy5Db21tb25Nb2RhbCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIHNlbGYucG9zaXRpb24ueCA9IGUuY2xpZW50WDtcclxuICAgICAgc2VsZi5wb3NpdGlvbi55ID0gZS5jbGllbnRZO1xyXG4gICAgfSk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgIHNlbGYucmVtb3ZlQnV0dG9uKCk7XHJcbiAgICAgIGNvbnN0IHJhbmdlID0gc2VsZi5nZXRSYW5nZSgpO1xyXG4gICAgICBpZighcmFuZ2UpIHJldHVybjsgICAgICBcclxuICAgICAgaWYocmFuZ2Uuc3RhcnRDb250YWluZXIgPT09IHNlbGYucmFuZ2Uuc3RhcnRDb250YWluZXIgJiZcclxuICAgICAgICByYW5nZS5lbmRDb250YWluZXIgPT09IHNlbGYucmFuZ2UuZW5kQ29udGFpbmVyICYmXHJcbiAgICAgICAgcmFuZ2Uuc3RhcnRPZmZzZXQgPT09IHNlbGYucmFuZ2Uuc3RhcnRPZmZzZXQgJiZcclxuICAgICAgICByYW5nZS5lbmRPZmZzZXQgPT09IHNlbGYucmFuZ2UuZW5kT2Zmc2V0XHJcbiAgICAgICkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICAvLyDpmZDliLbpgInmi6nmloflrZfnmoTljLrln5/vvIzlj6rog73mmK9zZWxlY3RlcuWGheeahOaWh+Wtl1xyXG4gICAgICBpZighc2VsZi5yb290RG9tWzBdLmNvbnRhaW5zKHJhbmdlLnN0YXJ0Q29udGFpbmVyKSB8fCAhc2VsZi5yb290RG9tWzBdLmNvbnRhaW5zKHJhbmdlLmVuZENvbnRhaW5lcikpIHJldHVybjtcclxuICAgICAgc2VsZi5yYW5nZSA9IHJhbmdlO1xyXG4gICAgICBzZWxmLnNob3dCdXR0b24oKTtcclxuICAgIH0pO1xyXG4gICAgc2VsZi5idXR0b25bMF0uYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgIHNlbGYucmVtb3ZlQnV0dG9uKCk7XHJcbiAgICAgIHdpbmRvdy5Db21tb25Nb2RhbC5vcGVuKGRhdGEgPT4ge1xyXG4gICAgICAgIGlmKCFkYXRhWzBdLnZhbHVlKSByZXR1cm4gc3dlZXRFcnJvcihcIuaJueazqOWGheWuueS4jeiDveS4uuepulwiKTtcclxuICAgICAgICBjb25zdCBzb3VyY2UgPSBzZWxmLmNyZWF0ZVNvdXJjZUJ5UmFuZ2Uoc2VsZi5yYW5nZSwgZGF0YVswXS52YWx1ZSlcclxuICAgICAgICBjb25zb2xlLmxvZyhzb3VyY2UpO1xyXG4gICAgICAgIHNlbGYuYWRkU291cmNlKHNvdXJjZSk7XHJcbiAgICAgICAgc2VsZi5yZW1vdmVCdXR0b24oKTtcclxuICAgICAgICB3aW5kb3cuQ29tbW9uTW9kYWwuY2xvc2UoKTtcclxuICAgICAgfSwge1xyXG4gICAgICAgIHRpdGxlOiBcIua3u+WKoOaJueazqFwiLFxyXG4gICAgICAgIGRhdGE6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgZG9tOiBcInRleHRhcmVhXCIsXHJcbiAgICAgICAgICAgIHZhbHVlOiBcIlwiXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9KTtcclxuICAgIH0pXHJcbiAgfVxyXG4gIHNob3dCdXR0b24oKSB7XHJcbiAgICB0aGlzLmJ1dHRvbi5jc3Moe1xyXG4gICAgICB0b3A6IHRoaXMucG9zaXRpb24ueSxcclxuICAgICAgbGVmdDogdGhpcy5wb3NpdGlvbi54LFxyXG4gICAgICBkaXNwbGF5OiBcImJsb2NrXCJcclxuICAgIH0pO1xyXG4gIH1cclxuICByZW1vdmVCdXR0b24oKSB7XHJcbiAgICB0aGlzLmJ1dHRvbi5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcclxuICB9XHJcbiAgZ2V0UGFyZW50Tm9kZShzdGFydE5vZGUsIGVuZE5vZGUpIHtcclxuICAgIGlmKCFlbmROb2RlIHx8IHN0YXJ0Tm9kZSA9PT0gZW5kTm9kZSkgcmV0dXJuIHN0YXJ0Tm9kZS5wYXJlbnROb2RlO1xyXG4gICAgY29uc3Qgc3RhcnROb2RlcyA9IFtdLCBlbmROb2RlcyA9IFtdO1xyXG4gICAgY29uc3QgZ2V0UGFyZW50ID0gKG5vZGUsIG5vZGVzKSA9PiB7XHJcbiAgICAgIG5vZGVzLnB1c2gobm9kZSk7XHJcbiAgICAgIGlmKG5vZGUucGFyZW50Tm9kZSkge1xyXG4gICAgICAgIGdldFBhcmVudChub2RlLnBhcmVudE5vZGUsIG5vZGVzKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGdldFBhcmVudChzdGFydE5vZGUsIHN0YXJ0Tm9kZXMpO1xyXG4gICAgZ2V0UGFyZW50KGVuZE5vZGUsIGVuZE5vZGVzKTtcclxuICAgIGxldCBwYXJlbnQ7XHJcbiAgICBmb3IoY29uc3Qgbm9kZSBvZiBzdGFydE5vZGVzKSB7XHJcbiAgICAgIGlmKGVuZE5vZGVzLmluY2x1ZGVzKG5vZGUpKSB7XHJcbiAgICAgICAgcGFyZW50ID0gbm9kZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhcmVudDtcclxuICB9XHJcbiAgZmluZE5vZGVzKHN0YXJ0Tm9kZSwgZW5kTm9kZSkge1xyXG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlcyA9IFtdO1xyXG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5nZXRQYXJlbnROb2RlKHN0YXJ0Tm9kZSwgZW5kTm9kZSk7XHJcbiAgICBpZihwYXJlbnQpIHtcclxuICAgICAgbGV0IHN0YXJ0ID0gZmFsc2UsIGVuZCA9IGZhbHNlO1xyXG4gICAgICBjb25zdCBnZXRDaGlsZE5vZGUgPSAobm9kZSkgPT4ge1xyXG4gICAgICAgIGlmKCFub2RlLmhhc0NoaWxkTm9kZXMoKSkgcmV0dXJuO1xyXG4gICAgICAgIGZvcihjb25zdCBuIG9mIG5vZGUuY2hpbGROb2Rlcykge1xyXG4gICAgICAgICAgaWYoZW5kIHx8IG4gPT09IGVuZE5vZGUpIHtcclxuICAgICAgICAgICAgZW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfSBlbHNlIGlmKHN0YXJ0ICYmIG4ubm9kZVR5cGUgPT09IDMpIHtcclxuICAgICAgICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKG4pO1xyXG4gICAgICAgICAgfSBlbHNlIGlmKG4gPT09IHN0YXJ0Tm9kZSkge1xyXG4gICAgICAgICAgICBzdGFydCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBnZXRDaGlsZE5vZGUobik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICBnZXRDaGlsZE5vZGUocGFyZW50KTtcclxuICAgIH1cclxuICAgIHJldHVybiBzZWxlY3RlZE5vZGVzO1xyXG4gIH1cclxuICBnZXRTdGFydE5vZGUocmFuZ2UpIHtcclxuICAgIGNvbnN0IHtzdGFydENvbnRhaW5lciwgZW5kQ29udGFpbmVyLCBzdGFydE9mZnNldCwgZW5kT2Zmc2V0fSA9IHJhbmdlO1xyXG4gICAgbGV0IHN0YXJ0Tm9kZTtcclxuICAgIGlmKHN0YXJ0Q29udGFpbmVyID09PSBlbmRDb250YWluZXIpIHsgXHJcbiAgICAgIC8vIOebuOWQjOiKgueCuVxyXG4gICAgICBzdGFydE5vZGUgPSBzdGFydENvbnRhaW5lci5zcGxpdFRleHQoc3RhcnRPZmZzZXQpO1xyXG4gICAgICBzdGFydE5vZGUuc3BsaXRUZXh0KGVuZE9mZnNldCAtIHN0YXJ0T2Zmc2V0KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHN0YXJ0Tm9kZSA9IHN0YXJ0Q29udGFpbmVyLnNwbGl0VGV4dChzdGFydE9mZnNldCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3RhcnROb2RlO1xyXG4gIH1cclxuICByZW1vdmVTb3VyY2Uoc291cmNlKSB7XHJcbiAgICBzb3VyY2UuZG9tcyhkb20gPT4ge1xyXG4gICAgICAvLyBkb21cclxuICAgIH0pO1xyXG4gIH1cclxuICBjcmVhdGVTb3VyY2VCeVJhbmdlKHJhbmdlLCBub3RlKSB7XHJcbiAgICBjb25zdCB7c3RhcnRDb250YWluZXIsIGVuZENvbnRhaW5lciwgc3RhcnRPZmZzZXQsIGVuZE9mZnNldH0gPSByYW5nZTtcclxuICAgIGlmKHN0YXJ0T2Zmc2V0ID09PSBlbmRPZmZzZXQpIHJldHVybjtcclxuICAgIGxldCBzZWxlY3RlZE5vZGVzID0gW10sIHN0YXJ0Tm9kZSwgZW5kTm9kZTtcclxuICAgIGlmKHN0YXJ0Q29udGFpbmVyLm5vZGVUeXBlICE9PSAzIHx8IHN0YXJ0Q29udGFpbmVyLm5vZGVUeXBlICE9PSAzKSByZXR1cm47XHJcbiAgICBpZihzdGFydENvbnRhaW5lciA9PT0gZW5kQ29udGFpbmVyKSB7IFxyXG4gICAgICAvLyDnm7jlkIzoioLngrlcclxuICAgICAgc3RhcnROb2RlID0gc3RhcnRDb250YWluZXIuc3BsaXRUZXh0KHN0YXJ0T2Zmc2V0KTtcclxuICAgICAgc3RhcnROb2RlLnNwbGl0VGV4dChlbmRPZmZzZXQgLSBzdGFydE9mZnNldCk7XHJcbiAgICAgIHNlbGVjdGVkTm9kZXMucHVzaChzdGFydE5vZGUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3RhcnROb2RlID0gc3RhcnRDb250YWluZXIuc3BsaXRUZXh0KHN0YXJ0T2Zmc2V0KTtcclxuICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKHN0YXJ0Tm9kZSk7XHJcbiAgICAgIGVuZENvbnRhaW5lci5zcGxpdFRleHQoZW5kT2Zmc2V0KTtcclxuICAgICAgZW5kTm9kZSA9IGVuZENvbnRhaW5lcjtcclxuICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKGVuZE5vZGUpO1xyXG4gICAgICBjb25zdCBub2RlcyA9IHRoaXMuZmluZE5vZGVzKHN0YXJ0Tm9kZSwgZW5kTm9kZSk7XHJcbiAgICAgIGZvcihjb25zdCBub2RlIG9mIG5vZGVzKSB7XHJcbiAgICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKG5vZGUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLmdldFBhcmVudE5vZGUoc3RhcnROb2RlLCBlbmROb2RlKTtcclxuICAgIGNvbnN0IHt0YWdOYW1lfSA9IHBhcmVudDtcclxuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5yb290RG9tLmZpbmQodGFnTmFtZSkuaW5kZXgoJChwYXJlbnQpKTtcclxuICAgIGNvbnN0IG5vZGVzID0gW107XHJcbiAgICBmb3IoY29uc3Qgbm9kZSBvZiBzZWxlY3RlZE5vZGVzKSB7XHJcbiAgICAgIGNvbnN0IG9mZnNldCA9IHRoaXMuZ2V0T2Zmc2V0KHBhcmVudCwgbm9kZSk7XHJcbiAgICAgIGNvbnN0IGxlbmd0aCA9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoO1xyXG4gICAgICBub2Rlcy5wdXNoKHtcclxuICAgICAgICB0YWdOYW1lLFxyXG4gICAgICAgIGluZGV4LFxyXG4gICAgICAgIG9mZnNldCxcclxuICAgICAgICBsZW5ndGhcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IFNvdXJjZSh7XHJcbiAgICAgIHBvc3ROb3RlOiB0aGlzLFxyXG4gICAgICBub3RlczogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHVpZDogTktDLmNvbmZpZ3MudWlkLFxyXG4gICAgICAgICAgYzogbm90ZVxyXG4gICAgICAgIH1cclxuICAgICAgXSxcclxuICAgICAgbm9kZXMsXHJcbiAgICB9KTtcclxuXHJcbiAgfVxyXG4gIGFkZFNvdXJjZShzb3VyY2UpIHtcclxuICAgIHRoaXMuc291cmNlcy5wdXNoKHNvdXJjZSk7XHJcbiAgICBjb25zb2xlLmxvZyhzb3VyY2UpXHJcbiAgfVxyXG4gIGdldFJhbmdlKCkge1xyXG4gICAgY29uc3QgcmFuZ2UgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuZ2V0UmFuZ2VBdCgwKTtcclxuICAgIGNvbnN0IHtzdGFydE9mZnNldCwgZW5kT2Zmc2V0fSA9IHJhbmdlO1xyXG4gICAgaWYoc3RhcnRPZmZzZXQgPT09IGVuZE9mZnNldCkgcmV0dXJuO1xyXG4gICAgcmV0dXJuIHJhbmdlO1xyXG4gIH1cclxuICBnZXRPZmZzZXQocm9vdCwgdGV4dCkge1xyXG4gICAgY29uc3Qgbm9kZVN0YWNrID0gW3Jvb3RdO1xyXG4gICAgbGV0IGN1ck5vZGUgPSBudWxsO1xyXG4gICAgbGV0IG9mZnNldCA9IDA7XHJcbiAgICB3aGlsZSAoY3VyTm9kZSA9IG5vZGVTdGFjay5wb3AoKSkge1xyXG4gICAgICBjb25zdCBjaGlsZHJlbiA9IGN1ck5vZGUuY2hpbGROb2RlcztcclxuICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgbm9kZVN0YWNrLnB1c2goY2hpbGRyZW5baV0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoY3VyTm9kZS5ub2RlVHlwZSA9PT0gMyAmJiBjdXJOb2RlICE9PSB0ZXh0KSB7XHJcbiAgICAgICAgb2Zmc2V0ICs9IGN1ck5vZGUudGV4dENvbnRlbnQubGVuZ3RoO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGN1ck5vZGUubm9kZVR5cGUgPT09IDMpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9mZnNldDtcclxuICB9XHJcbiAgZ2V0Tm9kZUJ5T2Zmc2V0KHBhcmVudCwgb2Zmc2V0LCBsZW5ndGgpIHtcclxuICAgIGNvbnN0IG5vZGVTdGFjayA9IFtwYXJlbnRdO1xyXG4gICAgbGV0IGN1ck5vZGUgPSBudWxsO1xyXG4gICAgbGV0IGN1ck9mZnNldCA9IDA7XHJcbiAgICBsZXQgc3RhcnRPZmZzZXQgPSAwO1xyXG4gICAgd2hpbGUgKGN1ck5vZGUgPSBub2RlU3RhY2sucG9wKCkpIHtcclxuICAgICAgY29uc3QgY2hpbGRyZW4gPSBjdXJOb2RlLmNoaWxkTm9kZXM7XHJcbiAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIG5vZGVTdGFjay5wdXNoKGNoaWxkcmVuW2ldKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoY3VyTm9kZS5ub2RlVHlwZSA9PT0gMykge1xyXG4gICAgICAgIHN0YXJ0T2Zmc2V0ID0gb2Zmc2V0IC0gY3VyT2Zmc2V0O1xyXG4gICAgICAgIGN1ck9mZnNldCArPSBjdXJOb2RlLnRleHRDb250ZW50Lmxlbmd0aDtcclxuICAgICAgICBpZiAoY3VyT2Zmc2V0ID4gb2Zmc2V0KSB7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKCFjdXJOb2RlKSB7XHJcbiAgICAgIGN1ck5vZGUgPSBwYXJlbnQ7XHJcbiAgICB9XHJcbiAgICBsZXQgbm9kZSA9IGN1ck5vZGUuc3BsaXRUZXh0KHN0YXJ0T2Zmc2V0KTtcclxuICAgIG5vZGUuc3BsaXRUZXh0KGxlbmd0aCk7XHJcbiAgICByZXR1cm4gbm9kZTtcclxuICB9XHJcbiAgc2VsZWN0Tm90ZShpZCkge1xyXG4gICAgY29uc29sZS5sb2coaWQpO1xyXG4gIH1cclxufVxyXG5cclxuIl19
