import { strToObj, objToStr } from './dataConversion';
import { base64ToStr } from './dataConversion';
import { getState } from './state';
import { getSize, getUrl } from './tools';
import hljs from 'highlight.js';
const isLogged = !!getState().uid;
import { lazyLoadInit } from './lazyLoad';
import { copyTextToClipboard } from './clipboard';
import { logger } from './logger';
import { screenTopAlert } from './topAlert';
import { fixLanguage, highlightLanguagesObject } from './highlight';
import { renderNKCDocNumber } from './nkcDocNumber';
import { RNUpdateMusicListAndPlay } from './reactNative';

export function initNKCRenderImagesView() {
  const imageElements = window.$(
    '.render-content img[data-global-click="viewImage"]',
  );
  const images = [];
  for (let i = 0; i < imageElements.length; i++) {
    const imageElement = imageElements.eq(i);
    const image = {
      url: '',
      name: '',
    };
    let data = imageElement.attr('data-global-data');
    if (data) {
      data = strToObj(data) || {};
      if (!data.url || !data.name) {
        continue;
      }
      image.url = data.url;
      image.name = data.name;
      image.width = data.width;
      image.height = data.height;
    }
    images.push(image);
  }
  for (let i = 0; i < images.length; i++) {
    const imageElement = imageElements.eq(i);
    imageElement.attr('data-global-click', 'viewImages').attr(
      'data-global-data',
      objToStr({
        images,
        index: i,
      }),
    );
  }
}

export function renderingMathJax() {
  const dom = document.querySelectorAll('.render-content.math-jax');
  if (window.MathJax && dom) {
    window.MathJax.typeset(dom);
  }
}

// 渲染富文本内容中的视频
// 基本结构来自后端的：
// nkcModules/nkcRender/nodes/videoBlock.pug
// nkcModules/nkcRender/sources/article.js
export function renderingNKCVideo() {
  const videoContainers = document.querySelectorAll(
    `[data-tag="nkcsource"][data-type="video"]`,
  );
  for (const videoContainer of videoContainers) {
    if (videoContainer.getAttribute('data-initialized') === 'true') {
      continue;
    }
    videoContainer.setAttribute('data-initialized', 'true');
    const plyrDom = videoContainer.querySelector('video.plyr-dom');
    if (plyrDom === null) {
      continue;
    }
    const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    videoContainer.setAttribute('data-unique-id', uniqueId);
    // 播放提示，为空则不显示
    const mask = videoContainer.getAttribute('data-mask');
    const rid = videoContainer.getAttribute('data-id');
    // 是否允许游客观看视频
    const visitorAccess =
      videoContainer.getAttribute('data-visitor-access') === 'true';
    new window.Plyr(plyrDom, {
      ratio: '4:3',
      controls: [
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
      ],
      settings: ['quality', 'speed'],
      quality: { default: 720, options: [1080, 720, 480] },
      blankVideo: '/external_pkgs/plyr/blank.mp4',
      autopause: true,
    });
    const maskContainer = videoContainer.querySelector('span');
    const maskDomStyle = `
      display: flex;
      height: 100%;
      width: 100%;
      z-index: 101;
      flex-direction: column;
      background-color: rgba(0,0,0,0.85);
      justify-content: center;
      align-items: center;
      position: absolute;
      top: 0;
      left: 0;
      padding: 0 1rem;
    `;
    const maskTextStyle = `
      color: #fff;
      margin-bottom: 1rem;
      font-size: 1.2rem;
    `;
    const maskButtonStyle = `
      margin-right: 0.5rem;
      border: none;
      margin-bottom: 0.5rem;
      cursor: pointer;
      font-size: 1.2rem;
      border-radius: 2px;
      display: inline-block;
      color: #fff;
      background-color: rgba(0, 179, 255, 0.7);
      height: 2.4rem;
      line-height: 2.4rem;
      padding: 0 0.5rem;
      text-decoration: none;
    `;
    // 渲染游客访问限制遮罩
    if (!isLogged && !visitorAccess) {
      const maskDom = window.$(`
        <div style="${maskDomStyle}" data-nkc-video-mask-id="${uniqueId}">
          <div style="${maskTextStyle}">视频暂不能访问，请登录试试。</div>
          <div>
            <button style="${maskButtonStyle}" onclick='RootApp.openLoginPanel()'>登录</button>
            <button style="${maskButtonStyle}" onclick='RootApp.openLoginPanel("register")'>注册</button>
          </div>
        </div
        `);
      maskContainer.appendChild(maskDom[0]);
    } else if (mask) {
      // 用户点击预览按钮时执行的函数
      let previewButtonOnClick = '';
      if (getState().isApp && getState().appVersionCode >= 5) {
        // 对于直接筛入原生js指令，app可以直接使用window.ReactNativeWebView.postMessage({type,data})
        previewButtonOnClick = `RootApp.viewVideoForApp(${rid})`;
      } else {
        previewButtonOnClick = `
        var video = document.querySelector('[data-tag=\\'nkcsource\\'][data-type=\\'video\\'][data-id=\\'${rid}\\'][data-unique-id=\\'${uniqueId}\\'] video');
        video.play();
        var mask = document.querySelector('[data-nkc-video-mask-id=\\'${uniqueId}\\']');
        mask.remove();
      `;
      }
      const maskDom = window.$(`
        <div style="${maskDomStyle}" data-nkc-video-mask-id="${uniqueId}">
          <div style="${maskTextStyle}">${mask}</div>
          <div>
            <button 
              style="${maskButtonStyle}" 
              data-global-click="openDownloadPanel"
              data-global-data="${objToStr({ rid })}"
            >
              <div class="fa fa-cloud-download"></div>
              <span>点击下载</span>
            </button>
            <button 
              style="${maskButtonStyle}" 
              onclick="${previewButtonOnClick}"
            >
              <div class="fa fa-play-circle"></div>
              <span>预览</span>
            </button>
          </div>
        </div>
      `);
      maskContainer.appendChild(maskDom[0]);
    }
    if (!mask && getState().isApp && getState().appVersionCode >= 5) {
      let previewButtonOnClick = '';
      previewButtonOnClick = `RootApp.viewVideoForApp(${rid})`;
      const maskDom = window.$(`
        <div style="${maskDomStyle}background-color:transparent;">
        </div>
      `);
      maskDom.on('click', () => {
        window.RootApp.viewVideoForApp(rid);
      });
      maskContainer.appendChild(maskDom[0]);
    }
  }
}

// 渲染富文本中的音频
// 基本结构来自后端：
// nkcModules/nkcRender/nodes/audioBlock.pug
// nkcModules/nkcRender/sources/article.js
export function renderingNKCAudio() {
  const audioContainers = document.querySelectorAll(
    `[data-tag="nkcsource"][data-type="audio"]`,
  );
  for (const audioContainer of audioContainers) {
    if (audioContainer.getAttribute('data-initialized') === 'true') {
      continue;
    }
    audioContainer.setAttribute('data-initialized', 'true');
    if (getState().isApp) {
      const rid = audioContainer.getAttribute('data-id');
      const audioTitle = audioContainer.querySelector(
        'span.nkcsource-audio-title',
      );
      const title = audioTitle.textContent;
      audioTitle.remove();
      let size = audioContainer.querySelector('audio[data-size]');
      if (size.length !== 0) {
        size = Number(size.getAttribute('data-size'));
      } else {
        size = 0;
      }
      size = getSize(size);
      // 获取音频源 URL
      const sourceElement = audioContainer.querySelector('source');
      const url = sourceElement ? sourceElement.getAttribute('src') : '';
      // 创建 DOM 元素
      const appAudio = document.createElement('div');
      appAudio.className = 'app-audio';

      const playIcon = document.createElement('div');
      playIcon.className = 'fa fa-play app-audio-icon';
      playIcon.onclick = function () {
        // 选择所有符合条件的 span 元素
        const elements = document.querySelectorAll(
          'span[data-tag="nkcsource"][data-type="audio"]',
        );
        let audiosId = [];
        let audiosTitle = [];
        let urls = [];

        // 遍历所有元素
        elements.forEach(function (e) {
          const rid = e.getAttribute('data-id');
          const titleElement = e.querySelector('.app-audio-title');
          var url = titleElement ? titleElement.getAttribute('data-url') : '';

          var title = titleElement ? titleElement.textContent : '';

          // 检查是否已经存在 rid，避免重复
          if (!audiosId.includes(rid)) {
            audiosId.push(rid);
            audiosTitle.push(title);
            urls.push(url);
          }
        });

        // 找到 targetRid 的索引
        var index = audiosId.indexOf(rid);
        if (index > 0) {
          var _audiosId = audiosId.splice(0, index);
          var _audiosTitle = audiosTitle.splice(0, index);
          var _urls = urls.splice(0, index);

          audiosId = audiosId.concat(_audiosId);
          audiosTitle = audiosTitle.concat(_audiosTitle);
          urls = urls.concat(_urls);
        }

        // 创建音乐列表
        const list = [];
        for (let i = 0; i < audiosId.length; i++) {
          let url = urls[i];
          if (!url.startsWith('http') && !url.startsWith('https')) {
            url = window.location.origin + url; // 确保 URL 是完整的
          }
          list.push({
            url: url,
            name: audiosTitle[i],
            from: window.location.href,
          });
        }
        // 更新音乐列表并播放
        RNUpdateMusicListAndPlay(list);
      };

      const appAudioContainer = document.createElement('div');
      appAudioContainer.className = 'app-audio-container';

      const appAudioTitle = document.createElement('a');
      appAudioTitle.className = 'app-audio-title';
      appAudioTitle.setAttribute('data-url', url);
      appAudioTitle.setAttribute('data-global-click', 'openDownloadPanel');
      appAudioTitle.setAttribute('data-global-data', objToStr({ rid }));
      appAudioTitle.textContent = title;
      var appAudioInfo = document.createElement('div');
      appAudioInfo.className = 'app-audio-info';
      var sizeSpan = document.createElement('span');
      sizeSpan.className = 'm-r-05';
      sizeSpan.textContent = size;
      var downloadLink = document.createElement('a');
      downloadLink.setAttribute('data-global-click', 'openDownloadPanel');
      downloadLink.setAttribute('data-global-data', objToStr({ rid }));
      downloadLink.textContent = '下载';
      // 组装 DOM 结构
      appAudioInfo.appendChild(sizeSpan);
      appAudioInfo.appendChild(downloadLink);
      appAudioContainer.appendChild(appAudioTitle);
      appAudioContainer.appendChild(appAudioInfo);
      appAudio.appendChild(playIcon);
      appAudio.appendChild(appAudioContainer);
      // 清空 audio 元素并添加新内容
      audioContainer.replaceChildren(appAudio);
    } else {
      const plyrDom = audioContainer.querySelector('audio.plyr-dom');
      if (plyrDom === null) {
        continue;
      }
      new window.Plyr(plyrDom, {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'mute',
          'volume',
        ],
        autopause: true,
      });
    }
    // 是否允许游客观看视频
    const visitorAccess =
      audioContainer.getAttribute('data-visitor-access') === 'true';
    if (!isLogged && !visitorAccess) {
      const maskDomStyle = `
        display: flex;
        height: 100%;
        width: 100%;
        z-index: 101;
        flex-direction: column;
        background-color: rgba(0,0,0,0.85);
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 0;
        left: 0;
        padding: 0 1rem;
      `;
      const maskTextStyle = `
        color: #fff;
        margin-bottom: 1rem;
        font-size: 1.2rem;
      `;
      const maskButtonStyle = `
        margin-right: 0.5rem;
        border: none;
        margin-bottom: 0.5rem;
        cursor: pointer;
        font-size: 1.2rem;
        border-radius: 2px;
        display: inline-block;
        color: #fff;
        background-color: rgba(0, 179, 255, 0.7);
        height: 2.4rem;
        line-height: 2.4rem;
        padding: 0 0.5rem;
        text-decoration: none;
      `;
      const maskDom = window.$(`
          <div style="${maskDomStyle}">
            <div style="${maskTextStyle}">音频暂不能访问，请登录试试。</div>
            <div>
              <button style="${maskButtonStyle}" onclick='RootApp.openLoginPanel()'>登录</button>
              <button style="${maskButtonStyle}" onclick='RootApp.openLoginPanel("register")'>注册</button>
            </div>
          </div
          `);
      audioContainer.appendChild(maskDom[0]);
    }
  }
}

// 渲染富文本中的图片
// 基本结构来自后端：
// nkcModules/nkcRender/nodes/picutreInline.pug
// nkcModules/nkcRender/sources/article.js
export function renderingNKCPicture() {
  const containers = document.querySelectorAll(
    '[data-tag="nkcsource"][data-type="picture"]',
  );
  const images = [];
  for (let i = 0; i < containers.length; i++) {
    const container = containers[i];
    const rid = container.getAttribute('data-id');
    images.push({
      url: getUrl('resource', rid),
      name: '',
    });
  }
  const globalClick = 'viewImages';
  for (let i = 0; i < containers.length; i++) {
    const container = containers[i];
    const globalData = objToStr({
      index: i,
      images: images,
    });
    const image = container.querySelector('img');
    if (image) {
      image.setAttribute('data-global-click', globalClick);
      image.setAttribute('data-global-data', globalData);
    }
  }
}

export function renderCodeBlock() {
  const containers = document.querySelectorAll(
    `pre[data-tag="nkcsource"][data-type="pre"]`,
  );
  containers.forEach((container) => {
    if (container.getAttribute('data-initialized') === 'true') {
      return;
    }
    container.setAttribute('data-initialized', 'true');
    const code = container.querySelector('code');
    if (!code) {
      return;
    }
    const codeText = code.innerText;
    const multipleLineMode = code.getAttribute('data-line-mode') === 'multiple';
    let language = fixLanguage(
      container.getAttribute('data-id').trim().toLowerCase(),
    );
    let html = '';
    if (language === 'other') {
      const r = hljs.highlightAuto(codeText);
      html = r.value;
      language = r.language;
    } else {
      const r = hljs.highlight(codeText, {
        language,
      });
      html = r.value;
    }
    language = fixLanguage(language);
    const languageName =
      highlightLanguagesObject[language] || highlightLanguagesObject['other'];
    code.innerHTML = html;
    const headerDiv = document.createElement('div');
    const span = document.createElement('span');
    span.innerText = languageName;
    const copyButton = document.createElement('button');
    copyButton.setAttribute('class', 'btn btn-default btn-xs');
    copyButton.innerText = '复制';
    copyButton.onclick = () => {
      copyTextToClipboard(codeText)
        .then(() => {
          return screenTopAlert('代码已复制到粘贴板');
        })
        .catch(logger.error);
    };
    const lineButton = document.createElement('button');
    lineButton.setAttribute('class', 'btn btn-default btn-xs m-r-05');
    const resetLineBreakStatus = (_multipleLineMode) => {
      lineButton.innerText = _multipleLineMode
        ? '关闭自动换行'
        : '开启自动换行';
      lineButton.onclick = () => {
        resetLineBreakStatus(!_multipleLineMode);
      };
      code.setAttribute(
        'data-line-mode',
        _multipleLineMode ? 'multiple' : 'single',
      );
    };
    resetLineBreakStatus(multipleLineMode);
    const buttonContainer = document.createElement('div');
    buttonContainer.appendChild(lineButton);
    buttonContainer.appendChild(copyButton);
    headerDiv.appendChild(span);
    headerDiv.appendChild(buttonContainer);
    container.prepend(headerDiv);
  });
}

export function renderNKCURL() {
  const elements = document.querySelectorAll('span[data-type="nkc-url"]');
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    let url = element.getAttribute('data-url') || '';
    if (!url) {
      continue;
    }
    url = base64ToStr(url);
    element.innerText = url;
    element.removeAttribute('data-type');
    element.removeAttribute('data-url');
  }
}

export function initNKCSource() {
  renderingMathJax();
  renderingNKCVideo();
  renderingNKCAudio();
  renderingNKCPicture();
  lazyLoadInit();
  renderCodeBlock();
  renderNKCURL();
  renderNKCDocNumber();
}
