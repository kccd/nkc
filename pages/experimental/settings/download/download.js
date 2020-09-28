(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById('data');
var hours = [];

for (var i = 0; i <= 24; i++) {
  hours.push(i);
}

var app = new Vue({
  el: '#app',
  data: {
    hours: hours,
    certList: data.certList,
    settings: data.downloadSettings
  },
  methods: {
    addSpeed: function addSpeed(arr) {
      arr.push({
        startingTime: 0,
        endTime: 24,
        speed: 0
      });
    },
    removeFromArray: function removeFromArray(arr, index) {
      arr.splice(index, 1);
    },
    addCert: function addCert(arr) {
      var item = {
        type: '',
        fileCount: 0,
        data: []
      };
      this.addSpeed(item.data);
      arr.push(item);
    },
    save: function save() {
      nkcAPI('/e/settings/download', 'PUT', {
        downloadSettings: this.settings
      }).then(function () {
        sweetSuccess('保存成功');
      })["catch"](sweetError);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3MvZG93bmxvYWQvZG93bmxvYWQubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLElBQU0sS0FBSyxHQUFHLEVBQWQ7O0FBQ0EsS0FBSSxJQUFJLENBQUMsR0FBRyxDQUFaLEVBQWUsQ0FBQyxJQUFHLEVBQW5CLEVBQXVCLENBQUMsRUFBeEIsRUFBNEI7QUFDMUIsRUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLENBQVg7QUFDRDs7QUFDRCxJQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUosQ0FBUTtBQUNsQixFQUFBLEVBQUUsRUFBRSxNQURjO0FBRWxCLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxLQUFLLEVBQUwsS0FESTtBQUVKLElBQUEsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUZYO0FBR0osSUFBQSxRQUFRLEVBQUUsSUFBSSxDQUFDO0FBSFgsR0FGWTtBQU9sQixFQUFBLE9BQU8sRUFBRTtBQUNQLElBQUEsUUFETyxvQkFDRSxHQURGLEVBQ087QUFDWixNQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVM7QUFDUCxRQUFBLFlBQVksRUFBRSxDQURQO0FBRVAsUUFBQSxPQUFPLEVBQUUsRUFGRjtBQUdQLFFBQUEsS0FBSyxFQUFFO0FBSEEsT0FBVDtBQUtELEtBUE07QUFRUCxJQUFBLGVBUk8sMkJBUVMsR0FSVCxFQVFjLEtBUmQsRUFRcUI7QUFDMUIsTUFBQSxHQUFHLENBQUMsTUFBSixDQUFXLEtBQVgsRUFBa0IsQ0FBbEI7QUFDRCxLQVZNO0FBV1AsSUFBQSxPQVhPLG1CQVdDLEdBWEQsRUFXTTtBQUNYLFVBQU0sSUFBSSxHQUFHO0FBQ1gsUUFBQSxJQUFJLEVBQUUsRUFESztBQUVYLFFBQUEsU0FBUyxFQUFFLENBRkE7QUFHWCxRQUFBLElBQUksRUFBRTtBQUhLLE9BQWI7QUFLQSxXQUFLLFFBQUwsQ0FBYyxJQUFJLENBQUMsSUFBbkI7QUFDQSxNQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVMsSUFBVDtBQUNELEtBbkJNO0FBb0JQLElBQUEsSUFwQk8sa0JBb0JBO0FBQ0wsTUFBQSxNQUFNLENBQUMsc0JBQUQsRUFBeUIsS0FBekIsRUFBZ0M7QUFDcEMsUUFBQSxnQkFBZ0IsRUFBRSxLQUFLO0FBRGEsT0FBaEMsQ0FBTixDQUdHLElBSEgsQ0FHUSxZQUFNO0FBQ1YsUUFBQSxZQUFZLENBQUMsTUFBRCxDQUFaO0FBQ0QsT0FMSCxXQU1TLFVBTlQ7QUFPRDtBQTVCTTtBQVBTLENBQVIsQ0FBWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZCgnZGF0YScpO1xyXG5jb25zdCBob3VycyA9IFtdO1xyXG5mb3IobGV0IGkgPSAwOyBpIDw9MjQ7IGkrKykge1xyXG4gIGhvdXJzLnB1c2goaSk7XHJcbn1cclxuY29uc3QgYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6ICcjYXBwJyxcclxuICBkYXRhOiB7XHJcbiAgICBob3VycyxcclxuICAgIGNlcnRMaXN0OiBkYXRhLmNlcnRMaXN0LFxyXG4gICAgc2V0dGluZ3M6IGRhdGEuZG93bmxvYWRTZXR0aW5nc1xyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgYWRkU3BlZWQoYXJyKSB7XHJcbiAgICAgIGFyci5wdXNoKHtcclxuICAgICAgICBzdGFydGluZ1RpbWU6IDAsXHJcbiAgICAgICAgZW5kVGltZTogMjQsXHJcbiAgICAgICAgc3BlZWQ6IDBcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlRnJvbUFycmF5KGFyciwgaW5kZXgpIHtcclxuICAgICAgYXJyLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9LFxyXG4gICAgYWRkQ2VydChhcnIpIHtcclxuICAgICAgY29uc3QgaXRlbSA9IHtcclxuICAgICAgICB0eXBlOiAnJyxcclxuICAgICAgICBmaWxlQ291bnQ6IDAsXHJcbiAgICAgICAgZGF0YTogW11cclxuICAgICAgfTtcclxuICAgICAgdGhpcy5hZGRTcGVlZChpdGVtLmRhdGEpO1xyXG4gICAgICBhcnIucHVzaChpdGVtKTtcclxuICAgIH0sXHJcbiAgICBzYXZlKCkge1xyXG4gICAgICBua2NBUEkoJy9lL3NldHRpbmdzL2Rvd25sb2FkJywgJ1BVVCcsIHtcclxuICAgICAgICBkb3dubG9hZFNldHRpbmdzOiB0aGlzLnNldHRpbmdzXHJcbiAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKCfkv53lrZjmiJDlip8nKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKVxyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcbiJdfQ==
