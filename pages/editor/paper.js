/**
 * 论文相关组件
 */
var paperProto = {
  config: {
    enableAbstract: true, // 是否启用摘要
    enableKeyWords: true, // 是否启用关键词
    enableAuthorInfo: false, // 是否启用作者信息
    enableOriginState: false, // 是否启用原创声明

    abstractCN: "中文摘要", // 默认中文摘要
    abstractEn: "英文摘要", // 默认英文摘要
    keyWordsCn: [], // 默认中文关键词
    keyWordsEn: [], // 默认英文关键词
    authorInfos: [], // 默认作者信息
    originState: "", // 默认原创声明
  },
  // 初始化论文相关组件
  init: function() {

  },
  // 根据id获取dom
  get: function(id) {
    var demoDom = document.getElementById(id);
    return demoDom;
  },
  // 初始化摘要
  initAbstract: function() {
    console.log("摘要初始化")
    if(paperProto.config.enableAbstract) {
      var abstractDom = paperProto.get("abstract");
      console.log(abstractDom)
      abstractDom.style.display = ""
      // 初始化摘要文本
      var abstractCnDom = paperProto.get("abstractCn");
      var abstractEnDom = paperProto.get("abstractEn");
      // $("#abstractCn").val(paperProto.config.abstractCN)
      // $("#abstractEn").val(paperProto.config.abstractEn)
      abstractCnDom.value = paperProto.config.abstractCN;
      abstractEnDom.value = paperProto.config.abstractEn;
    }
  },
  // 初始化关键词
  initKeywords: function() {

  },
  // 初始化作者信息
  initAuthorInfo: function() {

  },
  // 初始化原创声明
  initOriginState: function() {

  },
  output: function() {

  }
}

paperProto.initAbstract();