/**
 * 公式化简
 */
function articleTransfer() {
  // 只保留公式源代码
  $(ue.body).find(".MathJax_Preview").each(function(){
    if($(this).next().next().length !== 0){
      if($(this).next().next().attr("type").length > 15){
        var mathfur = "$$" + $(this).next().next().html() + "$$";
      }else{
        var mathfur = "$" + $(this).next().next().html() + "$";
      }
      $(this).next().next().replaceWith(mathfur);
      $(this).next().replaceWith("");
      $(this).replaceWith("")
    }else{
      $(this).parent().remove()
    }
  })
  // 删除多余的公式div
  $(ue.body).find("#MathJax_Message").remove();
}

/**
 * 保存草稿
 */
function saveToThreadWithCheck() {
  // 获取自动上传的图片总数以及已传图片的数量
  var imgTotal = ue.options.imgTotal;
  var imgCount = ue.options.imgCount;
  if(imgCount < imgTotal) {
    $("#saveToThreadWithCheckDom").modal("show");
  }else{
    saveDraft();
  }
}

/**
 * 保存草稿
 */
function saveDraft() {
  $("#saveToThreadWithCheckDom").modal("hide");
  articleTransfer();
  // 获取url相关参数
  var query = getSearchKV();
  var queryType = query.type;
  var queryId = query.id;
  var draftId = $("#draftId").html();
  // 文章内容相关
  var quoteContent = document.getElementById("quoteContent")?document.getElementById("quoteContent").innerHTML: ''; // 引用
  var draftContent;
  try{
    draftContent = ue.getContent();
  }catch(e){
    draftContent = "";
  }
  var content = quoteContent + draftContent; // 文章主体内容
  if(content.length < 1) {
    return screenTopWarning("请填写内容")
  }
  if(geid('parseURL').checked) {
    content = common.URLifyHTML(content);
  }
  var title = geid('title').value.trim(); // 文章标题
  if (queryType !== 'redit' && queryType !== 'thread' && queryType !== 'post' && queryType !== 'application' && title === '' && queryType !== 'forum_declare') {
    return screenTopWarning('请填写标题');
  }
  if(title.length > 50) {
    return screenTopWarning("文章标题50字以内");
  }

  if(!queryType || queryType === "forum" || desType === "forum") {
    queryType = 'forum';
  }

  var post = {
    t: title,
    c: content,
    l: 'html',
    did: draftId,
    desType: queryType,
    desTypeId: queryId
  }
  if(queryType == "post" || queryType == "thread" || queryType == "forum") {
    try{
      var paperObj = paperProto.paperExport();
    }catch(e) {
      screenTopWarning(e);
      return;
    }
    for(var i in paperObj) {
      post[i] = paperObj[i]
    }
  }
  var userId = $("#userNowId").html()
  var method = "POST";
  var url = "/u/"+userId+"/drafts";
  var data = {post:post};
  return nkcAPI(url, method, data)
  .then(function (result) {
    if(result.status == "success"){
      // console.log(result.did)
      $("#draftId").html(result.did)
      screenTopAlert("保存成功！");
    }
  })
  .catch(function (data) {
    screenTopWarning(data || data.error);
    geid('post').disabled = false
  })
}

/*
* 转发到专栏
* */
var ColumnCategoriesDom;
$(function() {
  if(!NKC.modules.SelectColumnCategories) return;
  ColumnCategoriesDom = new NKC.modules.SelectColumnCategories();
});

function getSelectedColumnCategoriesId() {
  if(!window.ColumnCategoriesDom) return [];
  var status = ColumnCategoriesDom.getStatus();
  if(status.checkbox) {
    if(status.selectedCategoriesId.length === 0) {
      geid('ButtonReply').disabled=false;
      throw("请选择专栏文章分类");
    }
  }
  return status.selectedCategoriesId;
  /*var columnCategoriesId = [];
  if($("#checkboxToColumn").prop("checked")) {
    var columnCategoriesDom = $("#postToColumn input");
    if(columnCategoriesDom.length) {
      for(var i = 0;  i < columnCategoriesDom.length; i++) {
        var d = columnCategoriesDom.eq(i);
        if(d.prop("checked")) {
          columnCategoriesId.push(d.val());
        }
      }
    }
    if(columnCategoriesId.length === 0) {
      geid('post').disabled = false;
      throw("请选择专栏文章分类");
    }
  }
  return columnCategoriesId;*/
}

/**
 * 发表文章
 */
function postToThreadWithCheck() {
    // 获取自动上传的图片总数以及已传图片的数量
    var imgTotal = ue.options.imgTotal;
    var imgCount = ue.options.imgCount;
    if(imgCount < imgTotal) {
      $("#postToThreadWithCheckDom").modal("show");
    }else{
      onPost();
    }
}

/**
 * 提交回复
 */
function onPost() {
  $("#postToThreadWithCheckDom").modal("hide");
  articleTransfer();
  // 获取url相关参数
  var query = getSearchKV();
  var queryType = query.type;
  var queryId = query.id;
  var queryCat = query.cat;
  // 文章内容相关
  var quoteContent = document.getElementById("quoteContent")?document.getElementById("quoteContent").innerHTML: ''; // 引用
  // var transferContent = ue.getContent(); // 转移区内容
  var content = quoteContent + ue.getContent(); // 文章主体内容
  if(content.length < 1) {
    return screenTopWarning("请填写内容")
  }
  if(geid('parseURL').checked) {
    content = common.URLifyHTML(content);
  }
  var title = geid('title').value.trim(); // 文章标题
  if (queryType !== 'redit' && queryType !== 'thread' && queryType !== 'post' && queryType !== 'application' && title === '' && queryType !== 'forum_declare') {
    return screenTopWarning('请填写标题');
  }
  if(title.length > 50) {
    return screenTopWarning("文章标题50字以内");
  }
  // 草稿相关
  var desType = $("#draftDelType").html() || ''; // 草稿类型
  var desTypeId = $("#draftDelTypeId").html() || ''; // 草稿类型id
  var did = $("#draftId").html() || ''; // 草稿id
  // 获取专业与分类
  var fids = [];
  var cids = [];
  if(!queryType || queryType == "forum" || desType == "forum") {
    var panelObj = $("#tabPanel").tagsinput("items");
    $("#newPanelForum").find(".chooseForum").each(function() {
      var fid = $(this).attr("fid");
      if(fid) {
        fids.push(fid)
      }
    })
    $("#newPanelForum").find(".chooseCate").each(function() {
      var cid = $(this).attr("cid");
      if(cid) {
        cids.push(cid)
      }
    })
    if(fids.length === 0) {
      return screenTopWarning("请选择专业");
    }
    // if(panelObj.length == 0) {
    //   return screenTopWarning("请选择专业");
    // }else{
    //   for(var po=0;po<panelObj.length;po++) {
    //     if(fids.indexOf(panelObj[po].fid) == -1) {
    //       fids.push(panelObj[po].fid)
    //     }
    //     if(panelObj[po].cid !== "") {
    //       var dealCid = panelObj[po].cid.substr(1);
    //       if(cids.indexOf(dealCid) == -1) {
    //         cids.push(dealCid)
    //       }
    //     }
    //   }
    // }
    queryId = fids[0];
    queryType = 'forum';
    queryCat = cids[0];
  }
  // 组装上传数据，如果是特殊类型，则将关键词摘要等放入post
  var post = {
    t: title,
    c: content,
    l: 'html',
    did: did,
    fids: fids,
    cids: cids,
    cat: queryCat,
    desType: desType,
    desTypeId: desTypeId
  }
  if(queryType == "post" || queryType == "thread" || queryType == "forum") {
    try{
      var paperObj = paperProto.paperExport();
    }catch(e) {
      screenTopWarning(e);
      return;
    }
    // 转发到专栏
    try{
      post.columnCategoriesId = getSelectedColumnCategoriesId();
    } catch(err) {
      return screenTopWarning(err);
    }
    for(var i in paperObj) {
      post[i] = paperObj[i]
    }
  }
  // 将组装好的数据发送至目标路由
  geid('post').disabled = true;
  var method;
  var url;
  var data;
  if (queryType === 'post') {
    method = 'PATCH';
    url = '/p/' + queryId;
    data = {post: post};
  } else if (queryType === 'forum') {
    method = 'POST';
    url = '/f/' + queryId;
    data = {post: post};
  } else if (queryType === 'thread') {
    method = 'POST';
    url = '/t/' + queryId;
    data = {post: post};
  } else if (queryType === 'application' && queryCat === 'p') { // 编辑项目内容
    method = 'PATCH';
    url = '/fund/a/' + queryId;
    data = {project: post, s: 3}
  } else if(queryType === 'application' && queryCat === 'c') { // 评论
    method = 'POST';
    url = '/fund/a/' + queryId + '/comment';
    data = {comment: post}
  } else if(queryType === 'application' && queryCat === 'r') { // 报告
    method = 'POST';
    url = '/fund/a/' + queryId + '/report';
    data = {c: post.c, t: post.t, l: post.l}
  } else if(queryType === 'redit'){
    // 判断desType的类型，重新指定发表的url
    if(desType === "thread"){
      method = 'POST';
      url = '/t/' + desTypeId;
      data = {post: post};
    }else if(desType === "post"){
      method = 'PATCH';
      url = '/p/' + desTypeId;
      data = {post: post};
    }
  } else if(queryType === 'forum_declare') {
    method = 'PATCH';
    url = '/f/' + queryId + '/settings/info';
    data = {declare: post.c, operation: 'updateDeclare'}
  } else {
    return screenTopWarning('未知的请求类型：'+queryType);
  }
  return nkcAPI(url, method, data)
  .then(function (result) {
    if(result.redirect) {
      redirect(result.redirect)
    } else {
      if(queryType === 'post') {
        redirect()
      }
    }
  })
  .catch(function (data) {
    screenTopWarning(data || data.error);
    geid('post').disabled = false
  })
}

/**
 * 论文组件初始化
 */
if($("#targetPost").length > 0) {
  paperProto.init(JSON.parse($("#targetPost").text()));
}else{
  paperProto.init();
}

function getSearchKV() {
  var search = window.location.search;
  var KVStringArr = search.match(/[\d\w]*=[\d\w\/]*/g);
  var result = {};
  if(KVStringArr)
    for(var i = 0; i < KVStringArr.length; i++) {
      var str = KVStringArr[i];
      var kv = str.split('=');
      var key = kv[0];
      var value = kv[1];
      result[key] = value
    }
  return result
}

/**
 * 将上一页面中的编辑器主要内容、引用内容等放入当前页面的编辑器中
 */
var type = GetUrlParam("type");
if(type == "post"){
  var disnoneplayHtml = htmlDecode($("#disnoneplay").html());
  var quoteHtml = disnoneplayHtml.match(/<blockquote cite.+?blockquote>/)
  if(quoteHtml){
      document.getElementById("quoteContent").innerHTML = quoteHtml[0];
      geid('quoteCancel').style.display = "inline";
  }
  disnoneplayHtml = disnoneplayHtml.replace(/<blockquote cite.+?blockquote>/img, '')
  ue.ready(function() {
    ue.setContent(disnoneplayHtml);
  })
}
if(type == "thread"){
  var replyHtml = window.localStorage.replyHtml;
  var quoteHtml = window.localStorage.quoteHtml;
  ue.ready(function(){ 
    ue.setContent(replyHtml);
  })
  if(quoteHtml){
      document.getElementById("quoteContent").innerHTML = quoteHtml;
      geid('quoteCancel').style.display = "inline";
  }
  window.localStorage.clear();
}
// 重新编辑
if(type == "redit"){
  var disnoneplayHtml = htmlDecode($("#disnoneplay").html());
  var quoteHtml = disnoneplayHtml.match(/<blockquote cite.+?blockquote>/)
  if(quoteHtml){
      document.getElementById("quoteContent").innerHTML = quoteHtml[0];
      geid('quoteCancel').style.display = "inline";
  }
  disnoneplayHtml = disnoneplayHtml.replace(/<blockquote cite.+?blockquote>/img, '')
  ue.ready(function() {
    ue.setContent(disnoneplayHtml);
  })
}
// 基金与专业介绍
if(["application", "forum_declare"].indexOf(type) !== -1){
	var disnoneplayHtml = htmlDecode($("#disnoneplay").html());
  ue.ready(function() {
    ue.setContent(disnoneplayHtml);
  })
}
// 根据参数名称找到对应的参数值
function GetUrlParam(paraName) {
  var url = document.location.toString();
  var arrObj = url.split("?");
  if (arrObj.length > 1) {
      var arrPara = arrObj[1].split("&");
      var arr;
      for (var i = 0; i < arrPara.length; i++) {
          arr = arrPara[i].split("=");
          if (arr != null && arr[0] == paraName) {
              return arr[1];
          }
      }
      return "";
  }else {
      return "";
  }
}

//html解码
function htmlDecode(text){
  //1.首先动态创建一个容器标签元素，如DIV
  var temp = document.createElement("div");
  //2.然后将要转换的字符串设置为这个元素的innerHTML(ie，火狐，google都支持)
  temp.innerHTML = text;
  //3.最后返回这个元素的innerText(ie支持)或者textContent(火狐，google支持)，即得到经过HTML解码的字符串了。
  var output = temp.innerText || temp.textContent;
  temp = null;
  return output;
}

/**
 * 资源插入到编辑器中
 */
function mediaInsertUE(srcStr, fileType, name) {
  fileType = fileType.toLowerCase();
  var codeResource = "";
  if(fileType === "jpg" || fileType === "png" || fileType === "gif" || fileType === "bmp" || fileType === "jpeg" || fileType === "svg"){
    //codeResource = "<b>123456</b>"
    codeResource = "<p><img src=" + srcStr + " width='640'></p>"
  }else if(fileType === "mp4"){
    codeResource = "<video src=" + srcStr + " controls style=width:640px;>video</video>"
  }else if(fileType === "mp3"){
    codeResource = "<audio src=" + srcStr + " controls>Your browser does not support the audio element</audio>";
  }else{
    codeResource = "<p><a href=" + srcStr + "><img src=" + "/default/default_thumbnail.png" + ">" + name + "</a></p>"
  }
  ue.execCommand('inserthtml', codeResource);
}

/**
 * ue的公式渲染
 */
// function mathfreshnew(){
//   console.log(document.getElementsByTagName('body'))
//   if(MathJax){
//     MathJax.Hub.PreProcess(document.getElementsByTagName('body'),function(){MathJax.Hub.Process(document.getElementsByTagName('body'))})
//   }
//   if(hljs){
//     ReHighlightEverything() //interface_common code highlight
//   }
// }

// app相关编辑功能

/**
 * app视频拍摄、上传、及插入
 */
function appUpdateVideo() {
  $("#attach").css("display", "none");
  api.getPicture({
    sourceType: 'camera',
    encodingType: 'jpg',
    mediaValue: 'video',
    destinationType: 'url',
    allowEdit: false,
    quality: 100,
    targetWidth: 480,
    targetHeight: 800,
    saveToPhotoAlbum: false,
    videoQuality: "medium"
  }, function(ret, err) {
      if (ret) {
        api.toast({
          msg: "视频正在处理，请稍后...",
          duration: 3000,
          location: "bottom"
        })
        api.ajax({
          url: "http://192.168.11.114:9000/r",
          method: "post",
          timeout: 15,
          headers: {
            "FROM":"nkcAPI"
          },
          data:{
            values: {},
            files: {
              file: ret.data
            }
          }
        },function(ret, err) {
          if(ret) {
            mediaInsertUE(ret.r.rid, ret.r.ext, ret.r.oname);
            api.toast({
              msg: "视频已处理",
              duration: 1000,
              location: "bottom"
            })
          }else{
            console.log("视频上传失败，请检查网络环境")
            console.log(JSON.stringify(err))
          }
        })
      } else {
        console.log("拍摄失败！")
      }
  });
}

/**
 * app图片拍摄、上传、及插入
 */
function appUpdateImage() {
  $("#attach").css("display", "none");
  api.getPicture({
    sourceType: 'camera',
    encodingType: 'jpg',
    mediaValue: 'pic',
    destinationType: 'url',
    allowEdit: false,
    quality: 100,
    targetWidth: 480,
    targetHeight: 800,
    saveToPhotoAlbum: false
  }, function(ret, err) {
      if (ret) {
        api.toast({
          msg: "图片正在处理，请稍后...",
          duration: 2000,
          location: "bottom"
        })
        api.ajax({
          url: "http://192.168.11.114:9000/r",
          method: "post",
          timeout: 15,
          headers: {
            "FROM":"nkcAPI",
          },
          data: {
            values: {},
            files:{
              file: ret.data
            }
          }
        }, function(ret ,err) {
          if(ret) {
            mediaInsertUE(ret.r.rid, ret.r.ext, ret.r.oname);
            api.toast({
              msg: "图片已处理",
              duration: 1000,
              location: "bottom"
            })
          }else{
            console.log(JSON.stringify(err))
          }
        })
      } else {
        console.log(JSON.stringify(err));
      }
  });
}

/**
 * 附件模块的隐藏与展开
 */
function appAttachHideOrShow() {
  var attactStatus = $("#attach").css("display");
  if(attactStatus === "block") {
    $("#attach").css("display", "none")
  }else{
    $("#attach").css("display", "block")
  }
}

apiready = function() {
  console.log(api.frameName)
}