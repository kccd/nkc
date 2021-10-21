const threadSettings = NKC.methods.getDataById("threadSettings");
if(!threadSettings.isDisplay) {
  NKC.methods.initPlyrMask = () => {};
} else {
  NKC.methods.initPlyrMask = function(player) {
    if(player.type === "audio") return;
    const container = player.elements.container;
    $(container).find(".plyr__control.plyr__control--overlaid").remove();
    let maskDom = $("#plyrMask .plyr-mask").clone(false);
    let maskPlayButton = maskDom.find(".player-tip-button .play");
    let maskDownloadButton = maskDom.find(".player-tip-button .download");
    const source = $(container).find('video source');
    const sourceObj = {};
    // 获取附件名称
    const downloadButton = $(container).find('a[data-plyr="download"]');
    const title = downloadButton.attr('data-title');
    // 获取视频可下载的视频尺寸和下载链接
    for(let i = 0; i < source.length; i++) {
      const element = source.eq(i);
      const size = element.attr('size');
      sourceObj[size] = element.attr('src') + '&d=attachment';
    }
    // 修改遮罩上的下载按钮
    for(let i = 0; i < maskDownloadButton.length; i++) {
      const element = maskDownloadButton.eq(i);
      const size = element.attr('data-video-size');
      const url = sourceObj[size];
      if(!url) continue;
      element
        .attr('href', url)
        .attr('data-title', title)
        .attr('title', `点击下载 ${title}`)
        .attr('data-type', 'download')
        .removeClass('hidden')
    }
    // 给预览按钮添加事件
    maskPlayButton.on("click", () => {
      maskDom.remove();
      player.play();
    });
    $(container).append(maskDom);
  }
}
