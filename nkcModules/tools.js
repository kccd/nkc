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
    }
  }
};

if(typeof window === "undefined") {
  module.exports = new Tools();
} else {
  NKC.methods.tools = new Tools();
}