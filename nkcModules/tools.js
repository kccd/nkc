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
    }
  };
  self.floatUserInfo = function(uid) {
    return "floatUserPanel.open(this, '" + uid + "')";
  };
  self.getSize = function(size, digits) {
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