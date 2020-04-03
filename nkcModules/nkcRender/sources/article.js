const {getUrl, getSize} = require("../../tools");
const cheerio = require("../cheerio");

module.exports = {
  picture(html = "", id, resource = {}) {
    const {
      width, height,
      oname = "未知",
      rid = id
    } = resource || {};
    const url = getUrl("resource", rid);
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
      oname = "未知",
      rid = id
    } = resource;
    const poster = getUrl("videoCover", rid);
    const url = getUrl("resource", rid);
    return `
      <span data-tag="nkcsource" data-type="video" data-id="${id}">
        <video class="plyr-dom" preload="none" controls="controls" poster="${poster}" data-rid="${rid}" data-plyr-title="${oname}">
          <source src="${url}" type="video/mp4"> 你的浏览器不支持video标签，请升级。
        </video>
      </span>
    `.trim();
  },
  audio(html = "", id, resource = {}) {
    const url = getUrl("resource", id);
    return `
      <span data-tag="nkcsource" data-type="audio" data-id="${id}">
        <audio class="plyr-dom" preload="none" controls data-rid="rid">
          <source src="${url}" type="audio/mp3"/>
          你的浏览器不支持audio标签，请升级。
        </audio>
      </span>
    `.trim();
  },
  attachment(html = "", id, resource = {}) {
    const {
      oname = "未知",
      size = 0,
      ext = "",
      hits = 0,
      rid = id,
    } = resource;
    const fileCover = getUrl("fileCover", ext);
    const url = getUrl("resource", rid);
    let pdfHTML = "";
    if(ext === "pdf") {
      const pdfUrl = getUrl("pdf", rid);
      pdfHTML = `
        <span class="article-attachment-reader">
          <a href="${pdfUrl}" target="_blank">预览</a>
        </span>
      `.trim();
    }
    return `
      <span data-tag="nkcsource" data-type="attachment" data-id="${id}">
        <span class="article-attachment-icon">
          <img src="${fileCover}" alt="attachment icon">
        </span>
        <span class="article-attachment-content">
          <a class="article-attachment-name" href="${url}?t=attachment" title="${oname}" target="_blank">${oname}</a>
          <span class="article-attachment-info">
            <span class="article-attachment-size">${getSize(size)}</span>
            <span class="article-attachment-ext">${ext.toUpperCase()}</span>
            <span class="article-attachment-hits">${hits}次下载</span>
            ${pdfHTML}
          </span>
        </span>
      </span>  
    `.trim();
  },
  pre(html) {
    return html;
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