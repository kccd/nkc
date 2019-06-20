// var hostStr = "www.kechuang.org";
var hostStr = "192.168.11.114";

$(document).ready(function() {
  // 获取url的apptype参数，要么为app，要么为false
  var apptype = getQueryVariable("apptype");
  if(apptype === "app") {
    // 去掉body的paddingTop
    $("body").css("padding-top", "0");
    // 监听全局a标签的点击事件
    // 并阻止链接点击跳转
    var allLinks = document.querySelectorAll("a");
    Array.prototype.forEach.call(allLinks, function(link) {
      link.addEventListener("click", function(e) {
        var isHostUrl = siteHostLink(this.href);
        if(isHostUrl) {
          e.preventDefault();
          appOpenUrl(this.href);
        }
      })
    })
    // window.addEventListener("beforeunload", function(e) {
    //   console.log("beforeunload")
    //   return console.log(document.location.href)
    // })
    // window.addEventListener("unload", function(e) {
    //   console.log("unload")
    //   return console.log(document.location.href)
    // })
  }
})

apiready = function() {

}


/**
 * 使用api对象中的方法打开新连接
 * @param {} urlStr 
 */
function appOpenUrl(urlStr) {
  var parmIndex = urlStr.indexOf("?");
  if(parmIndex > -1) {
    urlStr = urlStr + "&apptype=app";
  }else{
    urlStr = urlStr + "?apptype=app";
  }
  console.log(urlStr)
  api.openWin({
    name: urlStr,
    url: "widget://html/common/threadInfo.html",
    pageParam: {
      realUrl: urlStr
    }
  })
}

/**
 * 获取url中的app参数
 * @param {*} key 
 */
function getQueryVariable(key)
{
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if(pair[0] == key){return pair[1];}
  }
  return(false);
}

/**
 * 判断url是否为本站链接
 * @param {*} urlStr
 */
function siteHostLink(urlStr) {
  var hostIndex = urlStr.indexOf(hostStr);
  if(hostIndex === -1) {
    return false;
  }else{
    return true;
  }
}