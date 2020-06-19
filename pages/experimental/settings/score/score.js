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
var scoresObj = {};

var _iterator = _createForOfIteratorHelper(scores),
    _step;

try {
  for (_iterator.s(); !(_step = _iterator.n()).done;) {
    var s = _step.value;
    scoresObj[s.type] = s;
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
      this.scoreSettings.scores = scoresObj;
      var formData = new FormData();
      formData.append('scoreSettings', JSON.stringify(this.scoreSettings));

      var _iterator2 = _createForOfIteratorHelper(iconArr),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var icon = _step2.value;
          var iconFile = icon.iconFile,
              type = icon.type;
          if (!iconFile) continue;
          formData.append(type, iconFile);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3Mvc2NvcmUvc2NvcmUubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLElBQU0sV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFoQixFQUFwQjtJQUNPLE0sR0FBVSxJQUFJLENBQUMsYSxDQUFmLE07QUFDUCxJQUFNLEdBQUcsR0FBRyxFQUFaO0FBQ0EsSUFBTSxPQUFPLEdBQUcsRUFBaEI7QUFDQSxJQUFNLE9BQU8sR0FBRyxFQUFoQjtBQUNBLElBQU0sT0FBTyxHQUFHLEVBQWhCO0FBQ0EsSUFBTSxPQUFPLEdBQUcsRUFBaEI7QUFDQSxJQUFNLFNBQVMsR0FBRyxFQUFsQjtBQUNBLElBQU0sTUFBTSxHQUFHLEVBQWY7QUFDQSxJQUFNLE1BQU0sR0FBRyxFQUFmO0FBQ0EsSUFBTSxNQUFNLEdBQUcsRUFBZjtBQUNBLElBQU0sTUFBTSxHQUFHLEVBQWY7QUFFQSxJQUFNLFNBQVMsR0FBRyxFQUFsQjs7MkNBRWUsTTs7OztBQUFmLHNEQUF1QjtBQUFBLFFBQWIsQ0FBYTtBQUNyQixJQUFBLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSCxDQUFULEdBQW9CLENBQXBCO0FBRHFCLFFBR25CLElBSG1CLEdBTWpCLENBTmlCLENBR25CLElBSG1CO0FBQUEsUUFHYixPQUhhLEdBTWpCLENBTmlCLENBR2IsT0FIYTtBQUFBLFFBR0osSUFISSxHQU1qQixDQU5pQixDQUdKLElBSEk7QUFBQSxRQUdFLElBSEYsR0FNakIsQ0FOaUIsQ0FHRSxJQUhGO0FBQUEsUUFHUSxJQUhSLEdBTWpCLENBTmlCLENBR1EsSUFIUjtBQUFBLFFBSW5CLFdBSm1CLEdBTWpCLENBTmlCLENBSW5CLFdBSm1C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QjtBQUFBLGNBQWpCLElBQWlCO0FBQUEsY0FDbEIsUUFEa0IsR0FDQSxJQURBLENBQ2xCLFFBRGtCO0FBQUEsY0FDUixJQURRLEdBQ0EsSUFEQSxDQUNSLElBRFE7QUFFekIsY0FBRyxDQUFDLFFBQUosRUFBYztBQUNkLFVBQUEsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsSUFBaEIsRUFBc0IsUUFBdEI7QUFDRDtBQXBDSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBcUNOO0FBcERNO0FBZFMsQ0FBUixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKCdkYXRhJyk7XHJcbmNvbnN0IHNlbGVjdEltYWdlID0gbmV3IE5LQy5tZXRob2RzLnNlbGVjdEltYWdlKCk7XHJcbmNvbnN0IHtzY29yZXN9ID0gZGF0YS5zY29yZVNldHRpbmdzO1xyXG5jb25zdCBhcnIgPSBbXTtcclxuY29uc3QgdHlwZUFyciA9IFtdO1xyXG5jb25zdCBuYW1lQXJyID0gW107XHJcbmNvbnN0IGljb25BcnIgPSBbXTtcclxuY29uc3QgdW5pdEFyciA9IFtdO1xyXG5jb25zdCB3ZWlnaHRBcnIgPSBbXTtcclxuY29uc3QgbTJzQXJyID0gW107XHJcbmNvbnN0IHMybUFyciA9IFtdO1xyXG5jb25zdCBzMm9BcnIgPSBbXTtcclxuY29uc3QgbzJzQXJyID0gW107XHJcblxyXG5jb25zdCBzY29yZXNPYmogPSB7fTtcclxuXHJcbmZvcihjb25zdCBzIG9mIHNjb3Jlcykge1xyXG4gIHNjb3Jlc09ialtzLnR5cGVdID0gcztcclxuICBjb25zdCB7XHJcbiAgICB0eXBlLCBlbmFibGVkLCBuYW1lLCBpY29uLCB1bml0LFxyXG4gICAgbW9uZXkyc2NvcmUsIHNjb3JlMm90aGVyLCBvdGhlcjJzY29yZSwgc2NvcmUybW9uZXksXHJcbiAgICB3ZWlnaHRcclxuICB9ID0gcztcclxuICB0eXBlQXJyLnB1c2goe1xyXG4gICAgdHlwZSxcclxuICAgIGVuYWJsZWQsXHJcbiAgfSk7XHJcbiAgbmFtZUFyci5wdXNoKHtcclxuICAgIHR5cGUsXHJcbiAgICBuYW1lLFxyXG4gIH0pO1xyXG4gIGljb25BcnIucHVzaCh7XHJcbiAgICB0eXBlLFxyXG4gICAgaWNvbixcclxuICAgIGljb25GaWxlOiAnJyxcclxuICAgIGljb25EYXRhOiAnJ1xyXG4gIH0pO1xyXG4gIHVuaXRBcnIucHVzaCh7XHJcbiAgICB0eXBlLFxyXG4gICAgdW5pdFxyXG4gIH0pO1xyXG4gIHdlaWdodEFyci5wdXNoKHtcclxuICAgIHR5cGUsXHJcbiAgICB3ZWlnaHRcclxuICB9KTtcclxuICBtMnNBcnIucHVzaCh7XHJcbiAgICB0eXBlLFxyXG4gICAgbW9uZXkyc2NvcmVcclxuICB9KTtcclxuICBzMm1BcnIucHVzaCh7XHJcbiAgICB0eXBlLFxyXG4gICAgc2NvcmUybW9uZXlcclxuICB9KTtcclxuICBzMm9BcnIucHVzaCh7XHJcbiAgICB0eXBlLFxyXG4gICAgc2NvcmUyb3RoZXJcclxuICB9KTtcclxuICBvMnNBcnIucHVzaCh7XHJcbiAgICB0eXBlLFxyXG4gICAgb3RoZXIyc2NvcmVcclxuICB9KTtcclxufVxyXG5cclxuY29uc3QgYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6ICcjYXBwJyxcclxuICBkYXRhOiB7XHJcbiAgICBzY29yZVNldHRpbmdzOiBkYXRhLnNjb3JlU2V0dGluZ3MsXHJcbiAgICB0eXBlQXJyLFxyXG4gICAgbmFtZUFycixcclxuICAgIGljb25BcnIsXHJcbiAgICB1bml0QXJyLFxyXG4gICAgd2VpZ2h0QXJyLFxyXG4gICAgbTJzQXJyLFxyXG4gICAgczJtQXJyLFxyXG4gICAgczJvQXJyLFxyXG4gICAgbzJzQXJyXHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgIHNlbGVjdEljb24oYSkge1xyXG4gICAgICBzZWxlY3RJbWFnZS5zaG93KGJsb2IgPT4ge1xyXG4gICAgICAgIGNvbnN0IGZpbGUgPSBOS0MubWV0aG9kcy5ibG9iVG9GaWxlKGJsb2IpO1xyXG4gICAgICAgIE5LQy5tZXRob2RzLmZpbGVUb1VybChmaWxlKVxyXG4gICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgIGEuaWNvbkRhdGEgPSBkYXRhO1xyXG4gICAgICAgICAgICBhLmljb25GaWxlID0gZmlsZTtcclxuICAgICAgICAgICAgc2VsZWN0SW1hZ2UuY2xvc2UoKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9LCB7XHJcbiAgICAgICAgYXNwZWN0UmF0aW86IDFcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgc2F2ZSgpIHtcclxuICAgICAgY29uc3Qge1xyXG4gICAgICAgIHR5cGVBcnIsIG5hbWVBcnIsIGljb25BcnIsIHVuaXRBcnIsXHJcbiAgICAgICAgd2VpZ2h0QXJyLCBtMnNBcnIsIHMybUFyciwgczJvQXJyLCBvMnNBcnJcclxuICAgICAgfSA9IHRoaXM7XHJcbiAgICAgIHR5cGVBcnIubWFwKCh7dHlwZSwgZW5hYmxlZH0pID0+IHtcclxuICAgICAgICBzY29yZXNPYmpbdHlwZV0uZW5hYmxlZCA9IGVuYWJsZWQ7XHJcbiAgICAgIH0pO1xyXG4gICAgICBuYW1lQXJyLm1hcCgoe3R5cGUsIG5hbWV9KSA9PiB7XHJcbiAgICAgICAgc2NvcmVzT2JqW3R5cGVdLm5hbWUgPSBuYW1lO1xyXG4gICAgICB9KTtcclxuICAgICAgdW5pdEFyci5tYXAoKHt0eXBlLCB1bml0fSkgPT4ge1xyXG4gICAgICAgIHNjb3Jlc09ialt0eXBlXS51bml0ID0gdW5pdDtcclxuICAgICAgfSk7XHJcbiAgICAgIHdlaWdodEFyci5tYXAoKHt0eXBlLCB3ZWlnaHR9KSA9PiB7XHJcbiAgICAgICAgc2NvcmVzT2JqW3R5cGVdLndlaWdodCA9IHdlaWdodDtcclxuICAgICAgfSk7XHJcbiAgICAgIG0yc0Fyci5tYXAoKHt0eXBlLCBtb25leTJzY29yZX0pID0+IHtcclxuICAgICAgICBzY29yZXNPYmpbdHlwZV0ubW9uZXkyc2NvcmUgPSBtb25leTJzY29yZTtcclxuICAgICAgfSk7XHJcbiAgICAgIHMybUFyci5tYXAoKHt0eXBlLCBzY29yZTJtb25leX0pID0+IHtcclxuICAgICAgICBzY29yZXNPYmpbdHlwZV0uc2NvcmUybW9uZXkgPSBzY29yZTJtb25leTtcclxuICAgICAgfSk7XHJcbiAgICAgIHMyb0Fyci5tYXAoKHt0eXBlLCBzY29yZTJvdGhlcn0pID0+IHtcclxuICAgICAgICBzY29yZXNPYmpbdHlwZV0uc2NvcmUyb3RoZXIgPSBzY29yZTJvdGhlcjtcclxuICAgICAgfSk7XHJcbiAgICAgIG8yc0Fyci5tYXAoKHt0eXBlLCBvdGhlcjJzY29yZX0pID0+IHtcclxuICAgICAgICBzY29yZXNPYmpbdHlwZV0ub3RoZXIyc2NvcmUgPSBvdGhlcjJzY29yZTtcclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuc2NvcmVTZXR0aW5ncy5zY29yZXMgPSBzY29yZXNPYmo7XHJcbiAgICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgIGZvcm1EYXRhLmFwcGVuZCgnc2NvcmVTZXR0aW5ncycsIEpTT04uc3RyaW5naWZ5KHRoaXMuc2NvcmVTZXR0aW5ncykpO1xyXG4gICAgICBmb3IoY29uc3QgaWNvbiBvZiBpY29uQXJyKSB7XHJcbiAgICAgICAgY29uc3Qge2ljb25GaWxlLCB0eXBlfSA9IGljb247XHJcbiAgICAgICAgaWYoIWljb25GaWxlKSBjb250aW51ZTtcclxuICAgICAgICBmb3JtRGF0YS5hcHBlbmQodHlwZSwgaWNvbkZpbGUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcbiJdfQ==
