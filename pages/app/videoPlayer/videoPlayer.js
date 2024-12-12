const isRN = !!window.ReactNativeWebView;
window.addEventListener('error', (err) => {
  isRN && window.ReactNativeWebView.postMessage(err.message || err.toString());
});

function initVideoPlayer(
  videoInfo = {
    poster: 'https://img.kechuang.org:81/r/362713?c=resource&t=cover',
    sources: [
      {
        src: 'https://img.kechuang.org:81/r/362713?c=resource&t=fhd&w=gkz3wt0v',
        type: 'video/mp4',
        size: 576,
      },
      {
        src: 'https://img.kechuang.org:81/r/362713?c=resource&t=fhd&w=gkz3wt0v',
        type: 'video/mp4',
        size: 720,
      },
      {
        src: 'https://img.kechuang.org:81/r/362713?c=resource&t=fhd&w=gkz3wt0v',
        type: 'video/mp4',
        size: 1080,
      },
    ],
  },
) {
  const { poster, sources } = videoInfo;
  const video = document.createElement('video');
  video.controls = true;
  video.autoplay = true;
  video.crossOrigin = '';
  video.poster = poster;
  for (let i = 0; i < sources.length; i++) {
    const sourceInfo = sources[i];
    const source = document.createElement('source');
    source.src = sourceInfo.src;
    source.type = sourceInfo.type;
    source.setAttribute('size', sourceInfo.size);
    video.appendChild(source);
  }
  const container = document.getElementById('container');
  container.appendChild(video);
  const player = new window.Plyr('video', {
    controls: ['play-large', 'play', 'progress', 'duration', 'settings'],
    settings: ['quality', 'speed'],
    disableContextMenu: true,
    volume: 1,
    clickToPlay: false,
    resetOnEnd: true,
    fullscreen: {
      enabled: false,
    },
  });

  player.fullscreen.enter();

  document.addEventListener('click', () => {
    player.fullscreen.exit();
  });
  window.player = player;
}
window.initVideoPlayer = initVideoPlayer;
if (!isRN) {
  initVideoPlayer();
}
