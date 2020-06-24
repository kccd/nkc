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
var arr = [];
var typeArr = [];
var nameArr = [];
var iconArr = [];
var unitArr = [];
var weightArr = [];
var m2sArr = [];
var s2mArr = [];
var s2oArr = [];
var o2sArr = [];
var types = ['score1', 'score2', 'score3', 'score4', 'score5'];

for (var _i = 0, _types = types; _i < _types.length; _i++) {
  var type = _types[_i];
  if (!scores.hasOwnProperty(type)) continue;
  var _scores$type = scores[type],
      enabled = _scores$type.enabled,
      name = _scores$type.name,
      icon = _scores$type.icon,
      unit = _scores$type.unit,
      money2score = _scores$type.money2score,
      score2other = _scores$type.score2other,
      other2score = _scores$type.other2score,
      score2money = _scores$type.score2money,
      weight = _scores$type.weight;
  typeArr.push({
    type: type,
    enabled: enabled
  });
  nameArr.push({
    type: type,
    name: name
  });
  iconArr.push({
    type: type,
    icon: icon,
    iconFile: '',
    iconData: ''
  });
  unitArr.push({
    type: type,
    unit: unit
  });
  weightArr.push({
    type: type,
    weight: weight
  });
  m2sArr.push({
    type: type,
    money2score: money2score
  });
  s2mArr.push({
    type: type,
    score2money: score2money
  });
  s2oArr.push({
    type: type,
    score2other: score2other
  });
  o2sArr.push({
    type: type,
    other2score: other2score
  });
}

var app = new Vue({
  el: '#app',
  data: {
    scoreSettings: data.scoreSettings,
    typeArr: typeArr,
    nameArr: nameArr,
    iconArr: iconArr,
    unitArr: unitArr,
    weightArr: weightArr,
    m2sArr: m2sArr,
    s2mArr: s2mArr,
    s2oArr: s2oArr,
    o2sArr: o2sArr,
    submitting: false
  },
  computed: {
    mainScoreSelect: function mainScoreSelect() {
      var arr = [{
        type: '',
        name: '无'
      }];
      this.nameArr.map(function (n) {
        arr.push({
          type: n.type,
          name: n.name
        });
      });
      return arr;
    },
    commonScoreSelect: function commonScoreSelect() {
      var arr = [{
        type: '',
        name: '无'
      }, {
        type: 'mainScore',
        name: '交易积分'
      }];
      this.nameArr.map(function (n) {
        arr.push({
          type: n.type,
          name: n.name
        });
      });
      return arr;
    }
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    getHMS: getHMS,
    HMSToNumber: HMSToNumber,
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
      var typeArr = this.typeArr,
          nameArr = this.nameArr,
          iconArr = this.iconArr,
          unitArr = this.unitArr,
          weightArr = this.weightArr,
          m2sArr = this.m2sArr,
          s2mArr = this.s2mArr,
          s2oArr = this.s2oArr,
          o2sArr = this.o2sArr;
      var scoreSettings = JSON.parse(JSON.stringify(this.scoreSettings));
      var scoresObj = scoreSettings.scores;
      typeArr.map(function (_ref) {
        var type = _ref.type,
            enabled = _ref.enabled;
        scoresObj[type].enabled = enabled;
      });
      nameArr.map(function (_ref2) {
        var type = _ref2.type,
            name = _ref2.name;
        scoresObj[type].name = name;
      });
      unitArr.map(function (_ref3) {
        var type = _ref3.type,
            unit = _ref3.unit;
        scoresObj[type].unit = unit;
      });
      weightArr.map(function (_ref4) {
        var type = _ref4.type,
            weight = _ref4.weight;
        scoresObj[type].weight = weight;
      });
      m2sArr.map(function (_ref5) {
        var type = _ref5.type,
            money2score = _ref5.money2score;
        scoresObj[type].money2score = money2score;
      });
      s2mArr.map(function (_ref6) {
        var type = _ref6.type,
            score2money = _ref6.score2money;
        scoresObj[type].score2money = score2money;
      });
      s2oArr.map(function (_ref7) {
        var type = _ref7.type,
            score2other = _ref7.score2other;
        scoresObj[type].score2other = score2other;
      });
      o2sArr.map(function (_ref8) {
        var type = _ref8.type,
            other2score = _ref8.other2score;
        scoresObj[type].other2score = other2score;
      });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3Mvc2NvcmUvc2NvcmUubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLElBQU0sV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFoQixFQUFwQjtJQUNPLE0sR0FBVSxJQUFJLENBQUMsYSxDQUFmLE07QUFDUCxJQUFJLENBQUMsYUFBTCxDQUFtQixrQkFBbkIsR0FBd0MsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFMLENBQW1CLGlCQUFwQixDQUE5QztBQUNBLElBQUksQ0FBQyxhQUFMLENBQW1CLGdCQUFuQixHQUFzQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsZUFBcEIsQ0FBNUM7QUFFQSxJQUFNLEdBQUcsR0FBRyxFQUFaO0FBQ0EsSUFBTSxPQUFPLEdBQUcsRUFBaEI7QUFDQSxJQUFNLE9BQU8sR0FBRyxFQUFoQjtBQUNBLElBQU0sT0FBTyxHQUFHLEVBQWhCO0FBQ0EsSUFBTSxPQUFPLEdBQUcsRUFBaEI7QUFDQSxJQUFNLFNBQVMsR0FBRyxFQUFsQjtBQUNBLElBQU0sTUFBTSxHQUFHLEVBQWY7QUFDQSxJQUFNLE1BQU0sR0FBRyxFQUFmO0FBQ0EsSUFBTSxNQUFNLEdBQUcsRUFBZjtBQUNBLElBQU0sTUFBTSxHQUFHLEVBQWY7QUFFQSxJQUFNLEtBQUssR0FBRyxDQUNaLFFBRFksRUFFWixRQUZZLEVBR1osUUFIWSxFQUlaLFFBSlksRUFLWixRQUxZLENBQWQ7O0FBUUEsMEJBQWtCLEtBQWxCLDRCQUF5QjtBQUFyQixNQUFNLElBQUksYUFBVjtBQUNGLE1BQUcsQ0FBQyxNQUFNLENBQUMsY0FBUCxDQUFzQixJQUF0QixDQUFKLEVBQWlDO0FBRFYscUJB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QixDQUFyQixFQUF3QjtBQUN0QixTQUFPLENBQUMsQ0FBQyxJQUFGLEdBQVMsRUFBVCxHQUFjLEVBQWQsR0FBbUIsSUFBbkIsR0FBMEIsQ0FBQyxDQUFDLEdBQUYsR0FBUSxFQUFSLEdBQWEsSUFBdkMsR0FBOEMsQ0FBQyxDQUFDLEdBQUYsR0FBUSxJQUE3RDtBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKCdkYXRhJyk7XHJcbmNvbnN0IHNlbGVjdEltYWdlID0gbmV3IE5LQy5tZXRob2RzLnNlbGVjdEltYWdlKCk7XHJcbmNvbnN0IHtzY29yZXN9ID0gZGF0YS5zY29yZVNldHRpbmdzO1xyXG5kYXRhLnNjb3JlU2V0dGluZ3MuX3dpdGhkcmF3VGltZUJlZ2luID0gZ2V0SE1TKGRhdGEuc2NvcmVTZXR0aW5ncy53aXRoZHJhd1RpbWVCZWdpbik7XHJcbmRhdGEuc2NvcmVTZXR0aW5ncy5fd2l0aGRyYXdUaW1lRW5kID0gZ2V0SE1TKGRhdGEuc2NvcmVTZXR0aW5ncy53aXRoZHJhd1RpbWVFbmQpO1xyXG5cclxuY29uc3QgYXJyID0gW107XHJcbmNvbnN0IHR5cGVBcnIgPSBbXTtcclxuY29uc3QgbmFtZUFyciA9IFtdO1xyXG5jb25zdCBpY29uQXJyID0gW107XHJcbmNvbnN0IHVuaXRBcnIgPSBbXTtcclxuY29uc3Qgd2VpZ2h0QXJyID0gW107XHJcbmNvbnN0IG0yc0FyciA9IFtdO1xyXG5jb25zdCBzMm1BcnIgPSBbXTtcclxuY29uc3QgczJvQXJyID0gW107XHJcbmNvbnN0IG8yc0FyciA9IFtdO1xyXG5cclxuY29uc3QgdHlwZXMgPSBbXHJcbiAgJ3Njb3JlMScsXHJcbiAgJ3Njb3JlMicsXHJcbiAgJ3Njb3JlMycsXHJcbiAgJ3Njb3JlNCcsXHJcbiAgJ3Njb3JlNSdcclxuXTtcclxuXHJcbmZvcihjb25zdCB0eXBlIG9mIHR5cGVzKSB7XHJcbiAgaWYoIXNjb3Jlcy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgY29udGludWU7XHJcbiAgY29uc3Qge1xyXG4gICAgZW5hYmxlZCwgbmFtZSwgaWNvbiwgdW5pdCxcclxuICAgIG1vbmV5MnNjb3JlLCBzY29yZTJvdGhlciwgb3RoZXIyc2NvcmUsIHNjb3JlMm1vbmV5LFxyXG4gICAgd2VpZ2h0XHJcbiAgfSA9IHNjb3Jlc1t0eXBlXTtcclxuICB0eXBlQXJyLnB1c2goe1xyXG4gICAgdHlwZSxcclxuICAgIGVuYWJsZWQsXHJcbiAgfSk7XHJcbiAgbmFtZUFyci5wdXNoKHtcclxuICAgIHR5cGUsXHJcbiAgICBuYW1lLFxyXG4gIH0pO1xyXG4gIGljb25BcnIucHVzaCh7XHJcbiAgICB0eXBlLFxyXG4gICAgaWNvbixcclxuICAgIGljb25GaWxlOiAnJyxcclxuICAgIGljb25EYXRhOiAnJ1xyXG4gIH0pO1xyXG4gIHVuaXRBcnIucHVzaCh7XHJcbiAgICB0eXBlLFxyXG4gICAgdW5pdFxyXG4gIH0pO1xyXG4gIHdlaWdodEFyci5wdXNoKHtcclxuICAgIHR5cGUsXHJcbiAgICB3ZWlnaHRcclxuICB9KTtcclxuICBtMnNBcnIucHVzaCh7XHJcbiAgICB0eXBlLFxyXG4gICAgbW9uZXkyc2NvcmVcclxuICB9KTtcclxuICBzMm1BcnIucHVzaCh7XHJcbiAgICB0eXBlLFxyXG4gICAgc2NvcmUybW9uZXlcclxuICB9KTtcclxuICBzMm9BcnIucHVzaCh7XHJcbiAgICB0eXBlLFxyXG4gICAgc2NvcmUyb3RoZXJcclxuICB9KTtcclxuICBvMnNBcnIucHVzaCh7XHJcbiAgICB0eXBlLFxyXG4gICAgb3RoZXIyc2NvcmVcclxuICB9KTtcclxufVxyXG5cclxuY29uc3QgYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6ICcjYXBwJyxcclxuICBkYXRhOiB7XHJcbiAgICBzY29yZVNldHRpbmdzOiBkYXRhLnNjb3JlU2V0dGluZ3MsXHJcbiAgICB0eXBlQXJyLFxyXG4gICAgbmFtZUFycixcclxuICAgIGljb25BcnIsXHJcbiAgICB1bml0QXJyLFxyXG4gICAgd2VpZ2h0QXJyLFxyXG4gICAgbTJzQXJyLFxyXG4gICAgczJtQXJyLFxyXG4gICAgczJvQXJyLFxyXG4gICAgbzJzQXJyLFxyXG5cclxuICAgIHN1Ym1pdHRpbmc6IGZhbHNlLFxyXG4gIH0sXHJcbiAgY29tcHV0ZWQ6IHtcclxuICAgIG1haW5TY29yZVNlbGVjdCgpIHtcclxuICAgICAgY29uc3QgYXJyID0gW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHR5cGU6ICcnLFxyXG4gICAgICAgICAgbmFtZTogJ+aXoCdcclxuICAgICAgICB9XHJcbiAgICAgIF07XHJcbiAgICAgIHRoaXMubmFtZUFyci5tYXAobiA9PiB7XHJcbiAgICAgICAgYXJyLnB1c2goe1xyXG4gICAgICAgICAgdHlwZTogbi50eXBlLFxyXG4gICAgICAgICAgbmFtZTogbi5uYW1lXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gYXJyO1xyXG4gICAgfSxcclxuICAgIGNvbW1vblNjb3JlU2VsZWN0KCkge1xyXG4gICAgICBjb25zdCBhcnIgPSBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdHlwZTogJycsXHJcbiAgICAgICAgICBuYW1lOiAn5pegJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdHlwZTogJ21haW5TY29yZScsXHJcbiAgICAgICAgICBuYW1lOiAn5Lqk5piT56ev5YiGJ1xyXG4gICAgICAgIH1cclxuICAgICAgXTtcclxuICAgICAgdGhpcy5uYW1lQXJyLm1hcChuID0+IHtcclxuICAgICAgICBhcnIucHVzaCh7XHJcbiAgICAgICAgICB0eXBlOiBuLnR5cGUsXHJcbiAgICAgICAgICBuYW1lOiBuLm5hbWVcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBhcnI7XHJcbiAgICB9XHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgIGdldEhNUyxcclxuICAgIEhNU1RvTnVtYmVyLFxyXG4gICAgc2VsZWN0SWNvbihhKSB7XHJcbiAgICAgIHNlbGVjdEltYWdlLnNob3coYmxvYiA9PiB7XHJcbiAgICAgICAgY29uc3QgZmlsZSA9IE5LQy5tZXRob2RzLmJsb2JUb0ZpbGUoYmxvYik7XHJcbiAgICAgICAgTktDLm1ldGhvZHMuZmlsZVRvVXJsKGZpbGUpXHJcbiAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgYS5pY29uRGF0YSA9IGRhdGE7XHJcbiAgICAgICAgICAgIGEuaWNvbkZpbGUgPSBmaWxlO1xyXG4gICAgICAgICAgICBzZWxlY3RJbWFnZS5jbG9zZSgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0sIHtcclxuICAgICAgICBhc3BlY3RSYXRpbzogMVxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBzYXZlKCkge1xyXG4gICAgICBjb25zdCB7XHJcbiAgICAgICAgdHlwZUFyciwgbmFtZUFyciwgaWNvbkFyciwgdW5pdEFycixcclxuICAgICAgICB3ZWlnaHRBcnIsIG0yc0FyciwgczJtQXJyLCBzMm9BcnIsIG8yc0FyclxyXG4gICAgICB9ID0gdGhpcztcclxuICAgICAgY29uc3Qgc2NvcmVTZXR0aW5ncyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5zY29yZVNldHRpbmdzKSk7XHJcbiAgICAgIGNvbnN0IHNjb3Jlc09iaiA9IHNjb3JlU2V0dGluZ3Muc2NvcmVzO1xyXG4gICAgICB0eXBlQXJyLm1hcCgoe3R5cGUsIGVuYWJsZWR9KSA9PiB7XHJcbiAgICAgICAgc2NvcmVzT2JqW3R5cGVdLmVuYWJsZWQgPSBlbmFibGVkO1xyXG4gICAgICB9KTtcclxuICAgICAgbmFtZUFyci5tYXAoKHt0eXBlLCBuYW1lfSkgPT4ge1xyXG4gICAgICAgIHNjb3Jlc09ialt0eXBlXS5uYW1lID0gbmFtZTtcclxuICAgICAgfSk7XHJcbiAgICAgIHVuaXRBcnIubWFwKCh7dHlwZSwgdW5pdH0pID0+IHtcclxuICAgICAgICBzY29yZXNPYmpbdHlwZV0udW5pdCA9IHVuaXQ7XHJcbiAgICAgIH0pO1xyXG4gICAgICB3ZWlnaHRBcnIubWFwKCh7dHlwZSwgd2VpZ2h0fSkgPT4ge1xyXG4gICAgICAgIHNjb3Jlc09ialt0eXBlXS53ZWlnaHQgPSB3ZWlnaHQ7XHJcbiAgICAgIH0pO1xyXG4gICAgICBtMnNBcnIubWFwKCh7dHlwZSwgbW9uZXkyc2NvcmV9KSA9PiB7XHJcbiAgICAgICAgc2NvcmVzT2JqW3R5cGVdLm1vbmV5MnNjb3JlID0gbW9uZXkyc2NvcmU7XHJcbiAgICAgIH0pO1xyXG4gICAgICBzMm1BcnIubWFwKCh7dHlwZSwgc2NvcmUybW9uZXl9KSA9PiB7XHJcbiAgICAgICAgc2NvcmVzT2JqW3R5cGVdLnNjb3JlMm1vbmV5ID0gc2NvcmUybW9uZXk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBzMm9BcnIubWFwKCh7dHlwZSwgc2NvcmUyb3RoZXJ9KSA9PiB7XHJcbiAgICAgICAgc2NvcmVzT2JqW3R5cGVdLnNjb3JlMm90aGVyID0gc2NvcmUyb3RoZXI7XHJcbiAgICAgIH0pO1xyXG4gICAgICBvMnNBcnIubWFwKCh7dHlwZSwgb3RoZXIyc2NvcmV9KSA9PiB7XHJcbiAgICAgICAgc2NvcmVzT2JqW3R5cGVdLm90aGVyMnNjb3JlID0gb3RoZXIyc2NvcmU7XHJcbiAgICAgIH0pO1xyXG4gICAgICBzY29yZVNldHRpbmdzLndpdGhkcmF3VGltZUJlZ2luID0gSE1TVG9OdW1iZXIoc2NvcmVTZXR0aW5ncy5fd2l0aGRyYXdUaW1lQmVnaW4pO1xyXG4gICAgICBzY29yZVNldHRpbmdzLndpdGhkcmF3VGltZUVuZCA9IEhNU1RvTnVtYmVyKHNjb3JlU2V0dGluZ3MuX3dpdGhkcmF3VGltZUVuZCk7XHJcbiAgICAgIGRlbGV0ZSBzY29yZVNldHRpbmdzLl93aXRoZHJhd1RpbWVFbmQ7XHJcbiAgICAgIGRlbGV0ZSBzY29yZVNldHRpbmdzLl93aXRoZHJhd1RpbWVCZWdpbjtcclxuICAgICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuICAgICAgZm9ybURhdGEuYXBwZW5kKCdzY29yZVNldHRpbmdzJywgSlNPTi5zdHJpbmdpZnkoc2NvcmVTZXR0aW5ncykpO1xyXG4gICAgICBmb3IoY29uc3QgaWNvbiBvZiBpY29uQXJyKSB7XHJcbiAgICAgICAgY29uc3Qge2ljb25GaWxlLCB0eXBlfSA9IGljb247XHJcbiAgICAgICAgaWYgKCFpY29uRmlsZSkgY29udGludWU7XHJcbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKHR5cGUsIGljb25GaWxlKTtcclxuICAgICAgfVxyXG4gICAgICBua2NVcGxvYWRGaWxlKCcvZS9zZXR0aW5ncy9zY29yZScsICdQQVRDSCcsIGZvcm1EYXRhKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2Vzcygn5L+d5a2Y5oiQ5YqfJyk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgIHN3ZWV0RXJyb3IoZXJyKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuXHJcbmZ1bmN0aW9uIGdldEhNUyh0KSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGhvdXI6IE1hdGguZmxvb3IodC8zNjAwMDAwKSxcclxuICAgIG1pbjogTWF0aC5mbG9vcih0LzYwMDAwKSAlIDYwLFxyXG4gICAgc2VjOiBNYXRoLmZsb29yKHQvMTAwMCkgJSA2MFxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gSE1TVG9OdW1iZXIodCkge1xyXG4gIHJldHVybiB0LmhvdXIgKiA2MCAqIDYwICogMTAwMCArIHQubWluICogNjAgKiAxMDAwICsgdC5zZWMgKiAxMDAwO1xyXG59XHJcbiJdfQ==
