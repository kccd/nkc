(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    editorSettings: data.editorSettings
  },
  methods: {
    submit: function submit() {
      nkcAPI("/e/settings/editor", "PATCH", {
        editorSettings: this.editorSettings
      }).then(function () {
        sweetSuccess("保存成功");
      })["catch"](sweetError);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3MvZWRpdG9yL2VkaXRvci5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiO0FBQ0EsSUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFKLENBQVE7QUFDbEIsRUFBQSxFQUFFLEVBQUUsTUFEYztBQUVsQixFQUFBLElBQUksRUFBRTtBQUNKLElBQUEsY0FBYyxFQUFFLElBQUksQ0FBQztBQURqQixHQUZZO0FBS2xCLEVBQUEsT0FBTyxFQUFFO0FBQ1AsSUFBQSxNQURPLG9CQUNFO0FBQ1AsTUFBQSxNQUFNLENBQUMsb0JBQUQsRUFBdUIsT0FBdkIsRUFBZ0M7QUFDcEMsUUFBQSxjQUFjLEVBQUUsS0FBSztBQURlLE9BQWhDLENBQU4sQ0FHQyxJQUhELENBR00sWUFBTTtBQUNWLFFBQUEsWUFBWSxDQUFDLE1BQUQsQ0FBWjtBQUNELE9BTEQsV0FNTyxVQU5QO0FBT0Q7QUFUTTtBQUxTLENBQVIsQ0FBWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZChcImRhdGFcIik7XG5jb25zdCBhcHAgPSBuZXcgVnVlKHtcbiAgZWw6IFwiI2FwcFwiLFxuICBkYXRhOiB7XG4gICAgZWRpdG9yU2V0dGluZ3M6IGRhdGEuZWRpdG9yU2V0dGluZ3NcbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIHN1Ym1pdCgpIHtcbiAgICAgIG5rY0FQSShcIi9lL3NldHRpbmdzL2VkaXRvclwiLCBcIlBBVENIXCIsIHtcbiAgICAgICAgZWRpdG9yU2V0dGluZ3M6IHRoaXMuZWRpdG9yU2V0dGluZ3NcbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHN3ZWV0U3VjY2VzcyhcIuS/neWtmOaIkOWKn1wiKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XG4gICAgfVxuICB9XG59KTsiXX0=
