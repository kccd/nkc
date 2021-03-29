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
  // 视频进入全屏时，自动切换到最高画质
  whenFullscreenSwitchHighestQuality(players);
}

// 全屏时自动切换到最高画质
function whenFullscreenSwitchHighestQuality(players) {
  for(const player of players) {
    if(player.type === "audio") continue;
    player.on("enterfullscreen", () => {
      player.quality = 1080;
    })
  }
}
