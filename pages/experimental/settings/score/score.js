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
var iconArr = [];
var types = ['score1', 'score2', 'score3', 'score4', 'score5'];
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
      var iconArr = this.iconArr;
      var scoreSettings = JSON.parse(JSON.stringify(this.scoreSettings));
      scoreSettings.withdrawTimeBegin = HMSToNumber(scoreSettings._withdrawTimeBegin);
      scoreSettings.withdrawTimeEnd = HMSToNumber(scoreSettings._withdrawTimeEnd);
      delete scoreSettings._withdrawTimeEnd;
      delete scoreSettings._withdrawTimeBegin;
      var formData = new FormData();
      formData.append('scoreSettings', JSON.stringify(scoreSettings));

      var _iterator = _createForOfIteratorHelper(iconArr),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _icon = _step.value;
          var iconFile = _icon.iconFile,
              _type = _icon.type;
          if (!iconFile) continue;
          formData.append(_type, iconFile);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      nkcUploadFile('/e/settings/score', 'PATCH', formData).then(function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3Mvc2NvcmUvc2NvcmUubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLElBQU0sV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFoQixFQUFwQjtJQUNPLE0sR0FBVSxJQUFJLENBQUMsYSxDQUFmLE07QUFDUCxJQUFJLENBQUMsYUFBTCxDQUFtQixrQkFBbkIsR0FBd0MsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFMLENBQW1CLGlCQUFwQixDQUE5QztBQUNBLElBQUksQ0FBQyxhQUFMLENBQW1CLGdCQUFuQixHQUFzQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsZUFBcEIsQ0FBNUM7QUFHQSxJQUFNLE9BQU8sR0FBRyxFQUFoQjtBQUVBLElBQU0sS0FBSyxHQUFHLENBQ1osUUFEWSxFQUVaLFFBRlksRUFHWixRQUhZLEVBSVosUUFKWSxFQUtaLFFBTFksQ0FBZDtBQU9BLElBQU0sT0FBTyxHQUFHLEVBQWhCOztBQUNBLDBCQUFrQixLQUFsQiw0QkFBeUI7QUFBckIsTUFBTSxJQUFJLGFBQVY7QUFDRixNQUFHLENBQUMsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsSUFBdEIsQ0FBSixFQUFpQzs7QUFDakMsRUFBQSxPQUFPLENBQUMsSUFBUixDQUFhLE1BQU0sQ0FBQyxJQUFELENBQW5COztBQUZ1QixNQUlyQixJQUpxQixHQUtuQixNQUFNLENBQUMsSUFBRCxDQUxhLENBSXJCLElBSnFCO0FBTXZCLEVBQUEsT0FBTyxDQUFDLElBQVIsQ0FBYTtBQUNYLElBQUEsSUFBSSxFQUFKLElBRFc7QUFFWCxJQUFBLElBQUksRUFBSixJQUZXO0FBR1gsSUFBQSxRQUFRLEVBQUUs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ZixVQUFBLFFBQVEsQ0FBQyxNQUFULENBQWdCLEtBQWhCLEVBQXNCLFFBQXRCO0FBQ0Q7QUFmSTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQWdCTCxNQUFBLGFBQWEsQ0FBQyxtQkFBRCxFQUFzQixPQUF0QixFQUErQixRQUEvQixDQUFiLENBQ0csSUFESCxDQUNRLFlBQU07QUFDVixRQUFBLFlBQVksQ0FBQyxNQUFELENBQVo7QUFDRCxPQUhILFdBSVMsVUFBQSxHQUFHLEVBQUk7QUFDWixRQUFBLFVBQVUsQ0FBQyxHQUFELENBQVY7QUFDRCxPQU5IO0FBT0Q7QUExQ007QUF4QlMsQ0FBUixDQUFaOztBQXVFQSxTQUFTLE1BQVQsQ0FBZ0IsQ0FBaEIsRUFBbUI7QUFDakIsU0FBTztBQUNMLElBQUEsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQyxHQUFDLE9BQWIsQ0FERDtBQUVMLElBQUEsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQyxHQUFDLEtBQWIsSUFBc0IsRUFGdEI7QUFHTCxJQUFBLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBTCxDQUFXLENBQUMsR0FBQyxJQUFiLElBQXFCO0FBSHJCLEdBQVA7QUFLRDs7QUFFRCxTQUFTLFdBQVQsQ0FBcUIsQ0FBckIsRUFBd0I7QUFDdEIsU0FBTyxDQUFDLENBQUMsSUFBRixHQUFTLEVBQVQsR0FBYyxFQUFkLEdBQW1CLElBQW5CLEdBQTBCLENBQUMsQ0FBQyxHQUFGLEdBQVEsRUFBUixHQUFhLElBQXZDLEdBQThDLENBQUMsQ0FBQyxHQUFGLEdBQVEsSUFBN0Q7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZCgnZGF0YScpO1xyXG5jb25zdCBzZWxlY3RJbWFnZSA9IG5ldyBOS0MubWV0aG9kcy5zZWxlY3RJbWFnZSgpO1xyXG5jb25zdCB7c2NvcmVzfSA9IGRhdGEuc2NvcmVTZXR0aW5ncztcclxuZGF0YS5zY29yZVNldHRpbmdzLl93aXRoZHJhd1RpbWVCZWdpbiA9IGdldEhNUyhkYXRhLnNjb3JlU2V0dGluZ3Mud2l0aGRyYXdUaW1lQmVnaW4pO1xyXG5kYXRhLnNjb3JlU2V0dGluZ3MuX3dpdGhkcmF3VGltZUVuZCA9IGdldEhNUyhkYXRhLnNjb3JlU2V0dGluZ3Mud2l0aGRyYXdUaW1lRW5kKTtcclxuXHJcblxyXG5jb25zdCBpY29uQXJyID0gW107XHJcblxyXG5jb25zdCB0eXBlcyA9IFtcclxuICAnc2NvcmUxJyxcclxuICAnc2NvcmUyJyxcclxuICAnc2NvcmUzJyxcclxuICAnc2NvcmU0JyxcclxuICAnc2NvcmU1J1xyXG5dO1xyXG5jb25zdCBfc2NvcmVzID0gW107XHJcbmZvcihjb25zdCB0eXBlIG9mIHR5cGVzKSB7XHJcbiAgaWYoIXNjb3Jlcy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgY29udGludWU7XHJcbiAgX3Njb3Jlcy5wdXNoKHNjb3Jlc1t0eXBlXSk7XHJcbiAgY29uc3Qge1xyXG4gICAgaWNvblxyXG4gIH0gPSBzY29yZXNbdHlwZV07XHJcbiAgaWNvbkFyci5wdXNoKHtcclxuICAgIHR5cGUsXHJcbiAgICBpY29uLFxyXG4gICAgaWNvbkZpbGU6ICcnLFxyXG4gICAgaWNvbkRhdGE6ICcnXHJcbiAgfSk7XHJcbn1cclxuXHJcbmNvbnN0IGFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiAnI2FwcCcsXHJcbiAgZGF0YToge1xyXG4gICAgc2NvcmVTZXR0aW5nczogZGF0YS5zY29yZVNldHRpbmdzLFxyXG4gICAgc2NvcmVzOiBfc2NvcmVzLFxyXG4gICAgaWNvbkFycixcclxuICAgIHN1Ym1pdHRpbmc6IGZhbHNlLFxyXG4gIH0sXHJcbiAgY29tcHV0ZWQ6IHtcclxuICAgIG1haW5TY29yZVNlbGVjdCgpIHtcclxuICAgICAgY29uc3QgYXJyID0gW107XHJcbiAgICAgIHRoaXMuc2NvcmVzLm1hcChuID0+IHtcclxuICAgICAgICBpZighbi5lbmFibGVkKSByZXR1cm47XHJcbiAgICAgICAgYXJyLnB1c2goe1xyXG4gICAgICAgICAgdHlwZTogbi50eXBlLFxyXG4gICAgICAgICAgbmFtZTogbi5uYW1lXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gYXJyO1xyXG4gICAgfSxcclxuICAgIGNvbW1vblNjb3JlU2VsZWN0KCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5tYWluU2NvcmVTZWxlY3Q7XHJcbiAgICB9XHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgIGdldEhNUyxcclxuICAgIEhNU1RvTnVtYmVyLFxyXG4gICAgY2hlY2tTdHJpbmc6IE5LQy5tZXRob2RzLmNoZWNrRGF0YS5jaGVja1N0cmluZyxcclxuICAgIGNoZWNrTnVtYmVyOiBOS0MubWV0aG9kcy5jaGVja0RhdGEuY2hlY2tOdW1iZXIsXHJcbiAgICBzZWxlY3RJY29uKGEpIHtcclxuICAgICAgc2VsZWN0SW1hZ2Uuc2hvdyhibG9iID0+IHtcclxuICAgICAgICBjb25zdCBmaWxlID0gTktDLm1ldGhvZHMuYmxvYlRvRmlsZShibG9iKTtcclxuICAgICAgICBOS0MubWV0aG9kcy5maWxlVG9VcmwoZmlsZSlcclxuICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICBhLmljb25EYXRhID0gZGF0YTtcclxuICAgICAgICAgICAgYS5pY29uRmlsZSA9IGZpbGU7XHJcbiAgICAgICAgICAgIHNlbGVjdEltYWdlLmNsb3NlKCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSwge1xyXG4gICAgICAgIGFzcGVjdFJhdGlvOiAxXHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHNhdmUoKSB7XHJcbiAgICAgIGNvbnN0IHtcclxuICAgICAgICBpY29uQXJyXHJcbiAgICAgIH0gPSB0aGlzO1xyXG4gICAgICBjb25zdCBzY29yZVNldHRpbmdzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnNjb3JlU2V0dGluZ3MpKTtcclxuICAgICAgc2NvcmVTZXR0aW5ncy53aXRoZHJhd1RpbWVCZWdpbiA9IEhNU1RvTnVtYmVyKHNjb3JlU2V0dGluZ3MuX3dpdGhkcmF3VGltZUJlZ2luKTtcclxuICAgICAgc2NvcmVTZXR0aW5ncy53aXRoZHJhd1RpbWVFbmQgPSBITVNUb051bWJlcihzY29yZVNldHRpbmdzLl93aXRoZHJhd1RpbWVFbmQpO1xyXG4gICAgICBkZWxldGUgc2NvcmVTZXR0aW5ncy5fd2l0aGRyYXdUaW1lRW5kO1xyXG4gICAgICBkZWxldGUgc2NvcmVTZXR0aW5ncy5fd2l0aGRyYXdUaW1lQmVnaW47XHJcbiAgICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgIGZvcm1EYXRhLmFwcGVuZCgnc2NvcmVTZXR0aW5ncycsIEpTT04uc3RyaW5naWZ5KHNjb3JlU2V0dGluZ3MpKTtcclxuICAgICAgZm9yKGNvbnN0IGljb24gb2YgaWNvbkFycikge1xyXG4gICAgICAgIGNvbnN0IHtpY29uRmlsZSwgdHlwZX0gPSBpY29uO1xyXG4gICAgICAgIGlmICghaWNvbkZpbGUpIGNvbnRpbnVlO1xyXG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZCh0eXBlLCBpY29uRmlsZSk7XHJcbiAgICAgIH1cclxuICAgICAgbmtjVXBsb2FkRmlsZSgnL2Uvc2V0dGluZ3Mvc2NvcmUnLCAnUEFUQ0gnLCBmb3JtRGF0YSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoJ+S/neWtmOaIkOWKnycpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICBzd2VldEVycm9yKGVycik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcblxyXG5mdW5jdGlvbiBnZXRITVModCkge1xyXG4gIHJldHVybiB7XHJcbiAgICBob3VyOiBNYXRoLmZsb29yKHQvMzYwMDAwMCksXHJcbiAgICBtaW46IE1hdGguZmxvb3IodC82MDAwMCkgJSA2MCxcclxuICAgIHNlYzogTWF0aC5mbG9vcih0LzEwMDApICUgNjBcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEhNU1RvTnVtYmVyKHQpIHtcclxuICByZXR1cm4gdC5ob3VyICogNjAgKiA2MCAqIDEwMDAgKyB0Lm1pbiAqIDYwICogMTAwMCArIHQuc2VjICogMTAwMDtcclxufVxyXG4iXX0=
