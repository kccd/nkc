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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvdG9Ub3AvdG9Ub3AubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxDQUFDLFlBQU07QUFDTCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBRCxDQUFYOztBQUNBLE1BQU0sU0FBUyxHQUFHLFNBQVosU0FBWSxHQUFNO0FBQ3RCLFFBQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxTQUFGLEVBQWpCO0FBQ0EsUUFBSSxHQUFKOztBQUNBLFFBQUcsUUFBUSxHQUFHLEdBQWQsRUFBbUI7QUFDakIsTUFBQSxHQUFHLEdBQUcsQ0FBQyxDQUFDLGNBQUQsQ0FBUDtBQUNBLE1BQUEsR0FBRyxDQUFDLEdBQUosQ0FBUTtBQUNOLFFBQUEsS0FBSyxFQUFFLE1BREQ7QUFFTixRQUFBLE9BQU8sRUFBRTtBQUZILE9BQVI7QUFJRCxLQU5ELE1BTU87QUFDTCxNQUFBLEdBQUcsR0FBRyxDQUFDLENBQUMsY0FBRCxDQUFQO0FBQ0EsTUFBQSxHQUFHLENBQUMsR0FBSixDQUFRO0FBQ04sUUFBQSxLQUFLLEVBQUUsT0FERDtBQUVOLFFBQUEsT0FBTyxFQUFFO0FBRkgsT0FBUjtBQUlEO0FBQ0YsR0FoQkQ7O0FBaUJBLEVBQUEsTUFBTSxDQUFDLGdCQUFQLENBQXdCLFFBQXhCLEVBQWtDLFlBQU07QUFDdEMsSUFBQSxTQUFTO0FBQ1YsR0FGRDtBQUdBLEVBQUEsU0FBUztBQUNWLENBdkJEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiKCgpID0+IHtcclxuICBjb25zdCBkID0gJChkb2N1bWVudCk7XHJcbiAgY29uc3QgbW9kaWZ5Q1NTID0gKCkgPT4ge1xyXG4gICAgY29uc3QgZGlzdGFuY2UgPSBkLnNjcm9sbFRvcCgpO1xyXG4gICAgbGV0IGRvbTtcclxuICAgIGlmKGRpc3RhbmNlID4gODAwKSB7XHJcbiAgICAgIGRvbSA9ICQoXCIjbW9kdWxlVG9Ub3BcIik7XHJcbiAgICAgIGRvbS5jc3Moe1xyXG4gICAgICAgIHJpZ2h0OiBcIjJyZW1cIixcclxuICAgICAgICBvcGFjaXR5OiAxXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZG9tID0gJChcIiNtb2R1bGVUb1RvcFwiKTtcclxuICAgICAgZG9tLmNzcyh7XHJcbiAgICAgICAgcmlnaHQ6IFwiLTRyZW1cIixcclxuICAgICAgICBvcGFjaXR5OiAwXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgKCkgPT4ge1xyXG4gICAgbW9kaWZ5Q1NTKCk7XHJcbiAgfSk7XHJcbiAgbW9kaWZ5Q1NTKCk7XHJcbn0pKCk7XHJcbiJdfQ==
