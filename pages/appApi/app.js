// var hostStr = "www.kechuang.org";
var hostStr = "192.168.11.114";
var realUrl = "";

$(document).ready(function() {
  // 获取url的apptype参数，要么为app，要么为false
  var apptype = getQueryVariable("apptype");
  if(apptype === "app") {
    // 去掉body的paddingTop
    $("body").css("padding-top", "0");
    // 阻止全局的浏览器默认行为
    window.addEventListener("click", function(e) {
      e.preventDefault();
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
  // 为所有的a标签添加点击事件
  // 监听全局a标签的点击事件
  // 并阻止链接点击跳转
  var allLinks = document.querySelectorAll("a");
  Array.prototype.forEach.call(allLinks, function(link) {
    link.addEventListener("click", function() {
      var isHostUrl = siteHostLink(this.href);
      // 如果是本站链接则打开app内页，否则使用外站浏览页打开
      if(isHostUrl) {
        appOpenUrl(this.href);
      }else{
        api.openWin({
          name: 'link',
          url: 'widget://html/link/link.html',
          pageParam: {
              name: 'link',
              linkUrl: this.href
          }
        });
      }
    })
  })
  // 将本页的title和description传入app中
  getSiteMeta()
}



/**
 * 使用api对象中的方法打开新连接
 * @param {} urlStr 
 */
function appOpenUrl(urlStr) {
  var resultUrl = urlStr.split("?")[0];
  var paramStr = "";
  var paramsArr;
  var queryString = (urlStr.indexOf("?") !== -1) ? urlStr.split("?")[1] : "";
  paramStr = resultUrl + "?apptype=app";
  if(queryString !== "") {
    paramsArr = queryString.split("&");
    for(var i=0;i<paramsArr.length;i++) {
      paramStr += ("&"+paramsArr[i]);
    }
  }
  // var parmIndex = urlStr.indexOf("?");
  // if(parmIndex > -1) {
  //   urlStr = urlStr + "&apptype=app";
  // }else{
  //   urlStr = urlStr + "?apptype=app";
  // }
  // 如果是可以分享的类型则使用分享模板打开以便分享，否则使用其他模板打开
  var windowFile = "widget://html/common/commonInfo.html";
  var shareType = getShareTypeByUrl(paramStr);
  if(shareType !== "common") {
    windowFile = "widget://html/common/shareInfo.html"
  }
  api.openWin({
    name: paramStr,
    url: windowFile,
    pageParam: {
      realUrl: paramStr,
      shareType: shareType
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

/**
 * 获取当前页面的meta中的title和description
 */
function getSiteMeta() {
  var title = document.getElementsByTagName("title")[0].text;
  var description = document.getElementsByName("description")[0].getAttribute("content");
  var para = {
    title: title,
    description: description
  };
  var paraStr = JSON.stringify(para);
  api.execScript({
    name: realUrl,
    script: 'getAppMeta('+paraStr+');'
  });
}


/**
* @description 根据url判断分享类型
* @param {String} sourceUrl
* @return shareType
*/
function getShareTypeByUrl(sourceUrl) {
  var typeObj = {
    "thread": "/t/",
    "user": "/u/",
    "post": "/p/",
    "forum": "/f/",
    "activity": "/activity/"
  }
  var shareType = "common";
  for(var i in typeObj) {
    if(sourceUrl.indexOf(typeObj[i]) > -1) {
      shareType = i;
      break;
    }
  }
  return shareType;
}