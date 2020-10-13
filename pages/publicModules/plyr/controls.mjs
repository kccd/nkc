// 从开头播放
function playWithStart(player) {
  if(player.paused) {
    player.currentTime = 0;
    return player.play();
  }
}

// 回到开头并暂停播放
function pauseAndGoToStart(player) {
  player.currentTime = 0;
  player.pause();
}

// 同时只能有一个在播放状态
function onlyOnePlayingAnytime(players) {
  console.log(players);
  function handle(event){
    const currentPlayer = event.detail.plyr;
    players.forEach(player => {
      if(player !== currentPlayer) {
        pauseAndGoToStart(player);
      }
    })
  }
  players.map(player => player.on("play", handle));
}

// 播放完前一个紧接着播放下一个音频
function autoPlayNextAudio(players) {
  players.map(player =>
    player.on("ended", event => {
      const currentPlayer = event.detail.plyr;
      let index = players.indexOf(currentPlayer);
      if(index < 0) return;
      for(let i = index; i < players.length; i++) {
        const nextPlayer = players[index + 1];
        if(nextPlayer && nextPlayer.type === "audio") {
          return nextPlayer.play();
        }
      }
    }
  ))
}

NKC.methods.initPlayerControls = function(players) {
  onlyOnePlayingAnytime(players);
  autoPlayNextAudio(players);
}



// let audio = document.createElement("audio");

// $("#wrap > div.m-b-1 > div > div > div:nth-child(3) > div > div > div.h3.thread-title.text-center").on("click", () => {
//   audio.webkitShowPlaybackTargetPicker();
// });
