localStorage.setItem("apptype", "app");

var _appFunctions = [];
var _apiReady = false;

apiready = function() {
  _apiReady = true;
  for(var i = 0; i < _appFunctions.length; i++) {
    _appFunctions[i]();
  }
};

window.ready = function() {
  return new Promise(function(resolve, reject) {
    if(_apiReady) {
      resolve();
    } else {
      _appFunctions.push(resolve);
    }
  });
};

(function(){
  var allLinks = document.querySelectorAll("a[href]");
  var allImages = document.querySelectorAll("img[data-type=view]");
  Array.prototype.forEach.call(allLinks, function(link) {
    link.addEventListener("click", function(e) {
      // 打开资源链接进行下载
      if(this.href.indexOf("/r/") > -1) {
        /*emitEvent("download", {
          url: this.href,
          filename: this.innerText
        });*/
      } else {
        if(this.getAttribute("data-type") !== "reload") {
          e.preventDefault();
          NKC.methods.openOnlinePage(this.href);
        }
      }
    })
  });
  Array.prototype.forEach.call(allImages, function(img) {
    img.addEventListener("click", function() {
      if(this.src) {
        emitEvent("openImage", {
          url: this.src
        });
      }
    })
  });
})();

window.ready()
  .then(() => {
    // 分享 页面信息
    // 将本页的title和description传入app中
    var title, description;
    try{
      title = document.getElementsByTagName("title")[0].text;
    } catch(e){
      title = "来自科创的分享";
    }
    try {
      description = document.getElementsByName("description")[0].getAttribute("content");
    } catch(e) {
      description = "倡导科学理性，发展科技爱好";
    }
    emitEvent("siteMetaReady", {
      title: title,
      description: description,
      url: window.location.href
    });
  
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
        textLoading: '加载中，请稍候',
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
  });

/**
 * 给url添加apptype参数
 * @param {*} urlStr 
 */
function addApptypeToUrl(url) {
  // 去掉hash值
  var hashIndex = url.indexOf("#");
  if(hashIndex > 0) {
    url = url.substring(0, hashIndex)
  }
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
 * @param {String} urlStr
 */
function appOpenUrl(urlStr) {
  var origin = window.location.origin;
  if(urlStr.indexOf("http") === -1) {
    urlStr = origin + urlStr
  }
  var paramStr = addApptypeToUrl(urlStr);
  // 如果是可以分享的类型则使用分享模板打开以便分享，否则使用其他模板打开
  var windowFile = "widget://html/common/commonInfo.html";
  var shareType = getShareTypeByUrl(paramStr);
  if(shareType !== "common") {
    windowFile = "widget://html/common/shareInfo.html"
  }
  
  // 临时测试
  windowFile = "widget://html/online/online.html";
  
  // 判断是否为编辑页面
  var editUrlArr = ["/editor", "/shelf", "/release"];
  for(var e in editUrlArr) {
    if(urlStr.indexOf(editUrlArr[e]) > -1) {
      windowFile = "widget://html/common/editorInfo.html";
      break;
    }
  }
  api.openWin({
    name: paramStr,
    url: windowFile,
    pageParam: {
      realUrl: paramStr,
      shareType: shareType
    },
    animation: {
      type: "movein",
      subType: "from_right",
      duration: 300
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
 * 判断url是否为本站链接
 * @param {*} urlStr
 */
function siteHostLink(urlStr) {
  var hostStr = window.location.host;
  return urlStr.indexOf(hostStr) !== -1;
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
  };
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

/*
* 注册一个监听事件
* @param {String} name 事件名称
* @param {Function} 回调函数
*   @param {*} 触发时传入的数据
* @author pengxiguaa 2020-1-10
* */
function newEvent(name, func) {
  return api.addEventListener({
    name
  }, (ret, err) => {
    if(err) return bottomAlert(err);
    func(ret.value)
  });
}
/*
* 触发一个事件
* @param {String} name 事件名称
* @param {*} 传递数据
* */
function emitEvent(name, data) {
  api.sendEvent({
    name: name,
    extra: data || {}
  });
}
