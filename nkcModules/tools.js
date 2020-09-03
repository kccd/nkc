var Tools = function() {
  var self = this;
  self.getUrl = function(type, id, size) {
    if(['', undefined, null].includes(id)) {
      id = 'default';
    }
    var t = "?c=" + type;
    if(size) t += "&t=" + size;
    switch(type) {
      case "userAvatar": {
        return "/a/" + id + t
      }
      case "userBanner": {
        return "/a/"+ id + t
      }
      case "scoreIcon": {
        return "/a/" + id + t
      }
      case "postCover": {
        return '/a/' + id + t;
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
        return "/a/" + id + t;
      }
      case "forumBanner": {
        return "/a/" + id + t
      }
      case "columnAvatar": {
        return "/a/" + id + t
      }
      case "columnBanner": {
        return "/a/" + id + t
      }
      case "homeBigLogo": {
        return "/a/" + id + t
      }
      case "watermark": {
        return "/a/" + id + t
      }
      case "recommendThreadCover": {
        return '/a/' + id + t
      }
      case "pdf": {
        return "/r/" + id + '?c=nkc_source_pdf';
      }
      case "sticker": {
        return "/sticker/" + id;
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
      case 'mediaPicture': {
        return "/r/" + id + t;
      }
      // 用户上传的附件
      case "resource": {
        return "/r/" + id
      }
      // 其他资源，包含avatar, banner等等
      case "attach": {
        return "/a/" + id
      }
      case "videoCover": {
        return "/frameImg/" + id
      }
      case "messageResource": {
        return "/message/resource/" + id;
      }
      case "userHome": {
        return "/u/" + id
      }
      case "messageCover": {
        return "/message/frame/" + id
      }
      case "messageUserDetail": {
        return "/u/" + id + "?from=message"
      }
      case 'siteFile': {
        return "/statics/site/" + id;
      }
      case 'defaultFile': {
        return "/default/" + id;
      }
    }
  };
  self.floatUserInfo = function(uid) {
    return "floatUserPanel.open(this, '" + uid + "')";
  };
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
  }
};

if(typeof window === "undefined") {
  module.exports = new Tools();
} else {
  NKC.methods.tools = new Tools();
}
