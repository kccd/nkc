var realUrl = "";
localStorage.setItem("apptype", "app");
var allLinks = document.querySelectorAll("a");
var allButtons = document.querySelectorAll("button");
var imgDownTimeOut;
// 禁止点击连接执行跳转
Array.prototype.forEach.call(allLinks, function(link) {
  link.addEventListener("click", function(e) {
    e.preventDefault();
  })
})
// window.addEventListener("click", function(e) {
//   console.log("禁止点击")
//   e.preventDefault();
// })
$(document).ready(function() {
  // 获取url的apptype参数，要么为app，要么为false
  var apptype = getQueryVariable("apptype");
  if(apptype === "app") {
    // 去掉body的paddingTop
    if(location.pathname === "/") {
      $("body").css("padding-top", "10px");
    }
  }
})

apiready = function() {
  // 为所有图片添加点击事件
  var allImgs = document.querySelectorAll("img");
  Array.prototype.forEach.call(allImgs, function(img) {
    // img.addEventListener("touchstart", function() {
    //   imgDownTimeOut = setTimeout("imageToApiDownload('"+this.src+"')", 1000)
    // })
    // img.addEventListener("touchmove", function() {
    //   clearTimeout(imgDownTimeOut);
    // })
    // img.addEventListener("touchend", function() {
    //   clearTimeout(imgDownTimeOut)
    // })
    img.addEventListener("click", function() {
      if(this.getAttribute("dataimg") && this.getAttribute("dataimg") == "content") {
        if(this.src && this.src.indexOf("/r/") > -1) {
          imageOpenInApp(this.src);
        }
      }
    })
  })
  // 为所有的a标签添加点击事件
  // 监听全局a标签的点击事件
  // 并阻止链接点击跳转
  var allLinks = document.querySelectorAll("a");
  Array.prototype.forEach.call(allLinks, function(link) {
    link.addEventListener("click", function() {
      if(this.href.indexOf("/r/") > -1) {
        var linkUrl = this.href;
        attachDownInApp(linkUrl);
      }else if(this.href) {
        var isHostUrl = siteHostLink(this.href);
        // 如果是本站链接则打开app内页，否则使用外站浏览页打开
        if(isHostUrl) {
          var paramIndex = this.href.indexOf("?");
          var newHref = "";
          var equaiHref = false;
          if(paramIndex > -1) {
            newHref = (this.href).substring(0, paramIndex)
          }else{
            newHref = this.href;
          }
          if(newHref.length > 0) {
            if(api.winName.indexOf(newHref) > -1) {
              equaiHref = true;
            }
          }
          // 如果是在首页跳转到最新关注推荐等，不打开新页面
          if(this.pathname === "/" && api.winName === "root") {
            window.location.href = addApptypeToUrl(this.href)
            return;
          }
          if(equaiHref) {
            appFreshUrl(this.href);
          }else{
            appOpenUrl(this.href);
          }
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
      }
    })
  })
  // 将本页的title和description传入app中
  var locationUrl = window.location.href;
  var urlType = getShareTypeByUrl(locationUrl);
  if(urlType !== "common") {
    getSiteMeta();
  }
  // 获取编辑器标识
  var withE = window.localStorage.getItem("withE");
  // 下拉刷新当前页面
  api.refreshHeaderLoadDone();
  if(window.location.pathname !== "/editor") {
    api.setRefreshHeaderInfo({
      bgColor: '#eeeeee',
      textColor: '#aaaaaa',
      textDown: '下拉刷新',
      textUp: '松开刷新',
      textLoading: '刷新成功，正在加载资源...',
      showTime: false
    }, function(ret, err) {
      window.location.reload();
    });
  }
  /**
   * 编辑页面退出提示
   */
  if(withE) {
    api.addEventListener({
      name: 'keyback'
    }, function(ret, err) {
      api.confirm({
          title: '确定要退出吗？',
          msg: '',
          buttons: ['确定', '取消']
      }, function(ret, err){
          if( ret ){
            if(ret.buttonIndex == 1){
              api.closeWin();
            }
          }else{
            api.closeWin();
          }
      });
    });
  }
  // 清除编辑器标识
  window.localStorage.removeItem("withE");
}

/**
 * 给url添加apptype参数
 * @param {*} urlStr 
 */
function addApptypeToUrl(url) {
  var resultUrl = url.split("?")[0];
  var paramStr = "";
  var paramsArr;
  var queryString = (url.indexOf("?") !== -1) ? url.split("?")[1] : "";
  paramStr = resultUrl + "?apptype=app";
  if(queryString !== "") {
    paramsArr = queryString.split("&");
    for(var i=0;i<paramsArr.length;i++) {
      paramStr += ("&"+paramsArr[i]);
    }
  }
  return paramStr;
}


/**
 * 使用api对象中的方法打开新连接
 * @param {} urlStr 
 */
function appOpenUrl(urlStr) {
  var origin = window.location.origin;
  if(urlStr.indexOf("http") === -1) {
    urlStr = origin + urlStr
  }
  var paramStr = addApptypeToUrl(urlStr)
  // 如果是可以分享的类型则使用分享模板打开以便分享，否则使用其他模板打开
  var windowFile = "widget://html/common/commonInfo.html";
  var shareType = getShareTypeByUrl(paramStr);
  if(shareType !== "common") {
    windowFile = "widget://html/common/shareInfo.html"
  }
  // 判断是否为编辑页面
  var editUrlArr = ["/editor", "/shelf", "/release"];
  for(var e in editUrlArr) {
    if(urlStr.indexOf(editUrlArr[e]) > -1) {
      windowFile = "widget://html/common/editorInfo.html";
      break;
    }
  }
  api.execScript({
    name: "root",
    script: "shareReadyBan()"
  });
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
 * 使用api对象中的方法刷新当前页面的的链接
 * @param {*} key 
 */
function appFreshUrl(urlStr) {
  var paramStr = addApptypeToUrl(urlStr)
  var winName = api.winName;
  var shareType = api.pageParam.shareType;
  api.openFrame({
    name: winName,
    url: paramStr,
    reload: true,
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
  var hostStr = window.location.host;
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
  var title, description;
  try{
    title = document.getElementsByTagName("title")[0].text;
  }catch(e){
    title = "来自科创的分享";
  }
  try {
    description = document.getElementsByName("description")[0].getAttribute("content");
  }catch(e) {
    description = "倡导科学理性，发展科技爱好";
  }
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
    "activity": "/activity/",
    "column": "/m/"
  }
  var shareType = "common";
  for(var i in typeObj) {
    if(sourceUrl.indexOf(typeObj[i]) > -1) {
      shareType = i;
      if(shareType === "user" && sourceUrl.indexOf('settings') > -1) {
        shareType = "common";
      }
      break;
    }
  }
  return shareType;
}

/**
 * 带有编辑器的页面禁止下拉刷新
 * 判断是否带有编辑器
 */
function linkWithEditor() {
  var withE = false;
  return withE;
} 

function toAppLogin() {
  api.closeToWin({
    name: 'root'
  });
  api.execScript({
    name: "root",
    script: "openGroupIndex(3)"
  })
}

// app图片本地保存
function imageToApiDownload(url) {
  api.openFrame({
    name: 'imageSave',
    url: 'widget://html/common/saveImageButton.html',
    pageParam: {
        name: 'imageSave',
        url: url
    },
	  rect: {
      x: 0,
      y: 0,
      w: 'auto',
      h: 'auto',
    },
    bounces: false,
    bgColor: 'rgba(0,0,0,0.5)',
    vScrollBarEnabled: false,
	  animation: {
	    type: 'movein',
	    subType: 'from_bottom',
	    duration: 300
	  }
  });
}

// app图片在新的window中打开
function imageOpenInApp(sid) {
  api.execScript({
    name: "root",
    script: "openImage(['"+sid+"'])"
  })
}

// 文件下载
function attachDownInApp(linkUrl) {
  api.execScript({
    name: api.winName,
    script: "attachDown('"+linkUrl+"')"
  })
}