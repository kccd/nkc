(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById('data');
var appBase = new Vue({
  el: '#appBaseInfo',
  data: {
    shopSettings: data.shopSettings
  },
  methods: {
    save: function save() {
      nkcAPI('/e/settings/shop', 'PUT', {
        shopSettings: this.shopSettings
      }).then(function () {
        sweetSuccess('保存成功');
      })["catch"](sweetError);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2hvcC9iYXNlL2Jhc2UubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLElBQU0sT0FBTyxHQUFHLElBQUksR0FBSixDQUFRO0FBQ3RCLEVBQUEsRUFBRSxFQUFFLGNBRGtCO0FBRXRCLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxZQUFZLEVBQUUsSUFBSSxDQUFDO0FBRGYsR0FGZ0I7QUFLdEIsRUFBQSxPQUFPLEVBQUU7QUFDUCxJQUFBLElBRE8sa0JBQ0E7QUFDTCxNQUFBLE1BQU0sQ0FBQyxrQkFBRCxFQUFxQixLQUFyQixFQUE0QjtBQUNoQyxRQUFBLFlBQVksRUFBRSxLQUFLO0FBRGEsT0FBNUIsQ0FBTixDQUdHLElBSEgsQ0FHUSxZQUFNO0FBQ1YsUUFBQSxZQUFZLENBQUMsTUFBRCxDQUFaO0FBQ0QsT0FMSCxXQU1TLFVBTlQ7QUFPRDtBQVRNO0FBTGEsQ0FBUixDQUFoQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZCgnZGF0YScpO1xyXG5jb25zdCBhcHBCYXNlID0gbmV3IFZ1ZSh7XHJcbiAgZWw6ICcjYXBwQmFzZUluZm8nLFxyXG4gIGRhdGE6IHtcclxuICAgIHNob3BTZXR0aW5nczogZGF0YS5zaG9wU2V0dGluZ3MsXHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBzYXZlKCkge1xyXG4gICAgICBua2NBUEkoJy9lL3NldHRpbmdzL3Nob3AnLCAnUFVUJywge1xyXG4gICAgICAgIHNob3BTZXR0aW5nczogdGhpcy5zaG9wU2V0dGluZ3NcclxuICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoJ+S/neWtmOaIkOWKnycpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG4iXX0=
