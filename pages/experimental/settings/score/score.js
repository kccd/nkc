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

        return nkcUploadFile('/e/settings/score', 'PUT', formData);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3Mvc2NvcmUvc2NvcmUubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLElBQU0sV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFoQixFQUFwQjtJQUNPLE0sR0FBVSxJQUFJLENBQUMsYSxDQUFmLE07QUFDUCxJQUFJLENBQUMsYUFBTCxDQUFtQixrQkFBbkIsR0FBd0MsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFMLENBQW1CLGlCQUFwQixDQUE5QztBQUNBLElBQUksQ0FBQyxhQUFMLENBQW1CLGdCQUFuQixHQUFzQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsZUFBcEIsQ0FBNUM7QUFFQSxJQUFJLENBQUMsYUFBTCxDQUFtQixVQUFuQixHQUFnQyxJQUFJLENBQUMsYUFBTCxDQUFtQixTQUFuQixHQUErQixHQUEvRDtBQUNBLElBQUksQ0FBQyxhQUFMLENBQW1CLFVBQW5CLEdBQWdDLElBQUksQ0FBQyxhQUFMLENBQW1CLFNBQW5CLEdBQStCLEdBQS9EO0FBRUEsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQW5CO0FBQ0EsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsVUFBbkIsQ0FBOEIsR0FBOUIsQ0FBa0MsVUFBQSxTQUFTLEVBQUk7QUFBQSw2Q0FDM0IsS0FEMkI7QUFBQTs7QUFBQTtBQUM3Qyx3REFBeUI7QUFBQSxVQUFmLElBQWU7QUFDdkIsVUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLElBQUQsQ0FBMUI7QUFDQSxNQUFBLFNBQVMsWUFBSyxJQUFMLEVBQVQsR0FBd0IsUUFBUSxLQUFLLFNBQWIsR0FBd0IsQ0FBeEIsR0FBMkIsUUFBUSxHQUFHLEdBQTlE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QSxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFDLEdBQUMsS0FBYixJQUFzQixFQUZ0QjtBQUdMLElBQUEsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQyxHQUFDLElBQWIsSUFBcUI7QUFIckIsR0FBUDtBQUtEOztBQUVELFNBQVMsV0FBVCxDQUFxQixDQUFyQixFQUF3QjtBQUN0QixTQUFPLENBQUMsQ0FBQyxJQUFGLEdBQVMsRUFBVCxHQUFjLEVBQWQsR0FBbUIsSUFBbkIsR0FBMEIsQ0FBQyxDQUFDLEdBQUYsR0FBUSxFQUFSLEdBQWEsSUFBdkMsR0FBOEMsQ0FBQyxDQUFDLEdBQUYsR0FBUSxJQUE3RDtBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKCdkYXRhJyk7XHJcbmNvbnN0IHNlbGVjdEltYWdlID0gbmV3IE5LQy5tZXRob2RzLnNlbGVjdEltYWdlKCk7XHJcbmNvbnN0IHtzY29yZXN9ID0gZGF0YS5zY29yZVNldHRpbmdzO1xyXG5kYXRhLnNjb3JlU2V0dGluZ3MuX3dpdGhkcmF3VGltZUJlZ2luID0gZ2V0SE1TKGRhdGEuc2NvcmVTZXR0aW5ncy53aXRoZHJhd1RpbWVCZWdpbik7XHJcbmRhdGEuc2NvcmVTZXR0aW5ncy5fd2l0aGRyYXdUaW1lRW5kID0gZ2V0SE1TKGRhdGEuc2NvcmVTZXR0aW5ncy53aXRoZHJhd1RpbWVFbmQpO1xyXG5cclxuZGF0YS5zY29yZVNldHRpbmdzLl9jcmVkaXRNaW4gPSBkYXRhLnNjb3JlU2V0dGluZ3MuY3JlZGl0TWluIC8gMTAwO1xyXG5kYXRhLnNjb3JlU2V0dGluZ3MuX2NyZWRpdE1heCA9IGRhdGEuc2NvcmVTZXR0aW5ncy5jcmVkaXRNYXggLyAxMDA7XHJcblxyXG5jb25zdCB0eXBlcyA9IGRhdGEuc2NvcmVzVHlwZTtcclxuZGF0YS5zY29yZVNldHRpbmdzLm9wZXJhdGlvbnMubWFwKG9wZXJhdGlvbiA9PiB7XHJcbiAgZm9yKGNvbnN0IHR5cGUgb2YgdHlwZXMpIHtcclxuICAgIGNvbnN0IG9sZFZhbHVlID0gb3BlcmF0aW9uW3R5cGVdO1xyXG4gICAgb3BlcmF0aW9uW2BfJHt0eXBlfWBdID0gb2xkVmFsdWUgPT09IHVuZGVmaW5lZD8gMDogb2xkVmFsdWUgLyAxMDA7XHJcbiAgfVxyXG59KTtcclxuXHJcbmNvbnN0IGljb25BcnIgPSBbXTtcclxuXHJcbmZvcihjb25zdCBzY29yZSBvZiBzY29yZXMpIHtcclxuICBjb25zdCB7dHlwZSwgaWNvbn0gPSBzY29yZTtcclxuICBpY29uQXJyLnB1c2goe1xyXG4gICAgdHlwZSxcclxuICAgIGljb24sXHJcbiAgICBpY29uRmlsZTogJycsXHJcbiAgICBpY29uRGF0YTogJydcclxuICB9KTtcclxufVxyXG5cclxuY29uc3QgYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6ICcjYXBwJyxcclxuICBkYXRhOiB7XHJcbiAgICBzY29yZVNldHRpbmdzOiBkYXRhLnNjb3JlU2V0dGluZ3MsXHJcbiAgICBzY29yZXMsXHJcbiAgICB0eXBlcyxcclxuICAgIGljb25BcnIsXHJcbiAgICBzdWJtaXR0aW5nOiBmYWxzZSxcclxuICB9LFxyXG4gIGNvbXB1dGVkOiB7XHJcbiAgICBtYWluU2NvcmVTZWxlY3QoKSB7XHJcbiAgICAgIGNvbnN0IGFyciA9IFtdO1xyXG4gICAgICB0aGlzLnNjb3Jlcy5tYXAobiA9PiB7XHJcbiAgICAgICAgaWYoIW4uZW5hYmxlZCkgcmV0dXJuO1xyXG4gICAgICAgIGFyci5wdXNoKHtcclxuICAgICAgICAgIHR5cGU6IG4udHlwZSxcclxuICAgICAgICAgIG5hbWU6IG4ubmFtZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIGFycjtcclxuICAgIH0sXHJcbiAgICBjb21tb25TY29yZVNlbGVjdCgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMubWFpblNjb3JlU2VsZWN0O1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgZ2V0VXJsOiBOS0MubWV0aG9kcy50b29scy5nZXRVcmwsXHJcbiAgICBnZXRITVMsXHJcbiAgICBITVNUb051bWJlcixcclxuICAgIGNoZWNrU3RyaW5nOiBOS0MubWV0aG9kcy5jaGVja0RhdGEuY2hlY2tTdHJpbmcsXHJcbiAgICBjaGVja051bWJlcjogTktDLm1ldGhvZHMuY2hlY2tEYXRhLmNoZWNrTnVtYmVyLFxyXG4gICAgc2VsZWN0SWNvbihhKSB7XHJcbiAgICAgIHNlbGVjdEltYWdlLnNob3coYmxvYiA9PiB7XHJcbiAgICAgICAgY29uc3QgZmlsZSA9IE5LQy5tZXRob2RzLmJsb2JUb0ZpbGUoYmxvYik7XHJcbiAgICAgICAgTktDLm1ldGhvZHMuZmlsZVRvVXJsKGZpbGUpXHJcbiAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgYS5pY29uRGF0YSA9IGRhdGE7XHJcbiAgICAgICAgICAgIGEuaWNvbkZpbGUgPSBmaWxlO1xyXG4gICAgICAgICAgICBzZWxlY3RJbWFnZS5jbG9zZSgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0sIHtcclxuICAgICAgICBhc3BlY3RSYXRpbzogMVxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBzYXZlKCkge1xyXG4gICAgICBjb25zdCB7XHJcbiAgICAgICAgaWNvbkFyclxyXG4gICAgICB9ID0gdGhpcztcclxuICAgICAgY29uc3Qgc2NvcmVTZXR0aW5ncyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5zY29yZVNldHRpbmdzKSk7XHJcbiAgICAgIHNjb3JlU2V0dGluZ3Mud2l0aGRyYXdUaW1lQmVnaW4gPSBITVNUb051bWJlcihzY29yZVNldHRpbmdzLl93aXRoZHJhd1RpbWVCZWdpbik7XHJcbiAgICAgIHNjb3JlU2V0dGluZ3Mud2l0aGRyYXdUaW1lRW5kID0gSE1TVG9OdW1iZXIoc2NvcmVTZXR0aW5ncy5fd2l0aGRyYXdUaW1lRW5kKTtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgc2NvcmVTZXR0aW5ncy5vcGVyYXRpb25zLm1hcChvcGVyYXRpb24gPT4ge1xyXG4gICAgICAgICAgICBmb3IoY29uc3QgdHlwZSBvZiBzZWxmLnR5cGVzKSB7XHJcbiAgICAgICAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSBvcGVyYXRpb25bYF8ke3R5cGV9YF07XHJcbiAgICAgICAgICAgICAgc2VsZi5jaGVja051bWJlcihvbGRWYWx1ZSwge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ+enr+WIhuetlueVpeS4reWKoOWHj+eahOenr+WIhuWAvCcsXHJcbiAgICAgICAgICAgICAgICBmcmFjdGlvbkRpZ2l0czogMixcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBvcGVyYXRpb25bdHlwZV0gPSBwYXJzZUludChvbGRWYWx1ZSAqIDEwMCk7XHJcbiAgICAgICAgICAgICAgZGVsZXRlIG9wZXJhdGlvbltgXyR7dHlwZX1gXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgdGhpcy5jaGVja051bWJlcihzY29yZVNldHRpbmdzLl9jcmVkaXRNaW4sIHtcclxuICAgICAgICAgICAgbmFtZTogJ+acgOWwj+m8k+WKsemHkeminScsXHJcbiAgICAgICAgICAgIG1pbjogMC4wMSxcclxuICAgICAgICAgICAgZnJhY3Rpb25EaWdpdHM6IDJcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5jaGVja051bWJlcihzY29yZVNldHRpbmdzLl9jcmVkaXRNYXgsIHtcclxuICAgICAgICAgICAgbmFtZTogJ+acgOWkp+m8k+WKsemHkeminScsXHJcbiAgICAgICAgICAgIG1pbjogMC4wMSxcclxuICAgICAgICAgICAgZnJhY3Rpb25EaWdpdHM6IDJcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgaWYoc2NvcmVTZXR0aW5ncy5fY3JlZGl0TWluID4gc2NvcmVTZXR0aW5ncy5fY3JlZGl0TWF4KSB0aHJvdyAn6byT5Yqx6YeR6aKd6K6+572u6ZSZ6K+vJztcclxuICAgICAgICAgIHNjb3JlU2V0dGluZ3MuY3JlZGl0TWluID0gcGFyc2VJbnQoc2NvcmVTZXR0aW5ncy5fY3JlZGl0TWluICogMTAwKTtcclxuICAgICAgICAgIHNjb3JlU2V0dGluZ3MuY3JlZGl0TWF4ID0gcGFyc2VJbnQoc2NvcmVTZXR0aW5ncy5fY3JlZGl0TWF4ICogMTAwKTtcclxuICAgICAgICAgIGRlbGV0ZSBzY29yZVNldHRpbmdzLl9jcmVkaXRNaW47XHJcbiAgICAgICAgICBkZWxldGUgc2NvcmVTZXR0aW5ncy5fY3JlZGl0TWF4O1xyXG4gICAgICAgICAgZGVsZXRlIHNjb3JlU2V0dGluZ3MuX3dpdGhkcmF3VGltZUVuZDtcclxuICAgICAgICAgIGRlbGV0ZSBzY29yZVNldHRpbmdzLl93aXRoZHJhd1RpbWVCZWdpbjtcclxuICAgICAgICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ3Njb3JlU2V0dGluZ3MnLCBKU09OLnN0cmluZ2lmeShzY29yZVNldHRpbmdzKSk7XHJcbiAgICAgICAgICBmb3IoY29uc3QgaWNvbiBvZiBpY29uQXJyKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHtpY29uRmlsZSwgdHlwZX0gPSBpY29uO1xyXG4gICAgICAgICAgICBpZiAoIWljb25GaWxlKSBjb250aW51ZTtcclxuICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKHR5cGUsIGljb25GaWxlLCBpY29uRmlsZS5uYW1lKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBua2NVcGxvYWRGaWxlKCcvZS9zZXR0aW5ncy9zY29yZScsICdQVVQnLCBmb3JtRGF0YSlcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2Vzcygn5L+d5a2Y5oiQ5YqfJyk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgIHN3ZWV0RXJyb3IoZXJyKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gZ2V0SE1TKHQpIHtcclxuICByZXR1cm4ge1xyXG4gICAgaG91cjogTWF0aC5mbG9vcih0LzM2MDAwMDApLFxyXG4gICAgbWluOiBNYXRoLmZsb29yKHQvNjAwMDApICUgNjAsXHJcbiAgICBzZWM6IE1hdGguZmxvb3IodC8xMDAwKSAlIDYwXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBITVNUb051bWJlcih0KSB7XHJcbiAgcmV0dXJuIHQuaG91ciAqIDYwICogNjAgKiAxMDAwICsgdC5taW4gKiA2MCAqIDEwMDAgKyB0LnNlYyAqIDEwMDA7XHJcbn1cclxuIl19
