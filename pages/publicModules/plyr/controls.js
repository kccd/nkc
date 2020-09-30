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
  console.log(players);
  players.map(function (player) {
    return player.on("ended", function (event) {
      var currentPlayer = event.detail.plyr;
      var index = players.indexOf(currentPlayer);
      if (index < 0) return;

      for (var i = index; i < players.length; i++) {
        var nextPlayer = players[index + 1];

        if (nextPlayer.type === "audio") {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL3BseXIvY29udHJvbHMubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTtBQUNBLFNBQVMsYUFBVCxDQUF1QixNQUF2QixFQUErQjtBQUM3QixFQUFBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLENBQXJCO0FBQ0EsU0FBTyxNQUFNLENBQUMsSUFBUCxFQUFQO0FBQ0QsQyxDQUVEOzs7QUFDQSxTQUFTLGlCQUFULENBQTJCLE1BQTNCLEVBQW1DO0FBQ2pDLEVBQUEsTUFBTSxDQUFDLEtBQVA7QUFDQSxFQUFBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLENBQXJCO0FBQ0QsQyxDQUVEOzs7QUFDQSxTQUFTLHFCQUFULENBQStCLE9BQS9CLEVBQXdDO0FBQ3RDLFdBQVMsTUFBVCxDQUFnQixLQUFoQixFQUFzQjtBQUNwQixRQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsTUFBTixDQUFhLElBQW5DO0FBQ0EsSUFBQSxPQUFPLENBQUMsT0FBUixDQUFnQixVQUFBLE1BQU0sRUFBSTtBQUN4QixVQUFHLE1BQU0sS0FBSyxhQUFkLEVBQTZCO0FBQzNCLFFBQUEsaUJBQWlCLENBQUMsTUFBRCxDQUFqQjtBQUNEO0FBQ0YsS0FKRDtBQUtEOztBQUNELEVBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxVQUFBLE1BQU07QUFBQSxXQUFJLE1BQU0sQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFrQixNQUFsQixDQUFKO0FBQUEsR0FBbEI7QUFDRCxDLENBRUQ7OztBQUNBLFNBQVMsaUJBQVQsQ0FBMkIsT0FBM0IsRUFBb0M7QUFDbEMsRUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLE9BQVo7QUFDQSxFQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksVUFBQSxNQUFNO0FBQUEsV0FDaEIsTUFBTSxDQUFDLEVBQVAsQ0FBVSxPQUFWLEVBQW1CLFVBQUEsS0FBSyxFQUFJO0FBQzFCLFVBQU0sYUFBYSxHQUFHLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBbkM7QUFDQSxVQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBUixDQUFnQixhQUFoQixDQUFaO0FBQ0EsVUFBRyxLQUFLLEdBQUcsQ0FBWCxFQUFjOztBQUNkLFdBQUksSUFBSSxDQUFDLEdBQUcsS0FBWixFQUFtQixDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQS9CLEVBQXVDLENBQUMsRUFBeEMsRUFBNEM7QUFDMUMsWUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFULENBQTFCOztBQUNBLFlBQUcsVUFBVSxDQUFDLElBQVgsS0FBb0IsT0FBdkIsRUFBZ0M7QUFDOUIsaUJBQU8sVUFBVSxDQUFDLElBQVgsRUFBUDtBQUNEO0FBQ0Y7QUFDRixLQVZELENBRGdCO0FBQUEsR0FBbEI7QUFhRDs7QUFFRCxHQUFHLENBQUMsT0FBSixDQUFZLGtCQUFaLEdBQWlDLFVBQVMsT0FBVCxFQUFrQjtBQUNqRCxFQUFBLHFCQUFxQixDQUFDLE9BQUQsQ0FBckI7QUFDQSxFQUFBLGlCQUFpQixDQUFDLE9BQUQsQ0FBakI7QUFDRCxDQUhELEMsQ0FPQTtBQUVBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vIOS7juW8gOWktOaSreaUvlxyXG5mdW5jdGlvbiBwbGF5V2l0aFN0YXJ0KHBsYXllcikge1xyXG4gIHBsYXllci5jdXJyZW50VGltZSA9IDA7XHJcbiAgcmV0dXJuIHBsYXllci5wbGF5KCk7XHJcbn1cclxuXHJcbi8vIOWbnuWIsOW8gOWktOW5tuaaguWBnOaSreaUvlxyXG5mdW5jdGlvbiBwYXVzZUFuZEdvVG9TdGFydChwbGF5ZXIpIHtcclxuICBwbGF5ZXIucGF1c2UoKTtcclxuICBwbGF5ZXIuY3VycmVudFRpbWUgPSAwO1xyXG59XHJcblxyXG4vLyDlkIzml7blj6rog73mnInkuIDkuKrlnKjmkq3mlL7nirbmgIFcclxuZnVuY3Rpb24gb25seU9uZVBsYXlpbmdBbnl0aW1lKHBsYXllcnMpIHtcclxuICBmdW5jdGlvbiBoYW5kbGUoZXZlbnQpe1xyXG4gICAgY29uc3QgY3VycmVudFBsYXllciA9IGV2ZW50LmRldGFpbC5wbHlyO1xyXG4gICAgcGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XHJcbiAgICAgIGlmKHBsYXllciAhPT0gY3VycmVudFBsYXllcikge1xyXG4gICAgICAgIHBhdXNlQW5kR29Ub1N0YXJ0KHBsYXllcik7XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG4gIHBsYXllcnMubWFwKHBsYXllciA9PiBwbGF5ZXIub24oXCJwbGF5XCIsIGhhbmRsZSkpO1xyXG59XHJcblxyXG4vLyDmkq3mlL7lrozliY3kuIDkuKrntKfmjqXnnYDmkq3mlL7kuIvkuIDkuKrpn7PpopFcclxuZnVuY3Rpb24gYXV0b1BsYXlOZXh0QXVkaW8ocGxheWVycykge1xyXG4gIGNvbnNvbGUubG9nKHBsYXllcnMpO1xyXG4gIHBsYXllcnMubWFwKHBsYXllciA9PiBcclxuICAgIHBsYXllci5vbihcImVuZGVkXCIsIGV2ZW50ID0+IHtcclxuICAgICAgY29uc3QgY3VycmVudFBsYXllciA9IGV2ZW50LmRldGFpbC5wbHlyO1xyXG4gICAgICBsZXQgaW5kZXggPSBwbGF5ZXJzLmluZGV4T2YoY3VycmVudFBsYXllcik7XHJcbiAgICAgIGlmKGluZGV4IDwgMCkgcmV0dXJuO1xyXG4gICAgICBmb3IobGV0IGkgPSBpbmRleDsgaSA8IHBsYXllcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBuZXh0UGxheWVyID0gcGxheWVyc1tpbmRleCArIDFdO1xyXG4gICAgICAgIGlmKG5leHRQbGF5ZXIudHlwZSA9PT0gXCJhdWRpb1wiKSB7XHJcbiAgICAgICAgICByZXR1cm4gbmV4dFBsYXllci5wbGF5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgKSlcclxufVxyXG5cclxuTktDLm1ldGhvZHMuaW5pdFBsYXllckNvbnRyb2xzID0gZnVuY3Rpb24ocGxheWVycykge1xyXG4gIG9ubHlPbmVQbGF5aW5nQW55dGltZShwbGF5ZXJzKTtcclxuICBhdXRvUGxheU5leHRBdWRpbyhwbGF5ZXJzKTtcclxufVxyXG5cclxuXHJcblxyXG4vLyBsZXQgYXVkaW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYXVkaW9cIik7XHJcblxyXG4vLyAkKFwiI3dyYXAgPiBkaXYubS1iLTEgPiBkaXYgPiBkaXYgPiBkaXY6bnRoLWNoaWxkKDMpID4gZGl2ID4gZGl2ID4gZGl2LmgzLnRocmVhZC10aXRsZS50ZXh0LWNlbnRlclwiKS5vbihcImNsaWNrXCIsICgpID0+IHtcclxuLy8gICBhdWRpby53ZWJraXRTaG93UGxheWJhY2tUYXJnZXRQaWNrZXIoKTtcclxuLy8gfSk7Il19
