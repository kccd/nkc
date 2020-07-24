(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var data = NKC.methods.getDataById('data');
data.forumScoreOperations.map(function (s) {
  var _iterator = _createForOfIteratorHelper(data.scoresType),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var scoreType = _step.value;
      var oldValue = s[scoreType];
      s["_".concat(scoreType)] = oldValue === undefined ? 0 : oldValue / 100;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
});
var app = new Vue({
  el: '#app',
  data: {
    forumAvailableScoreOperations: data.forumAvailableScoreOperations,
    forumScoreOperations: data.forumScoreOperations,
    scores: data.scores,
    scoresType: data.scoresType,
    forum: data.forum
  },
  methods: {
    checkNumber: NKC.methods.checkData.checkNumber,
    addScoreOperation: function addScoreOperation() {
      var scoreOperation = {
        type: '',
        cycle: 'day',
        count: 0
      };

      var _iterator2 = _createForOfIteratorHelper(this.scoresType),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var scoreType = _step2.value;
          scoreOperation['_' + scoreType] = 0;
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      this.forumScoreOperations.push(scoreOperation);
    },
    removeScoreOperation: function removeScoreOperation(index) {
      this.forumScoreOperations.splice(index, 1);
    },
    save: function save() {
      var forumScoreOperations = this.forumScoreOperations,
          checkNumber = this.checkNumber,
          scoresType = this.scoresType,
          forum = this.forum;
      forumScoreOperations = JSON.parse(JSON.stringify(forumScoreOperations));
      Promise.resolve().then(function () {
        var _iterator3 = _createForOfIteratorHelper(forumScoreOperations),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var scoreOperation = _step3.value;

            var _iterator4 = _createForOfIteratorHelper(scoresType),
                _step4;

            try {
              for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                var scoreType = _step4.value;
                var oldValue = scoreOperation["_".concat(scoreType)];
                checkNumber(oldValue, {
                  name: '积分策略中加减的积分值',
                  fractionDigits: 2
                });
                scoreOperation[scoreType] = parseInt(oldValue * 100);
                delete scoreOperation["_".concat(scoreType)];
              }
            } catch (err) {
              _iterator4.e(err);
            } finally {
              _iterator4.f();
            }
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }

        return nkcAPI("/f/".concat(forum.fid, "/settings/score"), 'PUT', {
          forumScoreOperations: forumScoreOperations
        });
      }).then(function () {
        sweetSuccess('保存成功');
      })["catch"](sweetError);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2ZvcnVtL3NldHRpbmdzL3Njb3JlLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQUEsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLE1BQXhCLENBQWI7QUFFQSxJQUFJLENBQUMsb0JBQUwsQ0FBMEIsR0FBMUIsQ0FBOEIsVUFBQSxDQUFDLEVBQUk7QUFBQSw2Q0FDVixJQUFJLENBQUMsVUFESztBQUFBOztBQUFBO0FBQ2pDLHdEQUF3QztBQUFBLFVBQTlCLFNBQThCO0FBQ3RDLFVBQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxTQUFELENBQWxCO0FBQ0EsTUFBQSxDQUFDLFlBQUssU0FBTCxFQUFELEdBQXFCLFFBQVEsS0FBSyxTQUFiLEdBQXdCLENBQXhCLEdBQTJCLFFBQVEsR0FBRyxHQUEzRDtBQUNEO0FBSmdDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFLbEMsQ0FMRDtBQU1BLElBQU0sR0FBRyxHQUFHLElBQUksR0FBSixDQUFRO0FBQ2xCLEVBQUEsRUFBRSxFQUFFLE1BRGM7QUFFbEIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLDZCQUE2QixFQUFFLElBQUksQ0FBQyw2QkFEaEM7QUFFSixJQUFBLG9CQUFvQixFQUFFLElBQUksQ0FBQyxvQkFGdkI7QUFHSixJQUFBLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFIVDtBQUlKLElBQUEsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUpiO0FBS0osSUFBQSxLQUFLLEVBQUUsSUFBSSxDQUFDO0FBTFIsR0FGWTtBQVNsQixFQUFBLE9BQU8sRUFBRTtBQUNQLElBQUEsV0FBVyxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksU0FBWixDQUFzQixXQUQ1QjtBQUVQLElBQUEsaUJBRk8sK0JBRWE7QUFDbEIsVUFBTSxjQUFjLEdBQUc7QUFDckIsUUFBQSxJQUFJLEVBQUUsRUFEZTtBQUVyQixRQUFBLEtBQUssRUFBRSxLQUZjO0FBR3JCLFFBQUEsS0FBSyxFQUFFO0FBSGMsT0FBdkI7O0FBRGtCLGtEQU1LLEtBQUssVUFOVjtBQUFBOztBQUFBO0FBTWxCLCtEQUF3QztBQUFBLGNBQTlCLFNBQThCO0FBQ3RDLFVBQUEsY0FBYyxDQUFDLE1BQU0sU0FBUCxDQUFkLEdBQWtDLENBQWxDO0FBQ0Q7QUFSaUI7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFTbEIsV0FBSyxvQkFBTCxDQUEwQixJQUExQixDQUErQixjQUEvQjtBQUNELEtBWk07QUFhUCxJQUFBLG9CQWJPLGdDQWFjLEtBYmQsRUFhcUI7QUFDMUIsV0FBSyxvQkFBTCxDQUEwQixNQUExQixDQUFpQyxLQUFqQyxFQUF3QyxDQUF4QztBQUNELEtBZk07QUFnQlAsSUFBQSxJQWhCTyxrQkFnQkE7QUFBQSxVQUVILG9CQUZHLEdBTUQsSUFOQyxDQUVILG9CQUZHO0FBQUEsVUFHSCxXQUhHLEdBTUQsSUFOQyxDQUdILFdBSEc7QUFBQSxVQUlILFVBSkcsR0FNRCxJQU5DLENBSUgsVUFKRztBQUFBLFVBS0gsS0FMRyxHQU1ELElBTkMsQ0FLSCxLQUxHO0FBT0wsTUFBQSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxTQUFMLENBQWUsb0JBQWYsQ0FBWCxDQUF2QjtBQUNBLE1BQUEsT0FBTyxDQUFDLE9BQVIsR0FDRyxJQURILENBQ1EsWUFBTTtBQUFBLG9EQUNrQixvQkFEbEI7QUFBQTs7QUFBQTtBQUNWLGlFQUFrRDtBQUFBLGdCQUF4QyxjQUF3Qzs7QUFBQSx3REFDekIsVUFEeUI7QUFBQTs7QUFBQTtBQUNoRCxxRUFBbUM7QUFBQSxvQkFBekIsU0FBeUI7QUFDakMsb0JBQU0sUUFBUSxHQUFHLGNBQWMsWUFBSyxTQUFMLEVBQS9CO0FBQ0EsZ0JBQUEsV0FBVyxDQUFDLFFBQUQsRUFBVztBQUNwQixrQkFBQSxJQUFJLEVBQUUsYUFEYztBQUVwQixrQkFBQSxjQUFjLEVBQUU7QUFGSSxpQkFBWCxDQUFYO0FBSUEsZ0JBQUEsY0FBYyxDQUFDLFNBQUQsQ0FBZCxHQUE0QixRQUFRLENBQUMsUUFBUSxHQUFHLEdBQVosQ0FBcEM7QUFDQSx1QkFBTyxjQUFjLFlBQUssU0FBTCxFQUFyQjtBQUNEO0FBVCtDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFVakQ7QUFYUztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVlWLGVBQU8sTUFBTSxjQUFPLEtBQUssQ0FBQyxHQUFiLHNCQUFtQyxLQUFuQyxFQUEwQztBQUNyRCxVQUFBLG9CQUFvQixFQUFwQjtBQURxRCxTQUExQyxDQUFiO0FBR0QsT0FoQkgsRUFpQkcsSUFqQkgsQ0FpQlEsWUFBTTtBQUNWLFFBQUEsWUFBWSxDQUFDLE1BQUQsQ0FBWjtBQUNELE9BbkJILFdBb0JTLFVBcEJUO0FBcUJEO0FBN0NNO0FBVFMsQ0FBUixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKCdkYXRhJyk7XHJcblxyXG5kYXRhLmZvcnVtU2NvcmVPcGVyYXRpb25zLm1hcChzID0+IHtcclxuICBmb3IoY29uc3Qgc2NvcmVUeXBlIG9mIGRhdGEuc2NvcmVzVHlwZSkge1xyXG4gICAgY29uc3Qgb2xkVmFsdWUgPSBzW3Njb3JlVHlwZV07XHJcbiAgICBzW2BfJHtzY29yZVR5cGV9YF0gPSBvbGRWYWx1ZSA9PT0gdW5kZWZpbmVkPyAwOiBvbGRWYWx1ZSAvIDEwMDtcclxuICB9XHJcbn0pO1xyXG5jb25zdCBhcHAgPSBuZXcgVnVlKHtcclxuICBlbDogJyNhcHAnLFxyXG4gIGRhdGE6IHtcclxuICAgIGZvcnVtQXZhaWxhYmxlU2NvcmVPcGVyYXRpb25zOiBkYXRhLmZvcnVtQXZhaWxhYmxlU2NvcmVPcGVyYXRpb25zLFxyXG4gICAgZm9ydW1TY29yZU9wZXJhdGlvbnM6IGRhdGEuZm9ydW1TY29yZU9wZXJhdGlvbnMsXHJcbiAgICBzY29yZXM6IGRhdGEuc2NvcmVzLFxyXG4gICAgc2NvcmVzVHlwZTogZGF0YS5zY29yZXNUeXBlLFxyXG4gICAgZm9ydW06IGRhdGEuZm9ydW0sXHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBjaGVja051bWJlcjogTktDLm1ldGhvZHMuY2hlY2tEYXRhLmNoZWNrTnVtYmVyLFxyXG4gICAgYWRkU2NvcmVPcGVyYXRpb24oKSB7XHJcbiAgICAgIGNvbnN0IHNjb3JlT3BlcmF0aW9uID0ge1xyXG4gICAgICAgIHR5cGU6ICcnLFxyXG4gICAgICAgIGN5Y2xlOiAnZGF5JyxcclxuICAgICAgICBjb3VudDogMCxcclxuICAgICAgfTtcclxuICAgICAgZm9yKGNvbnN0IHNjb3JlVHlwZSBvZiB0aGlzLnNjb3Jlc1R5cGUpIHtcclxuICAgICAgICBzY29yZU9wZXJhdGlvblsnXycgKyBzY29yZVR5cGVdID0gMDtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmZvcnVtU2NvcmVPcGVyYXRpb25zLnB1c2goc2NvcmVPcGVyYXRpb24pO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZVNjb3JlT3BlcmF0aW9uKGluZGV4KSB7XHJcbiAgICAgIHRoaXMuZm9ydW1TY29yZU9wZXJhdGlvbnMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH0sXHJcbiAgICBzYXZlKCkge1xyXG4gICAgICBsZXQge1xyXG4gICAgICAgIGZvcnVtU2NvcmVPcGVyYXRpb25zLFxyXG4gICAgICAgIGNoZWNrTnVtYmVyLFxyXG4gICAgICAgIHNjb3Jlc1R5cGUsXHJcbiAgICAgICAgZm9ydW0sXHJcbiAgICAgIH0gPSB0aGlzO1xyXG4gICAgICBmb3J1bVNjb3JlT3BlcmF0aW9ucyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZm9ydW1TY29yZU9wZXJhdGlvbnMpKTtcclxuICAgICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBmb3IoY29uc3Qgc2NvcmVPcGVyYXRpb24gb2YgZm9ydW1TY29yZU9wZXJhdGlvbnMpIHtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IHNjb3JlVHlwZSBvZiBzY29yZXNUeXBlKSB7XHJcbiAgICAgICAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSBzY29yZU9wZXJhdGlvbltgXyR7c2NvcmVUeXBlfWBdO1xyXG4gICAgICAgICAgICAgIGNoZWNrTnVtYmVyKG9sZFZhbHVlLCB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAn56ev5YiG562W55Wl5Lit5Yqg5YeP55qE56ev5YiG5YC8JyxcclxuICAgICAgICAgICAgICAgIGZyYWN0aW9uRGlnaXRzOiAyXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgc2NvcmVPcGVyYXRpb25bc2NvcmVUeXBlXSA9IHBhcnNlSW50KG9sZFZhbHVlICogMTAwKTtcclxuICAgICAgICAgICAgICBkZWxldGUgc2NvcmVPcGVyYXRpb25bYF8ke3Njb3JlVHlwZX1gXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSShgL2YvJHtmb3J1bS5maWR9L3NldHRpbmdzL3Njb3JlYCwgJ1BVVCcsIHtcclxuICAgICAgICAgICAgZm9ydW1TY29yZU9wZXJhdGlvbnNcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKCfkv53lrZjmiJDlip8nKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG4iXX0=
