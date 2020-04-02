const {getUrl, getSize} = require("../../tools");
const cheerio = require("../cheerio");

module.exports = {
  /*picture(html, id, resource) {
    const url = getUrl("resource", id);
    html = `<nkcsource data-type="picture" data-id="${id}" contenteditable="false" _rendered><img src="${url}"></nkcsource>`;
    return html;
  },
  video(html, id) {
    const url = getUrl("resource", id);
    html = `<nkcsource data-type="video" data-id="${id}" contenteditable="false" _rendered><video src="${url}" controls></video></nkcsource>`;
    return html;
  },
  xsf(html, id) {
    const $ = cheerio.load(html);
    const nkcSource = $("nkcSource");
    nkcSource.attr({
      "data-message": `学术分${id}以上可见`,
      "_rendered": ""
    });
    const content = nkcSource.html();
    nkcSource.append(
      $(`<strong></strong>`)
        .html(content)
        .css("font-weight", "normal")
    );
    return $("body").html();
  },
  attachment(html, id, resource = {}) {
    let {
      oname = "未知"
    } = resource;
    const url = getUrl("resource", id);
    html = `<nkcsource data-type="attachment" data-id="${id}" contenteditable="false" _renderd><img src="/ueditor/themes/default/images/attachment.png"><a href="${url}" target="_blank" contenteditable="false" data-aaa="asdfasdfa">${oname}</a></nkcsource>`;
    return html;
  },
  sticker(html, id) {
    const url = getUrl("sticker", id);
    html = `<nkcsource data-type="sticker" data-id="${id}" contenteditable="false" _rendered><img src="${url}"></nkcsource>`;
    return html;
  },
  audio(html, id) {
    const url = getUrl("resource", id);
    html = `<nkcsource data-type="audio" data-id="${id}" contenteditable="false" _rendered><audio src="${url}" controls></audio></nkcsource>`;
    return html;
  },
  pre(html) {
    let $ = cheerio.load(html);
    $("nkcsource").attr("_rendered", "");
    console.log(html)
    return $("body").html();
  },
  twemoji(html, id) {
    const url = getUrl("emoji", id);
    html = `<nkcsource data-type="twemoji" data-id="${id}" contenteditable="false" _rendered><img src="${url}"></nkcsource>`;
    return html;
  },
  formula(html) {
    let $ = cheerio.load(html);
    $("nkcsource").attr("_rendered", "");
    return $("body").html();
  }*/
};