(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

window.payForDownloadResource = function (rid) {
  var a = document.createElement("a");
  a.href = "/r/".concat(rid, "?t=download");
  var downloadAttr = document.createAttribute("download");
  a.setAttributeNode(downloadAttr);
  a.click();
  window.close();
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9yZXNvdXJjZS9kb3dubG9hZC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE1BQU0sQ0FBQyxzQkFBUCxHQUFnQyxVQUFTLEdBQVQsRUFBYztBQUM1QyxNQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixHQUF2QixDQUFSO0FBQ0EsRUFBQSxDQUFDLENBQUMsSUFBRixnQkFBZSxHQUFmO0FBQ0EsTUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLGVBQVQsQ0FBeUIsVUFBekIsQ0FBbkI7QUFDQSxFQUFBLENBQUMsQ0FBQyxnQkFBRixDQUFtQixZQUFuQjtBQUNBLEVBQUEsQ0FBQyxDQUFDLEtBQUY7QUFDQSxFQUFBLE1BQU0sQ0FBQyxLQUFQO0FBQ0QsQ0FQRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIndpbmRvdy5wYXlGb3JEb3dubG9hZFJlc291cmNlID0gZnVuY3Rpb24ocmlkKSB7XHJcbiAgbGV0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcclxuICBhLmhyZWYgPSBgL3IvJHtyaWR9P3Q9ZG93bmxvYWRgO1xyXG4gIGxldCBkb3dubG9hZEF0dHIgPSBkb2N1bWVudC5jcmVhdGVBdHRyaWJ1dGUoXCJkb3dubG9hZFwiKTtcclxuICBhLnNldEF0dHJpYnV0ZU5vZGUoZG93bmxvYWRBdHRyKTtcclxuICBhLmNsaWNrKCk7XHJcbiAgd2luZG93LmNsb3NlKCk7XHJcbn0iXX0=
