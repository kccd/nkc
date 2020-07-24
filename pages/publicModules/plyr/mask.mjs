const threadSettings = NKC.methods.getDataById("threadSettings");
if(!threadSettings.isDisplay) {
  NKC.methods.initPlyrMask = () => {};
} else {
  NKC.methods.initPlyrMask = function(player) {
    const container = player.elements.container;
    $(container).find(".plyr__control.plyr__control--overlaid").remove();
    let maskDom = $("#plyrMask .plyr-mask").clone(false);
    let maskPlayButton = maskDom.find(".player-tip-button .play");
    let maskDownloadButton = maskDom.find(".player-tip-button .download");
    maskPlayButton.on("click", () => {
      maskDom.remove();
      player.play();
    });
    maskDownloadButton.on("click", () => NKC.methods.visitUrl(player.download, "_blank"));
    $(container).append(maskDom);
  }
}
