(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var data = NKC.methods.getDataById('data');
var selectImage = new NKC.methods.selectImage();
var scores = data.scoreSettings.scores;
data.scoreSettings._withdrawTimeBegin = getHMS(data.scoreSettings.withdrawTimeBegin);
data.scoreSettings._withdrawTimeEnd = getHMS(data.scoreSettings.withdrawTimeEnd);
data.scoreSettings._creditMin = data.scoreSettings.creditMin / 100;
data.scoreSettings._creditMax = data.scoreSettings.creditMax / 100;
var types = data.scoresType;
data.scoreSettings.operations.map(function (operation) {
  var _iterator = _createForOfIteratorHelper(types),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var type = _step.value;
      var oldValue = operation[type];
      operation["_".concat(type)] = oldValue === undefined ? 0 : oldValue / 100;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
});
var iconArr = [];

var _iterator2 = _createForOfIteratorHelper(scores),
    _step2;

try {
  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
    var score = _step2.value;
    var type = score.type,
        icon = score.icon;
    iconArr.push({
      type: type,
      icon: icon,
      iconFile: '',
      iconData: ''
    });
  }
} catch (err) {
  _iterator2.e(err);
} finally {
  _iterator2.f();
}

var app = new Vue({
  el: '#app',
  data: {
    scoreSettings: data.scoreSettings,
    scores: scores,
    types: types,
    iconArr: iconArr,
    submitting: false
  },
  computed: {
    mainScoreSelect: function mainScoreSelect() {
      var arr = [];
      this.scores.map(function (n) {
        if (!n.enabled) return;
        arr.push({
          type: n.type,
          name: n.name
        });
      });
      return arr;
    },
    commonScoreSelect: function commonScoreSelect() {
      return this.mainScoreSelect;
    }
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    getHMS: getHMS,
    HMSToNumber: HMSToNumber,
    checkString: NKC.methods.checkData.checkString,
    checkNumber: NKC.methods.checkData.checkNumber,
    selectIcon: function selectIcon(a) {
      selectImage.show(function (blob) {
        var file = NKC.methods.blobToFile(blob);
        NKC.methods.fileToUrl(file).then(function (data) {
          a.iconData = data;
          a.iconFile = file;
          selectImage.close();
        });
      }, {
        aspectRatio: 1
      });
    },
    save: function save() {
      var _this = this;

      var iconArr = this.iconArr;
      var scoreSettings = JSON.parse(JSON.stringify(this.scoreSettings));
      scoreSettings.withdrawTimeBegin = HMSToNumber(scoreSettings._withdrawTimeBegin);
      scoreSettings.withdrawTimeEnd = HMSToNumber(scoreSettings._withdrawTimeEnd);
      var self = this;
      Promise.resolve().then(function () {
        scoreSettings.operations.map(function (operation) {
          var _iterator3 = _createForOfIteratorHelper(self.types),
              _step3;

          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var type = _step3.value;
              var oldValue = operation["_".concat(type)];
              self.checkNumber(oldValue, {
                name: '积分策略中加减的积分值',
                fractionDigits: 2
              });
              operation[type] = parseInt(oldValue * 100);
              delete operation["_".concat(type)];
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
        });

        _this.checkNumber(scoreSettings._creditMin, {
          name: '最小鼓励金额',
          min: 0.01,
          fractionDigits: 2
        });

        _this.checkNumber(scoreSettings._creditMax, {
          name: '最大鼓励金额',
          min: 0.01,
          fractionDigits: 2
        });

        if (scoreSettings._creditMin > scoreSettings._creditMax) throw '鼓励金额设置错误';
        scoreSettings.creditMin = parseInt(scoreSettings._creditMin * 100);
        scoreSettings.creditMax = parseInt(scoreSettings._creditMax * 100);
        delete scoreSettings._creditMin;
        delete scoreSettings._creditMax;
        delete scoreSettings._withdrawTimeEnd;
        delete scoreSettings._withdrawTimeBegin;
        var formData = new FormData();
        formData.append('scoreSettings', JSON.stringify(scoreSettings));

        var _iterator4 = _createForOfIteratorHelper(iconArr),
            _step4;

        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var icon = _step4.value;
            var iconFile = icon.iconFile,
                type = icon.type;
            if (!iconFile) continue;
            formData.append(type, iconFile, iconFile.name);
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }

        return nkcUploadFile('/e/settings/score', 'PATCH', formData);
      }).then(function () {
        sweetSuccess('保存成功');
      })["catch"](function (err) {
        sweetError(err);
      });
    }
  }
});

function getHMS(t) {
  return {
    hour: Math.floor(t / 3600000),
    min: Math.floor(t / 60000) % 60,
    sec: Math.floor(t / 1000) % 60
  };
}

function HMSToNumber(t) {
  return t.hour * 60 * 60 * 1000 + t.min * 60 * 1000 + t.sec * 1000;
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2V4cGVyaW1lbnRhbC9zZXR0aW5ncy9zY29yZS9zY29yZS5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiO0FBQ0EsSUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBSixDQUFZLFdBQWhCLEVBQXBCO0lBQ08sTSxHQUFVLElBQUksQ0FBQyxhLENBQWYsTTtBQUNQLElBQUksQ0FBQyxhQUFMLENBQW1CLGtCQUFuQixHQUF3QyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsaUJBQXBCLENBQTlDO0FBQ0EsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsZ0JBQW5CLEdBQXNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBTCxDQUFtQixlQUFwQixDQUE1QztBQUVBLElBQUksQ0FBQyxhQUFMLENBQW1CLFVBQW5CLEdBQWdDLElBQUksQ0FBQyxhQUFMLENBQW1CLFNBQW5CLEdBQStCLEdBQS9EO0FBQ0EsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsVUFBbkIsR0FBZ0MsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsU0FBbkIsR0FBK0IsR0FBL0Q7QUFFQSxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBbkI7QUFDQSxJQUFJLENBQUMsYUFBTCxDQUFtQixVQUFuQixDQUE4QixHQUE5QixDQUFrQyxVQUFBLFNBQVMsRUFBSTtBQUFBLDZDQUMzQixLQUQyQjtBQUFBOztBQUFBO0FBQzdDLHdEQUF5QjtBQUFBLFVBQWYsSUFBZTtBQUN2QixVQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsSUFBRCxDQUExQjtBQUNBLE1BQUEsU0FBUyxZQUFLLElBQUwsRUFBVCxHQUF3QixRQUFRLEtBQUssU0FBYixHQUF3QixDQUF4QixH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QyxPQUFiLENBREQ7QUFFTCxJQUFBLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBTCxDQUFXLENBQUMsR0FBQyxLQUFiLElBQXNCLEVBRnRCO0FBR0wsSUFBQSxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFDLEdBQUMsSUFBYixJQUFxQjtBQUhyQixHQUFQO0FBS0Q7O0FBRUQsU0FBUyxXQUFULENBQXFCLENBQXJCLEVBQXdCO0FBQ3RCLFNBQU8sQ0FBQyxDQUFDLElBQUYsR0FBUyxFQUFULEdBQWMsRUFBZCxHQUFtQixJQUFuQixHQUEwQixDQUFDLENBQUMsR0FBRixHQUFRLEVBQVIsR0FBYSxJQUF2QyxHQUE4QyxDQUFDLENBQUMsR0FBRixHQUFRLElBQTdEO0FBQ0QiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBkYXRhID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoJ2RhdGEnKTtcclxuY29uc3Qgc2VsZWN0SW1hZ2UgPSBuZXcgTktDLm1ldGhvZHMuc2VsZWN0SW1hZ2UoKTtcclxuY29uc3Qge3Njb3Jlc30gPSBkYXRhLnNjb3JlU2V0dGluZ3M7XHJcbmRhdGEuc2NvcmVTZXR0aW5ncy5fd2l0aGRyYXdUaW1lQmVnaW4gPSBnZXRITVMoZGF0YS5zY29yZVNldHRpbmdzLndpdGhkcmF3VGltZUJlZ2luKTtcclxuZGF0YS5zY29yZVNldHRpbmdzLl93aXRoZHJhd1RpbWVFbmQgPSBnZXRITVMoZGF0YS5zY29yZVNldHRpbmdzLndpdGhkcmF3VGltZUVuZCk7XHJcblxyXG5kYXRhLnNjb3JlU2V0dGluZ3MuX2NyZWRpdE1pbiA9IGRhdGEuc2NvcmVTZXR0aW5ncy5jcmVkaXRNaW4gLyAxMDA7XHJcbmRhdGEuc2NvcmVTZXR0aW5ncy5fY3JlZGl0TWF4ID0gZGF0YS5zY29yZVNldHRpbmdzLmNyZWRpdE1heCAvIDEwMDtcclxuXHJcbmNvbnN0IHR5cGVzID0gZGF0YS5zY29yZXNUeXBlO1xyXG5kYXRhLnNjb3JlU2V0dGluZ3Mub3BlcmF0aW9ucy5tYXAob3BlcmF0aW9uID0+IHtcclxuICBmb3IoY29uc3QgdHlwZSBvZiB0eXBlcykge1xyXG4gICAgY29uc3Qgb2xkVmFsdWUgPSBvcGVyYXRpb25bdHlwZV07XHJcbiAgICBvcGVyYXRpb25bYF8ke3R5cGV9YF0gPSBvbGRWYWx1ZSA9PT0gdW5kZWZpbmVkPyAwOiBvbGRWYWx1ZSAvIDEwMDtcclxuICB9XHJcbn0pO1xyXG5cclxuY29uc3QgaWNvbkFyciA9IFtdO1xyXG5cclxuZm9yKGNvbnN0IHNjb3JlIG9mIHNjb3Jlcykge1xyXG4gIGNvbnN0IHt0eXBlLCBpY29ufSA9IHNjb3JlO1xyXG4gIGljb25BcnIucHVzaCh7XHJcbiAgICB0eXBlLFxyXG4gICAgaWNvbixcclxuICAgIGljb25GaWxlOiAnJyxcclxuICAgIGljb25EYXRhOiAnJ1xyXG4gIH0pO1xyXG59XHJcblxyXG5jb25zdCBhcHAgPSBuZXcgVnVlKHtcclxuICBlbDogJyNhcHAnLFxyXG4gIGRhdGE6IHtcclxuICAgIHNjb3JlU2V0dGluZ3M6IGRhdGEuc2NvcmVTZXR0aW5ncyxcclxuICAgIHNjb3JlcyxcclxuICAgIHR5cGVzLFxyXG4gICAgaWNvbkFycixcclxuICAgIHN1Ym1pdHRpbmc6IGZhbHNlLFxyXG4gIH0sXHJcbiAgY29tcHV0ZWQ6IHtcclxuICAgIG1haW5TY29yZVNlbGVjdCgpIHtcclxuICAgICAgY29uc3QgYXJyID0gW107XHJcbiAgICAgIHRoaXMuc2NvcmVzLm1hcChuID0+IHtcclxuICAgICAgICBpZighbi5lbmFibGVkKSByZXR1cm47XHJcbiAgICAgICAgYXJyLnB1c2goe1xyXG4gICAgICAgICAgdHlwZTogbi50eXBlLFxyXG4gICAgICAgICAgbmFtZTogbi5uYW1lXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gYXJyO1xyXG4gICAgfSxcclxuICAgIGNvbW1vblNjb3JlU2VsZWN0KCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5tYWluU2NvcmVTZWxlY3Q7XHJcbiAgICB9XHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgIGdldEhNUyxcclxuICAgIEhNU1RvTnVtYmVyLFxyXG4gICAgY2hlY2tTdHJpbmc6IE5LQy5tZXRob2RzLmNoZWNrRGF0YS5jaGVja1N0cmluZyxcclxuICAgIGNoZWNrTnVtYmVyOiBOS0MubWV0aG9kcy5jaGVja0RhdGEuY2hlY2tOdW1iZXIsXHJcbiAgICBzZWxlY3RJY29uKGEpIHtcclxuICAgICAgc2VsZWN0SW1hZ2Uuc2hvdyhibG9iID0+IHtcclxuICAgICAgICBjb25zdCBmaWxlID0gTktDLm1ldGhvZHMuYmxvYlRvRmlsZShibG9iKTtcclxuICAgICAgICBOS0MubWV0aG9kcy5maWxlVG9VcmwoZmlsZSlcclxuICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICBhLmljb25EYXRhID0gZGF0YTtcclxuICAgICAgICAgICAgYS5pY29uRmlsZSA9IGZpbGU7XHJcbiAgICAgICAgICAgIHNlbGVjdEltYWdlLmNsb3NlKCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSwge1xyXG4gICAgICAgIGFzcGVjdFJhdGlvOiAxXHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHNhdmUoKSB7XHJcbiAgICAgIGNvbnN0IHtcclxuICAgICAgICBpY29uQXJyXHJcbiAgICAgIH0gPSB0aGlzO1xyXG4gICAgICBjb25zdCBzY29yZVNldHRpbmdzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnNjb3JlU2V0dGluZ3MpKTtcclxuICAgICAgc2NvcmVTZXR0aW5ncy53aXRoZHJhd1RpbWVCZWdpbiA9IEhNU1RvTnVtYmVyKHNjb3JlU2V0dGluZ3MuX3dpdGhkcmF3VGltZUJlZ2luKTtcclxuICAgICAgc2NvcmVTZXR0aW5ncy53aXRoZHJhd1RpbWVFbmQgPSBITVNUb051bWJlcihzY29yZVNldHRpbmdzLl93aXRoZHJhd1RpbWVFbmQpO1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzY29yZVNldHRpbmdzLm9wZXJhdGlvbnMubWFwKG9wZXJhdGlvbiA9PiB7XHJcbiAgICAgICAgICAgIGZvcihjb25zdCB0eXBlIG9mIHNlbGYudHlwZXMpIHtcclxuICAgICAgICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IG9wZXJhdGlvbltgXyR7dHlwZX1gXTtcclxuICAgICAgICAgICAgICBzZWxmLmNoZWNrTnVtYmVyKG9sZFZhbHVlLCB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAn56ev5YiG562W55Wl5Lit5Yqg5YeP55qE56ev5YiG5YC8JyxcclxuICAgICAgICAgICAgICAgIGZyYWN0aW9uRGlnaXRzOiAyLFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIG9wZXJhdGlvblt0eXBlXSA9IHBhcnNlSW50KG9sZFZhbHVlICogMTAwKTtcclxuICAgICAgICAgICAgICBkZWxldGUgb3BlcmF0aW9uW2BfJHt0eXBlfWBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICB0aGlzLmNoZWNrTnVtYmVyKHNjb3JlU2V0dGluZ3MuX2NyZWRpdE1pbiwge1xyXG4gICAgICAgICAgICBuYW1lOiAn5pyA5bCP6byT5Yqx6YeR6aKdJyxcclxuICAgICAgICAgICAgbWluOiAwLjAxLFxyXG4gICAgICAgICAgICBmcmFjdGlvbkRpZ2l0czogMlxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aGlzLmNoZWNrTnVtYmVyKHNjb3JlU2V0dGluZ3MuX2NyZWRpdE1heCwge1xyXG4gICAgICAgICAgICBuYW1lOiAn5pyA5aSn6byT5Yqx6YeR6aKdJyxcclxuICAgICAgICAgICAgbWluOiAwLjAxLFxyXG4gICAgICAgICAgICBmcmFjdGlvbkRpZ2l0czogMlxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBpZihzY29yZVNldHRpbmdzLl9jcmVkaXRNaW4gPiBzY29yZVNldHRpbmdzLl9jcmVkaXRNYXgpIHRocm93ICfpvJPlirHph5Hpop3orr7nva7plJnor68nO1xyXG4gICAgICAgICAgc2NvcmVTZXR0aW5ncy5jcmVkaXRNaW4gPSBwYXJzZUludChzY29yZVNldHRpbmdzLl9jcmVkaXRNaW4gKiAxMDApO1xyXG4gICAgICAgICAgc2NvcmVTZXR0aW5ncy5jcmVkaXRNYXggPSBwYXJzZUludChzY29yZVNldHRpbmdzLl9jcmVkaXRNYXggKiAxMDApO1xyXG4gICAgICAgICAgZGVsZXRlIHNjb3JlU2V0dGluZ3MuX2NyZWRpdE1pbjtcclxuICAgICAgICAgIGRlbGV0ZSBzY29yZVNldHRpbmdzLl9jcmVkaXRNYXg7XHJcbiAgICAgICAgICBkZWxldGUgc2NvcmVTZXR0aW5ncy5fd2l0aGRyYXdUaW1lRW5kO1xyXG4gICAgICAgICAgZGVsZXRlIHNjb3JlU2V0dGluZ3MuX3dpdGhkcmF3VGltZUJlZ2luO1xyXG4gICAgICAgICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnc2NvcmVTZXR0aW5ncycsIEpTT04uc3RyaW5naWZ5KHNjb3JlU2V0dGluZ3MpKTtcclxuICAgICAgICAgIGZvcihjb25zdCBpY29uIG9mIGljb25BcnIpIHtcclxuICAgICAgICAgICAgY29uc3Qge2ljb25GaWxlLCB0eXBlfSA9IGljb247XHJcbiAgICAgICAgICAgIGlmICghaWNvbkZpbGUpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQodHlwZSwgaWNvbkZpbGUsIGljb25GaWxlLm5hbWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIG5rY1VwbG9hZEZpbGUoJy9lL3NldHRpbmdzL3Njb3JlJywgJ1BBVENIJywgZm9ybURhdGEpXHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoJ+S/neWtmOaIkOWKnycpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICBzd2VldEVycm9yKGVycik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcbmZ1bmN0aW9uIGdldEhNUyh0KSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGhvdXI6IE1hdGguZmxvb3IodC8zNjAwMDAwKSxcclxuICAgIG1pbjogTWF0aC5mbG9vcih0LzYwMDAwKSAlIDYwLFxyXG4gICAgc2VjOiBNYXRoLmZsb29yKHQvMTAwMCkgJSA2MFxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gSE1TVG9OdW1iZXIodCkge1xyXG4gIHJldHVybiB0LmhvdXIgKiA2MCAqIDYwICogMTAwMCArIHQubWluICogNjAgKiAxMDAwICsgdC5zZWMgKiAxMDAwO1xyXG59XHJcbiJdfQ==
