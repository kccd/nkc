/**
 * 提交回复
 */
function onPost() {
  var quoteContent = document.getElementById("quoteContent")?document.getElementById("quoteContent").innerHTML: ''; // 引用
  var content = ue.getContent(); // 文章主体内容
  console.log(quoteContent, content)
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

var type = GetUrlParam("type");
if(type == "post"){
    var disnoneplayHtml = htmlDecode($("#disnoneplay").html());
    var quoteHtml = disnoneplayHtml.match(/<blockquote cite.+?blockquote>/)
    if(quoteHtml){
        document.getElementById("quoteContent").innerHTML = quoteHtml[0];
        geid('quoteCancel').style.display = "inline";
    }
    disnoneplayHtml = disnoneplayHtml.replace(/<blockquote cite.+?blockquote>/img, '')
    editor.txt.html(disnoneplayHtml)
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