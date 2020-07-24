(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

;

(function () {
  if (!NKC) return;
  if (!NKC.methods) return;

  function deletePost(postId) {
    sweetQuestion("你确定要删除吗？").then(function () {
      return nkcAPI("/p/".concat(postId, "/delete"), "GET");
    }).then(function (res) {
      console.log(res);
    });
  }

  ;
  NKC.methods.deletePost = deletePost;
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3RocmVhZC9kZWxldGVQb3N0Lm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7O0FBQUUsYUFBVTtBQUNWLE1BQUcsQ0FBQyxHQUFKLEVBQVM7QUFDVCxNQUFHLENBQUMsR0FBRyxDQUFDLE9BQVIsRUFBaUI7O0FBRWpCLFdBQVMsVUFBVCxDQUFvQixNQUFwQixFQUE0QjtBQUMxQixJQUFBLGFBQWEsQ0FBQyxVQUFELENBQWIsQ0FDRyxJQURILENBQ1E7QUFBQSxhQUFNLE1BQU0sY0FBTyxNQUFQLGNBQXdCLEtBQXhCLENBQVo7QUFBQSxLQURSLEVBRUcsSUFGSCxDQUVRLFVBQUEsR0FBRyxFQUFJO0FBQ1gsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLEdBQVo7QUFDRCxLQUpIO0FBS0Q7O0FBQUE7QUFFRCxFQUFBLEdBQUcsQ0FBQyxPQUFKLENBQVksVUFBWixHQUF5QixVQUF6QjtBQUNELENBYkMsR0FBRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIjsoZnVuY3Rpb24oKXtcclxuICBpZighTktDKSByZXR1cm47XHJcbiAgaWYoIU5LQy5tZXRob2RzKSByZXR1cm47XHJcblxyXG4gIGZ1bmN0aW9uIGRlbGV0ZVBvc3QocG9zdElkKSB7XHJcbiAgICBzd2VldFF1ZXN0aW9uKFwi5L2g56Gu5a6a6KaB5Yig6Zmk5ZCX77yfXCIpXHJcbiAgICAgIC50aGVuKCgpID0+IG5rY0FQSShgL3AvJHtwb3N0SWR9L2RlbGV0ZWAsIFwiR0VUXCIpKVxyXG4gICAgICAudGhlbihyZXMgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XHJcbiAgICAgIH0pXHJcbiAgfTtcclxuXHJcbiAgTktDLm1ldGhvZHMuZGVsZXRlUG9zdCA9IGRlbGV0ZVBvc3Q7XHJcbn0oKSk7Il19
