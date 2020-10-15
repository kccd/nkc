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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL05LQ0hpZ2hsaWdodGVyL2luc2VydE1hcmtUb0hUTUwubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsY0FBVCxDQUF3QixNQUF4QixDQUFYO0FBRUEsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFaO0FBRUEsSUFBTSxLQUFLLEdBQUcsQ0FDWjtBQUNFLEVBQUEsR0FBRyxFQUFFLENBRFA7QUFFRSxFQUFBLElBQUksRUFBRTtBQUNKLElBQUEsTUFBTSxFQUFFLENBREo7QUFFSixJQUFBLE1BQU0sRUFBRTtBQUZKO0FBRlIsQ0FEWSxFQVFaO0FBQ0UsRUFBQSxHQUFHLEVBQUUsQ0FEUDtBQUVFLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxNQUFNLEVBQUUsQ0FESjtBQUVKLElBQUEsTUFBTSxFQUFFO0FBRko7QUFGUixDQVJZLEVBZVo7QUFDRSxFQUFBLEdBQUcsRUFBRSxDQURQO0FBRUUsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLE1BQU0sRUFBRSxDQURKO0FBRUosSUFBQSxNQUFNLEVBQUU7QUFGSjtBQUZSLENBZlksQ0FBZDs7QUF5QkEsU0FBUyxnQkFBVCxDQUEwQixJQUExQixFQUFnQyxLQUFoQyxFQUF1QztBQUNyQyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUFiO0FBQ0EsRUFBQSxJQUFJLENBQUMsU0FBTCxHQUFpQixJQUFqQjtBQUNBLEVBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxJQUFaO0FBRUQ7O0FBRUQsU0FBUyxRQUFULENBQWtCLE1BQWxCLEVBQTBCLE1BQTFCLEVBQWtDLE1BQWxDLEVBQTBDO0FBQ3hDLE1BQU0sU0FBUyxHQUFHLENBQUMsTUFBRCxDQUFsQjtBQUNBLE1BQUksU0FBUyxHQUFHLENBQWhCO0FBQ0Es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U0FBTCxDQUFlLFdBQWYsQ0FBUDtBQUNEOztBQUNELFFBQUcsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsTUFBakIsS0FBNEIsVUFBL0IsRUFBMkM7QUFDekMsTUFBQSxJQUFJLENBQUMsU0FBTCxDQUFlLFVBQWY7QUFDRDs7QUFDRCxXQUFPLElBQVA7QUFDRCxHQVRPLENBQVI7QUFVQSxTQUFPLEtBQVA7QUFDRDs7QUFFRCxnQkFBZ0IsQ0FBQyxJQUFELEVBQU8sS0FBUCxDQUFoQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImxldCBodG1sID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJodG1sXCIpO1xuXG5odG1sID0gaHRtbC5pbm5lckhUTUw7XG5cbmNvbnN0IG5vdGVzID0gW1xuICB7XG4gICAgX2lkOiAxLFxuICAgIG5vZGU6IHtcbiAgICAgIG9mZnNldDogMixcbiAgICAgIGxlbmd0aDogM1xuICAgIH1cbiAgfSxcbiAge1xuICAgIF9pZDogMixcbiAgICBub2RlOiB7XG4gICAgICBvZmZzZXQ6IDUsXG4gICAgICBsZW5ndGg6IDEyXG4gICAgfVxuICB9LFxuICB7XG4gICAgX2lkOiAzLFxuICAgIG5vZGU6IHtcbiAgICAgIG9mZnNldDogNyxcbiAgICAgIGxlbmd0aDogOVxuICAgIH1cbiAgfVxuXTtcblxuXG5mdW5jdGlvbiBpbnNlcnRNYXJrVG9IVE1MKGh0bWwsIG5vdGVzKSB7XG4gIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICByb290LmlubmVySFRNTCA9IGh0bWw7XG4gIGNvbnNvbGUubG9nKHJvb3QpO1xuXG59XG5cbmZ1bmN0aW9uIGdldE5vdGVzKHBhcmVudCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgY29uc3Qgbm9kZVN0YWNrID0gW3BhcmVudF07XG4gIGxldCBjdXJPZmZzZXQgPSAwO1xuICBsZXQgbm9kZSA9IG51bGw7XG4gIGxldCBjdXJMZW5ndGggPSBsZW5ndGg7XG4gIGxldCBub2RlcyA9IFtdO1xuICBsZXQgc3RhcnRlZCA9IGZhbHNlO1xuICBjb25zdCBzZWxmID0gdGhpcztcbiAgd2hpbGUoISEobm9kZSA9IG5vZGVTdGFjay5wb3AoKSkpIHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IG5vZGUuY2hpbGROb2RlcztcbiAgICBsb29wOlxuICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgaWYobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgIGNvbnN0IGNsID0gbm9kZS5jbGFzc0xpc3Q7XG4gICAgICAgICAgZm9yKGNvbnN0IGMgb2Ygc2VsZi5obC5leGNsdWRlZEVsZW1lbnRDbGFzcykge1xuICAgICAgICAgICAgaWYoY2wuY29udGFpbnMoYykpIHtcbiAgICAgICAgICAgICAgY29udGludWUgbG9vcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZWxlbWVudFRhZ05hbWUgPSBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICBpZihzZWxmLmhsLmV4Y2x1ZGVkRWxlbWVudFRhZ05hbWUuaW5jbHVkZXMoZWxlbWVudFRhZ05hbWUpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbm9kZVN0YWNrLnB1c2gobm9kZSk7XG4gICAgICB9XG4gICAgaWYobm9kZS5ub2RlVHlwZSA9PT0gMyAmJiBub2RlLnRleHRDb250ZW50Lmxlbmd0aCkge1xuICAgICAgY3VyT2Zmc2V0ICs9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoO1xuICAgICAgaWYoY3VyT2Zmc2V0ID4gb2Zmc2V0KSB7XG4gICAgICAgIGlmKGN1ckxlbmd0aCA8PSAwKSBicmVhaztcbiAgICAgICAgbGV0IHN0YXJ0T2Zmc2V0O1xuICAgICAgICBpZighc3RhcnRlZCkge1xuICAgICAgICAgIHN0YXJ0T2Zmc2V0ID0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSAoY3VyT2Zmc2V0IC0gb2Zmc2V0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdGFydE9mZnNldCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIGxldCBuZWVkTGVuZ3RoO1xuICAgICAgICBpZihjdXJMZW5ndGggPD0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSBzdGFydE9mZnNldCkge1xuICAgICAgICAgIG5lZWRMZW5ndGggPSBjdXJMZW5ndGg7XG4gICAgICAgICAgY3VyTGVuZ3RoID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZWVkTGVuZ3RoID0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSBzdGFydE9mZnNldDtcbiAgICAgICAgICBjdXJMZW5ndGggLT0gbmVlZExlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBub2Rlcy5wdXNoKHtcbiAgICAgICAgICBub2RlLFxuICAgICAgICAgIHN0YXJ0T2Zmc2V0LFxuICAgICAgICAgIG5lZWRMZW5ndGhcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIG5vZGVzID0gbm9kZXMubWFwKG9iaiA9PiB7XG4gICAgbGV0IHtub2RlLCBzdGFydE9mZnNldCwgbmVlZExlbmd0aH0gPSBvYmo7XG4gICAgaWYoc3RhcnRPZmZzZXQgPiAwKSB7XG4gICAgICBub2RlID0gbm9kZS5zcGxpdFRleHQoc3RhcnRPZmZzZXQpO1xuICAgIH1cbiAgICBpZihub2RlLnRleHRDb250ZW50Lmxlbmd0aCAhPT0gbmVlZExlbmd0aCkge1xuICAgICAgbm9kZS5zcGxpdFRleHQobmVlZExlbmd0aCk7XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xuICB9KTtcbiAgcmV0dXJuIG5vZGVzO1xufVxuXG5pbnNlcnRNYXJrVG9IVE1MKGh0bWwsIG5vdGVzKTsiXX0=
