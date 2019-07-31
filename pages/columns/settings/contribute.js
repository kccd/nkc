var data = NKC.methods.getDataById("data");
for(var i = 0; i < data.contributes.length; i++) {
  var contribute = data.contributes[i];
  contribute.agree = "";
}
var app = new Vue({
  el: "#app",
  data: {
    column: data.column,
    categories: data.categories,
    contributes: data.contributes
  },
  methods: {
    fromNow: NKC.methods.fromNow,
    agree: function(c) {
      this.submit(c, "agree")
    },
    disagree: function(c) {
      this.submit(c, "disagree")
    },
    submit: function(c) {
      var agree = c.agree;
      var reason = c.reason;
      var cid = c.cid;
      var type = "agree";
      if(!agree){
        type = "disagree"
      } else {
        if(cid.length === 0) return screenTopWarning("请选择文章分类");
      }
      nkcAPI("/m/" + this.column._id + "/settings/contribute", "POST", {
        contributesId: [c._id],
        reason: reason,
        categoriesId: cid,
        type: type
      })
        .then(function() {
          screenTopAlert("操作成功");
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    }
  }
});