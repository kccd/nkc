const threadSettings = NKC.methods.getDataById("threadSettings");

if(!threadSettings.playerTips.isDisplay) {
  NKC.methods.initPlyrMask = () => {};
} else {
  NKC.methods.initPlyrMask = function(player) {
    const container = player.elements.container;
    const playButton = container.querySelector(".plyr__control--overlaid[data-plyr='play']");
    playButton.remove();
    let template = document.querySelector("#plyrMask");
    let maskDom = template.content.cloneNode(true);
    let maskPlayButton = maskDom.querySelector(".player-tip-button .play");
    let maskDownloadButton = maskDom.querySelector(".player-tip-button .download");
    maskPlayButton.addEventListener("click", () => {
      container.querySelector(".plyr-mask").remove();
      player.play();
    });
    maskDownloadButton.addEventListener("click", () => NKC.methods.visitUrl(player.download));
    container.appendChild(maskDom);
  }
}