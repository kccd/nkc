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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvaW5zZXJ0TWFya1RvSFRNTC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxjQUFULENBQXdCLE1BQXhCLENBQVg7QUFFQSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVo7QUFFQSxJQUFNLEtBQUssR0FBRyxDQUNaO0FBQ0UsRUFBQSxHQUFHLEVBQUUsQ0FEUDtBQUVFLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxNQUFNLEVBQUUsQ0FESjtBQUVKLElBQUEsTUFBTSxFQUFFO0FBRko7QUFGUixDQURZLEVBUVo7QUFDRSxFQUFBLEdBQUcsRUFBRSxDQURQO0FBRUUsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLE1BQU0sRUFBRSxDQURKO0FBRUosSUFBQSxNQUFNLEVBQUU7QUFGSjtBQUZSLENBUlksRUFlWjtBQUNFLEVBQUEsR0FBRyxFQUFFLENBRFA7QUFFRSxFQUFBLElBQUksRUFBRTtBQUNKLElBQUEsTUFBTSxFQUFFLENBREo7QUFFSixJQUFBLE1BQU0sRUFBRTtBQUZKO0FBRlIsQ0FmWSxDQUFkOztBQXlCQSxTQUFTLGdCQUFULENBQTBCLElBQTFCLEVBQWdDLEtBQWhDLEVBQXVDO0FBQ3JDLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBQWI7QUFDQSxFQUFBLElBQUksQ0FBQyxTQUFMLEdBQWlCLElBQWpCO0FBQ0EsRUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLElBQVo7QUFFRDs7QUFFRCxTQUFTLFFBQVQsQ0FBa0IsTUFBbEIsRUFBMEIsTUFBMUIsRUFBa0MsTUFBbEMsRUFBMEM7QUFDeEMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFELENBQWxCO0FBQ0EsTUFBSSxTQUFTLEdBQUcsQ0FBaEI7QUFDQSxNQUFJLElBQUksR0FBRyxJQUFYO0FBQ0EsTUFBSSxTQUFTLEdBQUcsTUFBaEI7QUFDQSxNQUFJLEtBQUssR0FBRyxFQUFaO0FBQ0EsTUFBSSxPQUFPLEdBQUcsS0FBZDtBQUNBLE1BQU0sSUFBSSxHQUFHLElBQWI7O0FBQ0EsU0FBTSxDQUFDLEVBQUUsSUFBSSxHQUFHLFNBQVMsQ0FBQyxHQUFWLEVBQVQsQ0FBUCxFQUFrQztBQUNoQyxRQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBdEI7O0FBQ0EsSUFBQSxJQUFJLEVBQ0YsS0FBSyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBVCxHQUFrQixDQUEvQixFQUFrQyxDQUFDLElBQUksQ0FBdkMsRUFBMEMsQ0FBQyxFQUEzQyxFQUErQztBQUM3QyxVQUFNLEtBQUksR0FBRyxRQUFRLENBQUMsQ0FBRCxDQUFyQjs7QUFDQSxVQUFHLEtBQUksQ0FBQyxRQUFMLEtBQWtCLENBQXJCLEVBQXdCO0FBQ3RCLFlBQU0sRUFBRSxHQUFHLEtBQUksQ0FBQyxTQUFoQjtBQURzQjtBQUFBO0FBQUE7O0FBQUE7QUFFdEIsK0JBQWUsSUFBSSxDQUFDLEVBQUwsQ0FBUSxvQkFBdkIsOEhBQTZDO0FBQUEsZ0JBQW5DLENBQW1DOztBQUMzQyxnQkFBRyxFQUFFLENBQUMsUUFBSCxDQUFZLENBQVosQ0FBSCxFQUFtQjtBQUNqQix1QkFBUyxJQUFUO0FBQ0Q7QUFDRjtBQU5xQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU90QixZQUFNLGNBQWMsR0FBRyxLQUFJLENBQUMsT0FBTCxDQUFhLFdBQWIsRUFBdkI7O0FBQ0EsWUFBRyxJQUFJLENBQUMsRUFBTCxDQUFRLHNCQUFSLENBQStCLFFBQS9CLENBQXdDLGNBQXhDLENBQUgsRUFBNEQ7QUFDMUQ7QUFDRDtBQUNGOztBQUNELE1BQUEsU0FBUyxDQUFDLElBQVYsQ0FBZSxLQUFmO0FBQ0Q7O0FBQ0gsUUFBRyxJQUFJLENBQUMsUUFBTCxLQUFrQixDQUFsQixJQUF1QixJQUFJLENBQUMsV0FBTCxDQUFpQixNQUEzQyxFQUFtRDtBQUNqRCxNQUFBLFNBQVMsSUFBSSxJQUFJLENBQUMsV0FBTCxDQUFpQixNQUE5Qjs7QUFDQSxVQUFHLFNBQVMsR0FBRyxNQUFmLEVBQXVCO0FBQ3JCLFlBQUcsU0FBUyxJQUFJLENBQWhCLEVBQW1CO0FBQ25CLFlBQUksV0FBVyxTQUFmOztBQUNBLFlBQUcsQ0FBQyxPQUFKLEVBQWE7QUFDWCxVQUFBLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBTCxDQUFpQixNQUFqQixJQUEyQixTQUFTLEdBQUcsTUFBdkMsQ0FBZDtBQUNELFNBRkQsTUFFTztBQUNMLFVBQUEsV0FBVyxHQUFHLENBQWQ7QUFDRDs7QUFDRCxRQUFBLE9BQU8sR0FBRyxJQUFWO0FBQ0EsWUFBSSxVQUFVLFNBQWQ7O0FBQ0EsWUFBRyxTQUFTLElBQUksSUFBSSxDQUFDLFdBQUwsQ0FBaUIsTUFBakIsR0FBMEIsV0FBMUMsRUFBdUQ7QUFDckQsVUFBQSxVQUFVLEdBQUcsU0FBYjtBQUNBLFVBQUEsU0FBUyxHQUFHLENBQVo7QUFDRCxTQUhELE1BR087QUFDTCxVQUFBLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBTCxDQUFpQixNQUFqQixHQUEwQixXQUF2QztBQUNBLFVBQUEsU0FBUyxJQUFJLFVBQWI7QUFDRDs7QUFDRCxRQUFBLEtBQUssQ0FBQyxJQUFOLENBQVc7QUFDVCxVQUFBLElBQUksRUFBSixJQURTO0FBRVQsVUFBQSxXQUFXLEVBQVgsV0FGUztBQUdULFVBQUEsVUFBVSxFQUFWO0FBSFMsU0FBWDtBQUtEO0FBQ0Y7QUFDRjs7QUFDRCxFQUFBLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBTixDQUFVLFVBQUEsR0FBRyxFQUFJO0FBQUEsUUFDbEIsSUFEa0IsR0FDZSxHQURmLENBQ2xCLElBRGtCO0FBQUEsUUFDWixXQURZLEdBQ2UsR0FEZixDQUNaLFdBRFk7QUFBQSxRQUNDLFVBREQsR0FDZSxHQURmLENBQ0MsVUFERDs7QUFFdkIsUUFBRyxXQUFXLEdBQUcsQ0FBakIsRUFBb0I7QUFDbEIsTUFBQSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQUwsQ0FBZSxXQUFmLENBQVA7QUFDRDs7QUFDRCxRQUFHLElBQUksQ0FBQyxXQUFMLENBQWlCLE1BQWpCLEtBQTRCLFVBQS9CLEVBQTJDO0FBQ3pDLE1BQUEsSUFBSSxDQUFDLFNBQUwsQ0FBZSxVQUFmO0FBQ0Q7O0FBQ0QsV0FBTyxJQUFQO0FBQ0QsR0FUTyxDQUFSO0FBVUEsU0FBTyxLQUFQO0FBQ0Q7O0FBRUQsZ0JBQWdCLENBQUMsSUFBRCxFQUFPLEtBQVAsQ0FBaEIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJsZXQgaHRtbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaHRtbFwiKTtcclxuXHJcbmh0bWwgPSBodG1sLmlubmVySFRNTDtcclxuXHJcbmNvbnN0IG5vdGVzID0gW1xyXG4gIHtcclxuICAgIF9pZDogMSxcclxuICAgIG5vZGU6IHtcclxuICAgICAgb2Zmc2V0OiAyLFxyXG4gICAgICBsZW5ndGg6IDNcclxuICAgIH1cclxuICB9LFxyXG4gIHtcclxuICAgIF9pZDogMixcclxuICAgIG5vZGU6IHtcclxuICAgICAgb2Zmc2V0OiA1LFxyXG4gICAgICBsZW5ndGg6IDEyXHJcbiAgICB9XHJcbiAgfSxcclxuICB7XHJcbiAgICBfaWQ6IDMsXHJcbiAgICBub2RlOiB7XHJcbiAgICAgIG9mZnNldDogNyxcclxuICAgICAgbGVuZ3RoOiA5XHJcbiAgICB9XHJcbiAgfVxyXG5dO1xyXG5cclxuXHJcbmZ1bmN0aW9uIGluc2VydE1hcmtUb0hUTUwoaHRtbCwgbm90ZXMpIHtcclxuICBjb25zdCByb290ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICByb290LmlubmVySFRNTCA9IGh0bWw7XHJcbiAgY29uc29sZS5sb2cocm9vdCk7XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXROb3RlcyhwYXJlbnQsIG9mZnNldCwgbGVuZ3RoKSB7XHJcbiAgY29uc3Qgbm9kZVN0YWNrID0gW3BhcmVudF07XHJcbiAgbGV0IGN1ck9mZnNldCA9IDA7XHJcbiAgbGV0IG5vZGUgPSBudWxsO1xyXG4gIGxldCBjdXJMZW5ndGggPSBsZW5ndGg7XHJcbiAgbGV0IG5vZGVzID0gW107XHJcbiAgbGV0IHN0YXJ0ZWQgPSBmYWxzZTtcclxuICBjb25zdCBzZWxmID0gdGhpcztcclxuICB3aGlsZSghIShub2RlID0gbm9kZVN0YWNrLnBvcCgpKSkge1xyXG4gICAgY29uc3QgY2hpbGRyZW4gPSBub2RlLmNoaWxkTm9kZXM7XHJcbiAgICBsb29wOlxyXG4gICAgICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICBjb25zdCBub2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgaWYobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xyXG4gICAgICAgICAgY29uc3QgY2wgPSBub2RlLmNsYXNzTGlzdDtcclxuICAgICAgICAgIGZvcihjb25zdCBjIG9mIHNlbGYuaGwuZXhjbHVkZWRFbGVtZW50Q2xhc3MpIHtcclxuICAgICAgICAgICAgaWYoY2wuY29udGFpbnMoYykpIHtcclxuICAgICAgICAgICAgICBjb250aW51ZSBsb29wO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCBlbGVtZW50VGFnTmFtZSA9IG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgaWYoc2VsZi5obC5leGNsdWRlZEVsZW1lbnRUYWdOYW1lLmluY2x1ZGVzKGVsZW1lbnRUYWdOYW1lKSkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgbm9kZVN0YWNrLnB1c2gobm9kZSk7XHJcbiAgICAgIH1cclxuICAgIGlmKG5vZGUubm9kZVR5cGUgPT09IDMgJiYgbm9kZS50ZXh0Q29udGVudC5sZW5ndGgpIHtcclxuICAgICAgY3VyT2Zmc2V0ICs9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoO1xyXG4gICAgICBpZihjdXJPZmZzZXQgPiBvZmZzZXQpIHtcclxuICAgICAgICBpZihjdXJMZW5ndGggPD0gMCkgYnJlYWs7XHJcbiAgICAgICAgbGV0IHN0YXJ0T2Zmc2V0O1xyXG4gICAgICAgIGlmKCFzdGFydGVkKSB7XHJcbiAgICAgICAgICBzdGFydE9mZnNldCA9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoIC0gKGN1ck9mZnNldCAtIG9mZnNldCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHN0YXJ0T2Zmc2V0ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RhcnRlZCA9IHRydWU7XHJcbiAgICAgICAgbGV0IG5lZWRMZW5ndGg7XHJcbiAgICAgICAgaWYoY3VyTGVuZ3RoIDw9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoIC0gc3RhcnRPZmZzZXQpIHtcclxuICAgICAgICAgIG5lZWRMZW5ndGggPSBjdXJMZW5ndGg7XHJcbiAgICAgICAgICBjdXJMZW5ndGggPSAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBuZWVkTGVuZ3RoID0gbm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSBzdGFydE9mZnNldDtcclxuICAgICAgICAgIGN1ckxlbmd0aCAtPSBuZWVkTGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBub2Rlcy5wdXNoKHtcclxuICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICBzdGFydE9mZnNldCxcclxuICAgICAgICAgIG5lZWRMZW5ndGhcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBub2RlcyA9IG5vZGVzLm1hcChvYmogPT4ge1xyXG4gICAgbGV0IHtub2RlLCBzdGFydE9mZnNldCwgbmVlZExlbmd0aH0gPSBvYmo7XHJcbiAgICBpZihzdGFydE9mZnNldCA+IDApIHtcclxuICAgICAgbm9kZSA9IG5vZGUuc3BsaXRUZXh0KHN0YXJ0T2Zmc2V0KTtcclxuICAgIH1cclxuICAgIGlmKG5vZGUudGV4dENvbnRlbnQubGVuZ3RoICE9PSBuZWVkTGVuZ3RoKSB7XHJcbiAgICAgIG5vZGUuc3BsaXRUZXh0KG5lZWRMZW5ndGgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5vZGU7XHJcbiAgfSk7XHJcbiAgcmV0dXJuIG5vZGVzO1xyXG59XHJcblxyXG5pbnNlcnRNYXJrVG9IVE1MKGh0bWwsIG5vdGVzKTsiXX0=
