var Tools = function() {
  var self = this;
  self.getUrl = function(type, id, size) {
    if(['', undefined, null].includes(id)) {
      id = 'default';
    }
    var t = "?c=" + type;
    if(size) t += "&t=" + size;
    switch(type) {
      case 'forumHome': {
        return "/f/" + id
      }
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
        return "/r/" + id + '?c=preview_pdf';
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
      case "postHome": {
        return "/p/" + id;
      }
      case "thread": {
        return "/t/" + id;
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
        if(id === 'default') return false
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
      case 'previewPDF': {
        return "/reader/pdf/web/viewer?file=%2fr%2f" + id;
      }
    }
  };
  self.getAnonymousInfo = function() {
    return {
      username: '匿名用户',
      avatarUrl: self.getUrl('anonymousUserAvatar')
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
  };
  self.getIpUrl = function(ip) {
    return "http://www.ip138.com/ips138.asp?ip=" + ip + "&action=2";
  };
  self.fromNow = function(time) {
    var now = Math.floor(Date.now() / 1000);
    time = new Date(time);
    time = Math.floor(time.getTime() / 1000);
    // 秒
    if(now - time < 60) {
      return ' 几秒前';
    }
    // 分
    const m = Math.floor((now - time) / 60);
    if(m < 60) {
      return m + ' 分钟前';
    }
    // 时
    const h = Math.floor(m / 60 );
    if(h < 24) {
      return h + ' 小时前';
    }
    const d = Math.floor(h / 24);
    if(d < 30) {
      return d + ' 天前';
    }
    const month = Math.floor(d / 30);
    if(month < 12) {
      return month + ' 个月前';
    }
    return Math.floor(month / 12) + ' 年前';
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
};

if(typeof window === "undefined") {
  module.exports = new Tools();
} else {
  NKC.methods.tools = new Tools();
}
