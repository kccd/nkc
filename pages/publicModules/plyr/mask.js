(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var threadSettings = NKC.methods.getDataById("threadSettings");

if (!threadSettings.isDisplay) {
  NKC.methods.initPlyrMask = function () {};
} else {
  NKC.methods.initPlyrMask = function (player) {
    var container = player.elements.container;
    var maskDom = $("#plyrMask .plyr-mask").clone(false);
    var maskPlayButton = maskDom.find(".player-tip-button .play");
    var maskDownloadButton = maskDom.find(".player-tip-button .download");
    maskPlayButton.on("click", function () {
      maskDom.remove();
      player.play();
    });
    maskDownloadButton.on("click", function () {
      return NKC.methods.visitUrl(player.download, "_blank");
    });
    $(container).append(maskDom);
  };
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL3BseXIvbWFzay5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixnQkFBeEIsQ0FBdkI7O0FBQ0EsSUFBRyxDQUFDLGNBQWMsQ0FBQyxTQUFuQixFQUE4QjtBQUM1QixFQUFBLEdBQUcsQ0FBQyxPQUFKLENBQVksWUFBWixHQUEyQixZQUFNLENBQUUsQ0FBbkM7QUFDRCxDQUZELE1BRU87QUFDTCxFQUFBLEdBQUcsQ0FBQyxPQUFKLENBQVksWUFBWixHQUEyQixVQUFTLE1BQVQsRUFBaUI7QUFDMUMsUUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsU0FBbEM7QUFDQSxRQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsc0JBQUQsQ0FBRCxDQUEwQixLQUExQixDQUFnQyxLQUFoQyxDQUFkO0FBQ0EsUUFBSSxjQUFjLEdBQUcsT0FBTyxDQUFDLElBQVIsQ0FBYSwwQkFBYixDQUFyQjtBQUNBLFFBQUksa0JBQWtCLEdBQUcsT0FBTyxDQUFDLElBQVIsQ0FBYSw4QkFBYixDQUF6QjtBQUNBLElBQUEsY0FBYyxDQUFDLEVBQWYsQ0FBa0IsT0FBbEIsRUFBMkIsWUFBTTtBQUMvQixNQUFBLE9BQU8sQ0FBQyxNQUFSO0FBQ0EsTUFBQSxNQUFNLENBQUMsSUFBUDtBQUNELEtBSEQ7QUFJQSxJQUFBLGtCQUFrQixDQUFDLEVBQW5CLENBQXNCLE9BQXRCLEVBQStCO0FBQUEsYUFBTSxHQUFHLENBQUMsT0FBSixDQUFZLFFBQVosQ0FBcUIsTUFBTSxDQUFDLFFBQTVCLEVBQXNDLFFBQXRDLENBQU47QUFBQSxLQUEvQjtBQUNBLElBQUEsQ0FBQyxDQUFDLFNBQUQsQ0FBRCxDQUFhLE1BQWIsQ0FBb0IsT0FBcEI7QUFDRCxHQVhEO0FBWUQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCB0aHJlYWRTZXR0aW5ncyA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKFwidGhyZWFkU2V0dGluZ3NcIik7XHJcbmlmKCF0aHJlYWRTZXR0aW5ncy5pc0Rpc3BsYXkpIHtcclxuICBOS0MubWV0aG9kcy5pbml0UGx5ck1hc2sgPSAoKSA9PiB7fTtcclxufSBlbHNlIHtcclxuICBOS0MubWV0aG9kcy5pbml0UGx5ck1hc2sgPSBmdW5jdGlvbihwbGF5ZXIpIHtcclxuICAgIGNvbnN0IGNvbnRhaW5lciA9IHBsYXllci5lbGVtZW50cy5jb250YWluZXI7XHJcbiAgICBsZXQgbWFza0RvbSA9ICQoXCIjcGx5ck1hc2sgLnBseXItbWFza1wiKS5jbG9uZShmYWxzZSk7XHJcbiAgICBsZXQgbWFza1BsYXlCdXR0b24gPSBtYXNrRG9tLmZpbmQoXCIucGxheWVyLXRpcC1idXR0b24gLnBsYXlcIik7XHJcbiAgICBsZXQgbWFza0Rvd25sb2FkQnV0dG9uID0gbWFza0RvbS5maW5kKFwiLnBsYXllci10aXAtYnV0dG9uIC5kb3dubG9hZFwiKTtcclxuICAgIG1hc2tQbGF5QnV0dG9uLm9uKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICBtYXNrRG9tLnJlbW92ZSgpO1xyXG4gICAgICBwbGF5ZXIucGxheSgpO1xyXG4gICAgfSk7XHJcbiAgICBtYXNrRG93bmxvYWRCdXR0b24ub24oXCJjbGlja1wiLCAoKSA9PiBOS0MubWV0aG9kcy52aXNpdFVybChwbGF5ZXIuZG93bmxvYWQsIFwiX2JsYW5rXCIpKTtcclxuICAgICQoY29udGFpbmVyKS5hcHBlbmQobWFza0RvbSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==
