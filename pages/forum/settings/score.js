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

        return nkcAPI("/f/".concat(forum.fid, "/settings/score"), 'PATCH', {
          forumScoreOperations: forumScoreOperations
        });
      }).then(function () {
        sweetSuccess('保存成功');
      })["catch"](sweetError);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9mb3J1bS9zZXR0aW5ncy9zY29yZS5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiO0FBRUEsSUFBSSxDQUFDLG9CQUFMLENBQTBCLEdBQTFCLENBQThCLFVBQUEsQ0FBQyxFQUFJO0FBQUEsNkNBQ1YsSUFBSSxDQUFDLFVBREs7QUFBQTs7QUFBQTtBQUNqQyx3REFBd0M7QUFBQSxVQUE5QixTQUE4QjtBQUN0QyxVQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsU0FBRCxDQUFsQjtBQUNBLE1BQUEsQ0FBQyxZQUFLLFNBQUwsRUFBRCxHQUFxQixRQUFRLEtBQUssU0FBYixHQUF3QixDQUF4QixHQUEyQixRQUFRLEdBQUcsR0FBM0Q7QUFDRDtBQUpnQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBS2xDLENBTEQ7QUFNQSxJQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUosQ0FBUTtBQUNsQixFQUFBLEVBQUUsRUFBRSxNQURjO0FBRWxCLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSw2QkFBNkIsRUFBRSxJQUFJLENBQUMsNkJBRGhDO0FBRUosSUFBQSxvQkFBb0IsRUFBRSxJQUFJLENBQUMsb0JBRnZCO0FBR0osSUFBQSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BSFQ7QUFJSixJQUFBLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFKYjtBQUtKLElBQUEsS0FBSyxFQUFFLElBQUksQ0FBQztBQUxSLEdBRlk7QUFTbEIsRUFBQSxPQUFPLEVBQUU7QUFDUCxJQUFBLFdBQVcsRUFBRSxHQUFHLENBQUMsT0FBSixDQUFZLFNBQVosQ0FBc0IsV0FENUI7QUFFUCxJQUFBLGlCQUZPLCtCQUVhO0FBQ2xCLFVBQU0sY0FBYyxHQUFHO0FBQ3JCLFFBQUEsSUFBSSxFQUFFLEVBRGU7QUFFckIsUUFBQSxLQUFLLEVBQUUsS0FGYztBQUdyQixRQUFBLEtBQUssRUFBRTtBQUhjLE9BQXZCOztBQURrQixrREFNSyxLQUFLLFVBTlY7QUFBQTs7QUFBQTtBQU1sQiwrREFBd0M7QUFBQSxjQUE5QixTQUE4QjtBQUN0QyxVQUFBLGNBQWMsQ0FBQyxNQUFNLFNBQVAsQ0FBZCxHQUFrQyxDQUFsQztBQUNEO0FBUmlCO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBU2xCLFdBQUssb0JBQUwsQ0FBMEIsSUFBMUIsQ0FBK0IsY0FBL0I7QUFDRCxLQVpNO0FBYVAsSUFBQSxvQkFiTyxnQ0FhYyxLQWJkLEVBYXFCO0FBQzFCLFdBQUssb0JBQUwsQ0FBMEIsTUFBMUIsQ0FBaUMsS0FBakMsRUFBd0MsQ0FBeEM7QUFDRCxLQWZNO0FBZ0JQLElBQUEsSUFoQk8sa0JBZ0JBO0FBQUEsVUFFSCxvQkFGRyxHQU1ELElBTkMsQ0FFSCxvQkFGRztBQUFBLFVBR0gsV0FIRyxHQU1ELElBTkMsQ0FHSCxXQUhHO0FBQUEsVUFJSCxVQUpHLEdBTUQsSUFOQyxDQUlILFVBSkc7QUFBQSxVQUtILEtBTEcsR0FNRCxJQU5DLENBS0gsS0FMRztBQU9MLE1BQUEsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsU0FBTCxDQUFlLG9CQUFmLENBQVgsQ0FBdkI7QUFDQSxNQUFBLE9BQU8sQ0FBQyxPQUFSLEdBQ0csSUFESCxDQUNRLFlBQU07QUFBQSxvREFDa0Isb0JBRGxCO0FBQUE7O0FBQUE7QUFDVixpRUFBa0Q7QUFBQSxnQkFBeEMsY0FBd0M7O0FBQUEsd0RBQ3pCLFVBRHlCO0FBQUE7O0FBQUE7QUFDaEQscUVBQW1DO0FBQUEsb0JBQXpCLFNBQXlCO0FBQ2pDLG9CQUFNLFFBQVEsR0FBRyxjQUFjLFlBQUssU0FBTCxFQUEvQjtBQUNBLGdCQUFBLFdBQVcsQ0FBQyxRQUFELEVBQVc7QUFDcEIsa0JBQUEsSUFBSSxFQUFFLGFBRGM7QUFFcEIsa0JBQUEsY0FBYyxFQUFFO0FBRkksaUJBQVgsQ0FBWDtBQUlBLGdCQUFBLGNBQWMsQ0FBQyxTQUFELENBQWQsR0FBNEIsUUFBUSxDQUFDLFFBQVEsR0FBRyxHQUFaLENBQXBDO0FBQ0EsdUJBQU8sY0FBYyxZQUFLLFNBQUwsRUFBckI7QUFDRDtBQVQrQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBVWpEO0FBWFM7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFZVixlQUFPLE1BQU0sY0FBTyxLQUFLLENBQUMsR0FBYixzQkFBbUMsT0FBbkMsRUFBNEM7QUFDdkQsVUFBQSxvQkFBb0IsRUFBcEI7QUFEdUQsU0FBNUMsQ0FBYjtBQUdELE9BaEJILEVBaUJHLElBakJILENBaUJRLFlBQU07QUFDVixRQUFBLFlBQVksQ0FBQyxNQUFELENBQVo7QUFDRCxPQW5CSCxXQW9CUyxVQXBCVDtBQXFCRDtBQTdDTTtBQVRTLENBQVIsQ0FBWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZCgnZGF0YScpO1xyXG5cclxuZGF0YS5mb3J1bVNjb3JlT3BlcmF0aW9ucy5tYXAocyA9PiB7XHJcbiAgZm9yKGNvbnN0IHNjb3JlVHlwZSBvZiBkYXRhLnNjb3Jlc1R5cGUpIHtcclxuICAgIGNvbnN0IG9sZFZhbHVlID0gc1tzY29yZVR5cGVdO1xyXG4gICAgc1tgXyR7c2NvcmVUeXBlfWBdID0gb2xkVmFsdWUgPT09IHVuZGVmaW5lZD8gMDogb2xkVmFsdWUgLyAxMDA7XHJcbiAgfVxyXG59KTtcclxuY29uc3QgYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6ICcjYXBwJyxcclxuICBkYXRhOiB7XHJcbiAgICBmb3J1bUF2YWlsYWJsZVNjb3JlT3BlcmF0aW9uczogZGF0YS5mb3J1bUF2YWlsYWJsZVNjb3JlT3BlcmF0aW9ucyxcclxuICAgIGZvcnVtU2NvcmVPcGVyYXRpb25zOiBkYXRhLmZvcnVtU2NvcmVPcGVyYXRpb25zLFxyXG4gICAgc2NvcmVzOiBkYXRhLnNjb3JlcyxcclxuICAgIHNjb3Jlc1R5cGU6IGRhdGEuc2NvcmVzVHlwZSxcclxuICAgIGZvcnVtOiBkYXRhLmZvcnVtLFxyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgY2hlY2tOdW1iZXI6IE5LQy5tZXRob2RzLmNoZWNrRGF0YS5jaGVja051bWJlcixcclxuICAgIGFkZFNjb3JlT3BlcmF0aW9uKCkge1xyXG4gICAgICBjb25zdCBzY29yZU9wZXJhdGlvbiA9IHtcclxuICAgICAgICB0eXBlOiAnJyxcclxuICAgICAgICBjeWNsZTogJ2RheScsXHJcbiAgICAgICAgY291bnQ6IDAsXHJcbiAgICAgIH07XHJcbiAgICAgIGZvcihjb25zdCBzY29yZVR5cGUgb2YgdGhpcy5zY29yZXNUeXBlKSB7XHJcbiAgICAgICAgc2NvcmVPcGVyYXRpb25bJ18nICsgc2NvcmVUeXBlXSA9IDA7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5mb3J1bVNjb3JlT3BlcmF0aW9ucy5wdXNoKHNjb3JlT3BlcmF0aW9uKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmVTY29yZU9wZXJhdGlvbihpbmRleCkge1xyXG4gICAgICB0aGlzLmZvcnVtU2NvcmVPcGVyYXRpb25zLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9LFxyXG4gICAgc2F2ZSgpIHtcclxuICAgICAgbGV0IHtcclxuICAgICAgICBmb3J1bVNjb3JlT3BlcmF0aW9ucyxcclxuICAgICAgICBjaGVja051bWJlcixcclxuICAgICAgICBzY29yZXNUeXBlLFxyXG4gICAgICAgIGZvcnVtLFxyXG4gICAgICB9ID0gdGhpcztcclxuICAgICAgZm9ydW1TY29yZU9wZXJhdGlvbnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGZvcnVtU2NvcmVPcGVyYXRpb25zKSk7XHJcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgZm9yKGNvbnN0IHNjb3JlT3BlcmF0aW9uIG9mIGZvcnVtU2NvcmVPcGVyYXRpb25zKSB7XHJcbiAgICAgICAgICAgIGZvcihjb25zdCBzY29yZVR5cGUgb2Ygc2NvcmVzVHlwZSkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG9sZFZhbHVlID0gc2NvcmVPcGVyYXRpb25bYF8ke3Njb3JlVHlwZX1gXTtcclxuICAgICAgICAgICAgICBjaGVja051bWJlcihvbGRWYWx1ZSwge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ+enr+WIhuetlueVpeS4reWKoOWHj+eahOenr+WIhuWAvCcsXHJcbiAgICAgICAgICAgICAgICBmcmFjdGlvbkRpZ2l0czogMlxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIHNjb3JlT3BlcmF0aW9uW3Njb3JlVHlwZV0gPSBwYXJzZUludChvbGRWYWx1ZSAqIDEwMCk7XHJcbiAgICAgICAgICAgICAgZGVsZXRlIHNjb3JlT3BlcmF0aW9uW2BfJHtzY29yZVR5cGV9YF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBua2NBUEkoYC9mLyR7Zm9ydW0uZmlkfS9zZXR0aW5ncy9zY29yZWAsICdQQVRDSCcsIHtcclxuICAgICAgICAgICAgZm9ydW1TY29yZU9wZXJhdGlvbnNcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKCfkv53lrZjmiJDlip8nKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG4iXX0=
