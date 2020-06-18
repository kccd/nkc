(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var html = document.getElementById("html");
html = html.innerHTML;
var notes = [{
  _id: 1,
  node: {
    offset: 2,
    length: 3
  }
}, {
  _id: 2,
  node: {
    offset: 5,
    length: 12
  }
}, {
  _id: 3,
  node: {
    offset: 7,
    length: 9
  }
}];

function insertMarkToHTML(html, notes) {
  var root = document.createElement("div");
  root.innerHTML = html;
  console.log(root);
}

function getNotes(parent, offset, length) {
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

        var _iterator = _createForOfIteratorHelper(self.hl.excludedElementClass),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var c = _step.value;

            if (cl.contains(c)) {
              continue loop;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
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

insertMarkToHTML(html, notes);

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvaW5zZXJ0TWFya1RvSFRNTC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FBLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxjQUFULENBQXdCLE1BQXhCLENBQVg7QUFFQSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVo7QUFFQSxJQUFNLEtBQUssR0FBRyxDQUNaO0FBQ0UsRUFBQSxHQUFHLEVBQUUsQ0FEUDtBQUVFLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxNQUFNLEVBQUUsQ0FESjtBQUVKLElBQUEsTUFBTSxFQUFFO0FBRko7QUFGUixDQURZLEVBUVo7QUFDRSxFQUFBLEdBQUcsRUFBRSxDQURQO0FBRUUsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLE1BQU0sRUFBRSxDQURKO0FBRUosSUFBQSxNQUFNLEVBQUU7QUFGSjtBQUZSLENBUlksRUFlWjtBQUNFLEVBQUEsR0FBRyxFQUFFLENBRFA7QUFFRSxFQUFBLElBQUksRUFBRTtBQUNKLElBQUEsTUFBTSxFQUFFLENBREo7QUFFSixJQUFBLE1BQU0sRUFBRTtBQUZKO0FBRlIsQ0FmWSxDQUFkOztBQXlCQSxTQUFTLGdCQUFULENBQTBCLElBQTFCLEVBQWdDLEtBQWhDLEVBQXVDO0FBQ3JDLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBQWI7QUFDQSxFQUFBLElBQUksQ0FBQyxTQUFMLEdBQWlCLElBQWpCO0FBQ0EsRUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLElBQVo7QUFFRDs7QUFFRCxTQUFTLFFBQVQsQ0FBa0IsTUFBbEIsRUFBMEIsTUFBMUIsRUFBa0MsTUFBbEMsRUFBMEM7QUFDeEMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFELENBQWxCO0FBQ0EsTUFBSSxT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SUFBSSxHQUFHLElBQUksQ0FBQyxTQUFMLENBQWUsV0FBZixDQUFQO0FBQ0Q7O0FBQ0QsUUFBRyxJQUFJLENBQUMsV0FBTCxDQUFpQixNQUFqQixLQUE0QixVQUEvQixFQUEyQztBQUN6QyxNQUFBLElBQUksQ0FBQyxTQUFMLENBQWUsVUFBZjtBQUNEOztBQUNELFdBQU8sSUFBUDtBQUNELEdBVE8sQ0FBUjtBQVVBLFNBQU8sS0FBUDtBQUNEOztBQUVELGdCQUFnQixDQUFDLElBQUQsRUFBTyxLQUFQLENBQWhCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwibGV0IGh0bWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImh0bWxcIik7XHJcblxyXG5odG1sID0gaHRtbC5pbm5lckhUTUw7XHJcblxyXG5jb25zdCBub3RlcyA9IFtcclxuICB7XHJcbiAgICBfaWQ6IDEsXHJcbiAgICBub2RlOiB7XHJcbiAgICAgIG9mZnNldDogMixcclxuICAgICAgbGVuZ3RoOiAzXHJcbiAgICB9XHJcbiAgfSxcclxuICB7XHJcbiAgICBfaWQ6IDIsXHJcbiAgICBub2RlOiB7XHJcbiAgICAgIG9mZnNldDogNSxcclxuICAgICAgbGVuZ3RoOiAxMlxyXG4gICAgfVxyXG4gIH0sXHJcbiAge1xyXG4gICAgX2lkOiAzLFxyXG4gICAgbm9kZToge1xyXG4gICAgICBvZmZzZXQ6IDcsXHJcbiAgICAgIGxlbmd0aDogOVxyXG4gICAgfVxyXG4gIH1cclxuXTtcclxuXHJcblxyXG5mdW5jdGlvbiBpbnNlcnRNYXJrVG9IVE1MKGh0bWwsIG5vdGVzKSB7XHJcbiAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgcm9vdC5pbm5lckhUTUwgPSBodG1sO1xyXG4gIGNvbnNvbGUubG9nKHJvb3QpO1xyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Tm90ZXMocGFyZW50LCBvZmZzZXQsIGxlbmd0aCkge1xyXG4gIGNvbnN0IG5vZGVTdGFjayA9IFtwYXJlbnRdO1xyXG4gIGxldCBjdXJPZmZzZXQgPSAwO1xyXG4gIGxldCBub2RlID0gbnVsbDtcclxuICBsZXQgY3VyTGVuZ3RoID0gbGVuZ3RoO1xyXG4gIGxldCBub2RlcyA9IFtdO1xyXG4gIGxldCBzdGFydGVkID0gZmFsc2U7XHJcbiAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgd2hpbGUoISEobm9kZSA9IG5vZGVTdGFjay5wb3AoKSkpIHtcclxuICAgIGNvbnN0IGNoaWxkcmVuID0gbm9kZS5jaGlsZE5vZGVzO1xyXG4gICAgbG9vcDpcclxuICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgIGlmKG5vZGUubm9kZVR5cGUgPT09IDEpIHtcclxuICAgICAgICAgIGNvbnN0IGNsID0gbm9kZS5jbGFzc0xpc3Q7XHJcbiAgICAgICAgICBmb3IoY29uc3QgYyBvZiBzZWxmLmhsLmV4Y2x1ZGVkRWxlbWVudENsYXNzKSB7XHJcbiAgICAgICAgICAgIGlmKGNsLmNvbnRhaW5zKGMpKSB7XHJcbiAgICAgICAgICAgICAgY29udGludWUgbG9vcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29uc3QgZWxlbWVudFRhZ05hbWUgPSBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgIGlmKHNlbGYuaGwuZXhjbHVkZWRFbGVtZW50VGFnTmFtZS5pbmNsdWRlcyhlbGVtZW50VGFnTmFtZSkpIHtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5vZGVTdGFjay5wdXNoKG5vZGUpO1xyXG4gICAgICB9XHJcbiAgICBpZihub2RlLm5vZGVUeXBlID09PSAzICYmIG5vZGUudGV4dENvbnRlbnQubGVuZ3RoKSB7XHJcbiAgICAgIGN1ck9mZnNldCArPSBub2RlLnRleHRDb250ZW50Lmxlbmd0aDtcclxuICAgICAgaWYoY3VyT2Zmc2V0ID4gb2Zmc2V0KSB7XHJcbiAgICAgICAgaWYoY3VyTGVuZ3RoIDw9IDApIGJyZWFrO1xyXG4gICAgICAgIGxldCBzdGFydE9mZnNldDtcclxuICAgICAgICBpZighc3RhcnRlZCkge1xyXG4gICAgICAgICAgc3RhcnRPZmZzZXQgPSBub2RlLnRleHRDb250ZW50Lmxlbmd0aCAtIChjdXJPZmZzZXQgLSBvZmZzZXQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzdGFydE9mZnNldCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xyXG4gICAgICAgIGxldCBuZWVkTGVuZ3RoO1xyXG4gICAgICAgIGlmKGN1ckxlbmd0aCA8PSBub2RlLnRleHRDb250ZW50Lmxlbmd0aCAtIHN0YXJ0T2Zmc2V0KSB7XHJcbiAgICAgICAgICBuZWVkTGVuZ3RoID0gY3VyTGVuZ3RoO1xyXG4gICAgICAgICAgY3VyTGVuZ3RoID0gMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbmVlZExlbmd0aCA9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoIC0gc3RhcnRPZmZzZXQ7XHJcbiAgICAgICAgICBjdXJMZW5ndGggLT0gbmVlZExlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbm9kZXMucHVzaCh7XHJcbiAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgc3RhcnRPZmZzZXQsXHJcbiAgICAgICAgICBuZWVkTGVuZ3RoXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgbm9kZXMgPSBub2Rlcy5tYXAob2JqID0+IHtcclxuICAgIGxldCB7bm9kZSwgc3RhcnRPZmZzZXQsIG5lZWRMZW5ndGh9ID0gb2JqO1xyXG4gICAgaWYoc3RhcnRPZmZzZXQgPiAwKSB7XHJcbiAgICAgIG5vZGUgPSBub2RlLnNwbGl0VGV4dChzdGFydE9mZnNldCk7XHJcbiAgICB9XHJcbiAgICBpZihub2RlLnRleHRDb250ZW50Lmxlbmd0aCAhPT0gbmVlZExlbmd0aCkge1xyXG4gICAgICBub2RlLnNwbGl0VGV4dChuZWVkTGVuZ3RoKTtcclxuICAgIH1cclxuICAgIHJldHVybiBub2RlO1xyXG4gIH0pO1xyXG4gIHJldHVybiBub2RlcztcclxufVxyXG5cclxuaW5zZXJ0TWFya1RvSFRNTChodG1sLCBub3Rlcyk7Il19
