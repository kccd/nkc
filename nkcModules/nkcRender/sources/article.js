const {getUrl, getSize} = require("../../tools");
const cheerio = require("../customCheerio");
const {htmlEscape} = require("../htmlEscape");
const videoSize = require('../../../settings/video');
module.exports = {
  picture(html = "", id, resource = {}) {
    const {
      rid = id,
      disabled,
      defaultFile
    } = resource || {};
    const oname = defaultFile.name || '未知';
    const {width, height} = defaultFile;
    const url = getUrl("resource", rid);
    if(resource.disabled) {
      return `
         <span data-tag="nkcsource" data-type="picture-is-disable" data-id="${id}" style="text-align: center">
<!--           <span class="fa fa-ban" data-type="disabled" data-id="${id}-${disabled}" title="屏蔽"></span>-->
           <span data-type="view" style="font-size: 32px;width: 100%">图片已被屏蔽</span>
         </span>
        `.trim();
    }
    if(!width || !height) {
      return `
        <span data-tag="nkcsource" data-type="picture" data-id="${id}">
          <img src="${url}" alt="${oname}" data-type="view" dataimg="content">
        </span>
      `.trim();
    } else {
      return `
        <span data-tag="nkcsource" data-type="picture" data-id="${id}" style="width: ${width}px;">
          <span style="padding-top: ${(height * 100) / width}%">
            <img data-src="${url}" alt="${oname}" data-type="view" dataimg="content" class="lazyload">
          </span>
        </span>
      `.trim();
    }
  },
  sticker(html, id) {
    const url = getUrl("sticker", id);
    return `
      <span data-tag="nkcsource" data-type="sticker" data-id="${id}">
        <img src="${url}" alt="sticker">
      </span>
    `.trim();
  },
  video(html = "", id, resource = {}) {
    const {
      visitorAccess = true,
      rid = id,
      defaultFile
    } = resource;
    const oname = defaultFile.name || '未知';
    const poster = getUrl("resourceCover", rid);
    if(resource.disabled){
      return `<span data-tag="nkcsource" data-type="video-not-found" data-id="${id}"><span>视频已被屏蔽</span></span>`
    }
    if(resource.isFileExist) {
      let sourceHtml = '';
      let downloadHtml = '';
      for(const {size, dataSize} of resource.videoSize) {
        const {height} = videoSize[size];
        const url = getUrl('resource', rid, size) + '&w=' + resource.token;
        // const downloadUrl = getUrl('resourceDownload', rid, size);
        sourceHtml += `<source src="${url}" type="video/mp4" size="${height}" data-size="${dataSize}"> 你的浏览器不支持video标签，请升级。`;
        // downloadHtml += `<a href="${downloadUrl}" data-type="download" data-title="${oname}" target="_blank">${height}p(${dataSize})</a> `;
      }
      downloadHtml = `<a data-type="downloadPanel" data-id="${resource.rid}">点击下载</a>`
      return `
      <span data-tag="nkcsource" data-type="video" data-id="${id}" data-visitor-access="${visitorAccess}">
        <span>
          <video class="plyr-dom" preload="none" controls="controls" poster="${poster}" data-rid="${rid}" data-plyr-title="${oname}">
            ${sourceHtml}
          </video>
        </span>
        <span class="nkcsource-video-title" data-title="${oname}"><span>${oname}&nbsp;</span><span>${downloadHtml}</span></span>
      </span>
    `.trim();
    } else {
      return `<span data-tag="nkcsource" data-type="video-not-found" data-id="${id}"><span>视频已丢失（${oname}）</span></span>`
    }

    //<span class="nkcsource-video-title">${resource.oname}</span>
  },
  audio(html = "", id, resource = {}) {
    const {
      oname = "未知",
      rid = id,
      visitorAccess = true,
      defaultFile
    } = resource;
    const url = getUrl("resource", id) + '&w=' + resource.token;
    if(resource.disabled){
      return `<span data-tag="nkcsource" data-type="audio-not-found" data-id="${id}"><span>音频已被屏蔽</span></span>`
    }
    if(!resource.isFileExist){
      return `<span data-tag="nkcsource" data-type="audio-not-found" data-id="${id}"><span>音频已丢失</span></br><span>${oname}</span></span>`
    }
    const downloadHtml = `<a data-type='downloadPanel' data-id="${resource.rid}">立即下载</a>`
    return `
        <span data-tag="nkcsource" data-type="audio" data-id="${id}" data-visitor-access="${visitorAccess}">
          <audio class="plyr-dom" preload="none" controls data-rid="${id}" data-size="${defaultFile.size}">
            <source src="${url}" type="audio/mp3"/>
            你的浏览器不支持audio标签，请升级。
          </audio>
          <span class="nkcsource-audio-title">${defaultFile.name} <span class="display-i-b text-danger" style="font-weight: 700">${getSize(defaultFile.size)}</span>${downloadHtml}</span>
        </span>
    `.trim();
  },
  attachment(html = "", id, resource = {}) {
    const {
      ext = "",
      hits = 0,
      rid = id,
      visitorAccess = true,
      defaultFile
    } = resource;
    const oname = defaultFile.name || '未知';
    const size = defaultFile.size;
    const fileCover = getUrl("fileCover", ext);
    let url = getUrl("resource", rid);
    let pdfHTML = "";
    if(ext === "pdf") {
      const pdfUrl = getUrl("pdf", rid);
      pdfHTML = `
        <span class="article-attachment-reader">
          <a href="/reader/pdf/web/viewer?file=%2fr%2f${rid}?time=${Date.now()}" target="_blank">预览</a>
          <span class="fa fa-question-circle" title="预览文件已被压缩处理，并不代表真实文件质量"></span>
        </span>
      `.trim();
    }
    return `
      ${resource.disabled? `
      <span data-tag="nkcsource" data-type="attachment-disabled">
          <span class="attachment-disabled">
              <span>附件已被屏蔽</span>
          </span>
      </span>
      `:`
      <span data-tag="nkcsource" data-type="attachment" data-visitor-access="${visitorAccess}">
        <span class="article-attachment-icon">
            <img src="${fileCover}" alt="attachment icon">
          </span>
          <span class="article-attachment-content">
            ${resource.isFileExist? `<span class="article-attachment-name" title="${oname}" data-type="downloadPanel" data-id="${id}">${oname}</span>`:
        `<span class="article-attachment-name" title="${oname}" title="${oname}（附件已丢失）">${oname}</span>`}
            <span class="article-attachment-info">
              <span class="article-attachment-size">${getSize(size)}</span>
              <span class="article-attachment-ext">${ext.toUpperCase()}</span>
              <span class="article-attachment-hits">${hits}次下载</span>
              ${resource.isFileExist?pdfHTML:`<span class="article-attachment-ext">附件已丢失</span>`}
            </span>
        </span>
      `}
      </span>  
    `.trim();
  },
  pre(html) {
    return html.replace(/<pre(.*?)>([\s\S]*?)<\/pre>/ig, (content, v1, v2) => {
      // v2 = htmlEscape(v2);
      return `<pre${v1}>${v2}</pre>`;
    });
  },
  xsf(html, id, r, user = {}) {
    const {xsf = 0} = user;
    const $ = cheerio.load(html);
    let content;
    if(Number(id) <= xsf) {
      content = $("section").html();
    } else {
      content = "内容已隐藏";
    }
    return `<span data-tag="nkcsource" data-type="xsf" data-id="${id}"><span>浏览这段内容需要${id}学术分</span><span>${content}</span></span>`;
  },
};
