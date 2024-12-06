import { strToObj, objToStr } from './dataConversion';
import { getState } from './state';
import { getUrl } from './tools';
const isLogged = !!getState().uid;
import { lazyLoadInit } from './lazyLoad';

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
    const plyrDom = videoContainer.querySelector('video.plyr-dom');
    if (plyrDom === null) {
      continue;
    }
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
    const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
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
      const previewButtonOnClick = `
        var video = document.querySelector('[data-tag=\\'nkcsource\\'][data-type=\\'video\\'] video');
        video.play();
        var mask = document.querySelector('[data-nkc-video-mask-id=\\'${uniqueId}\\']');
        mask.remove();
      `;
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
    const plyrDom = audioContainer.querySelector('audio.plyr-dom');
    if (plyrDom === null) {
      continue;
    }
    // 是否允许游客观看视频
    const visitorAccess =
      audioContainer.getAttribute('data-visitor-access') === 'true';
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

export function initNKCSource() {
  renderingMathJax();
  renderingNKCVideo();
  renderingNKCAudio();
  renderingNKCPicture();
  lazyLoadInit();
}
