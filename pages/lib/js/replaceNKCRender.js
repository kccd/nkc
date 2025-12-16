import { replaceNKCUrl } from './nkcUrl';

export function replaceNKCRender(selector) {
  return replaceNKCUrl(selector);
}
const initPlyrMask = window.NKC.methods.initPlyrMask;
export function initNKCVideo() {
  var players = [];
  var videoControls = [
    'play-large',
    'play',
    'progress',
    'current-time',
    'mute',
    'volume',
    'captions',
    'settings',
    'pip',
    'airplay',
    'fullscreen',
  ];
  var audioControls = [
    'play-large',
    'play',
    'progress',
    'current-time',
    'mute',
    'volume',
    'captions',
    'pip',
    'airplay',
    'fullscreen',
  ];
  // 切换视频分辨率之后重新设置视频的下载链接
  var setPlayerDownloadUrl = function (player, dom) {
    player.download = dom.attr('src') + '&d=attachment';
    var title = dom.attr('data-plyr-title');
    var nkcsource = dom.parents(
      'span[data-type="video"][data-tag="nkcsource"]',
    );
    var downloadElement = nkcsource.find('a[data-plyr="download"]');
    downloadElement.attr('data-type', 'download').attr('data-title', title);
  };
  var addEvents = function (player, dom) {
    player.on('qualitychange', function () {
      setPlayerDownloadUrl(player, dom);
    });
    player.on('ready', function (d) {
      setPlayerDownloadUrl(player, dom);
      initPlyrMask(player);
    });
  };
  var videos = window.$('span[data-tag="nkcsource"][data-type="video"]');
  for (var i = 0; i < videos.length; i++) {
    var video = videos.eq(i);
    var title = video.attr('data-plyr-title');
    var rid = video.attr('data-rid');
    var plyrDom = video.find('.plyr-dom');
    if (plyrDom.length === 0) {
      continue;
    }
    var player = new window.Plyr(plyrDom, {
      ratio: '4:3',
      title: title,
      controls: videoControls,
      settings: ['quality'],
      quality: { default: 720, options: [1080, 720, 480] },
      blankVideo: '/external_pkgs/plyr/blank.mp4',
      autopause: true,
    });
    addEvents(player, plyrDom);
    player.speed = 1;
    players.push(player);
  }
}
