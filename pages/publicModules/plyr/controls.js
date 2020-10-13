(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

// 从开头播放
function playWithStart(player) {
  if (player.paused) {
    player.currentTime = 0;
    return player.play();
  }
} // 回到开头并暂停播放


function pauseAndGoToStart(player) {
  player.currentTime = 0;
  player.pause();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL3BseXIvY29udHJvbHMubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTtBQUNBLFNBQVMsYUFBVCxDQUF1QixNQUF2QixFQUErQjtBQUM3QixNQUFHLE1BQU0sQ0FBQyxNQUFWLEVBQWtCO0FBQ2hCLElBQUEsTUFBTSxDQUFDLFdBQVAsR0FBcUIsQ0FBckI7QUFDQSxXQUFPLE1BQU0sQ0FBQyxJQUFQLEVBQVA7QUFDRDtBQUNGLEMsQ0FFRDs7O0FBQ0EsU0FBUyxpQkFBVCxDQUEyQixNQUEzQixFQUFtQztBQUNqQyxFQUFBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLENBQXJCO0FBQ0EsRUFBQSxNQUFNLENBQUMsS0FBUDtBQUNELEMsQ0FFRDs7O0FBQ0EsU0FBUyxxQkFBVCxDQUErQixPQUEvQixFQUF3QztBQUN0QyxXQUFTLE1BQVQsQ0FBZ0IsS0FBaEIsRUFBc0I7QUFDcEIsUUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFuQztBQUNBLElBQUEsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsVUFBQSxNQUFNLEVBQUk7QUFDeEIsVUFBRyxNQUFNLEtBQUssYUFBZCxFQUE2QjtBQUMzQixRQUFBLGlCQUFpQixDQUFDLE1BQUQsQ0FBakI7QUFDRDtBQUNGLEtBSkQ7QUFLRDs7QUFDRCxFQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksVUFBQSxNQUFNO0FBQUEsV0FBSSxNQUFNLENBQUMsRUFBUCxDQUFVLE1BQVYsRUFBa0IsTUFBbEIsQ0FBSjtBQUFBLEdBQWxCO0FBQ0QsQyxDQUVEOzs7QUFDQSxTQUFTLGlCQUFULENBQTJCLE9BQTNCLEVBQW9DO0FBQ2xDLEVBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxVQUFBLE1BQU07QUFBQSxXQUNoQixNQUFNLENBQUMsRUFBUCxDQUFVLE9BQVYsRUFBbUIsVUFBQSxLQUFLLEVBQUk7QUFDMUIsVUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFuQztBQUNBLFVBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFSLENBQWdCLGFBQWhCLENBQVo7QUFDQSxVQUFHLEtBQUssR0FBRyxDQUFYLEVBQWM7O0FBQ2QsV0FBSSxJQUFJLENBQUMsR0FBRyxLQUFaLEVBQW1CLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBL0IsRUFBdUMsQ0FBQyxFQUF4QyxFQUE0QztBQUMxQyxZQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsS0FBSyxHQUFHLENBQVQsQ0FBMUI7O0FBQ0EsWUFBRyxVQUFVLElBQUksVUFBVSxDQUFDLElBQVgsS0FBb0IsT0FBckMsRUFBOEM7QUFDNUMsaUJBQU8sVUFBVSxDQUFDLElBQVgsRUFBUDtBQUNEO0FBQ0Y7QUFDRixLQVZELENBRGdCO0FBQUEsR0FBbEI7QUFhRDs7QUFFRCxHQUFHLENBQUMsT0FBSixDQUFZLGtCQUFaLEdBQWlDLFVBQVMsT0FBVCxFQUFrQjtBQUNqRCxFQUFBLHFCQUFxQixDQUFDLE9BQUQsQ0FBckI7QUFDQSxFQUFBLGlCQUFpQixDQUFDLE9BQUQsQ0FBakI7QUFDRCxDQUhELEMsQ0FPQTtBQUVBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vIOS7juW8gOWktOaSreaUvlxyXG5mdW5jdGlvbiBwbGF5V2l0aFN0YXJ0KHBsYXllcikge1xyXG4gIGlmKHBsYXllci5wYXVzZWQpIHtcclxuICAgIHBsYXllci5jdXJyZW50VGltZSA9IDA7XHJcbiAgICByZXR1cm4gcGxheWVyLnBsYXkoKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIOWbnuWIsOW8gOWktOW5tuaaguWBnOaSreaUvlxyXG5mdW5jdGlvbiBwYXVzZUFuZEdvVG9TdGFydChwbGF5ZXIpIHtcclxuICBwbGF5ZXIuY3VycmVudFRpbWUgPSAwO1xyXG4gIHBsYXllci5wYXVzZSgpO1xyXG59XHJcblxyXG4vLyDlkIzml7blj6rog73mnInkuIDkuKrlnKjmkq3mlL7nirbmgIFcclxuZnVuY3Rpb24gb25seU9uZVBsYXlpbmdBbnl0aW1lKHBsYXllcnMpIHtcclxuICBmdW5jdGlvbiBoYW5kbGUoZXZlbnQpe1xyXG4gICAgY29uc3QgY3VycmVudFBsYXllciA9IGV2ZW50LmRldGFpbC5wbHlyO1xyXG4gICAgcGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XHJcbiAgICAgIGlmKHBsYXllciAhPT0gY3VycmVudFBsYXllcikge1xyXG4gICAgICAgIHBhdXNlQW5kR29Ub1N0YXJ0KHBsYXllcik7XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG4gIHBsYXllcnMubWFwKHBsYXllciA9PiBwbGF5ZXIub24oXCJwbGF5XCIsIGhhbmRsZSkpO1xyXG59XHJcblxyXG4vLyDmkq3mlL7lrozliY3kuIDkuKrntKfmjqXnnYDmkq3mlL7kuIvkuIDkuKrpn7PpopFcclxuZnVuY3Rpb24gYXV0b1BsYXlOZXh0QXVkaW8ocGxheWVycykge1xyXG4gIHBsYXllcnMubWFwKHBsYXllciA9PlxyXG4gICAgcGxheWVyLm9uKFwiZW5kZWRcIiwgZXZlbnQgPT4ge1xyXG4gICAgICBjb25zdCBjdXJyZW50UGxheWVyID0gZXZlbnQuZGV0YWlsLnBseXI7XHJcbiAgICAgIGxldCBpbmRleCA9IHBsYXllcnMuaW5kZXhPZihjdXJyZW50UGxheWVyKTtcclxuICAgICAgaWYoaW5kZXggPCAwKSByZXR1cm47XHJcbiAgICAgIGZvcihsZXQgaSA9IGluZGV4OyBpIDwgcGxheWVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG5leHRQbGF5ZXIgPSBwbGF5ZXJzW2luZGV4ICsgMV07XHJcbiAgICAgICAgaWYobmV4dFBsYXllciAmJiBuZXh0UGxheWVyLnR5cGUgPT09IFwiYXVkaW9cIikge1xyXG4gICAgICAgICAgcmV0dXJuIG5leHRQbGF5ZXIucGxheSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICkpXHJcbn1cclxuXHJcbk5LQy5tZXRob2RzLmluaXRQbGF5ZXJDb250cm9scyA9IGZ1bmN0aW9uKHBsYXllcnMpIHtcclxuICBvbmx5T25lUGxheWluZ0FueXRpbWUocGxheWVycyk7XHJcbiAgYXV0b1BsYXlOZXh0QXVkaW8ocGxheWVycyk7XHJcbn1cclxuXHJcblxyXG5cclxuLy8gbGV0IGF1ZGlvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImF1ZGlvXCIpO1xyXG5cclxuLy8gJChcIiN3cmFwID4gZGl2Lm0tYi0xID4gZGl2ID4gZGl2ID4gZGl2Om50aC1jaGlsZCgzKSA+IGRpdiA+IGRpdiA+IGRpdi5oMy50aHJlYWQtdGl0bGUudGV4dC1jZW50ZXJcIikub24oXCJjbGlja1wiLCAoKSA9PiB7XHJcbi8vICAgYXVkaW8ud2Via2l0U2hvd1BsYXliYWNrVGFyZ2V0UGlja2VyKCk7XHJcbi8vIH0pO1xyXG4iXX0=
