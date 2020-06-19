(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var data = NKC.methods.getDataById('data');
var selectImage = new NKC.methods.selectImage();
var scores = data.scoreSettings.scores;
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

var _iterator = _createForOfIteratorHelper(scores),
    _step;

try {
  for (_iterator.s(); !(_step = _iterator.n()).done;) {
    var s = _step.value;
    var type = s.type,
        enabled = s.enabled,
        name = s.name,
        icon = s.icon,
        unit = s.unit,
        money2score = s.money2score,
        score2other = s.score2other,
        other2score = s.other2score,
        score2money = s.score2money,
        weight = s.weight;
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
} catch (err) {
  _iterator.e(err);
} finally {
  _iterator.f();
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
    o2sArr: o2sArr
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
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
    save: function save() {}
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3Mvc2NvcmUvc2NvcmUubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLElBQU0sV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFoQixFQUFwQjtJQUNPLE0sR0FBVSxJQUFJLENBQUMsYSxDQUFmLE07QUFDUCxJQUFNLEdBQUcsR0FBRyxFQUFaO0FBQ0EsSUFBTSxPQUFPLEdBQUcsRUFBaEI7QUFDQSxJQUFNLE9BQU8sR0FBRyxFQUFoQjtBQUNBLElBQU0sT0FBTyxHQUFHLEVBQWhCO0FBQ0EsSUFBTSxPQUFPLEdBQUcsRUFBaEI7QUFDQSxJQUFNLFNBQVMsR0FBRyxFQUFsQjtBQUNBLElBQU0sTUFBTSxHQUFHLEVBQWY7QUFDQSxJQUFNLE1BQU0sR0FBRyxFQUFmO0FBQ0EsSUFBTSxNQUFNLEdBQUcsRUFBZjtBQUNBLElBQU0sTUFBTSxHQUFHLEVBQWY7OzJDQUVlLE07Ozs7QUFBZixzREFBdUI7QUFBQSxRQUFiLENBQWE7QUFBQSxRQUVuQixJQUZtQixHQUtqQixDQUxpQixDQUVuQixJQUZtQjtBQUFBLFFBRWIsT0FGYSxHQUtqQixDQUxpQixDQUViLE9BRmE7QUFBQSxRQUVKLElBRkksR0FLakIsQ0FMaUIsQ0FFSixJQUZJO0FBQUEsUUFFRSxJQUZGLEdBS2pCLENBTGlCLENBRUUsSUFGRjtBQUFBLFFBRVEsSUFGUixHQUtqQixDQUxpQixDQUVRLElBRlI7QUFBQSxRQUduQixXQUhtQixHQUtqQixDQUxpQixDQUduQixXQUhtQjtBQUFBLFFBR04sV0FITSxHQUtqQixDQUxpQixDQUdOLFdBSE07QUFBQSxRQUdPLFdBSFAsR0FLakIsQ0FMaUIsQ0FHTyxXQUhQO0FBQUEs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c0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZCgnZGF0YScpO1xyXG5jb25zdCBzZWxlY3RJbWFnZSA9IG5ldyBOS0MubWV0aG9kcy5zZWxlY3RJbWFnZSgpO1xyXG5jb25zdCB7c2NvcmVzfSA9IGRhdGEuc2NvcmVTZXR0aW5ncztcclxuY29uc3QgYXJyID0gW107XHJcbmNvbnN0IHR5cGVBcnIgPSBbXTtcclxuY29uc3QgbmFtZUFyciA9IFtdO1xyXG5jb25zdCBpY29uQXJyID0gW107XHJcbmNvbnN0IHVuaXRBcnIgPSBbXTtcclxuY29uc3Qgd2VpZ2h0QXJyID0gW107XHJcbmNvbnN0IG0yc0FyciA9IFtdO1xyXG5jb25zdCBzMm1BcnIgPSBbXTtcclxuY29uc3QgczJvQXJyID0gW107XHJcbmNvbnN0IG8yc0FyciA9IFtdO1xyXG5cclxuZm9yKGNvbnN0IHMgb2Ygc2NvcmVzKSB7XHJcbiAgY29uc3Qge1xyXG4gICAgdHlwZSwgZW5hYmxlZCwgbmFtZSwgaWNvbiwgdW5pdCxcclxuICAgIG1vbmV5MnNjb3JlLCBzY29yZTJvdGhlciwgb3RoZXIyc2NvcmUsIHNjb3JlMm1vbmV5LFxyXG4gICAgd2VpZ2h0XHJcbiAgfSA9IHM7XHJcbiAgdHlwZUFyci5wdXNoKHtcclxuICAgIHR5cGUsXHJcbiAgICBlbmFibGVkLFxyXG4gIH0pO1xyXG4gIG5hbWVBcnIucHVzaCh7XHJcbiAgICB0eXBlLFxyXG4gICAgbmFtZSxcclxuICB9KTtcclxuICBpY29uQXJyLnB1c2goe1xyXG4gICAgdHlwZSxcclxuICAgIGljb24sXHJcbiAgICBpY29uRmlsZTogJycsXHJcbiAgICBpY29uRGF0YTogJydcclxuICB9KTtcclxuICB1bml0QXJyLnB1c2goe1xyXG4gICAgdHlwZSxcclxuICAgIHVuaXRcclxuICB9KTtcclxuICB3ZWlnaHRBcnIucHVzaCh7XHJcbiAgICB0eXBlLFxyXG4gICAgd2VpZ2h0XHJcbiAgfSk7XHJcbiAgbTJzQXJyLnB1c2goe1xyXG4gICAgdHlwZSxcclxuICAgIG1vbmV5MnNjb3JlXHJcbiAgfSk7XHJcbiAgczJtQXJyLnB1c2goe1xyXG4gICAgdHlwZSxcclxuICAgIHNjb3JlMm1vbmV5XHJcbiAgfSk7XHJcbiAgczJvQXJyLnB1c2goe1xyXG4gICAgdHlwZSxcclxuICAgIHNjb3JlMm90aGVyXHJcbiAgfSk7XHJcbiAgbzJzQXJyLnB1c2goe1xyXG4gICAgdHlwZSxcclxuICAgIG90aGVyMnNjb3JlXHJcbiAgfSk7XHJcbn1cclxuXHJcbmNvbnN0IGFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiAnI2FwcCcsXHJcbiAgZGF0YToge1xyXG4gICAgc2NvcmVTZXR0aW5nczogZGF0YS5zY29yZVNldHRpbmdzLFxyXG4gICAgdHlwZUFycixcclxuICAgIG5hbWVBcnIsXHJcbiAgICBpY29uQXJyLFxyXG4gICAgdW5pdEFycixcclxuICAgIHdlaWdodEFycixcclxuICAgIG0yc0FycixcclxuICAgIHMybUFycixcclxuICAgIHMyb0FycixcclxuICAgIG8yc0FyclxyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgZ2V0VXJsOiBOS0MubWV0aG9kcy50b29scy5nZXRVcmwsXHJcbiAgICBzZWxlY3RJY29uKGEpIHtcclxuICAgICAgc2VsZWN0SW1hZ2Uuc2hvdyhibG9iID0+IHtcclxuICAgICAgICBjb25zdCBmaWxlID0gTktDLm1ldGhvZHMuYmxvYlRvRmlsZShibG9iKTtcclxuICAgICAgICBOS0MubWV0aG9kcy5maWxlVG9VcmwoZmlsZSlcclxuICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICBhLmljb25EYXRhID0gZGF0YTtcclxuICAgICAgICAgICAgYS5pY29uRmlsZSA9IGZpbGU7XHJcbiAgICAgICAgICAgIHNlbGVjdEltYWdlLmNsb3NlKCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSwge1xyXG4gICAgICAgIGFzcGVjdFJhdGlvOiAxXHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHNhdmUoKSB7XHJcblxyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG4iXX0=
