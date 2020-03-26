class Article {
  picture(sourceType, sourceId) {
    const {
      width, height,
      oname = "图片已丢失",
      rid = sourceId
    } = resources[sourceId] || {};
    const url = tools.getUrl("resource", rid);
    const $ = self.get$(`<nkcsource data-type="${sourceType}" data-id="${sourceId}"></nkcsource>`);
    const nkcSource = $("nkcsource");
    const img = $(`<img src="" alt="${self.plainEscape(oname)}" data-type="view" dataimg="content">`);
    if(!width || !height) {
      img.attr("src", url);
      nkcSource.append(img)
    } else {
      nkcSource.css("width", width + "px");
      // 前端图片懒加载
      img.attr("data-src", url);
      const imgBody = $(`<span></span>`);
      imgBody
        .css("padding-top", (height * 100)/width + "%")
        .append(img);
      nkcSource.append(imgBody);
    }
    return $("body").html();
  }
  sticker(sourceType, sourceId) {
    const $ = self.get$()
    return `<nkcsource data-type="${sourceType}" data-id="${sourceId}"></nkcsource>`
  }
}

class Editor {

}


module.exports = {
  article: new Article(),
  editor: new Article()
};