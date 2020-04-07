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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvdG9Ub3AvdG9Ub3AubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxDQUFDLFlBQU07QUFDTCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBRCxDQUFYOztBQUNBLE1BQU0sU0FBUyxHQUFHLFNBQVosU0FBWSxHQUFNO0FBQ3RCLFFBQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxTQUFGLEVBQWpCO0FBQ0EsUUFBSSxHQUFKOztBQUNBLFFBQUcsUUFBUSxHQUFHLEdBQWQsRUFBbUI7QUFDakIsTUFBQSxHQUFHLEdBQUcsQ0FBQyxDQUFDLGNBQUQsQ0FBUDtBQUNBLE1BQUEsR0FBRyxDQUFDLEdBQUosQ0FBUTtBQUNOLFFBQUEsS0FBSyxFQUFFLE1BREQ7QUFFTixRQUFBLE9BQU8sRUFBRTtBQUZILE9BQVI7QUFJRCxLQU5ELE1BTU87QUFDTCxNQUFBLEdBQUcsR0FBRyxDQUFDLENBQUMsY0FBRCxDQUFQO0FBQ0EsTUFBQSxHQUFHLENBQUMsR0FBSixDQUFRO0FBQ04sUUFBQSxLQUFLLEVBQUUsT0FERDtBQUVOLFFBQUEsT0FBTyxFQUFFO0FBRkgsT0FBUjtBQUlEO0FBQ0YsR0FoQkQ7O0FBaUJBLEVBQUEsTUFBTSxDQUFDLGdCQUFQLENBQXdCLFFBQXhCLEVBQWtDLFlBQU07QUFDdEMsSUFBQSxTQUFTO0FBQ1YsR0FGRDtBQUdBLEVBQUEsU0FBUztBQUNWLENBdkJEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiKCgpID0+IHtcbiAgY29uc3QgZCA9ICQoZG9jdW1lbnQpO1xuICBjb25zdCBtb2RpZnlDU1MgPSAoKSA9PiB7XG4gICAgY29uc3QgZGlzdGFuY2UgPSBkLnNjcm9sbFRvcCgpO1xuICAgIGxldCBkb207XG4gICAgaWYoZGlzdGFuY2UgPiA4MDApIHtcbiAgICAgIGRvbSA9ICQoXCIjbW9kdWxlVG9Ub3BcIik7XG4gICAgICBkb20uY3NzKHtcbiAgICAgICAgcmlnaHQ6IFwiMnJlbVwiLFxuICAgICAgICBvcGFjaXR5OiAxXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZG9tID0gJChcIiNtb2R1bGVUb1RvcFwiKTtcbiAgICAgIGRvbS5jc3Moe1xuICAgICAgICByaWdodDogXCItNHJlbVwiLFxuICAgICAgICBvcGFjaXR5OiAwXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsICgpID0+IHtcbiAgICBtb2RpZnlDU1MoKTtcbiAgfSk7XG4gIG1vZGlmeUNTUygpO1xufSkoKTtcbiJdfQ==
