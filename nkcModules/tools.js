var Tools = function() {
  var self = this;
  self.getUrl = function(type, id, size) {
    var t = "";
    if(size) t = "?t=" + size;
    switch(type) {
      case "userAvatar": {
        return "/avatar/" + id + t
      }
      case "userBanner": {
        return "/banner/"+ id + t
      }
      case "postCover": {
        return "/nr/cover/" + id + t
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
      case "forumAvatar": {
        return "/forum_avatar/" + id;
      }
      case "columnAvatar": {
        return "/column/avatar/" + id + t
      }
      case "pdf": {
        return "/reader/pdf/web/viewer?file=%2fr%2f" + id
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
};

if(typeof window === "undefined") {
  module.exports = new Tools();
} else {
  NKC.methods.tools = new Tools();
}
