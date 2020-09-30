(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

// 从开头播放
function playWithStart(player) {
  player.currentTime = 0;
  return player.play();
} // 回到开头并暂停播放


function pauseAndGoToStart(player) {
  player.pause();
  player.currentTime = 0;
} // 同时只能有一个在播放状态


function onlyOnePlayingAnytime(players) {
  function handle(event) {
    var currentPlayer = event.detail.plyr;
    players.forEach(function (player) {
      if (player !== currentPlayer) {
        pauseAndGoToStart(player);
      }
    });
  }

  players.map(function (player) {
    return player.on("play", handle);
  });
} // 播放完前一个紧接着播放下一个音频


function autoPlayNextAudio(players) {
  players.map(function (player) {
    return player.on("ended", function (event) {
      var currentPlayer = event.detail.plyr;
      var index = players.indexOf(currentPlayer);
      if (index < 0) return;

      for (var i = index; i < players.length; i++) {
        var nextPlayer = players[index + 1];

        if (nextPlayer && nextPlayer.type === "audio") {
          return nextPlayer.play();
        }
      }
    });
  });
}

NKC.methods.initPlayerControls = function (players) {
  onlyOnePlayingAnytime(players);
  autoPlayNextAudio(players);
}; // let audio = document.createElement("audio");
// $("#wrap > div.m-b-1 > div > div > div:nth-child(3) > div > div > div.h3.thread-title.text-center").on("click", () => {
//   audio.webkitShowPlaybackTargetPicker();
// });

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL3BseXIvY29udHJvbHMubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTtBQUNBLFNBQVMsYUFBVCxDQUF1QixNQUF2QixFQUErQjtBQUM3QixFQUFBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLENBQXJCO0FBQ0EsU0FBTyxNQUFNLENBQUMsSUFBUCxFQUFQO0FBQ0QsQyxDQUVEOzs7QUFDQSxTQUFTLGlCQUFULENBQTJCLE1BQTNCLEVBQW1DO0FBQ2pDLEVBQUEsTUFBTSxDQUFDLEtBQVA7QUFDQSxFQUFBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLENBQXJCO0FBQ0QsQyxDQUVEOzs7QUFDQSxTQUFTLHFCQUFULENBQStCLE9BQS9CLEVBQXdDO0FBQ3RDLFdBQVMsTUFBVCxDQUFnQixLQUFoQixFQUFzQjtBQUNwQixRQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsTUFBTixDQUFhLElBQW5DO0FBQ0EsSUFBQSxPQUFPLENBQUMsT0FBUixDQUFnQixVQUFBLE1BQU0sRUFBSTtBQUN4QixVQUFHLE1BQU0sS0FBSyxhQUFkLEVBQTZCO0FBQzNCLFFBQUEsaUJBQWlCLENBQUMsTUFBRCxDQUFqQjtBQUNEO0FBQ0YsS0FKRDtBQUtEOztBQUNELEVBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxVQUFBLE1BQU07QUFBQSxXQUFJLE1BQU0sQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFrQixNQUFsQixDQUFKO0FBQUEsR0FBbEI7QUFDRCxDLENBRUQ7OztBQUNBLFNBQVMsaUJBQVQsQ0FBMkIsT0FBM0IsRUFBb0M7QUFDbEMsRUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLFVBQUEsTUFBTTtBQUFBLFdBQ2hCLE1BQU0sQ0FBQyxFQUFQLENBQVUsT0FBVixFQUFtQixVQUFBLEtBQUssRUFBSTtBQUMxQixVQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsTUFBTixDQUFhLElBQW5DO0FBQ0EsVUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsYUFBaEIsQ0FBWjtBQUNBLFVBQUcsS0FBSyxHQUFHLENBQVgsRUFBYzs7QUFDZCxXQUFJLElBQUksQ0FBQyxHQUFHLEtBQVosRUFBbUIsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUEvQixFQUF1QyxDQUFDLEVBQXhDLEVBQTRDO0FBQzFDLFlBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBVCxDQUExQjs7QUFDQSxZQUFHLFVBQVUsSUFBSSxVQUFVLENBQUMsSUFBWCxLQUFvQixPQUFyQyxFQUE4QztBQUM1QyxpQkFBTyxVQUFVLENBQUMsSUFBWCxFQUFQO0FBQ0Q7QUFDRjtBQUNGLEtBVkQsQ0FEZ0I7QUFBQSxHQUFsQjtBQWFEOztBQUVELEdBQUcsQ0FBQyxPQUFKLENBQVksa0JBQVosR0FBaUMsVUFBUyxPQUFULEVBQWtCO0FBQ2pELEVBQUEscUJBQXFCLENBQUMsT0FBRCxDQUFyQjtBQUNBLEVBQUEsaUJBQWlCLENBQUMsT0FBRCxDQUFqQjtBQUNELENBSEQsQyxDQU9BO0FBRUE7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8g5LuO5byA5aS05pKt5pS+XHJcbmZ1bmN0aW9uIHBsYXlXaXRoU3RhcnQocGxheWVyKSB7XHJcbiAgcGxheWVyLmN1cnJlbnRUaW1lID0gMDtcclxuICByZXR1cm4gcGxheWVyLnBsYXkoKTtcclxufVxyXG5cclxuLy8g5Zue5Yiw5byA5aS05bm25pqC5YGc5pKt5pS+XHJcbmZ1bmN0aW9uIHBhdXNlQW5kR29Ub1N0YXJ0KHBsYXllcikge1xyXG4gIHBsYXllci5wYXVzZSgpO1xyXG4gIHBsYXllci5jdXJyZW50VGltZSA9IDA7XHJcbn1cclxuXHJcbi8vIOWQjOaXtuWPquiDveacieS4gOS4quWcqOaSreaUvueKtuaAgVxyXG5mdW5jdGlvbiBvbmx5T25lUGxheWluZ0FueXRpbWUocGxheWVycykge1xyXG4gIGZ1bmN0aW9uIGhhbmRsZShldmVudCl7XHJcbiAgICBjb25zdCBjdXJyZW50UGxheWVyID0gZXZlbnQuZGV0YWlsLnBseXI7XHJcbiAgICBwbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcclxuICAgICAgaWYocGxheWVyICE9PSBjdXJyZW50UGxheWVyKSB7XHJcbiAgICAgICAgcGF1c2VBbmRHb1RvU3RhcnQocGxheWVyKTtcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbiAgcGxheWVycy5tYXAocGxheWVyID0+IHBsYXllci5vbihcInBsYXlcIiwgaGFuZGxlKSk7XHJcbn1cclxuXHJcbi8vIOaSreaUvuWujOWJjeS4gOS4que0p+aOpeedgOaSreaUvuS4i+S4gOS4qumfs+mikVxyXG5mdW5jdGlvbiBhdXRvUGxheU5leHRBdWRpbyhwbGF5ZXJzKSB7XHJcbiAgcGxheWVycy5tYXAocGxheWVyID0+XHJcbiAgICBwbGF5ZXIub24oXCJlbmRlZFwiLCBldmVudCA9PiB7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRQbGF5ZXIgPSBldmVudC5kZXRhaWwucGx5cjtcclxuICAgICAgbGV0IGluZGV4ID0gcGxheWVycy5pbmRleE9mKGN1cnJlbnRQbGF5ZXIpO1xyXG4gICAgICBpZihpbmRleCA8IDApIHJldHVybjtcclxuICAgICAgZm9yKGxldCBpID0gaW5kZXg7IGkgPCBwbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmV4dFBsYXllciA9IHBsYXllcnNbaW5kZXggKyAxXTtcclxuICAgICAgICBpZihuZXh0UGxheWVyICYmIG5leHRQbGF5ZXIudHlwZSA9PT0gXCJhdWRpb1wiKSB7XHJcbiAgICAgICAgICByZXR1cm4gbmV4dFBsYXllci5wbGF5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgKSlcclxufVxyXG5cclxuTktDLm1ldGhvZHMuaW5pdFBsYXllckNvbnRyb2xzID0gZnVuY3Rpb24ocGxheWVycykge1xyXG4gIG9ubHlPbmVQbGF5aW5nQW55dGltZShwbGF5ZXJzKTtcclxuICBhdXRvUGxheU5leHRBdWRpbyhwbGF5ZXJzKTtcclxufVxyXG5cclxuXHJcblxyXG4vLyBsZXQgYXVkaW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYXVkaW9cIik7XHJcblxyXG4vLyAkKFwiI3dyYXAgPiBkaXYubS1iLTEgPiBkaXYgPiBkaXYgPiBkaXY6bnRoLWNoaWxkKDMpID4gZGl2ID4gZGl2ID4gZGl2LmgzLnRocmVhZC10aXRsZS50ZXh0LWNlbnRlclwiKS5vbihcImNsaWNrXCIsICgpID0+IHtcclxuLy8gICBhdWRpby53ZWJraXRTaG93UGxheWJhY2tUYXJnZXRQaWNrZXIoKTtcclxuLy8gfSk7XHJcbiJdfQ==
