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
    const $ = cheerio.load(html);
    const nkcSource = $("nkcsource");
    const img = $(`<img alt="${oname}" data-type="view" dataimg="content">`);
    if(!width || !height) {
      img.attr("src", url);
      nkcSource.append(img)
    } else {
      nkcSource.css("width", width + "px");
      // 前端图片懒加载
      img.attr("data-src", url);
      img.addClass("lazyload");
      const imgBody = $(`<span></span>`);
      imgBody
        .css("padding-top", (height * 100)/width + "%")
        .append(img);
      nkcSource.append(imgBody);
    }
    return $("body").html();
  },
  sticker(html, id) {
    const $ = cheerio.load(html);
    const nkcSource = $("nkcsource");
    const url = getUrl("sticker", id);
    const img = $(`<img alt="表情" src="${url}">`);
    nkcSource.append(img);
    return $("body").html();
  },
  video(html = "", id, resource = {}) {
    const {
      oname = "未知",
      rid = id
    } = resource;
    const poster = getUrl("videoCover", rid);
    const url = getUrl("resource", rid);
    const $ = cheerio.load(html);
    const nkcSource = $("nkcsource");
    const videoBody = $(`<span></span>`);
    const video = $(`<video>你的浏览器不支持video标签，请升级。</video>`)
      .addClass("plyr-dom")
      .attr({
        "preload": "none",
        "controls": "controls",
        "poster": poster,
        "data-rid": rid,
        "data-plyr-title": oname
      });
    const source = $(`<source>`)
      .attr({
        "src": url,
        "type": "video/mp4"
      });
    nkcSource.append(videoBody.append(video.append(source)));
    return $("body").html();
  },
  audio(html = "", id, resource = {}) {
    const url = getUrl("resource", id);
    const $ = cheerio.load(html);
    const nkcSource = $("nkcsource");
    const audio = $(`<audio>你的浏览器不支持audio标签，请升级。</audio>`)
      .addClass("plyr-dom")
      .attr({
        "preload": "none",
        "controls": "controls",
        "data-rid": id
      });
    const source = $(`<source>`)
      .attr({
        "src": url,
        "type": "audio/mp3"
      });
    nkcSource.append(audio.append(source));
    return $("body").html();
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
    const $ = cheerio.load(html);
    const nkcSource = $("nkcsource");
    const iconBody = $(`<span></span>`)
      .addClass("article-attachment-icon")
      .append(
        $(`<img>`).attr("src", fileCover)
      );
    const content = $(`<span></span>`)
      .addClass("article-attachment-content")
      .append(
        $("<a></a>")
          .addClass("article-attachment-name")
          .attr({
            "target": "_blank",
            "href": url,
            "title": oname
          })
          .text(oname)
      )
      .append(
        $(`<span></span>`)
          .addClass("article-attachment-info")
          .append(
            $(`<span></span>`)
              .addClass("article-attachment-size")
              .text(getSize(size))
          )
          .append(
            $(`<span></span>`)
              .addClass("article-attachment-ext")
              .text(ext.toUpperCase())
          )
          .append(
            $(`<span></span>`)
              .addClass("article-attachment-hits")
              .text(hits + "次下载")
          )
      );
    if(ext === "pdf") {
      const pdfUrl = getUrl("pdf", rid);
      content.find(".article-attachment-info").append(
        $(`<span></span>`)
          .addClass("article-attachment-reader")
          .append(
            $(`<a></a>`)
              .attr("href", pdfUrl)
              .text("预览")
          )
      )
    }
    nkcSource.append(iconBody).append(content);
    return $("body").html();
  },
  formula(html, id) {
    const $ = cheerio.load(html);
    const nkcSource = $("nkcsource");
    let text = nkcSource.text();
    if(id === "1") {
      text = `$${text}$`;
    } else if(id === "2") {
      text = `\\(${text}\\)`;
    } else if(id === "4") {
      text = `\\[${text}\\]`;
    } else {
      text = `$$${text}$$`;
    }
    nkcSource.text(text);
    return $("body").html();
  },
  pre(html) {
    return html;
  },
  xsf(html, id) {
    const $ = cheerio.load(html);
    const nkcSource = $("nkcSource");
    const content = nkcSource.html();
    nkcSource.html(
      $(`<span>浏览这段内容需要${id}学术分</span>`)
    )
      .append(
        $(`<span></span>`)
          .html(content)
      );
    return $("body").html();
  },
  twemoji(html, id) {
    const $ = cheerio.load(html);
    const nkcSource = $("nkcsource");
    nkcSource.html(
      $(`<img src="${getUrl('twemoji', id)}" alt="${id}">`)
    );
    return $("body").html();
  }
};