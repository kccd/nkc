(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvaW5zZXJ0TWFya1RvSFRNTC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxjQUFULENBQXdCLE1BQXhCLENBQVg7QUFFQSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVo7QUFFQSxJQUFNLEtBQUssR0FBRyxDQUNaO0FBQ0UsRUFBQSxHQUFHLEVBQUUsQ0FEUDtBQUVFLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxNQUFNLEVBQUUsQ0FESjtBQUVKLElBQUEsTUFBTSxFQUFFO0FBRko7QUFGUixDQURZLEVBUVo7QUFDRSxFQUFBLEdBQUcsRUFBRSxDQURQO0FBRUUsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLE1BQU0sRUFBRSxDQURKO0FBRUosSUFBQSxNQUFNLEVBQUU7QUFGSjtBQUZSLENBUlksRUFlWjtBQUNFLEVBQUEsR0FBRyxFQUFFLENBRFA7QUFFRSxFQUFBLElBQUksRUFBRTtBQUNKLElBQUEsTUFBTSxFQUFFLENBREo7QUFFSixJQUFBLE1BQU0sRUFBRTtBQUZKO0FBRlIsQ0FmWSxDQUFkOztBQXlCQSxTQUFTLGdCQUFULENBQTBCLElBQTFCLEVBQWdDLEtBQWhDLEVBQXVDO0FBQ3JDLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBQWI7QUFDQSxFQUFBLElBQUksQ0FBQyxTQUFMLEdBQWlCLElBQWpCO0FBQ0EsRUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLElBQVo7QUFFRDs7QUFFRCxTQUFTLFFBQVQsQ0FBa0IsTUFBbEIsRUFBMEIsTUFBMUIsRUFBa0MsTUFBbEMsRUFBMEM7QUFDeEMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFELENBQWxCO0FBQ0EsTUFBSSxTQUFTLEdB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QUFFdkIsUUFBRyxXQUFXLEdBQUcsQ0FBakIsRUFBb0I7QUFDbEIsTUFBQSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQUwsQ0FBZSxXQUFmLENBQVA7QUFDRDs7QUFDRCxRQUFHLElBQUksQ0FBQyxXQUFMLENBQWlCLE1BQWpCLEtBQTRCLFVBQS9CLEVBQTJDO0FBQ3pDLE1BQUEsSUFBSSxDQUFDLFNBQUwsQ0FBZSxVQUFmO0FBQ0Q7O0FBQ0QsV0FBTyxJQUFQO0FBQ0QsR0FUTyxDQUFSO0FBVUEsU0FBTyxLQUFQO0FBQ0Q7O0FBRUQsZ0JBQWdCLENBQUMsSUFBRCxFQUFPLEtBQVAsQ0FBaEIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJsZXQgaHRtbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaHRtbFwiKTtcblxuaHRtbCA9IGh0bWwuaW5uZXJIVE1MO1xuXG5jb25zdCBub3RlcyA9IFtcbiAge1xuICAgIF9pZDogMSxcbiAgICBub2RlOiB7XG4gICAgICBvZmZzZXQ6IDIsXG4gICAgICBsZW5ndGg6IDNcbiAgICB9XG4gIH0sXG4gIHtcbiAgICBfaWQ6IDIsXG4gICAgbm9kZToge1xuICAgICAgb2Zmc2V0OiA1LFxuICAgICAgbGVuZ3RoOiAxMlxuICAgIH1cbiAgfSxcbiAge1xuICAgIF9pZDogMyxcbiAgICBub2RlOiB7XG4gICAgICBvZmZzZXQ6IDcsXG4gICAgICBsZW5ndGg6IDlcbiAgICB9XG4gIH1cbl07XG5cblxuZnVuY3Rpb24gaW5zZXJ0TWFya1RvSFRNTChodG1sLCBub3Rlcykge1xuICBjb25zdCByb290ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgcm9vdC5pbm5lckhUTUwgPSBodG1sO1xuICBjb25zb2xlLmxvZyhyb290KTtcblxufVxuXG5mdW5jdGlvbiBnZXROb3RlcyhwYXJlbnQsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIGNvbnN0IG5vZGVTdGFjayA9IFtwYXJlbnRdO1xuICBsZXQgY3VyT2Zmc2V0ID0gMDtcbiAgbGV0IG5vZGUgPSBudWxsO1xuICBsZXQgY3VyTGVuZ3RoID0gbGVuZ3RoO1xuICBsZXQgbm9kZXMgPSBbXTtcbiAgbGV0IHN0YXJ0ZWQgPSBmYWxzZTtcbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gIHdoaWxlKCEhKG5vZGUgPSBub2RlU3RhY2sucG9wKCkpKSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBub2RlLmNoaWxkTm9kZXM7XG4gICAgbG9vcDpcbiAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBjb25zdCBub2RlID0gY2hpbGRyZW5baV07XG4gICAgICAgIGlmKG5vZGUubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICBjb25zdCBjbCA9IG5vZGUuY2xhc3NMaXN0O1xuICAgICAgICAgIGZvcihjb25zdCBjIG9mIHNlbGYuaGwuZXhjbHVkZWRFbGVtZW50Q2xhc3MpIHtcbiAgICAgICAgICAgIGlmKGNsLmNvbnRhaW5zKGMpKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlIGxvb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGVsZW1lbnRUYWdOYW1lID0gbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgaWYoc2VsZi5obC5leGNsdWRlZEVsZW1lbnRUYWdOYW1lLmluY2x1ZGVzKGVsZW1lbnRUYWdOYW1lKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG5vZGVTdGFjay5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIGlmKG5vZGUubm9kZVR5cGUgPT09IDMgJiYgbm9kZS50ZXh0Q29udGVudC5sZW5ndGgpIHtcbiAgICAgIGN1ck9mZnNldCArPSBub2RlLnRleHRDb250ZW50Lmxlbmd0aDtcbiAgICAgIGlmKGN1ck9mZnNldCA+IG9mZnNldCkge1xuICAgICAgICBpZihjdXJMZW5ndGggPD0gMCkgYnJlYWs7XG4gICAgICAgIGxldCBzdGFydE9mZnNldDtcbiAgICAgICAgaWYoIXN0YXJ0ZWQpIHtcbiAgICAgICAgICBzdGFydE9mZnNldCA9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoIC0gKGN1ck9mZnNldCAtIG9mZnNldCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RhcnRPZmZzZXQgPSAwO1xuICAgICAgICB9XG4gICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICBsZXQgbmVlZExlbmd0aDtcbiAgICAgICAgaWYoY3VyTGVuZ3RoIDw9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoIC0gc3RhcnRPZmZzZXQpIHtcbiAgICAgICAgICBuZWVkTGVuZ3RoID0gY3VyTGVuZ3RoO1xuICAgICAgICAgIGN1ckxlbmd0aCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmVlZExlbmd0aCA9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoIC0gc3RhcnRPZmZzZXQ7XG4gICAgICAgICAgY3VyTGVuZ3RoIC09IG5lZWRMZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZXMucHVzaCh7XG4gICAgICAgICAgbm9kZSxcbiAgICAgICAgICBzdGFydE9mZnNldCxcbiAgICAgICAgICBuZWVkTGVuZ3RoXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBub2RlcyA9IG5vZGVzLm1hcChvYmogPT4ge1xuICAgIGxldCB7bm9kZSwgc3RhcnRPZmZzZXQsIG5lZWRMZW5ndGh9ID0gb2JqO1xuICAgIGlmKHN0YXJ0T2Zmc2V0ID4gMCkge1xuICAgICAgbm9kZSA9IG5vZGUuc3BsaXRUZXh0KHN0YXJ0T2Zmc2V0KTtcbiAgICB9XG4gICAgaWYobm9kZS50ZXh0Q29udGVudC5sZW5ndGggIT09IG5lZWRMZW5ndGgpIHtcbiAgICAgIG5vZGUuc3BsaXRUZXh0KG5lZWRMZW5ndGgpO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbiAgfSk7XG4gIHJldHVybiBub2Rlcztcbn1cblxuaW5zZXJ0TWFya1RvSFRNTChodG1sLCBub3Rlcyk7Il19
