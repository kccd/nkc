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
      case "anonymousUserAvatar": {
        return "/default/default_anonymous_user_avatar.jpg";
      }
    }
  };
  self.floatUserInfo = function(uid) {
    return "floatUserPanel.open(this, '" + uid + "')";
  }
};

if(typeof window === "undefined") {
  module.exports = new Tools();
} else {
  NKC.methods.tools = new Tools();
}