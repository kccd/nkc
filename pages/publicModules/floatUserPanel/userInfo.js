NKC.modules.UserInfo = function() {
  var self = this;
  self.dom = $("#moduleUserInfo");
  self.dom.modal({
    show: false
  });
  self.app = new Vue({
    el: "#moduleUserInfoApp",
    data: {
      user: "",
      loading: true
    },
    methods: {
      getUrl: NKC.methods.tools.getUrl,
    }
  });
  self.open = function(options) {
    // type: showUserByUid, showUserByPid
    options = options || {
      type: "showUserByUid"
    };
    self.app.loading = true;
    var type = options.type;
    if(type === "showUserByPid") {
      nkcAPI("/p/" + options.pid + "/author", "GET")
        .then(function(data) {
          self.app.user = data.author;
          self.app.loading = false;
        })
        .catch(function(data) {
          sweetError(data);
        })

    } else if(type === "showUserByUid") {
      nkcAPI("/u/" + options.uid + "?from=panel", "GET")
        .then(function (data) {
          self.app.user = data.targetUser;
          self.app.loading = false;
        })
        .catch(function (data) {
          sweetError(data);
        })
    }
    self.dom.modal("show");
  }
}
