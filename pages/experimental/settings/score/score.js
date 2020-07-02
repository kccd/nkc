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
            formData.append(type, iconFile);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2V4cGVyaW1lbnRhbC9zZXR0aW5ncy9zY29yZS9zY29yZS5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiO0FBQ0EsSUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBSixDQUFZLFdBQWhCLEVBQXBCO0lBQ08sTSxHQUFVLElBQUksQ0FBQyxhLENBQWYsTTtBQUNQLElBQUksQ0FBQyxhQUFMLENBQW1CLGtCQUFuQixHQUF3QyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsaUJBQXBCLENBQTlDO0FBQ0EsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsZ0JBQW5CLEdBQXNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBTCxDQUFtQixlQUFwQixDQUE1QztBQUVBLElBQUksQ0FBQyxhQUFMLENBQW1CLFVBQW5CLEdBQWdDLElBQUksQ0FBQyxhQUFMLENBQW1CLFNBQW5CLEdBQStCLEdBQS9EO0FBQ0EsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsVUFBbkIsR0FBZ0MsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsU0FBbkIsR0FBK0IsR0FBL0Q7QUFFQSxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBbkI7QUFDQSxJQUFJLENBQUMsYUFBTCxDQUFtQixVQUFuQixDQUE4QixHQUE5QixDQUFrQyxVQUFBLFNBQVMsRUFBSTtBQUFBLDZDQUMzQixLQUQyQjtBQUFBOztBQUFBO0FBQzdDLHdEQUF5QjtBQUFBLFVBQWYsSUFBZTtBQUN2QixVQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsSUFBRCxDQUExQjtBQUNBLE1BQUEsU0FBUyxZQUFLLElBQUwsRUFBVCxHQUF3QixRQUFRLEtBQUssU0FBYixHQUF3QixDQUF4QixH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R0FBRyxFQUFFLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQyxHQUFDLEtBQWIsSUFBc0IsRUFGdEI7QUFHTCxJQUFBLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBTCxDQUFXLENBQUMsR0FBQyxJQUFiLElBQXFCO0FBSHJCLEdBQVA7QUFLRDs7QUFFRCxTQUFTLFdBQVQsQ0FBcUIsQ0FBckIsRUFBd0I7QUFDdEIsU0FBTyxDQUFDLENBQUMsSUFBRixHQUFTLEVBQVQsR0FBYyxFQUFkLEdBQW1CLElBQW5CLEdBQTBCLENBQUMsQ0FBQyxHQUFGLEdBQVEsRUFBUixHQUFhLElBQXZDLEdBQThDLENBQUMsQ0FBQyxHQUFGLEdBQVEsSUFBN0Q7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZCgnZGF0YScpO1xyXG5jb25zdCBzZWxlY3RJbWFnZSA9IG5ldyBOS0MubWV0aG9kcy5zZWxlY3RJbWFnZSgpO1xyXG5jb25zdCB7c2NvcmVzfSA9IGRhdGEuc2NvcmVTZXR0aW5ncztcclxuZGF0YS5zY29yZVNldHRpbmdzLl93aXRoZHJhd1RpbWVCZWdpbiA9IGdldEhNUyhkYXRhLnNjb3JlU2V0dGluZ3Mud2l0aGRyYXdUaW1lQmVnaW4pO1xyXG5kYXRhLnNjb3JlU2V0dGluZ3MuX3dpdGhkcmF3VGltZUVuZCA9IGdldEhNUyhkYXRhLnNjb3JlU2V0dGluZ3Mud2l0aGRyYXdUaW1lRW5kKTtcclxuXHJcbmRhdGEuc2NvcmVTZXR0aW5ncy5fY3JlZGl0TWluID0gZGF0YS5zY29yZVNldHRpbmdzLmNyZWRpdE1pbiAvIDEwMDtcclxuZGF0YS5zY29yZVNldHRpbmdzLl9jcmVkaXRNYXggPSBkYXRhLnNjb3JlU2V0dGluZ3MuY3JlZGl0TWF4IC8gMTAwO1xyXG5cclxuY29uc3QgdHlwZXMgPSBkYXRhLnNjb3Jlc1R5cGU7XHJcbmRhdGEuc2NvcmVTZXR0aW5ncy5vcGVyYXRpb25zLm1hcChvcGVyYXRpb24gPT4ge1xyXG4gIGZvcihjb25zdCB0eXBlIG9mIHR5cGVzKSB7XHJcbiAgICBjb25zdCBvbGRWYWx1ZSA9IG9wZXJhdGlvblt0eXBlXTtcclxuICAgIG9wZXJhdGlvbltgXyR7dHlwZX1gXSA9IG9sZFZhbHVlID09PSB1bmRlZmluZWQ/IDA6IG9sZFZhbHVlIC8gMTAwO1xyXG4gIH1cclxufSk7XHJcblxyXG5jb25zdCBpY29uQXJyID0gW107XHJcblxyXG5mb3IoY29uc3Qgc2NvcmUgb2Ygc2NvcmVzKSB7XHJcbiAgY29uc3Qge3R5cGUsIGljb259ID0gc2NvcmU7XHJcbiAgaWNvbkFyci5wdXNoKHtcclxuICAgIHR5cGUsXHJcbiAgICBpY29uLFxyXG4gICAgaWNvbkZpbGU6ICcnLFxyXG4gICAgaWNvbkRhdGE6ICcnXHJcbiAgfSk7XHJcbn1cclxuXHJcbmNvbnN0IGFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiAnI2FwcCcsXHJcbiAgZGF0YToge1xyXG4gICAgc2NvcmVTZXR0aW5nczogZGF0YS5zY29yZVNldHRpbmdzLFxyXG4gICAgc2NvcmVzLFxyXG4gICAgdHlwZXMsXHJcbiAgICBpY29uQXJyLFxyXG4gICAgc3VibWl0dGluZzogZmFsc2UsXHJcbiAgfSxcclxuICBjb21wdXRlZDoge1xyXG4gICAgbWFpblNjb3JlU2VsZWN0KCkge1xyXG4gICAgICBjb25zdCBhcnIgPSBbXTtcclxuICAgICAgdGhpcy5zY29yZXMubWFwKG4gPT4ge1xyXG4gICAgICAgIGlmKCFuLmVuYWJsZWQpIHJldHVybjtcclxuICAgICAgICBhcnIucHVzaCh7XHJcbiAgICAgICAgICB0eXBlOiBuLnR5cGUsXHJcbiAgICAgICAgICBuYW1lOiBuLm5hbWVcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBhcnI7XHJcbiAgICB9LFxyXG4gICAgY29tbW9uU2NvcmVTZWxlY3QoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLm1haW5TY29yZVNlbGVjdDtcclxuICAgIH1cclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgZ2V0SE1TLFxyXG4gICAgSE1TVG9OdW1iZXIsXHJcbiAgICBjaGVja1N0cmluZzogTktDLm1ldGhvZHMuY2hlY2tEYXRhLmNoZWNrU3RyaW5nLFxyXG4gICAgY2hlY2tOdW1iZXI6IE5LQy5tZXRob2RzLmNoZWNrRGF0YS5jaGVja051bWJlcixcclxuICAgIHNlbGVjdEljb24oYSkge1xyXG4gICAgICBzZWxlY3RJbWFnZS5zaG93KGJsb2IgPT4ge1xyXG4gICAgICAgIGNvbnN0IGZpbGUgPSBOS0MubWV0aG9kcy5ibG9iVG9GaWxlKGJsb2IpO1xyXG4gICAgICAgIE5LQy5tZXRob2RzLmZpbGVUb1VybChmaWxlKVxyXG4gICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgIGEuaWNvbkRhdGEgPSBkYXRhO1xyXG4gICAgICAgICAgICBhLmljb25GaWxlID0gZmlsZTtcclxuICAgICAgICAgICAgc2VsZWN0SW1hZ2UuY2xvc2UoKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9LCB7XHJcbiAgICAgICAgYXNwZWN0UmF0aW86IDFcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgc2F2ZSgpIHtcclxuICAgICAgY29uc3Qge1xyXG4gICAgICAgIGljb25BcnJcclxuICAgICAgfSA9IHRoaXM7XHJcbiAgICAgIGNvbnN0IHNjb3JlU2V0dGluZ3MgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuc2NvcmVTZXR0aW5ncykpO1xyXG4gICAgICBzY29yZVNldHRpbmdzLndpdGhkcmF3VGltZUJlZ2luID0gSE1TVG9OdW1iZXIoc2NvcmVTZXR0aW5ncy5fd2l0aGRyYXdUaW1lQmVnaW4pO1xyXG4gICAgICBzY29yZVNldHRpbmdzLndpdGhkcmF3VGltZUVuZCA9IEhNU1RvTnVtYmVyKHNjb3JlU2V0dGluZ3MuX3dpdGhkcmF3VGltZUVuZCk7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHNjb3JlU2V0dGluZ3Mub3BlcmF0aW9ucy5tYXAob3BlcmF0aW9uID0+IHtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IHR5cGUgb2Ygc2VsZi50eXBlcykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG9sZFZhbHVlID0gb3BlcmF0aW9uW2BfJHt0eXBlfWBdO1xyXG4gICAgICAgICAgICAgIHNlbGYuY2hlY2tOdW1iZXIob2xkVmFsdWUsIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICfnp6/liIbnrZbnlaXkuK3liqDlh4/nmoTnp6/liIblgLwnLFxyXG4gICAgICAgICAgICAgICAgZnJhY3Rpb25EaWdpdHM6IDIsXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgb3BlcmF0aW9uW3R5cGVdID0gcGFyc2VJbnQob2xkVmFsdWUgKiAxMDApO1xyXG4gICAgICAgICAgICAgIGRlbGV0ZSBvcGVyYXRpb25bYF8ke3R5cGV9YF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIHRoaXMuY2hlY2tOdW1iZXIoc2NvcmVTZXR0aW5ncy5fY3JlZGl0TWluLCB7XHJcbiAgICAgICAgICAgIG5hbWU6ICfmnIDlsI/pvJPlirHph5Hpop0nLFxyXG4gICAgICAgICAgICBtaW46IDAuMDEsXHJcbiAgICAgICAgICAgIGZyYWN0aW9uRGlnaXRzOiAyXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuY2hlY2tOdW1iZXIoc2NvcmVTZXR0aW5ncy5fY3JlZGl0TWF4LCB7XHJcbiAgICAgICAgICAgIG5hbWU6ICfmnIDlpKfpvJPlirHph5Hpop0nLFxyXG4gICAgICAgICAgICBtaW46IDAuMDEsXHJcbiAgICAgICAgICAgIGZyYWN0aW9uRGlnaXRzOiAyXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGlmKHNjb3JlU2V0dGluZ3MuX2NyZWRpdE1pbiA+IHNjb3JlU2V0dGluZ3MuX2NyZWRpdE1heCkgdGhyb3cgJ+m8k+WKsemHkemineiuvue9rumUmeivryc7XHJcbiAgICAgICAgICBzY29yZVNldHRpbmdzLmNyZWRpdE1pbiA9IHBhcnNlSW50KHNjb3JlU2V0dGluZ3MuX2NyZWRpdE1pbiAqIDEwMCk7XHJcbiAgICAgICAgICBzY29yZVNldHRpbmdzLmNyZWRpdE1heCA9IHBhcnNlSW50KHNjb3JlU2V0dGluZ3MuX2NyZWRpdE1heCAqIDEwMCk7XHJcbiAgICAgICAgICBkZWxldGUgc2NvcmVTZXR0aW5ncy5fY3JlZGl0TWluO1xyXG4gICAgICAgICAgZGVsZXRlIHNjb3JlU2V0dGluZ3MuX2NyZWRpdE1heDtcclxuICAgICAgICAgIGRlbGV0ZSBzY29yZVNldHRpbmdzLl93aXRoZHJhd1RpbWVFbmQ7XHJcbiAgICAgICAgICBkZWxldGUgc2NvcmVTZXR0aW5ncy5fd2l0aGRyYXdUaW1lQmVnaW47XHJcbiAgICAgICAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdzY29yZVNldHRpbmdzJywgSlNPTi5zdHJpbmdpZnkoc2NvcmVTZXR0aW5ncykpO1xyXG4gICAgICAgICAgZm9yKGNvbnN0IGljb24gb2YgaWNvbkFycikge1xyXG4gICAgICAgICAgICBjb25zdCB7aWNvbkZpbGUsIHR5cGV9ID0gaWNvbjtcclxuICAgICAgICAgICAgaWYgKCFpY29uRmlsZSkgY29udGludWU7XHJcbiAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCh0eXBlLCBpY29uRmlsZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gbmtjVXBsb2FkRmlsZSgnL2Uvc2V0dGluZ3Mvc2NvcmUnLCAnUEFUQ0gnLCBmb3JtRGF0YSlcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2Vzcygn5L+d5a2Y5oiQ5YqfJyk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgIHN3ZWV0RXJyb3IoZXJyKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuXHJcbmZ1bmN0aW9uIGdldEhNUyh0KSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGhvdXI6IE1hdGguZmxvb3IodC8zNjAwMDAwKSxcclxuICAgIG1pbjogTWF0aC5mbG9vcih0LzYwMDAwKSAlIDYwLFxyXG4gICAgc2VjOiBNYXRoLmZsb29yKHQvMTAwMCkgJSA2MFxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gSE1TVG9OdW1iZXIodCkge1xyXG4gIHJldHVybiB0LmhvdXIgKiA2MCAqIDYwICogMTAwMCArIHQubWluICogNjAgKiAxMDAwICsgdC5zZWMgKiAxMDAwO1xyXG59XHJcbiJdfQ==
