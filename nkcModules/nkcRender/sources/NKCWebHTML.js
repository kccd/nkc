const { getUrl, getSize } = require('../../tools');
const cheerio = require('../customCheerio');
const videoSize = require('../../../settings/video');
module.exports = {
  // 图片
  picture(props) {
    const { rid, resource, limitVisitor } = props;

    if (!resource) {
      return `
        <div data-tag="nkcsource" data-type="picture-not-found" data-id="${rid}">
          <span>图片已丢失（rid: ${rid}）</span>
        </div> 
      `.trim();
    }

    const { defaultFile = {} } = resource;
    const oname = defaultFile.name || '未知';
    const { width, height } = defaultFile;
    const url = getUrl('resource', rid);

    if (resource.disabled) {
      return `
         <div data-tag="nkcsource" data-type="picture-disabled" data-id="${rid}">
           <span>图片已被屏蔽</span>
         </div>
        `.trim();
    }

    if (limitVisitor) {
      return `
        <div data-tag="nkcsource" data-type="picture" data-id="${rid}">
          <span>图片暂不能访问，请登录试试</span>
        </div>
      `.trim();
    }

    let maskHTML = '';
    if (limitVisitor) {
      maskHTML = `
        <div data-type="picture-mask">
          <span>图片暂不能访问，请登录试试</span>
        </div>
      `;
    }

    if (!width || !height) {
      return `
        <div data-tag="nkcsource" data-type="picture" data-id="${rid}">
          ${maskHTML}
          <img src="${url}" alt="${oname}">
        </div>
      `.trim();
    }

    return `
        <span data-tag="nkcsource" data-type="picture" data-id="${rid}">
          <span style="padding-top: ${(height * 100) / width}%">
            ${maskHTML}
            <img data-src="${url}" alt="${oname}" class="lazyload">
          </span>
        </span>
      `.trim();
  },

  // 表情
  sticker(props) {
    const { rid } = props;
    const url = getUrl('sticker', rid);
    return `
      <span data-tag="nkcsource" data-type="sticker" data-id="${rid}">
        <img src="${url}" alt="sticker">
      </span>
    `.trim();
  },

  // 视频
  video(props) {
    const { rid, resource, limitVisitor, showMask, maskContent } = props;

    if (!resource) {
      return `
        <div data-tag="nkcsource" data-type="video-not-found" data-id="${rid}">
          <span>视频已丢失（rid: ${rid}）</span>
        </div>
      `.trim();
    }

    const { defaultFile = {} } = resource;
    const oname = defaultFile.name || 'Unknown';
    const poster = getUrl('resourceCover', rid);

    if (resource.disabled) {
      return `
        <div data-tag="nkcsource" data-type="video-disabled" data-id="${rid}">
          <span>视频已被屏蔽</span>
        </div>
      `.trim();
    }

    if (!resource.isFileExist) {
      return `
        <div data-tag="nkcsource" data-type="video-not-found" data-id="${rid}">
          <span>视频已丢失（${oname}）</span>
        </div>
      `.trim();
    }

    let sourceHTML = '';

    for (const { size, dataSize } of resource.videoSize) {
      const { height } = videoSize[size];
      const url = getUrl('resource', rid, size) + `&w=` + resource.token;
      sourceHTML += `<source src="${url}" type="video/mp4" data-video-size="${height}" data-file-size="${dataSize}"> 你的浏览器不支持video标签，请升级。`;
    }

    let maskHTML = '';

    if (limitVisitor) {
      maskHTML = ` 
          <div data-type="video-mask">
            视频暂不能访问，请登录试试
            <button>登录</button>
            <button>注册</button>    
          </div>
        `;
    } else if (showMask) {
      maskHTML = `
          <div data-type="video-mask">
            <div>${maskContent}</div>
            <button>下载</button>
            <button>预览</button>
          </div> 
        `;
    }

    return `
        <div data-tag="nkcsource" data-type="video" data-id="${rid}">
          ${maskHTML}
          <video class="plyr-dom" preload="none" controls="controls" poster="${poster}" data-rid="${rid}" data-plyr-title="${oname}">
            ${sourceHTML}
          </video>
          <span data-type="nkcsource-video-title">
            <span>${oname}</span>
            <span>Download</span>
          </span>
        </div>
      `.trim();
  },

  // 音频
  audio(props) {
    const { rid, resource, limitVisitor } = props;
    if (!resource) {
      return `
        <div data-tag="nkcsource" data-type="audio-not-found">
          <span>音频已丢失（rid: ${rid}）</span>
        </div>
      `.trim();
    }
    const { defaultFile = {} } = resource;

    const oname = defaultFile.name || 'Unknown';

    const url = getUrl('resource', rid) + `&w=` + resource.token;

    if (resource.disabled) {
      return `
        <div data-tag="nkcsource" data-type="audio-disabled" data-id="${rid}">
          <span>音频已被屏蔽</span>
        </div>
      `.trim();
    }

    if (!resource.isFileExist) {
      return `
        <div data-tag="nkcsource" data-type="audio-not-found" data-id="${rid}">
          <span>音频已丢失（${oname}）</span>
        </div>
      `.trim();
    }

    let maskHTML = ``;
    if (limitVisitor) {
      maskHTML = `
        <div data-type="video-mask">
          音频暂不能访问，请登录试试
          <button>登录</button>
          <button>注册</button>    
        </div>
      `;
    }

    return `
      <div data-tag="nkcsource" data-type="audio" data-id="${rid}">
        ${maskHTML}
        <audio class="plyr-dom" preload="none" controls data-rid="${rid}" data-size="${
      defaultFile.size
    }">
          <source src="${url}" type="audio/mp3"/>
          你的浏览器不支持audio标签，请升级。
        </audio>
        <span data-type="nkcsource-audio-title">
          <span>${oname}</span>
          <span>${getSize(defaultFile.size)}</span>
          <span>Download</span>
      </div>
    `.trim();
  },
  attachment(props) {
    const { rid, resource, limitVisitor } = props;

    if (!resource) {
      return `
        <div data-tag="nkcsource" data-type="attachment-not-found" data-id="${rid}">
          <span>附件已丢失（rid: ${rid}）</span>
        </div>
      `.trim();
    }

    const { ext = '', hits = 0, defaultFile = {} } = resource;
    const oname = defaultFile.name || '未知';
    const size = defaultFile.size;

    if (resource.disabled) {
      return `
        <div data-tag="nkcsource" data-type="attachment-disabled" data-id="${rid}">
          <span>附件已被屏蔽</span>
        </div>
      `.trim();
    }

    if (!resource.isFileExist) {
      return `
        <div data-tag="nkcsource" data-type="attachment-not-found" data-id="${rid}">
          <span>附件已丢失（${oname}）</span>
        </div>
      `.trim();
    }

    const fileCover = getUrl('fileCover', ext);
    let pdfHTML = '';
    if (ext === 'pdf') {
      pdfHTML = `
        <span data-type="attachment-reader">
          <a href="/reader/pdf/web/viewer?file=%2fr%2f${rid}?time%3D${Date.now()}" target="_blank">预览</a>
          <span>预览文件已被压缩处理，并不代表真实文件质量</span>
        </span>
      `.trim();
    }

    let maskHTML = '';
    if (limitVisitor) {
      maskHTML = `
        <div data-type="attachment-mask">
          附件暂不能访问，请登录试试
          <button>登录</button>
          <button>注册</button>    
        </div>
      `;
    }

    return `
      <div data-tag="nkcsource" data-type="attachment" data-id="${rid}">
        ${maskHTML}
        <span data-type="attachment-icon">
          <img src="${fileCover}" alt="attachment icon">
        </span>
        <span data-type="attachment-content">
          <span data-type="attachment-name" title="${oname}">${oname}</span>
          <span data-type="attachment-info">
            <span data-type="attachment-size">${getSize(size)}</span>
            <span data-type="attachment-ext">${ext.toUpperCase()}</span>
            <span data-type="attachment-hits">${hits}次下载</span>
            ${pdfHTML}
          </span>
        </span>
      </div>
    `.trim();
  },

  // 代码框
  pre(props) {
    const { html } = props;
    return html
      .replace(/<pre(.*?)>([\s\S]*?)<\/pre>/gi, (content, v1, v2) => {
        return `<pre${v1}>${v2}</pre>`;
      })
      .trim();
  },

  // 学术分隐藏
  xsf(props) {
    const { html, presetMinXSF, userXSF } = props;
    const $ = cheerio.load(html);
    let content;
    if (Number(presetMinXSF) <= Number(userXSF)) {
      content = $('section').html();
    } else {
      content = '内容已隐藏';
    }
    return `<span data-tag="nkcsource" data-type="xsf" data-id="${presetMinXSF}"><span>浏览这段内容需要${presetMinXSF}学术分</span><span>${content}</span></span>`.trim();
  },
};
