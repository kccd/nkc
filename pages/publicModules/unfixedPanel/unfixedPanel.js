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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL3VuZml4ZWRQYW5lbC91bmZpeGVkUGFuZWwubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7Ozs7QUFLQSxHQUFHLENBQUMsT0FBSixDQUFZLGdCQUFaLEdBQStCLFlBQVc7QUFDeEMsTUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLDRDQUFELENBQVg7QUFDQSxFQUFBLEdBQUcsQ0FBQyxTQUFKLENBQWM7QUFDWixJQUFBLE1BQU0sRUFBRSxLQURJO0FBRVosSUFBQSxNQUFNLEVBQUUsc0JBRkk7QUFHWixJQUFBLElBQUksRUFBRSxjQUFTLEtBQVQsRUFBZ0IsRUFBaEIsRUFBb0I7QUFDeEIsVUFBRyxFQUFFLENBQUMsUUFBSCxDQUFZLEdBQVosR0FBa0IsQ0FBckIsRUFBd0IsRUFBRSxDQUFDLFFBQUgsQ0FBWSxHQUFaLEdBQWtCLENBQWxCO0FBQ3hCLFVBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFELENBQUQsQ0FBVSxNQUFWLEVBQWI7QUFDQSxVQUFHLEVBQUUsQ0FBQyxRQUFILENBQVksR0FBWixHQUFrQixNQUFNLEdBQUcsRUFBOUIsRUFBa0MsRUFBRSxDQUFDLFFBQUgsQ0FBWSxHQUFaLEdBQWtCLE1BQU0sR0FBRyxFQUEzQjtBQUNsQyxVQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsTUFBRCxDQUFELENBQVUsS0FBVixFQUFmO0FBQ0EsVUFBRyxFQUFFLENBQUMsUUFBSCxDQUFZLElBQVosR0FBbUIsUUFBUSxHQUFHLEVBQWpDLEVBQXFDLEVBQUUsQ0FBQyxRQUFILENBQVksSUFBWixHQUFtQixRQUFRLEdBQUcsRUFBOUI7QUFDdEM7QUFUVyxHQUFkO0FBV0EsRUFBQSxHQUFHLENBQUMsSUFBSixDQUFTLFdBQVQsRUFBc0IsTUFBdEI7QUFDQSxNQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsTUFBRCxDQUFELENBQVUsS0FBVixFQUFaOztBQUNBLE9BQUksSUFBSSxDQUFDLEdBQUcsQ0FBWixFQUFlLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBdkIsRUFBK0IsQ0FBQyxFQUFoQyxFQUFvQztBQUNsQyxRQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBSixDQUFPLENBQVAsQ0FBUjtBQUNBLElBQUEsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxNQUFOLEVBQWMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUYsRUFBVCxJQUFvQixHQUFsQztBQUNEO0FBQ0YsQ0FuQkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKlxyXG4qIOWIneWni+WMlumdnuWbuuWumuexu+W8ueeql1xyXG4qIOiuvue9ri51bmZpeGVkLXBhbmVs5Li65Y+v5ouW5YqoXHJcbiog6K6+572uLnVuZml4ZWQtcGFuZWwtdGl0bGXkuLrmi5bliqjmiYvmn4RcclxuKiAqL1xyXG5OS0MubWV0aG9kcy5pbml0VW5maXhlZFBhbmVsID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIGRvbSA9ICQoXCIudW5maXhlZC1wYW5lbDpub3QoJ1tkYXRhLWluaXQ9XFxcInRydWVcXFwiXScpXCIpO1xyXG4gIGRvbS5kcmFnZ2FibGUoe1xyXG4gICAgc2Nyb2xsOiBmYWxzZSxcclxuICAgIGhhbmRsZTogXCIudW5maXhlZC1wYW5lbC10aXRsZVwiLFxyXG4gICAgZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XHJcbiAgICAgIGlmKHVpLnBvc2l0aW9uLnRvcCA8IDApIHVpLnBvc2l0aW9uLnRvcCA9IDA7XHJcbiAgICAgIHZhciBoZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XHJcbiAgICAgIGlmKHVpLnBvc2l0aW9uLnRvcCA+IGhlaWdodCAtIDMwKSB1aS5wb3NpdGlvbi50b3AgPSBoZWlnaHQgLSAzMDtcclxuICAgICAgdmFyIHdpbldpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XHJcbiAgICAgIGlmKHVpLnBvc2l0aW9uLmxlZnQgPiB3aW5XaWR0aCAtIDMwKSB1aS5wb3NpdGlvbi5sZWZ0ID0gd2luV2lkdGggLSAzMDtcclxuICAgIH1cclxuICB9KTtcclxuICBkb20uYXR0cihcImRhdGEtaW5pdFwiLCBcInRydWVcIik7XHJcbiAgdmFyIHdpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XHJcbiAgZm9yKHZhciBpID0gMDsgaSA8IGRvbS5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIGQgPSBkb20uZXEoaSk7XHJcbiAgICBkLmNzcyhcImxlZnRcIiwgKHdpZHRoIC0gZC53aWR0aCgpKSowLjUpO1xyXG4gIH1cclxufTsiXX0=
