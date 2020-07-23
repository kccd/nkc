(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

(function () {
  var d = $(document);

  var modifyCSS = function modifyCSS() {
    var distance = d.scrollTop();
    var dom;

    if (distance > 800) {
      dom = $("#moduleToTop");
      dom.css({
        right: "2rem",
        opacity: 1
      });
    } else {
      dom = $("#moduleToTop");
      dom.css({
        right: "-4rem",
        opacity: 0
      });
    }
  };

  window.addEventListener("scroll", function () {
    modifyCSS();
  });
  modifyCSS();
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL3RvVG9wL3RvVG9wLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsQ0FBQyxZQUFNO0FBQ0wsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQUQsQ0FBWDs7QUFDQSxNQUFNLFNBQVMsR0FBRyxTQUFaLFNBQVksR0FBTTtBQUN0QixRQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsU0FBRixFQUFqQjtBQUNBLFFBQUksR0FBSjs7QUFDQSxRQUFHLFFBQVEsR0FBRyxHQUFkLEVBQW1CO0FBQ2pCLE1BQUEsR0FBRyxHQUFHLENBQUMsQ0FBQyxjQUFELENBQVA7QUFDQSxNQUFBLEdBQUcsQ0FBQyxHQUFKLENBQVE7QUFDTixRQUFBLEtBQUssRUFBRSxNQUREO0FBRU4sUUFBQSxPQUFPLEVBQUU7QUFGSCxPQUFSO0FBSUQsS0FORCxNQU1PO0FBQ0wsTUFBQSxHQUFHLEdBQUcsQ0FBQyxDQUFDLGNBQUQsQ0FBUDtBQUNBLE1BQUEsR0FBRyxDQUFDLEdBQUosQ0FBUTtBQUNOLFFBQUEsS0FBSyxFQUFFLE9BREQ7QUFFTixRQUFBLE9BQU8sRUFBRTtBQUZILE9BQVI7QUFJRDtBQUNGLEdBaEJEOztBQWlCQSxFQUFBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixRQUF4QixFQUFrQyxZQUFNO0FBQ3RDLElBQUEsU0FBUztBQUNWLEdBRkQ7QUFHQSxFQUFBLFNBQVM7QUFDVixDQXZCRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIigoKSA9PiB7XHJcbiAgY29uc3QgZCA9ICQoZG9jdW1lbnQpO1xyXG4gIGNvbnN0IG1vZGlmeUNTUyA9ICgpID0+IHtcclxuICAgIGNvbnN0IGRpc3RhbmNlID0gZC5zY3JvbGxUb3AoKTtcclxuICAgIGxldCBkb207XHJcbiAgICBpZihkaXN0YW5jZSA+IDgwMCkge1xyXG4gICAgICBkb20gPSAkKFwiI21vZHVsZVRvVG9wXCIpO1xyXG4gICAgICBkb20uY3NzKHtcclxuICAgICAgICByaWdodDogXCIycmVtXCIsXHJcbiAgICAgICAgb3BhY2l0eTogMVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRvbSA9ICQoXCIjbW9kdWxlVG9Ub3BcIik7XHJcbiAgICAgIGRvbS5jc3Moe1xyXG4gICAgICAgIHJpZ2h0OiBcIi00cmVtXCIsXHJcbiAgICAgICAgb3BhY2l0eTogMFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsICgpID0+IHtcclxuICAgIG1vZGlmeUNTUygpO1xyXG4gIH0pO1xyXG4gIG1vZGlmeUNTUygpO1xyXG59KSgpO1xyXG4iXX0=
