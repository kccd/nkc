(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var threadSettings = NKC.methods.getDataById("threadSettings");

if (!threadSettings.isDisplay) {
  NKC.methods.initPlyrMask = function () {};
} else {
  NKC.methods.initPlyrMask = function (player) {
    var container = player.elements.container;
    $(container).find(".plyr__control.plyr__control--overlaid").remove();
    var maskDom = $("#plyrMask .plyr-mask").clone(false);
    var maskPlayButton = maskDom.find(".player-tip-button .play");
    var maskDownloadButton = maskDom.find(".player-tip-button .download");
    maskPlayButton.on("click", function () {
      maskDom.remove();
      player.play();

      if (player.type === "audio") {
        $(player.elements.controls).css("height", "");
      }
    });
    maskDownloadButton.on("click", function () {
      return NKC.methods.visitUrl(player.download, "_blank");
    });

    if (player.type === "audio") {
      maskDom.attr("style", "font-size: 10px");
      $(player.elements.controls).css("height", "150px");
    }

    $(container).append(maskDom);
  };
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL3BseXIvbWFzay5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixnQkFBeEIsQ0FBdkI7O0FBQ0EsSUFBRyxDQUFDLGNBQWMsQ0FBQyxTQUFuQixFQUE4QjtBQUM1QixFQUFBLEdBQUcsQ0FBQyxPQUFKLENBQVksWUFBWixHQUEyQixZQUFNLENBQUUsQ0FBbkM7QUFDRCxDQUZELE1BRU87QUFDTCxFQUFBLEdBQUcsQ0FBQyxPQUFKLENBQVksWUFBWixHQUEyQixVQUFTLE1BQVQsRUFBaUI7QUFDMUMsUUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsU0FBbEM7QUFDQSxJQUFBLENBQUMsQ0FBQyxTQUFELENBQUQsQ0FBYSxJQUFiLENBQWtCLHdDQUFsQixFQUE0RCxNQUE1RDtBQUNBLFFBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxzQkFBRCxDQUFELENBQTBCLEtBQTFCLENBQWdDLEtBQWhDLENBQWQ7QUFDQSxRQUFJLGNBQWMsR0FBRyxPQUFPLENBQUMsSUFBUixDQUFhLDBCQUFiLENBQXJCO0FBQ0EsUUFBSSxrQkFBa0IsR0FBRyxPQUFPLENBQUMsSUFBUixDQUFhLDhCQUFiLENBQXpCO0FBQ0EsSUFBQSxjQUFjLENBQUMsRUFBZixDQUFrQixPQUFsQixFQUEyQixZQUFNO0FBQy9CLE1BQUEsT0FBTyxDQUFDLE1BQVI7QUFDQSxNQUFBLE1BQU0sQ0FBQyxJQUFQOztBQUNBLFVBQUcsTUFBTSxDQUFDLElBQVAsS0FBZ0IsT0FBbkIsRUFBNEI7QUFDMUIsUUFBQSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsUUFBakIsQ0FBRCxDQUE0QixHQUE1QixDQUFnQyxRQUFoQyxFQUEwQyxFQUExQztBQUNEO0FBQ0YsS0FORDtBQU9BLElBQUEsa0JBQWtCLENBQUMsRUFBbkIsQ0FBc0IsT0FBdEIsRUFBK0I7QUFBQSxhQUFNLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWixDQUFxQixNQUFNLENBQUMsUUFBNUIsRUFBc0MsUUFBdEMsQ0FBTjtBQUFBLEtBQS9COztBQUNBLFFBQUcsTUFBTSxDQUFDLElBQVAsS0FBZ0IsT0FBbkIsRUFBNEI7QUFDMUIsTUFBQSxPQUFPLENBQUMsSUFBUixDQUFhLE9BQWIsRUFBc0IsaUJBQXRCO0FBQ0EsTUFBQSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsUUFBakIsQ0FBRCxDQUE0QixHQUE1QixDQUFnQyxRQUFoQyxFQUEwQyxPQUExQztBQUNEOztBQUNELElBQUEsQ0FBQyxDQUFDLFNBQUQsQ0FBRCxDQUFhLE1BQWIsQ0FBb0IsT0FBcEI7QUFDRCxHQW5CRDtBQW9CRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IHRocmVhZFNldHRpbmdzID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoXCJ0aHJlYWRTZXR0aW5nc1wiKTtcclxuaWYoIXRocmVhZFNldHRpbmdzLmlzRGlzcGxheSkge1xyXG4gIE5LQy5tZXRob2RzLmluaXRQbHlyTWFzayA9ICgpID0+IHt9O1xyXG59IGVsc2Uge1xyXG4gIE5LQy5tZXRob2RzLmluaXRQbHlyTWFzayA9IGZ1bmN0aW9uKHBsYXllcikge1xyXG4gICAgY29uc3QgY29udGFpbmVyID0gcGxheWVyLmVsZW1lbnRzLmNvbnRhaW5lcjtcclxuICAgICQoY29udGFpbmVyKS5maW5kKFwiLnBseXJfX2NvbnRyb2wucGx5cl9fY29udHJvbC0tb3ZlcmxhaWRcIikucmVtb3ZlKCk7XHJcbiAgICBsZXQgbWFza0RvbSA9ICQoXCIjcGx5ck1hc2sgLnBseXItbWFza1wiKS5jbG9uZShmYWxzZSk7XHJcbiAgICBsZXQgbWFza1BsYXlCdXR0b24gPSBtYXNrRG9tLmZpbmQoXCIucGxheWVyLXRpcC1idXR0b24gLnBsYXlcIik7XHJcbiAgICBsZXQgbWFza0Rvd25sb2FkQnV0dG9uID0gbWFza0RvbS5maW5kKFwiLnBsYXllci10aXAtYnV0dG9uIC5kb3dubG9hZFwiKTtcclxuICAgIG1hc2tQbGF5QnV0dG9uLm9uKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICBtYXNrRG9tLnJlbW92ZSgpO1xyXG4gICAgICBwbGF5ZXIucGxheSgpO1xyXG4gICAgICBpZihwbGF5ZXIudHlwZSA9PT0gXCJhdWRpb1wiKSB7XHJcbiAgICAgICAgJChwbGF5ZXIuZWxlbWVudHMuY29udHJvbHMpLmNzcyhcImhlaWdodFwiLCBcIlwiKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBtYXNrRG93bmxvYWRCdXR0b24ub24oXCJjbGlja1wiLCAoKSA9PiBOS0MubWV0aG9kcy52aXNpdFVybChwbGF5ZXIuZG93bmxvYWQsIFwiX2JsYW5rXCIpKTtcclxuICAgIGlmKHBsYXllci50eXBlID09PSBcImF1ZGlvXCIpIHtcclxuICAgICAgbWFza0RvbS5hdHRyKFwic3R5bGVcIiwgXCJmb250LXNpemU6IDEwcHhcIik7XHJcbiAgICAgICQocGxheWVyLmVsZW1lbnRzLmNvbnRyb2xzKS5jc3MoXCJoZWlnaHRcIiwgXCIxNTBweFwiKTtcclxuICAgIH1cclxuICAgICQoY29udGFpbmVyKS5hcHBlbmQobWFza0RvbSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==
