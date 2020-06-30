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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3Mvc2NvcmUvc2NvcmUubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLElBQU0sV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFoQixFQUFwQjtJQUNPLE0sR0FBVSxJQUFJLENBQUMsYSxDQUFmLE07QUFDUCxJQUFJLENBQUMsYUFBTCxDQUFtQixrQkFBbkIsR0FBd0MsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFMLENBQW1CLGlCQUFwQixDQUE5QztBQUNBLElBQUksQ0FBQyxhQUFMLENBQW1CLGdCQUFuQixHQUFzQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsZUFBcEIsQ0FBNUM7QUFFQSxJQUFJLENBQUMsYUFBTCxDQUFtQixVQUFuQixHQUFnQyxJQUFJLENBQUMsYUFBTCxDQUFtQixTQUFuQixHQUErQixHQUEvRDtBQUNBLElBQUksQ0FBQyxhQUFMLENBQW1CLFVBQW5CLEdBQWdDLElBQUksQ0FBQyxhQUFMLENBQW1CLFNBQW5CLEdBQStCLEdBQS9EO0FBRUEsSUFBTSxLQUFLLEdBQUcsQ0FDWixRQURZLEVBRVosUUFGWSxFQUdaLFFBSFksRUFJWixRQUpZLEVBS1osUUFMWSxDQUFkO0FBUUEsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsVUFBbkIsQ0FBOEIsR0FBOUIsQ0FBa0MsVUFBQSxTQUFTLEVBQUk7QUFBQSw2Q0FDM0IsS0FEMkI7QUFBQTs7QUFBQTtBQUM3Qyx3REFBeUI7QUFBQSxVQUFmLElBQWU7QUFDdkIsTUFBQSxTQUFTLFlBQUssSUFBTCxFQUFULEdBQXdCLFNBQVMsQ0FBQyxJQUFELENBQVQsR0FBa0IsR0FBMUM7QUFDRDtBQUg0QztBQUFBO0FB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LElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQyxHQUFDLEtBQWIsSUFBc0IsRUFGdEI7QUFHTCxJQUFBLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBTCxDQUFXLENBQUMsR0FBQyxJQUFiLElBQXFCO0FBSHJCLEdBQVA7QUFLRDs7QUFFRCxTQUFTLFdBQVQsQ0FBcUIsQ0FBckIsRUFBd0I7QUFDdEIsU0FBTyxDQUFDLENBQUMsSUFBRixHQUFTLEVBQVQsR0FBYyxFQUFkLEdBQW1CLElBQW5CLEdBQTBCLENBQUMsQ0FBQyxHQUFGLEdBQVEsRUFBUixHQUFhLElBQXZDLEdBQThDLENBQUMsQ0FBQyxHQUFGLEdBQVEsSUFBN0Q7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZCgnZGF0YScpO1xyXG5jb25zdCBzZWxlY3RJbWFnZSA9IG5ldyBOS0MubWV0aG9kcy5zZWxlY3RJbWFnZSgpO1xyXG5jb25zdCB7c2NvcmVzfSA9IGRhdGEuc2NvcmVTZXR0aW5ncztcclxuZGF0YS5zY29yZVNldHRpbmdzLl93aXRoZHJhd1RpbWVCZWdpbiA9IGdldEhNUyhkYXRhLnNjb3JlU2V0dGluZ3Mud2l0aGRyYXdUaW1lQmVnaW4pO1xyXG5kYXRhLnNjb3JlU2V0dGluZ3MuX3dpdGhkcmF3VGltZUVuZCA9IGdldEhNUyhkYXRhLnNjb3JlU2V0dGluZ3Mud2l0aGRyYXdUaW1lRW5kKTtcclxuXHJcbmRhdGEuc2NvcmVTZXR0aW5ncy5fY3JlZGl0TWluID0gZGF0YS5zY29yZVNldHRpbmdzLmNyZWRpdE1pbiAvIDEwMDtcclxuZGF0YS5zY29yZVNldHRpbmdzLl9jcmVkaXRNYXggPSBkYXRhLnNjb3JlU2V0dGluZ3MuY3JlZGl0TWF4IC8gMTAwO1xyXG5cclxuY29uc3QgdHlwZXMgPSBbXHJcbiAgJ3Njb3JlMScsXHJcbiAgJ3Njb3JlMicsXHJcbiAgJ3Njb3JlMycsXHJcbiAgJ3Njb3JlNCcsXHJcbiAgJ3Njb3JlNSdcclxuXTtcclxuXHJcbmRhdGEuc2NvcmVTZXR0aW5ncy5vcGVyYXRpb25zLm1hcChvcGVyYXRpb24gPT4ge1xyXG4gIGZvcihjb25zdCB0eXBlIG9mIHR5cGVzKSB7XHJcbiAgICBvcGVyYXRpb25bYF8ke3R5cGV9YF0gPSBvcGVyYXRpb25bdHlwZV0gLyAxMDA7XHJcbiAgfVxyXG59KTtcclxuXHJcbmNvbnN0IGljb25BcnIgPSBbXTtcclxuY29uc3QgX3Njb3JlcyA9IFtdO1xyXG5mb3IoY29uc3QgdHlwZSBvZiB0eXBlcykge1xyXG4gIGlmKCFzY29yZXMuaGFzT3duUHJvcGVydHkodHlwZSkpIGNvbnRpbnVlO1xyXG4gIF9zY29yZXMucHVzaChzY29yZXNbdHlwZV0pO1xyXG4gIGNvbnN0IHtcclxuICAgIGljb25cclxuICB9ID0gc2NvcmVzW3R5cGVdO1xyXG4gIGljb25BcnIucHVzaCh7XHJcbiAgICB0eXBlLFxyXG4gICAgaWNvbixcclxuICAgIGljb25GaWxlOiAnJyxcclxuICAgIGljb25EYXRhOiAnJ1xyXG4gIH0pO1xyXG59XHJcblxyXG5jb25zdCBhcHAgPSBuZXcgVnVlKHtcclxuICBlbDogJyNhcHAnLFxyXG4gIGRhdGE6IHtcclxuICAgIHNjb3JlU2V0dGluZ3M6IGRhdGEuc2NvcmVTZXR0aW5ncyxcclxuICAgIHNjb3JlczogX3Njb3JlcyxcclxuICAgIGljb25BcnIsXHJcbiAgICBzdWJtaXR0aW5nOiBmYWxzZSxcclxuICB9LFxyXG4gIGNvbXB1dGVkOiB7XHJcbiAgICBtYWluU2NvcmVTZWxlY3QoKSB7XHJcbiAgICAgIGNvbnN0IGFyciA9IFtdO1xyXG4gICAgICB0aGlzLnNjb3Jlcy5tYXAobiA9PiB7XHJcbiAgICAgICAgaWYoIW4uZW5hYmxlZCkgcmV0dXJuO1xyXG4gICAgICAgIGFyci5wdXNoKHtcclxuICAgICAgICAgIHR5cGU6IG4udHlwZSxcclxuICAgICAgICAgIG5hbWU6IG4ubmFtZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIGFycjtcclxuICAgIH0sXHJcbiAgICBjb21tb25TY29yZVNlbGVjdCgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMubWFpblNjb3JlU2VsZWN0O1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgZ2V0VXJsOiBOS0MubWV0aG9kcy50b29scy5nZXRVcmwsXHJcbiAgICBnZXRITVMsXHJcbiAgICBITVNUb051bWJlcixcclxuICAgIGNoZWNrU3RyaW5nOiBOS0MubWV0aG9kcy5jaGVja0RhdGEuY2hlY2tTdHJpbmcsXHJcbiAgICBjaGVja051bWJlcjogTktDLm1ldGhvZHMuY2hlY2tEYXRhLmNoZWNrTnVtYmVyLFxyXG4gICAgc2VsZWN0SWNvbihhKSB7XHJcbiAgICAgIHNlbGVjdEltYWdlLnNob3coYmxvYiA9PiB7XHJcbiAgICAgICAgY29uc3QgZmlsZSA9IE5LQy5tZXRob2RzLmJsb2JUb0ZpbGUoYmxvYik7XHJcbiAgICAgICAgTktDLm1ldGhvZHMuZmlsZVRvVXJsKGZpbGUpXHJcbiAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgYS5pY29uRGF0YSA9IGRhdGE7XHJcbiAgICAgICAgICAgIGEuaWNvbkZpbGUgPSBmaWxlO1xyXG4gICAgICAgICAgICBzZWxlY3RJbWFnZS5jbG9zZSgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0sIHtcclxuICAgICAgICBhc3BlY3RSYXRpbzogMVxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBzYXZlKCkge1xyXG4gICAgICBjb25zdCB7XHJcbiAgICAgICAgaWNvbkFyclxyXG4gICAgICB9ID0gdGhpcztcclxuICAgICAgY29uc3Qgc2NvcmVTZXR0aW5ncyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5zY29yZVNldHRpbmdzKSk7XHJcbiAgICAgIHNjb3JlU2V0dGluZ3Mud2l0aGRyYXdUaW1lQmVnaW4gPSBITVNUb051bWJlcihzY29yZVNldHRpbmdzLl93aXRoZHJhd1RpbWVCZWdpbik7XHJcbiAgICAgIHNjb3JlU2V0dGluZ3Mud2l0aGRyYXdUaW1lRW5kID0gSE1TVG9OdW1iZXIoc2NvcmVTZXR0aW5ncy5fd2l0aGRyYXdUaW1lRW5kKTtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgc2NvcmVTZXR0aW5ncy5vcGVyYXRpb25zLm1hcChvcGVyYXRpb24gPT4ge1xyXG4gICAgICAgICAgICBmb3IoY29uc3QgdHlwZSBvZiB0eXBlcykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG9sZFZhbHVlID0gb3BlcmF0aW9uW2BfJHt0eXBlfWBdO1xyXG4gICAgICAgICAgICAgIHNlbGYuY2hlY2tOdW1iZXIob2xkVmFsdWUsIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICfnp6/liIbnrZbnlaXkuK3liqDlh4/nmoTnp6/liIblgLwnLFxyXG4gICAgICAgICAgICAgICAgZnJhY3Rpb25EaWdpdHM6IDIsXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgb3BlcmF0aW9uW3R5cGVdID0gb2xkVmFsdWUgKiAxMDA7XHJcbiAgICAgICAgICAgICAgZGVsZXRlIG9wZXJhdGlvbltgXyR7dHlwZX1gXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgdGhpcy5jaGVja051bWJlcihzY29yZVNldHRpbmdzLl9jcmVkaXRNaW4sIHtcclxuICAgICAgICAgICAgbmFtZTogJ+acgOWwj+m8k+WKsemHkeminScsXHJcbiAgICAgICAgICAgIG1pbjogMC4wMSxcclxuICAgICAgICAgICAgZnJhY3Rpb25EaWdpdHM6IDJcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5jaGVja051bWJlcihzY29yZVNldHRpbmdzLl9jcmVkaXRNYXgsIHtcclxuICAgICAgICAgICAgbmFtZTogJ+acgOWkp+m8k+WKsemHkeminScsXHJcbiAgICAgICAgICAgIG1pbjogMC4wMSxcclxuICAgICAgICAgICAgZnJhY3Rpb25EaWdpdHM6IDJcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgaWYoc2NvcmVTZXR0aW5ncy5fY3JlZGl0TWluID4gc2NvcmVTZXR0aW5ncy5fY3JlZGl0TWF4KSB0aHJvdyAn6byT5Yqx6YeR6aKd6K6+572u6ZSZ6K+vJztcclxuICAgICAgICAgIHNjb3JlU2V0dGluZ3MuY3JlZGl0TWluID0gc2NvcmVTZXR0aW5ncy5fY3JlZGl0TWluICogMTAwO1xyXG4gICAgICAgICAgc2NvcmVTZXR0aW5ncy5jcmVkaXRNYXggPSBzY29yZVNldHRpbmdzLl9jcmVkaXRNYXggKiAxMDA7XHJcbiAgICAgICAgICBkZWxldGUgc2NvcmVTZXR0aW5ncy5fY3JlZGl0TWluO1xyXG4gICAgICAgICAgZGVsZXRlIHNjb3JlU2V0dGluZ3MuX2NyZWRpdE1heDtcclxuICAgICAgICAgIGRlbGV0ZSBzY29yZVNldHRpbmdzLl93aXRoZHJhd1RpbWVFbmQ7XHJcbiAgICAgICAgICBkZWxldGUgc2NvcmVTZXR0aW5ncy5fd2l0aGRyYXdUaW1lQmVnaW47XHJcbiAgICAgICAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdzY29yZVNldHRpbmdzJywgSlNPTi5zdHJpbmdpZnkoc2NvcmVTZXR0aW5ncykpO1xyXG4gICAgICAgICAgZm9yKGNvbnN0IGljb24gb2YgaWNvbkFycikge1xyXG4gICAgICAgICAgICBjb25zdCB7aWNvbkZpbGUsIHR5cGV9ID0gaWNvbjtcclxuICAgICAgICAgICAgaWYgKCFpY29uRmlsZSkgY29udGludWU7XHJcbiAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCh0eXBlLCBpY29uRmlsZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gbmtjVXBsb2FkRmlsZSgnL2Uvc2V0dGluZ3Mvc2NvcmUnLCAnUEFUQ0gnLCBmb3JtRGF0YSlcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2Vzcygn5L+d5a2Y5oiQ5YqfJyk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgIHN3ZWV0RXJyb3IoZXJyKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuXHJcbmZ1bmN0aW9uIGdldEhNUyh0KSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGhvdXI6IE1hdGguZmxvb3IodC8zNjAwMDAwKSxcclxuICAgIG1pbjogTWF0aC5mbG9vcih0LzYwMDAwKSAlIDYwLFxyXG4gICAgc2VjOiBNYXRoLmZsb29yKHQvMTAwMCkgJSA2MFxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gSE1TVG9OdW1iZXIodCkge1xyXG4gIHJldHVybiB0LmhvdXIgKiA2MCAqIDYwICogMTAwMCArIHQubWluICogNjAgKiAxMDAwICsgdC5zZWMgKiAxMDAwO1xyXG59XHJcbiJdfQ==
