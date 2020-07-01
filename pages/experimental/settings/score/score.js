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
var types = ['score1', 'score2', 'score3', 'score4', 'score5'];
data.scoreSettings.operations.map(function (operation) {
  var _iterator = _createForOfIteratorHelper(types),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var type = _step.value;
      operation["_".concat(type)] = operation[type] / 100;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
});
var iconArr = [];
var _scores = [];

for (var _i = 0, _types = types; _i < _types.length; _i++) {
  var type = _types[_i];
  if (!scores.hasOwnProperty(type)) continue;

  _scores.push(scores[type]);

  var icon = scores[type].icon;
  iconArr.push({
    type: type,
    icon: icon,
    iconFile: '',
    iconData: ''
  });
}

var app = new Vue({
  el: '#app',
  data: {
    scoreSettings: data.scoreSettings,
    scores: _scores,
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
          var _iterator2 = _createForOfIteratorHelper(types),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var _type = _step2.value;
              var oldValue = operation["_".concat(_type)];
              self.checkNumber(oldValue, {
                name: '积分策略中加减的积分值',
                fractionDigits: 2
              });
              operation[_type] = oldValue * 100;
              delete operation["_".concat(_type)];
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
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
        scoreSettings.creditMin = scoreSettings._creditMin * 100;
        scoreSettings.creditMax = scoreSettings._creditMax * 100;
        delete scoreSettings._creditMin;
        delete scoreSettings._creditMax;
        delete scoreSettings._withdrawTimeEnd;
        delete scoreSettings._withdrawTimeBegin;
        var formData = new FormData();
        formData.append('scoreSettings', JSON.stringify(scoreSettings));

        var _iterator3 = _createForOfIteratorHelper(iconArr),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var _icon = _step3.value;
            var iconFile = _icon.iconFile,
                _type2 = _icon.type;
            if (!iconFile) continue;
            formData.append(_type2, iconFile);
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2V4cGVyaW1lbnRhbC9zZXR0aW5ncy9zY29yZS9zY29yZS5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiO0FBQ0EsSUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBSixDQUFZLFdBQWhCLEVBQXBCO0lBQ08sTSxHQUFVLElBQUksQ0FBQyxhLENBQWYsTTtBQUNQLElBQUksQ0FBQyxhQUFMLENBQW1CLGtCQUFuQixHQUF3QyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsaUJBQXBCLENBQTlDO0FBQ0EsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsZ0JBQW5CLEdBQXNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBTCxDQUFtQixlQUFwQixDQUE1QztBQUVBLElBQUksQ0FBQyxhQUFMLENBQW1CLFVBQW5CLEdBQWdDLElBQUksQ0FBQyxhQUFMLENBQW1CLFNBQW5CLEdBQStCLEdBQS9EO0FBQ0EsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsVUFBbkIsR0FBZ0MsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsU0FBbkIsR0FBK0IsR0FBL0Q7QUFFQSxJQUFNLEtBQUssR0FBRyxDQUNaLFFBRFksRUFFWixRQUZZLEVBR1osUUFIWSxFQUlaLFFBSlksRUFLWixRQUxZLENBQWQ7QUFRQSxJQUFJLENBQUMsYUFBTCxDQUFtQixVQUFuQixDQUE4QixHQUE5QixDQUFrQyxVQUFBLFNBQVMsRUFBSTtBQUFBLDZDQUMzQixLQUQyQjtBQUFBOztBQUFBO0FBQzdDLHdEQUF5QjtBQUFBLFVBQWYsSUFBZTtBQUN2QixNQUFBLFNBQVMsWUFBSyxJQUFMLEVBQVQsR0FBd0IsU0FBUyxDQUFDLElBQUQsQ0FBVCxHQUFrQixHQUEx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O0FBRUwsSUFBQSxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFDLEdBQUMsS0FBYixJQUFzQixFQUZ0QjtBQUdMLElBQUEsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQyxHQUFDLElBQWIsSUFBcUI7QUFIckIsR0FBUDtBQUtEOztBQUVELFNBQVMsV0FBVCxDQUFxQixDQUFyQixFQUF3QjtBQUN0QixTQUFPLENBQUMsQ0FBQyxJQUFGLEdBQVMsRUFBVCxHQUFjLEVBQWQsR0FBbUIsSUFBbkIsR0FBMEIsQ0FBQyxDQUFDLEdBQUYsR0FBUSxFQUFSLEdBQWEsSUFBdkMsR0FBOEMsQ0FBQyxDQUFDLEdBQUYsR0FBUSxJQUE3RDtBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKCdkYXRhJyk7XHJcbmNvbnN0IHNlbGVjdEltYWdlID0gbmV3IE5LQy5tZXRob2RzLnNlbGVjdEltYWdlKCk7XHJcbmNvbnN0IHtzY29yZXN9ID0gZGF0YS5zY29yZVNldHRpbmdzO1xyXG5kYXRhLnNjb3JlU2V0dGluZ3MuX3dpdGhkcmF3VGltZUJlZ2luID0gZ2V0SE1TKGRhdGEuc2NvcmVTZXR0aW5ncy53aXRoZHJhd1RpbWVCZWdpbik7XHJcbmRhdGEuc2NvcmVTZXR0aW5ncy5fd2l0aGRyYXdUaW1lRW5kID0gZ2V0SE1TKGRhdGEuc2NvcmVTZXR0aW5ncy53aXRoZHJhd1RpbWVFbmQpO1xyXG5cclxuZGF0YS5zY29yZVNldHRpbmdzLl9jcmVkaXRNaW4gPSBkYXRhLnNjb3JlU2V0dGluZ3MuY3JlZGl0TWluIC8gMTAwO1xyXG5kYXRhLnNjb3JlU2V0dGluZ3MuX2NyZWRpdE1heCA9IGRhdGEuc2NvcmVTZXR0aW5ncy5jcmVkaXRNYXggLyAxMDA7XHJcblxyXG5jb25zdCB0eXBlcyA9IFtcclxuICAnc2NvcmUxJyxcclxuICAnc2NvcmUyJyxcclxuICAnc2NvcmUzJyxcclxuICAnc2NvcmU0JyxcclxuICAnc2NvcmU1J1xyXG5dO1xyXG5cclxuZGF0YS5zY29yZVNldHRpbmdzLm9wZXJhdGlvbnMubWFwKG9wZXJhdGlvbiA9PiB7XHJcbiAgZm9yKGNvbnN0IHR5cGUgb2YgdHlwZXMpIHtcclxuICAgIG9wZXJhdGlvbltgXyR7dHlwZX1gXSA9IG9wZXJhdGlvblt0eXBlXSAvIDEwMDtcclxuICB9XHJcbn0pO1xyXG5cclxuY29uc3QgaWNvbkFyciA9IFtdO1xyXG5jb25zdCBfc2NvcmVzID0gW107XHJcbmZvcihjb25zdCB0eXBlIG9mIHR5cGVzKSB7XHJcbiAgaWYoIXNjb3Jlcy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgY29udGludWU7XHJcbiAgX3Njb3Jlcy5wdXNoKHNjb3Jlc1t0eXBlXSk7XHJcbiAgY29uc3Qge1xyXG4gICAgaWNvblxyXG4gIH0gPSBzY29yZXNbdHlwZV07XHJcbiAgaWNvbkFyci5wdXNoKHtcclxuICAgIHR5cGUsXHJcbiAgICBpY29uLFxyXG4gICAgaWNvbkZpbGU6ICcnLFxyXG4gICAgaWNvbkRhdGE6ICcnXHJcbiAgfSk7XHJcbn1cclxuXHJcbmNvbnN0IGFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiAnI2FwcCcsXHJcbiAgZGF0YToge1xyXG4gICAgc2NvcmVTZXR0aW5nczogZGF0YS5zY29yZVNldHRpbmdzLFxyXG4gICAgc2NvcmVzOiBfc2NvcmVzLFxyXG4gICAgaWNvbkFycixcclxuICAgIHN1Ym1pdHRpbmc6IGZhbHNlLFxyXG4gIH0sXHJcbiAgY29tcHV0ZWQ6IHtcclxuICAgIG1haW5TY29yZVNlbGVjdCgpIHtcclxuICAgICAgY29uc3QgYXJyID0gW107XHJcbiAgICAgIHRoaXMuc2NvcmVzLm1hcChuID0+IHtcclxuICAgICAgICBpZighbi5lbmFibGVkKSByZXR1cm47XHJcbiAgICAgICAgYXJyLnB1c2goe1xyXG4gICAgICAgICAgdHlwZTogbi50eXBlLFxyXG4gICAgICAgICAgbmFtZTogbi5uYW1lXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gYXJyO1xyXG4gICAgfSxcclxuICAgIGNvbW1vblNjb3JlU2VsZWN0KCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5tYWluU2NvcmVTZWxlY3Q7XHJcbiAgICB9XHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgIGdldEhNUyxcclxuICAgIEhNU1RvTnVtYmVyLFxyXG4gICAgY2hlY2tTdHJpbmc6IE5LQy5tZXRob2RzLmNoZWNrRGF0YS5jaGVja1N0cmluZyxcclxuICAgIGNoZWNrTnVtYmVyOiBOS0MubWV0aG9kcy5jaGVja0RhdGEuY2hlY2tOdW1iZXIsXHJcbiAgICBzZWxlY3RJY29uKGEpIHtcclxuICAgICAgc2VsZWN0SW1hZ2Uuc2hvdyhibG9iID0+IHtcclxuICAgICAgICBjb25zdCBmaWxlID0gTktDLm1ldGhvZHMuYmxvYlRvRmlsZShibG9iKTtcclxuICAgICAgICBOS0MubWV0aG9kcy5maWxlVG9VcmwoZmlsZSlcclxuICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICBhLmljb25EYXRhID0gZGF0YTtcclxuICAgICAgICAgICAgYS5pY29uRmlsZSA9IGZpbGU7XHJcbiAgICAgICAgICAgIHNlbGVjdEltYWdlLmNsb3NlKCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSwge1xyXG4gICAgICAgIGFzcGVjdFJhdGlvOiAxXHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHNhdmUoKSB7XHJcbiAgICAgIGNvbnN0IHtcclxuICAgICAgICBpY29uQXJyXHJcbiAgICAgIH0gPSB0aGlzO1xyXG4gICAgICBjb25zdCBzY29yZVNldHRpbmdzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnNjb3JlU2V0dGluZ3MpKTtcclxuICAgICAgc2NvcmVTZXR0aW5ncy53aXRoZHJhd1RpbWVCZWdpbiA9IEhNU1RvTnVtYmVyKHNjb3JlU2V0dGluZ3MuX3dpdGhkcmF3VGltZUJlZ2luKTtcclxuICAgICAgc2NvcmVTZXR0aW5ncy53aXRoZHJhd1RpbWVFbmQgPSBITVNUb051bWJlcihzY29yZVNldHRpbmdzLl93aXRoZHJhd1RpbWVFbmQpO1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzY29yZVNldHRpbmdzLm9wZXJhdGlvbnMubWFwKG9wZXJhdGlvbiA9PiB7XHJcbiAgICAgICAgICAgIGZvcihjb25zdCB0eXBlIG9mIHR5cGVzKSB7XHJcbiAgICAgICAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSBvcGVyYXRpb25bYF8ke3R5cGV9YF07XHJcbiAgICAgICAgICAgICAgc2VsZi5jaGVja051bWJlcihvbGRWYWx1ZSwge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ+enr+WIhuetlueVpeS4reWKoOWHj+eahOenr+WIhuWAvCcsXHJcbiAgICAgICAgICAgICAgICBmcmFjdGlvbkRpZ2l0czogMixcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBvcGVyYXRpb25bdHlwZV0gPSBvbGRWYWx1ZSAqIDEwMDtcclxuICAgICAgICAgICAgICBkZWxldGUgb3BlcmF0aW9uW2BfJHt0eXBlfWBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICB0aGlzLmNoZWNrTnVtYmVyKHNjb3JlU2V0dGluZ3MuX2NyZWRpdE1pbiwge1xyXG4gICAgICAgICAgICBuYW1lOiAn5pyA5bCP6byT5Yqx6YeR6aKdJyxcclxuICAgICAgICAgICAgbWluOiAwLjAxLFxyXG4gICAgICAgICAgICBmcmFjdGlvbkRpZ2l0czogMlxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aGlzLmNoZWNrTnVtYmVyKHNjb3JlU2V0dGluZ3MuX2NyZWRpdE1heCwge1xyXG4gICAgICAgICAgICBuYW1lOiAn5pyA5aSn6byT5Yqx6YeR6aKdJyxcclxuICAgICAgICAgICAgbWluOiAwLjAxLFxyXG4gICAgICAgICAgICBmcmFjdGlvbkRpZ2l0czogMlxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBpZihzY29yZVNldHRpbmdzLl9jcmVkaXRNaW4gPiBzY29yZVNldHRpbmdzLl9jcmVkaXRNYXgpIHRocm93ICfpvJPlirHph5Hpop3orr7nva7plJnor68nO1xyXG4gICAgICAgICAgc2NvcmVTZXR0aW5ncy5jcmVkaXRNaW4gPSBzY29yZVNldHRpbmdzLl9jcmVkaXRNaW4gKiAxMDA7XHJcbiAgICAgICAgICBzY29yZVNldHRpbmdzLmNyZWRpdE1heCA9IHNjb3JlU2V0dGluZ3MuX2NyZWRpdE1heCAqIDEwMDtcclxuICAgICAgICAgIGRlbGV0ZSBzY29yZVNldHRpbmdzLl9jcmVkaXRNaW47XHJcbiAgICAgICAgICBkZWxldGUgc2NvcmVTZXR0aW5ncy5fY3JlZGl0TWF4O1xyXG4gICAgICAgICAgZGVsZXRlIHNjb3JlU2V0dGluZ3MuX3dpdGhkcmF3VGltZUVuZDtcclxuICAgICAgICAgIGRlbGV0ZSBzY29yZVNldHRpbmdzLl93aXRoZHJhd1RpbWVCZWdpbjtcclxuICAgICAgICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ3Njb3JlU2V0dGluZ3MnLCBKU09OLnN0cmluZ2lmeShzY29yZVNldHRpbmdzKSk7XHJcbiAgICAgICAgICBmb3IoY29uc3QgaWNvbiBvZiBpY29uQXJyKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHtpY29uRmlsZSwgdHlwZX0gPSBpY29uO1xyXG4gICAgICAgICAgICBpZiAoIWljb25GaWxlKSBjb250aW51ZTtcclxuICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKHR5cGUsIGljb25GaWxlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBua2NVcGxvYWRGaWxlKCcvZS9zZXR0aW5ncy9zY29yZScsICdQQVRDSCcsIGZvcm1EYXRhKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKCfkv53lrZjmiJDlip8nKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgc3dlZXRFcnJvcihlcnIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG5cclxuZnVuY3Rpb24gZ2V0SE1TKHQpIHtcclxuICByZXR1cm4ge1xyXG4gICAgaG91cjogTWF0aC5mbG9vcih0LzM2MDAwMDApLFxyXG4gICAgbWluOiBNYXRoLmZsb29yKHQvNjAwMDApICUgNjAsXHJcbiAgICBzZWM6IE1hdGguZmxvb3IodC8xMDAwKSAlIDYwXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBITVNUb051bWJlcih0KSB7XHJcbiAgcmV0dXJuIHQuaG91ciAqIDYwICogNjAgKiAxMDAwICsgdC5taW4gKiA2MCAqIDEwMDAgKyB0LnNlYyAqIDEwMDA7XHJcbn1cclxuIl19
