var vueAppSelector = NKC.methods.tools.getVueAppSelector();

NKC.modules.ReviewForumInfo = function() {
  var this_ = this;
  this_.dom = $("#"+ vueAppSelector + "App");
  this_.dom.modal({
    show: false,
    backdrop: "static"
  });
  this_.app = new Vue({
    el: "#" + vueAppSelector,
    data: {
      loadding: true,
      pForum: null,
      foundersInfo: [],
    },
    methods: {
      loadFounderInfo: function() {
        var self = this;
        var founders = this.pForum.founders;
        if(!founders) return;
        self.foundersInfo = [];
        var fetch = function(founders, index) {
          var founder = founders[index];
          if(!founder) return Promise.resolve();
          var uid = founder.uid;
          var accept = founder.accept;
          return self.requestUserInfo(uid)
            .then(function(user) {
              user.accept = accept;
              self.foundersInfo.push(user);
              return fetch(founders, index + 1);
            })
        }
        fetch(founders, 0)
          .then(function() {
            self.loadding = false;
          })
      },
      requestUserInfo: function(uid) {
        return nkcAPI("/u?uid=" + uid, "GET")
          .then(data => {
            return data.targetUsers[0];
          })
      },
      reviewPass: function() {
        return nkcAPI("/e/reviewForum/resolve", "POST", {pfid: this.pForum.pfid})
          .then(function() {
            return asyncSweetSuccess("审核通过");
          })
          .catch(sweetError)
          .then(function() {
            location.reload();
          })
      },
      reviewReject: function() {
        return nkcAPI("/e/reviewForum/reject", "POST", {pfid: this.pForum.pfid})
          .then(function() {
            return asyncSweetSuccess("已驳回此开办申请");
          })
          .catch(sweetError)
          .then(function() {
            location.reload();
          })
      }
    }
  });
  this_.open = function(pForum) {
    var app = this.app;
    app.pForum = pForum;
    app.loadFounderInfo();
    this_.dom.modal("show");
  };
  this_.close = function() {
    this_.dom.modal("hide");
  }
}