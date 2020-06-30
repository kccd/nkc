(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

/*
* 初始化非固定类弹窗
* 设置.unfixed-panel为可拖动
* 设置.unfixed-panel-title为拖动手柄
* */
NKC.methods.initUnfixedPanel = function () {
  var dom = $(".unfixed-panel:not('[data-init=\"true\"]')");
  dom.draggable({
    scroll: false,
    handle: ".unfixed-panel-title",
    drag: function drag(event, ui) {
      if (ui.position.top < 0) ui.position.top = 0;
      var height = $(window).height();
      if (ui.position.top > height - 30) ui.position.top = height - 30;
      var winWidth = $(window).width();
      if (ui.position.left > winWidth - 30) ui.position.left = winWidth - 30;
    }
  });
  dom.attr("data-init", "true");
  var width = $(window).width();

  for (var i = 0; i < dom.length; i++) {
    var d = dom.eq(i);
    d.css("left", (width - d.width()) * 0.5);
  }
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvdW5maXhlZFBhbmVsL3VuZml4ZWRQYW5lbC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7OztBQUtBLEdBQUcsQ0FBQyxPQUFKLENBQVksZ0JBQVosR0FBK0IsWUFBVztBQUN4QyxNQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsNENBQUQsQ0FBWDtBQUNBLEVBQUEsR0FBRyxDQUFDLFNBQUosQ0FBYztBQUNaLElBQUEsTUFBTSxFQUFFLEtBREk7QUFFWixJQUFBLE1BQU0sRUFBRSxzQkFGSTtBQUdaLElBQUEsSUFBSSxFQUFFLGNBQVMsS0FBVCxFQUFnQixFQUFoQixFQUFvQjtBQUN4QixVQUFHLEVBQUUsQ0FBQyxRQUFILENBQVksR0FBWixHQUFrQixDQUFyQixFQUF3QixFQUFFLENBQUMsUUFBSCxDQUFZLEdBQVosR0FBa0IsQ0FBbEI7QUFDeEIsVUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQUQsQ0FBRCxDQUFVLE1BQVYsRUFBYjtBQUNBLFVBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBWSxHQUFaLEdBQWtCLE1BQU0sR0FBRyxFQUE5QixFQUFrQyxFQUFFLENBQUMsUUFBSCxDQUFZLEdBQVosR0FBa0IsTUFBTSxHQUFHLEVBQTNCO0FBQ2xDLFVBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxNQUFELENBQUQsQ0FBVSxLQUFWLEVBQWY7QUFDQSxVQUFHLEVBQUUsQ0FBQyxRQUFILENBQVksSUFBWixHQUFtQixRQUFRLEdBQUcsRUFBakMsRUFBcUMsRUFBRSxDQUFDLFFBQUgsQ0FBWSxJQUFaLEdBQW1CLFFBQVEsR0FBRyxFQUE5QjtBQUN0QztBQVRXLEdBQWQ7QUFXQSxFQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVMsV0FBVCxFQUFzQixNQUF0QjtBQUNBLE1BQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxNQUFELENBQUQsQ0FBVSxLQUFWLEVBQVo7O0FBQ0EsT0FBSSxJQUFJLENBQUMsR0FBRyxDQUFaLEVBQWUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUF2QixFQUErQixDQUFDLEVBQWhDLEVBQW9DO0FBQ2xDLFFBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFKLENBQU8sQ0FBUCxDQUFSO0FBQ0EsSUFBQSxDQUFDLENBQUMsR0FBRixDQUFNLE1BQU4sRUFBYyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBRixFQUFULElBQW9CLEdBQWxDO0FBQ0Q7QUFDRixDQW5CRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qXHJcbiog5Yid5aeL5YyW6Z2e5Zu65a6a57G75by556qXXHJcbiog6K6+572uLnVuZml4ZWQtcGFuZWzkuLrlj6/mi5bliqhcclxuKiDorr7nva4udW5maXhlZC1wYW5lbC10aXRsZeS4uuaLluWKqOaJi+afhFxyXG4qICovXHJcbk5LQy5tZXRob2RzLmluaXRVbmZpeGVkUGFuZWwgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgZG9tID0gJChcIi51bmZpeGVkLXBhbmVsOm5vdCgnW2RhdGEtaW5pdD1cXFwidHJ1ZVxcXCJdJylcIik7XHJcbiAgZG9tLmRyYWdnYWJsZSh7XHJcbiAgICBzY3JvbGw6IGZhbHNlLFxyXG4gICAgaGFuZGxlOiBcIi51bmZpeGVkLXBhbmVsLXRpdGxlXCIsXHJcbiAgICBkcmFnOiBmdW5jdGlvbihldmVudCwgdWkpIHtcclxuICAgICAgaWYodWkucG9zaXRpb24udG9wIDwgMCkgdWkucG9zaXRpb24udG9wID0gMDtcclxuICAgICAgdmFyIGhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKTtcclxuICAgICAgaWYodWkucG9zaXRpb24udG9wID4gaGVpZ2h0IC0gMzApIHVpLnBvc2l0aW9uLnRvcCA9IGhlaWdodCAtIDMwO1xyXG4gICAgICB2YXIgd2luV2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcclxuICAgICAgaWYodWkucG9zaXRpb24ubGVmdCA+IHdpbldpZHRoIC0gMzApIHVpLnBvc2l0aW9uLmxlZnQgPSB3aW5XaWR0aCAtIDMwO1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIGRvbS5hdHRyKFwiZGF0YS1pbml0XCIsIFwidHJ1ZVwiKTtcclxuICB2YXIgd2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcclxuICBmb3IodmFyIGkgPSAwOyBpIDwgZG9tLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgZCA9IGRvbS5lcShpKTtcclxuICAgIGQuY3NzKFwibGVmdFwiLCAod2lkdGggLSBkLndpZHRoKCkpKjAuNSk7XHJcbiAgfVxyXG59OyJdfQ==
