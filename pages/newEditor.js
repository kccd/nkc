var mobeilConfig = [
    'head',  // 标题
    //'bold',  // 粗体
    //'fontSize',  // 字号
    //'fontName',  // 字体
    //'italic',  // 斜体
    //'underline',  // 下划线
    //'strikeThrough',  // 删除线
    //'foreColor',  // 文字颜色
    //'backColor',  // 背景颜色
    'link',  // 插入链接
    //'list',  // 列表
    'justify',  // 对齐方式
    'quote',  // 引用
    'emoticon',  // 表情
    //'image',  // 插入图片
    'table',  // 表格
    'video',  // 插入视频
    'formula',  // 公式
    'code',  // 插入代码
    'undo',  // 撤销
    'redo',  // 重复
]
var pcConfig = [
    'head',  // 标题
    'bold',  // 粗体
    'fontSize',  // 字号
    //'fontName',  // 字体
    'italic',  // 斜体
    'underline',  // 下划线
    'strikeThrough',  // 删除线
    'foreColor',  // 文字颜色
    'backColor',  // 背景颜色
    'link',  // 插入链接
    //'list',  // 列表
    'justify',  // 对齐方式
    'quote',  // 引用
    'emoticon',  // 表情
    //'image',  // 插入图片
    'table',  // 表格
    'video',  // 插入视频
    'formula',  // 公式
    'code',  // 插入代码
    'undo',  // 撤销
    'redo',  // 重复
]
function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
                "SymbianOS", "Windows Phone",
                "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}
var E = window.wangEditor
var editor = new E('#content_test')
//自定义菜单配置
if(IsPC() === true){
    editor.customConfig.menus = pcConfig;
}else{
    editor.customConfig.menus = mobeilConfig
}
editor.create()
editor.customConfig.pasteTextHandle = function (content) {
    // content 即粘贴过来的内容（html 或 纯文本），可进行自定义处理然后返回
    return content + '<p>在粘贴内容后面追加一行</p>'
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
if(type == "thread"){
    var replyHtml = window.localStorage.replyHtml;
    var quoteHtml = window.localStorage.quoteHtml;
    editor.txt.html(replyHtml)
    if(quoteHtml){
        document.getElementById("quoteContent").innerHTML = quoteHtml;
        geid('quoteCancel').style.display = "inline";
    }
    window.localStorage.clear();
}
if(type == "redit"){
    var disnoneplayHtml = htmlDecode($("#disnoneplay").html());
    var quoteHtml = disnoneplayHtml.match(/<blockquote cite.+?blockquote>/)
    if(quoteHtml){
        document.getElementById("quoteContent").innerHTML = quoteHtml[0];
        geid('quoteCancel').style.display = "inline";
    }
    disnoneplayHtml = disnoneplayHtml.replace(/<blockquote cite.+?blockquote>/img, '')
    editor.txt.html(disnoneplayHtml)
}
if(["application", "forum_declare"].indexOf(type) !== -1){
	var disnoneplayHtml = htmlDecode($("#disnoneplay").html());
	// var quoteHtml = disnoneplayHtml.match(/<blockquote cite.+?blockquote>/)
	// if(quoteHtml){
	// 	document.getElementById("quoteContent").innerHTML = quoteHtml[0];
	// 	geid('quoteCancel').style.display = "inline";
	// }
	// disnoneplayHtml = disnoneplayHtml.replace(/<blockquote cite.+?blockquote>/img, '')
	editor.txt.html(disnoneplayHtml)
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

//paraName 等找参数的名称
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
    