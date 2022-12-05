//创建变量时必须都要使用var,不然使用的文件无法获取到函数内容
var isNode = typeof window === 'undefined';

var Tools = function() {
  var self = this;
  self.getUrl = function(type, id, size, id2, page) {
    var fileDomain;
    if(isNode) {
      fileDomain = require('../config/server').fileDomain;
    } else {
      fileDomain = NKC.configs.fileDomain;
    }
    fileDomain = fileDomain || '';
    if(['', undefined, null].includes(id)) {
      id = 'default';
    }
    var t = "?c=" + type;
    if(size) t += "&t=" + size;
    switch(type) {
      case 'getIcons': {
        return '/statics/icons/' + id;
      }
      case 'forumHome': {
        return "/f/" + id
      }
      case "userAvatar": {
        return fileDomain + "/a/" + id + t
      }
      case "oauthAppIcon": {
        return fileDomain + "/a/" + id
      }
      case "appUserAvatar": { // 临时兼容 APP
        return "/a/" + id + t
      }
      case "userBanner": {
        return fileDomain + "/a/"+ id + t
      }
      case "userHomeBanner": {
        return fileDomain + "/a/"+ id + t;
      }
      case "OAuthAppIcon": {
        return fileDomain + "/a/" + id;
      }
      case "scoreIcon": {
        if(id === 'default') {
          return "/default/kcb.png"
        }
        return fileDomain + "/a/" + id + t
      }
      case "postCover": {
        return fileDomain + '/a/' + id + t;
      }
      case 'problemImage': {
        return fileDomain + '/a/' + id + t;
      }
      case "cover": {
        return "/nr/cover/" + id + t
      }
      case "anonymousUserAvatar": {
        return "/default/default_anonymous_user_avatar.jpg";
      }
      case "fileCover": {
        return "/attachIcon/" + (id||"").toLowerCase() + ".png";
      }
      case "gradeIcon": {
        return "/statics/grade_icon/v" + id + "l.png";
      }
      case "forumLogo": {
        return fileDomain + "/a/" + id + t;
      }
      case "forumBanner": {
        return fileDomain + "/a/" + id + t
      }
      case "columnAvatar": {
        return fileDomain + "/a/" + id + t
      }
      case "columnBanner": {
        return fileDomain + "/a/" + id + t
      }
      case "columnHome": {
        return "/m/" + id
      }
      case "homeBigLogo": {
        return fileDomain + "/a/" + id + t
      }
      case "watermark": {
        return "/wm?type=" + id + "&status=" + size;
      }
      case "recommendThreadCover": {
        return fileDomain + '/a/' + id + t
      }
      case "pdf": {
        return fileDomain + "/r/" + id + '?c=preview_pdf';
      }
      case "sticker": {
        return fileDomain + "/sticker/" + id;
      }
      case "emoji": {
        return "/twemoji/2/svg/" + id + ".svg"
      }
      case "twemoji": {
        return "/twemoji/2/svg/" + id + ".svg"
      }
      case "post": {
        if(t) {
          return "/p/" + id + "?redirect=true";
        }
        return "/p/" + id;
      }
      case "postHome": {
        return "/p/" + id;
      }
      case "thread": {
        return "/t/" + id;
      }
      case "editThread": {
        return "/editor?"
      }
      case 'mediaPicture': {
        return fileDomain + "/r/" + id + t;
      }
      // 原图
      case "resourceOrigin": {
        return "/ro/" + id + t;
      }
      // 用户上传的附件
      case "resource": {
        return fileDomain + "/r/" + id + t
      }
      // 用户上传的附件的下载链接
      case "resourceDownload": {
        return fileDomain + "/r/" + id + t + '&d=attachment'
      }
      // 资源封面 图片、视频
      case "resourceCover": {
        return fileDomain + "/r/" + id + '/cover'
      }
      // 其他资源，包含avatar, banner等等
      case "attach": {
        return fileDomain + "/a/" + id
      }
      case "messageFriendImage": {
        return "/friend/" + id + "/image";
      }
      case "videoCover": {
        return "/frameImg/" + id
      }
      case "messageResource": {
        return fileDomain + "/message/resource/" + id + t;
      }
      case "userHome": {
        if(id === 'default') return false
        return "/u/" + id
      }
      case "messageCover": {
        return "/message/frame/" + id
      }
      case "messageUserDetail": {
        return "/u/" + id + "?from=message"
      }
      case "statics": {
        return "/statics/" + id;
      }
      case 'siteFile': {
        return "/statics/site/" + id;
      }
      case 'defaultFile': {
        return "/default/" + id;
      }
      case 'previewPDF': {
        return "/reader/pdf/web/viewer?file=%2fr%2f" + id + "?time=" + Date.now();
      }
      case 'siteIcon': {
        return "/logo/" + id;
      }
      case 'columnPost': {
        return "/m/" + id + '/post/' + size;
      }
      case 'columnCategory': {
        return "/m/" + id + '?c=' + size;
      }
      case 'messageTone': {
        return "/default/message.wav";
      }
      case 'singleFundHome': {
        return "/fund/list/" + id
      }
      case 'singleFundSettings': {
        return "/fund/list/" + id + '/settings'
      }
      case 'fundAvatar': {
        return fileDomain + "/a/" + id + t
      }
      case 'fundHome': {
        return "/fund";
      }
      case 'fundBanner': {
        return fileDomain + "/a/" + id + t
      }
      case 'fundApplicationForm': {
        return "/fund/a/" + id
      }
      case 'lifePhotoSM': {
        return '/photo_small/' + id
      }
      case 'lifePhoto': {
        return '/photo/' + id
      }
      case 'bookCover': {
        return '/a/' + id + t;
      }
      case 'documentCover': {
        return '/a/' + id;
      }
      case 'book': {
        return '/book/' + id
      }
      case 'bookContent': {
        return '/book/' + id + '?aid=' + size
      }
      case 'editBookArticle': {
        return '/creation/articles/editor?bid=' + id + '&aid=' + size;
      }
      case 'aloneArticle': {
        return '/article/' + id
      }
      case 'columnArticle': {
        return '/m/' + id + '/a/' + size;
      }
      case 'columnArticleEditor': {
        return '/creation/editor/column?mid='+id+'&aid=' + size;
        // return '/column/editor?mid=' + id + '&aid=' + size;
      }
      case 'zoneArticleEditor': {
        return '/creation/editor/zone/article?aid=' + size;
      }
      case 'zoneArticle': {
        return '/zone/a/' + id;
      }
      case 'zoneMoment': {
        return '/zone/m/' + id;
      }
      case 'columnThread': {
        return '/m/' + id + '/a/' + size;
      }
      case 'downloadApp': {
        return '/app/' + id + '/' + size
      }
      case 'draftHistory': {
        return '/draft/history?source=' + id + '&desTypeId=' + size
      }
      case 'draftPreview': {
        return '/draft/preview?source=' + id + '&aid=' + size
      }
      case 'documentPreview': {
        return '/document/preview?source=' + id + '&sid=' + size
      }
      case 'documentHistory': {
        return '/document/history?source=' + id + '&sid=' + size
      }
      case 'draftEditor': {
        return '/creation/editor/draft?id=' + id;
      }
      case 'comment': {
        return '/comment/' + id
      }
      case 'activity': {
        return '/activity/single/' + id
      }
    }
  };
  self.getAnonymousInfo = function() {
    return {
      username: '匿名用户',
      uid: '',
      avatarUrl: self.getUrl('anonymousUserAvatar')
    }
  };
  self.floatUserInfo = function(uid) {
    return "floatUserPanel.open(this, '" + uid + "')";
  };
  self.getRequest = function() {
    var url = window.location.search; //获取url中"?"符后的字串
    var theRequest = {};
    if (url.indexOf("?") !== -1) {
      var str = url.substr(1);
      var strs = str.split("&");
      for(var i = 0; i < strs.length; i ++) {
        theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
      }
    }
    return theRequest;
  };
  //地址栏添加参数
  // name {string} 参数名称
  // value 参数值
  self.addUrlParam = function(name, value) {
    var currentUrl = window.location.href.split('#')[0];
    if (/\?/g.test(currentUrl)) {
      if (/name=[-\w]{4,25}/g.test(currentUrl)) {
        currentUrl = currentUrl.replace(/name=[-\w]{4,25}/g, name + "=" + value);
      } else {
        currentUrl += "&" + name + "=" + value;
      }
    } else {
      currentUrl += "?" + name + "=" + value;
    }
    if (window.location.href.split('#')[1]) {
      currentUrl = currentUrl + '#' + window.location.href.split('#')[1]
      window.history.replaceState(null, null, currentUrl);
    } else {
      window.history.replaceState(null, null, currentUrl);
    }
    return currentUrl;
  };
  //删除地址栏中的指定参数并返回删除参数后的地址
  // paramKey {string} 需要删除的键
  self.delUrlParam = function(paramKey) {
    var url = window.location.href;    //页面url
    var urlParam = window.location.search.substr(1);  //页面参数
    var beforeUrl = url.substr(0, url.indexOf("?"));  //页面主地址（参数之前地址）
    var nextUrl = "";
    var arr = new Array();
    if (urlParam != "") {
      var urlParamArr = urlParam.split("&"); //将参数按照&符分成数组
      for (var i = 0; i < urlParamArr.length; i++) {
        var paramArr = urlParamArr[i].split("="); //将参数键，值拆开
        //如果键与要删除的不一致，则加入到参数中
        if (paramArr[0] !== paramKey) {
          arr.push(urlParamArr[i]);
        }
      }
    }
    if (arr.length > 0) {
      nextUrl = "?" + arr.join("&");
    }
    url = beforeUrl + nextUrl;
    return url;
  }

  // pug渲染时藏数据，对应前端函数strToObj
  self.objToStr = function(obj) {
    return encodeURIComponent(JSON.stringify(obj));
  }



  self.getSize = function(size, digits) {
    size = Number(size);
    if(digits === undefined) digits = 2;
    if(size < 1024*1024) {
      size = (size/1024).toFixed(digits) + "KB";
    } else if(size < 1024*1024*1024) {
      size = (size/(1024*1024)).toFixed(digits) + "MB";
    } else {
      size = (size/(1024*1024*1024)).toFixed(digits) + "GB";
    }
    return size;
  };
  self.briefTime = function(toc) {
    var now = new Date();
    var nowNumber = now.getTime();
    var time = new Date(toc);
    var timeNumber = time.getTime();
    // 1h
    if(nowNumber - timeNumber <= 60 * 60 * 1000) {
      return '刚刚';
    }
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var oneDayNumber = 24 * 60 * 60 * 1000;
    var t = new Date(year + '-' + month + '-' + day + ' 00:00:00').getTime();
    if(timeNumber >= t) return '今天';
    if(timeNumber >= t - oneDayNumber) return '昨天';
    if(timeNumber >= t - (2 * oneDayNumber)) return '前天';
    if(timeNumber >= t - (30 * oneDayNumber)) return '近期';
    return '较早';
  };
  self.getIpUrl = function(ip) {
    return "http://www.ip138.com/ips138.asp?ip=" + ip + "&action=2";
  };
  self.fromNow = function(time, type) {
    var now = Math.floor(Date.now() / 1000);
    time = new Date(time);
    time = Math.floor(time.getTime() / 1000);
    //type用于是否显示分秒，true显示分秒，false显示刚刚
    if(type) {
      // 分
      const just = Math.floor((now - time) / 60);
      if(just < 60) {
        return '刚刚';
      }
    }
    // 秒
    if(now - time < 60) {
      return (now - time) + '秒前';
    }
    // 分
    const m = Math.floor((now - time) / 60);
    if(m < 60) {
      return m + '分'+ (now - time) % 60 +'秒前';
    }
    // 时
    const h = Math.floor(m / 60 );
    if(h < 24) {
      return h + '时'+ (m % 60) +'分前';
    }
    const d = Math.floor(h / 24);
    if(d < 30) {
      return d + '天'+ (h % 24) +'时前';
    }
    const month = Math.floor(d / 30);
    if(month < 12) {
      return month + '个月'+ (d % 30) +'天前';
    }
    return Math.floor(month / 12) + '年'+ (month % 12) +'个月前';
  };
  self.timeFormat = function(time) {
    var fixTime = function(number) {
      return number < 10? '0' + number: number;
    }
    time = new Date(time);
    var year = time.getFullYear();
    var month = fixTime(time.getMonth() + 1);
    var day = fixTime(time.getDate());
    var hour = fixTime(time.getHours());
    var minute = fixTime(time.getMinutes());
    var second = fixTime(time.getSeconds());
    return year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
  };
  self.createVueAppSelector = function() {
    var str = [];
    for(var i = 0; i < 8; i++){
      str[i] = elementIdChars[Math.floor(Math.random() * elementIdChars.length - 1)]
    }
    return str.join("")
  };
  self.getVueAppSelector = function() {
    if(!document) return;
    var scriptElem;
    if(document.currentScript) {
      scriptElem = document.currentScript;
    } else {
      scriptElem = document.scripts[document.scripts.length - 1];
    }
    return scriptElem.getAttribute("data-vue-app-selector");
  };
  self.briefNumber = function(number) {
    if(number < 10000) {
      return number;
    } else {
      return (number / 10000).toFixed(1) + '万'
    }
  };
  // 去除文本中的链接
  self.removeLink = function(content) {
    content = content || ''
    var reg = /(https?:\/\/)?([-0-9a-zA-Z]{1,256}\.)+[a-zA-Z]{2,6}/ig
    return content.replace(reg, '');
  };

  //通过指定字符将字符串分割成两部分
  self.segmentation = function (str, char) {
    var index = str.indexOf(char);
    var result1 = str.substr(0,index+1);
    var result2 = str.substr(index + 1,str.length-index-1);
    return [result1, result2];
  }
};

var elementIdChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';


if(isNode) {
  module.exports = new Tools();
} else {
  NKC.methods.tools = new Tools();
}
