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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL3BseXIvY29udHJvbHMubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTtBQUNBLFNBQVMsYUFBVCxDQUF1QixNQUF2QixFQUErQjtBQUM3QixFQUFBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLENBQXJCO0FBQ0EsU0FBTyxNQUFNLENBQUMsSUFBUCxFQUFQO0FBQ0QsQyxDQUVEOzs7QUFDQSxTQUFTLGlCQUFULENBQTJCLE1BQTNCLEVBQW1DO0FBQ2pDLEVBQUEsTUFBTSxDQUFDLEtBQVA7QUFDQSxFQUFBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLENBQXJCO0FBQ0QsQyxDQUVEOzs7QUFDQSxTQUFTLHFCQUFULENBQStCLE9BQS9CLEVBQXdDO0FBQ3RDLFdBQVMsTUFBVCxDQUFnQixLQUFoQixFQUFzQjtBQUNwQixRQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsTUFBTixDQUFhLElBQW5DO0FBQ0EsSUFBQSxPQUFPLENBQUMsT0FBUixDQUFnQixVQUFBLE1BQU0sRUFBSTtBQUN4QixVQUFHLE1BQU0sS0FBSyxhQUFkLEVBQTZCO0FBQzNCLFFBQUEsaUJBQWlCLENBQUMsTUFBRCxDQUFqQjtBQUNEO0FBQ0YsS0FKRDtBQUtEOztBQUNELEVBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxVQUFBLE1BQU07QUFBQSxXQUFJLE1BQU0sQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFrQixNQUFsQixDQUFKO0FBQUEsR0FBbEI7QUFDRCxDLENBRUQ7OztBQUNBLFNBQVMsaUJBQVQsQ0FBMkIsT0FBM0IsRUFBb0M7QUFDbEMsRUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLFVBQUEsTUFBTTtBQUFBLFdBQ2hCLE1BQU0sQ0FBQyxFQUFQLENBQVUsT0FBVixFQUFtQixVQUFBLEtBQUssRUFBSTtBQUMxQixVQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsTUFBTixDQUFhLElBQW5DO0FBQ0EsVUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsYUFBaEIsQ0FBWjtBQUNBLFVBQUcsS0FBSyxHQUFHLENBQVgsRUFBYzs7QUFDZCxXQUFJLElBQUksQ0FBQyxHQUFHLEtBQVosRUFBbUIsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUEvQixFQUF1QyxDQUFDLEVBQXhDLEVBQTRDO0FBQzFDLFlBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBVCxDQUExQjs7QUFDQSxZQUFHLFVBQVUsQ0FBQyxJQUFYLEtBQW9CLE9BQXZCLEVBQWdDO0FBQzlCLGlCQUFPLFVBQVUsQ0FBQyxJQUFYLEVBQVA7QUFDRDtBQUNGO0FBQ0YsS0FWRCxDQURnQjtBQUFBLEdBQWxCO0FBYUQ7O0FBRUQsR0FBRyxDQUFDLE9BQUosQ0FBWSxrQkFBWixHQUFpQyxVQUFTLE9BQVQsRUFBa0I7QUFDakQsRUFBQSxxQkFBcUIsQ0FBQyxPQUFELENBQXJCO0FBQ0EsRUFBQSxpQkFBaUIsQ0FBQyxPQUFELENBQWpCO0FBQ0QsQ0FIRCxDLENBT0E7QUFFQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyDku47lvIDlpLTmkq3mlL5cclxuZnVuY3Rpb24gcGxheVdpdGhTdGFydChwbGF5ZXIpIHtcclxuICBwbGF5ZXIuY3VycmVudFRpbWUgPSAwO1xyXG4gIHJldHVybiBwbGF5ZXIucGxheSgpO1xyXG59XHJcblxyXG4vLyDlm57liLDlvIDlpLTlubbmmoLlgZzmkq3mlL5cclxuZnVuY3Rpb24gcGF1c2VBbmRHb1RvU3RhcnQocGxheWVyKSB7XHJcbiAgcGxheWVyLnBhdXNlKCk7XHJcbiAgcGxheWVyLmN1cnJlbnRUaW1lID0gMDtcclxufVxyXG5cclxuLy8g5ZCM5pe25Y+q6IO95pyJ5LiA5Liq5Zyo5pKt5pS+54q25oCBXHJcbmZ1bmN0aW9uIG9ubHlPbmVQbGF5aW5nQW55dGltZShwbGF5ZXJzKSB7XHJcbiAgZnVuY3Rpb24gaGFuZGxlKGV2ZW50KXtcclxuICAgIGNvbnN0IGN1cnJlbnRQbGF5ZXIgPSBldmVudC5kZXRhaWwucGx5cjtcclxuICAgIHBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xyXG4gICAgICBpZihwbGF5ZXIgIT09IGN1cnJlbnRQbGF5ZXIpIHtcclxuICAgICAgICBwYXVzZUFuZEdvVG9TdGFydChwbGF5ZXIpO1xyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuICBwbGF5ZXJzLm1hcChwbGF5ZXIgPT4gcGxheWVyLm9uKFwicGxheVwiLCBoYW5kbGUpKTtcclxufVxyXG5cclxuLy8g5pKt5pS+5a6M5YmN5LiA5Liq57Sn5o6l552A5pKt5pS+5LiL5LiA5Liq6Z+z6aKRXHJcbmZ1bmN0aW9uIGF1dG9QbGF5TmV4dEF1ZGlvKHBsYXllcnMpIHtcclxuICBwbGF5ZXJzLm1hcChwbGF5ZXIgPT4gXHJcbiAgICBwbGF5ZXIub24oXCJlbmRlZFwiLCBldmVudCA9PiB7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRQbGF5ZXIgPSBldmVudC5kZXRhaWwucGx5cjtcclxuICAgICAgbGV0IGluZGV4ID0gcGxheWVycy5pbmRleE9mKGN1cnJlbnRQbGF5ZXIpO1xyXG4gICAgICBpZihpbmRleCA8IDApIHJldHVybjtcclxuICAgICAgZm9yKGxldCBpID0gaW5kZXg7IGkgPCBwbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbmV4dFBsYXllciA9IHBsYXllcnNbaW5kZXggKyAxXTtcclxuICAgICAgICBpZihuZXh0UGxheWVyLnR5cGUgPT09IFwiYXVkaW9cIikge1xyXG4gICAgICAgICAgcmV0dXJuIG5leHRQbGF5ZXIucGxheSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICkpXHJcbn1cclxuXHJcbk5LQy5tZXRob2RzLmluaXRQbGF5ZXJDb250cm9scyA9IGZ1bmN0aW9uKHBsYXllcnMpIHtcclxuICBvbmx5T25lUGxheWluZ0FueXRpbWUocGxheWVycyk7XHJcbiAgYXV0b1BsYXlOZXh0QXVkaW8ocGxheWVycyk7XHJcbn1cclxuXHJcblxyXG5cclxuLy8gbGV0IGF1ZGlvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImF1ZGlvXCIpO1xyXG5cclxuLy8gJChcIiN3cmFwID4gZGl2Lm0tYi0xID4gZGl2ID4gZGl2ID4gZGl2Om50aC1jaGlsZCgzKSA+IGRpdiA+IGRpdiA+IGRpdi5oMy50aHJlYWQtdGl0bGUudGV4dC1jZW50ZXJcIikub24oXCJjbGlja1wiLCAoKSA9PiB7XHJcbi8vICAgYXVkaW8ud2Via2l0U2hvd1BsYXliYWNrVGFyZ2V0UGlja2VyKCk7XHJcbi8vIH0pOyJdfQ==
