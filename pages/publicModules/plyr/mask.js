const threadSettings = NKC.methods.getDataById("threadSettings");
NKC.methods.initPlyrMask = function(player) {
  if(player.type === 'video') {
    setVideoMask(player);
  } else {
    const nkcSource = getNkcSource(player.elements.container);
    setVisitorAccessCommonMask(nkcSource);
  }
}

NKC.methods.initAttachmentMask = function(nkcSource) {
  setVisitorAccessCommonMask(nkcSource);
}

function getNkcSource(container) {
  return $(container).parents('[data-tag="nkcsource"]');
}

function getVisitorAccess(nkcSource) {
  return nkcSource.attr('data-visitor-access') === 'true';
}

function getVideoVisitorAccessMask(player) {
  const nkcSource = getNkcSource(player.elements.container);
  nkcSource.find(".plyr__control.plyr__control--overlaid").remove();
  const mask = $("#plyrMask .plyr-mask-video-visitor-access").clone(false);
  mask.find('.player-tip-content').text(getVisitorAccessInfo('video'));
  return mask;
}

function getVideoPreviewMask(player) {
  const nkcSource = getNkcSource(player.elements.container);
  nkcSource.find(".plyr__control.plyr__control--overlaid").remove();
  const mask = $("#plyrMask .plyr-mask-video-preview").clone(false);
  const maskPlayButton = mask.find(".player-tip-button .play");
  const maskDownloadButton = mask.find(".player-tip-button .download");
  const source = nkcSource.find('video source');
  const sourceObj = {};
  // 获取附件名称
  const fileTitleDom = nkcSource.find('span.nkcsource-video-title');
  const title = fileTitleDom.attr('data-title');
  // 获取视频可下载的视频尺寸和下载链接
  for(let i = 0; i < source.length; i++) {
    const element = source.eq(i);
    const size = element.attr('size');
    const dataSize = element.attr('data-size');
    sourceObj[size] = {
      dataSize,
      url: element.attr('src') + '&d=attachment'
    };
  }
  // 修改遮罩上的下载按钮
  /*for(let i = 0; i < maskDownloadButton.length; i++) {
    const element = maskDownloadButton.eq(i);
    const size = element.attr('data-video-size');
    const {url, dataSize} = sourceObj[size];
    if(!url) continue;
    // const dataSizeDom = $("<span></span>");
    // dataSizeDom.text(' ' + dataSize);
    element
      .attr('href', url)
      .attr('data-title', title)
      .attr('title', `点击下载 ${title}`)
      .attr('data-type', 'download')
      .removeClass('hidden')
      // .append(dataSizeDom);
  }*/
  const rid = nkcSource.attr('data-id');
  maskDownloadButton.attr('data-id', rid);
  maskDownloadButton.removeClass('hidden');
  maskPlayButton.on("click", () => {
    mask.remove();
    player.play();
  });
  return mask;
}

function getVisitorAccessInfo(type) {
  return {
    video: '视频',
    audio: '音频',
    attachment: '附件'
  }[type] + '暂不能访问，请登录试试';
}

function getCommonMask(type) {
  const mask = $("#plyrMask .plyr-mask-common").clone(false);
  mask.find('.player-tip-content').text(getVisitorAccessInfo(type));
  return mask;
}

function setVideoMask(player) {
  const nkcSource = getNkcSource(player.elements.container);
  const visitorAccess = getVisitorAccess(nkcSource);
  let mask;
  if(!visitorAccess && !NKC.configs.uid) {
    // 显示游客访问受限的遮罩
    mask = getVideoVisitorAccessMask(player);
  } else if(threadSettings.isDisplay) {
    mask = getVideoPreviewMask(player);
  }
  if(mask) nkcSource.find('.plyr').append(mask);
}

function setAudioMask(player) {
  const nkcSource = getNkcSource(player.elements.container);
  setVisitorAccessCommonMask(nkcSource);
}

function setVisitorAccessCommonMask(nkcSource) {
  const type = nkcSource.attr('data-type');
  const visitorAccess = getVisitorAccess(nkcSource);
  if(visitorAccess || NKC.configs.uid) return;
  const mask = getCommonMask(type);
  nkcSource.append(mask);
}