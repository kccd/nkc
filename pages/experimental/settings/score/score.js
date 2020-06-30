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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2V4cGVyaW1lbnRhbC9zZXR0aW5ncy9zY29yZS9zY29yZS5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiO0FBQ0EsSUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBSixDQUFZLFdBQWhCLEVBQXBCO0lBQ08sTSxHQUFVLElBQUksQ0FBQyxhLENBQWYsTTtBQUNQLElBQUksQ0FBQyxhQUFMLENBQW1CLGtCQUFuQixHQUF3QyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsaUJBQXBCLENBQTlDO0FBQ0EsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsZ0JBQW5CLEdBQXNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBTCxDQUFtQixlQUFwQixDQUE1QztBQUdBLElBQU0sT0FBTyxHQUFHLEVBQWhCO0FBRUEsSUFBTSxLQUFLLEdBQUcsQ0FDWixRQURZLEVBRVosUUFGWSxFQUdaLFFBSFksRUFJWixRQUpZLEVBS1osUUFMWSxDQUFkO0FBT0EsSUFBTSxPQUFPLEdBQUcsRUFBaEI7O0FBQ0EsMEJBQWtCLEtBQWxCLDRCQUF5QjtBQUFyQixNQUFNLElBQUksYUFBVjtBQUNGLE1BQUcsQ0FBQyxNQUFNLENBQUMsY0FBUCxDQUFzQixJQUF0QixDQUFKLEVBQWlDOztBQUNqQyxFQUFBLE9BQU8sQ0FBQyxJQUFSLENBQWEsTUFBTSxDQUFDLElBQUQsQ0FBbkI7O0FBRnVCLE1BSXJCLElBSnFCLEdBS25CLE1BQU0sQ0FBQyxJQUFELENBTGEsQ0FJckIsSUFKcUI7QUFNdkIsRUFBQSxPQUFPLENBQUMsSUFBUixDQUFhO0FBQ1gsSUFBQSxJQUFJLEVBQUosSUFEVztBQUVYLElBQUEsSUFBSSxFQUFKLElBRlc7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SSxDQUFDLFFBQUwsRUFBZTtBQUNmLFVBQUEsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsS0FBaEIsRUFBc0IsUUFBdEI7QUFDRDtBQWZJO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBZ0JMLE1BQUEsYUFBYSxDQUFDLG1CQUFELEVBQXNCLE9BQXRCLEVBQStCLFFBQS9CLENBQWIsQ0FDRyxJQURILENBQ1EsWUFBTTtBQUNWLFFBQUEsWUFBWSxDQUFDLE1BQUQsQ0FBWjtBQUNELE9BSEgsV0FJUyxVQUFBLEdBQUcsRUFBSTtBQUNaLFFBQUEsVUFBVSxDQUFDLEdBQUQsQ0FBVjtBQUNELE9BTkg7QUFPRDtBQTFDTTtBQXhCUyxDQUFSLENBQVo7O0FBdUVBLFNBQVMsTUFBVCxDQUFnQixDQUFoQixFQUFtQjtBQUNqQixTQUFPO0FBQ0wsSUFBQSxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFDLEdBQUMsT0FBYixDQUREO0FBRUwsSUFBQSxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFDLEdBQUMsS0FBYixJQUFzQixFQUZ0QjtBQUdMLElBQUEsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQyxHQUFDLElBQWIsSUFBcUI7QUFIckIsR0FBUDtBQUtEOztBQUVELFNBQVMsV0FBVCxDQUFxQixDQUFyQixFQUF3QjtBQUN0QixTQUFPLENBQUMsQ0FBQyxJQUFGLEdBQVMsRUFBVCxHQUFjLEVBQWQsR0FBbUIsSUFBbkIsR0FBMEIsQ0FBQyxDQUFDLEdBQUYsR0FBUSxFQUFSLEdBQWEsSUFBdkMsR0FBOEMsQ0FBQyxDQUFDLEdBQUYsR0FBUSxJQUE3RDtBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKCdkYXRhJyk7XHJcbmNvbnN0IHNlbGVjdEltYWdlID0gbmV3IE5LQy5tZXRob2RzLnNlbGVjdEltYWdlKCk7XHJcbmNvbnN0IHtzY29yZXN9ID0gZGF0YS5zY29yZVNldHRpbmdzO1xyXG5kYXRhLnNjb3JlU2V0dGluZ3MuX3dpdGhkcmF3VGltZUJlZ2luID0gZ2V0SE1TKGRhdGEuc2NvcmVTZXR0aW5ncy53aXRoZHJhd1RpbWVCZWdpbik7XHJcbmRhdGEuc2NvcmVTZXR0aW5ncy5fd2l0aGRyYXdUaW1lRW5kID0gZ2V0SE1TKGRhdGEuc2NvcmVTZXR0aW5ncy53aXRoZHJhd1RpbWVFbmQpO1xyXG5cclxuXHJcbmNvbnN0IGljb25BcnIgPSBbXTtcclxuXHJcbmNvbnN0IHR5cGVzID0gW1xyXG4gICdzY29yZTEnLFxyXG4gICdzY29yZTInLFxyXG4gICdzY29yZTMnLFxyXG4gICdzY29yZTQnLFxyXG4gICdzY29yZTUnXHJcbl07XHJcbmNvbnN0IF9zY29yZXMgPSBbXTtcclxuZm9yKGNvbnN0IHR5cGUgb2YgdHlwZXMpIHtcclxuICBpZighc2NvcmVzLmhhc093blByb3BlcnR5KHR5cGUpKSBjb250aW51ZTtcclxuICBfc2NvcmVzLnB1c2goc2NvcmVzW3R5cGVdKTtcclxuICBjb25zdCB7XHJcbiAgICBpY29uXHJcbiAgfSA9IHNjb3Jlc1t0eXBlXTtcclxuICBpY29uQXJyLnB1c2goe1xyXG4gICAgdHlwZSxcclxuICAgIGljb24sXHJcbiAgICBpY29uRmlsZTogJycsXHJcbiAgICBpY29uRGF0YTogJydcclxuICB9KTtcclxufVxyXG5cclxuY29uc3QgYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6ICcjYXBwJyxcclxuICBkYXRhOiB7XHJcbiAgICBzY29yZVNldHRpbmdzOiBkYXRhLnNjb3JlU2V0dGluZ3MsXHJcbiAgICBzY29yZXM6IF9zY29yZXMsXHJcbiAgICBpY29uQXJyLFxyXG4gICAgc3VibWl0dGluZzogZmFsc2UsXHJcbiAgfSxcclxuICBjb21wdXRlZDoge1xyXG4gICAgbWFpblNjb3JlU2VsZWN0KCkge1xyXG4gICAgICBjb25zdCBhcnIgPSBbXTtcclxuICAgICAgdGhpcy5zY29yZXMubWFwKG4gPT4ge1xyXG4gICAgICAgIGlmKCFuLmVuYWJsZWQpIHJldHVybjtcclxuICAgICAgICBhcnIucHVzaCh7XHJcbiAgICAgICAgICB0eXBlOiBuLnR5cGUsXHJcbiAgICAgICAgICBuYW1lOiBuLm5hbWVcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBhcnI7XHJcbiAgICB9LFxyXG4gICAgY29tbW9uU2NvcmVTZWxlY3QoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLm1haW5TY29yZVNlbGVjdDtcclxuICAgIH1cclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgZ2V0SE1TLFxyXG4gICAgSE1TVG9OdW1iZXIsXHJcbiAgICBjaGVja1N0cmluZzogTktDLm1ldGhvZHMuY2hlY2tEYXRhLmNoZWNrU3RyaW5nLFxyXG4gICAgY2hlY2tOdW1iZXI6IE5LQy5tZXRob2RzLmNoZWNrRGF0YS5jaGVja051bWJlcixcclxuICAgIHNlbGVjdEljb24oYSkge1xyXG4gICAgICBzZWxlY3RJbWFnZS5zaG93KGJsb2IgPT4ge1xyXG4gICAgICAgIGNvbnN0IGZpbGUgPSBOS0MubWV0aG9kcy5ibG9iVG9GaWxlKGJsb2IpO1xyXG4gICAgICAgIE5LQy5tZXRob2RzLmZpbGVUb1VybChmaWxlKVxyXG4gICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgIGEuaWNvbkRhdGEgPSBkYXRhO1xyXG4gICAgICAgICAgICBhLmljb25GaWxlID0gZmlsZTtcclxuICAgICAgICAgICAgc2VsZWN0SW1hZ2UuY2xvc2UoKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9LCB7XHJcbiAgICAgICAgYXNwZWN0UmF0aW86IDFcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgc2F2ZSgpIHtcclxuICAgICAgY29uc3Qge1xyXG4gICAgICAgIGljb25BcnJcclxuICAgICAgfSA9IHRoaXM7XHJcbiAgICAgIGNvbnN0IHNjb3JlU2V0dGluZ3MgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuc2NvcmVTZXR0aW5ncykpO1xyXG4gICAgICBzY29yZVNldHRpbmdzLndpdGhkcmF3VGltZUJlZ2luID0gSE1TVG9OdW1iZXIoc2NvcmVTZXR0aW5ncy5fd2l0aGRyYXdUaW1lQmVnaW4pO1xyXG4gICAgICBzY29yZVNldHRpbmdzLndpdGhkcmF3VGltZUVuZCA9IEhNU1RvTnVtYmVyKHNjb3JlU2V0dGluZ3MuX3dpdGhkcmF3VGltZUVuZCk7XHJcbiAgICAgIGRlbGV0ZSBzY29yZVNldHRpbmdzLl93aXRoZHJhd1RpbWVFbmQ7XHJcbiAgICAgIGRlbGV0ZSBzY29yZVNldHRpbmdzLl93aXRoZHJhd1RpbWVCZWdpbjtcclxuICAgICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuICAgICAgZm9ybURhdGEuYXBwZW5kKCdzY29yZVNldHRpbmdzJywgSlNPTi5zdHJpbmdpZnkoc2NvcmVTZXR0aW5ncykpO1xyXG4gICAgICBmb3IoY29uc3QgaWNvbiBvZiBpY29uQXJyKSB7XHJcbiAgICAgICAgY29uc3Qge2ljb25GaWxlLCB0eXBlfSA9IGljb247XHJcbiAgICAgICAgaWYgKCFpY29uRmlsZSkgY29udGludWU7XHJcbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKHR5cGUsIGljb25GaWxlKTtcclxuICAgICAgfVxyXG4gICAgICBua2NVcGxvYWRGaWxlKCcvZS9zZXR0aW5ncy9zY29yZScsICdQQVRDSCcsIGZvcm1EYXRhKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2Vzcygn5L+d5a2Y5oiQ5YqfJyk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgIHN3ZWV0RXJyb3IoZXJyKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuXHJcbmZ1bmN0aW9uIGdldEhNUyh0KSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGhvdXI6IE1hdGguZmxvb3IodC8zNjAwMDAwKSxcclxuICAgIG1pbjogTWF0aC5mbG9vcih0LzYwMDAwKSAlIDYwLFxyXG4gICAgc2VjOiBNYXRoLmZsb29yKHQvMTAwMCkgJSA2MFxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gSE1TVG9OdW1iZXIodCkge1xyXG4gIHJldHVybiB0LmhvdXIgKiA2MCAqIDYwICogMTAwMCArIHQubWluICogNjAgKiAxMDAwICsgdC5zZWMgKiAxMDAwO1xyXG59XHJcbiJdfQ==
